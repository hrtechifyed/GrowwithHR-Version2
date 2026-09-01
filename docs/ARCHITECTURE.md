# GrowWithHR Architecture

**Current architecture snapshot:** 1 September 2026  
**Release line:** `v0.20.4-prototype.1` research-grade prototype

## 1. Deployment model

The deployed product is the root-level static HTML/CSS/JavaScript application hosted on GitHub Pages.

`server-entry.js` is the CORS-aware production Node entry point on Render and delegates server-side routes for Company Workspace, report delivery, customer authentication gates, legal explanations, Report ID mediation and related protected operations.

`apps/web/src/` remains an archived React/TypeScript experiment and is not the deployed build.

## 2. Customer product architecture

The public product is deliberately concentrated on:

1. **Organization Structure & Growth — flagship**
2. **HR Compliance Readiness — supporting capability**
3. **Change Intelligence — recurring layer across repeat assessments**

The primary shared navigation is generated centrally by `js/site-shell.js`:

```text
Organization & Growth
HR Compliance Readiness
My Reports
Sources & Methodology
```

Secondary navigation includes Sample Reports, Security & Data, Terms, About, Privacy and Contact.

The Intelligence Hub explains the company-analysis model, Change Intelligence and report-glimpse concept. It is not required to remain the only route into the two engines.

## 3. Public versus personalized report architecture

### Public fictional samples

Complete fictional reports remain publicly viewable so a prospective customer can inspect report format and depth:

- Organization Structure & Growth sample;
- HR Compliance Readiness sample.

Sample data must be explicitly fictional / illustrative and must not be represented as a real assessment.

### Personalized reports

The normal production path is:

```text
Assessment complete
→ executive web glimpse
→ sign in / sign up with assessment work email
→ Supabase access token
→ server-side token verification
→ recipient must match authenticated work email
→ complete personalized PDF delivered by Gmail
```

The complete personalized report must not be protected merely by a hidden link, CSS blur or client-side display toggle.

A localhost-only full report renderer may be retained for deterministic browser regression/developer verification. Production users must not be able to unlock that renderer by supplying the same query parameter on the deployed host.

## 4. Shared site shell and visual consistency

`js/site-shell.js` is the canonical source for shared navbar/footer markup and interaction behavior.

Shared styles and variables remain the authority for the existing GrowWithHR visual system. Page-specific CSS may extend the shared system but must not redefine a competing global navbar, footer or brand palette.

Automated contracts protect:

- one canonical shared header/footer;
- active-navigation behavior;
- mobile navigation behavior;
- keyboard/focus behavior;
- common footer links;
- required shared style loading;
- customer terminology.

## 5. Organization Structure & Growth architecture

The Organization engine is deterministic and organization-level.

Primary components include:

- `organization-intelligence.html` — structured customer assessment;
- `js/modules/organization/organization-structure-engine.mjs` — deterministic engine;
- `js/modules/organization/organization-source-registry.mjs` — framework, rule/source mappings and public-source metadata;
- `js/organization-structure-report.mjs` — sample, glimpse, report and Change Intelligence rendering;
- `js/organization-structure-pdf.mjs` — branded PDF generation.

The engine can evaluate structural facts such as:

- employee and manager counts;
- reporting layers;
- founder direct reports;
- manager role;
- work complexity;
- standardization;
- team independence;
- coaching intensity;
- role clarity;
- decision rights;
- governance cadence;
- coordination friction;
- location complexity; and
- expected headcount.

The engine does not expose an arbitrary individual/organization maturity score.

It separates public source principles from GrowWithHR prototype rule interpretation. Numeric watch/action guardrails remain GrowWithHR prototype rules unless an external source explicitly publishes the value.

The 12-month scenario is deterministic planning support and is explicitly not a forecast.

## 6. HR Compliance Readiness architecture

The customer-facing compliance product is **HR Compliance Readiness**.

The legal authority path remains:

```text
assessment answers
→ deterministic fact mapper
→ deterministic rule evaluator
→ immutable product decision
→ legal RAG profile resolver
→ governed catalogue retrieval
→ explanation-only provider
→ strict response validation
```

The deterministic rule owns:

- status;
- reason code;
- missing facts;
- allowed source IDs / source scope.

Retrieval/provider output must preserve:

```text
usedForDecision: false
applicabilityAuthority: none
```

The provider cannot:

- create missing company facts;
- choose applicable law independently;
- change status or reason code;
- change the decision fingerprint;
- broaden permitted source IDs;
- certify compliance.

The current product framing is readiness/review/preparation rather than assurance.

## 7. Change Intelligence architecture

Change Intelligence is not a standalone third engine.

It operates on a prior confirmed company baseline plus the current structured facts.

```text
Previous baseline
      +
Current facts
      ↓
Fact delta
      ↓
Current deterministic engine run
      ↓
Finding/status delta
      ↓
User-facing change interpretation
```

The comparison authority is structured facts and deterministic finding states, not generated report prose.

Organization Change Intelligence is integrated with the Organization report/runtime model. Compliance Change Intelligence is supported by `js/compliance-change-intelligence.js` and related assessment/report contracts.

If no previous confirmed baseline exists, no comparison is invented.

## 8. Company Workspace architecture

The reusable Company Workspace is separate from browser-only progress continuity.

Persistent reusable company data is mediated by the Render backend and stored in Supabase.

The reusable company payload is encrypted by the backend using AES-256-GCM before storage.

Workspace recovery uses:

```text
Report ID + Recovery Code
```

The Recovery Code is stored as a SHA-256 hash rather than plaintext and is verified server-side.

A short-lived, cryptographically random one-time handoff token can transfer recovered company data into another intelligence experience without placing the Recovery Code in the URL.

The normal workspace retention policy remains six months from the latest completed analysis, subject to the documented deletion/reminder process.

## 9. Customer authentication architecture

Supabase now has two distinct roles:

1. Company Workspace database; and
2. customer authentication for complete personalized report delivery.

Browser authentication uses only the Supabase publishable key.

Privileged Supabase/service-role credentials remain backend-only.

`server-customer-report-gate.js` and report-delivery routes validate the customer Bearer token and bind the requested recipient to the authenticated work email.

Authentication does not replace Workspace Recovery Code verification. Recovery Code verification does not replace authentication for complete report delivery.

## 10. Report formatting architecture

The report system is expected to remain consistent with the existing HRTechify/GrowWithHR brand rather than creating a second visual identity.

Current report principles include:

- HRTechify logo on the report cover;
- shared dark / warm brand treatment;
- status colors reserved for semantic meaning;
- executive decision brief before detailed methodology;
- safe A4 page width/margins;
- measured/wrapping status chips and status cards;
- overflow/page-break protection for tables/cards;
- readable source blocks and footers;
- no unsupported claims hidden inside decorative graphics.

`js/report-format-safety-v1.js` provides reusable formatting-safety support. Organization-specific PDF logic lives in `js/organization-structure-pdf.mjs`; the Compliance Readiness report continues to use its maintained PDF/report pipeline.

## 11. Backend and infrastructure boundaries

### GitHub Pages

Public static frontend only. No privileged server secrets.

### Render

Private API boundary for operations including:

- workspace creation/recovery/completion/deletion;
- encryption/decryption;
- temporary handoff;
- customer-auth validation;
- recipient/work-email binding;
- complete report delivery;
- Report ID mediation;
- legal/operational explanation routing.

### Supabase

- Company Workspace persistence;
- customer authentication.

The Company Workspace table remains a server-mediated data path. Customer Auth sessions do not grant direct browser access to encrypted workspace rows.

### Cloudflare

- Workers AI: governed explanation-only provider role;
- Worker/Durable Object: persistent Report ID allocation/registry.

These are separate responsibilities.

### Gmail API

Requested complete report email delivery. Sent email/attachments have a retention lifecycle separate from Company Workspace deletion.

### Google Drive / governed source workflow

Upstream legal/research source governance. It is not normal customer workspace storage.

## 12. CORS, authentication and recovery are different controls

CORS is an origin restriction for normal browser requests. It is not authentication.

Sensitive operations require route-specific controls such as:

- Bearer-token validation for complete personalized report delivery;
- Recovery Code verification for Company Workspace recovery;
- server-only privileged credentials;
- request/input validation;
- request-size limits;
- rate limiting / abuse controls where configured or required.

## 13. Legal RAG current runtime scope

The maintained prototype runtime preserves:

- 57 callable profiles;
- 55 substantive profiles;
- 2 governance fallbacks;
- 21 active catalogues.

Every active substantive legal catalogue remains `needs-legal-review`.

Wave 5J — Bonded and Forced Labour — remains governance/research-only and safeguarding-human-first.

Wave 5M — Multi-country Employment — remains outside the substantive current release and has no generic cross-border assessment/provider authority.

Detailed law-family/wave authority boundaries remain documented in the historical/current Legal RAG architecture files under `docs/architecture/` and `growwithhr-rag/`.

## 14. Compliance review-currentness gate

Compliance-data validation distinguishes approved/current legal records from draft/unapproved research records.

- Approved records remain strict for review-currentness.
- Draft/unapproved overdue review dates remain visible as warnings in normal prototype CI.
- `COMPLIANCE_REQUIRE_CURRENT_REVIEW=true` can deliberately require strict review-currentness across all records.

The current 524 overdue temporal entries across 51 draft/unapproved law records remain a real substantive review backlog. They must not be cleared by simply moving dates without actual review.

## 15. Privacy boundary

GrowWithHR is designed for controlled organization-level information.

Sensitive employee-level identities, medical/case data, payroll bodies, complaint/dispute narratives, notices/orders and evidence bodies remain outside normal provider/report paths unless a separately approved contract expressly permits them.

Email-delivered reports create copies outside the Company Workspace lifecycle. Workspace deletion therefore cannot be described as deleting all sent/downloaded copies everywhere.

## 16. Quality and release gates

The exact release candidate SHA must pass the maintained chain, including:

- version consistency;
- compliance-data validation;
- baseline contracts;
- Organization source/deterministic checks;
- shared shell / buyer trust / UI contracts;
- architecture milestones;
- client/server readiness;
- report presentation and visual checks;
- journey/scenario regressions;
- archived compatibility;
- Executive Assessment Playwright suite;
- founder/report browser acceptance;
- All-Laws RAG maintained validation;
- M4 report integration;
- M7 RAG-ready hardening.

After merge, `main` must also pass its CI, GitHub Pages deployment and Live Release Smoke.

## 17. Approval boundary

Passing deterministic, retrieval, browser, report, authentication, integration or hardening tests is software evidence only.

It does **not** grant legal, privacy, safeguarding, RAG, exact-source-file, State/UT, section-mapping, assessment-fact, deterministic-rule, security or production-release approval.

Production hardening remains tracked under #142 and #143. Green CI does not convert the research-grade HR Compliance Readiness prototype into legal certification.

## 18. Current canonical documents

- `README.md`
- `ABOUT.md`
- `HOW_GROWWITHHR_WORKS.md`
- `docs/ARCHITECTURE.md`
- `SECURITY.md`
- `ROADMAP.md`
- `FILES_OVERVIEW.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`

Dated files under `docs/releases/` remain historical evidence and should not be rewritten to describe later behavior.
