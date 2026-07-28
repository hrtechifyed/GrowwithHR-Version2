# GrowWithHR v0.20 and v0.21 Release Guardrails

Status: implementation and release-control specification  
Prepared: 28 July 2026  
Runtime impact: none  
Layout impact: none

## Purpose

This record converts the Compliance DNA program status update into repository-level guardrails for the completed v0.20.0 release and the planned v0.21.0 milestone. It deliberately makes no change to application functionality, routes, presentation, storage, delivery, assessment, report, PDF or email behaviour.

## v0.20.0 — Compliance Workspace Beta

v0.20.0 is the current canonical application release. The browser-local M5 workspace remains the approved implementation boundary.

Protected v0.20 characteristics:

- the public assessment route remains `/analyze-company.html`;
- the private v3 route and disabled-by-default feature flag remain unchanged;
- workspace state remains isolated to `growwithhr-compliance-workspace-v1`;
- tasks, calendar entries, status history and evidence placeholders remain browser-local;
- evidence placeholders do not represent uploaded evidence or proof of compliance;
- JSON export/import remains the portability and recovery mechanism;
- reset remains isolated from assessment, report, lead, PDF and delivery state;
- no account, authentication, database, server upload or cloud persistence is introduced.

Required v0.20 regression evidence before any v0.21 work is accepted:

1. `npm run version:check`
2. `npm run test:m5`
3. `npm run test:release`
4. `npm run test:release:e2e`
5. browser verification of workspace export/import, isolated reset and storage-unavailable fallback

## v0.21.0 — Evidence and Persistence Beta

v0.21.0 is an approval-gated milestone. It must not be treated as a routine version bump or as permission to connect the existing browser-local workspace to a database.

### Mandatory approvals before runtime implementation

Runtime implementation may begin only after repository evidence records explicit approval for:

- privacy architecture and data minimisation;
- legal basis, consent language and retention policy;
- authentication and tenant-isolation design;
- authorization model for profiles, tasks, evidence metadata and audit events;
- encryption, secrets, backup and restore controls;
- data export and deletion behaviour;
- incident response and rollback ownership.

Until those approvals are recorded, v0.21 work is limited to documentation, schemas, threat models, test fixtures, migration plans and non-runtime contract validation.

### Protected compatibility contracts

v0.21 must preserve the following unless a separately approved migration plan states otherwise:

- `/analyze-company.html` remains the stable public and rollback route;
- `/analyze-company-v3.html` remains private-beta;
- `complianceDnaV3` remains disabled by default;
- `growwithhr-advisory-briefing-v2` remains readable;
- `growwithhr-report`, `growwithhr-lead`, `growwithhr-advisory-delivery-v1` and `growwithhr-industry-catalog-v1` remain protected;
- `growwithhr-compliance-workspace-v1` remains readable and exportable;
- browser-generated PDF plus `POST /api/send-advisory` remains the delivery compatibility path;
- browser-only users remain supported;
- deterministic applicability decisions remain independent of persistence and future RAG capabilities.

### Approved v0.21 capability boundary

After approvals, implementation may add:

- consent-based durable organisation profiles;
- authenticated, tenant-isolated access;
- database-backed task and evidence metadata;
- immutable or append-only audit events where appropriate;
- cross-device resume;
- controlled export and deletion;
- backup and restore;
- local-to-remote migration with explicit user consent;
- read-only or local fallback when remote mode is unavailable or disabled.

The following remain out of scope unless separately approved:

- silent upload of existing browser data;
- storing evidence file content without an approved evidence-security design;
- changing legal-status language because persistence exists;
- replacing deterministic rules with AI or RAG output;
- public v3 cutover;
- framework migration;
- redesigning the assessment, report or workspace layout.

## Migration rules

1. Remote mode must be opt-in and must not activate solely because a user opens the existing workspace.
2. Existing local data must remain readable before, during and after rollout.
3. Migration must create a receipt containing source schema, destination schema, timestamp, item counts and outcome.
4. A failed migration must leave the local source unchanged.
5. Duplicate imports must be deterministic and idempotent.
6. Remote disablement must retain export and read-only access.
7. Deletion must cover primary data, indexed derivatives and documented backup expiry behaviour.
8. Tenant-bound identifiers must never be accepted from untrusted client input without server-side authorization.

## Minimum v0.21 contract set

Before product code is connected to persistence, the repository should contain reviewed contracts for:

- organisation profile;
- workspace task and status-history event;
- evidence metadata and evidence lifecycle state;
- calendar/obligation date and source state;
- consent record;
- audit event;
- export package;
- deletion request and completion receipt;
- backup and restore manifest;
- local-to-remote migration receipt.

Each contract must be versioned, schema-validated and include ownership, tenant boundary, timestamps, source provenance and safe handling of unknown fields.

## Release gates for v0.21.0

A coordinated v0.21.0 release must not be cut until all of the following are recorded:

- privacy, legal and security approvals;
- authentication and authorization tests;
- tenant-isolation tests, including negative cross-tenant cases;
- consent and withdrawal tests;
- local-only compatibility and migration tests;
- export and deletion tests;
- backup and restore drill;
- audit-event integrity tests;
- failure-mode and remote-disable rollback tests;
- complete maintained regression and browser suites;
- release manifest, known issues and rollback instructions.

## Rollback

The v0.21 rollback must be independently executable:

1. disable remote feature flags;
2. stop new remote writes;
3. preserve export and read-only retrieval;
4. return the UI to browser-local mode without changing its layout;
5. retain local workspace data and protected assessment/report keys;
6. record affected tenants, data state and recovery actions;
7. revert the focused release change without reverting unrelated v0.20 functionality.

## Change-control rule

Keep v0.20 maintenance, v0.21 contracts, v0.21 runtime implementation and the final v0.21 version cut in separate short-lived branches and pull requests. Do not combine a storage/privacy posture change with report architecture, public-route cutover, visual redesign or framework migration.
