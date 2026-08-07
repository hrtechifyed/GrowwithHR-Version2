# Bonded and Forced Labour Wave 5J — specialist research packet

**Status:** research-only / runtime blocked  
**Date:** 7 August 2026  
**Feature:** `feature.legal.bonded-forced-labour`

## Decision

Do **not** promote this feature from governance fallback and do **not** introduce assessment capture, case intake, a browser panel, a statutory retrieval catalogue or provider analysis in Wave 5J.

The source review shows overlapping constitutional, bonded-labour, criminal, rescue/prosecution and rehabilitation frameworks. Those frameworks require qualified legal mapping and a human safeguarding design before any product-facing fact model is safe.

## Official source inventory

1. **Constitution of India 2026 — Article 23** — Legislative Department source page: `https://www.legislative.gov.in/documents/constitution-of-india/constitution-of-india-AjN2EjMtQWa?pageTitle=Constitution-of-India`. Article 23 is the constitutional forced-labour/trafficking boundary. It is not a customer classifier.
2. **Bonded Labour System (Abolition) Act, 1976** — India Code: `https://www.indiacode.nic.in/handle/123456789/1491`. The Act separately covers the bonded labour system, bonded debt, implementing authorities, Vigilance Committees and offences.
3. **Bonded Labour System (Abolition) Rules, 1976** — recorded under the India Code Act page. Exact controlled file acquisition is still required.
4. **Bharatiya Nyaya Sanhita, 2023, sections 143–146** — India Code: `https://www.indiacode.nic.in/handle/123456789/20062?col=123456789%2F1362`. Current criminal law separately covers trafficking, exploitation of trafficked persons, slavery and unlawful compulsory labour.
5. **Central Sector Scheme for Rehabilitation of Bonded Labourer-2021** — Ministry source: `https://labour.gov.in/sites/default/files/20220208154105_compressed.pdf`. The document states the revamped scheme covered FY 2021-22 to 2025-26. Its forms include highly sensitive person, family, identity, financial and case data and must not become product/provider inputs.
6. **Standing Committee on Labour, Textiles and Skill Development — Fifteenth Report, 2026** — Parliament source: `https://sansad.in/getFile/app/lsscommittee/Labour%2C%20Textiles%20and%20Skill%20Development/18_Labour_Textiles_and_Skill_Development_15.pdf?source=app`. The Committee records that the 2021 rehabilitation scheme is being merged with the Labour Welfare Scheme for 2026-27 to 2030-31 and recommends a detailed operational plan after merger. That operational plan must be obtained rather than inferred.
7. **NHRC Advisory 2.0 to Identify, Release and Rehabilitate Bonded Labourers**, 8 December 2021 — current NHRC listing: `https://www.nhrc.nic.in/activities/other_advisories`. Treat as human-rights/safeguarding guidance, not classification authority.
8. **Ministry SOP for Identification and Rescue of Bonded Labourers and Prosecution of Offenders**, referenced as issued by Ministry letter dated 14 May 2026. NHRC July 2026 material directs authorities to follow it. The exact Ministry-hosted file has not yet been acquired, so it is a hard source-file blocker.
9. **Prajwala v. Union of India & Ors., 2026 INSC 609** — Supreme Court source: `https://api.sci.gov.in/supremecourt/2022/7980/7980_2022_6_1502_71676_Judgement_29-May-2026.pdf`. Use for qualified constitutional/jurisprudential mapping only; do not convert it into a bonded-labour, forced-labour or trafficking classifier.

## Why capture remains blocked

Article 23 is broader than a simple debt or physical-force test. The 1976 Act contains its own statutory definitions and bonded-debt framework. BNS contains separate criminal offences. Current rescue/prosecution practice references a May 2026 SOP that is not yet in the controlled source set, while the prior rehabilitation scheme has entered a 2026–31 merger/transition period.

A checklist of “coercion”, “debt”, “recruitment”, “movement” or “retaliation” indicators could therefore create unsafe pseudo-adjudication, invite allegation intake and expose vulnerable people. Wave 5J records those concepts only as future specialist-research topics; they are **not assessment fields**.

## Data that must not enter the current product/provider route

No person identity, contact/address or precise location; Aadhaar/ID; family identity; caste/community, sex/gender or disability/medical information; images/audio/video; recruiter/creditor/alleged captor or accused identity; debt amount or narrative; wage/payroll/attendance/bank/DBT data; movement restriction, document retention or confinement narrative; violence/threat/retaliation/coercion/abuse narrative; trafficking or sexual-exploitation narrative; complaint/rescue/FIR/case/prosecution material; victim/witness identity or statements; release certificates; rehabilitation applications; or evidence bodies/attachments.

## Human safeguarding boundary

Any live allegation or concern involving coercion, confinement, violence, threat, retaliation, trafficking, exploitation, rescue or immediate safety must leave the legal-RAG route and follow an approved human safeguarding/legal process. The explanation provider is not an emergency, case-management or evidentiary system.

## Hard blockers before any later capture proposal

- Acquire and fingerprint the exact Ministry SOP referenced as issued on 14 May 2026.
- Acquire the approved/notified 2026-27 to 2030-31 Labour Welfare Scheme and the detailed post-merger bonded-labour rehabilitation operational plan.
- Complete qualified legal mapping across Article 23, the 1976 Act/Rules, BNS sections 143–146 and current Supreme Court jurisprudence.
- Approve human safeguarding/escalation procedures outside RAG.
- Approve privacy, access, retention, deletion and security controls for any future case-adjacent workflow.
- Review State/UT operational variations, District Magistrate/Vigilance Committee processes and rehabilitation-fund arrangements.

## Runtime invariant

Wave 5J must preserve the Wave 5I runtime: **57 callable / 53 substantive / 4 governance fallback / 19 catalogues**. `feature.legal.bonded-forced-labour` remains on the conservative governance fallback.

Green software tests for this packet mean only that the *block* is enforced. They do not constitute legal, safeguarding, privacy, source-file, RAG, security or release approval.
