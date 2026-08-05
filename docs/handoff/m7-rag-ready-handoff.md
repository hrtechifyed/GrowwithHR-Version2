# GrowWithHR M7 Operational Handoff

## Status

- Technical implementation: complete on the M7 branch.
- Target release: v0.22.0.
- Release cut: not performed.
- Release exit: pending two consecutive qualified production releases.
- New legal profiles or corpora activated: none.
- Remote persistence activated: no.
- Public v3 cutover: no.

## Authority model

```text
assessment answers
→ deterministic facts and rules
→ immutable decision
→ governed source retrieval
→ explanation-only provider
```

RAG and the provider cannot determine applicability, fill missing facts or change the decision.

## Key files

| Area | File |
|---|---|
| M7 contract | `data/architecture/m7-rag-ready-hardening.v1.json` |
| M7 schema | `schemas/m7-rag-ready-hardening.schema.v1.json` |
| Reliability ledger | `data/releases/m7-reliability-evidence.v1.json` |
| Source lifecycle | `growwithhr-rag/source-lifecycle.js` |
| Operational readiness | `server-m7-operational-readiness.js` |
| DR drill | `scripts/run-m7-dr-drill.mjs` |
| Architecture | `docs/architecture/m7-rag-ready-hardening.md` |

## Operator commands

```bash
npm ci
npm run test:m7
npm run drill:m7 -- --output m7-dr-drill.json
npm run test:release
```

## Runtime checks

```http
GET /api/m7/readiness
GET /api/legal-rag/status
```

Expected M7 readiness state before two production releases:

```text
implementationStatus: implemented-awaiting-release-evidence
releaseReady: false
releaseExitStatus: pending-production-evidence
```

This is correct and must not be manually changed to ready.

## Deployment configuration

Start lexical mode unless a separately approved rollout selects hybrid mode:

```env
LEGAL_RAG_RETRIEVAL_MODE=lexical
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
CLOUDFLARE_WORKERS_AI_FREE_ONLY=true
```

Keep provider credentials server-side. Do not add them to browser code, status output, logs, test fixtures or release records.

## Controlled disable and rollback

Disable explanation and hosted-provider execution:

```env
LEGAL_EXPLANATION_ENDPOINT_ENABLED=false
```

This must leave deterministic assessment, M2 traceability, M3 story, M4 intelligence, M5 browser-local workspace, report, PDF and email delivery available.

Repository rollback:

1. deploy the last v0.21.x-compatible commit or revert the M7 merge commit;
2. keep protected browser storage keys unchanged;
3. verify `/analyze-company.html` and `/api/send-advisory`;
4. verify a deterministic POSH decision without requesting an explanation;
5. archive the rollback record and timings.

## Source lifecycle operations

Every source used for high-certainty presentation must have explicit:

- stable source identifier;
- `effectiveFrom`;
- optional `effectiveTo`;
- `reviewedAt`;
- approved review status;
- supersession reference where applicable.

Never copy `reviewedAt`, publication date or a date mentioned in the title into `effectiveFrom` without controlled legal review.

Changed, superseded, future, date-unconfirmed or review-pending sources must block high-certainty presentation and route the output to specialist review. This gate does not alter the deterministic decision.

## Reliability qualification procedure

For each production release candidate:

1. deploy through the approved release process;
2. record commit, environment and observation window;
3. archive readiness and router latency distributions;
4. archive successful-request rate;
5. confirm zero source-scope and decision-mutation violations;
6. confirm zero sensitive-payload logging violations;
7. run and archive the DR/rollback drill;
8. record privacy, security and release approval;
9. add the release to `m7-reliability-evidence.v1.json` in a reviewed PR.

Only two consecutive qualified production releases satisfy the M7 exit gate. Pull-request CI is not a qualified release.

## Incident priorities

### P0

- deterministic decision mutation;
- unapproved source or source-scope expansion;
- credentials or sensitive assessment data exposed;
- cross-tenant persistence access;
- inability to disable the provider path.

Immediate action: disable explanation endpoints, preserve deterministic functionality, unpublish affected output and begin the rollback procedure.

### P1

- readiness or router p95 above budget;
- provider outage or repeated malformed output;
- catalogue load failure;
- source lifecycle metadata drift.

Immediate action: use lexical mode, disable the provider where necessary, keep deterministic results available and repair through a focused PR.

## Handoff acceptance checklist

- [ ] M7 contract and schema reviewed.
- [ ] Frozen contract identities verified.
- [ ] Source lifecycle test passed.
- [ ] Readiness endpoint smoke-tested in the deployment environment.
- [ ] M7 DR artifact archived.
- [ ] Full regression and browser suites passed.
- [ ] Security and privacy review recorded.
- [ ] Release owner identified.
- [ ] First production observation window completed.
- [ ] Second consecutive production observation window completed.
- [ ] Explicit v0.22.0 release approval recorded.

Unchecked release-evidence items do not block merging technical hardening, but they do block declaring M7 released or retiring the protected route.
