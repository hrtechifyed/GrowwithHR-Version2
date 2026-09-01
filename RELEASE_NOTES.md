# GrowWithHR Release Notes

`CHANGELOG.md` is the authoritative release history. Dated manifests under `docs/releases/` remain historical records.

## Current release candidate — 1 September 2026

- Version line: `v0.20.4-prototype.1`
- Release classification: research-grade prototype / prerelease
- Product release theme: **two-engine product hardening, Change Intelligence and authenticated full-report delivery**
- Production legal certification: **not claimed**
- Active legal catalogue status: `needs-legal-review`

### Customer product hierarchy

The public product is now intentionally concentrated on:

1. **Organization Structure & Growth — flagship**
2. **HR Compliance Readiness — supporting capability**
3. **Change Intelligence — recurring layer across repeat assessments**

Primary navigation is simplified to:

**Organization & Growth · HR Compliance Readiness · My Reports · Sources & Methodology**

Complete fictional sample reports remain publicly viewable so prospective customers can inspect report structure and quality.

### Change Intelligence

Where a prior confirmed Company Workspace baseline exists, GrowWithHR now compares structured company facts and deterministic findings to identify material changes such as:

- facts that changed;
- pressures that increased;
- areas that improved;
- new structural priorities;
- information gaps introduced or resolved; and
- compliance-readiness areas that may need renewed review.

Change Intelligence does not use AI-generated report prose as the comparison authority. If no prior baseline exists, the first assessment establishes the baseline.

### Personalized report-access model

Personalized customer reports now follow a deliberate access boundary:

```text
Assessment complete
→ website shows an executive report glimpse
→ customer signs in / signs up using the assessment work email
→ Supabase customer token is validated server-side
→ requested recipient must match the authenticated work email
→ complete personalized PDF is sent by email
```

The normal deployed customer journey does not expose a complete personalized report through a public web route. A localhost-only internal renderer may remain for automated regression and developer verification.

Company Workspace recovery remains separate from report authentication:

- Report ID + Recovery Code reopens reusable company baseline data.
- Customer authentication authorizes complete personalized PDF delivery.

### Report quality and branding

The release candidate also hardens report presentation:

- HRTechify logo replaces the prior abstract cover mark in the Organization PDF;
- report palettes use restrained GrowWithHR/HRTechify brand colors with status colors reserved for meaning;
- long status labels such as review / needs-information states use measured or wrapping components rather than fixed boxes;
- executive decision content appears before deep methodology;
- page-width usage, safe margins and card/table overflow behavior are explicitly protected;
- complete fictional Organization and Compliance Readiness samples remain public examples of the intended report format.

### Organization Structure & Growth

The flagship engine retains deterministic organization-level authority and now emphasizes:

- what is working;
- the primary structural constraint;
- what needs attention now;
- top leadership actions;
- management-capacity context rather than a universal span benchmark;
- founder dependence and decision ownership;
- coordination and reporting architecture; and
- a deterministic 12-month growth scenario.

It evaluates organizational structure and operating patterns, not individual employee or manager performance.

### HR Compliance Readiness

Compliance is intentionally framed as **readiness**, not assurance.

The engine continues to expose review-oriented states, missing information, governed sources, limitations and next actions without claiming that a company is legally compliant.

Deterministic rules remain the decision authority. RAG/provider output remains explanation-only and cannot create facts, choose applicable law, change status/reason/source scope or certify compliance.

### Authentication and security

- Browser authentication uses the Supabase publishable key only.
- Privileged Supabase credentials remain server-side.
- Complete report delivery endpoints validate the Bearer token.
- The backend binds delivery to the authenticated work email.
- Company Workspace Recovery Code security and report authentication remain separate controls.
- CORS remains a browser-origin control, not a substitute for authentication.

### Legal/source governance retained

This product hardening does **not** weaken the compliance prototype boundary:

- all active substantive legal catalogues remain `needs-legal-review`;
- the 524 overdue review entries across draft/unapproved records remain a real substantive review backlog rather than being administratively hidden;
- approved records remain strict under compliance-data validation;
- exact official-source assurance remains future hardening under #143;
- broader production Legal / Privacy / RAG / Source / Security / Release approval remains future hardening under #142;
- Wave 5J remains governance/research-only and safeguarding-human-first;
- Wave 5M remains outside the substantive current release.

### Validation requirement

The release may merge only after the exact final PR head is green on the maintained release chain, including repository-wide GrowWithHR CI, Legal RAG workflows, report integration, M7 hardening, founder/report browser acceptance and Executive Assessment Playwright coverage. After merge, `main` CI, GitHub Pages deployment and Live Release Smoke must also pass.

## Historical release references

- Detailed history: `CHANGELOG.md`
- Future work: `ROADMAP.md`
- Dated technical/release manifests: `docs/releases/`
- Current architecture: `HOW_GROWWITHHR_WORKS.md` and `docs/ARCHITECTURE.md`
- Current security posture: `SECURITY.md`
