# GrowWithHR

GrowWithHR is an HR decision-support prototype from HRTechify. It converts structured organization facts into deterministic, traceable recommendations, evidence and next actions while keeping AI outside the decision-authority boundary.

> **Core authority principle:** rules decide. Governed sources substantiate. AI explains. For HR Compliance Readiness, the deterministic rule decides the product status/source scope first; RAG and the provider cannot create facts, choose applicable law, change the fixed result or certify compliance.

## Current customer product — 1 September 2026

The public GrowWithHR experience is deliberately concentrated on two decision products and one recurring layer rather than a long list of future HR modules:

1. **Organization Structure & Growth — flagship.** Reviews structural capacity, management context, reporting architecture, founder dependence, decision ownership, coordination and a deterministic 12-month growth scenario. It evaluates the organization, not individual employee/manager performance.
2. **HR Compliance Readiness — supporting capability.** Identifies HR compliance areas that may require review, missing information, governed source context and next actions. It is a readiness/preparation tool, not compliance assurance, legal certification or proof of compliance.
3. **Change Intelligence — recurring layer.** When a prior confirmed company baseline exists, GrowWithHR compares structured company facts and deterministic findings to show what changed, which pressures increased or improved, what new priorities appeared and what may require renewed review.

Primary customer navigation is intentionally simple:

**Organization & Growth · HR Compliance Readiness · My Reports · Sources & Methodology**

Complete fictional sample reports remain public so prospective users can inspect report format and depth.

Personalized customer results use a different access model:

```text
Assessment complete
→ website shows executive report glimpse
→ sign in / sign up with assessment work email
→ Supabase access token validated server-side
→ requested recipient must match authenticated work email
→ complete personalized PDF delivered by email
```

The normal deployed customer route does not expose the complete personalized report as a public web document. A localhost-only internal renderer may remain for automated regression/developer verification.

## Company Workspace versus report authentication

These are deliberately separate controls:

- **Report ID + Recovery Code** reopens reusable Company Workspace baseline data.
- **Supabase customer authentication** authorizes complete personalized PDF delivery.

The Recovery Code is not stored in plaintext. The backend stores a SHA-256 hash and verifies the supplied code. The reusable company-data payload is encrypted by the backend using AES-256-GCM before storage in Supabase.

Browser authentication uses only the Supabase publishable key. Privileged Supabase/service credentials remain server-side. Complete report-delivery endpoints validate the Bearer token and bind the recipient to the authenticated work email.

## Current release candidate

**Updated:** 1 September 2026  
**Version line:** `v0.20.4-prototype.1`  
**Release theme:** product hardening, Change Intelligence and authenticated complete-report delivery  
**Release classification:** research-grade prototype / prerelease  
**Legal-review status:** every active substantive legal catalogue remains `needs-legal-review`

This release hardens the customer product without changing the legal/compliance authority boundary.

## Product routes

- Organization Structure & Growth: `/organization-intelligence.html`
- HR Compliance Readiness: `/compliance-intelligence.html`
- Company analysis / Change Intelligence overview: `/intelligence-hub.html`
- Customer report/workspace recovery: `/my-reports.html`
- Public fictional samples: `/sample-reports.html`
- Organization methodology: `/organization-structure-methodology.html`
- Sources & Methodology: `/official-resources.html`
- Security & Data: `/security.html`
- Stable compatibility Compliance route: `/analyze-company.html`
- Private-beta Compliance DNA route: `/analyze-company-v3.html`

The deployed product remains the root-level HTML/CSS/JavaScript application. `apps/web/src/` is an **archived experimental React/TypeScript UX layer** and is not the deployed build.

## Organization Structure & Growth

The Organization engine is deterministic and organization-level.

It can evaluate facts and patterns including:

- employee and people-manager counts;
- reporting layers;
- founder direct reports;
- manager role;
- work complexity;
- work standardization;
- team independence;
- coaching intensity;
- role clarity;
- decision rights;
- governance cadence;
- coordination friction;
- location complexity; and
- expected headcount.

It does not treat one employee-to-manager ratio as a universal benchmark. Context matters.

Its executive report is designed to answer:

1. What is working?
2. What is the primary constraint?
3. What needs attention now?
4. What are the top leadership actions?
5. What may happen as headcount grows?

Detailed findings retain facts used, missing facts, rule/version context and source transparency. The 12-month scenario is a deterministic planning scenario, not a forecast.

## Change Intelligence

Change Intelligence is a layer across the existing engines rather than a third standalone module.

```text
Previous confirmed baseline
        +
Current confirmed company facts
        ↓
Fact delta
        ↓
Re-run deterministic engine
        ↓
Finding/status delta
        ↓
Explain material changes
```

The comparison authority is structured company facts and deterministic findings—not generated report prose.

If no previous confirmed baseline exists, GrowWithHR does not invent one. The first completed assessment establishes the baseline for later comparison.

## HR Compliance Readiness

The compliance experience is intentionally framed as **readiness**, not assurance.

A legal explanation is produced through the deterministic-first path:

```text
Assessment answers
→ privacy-safe deterministic fact mapping
→ versioned deterministic rule
→ immutable decision + reason code + missing facts + allowed source IDs
→ governed source retrieval
→ retrieval/citation fingerprint
→ explanation-only provider
→ strict response validation
→ readiness explanation + sources + next action
```

Customer-facing states can include concepts such as:

- may require review / review now;
- more information needed;
- specialist review recommended;
- monitor / watch as the company changes; and
- narrowly governed no-immediate-trigger states.

A no-immediate-trigger result is not proof that a company is compliant.

## Current Legal RAG runtime

| Control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Active catalogue legal status | `needs-legal-review` |

The two governance fallbacks remain deliberately non-substantive:

- **Wave 5J — Bonded and Forced Labour:** governance/research-only and safeguarding-human-first.
- **Wave 5M — Multi-country Employment:** outside the substantive current release; no generic cross-border assessment/provider authority.

## Prototype legal/source standard

This is a high-quality research prototype, not a production legal-certification system.

For the prototype:

- structured secondary research with controlled provenance is an accepted source basis;
- exact official-file verification is supplementary assurance rather than a prototype release prerequisite;
- secondary-research provenance is not represented as official or counsel-approved provenance;
- draft, guidance, portal and research material retains its classification;
- all active substantive legal catalogues remain `needs-legal-review`;
- output must not be represented as legal opinion, certification or proof of compliance.

The current 524 overdue temporal review entries across 51 draft/unapproved law records remain a real substantive review backlog. Normal prototype CI reports them rather than silently treating those records as current. Approved records remain strict. `COMPLIANCE_REQUIRE_CURRENT_REVIEW=true` can be used for a deliberate strict all-record currentness gate.

Production-grade exact official-source assurance remains future hardening under #143. Broader production Legal / Privacy / RAG / Source / Security / Release approval remains future hardening under #142.

## Report design and access

GrowWithHR report design uses the existing HRTechify/GrowWithHR brand rather than a separate visual identity.

Current report principles include:

- HRTechify logo on the report cover;
- restrained brand palette;
- status colors used for semantic meaning;
- executive answer before methodology;
- safe A4 page width and margins;
- measured/wrapping status labels so long review states do not spill outside boxes;
- card/table overflow and page-break protection;
- readable evidence/source blocks;
- complete fictional public samples;
- personalized full PDF delivered only after authenticated request.

## Privacy and data-minimization boundary

GrowWithHR is designed for organization-level information, not sensitive employee case-management data.

Person-level medical/case data, payroll bodies, complaint/dispute narratives, investigation evidence, notices/orders and other unnecessary identifiable employee material remain outside normal assessment/provider/report paths unless a separately approved contract expressly permits them.

Selected assessment progress can still use browser storage. The reusable Company Workspace uses the separate encrypted server-side architecture. Email-delivered PDFs can remain in Gmail Sent and recipient mailboxes independently of Company Workspace deletion.

## Validation and release gate

A customer-facing release may merge only after the exact candidate SHA passes the maintained engineering chain, including:

1. version consistency;
2. compliance-data validation;
3. baseline contracts;
4. Organization deterministic/source checks;
5. shared site-shell / buyer-trust / UI checks;
6. customer authentication/report-access contracts;
7. client/server readiness;
8. report experience and visual checks;
9. journey/scenario regression;
10. archived compatibility;
11. Executive Assessment Playwright coverage;
12. founder/report browser acceptance;
13. All-Laws RAG validation;
14. M4 report integration; and
15. M7 hardening.

After merge, `main` CI, GitHub Pages deployment and Live Release Smoke must also pass.

Green CI is software evidence. It does not grant legal approval.

## Start here

- [ABOUT.md](ABOUT.md) — current customer product and governance overview.
- [HOW_GROWWITHHR_WORKS.md](HOW_GROWWITHHR_WORKS.md) — plain-English current architecture/data flow.
- [Architecture](docs/ARCHITECTURE.md) — current technical architecture and authority boundaries.
- [Security](SECURITY.md) — current security/report-access posture.
- [Roadmap](ROADMAP.md) — current product priorities and future hardening.
- [File Overview](FILES_OVERVIEW.md) — current deployed/runtime file map.
- [Release Notes](RELEASE_NOTES.md) and [Changelog](CHANGELOG.md) — current candidate and historical changes.
- [Legal RAG runtime README](growwithhr-rag/README.md) — detailed governed Legal RAG runtime.
- [All-laws validation](docs/testing/all-laws-rag-validation.md) — maintained legal-RAG regression procedure.

Dated files under `docs/releases/` and the dated 20 August architecture handbook remain historical records and are not rewritten to describe later behavior.

## Prototype versus production

GrowWithHR provides research-backed HR decision support, traceability and implementation starting points. It is not professional legal, tax, payroll, immigration, privacy, security or safeguarding advice and must not be marketed as legal certification, proof of compliance, SOC 2 certification or ISO 27001 certification unless independently obtained in future.
