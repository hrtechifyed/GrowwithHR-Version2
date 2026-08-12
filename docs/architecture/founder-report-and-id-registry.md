# Founder report and report-ID registry

## Purpose

GrowWithHR exposes one founder-facing report format across the website, PDF download and email delivery.

The report is an applicability and growth report. It is not a compliance score, compliance audit, legal opinion or certification that obligations have or have not been completed.

## Single report format

The supported report format is:

- clean white HRTechify presentation;
- one standard PDF only;
- no Light / Dark / Both selector;
- no scorecards or compliance percentages;
- no evidence-upload controls;
- front cover with the HRTechify logo centred;
- end page mirroring the cover with `END OF REPORT`;
- company facts before conclusions;
- deterministic result shown separately from the governed Legal RAG explanation;
- explicit missing-information and growth-reassessment sections.

Both `/api/send-advisory` and `/api/send-advisory-v2` are intercepted by the single-report delivery handler and reject requests containing more than one PDF or a dark report variant.

## Founder-facing result language

The report uses these states:

- `Relevant now` — the deterministic result is currently `Applicable` based on supplied company facts.
- `Review needed` — the deterministic result is `Review required` and needs a legal/jurisdiction confirmation before a stronger conclusion.
- `More information required` — one or more required company facts are missing.
- `Watch as you grow` — the area is not currently triggered but should be reassessed after a relevant company change.

These states describe applicability. They do not describe whether the organisation has already implemented an obligation.

## Report ID format

Every generated PDF must reserve a server-issued report ID before PDF rendering begins.

Format:

```text
GWHR-{YYYY}-{MMDD}-{SEQUENCE}
```

The sequence is global and never resets when the date changes.

Initial range:

```text
AA01 ... AA99
AB01 ... AB99
...
ZZ01 ... ZZ99
```

After `ZZ99`, the sequence expands symmetrically:

```text
ZZ99 -> AAA001
...
ZZZ999 -> AAAA0001
```

The same rule continues by adding one letter and one digit whenever the current namespace is exhausted.

Example:

```text
GWHR-2027-0412-ZZ99
GWHR-2027-0412-AAA001
GWHR-2027-0413-AAA002
```

The date is the report-generation date in `Asia/Kolkata`. It is not part of the uniqueness counter.

## Durable registry architecture

GrowWithHR reuses its existing Cloudflare platform rather than adding a second database vendor or requiring a paid Render disk.

```text
Founder browser
  -> Render Free: POST /api/report-id
  -> authenticated server-to-server request
  -> growwithhr-version2 Cloudflare Worker
  -> one named ReportIdRegistry Durable Object
  -> SQLite-backed Durable Object storage
```

The browser continues to call `/api/report-id`. It never receives the Cloudflare allocator secret and never writes directly to the durable registry.

`server-report-id-registry.js`:

- keeps the current public `/api/report-id` and `/api/report-id/status` contracts;
- hashes the request/user/company/assessment identifiers before sending them to Cloudflare;
- sends only `requestKeyHash`, `userHash`, `companyHash`, and `assessmentHash` to the Worker;
- requires HTTPS and an authenticated server-to-server secret;
- fails closed when Cloudflare is configured but unavailable;
- never silently falls back to Render's ephemeral filesystem in that state;
- retains the filesystem allocator only for local development/testing when no Cloudflare allocator is configured.

`cloudflare/report-id-worker/src/index.mjs`:

- owns the global non-resetting sequence;
- stores every issued report ID in SQLite-backed Durable Object storage;
- uses `report_id` as the primary key;
- uses a unique SHA-256 `request_key_hash` for idempotent retry behavior;
- serializes sequence allocation through one named Durable Object;
- performs sequence read + registry insert + sequence update inside a synchronous storage transaction;
- never deliberately recycles an issued report ID.

## Runtime configuration

### Cloudflare Worker

The connected Cloudflare Worker is:

```text
growwithhr-version2
```

Its root `wrangler.jsonc` points to the Report ID Worker entry point and declares the SQLite-backed `ReportIdRegistry` Durable Object.

Set the Worker secret:

```text
REPORT_ID_ALLOCATOR_SECRET=<long-random-secret>
```

The same secret is stored server-side in Render.

### Render Free

Configure only environment variables; no Render disk is required:

```text
REPORT_ID_ALLOCATOR_URL=https://growwithhr-version2.<workers-subdomain>.workers.dev
REPORT_ID_ALLOCATOR_SECRET=<same-secret>
```

Do not append `/allocate` or `/status` to `REPORT_ID_ALLOCATOR_URL`.

The existing local file setting remains supported for local/test environments:

```text
REPORT_ID_REGISTRY_FILE=<persistent-or-test-file-path>
```

If neither Cloudflare nor a persistent file is configured, the local fallback is:

```text
data/runtime/report-id-registry.json
```

That fallback is intentionally reported as `storageBackend: filesystem-ephemeral` and is not accepted by live release smoke.

## Deployment verification

`GET /api/report-id/status` must report:

```json
{
  "ok": true,
  "storageBackend": "cloudflare-durable-object",
  "durableStorageConfigured": true,
  "sequencePolicy": "global-non-resetting-symmetric-alpha-numeric"
}
```

The Live Release Smoke workflow requires all four values before it archives release evidence.

## Report identity lifecycle

1. The browser requests an ID from `POST /api/report-id`.
2. Render hashes all identifier fields and authenticates to the Cloudflare Worker.
3. The Worker routes the request to the single named `ReportIdRegistry` Durable Object.
4. The Durable Object checks the unique request-key hash for an existing reservation.
5. If this is a new request, it reserves the next sequence and persists the registry row atomically.
6. The Worker returns the reserved ID to Render.
7. Render returns the ID and generated timestamp to the browser.
8. The PDF is rendered with that ID in the report body/footer and filename.
9. The same generated PDF is used for download/email delivery.

A retry using the same request key returns the same reservation. A genuinely regenerated report uses a new request key and receives a new report ID. An issued ID is not returned to the pool for another report.

## Local development fallback

The original filesystem allocator remains available when Cloudflare is not configured. It uses a filesystem lock, atomic rename, duplicate refusal, and the same sequence rules.

This fallback exists to avoid unnecessary infrastructure during local development. It is not the accepted live backend for the free hosted prototype because Render Free storage is ephemeral.

## Report trust boundaries

The report retains the research-prototype governance posture:

- `sourceAuthority: secondary-research`
- `verificationStatus: prototype-researched`
- `legalReviewStatus: needs-legal-review`
- `usedForDecision: false`
- `applicabilityAuthority: none`

The deterministic compliance engine produces applicability. Legal RAG provides governed explanation and source context after the decision.

## Scope boundary

The current founder report does not claim to assess:

- whether each applicable requirement has already been completed;
- whether implementation/evidence is legally sufficient;
- payroll contribution arithmetic;
- individual claims, disputes or entitlements;
- live safeguarding investigations;
- international / multi-country employment (Wave 5M);
- legal advice or compliance certification.
