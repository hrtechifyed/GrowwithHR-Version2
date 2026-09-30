# GrowWithHR UX Simplification — Next Steps

**Date:** 30 September 2026  
**Product stance:** simplify the buyer experience before adding new HR modules.

## UX principle

The public experience should answer three buyer questions:

1. **Understand the organization** — Organization Structure & Growth is the flagship entry point.
2. **Review what needs attention** — HR Compliance Readiness supports specific review needs.
3. **Model the next decision** — Decision Scenario Studio tests planning assumptions before action.

Change Intelligence remains the recurring layer across assessments. Workforce & Capability Planning remains available as an advanced capability, but it should not compete with the three primary buyer actions on the homepage or primary Analyze menu.

## What this branch changes

- Rewrites the homepage around the three buyer questions above.
- Sends the primary homepage CTA directly to Organization & Growth.
- Replaces Workforce & Capability Planning on the homepage with Decision Scenario Studio.
- Simplifies the Analyze menu to:
  - Organization & Growth
  - HR Compliance Readiness
  - Model a Decision
- Moves Company Analysis Overview, Change Intelligence, Workforce & Capability Planning and My Reports into secondary navigation.
- Strengthens the trust language around the current authority model: rules decide; sources substantiate; AI explains.

## Product work to do next

### P0 — Validate the flagship journey with real companies

Recruit 10–20 companies in one initial ICP and observe the complete flow:

**Homepage → Organization & Growth → finding → recommended action → optional scenario comparison**

Capture:
- assessment completion rate;
- time to first useful finding;
- where users abandon or hesitate;
- whether a finding changes or confirms a real organization decision;
- whether the user wants to save/reuse the company baseline.

Do not add another HR module until this loop has evidence.

### P0 — Add decision-outcome instrumentation

Track the smallest useful funnel rather than vanity traffic:
- homepage primary CTA;
- assessment started;
- assessment completed;
- executive report reached;
- recommendation expanded;
- Scenario Studio opened;
- scenario compared;
- return/reassessment initiated.

Instrumentation must remain privacy-conscious and should not capture sensitive assessment answers in analytics payloads.

### P0 — Professionally validate Compliance content

Before stronger commercial claims:
- obtain qualified employment-law / compliance review for each supported catalogue;
- record reviewer, jurisdiction, version and review date;
- define source-refresh and legal-change governance;
- keep applicability, evidence and compliance completion as separate concepts;
- retain the current disclaimer until the reviewed scope justifies a stronger claim.

### P1 — Prove repeat usage through Change Intelligence

With pilot companies, schedule a reassessment after a meaningful business change or within 30–90 days.

Validate whether users value:
- fact delta;
- finding delta;
- methodology delta;
- changed priorities;
- a clear explanation of why the recommendation changed.

The subscription case should come from repeat decisions and changing company context, not from gating a one-time PDF.

### P1 — Simplify report-to-action UX

For each major finding, make the next step obvious:
- **Review**
- **Decide**
- **Model**
- **Reassess later**

Avoid long report sections before the first actionable recommendation. Keep detail, methodology and source traceability available on demand.

### P1 — Define one initial ICP and one commercial experiment

Choose one narrow initial segment rather than “all growing companies.”

Test:
- who owns the problem;
- what event triggers purchase;
- which decision they are trying to make;
- whether Organization & Growth alone creates willingness to pay;
- whether Scenario Studio or Change Intelligence increases repeat usage.

Pricing should be tested only after the value event is clear.

## Explicit non-goals for the next cycle

Do not prioritize new standalone modules for Talent, Performance, Learning, Rewards, Culture or Leadership.

Do not increase homepage navigation density.

Do not turn deterministic findings into black-box AI recommendations.

Do not hide uncertainty or missing company facts to make the output appear more complete.

## Success condition

GrowWithHR should be able to demonstrate:

> A real company used the product to understand an organization constraint, changed or validated a people decision, returned when the company changed, and found the second analysis more useful because GrowWithHR remembered the prior context.

That is a stronger milestone than shipping another module.
