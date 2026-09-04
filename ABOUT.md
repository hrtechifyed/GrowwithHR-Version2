# About GrowWithHR

**Document status:** Current customer product, architecture and governance overview  
**Updated:** 1 September 2026  
**Application line:** `v0.20.4-prototype.1` research-grade prototype  
**Legal-review status:** every active legal catalogue remains `needs-legal-review`

## What GrowWithHR is

GrowWithHR is an HR decision-support product from HRTechify. The current public product is deliberately concentrated on two engines and one recurring intelligence layer:

1. **Organization Structure & Growth — flagship.** Reviews organization-level structure, management capacity context, reporting architecture, founder dependence, decision ownership, coordination and a deterministic 12-month growth scenario.
2. **HR Compliance Readiness — supporting capability.** Identifies HR compliance areas that may require review, missing information, governed sources and recommended next actions. It is a readiness and preparation tool, not compliance assurance or certification.
3. **Change Intelligence — recurring layer.** When a prior confirmed company baseline exists, GrowWithHR compares structured facts and deterministic findings to show what changed, what pressure increased or improved and what may need renewed attention.

GrowWithHR evaluates organization-level facts. It is not designed to score individual employees, determine compensation, recommend dismissals, decide employee-level entitlements or process sensitive employee cases.

## Customer experience

The public navigation is intentionally simple:

- **Organization & Growth**
- **HR Compliance Readiness**
- **My Reports**
- **Sources & Methodology**

Complete **fictional sample reports** remain publicly viewable so prospective users can inspect the format and depth of the product.

Personalized results follow a different access model:

```text
Complete assessment
        ↓
Website shows executive report glimpse
        ↓
Customer signs in / signs up with assessment work email
        ↓
Backend validates Supabase access token
        ↓
Requested recipient must equal authenticated work email
        ↓
Complete personalized PDF is delivered by email
```

The deployed product does not expose the complete personalized report as a normal public web page. A localhost-only internal preview path may be retained for automated regression testing, but it is not a production customer bypass.

## Organization Structure & Growth authority model

The Organization engine is deterministic and organization-level. It separates facts, rules, findings, sources and scenarios.

Its reports answer five executive questions:

1. What is working?
2. What is becoming a constraint?
3. What requires attention now?
4. What may happen as the company grows?
5. What should leadership do next?

Public organization-design sources support underlying principles. GrowWithHR remains responsible for its disclosed prototype rules and guardrails. One universal span-of-control number is not treated as a universal benchmark; work complexity, standardization, team independence, manager role, coaching intensity and location context are part of the interpretation.

The Organization engine evaluates the organization, not whether an individual manager is good or bad.

## HR Compliance Readiness authority model

The legal/compliance architecture remains deterministic-first:

```text
Organization-level assessment facts
        ↓
Privacy-safe fact mapping
        ↓
Versioned deterministic rule
        ↓
Fixed status + reason code + missing facts + allowed source IDs
        ↓
Governed RAG retrieval from only the permitted source scope
        ↓
Explanation-only provider
        ↓
Strict response validation
        ↓
Readiness explanation + sources + limitations + next action
```

> **The model does not decide the legal result.** Deterministic rules decide the product result within the prototype contract. Retrieval and AI operate after that decision and cannot create facts, choose applicable law, change status/reason/source scope or certify compliance.

Customer-facing readiness states are intentionally bounded. Depending on the feature they can include concepts such as:

- review now / may require review;
- more information needed;
- monitor / watch as the company changes;
- specialist review recommended; or
- no immediate trigger identified from the supplied facts.

A low-risk or no-immediate-trigger result is **not** a certificate that the company is compliant.

## Change Intelligence

Change Intelligence is not a separate third assessment module. It is a recurring layer across the existing engines.

It compares structured confirmed company facts and deterministic findings rather than comparing generated prose.

Conceptually:

```text
Previous confirmed company baseline
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

If no prior confirmed baseline exists, GrowWithHR does not invent one. The first assessment establishes the baseline for future comparison.

## Company Workspace and report authentication are separate controls

GrowWithHR deliberately keeps two different access concepts separate:

### Company Workspace recovery

- Report ID + Recovery Code reopens reusable company baseline data.
- The Recovery Code is not stored in plaintext; the backend stores a SHA-256 hash and verifies the supplied code.
- The reusable company payload is encrypted by the backend using AES-256-GCM before storage in Supabase.
- The workspace is designed around a six-month retention period from the latest completed analysis, subject to the documented deletion process.

### Complete personalized report delivery

- Supabase customer authentication controls access to complete personalized PDF delivery.
- Browser code uses only the Supabase publishable key.
- Privileged Supabase/service credentials remain server-side.
- Report delivery endpoints validate the Bearer token.
- The server requires the requested report recipient to match the authenticated work email.

A Recovery Code is not a substitute for report authentication, and authentication is not a substitute for the Recovery Code when recovering the reusable workspace.

## Data-minimization boundary

GrowWithHR is intended for structured organization-level information. Users should not submit highly sensitive employee-level material such as medical records, payroll bodies, disciplinary files, complaint evidence, investigation evidence, detailed grievance records or other unnecessary identifiable employee case data.

Normal assessment continuity may still use browser storage for selected progress/state. Reusable Company Workspace data is stored server-side under the separate encrypted workspace architecture. Email-delivered PDFs can remain in Gmail Sent and recipient mailboxes independently of Company Workspace deletion.

## Prototype legal/source standard

The Compliance Readiness capability is a **research-grade prototype**.

For this release:

- structured secondary research with controlled provenance is an accepted prototype source basis;
- exact official-file verification is supplementary assurance rather than a prototype release prerequisite;
- secondary-research provenance is never represented as official or counsel-approved provenance;
- draft, guidance, portal and research material retains its classification;
- every active substantive legal catalogue remains `needs-legal-review`;
- output must not be represented as a legal opinion, legal certification or proof of compliance.

Exact official-source assurance remains future production hardening under GitHub issue #143. Broader production Legal / Privacy / RAG / Source / Security / Release approval remains future hardening under #142.

## Current legal-RAG runtime scope

| Control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Active catalogue legal status | `needs-legal-review` |

The two governance fallbacks remain deliberately non-substantive:

- **Wave 5J — Bonded and Forced Labour:** governance/research-only; no normal substantive assessment/provider handling. Live safeguarding concerns remain human-only.
- **Wave 5M — Multi-country Employment:** outside the current release; no generic country-pair assessment, runtime catalogue or provider route.

## What GrowWithHR is not

GrowWithHR must not be represented as:

- a legal opinion or legal certification service;
- proof that an organization is compliant;
- an automatically counsel-approved applicable-law selector;
- an employee performance or capability scoring system;
- a payroll, tax, immigration or permanent-establishment decision engine;
- an automated safeguarding case-handler or investigator;
- a SOC 2 or ISO 27001 certified system unless such certification is independently obtained in future;
- a system where green CI, a source upload or an AI response is treated as human legal approval.

## Key current documents

- `README.md` — repository and current product overview.
- `HOW_GROWWITHHR_WORKS.md` — plain-English current architecture and data flow.
- `docs/ARCHITECTURE.md` — technical architecture and authority boundaries.
- `SECURITY.md` — current security posture and customer report-access controls.
- `ROADMAP.md` — current product direction and future hardening.
- `CHANGELOG.md` / `RELEASE_NOTES.md` — release history and current release candidate.
- `growwithhr-rag/README.md` — governed legal RAG runtime detail.
- `docs/testing/all-laws-rag-validation.md` — legal-RAG validation procedure.

Historical dated release manifests under `docs/releases/` remain historical records and are not rewritten to describe later product behavior.
