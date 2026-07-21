# GrowWithHR Known Issues and Release Blockers

Last reviewed: 21 July 2026

## Critical external-readiness action

Historical Git analysis found a committed `.env` containing Gmail configuration and an app-password value. Current `.gitignore` prevents future `.env` commits, but deletion from the current tree is not equivalent to secret revocation or history removal. Before any external demonstration that uses email delivery:

1. revoke and rotate every historically committed Gmail/app-password credential;
2. verify deployment values are the rotated values;
3. perform a controlled Git history rewrite and GitHub cache/reference purge if complete repository-history removal is required;
4. re-run secret scanning after the purge.

## Deployment boundary

The GitHub Pages homepage is static. Relative `/api/send-advisory` delivery requires the application to be served from the Node/Express deployment or an explicitly configured API origin. Email delivery should not be demonstrated from a static-only preview.

## Manual verification still required

Automated Chromium, WebKit and mobile-emulation checks do not replace a physical iOS/Android touch test or a real Safari device test. Complete those checks before a client session.

## Intentional limitations

- The public route remains the stable four-chapter assessment.
- The M1-M3 v3 route remains private and no-index.
- No accounts, cloud persistence, cross-device resume or evidence repository exist.
- Applicability and evidence status are advisory and separate; no output is legal certification.
