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

`/analyze-company-v3.html` is no-index and disabled from public routing by default. M1-M5 modules consume protected assessment answers through compatibility adapters and produce isolated traceability, Compliance Story and workspace output without changing stable report, PDF, email or delivery contracts.

The v3 route mounts five legal-review surfaces:

- the existing POSH Internal Committee threshold explanation, which reads the three required facts from the protected assessment record;
- the POSH Wave 1 control-review panel, which collects six feature-specific fact sets in memory;
- the Maternity Benefit Wave 2 panel, which exposes ten controlled organisation, category, band and status reviews in memory;
- the EPF Wave 3A panel, which exposes five operational reviews using organisation-level statuses, counts and evidence references;
- the EPF Wave 3B panel, which exposes five wage-ceiling, rate-source, EPS and EDLI verification or routing reviews using controlled statuses, bands and evidence references.

All panels submit only after explicit user action. Their inputs and results are not written to browser storage and are not inserted into the stable report, PDF or email.

## Protected browser keys

- `growwithhr-advisory-briefing-v2`
- `growwithhr-report`
- `growwithhr-lead`
- `growwithhr-advisory-delivery-v1`
- `growwithhr-industry-catalog-v1`
- `growwithhr-report-theme` (presentation preference only)

Feature-flag overrides use the documented `growwithhr-feature-` prefix and are not assessment records.

## Compliance decision and governed RAG architecture

The compliance engine uses one authority boundary across legal features:

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

The deterministic decision owns applicability, control-review or entitlement-route status and reason-code selection. Retrieval has `applicabilityAuthority: none` and `usedForDecision: false`. Provider output must preserve the decision fingerprint, status, reason code and supplied citation scope.

## Runtime coverage

The Wave 3B stacked private-beta registry exposes 57 active profiles:

- seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue;
- ten Maternity Benefit profiles use feature-specific deterministic rules and a governed Social Security Code, Central Rules, commencement and corrigendum catalogue;
- five EPF Wave 3A operational profiles use feature-specific deterministic rules and a governed Social Security Code, EPF Scheme, commencement and corrigendum catalogue;
- five EPF, EPS and EDLI Wave 3B profiles use feature-specific deterministic verification or routing rules and a governed seven-source catalogue;
- 30 profiles use conservative governance-readiness retrieval until their law-specific source packs, facts, rules and approvals are complete.

Wave 3B covers EPF wage-ceiling source review, EPF contribution-rate source verification, EPS membership routing, EPS pension-process controls, and EDLI coverage and process controls. It accepts only controlled wage bands, declared rate branches, routing statuses, process-control statuses and evidence references.

The Wave 1, Wave 2, Wave 3A and Wave 3B catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing facts produce `more-information-needed`. Wave 3B does not select the legally applicable 10% or 12% contribution branch, calculate amounts, determine individual EPF or EPS membership, determine pension or EDLI benefits, decide claims, or resolve transition and savings treatment. EPF exemption and international-worker profiles remain on fallback.

## Privacy boundaries

POSH adapters exclude names, contact details, complaint narratives, allegations, evidence bodies, findings and case-level statistics. Per-location and per-unit facts remain separate.

Maternity Benefit adapters exclude names, contact details, medical narratives, certificates, exact event dates, child details, adoption or surrogacy documents, completed claims, ESI identifiers, bank details, disciplinary evidence and completed forms. Central Rules are not used to resolve unsupported State appropriate-Government material.

EPF Wave 3A adapters exclude names, UANs, employee-level wages, payroll rows, contribution histories, ECR bodies, bank details, claims, completed forms and evidence bodies. The monthly route records only whether an approved rate source and operational controls exist; it does not select or calculate a rate branch.

EPF Wave 3B adapters add controlled wage-band and declared-rate-branch values but still exclude wage amounts, contribution amounts, identities, UANs, payroll rows, contribution histories, ECR bodies, bank details, claims, nominee or family details, completed forms and evidence bodies. Evidence arrays are reduced to controlled references only.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 3B router overlay, which preserves Waves 1–3A while activating the five verification or routing profiles and reporting the 27/30 runtime mix.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
