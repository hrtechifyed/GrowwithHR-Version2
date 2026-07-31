# GrowWithHR governed legal retrieval proof

This directory contains a private-beta proof of constrained official-source
retrieval. It is not connected to the current public product, stable report,
PDF generator, browser storage, email delivery or customer-facing legal output.

## Mandatory execution order

1. Protected assessment answers are mapped to deterministic facts.
2. The governed legal-rule catalog produces a deterministic decision.
3. The decision supplies its approved Source Register IDs and reason code.
4. Retrieval runs only over governed chunks belonging to those source IDs.
5. A retrieval trace returns citations for later explanation.

Retrieval happens only after a deterministic decision. Disabling retrieval must
not change the decision status, reason code, facts or decision fingerprint.

## Implemented proof components

- `data/assessment/legal-applicability-rules.v1.json` - provisional POSH
  applicability rule, still marked `needs-legal-review`.
- `js/assessment-v3/legal-rule-assurance.js` - deterministic legal-assurance
  wrapper that runs before retrieval.
- `growwithhr-rag/data/posh-source-chunks.v1.json` - governed source manifest,
  source fingerprints, page references and curated POSH chunks.
- `growwithhr-rag/legal-source-retrieval.js` - pure deterministic retrieval and
  citation-trace module.
- `scripts/verify-posh-source-pack.mjs` - optional offline verification of the
  private source pack against registered byte lengths and SHA-256 fingerprints.
- `tests/legal-source-retrieval-checks.mjs` - integration, isolation,
  fail-closed and architecture-boundary checks.

The proof uses governed lexical metadata. It does not use embeddings or a
vector database. It also does not use Chroma, PageIndex, a hosted language
model or a retrieval endpoint.

## Retrieval trace contract

Each trace identifies:

- the deterministic rule ID, version, status and reason code;
- a decision fingerprint that remains stable when retrieval is disabled or
  retrieved text changes;
- the approved Source Register IDs requested by the decision;
- retrieved chunk IDs, page ranges, official URLs and source fingerprints;
- `usedForDecision: false` and `applicabilityAuthority: none`;
- `llmUsed: false`;
- `legalReviewStatus: needs-legal-review`.

Retrieval must fail closed when a decision requests an unknown Source Register
ID or when a chunk does not resolve to a registered official source.

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

Retrieval and later explanation components must not:

- invent, infer or fill assessment facts;
- decide whether a law applies;
- change a deterministic status or reason code;
- retrieve sources not approved by the decision;
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
- retrieval-disable and changed-content isolation tests;
- source-pack fingerprint verification command.

Not implemented:

- automatic PDF text extraction in production;
- embeddings or vector search;
- Chroma or another vector database;
- PageIndex;
- retrieval HTTP endpoints;
- hosted language-model explanation;
- production report or PDF integration;
- legal approval.
