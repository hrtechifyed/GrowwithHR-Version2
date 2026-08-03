# GrowWithHR complete feature coverage inventory

**Inventory version:** 1.0.0  
**Repository baseline:** `main` after merge commit `fb8fe128a1eed80607132a9adb39b930c4e9aa17`  
**Prepared:** 2026-08-03  
**Scope:** assessment facts, deterministic rules, legal knowledge records, source governance, retrieval, explanation, and private-beta presentation.

## 1. Purpose and safety boundary

This document records what GrowWithHR currently contains and what is still required to extend the working POSH assurance pattern to the rest of the product.

It is an architecture and product inventory only. It does **not**:

- approve or verify any legal conclusion;
- change a deterministic rule or assessment answer;
- add a new source pack, retrieval corpus, endpoint, provider call, report field, PDF field, email field, or browser-storage key;
- treat a knowledge-base record as an approved applicability rule;
- treat a portal link or a schema-valid law record as section-mapped legal evidence.

All legal statuses, effective dates, verification labels, thresholds, and supersession relationships mentioned below are **repository-recorded assertions**. They were not independently re-researched or legally approved during this inventory. Every future legal feature must retain `needs-legal-review` until its separate legal-governance process is complete.

The required authority boundary remains:

```text
Assessment answers
→ deterministic fact mapping
→ deterministic rule result
→ approved source retrieval
→ explanation-only language model
→ strict response validation
→ private-beta presentation
```

Retrieval and language models must never create, infer, select, change, or override applicability facts or decisions.

## 2. Executive coverage snapshot

| Layer | Current repository coverage | Current assurance level |
|---|---:|---|
| Confirmed assessment fields mapped to M2 facts | 24 | Deterministic fact mapping |
| Derived M2 facts | 8 | Deterministic derivation |
| Governed M2 advisory rules | 7 | Advisory-only, private-beta |
| Governed legal applicability rules | 1 | Provisional, `needs-legal-review` |
| Older HR module readiness checks | 42 | Operational placeholders, not governed legal rules |
| Schema-valid law records | 51 | Knowledge records only |
| Central law records | 15 | Mixed active/superseded repository status |
| State and Union Territory records | 36 | Knowledge records only |
| Governed source-chunk catalogues | 1 | POSH only |
| Governed legal explanation HTTP endpoints | 1 | POSH only |
| Private-beta source-grounded legal panels | 1 | POSH only |
| End-to-end legal-assurance features | 1 | POSH Internal Committee threshold review |

The key distinction is that GrowWithHR has broad **data coverage**, but only POSH currently has the complete controlled path from assessment facts through deterministic legal decision, governed source retrieval, explanation validation, and live private-beta display.

## 3. Coverage status model

This inventory uses five statuses.

| Status | Meaning |
|---|---|
| **Live governed legal assurance** | Deterministic legal rule, controlled official source chunks, governed retrieval, strict explanation contract, endpoint, tests, and private-beta UI are working. |
| **Governed advisory** | Deterministic M2 recommendation exists, but it is not a law-specific applicability rule and does not have a law-specific source pack. |
| **Knowledge record only** | A schema-valid central or state law record exists, but it is not wired to the governed legal-assurance path. |
| **Legacy or readiness logic** | Older threshold, module, report, or recommendation logic exists but lacks the governed M2/legal contracts required for assurance. |
| **Not captured** | The assessment does not collect the facts needed for a safe deterministic result. |

## 4. Assessment fact coverage

### 4.1 Confirmed facts available from the protected assessment

The M2 fact mapper currently recognizes these 24 assessment answers.

| Domain | Assessment field | Fact identifier | Current usefulness |
|---|---|---|---|
| Company | `companyName` | `fact.company.name` | Display/context only; must not be sent to a legal explanation provider. |
| Company | `industry` | `fact.company.industry` | Broad industry classification. |
| Company | `industryId` | `fact.company.industry-id` | Controlled industry identifier where available. |
| Company | `customIndustry` | `fact.company.custom-industry` | Free-text industry context. |
| Company | `nature` | `fact.company.business-nature` | Broad business description. |
| Company | `founded` | `fact.company.founded-year` | Operational maturity context. |
| Company | `foundedNotSure` | `fact.company.founded-year-unknown` | Missing-year indicator. |
| Company | `entity` | `fact.company.entity-type` | Broad entity type. |
| Company | `fundingStage` | `fact.company.funding-stage` | Operational/growth context. |
| Workforce | `employees` | `fact.workforce.employee-count` | Total employee count only. |
| Workforce | `contractWorkers` | `fact.workforce.contract-worker-count` | Total contract/outsourced worker count only. |
| Workforce | `interns` | `fact.workforce.intern-count` | Total intern count only. |
| Workforce | `apprentices` | `fact.workforce.apprentice-count` | Total apprentice count only. |
| Workforce | `workModel` | `fact.workforce.work-model` | Office/hybrid/remote/field/mixed context. |
| Workforce | `remoteBand` | `fact.workforce.remote-workforce-band` | Remote-work band. |
| Workforce | `remoteExact` | `fact.workforce.remote-workforce-percentage` | Remote-work percentage. |
| Footprint | `primaryState` | `fact.footprint.primary-state` | One primary state only. |
| Footprint | `locations` | `fact.footprint.location-count` | Total permanent location count only. |
| Footprint | `countries` | `fact.footprint.country-count` | Count only; no country list. |
| Growth | `hiringPlans` | `fact.growth.hiring-plan` | Broad hiring direction. |
| Growth | `expansionPlans` | `fact.growth.expansion-plans` | Selected expansion activities. |
| Growth | `growthContext` | `fact.growth.context` | Free-text growth context. |
| People | `peopleFunction` | `fact.people.people-function` | Current HR/People ownership model. |
| People | `priorities` | `fact.people.priorities` | User-selected advisory priorities. |

### 4.2 Deterministic derived facts

| Derived fact | Source facts | Current use |
|---|---|---|
| `fact.workforce.total-reported-workforce` | Employee, contract worker, intern, apprentice counts | Aggregate advisory context; not automatically a statutory headcount. |
| `fact.workforce.size-band` | Employee count | Product segmentation. |
| `fact.footprint.multi-location` | Location count | M2 multi-location advisory rule. |
| `fact.footprint.multi-country` | Country count | Operating-complexity context. |
| `fact.workforce.distributed-workforce` | Work model and remote facts | Distributed-work advisory rule. |
| `fact.growth.rapid-growth` | Hiring plan | Workforce-planning advisory rule. |
| `fact.growth.expansion-activity` | Expansion plans | Workforce-planning advisory rule. |
| `fact.people.formal-people-function` | People-function answer | People-governance ownership advisory rule. |

### 4.3 Important fact limitations

The current fact map is suitable for broad advisory triage, but it is insufficient for most legal applicability decisions because it does not distinguish facts by establishment, office, administrative unit, worker category, wage band, role, location, or effective period.

The current employee count must not be silently reused as:

- establishment headcount;
- office or administrative-unit headcount;
- statutory employee or worker count under a particular law;
- covered employee count under a scheme;
- wage-eligible employee count;
- women-employee count;
- contract-labour count for a particular principal employer, contractor, or site.

## 5. Governed rule inventory

### 5.1 Legal applicability rules

| Feature | Rule | Required assessment facts | Sources | Retrieval | Explanation | UI | Status |
|---|---|---|---|---|---|---|---|
| POSH Internal Committee threshold review | `rule.legal.posh.internal-committee-threshold` | Employee count, primary state, location count | POSH Act, Rules, commencement source pack | Working | Working through Cloudflare Workers AI with strict validation | Working on V3 | **Live governed legal assurance; still `needs-legal-review`** |

No other rule in `data/assessment/legal-applicability-rules.v1.json` currently exists.

### 5.2 Governed M2 advisory rules

These seven rules are deterministic and traceable, but they are explicitly advisory-only and private-beta-only. Their broad portal references do not make them law-specific applicability rules.

| Rule | Domain | Current result type | Current source quality | Legal-assurance readiness |
|---|---|---|---|---|
| `rule.governance.primary-state.review` | Governance | Confirms whether one primary state was supplied | Ministry/India Code portal level | Not ready; needs per-location jurisdiction model and state-specific source packs. |
| `rule.governance.employment-documentation.review` | Governance | Recommends documentation review when employees exist | Ministry/India Code portal level | Mixed legal/operational; must be decomposed into specific document obligations and general good practice. |
| `rule.workplace.multi-location.review` | Workplace | Flags operating complexity | Ministry/India Code portal level | Advisory-ready; not a registration or filing applicability rule. |
| `rule.workforce.distributed-workforce.review` | Workforce | Flags distributed-work practices | Ministry/India Code portal level | Advisory-ready; legal conclusions require actual worker locations and jurisdiction facts. |
| `rule.growth.rapid-change.workforce-planning` | Growth | Recommends workforce planning | Ministry portal level | Operational feature; suitable for non-legal explanation after a separate operational contract is defined. |
| `rule.people.ownership.formal-function-review` | People | Recommends a named People-governance owner | Ministry portal level | Operational feature; not legal applicability. |
| `rule.people.priority.policies-compliance` | People | Responds to a selected user priority | Ministry/India Code portal level | Operational/mixed; selection does not establish a legal duty. |

## 6. Older HR module readiness inventory

The six older module repositories contain seven checks each, for 42 checks in total. They evaluate a different company object, return a simple `passed` flag, and do not use M2 fact identifiers, source records, evidence status, missing-fact handling, reason codes, temporal validity, or legal-review boundaries.

They should be classified as operational readiness placeholders until migrated or retired.

### 6.1 Hiring — 7 checks

| ID | Feature |
|---|---|
| `HIR-001` | Growth stage defined |
| `HIR-002` | Departments available |
| `HIR-003` | Reporting structure |
| `HIR-004` | Workforce planning |
| `HIR-005` | Business units |
| `HIR-006` | Office locations |
| `HIR-007` | Hiring readiness/company profile |

### 6.2 Policy — 7 checks

| ID | Feature |
|---|---|
| `POL-001` | Company profile |
| `POL-002` | Organisation structure |
| `POL-003` | Business model |
| `POL-004` | Growth stage |
| `POL-005` | Reporting structure |
| `POL-006` | Employee strength |
| `POL-007` | Entity information |

### 6.3 Talent — 7 checks

| ID | Feature |
|---|---|
| `TAL-001` | Career framework |
| `TAL-002` | Leadership pipeline |
| `TAL-003` | Growth stage |
| `TAL-004` | Department coverage |
| `TAL-005` | Talent development |
| `TAL-006` | Business units |
| `TAL-007` | Company profile |

### 6.4 Rewards — 7 checks

| ID | Feature |
|---|---|
| `REW-001` | Employee strength |
| `REW-002` | Growth stage |
| `REW-003` | Reporting hierarchy |
| `REW-004` | Department structure |
| `REW-005` | Business model |
| `REW-006` | Management readiness |
| `REW-007` | Company profile |

### 6.5 Learning — 7 checks

| ID | Feature |
|---|---|
| `LRN-001` | Employee database |
| `LRN-002` | Department structure |
| `LRN-003` | Reporting hierarchy |
| `LRN-004` | Growth stage |
| `LRN-005` | Learning governance |
| `LRN-006` | Department coverage |
| `LRN-007` | Company profile |

### 6.6 Culture — 7 checks

| ID | Feature |
|---|---|
| `CUL-001` | Organisation structure |
| `CUL-002` | Leadership structure |
| `CUL-003` | Growth stage |
| `CUL-004` | Department coverage |
| `CUL-005` | Employee-experience readiness |
| `CUL-006` | Business model |
| `CUL-007` | Company profile |

### 6.7 Migration guidance for module checks

Operational checks that remain useful should be moved into a governed non-legal recommendation contract rather than copied into the legal applicability catalog. Each migrated operational feature should have:

- stable fact identifiers;
- deterministic missing-information handling;
- outcome reason codes;
- a clear distinction between a positive condition and a remediation recommendation;
- evidence or guidance provenance where claims are made;
- an explicit `operational-advisory` authority label;
- no use of `applicable` where the meaning is merely recommended or ready.

## 7. Legal knowledge-base inventory

The compliance-data validator reports 51 schema-valid law records: 15 central records and 36 State/Union Territory records. Schema validity confirms structure, identifiers, internal source references, and temporal-field format. It does not independently confirm legal accuracy or product applicability.

### 7.1 Central records

| Record | Repository-recorded status | Loaded by current `app.js` central knowledge object | Governed legal rule | Governed source chunks | Explanation endpoint |
|---|---|---:|---:|---:|---:|
| Central Labour Framework (`central-laws.json`) | Active umbrella | Separate load | No | No | No |
| Code on Wages (`code-on-wages.json`) | Active | Yes | No | No | No |
| Industrial Relations Code (`industrial-relations-code.json`) | Active | **No** | No | No | No |
| Social Security Code (`social-security-code.json`) | Active | **No** | No | No | No |
| OSHWC Code (`oshwc-code.json`) | Active | Yes | No | No | No |
| POSH (`posh.json`) | Active, draft governance | Yes | **One threshold rule** | **Yes** | **Yes** |
| Apprentices (`apprentices.json`) | Active | Yes | No | No | No |
| Child and Adolescent Labour (`child-labour.json`) | Active | Yes | No | No | No |
| EPF legacy record (`epfo.json`) | Superseded/historical | Yes | No | No | No |
| ESI legacy record (`esic.json`) | Superseded/historical | Yes | No | No | No |
| Bonus legacy record (`bonus.json`) | Superseded/historical | Yes | No | No | No |
| Gratuity legacy record (`gratuity.json`) | Superseded/historical | Yes | No | No | No |
| Contract Labour legacy record (`contract-labour.json`) | Superseded/historical | Yes | No | No | No |
| Maternity Benefit legacy record (`maternity-benefit.json`) | Superseded/historical | Yes | No | No | No |
| Employees Compensation legacy record (`employees-compensation.json`) | Superseded/historical | Yes | No | No | No |

The central umbrella also contains a bonded-labour feature, but no dedicated bonded-labour record was found in the central directory during this inventory.

### 7.2 POSH feature depth

The standalone POSH knowledge record contains six broad obligations:

1. policy;
2. Internal Committee where applicable;
3. awareness programmes;
4. statutory notices;
5. complaint records;
6. annual reporting where applicable.

Only the Internal Committee threshold review has been migrated to the governed legal-assurance catalog. The other five POSH obligations remain knowledge-record entries and must not be displayed as governed applicability results yet.

### 7.3 State and Union Territory records

The application maps and loads 36 State/Union Territory files. These records cover state-specific categories such as Shops and Establishments, employment records, notices, leave/holiday, professional tax, labour welfare, and other local requirements depending on the record.

Current limitations:

- the assessment stores one `primaryState`, not the state for every location;
- the location count has no state-by-location mapping;
- state records generally contain broad or partially verified citations rather than governed section-level source chunks;
- there is no state-specific legal applicability catalog;
- there is no state-specific retrieval corpus;
- there is no generic state explanation endpoint;
- the central source-registry files have empty `states` sections.

Therefore, the presence of 36 state files does not mean 36 state assurance features are ready.

## 8. Legacy compliance and report-rule inventory

### 8.1 `data/compliance-engine.json`

This file contains legacy product mappings for:

- employee thresholds;
- entity-type recommendations;
- five explicit state mappings;
- industry recommendations;
- future-readiness thresholds;
- broad official portal links.

It must not be treated as the governed legal source of truth. Key drift risks include:

- references to legacy EPFO, ESIC, gratuity, bonus, maternity, and contract-labour rule identifiers whose corresponding knowledge records are now marked superseded/historical;
- simple employee-count thresholds without the chapter-, establishment-, worker-, wage-, scheme-, notification-, or appropriate-government facts required by the newer knowledge records;
- a POSH threshold mapping that references `POSH-001`, while the standalone POSH record uses `POSH-001` for policy and `POSH-002` for Internal Committee constitution;
- state recommendations for only Karnataka, Maharashtra, Tamil Nadu, Delhi, and Telangana, despite 36 State/UT knowledge records.

No legacy threshold or identifier should be copied into a new governed rule without a fresh fact model, source mapping, temporal review, and boundary tests.

### 8.2 `data/compliance-rules.json`

This file contains illustrative readiness content for:

- Shops and Establishments review;
- employment documentation;
- payroll review;
- POSH framework assessment;
- employee handbook;
- performance management;
- manager capability;
- workforce planning;
- general risk alerts and future readiness.

It is useful as a product-topic inventory, but it is not a governed legal applicability catalog.

## 9. Source and retrieval coverage

### 9.1 Current source registries

Two parallel JSON registries currently exist:

- `data/knowledge-base/source-registry.json`
- `data/knowledge-base/sources/source-registry.json`

They contain overlapping but different central authority lists, and both have empty state sections. This creates avoidable drift risk.

A future governance phase should designate one canonical registry, migrate all source identifiers, and prevent duplicate authority definitions.

### 9.2 Retrieval-ready coverage

Only POSH currently has a governed source-chunk catalogue:

```text
growwithhr-rag/data/posh-source-chunks.v1.json
```

A schema-valid law record is not retrieval-ready merely because it includes portal URLs or citation labels. Retrieval readiness requires, at minimum:

- approved registry source identifiers;
- official document identity and status;
- clean official URL;
- effective-date metadata;
- exact section/rule/notification mapping;
- controlled chunk text;
- page boundaries;
- content hash;
- source-pack verification;
- a decision-to-source allowlist;
- retrieval tests that reject unrelated or unregistered chunks.

### 9.3 Explanation coverage

The current server implementation is POSH-specific:

- route: `/api/legal-explanation/posh`;
- fixed POSH retrieval catalogue;
- fixed three-field input allowlist;
- fixed `lawId: posh` envelope;
- fixed POSH decision filter;
- fixed POSH query terms;
- fixed POSH private-beta panel.

The provider and strict explanation contract are reusable in principle, but the endpoint, retrieval catalogue selection, input schema, and UI controller are not yet generic multi-feature components.

## 10. Legal applicability fact-gap matrix

| Legal feature family | Facts available now | Important missing facts | Current readiness |
|---|---|---|---|
| POSH Internal Committee threshold | Total employees, one primary state, location count | Employee count per office/administrative unit and legally relevant workplace facts | Live provisional rule; specialist review required |
| Other POSH duties | Basic organisation/workforce/footprint context | Existing policy, awareness, notices, complaint mechanism, committee composition, records, reporting period, evidence | Knowledge record only |
| Shops and Establishments | Primary state, total locations, entity, industry, employee count | State for each establishment, establishment type, opening date, registration status, local exemptions, per-location facts | Not ready |
| Code on Wages | Employees, contract workers, state, industry | Employee/worker classification, wage components, wage period, wage rates, scheduled employment/notifications, bonus eligibility, appropriate government | Not ready |
| Social Security — PF/ESI/gratuity/maternity/compensation | Employee and contract-worker counts, entity, industry, state | Scheme-specific covered headcount, wages, excluded categories, establishment notification, prior coverage, contribution data, women employees, service, injury/occupation facts, appropriate government | Not ready |
| OSHWC | Employees, contract workers, locations, industry, work model | Establishment/factory/mine/plantation/site type, hazardous processes, contractor/site distribution, migrant-worker facts, registration/licence status, safety/welfare evidence, appropriate government | Not ready |
| Industrial Relations | Employee count, industry, entity, growth context | Statutory worker categories, industrial establishment type, union presence, negotiating union/council, grievance committee facts, standing-order threshold facts, lay-off/retrenchment/closure facts | Not ready |
| Apprentices | Apprentice count, industry, entity, state | Trade/category, designated/optional trade, establishment coverage, contracts, portal registration, quota/eligibility facts, training and stipend evidence | Partially fact-ready; legal rule and sources missing |
| Child and adolescent labour | General workforce counts and industry | Worker ages, adolescent work, occupation/process hazard classification, age-verification evidence, exceptions | Not ready |
| Bonded/forced labour | General workforce and contract-worker counts | Recruitment/debt/coercion indicators, contractor practices, worker complaints, evidence and escalation process | Not captured |
| Contract workforce governance | Contract-worker count, locations, industry | Contractor count, principal employer, site allocation, worker category, establishment/site threshold facts, licences/registrations, wage/welfare evidence | Advisory context only |
| Distributed/remote workforce | Work model, remote band/percentage, country count | Worker-by-location map, employing entity, tax residence, state/country jurisdiction, written arrangement, payroll location | Governed operational advisory only |
| Multi-country employment | Country count | Country list, worker locations, employing entities, payroll/tax/social-security facts | Not ready |

## 11. Cross-cutting architecture gaps

### 11.1 No canonical feature registry

There is no single governed registry linking a product feature to:

- classification (`legal-assurance`, `operational-advisory`, `legacy`, `data-only`);
- deterministic rule identifiers;
- required assessment facts;
- knowledge-base records;
- approved source packs;
- retrieval catalogues;
- explanation routes;
- UI surfaces;
- legal-review status;
- blockers and readiness.

### 11.2 Multiple rule systems

The repository currently has at least four overlapping rule/content systems:

1. governed legal applicability rules;
2. governed M2 advisory rules;
3. older module readiness checks;
4. legacy compliance-engine/report mappings.

They use different identifiers, fact models, status words, source expectations, and output contracts. They should not be merged by copying records into one file. Each feature must first be classified as legal assurance or operational advisory.

### 11.3 Knowledge-base/runtime mismatch

The current `app.js` central knowledge object loads 12 individual central records but omits the existing Industrial Relations Code and Social Security Code files. The umbrella central framework is loaded separately. This means data presence and runtime use are not identical.

### 11.4 Source-registry duplication

Two overlapping source registries and empty centralized state sections make source governance harder to enforce.

### 11.5 Portal references are not source packs

Many M2 and knowledge-base records reference a ministry or India Code portal without exact sections, pages, excerpts, document hashes, or decision allowlists. These references support further research but cannot be used as the governed retrieval corpus.

### 11.6 Legal temporal migration

Several legacy records are marked superseded and retained for historical traceability. New current-period product logic must target the repository-recorded current Code records and applicable rules/notifications rather than reactivating old threshold IDs. Historical questions require a separate effective-date input and temporal decision path.

### 11.7 UI and endpoint duplication risk

Copying the POSH endpoint and panel for every feature would create many hard-coded routes, input allowlists, source catalogues, tests, and renderers. Multi-feature support should be implemented through a registry-driven server and a shared panel only after the registry contract is approved.

## 12. Feature rollout plan

### Phase 0 — governance and reusable architecture

1. Approve one canonical feature classification and coverage registry.
2. Design a generic server-side feature resolver that selects only approved deterministic rules, fact allowlists, source packs, and retrieval catalogues.
3. Preserve one strict explanation contract with feature-specific protected constants.
4. Build one shared private-beta explanation component that renders a validated generic envelope.
5. Keep stable report, PDF, email, evidence, and assessment storage unchanged.

### Phase 1 — complete the POSH feature family

Use the already working POSH source pack and architecture as the first controlled extension. Evaluate each remaining POSH obligation separately rather than treating “POSH compliance” as one Boolean result.

Candidate subfeatures:

- policy review;
- awareness/training review;
- notice/display review;
- complaint-mechanism and record review;
- Internal Committee composition and per-unit facts;
- annual reporting review.

Most of these require new assessment/evidence facts before a deterministic result can be produced.

### Phase 2 — active standalone central laws

Prioritize active records that are outside the four-Code consolidation, but only after their required facts and source packs are defined:

- Child and Adolescent Labour;
- Apprentices;
- bonded-labour/forced-labour prevention, after adding a dedicated governed record or an approved mapping.

### Phase 3 — current Labour Code feature families

Implement current-period features against the repository-recorded active Code records, not legacy Act thresholds:

- Code on Wages;
- Social Security Code;
- OSHWC Code;
- Industrial Relations Code.

These are broad frameworks and must be decomposed into smaller deterministic feature decisions. They require substantial assessment-fact expansion and appropriate-government logic.

### Phase 4 — State and Union Territory coverage

Add per-location jurisdiction facts, canonical state source governance, and state-specific source packs before producing state applicability results. Start with the states represented most often in private-beta assessments rather than exposing all 36 records at once.

### Phase 5 — operational HR advisory migration

Migrate useful hiring, policy, talent, rewards, learning, culture, workforce-planning, People-ownership, and distributed-work features into a governed operational recommendation contract.

Operational explanations must use labels such as:

```text
recommendationAuthority: deterministic-operational
providerRole: explanation-only
legalAdvice: false
```

They must not reuse legal applicability labels merely to share a UI.

## 13. Definition of done for every legal feature

A legal feature is not complete until all of the following are present and tested:

1. **Feature classification** — legal assurance, not a general operational recommendation.
2. **Deterministic rule** — stable rule ID/version, required facts, operators, reason codes, permitted statuses, and no retrieval/LLM authority.
3. **Missing-information path** — explicit `more-information-needed`; no guessing.
4. **Temporal and jurisdiction model** — effective period and appropriate-government limitations.
5. **Assessment fact coverage** — every required fact is collected or the feature remains blocked.
6. **Legal-review status** — `needs-legal-review` until separately approved.
7. **Canonical sources** — approved official documents in one source registry.
8. **Section mapping** — exact provisions/rules/notifications linked to the deterministic decision.
9. **Governed source chunks** — pages, hashes, clean official URLs, and allowlisted decision mappings.
10. **Retrieval tests** — only approved chunks; retrieval cannot alter the decision.
11. **Protected explanation request** — no raw answer object, personal data, or unapproved facts sent to the provider.
12. **Strict provider validation** — status, reason code, fingerprints, citations, limitations, and authority flags cannot be changed.
13. **Server endpoint** — minimized feature-specific input validated server-side and deterministic decision recomputed server-side.
14. **Capacity controls** — free-only provider boundary, cache, in-flight sharing, concurrency, queue, and failure backoff.
15. **Private-beta UI** — manual call only, missing/error/loading/completed states, sources and limitations visible.
16. **No stable delivery mutation** — stable assessment, report, PDF, email, and evidence contracts remain unchanged unless separately approved.
17. **Boundary and browser tests** — below/at/above threshold where relevant, missing facts, invalid input, source rejection, provider override rejection, no storage writes, and cache behavior.
18. **Live controlled test** — one approved test case and cache confirmation after deployment.

## 14. Definition of done for every operational HR feature

An operational feature requires a lighter but still governed path:

1. deterministic fact inputs;
2. stable recommendation ID/version;
3. clear outcome meaning (`recommended`, `not-triggered`, or `more-information-needed` rather than legal `applicable`);
4. reason code and triggering facts;
5. provenance for factual claims or guidance;
6. no legal-status implication;
7. explanation-only provider boundary where an LLM is used;
8. tests for missing facts and recommendation consistency;
9. no personal data in provider requests;
10. no mutation of stable delivery contracts without separate approval.

## 15. Prioritized readiness matrix

| Priority | Feature group | Why | Main blockers |
|---:|---|---|---|
| 1 | Generic feature registry and resolver | Prevents copying POSH-specific code for every feature | Contract design and approval |
| 2 | Remaining POSH duties | Existing record, source family, endpoint pattern, and UI pattern already exist | New facts, obligation-specific rule/source mapping, legal review |
| 3 | Apprentices operational/legal review | Apprentice count already exists and record is active | Applicability details, official source pack, contract/training evidence |
| 4 | State Shops and Establishments triage | Primary state and location count exist; high product relevance | Per-location state/establishment facts and state source governance |
| 5 | Contract workforce/OSHWC triage | Contract-worker count and industry exist | Site, establishment, contractor, appropriate-government, safety facts |
| 6 | Code on Wages feature family | Broad relevance | Wage, worker, notification, payroll, bonus and jurisdiction facts |
| 7 | Social Security feature family | Broad relevance and existing current record | Scheme-specific headcount, wage, coverage and contribution facts |
| 8 | Industrial Relations feature family | Existing current record | Worker definitions, establishment type, union/standing-order/change facts |
| 9 | Child/adolescent labour | Active standalone record | Age and hazardous-occupation facts are not captured |
| 10 | Operational hiring/policy/talent/rewards/learning/culture | 42 existing readiness checks provide topic inventory | Migration to M2 facts and operational contracts; deduplication |

This ordering reflects repository readiness, not legal importance.

## 16. Proposed next structured artifact — not created in this inventory

A future phase should create a canonical coverage registry only after its location and schema are separately approved.

**Proposed location:**

```text
data/assessment/feature-coverage-registry.v1.json
```

**Proposed top-level schema:**

```json
{
  "schemaVersion": 1,
  "registryVersion": "1.0.0",
  "legalReviewStatus": "needs-legal-review",
  "features": [
    {
      "id": "feature.example",
      "title": "Example feature",
      "classification": "legal-assurance",
      "domain": "legal",
      "currentRuleRefs": [],
      "assessmentFacts": {
        "available": [],
        "missing": []
      },
      "knowledgeBaseRecords": [],
      "sourcePack": {
        "status": "not-started",
        "registrySourceIds": [],
        "chunkCatalog": null
      },
      "explanation": {
        "status": "not-started",
        "route": null,
        "uiSurface": null
      },
      "delivery": {
        "stableReportMutation": false,
        "stablePdfMutation": false,
        "stableEmailMutation": false
      },
      "legalReviewStatus": "needs-legal-review",
      "readiness": "blocked",
      "blockers": [],
      "nextAction": ""
    }
  ]
}
```

This proposed registry would describe coverage and readiness. It must not itself evaluate applicability. Deterministic rules would remain in separately governed rule catalogues.

## 17. Immediate next implementation decision

The next development phase should be **generic multi-feature architecture design**, beginning with approval of the proposed feature coverage registry contract and a server-side feature resolver design.

No additional law should be exposed through Cloudflare or the V3 legal panel until it has:

- a deterministic rule;
- sufficient assessment facts;
- an approved source pack;
- governed chunks and retrieval tests;
- a strict feature-specific explanation boundary;
- `needs-legal-review` status;
- a controlled live test.
