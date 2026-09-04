# GrowWithHR Current File Overview

**Updated:** 1 September 2026  
**Scope:** current deployed/product-hardening architecture. Historical implementation detail belongs in `docs/releases/` and archived audit documents.

## Public customer surfaces

- `index.html` — homepage and current product positioning.
- `intelligence-hub.html` — company-analysis overview, Change Intelligence explanation and controlled report glimpse examples.
- `organization-intelligence.html` — Organization Structure & Growth assessment.
- `compliance-intelligence.html` — HR Compliance Readiness assessment.
- `my-reports.html` — reusable Company Workspace / Report ID recovery journey.
- `sample-reports.html` — public index of complete fictional sample reports.
- `organization-structure-report.html?sample=1` — complete fictional Organization Structure & Growth sample.
- `sample-advisory-report.html` — complete fictional HR Compliance Readiness sample.
- `official-resources.html` — Sources & Methodology entry point.
- `organization-structure-methodology.html` — Organization Structure methodology and rule/source transparency.
- `security.html` — public security/data posture.
- `more-info.html` — about, privacy and contact information.
- `terms.html` — product terms/boundaries.

## Personalized report surfaces

- `organization-structure-report.html` — personalized Organization result surface. In production this is a controlled executive glimpse / email-delivery journey; complete personalized report rendering is not a public customer bypass.
- `executive-advisory-report.html` — personalized HR Compliance Readiness report surface, limited to a web glimpse for normal production use.

Complete personalized PDFs are delivered by email after customer authentication. Public full-report viewing is reserved for fictional samples. Localhost-only internal preview behavior may exist for automated regression testing.

## Compatibility / private-beta surfaces

- `analyze-company.html` — stable compatibility Compliance assessment route retained during migration.
- `assessment.html` — compatibility redirect.
- `analyze-company-v3.html` — no-index Compliance DNA private-beta route; not the current customer navigation.
- `m5-compliance-workspace.html` — older/private workspace surface retained for compatibility/testing where applicable.

## Shared customer shell and product positioning

- `js/site-shell.js` — canonical navbar/footer markup and behavior across deployable pages.
- `js/product-positioning.js` — centralized current customer terminology/positioning refinements.
- `styles.css`, `css/` — shared visual system and page-specific presentation layers.
- `assets/hrtechify-logo.png`, `assets/hrtechify-logo-transparent.svg` — HRTechify brand assets used by the product/report surfaces.

Primary customer navigation is:

- Organization & Growth
- HR Compliance Readiness
- My Reports
- Sources & Methodology

Sample Reports, Security & Data, Terms, About, Privacy and Contact remain secondary navigation.

## Organization Structure & Growth runtime

- `js/modules/organization/organization-structure-engine.mjs` — deterministic Organization Structure analysis.
- `js/modules/organization/organization-source-registry.mjs` — public source registry, rule mappings and framework metadata.
- `js/organization-structure-report.mjs` — Organization report/glimpse/sample/change-intelligence rendering.
- `js/organization-structure-pdf.mjs` — Organization PDF generator using HRTechify branding and format-safe status/layout components.
- `js/compliance-change-intelligence.js` — shared/related change comparison support where applicable.

## HR Compliance Readiness runtime

- `js/executive-assessment.js`, `js/executive-assessment/` — stable customer assessment flow.
- `js/assessment-v3/`, `js/m5/` — governed private-beta / compatibility intelligence layers.
- `js/company-applicability-orchestrator-v1.js` — company-wide deterministic compliance-readiness orchestration.
- `growwithhr-rag/`, `server-*-wave*.js`, governed data/schema files — deterministic legal/RAG feature runtime and source contracts.
- `js/pdf.js`, `js/pdf-polish.js`, `js/pdf-law-transparency.js` — Compliance Readiness PDF/report generation pipeline.

## Change Intelligence and Company Workspace

- `js/company-workspace-client.js` — Company Workspace client integration and baseline continuity.
- `js/compliance-change-intelligence.js` — structured baseline/current comparison for compliance-readiness changes.
- Organization change comparison is integrated with `js/organization-structure-report.mjs` and related Organization data contracts.
- `server-workspace*.js` / workspace server modules — reusable Company Workspace creation, recovery, handoff, completion and deletion.

Change Intelligence compares structured confirmed facts and deterministic findings. It does not compare generated report prose as the decision authority.

## Customer authentication and complete report delivery

- `js/customer-auth.js` — browser-side Supabase customer authentication using the publishable key only.
- `js/report-access-gate.js` — customer report-glimpse / authenticated complete-report access logic.
- `server-customer-report-gate.js` — server-side Bearer-token verification and recipient/work-email binding.
- `server-entry.js` — production API entry point and routing boundary.
- `server.js` and report-delivery server modules — Gmail delivery/backend support.

Customer authentication and Company Workspace recovery are separate controls:

- Report ID + Recovery Code → reusable company baseline recovery.
- Authenticated work email → authorization to request complete personalized PDF delivery.

## Report-format safety

- `js/report-format-safety-v1.js` — shared report-format safety helpers for measured/wrapping labels and layout protection.
- `css/29-report-access.css` — report-access/glimpse/auth presentation.
- report-specific PDF generators use shared brand/status principles and must prevent status labels, tables or cards from spilling outside their intended page width.

## Backend / infrastructure

- `server-entry.js` — CORS-aware production Node entry point on Render.
- Render — private API/server environment and privileged secrets.
- Supabase — Company Workspace storage plus customer authentication.
- Cloudflare Worker / Durable Object — persistent Report ID allocation.
- Cloudflare Workers AI — governed explanation-only provider path.
- Gmail API — requested complete report email delivery.
- Google Drive / governed source workflow — upstream legal/research source governance, not normal customer workspace storage.

## Data and governance

- `data/` — governed catalogs, schemas, assessment data and knowledge material.
- `growwithhr-rag/` — maintained governed Legal RAG runtime documentation/configuration.
- `docs/architecture/` — architecture/governance detail.
- `docs/testing/` — maintained validation procedures.
- `docs/releases/` — dated historical release manifests. These remain historical evidence and are not rewritten to describe later product behavior.

## Quality gates

- `tests/` — static, deterministic, integration and compatibility contracts.
- `tests/e2e/` — Playwright customer/report/browser journeys.
- `playwright.config.ts` — browser-test configuration.
- `.github/workflows/` — maintained CI, Legal RAG, report integration, M7 hardening, founder/browser and executive-assessment workflows.

## Canonical current documentation

- `README.md`
- `ABOUT.md`
- `HOW_GROWWITHHR_WORKS.md`
- `docs/ARCHITECTURE.md`
- `SECURITY.md`
- `ROADMAP.md`
- `FILES_OVERVIEW.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`

## Archived experiment

- `apps/web/src/` — archived React/TypeScript experiment; not the deployed GrowWithHR build.
