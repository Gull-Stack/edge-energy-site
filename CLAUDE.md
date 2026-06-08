# edge-energy-site — MicroGRID (Powered by EDGE)

Eleventy static site. Client: Energy Development Group. Product brand: **MicroGRID**,
"Powered by EDGE". Live Vercel project: `gull-stack/edge-energy-site`. Repo:
`Gull-Stack/edge-energy-site`. Production domain target: **gomicrogridenergy.com**
(was sourced from edgeenergy.com).

- Build: `npm run build` → `_site/`. Serve: `npx @11ty/eleventy --serve` (preview port 8088).
- **Deploy (queue-bypass):** `vercel build --prod --scope gull-stack` then `vercel deploy --prebuilt --prod --scope gull-stack` (CLI must be logged in as brycedmorgan@gmail.com). The git-integration build queue has been flaky/stuck; this local-build path is reliable. Verify on the custom domain (www.energydevelopmentgroup.com) — apex 307s to www, and `.vercel.app` URLs are SSO-protected.
- **LIVE state (2026-06-08):** all 12 feedback items + logo-driven visual polish deployed to production.
- Brand/site data: `src/_data/site.json` (drives canonical, og:url, title, name).
- Lead form posts to `/api/contact` (serverless). GA4: `G-KP2EQET83V` (inherited from EDGE — verify/replace).

## Session Log

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
