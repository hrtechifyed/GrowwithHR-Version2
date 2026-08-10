# GrowWithHR Architecture

## Deployment decision

The production application is the root-level static HTML/CSS/JavaScript site. `server.js` supplies optional delivery and explanation APIs, while `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Public architecture

1. `index.html` presents the product and links to `analyze-company.html`.
2. Stable assessment modules validate answers and persist same-browser progress under protected keys.
3. Presentation modules enrich the report experience without changing compliance applicability logic.
4. The stable report mapper prepares the advisory record.
5. `js/pdf.js` and `js/pdf-polish.js` render the deterministic advisory model as a browser-generated PDF.
6. `executive-advisory-report.html` consumes the same enriched advisory model.
7. Email delivery uses a data-minimised request only when requested.
8. `server-entry.js` applies exact-origin CORS controls and delegates protected API routes.

The approved cross-origin client is `https://hrtechifyed.github.io`. Additional approved origins may be supplied through `ALLOWED_CORS_ORIGINS`; wildcard origins are not used.

## Private-beta architecture

`/analyze-company-v3.html` is no-index and disabled from public routing by default. Its Compliance DNA modules consume protected assessment answers through compatibility adapters and produce isolated traceability/legal-review/workspace output without changing stable report, PDF, email or delivery contracts.

The v3 route mounts the substantive review surfaces for POSH, Maternity Benefit, EPF Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G, Apprentices Wave 5H, Child and Adolescent Labour Wave 5I, Contract Workforce Wave 5K and generic Social Security Wave 5L.

Wave 5J Bonded and Forced Labour and Wave 5M Multi-country Employment are governance-only fallbacks and intentionally have no assessment fact contract, browser panel, substantive runtime catalogue or provider route.

All legal-review panels submit only after explicit user action. Their inputs/results are not written to browser storage and are not inserted into the stable report, PDF or email.

## Protected browser keys

- `growwithhr-advisory-briefing-v2`
- `growwithhr-report`
- `growwithhr-lead`
- `growwithhr-advisory-delivery-v1`
- `growwithhr-industry-catalog-v1`
- `growwithhr-report-theme` — presentation preference only

Feature-flag overrides use the documented `growwithhr-feature-` prefix and are not assessment records.

## Deterministic decision and governed RAG architecture

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

The deterministic rule owns status, reason code, missing facts and source scope. Retrieval has `applicabilityAuthority: none` and `usedForDecision: false`. Provider output must preserve the decision fingerprint, status, reason code and citation scope and may never fill missing assessment facts.

Complete and reported-gap substantive scenarios stay `specialist-review`. Missing required facts return `more-information-needed`.

## Main-integrated runtime coverage

The legal-RAG implementation through Wave 5M is integrated into `main` as of 10 August 2026.

Runtime invariant:

- 57 callable profiles;
- 55 substantive profiles;
- 2 governance-fallback profiles;
- 21 active catalogues;
- zero blocked runtime profiles.

The two governance fallbacks are Bonded and Forced Labour (Wave 5J research/safeguarding stop) and Multi-country Employment (Wave 5M jurisdiction/cross-border-data stop).

All substantive catalogues remain `needs-legal-review`.

## Authority boundaries by later wave

### Wave 5A — Appropriate Government
Records cross-code jurisdiction/source readiness and escalation only. It does not select the legally appropriate Government, State/UT, law, source pack, forum or jurisdiction.

### Wave 5B — Maharashtra Shops and Establishments
Records a Maharashtra-only source-readiness and organisation-control review. The 2025 amendment remains draft-only; no exact final instrument was found in the 10 August 2026 official re-check. The wave does not decide coverage, thresholds, registration, working conditions, penalties or enforcement.

### Wave 5C — Code on Wages
Records source/version/effective-date, jurisdiction-routing, rate-source-register and State/UT-instrument controls. It does not select rates/categories/zones/scheduled employment or perform employee-level payroll/entitlement/remedy arithmetic.

### Wave 5D — Gratuity
Records Chapter V, First Schedule, Rules and transition/source controls. It does not determine coverage, individual eligibility, continuous service, wages, gratuity amount, nomination, forfeiture, claim or remedy.

### Wave 5E — Employee's Compensation
Records Chapter VII, schedules, Rules, transition, ESI-overlap, employer-process and authority-source controls. It does not decide injury/disease causation, diagnosis, disablement, dependency, liability, wages, compensation, claims or remedies.

### Wave 5F — OSHWC
Records a bounded Central/Maharashtra source route and generic establishment controls. Maharashtra's 2026 OSHWC Labour and Factories/Other Ports instruments remain draft-only after the 10 August 2026 official re-check. The wave does not decide applicability, thresholds, classification, registration/licensing, working conditions, incidents, penalties or enforcement.

### Wave 5G — Industrial Relations
Records Code/Rules, transition/amendment, Model Standing Orders, Maharashtra draft reconciliation and authority/source controls. The Maharashtra State rules remain draft-only after the 10 August 2026 re-check. It does not decide Chapter IV applicability, worker thresholds, certification, disciplinary/dispute outcomes, strikes/lock-outs, retrenchment/closure, penalties or remedies.

### Wave 5H — Apprentices
Records Act/Rules/amendment status, current-Rules-versus-portal reconciliation, trade/category classification-source, manpower/band, State variation, portal/NAPS, authority and training-infrastructure controls. It does not decide Act applicability, mandatory engagement, counts, individual eligibility, contracts, stipend, certification, NAPS/DBT, enforcement or remedy.

### Wave 5I — Child and Adolescent Labour
Safeguarding-first source/classification/exception/authority readiness only. It is not case management, emergency handling, age inference or risk scoring and does not determine age/status, work, hazardous classification, exceptions, offences, rescue, prosecution, rehabilitation or remedies.

### Wave 5J — Bonded and Forced Labour
Research-only governance stop. Runtime promotion is blocked pending exact current operational materials, qualified constitutional/statutory/criminal mapping, human-only safeguarding, privacy/security and State/UT controls. Current official research confirms the Ministry SOP referenced by NHRC as issued on 14 May 2026, but the exact Ministry-hosted file remains uncontrolled. The public Ministry source still surfaces the 2021 rehabilitation scheme and no exact approved/notified 2026–31 operational plan has been controlled.

### Wave 5K — Contract Workforce
Bounded OSHWC Chapter XI Part I source-readiness with separate EPF and ESI contractor dependencies.

```text
OSHWC contract-workforce decision ─┐
EPF contractor-control decision ───┼─> separate dependency/reconciliation statuses only
ESI contractor-control decision ───┘
```

No family may determine another family's applicability or substantive result. Maharashtra OSHWC State rules remain draft-only.

### Wave 5L — Generic Social Security family routing
A chapter/source-family router, not a generic applicability engine.

```text
generic Social Security route
  ├─> EPF/EPS/EDLI dedicated review
  ├─> ESI dedicated review
  ├─> Gratuity dedicated review
  ├─> Maternity Benefit dedicated review
  ├─> Employee's Compensation dedicated review
  ├─> BOCW Chapter VIII specialist review
  └─> Chapter IX unorganised/gig/platform specialist review
```

The generic route cannot override, combine or infer a dedicated family result. BOCW Chapter VIII and Chapter IX remain specialist-only.

### Wave 5M — Multi-country Employment
Governance-only jurisdiction/data gate. No assessment, substantive rule, RAG catalogue, browser panel or provider route may exist until exactly one country pair and operating model are selected and specialist jurisdictional plus cross-border data approvals are recorded.

Future pair-specific work must separately control employment law, immigration/work authorisation, tax/treaty/payroll/permanent-establishment, social-security/SSA and privacy/security sources for both jurisdictions. The product must not decide immigration, tax residence, withholding, social-security coverage, applicable employment law, EOR/PEO legality, cross-border transfer legality or remedy from generic data.

## Source-governance boundary

The platform distinguishes:

- exact controlled full files with verified hashes/pagination;
- `source-identity-only` snapshots;
- regulator/programme or portal context;
- draft instruments; and
- historical/research-only sources.

The active Drive Source Register was reconciled through Wave 5M on 10 August 2026. Shared exact Social Security/EPF/ESI files are reused across families rather than duplicated. Missing exact files are not assigned fabricated hashes or pagination.

Maharashtra Shops/OSHWC/IR draft instruments remain draft-only until exact final instruments are separately acquired, fingerprinted and approved. Wave 5J's exact Ministry SOP and 2026–31 rehabilitation/welfare operational-plan source blockers remain open.

## Privacy boundaries

Earlier waves retain their established prohibitions on identities, contact details, complaints, medical records, payroll, claims, accident narratives, notices/orders and evidence bodies except where an explicitly approved privacy-safe organisation-level field is part of a deterministic fact contract.

Wave 5J prohibits identifying/allegation/coercion/debt/trafficking/rescue/case/victim/witness/evidence data. Wave 5M prohibits person-level mobility, passport/visa, nationality, tax-ID/residency-day, social-security, payroll/wage, bank/remittance, medical/dependant, agreement/dispute, precise-location and evidence-body data.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

Current `main/server-entry.js` uses the Wave 5L shared router overlay. That is intentional: Wave 5M is governance-only and has no router. The main-integrated runtime reports the 57/55/2 profile mix and 21 catalogues.

## Integration validation

The exact integration head was green on All-Laws RAG, Executive Assessment, M4 Report Integration, M7 RAG-Ready Hardening and repository-wide GrowWithHR CI before merging to `main`.

## Approval boundary

Passing deterministic, retrieval, browser, report, integration or hardening tests is software evidence only. It does **not** grant legal, privacy, safeguarding, RAG, exact-source-file, State/UT, section-mapping, assessment-fact, deterministic-rule, security, cross-border-data or release approval. Every active substantive catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
