# GrowWithHR full platform architecture, data governance and enterprise-hardening reference

**Architecture snapshot:** 20 August 2026  
**Repository:** `hrtechifyed/GrowwithHR-Version2`  
**Application package version:** `0.20.4-prototype.1`  
**Product classification:** research-grade prototype / pre-production architecture  
**Primary authority principle:** **Rules decide. Governed sources substantiate. AI explains.**

> This is the technical and governance source-of-truth for how GrowWithHR currently handles architecture, data movement, deterministic decisions, governed retrieval, AI, persistence, recovery, report delivery, retention and major security boundaries. It is not a legal opinion, penetration-test report, SOC 2 report, ISO 27001 certification or DPDP certification.

---

## 1. Why this document exists

GrowWithHR has evolved across a public assessment, deterministic compliance logic, governed Legal RAG, reusable Company Workspace, PDF/report delivery, source-governance tooling and several infrastructure providers. Individual implementation documents explain parts of that system; this document brings the full system together in one place.

It is intended to answer, without relying on tribal knowledge:

- what runs where;
- what data is collected and where it travels;
- what is stored, for how long and in what form;
- what the deterministic Rule Engine owns;
- what RAG is and is not allowed to do;
- what AI receives and what it is forbidden to decide;
- how Supabase, Render, Cloudflare, Google Drive, Gmail, GitHub and the browser fit together;
- how Company Workspace recovery works;
- how encryption, hashing and secrets are currently implemented;
- what deletion means at each layer;
- where residual copies can remain;
- what HRTechify/GrowWithHR remains responsible for under a shared-responsibility model;
- how the DPDP Act/Rules phased commencement affects readiness planning;
- which controls are already meaningful;
- which risks remain; and
- what must change before GrowWithHR should be described as enterprise-grade.

Where this document conflicts with an older prototype document, the current `main` implementation and the latest validated release/runtime evidence take precedence. Older documents should then be reconciled rather than silently left inconsistent.

---

## 2. Executive architecture in one page

GrowWithHR is deliberately **not** designed as a general chatbot that receives a company description and decides what law applies.

The central execution model is:

```text
Structured organisation facts
        │
        ▼
Deterministic Rule Engine
        │
        ├── missing required fact ──► More information needed
        │
        ▼
Immutable product decision
(status + reason code + source scope)
        │
        ▼
Governed RAG
(retrieve only permitted governed material)
        │
        ▼
Explanation-only provider
(Cloudflare Workers AI when configured)
        │
        ▼
Strict response validation
        │
        ▼
Report / web explanation / PDF / requested email
```

The infrastructure model is:

```text
USER DEVICE
  │
  ├── GitHub Pages: public frontend
  ├── browser localStorage: some resumable state (plain JSON today)
  │
  ▼ HTTPS
RENDER
  Private backend/API and secret boundary
  │
  ├── deterministic rules / orchestration
  ├── Company Workspace encryption/decryption
  ├── governed RAG routing
  ├── report/PDF delivery APIs
  ├── workspace retention/recovery/deletion
  │
  ├────────► SUPABASE
  │          Reusable Company Workspace
  │          AES-256-GCM encrypted Company Data payload
  │
  ├────────► CLOUDFLARE WORKERS AI
  │          Explanation only; no applicability authority
  │
  ├────────► CLOUDFLARE REPORT-ID WORKER
  │          Durable Object / SQLite-backed global Report ID registry
  │
  └────────► GMAIL API
             Requested reports, reminders, deletion confirmations

GOVERNED SOURCE PLANE
  Google Drive + repository source-governance records
        │
        ▼
  controlled source-pack build / validation
        │
        ▼
  checked-in runtime RAG catalogues
```

The most important separation is:

| Responsibility | Authority |
|---|---|
| Company facts | Supplied by user and deterministically normalised |
| Applicability / governed product result | Deterministic Rule Engine |
| Missing-fact handling | Deterministic fail-closed logic |
| Permitted legal source scope | Deterministic decision contract |
| Evidence retrieval | Governed RAG, retrieval-only |
| Legal/operational wording | Explanation-only provider |
| Legal approval/certification | **Not provided by the product** |

---

## 3. Current product and release boundary

The root-level HTML/CSS/JavaScript application is the deployed frontend. The experimental `apps/web/src` React/TypeScript layer is not the supported deployed product.

Current package version on `main` is `0.20.4-prototype.1`.

The current Legal RAG architecture should be described using the latest main-integrated runtime/release baseline:

| Runtime control | Current baseline |
|---|---:|
| Callable legal profiles | 57 |
| Substantive profiles | 55 |
| Governance fallbacks | 2 |
| Active catalogues | 21 |
| Active catalogue legal-review state | `needs-legal-review` |

The two deliberately non-substantive boundaries are:

- **Wave 5J — Bonded and Forced Labour:** governance/research-only; live safeguarding, coercion, trafficking, confinement, violence, retaliation or rescue concerns remain human-only and outside normal RAG/provider handling.
- **Wave 5M — Multi-country Employment:** excluded from the current release; no country-pair, runtime catalogue, provider/browser path or production cross-border employment decision architecture is activated.

The current product is a **research-grade prototype**. Passing software tests does not convert a source, rule or catalogue into qualified legal approval.

---

## 4. Technology inventory and responsibility map

| Technology | Current role | What it must not become |
|---|---|---|
| GitHub repository | Source code, deterministic rules, schemas, governed catalogues, tests, architecture and release evidence | Secret store or customer workspace |
| GitHub Pages | Public static frontend | Privileged backend/database |
| Browser | User interaction, local PDF/report generation where implemented, temporary/resumable local state | Trusted secure database |
| Render | Private Node backend/API, secrets, orchestration and server-side integration boundary | Permanent filesystem system of record |
| Supabase Postgres | Reusable Company Workspace metadata + encrypted reusable Company Data | Direct browser-accessible customer table |
| Cloudflare Workers AI | Constrained explanation-only model provider | Legal/applicability decision engine |
| Cloudflare Worker + Durable Object | Persistent Report ID allocation and idempotency | Customer Company Workspace |
| Google Drive | Controlled legal/research source library and exact-file/source-governance workflow | Normal customer Company Workspace |
| Gmail API | Requested report delivery, internal notifications, retention/deletion notices | Primary customer database |
| GitHub Actions | CI, release tests, smoke checks, architecture/DR evidence | Substitute for production governance or legal review |

Two Cloudflare roles exist and must not be confused:

1. **Workers AI** — language generation after a deterministic decision and governed retrieval.
2. **Report ID Worker/Durable Object** — persistent non-resetting Report ID registry.

Neither role is the Supabase Company Workspace.

---

## 5. Data classification

Every new field or integration should first be assigned to a data class.

### Class A — Public / governed source material

Examples:

- legislation/guidance source identities;
- curated research excerpts;
- source registers and provenance metadata;
- public URLs;
- public product documentation.

This material is not customer Company Workspace data, but legal/source provenance must still be controlled because incorrect source classification can cause an incorrect explanation.

### Class B — Organisation-level customer data

Examples:

- company name;
- industry;
- employee/worker/contractor counts;
- operating state/location information;
- establishment/activity flags;
- work model;
- growth facts;
- structured HR/organisation context.

This is the core intended assessment data class.

### Class C — Personal contact data

Examples:

- name;
- email address;
- role/title;
- recipient address;
- recovery-related communication metadata.

This requires a defined purpose, retention and access boundary.

### Class D — Security credentials / restricted secrets

Examples:

- `SUPABASE_SERVICE_ROLE_KEY`;
- `WORKSPACE_ENCRYPTION_SECRET`;
- `WORKSPACE_RETENTION_SECRET`;
- Google OAuth client secret and Gmail refresh token;
- Cloudflare API token;
- `REPORT_ID_ALLOCATOR_SECRET`.

These must remain server-side and must never be written to browser code, reports, logs, repository files or user-visible diagnostics.

### Class E — Prohibited/high-risk case data for the normal product

The ordinary GrowWithHR assessment/provider path should not solicit or process unnecessary employee-level case material such as:

- medical records or detailed health narratives;
- payroll records/contribution bodies tied to named individuals;
- disciplinary/investigation evidence;
- grievance/complaint evidence and detailed case narratives;
- sexual-harassment complaint evidence;
- injury-causation files;
- bank details;
- identity documents;
- completed statutory forms/certificates;
- safeguarding/rescue evidence;
- immigration/tax case files.

If any future module genuinely requires such data, it needs a separately approved architecture, privacy assessment, legal basis, access model, retention policy and provider contract. It must not inherit approval from the current organisation-level architecture.

---

## 6. End-to-end data journeys

### 6.1 Standard assessment journey

```text
User enters organisation facts
  -> browser form state
  -> some progress may be written to localStorage
  -> deterministic frontend/backend processing depending on feature
  -> fixed findings / missing facts / recommendations
  -> optional server API calls for governed explanations or delivery
  -> report shown/downloaded
```

Important current fact: normal assessment/resume data stored in `localStorage` is ordinary JSON. GrowWithHR does **not** currently apply the Company Workspace AES layer to browser local storage.

### 6.2 Company Workspace creation

```text
Completed analysis
  -> server validates Report ID + email + request size
  -> backend creates Recovery Code
  -> backend hashes Recovery Code with SHA-256
  -> backend encrypts reusable Company Data with AES-256-GCM
  -> Supabase receives ciphertext + operational metadata
  -> raw Recovery Code returned to user
```

The Report ID is an identifier, not an authentication secret.

### 6.3 Company Workspace recovery

```text
Report ID + Workspace Recovery Code
  -> Render backend
  -> find workspace by Report ID history
  -> hash supplied Recovery Code
  -> timing-safe comparison with stored hash
  -> verify workspace is active and unexpired
  -> decrypt Company Data on backend
  -> return the authorised workspace payload
```

A Report ID alone must never unlock Company Data.

### 6.4 Cross-tool workspace handoff

A recovered workspace can be passed to another GrowWithHR intelligence route without placing the Recovery Code in a normal URL.

Current implementation:

- generates a cryptographically random 32-byte token;
- stores the temporary handoff in Render process memory;
- stores the recovered workspace and Recovery Code/access key in that temporary memory object;
- expires after five minutes;
- deletes the token after successful redemption;
- responds with `no-store`/`no-cache` headers;
- is lost if the Render process restarts/deploys.

This is intentionally transient, but it is not an enterprise distributed-session store.

### 6.5 Deterministic legal explanation journey

```text
Allow-listed assessment subset
  -> deterministic fact mapper
  -> deterministic legal rule
  -> immutable decision + reason code + source allow-list
  -> legal RAG profile/catalogue selection
  -> governed lexical/hybrid retrieval
  -> retrieval fingerprint + cited governed chunks
  -> explanation contract builder
  -> Cloudflare Workers AI (when configured)
  -> strict structured-response validation
  -> user explanation
```

The model does not receive authority to infer missing company facts or alter the decision.

### 6.6 Operational explanation journey

Operational recommendations use a separate provider-neutral contract. A deterministic operational recommendation must already exist. The provider receives a fixed recommendation reference and governed official guidance references and must preserve the operational status, reason code and recommendation fingerprint.

The same principle applies:

> The provider explains a deterministic recommendation; it does not create the recommendation.

### 6.7 Report ID and report generation journey

```text
Browser requests Report ID
  -> Render `/api/report-id`
  -> Render hashes request/user/company/assessment identifiers
  -> authenticated server-to-server call to Cloudflare Worker
  -> named ReportIdRegistry Durable Object
  -> SQLite-backed durable transaction
  -> unique global Report ID returned
  -> report/PDF is rendered using that reserved ID
```

Only hashed identifier values are intentionally sent to the Report ID Worker. The allocator secret remains server-side.

### 6.8 Email delivery journey

```text
Report/PDF + validated recipient
  -> Render
  -> PDF signature/size/basic format validation
  -> Gmail API using server-side OAuth refresh token
  -> recipient mailbox
  -> optional internal notification mailbox
```

The Gmail layer is a separate retention location. Deleting a Supabase workspace does not recall an email already sent to Gmail or a recipient.

### 6.9 Retention/deletion journey

```text
Latest completed intelligence analysis
  -> expiry = +6 calendar months
  -> reminder due ≈ 7 days before expiry
  -> hourly/startup/external retention sweep
  -> reminder email when configured
  -> expiry or protected user deletion request
  -> active workspace sanitised and marked deleted
  -> deletion confirmation attempted
  -> email metadata cleared after confirmation is successfully sent
```

The six-month period is a GrowWithHR product policy, not a statement that law requires six months.

---

## 7. Deterministic Rule Engine

The Rule Engine is software logic, not generative AI.

A governed rule should define at least:

1. required facts;
2. normalisation rules;
3. conditions/operators;
4. controlled outcome states;
5. reason codes;
6. missing-fact behaviour;
7. allowed source identities;
8. limitations and next action;
9. rule/version identity; and
10. regression/boundary scenarios.

### 7.1 Determinism

The same valid facts processed by the same rule version should produce the same product decision.

Examples of deterministic operations include:

- numeric thresholds;
- exact category mapping;
- controlled jurisdiction/state checks;
- establishment/activity flags;
- explicitly versioned condition trees.

AI is not asked to decide whether `25 >= 10`, guess a missing operating state or turn ambiguous text into a hidden legal conclusion.

### 7.2 Fail-closed missing facts

If a required fact is absent, the expected result is a controlled state such as:

```text
more-information-needed
```

not a model-generated assumption.

### 7.3 Decision fingerprints and traceability

The Legal RAG/explanation architecture binds provider input/output to immutable decision references and fingerprints. Retrieval and provider output are checked against the deterministic status/reason code rather than trusted by default.

### 7.4 Maturity does not equal determinism

A deterministic rule can still be:

- provisional;
- research-grade;
- conservative;
- based on a governed secondary-research basis;
- awaiting qualified legal review.

Deterministic software behaviour must not be marketed as legal approval.

---

## 8. Legal RAG architecture and boundaries

### 8.1 RAG is downstream of the decision

GrowWithHR's intended Legal RAG sequence is:

```text
facts -> rule -> decision -> source scope -> retrieval -> explanation
```

not:

```text
documents -> model -> model chooses applicable law
```

### 8.2 What retrieval is allowed to do

Retrieval may:

- load a governed catalogue declared by the runtime registry;
- filter by Source Register IDs already permitted by the deterministic result;
- filter by allowed reason-code scope;
- rank permitted chunks;
- return source title, section/page/reference, official URL where governed, text and content fingerprints;
- create an immutable retrieval trace for explanation/citation.

### 8.3 What retrieval may not do

Retrieval must not:

- invent or repair assessment facts;
- choose jurisdiction independently;
- decide legal applicability;
- change the deterministic status or reason code;
- expand the source allow-list;
- promote draft/research material to operative law;
- turn a source file into legal approval;
- certify compliance.

Post-retrieval controls reject source-scope expansion, reason-code expansion, duplicate/ungoverned chunks and content-fingerprint drift.

### 8.4 Retrieval adapters

The shared architecture supports:

- a deterministic lexical baseline; and
- a deterministic local hybrid/sparse similarity mode.

The current hybrid design does not require an external embedding provider, vector database or second model provider. Introducing those later would be a new data flow and requires architecture/privacy review.

### 8.5 Catalogue loading

Catalogue paths must be repository-declared and relative. Path traversal and unsafe absolute paths are rejected. Runtime catalogues are fingerprinted and validated before use. An active profile whose catalogue is unavailable should fail closed rather than silently use arbitrary material.

---

## 9. Source governance and Google Drive

Google Drive is part of the **legal/research source-governance plane**, not the ordinary Company Workspace.

The controlled source workflow can contain:

- official source PDFs where acquired;
- source identity/register records;
- controlled source paths/Drive identities;
- SHA-256/byte length/page count for exact files where available;
- portal/register identities where a stable file does not exist;
- secondary-research provenance;
- draft/guidance/research classifications;
- legal-review status;
- exact-file reconciliation records.

Current source-governance evidence includes a 31-file exact-file reconciliation recorded in the controlled Source Register workflow, with one quarantined duplicate anomaly. That evidence is supplementary for the prototype; the runtime was not automatically migrated to those exact-file hashes merely because the files exist.

The source-pack builder deliberately does **not**:

- crawl arbitrary Drive contents at runtime;
- auto-download every law and treat it as approved;
- OCR/interpret arbitrary PDFs into obligations;
- infer legal meaning from file names;
- approve legal mappings;
- activate a feature merely because a source was acquired.

The production-hardening path should ultimately bind every production legal conclusion to appropriately reviewed authoritative source identity/section mapping and documented qualified legal approval where the commercial product intends to rely on that conclusion.

---

## 10. AI boundaries

### 10.1 Legal explanation provider

The legal explanation contract sets, among other controls:

```text
providerRole = explanation-only
usedForDecision = false
mayChangeDecision = false
applicabilityAuthority = none
legalAdvice = false
```

Raw request keys such as these are forbidden from the protected Cloudflare Workers AI request:

- `answers`
- `assessmentAnswers`
- `rawAnswers`
- `facts`
- `mappedFacts`
- `evidence`

The provider receives the fixed decision reference and governed retrieved legal source chunks required to explain it. It must not receive an uncontrolled dump of the user's complete assessment.

### 10.2 Current provider implementation

The current Cloudflare adapter uses the approved Workers AI model configured in code and constrains generation with structured JSON output, low-variance generation settings, request-size limits and timeout handling. Provider identity/model can change in future, but the authority boundary must not change merely because a different model is used.

### 10.3 Response validation

The model output is not trusted just because it is JSON. Validation checks protected fields including:

- contract version;
- decision fingerprint;
- status;
- reason code;
- legal-review status;
- citation chunk IDs;
- required limitations;
- no decision authority;
- no legal-advice authority;
- forbidden definitive/certification wording.

Unknown citation chunks are rejected.

### 10.4 AI failure

If the provider is unavailable, the underlying deterministic decision must remain available and unchanged. AI availability is not allowed to become a dependency for the legal decision itself.

### 10.5 Future AI change-control rule

Any future provider/model, embedding service, vector database, agent or external tool must answer these questions before activation:

1. What exact data leaves GrowWithHR?
2. Is any personal/customer data included?
3. Is the provider allowed to train on or retain it?
4. What region/processors are involved?
5. Can the provider mutate a deterministic decision?
6. How is output validated?
7. What is the failure/fallback path?
8. What contract/DPA/subprocessor disclosure is required?

No provider change should silently expand data or authority scope.

---

## 11. Browser storage

Normal assessment progress can be stored in browser `localStorage` as plain JSON.

### Current benefits

- simple resume experience;
- no server database required for every partial assessment;
- low infrastructure cost.

### Current limitations

- no GrowWithHR AES application-encryption layer;
- JavaScript running in the same origin can access it;
- data can remain on the device after server-side workspace deletion;
- browser/device compromise, malicious extensions or XSS can expose it;
- browser retention does not automatically follow the six-month server Workspace policy.

### Enterprise target

- minimise what is persisted client-side;
- prefer in-memory/session-scoped state for data that need not survive a browser restart;
- explicitly clear stale assessment/report/contact state;
- establish a client-side retention contract;
- adopt a restrictive Content Security Policy and modern browser security headers;
- eliminate inline/eval patterns that block strong CSP;
- do not introduce client-side encryption as a cosmetic control if the decryption key must be shipped in the same JavaScript bundle.

For higher assurance, sensitive resumable state should move to an authenticated server-side session/workspace rather than pretending browser-side encryption solves endpoint compromise.

---

## 12. Render: private backend boundary

Render currently hosts the Node backend and integration boundary.

Key responsibilities include:

- Company Workspace create/recover/complete/delete;
- retention scheduler and protected external retention trigger;
- temporary workspace handoff;
- Legal RAG/explanation routing;
- operational explanation routing;
- Report ID mediation;
- PDF/report email delivery;
- Gmail OAuth usage;
- server-side secrets and service credentials;
- CORS enforcement around intercepted API routes.

### Important design note

`server-entry.js` wraps the Node HTTP server and intercepts several API routes before handing control to the Express application in `server.js`. This preserves current contracts but is unconventional middleware architecture.

Enterprise hardening should move sensitive routes behind one explicit, consistently instrumented HTTP framework/middleware stack so that authentication, rate limiting, request IDs, security headers, audit controls and error sanitisation cannot accidentally apply to one route family but not another.

### Render filesystem

Render's local filesystem must not be treated as durable customer storage. The current production Report ID architecture correctly avoids depending on Render's ephemeral filesystem and uses a Cloudflare Durable Object instead.

---

## 13. Supabase Company Workspace

### 13.1 Purpose

Supabase stores reusable Company Workspace state so a user can return and reuse organisation information in another GrowWithHR intelligence analysis.

### 13.2 Current schema

The `public.company_workspaces` table contains fields including:

- internal UUID;
- current Report ID;
- historical Report IDs;
- Recovery Code/access-key hash;
- email;
- company name;
- encrypted Company Data;
- completed intelligence engines;
- creation/update/last-analysis timestamps;
- expiry/reminder timestamps;
- deletion timestamps;
- workspace status.

### 13.3 Live infrastructure verification — 20 August 2026

The connected GrowWithHR Supabase project is currently:

- status: active/healthy;
- region: **`ap-northeast-2` (Seoul, South Korea)**;
- `company_workspaces`: RLS enabled;
- client RLS policies: none;
- `anon` and `authenticated`: standard table privileges still present;
- normal client access remains denied by RLS because no allowing policy exists.

The no-policy posture is intentional for a server-only table, but the remaining `anon`/`authenticated` grants are unnecessary for this design and should be revoked as defence in depth.

The Supabase advisor's `RLS enabled, no policy` informational notice is therefore expected for this server-only table; it should not be “fixed” by adding an allow policy. The stronger fix is to retain no client policy **and** remove unnecessary client-role grants.

### 13.4 Service role

The backend uses `SUPABASE_SERVICE_ROLE_KEY` server-side. It must never be exposed to browser JavaScript.

Because a service role bypasses ordinary RLS, server-side authorization and endpoint security are critical. RLS is not a substitute for protecting the service-role credential.

---

## 14. Application encryption and hashing

### 14.1 Reusable Company Data

GrowWithHR encrypts the large reusable Company Data JSON payload **before** writing it to Supabase.

Current implementation:

- algorithm: `AES-256-GCM`;
- random IV: 12 bytes per encryption;
- authentication tag included;
- ciphertext/IV/tag encoded into a versioned storage string;
- key derived from a server-side secret using SHA-256 over a domain-separated input.

AES-GCM provides confidentiality and authenticated integrity for the encrypted payload.

### 14.2 Encryption secret

Preferred secret:

```text
WORKSPACE_ENCRYPTION_SECRET
```

Current code permits fallback to:

```text
REPORT_ID_ALLOCATOR_SECRET
```

if the dedicated encryption secret is absent.

That fallback is a prototype convenience and an enterprise security debt. Production should fail closed if a dedicated high-entropy workspace encryption key is not configured.

### 14.3 Recovery Code

The raw Workspace Recovery Code is not deliberately stored in Supabase. A domain-separated SHA-256 hash is stored and compared using timing-safe comparison.

A one-way hash is appropriate here because GrowWithHR only needs to verify the code, not recover it from the database.

### 14.4 Metadata not covered by the AES payload

Not all Supabase columns receive the application-level AES wrapper. Examples include:

- email;
- company name;
- Report IDs;
- timestamps;
- status fields.

This is an explicit current limitation. Infrastructure encryption at rest is not the same as application-level field encryption.

### 14.5 Enterprise key-management target

Move from a single static application-secret model to a documented key lifecycle:

- dedicated key per purpose;
- key version stored with ciphertext;
- managed KMS/HSM-backed root key where commercially justified;
- envelope encryption for customer payloads;
- planned rotation without data loss;
- old-key decrypt/new-key re-encrypt workflow;
- emergency key revocation;
- separation of duties;
- restricted key administration;
- key-use audit trail;
- tested recovery of key material under disaster recovery controls.

Never rotate an encryption key without a migration plan for existing ciphertext.

---

## 15. Workspace recovery security model

Current recovery is a **possession-based continuity mechanism**, not a full identity platform.

Required factors:

```text
Report ID + Workspace Recovery Code
```

Controls already present:

- Report ID syntax validation;
- strong random Recovery Code generation;
- hashed code at rest;
- timing-safe comparison;
- active/expiry checks;
- request-size limits;
- one-time short-lived handoff token for cross-tool continuation.

Limitations:

- no conventional authenticated account proving person/organisation identity;
- no MFA/passkey;
- no RBAC/team model;
- sensitive workspace routes are intercepted before the Express email limiter and therefore need their own explicit throttling/gateway controls;
- no account-based recovery if the Recovery Code is lost;
- distributed Render instances cannot share the current in-memory handoff map;
- process restart invalidates handoff state.

Enterprise recovery should be tied to authenticated identity and tenant authorization, with the Recovery Code retained only if there is a clear product need for it.

---

## 16. Report ID architecture

Report IDs provide durable report identity and lineage. They are **not passwords**.

Current production path:

```text
Browser
 -> Render `/api/report-id`
 -> hash request/user/company/assessment identity inputs
 -> authenticated Cloudflare Worker call
 -> one named ReportIdRegistry Durable Object
 -> SQLite-backed durable state
```

Important properties:

- global non-resetting sequence;
- issued IDs not deliberately recycled;
- unique request-key hash supports idempotent retry;
- sequence allocation + insert + sequence update occur atomically;
- browser never sees `REPORT_ID_ALLOCATOR_SECRET`;
- live production must not silently fall back to Render's ephemeral local JSON registry.

Report-ID persistence is intentionally separable from customer Company Workspace persistence.

---

## 17. Gmail and report delivery

### 17.1 Current Gmail integration

Render uses Gmail API OAuth credentials stored in the server environment:

- `GMAIL_USER`;
- `GOOGLE_CLIENT_ID`;
- `GOOGLE_CLIENT_SECRET`;
- `GOOGLE_REFRESH_TOKEN`.

The same Gmail integration is used for report delivery and Company Workspace retention/deletion notifications when configured.

### 17.2 Current delivery controls

The report delivery endpoint includes controls such as:

- recipient email validation;
- PDF base64 validation;
- `%PDF-` signature check;
- maximum PDF size;
- rate limiting on the Express report-email route;
- server-side OAuth credentials.

### 17.3 Gmail is a separate copy/retention domain

A sent report may exist in:

- the sending Gmail account;
- the recipient's mailbox;
- forwarding/archive systems controlled by the recipient;
- provider backups according to provider lifecycle.

Supabase deletion cannot erase those copies.

### 17.4 Current logging concern

The existing report email path logs recipient email addresses during delivery attempts/success. That is operationally convenient but means personal data can appear in Render logs.

Enterprise hardening should replace raw recipient logging with an opaque request ID or salted/controlled hash and establish log retention/access rules.

### 17.5 Enterprise delivery target

- dedicated service mailbox rather than personal operational dependency;
- least-privilege OAuth scope;
- controlled mailbox admins and access reviews;
- explicit sent-item/report retention policy;
- token rotation/offboarding runbook;
- delivery audit record separated from email body/attachment;
- deletion workflow that distinguishes GrowWithHR-controlled copies from recipient-controlled copies;
- DPA/subprocessor documentation for mail processing.

---

## 18. Retention and deletion semantics

### 18.1 Company Workspace policy

Current reusable-workspace policy:

- expiry: six calendar months after the latest completed intelligence analysis;
- expiry resets when another analysis is completed using the workspace;
- reminder: approximately seven days before expiry;
- early deletion: available through the protected workspace flow.

### 18.2 Scheduler implementation

Current backend behavior includes:

- startup sweep shortly after process launch;
- hourly in-process sweep;
- maximum batch size of 100 rows per sweep;
- protected external retention endpoint using `WORKSPACE_RETENTION_SECRET`.

The `.env.example` correctly recommends an external scheduler for production reliability.

Enterprise production should make the external/durable scheduler mandatory. Render process sleep/restart/deploy must not be able to indefinitely postpone privacy deletion.

### 18.3 What workspace deletion does today

Deletion is a **sanitisation/tombstone** flow rather than immediate physical row deletion.

It currently clears/replaces key reusable data including:

- encrypted Company Data -> encrypted empty object;
- Recovery Code hash -> empty;
- completed-engine list -> empty;
- company name -> empty;
- status -> `deleted`;
- deletion timestamps -> recorded.

Email is retained temporarily so the deletion confirmation can be retried. After successful confirmation, the email column is cleared.

### 18.4 Important deletion gaps/decisions

- A failed deletion-confirmation mail can cause email metadata to remain for retry; define a maximum retry/retention window and a final purge rule.
- Report IDs may remain as operational identity/tombstone records; document the specific retention purpose and period.
- Browser `localStorage` is not erased by server-side workspace deletion.
- Sent Gmail/recipient copies are not erased by Supabase deletion.
- Provider backups may retain historical copies until their controlled backup lifecycle expires.

The product must never promise “all copies disappear instantly everywhere.”

### 18.5 Enterprise deletion ledger

Introduce a deletion ledger that records, without retaining the deleted payload:

- deletion request/source;
- affected data locations;
- execution timestamps;
- success/failure per system;
- retry state;
- backup ageing statement where applicable;
- final completion status;
- legal hold exception if any;
- minimal immutable audit identifier.

---

## 19. Logs, monitoring and telemetry

### 19.1 M7 monitoring contract

The M7 design intentionally records only bounded operational measurements such as:

- operation name;
- duration;
- success/failure;
- bounded result code;
- timestamp/percentiles.

It does not need raw assessment bodies, evidence, prompts or credentials.

Current M7 metrics are process-local. Horizontally scaled enterprise production needs a central approved metrics/logging service using the same minimal-data contract.

### 19.2 Logging rules

Never deliberately log:

- Supabase service-role key;
- workspace encryption secret;
- Report ID allocator secret;
- Google OAuth client secret;
- Gmail refresh token;
- Cloudflare API token;
- plaintext Recovery Code;
- decrypted Company Data;
- raw medical/payroll/case/evidence payloads;
- full PDFs unless a controlled forensic procedure explicitly requires it.

Prefer:

- request/trace ID;
- tenant ID;
- hashed/opaque user identifier;
- endpoint/action;
- bounded reason/error code;
- latency;
- provider status;
- no raw payload.

### 19.3 Audit logging is not yet enterprise-complete

The current product has engineering/release evidence, but not a full customer/administrator audit trail for every privileged action. Enterprise mode needs append-only security/audit events for login, tenant access, recovery, data export, deletion, role change, provider configuration and administrative access.

---

## 20. CORS, HTTP and abuse boundaries

`server-entry.js` applies an explicit origin allowlist to API requests. The default production GitHub origin is allowed and additional origins can be configured by `ALLOWED_CORS_ORIGINS`.

CORS is useful browser isolation but **is not authentication**. An attacker can send direct HTTP requests outside a browser.

Current controls include request-size limits and rate limiting on the Express report-email route. Sensitive intercepted route families such as Company Workspace recovery must receive explicit shared rate limiting rather than assuming an Express limiter lower in the stack covers them.

Enterprise target controls:

- edge/WAF rate limiting;
- per-IP and per-tenant limits;
- recovery attempt counters and exponential backoff;
- bot/abuse controls where appropriate;
- consistent request ID propagation;
- strict HTTP security headers;
- method/content-type validation;
- CSRF analysis for any future cookie-authenticated routes;
- idempotency keys for mutating operations;
- central denial/abuse telemetry.

---

## 21. Current deployment and release path

### Public frontend

GitHub Pages serves the public static experience from the repository.

### Backend

Render runs `node server-entry.js`, which installs API routing/CORS/retention behavior and then starts the Express server.

### Live validation

The repository includes a `Live Release Smoke` workflow that checks, after `main` changes:

- GitHub Pages version availability;
- founder report route;
- Render homepage/report route;
- durable Cloudflare Report ID status;
- Legal RAG status.

Smoke success is useful deployment evidence, but it is not a penetration test, privacy audit or visual/legal review.

### Release-governance risk

Some repository documents describe earlier prototype counts/versions because they are historical snapshots. `package.json`, release evidence and the effective runtime should be reconciled into consistent “current” documentation before enterprise due diligence. Documentation drift is a governance risk because buyers can receive contradictory architecture claims even when code is correct.

---

## 22. Data-location map

| Data / artefact | Current primary location | GrowWithHR application encryption | Retention/control note |
|---|---|---|---|
| In-progress assessment state | Browser `localStorage` | No | Device/browser persistence; must be explicitly minimised/cleared |
| Contact/lead state during flow | Browser and delivery payload as applicable | No browser AES | Purpose/retention must be explicit |
| Reusable Company Data | Supabase | AES-256-GCM before storage | Six-month workspace policy |
| Company Workspace email | Supabase metadata | Not separately AES-wrapped | Cleared after deletion confirmation success |
| Company Workspace company name | Supabase metadata | Not separately AES-wrapped | Cleared during workspace deletion |
| Recovery Code | User possession / transient authorized flow | N/A | Raw code not deliberately persisted in DB |
| Recovery Code hash | Supabase | SHA-256 one-way hash | Cleared on deletion |
| Report IDs | Supabase/Cloudflare/report output | Not secret | Operational identity; retention purpose must be documented |
| Report-ID identity hashes | Cloudflare Durable Object | One-way hashes | Durable idempotency/registry |
| Temporary handoff | Render process memory | Process-memory protection only | One-time, five minutes, restart-sensitive |
| Governed legal source masters | Google Drive/source-governance workspace | Source material, not customer payload | Controlled research/source lifecycle |
| Runtime RAG catalogues | GitHub/repository/runtime | Not customer data | Fingerprinted governed content |
| Legal AI request | Cloudflare Workers AI | TLS in transit; provider controls at provider | Constrained decision + governed source chunks, not raw answer dump |
| Report PDF before email | Browser/Render request path as implemented | No universal app-level encryption | Short-lived delivery payload; avoid logging |
| Sent report | Gmail + recipient | Mail-provider controls | Separate retention domain |
| Source code/rules/tests | Public GitHub repository | Public by design | Never store secrets/customer payloads |

---

## 23. Trust boundaries

### Boundary A — user device -> public frontend/backend

Required controls:

- TLS;
- data minimisation;
- secure browser code/CSP;
- input validation;
- explicit privacy notice;
- no sensitive case-data solicitation;
- authenticated sessions for future enterprise mode.

### Boundary B — Render -> Supabase

Required controls:

- TLS;
- service-role secret server-only;
- application encryption for reusable sensitive payloads;
- least database privilege;
- RLS/no client policy;
- tenant authorization before any future multi-tenant query;
- database audit/backup controls.

### Boundary C — deterministic decision -> RAG

Required controls:

- decision exists first;
- reason/status immutable;
- exact source allow-list;
- missing facts not repaired;
- no source-scope expansion.

### Boundary D — RAG -> AI provider

Required controls:

- protected request contract;
- raw assessment keys prohibited for legal provider;
- bounded source chunks;
- no authority to change decision;
- strict response validation;
- provider retention/training/region terms reviewed.

### Boundary E — Render -> Cloudflare Report ID registry

Required controls:

- TLS;
- server-to-server secret;
- hashed identity fields;
- idempotency;
- durable atomic allocation;
- no customer Company Data.

### Boundary F — Render -> Gmail

Required controls:

- deliberate delivery action;
- recipient validation;
- least-privilege OAuth;
- mailbox/admin controls;
- explicit mail retention;
- no unnecessary internal notification content.

### Boundary G — source governance -> runtime catalogue

Required controls:

- source identity/provenance classification;
- controlled manifest;
- curated chunks;
- fingerprint checks;
- legal-review status;
- publication gate;
- no automatic “file exists -> law approved” transition.

---

## 24. DPDP Act and Rules readiness

### 24.1 Current legal-timeline snapshot

India's Digital Personal Data Protection Act, 2023 and Digital Personal Data Protection Rules, 2025 have a phased commencement.

As of **20 August 2026**:

- provisions brought into force on publication under G.S.R. 843(E) are already effective;
- section 6(9) and section 27(1)(d) are scheduled one year after the 13 November 2025 Gazette publication;
- the core operational Act provisions listed in G.S.R. 843(E), including sections 3–5, most of section 6, sections 7–17 and other listed provisions, are scheduled eighteen months after publication;
- Rules 1, 2 and 17–21 commenced on publication under G.S.R. 846(E);
- Rule 4 is scheduled one year after publication;
- Rules 3, 5–16, 22 and 23 are scheduled eighteen months after publication.

GrowWithHR should design to the **full target operating standard now**, rather than waiting for the last commencement date.

Primary official references:

- DPDP Act commencement notification, G.S.R. 843(E): <https://egazette.gov.in/WriteReadData/2025/267647.pdf>
- MeitY DPDP Rules 2025 page: <https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa>
- DPDP Rules 2025, G.S.R. 846(E): <https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf>

This repository should not give legal advice about exact statutory applicability. Qualified Indian privacy counsel should confirm role allocation, notices, lawful processing, contracts, breach obligations, rights handling and cross-border strategy for the final operating model.

### 24.2 Likely role allocation

Depending on the specific customer relationship:

- where HRTechify/GrowWithHR determines the purpose and means of processing direct-user personal data, it may act as the **Data Fiduciary**;
- an infrastructure/SaaS provider processing data on GrowWithHR's instructions may operate as a processor/subprocessor under the relevant contractual relationship;
- in enterprise B2B deployments, the customer may determine purposes for some processing and GrowWithHR may process on the customer's behalf for those activities;
- GrowWithHR can simultaneously have its own fiduciary/controller-like purposes for account security, billing, abuse prevention or direct communications depending on the design.

Roles must be written into the actual contract/data-processing agreement; they cannot be inferred merely from the vendor name.

### 24.3 HRTechify responsibilities that cannot be outsourced

Even when infrastructure vendors provide strong security, HRTechify/GrowWithHR remains responsible for product-level choices such as:

- what data the product asks for;
- whether collection is necessary for the stated purpose;
- privacy notices/consent or other permitted processing basis where applicable;
- processor selection and contracts;
- authorization design;
- encryption and secret management decisions;
- retention/deletion policy;
- data-principal/customer request handling;
- breach detection/response process;
- vendor/subprocessor governance;
- cross-border/data-residency decisions;
- accuracy of product/security/privacy claims.

Provider certification does not automatically certify GrowWithHR.

### 24.4 Target DPDP operating capabilities

Before the substantive regime becomes fully operational for the product, implement and evidence:

- processing/data inventory;
- purpose and lawful-basis/consent mapping where applicable;
- clear notices;
- consent withdrawal/rights routes where applicable;
- data minimisation;
- processor/subprocessor register and contracts;
- reasonable technical and organisational security safeguards;
- breach detection, triage, notification decision process and evidence;
- retention/erasure schedules per data category;
- grievance/contact route;
- data-principal request workflow;
- child-data decision (ideally prohibit child-user data unless deliberately supported);
- cross-border transfer/residency assessment;
- privacy-by-design review for each new intelligence module;
- documented governance owner and periodic review.

Do not claim “DPDP certified.”

---

## 25. Shared-responsibility matrix

| Control area | Primary responsibility |
|---|---|
| Assessment questions/data minimisation | HRTechify/GrowWithHR |
| Frontend/browser code | HRTechify/GrowWithHR |
| Rule correctness/product mapping | HRTechify/GrowWithHR + qualified domain/legal review as required |
| RAG source governance | HRTechify/GrowWithHR + qualified source/legal review as required |
| AI request minimisation/authority contract | HRTechify/GrowWithHR |
| Supabase physical platform | Supabase under its service responsibility |
| Supabase schema/RLS/grants/service-role use | HRTechify/GrowWithHR |
| Render physical platform | Render under its service responsibility |
| Render application configuration/secrets/routes | HRTechify/GrowWithHR |
| Cloudflare physical/service platform | Cloudflare under its service responsibility |
| Workers AI input/output governance | HRTechify/GrowWithHR |
| Report ID Durable Object logic | HRTechify/GrowWithHR on Cloudflare platform |
| Google Drive account/source library governance | HRTechify/GrowWithHR + Google service boundary |
| Gmail mailbox/OAuth/retention | HRTechify/GrowWithHR + Google service boundary |
| GitHub repository/branch/release governance | HRTechify/GrowWithHR + GitHub service boundary |
| User endpoint/device security | Shared with user/device environment |
| DPDP/legal compliance of GrowWithHR processing | HRTechify/GrowWithHR, supported by qualified counsel |

---

## 26. Current security strengths

Meaningful controls already implemented include:

- deterministic decision authority for governed legal applicability;
- fail-closed missing facts;
- retrieval only after decision;
- source/reason-code allow-lists;
- fingerprinted governed retrieval/citations;
- AI explanation-only contract;
- provider output validation;
- raw legal-assessment keys prohibited from the Cloudflare legal provider request;
- research/legal-review limitations carried into provider output;
- AES-256-GCM Company Data encryption before Supabase persistence;
- hashed Recovery Code;
- timing-safe Recovery Code verification;
- server-only Supabase service role;
- RLS enabled/no browser policy for Company Workspace;
- explicit CORS allowlist;
- HTTPS network paths;
- request-size limits;
- five-minute one-time handoff token;
- durable Cloudflare Report ID registry rather than Render ephemeral disk;
- six-month workspace retention policy;
- reminder/deletion/confirmation workflow;
- source provenance and catalogue build gates;
- extensive deterministic/RAG/contract/release tests;
- executable M7 technical DR drill;
- explicit prototype/no-certification claims.

These are real controls. They should be preserved during refactoring.

---

## 27. Current risks and gaps

The following are current architecture/governance risks, not hypothetical marketing caveats.

| Priority | Risk | Why it matters | Recommended control |
|---|---|---|---|
| P0/P1 | Plaintext browser `localStorage` | XSS/device/extension exposure; server deletion does not clear device copy | Minimise/expire state, strong CSP, migrate sensitive resumable state to authenticated server session |
| P0/P1 | No enterprise user/tenant IAM | Report ID + Recovery Code proves possession, not organisation identity or role | Accounts, MFA/passkeys, tenant membership, RBAC, SSO/OIDC/SAML |
| P0/P1 | Recovery routes lack explicit shared throttling | Brute-force/abuse control should not depend on Express email limiter | Edge + route-specific rate limits, failed-attempt counters, backoff and alerting |
| P0/P1 | Encryption secret fallback | Couples two security purposes and can hide missing key config | Mandatory dedicated high-entropy key; fail startup closed |
| P1 | No mature key rotation/KMS lifecycle | Static secret compromise has broad impact | Key versioning, envelope encryption/KMS, rotation/re-encryption drills |
| P1 | Supabase client grants remain | RLS is current denial layer, but grants are unnecessary | Revoke `anon`/`authenticated` privileges on server-only tables |
| P1 | Email/company metadata not application-encrypted | DB/service-role compromise can expose identifiers | Field-by-field minimisation/tokenisation/encryption decision |
| P1 | Raw recipient email in server logs | Personal data can persist in log system beyond intended business purpose | Log opaque IDs/hashes; define log access/retention |
| P1 | Retention relies partly on process-local scheduler | Sleep/restart/deploy can delay deletion; batch cap can create backlog | Mandatory external/durable scheduler, backlog metrics, alerts |
| P1 | Deletion confirmation can retain email until successful send | Failed mail can prolong metadata retention | Maximum retry window + final purge policy independent of email success |
| P1 | Gmail/recipient copies outlive workspace | Workspace deletion is not global deletion | Formal mail/report retention and clear deletion disclosure |
| P1 | Database region is Seoul | Enterprise residency/procurement/cross-border questions | Deliberate India-region/residency strategy and contractual disclosure |
| P1 | In-memory handoff is instance-local | Deploy/restart loses handoff; not horizontally scalable | Authenticated short-lived distributed store or signed exchange design |
| P1 | Public backend routing is split/intercept-based | Inconsistent middleware/security coverage risk | Consolidated explicit API middleware/gateway |
| P1 | Legal catalogues remain `needs-legal-review` | Engineering validation is not legal approval | Qualified legal/source review and production activation governance |
| P1 | Prototype source standard includes secondary research | Enterprise legal product may require stronger authoritative source assurance | Official-source/portal mapping, exact-file assurance where appropriate, counsel review |
| P2 | Process-local operational metrics | Multi-instance failures/abuse trends can be invisible | Central privacy-minimised telemetry/SIEM |
| P2 | No full customer/admin audit log | Enterprise investigation/access accountability limited | Immutable audit-event layer |
| P2 | No formal access-review programme | Secret/admin access can accumulate | Joiner/mover/leaver + quarterly privileged-access review |
| P2 | Documentation/version drift | Buyers/operators can rely on stale counts or claims | One generated architecture/release manifest; doc consistency CI |
| P2 | Provider/subprocessor governance incomplete | Cloud services create contractual/privacy dependencies | Vendor register, DPA review, assurance evidence, change process |
| P2 | DR is technical simulation, not production rollback proof | Repository drill does not prove real traffic/data restoration | Production restore/rollback exercises with measured RTO/RPO |
| P2 | No independent penetration test / formal assurance | Internal tests do not prove external attack resistance | Independent testing, vulnerability-management programme, assurance roadmap |

There is no basis in this architecture snapshot to claim that GrowWithHR is SOC 2 certified, ISO 27001 certified or independently DPDP certified.

---

## 28. Threat scenarios to design against

### Browser/XSS compromise

Impact: local assessment/contact/report state can be read; malicious API actions may be attempted.

Controls: CSP, dependency hygiene, output encoding, no dangerous inline script, client storage minimisation, secure auth/session model.

### Recovery-code brute force

Impact: unauthorised workspace recovery.

Controls: high-entropy code already exists; add route throttling, lockout/backoff, IP/tenant signals and alerting.

### Supabase service-role leak

Impact: broad database access bypassing RLS.

Controls: secret vaulting/rotation, least network/use scope, no logs, rapid revocation, field encryption, audit.

### Workspace encryption-key leak

Impact: encrypted Company Data can be decrypted if ciphertext is obtained.

Controls: dedicated KMS-managed/versioned keys, restricted access, rotation/re-encryption, incident runbook.

### AI prompt/provider failure

Impact: fabricated/unsafe explanation, outage or leakage if request boundary expands.

Controls: deterministic decision separation, strict input schema, source allow-list, output validation, provider DPA/retention review, fail closed.

### Source poisoning/misclassification

Impact: incorrect evidence/explanation despite correct rule.

Controls: controlled source manifests, fingerprints, provenance states, duplicate quarantine, review/activation gate.

### Stale legal source

Impact: explanation based on superseded/draft material.

Controls: explicit effective dates/lifecycle states, source review schedule, no inferred effective date, high-certainty gate.

### Retention scheduler failure

Impact: data remains beyond promised deletion date.

Controls: durable external scheduler, monitoring/SLO, backlog metrics, deletion ledger, independent sweeps.

### Gmail account compromise

Impact: sent reports/contact data exposed.

Controls: dedicated account, MFA, admin/access review, OAuth/token rotation, limited retention, anomaly alerting.

### Deployment/supply-chain compromise

Impact: malicious browser/server code can defeat application controls.

Controls: branch protection, code review, signed/provenanced builds where feasible, dependency scanning, least CI permissions, secret isolation, immutable release evidence.

---

## 29. Reliability, recovery and disaster recovery

### Current M7 technical drill

The repository can run an executable DR simulation that checks:

- frozen contract integrity;
- deterministic decision availability before RAG;
- legal explanation endpoint disablement without provider invocation;
- decision preservation when provider path is disabled;
- source-lifecycle fail-closed behavior;
- readiness contract limitations.

This is useful engineering assurance, but it is explicitly **not a production traffic rollback or database restore test**.

### Enterprise DR requirements

Define and approve:

- service inventory and dependency map;
- RTO per service;
- RPO per data store;
- Supabase restore procedure and restore testing;
- encryption-key recovery procedure;
- Cloudflare Report ID registry recovery/continuity plan;
- Render rollback/deployment recovery;
- Gmail/token reauthorization contingency;
- source-governance backup/restore;
- incident communication tree;
- periodic tabletop + live restore drills;
- evidence archive of results and corrective actions.

RTO/RPO should not be invented in documentation before the business owner approves them and tests demonstrate they are achievable.

---

## 30. Enterprise target architecture

A mature enterprise design should evolve toward:

```text
Enterprise user
  -> SSO/OIDC/SAML + MFA/passkey
  -> tenant-aware web application
  -> API gateway/WAF/rate limiting
  -> explicit backend service layer
       -> authorization policy/RBAC
       -> deterministic engines
       -> governed RAG
       -> AI gateway / provider adapter
       -> report service
       -> privacy/retention service
  -> India-aligned/contractually approved database region
       -> tenant-keyed schema
       -> least privilege
       -> field/envelope encryption via managed KMS
  -> durable job/scheduler service
  -> central privacy-minimised telemetry/audit
  -> controlled mail delivery
  -> governed source-management pipeline
```

Core properties:

- authenticated identity rather than possession-only access;
- explicit tenant boundary on every stored row/request;
- zero trust in client-supplied tenant IDs;
- managed key lifecycle;
- no sensitive browser persistence by default;
- durable background jobs;
- centralized audit/monitoring without raw customer payloads;
- documented vendor/subprocessor contracts;
- tested disaster recovery;
- independent security assurance.

---

## 31. Enterprise-hardening roadmap

### Phase 0 — documentation and configuration truth

Before new enterprise features:

1. make this document and one runtime/release manifest the current source of truth;
2. reconcile stale README/architecture counts/versions;
3. inventory every environment variable/secret owner and rotation date;
4. create the data/subprocessor register;
5. document current mail/log/browser retention;
6. record current Supabase grants/region/RLS as evidence.

**Exit:** no contradictory current architecture claims; complete data-location/vendor inventory.

### Phase 1 — immediate security/privacy hardening

1. implement restrictive CSP and browser security headers;
2. remove unnecessary persistent browser data and add explicit cleanup/expiry;
3. add recovery/workspace/API throttling at a shared gateway;
4. revoke unnecessary Supabase client-role grants;
5. require `WORKSPACE_ENCRYPTION_SECRET`; remove allocator-secret fallback;
6. mask/remove personal data from logs;
7. make external/durable retention scheduling mandatory;
8. define final email purge behavior even when deletion-confirmation delivery fails;
9. rotate and document all privileged secrets;
10. add automated secret/dependency/security scanning.

**Exit:** known P0/P1 prototype control gaps materially reduced.

### Phase 2 — identity, tenancy and authorization

1. introduce authenticated users;
2. MFA/passkeys;
3. organisation/tenant model;
4. RBAC and least-privilege admin roles;
5. SSO/OIDC/SAML for enterprise customers;
6. session expiry/revocation/device management;
7. tenant-owned Company Workspace schema;
8. append-only audit events;
9. privileged support-access workflow with approval and expiry.

**Exit:** enterprise access is identity/role based; Report ID/Recovery Code no longer acts as the primary authorization model.

### Phase 3 — cryptography and data-residency hardening

1. select approved production data region, including India residency option where commercially/legal appropriate;
2. introduce managed KMS/envelope encryption;
3. key versioning and rotation migration;
4. determine encryption/tokenisation for email/company metadata;
5. encrypted backup/restore controls;
6. key/secrets separation of duties;
7. formal cryptographic inventory.

**Exit:** key compromise blast radius and residency ambiguity materially reduced.

### Phase 4 — durable operations and observability

1. consolidate API middleware/security enforcement;
2. durable queue/scheduler for retention and asynchronous jobs;
3. central metrics/logging/SIEM with payload minimisation;
4. alerting for recovery abuse, provider failure, retention backlog and source integrity;
5. SLO/error-budget definitions;
6. production rollback and restoration drills;
7. measured RTO/RPO;
8. incident-response playbooks and exercises.

**Exit:** production operations no longer depend on one process's memory/timers and have measurable reliability/security evidence.

### Phase 5 — legal/source/AI production governance

1. qualified legal review of production legal rules;
2. authoritative source/section mapping appropriate to each legal family;
3. controlled source update/SLA process;
4. production source approval records;
5. AI provider DPA/retention/training/region review;
6. AI change-management and evaluation suite;
7. privacy review for each new model/data field;
8. formal “no decision mutation” production monitoring.

**Exit:** prototype research status is not being used as a substitute for production legal/source governance.

### Phase 6 — enterprise assurance

1. secure SDLC and change-control policy;
2. vulnerability-management programme;
3. independent penetration testing;
4. vendor risk programme and DPAs;
5. access reviews and administrator JML process;
6. business continuity programme;
7. privacy incident/breach exercises;
8. internal control evidence repository;
9. SOC 2/ISO 27001 readiness only if commercially justified;
10. external audit/certification only when scope and controls are actually ready.

**Exit:** enterprise claims are backed by independent assurance rather than provider badges.

---

## 32. Testing and evidence map

The repository already includes substantial automated checks. Important families include:

- baseline/assessment journeys;
- deterministic legal-rule assurance;
- legal-source governance/readiness;
- source-pack builder;
- Legal RAG runtime;
- retrieval adapters;
- catalogue loader;
- legal explanation contract/provider/router/client;
- all-laws runnable private-beta checks;
- operational explanation contract/provider/client;
- traceability;
- Company Workspace continuity/retention;
- server CORS;
- report/PDF/email presentation;
- M7 hardening/operational readiness/DR drill;
- release and end-to-end browser suites;
- post-merge live smoke.

Enterprise testing must add:

- authorization/tenant-isolation negative tests;
- recovery brute-force/rate-limit tests;
- CSP/XSS tests;
- secrets-leak/log-scrubbing tests;
- key rotation/re-encryption tests;
- Supabase privilege tests;
- deletion across all GrowWithHR-controlled stores;
- restore tests from backups;
- provider outage/timeout/invalid-output chaos tests;
- WAF/abuse tests;
- independent penetration testing.

---

## 33. Claims GrowWithHR can make today

A defensible technical description is:

> GrowWithHR uses deterministic rules for governed compliance applicability, controlled post-decision retrieval for supporting source context and AI only to explain already-fixed results. Reusable Company Workspace data is encrypted with AES-256-GCM before Supabase persistence, Recovery Codes are stored as hashes, privileged database/OAuth/provider credentials remain server-side, report identities use a durable Cloudflare registry and the reusable workspace has a defined retention/deletion lifecycle. The product remains a research-grade prototype with known enterprise-hardening work, including browser persistence, identity/RBAC, rate limiting, key management, metadata/log minimisation, data residency, email retention, production DR and independent security/legal assurance.

---

## 34. Claims GrowWithHR must not make today

Do not state or imply:

- “all user data is encrypted everywhere”;
- “no plaintext personal data exists”;
- “AI determines applicable law”;
- “RAG decides compliance”;
- “all legal sources are counsel approved”;
- “all active catalogues are legally approved”;
- “GrowWithHR certifies compliance”;
- “GrowWithHR provides legal advice”;
- “GrowWithHR is SOC 2 certified”;
- “GrowWithHR is ISO 27001 certified”;
- “GrowWithHR is DPDP certified”;
- “Supabase/Cloudflare/Google certification automatically certifies GrowWithHR”;
- “all customer data is stored in India”;
- “deletion instantly removes every backup, sent email and recipient copy”;
- “Report ID alone proves the user's identity”;
- “CORS is authentication.”

---

## 35. Operational checklists

### Before adding a new intelligence module

- [ ] List every new fact/data field.
- [ ] Classify each field and justify necessity.
- [ ] Define deterministic decision authority.
- [ ] Define missing-fact behavior.
- [ ] Define whether RAG is required.
- [ ] Define source allow-list/provenance and approval state.
- [ ] Define exact AI request schema, or confirm no AI is needed.
- [ ] Define persistence location and retention.
- [ ] Define deletion behavior.
- [ ] Perform privacy/security/legal review proportionate to the data/risk.
- [ ] Add regression/boundary tests.
- [ ] Update this architecture/data map.

### Before adding a new vendor

- [ ] Exact purpose/data categories.
- [ ] Region/subprocessors.
- [ ] Retention/deletion/training terms.
- [ ] Security assurance.
- [ ] DPA/contract.
- [ ] Least privilege/auth method.
- [ ] Exit/export/deletion plan.
- [ ] Incident notification terms.
- [ ] Update subprocessor register/privacy notice where required.

### Before changing AI/model/provider

- [ ] No expansion of decision authority.
- [ ] No expansion of raw data fields.
- [ ] Structured output contract still enforced.
- [ ] Citation/source validation remains.
- [ ] Provider failure does not change deterministic decision.
- [ ] Privacy/DPA/region reviewed.
- [ ] Regression evaluation passes on exact release SHA.

### Before enterprise launch

- [ ] P0/P1 hardening closed or explicitly risk-accepted.
- [ ] Auth/tenant/RBAC model active.
- [ ] India/data-residency decision approved.
- [ ] Managed key lifecycle implemented/tested.
- [ ] Retention/deletion ledger operational.
- [ ] DPDP readiness/legal review completed.
- [ ] Vendor/subprocessor DPAs completed.
- [ ] Incident/breach process tested.
- [ ] DR restore/rollback tested.
- [ ] Independent penetration test complete and critical/high issues closed.
- [ ] Security/privacy claims reviewed against implementation.

---

## 36. Architecture decisions that should remain explicit

These are not implementation accidents; they should require deliberate review to change:

1. **Deterministic rules remain the governed decision authority.**
2. **Missing facts are not silently invented.**
3. **RAG remains downstream and source-scoped.**
4. **AI remains explanation-only for governed legal decisions.**
5. **Sensitive case-level employee data remains outside the normal provider path.**
6. **Privileged credentials remain server-side.**
7. **Reusable sensitive Company Data is encrypted before persistence.**
8. **Report IDs are identifiers, not access credentials.**
9. **Google Drive source governance is separate from customer workspace storage.**
10. **Deletion is defined per data location, not as a vague global promise.**
11. **Security/provider certifications are not inherited product certifications.**
12. **Uncertainty/specialist review is an acceptable product result.**

---

## 37. Known architecture decisions still requiring business/legal approval

The following should not be solved only by code:

- final enterprise data-residency region;
- whether/when a conventional account model replaces possession-based Workspace recovery;
- enterprise retention periods by data category;
- how long Report ID/tombstone records are justified after deletion;
- Gmail/sent-report retention period;
- whether enterprise reports use Gmail or a dedicated transactional mail provider;
- production legal-review/approval authority;
- official-source assurance standard by legal family;
- whether any high-risk employee-level modules will ever be supported;
- RTO/RPO targets;
- white-label/tenant isolation model;
- SOC 2/ISO 27001 commercial priority;
- subprocessor contractual requirements;
- DPDP Data Fiduciary/Data Processor role split by customer contract.

These decisions need named owners and approval dates.

---

## 38. Maintenance rule for this document

Update this file whenever any of the following changes:

- deployed frontend/backend architecture;
- authentication/tenant model;
- assessment fields/data classification;
- browser persistence;
- database provider/schema/region;
- RLS/grants;
- encryption algorithm/key lifecycle;
- recovery method;
- retention/deletion period or process;
- mail/report provider;
- AI provider/model/request schema;
- RAG retriever/vector/embedding architecture;
- source-governance/Drive architecture;
- Cloudflare Worker/Durable Object responsibilities;
- legal-rule authority;
- DPDP/legal role allocation;
- subprocessor list;
- incident/DR architecture;
- certification/assurance status;
- current runtime profile/catalogue counts.

At minimum, review it before each externally described enterprise architecture/security claim.

---

## 39. Primary repository references

- `HOW_GROWWITHHR_WORKS.md` — plain-English architecture and governance guide.
- `README.md` — product/runtime boundary and prototype classification.
- `server-entry.js` — backend API interception/CORS/routing boundary.
- `server-company-workspace-v2.js` — Company Workspace, encryption, recovery, retention/deletion.
- `server-workspace-handoff.js` — five-minute one-time handoff.
- `server.js` — Express report/Gmail delivery and current email rate limiter.
- `supabase/migrations/20260813_company_workspaces.sql` — Company Workspace schema/RLS.
- `growwithhr-rag/legal-explanation-contract.js` — legal explanation authority/output contract.
- `growwithhr-rag/operational-explanation-contract.js` — operational explanation contract.
- `growwithhr-rag/cloudflare-workers-ai-provider.cjs` — Cloudflare legal-provider request guardrails.
- `docs/architecture/complete-governed-legal-rag-platform.md` — shared RAG architecture.
- `docs/architecture/legal-rag-source-pack-build-pipeline.md` — source/provenance/exact-file pipeline.
- `docs/architecture/founder-report-and-id-registry.md` — durable Report ID architecture.
- `docs/architecture/m7-rag-ready-hardening.md` — operational readiness and technical DR.
- `docs/releases/legal-rag-release-readiness-2026-08-11.md` — prototype release/no-certification boundary.
- `docs/releases/v0.20.4-prototype.1-founder-intelligence-ux-report.md` — latest package release evidence.
- `SECURITY.md` — current security reporting/secret/browser boundary.
- `.env.example` — required server configuration names (never values).

---

## 40. Final principle

GrowWithHR's architecture is strongest when it keeps authority, evidence, language and storage as separate concerns:

```text
User supplies facts
      │
      ▼
Rules determine the bounded product result
      │
      ▼
Governed sources support that result
      │
      ▼
AI explains without changing authority
      │
      ▼
Data is stored only where justified, for a defined period,
with explicit recovery, encryption, deletion and responsibility boundaries
```

The enterprise-hardening roadmap is therefore not a different product philosophy. It is the work required to preserve the same philosophy under stronger identity, multi-tenant, cryptographic, operational, legal and assurance expectations.
