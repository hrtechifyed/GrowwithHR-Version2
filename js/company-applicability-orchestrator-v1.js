/* GrowWithHR company-wide deterministic applicability orchestrator */
(() => {
    "use strict";

    const VERSION = "1.1.0-founder-intelligence";
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const unique = (values = []) => [...new Set(values.map((value) => clean(value)).filter(Boolean))];
    const values = (value) => Array.isArray(value) ? value : [];

    const FOUNDER_STATES = Object.freeze({
        "Applicable": Object.freeze({ key: "relevant-now", label: "Relevant now" }),
        "Review required": Object.freeze({ key: "review-needed", label: "Review needed" }),
        "Needs information": Object.freeze({ key: "more-information-required", label: "More information required" }),
        "Not currently triggered": Object.freeze({ key: "watch-as-you-grow", label: "Watch as you grow" })
    });

    const SUPPORTED_SCENARIO_FIELDS = Object.freeze([
        "employees",
        "workers",
        "contractors",
        "indiaOperations",
        "establishmentType",
        "primaryState",
        "womenEmployees",
        "esiWageEligibility",
        "bonusWageEligibility",
        "industry",
        "workerCategories",
        "usesPower",
        "manufacturingOperations"
    ]);

    const RAG_SCOPE_BY_LAW_ID = Object.freeze({
        posh: Object.freeze({ lawFamilyId: "posh", featureId: "feature.legal.posh.internal-committee-threshold" }),
        maternity: Object.freeze({ lawFamilyId: "maternity", featureId: "feature.legal.maternity.establishment-coverage" }),
        epf: Object.freeze({ lawFamilyId: "epf-eps-edli", featureId: "feature.legal.epf.establishment-coverage" }),
        esi: Object.freeze({ lawFamilyId: "esi", featureId: "feature.legal.esi.establishment-coverage" }),
        gratuity: Object.freeze({ lawFamilyId: "gratuity", featureId: "feature.legal.social-security.gratuity" }),
        bonus: Object.freeze({ lawFamilyId: "code-on-wages", featureId: "feature.legal.code-on-wages" }),
        "minimum-wages": Object.freeze({ lawFamilyId: "code-on-wages", featureId: "feature.legal.code-on-wages" }),
        shops: Object.freeze({ lawFamilyId: "shops-establishments", featureId: "feature.legal.state.shops-establishments" }),
        factories: Object.freeze({ lawFamilyId: "oshwc", featureId: "feature.legal.oshwc" })
    });

    const OWNER_BY_LAW_ID = Object.freeze({
        posh: "Founder / HR",
        maternity: "HR / Payroll",
        epf: "Payroll / HR",
        esi: "Payroll / HR",
        gratuity: "HR / Payroll",
        bonus: "Payroll / HR",
        "minimum-wages": "Payroll / HR",
        shops: "Operations / HR",
        "contract-labour": "Operations / HR",
        "standing-orders": "HR / Specialist",
        factories: "Operations / Specialist"
    });

    function resolveBuilder() {
        const builder = window.GrowWithHRLawTransparency?.buildReportLawTransparency ||
            window.GrowWithHRPDF?.buildReportLawTransparency;
        if (typeof builder !== "function") {
            throw new Error("The deterministic law transparency engine is not ready.");
        }
        return builder;
    }

    function founderStateFor(status) {
        return FOUNDER_STATES[clean(status)] || Object.freeze({ key: "review-needed", label: "Review needed" });
    }

    function sourceUrl(row = {}) {
        return clean(row.url || row.officialUrl || row.sourceUrl || row.statePortalUrl || row.officialSourceUrl || row.legalSourceUrl);
    }

    function findingTitle(row = {}) {
        return clean(row.shortTitle || row.title, clean(row.id, "Compliance area"));
    }

    function normaliseFinding(row = {}) {
        const backendStatus = clean(row.status, "Needs information");
        const founderState = founderStateFor(backendStatus);
        const threshold = row.thresholdResult || {};
        const confirmedInputs = Array.isArray(row.confirmedInputs) ? [...row.confirmedInputs] : [];
        const missingInputs = Array.isArray(row.missingInputs) ? [...row.missingInputs] : [];
        const missingQuestions = Array.isArray(row.missingQuestions) ? [...row.missingQuestions] : [];
        const ragScope = RAG_SCOPE_BY_LAW_ID[clean(row.id)] || null;

        return Object.freeze({
            ...row,
            status: backendStatus,
            backendStatus,
            founderState: founderState.key,
            founderLabel: founderState.label,
            decision: Object.freeze({
                authority: "deterministic-engine",
                status: backendStatus,
                thresholdState: clean(threshold.state),
                thresholdLabel: clean(threshold.label)
            }),
            companyFactsUsed: Object.freeze(confirmedInputs),
            missingInputs: Object.freeze(missingInputs),
            missingQuestions: Object.freeze(missingQuestions),
            trigger: Object.freeze({
                state: clean(threshold.state),
                label: clean(threshold.label),
                currentPosition: clean(threshold.positionText),
                reassessmentPoint: clean(threshold.triggerText),
                explanation: clean(threshold.explanation),
                count: Number.isFinite(threshold.count) ? threshold.count : null,
                threshold: Number.isFinite(threshold.threshold) ? threshold.threshold : null,
                companyFact: clean(row.countField)
            }),
            sourceReference: sourceUrl(row),
            legalReviewStatus: "needs-legal-review",
            ragScope: ragScope ? Object.freeze({ ...ragScope }) : null,
            ragPolicy: Object.freeze({
                usedForDecision: false,
                applicabilityAuthority: "none"
            })
        });
    }

    function groupFindings(findings = []) {
        return Object.freeze({
            relevantNow: Object.freeze(findings.filter((item) => item.backendStatus === "Applicable")),
            reviewNeeded: Object.freeze(findings.filter((item) => item.backendStatus === "Review required")),
            moreInformationRequired: Object.freeze(findings.filter((item) => item.backendStatus === "Needs information")),
            watchAsYouGrow: Object.freeze(findings.filter((item) => item.backendStatus === "Not currently triggered"))
        });
    }

    function buildMissingFacts(findings = []) {
        const byField = new Map();
        findings
            .filter((item) => item.backendStatus === "Needs information")
            .forEach((item) => {
                item.missingInputs.forEach((field, index) => {
                    const key = clean(field);
                    if (!key) return;
                    const existing = byField.get(key) || {
                        field: key,
                        question: clean(item.missingQuestions[index], key),
                        affectedLawIds: [],
                        affectedAreas: []
                    };
                    existing.affectedLawIds.push(item.id);
                    existing.affectedAreas.push(findingTitle(item));
                    byField.set(key, existing);
                });
            });

        return Object.freeze([...byField.values()].map((item) => Object.freeze({
            field: item.field,
            question: item.question,
            affectedLawIds: Object.freeze(unique(item.affectedLawIds)),
            affectedAreas: Object.freeze(unique(item.affectedAreas))
        })));
    }

    function matrixSortKey(item = {}) {
        const stateRank = item.triggerState === "near" ? 0 : 1;
        const distance = Number.isFinite(item.threshold) && Number.isFinite(item.count)
            ? Math.max(0, item.threshold - item.count)
            : Number.MAX_SAFE_INTEGER;
        return [stateRank, distance, clean(item.title).toLowerCase()];
    }

    function compareMatrixRows(left, right) {
        const a = matrixSortKey(left);
        const b = matrixSortKey(right);
        if (a[0] !== b[0]) return a[0] - b[0];
        if (a[1] !== b[1]) return a[1] - b[1];
        return a[2].localeCompare(b[2]);
    }

    function buildScaleTriggerMatrix(findings = []) {
        const rows = findings
            .filter((item) => ["below", "near"].includes(clean(item.trigger?.state)))
            .map((item) => Object.freeze({
                lawId: item.id,
                title: findingTitle(item),
                currentState: item.founderState,
                currentLabel: item.founderLabel,
                triggerState: item.trigger.state,
                currentPosition: item.trigger.currentPosition,
                reassessmentPoint: item.trigger.reassessmentPoint,
                explanation: item.trigger.explanation,
                companyFact: item.trigger.companyFact,
                count: item.trigger.count,
                threshold: item.trigger.threshold,
                sourceUrl: item.sourceReference,
                decisionAuthority: "deterministic-engine"
            }));
        return Object.freeze(rows.sort(compareMatrixRows));
    }

    function obligationUnderstanding(finding = {}) {
        if (finding.backendStatus === "Applicable") {
            return clean(finding.trigger?.explanation || finding.whyIncluded, "The supplied company facts produced a relevant-now deterministic result.");
        }
        if (finding.backendStatus === "Needs information") {
            return `GrowWithHR needs ${finding.missingQuestions.length ? finding.missingQuestions.join("; ") : "additional company information"} before this result can be resolved more strongly.`;
        }
        if (finding.backendStatus === "Not currently triggered") {
            return clean(finding.trigger?.explanation, "The current company facts do not trigger this rule, but a supported company change may require reassessment.");
        }
        return clean(finding.trigger?.explanation || finding.whyIncluded, "The current result needs specialist or jurisdiction review before a stronger conclusion is appropriate.");
    }

    function obligationNextAction(finding = {}) {
        if (finding.backendStatus === "Applicable") {
            return clean(finding.action, `Review the organisational requirements associated with ${findingTitle(finding)}.`);
        }
        if (finding.backendStatus === "Needs information") {
            return finding.missingQuestions.length
                ? `Complete the missing company information: ${finding.missingQuestions.join("; ")}`
                : "Complete the missing company information and rerun the deterministic assessment.";
        }
        if (finding.backendStatus === "Not currently triggered") {
            return finding.trigger?.reassessmentPoint
                ? `Plan to reassess when the relevant company fact approaches: ${finding.trigger.reassessmentPoint}.`
                : "Reassess after a relevant workforce, location or operating change.";
        }
        return "Seek specialist review of this fixed finding before relying on it for an implementation decision.";
    }

    function buildObligationObjects(findings = []) {
        return Object.freeze(findings.map((finding) => Object.freeze({
            obligationId: `obligation:${clean(finding.id)}`,
            findingId: clean(finding.id),
            complianceFamily: clean(finding.id),
            title: findingTitle(finding),
            backendStatus: finding.backendStatus,
            founderState: finding.founderState,
            founderLabel: finding.founderLabel,
            whatToUnderstand: obligationUnderstanding(finding),
            ownerSuggestion: OWNER_BY_LAW_ID[clean(finding.id)] || "Founder / HR / Specialist",
            nextAction: obligationNextAction(finding),
            thingsToVerifyInternally: Object.freeze([
                "Relevant governance, policy or process material already maintained by the organisation",
                "Relevant records, notices, registrations or supporting material already maintained internally",
                "Whether specialist review is appropriate before implementation decisions"
            ]),
            companyFactsUsed: Object.freeze([...finding.companyFactsUsed]),
            missingFacts: Object.freeze([...finding.missingInputs]),
            reason: clean(finding.trigger?.explanation || finding.whyIncluded),
            trigger: finding.trigger,
            sourceReference: finding.sourceReference,
            legalReviewStatus: finding.legalReviewStatus,
            decisionAuthority: "deterministic-engine",
            ragScope: finding.ragScope,
            ragPolicy: finding.ragPolicy
        })));
    }

    function actionRecord(taxonomy, title, body, relatedObligationIds = [], relatedLawIds = [], ownerSuggestion = "Founder / HR") {
        return Object.freeze({
            actionId: `founder-action:${taxonomy}`,
            taxonomy,
            title,
            body,
            ownerSuggestion,
            relatedObligationIds: Object.freeze(unique(relatedObligationIds)),
            relatedLawIds: Object.freeze(unique(relatedLawIds)),
            decisionAuthority: "deterministic-engine",
            completionTracked: false
        });
    }

    function buildFounderActions(obligations = [], missingFacts = [], scaleTriggerMatrix = []) {
        const actions = [];
        const relevant = obligations.filter((item) => item.backendStatus === "Applicable");
        const review = obligations.filter((item) => item.backendStatus === "Review required");

        if (relevant.length) {
            actions.push(actionRecord(
                "review-now",
                "Review what is relevant now",
                `Review the fixed findings for: ${relevant.map((item) => item.title).join(", ")}. GrowWithHR has not determined whether these requirements are already completed or correctly implemented.`,
                relevant.map((item) => item.obligationId),
                relevant.map((item) => item.findingId),
                "Founder / HR"
            ));
        }
        if (missingFacts.length) {
            actions.push(actionRecord(
                "complete-company-information",
                "Complete company information",
                `Provide ${missingFacts.length} unresolved company fact${missingFacts.length === 1 ? "" : "s"} so the deterministic engine can rerun without guessing.`,
                obligations.filter((item) => item.backendStatus === "Needs information").map((item) => item.obligationId),
                unique(missingFacts.flatMap((item) => values(item.affectedLawIds))),
                "Founder / HR"
            ));
        }
        if (scaleTriggerMatrix.length) {
            actions.push(actionRecord(
                "plan-before-growth-trigger",
                "Plan before growth triggers",
                `Reassess before or when the supported company facts reach the ${scaleTriggerMatrix.length} engine-derived planning point${scaleTriggerMatrix.length === 1 ? "" : "s"} shown in the Scale Trigger Matrix.`,
                obligations.filter((item) => item.backendStatus === "Not currently triggered").map((item) => item.obligationId),
                scaleTriggerMatrix.map((item) => item.lawId),
                "Founder / HR / Operations"
            ));
        }
        if (review.length) {
            actions.push(actionRecord(
                "seek-specialist-review",
                "Seek specialist review where the finding requires it",
                `The deterministic result remains Review needed for: ${review.map((item) => item.title).join(", ")}. Preserve that uncertainty and obtain specialist or jurisdiction review before relying on a stronger conclusion.`,
                review.map((item) => item.obligationId),
                review.map((item) => item.findingId),
                "Founder / Specialist"
            ));
        }
        return Object.freeze(actions);
    }

    function assess(payload = {}, model = {}) {
        const rows = Array.from(resolveBuilder()(payload, model) || []);
        const findings = Object.freeze(rows.map(normaliseFinding));
        const groups = groupFindings(findings);
        const missingFacts = buildMissingFacts(findings);
        const scaleTriggerMatrix = buildScaleTriggerMatrix(findings);
        const obligationObjects = buildObligationObjects(findings);
        const founderActions = buildFounderActions(obligationObjects, missingFacts, scaleTriggerMatrix);

        return Object.freeze({
            version: VERSION,
            companyWide: true,
            decisionAuthority: "deterministic-engine",
            findings,
            groups,
            obligationObjects,
            founderActions,
            missingFacts,
            scaleTriggerMatrix,
            supportedScenarioFields: SUPPORTED_SCENARIO_FIELDS,
            ragPolicy: Object.freeze({
                usedForDecision: false,
                applicabilityAuthority: "none"
            })
        });
    }

    function scenarioPayload(payload = {}, overrides = {}) {
        const allowed = Object.fromEntries(Object.entries(overrides || {})
            .filter(([key]) => SUPPORTED_SCENARIO_FIELDS.includes(clean(key))));
        return {
            ...payload,
            answers: { ...(payload.answers || {}), ...allowed },
            report: { ...(payload.report || {}), ...allowed }
        };
    }

    function comparableFinding(item = {}) {
        return {
            backendStatus: item.backendStatus,
            founderState: item.founderState,
            triggerState: item.trigger?.state,
            currentPosition: item.trigger?.currentPosition,
            reassessmentPoint: item.trigger?.reassessmentPoint,
            missingInputs: values(item.missingInputs)
        };
    }

    function diffAssessments(beforeAssessment = {}, afterAssessment = {}, changedFacts = {}) {
        const beforeById = new Map(values(beforeAssessment.findings).map((item) => [item.id, item]));
        const afterById = new Map(values(afterAssessment.findings).map((item) => [item.id, item]));
        const lawIds = unique([...beforeById.keys(), ...afterById.keys()]);
        const changes = [];
        const unchangedLawIds = [];

        lawIds.forEach((lawId) => {
            const before = beforeById.get(lawId);
            const after = afterById.get(lawId);
            if (!before || !after) return;
            const left = comparableFinding(before);
            const right = comparableFinding(after);
            const changed = left.backendStatus !== right.backendStatus ||
                left.founderState !== right.founderState ||
                left.triggerState !== right.triggerState ||
                left.currentPosition !== right.currentPosition ||
                left.reassessmentPoint !== right.reassessmentPoint ||
                left.missingInputs.join("|") !== right.missingInputs.join("|");
            if (!changed) {
                unchangedLawIds.push(lawId);
                return;
            }
            changes.push(Object.freeze({
                lawId,
                title: findingTitle(after),
                before: Object.freeze(left),
                after: Object.freeze(right),
                changedFacts: Object.freeze({ ...changedFacts }),
                decisionAuthority: "deterministic-engine"
            }));
        });

        return Object.freeze({
            changes: Object.freeze(changes),
            changedLawIds: Object.freeze(changes.map((item) => item.lawId)),
            unchangedLawIds: Object.freeze(unchangedLawIds),
            changedFacts: Object.freeze({ ...changedFacts }),
            decisionAuthority: "deterministic-engine"
        });
    }

    function simulate(payload = {}, model = {}, overrides = {}) {
        const allowedOverrides = Object.fromEntries(Object.entries(overrides || {})
            .filter(([key]) => SUPPORTED_SCENARIO_FIELDS.includes(clean(key))));
        const baseline = assess(payload, model);
        const scenario = assess(scenarioPayload(payload, allowedOverrides), {});
        const diff = diffAssessments(baseline, scenario, allowedOverrides);

        return Object.freeze({
            version: VERSION,
            planningView: true,
            baseline,
            scenario,
            overrides: Object.freeze({ ...allowedOverrides }),
            changes: diff.changes,
            changedLawIds: diff.changedLawIds,
            unchangedLawIds: diff.unchangedLawIds,
            changedFacts: diff.changedFacts,
            decisionAuthority: "deterministic-engine",
            ragPolicy: Object.freeze({
                usedForDecision: false,
                applicabilityAuthority: "none"
            })
        });
    }

    function explicitAnswer(value) {
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) return value.length > 0;
        return clean(value) !== "";
    }

    function resolveMissingFacts(payload = {}, model = {}, explicitAnswers = {}) {
        const baseline = assess(payload, model);
        const allowedFields = new Set(baseline.missingFacts.map((item) => item.field));
        const acceptedAnswers = Object.fromEntries(Object.entries(explicitAnswers || {})
            .filter(([field, value]) => allowedFields.has(clean(field)) && explicitAnswer(value)));
        const revisedPayload = {
            ...payload,
            answers: { ...(payload.answers || {}), ...acceptedAnswers },
            report: { ...(payload.report || {}), ...acceptedAnswers }
        };
        const revisedAssessment = assess(revisedPayload, {});
        const diff = diffAssessments(baseline, revisedAssessment, acceptedAnswers);
        return Object.freeze({
            version: VERSION,
            payload: Object.freeze(revisedPayload),
            acceptedAnswers: Object.freeze({ ...acceptedAnswers }),
            resolvedFields: Object.freeze(Object.keys(acceptedAnswers)),
            remainingMissingFacts: revisedAssessment.missingFacts,
            baseline,
            assessment: revisedAssessment,
            changes: diff.changes,
            changedLawIds: diff.changedLawIds,
            decisionAuthority: "deterministic-engine"
        });
    }

    const api = Object.freeze({
        version: VERSION,
        founderStates: FOUNDER_STATES,
        supportedScenarioFields: SUPPORTED_SCENARIO_FIELDS,
        assess,
        simulate,
        resolveMissingFacts,
        diffAssessments,
        buildMissingFacts,
        buildScaleTriggerMatrix,
        buildObligationObjects,
        buildFounderActions
    });

    window.GrowWithHRCompanyApplicability = api;

    if (window.GrowWithHRPDF) {
        window.GrowWithHRPDF = Object.freeze({
            ...window.GrowWithHRPDF,
            companyApplicabilityOrchestratorVersion: VERSION,
            buildCompanyApplicability: assess,
            simulateCompanyApplicability: simulate,
            resolveCompanyMissingFacts: resolveMissingFacts
        });
    }
})();
