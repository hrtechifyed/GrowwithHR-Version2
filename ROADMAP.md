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

**Status:** Implementation complete; release validation pending

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

The milestone must not be marked complete and validated until its complete regression, browser and CI gates have passing evidence.

### Delivered implementation

M2 has delivered:

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
- rollback and validation gates.

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

### Stable-route guarantee

M2 does not replace `/analyze-company.html`.

The private-beta diagnostics remain isolated at `/analyze-company-v3.html`.

Public routing must continue to resolve to the stable assessment while:

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

The M2 implementation sequence has been completed:

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

Completion of the implementation sequence does not by itself complete the milestone.

The validation gates below still require passing evidence.

---

## M2 acceptance gates

M2 is complete only when:

- each evaluated recommendation has a stable identifier;
- each recommendation records its triggering facts;
- each recommendation references a deterministic rule identifier;
- each rule records its required facts;
- applicability and evidence statuses remain separate;
- unresolved information is represented explicitly;
- official-source references are structured;
- rules do not claim legal verification;
- evidence defaults are conservative;
- the evaluator has no DOM access;
- the evaluator has no local-storage access;
- the evaluator produces deterministic results;
- no rule silently changes protected v2 report output;
- no protected report field is removed;
- no protected persistence key is renamed;
- no new browser-storage key is introduced without approval;
- `npm run version:check` passes;
- `npm run validate:compliance` passes;
- `npm run test:m2` passes;
- the complete `npm test` regression suite passes;
- stable browser checks pass;
- Five-Act private-beta browser checks pass;
- M2 traceability browser checks pass;
- the maintained CI workflows report success.

### Current acceptance status

The implementation and maintained test coverage are present.

M2 remains in release validation until passing evidence is available for every required gate on the final integration commit.

The roadmap must not change the M2 status to “Complete and validated” before that evidence exists.

---

## M3 — Compliance advisory presentation

**Status:** Planned

### Objective

Evolve the validated M2 traceability foundation into a polished executive-facing private-beta advisory presentation.

Potential deliverables include:

- executive recommendation summaries;
- priority and timeline groupings;
- concise “Why this appears” summaries;
- expandable fact and source details;
- uncertainty and specialist-review notices;
- recommendation comparison views;
- improved private-beta report layouts;
- accessible explanation panels;
- approved traceability integration into future report contracts.

M3 must consume M2 traceability records.

It must not reconstruct recommendation logic in:

- HTML;
- CSS;
- page controllers;
- report templates;
- PDF templates.

Any integration into stable reports requires a separately approved migration.

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

The repository remains at `0.15.1-beta` during integration and validation.

The target `0.16.0-beta` version must be applied as one coordinated release cut across every version-bearing file governed by the version-sync contract.

A release cut requires:

- completed milestone acceptance gates;
- passing GrowWithHR CI;
- passing Executive Assessment Tests;
- updated release documentation;
- confirmed feature-flag state;
- confirmed stable-route behavior;
- rollback instructions;
- coordinated version synchronization.

M2 completion does not itself authorise the version cut.

The private-beta route must remain excluded from public promotion until an explicit release decision changes the feature flag.

---

# Immediate next validation tasks

1. Run `npm run version:check`.
2. Run `npm run validate:compliance`.
3. Run `npm run test:m2`.
4. Run the complete `npm test` regression suite.
5. Run stable assessment browser checks.
6. Run Five-Act private-beta browser checks.
7. Run `tests/e2e/analyze-company-v3-traceability.spec.ts`.
8. Confirm maintained CI workflows report success.
9. Record any corrective work revealed by validation.
10. Mark M2 complete and validated only after every acceptance gate passes.
11. Review whether to begin M3 planning.
12. Approve or reject a coordinated `0.16.0-beta` version cut separately.
