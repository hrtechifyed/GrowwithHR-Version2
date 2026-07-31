# GrowWithHR governed legal retrieval and explanation proof

This directory contains the private-beta POSH legal-rule assurance, governed
source retrieval, provider-neutral explanation contract, one server-only
Cloudflare Workers AI adapter, and a disabled-by-default POSH explanation
endpoint. It is not connected to the current public assessment UI, stable
report, PDF generator, browser storage, email delivery, or customer-facing
legal output.

## Mandatory execution order

1. Protected assessment answers are mapped to deterministic facts.
2. The governed legal-rule catalog produces a deterministic decision.
3. The decision supplies its approved Source Register IDs and reason code.
4. Retrieval runs only over governed chunks belonging to those source IDs.
5. A retrieval trace returns approved citations.
6. A provider-neutral explanation contract receives only the fixed decision
   reference and governed retrieval trace.
7. The Cloudflare adapter may send that protected request to the approved Llama
   JSON Mode model.
8. The explanation contract validates the provider output before acceptance.
9. The endpoint returns a minimized response without raw assessment answers or
   governed chunk text.

Retrieval happens only after a deterministic decision. Explanation happens only
after completed governed retrieval.
Retrieval and explanation cannot change the deterministic decision, status, reason code, facts, or decision fingerprint.

## Implemented components

- `data/assessment/legal-applicability-rules.v1.json` — provisional POSH rule,
  still marked `needs-legal-review`.
- `js/assessment-v3/legal-rule-assurance.js` — deterministic legal-assurance
  evaluation before retrieval.
- `growwithhr-rag/data/posh-source-chunks.v1.json` — governed official-source
  manifest and curated POSH chunks.
- `growwithhr-rag/legal-source-retrieval.js` — deterministic post-decision
  retrieval and citation trace.
- `growwithhr-rag/legal-explanation-contract.js` — provider-neutral request,
  response validation, deterministic capability, and injected-provider runner.
- `growwithhr-rag/cloudflare-workers-ai-provider.cjs` — free-only Cloudflare
  REST adapter fixed to `@cf/meta/llama-3.1-8b-instruct-fast`.
- `server-legal-explanation.js` — disabled-by-default server endpoint,
  deterministic orchestration, response minimization, request sharing, cache,
  bounded concurrency, and provider-failure backoff.
- `schemas/legal-explanation-response.schema.v1.json` — strict accepted-response
  contract.
- `tests/` — deterministic, retrieval, explanation, Cloudflare, endpoint,
  privacy, concurrency, and fail-closed checks.

The retrieval proof uses governed lexical metadata. It does not use embeddings or a vector database, Chroma, or PageIndex.

## Retrieval boundary

Each retrieval trace records the deterministic rule, version, status, reason
code, decision fingerprint, approved Source Register IDs, retrieved chunk IDs,
page ranges, official URLs, and source fingerprints. It also records:

```text
usedForDecision: false
applicabilityAuthority: none
llmUsed: false
legalReviewStatus: needs-legal-review
```

Retrieval refuses unknown Source Register IDs and chunks that do not resolve to
a registered official source.

## Explanation contract

The protected provider request contains the fixed deterministic status, reason
code, decision fingerprint, completed retrieval fingerprint, governed chunks,
and citation identifiers. It contains no raw assessment-answer object and gives
no authority to fill facts or determine legal applicability.

A provider response is accepted only when:

- status, reason code, and decision fingerprint match exactly;
- every rationale item cites at least one governed retrieved chunk;
- every citation belongs to the approved retrieval trace;
- all required legal-review and evidence limitations are present;
- `usedForDecision`, `mayChangeDecision`, and `legalAdvice` are `false`;
- no unexpected applicability or decision properties are present;
- definitive compliance, certification, or legal-approval language is absent.

The deterministic non-LLM explanation capability remains in the
provider-neutral contract, but the Cloudflare adapter and live endpoint do not
invoke it automatically. There is no second hosted provider, paid fallback, or
automatic deterministic fallback. Provider failure must fail closed.

## Cloudflare Llama JSON Mode

Approved provider and model:

```text
Provider: Cloudflare Workers AI
Model: @cf/meta/llama-3.1-8b-instruct-fast
Mode: free-only
Structured output: Cloudflare JSON Mode
```

Cloudflare lists this model as supporting JSON Mode. The adapter sends:

```text
response_format.type = json_schema
```

The provider receives a compatibility schema that preserves the required object
shape, required fields, enumerated protected values, arrays, and nested objects.
Schema keywords that are unnecessary for generation are omitted from the
provider request. The committed GrowWithHR explanation contract remains the
strict final validator and still enforces exact fingerprints, exact decision
status and reason code, required limitation statements, governed citations,
length limits, prohibited claims, and all legal-review flags.

Cloudflare JSON Mode returns the generated object under:

```text
result.response
```

The adapter accepts only a JSON object or a string containing one complete JSON
object in that field. Arrays, markdown fences, fragments, malformed JSON, other
response envelopes, and decision changes fail closed.

## Private POSH explanation endpoint

Route:

```text
POST /api/legal-explanation/posh
```

The endpoint is disabled unless:

```text
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
```

Allowed request body:

```json
{
  "answers": {
    "employees": 10,
    "primaryState": "Maharashtra",
    "locations": 1
  }
}
```

Unknown fields are rejected. Names, email addresses, company information,
evidence, wider assessment objects, browser-supplied decisions, citations, and
explanations are not accepted.

The server recomputes the POSH decision, runs governed retrieval, builds the
protected request, calls Cloudflare, validates the response, and returns only
the fixed decision, citation metadata, and accepted explanation envelope.

### Free-capacity protection

Identical decision and retrieval fingerprints share one in-flight Cloudflare request and one process-local success-cache entry.
The automated test covers 50 simultaneous identical requests and expects one provider request, one cache miss, and 49 shared responses.
Distinct outcomes may each require one provider request.

The cache contains no assessment answers and is cleared when the server process
restarts. Provider failures are not cached as successful responses. A short
backoff prevents repeated failed calls from immediately consuming more free
capacity.

Optional controls:

```text
LEGAL_EXPLANATION_CACHE_TTL_MS=21600000
LEGAL_EXPLANATION_FAILURE_BACKOFF_MS=60000
LEGAL_EXPLANATION_MAX_CONCURRENCY=4
LEGAL_EXPLANATION_MAX_QUEUE=100
```

## Server configuration

Required server-only values:

```text
CLOUDFLARE_ACCOUNT_ID=<Cloudflare account ID>
CLOUDFLARE_WORKERS_AI_API_TOKEN=<Workers AI API token>
CLOUDFLARE_WORKERS_AI_FREE_ONLY=true
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
```

Optional provider timeout:

```text
CLOUDFLARE_WORKERS_AI_TIMEOUT_MS=12000
```

The adapter always uses the fixed Llama JSON Mode model, a maximum of 1,000
output tokens, and one Cloudflare request. It does not log or return the API
token. Keep the Cloudflare account on the Workers Free plan and do not enable
paid overage. The `CLOUDFLARE_WORKERS_AI_FREE_ONLY=true` setting is an explicit
deployment guard, but it cannot inspect the Cloudflare billing plan.

When free allocation or rate capacity is unavailable, the adapter returns
`cloudflare-free-quota-or-rate-limit` and makes no alternate-provider request.
Timeout, authentication, network, JSON Mode, malformed-output, and
contract-validation failures also fail closed.

## Optional source-pack verification

The official source PDFs are not committed to this repository. Verify a local
source-pack export with:

```bash
npm run verify:posh-source-pack -- /absolute/path/to/GrowWithHR-RAG
```

The command verifies the three registered active POSH PDFs by byte length and
SHA-256 and rejects extra PDFs in the active official POSH folders.

## Safety boundaries

Retrieval, explanation, provider, and endpoint components must not:

- invent, infer, or fill assessment facts;
- decide whether a law applies;
- change deterministic status, reason code, or fingerprints;
- trust browser-supplied decisions, sources, citations, or explanations;
- retrieve or cite unapproved sources;
- treat official-source status as legal approval;
- claim evidence verification or professional legal review;
- expose provider credentials to browser code;
- return raw assessment answers or mapped facts;
- mutate the protected report, PDF, storage, email, or delivery contracts.

## Current limitations

Not implemented:

- public assessment-page invocation;
- stable report, UI, email, or PDF integration;
- live Cloudflare credential calls in CI;
- shared cache across multiple server instances;
- a second hosted provider or paid fallback;
- automatic PDF text extraction;
- embeddings, vector search, Chroma, or PageIndex;
- legal approval.
