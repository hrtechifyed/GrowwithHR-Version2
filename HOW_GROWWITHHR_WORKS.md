# How GrowWithHR Works

**Plain-English current architecture, data flow, decision logic, report access, security and governance guide**  
**Current architecture snapshot:** 1 September 2026

---

## Why this document exists

GrowWithHR is not a general-purpose chatbot that receives a company description and asks an AI model what the company should do.

The core architecture remains:

> **Rules decide. Governed sources substantiate. Artificial intelligence explains.**

The current customer product adds another principle:

> **Public samples prove the format. Personalized web results show a glimpse. Complete personalized PDFs require authenticated email delivery.**

This is an architecture/governance explanation. It is not legal advice, a security certification, a penetration-test report, SOC 2 evidence or ISO 27001 certification.

---

# 1. Current customer product

GrowWithHR is deliberately concentrated on two engines and one recurring layer:

1. **Organization Structure & Growth — flagship**
2. **HR Compliance Readiness — supporting capability**
3. **Change Intelligence — repeat-assessment comparison across the two engines**

Primary navigation is:

- Organization & Growth
- HR Compliance Readiness
- My Reports
- Sources & Methodology

Sample Reports, Security & Data, Terms, About, Privacy and Contact are secondary navigation.

The product is designed around organization-level facts. It is not intended for sensitive employee case-management data.

---

# 2. High-level architecture

```text
USER / BROWSER
      │
      ▼
GITHUB PAGES
Public site, assessments, report glimpses and fictional samples
      │
      ├──────────────► ORGANIZATION ENGINE
      │                Deterministic structural analysis
      │
      ▼
RENDER BACKEND
Private API boundary and privileged secrets
      │
      ├──────────────► COMPLIANCE RULE ENGINE
      │                Deterministic legal/readiness decision
      │
      ├──────────────► GOVERNED RAG
      │                Source-scoped retrieval after decision
      │                       │
      │                       ▼
      │                CLOUDFLARE WORKERS AI
      │                Explanation only
      │
      ├──────────────► SUPABASE COMPANY WORKSPACE
      │                Encrypted reusable company baseline
      │
      ├──────────────► SUPABASE AUTH
      │                Customer sign-in/sign-up for full report delivery
      │
      ├──────────────► CLOUDFLARE REPORT ID REGISTRY
      │                Persistent Report ID allocation
      │
      └──────────────► GMAIL API
                       Complete personalized PDF delivery
```

Google Drive remains an upstream governed legal/research source library. It is not the normal customer Company Workspace database.

---

# 3. Shared website shell

`js/site-shell.js` is the canonical shared navbar/footer source for deployable pages.

This prevents each page from independently defining:

- the product navigation;
- active navigation behavior;
- mobile menu behavior;
- footer links;
- HRTechify/GrowWithHR identity.

The current primary navigation is intentionally product-oriented rather than architecture-oriented:

```text
Organization & Growth
HR Compliance Readiness
My Reports
Sources & Methodology
```

The Intelligence Hub remains a company-analysis overview and Change Intelligence explanation surface, not the sole routing mechanism for every customer action.

---

# 4. What happens when a user enters company information

Depending on the engine, GrowWithHR can collect organization-level facts such as:

- company name;
- work email;
- industry;
- employee / worker / contractor counts;
- operating State(s) and locations;
- growth stage and expected headcount;
- reporting structure and manager counts;
- founder direct reports;
- manager work context;
- role clarity and decision ownership;
- operating cadence and coordination friction;
- other controlled facts required by a governed engine.

Users should not enter unnecessary sensitive employee-level material such as medical records, payroll bodies, complaint evidence, investigation evidence, disciplinary files or detailed individual grievance/performance cases.

Some in-progress assessment continuity may use browser storage. Reusable company baseline data uses the separate server-side Company Workspace architecture described below.

---

# 5. Organization Structure & Growth

The Organization engine is deterministic and organization-level.

It assesses structural patterns such as:

- management capacity context;
- reporting architecture;
- founder dependency;
- decision ownership;
- role clarity;
- governance cadence;
- coordination friction;
- location complexity; and
- growth readiness.

A simple employee-to-manager ratio is not treated as a universal benchmark. Context can include:

- manager role;
- work complexity;
- work standardization;
- team independence;
- coaching intensity; and
- operating-location context.

The same confirmed facts against the same rule version should produce the same deterministic result.

The engine evaluates the organization, not whether an individual manager is a good or bad performer.

## 5.1 Organization report model

The executive report is intended to answer:

1. What is working?
2. What is the primary constraint?
3. What needs attention now?
4. What are the top actions?
5. What may happen if the organization grows as planned?

Detailed findings then show the rule basis, facts used, missing facts, confidence meaning and public source context.

The 12-month scenario is a deterministic planning scenario, not a forecast.

---

# 6. HR Compliance Readiness

The compliance engine remains deterministic-first.

```text
Structured organization facts
        ↓
Fact normalization
        ↓
Versioned deterministic rule
        ↓
Fixed status + reason + missing facts + permitted source IDs
        ↓
Governed RAG retrieval inside that source scope
        ↓
Explanation-only provider
        ↓
Strict validation
        ↓
Readiness explanation + source context + next action
```

The deterministic decision exists before retrieval or AI.

## 6.1 Missing facts

If a required fact is missing, the product must preserve uncertainty rather than ask AI to guess.

Typical bounded states include:

- more information needed;
- specialist review;
- review now / may require review;
- monitor / watch as the company changes; and
- a narrowly defined no-immediate-trigger state where the governed rule supports it.

“No immediate trigger identified” is not a compliance certificate.

## 6.2 RAG is explanation-only

Governed RAG may retrieve source chunks from the source IDs already permitted by the deterministic decision.

It may not:

- invent company facts;
- repair missing answers;
- choose jurisdiction independently;
- select another law family;
- change the deterministic status;
- broaden the source scope;
- convert draft/research material into operative law; or
- certify compliance.

The hosted provider is likewise explanation-only. Provider output that changes the fixed result or invents citations must fail closed.

---

# 7. Change Intelligence

Change Intelligence is a recurring layer, not a third standalone assessment engine.

For a returning company:

```text
Previous confirmed company baseline
          +
Current confirmed company facts
          ↓
Fact comparison
          ↓
Re-run current deterministic engine
          ↓
Finding/status comparison
          ↓
Explain material changes
```

Examples of useful changes include:

- headcount changed;
- manager count changed;
- founder direct reports changed;
- locations changed;
- decision ownership improved or deteriorated;
- a structural finding moved from stable to watch/action;
- a compliance-readiness area became newly relevant;
- a missing-information state was introduced or resolved.

Change Intelligence compares structured facts and deterministic findings. It does not ask AI to compare two report narratives and treat that prose comparison as authoritative.

If there is no previous confirmed baseline, GrowWithHR says so. The first completed assessment establishes the baseline for later comparison.

---

# 8. Company Workspace

GrowWithHR can maintain a reusable Company Workspace so a returning user does not have to re-enter the same company facts from scratch.

The persistent workspace is stored in Supabase through the Render backend.

The large reusable company-data payload is encrypted **before database storage** using AES-256-GCM.

Conceptually:

```text
Company data JSON
      ↓
Render backend
      ↓
AES-256-GCM
      ↓
Ciphertext + IV + authentication tag
      ↓
Supabase Company Workspace
```

Operational metadata such as Report IDs, timestamps, status, email/company identifiers can exist as separate database columns and should not be described as if every column receives the same application-level encryption wrapper.

---

# 9. Report ID and Recovery Code

A reusable Company Workspace is not unlocked by Report ID alone.

Recovery uses:

```text
Report ID + Recovery Code
```

The raw Recovery Code is shown to the user. The backend stores a SHA-256 hash rather than the plaintext code and verifies the supplied code using a timing-safe comparison.

A short-lived one-time server handoff token can be used when moving a recovered baseline into another intelligence experience. The handoff has a short expiry, is deleted after redemption and avoids putting the Recovery Code in a normal URL.

---

# 10. Customer authentication for complete personalized reports

Company Workspace recovery and customer authentication solve different problems.

## Workspace recovery

```text
Report ID + Recovery Code
→ recover reusable company baseline
```

## Complete report delivery

```text
Supabase customer authentication
→ validate signed-in work email
→ authorize complete personalized PDF delivery
```

The browser uses only the Supabase **publishable** key for customer authentication. Privileged Supabase/service credentials remain backend-only.

The report-delivery backend validates the customer Bearer access token and requires the requested recipient to match the authenticated work email.

This prevents “signed in as one person, send another customer’s report to a different email” behavior.

---

# 11. Public sample versus personalized report

This is an intentional product boundary.

## Public fictional samples

A prospective customer can view complete fictional sample reports to understand the report format and depth.

Public samples are clearly labelled as:

- fictional company data;
- illustrative sample;
- not a real assessment; and, for Compliance Readiness,
- not legal certification.

## Personalized result

After a real assessment, the website shows an executive **glimpse**, not the complete personalized report.

The glimpse can show selected items such as:

- overall position;
- primary constraint / readiness position;
- one or more priority signals;
- limited Change Intelligence context; and
- what the complete PDF contains.

The complete personalized PDF is sent by email after authentication.

The production site must not rely on CSS hiding/blurring of a complete personalized report as the access control. The normal deployed route should not render the full personalized content for an unauthenticated customer.

A localhost-only internal full-render path may remain for automated regression/developer verification; it is not a production customer bypass.

---

# 12. Report generation and formatting

GrowWithHR reports use the HRTechify/GrowWithHR brand system rather than a separate report brand.

The current report design principles are:

- HRTechify logo on the report cover;
- restrained dark / warm brand identity;
- status colors used for meaning rather than decoration;
- executive answer before methodology;
- safe A4 margins and full usable content width;
- measured/wrapping status components so labels do not spill outside boxes;
- table/card page-break protection;
- readable body typography;
- visible source/methodology boundaries;
- no gimmicky “AI dashboard” styling.

Organization and Compliance Readiness reports should share report primitives where practical rather than maintaining unrelated design systems.

---

# 13. Report email delivery

When an authenticated customer requests the complete report:

```text
Authenticated customer
       ↓
Report delivery request + Bearer token
       ↓
Render backend validates token
       ↓
Recipient email must equal authenticated email
       ↓
Generate / validate complete PDF
       ↓
Gmail API
       ↓
Customer mailbox
```

Email creates a separate retention location. Deleting the active Company Workspace does not automatically delete an already-sent message or attachment from Gmail Sent or the recipient mailbox.

---

# 14. Supabase roles in GrowWithHR

Supabase now has two distinct uses:

1. **Company Workspace database** — server-mediated reusable baseline storage.
2. **Customer Auth** — sign-in/sign-up session used to authorize complete personalized report delivery.

These should not be conflated.

The Company Workspace remains designed as a server-only data path through the backend/service role rather than normal browser row access.

Browser authentication uses the publishable key and normal Supabase Auth session tokens, not the service-role key.

---

# 15. Render responsibilities

Render is the private backend boundary for functions such as:

- Company Workspace create/recover/complete/delete;
- encryption/decryption;
- temporary workspace handoff;
- Report ID mediation;
- customer report-auth verification;
- recipient/work-email binding;
- complete report delivery;
- legal explanation routing;
- operational explanation routing;
- retention/reminder workflows where configured.

Sensitive server environment variables such as service credentials, Gmail OAuth credentials, encryption secrets and provider credentials must remain server-side.

---

# 16. CORS is not authentication

The backend uses allowed-origin controls for normal browser API calls.

CORS helps restrict which browser origins can call the API through ordinary browser JavaScript, but a direct network client can still send requests.

Sensitive routes therefore need their own controls such as:

- access-token validation;
- Recovery Code verification where relevant;
- input validation;
- request-size limits;
- rate limiting / abuse protection; and
- server-only secrets.

---

# 17. Google Drive source governance

Google Drive is upstream source governance, not the customer database.

It can hold controlled legal/research source files and source-register information such as:

- source identity;
- provenance;
- exact-file fingerprints where available;
- byte length/page count;
- draft/guidance/operative classification;
- review status;
- reconciliation records.

Runtime Legal RAG should use governed compiled catalogues rather than searching an arbitrary live Drive folder and asking AI to decide the answer.

---

# 18. Report IDs

Persistent Report ID allocation is a separate infrastructure responsibility mediated by the backend and Cloudflare Report ID service / Durable Object registry.

The browser does not receive private registry credentials and does not directly write to the Durable Object.

Report IDs support lineage and workspace recovery but do not by themselves grant access to encrypted company data or complete personalized reports.

---

# 19. Retention and deletion

The reusable Company Workspace is designed around a six-month retention period from the latest completed analysis, with the documented reminder/deletion process.

The retention period is a product policy, not a statement that six months is legally required.

Deletion of the active reusable workspace is separate from:

- infrastructure backup ageing;
- Gmail Sent retention;
- recipient mailbox retention;
- downloaded customer copies.

Privacy documentation must preserve that distinction.

---

# 20. Current compliance prototype maturity

The maintained Legal RAG runtime preserves the current invariant:

- 57 callable profiles;
- 55 substantive profiles;
- 2 governance fallbacks;
- 21 active catalogues.

Every active substantive legal catalogue remains `needs-legal-review`.

The prototype currently permits controlled secondary-research provenance. Exact official-file assurance remains future hardening under #143. Broader production legal/privacy/RAG/source/security/release approval remains future hardening under #142.

The 524 overdue temporal review entries across draft/unapproved records remain a real substantive review backlog. They must not be “fixed” by simply extending review dates without actual review.

Approved records remain strict in compliance-data validation.

---

# 21. Safeguarding / excluded legal areas

Wave 5J — Bonded and Forced Labour — remains governance/research-only. Live safeguarding concerns require human handling rather than normal AI/RAG assessment.

Wave 5M — Multi-country Employment — remains outside the substantive current release. GrowWithHR does not currently provide a generic cross-border employment, immigration, tax or social-security decision engine.

---

# 22. Security posture

GrowWithHR has meaningful controls for a prototype, including deterministic authority separation, server-side privileged credentials, encrypted reusable company payloads, hashed Recovery Codes, controlled handoffs, customer report authentication, work-email binding, CORS allowlisting, request validation and maintained regression suites.

It should still not be represented as independently assured enterprise security.

Future hardening can include areas such as:

- stronger rate limiting / abuse protection;
- dedicated/rotatable encryption-key management;
- tighter database privilege reduction;
- stronger CSP/browser security controls;
- enterprise audit logging/monitoring;
- formal incident response and BCDR evidence;
- penetration testing;
- vendor/DPA governance;
- SSO/RBAC when commercially required;
- independent SOC 2 / ISO 27001 readiness if pursued.

See `SECURITY.md` for the maintained security statement.

---

# 23. Release validation

A customer-facing release should be validated on the exact candidate SHA through the maintained chain, including:

- version consistency;
- compliance-data validation;
- baseline contracts;
- Organization deterministic/source checks;
- shared site-shell/navigation checks;
- customer authentication/report-access checks;
- client/server readiness;
- report experience/visual checks;
- journey/scenario regression;
- archived compatibility;
- Executive Assessment Playwright tests;
- founder/report browser acceptance;
- maintained Legal RAG workflows;
- post-merge `main` CI;
- GitHub Pages deployment; and
- live release smoke.

Green CI proves software behavior against the maintained tests. It does not grant legal approval.

---

# 24. One-sentence summary

GrowWithHR converts structured company facts into deterministic, explainable HR decisions; preserves legal/compliance authority boundaries; uses a reusable encrypted company baseline for longitudinal Change Intelligence; lets anyone inspect complete fictional samples; and restricts complete personalized PDF delivery to the authenticated assessment work email.
