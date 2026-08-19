# How GrowWithHR Works

**Plain-English architecture, data flow, decision logic, security and governance guide**  
**Current architecture snapshot: 19 August 2026**

---

## Why this document exists

GrowWithHR is not a general-purpose chatbot that takes a company description, sends everything to an artificial-intelligence model and asks the model what the company should do.

The product is designed differently.

At a high level:

> **Rules decide. Governed sources substantiate. Artificial intelligence explains.**

This document explains, in plain language, how that actually works.

It covers:

- what happens when a user enters company information;
- how GrowWithHR decides whether a compliance area is relevant;
- what the deterministic Rule Engine is and how it works;
- where information is stored;
- what is stored in the browser versus on the server;
- how Supabase is used;
- how information is encrypted;
- how workspace recovery works;
- what Cloudflare does;
- what Render does;
- what Google Drive does;
- what Retrieval-Augmented Generation (RAG) does;
- what artificial intelligence is allowed and not allowed to do;
- how reports are generated and emailed;
- how retention and deletion work;
- what security controls exist today;
- what limitations still exist; and
- what should be strengthened before describing GrowWithHR as an enterprise-grade security environment.

This is an architecture and governance explanation. It is **not a legal certification, security audit, penetration-test report, SOC 2 report or ISO certification**.

---

# 1. The simplest possible explanation

Think of GrowWithHR as a set of specialised rooms rather than one large artificial-intelligence system.

```text
USER
 │
 ▼
WEBSITE
The user enters company information
 │
 ▼
RULE ENGINE
Fixed rules evaluate the information
 │
 ├──────────────► Missing information? Ask for more information
 │
 ▼
FIXED RESULT
The result exists before artificial intelligence is involved
 │
 ▼
RAG / GOVERNED LEGAL SOURCES
Only permitted supporting material is retrieved
 │
 ▼
ARTIFICIAL INTELLIGENCE
Explains the already-fixed result in clearer language
 │
 ▼
REPORT
On-screen report / PDF / email
```

The supporting technology looks like this:

```text
USER
 │
 ▼
GITHUB PAGES
Public website and browser experience
 │
 ▼
RENDER
Private backend and server APIs
 │
 ├──► RULE ENGINE
 │      Deterministic decision logic
 │
 ├──► SUPABASE
 │      Temporary reusable Company Workspace
 │
 ├──► RAG
 │      Governed source retrieval
 │       ▲
 │       └── GOOGLE DRIVE / SOURCE GOVERNANCE
 │           Controlled legal-source master library
 │
 ├──► CLOUDFLARE WORKERS AI
 │      Explanation only
 │
 ├──► CLOUDFLARE DURABLE OBJECT
 │      Persistent unique Report ID allocation
 │
 └──► GMAIL API
        Requested report delivery
```

A simple analogy is:

| Technology | Plain-English role |
|---|---|
| GitHub | The blueprint cupboard: code, rules, schemas and governed product files |
| GitHub Pages | The public storefront |
| Browser | The user's temporary working desk |
| Render | The private back office |
| Rule Engine | The decision book |
| Supabase | The temporary secure filing cabinet for reusable Company Workspace data |
| RAG | The librarian that is allowed to fetch only approved source material |
| Google Drive | The controlled research/source library upstream of RAG |
| Cloudflare Workers AI | The writer that explains a result already decided elsewhere |
| Cloudflare Durable Object | The Report ID registrar |
| Gmail API | The post office used when a report is emailed |

---

# 2. What GrowWithHR currently does

GrowWithHR is designed as a structured people and compliance intelligence platform.

The current public product concentrates primarily on:

1. **Compliance intelligence**; and
2. **Organization Structure intelligence**.

The broader product architecture is intended to support more intelligence modules over time, but the same central principle should remain:

> A model must not silently invent facts, change governed decisions or act as the legal authority.

The product is currently research-grade and should not be represented as legal certification or independent legal advice.

---

# 3. The complete user journey

## Step 1 — The user opens GrowWithHR

The public browser application is served from **GitHub Pages**.

GitHub Pages serves the website files: HTML, CSS, JavaScript, images and other public frontend assets.

It is the part the user sees.

GitHub Pages is **not** intended to be the private customer database.

---

## Step 2 — The user enters company information

Depending on the assessment, information can include items such as:

- company name;
- legal entity information;
- industry;
- nature of business;
- number of employees;
- workers and contractors;
- operating locations;
- operating state;
- work model;
- manufacturing/activity information;
- company growth information;
- selected priorities;
- contact name;
- email address; and
- other structured organisation-level answers needed by an intelligence engine.

GrowWithHR is intentionally designed for **organisation-level facts**, not employee case-management data.

Users should not enter highly sensitive employee-level material such as:

- medical records;
- payroll records;
- disciplinary files;
- individual performance cases;
- complaint evidence;
- investigation evidence;
- detailed grievance records; or
- other unnecessary identifiable employee information.

---

# 4. Where information is stored while the assessment is being completed

This is an important distinction.

While a person is completing an assessment, some assessment progress is saved in the **user's own browser using `localStorage`**.

Examples of browser-side records used by the application include:

- saved assessment answers;
- assessment progress;
- company profile information;
- lead/contact information;
- report data;
- delivery status; and
- cached non-user catalogues such as industry lists.

The browser currently stores these records as ordinary JSON through browser `localStorage`.

Conceptually:

```text
User enters answers
      │
      ▼
Browser JavaScript
      │
      ▼
localStorage
JSON saved on that browser/device
```

## Is browser `localStorage` encrypted by GrowWithHR?

**No.**

GrowWithHR does not currently apply its AES application-encryption layer before placing normal assessment-progress records in `localStorage`.

That does **not** mean the information is automatically public. Browser-origin rules normally prevent unrelated websites from simply reading another site's local storage.

But this is a weaker security boundary than encrypted server-side storage.

Browser-stored data can be exposed if, for example:

- the user's device or browser is compromised;
- a malicious browser extension has relevant access;
- malicious JavaScript is injected into the site;
- a successful cross-site-scripting attack occurs; or
- another person has sufficient access to the same browser profile/device.

For this reason, the current browser-storage model is acceptable only when GrowWithHR continues to minimise what users are asked to provide and avoids sensitive employee-level case information.

This browser layer is one of the highest-priority areas for future security hardening.

---

# 5. What the Rule Engine actually is

The Rule Engine is the most important part of GrowWithHR's decision architecture.

It is **not artificial intelligence**.

It is deterministic software logic.

That means the same valid inputs processed by the same rule version should produce the same rule outcome.

A useful analogy is a highly controlled combination of:

- a decision tree;
- a policy matrix; and
- an Excel formula.

---

# 6. How the Rule Engine makes a decision

A rule generally has five parts:

1. **Required facts** — what information must exist before the rule can run;
2. **Normalisation** — converting user input into known types;
3. **Conditions** — the logical tests that must be evaluated;
4. **Outcomes** — what fixed result should be produced; and
5. **Limitations / next action** — what the result does and does not mean.

Example:

```text
User reports:
Employees = 25
Primary state = Karnataka
Locations = 3
```

GrowWithHR normalises those answers into controlled facts:

```text
Employee count = integer 25
Primary state = text "Karnataka"
Location count = integer 3
```

A simplified rule might then say:

```text
IF
employee count >= 10
AND primary state exists
AND location count >= 1

THEN
return a fixed review outcome
```

Artificial intelligence is not asked to decide whether `25 >= 10`.

The software rule evaluates it directly.

---

# 7. What happens when information is missing

GrowWithHR's legal rule architecture is intentionally designed to fail closed rather than guess.

If a required fact is missing:

```text
Missing input
     │
     ▼
Rule Engine
     │
     ▼
"More information needed"
```

It should **not** become:

```text
Missing input
     │
     ▼
Artificial intelligence guesses an answer
```

The legal rule contracts explicitly prevent retrieval or a language model from filling missing assessment facts.

This is a core safety principle.

---

# 8. Example: POSH Internal Committee threshold logic

One of the governed rule examples requires facts including:

- total employee count;
- primary operating state; and
- permanent location count.

The rule contains defined match conditions and defined outcomes.

Boundary scenarios are also written into the rule catalogue so the software can be tested at important edges, such as:

- below the product threshold;
- exactly at the product threshold;
- above the product threshold; and
- missing required facts.

This is important because the system can be tested against known expected outcomes rather than relying on subjective model behaviour.

The current rule also deliberately preserves legal-review limitations. A deterministic product flag does not automatically become an independently approved legal conclusion.

---

# 9. What “deterministic” means in GrowWithHR

In this architecture, deterministic means:

- the rule is written down;
- required inputs are declared;
- operators are explicit;
- result states are controlled;
- missing-data behaviour is controlled;
- the source scope is controlled;
- artificial intelligence cannot alter the status;
- and the rule can be tested using predefined scenarios.

It does **not** mean every current legal rule is legally complete.

A deterministic rule can still be provisional, conservative or pending legal review.

That distinction is important.

---

# 10. Current legal-rule maturity

GrowWithHR's legal architecture has two broad kinds of rule profiles:

## A. Substantive governed profiles

These contain law-specific facts, conditions, source references and controlled outcomes.

Examples include the governed POSH and Maternity work introduced through the legal-RAG waves.

## B. Conservative governance fallback profiles

Where full law-specific onboarding is not complete, the product intentionally avoids pretending that a mature substantive rule exists.

Those profiles can return conservative states such as:

- specialist review; or
- more information needed.

They are designed to prevent the model or retrieval layer from inventing legal applicability.

The architecture documentation currently treats the legal catalogues as research/private-beta material with legal-review status still requiring qualified review.

---

# 11. Company-wide applicability orchestration

For the company-wide compliance experience, GrowWithHR maps supported company facts into law-area findings.

Supported scenario fields include organisation-level items such as:

- employees;
- workers;
- contractors;
- India operations;
- establishment type;
- primary state;
- women employees;
- wage-eligibility indicators;
- industry;
- worker categories;
- use of power; and
- manufacturing operations.

The orchestrator normalises findings into user-friendly states such as:

- **Relevant now**;
- **Review needed**;
- **More information required**; and
- **Watch as you grow**.

It can also build:

- missing-fact lists;
- scale-trigger matrices;
- obligation objects; and
- suggested next actions.

The decision authority remains the deterministic engine.

---

# 12. What RAG means in GrowWithHR

RAG stands for **Retrieval-Augmented Generation**.

In many systems, RAG means:

> Search a pile of documents, give the search results to a model and ask the model for an answer.

That is **not** the intended GrowWithHR legal architecture.

GrowWithHR uses a narrower model:

```text
1. Collect structured company facts
2. Deterministic rule decides the product status
3. Rule identifies the permitted source scope
4. RAG retrieves only within that permitted scope
5. Artificial intelligence explains the already-fixed result
```

The decision exists **before retrieval**.

---

# 13. What RAG is allowed to do

RAG may:

- retrieve governed source chunks;
- retrieve only from source IDs permitted by the deterministic result;
- rank material within the allowed scope;
- provide citation/source context to the explanation layer; and
- support transparent explanation.

---

# 14. What RAG is not allowed to do

RAG is not supposed to:

- invent company facts;
- repair missing answers;
- choose jurisdiction on its own;
- decide which law applies;
- change the deterministic status;
- expand source scope beyond what the rule permits;
- convert draft research into operative law;
- certify compliance; or
- make sensitive employee-level case decisions.

Unknown or ambiguous relationships should fail closed rather than silently expand the model's authority.

---

# 15. What Google Drive does

Google Drive is part of the **source-governance workflow**, not the normal customer-data workspace.

In plain language:

> Google Drive is the controlled legal/research library, not the customer filing cabinet.

The source-governance workflow can maintain items such as:

- official source PDFs;
- source registers;
- controlled source identities;
- file paths;
- hashes;
- byte lengths;
- page counts;
- provenance information;
- legal-review status; and
- reconciliation records.

The controlled source pack is then compiled into governed runtime catalogues used by the application.

The runtime is **not intended to search a live Google Drive folder and ask an artificial-intelligence model to interpret whatever happens to be there**.

The builder pipeline also does not automatically turn arbitrary uploaded PDFs into legal obligations.

---

# 16. What Cloudflare Workers AI does

GrowWithHR uses Cloudflare Workers AI as an **explanation provider** in the governed legal-explanation path.

The provider contract explicitly sets boundaries such as:

```text
providerRole = explanation-only
usedForDecision = false
mayChangeDecision = false
applicabilityAuthority = none
legalAdvice = false
```

The provider is therefore meant to receive a constrained explanation package, not an uncontrolled dump of raw assessment data.

The application contract rejects raw keys such as:

- `answers`;
- `assessmentAnswers`;
- `rawAnswers`;
- `facts`;
- `mappedFacts`; and
- `evidence`.

The intent is:

```text
Raw assessment
      │
      ▼
GrowWithHR deterministic processing
      │
      ▼
Fixed decision + permitted governed material
      │
      ▼
Cloudflare Workers AI
      │
      ▼
Explanation
```

not:

```text
Raw assessment
      │
      ▼
Cloudflare model
      │
      ▼
"Decide what law applies"
```

---

# 17. A second, separate Cloudflare role: Report IDs

Cloudflare is also used for a separate infrastructure responsibility: **persistent Report ID allocation**.

This should not be confused with Workers AI.

The Report ID flow is approximately:

```text
Browser
  │
  ▼
Render API
  │
  ▼
Cloudflare Worker
  │
  ▼
ReportIdRegistry Durable Object
  │
  ▼
SQLite-backed persistent Durable Object storage
```

The browser does not receive the private Worker secret and does not write directly to the Durable Object.

The Report ID service maintains a globally persistent sequence and is designed not to deliberately recycle Report IDs.

Identifier values used for idempotency and registry checks are stored as hashes rather than deliberately storing the corresponding raw identifier material.

---

# 18. What Render does

Render is the private backend boundary for the current product.

It hosts server-side APIs and secrets that must not live in browser JavaScript.

Backend responsibilities include areas such as:

- Company Workspace creation;
- Company Workspace recovery;
- analysis completion/continuity;
- deletion;
- retention sweeps;
- Report ID mediation;
- report delivery;
- organisation-report delivery;
- legal explanation routing;
- operational explanation routing; and
- temporary workspace handoff.

Render also holds sensitive server environment variables such as:

- Supabase service-role credentials;
- Gmail OAuth credentials;
- Workspace encryption secret;
- retention secret; and
- Cloudflare/provider credentials where required.

These secrets must never be embedded in public frontend code.

---

# 19. What Supabase does

Supabase is used as the database for the reusable **Company Workspace**.

The Company Workspace allows a user to return later and reuse company information in another GrowWithHR intelligence analysis without re-entering the same organisation information from scratch.

The table includes fields such as:

- internal workspace UUID;
- current Report ID;
- historical Report IDs;
- Recovery Code hash;
- email;
- company name;
- encrypted company data;
- completed intelligence engines;
- created/updated timestamps;
- last analysis timestamp;
- expiry date;
- reminder date;
- deletion timestamps; and
- workspace status.

The database table has Row Level Security enabled.

The intended architecture creates **no normal browser/client policy for Company Workspace access**.

The table is accessed through the backend using Supabase's server-side service role.

---

# 20. What is encrypted in the Company Workspace

The large reusable Company Data payload is encrypted by GrowWithHR **before it is stored in Supabase**.

The implementation uses:

> **AES-256-GCM**

Conceptually:

```text
Company data JSON
      │
      ▼
Render backend
      │
      ▼
AES-256-GCM encryption
      │
      ▼
Ciphertext + IV + authentication tag
      │
      ▼
Supabase
```

A fresh random 12-byte initialization vector is created for encryption.

AES-GCM gives two important properties:

1. **Confidentiality** — the stored company payload is not readable without the key; and
2. **Integrity/authentication** — tampering with ciphertext should cause authentication failure rather than quietly producing trusted plaintext.

---

# 21. Where the encryption key comes from

The Company Workspace encryption key is derived on the backend from a server secret.

The recommended environment variable is:

```text
WORKSPACE_ENCRYPTION_SECRET
```

The secret is intended to live only in the backend environment, not in Supabase rows and not in browser JavaScript.

This creates an important separation:

```text
SUPABASE
Contains encrypted company payload

RENDER BACKEND
Contains the secret needed to derive the encryption key
```

A database copy alone should therefore not be enough to decrypt the Company Data payload without the separate backend secret.

### Current hardening note

The code currently permits a fallback to another server secret if `WORKSPACE_ENCRYPTION_SECRET` is absent.

For production hardening, GrowWithHR should require a dedicated high-entropy encryption secret and fail closed if it is missing rather than reusing an unrelated secret.

---

# 22. Not every Supabase column has GrowWithHR's second encryption layer

The encrypted Company Data payload has application-level AES encryption.

However, some operational metadata exists as separate database columns and is not separately wrapped by that AES payload.

Examples include:

- email;
- company name;
- Report ID values;
- timestamps; and
- status fields.

These fields still receive the infrastructure protection provided by the hosting/database platform, but they do not currently receive the same additional GrowWithHR application-encryption wrapper as `encrypted_company_data`.

This distinction should be stated clearly rather than saying “everything in Supabase is AES encrypted by GrowWithHR.”

Future privacy hardening can consider whether email/company-name metadata also needs application-level encryption or whether a documented operational reason justifies keeping those fields directly queryable.

---

# 23. Workspace Recovery Code security

A reusable Company Workspace is not intended to be unlocked using the Report ID alone.

GrowWithHR creates a separate **Workspace Recovery Code**.

The raw Recovery Code is shown to the user, but the database stores a **SHA-256 hash**, not the plaintext code.

Conceptually:

```text
User receives:
ABCD-EFGH-JKLM-NPQR-STUV

Database stores:
SHA-256 hash of normalised Recovery Code
```

When the user recovers the workspace:

```text
Report ID + Recovery Code
          │
          ▼
Backend finds workspace
          │
          ▼
Supplied code is hashed
          │
          ▼
Timing-safe comparison with stored hash
          │
          ▼
Match?
   │
   ├── No → reject
   │
   └── Yes
          │
          ▼
Decrypt encrypted Company Data
```

The implementation uses timing-safe comparison for the stored hash comparison.

---

# 24. Temporary handoff between intelligence tools

When a recovered Company Workspace is passed to another GrowWithHR intelligence experience, the system can use a short-lived one-time handoff token.

The current handoff mechanism:

- creates a cryptographically random token;
- keeps the recovered handoff temporarily in backend memory;
- has a five-minute expiry;
- deletes the token after successful redemption; and
- uses no-cache/no-store response headers.

This avoids putting the Workspace Recovery Code into a normal URL.

Important architectural point:

> The handoff is temporary server memory, not a second persistent customer database.

---

# 25. CORS and browser-to-API access

The backend uses an origin allowlist for browser API calls.

The normal production GitHub Pages origin is explicitly permitted, and additional origins can be configured through the backend environment.

An unapproved browser origin receives a rejection rather than a wildcard browser policy.

This is useful protection, but it must not be mistaken for authentication.

CORS controls which browser origins can use the API from ordinary browser JavaScript. A non-browser attacker can still send direct network requests.

Therefore CORS must remain only one layer alongside:

- input validation;
- Recovery Code verification;
- secret separation;
- request-size controls;
- rate limiting/throttling where required; and
- server-only privileged credentials.

---

# 26. Request-size controls

The Company Workspace API includes an application request-size limit and rejects oversized requests.

The temporary handoff route has an even smaller request-size boundary.

These controls help reduce accidental oversize payloads and some abuse cases.

They do not replace broader application rate limiting or denial-of-service protection.

---

# 27. Report generation and email delivery

Reports can be displayed and/or generated for download.

When the user asks for an emailed report, GrowWithHR uses the configured **Gmail API** connection.

The path is approximately:

```text
Report data
    │
    ▼
Render backend
    │
    ▼
Generated PDF / email content
    │
    ▼
Gmail API
    │
    ▼
Recipient
```

The connected Gmail account can retain sent email and attachments according to its own account retention and administrative settings.

This creates an important governance distinction:

> Deleting a Company Workspace in Supabase does not automatically mean a previously sent Gmail message or PDF attachment disappears from the Gmail account or recipient mailbox.

A formal enterprise data-retention policy should therefore cover email-delivered reports as a separate data location.

---

# 28. Company Workspace retention

The current product policy is designed around temporary rather than indefinite retention.

The reusable Company Workspace is scheduled to expire **six months after the latest completed intelligence analysis**.

The expiry is recalculated when another analysis is completed using the reusable workspace.

Approximately seven days before scheduled deletion, the product can send a reminder.

After deletion, a deletion confirmation can be sent.

The six-month period is a **product retention policy**, not a claim that six months is required by law.

---

# 29. What deletion currently does

When a workspace is deleted, the live Company Workspace record is sanitised rather than simply leaving all reusable information untouched.

The server clears or replaces key values including:

- encrypted Company Data → encrypted empty object;
- Recovery Code hash → removed/cleared;
- completed-engine list → cleared;
- company name → cleared;
- deletion timestamps → recorded; and
- status → changed to `deleted`.

The Report ID/operational record can remain for identity, integrity, fraud-prevention, operational or legal reasons where justified.

A user can also request early deletion through the protected workspace flow.

---

# 30. Backups are different from the live workspace

No responsible cloud product should claim that every historical copy disappears instantaneously from every infrastructure layer at the exact second the live record is deleted.

Database infrastructure can maintain backups according to the hosting plan/provider lifecycle.

The accurate privacy explanation is therefore closer to:

> The active reusable Company Workspace is removed/sanitised according to the GrowWithHR deletion process. Copies that may exist temporarily in infrastructure backups age out according to the provider's controlled backup lifecycle and are not treated as an active reusable GrowWithHR workspace.

Backup lifecycle should be included in enterprise data-processing documentation.

---

# 31. Current live Supabase posture

As of this architecture snapshot, the connected GrowWithHR Supabase project is active and healthy.

The live `company_workspaces` table has:

- **Row Level Security enabled**; and
- **no Row Level Security policies granting normal client access**.

This matches the intended server-only access model.

The Supabase security advisor reports the “RLS enabled, no policy” condition as informational for this table. In this particular architecture, no browser policy is intentional because the service role is the backend access path.

### Defence-in-depth improvement

The current database role grants still include standard table privileges for `anon` and `authenticated`, while RLS prevents them from using those privileges against the table.

Current effective logic is therefore:

```text
anon/authenticated have table privileges
        +
RLS has no allowing policy
        =
normal client cannot access rows
```

For a table intended to be strictly server-only, a stronger configuration would additionally revoke unnecessary `anon` and `authenticated` table privileges.

Then the model becomes:

```text
anon/authenticated have no table privilege
        +
RLS has no allowing policy
        =
second independent denial layer
```

---

# 32. Current database region

As of 19 August 2026, the connected GrowWithHR Supabase project is hosted in:

> **`ap-northeast-2` — Seoul, South Korea**

This matters for data-governance and enterprise procurement conversations because it means the current database is not physically hosted in India.

That does not by itself determine whether processing is lawful. Cross-border obligations depend on applicable law, notices, contracts, government restrictions and the processing context.

However, an India-region deployment may simplify enterprise conversations for an India-focused HR product, particularly when a buyer asks:

> “Where is our organisation information stored?”

Data residency should therefore be treated as an explicit product/governance decision, not an accidental infrastructure detail.

---

# 33. Security in transit

The intended public production path uses HTTPS/TLS between major network boundaries.

Conceptually:

```text
Browser
   │
 HTTPS
   ▼
Render
   │
 HTTPS
   ▼
Supabase / provider APIs
```

This protects information against ordinary plaintext interception while it travels over the network.

TLS is necessary but not sufficient. It does not protect against a compromised endpoint, leaked credential or malicious code already running inside an authorised browser/session.

---

# 34. Security at rest

There are multiple storage/security layers.

## Browser

Normal GrowWithHR browser assessment progress is stored as plain JSON in `localStorage`.

**GrowWithHR application encryption: No.**

## Supabase Company Data payload

Reusable Company Data is encrypted using **AES-256-GCM before storage**.

**GrowWithHR application encryption: Yes.**

## Supabase metadata

Email, company name, Report IDs and certain operational fields are stored separately from the encrypted payload.

**GrowWithHR application encryption: Not currently for every metadata column.**

## Recovery Code

Stored as a one-way SHA-256 hash.

**Plaintext Recovery Code stored in database: No.**

## Google Drive source library

Contains governed research/source material, not the normal customer Company Workspace.

## Gmail

May retain requested sent reports and attachments according to Gmail/account retention.

---

# 35. Security boundaries and responsibility

Security is a shared-responsibility model.

GrowWithHR cannot say:

> “Supabase is secure, therefore GrowWithHR has no security responsibility.”

That would be incorrect.

GrowWithHR/HRTechify remains responsible for how the application is designed and operated, including matters such as:

- what data it asks users to provide;
- why the data is processed;
- how much is collected;
- which vendors receive it;
- who can access it;
- secret management;
- application authorization;
- database design;
- encryption decisions;
- retention policy;
- deletion behaviour;
- incident response;
- user rights handling;
- notices and contractual commitments; and
- whether product claims accurately match implemented controls.

Infrastructure providers remain responsible for their own service-layer obligations under their service terms and applicable agreements.

---

# 36. Data-protection roles in plain English

Where HRTechify/GrowWithHR determines why and how personal data is processed for its own direct-user product experience, it may act in the role that Indian data-protection law describes as a **Data Fiduciary**, depending on the exact relationship and processing context.

A cloud/infrastructure vendor performing processing on behalf of the product would normally operate under a service/provider relationship, but the exact legal role must be determined from the actual contract and use case rather than guessed from the technology name.

For business-to-business customer deployments, roles can vary. A customer may itself determine purposes for some processing while GrowWithHR provides processing services.

Therefore enterprise contracts should state the applicable controller/fiduciary/processor relationships explicitly.

---

# 37. DPDP readiness

India's Digital Personal Data Protection framework has been brought into force on a staged basis.

GrowWithHR should design for the full target standard rather than relying on transitional commencement timing.

Practical architecture implications include:

- collect only information needed for the declared purpose;
- provide appropriate notices;
- apply reasonable security safeguards;
- control processors/service providers;
- protect against breaches;
- support deletion/rights processes where applicable;
- maintain justified retention;
- handle cross-border processing appropriately;
- establish incident-response processes; and
- maintain evidence that the actual implementation matches the promises made to users.

This repository should not describe the product as “DPDP certified.” There is no basis for that claim merely because security features exist.

---

# 38. Certifications: what can and cannot be claimed

Some infrastructure providers used by GrowWithHR maintain their own independent security certifications and assurance programmes.

Those provider certifications do **not automatically transfer to GrowWithHR**.

GrowWithHR itself should not claim SOC 2 or ISO 27001 certification unless GrowWithHR has independently completed and maintains the corresponding certification/attestation scope.

The correct distinction is:

```text
Infrastructure provider certification
       ≠
GrowWithHR certification
```

Provider certifications are useful evidence when assessing subprocessors, but application-level controls and organisational governance remain GrowWithHR's responsibility.

---

# 39. Why artificial intelligence does not own the compliance decision

This is one of GrowWithHR's most important design choices.

A general language model is good at language generation but can:

- misunderstand incomplete information;
- infer unstated facts;
- overgeneralise;
- produce inconsistent conclusions;
- fail to understand jurisdictional nuance; or
- sound confident even when uncertain.

For compliance applicability, that is an unacceptable decision model.

GrowWithHR therefore separates:

```text
DECISION AUTHORITY
Deterministic rule

EVIDENCE RETRIEVAL
Governed RAG

LANGUAGE
Artificial-intelligence explanation
```

That separation also makes results more testable and auditable.

---

# 40. Source governance

Legal-source governance is intended to make source provenance explicit.

The architecture distinguishes concepts such as:

- runtime source identity;
- official source identity;
- secondary research provenance;
- exact-file fingerprint;
- portal/register identity;
- effective dates;
- draft versus operative material;
- guidance versus legislation; and
- legal-review status.

A file being downloaded from an official website does not automatically mean every GrowWithHR rule derived from it is legally approved.

Source authenticity and rule correctness are separate governance questions.

---

# 41. Testing philosophy

Deterministic legal logic is valuable only if it can be tested.

The repository therefore contains test coverage around areas such as:

- legal-rule assurance;
- legal-source retrieval;
- explanation contracts;
- Cloudflare Workers AI provider boundaries;
- assessment journey behaviour;
- report flow;
- compliance story contracts;
- traceability;
- browser-to-server CORS;
- Company Workspace continuity/hardening; and
- end-to-end assessment behaviour.

Important rules include automated boundary-test scenarios with expected statuses and reason codes.

This supports regression testing when the product changes.

---

# 42. Failure philosophy

The preferred legal/compliance failure mode is conservative.

Examples:

### Required fact missing

```text
More information needed
```

### Source relationship unclear

```text
Do not expand retrieval scope automatically
```

### Feature-specific legal rule not sufficiently onboarded

```text
Specialist review / conservative governance outcome
```

### Artificial-intelligence provider unavailable

The deterministic decision should remain separate from model availability. A language-generation failure should not silently mutate the underlying decision.

---

# 43. What information should never be logged carelessly

Server/API logs should avoid recording unnecessary raw user payloads or secrets.

Particularly sensitive values that should never be deliberately logged include:

- Supabase service-role key;
- Workspace encryption secret;
- Gmail refresh token;
- Google OAuth client secret;
- Cloudflare API token;
- Report ID allocator secrets;
- Workspace Recovery Code;
- decrypted reusable Company Data unless strictly required for controlled debugging; and
- unnecessary personal/sensitive customer payloads.

Production logging should favour operational identifiers, error classes and trace IDs over raw business data.

---

# 44. Current security strengths

The present architecture already contains several meaningful controls.

## Implemented design strengths

- deterministic decision authority for governed legal applicability;
- RAG cannot create or change applicability decisions;
- artificial intelligence is explanation-only in the governed legal route;
- raw assessment-answer keys are prohibited from the Cloudflare Workers AI provider contract;
- Company Workspace payload is encrypted using AES-256-GCM before database storage;
- separate backend encryption secret;
- Recovery Code stored as a hash rather than plaintext;
- timing-safe Recovery Code comparison;
- Supabase service-role credential is server-only;
- Row Level Security enabled for the Company Workspace;
- no normal browser/client RLS policy for the Company Workspace;
- HTTPS/TLS network boundaries;
- CORS origin allowlisting;
- request-size limits;
- temporary one-time handoff token;
- handoff token expiry;
- six-month reusable-workspace retention policy;
- deletion workflow;
- deletion reminders/confirmation workflow;
- governed legal-source architecture;
- traceability and boundary tests; and
- explicit product limitations rather than false certification claims.

These are real controls, not merely marketing wording.

---

# 45. Current limitations and residual risks

The product should also be equally clear about what is **not yet enterprise-grade**.

## 1. Browser `localStorage` is plaintext

Assessment answers, contact data and report/progress information can exist as plain browser JSON.

This is currently the most important application data-storage limitation.

### Recommended direction

- minimise browser persistence;
- clear unnecessary state promptly;
- do not persist sensitive categories;
- consider session-scoped storage where possible;
- evaluate encrypted or server-bound persistence models where genuinely useful; and
- harden browser script security.

---

## 2. Content Security Policy should be strengthened

Because browser `localStorage` is accessible to JavaScript running in the site origin, strong protection against script injection matters.

### Recommended direction

Introduce and maintain a restrictive Content Security Policy and complementary browser security headers, while eliminating unnecessary inline/eval-style script patterns that prevent a strong policy.

---

## 3. Recovery/API throttling should be explicit

The Recovery Code is cryptographically strong, but the application should still implement clear rate limiting and abuse throttling for recovery and other sensitive API endpoints.

### Recommended direction

Apply controls such as:

- per-IP request throttling;
- per-workspace failed-attempt throttling;
- escalating delay after repeated failures;
- monitoring/alerting for abuse patterns; and
- gateway-level denial-of-service protections.

---

## 4. Revoke unnecessary Supabase client grants

RLS currently denies normal access, but the server-only table should also remove unnecessary `anon` and `authenticated` table privileges as an independent layer.

---

## 5. Dedicated encryption secret must be mandatory

Remove the prototype fallback to another application secret.

Production should refuse to start Company Workspace encryption if the dedicated high-entropy key is absent.

---

## 6. Encryption-key lifecycle is still basic

The current design uses one application encryption-key derivation approach.

An enterprise design should add:

- key versioning;
- controlled rotation;
- old-key decryption support during migration;
- emergency key revocation procedures;
- separation of duties;
- documented backup/recovery of key material; and
- preferably managed key-management infrastructure for high assurance.

---

## 7. Some database metadata is not application-encrypted

Email and company name are examples.

Review each metadata field and determine whether it must remain directly readable, should be tokenised, should be encrypted, or should be removed.

---

## 8. Gmail report retention needs explicit governance

A sent report can outlive the Supabase workspace.

Define:

- how long sent reports remain in the sending account;
- who can access that mailbox;
- how offboarding is handled;
- whether enterprise customer reports need a separate delivery system; and
- how deletion requests interact with delivered copies.

---

## 9. Data residency is currently outside India

The present GrowWithHR Supabase project is in Seoul.

Decide deliberately whether the production customer database should move to India based on target customers, contracts, legal advice, performance and enterprise procurement expectations.

---

## 10. No full customer identity/access-management layer

The current reusable Company Workspace relies primarily on Report ID + Recovery Code rather than a conventional user account model.

For larger enterprise deployments, consider:

- authenticated accounts;
- multi-factor authentication;
- organisation-level administrators;
- role-based access control;
- team membership;
- audit logs;
- session management;
- SSO/SAML/OIDC; and
- enterprise tenant isolation.

---

## 11. Formal organisational security programme is still required

Technical controls alone do not create an enterprise security programme.

GrowWithHR still needs mature documented practices covering:

- secure software development lifecycle;
- vulnerability management;
- dependency/supply-chain management;
- penetration testing;
- incident response;
- breach-response exercises;
- access reviews;
- vendor/subprocessor assessments;
- data-processing agreements;
- disaster recovery;
- business continuity;
- backup restoration tests;
- secrets rotation;
- employee/administrator access controls;
- change management; and
- evidence retention for audits.

---

# 46. Who owns the data-protection responsibility?

No single technology vendor owns the whole responsibility.

A practical responsibility map is:

| Area | Primary responsibility |
|---|---|
| What GrowWithHR asks the user to enter | GrowWithHR / HRTechify |
| Product purpose and data minimisation | GrowWithHR / HRTechify |
| Browser application code | GrowWithHR / HRTechify |
| Rule logic | GrowWithHR / HRTechify |
| RAG governance | GrowWithHR / HRTechify |
| Application encryption design | GrowWithHR / HRTechify |
| Secret configuration | GrowWithHR / HRTechify |
| Supabase infrastructure | Supabase under its service responsibility |
| Supabase schema/RLS/application use | GrowWithHR / HRTechify |
| Render infrastructure | Render under its service responsibility |
| Render application/API configuration | GrowWithHR / HRTechify |
| Cloudflare infrastructure/model service | Cloudflare under its service responsibility |
| AI request minimisation and provider contract | GrowWithHR / HRTechify |
| Google account/Drive source governance | GrowWithHR / HRTechify + Google service boundary |
| Gmail retention/configuration | GrowWithHR / HRTechify + Google service boundary |
| User's own device/browser security | Shared with the user/device environment |
| Legal compliance of GrowWithHR processing | GrowWithHR / HRTechify, informed by qualified legal advice |

The safest principle is:

> **Infrastructure providers protect their platforms. GrowWithHR remains responsible for how it builds and operates GrowWithHR on top of them.**

---

# 47. Full data-location map

The following map should be maintained as the product evolves.

| Data / artefact | Primary location | Application-encrypted? | Typical purpose |
|---|---|---:|---|
| In-progress assessment answers | Browser `localStorage` | No | Resume/continue experience |
| Browser company profile | Browser `localStorage` | No | Local company context |
| Lead/contact record | Browser `localStorage` during flow | No | Report/contact flow |
| Browser report data | Browser `localStorage` where used | No | Report experience |
| Reusable Company Data | Supabase | Yes, AES-256-GCM | Reuse company facts across intelligence engines |
| Recovery Code | User possession | N/A | Workspace recovery |
| Recovery Code hash | Supabase | One-way SHA-256 hash | Verify recovery attempt |
| Company name metadata | Supabase | Not separately app-encrypted | Workspace metadata |
| Email metadata | Supabase | Not separately app-encrypted | Workspace/reminder communication |
| Report IDs | Supabase + Cloudflare registry context | Not secret | Report/workspace identity |
| Report-ID registry hashes | Cloudflare Durable Object | Hashes | Persistent sequencing/idempotency |
| Temporary handoff workspace | Render process memory | Decrypted temporarily | Cross-tool continuity |
| Handoff token | Render memory | Random opaque token | One-time handoff |
| Governed legal-source masters | Google Drive/repository governance | Source material, not customer payload | Legal-source governance |
| Compiled RAG catalogues | Repository/runtime | Not customer data | Governed retrieval |
| AI explanation request | Cloudflare Workers AI | Constrained request | Explain fixed result |
| Sent report email/PDF | Gmail / recipient mailbox | Provider/mailbox controls | Requested report delivery |
| Source code/rules/tests | GitHub | Not customer workspace | Product development/governance |

This table should be updated whenever a new service or intelligence engine begins storing or transmitting a new category of information.

---

# 48. Complete data-flow diagram

```text
                         ┌───────────────────────────┐
                         │           USER            │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       GITHUB PAGES        │
                         │ Public website/frontend   │
                         └─────────────┬─────────────┘
                                       │
                  Browser localStorage │
                  (plain JSON today)   │
                                       ▼
                         ┌───────────────────────────┐
                         │       RENDER BACKEND      │
                         │ Private API boundary      │
                         └──────┬───────┬───────┬────┘
                                │       │       │
                ┌───────────────┘       │       └─────────────────┐
                │                       │                         │
                ▼                       ▼                         ▼
      ┌──────────────────┐    ┌──────────────────┐      ┌──────────────────┐
      │   RULE ENGINE    │    │     SUPABASE     │      │    GMAIL API     │
      │ deterministic    │    │ Company Workspace│      │ report delivery  │
      │ decision         │    │ AES company data │      └──────────────────┘
      └────────┬─────────┘    └──────────────────┘
               │
               │ fixed result
               ▼
      ┌──────────────────┐
      │       RAG        │◄────────────────────────────────┐
      │ governed source  │                                 │
      │ retrieval only   │                                 │
      └────────┬─────────┘                                 │
               │                                           │
               │ permitted source chunks                    │
               ▼                                           │
      ┌──────────────────┐                       ┌───────────┴──────────┐
      │ CLOUDFLARE       │                       │ GOOGLE DRIVE /       │
      │ WORKERS AI       │                       │ SOURCE GOVERNANCE    │
      │ explanation only │                       │ approved source pack │
      └────────┬─────────┘                       └──────────────────────┘
               │
               ▼
      ┌──────────────────┐
      │ EXPLAINED RESULT │
      │ + citations      │
      └────────┬─────────┘
               │
               ▼
      ┌──────────────────┐
      │ REPORT GENERATOR │
      └──────────────────┘

Separate Report ID path:

Browser → Render → Cloudflare Worker → ReportIdRegistry Durable Object
```

---

# 49. Trust boundaries

A useful way to understand the architecture is to identify when data crosses from one trust boundary to another.

## Boundary 1 — User device to GrowWithHR backend

Protection required:

- TLS;
- input validation;
- minimal data collection;
- browser security;
- explicit API contracts.

## Boundary 2 — Render to Supabase

Protection required:

- server-only service role;
- TLS;
- RLS;
- restricted privileges;
- application encryption;
- least-privilege database design.

## Boundary 3 — Deterministic decision to RAG

Protection required:

- fixed decision exists first;
- source allowlist;
- no fact creation;
- no applicability mutation.

## Boundary 4 — RAG to Cloudflare Workers AI

Protection required:

- constrained request contract;
- raw assessment exclusion;
- no legal decision authority;
- provider secret kept server-side;
- no uncontrolled evidence/case payload.

## Boundary 5 — GrowWithHR to Gmail

Protection required:

- deliberate user request;
- OAuth security;
- recipient validation;
- report-retention policy;
- mailbox access controls.

---

# 50. What GrowWithHR can accurately say today

A defensible description is:

> GrowWithHR uses deterministic rules for governed compliance decisions, controlled source retrieval for supporting evidence and artificial intelligence only to explain already-fixed results. Reusable Company Workspace data is encrypted before database storage, privileged database credentials remain server-side, workspace access requires a separate Recovery Code, and reusable company data is subject to a defined retention/deletion lifecycle. The product still has known hardening areas, including plaintext browser persistence, formal rate limiting, encryption-key lifecycle, metadata encryption decisions, email retention governance and broader enterprise security assurance.

---

# 51. What GrowWithHR should not say today

Avoid statements such as:

- “All user data is encrypted everywhere.”
- “No plaintext data ever exists.”
- “GrowWithHR is SOC 2 certified.”
- “GrowWithHR is ISO 27001 certified.”
- “Supabase certification makes GrowWithHR compliant.”
- “AI determines the applicable law.”
- “AI never sees any information under any circumstance.”
- “Deleted data disappears instantly from every backup.”
- “Google Drive stores customer reports.”
- “The legal engine provides certified legal advice.”
- “The current database is in India.”

Those statements would overstate the current implementation.

---

# 52. Recommended hardening roadmap

## Priority 1 — before broader external/enterprise use

1. Reduce or remove plaintext user-data persistence in browser `localStorage`.
2. Add a strong Content Security Policy and browser security headers.
3. Add explicit rate limiting/throttling for recovery and sensitive APIs.
4. Revoke unnecessary Supabase `anon` and `authenticated` privileges on server-only workspace tables.
5. Make a dedicated Workspace encryption secret mandatory.
6. Document and test encryption-key rotation.
7. Define Gmail/report retention and deletion handling.
8. Create a formal data-flow and subprocessor register.
9. Decide and document production data residency.
10. Establish incident-response and breach-notification procedures.

## Priority 2 — enterprise identity and governance

1. Add authenticated user accounts where product strategy requires them.
2. Add MFA/passkeys.
3. Add organisation/tenant membership.
4. Add role-based access control.
5. Add audit logging.
6. Add SSO for enterprise customers.
7. Add periodic access reviews.
8. Formalise vendor risk assessment and Data Processing Agreements.
9. Implement mature secrets rotation.
10. Perform independent penetration testing.

## Priority 3 — formal assurance

1. Formal secure-development lifecycle.
2. Vulnerability-management programme.
3. Disaster-recovery and restoration drills.
4. Business-continuity planning.
5. Security-policy suite.
6. Independent security assessment.
7. SOC 2 / ISO 27001 readiness if commercially justified.

---

# 53. Questions an outsider may ask

## “Is the rule engine artificial intelligence?”

No. It is deterministic product logic.

## “Can AI change a compliance result?”

The governed legal architecture explicitly says no. The language model is explanation-only.

## “Does the AI receive every answer the customer entered?”

Not in the governed Cloudflare legal-explanation contract. Raw answer/fact keys are deliberately prohibited there.

## “Where does reusable company information live?”

In the Supabase Company Workspace, after the Company Data payload has been encrypted by the GrowWithHR backend.

## “Is everything entered by the user encrypted immediately?”

No. In-progress browser data can currently be stored in browser `localStorage` as ordinary JSON. The reusable server-side Company Data payload receives AES-256-GCM application encryption.

## “Can the browser directly read the Company Workspace table?”

The intended architecture is server-only. RLS is enabled and no normal client policy is created for `company_workspaces`.

## “Does a Report ID by itself unlock company data?”

No. Workspace recovery also requires the separate Recovery Code.

## “Is the Recovery Code stored in the database?”

Not in plaintext. A SHA-256 hash is stored for verification.

## “Where are legal source documents kept?”

The source-governance workflow uses controlled Drive/repository source packs. This is distinct from customer workspace storage.

## “What does Gmail store?”

When a report is emailed, the sent message and attachment can remain in the configured Gmail account and recipient mailbox according to those systems' retention settings.

## “Is GrowWithHR certified?”

GrowWithHR should not currently claim SOC 2 or ISO 27001 certification unless and until it independently completes that assurance scope.

## “Is GrowWithHR safe?”

The architecture includes meaningful protections—deterministic decision controls, constrained AI, application encryption of reusable Company Data, server-only privileged credentials, RLS, Recovery Code hashing, retention and deletion. It also has known areas that must be strengthened before claiming enterprise-grade assurance, particularly browser persistence and broader organisational security controls.

---

# 54. Architectural principles to preserve as GrowWithHR grows

Future modules should preserve the following rules unless a formally reviewed architecture deliberately replaces them.

### Principle 1 — Data minimisation

Do not ask for information an engine does not need.

### Principle 2 — No silent fact invention

If a required fact is missing, ask for it or return uncertainty.

### Principle 3 — Deterministic decisions for governed applicability

A language model should not become the hidden authority for regulated determinations.

### Principle 4 — Source scope follows the decision contract

Retrieval must not broaden legal applicability by itself.

### Principle 5 — AI is a language layer, not an authority layer

Use the model for understandable explanation, not for uncontrolled legal judgment.

### Principle 6 — Privileged credentials remain server-side

Never expose service-role keys, OAuth secrets, encryption secrets or provider tokens in public JavaScript.

### Principle 7 — Encrypt sensitive reusable server-side payloads before persistence

Infrastructure encryption is useful; application encryption provides another control for high-value reusable data.

### Principle 8 — Retention must be deliberate

Every new stored data category should have a reason, owner and lifecycle.

### Principle 9 — Security claims must match implementation

Do not turn an infrastructure-provider feature into a GrowWithHR certification claim.

### Principle 10 — Uncertainty is an acceptable result

“More information needed” or “specialist review” is safer than fabricated certainty.

---

# 55. Maintenance requirement for this document

This file describes the architecture as it exists at the snapshot date above.

It should be updated when any of the following changes:

- hosting provider;
- database provider or region;
- browser storage approach;
- authentication model;
- encryption algorithm or key-management approach;
- Company Workspace schema;
- retention period;
- deletion behaviour;
- Gmail/report delivery architecture;
- RAG provider;
- model provider;
- raw-data AI contract;
- Report ID architecture;
- Google Drive/source-governance architecture;
- legal-rule decision authority;
- data-protection roles;
- subprocessor list; or
- security certification/assurance status.

The architecture document should be treated as a living governance artefact, not a one-time marketing document.

---

# 56. Final summary

GrowWithHR's architecture can be reduced to one central idea:

> **The system should know what it is allowed to decide, what it is allowed to retrieve and what artificial intelligence is allowed to explain.**

The current product separates those responsibilities deliberately:

```text
User provides structured company facts
          │
          ▼
Deterministic rules make the product determination
          │
          ▼
Governed RAG retrieves only permitted source evidence
          │
          ▼
Artificial intelligence explains the fixed result
          │
          ▼
Report is shown, downloaded or emailed
```

Supporting this are:

- GitHub Pages for the public website;
- Render for the private backend;
- Supabase for the temporary reusable Company Workspace;
- AES-256-GCM for the reusable Company Data payload;
- hashed Recovery Codes for workspace access;
- Cloudflare Workers AI for explanation only;
- Cloudflare Durable Objects for persistent Report ID allocation;
- Google Drive/repository controls for governed source material;
- Gmail API for requested report delivery; and
- defined retention/deletion behaviour.

The system already contains meaningful privacy and security controls, but it should continue to describe itself accurately: **research-grade, deliberately governed and privacy-conscious—not yet independently certified enterprise security.**

The hardening roadmap is therefore part of the architecture, not an admission that the architecture has failed. Secure systems mature by identifying boundaries clearly, reducing unnecessary trust and continuously improving controls.

---

**Repository:** `hrtechifyed/GrowwithHR-Version2`  
**Document:** `HOW_GROWWITHHR_WORKS.md`  
**Architecture snapshot:** 19 August 2026
