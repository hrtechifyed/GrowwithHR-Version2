# About GrowWithHR

**Document status:** Research-grade prototype product and architecture explanation  
**Updated:** 11 August 2026  
**Application baseline:** v0.20.3-prototype.1 Governed Compliance & Legal RAG Prototype  
**Legal-review status:** `needs-legal-review` for every active legal catalogue

## What GrowWithHR is

GrowWithHR is a deterministic, traceable HR compliance advisory prototype. It combines a structured organisation assessment, versioned deterministic rules, governed legal-research retrieval and an explanation-only AI layer.

The core design principle is simple:

> **The model does not decide the legal result.** The deterministic rule decides the product status and source scope first. RAG retrieves only from that permitted source scope. AI may explain the fixed result, but it cannot change it.

GrowWithHR is designed to help founders and HR/compliance teams understand what needs attention, what information is missing, which governed research sources support the explanation, what controlled next action to take, and which compliance areas may become relevant as the organisation grows.

This release is a **research prototype**. It does not provide legal certification and does not replace qualified legal, tax, payroll, immigration, privacy, security or safeguarding review.

## Prototype research standard

The prototype uses structured legal research with controlled provenance. For this release:

- structured secondary research is an accepted source basis;
- exact official-file verification is supplementary assurance rather than a release prerequisite;
- secondary-research provenance is never represented as official or counsel-approved provenance;
- draft, guidance, portal and research material retains its classification;
- active catalogues remain `needs-legal-review`;
- prototype results must not be represented as legal opinions or proof of compliance.

The canonical Source Register also contains supplementary exact-file reconciliation evidence for 31 acquired files. That evidence improves auditability but is not the legal-authority basis for this prototype and is not required to migrate into runtime metadata before the prototype can be released.

## How the tool works

```text
Organisation assessment
        ↓
Privacy-safe fact mapping
        ↓
Versioned deterministic rule
        ↓
Fixed decision + reason code + missing facts + allowed source IDs
        ↓
Governed RAG retrieval from only those source IDs
        ↓
Retrieval fingerprint + source/chunk citations
        ↓
Explanation-only provider request
        ↓
Strict response validation
        ↓
User-facing explanation + limitations + next action
```

### 1. The user supplies organisation-level facts

The assessment collects controlled facts needed by the relevant feature. Examples can include employee-count bands, State, number of establishments or declared source-control status.

Each feature has its own assessment-fact contract. The browser/client must submit only fields allowed by that contract. Person-level identities, payroll bodies, medical/case narratives, complaint evidence, notices/orders and other prohibited material are excluded from the provider path unless a separately approved feature explicitly allows them.

### 2. The application maps facts before retrieval

Input is normalised into the deterministic fact model. Missing required facts remain missing; the system is not allowed to infer or reconstruct them from retrieved text or a language model.

### 3. A deterministic rule creates the product decision

The rule engine selects the status, reason code, missing-information state and permitted Source Register IDs.

Typical legal-RAG outcomes are deliberately bounded:

- `specialist-review` — the controlled facts are sufficient to describe a bounded prototype review state, but the result is not legal certification;
- `more-information-needed` — required facts are missing and the tool must not guess;
- a narrowly permitted non-applicability/readiness outcome only where the specific deterministic catalogue allows it.

The deterministic decision exists **before RAG runs**.

### 4. RAG retrieves only the sources allowed by the decision

The retrieval layer receives the fixed decision and searches only governed chunks belonging to the decision's permitted Source Register IDs. Retrieval has:

```text
usedForDecision: false
applicabilityAuthority: none
```

It cannot expand the jurisdiction, swap one law family for another, fill missing facts or change the decision.

### 5. The provider explains the fixed decision

The provider receives a protected request containing the fixed decision, retrieval fingerprint, governed chunks/citation identifiers and mandatory limitations. The provider is not given authority to decide applicability.

The final response is accepted only if it preserves the decision status, reason code and fingerprint, uses only permitted citations, includes required limitations, and makes no prohibited certification or legal-advice claim.

If the provider changes the result, invents a citation or returns malformed content, the request fails closed.

### 6. The user sees a traceable result

The prototype UI can show:

- the deterministic status and reason;
- information still required;
- research-grounded explanation;
- governed citations/source metadata;
- limitations and specialist-review boundary;
- a controlled recommended next action.

Stable report, PDF and email contracts are not changed by the legal-review panels unless separately approved.

## Founder use case: what applies now and what comes next

The product direction is to help a founder understand two related views:

1. **Current compliance view** — which governed compliance families need attention based on the facts supplied now.
2. **Scaling forecast view** — which additional compliance families or review triggers may become relevant when workforce size, locations, worker categories or operating model changes.

The current runtime already provides the family-specific deterministic/RAG building blocks. A broader consolidated founder-facing scale-forecast experience remains product work beyond this prototype release and must continue to preserve law-family boundaries rather than inventing one blended legal score.

## Hypothetical example

Assume a fictional company called **Riverstone Services Pvt Ltd** uses the prototype assessment.

The organisation reports:

- primary State: Maharashtra;
- 42 employees;
- 2 permanent locations;
- 8 contract workers;
- no international/multi-country employment in the current scope.

This example is illustrative only; it is not a legal conclusion about a real company.

### Step A — assessment and fact mapping

For a POSH Internal Committee threshold review, the client sends only the fields allowed for that feature, such as the relevant workforce count, State and location count. The legal explanation provider does **not** need the fictional company name, employee names, complaint narratives or evidence bodies.

### Step B — deterministic decision

The configured POSH deterministic rule evaluates the mapped facts. In the repository's governed test scenarios, a threshold-triggered review produces the fixed reason code:

```text
POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED
```

The result remains a review-oriented prototype output rather than a product certification. The decision also contains the Source Register IDs that the retrieval step may use.

### Step C — governed retrieval

RAG retrieves only the governed POSH chunks that belong to those source IDs. It cannot decide that a different State law applies, add an unregistered blog, infer a complaint history or change the threshold result.

### Step D — explanation

The provider receives the fixed decision and retrieved governed chunks. A valid response may explain why the rule produced a review-required result and cite the governed research material.

A response is rejected if it tries to say that Riverstone is "fully compliant", changes the deterministic status, cites a source outside the retrieval trace, or invents facts that were never submitted.

### Step E — cross-family separation

Because Riverstone also reports contract workers, the Contract Workforce feature can run its own bounded readiness logic. EPF and ESI contractor dependencies remain separate. An OSHWC/contract-workforce result cannot substitute for an EPF or ESI result, and an EPF/ESI result cannot decide OSHWC applicability.

### Step F — scaling and future triggers

If Riverstone later grows, opens another establishment or changes worker categories, the product can reassess the relevant governed families using the newly supplied facts. The future founder experience should present those changes as **reassessment triggers and compliance areas to review**, not as a model-generated promise that a particular law has become conclusively applicable.

### Step G — explicit out-of-scope and safeguarding boundaries

If Riverstone later asks the current release to assess a worker employed across two countries, Wave 5M does not attempt an international employment-law answer. Multi-country Employment is explicitly outside the current release scope and has no runtime catalogue or product surface.

If a user reports live coercion, confinement, trafficking, violence, retaliation or another urgent bonded/forced-labour concern, Wave 5J is not allowed to process that case through normal AI/RAG assessment. Live safeguarding concerns require a human route.

## Current runtime scope

The effective main-integrated prototype runtime contains:

| Control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Wave 5J | Governance/research only; no assessment/runtime activation |
| Wave 5M | Out of current release scope; no assessment/runtime activation |

The two governance fallbacks are Bonded and Forced Labour (Wave 5J) and Multi-country Employment (Wave 5M).

## Source governance

GrowWithHR distinguishes:

1. a **runtime source identity** used by the validated catalogue contracts;
2. **secondary-research provenance** used as the accepted prototype research basis;
3. supplementary **exact-file evidence** where available;
4. portal/register identities that may not have one stable PDF;
5. draft instruments that remain explicitly draft/non-operative;
6. research-only material that is not published into runtime RAG.

As of 11 August 2026, the canonical Drive Source Register contains an Exact File Reconciliation sheet mapping 31 acquired files to existing Source IDs, with SHA-256, byte length and physical page count from the stored bytes. This evidence does not silently replace the existing runtime source-identity fingerprints and does not grant legal approval.

For this research prototype, the release does not require a runtime migration to those exact-file fingerprints. Future production hardening remains tracked under #143.

## Current release boundary

The prototype may be released when the engineering regression is green on the exact release SHA and the release notes truthfully preserve the prototype limitations above.

GitHub #142 is now the **future production-grade certification/hardening gate**, not a blocker for a clearly labelled prototype/prerelease. #143 is also a future production-hardening backlog rather than a prototype release blocker.

Wave 5J remains non-runtime. Wave 5M remains excluded from the current release.

## Key documents

- `README.md` — repository/prototype release overview;
- `growwithhr-rag/README.md` — governed RAG runtime and operational details;
- `docs/architecture/legal-rag-platform-architecture.md` — architecture and authority boundaries;
- `docs/architecture/legal-rag-source-pack-build-pipeline.md` — source identity, research provenance, exact-file and publication pipeline;
- `docs/architecture/complete-feature-coverage-inventory.md` — current feature/runtime inventory;
- `docs/testing/all-laws-rag-validation.md` — validation and regression procedure;
- `docs/releases/legal-rag-release-readiness-2026-08-11.md` — prototype release checklist and future production boundary.

## What the tool is not

GrowWithHR is not a substitute for professional advice and must not be represented as:

- a legal opinion or legal certification service;
- an automatically counsel-approved applicable-law selector;
- a payroll, tax-residency, immigration or permanent-establishment decision engine;
- an automated investigator, safeguarding case-handler or criminal-liability classifier;
- a system that treats research provenance, green CI, a source upload or an AI response as human legal approval.

Its design goal is controlled, traceable prototype decision support with explicit boundaries and auditable research provenance.