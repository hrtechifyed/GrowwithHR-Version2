# GrowWithHR Product Roadmap

Current application version: `0.20.0`
Current public route: `/analyze-company.html`
Private-beta route: `/analyze-company-v3.html` with `complianceDnaV3: false`
Last updated: 6 August 2026

## Completed milestones

### M0 — Baseline and recovery (`0.15.1-beta`)

Complete. Established protected routes, persistence contracts, CI, deterministic fixtures and rollback records.

### M1 — Five-Act Story Foundation (`0.16.0-beta`)

Complete and validated. Added the isolated private-beta route, compatibility adapter and accessible Five-Act presentation.

### M2 — Explainable Recommendation Foundation (`0.16.0-beta`)

Complete and validated. Added confirmed and derived facts, deterministic rule evaluation, applicability/evidence separation and source traceability.

### M3 — Compliance Story and Safe Health Model (`0.18.0`)

Complete, validated and published. Added a versioned Compliance Story model, company snapshot, safe status counts, ranked priorities, grouped findings, assumptions and limitations without changing stable contracts.

### M4 — Explainable Intelligence (`0.19.0`)

Complete, validated and released. Added separate profile-completeness, applicability-certainty and evidence-coverage dimensions, information-gain questions, reproducible decision trace and founder-facing report integration without introducing a blended compliance score.

### M5 — Compliance Workspace Beta (`0.20.0`)

Complete, validated and released. Added a private browser-local workspace with tasks, owners, status history, due-date source states, evidence placeholders, calendar entries, strict JSON backup import/export, isolated reset and an in-memory fallback when browser storage is unavailable.

## Approval-gated milestone foundation

### M6 — Evidence and Persistence Beta (`0.21.0`, approval required)

The contract foundation is implemented and validated, but runtime persistence remains disabled. M6 is the only milestone authorised to change the storage and privacy posture and still requires explicit privacy, legal, security and release approval before activation.

Implemented contract scope:

- consent-based durable organisation profile contract;
- tenant and organisation isolation contract;
- database-backed task and evidence-metadata shapes;
- audit-event and status-history shapes;
- export and deletion receipts;
- encrypted backup and restore manifest;
- non-destructive migration receipt;
- continued browser-only support requirement.

Not activated:

- authentication;
- database connections;
- remote task or evidence storage;
- cross-device resume;
- cloud migration.

## Current hardening milestone

### M7 — RAG-Ready Hardening (`0.22.0`)

**Technical status: implemented, release exit pending.**

The M7 implementation freezes the profile, obligation, applicability and citation contracts; introduces explicit source lifecycle and effective-date handling; adds a read-only operational readiness endpoint, bounded monitoring, performance budgets, security controls, an executable disaster-recovery drill and an operator handoff package.

Implemented scope:

- seven versioned contract baselines with byte-identity checks;
- explicit `effectiveFrom`, `effectiveTo`, `reviewedAt` and supersession normalization;
- no inference of effective dates from publication or review dates;
- high-certainty presentation blocked for changed, superseded, future, unreviewed or date-unconfirmed sources;
- `GET /api/m7/readiness` with non-sensitive readiness and aggregate metrics;
- documented latency and reliability budgets;
- executable RAG-disable and deterministic-decision DR simulation;
- dedicated GitHub Actions workflow and archived DR artifact;
- technical and operational handoff documentation.

M7 does not activate new legal profiles or corpora, enable M6 persistence, make v3 public, change reports/PDFs/email or cut the v0.22.0 release.

### M7 release-exit gate

The release-exit gate remains open until **two consecutive qualified production releases** meet the documented reliability targets and have archived evidence for availability, latency, source-scope integrity, decision immutability, sensitive-data logging, rollback and disaster recovery.

Pull-request CI and repository-level drills are implementation evidence, not qualified production-release evidence. The canonical application version therefore remains `0.20.0` until an explicit coordinated release decision is made.

## Legal RAG activation sequence

The reusable RAG platform and M7 hardening do not approve a corpus. Each legal feature remains subject to the controlled sequence:

1. exact official files and integrity metadata;
2. reviewed page and section mappings;
3. approved facts and privacy boundaries;
4. approved deterministic rules;
5. curated reason-code-specific governed chunks;
6. legal, RAG, security, test and release approvals;
7. explicit runtime profile activation.

Blank review fields, source registration, tests or a prepared packet are not approval.

## Release gates

Every release must pass version consistency, compliance-data validation, the complete regression suite, stable/private browser coverage, responsive and keyboard checks, privacy/security review, release-manifest review and a documented rollback path.

Additional M7 gates:

- frozen contract identities remain unchanged or move through a versioned successor;
- source lifecycle coverage is measured using explicit dates only;
- deterministic decisions remain available with RAG and provider execution disabled;
- the DR drill and deployment smoke tests are archived;
- two consecutive qualified production releases satisfy the reliability ledger;
- explicit v0.22.0 release approval is recorded.

## Protected boundaries

- `/analyze-company.html` remains the public production and rollback path.
- `/analyze-company-v3.html` remains private and disabled by default.
- Existing browser-storage, report, PDF, email and delivery contracts remain protected.
- Remote persistence remains disabled until M6 approval.
- RAG retrieves approved sources and enriches explanations only; it never replaces deterministic applicability decisions.
