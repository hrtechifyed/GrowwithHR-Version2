# GrowWithHR Product Roadmap

**Updated:** 1 September 2026  
**Current release candidate:** `v0.20.4-prototype.1`  
**Product classification:** research-grade prototype  
**Current customer focus:** two decision engines + Change Intelligence

## Product principle

GrowWithHR will not expand into a long list of HR modules until the two current products are strong, explainable, repeatable and commercially useful.

The current hierarchy is:

```text
GrowWithHR
├─ Organization Structure & Growth — flagship
├─ HR Compliance Readiness — supporting capability
├─ Change Intelligence — recurring layer across both engines
├─ Executive Reports — monetisable decision output
└─ Sources & Methodology — trust and explainability layer
```

Future Talent, Leadership, Learning, Performance, Rewards or generic AI-coach modules are **not** part of the current release plan.

---

## Current release — Product Hardening & Authenticated Report Delivery

### Organization Structure & Growth

Current priority: make this the strongest commercial product in GrowWithHR.

Implemented / release-candidate scope:

- Organization-first customer navigation and positioning;
- deterministic organization-level findings;
- management-capacity interpretation using work context rather than one universal span benchmark;
- reporting architecture, founder dependency, decision ownership and coordination findings;
- explicit positive foundations and primary constraint;
- prioritized actions;
- deterministic 12-month growth scenario;
- executive report structure designed for CEO / CHRO use;
- full fictional public sample report;
- personalized website result limited to an executive glimpse;
- complete personalized PDF delivered by authenticated email request.

### HR Compliance Readiness

Current priority: improve usefulness and credibility without overstating legal authority.

Implemented / release-candidate scope:

- customer-facing name **HR Compliance Readiness**;
- review / missing-information / specialist-review framing rather than compliance certification;
- deterministic legal decision authority retained;
- governed RAG remains explanation-only;
- sources, missing facts, limitations and next actions remain visible;
- full fictional public sample report;
- personalized website result limited to a glimpse;
- complete personalized PDF delivered only after authenticated email request.

The following remain prohibited claims:

- “certified compliant”;
- “legally compliant”;
- “proof of compliance”;
- AI-selected applicable law without the deterministic governed contract.

### Change Intelligence

Current priority: create a reason to return to GrowWithHR as the company changes.

Implemented / release-candidate model:

```text
Previous confirmed baseline
        +
Current confirmed company facts
        ↓
Fact delta
        ↓
Re-run deterministic engine
        ↓
Finding/status delta
        ↓
Explain material change
```

Change Intelligence is intentionally a layer within the existing engines rather than another standalone module.

It should answer:

- what changed in the company;
- which pressures increased;
- which areas improved;
- which new priorities appeared;
- which information gaps were introduced or resolved;
- which compliance-readiness areas may need renewed review.

If no previous confirmed baseline exists, the first assessment establishes it.

---

## Current report-access model

### Public

- complete fictional Organization Structure & Growth sample;
- complete fictional HR Compliance Readiness sample;
- methodology and sources;
- executive-style examples of report structure.

### Personalized

```text
Assessment complete
→ executive website glimpse
→ sign in / sign up with assessment work email
→ Supabase access token validated server-side
→ recipient must match authenticated work email
→ complete personalized PDF sent by email
```

The production product should not expose a complete personalized report through a publicly reachable web renderer. Localhost-only rendering may remain for automated regression and developer verification.

Company Workspace recovery remains separate:

- Report ID + Recovery Code = reusable company baseline recovery;
- customer authentication = complete personalized PDF delivery authorization.

---

## Near-term product priorities

### P1 — Report quality and conversion

- keep the executive decision brief as the first substantive page;
- preserve HRTechify branding and consistent report color tokens;
- prevent status chips/cards/tables from overflowing at any supported label length;
- use the full safe A4 content width without crowding;
- keep detailed methodology below the executive answer rather than ahead of it;
- maintain complete fictional samples as the public proof of report quality.

### P2 — Change Intelligence maturity

- extend comparison coverage across all durable organization facts;
- add stable change-event semantics and reassessment triggers;
- distinguish “company fact changed” from “finding changed because a rule/source version changed”;
- add change summaries to emailed PDFs;
- preserve previous-baseline provenance and Report ID lineage.

### P3 — HR Compliance Readiness source/legal hardening

- substantively review the 524 overdue temporal review entries rather than moving dates administratively;
- keep approved records strict in CI;
- continue exact official-source assurance work under #143;
- continue production Legal / Privacy / RAG / Source / Security / Release approval work under #142;
- retain `needs-legal-review` until qualified review actually occurs.

### P4 — Customer account and access hardening

- strengthen Supabase Auth operational controls;
- add durable abuse/rate-limit controls to sensitive delivery/recovery routes;
- document account/session lifecycle and deletion behavior;
- consider enterprise identity requirements such as SSO/RBAC only when the target customer segment requires them;
- keep privileged Supabase credentials backend-only.

### P5 — Longitudinal commercial model

Only after Change Intelligence proves recurring value:

- support scheduled/recommended reassessment windows;
- surface “what changed since last assessment?” prominently in returning-user journeys;
- create a clear annual / subscription value proposition for growing SMEs;
- evaluate benchmarking only where credible, current and appropriately scoped data exists.

---

## Historical engineering milestones

The earlier engineering milestones remain completed history and are retained in release manifests and `CHANGELOG.md`:

- **M0 — Baseline and recovery**
- **M1 — Five-Act Story Foundation**
- **M2 — Explainable Recommendation Foundation**
- **M3 — Compliance Story and Safe Health Model**
- **M4 — Explainable Intelligence**
- **M5 — Compliance Workspace Beta**
- **M6 — Evidence / persistence contract foundation**
- **M7 — RAG-Ready Hardening** — technical status: **implemented, release exit pending**.

M7 remains an engineering hardening milestone rather than a claim that the `0.22.0` release has been cut. Its release-exit evidence still requires **two consecutive qualified production releases** meeting the maintained reliability rules; pull-request CI alone is not sufficient.

Those milestone names describe engineering evolution. They are not the current customer navigation or commercial product hierarchy.

---

## Legal RAG runtime and production-hardening boundary

The maintained legal-RAG prototype currently preserves the runtime invariant:

- 57 callable profiles;
- 55 substantive profiles;
- 2 governance fallbacks;
- 21 active catalogues.

Every active substantive legal catalogue remains `needs-legal-review`.

Wave 5J (Bonded and Forced Labour) remains governance/research-only and safeguarding-human-first. Wave 5M (Multi-country Employment) remains outside the current substantive release.

Deterministic rules remain the product decision authority. RAG/provider output may explain but may not create facts, change status/reason/source scope, select another law family or certify compliance.

---

## Release gates

Every customer-facing release must pass, on the exact merge candidate SHA:

1. version consistency;
2. compliance-data validation;
3. baseline and architecture contracts;
4. Organization Structure deterministic/source checks;
5. site-shell and shared-navigation consistency;
6. customer authentication/report-access contracts;
7. client/server readiness;
8. report presentation and visual-section checks;
9. journey/scenario regression checks;
10. archived compatibility checks;
11. Playwright customer journey/browser coverage;
12. founder/report browser acceptance;
13. Legal RAG maintained workflows;
14. post-merge `main` CI;
15. GitHub Pages deployment; and
16. live release smoke.

Green engineering evidence does not grant legal approval.

---

## Deliberate non-priorities

Do not add these merely to make the product look larger:

- Talent Intelligence;
- Learning Intelligence;
- Rewards Intelligence;
- Performance Intelligence;
- Leadership Intelligence;
- generic AI coach;
- employee case-management;
- payroll / ATS / HRIS features;
- fabricated universal HR benchmarks.

The next stage remains: **two outstanding decision products, a credible recurring Change Intelligence layer and reports users are willing to pay for.**
