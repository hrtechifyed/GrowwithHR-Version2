# GrowWithHR governed legal retrieval and explanation proof

This directory contains private-beta proofs of constrained official-source
retrieval, governed legal explanation, one server-only hosted provider adapter
and a disabled-by-default POSH explanation endpoint. It is not connected to the
current public assessment UI, stable report, PDF generator, browser storage,
email delivery or customer-facing legal output.

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
9. The endpoint returns the fixed decision, citation metadata and accepted
   explanation without returning or logging the submitted assessment answers.

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
- `server-legal-explanation.js` - disabled-by-default server endpoint,
  deterministic orchestration, response minimisation, in-flight request sharing,
  bounded concurrency, success cache and provider-failure backoff.
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
- `tests/legal-explanation-endpoint-checks.mjs` - endpoint input, privacy,
  concurrency, caching, backoff and HTTP-boundary checks.

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
contract. The Cloudflare adapter and live endpoint do not automatically invoke
it and do not retry through another hosted provider. Cloudflare quota, timeout,
authentication or invalid-output failures therefore fail closed.

## Private POSH explanation endpoint

Route:

```text
POST /api/legal-explanation/posh
```

The endpoint is disabled unless this server variable is present:

```text
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
```

The request body may contain only:

```json
{
  "answers": {
    "employees": 10,
    "primaryState": "Maharashtra",
    "locations": 1
  }
}
```

Missing fields remain missing and produce the deterministic
`more-information-needed` path. Unknown fields are rejected so names, email
addresses, company information, evidence and the wider assessment object cannot
enter this endpoint accidentally.

The server recomputes the POSH decision from the governed rule catalog. It does
not trust a decision, retrieval trace, source ID, citation or explanation sent
by the browser. Only the resulting protected explanation request is sent to
Cloudflare. The response omits raw answers, mapped facts and governed chunk text;
it returns the deterministic decision, citation metadata and validated
explanation envelope.

### Free-capacity protection for simultaneous users

Identical deterministic decision and retrieval fingerprints share one in-flight
Cloudflare request. The accepted result is then cached in memory. With the
current single POSH rule, 50 simultaneous users who produce the same outcome
create one provider request rather than 50. Simultaneous users split across the
current three possible POSH outcomes create at most one provider request per
distinct outcome while those requests are in flight or cached.

The cache contains no assessment answers. It is process-local and is cleared
when the server restarts. Provider failures are not treated as successful
responses; a short backoff prevents repeated requests from immediately consuming
more free capacity.

Optional endpoint controls:

```text
LEGAL_EXPLANATION_CACHE_TTL_MS=21600000
LEGAL_EXPLANATION_FAILURE_BACKOFF_MS=60000
LEGAL_EXPLANATION_MAX_CONCURRENCY=4
LEGAL_EXPLANATION_MAX_QUEUE=100
```

The success-cache TTL is restricted to 5 minutes-24 hours. Failure backoff is
restricted to 5 seconds-5 minutes. Distinct Cloudflare requests are bounded to
1-20 concurrent requests and a queue of 1-500 requests.

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
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
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

Retrieval, explanation, hosted-provider and endpoint components must not:

- invent, infer or fill assessment facts;
- decide whether a law applies;
- change a deterministic status, reason code or fingerprint;
- trust a browser-supplied decision, source ID, citation or explanation;
- retrieve or cite sources not approved by the decision;
- treat official-source status as legal approval;
- claim evidence verification or professional legal review;
- expose provider credentials to browser code;
- return raw assessment answers or mapped facts;
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
- disabled-by-default `/api/legal-explanation/posh` server endpoint;
- server-side deterministic recomputation and source retrieval;
- input allow-listing and response data minimisation;
- fingerprint-based in-flight request sharing and success caching;
- bounded concurrency and provider-failure backoff;
- server-environment configuration validation;
- timeout, quota, authentication and malformed-output handling;
- injected-provider validation and decision-override rejection;
- retrieval, explanation, mocked Cloudflare and endpoint isolation tests;
- source-pack fingerprint verification command.

Not implemented:

- automatic PDF text extraction in production;
- embeddings or vector search;
- Chroma or another vector database;
- PageIndex;
- public assessment-page invocation of the endpoint;
- production report, UI or PDF integration;
- a live Cloudflare credential test in CI;
- a shared cache across multiple server instances;
- a second hosted provider or paid fallback;
- legal approval.
