/* GrowWithHR company-wide deterministic applicability orchestrator */
(() => {
    "use strict";

    const VERSION = "1.0.0-company-applicability-scale-trigger";
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const unique = (values = []) => [...new Set(values.map((value) => clean(value)).filter(Boolean))];

    const FOUNDER_STATES = Object.freeze({
        "Applicable": Object.freeze({ key: "relevant-now", label: "Relevant now" }),
        "Review required": Object.freeze({ key: "review-needed", label: "Review needed" }),
        "Needs information": Object.freeze({ key: "more-information-required", label: "More information required" }),
        "Not currently triggered": Object.freeze({ key: "watch-as-you-grow", label: "Watch as you grow" })
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

    function normaliseFinding(row = {}) {
        const backendStatus = clean(row.status, "Needs information");
        const founderState = founderStateFor(backendStatus);
        const threshold = row.thresholdResult || {};
        const confirmedInputs = Array.isArray(row.confirmedInputs) ? [...row.confirmedInputs] : [];
        const missingInputs = Array.isArray(row.missingInputs) ? [...row.missingInputs] : [];
        const missingQuestions = Array.isArray(row.missingQuestions) ? [...row.missingQuestions] : [];

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
                threshold: Number.isFinite(threshold.threshold) ? threshold.threshold : null
            }),
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
                    existing.affectedAreas.push(clean(item.shortTitle || item.title, item.id));
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

    function buildScaleTriggerMatrix(findings = []) {
        return Object.freeze(findings
            .filter((item) => ["below", "near"].includes(clean(item.trigger?.state)))
            .map((item) => Object.freeze({
                lawId: item.id,
                title: clean(item.shortTitle || item.title, item.id),
                currentState: item.founderState,
                currentLabel: item.founderLabel,
                triggerState: item.trigger.state,
                currentPosition: item.trigger.currentPosition,
                reassessmentPoint: item.trigger.reassessmentPoint,
                explanation: item.trigger.explanation,
                sourceUrl: clean(item.officialUrl),
                decisionAuthority: "deterministic-engine"
            })));
    }

    function assess(payload = {}, model = {}) {
        const rows = Array.from(resolveBuilder()(payload, model) || []);
        const findings = Object.freeze(rows.map(normaliseFinding));
        const groups = groupFindings(findings);

        return Object.freeze({
            version: VERSION,
            companyWide: true,
            decisionAuthority: "deterministic-engine",
            findings,
            groups,
            missingFacts: buildMissingFacts(findings),
            scaleTriggerMatrix: buildScaleTriggerMatrix(findings),
            ragPolicy: Object.freeze({
                usedForDecision: false,
                applicabilityAuthority: "none"
            })
        });
    }

    function scenarioPayload(payload = {}, overrides = {}) {
        return {
            ...payload,
            answers: { ...(payload.answers || {}), ...overrides },
            report: { ...(payload.report || {}), ...overrides }
        };
    }

    function simulate(payload = {}, model = {}, overrides = {}) {
        const baseline = assess(payload, model);
        const scenario = assess(scenarioPayload(payload, overrides), {});
        const baselineById = new Map(baseline.findings.map((item) => [item.id, item]));
        const changes = scenario.findings
            .map((item) => {
                const before = baselineById.get(item.id);
                if (!before) return null;
                const statusChanged = before.backendStatus !== item.backendStatus;
                const triggerChanged = before.trigger.state !== item.trigger.state ||
                    before.trigger.currentPosition !== item.trigger.currentPosition ||
                    before.trigger.reassessmentPoint !== item.trigger.reassessmentPoint;
                const missingChanged = before.missingInputs.join("|") !== item.missingInputs.join("|");
                if (!statusChanged && !triggerChanged && !missingChanged) return null;
                return Object.freeze({
                    lawId: item.id,
                    title: clean(item.shortTitle || item.title, item.id),
                    before: Object.freeze({
                        backendStatus: before.backendStatus,
                        founderState: before.founderState,
                        triggerState: before.trigger.state,
                        currentPosition: before.trigger.currentPosition,
                        missingInputs: before.missingInputs
                    }),
                    after: Object.freeze({
                        backendStatus: item.backendStatus,
                        founderState: item.founderState,
                        triggerState: item.trigger.state,
                        currentPosition: item.trigger.currentPosition,
                        missingInputs: item.missingInputs
                    })
                });
            })
            .filter(Boolean);

        return Object.freeze({
            version: VERSION,
            overrides: Object.freeze({ ...overrides }),
            changes: Object.freeze(changes),
            changedLawIds: Object.freeze(changes.map((item) => item.lawId)),
            decisionAuthority: "deterministic-engine",
            ragPolicy: Object.freeze({
                usedForDecision: false,
                applicabilityAuthority: "none"
            })
        });
    }

    const api = Object.freeze({
        version: VERSION,
        founderStates: FOUNDER_STATES,
        assess,
        simulate,
        buildMissingFacts,
        buildScaleTriggerMatrix
    });

    window.GrowWithHRCompanyApplicability = api;

    if (window.GrowWithHRPDF) {
        window.GrowWithHRPDF = Object.freeze({
            ...window.GrowWithHRPDF,
            companyApplicabilityOrchestratorVersion: VERSION,
            buildCompanyApplicability: assess,
            simulateCompanyApplicability: simulate
        });
    }
})();
