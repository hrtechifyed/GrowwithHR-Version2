# Security Policy

## Reporting

Do not disclose credentials or sensitive findings in a public issue. Contact `hrtechifyed@gmail.com` with the subject `GrowWithHR security report`.

## Secret handling

- Store Gmail/OAuth values only in the deployment environment.
- Never commit `.env`, app passwords, client secrets or refresh tokens.
- Treat any credential that has appeared in Git history as exposed: revoke/rotate it before external use, then follow a controlled history-rewrite and cache-purge procedure.
- `/api/health` may report configuration status and missing variable names, but must never return credential values.

## Browser-to-API boundary

- The GitHub Pages client may call the Render API only from the exact approved origin.
- Do not replace the origin allowlist with `*`.
- Additional frontend origins must be explicitly approved through `ALLOWED_CORS_ORIGINS`.
- The API remains rate-limited and validates recipient, payload and PDF data independently of CORS.

## Supported product

Security fixes apply to the current root-level HTML/CSS/JavaScript application, `server-entry.js` and `server.js`. The experimental `apps/web/src` layer is not deployed.
