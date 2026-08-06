# GrowWithHR M7 RAG-Ready Hardening

**Target release:** v0.22.0  
**Implementation contract:** `0.22.0-hardening.1`  
**Implementation status:** Implemented; release exit pending production evidence  
**Authority boundary:** Deterministic rules decide. Retrieval supplies governed sources. The provider explains only.

## Purpose

M7 converts the existing Compliance DNA, workspace, persistence-contract and governed RAG foundations into a stable handoff and operations baseline. It does not approve a legal corpus, enable remote persistence, cut v0.22.0 or make the private v3 route public.

The milestone follows the status-plan scope:

- freeze profile, obligation, applicability and citation contracts;
- normalize source lifecycle and explicit effective dates;
- add monitoring, performance and security controls;
- provide an executable disaster-recovery drill;
- publish a technical and operational handoff package.

## Frozen contracts

The freeze manifest is stored at:

```text
data/architecture/m7-rag-ready-hardening.v1.json
```

It records seven baseline contract files and their Git blob identities:

1. M6 profile and persistence schema;
2. M5 browser-local obligation/workspace model;
3. M2 traceability schema;
4. M2 traceability runtime;
5. provisional deterministic legal-rule catalogue;
6. legal explanation response/citation schema;
7. provider-neutral citation runtime.

The contract test recomputes the Git blob identity from file bytes. Silent changes fail CI. Breaking changes require a new major contract version rather than editing the frozen v1 contract in place.

The M6 profile contract remains runtime-disabled. M7 hardening does not bypass the M6 privacy, legal and security approval gate.

## Source lifecycle and effective dates

`growwithhr-rag/source-lifecycle.js` normalizes only explicit fields:

```text
effectiveFrom
effectiveTo
reviewedAt
supersededBy
reviewStatus
```

A review date, publication date, title or document text is never inferred to be an effective date.

Allowed lifecycle states:

```text
current
not-yet-effective
superseded
effective-date-unconfirmed
review-required
```

High-certainty presentation is blocked unless every source is explicitly current, uniquely identified and approved. The gate does not change the deterministic decision; it returns a presentation restriction and a specialist-review requirement.

## Operational readiness

Read-only route:

```text
GET /api/m7/readiness
```

The response contains:

- implementation and release-exit status;
- frozen-contract count and categories;
- active and blocked profile counts;
- governed catalogue, source and chunk counts;
- process-local bounded metrics;
- performance budgets;
- security controls;
- disaster-recovery mode;
- activation boundaries.

It does not include raw assessment answers, evidence, chunk text, prompts, credentials or provider tokens.

### Performance budgets

- readiness route p95: 250 ms;
- shared router overhead p95: 150 ms, excluding hosted-provider time;
- metric samples: maximum 200 per operation;
- request body: maximum 16 KiB.

These are contract budgets. Production qualification requires archived measurements rather than test-only measurements.

## Monitoring

The process-local monitor records only:

- operation name;
- duration;
- success or failure;
- bounded result code;
- timestamp and aggregate percentiles.

Tracked operations are `m7-readiness`, `legal-rag-status` and `legal-explanation`. No payload body is accepted by the monitor.

For horizontally scaled production, the same minimal event contract can be exported to an approved central metrics service in a separate infrastructure change. This implementation does not add a telemetry vendor or secret.

## Security boundary

M7 preserves the existing controls:

- credentials remain server-only;
- readiness output contains no secrets;
- blocked profiles fail before provider execution;
- catalogue paths remain repository-relative and path-safe;
- retrieval cannot expand source or reason-code scope;
- provider output cannot mutate a decision;
- no automatic second-provider or deterministic explanation fallback is introduced;
- remote persistence remains disabled.

## Disaster recovery

Command:

```bash
npm run drill:m7
```

Optional evidence file:

```bash
npm run drill:m7 -- --output m7-dr-drill.json
```

The executable repository drill verifies:

1. every frozen contract still matches its baseline identity;
2. deterministic POSH evaluation succeeds before RAG;
3. the explanation endpoint can be disabled without calling the provider;
4. the deterministic decision remains available and unchanged;
5. source lifecycle blocks date-unconfirmed high-certainty output;
6. remote persistence is not required;
7. the readiness contract does not claim release completion.

This is a technical DR simulation. It is not a production traffic rollback. Production rollback evidence must be archived separately.

## Reliability exit gate

The document requires reliability targets to be met for two consecutive releases. The ledger is:

```text
data/releases/m7-reliability-evidence.v1.json
```

It intentionally starts with zero qualified releases. CI and pull-request checks are candidate evidence, not production-release evidence.

A release qualifies only when it is deployed, observed for the approved window and has archived evidence for:

- at least 99.5% successful requests;
- readiness p95 at or below 250 ms;
- router overhead p95 at or below 150 ms;
- zero source-scope violations;
- zero deterministic-decision mutations;
- zero sensitive-payload logging violations;
- a passing DR drill and rollback record.

M7 technical implementation can be complete while the v0.22.0 release exit remains pending.

## Validation

```bash
npm run test:m7
npm run drill:m7
npm test
```

The dedicated workflow runs M7 tests and archives the drill artifact for pull requests and manual executions.

## Rollback

Revert the M7 pull request or deploy the last v0.21.x-compatible release. Disable legal explanation endpoints with:

```text
LEGAL_EXPLANATION_ENDPOINT_ENABLED=false
```

The public v2 route, browser-local workspace, report, PDF and email delivery remain available. Deterministic decisions do not depend on RAG or the hosted provider.
