# GrowWithHR application review — 15 September 2026

Scope: integrate the pending public-template/contact work in PR #196 and contextual assessment guidance in PR #194, fix reproducible application defects, and choose the next roadmap investment. The product remains `v0.20.4-prototype.1`, a research-grade prototype.

## Fixes in this review

| Area | Finding and correction |
| --- | --- |
| Assessment choices | The interaction stylesheet was absent from the assessment entry pages. Full-width compact-story input styling also stretched radio controls over their answer text. Load the stylesheet, reserve space for visible native controls, and restrict full-width styling to text/select inputs. |
| Contextual help | Answer buttons raced dialog creation; framework help could become a separate grid item; the overview retained questions from previous screens. Build answer actions after the dialog opens, keep triggers within their labels, and refresh guidance when controls change. |
| Report generation | A report could start before the final PDF installer completed. Await its readiness and retain the existing Report ID, previous Report ID and changed facts when replacing a stale document. |
| Report content | Unknown worker/contractor counts were rendered as zero. Preserve unknown values, retain genuine zeroes, include organization scenario assumptions and rule basis, and restore the closing report section. |
| Reassessment | A prior compliance-only workspace could be interpreted as an organization assessment baseline. Compare organization findings only against confirmed organization data, while permitting shared-fact comparisons. Preserve changes to zero and retain change summaries for the PDF and result glimpse. |
| Account/report access | Sign-up confirmation instructions were immediately cleared by a mode switch. Preserve them. Install the report delivery boundary without waiting for the remote authentication library; actual delivery still requires authentication and the existing server checks. |
| Public navigation | Directory-style home URLs did not identify Home as active. Recognize both the root and deployed project directory. Surface all three already-available engines, including Workforce & Capability Planning. |
| Release tests | Update journey assertions to the current hub and authenticated-delivery flow, retain real click/check interactions, and add regressions for report readiness, lineage, baseline isolation and missing/zero values. AJV continues strict schema validation while allowing a conditional `required` property to be declared in its parent; the frozen evidence schema is unchanged. |

The approved HRTechify template, exact logo, corrected contact details and canonical footer remain part of PR #196. This review does not change legal applicability rules or approve sources.

## Verification

- `npm run test:release` passed during the review, including maintained release contracts and scenario checks.
- Organization Structure, Workforce & Capability Planning, site-shell, shared-navigation, buyer-trust, dedicated-entry and UI-polish checks passed.
- The added application audit regressions passed.
- All six focused browser checks passed: complete assessment/PDF/authenticated-delivery flow and five contextual-help checks.
- The delivery browser test intercepts authentication and email endpoints. It proves the application interaction and payload boundary; it does not claim a real mailbox received an email.
- The final pull-request workflows and post-merge deployment/live-smoke runs are the release evidence. Local test dependencies and browser overrides are excluded from the repository.

## Items that remain open

| Issue | Required evidence or decision |
| --- | --- |
| #139 | Exact official Wave 5J source files, controlled acquisition records, hashes and page/source mapping. Finding an index or similarly titled PDF does not satisfy this requirement. |
| #140 | Qualified legal, safeguarding and privacy review for Wave 5J. It remains outside substantive runtime. |
| #142 | Production Legal/Privacy/RAG/Source/Security/Release approvals. Prototype engineering checks do not grant these approvals. |
| #143 | Exact official-source assurance, including substantive temporal review. Do not change review dates or source classifications merely to make checks appear green. |

The roadmap's overdue legal/source review work still requires substantive review. It cannot be completed by marking records approved in code.

## Recommended next feature: P2 Change Intelligence maturity

Build the next iteration around **“What changed since my last assessment?”** within the existing engines. Show the prior and current confirmed facts, explain which findings changed and why, distinguish company changes from rule/source-version changes, and include the top next actions in the emailed report. Complete baseline provenance and Report ID lineage first.

For audience acquisition, pair it with a short public, fictional growth scenario: for example, “What changes when a 25-person company grows to 50?” Let visitors explore the result before starting their assessment. Offer an explicit follow link alongside useful examples; keep private company reports behind their existing access boundary. Sharing real company details must be a deliberate user choice.

This is the strongest next hypothesis because it uses the existing engines, gives returning users a concrete reason to reassess, and creates repeatable educational examples. It is a recommendation, not a guarantee of follower growth. LinkedIn's [Page best practices](https://business.linkedin.com/advertise/linkedin-pages/best-practices) support regular useful posts, visual/document formats, a website follow button, and analytics; these support the distribution approach rather than proving demand for this feature.

Evaluate it with assessment completion, return/reassessment rate, scenario-to-assessment conversion, qualified report requests and follow-link clicks. Use a measured launch experiment before investing in another standalone HR module.
