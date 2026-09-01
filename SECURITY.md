# Security Policy

## Reporting

Do not disclose credentials or sensitive findings in a public issue. Contact `hrtechifyed@gmail.com` with the subject `GrowWithHR security report`.

## Secret handling

- Store Gmail/OAuth values and the Supabase service-role key only in the deployment environment.
- The Supabase browser publishable key is intentionally public and may be used only for browser authentication. It must never be substituted for privileged server credentials.
- Never commit `.env`, app passwords, client secrets, refresh tokens or the Supabase service-role key.
- Treat any secret credential that has appeared in Git history as exposed: revoke/rotate it before external use, then follow a controlled history-rewrite and cache-purge procedure.
- `/api/health` may report configuration status and missing variable names, but must never return credential values.

## Customer report authentication

- Complete personalised report delivery requires a valid Supabase Auth Bearer token on `POST /api/send-advisory`, `POST /api/send-advisory-v2` and `POST /api/organization-report/deliver`.
- The server validates the token with Supabase Auth using server-side credentials before delegating to the existing report-delivery handler.
- Every recipient supplied in an authenticated report-delivery request must match the authenticated customer email. A signed-in customer cannot redirect a personalised report to another email address.
- The assessment website exposes only a concise personalised report glimpse. Complete personalised reports are not exposed as public full-report pages on the deployed site.
- The legacy full web renderer is available only on localhost for automated regression testing and must not be made reachable from the production hostname.
- Complete fictional sample reports may remain public because they do not contain customer data.

## Company Workspace boundary

- Company Workspace recovery remains separate from customer report authentication.
- Reusable company data is encrypted before database storage; Workspace Recovery Codes are verified through their stored hash and are not stored in plaintext.
- Report ID alone must not unlock reusable company data.
- One-time cross-tab handoff tokens must remain short-lived and must not expose the Workspace Recovery Code in a URL.

## Browser-to-API boundary

- The GitHub Pages client may call the Render API only from the exact approved origin.
- Do not replace the origin allowlist with `*`.
- Additional frontend origins must be explicitly approved through `ALLOWED_CORS_ORIGINS`.
- Authenticated report delivery requires the `Authorization` request header in addition to the normal content-type controls.
- The API remains rate-limited and validates authentication, recipient ownership, payload and PDF data independently of CORS.

## Supported product

Security fixes apply to the current root-level HTML/CSS/JavaScript application, `server-entry.js` and `server.js`. The experimental `apps/web/src` layer is not deployed.
