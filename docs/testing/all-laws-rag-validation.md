# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the deterministic decision.

## Acceptance commands

```bash
npm install
npm run verify:all-laws-rag
node tests/epf-wave3a-private-beta-checks.mjs
node tests/epf-wave3b-private-beta-checks.mjs
node tests/epf-wave3c-private-beta-checks.mjs
node tests/esi-wave4a-private-beta-checks.mjs
node tests/esi-wave4b-private-beta-checks.mjs
node tests/esi-wave4c-private-beta-checks.mjs
node tests/esi-wave4d-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C and Wave 4A–4D overlay commands validate the complete stacked 57-profile registry.

## Required Wave 4D pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 44,
  "substantiveEsiWave4dProfiles": 2,
  "wave4dScenarios": 6,
  "governanceFallbackProfiles": 13,
  "activeCatalogs": 10,
  "esiWave4dSources": 8,
  "esiWave4dChunks": 10
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance enum or fingerprint is unsupported, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special leave, nursing breaks, crèche controls, notice/payment/records, employment protection, and Maternity Benefit/ESI overlap.

## EPF Waves 3A–3C checks

The maintained overlay tests evaluate the EPF, EPS and EDLI operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries.

## ESI Waves 4A–4C checks

The maintained ESI overlays evaluate establishment, employee-insurance, contractor, payment, accident, coverage-routing, wage-ceiling, rate-source, special-route, benefit-process and medical-administration controls while preserving applicability, calculation, claim, medical and individual-entitlement boundaries.

## ESI Wave 4D checks

The Wave 4D overlay evaluates complete, reported-gap and missing-information scenarios for:

- exemption-governance and source controls;
- enforcement-authority source routing.

For every Wave 4D scenario the suite proves that:

- only declared organisation-level notification, source, version, exclusion, authority and escalation controls plus evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because exemption validity, authority, service, limitation, jurisdiction, legal effect and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule grants or validates an exemption, authenticates a notice, order, signature or officer, decides liability or recovery, calculates an amount, determines penalty or prosecution, or resolves jurisdiction.

The Wave 4D browser payload check proves that names, contact details, Aadhaar, insurance numbers, wages, payroll and contribution records, exemption notifications, benefit-comparison bodies, officer names, notices, orders, signatures, inspection findings, recovery amounts, dispute narratives and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies two selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Source-governance checks

The Wave 4D catalogue uses the Code, Social Security (Central) Rules, commencement notification and corrigendum as controlled central sources. S.O. 2350(E), S.O. 2353(E), S.O. 2354(E) and S.O. 2356(E) are registered only as controlled authority-source records.

Those authority notifications do not prove customer-specific delegation, service, limitation, jurisdiction, document authenticity, liability or legal effect. Establishment-specific exemption notifications, benefit-comparison evidence, compliance history, customer notices and orders, signatures, findings and recovery records remain explicit specialist-review dependencies.

## Runtime status check

After starting the Wave 4D server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 44`;
- `governanceFallbackProfileCount: 13`;
- nine substantive catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C and 4A–4D have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, approve exemptions, authenticate documents or officers, decide liability, recovery, penalty, prosecution or jurisdiction, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
