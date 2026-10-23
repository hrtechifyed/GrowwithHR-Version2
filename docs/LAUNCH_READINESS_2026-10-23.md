# GrowWithHR — Founding Beta launch gate (23 October 2026)

## Free product usage: current launch policy
- Both public assessments are open to visitors immediately. The Founding Beta contact form is **optional feedback**, not an invitation gate.
- Do not introduce checkout, payment details, paid plans, subscriptions, upgrades or paid-report calls to action during this audience-building phase.
- Keep transactional report transport, identity verification and deliverability operations out of the public marketing narrative. Preserve secure backend handling, recipient verification, and complete truthful disclosures inside the report access, privacy and security experiences.
- An assessment's on-screen output is an executive overview; do **not** promise the complete personalized PDF is public or available anonymously.
- Future monetization requires a separate explicit launch decision. Do not silently activate payments through existing backend report delivery.

## Scope
The public promise is **two products only**: Organization Structure & Growth, and HR Compliance Readiness. The Founding Beta is free to try. There is no claim of legal certification, company-specific legal advice, or employee assessment.

## Launch readiness improvements
- Fixed the stale first-visit link assertion in the Compliance browser test.
- Made free Founding Beta access explicit on the homepage and invite page.
- Added canonical URLs, social-share metadata, and public `sitemap.xml` for the GitHub Pages launch address.
- Kept GrowWithHR About and Privacy links within the product.
- Added optional campaign tags to beta enquiries, sent only upon submission; no background tracking or assessment-answer collection.

## Mandatory live release gates — do not infer these from CI
1. Verify the final GitHub Pages homepage, both assessment entry routes, the Founding Beta form, and the sample reports in desktop and mobile browsers.
2. Verify the Render API after cold start. Review `/api/health`, `/api/email-status`, `/api/report-id/status`, and `/api/legal-rag/status`. Do not invite users if there are visitor-facing 5xx errors.
3. Using **fictional test company data**, complete Organization & Growth and verify analysis, Report ID allocation, workspace persistence, and recovery credentials.
4. Complete Compliance Readiness and verify the bounded findings, sources, limitations and accessible report output.
5. Confirm authenticated personalised PDFs for both products are delivered to the actual test mailbox; check attachment, content, permissions and email-recipient binding.
6. Submit a Founding Beta form from the GitHub Pages address. Confirm receipt in the internal mailbox, including supplied campaign tags; HTTP 200 alone is insufficient.
7. Inspect footer links, core mobile layouts, error flows, PDF overflow and email presentation in actual browsers.
8. Review latest main-branch GitHub Actions: all required workflows must pass on the exact released commit. Green CI does not substitute for live user-path verification.
9. Submit `https://hrtechifyed.github.io/GrowwithHR-Version2/sitemap.xml` through the GitHub Pages property in Google Search Console and configure privacy-respecting pageview/conversion analytics in the site owner's account.

## Legal and privacy boundary
Legal catalogues retain `needs-legal-review`. HR Compliance Readiness is preparatory research only and must not be marketed as a legal opinion, legal certification or proof of compliance. Keep issues #142, #143 and #207 open until reviewed by authorised professionals. Do not solicit identifiable employee payroll, health, discipline, grievance or complaint information during the beta.

## One canonical public address
Share `https://hrtechifyed.github.io/GrowwithHR-Version2/` in launch posts. GitHub Pages serves the frontend; some user paths call a separate Render backend. Frontend availability alone does not establish API, Gmail, report-ID or Supabase availability. Changing the public domain requires the site owner to configure hosting/DNS and update canonical references.

## Rollout rule
Controlled founder invitations first, *after* the live release gates pass. Broader public promotion only after a successful end-to-end test and actionable feedback from actual users.
