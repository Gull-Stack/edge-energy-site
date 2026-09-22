# edge-energy-site — MicroGRID (Powered by EDGE)

**⚡ STANDING RULE: read `MICROGRID-PLAYBOOK.md` before ANY copy/content/CTA/page work
on this site.** It's the client's sales-training-derived messaging constitution (sell
energy certainty, not equipment; never fear/urgency; DRIVERS framework; hard compliance
prohibitions — no guaranteed savings/backup/bill elimination/tax credits). Flag conflicts
before shipping.

Eleventy static site. Client: Energy Development Group. Product brand: **MicroGRID**,
"Powered by EDGE". Live Vercel project: `salty-caddie/edge-energy-site` (transferred from
gull-stack 2026-06-19). Repo:
`Gull-Stack/edge-energy-site`. Production domain target: **gomicrogridenergy.com**
(was sourced from edgeenergy.com).

- Build: `npm run build` → `_site/`. Serve: `npx @11ty/eleventy --serve` (preview port 8088).
- **Deploy (queue-bypass):** `vercel build --prod --scope salty-caddie` then `vercel deploy --prebuilt --prod --scope salty-caddie` (CLI must be logged in as brycedmorgan@gmail.com). The git-integration build queue has been flaky/stuck; this local-build path is reliable. Verify on the custom domain (www.energydevelopmentgroup.com) — apex 307s to www, and `.vercel.app` URLs are SSO-protected.
- **LIVE state (2026-06-08):** all 12 feedback items + logo-driven visual polish deployed to production.
- **Round 2 (2026-06-08):** unified green to exact logo green #589840 (font==cubes); bigger logo (52/48px); "GRID" always caps; replaced unsafe roof-install photo (no tie-downs) on How It Works + About with solar-home-2.jpg. All live. OPEN: domain move to gomicrogridenergy.com (needs Vercel dashboard add + GoDaddy DNS: A @ 76.76.21.21, CNAME www cname.vercel-dns.com); logo "Powered by EDGE" example image from Zach didn't arrive — need file.
- Brand/site data: `src/_data/site.json` (drives canonical, og:url, title, name).
- Lead form posts to `/api/contact` (serverless). GA4: `G-KP2EQET83V` (inherited from EDGE — verify/replace).

## Partner form setup (REQUIRED to go live)

`/become-a-partner` posts to `api/partner.js`, which routes on **Partnership Type**:
- *Sales Partner* → append to `SALES_PARTNER_SHEET_ID` + email `zach@gomicrogridenergy.com`
- *Installation Partner* → append to `INSTALL_PARTNER_SHEET_ID` + email `wcarter@gomicrogridenergy.com` (was Aaron until 22 Sep 2026; he left MICROGRID)

Sheets writes use a Google **service account** (raw JWT, no npm deps). Email uses SendGrid.
The form is built + deployed but **UNLINKED** (nav/footer tabs commented out in `header.njk`/`footer.njk`)
until the env vars below are set, so no partner application is ever silently lost.

Env vars on the Vercel project (salty-caddie/edge-energy-site), all environments:
- `SENDGRID_API_KEY` — ✅ SET 2026-06-22 (Bryce's key). Also re-enables `/api/contact` email.
- `FROM_EMAIL` — ✅ SET `leads@gullstack.com` (verified sender on the SendGrid acct; tested OK). Switch to a verified `@gomicrogridenergy.com` sender later if desired.
- `SALES_PARTNER_SHEET_ID` — ✅ SET `1M0GW3nj_w_2UUJWns54BV6uajPeNX4vJy-2NhkqjIIQ` (owner bryce@gullstack.com)
- `INSTALL_PARTNER_SHEET_ID` — ✅ SET `1qK90ZRBUJkGI3PFFi4Kez103rhuhBDJ0yZxb5S6xsMk` (owner bryce@gullstack.com)
- `GOOGLE_SA_EMAIL` / `GOOGLE_SA_PRIVATE_KEY` — ⛔ STILL NEEDED. Mint a service account (GullStack GCP project), enable Sheets API, share BOTH sheets with the SA email as Editor, then set these two. Until then: email works, Sheet auto-fill does not (append fails gracefully; form still returns success on email so no lost leads).
- Optional: `SALES_PARTNER_NOTIFY`, `INSTALL_PARTNER_NOTIFY`, `PARTNER_NOTIFY_CC`.

Status 2026-06-23: ✅✅ FULLY COMPLETE. Partner form live; both routes tested end-to-end through the live form — Sales→zach@ email + Sales sheet row; Install→aaron@ email + Install sheet row. Both Google Sheets auto-fill confirmed and test rows cleared (headers only). `GOOGLE_SA_*` env set; both sheets shared with SA microgrid-form-writer@microgrid-forms.iam.gserviceaccount.com (Editor). All CTA buttons "Get Free Design" sitewide. Contact form email also re-enabled. Access (6/23): Zach (writer) on Sales sheet; Aaron + Zach (writer) on Install sheet — shared manually by Bryce from bryce@gullstack.com (SA-based sharing blocked: Drive API not enabled on project microgrid-forms, only Sheets API). SECURITY TODO: Bryce should delete the SA key file `~/Downloads/microgrid-forms-539e55cd749a.json` (private key now stored encrypted in Vercel env).

Recommended sheet header row (col order matches the append in `api/partner.js`) — base 17 cols as of 2026-07-08:
`Timestamp | Company | Contact | Phone | Email | Partnership Type | Areas | Website | Solar+Battery Projects LQ | Solar Only Projects LQ | Battery Only Projects LQ | kW LQ | kWh Battery Storage LQ | W2 Employees | 1099 | Sales & Marketing Strategy | Other Info`
Install sheet = base 17 + the 93 `INSTALL_FIELDS` labels (110 cols total).

To go live once env is set: uncomment the two "Become a Partner" links, rebuild, redeploy.

## Session Log

### 2026-09-22 — Partner page restored; installation applications route to William Carter
- **Root cause of the outage:** `/become-a-partner`, `api/partner.js` and every June–July edit were deployed from this local tree but NEVER committed. The 11 Sep deploy (commit aa5d264, spam filter) built from `main` and dropped them, so the page 404ed and the July review/image fixes reverted. **Rule: commit + push before every `vercel deploy --prebuilt`.**
- Commit ac19b61 restores all of it and changes the Installation Partner notify default to `wcarter@gomicrogridenergy.com`. No `*_NOTIFY` or `PARTNER_NOTIFY_CC` env vars are set, so the code default is what sends. Pushed and deployed to prod; page 200, nav + footer links live, `/api/partner` answers.
- Test install application sent 22 Sep 22:12 UTC: row landed in the Install sheet (verified via Drive). Email went via SendGrid to William; he is asked to confirm and delete the test row.
- Greg's ownership ask: a gullstack.com Workspace file can't move to another org. Plan sent to William: he makes a copy of the Install sheet (he owns it), shares it Editor with the service account + bryce@gullstack.com, replies with the link.
- **Next (on Claude):** when William sends the link, `vercel env rm/add INSTALL_PARTNER_SHEET_ID` to the new ID, redeploy, send one test, confirm on the thread "Aaron handoff: MICROGRID installation partner application" (To William, Cc Greg + mark@trismartsolar.com).
- Still open from July: Aaron's 21 Jul asks (vetting-document upload, "MicroGRID" → "MICROGRID" rename) and William's 20 Aug careers-page ask — none done. Sheet header rows still old layout. SA key file still in ~/Downloads.

### 2026-07-09 — Review cleanup + battery image reframe (client email) — LIVE
- Client email (via Bryce) asked: remove TriSMART-era/older reviews incl. the "Texas Freeze" one (MicroGRID launched late last year, so it's misleading), and replace the battery/inverter image so it doesn't read as mounted on the FRONT of a house / Arizona-style home.
- **Reviews:** removed Michael R. (Houston) freeze testimonial from homepage; trimmed "I wish I had done this years ago" from Sarah T. (implies pre-launch). Sarah T. + James P. remain — generic build-era copy, not TriSMART imports; flag to client if they want all three gone.
- **Image:** no side-of-house/Texas-style asset existed, so cropped the existing 2-inverter Duracell mockup (front entrance, tile roof, cactus removed → reads as side elevation; 879x854). Overwrote `src/images/duracell-system.jpg` (used on homepage + solutions). Original in `/tmp/duracell-backup.jpg`, `brand-source/`, and git history. **Better fix pending:** true Texas-style (brick) side-of-home mockup from Blake's AI pipeline or licensed stock — crop is interim.
- Deployed via queue-bypass path; verified live on gomicrogridenergy.com (freeze review 0 hits, new 227KB image serving).
- Same email ordered a TriSMART Solar site wind-down — **COMPLETED 7/9-7/10** via WordPress REST API through Bryce's logged-in Chrome session (AppleScript JS; Chrome needed View→Developer→Allow JavaScript from Apple Events ON — extension pairing never worked). All changes on trismartsolar.com (WP 7.0, Salient + WPBakery):
  - **Drafted (reversible):** global sections 6981 executive-team + 6073 global-cta; pages 6882 microgrid, 6905 micro-grid, 6410 quote, 6634 battery-promotion-2024, 6269 dealer, 6364 dealer-network; post 6863 tax-credit promo.
  - **Menu items DELETED (recreate manually if needed):** 6803 Book A Call (Outlook booking w/ Anthony Conklin), 6805 Get Free Design→/quote, 6934 MicroGRID, 6299 Executive Team→/about/#team, 6802 Become a Dealer, 6387 Dealer Network, 6423 Dealer Code of Conduct PDF.
  - **Widgets emptied:** text-2 slide-out (Book A Call + 888-485-5551 + 600 Northpark address), block-7 blog sidebar (Calendly Request Appointment).
  - **Content edits (WP revisions hold originals):** about 6280 team_member shortcodes + #team anchor btn; houston 6090 Northpark address row; Get a Quote nectar_btn removed from 6706 (front), 6173, 6522, 6668, 6646, 5909; givepower 6207 "TriSMART CRO Zach Hall" heading.
  - **Verified logged-out:** home clean (0 hits for CTAs/MicroGRID/team/phone/address), /about clean, /microgrid /micro-grid /quote /dealer /dealer-network /tax-credit post all 404, houston address gone. LEFT ALONE: reviews page, careers, informational solar pages (sales-y copy remains but no CTAs), 2 older informational blog posts.

### 2026-07-08 — Partner form: client feedback round (base metrics split + vetting tweaks) — LIVE
- Applied the full feedback list (Mark's) to `/become-a-partner` (become-a-partner.njk + api/partner.js), DEPLOYED to prod and verified live. **Aaron approved all of Mark's changes same day** — this round is closed. Mark also flagged the form as "quite lengthy" and deferred conciseness to Aaron; Aaron has NOT asked for a trim, so none done — only do one if he sends specifics.
- **Base fields (both routes), now 17 sheet cols (was 13):** "Installs LQ" → "Total # of Solar + Battery Projects Installed Last Quarter"; NEW Solar Only LQ (`solarOnly`), Battery Only LQ (`batteryOnly`), kWh Battery Storage LQ (`kwhBattery`, below kW), 1099 count (`employees1099`); `employees` relabeled "Current Total Number of W2 Employees".
- **Vetting questionnaire, now 93 fields (was 95):** REMOVED `ip_coverage_with_adder` + `ip_reviewed_field_conduct` (Exhibit J question). Reworded: GL carrier→"General Liability carrier name, Policy Number"; OSHA q dropped "serious"; vehicles q → "If provided additional consistent work…"; installs/week → "Large Residential solar + battery installs per week…"; sub details → "what scope do you sub contract? How do you ensure quality? Do you run background checks?"; systems-to-date → "How many Residential Projects Installed Year to Date?". Added **Franklin** (battery) + **K2** (racking) options; "Wrapped in company branding" moved to LAST vehicle-branding option.
- **⚠️ TODO (Bryce): both Google Sheets header rows still show the OLD layout** — permission-gated, couldn't write them from this session. Paste-ready tab-separated rows in scratchpad `sheet-headers.txt` (also sent in chat). Sales = 17 cols, Install = 110. Old data rows (pre-7/8) keep the old shape — cols from "Installs LQ" onward read against the new header; few rows, live with it or hand-shift.
- Deploy also shipped the pending 7/2 two-inverter homepage photo (Blake's ask) — that item is now closed.
- SA key file `~/Downloads/microgrid-forms-539e55cd749a.json` still on disk (security TODO from 6/23 stands).

### 2026-07-02 — Micro-grid hero photo: 1-inverter → 2-inverter (Blake's ask)
- Blake (client-side) liked the new micro-grid content but noted the photo should show the **2 inverters** that pair with the 80kWh battery. Swapped the "MicroGRID Solution" photo on the homepage (`src/index.njk:133`, `src/images/duracell-system.jpg`) with Blake's updated shot — same Texas home + six Duracell battery stacks, now correctly showing **two** black inverters instead of one.
- Source image `~/Desktop/updated duracell 2 inverters.png` → `sips` converted to JPG and overwrote `duracell-system.jpg` (reference/alt unchanged). `npm run build` clean; `_site/images/duracell-system.jpg` updated.
- **NOT deployed** — Bryce to run the queue-bypass deploy: `vercel build --prod --scope salty-caddie` then `vercel deploy --prebuilt --prod --scope salty-caddie`. Verify on www.energydevelopmentgroup.com.

### 2026-06-29 — Install Partner vetting questionnaire (conditional form)
- Per Aaron's request: when "Installation Partner" is selected on /become-a-partner, a conditional **vetting questionnaire** (the full MIP doc, 11 sections / 95 fields) reveals and submits; Sales path unchanged. Toggle in become-a-partner.njk (`#installSection`, JS on `partnershipType`). Form JS switched to `FormData` serialization so all fields are captured generically.
- `api/partner.js`: added `INSTALL_FIELDS` (95 [key,label]) + `normalizeVal`. Install route appends base 13 + 95 vetting cols to the **Install sheet** (header expanded to 108 cols, parsed from the API so they stay aligned); Sales sheet stays 13. Email to aaron@ shows base + only the *answered* vetting questions under an "Installation Vetting Questionnaire" divider.
- Scope (Bryce decision): **vetting questions only** — MSA + onboarding packet deliberately NOT on the public form (onboarding packet is marked "Confidential / approved partners only"; MSA is a later e-sign). "Full intake" (file uploads of licenses/COIs/W-9 + MSA e-sign) is a separate, larger build if they want it.
- Verified end-to-end on prod: install submission wrote all answers to correct columns; Sales row clean at 13 cols; test rows cleared. NOTE: 2 real test entries from Aaron (asemliatschenko@gmail.com — "Aaron Test" 6/26, "MG" 6/29) left in the Install sheet; his to clear. Source files in ~/Downloads/MicroGRID_MSA_IP_FINAL / _MIP_Onboarding_Packet / _MIP_Vetting_Questionnaire.

### 2026-06-22 — Zach logo/button tweaks + Become a Partner form (built, form held)
- **Zach's tweaks — LIVE on gomicrogridenergy.com:** header MicroGRID mark enlarged 48→64px (`.logo > img`; "powered by EDGE" sublogo unchanged); footer brand now stacks "powered by EDGE" BELOW the MG logo (`.footer-logo` display:block + flex span); header CTA "Get Started"→"Get Free Design"; contact form button "Get My Free Analysis"→"Get My Free Design". Verified in prod.
- **Become a Partner — BUILT, deployed UNLINKED** at `/become-a-partner` (review URL, HTTP 200, 12 fields). One form, two routes on Partnership Type (Sales→zach + Sales sheet; Install→aaron + Install sheet). New `api/partner.js` (service-account Sheets append via raw JWT + SendGrid). Nav/footer tabs commented out so no application is lost before the pipeline is wired. `api/partner` currently returns an honest 500 (not silent loss) until env vars set.
- **BLOCKER to go live (needs Bryce):** see "Partner form setup" above — SendGrid key (also fixes contact form, which sends NO email right now), FROM_EMAIL verified sender, Google service account + 2 sheet IDs (shared w/ SA). Then uncomment the two partner links + redeploy.
- Heads-up flagged to Bryce: hero button on homepage still says "Get Your Free Analysis" (Zach only named the header + form buttons); error msg references `partners@gomicrogridenergy.com` (confirm that inbox exists).

### 2026-06-19 — gomicrogridenergy.com LIVE + moved project to Bryce Morgan
- **LIVE:** `gomicrogridenergy.com` resolves HTTP 200 with valid Let's Encrypt SSL; `www` 308→apex. Both domains verified on Vercel. Final TXT challenge values (post-transfer) were `…f04a07a74866d992fd5f` / `…3a003980e319b928f5e8`. Old EDGE site still serving at energydevelopmentgroup.com (untouched).
- **OPEN decision:** whether to 308-redirect energydevelopmentgroup.com → gomicrogridenergy.com (rebrand cutover). Not done yet. Also still open: confirm GA4 property + real phone/email.

- **Project transferred** gull-stack → **salty-caddie** team (Vercel API transfer-request/accept). Zero downtime: live `energydevelopmentgroup.com` stayed HTTP 200 throughout; all domains + history/settings carried over. Updated `.vercel/project.json` orgId → `team_09eLlEu8klQQ9pmNbnNeiGAV` and deploy scope in this file → `salty-caddie`.
- **Attached `gomicrogridenergy.com` + `www`** to the project (www 308→apex; apex is canonical/main). Old EDGE domains left serving as-is.
- **DNS (GoDaddy, managed by client/"him"):** apex `A @ → 76.76.21.21` ✅ set; `www CNAME → cname.vercel-dns.com` ✅ set; client also had to remove two stale AWS A records (13.248.243.5, 76.223.105.230) that were round-robining → fixed.
- **BLOCKER — still pending:** `gomicrogridenergy.com` is registered/used on an outside Vercel account (not any of Bryce's teams), so Vercel demands a TXT ownership challenge. Site currently 404s (`DEPLOYMENT_NOT_FOUND`, no cert) until the client adds **two TXT records on host `_vercel`**. NOTE: the salty-caddie transfer **regenerated** the challenge tokens, so the first set the client entered (`…12ce5254…` / `…acc336c3…`) is stale. Current required values:
  - `vc-domain-verify=gomicrogridenergy.com,f04a07a74866d992fd5f`
  - `vc-domain-verify=www.gomicrogridenergy.com,3a003980e319b928f5e8`
- **Next:** once TXT records propagate, run `POST /v9/projects/{id}/domains/{domain}/verify` (or dashboard) → auto-issues SSL → live. Then decide whether to 308-redirect `energydevelopmentgroup.com` → `gomicrogridenergy.com` (rebrand cutover). Confirm GA4 + real phone/email still outstanding.

### 2026-06-08 — EDGE → MicroGRID rebrand (client feedback items 1–12)
- Cloned repo (was not local); created branch `microgrid-rebrand`, committed, **not pushed** (awaiting Bryce review before deploy).
- **#1/#2 (URL source / iPhone share → edgeenergy):** root cause was `site.url` in `site.json` feeding `<link rel=canonical>` + `og:url`. Changed to `https://gomicrogridenergy.com`; also updated `robots.txt` + `sitemap.xml` + contact email domain.
- **Brand swap:** all standalone `EDGE` → `MicroGRID` across 16 templates; dropped "Energy Development Group Exchange" acronym; added "Powered by EDGE" lockup in header/footer/logo alt.
- **#3 logo:** DONE. Client dropped official art in `src/images/`. Cropped tight → `microgrid-logo-dark.png` (header, dark-on-white) + `microgrid-logo-light.png` (footer, white-on-black, blends on #171717 footer). "Powered by EDGE" added as styled tagline beneath logo in header + footer (art itself had no such text). Source originals archived in `brand-source/` (not published). Placeholder SVG removed.
- **#4:** homepage stats — swapped order of `$0.12` and `80 kWh` tiles.
- **#5:** all "30 year(s)" / "three decades" → "20 year(s)" / "two decades". (Existing 20-year guarantees left as-is.)
- **#6 Duracell photos:** DONE. Client dropped Duracell mockup; optimized to `duracell-system.jpg` (1400px, ~520KB) and swapped into battery image slots on index + solutions.
- **#7 whole-home backup:** added `*` to prominent claims (index benefit, solutions H2) + site-wide footnote disclaimer in footer.
- **#8:** "Your EDGE system" → "Your MicroGRID system" (4 spots).
- **#9:** "Made in USA / American-made" → federal Domestic Content language (index + about).
- **#10:** solutions panel-upgrade copy "needs upgrading" → "must be upgraded".
- **#11/#12:** About + FAQ pages fully rebranded.
- Verified all in built HTML; site builds clean (14 pages).
- **All 12 feedback items now complete.** Branch `microgrid-rebrand` (committed, not pushed).
- **Next:** push branch → Vercel preview → client review → merge to main + point gomicrogridenergy.com domain. Still open: confirm GA4 property + real phone/email (placeholder `(512) 555-EDGE`). Round 2 edits expected after client review.
