# GrowWithHR Product Roadmap

Current application version: `0.20.0`
Current public route: `/analyze-company.html`
Private-beta route: `/analyze-company-v3.html` with `complianceDnaV3: false`
Last updated: 27 July 2026

## Completed milestones

### M0 — Baseline and recovery (`0.15.1-beta`)
Complete. Established protected routes, persistence contracts, CI, deterministic fixtures and rollback records.

### M1 — Five-Act Story Foundation (`0.16.0-beta`)
Complete and validated. Added the isolated private-beta route, compatibility adapter and accessible Five-Act presentation.

### M2 — Explainable Recommendation Foundation (`0.16.0-beta`)
Complete and validated. Added confirmed/derived facts, deterministic rule evaluation, applicability/evidence separation and source traceability.

### M3 — Compliance Story and Safe Health Model (`0.18.0`)
Complete, validated and published. Added a versioned Compliance Story model, company snapshot, safe status counts, ranked priorities, grouped findings, assumptions and limitations without changing stable contracts.

### M4 — Explainable Intelligence (`0.19.0`)
Complete, validated and released. Added separate profile-completeness, applicability-certainty and evidence-coverage dimensions, information-gain questions, reproducible decision trace and founder-facing report integration without introducing a blended compliance score.

### M5 — Compliance Workspace Beta (`0.20.0`)
Complete, validated and released. Added a private browser-local workspace with tasks, owners, status history, due-date source states, evidence placeholders, calendar entries, strict JSON backup import/export, isolated reset and an in-memory fallback when browser storage is unavailable.

## Next milestone

### M6 — Evidence and Persistence Beta (`0.21.0`, approval required)

M6 is the only milestone authorised to change the storage and privacy posture. It requires explicit privacy, legal and security approval before implementation.

Planned scope:

- consent-based durable organisation profiles;
- authentication and tenant isolation;
- database-backed tasks and evidence metadata;
- audit events and status history;
- export and deletion controls;
- backup and restore;
- continued support for browser-only users and local export.

## Later milestone

- **M7 — RAG-ready hardening (`0.22.0`, planned):** frozen profile, obligation, applicability and citation contracts; normalized sources and effective dates; monitoring, performance, security, disaster-recovery and handoff evidence. RAG must never replace deterministic applicability decisions.

## Release gates

Every release must pass version consistency, compliance-data validation, the complete regression suite, stable/private browser coverage, responsive and keyboard checks, privacy/security review, release-manifest review and a documented rollback path.