# Contributing to GrowWithHR

## Production stack

Contribute product fixes to the root HTML/CSS/JavaScript application and `server.js`. Do not treat `apps/web/src` as production; it is an archived experiment.

## Workflow

- Branch from current `main` using `feature/*`, `fix/*`, `release/*` or `hotfix/*`.
- Do not edit or force-push `main`.
- Keep one concern per short-lived branch.
- Add regression coverage for behavior changes.
- Run `npm run test:release` and relevant Playwright tests.
- Update canonical documentation; preserve `docs/releases/` as historical records.
