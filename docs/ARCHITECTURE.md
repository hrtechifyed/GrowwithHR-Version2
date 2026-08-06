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

The v3 route mounts eleven legal-review surfaces:

- the existing POSH Internal Committee threshold explanation, which reads the three required facts from the protected assessment record;
- the POSH Wave 1 control-review panel, which collects six feature-specific fact sets in memory;
- the Maternity Benefit Wave 2 panel, which exposes ten controlled organisation, category, band and status reviews in memory;
- the EPF Wave 3A panel, which exposes five operational reviews using organisation-level statuses, counts and evidence references;
- the EPF Wave 3B panel, which exposes five wage-ceiling, rate-source, EPS and EDLI verification or routing reviews using controlled statuses, bands and evidence references;
- the EPF Wave 3C panel, which exposes exemption-governance and international-worker or SSA control reviews using organisation-level statuses and evidence references;
- the ESI Wave 4A panel, which exposes five establishment, employee-insurance, contractor, payment and accident-reporting control reviews using organisation-level statuses, a declared route and evidence references;
- the ESI Wave 4B panel, which exposes five continuing or voluntary coverage, area commencement, wage-ceiling source, ceiling-continuation and contribution-rate source reviews using organisation-level statuses and evidence references;
- the ESI Wave 4C panel, which exposes special-route, benefit-process and medical-administration source reviews using organisation-level routes, statuses and evidence references;
- the ESI Wave 4D panel, which exposes exemption-governance and enforcement-authority source reviews using organisation-level source, exclusion and escalation controls plus evidence references;
- the Appropriate Government Wave 5A panel, which exposes one cross-code source-readiness and escalation review without selecting Central, State or Union Territory jurisdiction.

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

The Wave 5A stacked private-beta registry exposes 57 active profiles:

- seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue;
- ten Maternity Benefit profiles use feature-specific deterministic rules and a governed Social Security Code, Central Rules, commencement and corrigendum catalogue;
- five EPF Wave 3A operational profiles use feature-specific deterministic rules and a governed Social Security Code, EPF Scheme, commencement and corrigendum catalogue;
- five EPF, EPS and EDLI Wave 3B profiles use feature-specific deterministic verification or routing rules and a governed seven-source catalogue;
- two EPF Wave 3C profiles use deterministic exemption-governance and international-worker or SSA control-review rules and an eight-source governed catalogue;
- five ESI Wave 4A profiles use deterministic employer-control rules and a six-source governed catalogue;
- five ESI Wave 4B profiles use deterministic coverage and source-routing rules and a seven-source governed catalogue;
- three ESI Wave 4C profiles use deterministic special-route, benefit-process and medical-administration control rules and a seven-source governed catalogue;
- two ESI Wave 4D profiles use deterministic exemption-governance and enforcement-authority source-routing rules and an eight-source governed catalogue;
- one Appropriate Government Wave 5A profile uses a deterministic cross-code source-readiness and escalation rule with a nine-source governed catalogue;
- 12 profiles use conservative governance-readiness retrieval until their law-specific source packs, facts, rules and approvals are complete.

Wave 5A accepts only an organisation-declared candidate route, cross-code definition source status, Central and State source-set status, establishment and activity classification control, multi-location routing, effective-date and version control, specialist escalation, and evidence references.

The Wave 1, Wave 2, Wave 3A–4D and Wave 5A catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing facts produce `more-information-needed`. Wave 5A does not select the legally appropriate Government, applicable law, State source set, forum or jurisdiction.

## Source-governance boundary

Wave 4A uses the Code on Social Security, the Social Security (Central) Rules, commencement notification and corrigendum as controlled current central sources. The consolidated 1950 Central Rules are retained only as historical or transition context. The consolidated 1950 General Regulations are retained only as saved-law candidates for registration, payment, return and accident-process context.

Wave 4B adds S.O. 2351(E) as a controlled continuation source. That notification depends on a separately notified Chapter IV wage ceiling and is not represented as supplying the ceiling. The exact Chapter IV ceiling notification and the complete State, Union Territory, area and establishment notification set are not in the controlled pack. Rule 19 is used only as current ordinary contribution-rate source context; the browser does not accept percentages and the engine performs no arithmetic.

Wave 4C adds S.O. 2352(E) as a controlled medical-practitioner authority source and the Other Beneficiaries Medical Facilities Scheme, 2026 as bounded scheme context. Neither source validates a customer certificate, determines treatment, selects a provider or decides individual access. The hazardous-occupation notification, plantation opt-in instruments, State and Union Territory implementation sources, medical-administration agreements, local facility procedures and the other-beneficiaries user-charge instrument remain unresolved.

Wave 4D adds S.O. 2350(E), S.O. 2353(E), S.O. 2354(E) and S.O. 2356(E) as controlled authority-source records. They do not prove case-specific delegation, service, jurisdiction, limitation, authenticity, liability or legal effect. Establishment-specific exemption notifications, benefit-comparison evidence, compliance history, customer notices and orders, signatures, findings and recovery records remain outside the controlled payload and require qualified review.

Wave 5A reuses controlled-file fingerprints for the Social Security Code and Social Security (Central) Rules. The Code on Wages, Industrial Relations Code, OSHWC Code, their 2026 Central Rules and the Ministry labour-jurisdiction page are represented only by curated source-identity fingerprints until exact controlled files are verified. Source-identity records do not claim to archive or verify full current pages or linked instruments. No State or Union Territory Act, rule, amendment, notification, delegation or forum pack is represented as complete.

The catalogues do not represent legacy instruments as automatically operative prospective authority. Area notifications, hazardous-route notifications, current portal specifications, due dates, forms, State medical administration, saved-law treatment, rate exceptions, effective-date treatment, jurisdiction selection and case-specific enforcement questions require qualified review.

## Privacy boundaries

POSH adapters exclude names, contact details, complaint narratives, allegations, evidence bodies, findings and case-level statistics. Per-location and per-unit facts remain separate.

Maternity Benefit adapters exclude names, contact details, medical narratives, certificates, exact event dates, child details, adoption or surrogacy documents, completed claims, ESI identifiers, bank details, disciplinary evidence and completed forms. Central Rules are not used to resolve unsupported State appropriate-Government material.

EPF Wave 3A adapters exclude names, UANs, employee-level wages, payroll rows, contribution histories, ECR bodies, bank details, claims, completed forms and evidence bodies. The monthly route records only whether an approved rate source and operational controls exist; it does not select or calculate a rate branch.

EPF Wave 3B adapters add controlled wage-band and declared-rate-branch values but still exclude wage amounts, contribution amounts, identities, UANs, payroll rows, contribution histories, ECR bodies, bank details, claims, nominee or family details, completed forms and evidence bodies. Evidence arrays are reduced to controlled references only.

EPF Wave 3C adapters exclude names, UANs, passports, nationality documents, wage amounts, payroll rows, contribution histories, exemption-order bodies, certificate bodies, trust member or investment records, claims, family details and evidence bodies. No country or person-level classification is accepted.

ESI Wave 4A adapters exclude names, contact details, Aadhaar, insurance numbers, employee wages, payroll rows, contribution histories, challans, returns, medical or family details, accident narratives, injury and witness records, claims, investigation files and evidence bodies. No individual insurance, entitlement, causation or contribution calculation is accepted.

ESI Wave 4B adapters additionally exclude addresses, wage-ceiling amounts and rate percentages. Only source-readiness, routing and escalation statuses plus controlled references are accepted; no employee-level continuation or territorial conclusion is processed.

ESI Wave 4C adapters exclude diagnoses, medical certificates, prescriptions, treatment records, family details, claim bodies and benefit payment records in addition to the existing ESI exclusions. Only organisation-level route, process, source, exclusion and escalation controls plus evidence references are accepted.

ESI Wave 4D adapters exclude exemption notifications, benefit-comparison bodies, compliance-history bodies, officer names, notices, orders, signatures, service records, inspection findings, recovery amounts, dispute narratives and all evidence bodies. Only organisation-level source, version, exclusion and escalation controls plus references are accepted.

Appropriate Government Wave 5A excludes names, contact details, addresses, registration numbers, employee identities, wages, payroll, disputes, allegations, notices, orders, contracts, legal submissions and evidence bodies. It accepts no raw location or establishment narrative and cannot infer jurisdiction from customer facts.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5A router overlay, which preserves Waves 1–4D while activating the Appropriate Government source-routing profile and reporting the 45/12 runtime mix.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
