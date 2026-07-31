# GrowWithHR governed legal retrieval and explanation proof

This directory contains private-beta proofs of constrained official-source
retrieval, governed legal explanation and one server-only hosted provider
adapter. It is not connected to the current public product, stable report, PDF
generator, browser storage, email delivery or customer-facing legal output.

## Mandatory execution order

1. Protected assessment answers are mapped to deterministic facts.
2. The governed legal-rule catalog produces a deterministic decision.
3. The decision supplies its approved Source Register IDs and reason code.
4. Retrieval runs only over governed chunks belonging to those source IDs.
5. A retrieval trace returns approved citations.
6. A provider-neutral explanation contract receives only the fixed decision
   reference and governed retrieval trace.
7. The Cloudflare adapter may send that protected request to the approved model.
8. The explanation contract validates any provider response before acceptance.

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
  deterministic fallback, response validation and injected-provider runner.
- `growwithhr-rag/cloudflare-workers-ai-provider.cjs` - server-only Cloudflare
  REST adapter fixed to `@cf/qwen/qwen3-30b-a3b-fp8`.
- `schemas/legal-explanation-response.schema.v1.json` - strict structured
  response schema for explanation-only provider output.
- `scripts/verify-posh-source-pack.mjs` - optional offline verification of the
  private source pack against registered byte lengths and SHA-256 fingerprints.
- `tests/legal-source-retrieval-checks.mjs` - retrieval integration, isolation,
  fail-closed and architecture-boundary checks.
- `tests/legal-explanation-contract-checks.mjs` - explanation schema, citation,
  provider isolation and decision-override rejection checks.
- `tests/cloudflare-workers-ai-provider-checks.mjs` - mocked Cloudflare request,
  free-only configuration, quota, output and contract-boundary checks.

The retrieval proof uses governed lexical metadata. It does not use embeddings or a vector database.
The hosted-provider proof uses the Cloudflare Workers AI REST endpoint. It has no second hosted provider.
It does not add a Cloudflare SDK, browser credentials or a browser-to-provider request.

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

The deterministic non-LLM explanation remains part of the provider-neutral
contract. The Cloudflare adapter does not automatically invoke it and does not
retry through another hosted provider. Cloudflare quota, timeout, authentication
or invalid-output failures therefore fail closed at the adapter boundary.

## Cloudflare Workers AI configuration

Approved provider and model:

```text
Provider: Cloudflare Workers AI
Model: @cf/qwen/qwen3-30b-a3b-fp8
Mode: free-only proof
```

Create a Workers AI API token and copy the Cloudflare Account ID. Configure
these values only in the server environment:

```text
CLOUDFLARE_ACCOUNT_ID=<Cloudflare account ID>
CLOUDFLARE_WORKERS_AI_API_TOKEN=<Workers AI API token>
CLOUDFLARE_WORKERS_AI_FREE_ONLY=true
CLOUDFLARE_WORKERS_AI_TIMEOUT_MS=12000
```

`CLOUDFLARE_WORKERS_AI_TIMEOUT_MS` is optional and is restricted to 1,000-30,000
milliseconds. The adapter always uses the fixed approved model, a maximum of 400
output tokens and one Cloudflare request. It does not log or return the API
token.

For free-only operation, keep the Cloudflare account on the Workers Free plan
and do not enable paid overage. `CLOUDFLARE_WORKERS_AI_FREE_ONLY=true` is an
explicit deployment guard, but it cannot inspect the Cloudflare billing plan.
When the free allocation or a provider rate limit is unavailable, the adapter
returns `cloudflare-free-quota-or-rate-limit` and makes no alternate-provider
request.

Cloudflare accepts a requested response schema, but provider output is never
trusted directly. The existing GrowWithHR explanation contract revalidates the
status, reason code, decision fingerprint, citations, limitations and legal
review flags before accepting the explanation.

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

Retrieval, explanation and hosted-provider components must not:

- invent, infer or fill assessment facts;
- decide whether a law applies;
- change a deterministic status, reason code or fingerprint;
- retrieve or cite sources not approved by the decision;
- treat official-source status as legal approval;
- claim evidence verification or professional legal review;
- expose provider credentials to browser code;
- mutate protected report, PDF, storage or delivery contracts.

## Current implementation status

Implemented:

- deterministic POSH legal-rule assurance;
- verified three-source POSH manifest metadata;
- governed curated source chunks with page references;
- deterministic post-decision retrieval;
- visible decision and citation trace data;
- strict provider-neutral explanation request and response contract;
- deterministic non-LLM explanation capability;
- Cloudflare Workers AI free-only Qwen provider adapter;
- server-environment configuration validation;
- timeout, quota, authentication and malformed-output handling;
- injected-provider validation and decision-override rejection;
- retrieval, explanation and mocked Cloudflare isolation tests;
- source-pack fingerprint verification command.

Not implemented:

- automatic PDF text extraction in production;
- embeddings or vector search;
- Chroma or another vector database;
- PageIndex;
- a public legal-explanation HTTP endpoint;
- production assessment, report, UI or PDF integration;
- a live Cloudflare credential test in CI;
- a second hosted provider or paid fallback;
- legal approval.
