# Company-wide applicability and Scale Trigger Matrix

## Purpose

GrowWithHR should answer a founder-level company question, not behave like a law library:

> What HR compliance areas are relevant to this company now, what information is missing, and what should be reassessed as the company grows?

The company-wide applicability orchestrator is an organisation layer over the existing deterministic law-transparency engine. It does not introduce a second rule catalogue, new legal thresholds, or AI-led applicability.

## Deterministic source of truth

`js/company-applicability-orchestrator-v1.js` calls the existing `buildReportLawTransparency(payload, model)` function and normalises those rows into a company-wide result.

The existing deterministic row remains authoritative for:

- backend status;
- required company inputs;
- missing inputs;
- threshold state;
- current position;
- reassessment / trigger text;
- source URL.

The orchestrator must not alter or replace those values.

## Founder-facing state mapping

Backend statuses remain unchanged. The orchestrator adds a presentation mapping only:

| Existing deterministic status | Founder-facing state |
| --- | --- |
| `Applicable` | `Relevant now` |
| `Review required` | `Review needed` |
| `Needs information` | `More information required` |
| `Not currently triggered` | `Watch as you grow` |

No compliance / non-compliance state is created.

## Company-wide result

`GrowWithHRCompanyApplicability.assess(payload, model)` returns:

- all deterministic findings from the existing catalogue;
- grouped founder-facing states;
- deduplicated missing company facts;
- a Scale Trigger Matrix;
- explicit deterministic-decision and RAG-governance metadata.

The RAG boundary remains:

```text
usedForDecision: false
applicabilityAuthority: none
```

## Missing-fact resolution

Missing facts are deduplicated by the existing deterministic input field. Each missing-fact object records:

- the existing input field;
- the existing founder question;
- affected law IDs;
- affected compliance-area names.

The orchestrator does not infer a missing answer.

## Scale Trigger Matrix

The Scale Trigger Matrix is built only from deterministic rows whose existing threshold result is `below` or `near`.

Each matrix entry reuses:

- `thresholdResult.positionText` as the current position;
- `thresholdResult.triggerText` as the reassessment point;
- `thresholdResult.explanation` as the explanation.

The matrix never calculates or inserts a new legal threshold.

A matrix entry is a reason to reassess. It is not an independent declaration that a law applies.

## Scenario simulation

`GrowWithHRCompanyApplicability.simulate(payload, model, overrides)` supports deterministic scenario comparison by rerunning the same existing company-wide builder with explicitly supplied fact overrides.

It reports only changed law rows and shows before/after deterministic statuses, threshold states, current positions, and missing-input sets.

Scenario simulation does not mutate the stored assessment and does not invent facts that were not passed in the override object.

## Website integration

`js/founder-web-report-v2.js` uses the orchestrator for:

- company-wide grouping;
- deduplicated missing-information questions;
- Scale Trigger Matrix rendering.

The report continues to state that it assesses applicability, not implementation or compliance completion.

## Trust boundary

The product sequence remains:

```text
Company facts
  -> deterministic law-transparency rules
  -> company-wide applicability orchestrator
  -> current findings + missing facts + scale triggers
  -> governed source-backed explanation
  -> founder report
```

The deterministic engine decides. RAG explains the already-fixed result.
