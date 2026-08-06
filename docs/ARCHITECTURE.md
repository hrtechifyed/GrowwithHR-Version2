# GrowWithHR Architecture

## Deployment decision

The production application is the root-level static HTML/CSS/JavaScript site. `server.js` supplies the optional Gmail delivery API and `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` is an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Public architecture

1. `index.html` presents the product and links to `analyze-company.html`.
2. The stable assessment modules validate answers and persist same-browser progress under protected keys.
3. `js/report-experience-v019.js` applies presentation-only workforce safeguards, report-theme selection and recommendation-resource enrichment without changing assessment chapters or compliance applicability logic.
4. The stable report mapper prepares the advisory record.
5. `js/pdf.js` builds the deterministic advisory model and `js/pdf-polish.js` renders the selected light or dark A4 PDF in the browser.
6. `executive-advisory-report.html` preserves its existing page structure while `js/executive-advisory-report.js` consumes the same enriched advisory model for web presentation.
7. When email delivery is requested, `js/gmail-service.js` sends a data-minimised request to `POST /api/send-advisory` containing the selected generated PDF.
8. On Render the client uses the relative API route; on the approved GitHub Pages deployment the client uses `https://growwithhr.onrender.com/api/send-advisory`.
9. `server-entry.js` permits the exact GitHub Pages origin, answers the browser preflight request and rejects unapproved cross-origin API calls.
10. `server.js` validates the request, applies rate limiting and sends through the Gmail API.

The default approved cross-origin client is `https://hrtechifyed.github.io`. Additional approved origins may be configured through the comma-separated `ALLOWED_CORS_ORIGINS` deployment variable. Wildcard origins are not used.

## Report-experience boundaries

- The light/dark choice is a browser presentation preference, not a separate advisory-content model.
- The selected value is stored under `growwithhr-report-theme` and read during PDF preparation.
- One Person Company employee count is fixed to one at the presentation/state boundary; all other employee counts are normalised to a minimum of one.
- Implementation templates are static files in `resources/`; they contain no customer data until downloaded and edited by the user.
- Recommendation resource enrichment does not change statutory applicability, source traceability or evidence status.

## Private-beta architecture

`/analyze-company-v3.html` is no-index and disabled from public routing by default. M1-M3 modules consume protected assessment answers through compatibility adapters and produce isolated traceability/Compliance Story output. They do not write a new traceability key or change stable report, PDF, email or delivery contracts.

## Protected browser keys

- `growwithhr-advisory-briefing-v2`
- `growwithhr-report`
- `growwithhr-lead`
- `growwithhr-advisory-delivery-v1`
- `growwithhr-industry-catalog-v1`
- `growwithhr-report-theme` (presentation preference only)

Feature-flag overrides use the documented `growwithhr-feature-` prefix and are not assessment records.

## Compliance decision and governed RAG architecture

The compliance engine now uses one authority boundary across legal features:

```text
assessment answers
→ deterministic fact mapper
→ deterministic rule evaluator
→ immutable decision
→ legal RAG profile resolver
→ governed catalogue retrieval
→ explanation-only provider
→ strict response validation
```

The deterministic decision owns applicability, status and reason-code selection. Retrieval has `applicabilityAuthority: none` and `usedForDecision: false`. Provider output must preserve the decision fingerprint, status, reason code and supplied citation scope.

The v0.20.2 private-beta registry exposes 57 active profiles. POSH Internal Committee threshold uses its governed statutory catalogue; 56 other profiles use conservative governance-readiness retrieval and cannot make positive or negative applicability conclusions until feature-specific source packs and rules are approved.

Operational endpoints:

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

See `docs/architecture/compliance-engine-differentiation.md` and `docs/testing/all-laws-rag-validation.md`.
