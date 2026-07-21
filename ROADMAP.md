# GrowWithHR Product Roadmap

Current integration version: `0.15.1-beta`  
Next target release: `0.16.0-beta`  
Last updated: 2026-07-21

---

## Product vision

GrowWithHR is evolving into an explainable Executive HR and Compliance Advisory Platform.

The product should help founders, business leaders and HR professionals understand:

- their organisation and workforce context;
- which people-governance or compliance topics may be relevant;
- why an advisory recommendation appears;
- which assessment answers triggered it;
- which official sources support further review;
- what action should happen next.

GrowWithHR remains an advisory product.

It must not present its outputs as:

- legal certification;
- verified legal compliance;
- a government filing status;
- confirmation that evidence has been verified;
- a substitute for qualified legal, tax, payroll or HR advice.

---

## Current protected product

The protected production assessment remains `/analyze-company.html`.

The stable experience currently provides:

- an Executive Advisory assessment;
- same-browser progress continuity;
- deterministic report mapping;
- rules-based advisory preparation;
- browser-side report generation;
- browser-side PDF generation;
- optional Gmail API delivery;
- shared site navigation;
- responsive layouts;
- regression testing;
- browser testing.

The stable assessment remains the source of truth for:

- assessment questions;
- answer validation;
- saved progress;
- report mapping;
- recommendation logic;
- PDF data;
- email-delivery data;
- lead and consent handling.

### Protected persistence contracts

The following browser-storage keys remain protected:

- `growwithhr-advisory-briefing-v2`
- `growwithhr-report`
- `growwithhr-lead`
- `growwithhr-advisory-delivery-v1`
- `growwithhr-industry-catalog-v1`

The current persisted assessment schema remains `STATE_SCHEMA_VERSION = 1`.

No milestone may rename these keys or change the saved-state schema without:

- an explicit schema-version increase;
- migration or safe-reset behavior;
- regression coverage;
- release documentation;
- rollback instructions.

---

## Delivery principles

All future milestones must follow these rules:

1. Preserve the stable production route until an approved migration.
2. Keep new experiences isolated behind explicit routes or feature flags.
3. Use deterministic rules for applicability and recommendations.
4. Keep user-confirmed facts separate from inferred or derived facts.
5. Explain why every material recommendation appears.
6. Link compliance guidance to traceable official or authoritative sources.
7. Never treat a user answer as proof that an obligation is complete.
8. Preserve PDF, email and report contracts unless a migration is approved.
9. Collect only company-level or aggregated workforce information.
10. Keep accessibility and reduced-motion behavior covered by tests.
11. Keep responsive behavior covered by browser checks.
12. Do not publicly enable incomplete milestone work.
13. Require CI and browser checks before marking a milestone complete.
14. Do not duplicate recommendation logic in the presentation layer.
15. Keep applicability status separate from evidence status.
16. Represent missing information explicitly rather than guessing.

---

# Milestone status

## M0 — Baseline freeze

**Status:** Complete

M0 established:

- the recoverable pre-transformation baseline;
- stable production routes;
- protected persistence contracts;
- modular assessment foundations;
- version-consistency checks;
- static checks;
- regression checks;
- browser checks;
- release documentation.

The M0 release manifest is `docs/releases/v0.15.1-m0-baseline.md`.

---

## M1 — Five-Act story foundation

**Status:** Complete and validated

M1 introduced the isolated private-beta route `/analyze-company-v3.html`.

The Five-Act presentation sequence is:

1. Discover
2. People
3. Footprint
4. Understand
5. Act

M1 delivered:

- application route configuration;
- a disabled-by-default `complianceDnaV3` feature flag;
- an isolated Five-Act HTML shell;
- scoped Compliance DNA styling;
- a presentation-only story engine;
- configurable narrative content;
- a compatibility adapter for protected v2 contracts;
- a truthful analysis-stage controller;
- reduced-motion support;
- static M1 contract checks;
- Playwright private-beta browser checks;
- CI coverage for stable and private-beta assessment routes.

M1 does not:

- replace the stable assessment;
- change assessment-answer meanings;
- change recommendation logic;
- change persistence keys;
- change the saved-state schema;
- change report fields;
- change PDF fields;
- change email fields;
- publicly enable the private-beta route.

The M1 release manifest is `docs/releases/v0.16.0-m1-five-act-foundation.md`.

---

## M2 — Explainable recommendation foundation

**Status:** Complete and validated

### Objective

Create a deterministic recommendation-traceability layer that explains:

- which recommendation was selected;
- which confirmed assessment facts triggered it;
- which deterministic rule produced it;
- what applicability status was assigned;
- what information is missing;
- what uncertainty remains;
- what action is recommended;
- which authoritative sources support further review.

M2 improves explainability without changing the existing stable report contract.

The complete regression, browser and CI validation gates have passed.

### Delivered implementation

M2 delivered:

- a governed recommendation-traceability schema;
- stable fact, rule, recommendation and source identifiers;
- explicit applicability-status definitions;
- explicit evidence-status definitions;
- confirmed-fact records;
- derived-fact records with source-fact references;
- structured source-reference records;
- deterministic rule-evaluation records;
- explainable recommendation records;
- a pure recommendation evaluator;
- a governed seven-rule private-beta catalog;
- a compatibility adapter for protected v2 assessment answers;
- private-beta traceability diagnostics;
- visible rule and recommendation explanations;
- triggering-fact and missing-information displays;
- applicability and evidence labels;
- official-source links;
- responsive and accessible diagnostics styling;
- contract checks;
- evaluator checks;
- compatibility-adapter checks;
- Playwright browser coverage;
- maintained CI browser-test coverage;
- release documentation;
- rollback and validation records.

### M2 implementation files

The primary M2 implementation files are:

- `data/schema/recommendation-traceability.schema.v1.json`
- `js/assessment-v3/traceability-contract.js`
- `js/assessment-v3/fact-mapper.js`
- `data/assessment/recommendation-rules.v1.json`
- `js/assessment-v3/recommendation-evaluator.js`
- `js/assessment-v3/traceability-adapter.js`
- `js/assessment-v3/traceability-diagnostics.js`
- `analyze-company-v3.html`
- `css/19-compliance-dna.css`

The primary M2 automated checks are:

- `tests/m2-traceability-contract-checks.mjs`
- `tests/m2-recommendation-evaluator-checks.mjs`
- `tests/m2-traceability-adapter-checks.mjs`
- `tests/e2e/analyze-company-v3-traceability.spec.ts`

The maintained browser workflow is:

- `.github/workflows/executive-assessment-tests.yml`

The M2 release record is:

- `docs/releases/v0.16.0-m2-explainable-recommendation-foundation.md`

The M2 validation record is:

- `docs/releases/v0.16.0-m2-validation-record.md`

### Stable-route guarantee

M2 does not replace `/analyze-company.html`.

The private-beta diagnostics remain isolated at `/analyze-company-v3.html`.

Public routing continues to resolve to the stable assessment while:

`complianceDnaV3: false`

M2 does not:

- change the protected assessment schema;
- rename a protected persistence key;
- introduce a traceability storage key;
- write traceability into protected assessment state;
- add M2 fields to the stable report;
- remove a protected report field;
- change protected PDF fields;
- change protected email fields;
- change protected delivery fields;
- change lead or consent interpretation;
- publicly enable the private-beta route.

### Required conceptual separation

M2 keeps the following records distinct.

#### 1. Confirmed facts

Answers explicitly supplied by the user.

Examples include:

- employee count;
- contractor count;
- primary operating state;
- number of locations;
- working model;
- people-function structure;
- hiring plans;
- selected priorities.

A confirmed fact records what the user supplied.

It does not prove legal compliance.

#### 2. Derived facts

Values calculated deterministically from confirmed answers.

Examples include:

- total reported workforce;
- workforce-size band;
- multi-location indicator;
- multi-country indicator;
- distributed-workforce indicator;
- rapid-growth indicator;
- expansion-activity indicator;
- formal-People-function indicator.

Every derived fact records which confirmed facts were used.

#### 3. Rule evaluations

Results produced by applying a deterministic rule to confirmed and derived facts.

A rule evaluation includes:

- a stable rule identifier;
- the rule version;
- the evaluated status;
- required facts;
- triggering facts;
- missing facts;
- a human-readable reason;
- source references;
- an evaluation timestamp.

#### 4. Recommendations

Advisory actions selected from rule evaluations.

A recommendation includes:

- a stable recommendation identifier;
- the originating rule identifier;
- the applicability status;
- a title;
- a reason;
- a recommended action;
- a suggested timeline;
- triggering facts;
- missing information;
- evidence status;
- source references;
- limitations or review notices.

#### 5. Evidence status

Evidence status describes supporting material, not rule applicability.

It remains separate from applicability status.

The current assessment does not collect or verify documentary evidence.

#### 6. Source references

Structured references identify official or authoritative materials relevant to a rule.

A source reference does not imply that the source has:

- verified the assessed organisation;
- determined that a rule applies;
- certified compliance;
- confirmed completion of an obligation.

---

## M2 applicability statuses

The deterministic model supports:

- `applicable`
- `likely-applicable`
- `not-currently-applicable`
- `more-information-needed`
- `specialist-review`

These statuses describe rule evaluation.

They do not mean:

- verified compliance;
- verified non-compliance;
- completed filing;
- completed registration;
- verified evidence;
- formal legal advice.

### Status meanings

#### `applicable`

The supplied facts satisfy the deterministic conditions defined by the rule.

This remains an advisory result rather than verified legal applicability.

#### `likely-applicable`

The available facts strongly indicate applicability, but one or more details still require confirmation.

#### `not-currently-applicable`

The supplied facts do not meet the rule’s current deterministic conditions.

This status must not be used merely because required facts are missing.

#### `more-information-needed`

The rule cannot be evaluated because one or more required facts are absent, unclear or unsupported.

The missing fact identifiers must be recorded.

#### `specialist-review`

The rule requires professional interpretation, jurisdiction-specific confirmation or facts outside the current assessment contract.

---

## M2 evidence statuses

The evidence model supports:

- `not-requested`
- `not-provided`
- `provided`
- `not-verified`
- `verified`

### Evidence rules

- M2 defaults to `not-requested` where evidence collection does not exist.
- A user statement is not evidence verification.
- A filename or uploaded document is not automatically verified evidence.
- `provided` means material was supplied.
- `not-verified` means material exists but has not completed an approved verification process.
- `verified` must not be assigned without an explicit verification process.
- Applicability status must never be inferred from evidence status alone.

The initial M2 recommendation catalog defaults to:

`not-requested`

---

## M2 identifier requirements

Identifiers are:

- stable;
- lowercase;
- machine-readable;
- version-controlled;
- independent from user-facing labels.

Required patterns include:

- rule identifier: `rule.<domain>.<topic>.<condition>`
- recommendation identifier: `recommendation.<domain>.<action>`
- fact identifier: `fact.<category>.<name>`
- source identifier: `source.<authority>.<document>`

Examples include:

- `rule.governance.primary-state.review`
- `rule.workplace.multi-location.review`
- `recommendation.governance.review-employment-documentation`
- `fact.workforce.employee-count`
- `fact.footprint.primary-state`
- `source.india-code.official-legislation`

Identifiers must not contain:

- customer names;
- email addresses;
- assessment values;
- personal employee information.

---

## M2 source-reference requirements

Each structured source reference supports:

- `id`
- `title`
- `publisher`
- `url`
- `jurisdiction`
- `sourceType`
- a review date where appropriate
- `notes`
- `official`

Allowed source types may include:

- legislation;
- regulation;
- government guidance;
- official portal;
- regulator guidance;
- authoritative professional guidance.

The `official` field must be explicit.

A source URL must not be treated as proof that the source applies to every organisation.

Rules must explain why a source is relevant to the evaluated facts.

The initial governed catalog includes official references to:

- the Ministry of Labour and Employment portal;
- India Code.

---

## M2 implementation sequence

The M2 implementation sequence is complete:

1. Define the recommendation-traceability contract.
2. Define deterministic rule identifiers.
3. Define applicability statuses.
4. Define evidence statuses.
5. Define confirmed-fact and derived-fact records.
6. Define structured source-reference requirements.
7. Define rule-evaluation records.
8. Define recommendation-result records.
9. Build a pure traceability evaluator with no DOM access.
10. Keep the evaluator free from browser-storage access.
11. Add representative deterministic rules.
12. Add contract and unit checks.
13. Connect traceability to the compatibility adapter.
14. Preserve all protected report fields.
15. Expose private-beta diagnostics for review.
16. Add browser checks for visible recommendation explanations.
17. Document limitations, rollback and release gates.
18. Complete maintained regression, browser and CI validation.
19. Record successful validation.

---

## M2 acceptance gates

M2 required:

- each evaluated recommendation to have a stable identifier;
- each recommendation to record its triggering facts;
- each recommendation to reference a deterministic rule identifier;
- each rule to record its required facts;
- applicability and evidence statuses to remain separate;
- unresolved information to be represented explicitly;
- official-source references to be structured;
- rules not to claim legal verification;
- evidence defaults to remain conservative;
- the evaluator to have no DOM access;
- the evaluator to have no local-storage access;
- the evaluator to produce deterministic results;
- no rule to silently change protected v2 report output;
- no protected report field to be removed;
- no protected persistence key to be renamed;
- no new browser-storage key to be introduced without approval;
- `npm run version:check` to pass;
- `npm run validate:compliance` to pass;
- `npm run test:m2` to pass;
- the complete `npm test` regression suite to pass;
- stable browser checks to pass;
- Five-Act private-beta browser checks to pass;
- M2 traceability browser checks to pass;
- maintained CI workflows to report success.

### Acceptance result

All required M2 implementation and validation gates passed.

The successful validation covered:

- GrowWithHR CI;
- version consistency;
- compliance-data validation;
- the complete maintained regression suite;
- Executive Assessment Tests;
- stable assessment browser checks;
- Five-Act private-beta browser checks;
- M2 traceability browser checks.

The validation baseline was:

`387b7897ad2f367a0e5e62d1019cf956a42a7598`

The validation result is recorded in:

`docs/releases/v0.16.0-m2-validation-record.md`

M2 is complete and validated.

---

## M3 — Compliance advisory presentation

**Status:** Complete and validated

**Release:** `v0.18.0`

### Exit result

M3 converts the governed M2 recommendation-traceability bundle into one executive-facing private-beta Compliance Story without reconstructing recommendation rules in HTML, CSS, page controllers, report templates or PDF templates.

The completed release includes:

- a versioned Compliance Story schema and pure model;
- a company snapshot derived from confirmed and derived facts;
- separate safe applicability and evidence-status counts;
- no more than three deterministically ranked priorities;
- every governed rule outcome grouped by advisory domain;
- rationale, trigger facts, missing information, next actions, timelines and implications;
- structured source references, limitations and assumptions;
- loading, empty and safe error states;
- responsive, keyboard and reduced-motion presentation safeguards;
- maintained contract, regression and Playwright coverage.

The stable route remains `/analyze-company.html`.

The private-beta route remains `/analyze-company-v3.html` and `complianceDnaV3` remains disabled by default.

M3 does not mutate protected browser state, the stable report, PDF, email or delivery contracts. Stable report/PDF integration remains a separately approved migration.

### Acceptance result

The version cut is committed only after version consistency, compliance validation, the complete maintained regression suite and stable/M1/M2/M3 browser coverage pass on the release branch.

---

## M4 — Compliance action planning

**Status:** Planned

### Objective

Turn advisory findings into a structured company-level action plan.

Potential deliverables include:

- compliance action items;
- policy checklists;
- responsible-owner fields;
- target dates;
- status tracking;
- review reminders;
- export-ready action summaries.

Persistence, accounts, cloud storage and cross-device access require separate privacy, security and retention approval.

---

## M5 — Ongoing compliance workspace

**Status:** Long-term

Potential capabilities include:

- user accounts;
- multi-company workspaces;
- cloud-based assessments;
- evidence libraries;
- document uploads;
- compliance calendars;
- policy management;
- audit histories;
- expiry tracking;
- dashboards;
- board reporting;
- leadership reporting;
- integrations with approved external systems.

These capabilities must not be introduced without:

- authentication design;
- authorization design;
- data-retention rules;
- deletion controls;
- privacy-notice updates;
- security review;
- audit logging;
- access-control testing;
- production monitoring;
- incident-response planning.

---

# Architecture direction

The target processing sequence is:

1. Assessment answers
2. Confirmed facts
3. Derived facts
4. Deterministic rule evaluation
5. Applicability status
6. Missing-information record
7. Structured source references
8. Traceable recommendations
9. Private-beta presentation
10. Compatibility mapping
11. Future report presentation

The rules engine decides applicability.

The presentation layer renders governed evaluator output.

A future retrieval or AI explanation layer may:

- retrieve approved source material;
- explain an existing deterministic result;
- summarise triggering facts;
- answer follow-up questions within defined boundaries.

It must not:

- invent obligations;
- independently change applicability;
- claim evidence has been verified;
- override deterministic rule results without an explicit reviewed process;
- create unsupported source citations;
- change protected report fields.

---

# Testing strategy

The maintained test layers are:

1. Version-consistency checks.
2. Compliance-data validation.
3. Baseline contract checks.
4. M1 private-beta contract checks.
5. M2 traceability-contract checks.
6. M2 recommendation-evaluator checks.
7. M2 compatibility-adapter checks.
8. Static requirements checks.
9. Frontend production checks.
10. Assessment journey checks.
11. Report scenario checks.
12. Golden scenario checks.
13. UX component checks.
14. Playwright stable-assessment checks.
15. Playwright Five-Act private-beta checks.
16. Playwright M2 traceability checks.

M2 coverage includes:

- traceability-contract checks;
- identifier-format checks;
- status-enumeration checks;
- fact-reference checks;
- source-reference checks;
- deterministic evaluator tests;
- missing-information tests;
- protected-state compatibility tests;
- storage-isolation tests;
- private-beta explanation tests;
- catalog-failure tests;
- refresh-behavior tests;
- mobile responsive tests;
- keyboard-operability tests.

New milestones must extend existing test layers rather than replacing protected baseline coverage.

---

# Release strategy

The repository remains at `0.15.1-beta` after M2 validation.

The target `0.16.0-beta` version must be applied as one coordinated release cut across every version-bearing file governed by the version-sync contract.

A release cut requires:

- an explicit release decision;
- passing GrowWithHR CI;
- passing Executive Assessment Tests;
- updated release documentation;
- confirmed feature-flag state;
- confirmed stable-route behavior;
- rollback instructions;
- coordinated version synchronization.

M2 completion does not itself authorise the version cut.

The private-beta route remains excluded from public promotion until an explicit release decision changes the feature flag.

No individual version-bearing file may be changed independently.

---

# Immediate next decision tasks

1. Preserve the stable production route at `/analyze-company.html`.
2. Keep `complianceDnaV3` disabled by default.
3. Review whether to approve the coordinated `0.16.0-beta` version cut.
4. Treat the version cut as one coordinated multi-file release operation.
5. Review whether to begin formal M3 planning.
6. Do not begin M3 implementation without an approved scope.
7. Do not integrate traceability into stable report, PDF or email contracts without a separate migration decision.
8. Continue maintaining M2 regression and browser coverage.
