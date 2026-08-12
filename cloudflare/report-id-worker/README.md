# GrowWithHR Report ID Worker

This Worker reuses the existing GrowWithHR Cloudflare account to provide durable, globally serialized Report ID issuance without requiring a paid Render disk or an additional database vendor.

## Architecture

```text
Founder browser
  -> Render Free: POST /api/report-id
  -> growwithhr-report-id Worker
  -> one named ReportIdRegistry Durable Object
  -> SQLite-backed Durable Object storage
```

Render remains the public API boundary. The browser never receives the Worker secret and does not write directly to Durable Object storage.

## Report ID contract

The Worker preserves the current GrowWithHR convention:

```text
GWHR-{YYYY}-{MMDD}-{SEQUENCE}
```

The sequence is global and persistent. It does not reset when the date changes.

```text
AA01 -> ... -> ZZ99 -> AAA001 -> ... -> ZZZ999 -> AAAA0001
```

The Durable Object stores only SHA-256 hashes for request/user/company/assessment identifiers. `request_key_hash` is unique and makes retry allocation idempotent. `report_id` is the primary key and is never deliberately recycled.

## Deploy on the existing Cloudflare account

From this directory:

```bash
npx wrangler@latest login
npx wrangler@latest secret put REPORT_ID_ALLOCATOR_SECRET
npx wrangler@latest deploy
```

Use a long random value for `REPORT_ID_ALLOCATOR_SECRET`. Store the same value in Render as `REPORT_ID_ALLOCATOR_SECRET`.

After deploy, Wrangler prints the Worker URL, normally similar to:

```text
https://growwithhr-report-id.<workers-subdomain>.workers.dev
```

Set that base URL in Render:

```text
REPORT_ID_ALLOCATOR_URL=https://growwithhr-report-id.<workers-subdomain>.workers.dev
REPORT_ID_ALLOCATOR_SECRET=<same-secret>
```

Do not add a trailing `/allocate` or `/status`; the Render adapter appends those paths.

## Verification

After Render redeploys:

```text
GET https://growwithhr.onrender.com/api/report-id/status
```

must report:

```json
{
  "ok": true,
  "storageBackend": "cloudflare-durable-object",
  "durableStorageConfigured": true,
  "sequencePolicy": "global-non-resetting-symmetric-alpha-numeric"
}
```

The Live Release Smoke workflow then validates the same contract before archiving release evidence.

## Free-tier posture

This Worker is deliberately small: one Worker request and one named Durable Object coordination point per Report ID operation. It does not replace the existing Workers AI provider; it reuses the same Cloudflare platform for a second narrowly governed runtime responsibility.
