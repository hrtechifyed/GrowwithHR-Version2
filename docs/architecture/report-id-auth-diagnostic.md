# Report ID authentication diagnostic

Temporary prototype diagnostic for the Cloudflare-backed Report ID allocator.

`GET /health` on the Worker is intentionally unauthenticated and returns only boolean configuration state:

- whether the runtime secret binding exists;
- whether the Durable Object binding exists.

It never returns the secret value, a secret hash, report IDs, company data, assessment data, or registry records.

Authenticated `/status` and `/allocate` behavior is unchanged.
