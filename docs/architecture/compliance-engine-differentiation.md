# GrowWithHR compliance engine and differentiation

**Release:** v0.20.2  
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

The model is a replaceable presentation component. It has no authority to infer a fact, decide applicability, select a reason code, expand source scope or certify compliance.

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

The runtime includes 57 active private-beta feature profiles. POSH Internal Committee threshold has the substantive statutory path. The remaining profiles are executable but conservative; they retrieve governance-readiness context and escalate rather than inventing thresholds, exemptions, dates or jurisdiction-specific conclusions.

The defensible claim is not that GrowWithHR already has deeper statutory coverage than every incumbent. The differentiator is that every substantive conclusion is intended to be traceable to explicit facts, a versioned deterministic rule and controlled source material.
