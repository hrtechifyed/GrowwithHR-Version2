# GrowWithHR RAG Research Area

This directory remains future research only. It is not built, deployed or used by the current public product.

## Deterministic legal-rule foundation

The provisional legal-rule assurance foundation is kept outside this research directory so applicability remains independent from retrieval and language-model components:

- `data/knowledge-base/laws/central/posh.json` — existing governed POSH legal-source record.
- `data/assessment/legal-applicability-rules.v1.json` — provisional POSH product-rule catalog, marked `needs-legal-review`.
- `js/assessment-v3/fact-mapper.js` — existing deterministic assessment-to-fact mapper.
- `js/assessment-v3/recommendation-evaluator.js` — existing deterministic condition evaluator.
- `js/assessment-v3/legal-rule-assurance.js` — legal-specific guardrails and decision envelope.
- `tests/legal-rule-assurance-checks.mjs` — source, boundary, determinism and role-separation checks.

The provisional catalog is private-beta and does not mutate `js/pdf-law-transparency-core.js`, the stable public report, PDF output, email delivery or protected browser-storage contracts.

## Mandatory architecture boundary

Assessment answers
→ deterministic fact mapping
→ governed legal-rule evaluation
→ registered official sources
→ constrained retrieval
→ hosted language model for explanation only
→ existing report generation

Retrieval and language models must not:

- invent or fill assessment facts;
- decide whether a law applies;
- change a deterministic status or reason code;
- treat an official source as legal approval;
- claim evidence verification;
- mutate protected report, PDF, storage or delivery contracts.

## Current implementation status

Implemented in the provisional foundation:

- one structured POSH product rule;
- explicit required facts and missing-information handling;
- deterministic threshold conditions;
- closed result statuses;
- Source Register IDs and exact Drive paths;
- effective-date metadata;
- `needs-legal-review` governance status;
- automated threshold and missing-fact scenarios.

Not implemented:

- Chroma or another vector database;
- embeddings;
- PageIndex;
- retrieval endpoints;
- hosted language-model calls;
- production report integration;
- legal approval.
