// MicroGRID — Become a Partner API
// ONE form, TWO destinations routed on "Partnership Type":
//   Sales Partner        -> SALES_PARTNER_SHEET_ID   + notify zach@gomicrogridenergy.com
//   Installation Partner -> INSTALL_PARTNER_SHEET_ID + notify wcarter@gomicrogridenergy.com
//
// Each submission is appended as a row to the matching Google Sheet (via a Google
// service account) AND emailed to the matching inbox (via SendGrid).
//
// Required env vars (see CLAUDE.md "Partner form setup"):
//   SENDGRID_API_KEY, FROM_EMAIL
//   GOOGLE_SA_EMAIL, GOOGLE_SA_PRIVATE_KEY   (service account, shared on both sheets as Editor)
//   SALES_PARTNER_SHEET_ID, INSTALL_PARTNER_SHEET_ID
// Optional overrides:
//   SALES_PARTNER_NOTIFY (default zach@gomicrogridenergy.com)
//   INSTALL_PARTNER_NOTIFY (default wcarter@gomicrogridenergy.com)
//   PARTNER_NOTIFY_CC (extra address CC'd on every notification)

const crypto = require('crypto');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'leads@gomicrogridenergy.com';

const ROUTES = {
  'Sales Partner': {
    sheetId: process.env.SALES_PARTNER_SHEET_ID,
    notify: process.env.SALES_PARTNER_NOTIFY || 'zach@gomicrogridenergy.com',
  },
  'Installation Partner': {
    sheetId: process.env.INSTALL_PARTNER_SHEET_ID,
    notify: process.env.INSTALL_PARTNER_NOTIFY || 'wcarter@gomicrogridenergy.com',
  },
};

// Installation Partner vetting questionnaire — [field key, sheet/email label], in order.
// Only written for the Installation Partner route. Keep in sync with the Install sheet header
// row and the form field names in become-a-partner.njk.
const INSTALL_FIELDS = [
  ['ip_entity_registered', 'Registered Entity'],
  ['ip_entity_type_state', 'Entity Type/State'],
  ['ip_legal_entity_name', 'Legal Entity Name'],
  ['ip_states_registration', 'States of Registration'],
  ['ip_tx_electrical_license', 'TX Electrical Contractor License'],
  ['ip_tx_electrical_info', 'TX Elec License #/Exp'],
  ['ip_master_electrician', 'Master Electrician on Staff'],
  ['ip_master_electrician_info', 'Master Electrician Info'],
  ['ip_journeyman_licensed', 'Journeymen Licensed'],
  ['ip_journeyman_count', '# Journeyman Electricians'],
  ['ip_additional_licenses', 'Additional Licenses'],
  ['ip_additional_licenses_info', 'Additional Licenses Info'],
  ['ip_license_revoked', 'License Revoked/Suspended (5yr)'],
  ['ip_license_revoked_details', 'License Revoked Details'],
  ['ip_gl_insurance', 'General Liability >= 500k/1M'],
  ['ip_gl_info', 'GL Carrier Name/Policy #'],
  ['ip_workers_comp', "Workers' Comp"],
  ['ip_workers_comp_info', "Workers' Comp Info"],
  ['ip_auto_liability', 'Auto Liability >= 250k'],
  ['ip_auto_info', 'Auto Carrier/Limits'],
  ['ip_umbrella', 'Umbrella >= 500k'],
  ['ip_umbrella_info', 'Umbrella Carrier/Limits'],
  ['ip_coi_additional_insured', 'COI Additional Insured'],
  ['ip_safety_program', 'Safety Program'],
  ['ip_osha_incidents', 'OSHA Incidents (3yr)'],
  ['ip_osha_details', 'OSHA Details'],
  ['ip_osha_emr', 'OSHA EMR'],
  ['ip_vehicle_count', '# Vehicles'],
  ['ip_vehicle_branding', 'Vehicle Branding'],
  ['ip_vehicle_branding_other', 'Vehicle Branding Other'],
  ['ip_willing_magnets', 'Willing: MicroGRID Magnets'],
  ['ip_can_acquire_vehicles', 'Can Acquire Vehicles'],
  ['ip_fleet_scale_notes', 'Fleet Scale Notes'],
  ['ip_field_personnel', '# Field Personnel'],
  ['ip_simultaneous_crews', '# Simultaneous Crews'],
  ['ip_crew_composition', 'Crew Composition'],
  ['ip_avg_crew_size', 'Avg Crew Size'],
  ['ip_installs_per_week', 'Large Solar+Battery Installs/Week'],
  ['ip_subcontracted_labor', 'Subcontracted Labor'],
  ['ip_subcontracted_details', 'Subcontracted Details'],
  ['ip_turnover_rate', 'Turnover Rate'],
  ['ip_coverage_no_adder', 'Coverage (no adder)'],
  ['ip_furthest_distance', 'Furthest Distance'],
  ['ip_physical_presence', 'Physical Presence'],
  ['ip_physical_presence_locations', 'Physical Presence Locations'],
  ['ip_years_solar', 'Years Residential Solar'],
  ['ip_systems_to_date', 'Residential Projects YTD'],
  ['ip_historical_focus', 'Historical Focus'],
  ['ip_historical_focus_other', 'Historical Focus Other'],
  ['ip_pct_battery_12mo', '% Battery (12mo)'],
  ['ip_inverter_brands', 'Inverter Brands'],
  ['ip_inverter_other', 'Inverter Other'],
  ['ip_battery_systems', 'Battery Systems'],
  ['ip_battery_other', 'Battery Other'],
  ['ip_racking_systems', 'Racking Systems'],
  ['ip_racking_other', 'Racking Other'],
  ['ip_ground_mount', 'Ground Mount'],
  ['ip_ground_mount_count', 'Ground Mount Count'],
  ['ip_modular_homes', 'Modular/Manufactured Homes'],
  ['ip_generator_integration', 'Generator Integration'],
  ['ip_certifications', 'Certifications'],
  ['ip_certifications_list', 'Certifications List'],
  ['ip_ongoing_training', 'Ongoing Training'],
  ['ip_training_notes', 'Training Notes'],
  ['ip_uses_crm', 'Uses CRM/PM Software'],
  ['ip_crm_platforms', 'CRM Platforms'],
  ['ip_comfortable_third_party', 'Comfortable 3rd-Party Platform'],
  ['ip_familiar_platforms', 'Familiar Platforms'],
  ['ip_platforms_other', 'Platforms Other'],
  ['ip_field_devices', 'Field Devices/GPS'],
  ['ip_ref1_company', 'Ref1 Company'],
  ['ip_ref1_contact', 'Ref1 Contact'],
  ['ip_ref1_phone', 'Ref1 Phone/Email'],
  ['ip_ref1_relationship', 'Ref1 Relationship'],
  ['ip_ref2_company', 'Ref2 Company'],
  ['ip_ref2_contact', 'Ref2 Contact'],
  ['ip_ref2_phone', 'Ref2 Phone/Email'],
  ['ip_ref2_relationship', 'Ref2 Relationship'],
  ['ip_ref3_company', 'Ref3 Company'],
  ['ip_ref3_contact', 'Ref3 Contact'],
  ['ip_ref3_phone', 'Ref3 Phone/Email'],
  ['ip_ref3_relationship', 'Ref3 Relationship'],
  ['ip_years_ownership', 'Years Current Ownership'],
  ['ip_bankruptcy', 'Bankruptcy (5yr)'],
  ['ip_bankruptcy_details', 'Bankruptcy Details'],
  ['ip_liens', 'Liens/Judgments'],
  ['ip_liens_details', 'Liens Details'],
  ['ip_net_terms', 'Net Terms OK'],
  ['ip_growth_plans', 'Growth Plans'],
  ['ip_customer_priority', 'Customer Priority'],
  ['ip_complaint_handling', 'Complaint Handling'],
  ['ip_anything_else', 'Anything Else'],
  ['ip_certify', 'Certified Accurate'],
];

function normalizeVal(v) {
  if (Array.isArray(v)) return v.filter(Boolean).join(', ');
  return v == null ? '' : String(v);
}

// === SPAM PROTECTION (mirrors /api/contact) ===
function looksLikeSpam(data) {
  const { fax_number, _timestamp } = data;
  if (fax_number) return 'honeypot';
  if (_timestamp) {
    const elapsed = Date.now() - parseInt(_timestamp, 10);
    if (elapsed < 3000) return 'too_fast';
  }
  return false;
}

// === GOOGLE SHEETS (service-account JWT, no external deps) ===
async function getGoogleAccessToken() {
  const email = process.env.GOOGLE_SA_EMAIL;
  let key = process.env.GOOGLE_SA_PRIVATE_KEY;
  if (!email || !key) return null;
  key = key.replace(/\\n/g, '\n'); // env stores newlines escaped

  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned =
    `${b64({ alg: 'RS256', typ: 'JWT' })}.` +
    `${b64({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })}`;

  let signature;
  try {
    signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(key, 'base64url');
  } catch (err) {
    console.error('[partner] JWT sign failed:', err.message);
    return null;
  }

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!resp.ok) {
    console.error('[partner] Google token error:', await resp.text());
    return null;
  }
  return (await resp.json()).access_token;
}

async function appendToSheet(sheetId, row) {
  if (!sheetId) return false;
  const token = await getGoogleAccessToken();
  if (!token) return false;
  const resp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!resp.ok) {
    console.error('[partner] Sheets append error:', await resp.text());
    return false;
  }
  return true;
}

// === EMAIL (SendGrid) ===
async function sendEmail({ to, cc, subject, html, replyTo }) {
  if (!SENDGRID_API_KEY) return false;
  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}) }],
      from: { email: FROM_EMAIL, name: 'MicroGRID Partner Applications' },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!resp.ok) console.error('[partner] SendGrid error:', await resp.text());
  return resp.ok;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const b = req.body || {};
    const {
      companyName, contactName, phone, email, partnershipType,
      areas, areaOther, website, installs, solarOnly, batteryOnly, kw, kwhBattery,
      employees, employees1099, strategy, otherInfo,
    } = b;

    if (looksLikeSpam(b)) {
      console.log(`[partner][SPAM BLOCKED] company="${companyName}" email="${email}"`);
      return res.status(200).json({ success: true, message: 'Thank you! Your application has been received.' });
    }

    if (!companyName || !contactName || !phone || !email || !partnershipType) {
      return res.status(400).json({ error: 'Please fill in company, contact, phone, email, and partnership type.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const route = ROUTES[partnershipType];
    if (!route) return res.status(400).json({ error: 'Invalid partnership type.' });

    // Normalize Area(s) of Operation -> single string; fold in the "Other" free-text.
    let areaList = Array.isArray(areas) ? areas.slice() : (areas ? [areas] : []);
    if (areaOther && areaOther.trim()) {
      areaList = areaList.filter((a) => a !== 'Other');
      areaList.push(`Other: ${areaOther.trim()}`);
    }
    const areasStr = areaList.join(', ');

    const submittedAt = new Date().toISOString();
    const isInstall = partnershipType === 'Installation Partner';

    // Sheet row — base columns, plus the vetting columns for the Installation route.
    // Keep column order in sync with each sheet's header row.
    const row = [
      submittedAt, companyName, contactName, phone, email, partnershipType,
      areasStr, website || '', installs || '', solarOnly || '', batteryOnly || '',
      kw || '', kwhBattery || '', employees || '', employees1099 || '',
      strategy || '', otherInfo || '',
    ];
    if (isInstall) {
      for (const [key] of INSTALL_FIELDS) row.push(normalizeVal(b[key]));
    }

    const sheetOk = await appendToSheet(route.sheetId, row);

    // Email body — base fields, plus any answered vetting questions (Installation route only).
    const pairs = [
      ['Company Name', companyName],
      ['Point of Contact', contactName],
      ['Phone', phone],
      ['Email', email],
      ['Partnership Type', partnershipType],
      ['Area(s) of Operation', areasStr || '—'],
      ['Website', website || '—'],
      ['Solar + Battery Projects Last Quarter', installs || '—'],
      ['Solar Only Projects Last Quarter', solarOnly || '—'],
      ['Battery Only Projects Last Quarter', batteryOnly || '—'],
      ["kW's Installed Last Quarter", kw || '—'],
      ['kWh Battery Storage Last Quarter', kwhBattery || '—'],
      ['W2 Employees', employees || '—'],
      ['1099', employees1099 || '—'],
      ['Sales & Marketing Strategy', strategy || '—'],
      ['Other Information', otherInfo || '—'],
    ];
    if (isInstall) {
      pairs.push(['__section__', 'Installation Vetting Questionnaire']);
      for (const [key, label] of INSTALL_FIELDS) {
        const v = normalizeVal(b[key]);
        if (v) pairs.push([label, v]);
      }
    }

    const rows = pairs
      .map(([k, v]) =>
        k === '__section__'
          ? `<tr><td colspan="2" style="padding:11px 12px;background:#eef2f0;font-weight:700;color:#2c3e50;">${esc(v)}</td></tr>`
          : `<tr><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top;"><strong>${esc(k)}</strong></td><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top;">${esc(v)}</td></tr>`
      )
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#589840;padding:20px 24px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">New ${esc(partnershipType)} Application</h1>
        </div>
        <div style="padding:24px;background:#f9fafb;">
          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">${rows}</table>
          <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">
            Submitted ${esc(submittedAt)} via gomicrogridenergy.com/become-a-partner.
            ${sheetOk ? 'Saved to the application sheet.' : '⚠️ NOT saved to the sheet — check the Sheets credentials.'}
          </p>
        </div>
      </div>`;

    const emailOk = await sendEmail({
      to: route.notify,
      cc: process.env.PARTNER_NOTIFY_CC,
      subject: `New ${partnershipType}: ${companyName}`,
      html,
      replyTo: email,
    });

    // If neither destination accepted the data, surface a real error so we never
    // silently lose a partner application.
    if (!sheetOk && !emailOk) {
      console.error(`[partner] DELIVERY FAILED — sheet=${sheetOk} email=${emailOk} company="${companyName}"`);
      return res.status(500).json({ error: 'We could not submit your application right now. Please email partners@gomicrogridenergy.com directly.' });
    }

    return res.status(200).json({ success: true, message: 'Thank you! Your application has been received — our partnership team will be in touch shortly.' });
  } catch (error) {
    console.error('[partner] error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email us directly.' });
  }
};
