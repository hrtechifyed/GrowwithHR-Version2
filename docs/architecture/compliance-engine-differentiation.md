# GrowWithHR compliance engine and differentiation

**Release line:** v0.20.2 private beta  
**Date:** 2026-08-06  
**Authority boundary:** Deterministic rules decide. RAG retrieves governed sources. The model explains only.

## Architecture

```text
Assessment answers
→ confirmed, derived and missing facts
→ versioned deterministic rule
→ immutable status, reason code and decision fingerprint
→ feature-profile resolution
→ governed lexical or hybrid retrieval
→ provider-neutral explanation request
→ strict explanation validation
→ Compliance Story, priorities and workspace actions
```

The model is a replaceable presentation component. It has no authority to infer a fact, decide applicability or control status, select a reason code, expand source scope or certify compliance.

## Differentiation

GrowWithHR is positioned as a compliance assurance and decision-provenance engine rather than a generic legal chatbot or a payroll-led compliance-alert product.

| Common platform pattern | GrowWithHR design |
|---|---|
| Alert or generated answer | Reproducible decision with rule version and reason code |
| AI interprets the user's situation | Deterministic rules decide before AI is called |
| Knowledge-base links | Controlled files, source IDs, sections, dates and fingerprints |
| Binary compliant/non-compliant display | Explicit missing-information, uncertainty and specialist-review states |
| AI or retrieval outage blocks the feature | Deterministic result remains available without RAG or provider execution |
| Compliance insight ends at an alert | Decision flows into priorities, obligations, tasks, owners and evidence placeholders |

## Current coverage boundary

The runtime includes 57 active private-beta feature profiles:

- seven POSH profiles have feature-specific deterministic rules and a governed statutory retrieval path;
- 50 profiles remain conservative governance-fallback routes.

The seven POSH profiles cover:

- Internal Committee threshold;
- policy and dissemination;
- employee awareness, committee orientation and capacity building;
- notice and display controls by location;
- complaint-mechanism, confidentiality, timeline and records controls;
- Internal Committee composition and office or administrative-unit coverage;
- annual reporting.

The six Wave 1 control profiles are substantive but not legally approved. They distinguish complete reported controls, reported gaps and missing facts; preserve the exact fact and reason-code trace; retrieve only permitted POSH statutory sections; and return `specialist-review` or `more-information-needed`. They do not certify content quality, evidence, implementation effectiveness or legal sufficiency.

## Product-facing private beta

The v3 page contains an in-memory form for each Wave 1 profile. Requests occur only after explicit user action. Strict adapters allow-list the feature facts and exclude personal or case-level complaint information. The response displays the protected deterministic status, reason code, explanation and governed citations without writing to browser storage or mutating the stable report.

## Defensible claim

GrowWithHR can defensibly claim that seven POSH private-beta features now have meaningful, source-grounded deterministic content. It cannot claim qualified legal approval, verified compliance or complete statutory coverage across all 57 profiles.

The expansion advantage is architectural: each future feature can replace the fallback without changing the authority boundary, shared endpoint, retrieval integrity model or explanation contract.
