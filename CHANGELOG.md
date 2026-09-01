# Changelog

All notable changes to GrowWithHR are documented here.

---

## [Unreleased] — Product Hardening, Change Intelligence and Authenticated Report Delivery

### Customer product

- Made **Organization Structure & Growth** the flagship customer capability.
- Repositioned customer-facing Compliance as **HR Compliance Readiness** rather than compliance assurance/certification.
- Simplified primary navigation to **Organization & Growth · HR Compliance Readiness · My Reports · Sources & Methodology**.
- Kept Sample Reports, Security & Data, Terms, About, Privacy and Contact as secondary navigation.
- Kept the current product deliberately focused on two engines rather than adding new Talent, Learning, Rewards, Performance, Leadership or generic AI-coach modules.

### Change Intelligence

- Added repeat-assessment Change Intelligence using structured company facts and deterministic findings.
- Added comparison of changed facts, increased/improved pressures, new priorities and information-gap changes.
- Kept the comparison authority on structured facts/deterministic engine results rather than generated report prose.
- Preserved explicit no-baseline behavior when a previous confirmed assessment does not exist.

### Reports and customer access

- Kept complete **fictional sample reports** publicly viewable as examples of report format and depth.
- Changed personalized web results to an executive **glimpse** rather than exposing the complete personalized report.
- Added Supabase customer sign-in/sign-up for complete personalized report delivery.
- Added server-side Bearer-token validation and required the report recipient to match the authenticated assessment work email.
- Kept Company Workspace Report ID + Recovery Code recovery separate from customer authentication.
- Restricted the complete personalized web renderer to localhost-only internal regression/developer use rather than a production query-parameter bypass.

### Report design and formatting

- Replaced the Organization PDF cover's abstract mark with the HRTechify logo.
- Added reusable report-format safety helpers for measured/wrapping status labels and layout protection.
- Hardened long review / needs-information / status components against overflow.
- Refined report color usage so HRTechify/GrowWithHR brand colors carry identity while status colors retain semantic meaning.
- Strengthened executive-first report hierarchy, safe A4 width usage, margins, card/table alignment and page-break behavior.

### Organization Structure & Growth

- Strengthened executive interpretation around positive foundations, primary constraint, top actions and 12-month implication.
- Preserved contextual management-capacity logic rather than introducing a universal span-of-control benchmark.
- Preserved organization-level boundaries: no individual employee/manager performance scoring, compensation decision or dismissal recommendation.

### HR Compliance Readiness

- Preserved deterministic legal decision authority and explanation-only RAG/provider behavior.
- Preserved review-oriented / missing-information / specialist-review framing.
- Preserved `needs-legal-review` across all active substantive catalogues.
- Preserved the 524 overdue temporal review entries across draft/unapproved law records as a substantive review backlog rather than administratively moving review dates.
- Preserved production hardening under #142 and exact official-source assurance under #143.

### Documentation and validation

- Updated current product, architecture, security, roadmap, report-access and file-overview documentation for the September 2026 customer model.
- Kept dated files under `docs/releases/` as historical evidence rather than rewriting prior release history.
- Updated static/browser regression contracts only where the agreed customer product contract superseded older labels/routes.
- Release remains gated on the exact candidate SHA passing repository-wide CI, Executive Assessment Playwright coverage, founder/report browser acceptance, All-Laws RAG, M4 report integration and M7 hardening before merge, followed by `main` CI, Pages deployment and Live Release Smoke.

---

## [v0.20.4-prototype.1] - Founder Intelligence, Guided Assessment and Report Parity

**Release Date:** 2026-08-13

### Release classification

- Research-grade prototype / GitHub prerelease.
- Not production legal certification.
- Deterministic applicability remains the sole decision authority.

### Added and improved

- Added stable founder obligation objects, deterministic next-action ordering, missing-fact resolution, scenario comparison and scale-trigger framing.
- Added durable server-issued Report ID lineage for revised reports.
- Added founder web/PDF parity for obligation states, next actions, unresolved facts and growth triggers.
- Added a guided searchable industry combobox with progressive narrowing and keyboard navigation.
- Added `HR Consulting` and related HR/People consulting aliases mapped to the existing deterministic `Consulting & Professional Services` profile.
- Removed the required “Where would guidance be most useful right now?” priority-selection gate while retaining the People/HR support context required by the assessment.
- Expanded the founder web report to the full responsive container width with symmetric padding and print/A4 width rules.
- Expanded the branded jsPDF writer to the full **178 mm** usable A4 content width with 16 mm side margins.

### Validation

- Executive Assessment Tests passed on exact founder UX/report head `c2bb6fcdd9ff5efc2426ec04e22208135fcd4945`.
- GrowWithHR CI passed on the same exact head.
- PR #158 merged as `508aa560734808c6d3f3b4e60f30812a1ec1a103`.
- Live Release Smoke run `31672944677` passed against that merge commit.
- Live Report ID registry evidence records at least one issued ID (`GWHR-2026-0813-AA01`).

### Safety and boundaries

- Legal RAG remains post-decision and explanation-only.
- No scoring, compliance certification or evidence upload was added.
- Active legal catalogues remain `needs-legal-review`.
- Production certification remains future hardening under #142.
- Exact official-source assurance remains future hardening under #143.

---

## [v0.20.3-prototype.1] - Governed Compliance & Legal RAG Prototype

**Release Date:** 2026-08-11

### Release classification

- Research-grade prototype / GitHub prerelease.
- Not production legal certification.
- All active legal catalogues remain `needs-legal-review`.

### Added and consolidated

- Consolidated the effective Legal RAG runtime at **57 callable profiles / 55 substantive profiles / 2 governance fallbacks / 21 active catalogues**.
- Documented the current substantive coverage through Wave 5L and the Wave 5J/Wave 5M non-runtime guards.
- Added release-facing product documentation explaining the deterministic-first architecture and a hypothetical founder/company workflow.
- Added a founder-oriented product direction for "what needs attention now" and future compliance review triggers as the organisation scales.
- Added a governed source-reconciliation audit bridge and retained supplementary exact-file evidence for 31 acquired files without silently replacing validated runtime source identities.

### Prototype research standard

- Adopted **structured secondary research with controlled provenance** as the accepted legal/source basis for this prototype.
- Made exact official-file verification supplementary assurance rather than a prototype release prerequisite.
- Required secondary-research provenance to remain distinct from official or counsel-approved provenance.
- Preserved draft, guidance, portal and research-only classifications.
- Kept production-grade exact-source assurance as future hardening under GitHub #143.
- Reframed GitHub #142 as the future production-grade Legal/Privacy/RAG/Source/Security/Release certification programme rather than a blocker for the clearly labelled prototype.

### RAG and authority safeguards

- Deterministic rules remain the product decision authority within the bounded prototype contract.
- Retrieval remains post-decision with `usedForDecision: false` and `applicabilityAuthority: none`.
- Provider output remains explanation-only and cannot create facts, change status/reason/source scope or certify compliance.
- Invalid or decision-changing provider output fails closed.
- Active catalogues remain `needs-legal-review`.

### Deliberate exclusions

- **Wave 5J — Bonded and Forced Labour:** remains governance/research-only; no substantive assessment/runtime/provider handling; live safeguarding concerns remain human-only.
- **Wave 5M — Multi-country Employment:** remains out of current release scope with no country pair, assessment contract, catalogue, provider route or cross-border data design.

### Release requirements

- Publish only as a clearly labelled prototype/prerelease.
- Run the maintained complete Legal RAG, M7, CORS, repository release and Chromium E2E suites on the exact release SHA.
- Preserve the 57/55/2/21 runtime invariant and the Wave 5J/Wave 5M non-activation guards.
- Do not represent the prototype as legal advice, legal opinion, compliance certification or proof of compliance.

---

## [v0.20.2] - Governed Legal RAG Private Beta

**Release Date:** 2026-08-06

### Added

- Added a shared legal explanation route for all 57 registered private-beta legal profiles.
- Added one statutory POSH profile and 56 conservative governance-fallback profiles with zero runtime-blocked profiles at the original v0.20.2 cut.
- Added a legal RAG status endpoint with explicit catalogue modes and limitations.
- Added a homepage section explaining the decision-first compliance architecture and differentiation.
- Added maintained all-laws runtime, retrieval and explanation validation plus a human-readable validation guide.

### Safety and compatibility

- Deterministic rules remain the sole applicability authority.
- Fallback profiles return only `more-information-needed` or `specialist-review`.
- Provider output cannot change status, reason code, decision fingerprint or citation scope.
- M6 remote persistence remains disabled.
- The release does not claim completion of the M7 v0.22.0 reliability exit.

---

## [v0.20.0] - Compliance Workspace Beta

**Release Date:** 2026-07-27

### Added

- Added a private no-index browser-local Compliance Workspace route.
- Added compliance tasks with owners, descriptions, due dates, due-date source states and status history.
- Added local evidence placeholders that do not upload or store file content.
- Added browser-local calendar entries with explicit date-source states.
- Added JSON backup export and strict import validation for nested task, evidence, calendar and audit structures.
- Added isolated workspace reset using only `growwithhr-compliance-workspace-v1`.
- Added in-memory operation and user guidance when browser storage is unavailable.
- Added JSON Schema, maintained contract checks, dedicated CI and Playwright browser coverage.

### Safety and compatibility

- Kept `/analyze-company.html` as the stable public route.
- Kept private v3 and M4 routes unchanged.
- Added no server upload, account, authentication, database or cloud persistence.
- Preserved assessment, report, PDF, email and delivery contracts.
- Treated evidence entries as placeholders rather than proof of compliance.

### Validation

- GrowWithHR CI passed.
- M5 Compliance Workspace checks passed.
- Executive Assessment Tests passed, including persistence, reset and storage-unavailable coverage.
- The complete maintained release chain includes the M5 contract checks.

---

## [v0.19.0] - Explainable Intelligence and Founder Report Integration

**Release Date:** 2026-07-27

### Added

- Added separate profile-completeness, applicability-certainty and evidence-coverage dimensions.
- Added information-gain questions and a reproducible decision trace.
- Integrated governed law explanations into founder-facing Light and Dark reports.
- Rebuilt final PDF generation as a single-tier report with one contents page, one page-count system and an optional annexure.
- Added report input snapshots, stable action IDs, founder brief, evidence boundaries and future reassessment triggers.
- Added the approved Warm Wishes customer-email signature.

### Safety and compatibility

- Produced no blended compliance, health or maturity score.
- Kept the stable public route and disabled-by-default v3 flag.
- Added no cloud persistence or storage migration.

---

## [v0.18.0] - Compliance Story and Safe Health Model

**Release Date:** 2026-07-21

### Added

- Added the versioned M3 Compliance Story model and JSON Schema `1.0.0`.
- Added a private-beta executive story with a company snapshot, safe-status counts, top three priorities, grouped findings, assumptions, implications and structured sources.
- Added isolated M3 presentation styles with responsive, keyboard-focus and reduced-motion safeguards.
- Added M3 contract tests and Playwright coverage for ready, empty, error and mobile states.
- Added the M3 release manifest and rollback record.

### Safety and compatibility

- Kept `/analyze-company.html` as the stable production route.
- Kept `/analyze-company-v3.html` private and `complianceDnaV3` disabled by default.
- Preserved protected browser-storage, report, PDF, email and delivery contracts.
- Preserved deterministic M2 applicability decisions and separated applicability from evidence status.
- Added no cloud persistence, account requirement or storage migration.

### Validation

- GrowWithHR CI passed.
- Compliance Data Validation passed.
- Executive Assessment Tests passed, including M3 browser coverage.
- The complete maintained regression suite passed before the version-cut commit.

---

## [v0.15.0-beta] - Gmail Advisory Delivery and HRTechify Brand Alignment

**Release Date:** 2026-07-19

### Added

- Added a Node.js and Express backend for advisory email delivery.
- Added Gmail API integration using Google OAuth 2.0.
- Added secure delivery of personalised advisory PDF reports.
- Added HTML and plain-text customer email versions.
- Added a branded HRTechify customer email template.
- Added a personalised customer greeting and organisation name.
- Added a PDF attachment notice to the customer email.
- Added a founder signature and reply-to support.
- Added a compact HRTechify email footer bar.
- Added a centred HRTechify logo with the tagline displayed underneath:

  **People • Technology • Growth**

- Added internal assessment-completion notifications.
- Added recipient email-address validation.
- Added Base64 and PDF-signature validation.
- Added PDF attachment-size limits.
- Added safe attachment filename handling.
- Added request rate limiting for advisory email requests.
- Added the Gmail API health-check endpoint:

  ```text
  GET /api/health
  ```

- Added the advisory email-delivery endpoint:

  ```text
  POST /api/send-advisory
  ```

- Added customer report delivery with a generated PDF attachment.
- Added optional internal assessment-completion notifications.
- Added plain-text email alternatives for email-client compatibility.
- Added reply-to configuration for customer responses.
- Added operational delivery-status handling.

### Changed

- Replaced the production EmailJS delivery path with Gmail API delivery through the GrowWithHR backend.
- Updated the Executive Advisory journey to support report preparation, download, email delivery and resend actions.
- Updated recipient-information handling.
- Updated delivery-status handling.
- Improved backend request validation.
- Improved PDF attachment validation.
- Improved customer email presentation.
- Improved HRTechify branding across public pages and email content.
- Improved shared footer and site-shell consistency.

### Security and reliability

- Kept Gmail and OAuth credentials in server-side environment variables.
- Added recipient email-address validation.
- Added required-field validation.
- Added Base64 validation.
- Added PDF-signature validation.
- Added PDF attachment-size enforcement.
- Added safe attachment filename handling.
- Added request rate limiting.
- Restricted direct public access to server, package and environment files.
- Added a backend health-check endpoint for delivery configuration.
- Added error handling for advisory-delivery requests.

### Current data-handling position at that release

- Assessment interaction primarily took place in the browser.
- Limited progress could be stored in browser `localStorage`.
- The advisory model and PDF were prepared in the browser.
- Report-delivery information was sent to the backend when the user requested email delivery.
- The backend validated the request and sent the advisory through the Gmail API.
- Sent emails and PDF attachments could remain in the connected Gmail account.
- GrowWithHR did not at that release intentionally save completed assessments in a dedicated application database.

### Known limitations at that release

- GrowWithHR remained a beta-stage, rules-based advisory product.
- Browser progress was available only in the same browser.
- Browser data could be cleared or replaced.
- GrowWithHR did not at that release provide user accounts or cloud-saved assessments.
- GrowWithHR did not at that release provide cross-device resume.
- Evidence placeholders in M5 were not uploaded evidence and did not prove compliance.
- Sent-email retention depended on the connected Gmail account.
