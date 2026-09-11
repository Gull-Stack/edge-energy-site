// EDGE Energy - Contact Form API
// Sends leads via SendGrid

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SALES_EMAIL = process.env.SITE_EMAIL || 'info@energydevelopmentgroup.com';

// Shared across every client lead endpoint. Canonical copy lives in
// Gull-Stack/walkthru-labs → shared/lead-spam-filter.js; this is a synced copy,
// so fix it there and re-run shared/sync-lead-spam-filter.sh, not here.
// This endpoint is CommonJS, hence require rather than import.
const { classifyLead } = require('./lead-spam-filter.js');
const FROM_EMAIL = process.env.FROM_EMAIL || 'leads@gullstack.com';

// === SPAM PROTECTION ===
function isGibberish(text) {
  if (!text || text.length < 2) return false;
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 2) return false;
  const vowels = cleaned.match(/[aeiou]/g);
  if (!vowels || vowels.length < cleaned.length * 0.15) return true;
  if (/[^aeiou]{5,}/i.test(cleaned)) return true;
  return false;
}

function looksLikeSpam(data) {
  const { name, fax_number, _timestamp } = data;
  if (fax_number) return 'honeypot';
  if (_timestamp) {
    const elapsed = Date.now() - parseInt(_timestamp, 10);
    if (elapsed < 3000) return 'too_fast';
  }
  if (isGibberish(name)) return 'gibberish_name';
  if (name && name.trim().length < 2) return 'short_name';
  return false;
}
// === END SPAM PROTECTION ===

async function sendEmail({ to, from, fromName, subject, html, replyTo, cc }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}) }],
      from: { email: from, name: fromName || 'EDGE Energy' },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return response.ok;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, address, bill, message, fax_number, _timestamp } = req.body;

    // === SPAM CHECK ===
    const spamReason = looksLikeSpam({ name, fax_number, _timestamp });
    if (spamReason) {
      console.log(`[SPAM BLOCKED] reason=${spamReason} name="${name}" email="${email}"`);
      return res.status(200).json({ success: true, message: "Thanks! We'll contact you within 24 hours." });
    }
    // === END SPAM CHECK ===

    // The check above catches bots. It does not catch a salesperson filling the
    // form properly to pitch EDGE. A flagged submission is never dropped — the
    // alert is routed to us instead of the client.
    const triage = classifyLead({
      name, email, phone, message,
      extraText: [address, bill].filter(Boolean).join(' '),
    });
    const isClean = triage.verdict === 'clean';
    if (!isClean) {
      console.log(`[LEAD TRIAGE] verdict=${triage.verdict} reasons=${triage.reasons.join('|')} name="${name}" — routed to Bryce, NOT the client`);
    }

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send confirmation to lead
    if (SENDGRID_API_KEY) {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thanks, ${name.split(' ')[0]}!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">We've received your request for a free energy analysis. One of our consultants will contact you within 24 hours.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              ${bill ? `<p style="margin: 5px 0;"><strong>Monthly Bill:</strong> ${bill}</p>` : ''}
              ${address ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${address}</p>` : ''}
            </div>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">Questions? Reply to this email or call us directly.</p>
          </div>
          <div style="background: #1a1a1a; padding: 20px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 14px;">EDGE Energy — Power Your Independence</p>
          </div>
        </div>
      `;

      // Skipped on a flagged submission: thanking a cold pitch confirms the
      // mailbox is live and gets the address resold.
      if (isClean) await sendEmail({
        to: email,
        from: FROM_EMAIL,
        subject: 'Your Free Energy Analysis Request',
        html: confirmationHtml,
      });

      // Send notification to sales
      const notificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22c55e; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">⚡ New Lead!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="tel:${phone}">${phone}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Address:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${address || 'Not provided'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Monthly Bill:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${bill || 'Not specified'}</td></tr>
            </table>
            ${message ? `<div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd;"><strong>Message:</strong><br/><p style="margin: 10px 0 0 0;">${message}</p></div>` : ''}
          </div>
          <div style="background: #1a1a1a; padding: 15px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 12px;">Lead from energydevelopmentgroup.com</p>
          </div>
        </div>
      `;

      const tag = isClean ? '⚡ New Lead'
        : triage.verdict === 'test' ? '[OUR TEST — not a lead]'
        : '[NOT A LEAD — selling to EDGE]';
      await sendEmail({
        to: isClean ? SALES_EMAIL : 'bryce@gullstack.com',
        from: FROM_EMAIL,
        fromName: `${name} via EDGE Energy`,
        subject: `${tag}: ${name} - ${bill || 'Energy Analysis'}`,
        html: isClean ? notificationHtml
          : `<p style="font:14px Arial;background:#eef4ff;border-left:3px solid #2a4a7f;padding:12px 14px;margin:0 0 18px">
               <b>Held back from the client.</b> Classified <b>${triage.verdict}</b> —
               ${triage.reasons.join(', ')}.<br>
               If this is a real customer the filter is wrong: fix
               <code>shared/lead-spam-filter.js</code> in walkthru-labs and re-sync.
             </p>${notificationHtml}`,
        replyTo: email,
        cc: isClean ? 'bryce@gullstack.com' : undefined,
      });
    }

    return res.status(200).json({ success: true, message: "Thanks! We'll contact you within 24 hours." });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again or call us directly.' });
  }
}
