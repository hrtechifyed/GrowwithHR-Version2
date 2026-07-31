# GrowWithHR governed legal retrieval and explanation proof

This directory contains private-beta proofs of constrained official-source
retrieval and provider-neutral legal explanation. It is not connected to the
current public product, stable report, PDF generator, browser storage, email
delivery or customer-facing legal output.

## Mandatory execution order

1. Protected assessment answers are mapped to deterministic facts.
2. The governed legal-rule catalog produces a deterministic decision.
3. The decision supplies its approved Source Register IDs and reason code.
4. Retrieval runs only over governed chunks belonging to those source IDs.
5. A retrieval trace returns approved citations.
6. A provider-neutral explanation contract receives only the fixed decision
   reference and governed retrieval trace.
7. Any provider response is validated before it can be accepted as explanation.

Retrieval happens only after a deterministic decision. Explanation happens only
after completed governed retrieval. Explanation cannot change the deterministic decision,
status, reason code, facts or decision fingerprint.

## Implemented proof components

- `data/assessment/legal-applicability-rules.v1.json` - provisional POSH
  applicability rule, still marked `needs-legal-review`.
- `js/assessment-v3/legal-rule-assurance.js` - deterministic legal-assurance
  wrapper that runs before retrieval.
- `growwithhr-rag/data/posh-source-chunks.v1.json` - governed source manifest,
  source fingerprints, page references and curated POSH chunks.
- `growwithhr-rag/legal-source-retrieval.js` - pure deterministic retrieval and
  citation-trace module.
- `growwithhr-rag/legal-explanation-contract.js` - provider-neutral request,
  fallback, response validation and injected-provider runner.
- `schemas/legal-explanation-response.schema.v1.json` - strict structured
  response schema for explanation-only provider output.
- `scripts/verify-posh-source-pack.mjs` - optional offline verification of the
  private source pack against registered byte lengths and SHA-256 fingerprints.
- `tests/legal-source-retrieval-checks.mjs` - retrieval integration, isolation,
  fail-closed and architecture-boundary checks.
- `tests/legal-explanation-contract-checks.mjs` - explanation schema, citation,
  provider isolation and decision-override rejection checks.

The retrieval proof uses governed lexical metadata. It does not use embeddings or a vector database.
The explanation proof does not select or call a hosted provider; it accepts an
injected provider function only after the decision and retrieval traces already
exist.

## Retrieval trace contract

Each retrieval trace identifies:

- the deterministic rule ID, version, status and reason code;
- a decision fingerprint that remains stable when retrieval is disabled or
  retrieved text changes;
- the approved Source Register IDs requested by the decision;
- retrieved chunk IDs, page ranges, official URLs and source fingerprints;
- `usedForDecision: false` and `applicabilityAuthority: none`;
- `llmUsed: false`;
- `legalReviewStatus: needs-legal-review`.

Retrieval fails closed when a decision requests an unknown Source Register ID or
when a chunk does not resolve to a registered official source.

## Explanation contract

The provider-neutral explanation request contains:

- the fixed deterministic status, reason code and decision fingerprint;
- the completed retrieval fingerprint;
- only governed retrieved chunks and citation identifiers;
- no raw assessment-answer object and no authority to fill facts;
- explicit instructions that explanation is not legal advice or approval.

A provider response is accepted only when:

- its status, reason code and decision fingerprint exactly match the request;
- every rationale item cites at least one retrieved governed chunk;
- every cited chunk belongs to the approved retrieval trace;
- all mandatory legal-review and evidence limitations are present;
- `usedForDecision`, `mayChangeDecision` and `legalAdvice` are all `false`;
- no unexpected decision or applicability fields are returned;
- definitive certification wording is rejected.

A deterministic non-LLM fallback uses the same response contract. This makes the
explanation boundary testable before a hosted provider is selected.

## Optional private source-pack verification

The source PDFs are not committed to this repository. To verify a local export
of the private source pack, run:

```bash
npm run verify:posh-source-pack -- /absolute/path/to/GrowWithHR-RAG
```

The command verifies the three registered active POSH PDFs by byte length and
SHA-256 and rejects additional PDFs inside the active official POSH folders.
Archived files are outside the active ingestion boundary.

## Safety boundaries

Retrieval and explanation components must not:

- invent, infer or fill assessment facts;
- decide whether a law applies;
- change a deterministic status, reason code or fingerprint;
- retrieve or cite sources not approved by the decision;
- treat official-source status as legal approval;
- claim evidence verification or professional legal review;
- mutate protected report, PDF, storage or delivery contracts.

## Current implementation status

Implemented:

- deterministic POSH legal-rule assurance;
- verified three-source POSH manifest metadata;
- governed curated source chunks with page references;
- deterministic post-decision retrieval;
- visible decision and citation trace data;
- strict provider-neutral explanation request and response contract;
- deterministic non-LLM explanation fallback;
- injected-provider validation and decision-override rejection;
- retrieval and explanation isolation tests;
- source-pack fingerprint verification command.

Not implemented:

- automatic PDF text extraction in production;
- embeddings or vector search;
- Chroma or another vector database;
- PageIndex;
- retrieval HTTP endpoints;
- a selected hosted language-model provider or SDK;
- provider credentials or environment configuration;
- production report, UI or PDF integration;
- legal approval.
