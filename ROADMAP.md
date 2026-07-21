# GrowWithHR Product Roadmap

Current application version: `0.18.0`
Current public route: `/analyze-company.html`
Private-beta route: `/analyze-company-v3.html` with `complianceDnaV3: false`
Last updated: 21 July 2026

## Completed milestones

### M0 — Baseline and recovery (`0.15.1-beta`)
Complete. Established protected routes, persistence contracts, CI, deterministic fixtures and rollback records.

### M1 — Five-Act Story Foundation (`0.16.0-beta`)
Complete and validated. Added the isolated private-beta route, compatibility adapter and accessible Five-Act presentation.

### M2 — Explainable Recommendation Foundation (`0.16.0-beta`)
Complete and validated. Added confirmed/derived facts, deterministic rule evaluation, applicability/evidence separation and source traceability.

### M3 — Compliance Story and Safe Health Model (`0.18.0`)
Complete, validated and published. Added a versioned Compliance Story model, company snapshot, safe status counts, ranked priorities, grouped findings, assumptions and limitations without changing stable contracts.

## Next milestone

### M4 — Compliance Action Planning (`0.19.0`, planned)

Candidate scope:

- convert governed findings into local action items;
- owner, target-date and status fields;
- policy/checklist views;
- local export-ready summaries;
- no cloud persistence, accounts or document upload.

M4 must consume M2/M3 governed outputs and must not recreate applicability logic in the UI.

## Later milestones

- **M5 — Browser-local workspace (`0.20.0`, planned):** local tasks, calendar and optional local backup/import.
- **M6 — Consent-based persistence (`0.21.0`, approval required):** authentication, tenant isolation, retention, deletion/export and audit controls.
- **M7 — RAG-ready hardening (`0.22.0`, planned):** frozen citation contracts, source lifecycle, monitoring, security and disaster-recovery evidence. RAG must never replace deterministic applicability decisions.

## Release gates

Every release must pass version consistency, compliance-data validation, the complete regression suite, stable/private browser coverage, responsive and keyboard checks, privacy/security review, release-manifest review and a documented rollback path.
