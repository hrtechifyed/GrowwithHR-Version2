const MODEL_VERSION = "0.19.0-m4-explainable-intelligence";
const SCHEMA_VERSION = "1.0.0";

const DIMENSIONS = Object.freeze([
    "profileCompleteness",
    "applicabilityCertainty",
    "evidenceCoverage"
]);

const QUESTION_CATALOG = Object.freeze([
    {
        id: "legal-entity",
        label: "Confirm the organisation's legal entity type",
        answerKeys: ["entity", "legalEntity"],
        dimension: "applicabilityCertainty",
        weight: 18,
        rationale: "Legal entity type changes which statutory and governance obligations may apply."
    },
    {
        id: "employee-count",
        label: "Confirm the current employee headcount",
        answerKeys: ["employees", "employeeCount", "workforceSize"],
        dimension: "applicabilityCertainty",
        weight: 20,
        rationale: "Several obligations and recommended controls depend on workforce thresholds."
    },
    {
        id: "operating-states",
        label: "Confirm every Indian state or union territory of operation",
        answerKeys: ["operatingStates", "primaryState", "stateCoverage", "state"],
        dimension: "applicabilityCertainty",
        weight: 17,
        rationale: "State-specific registrations and employment requirements require a confirmed operating footprint."
    },
    {
        id: "work-model",
        label: "Confirm the organisation's working model",
        answerKeys: ["workModel", "workingModel", "remoteBand", "remoteWorkforce"],
        dimension: "profileCompleteness",
        weight: 11,
        rationale: "Working arrangements affect policy, documentation and distributed-work recommendations."
    },
    {
        id: "people-function",
        label: "Confirm who currently owns People and HR responsibilities",
        answerKeys: ["peopleFunction", "peopleSupport", "hrSupport"],
        dimension: "profileCompleteness",
        weight: 10,
        rationale: "Ownership determines whether the next action should be founder-led, manager-led or assigned to a People specialist."
    },
    {
        id: "evidence-register",
        label: "Record which employment and compliance documents can be evidenced today",
        answerKeys: ["evidence", "evidenceItems", "documentsAvailable", "policyRegister"],
        dimension: "evidenceCoverage",
        weight: 24,
        rationale: "Evidence coverage must be measured separately from applicability and profile completeness."
    }
]);

function cleanText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
}

function isMeaningful(value) {
    if (Array.isArray(value)) return value.some(isMeaningful);
    if (value && typeof value === "object") return Object.values(value).some(isMeaningful);
    if (typeof value === "boolean") return true;
    return cleanText(value) !== "";
}

function firstValue(source, keys) {
    for (const key of keys) {
        if (isMeaningful(source?.[key])) return source[key];
    }
    return undefined;
}

function clamp(value, minimum = 0, maximum = 100) {
    return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

function round(value) {
    return Math.round(clamp(value));
}

function normaliseInput(input = {}) {
    const answers = input.answers && typeof input.answers === "object" ? input.answers : {};
    const report = input.report && typeof input.report === "object" ? input.report : {};
    const traceability = input.traceability && typeof input.traceability === "object"
        ? input.traceability
        : input;
    return {
        answers: { ...report, ...answers },
        facts: Array.isArray(traceability.facts) ? traceability.facts : [],
        rules: Array.isArray(traceability.rules) ? traceability.rules : [],
        recommendations: Array.isArray(traceability.recommendations) ? traceability.recommendations : []
    };
}

function profileCompleteness(normalised) {
    const required = QUESTION_CATALOG.filter((question) => question.dimension === "profileCompleteness" || question.dimension === "applicabilityCertainty");
    const answeredWeight = required.reduce((sum, question) => (
        sum + (isMeaningful(firstValue(normalised.answers, question.answerKeys)) ? question.weight : 0)
    ), 0);
    const totalWeight = required.reduce((sum, question) => sum + question.weight, 0);
    return {
        value: round((answeredWeight / totalWeight) * 100),
        answeredWeight,
        totalWeight,
        basis: "Weighted completion of the organisation facts required by the M4 question catalogue."
    };
}

function applicabilityCertainty(normalised) {
    const outcomes = normalised.rules;
    if (!outcomes.length) {
        const applicableQuestions = QUESTION_CATALOG.filter((question) => question.dimension === "applicabilityCertainty");
        const answered = applicableQuestions.filter((question) => isMeaningful(firstValue(normalised.answers, question.answerKeys)));
        return {
            value: round((answered.length / Math.max(1, applicableQuestions.length)) * 100),
            evaluatedRules: 0,
            certainRules: 0,
            basis: "Fallback certainty from confirmed applicability inputs because no deterministic rule ledger was supplied."
        };
    }
    const certainStates = new Set(["applicable", "not_currently_applicable", "specialist_review"]);
    const certain = outcomes.filter((rule) => {
        const status = cleanText(rule.status || rule.outcome || rule.applicability).toLowerCase();
        const missing = Array.isArray(rule.missingFacts) ? rule.missingFacts.filter(isMeaningful) : [];
        return certainStates.has(status) && missing.length === 0;
    });
    return {
        value: round((certain.length / outcomes.length) * 100),
        evaluatedRules: outcomes.length,
        certainRules: certain.length,
        basis: "Share of evaluated deterministic rules with a supported status and no missing decision facts."
    };
}

function evidenceCoverage(normalised) {
    const recommendations = normalised.recommendations;
    const facts = normalised.facts;
    const evidenceRecords = recommendations.length ? recommendations : facts;
    if (!evidenceRecords.length) {
        const evidenceValue = firstValue(normalised.answers, ["evidence", "evidenceItems", "documentsAvailable", "policyRegister"]);
        return {
            value: isMeaningful(evidenceValue) ? 50 : 0,
            evidencedItems: isMeaningful(evidenceValue) ? 1 : 0,
            totalItems: isMeaningful(evidenceValue) ? 2 : 0,
            basis: "No evidence ledger was supplied; the metric reports only whether an initial evidence register is present."
        };
    }
    const evidenced = evidenceRecords.filter((record) => {
        const status = cleanText(record.evidenceStatus || record.evidence?.status || record.status).toLowerCase();
        return ["verified", "provided", "available", "evidenced"].includes(status);
    });
    return {
        value: round((evidenced.length / evidenceRecords.length) * 100),
        evidencedItems: evidenced.length,
        totalItems: evidenceRecords.length,
        basis: "Share of governed findings or facts with an explicit available or verified evidence state."
    };
}

function buildQuestionQueue(normalised, metrics) {
    return QUESTION_CATALOG
        .filter((question) => !isMeaningful(firstValue(normalised.answers, question.answerKeys)))
        .map((question) => {
            const current = metrics[question.dimension]?.value || 0;
            const estimatedGain = round(question.weight * (1 - current / 100));
            return {
                id: question.id,
                label: question.label,
                dimension: question.dimension,
                estimatedInformationGain: estimatedGain,
                rationale: question.rationale,
                answerKeys: [...question.answerKeys]
            };
        })
        .sort((left, right) => (
            right.estimatedInformationGain - left.estimatedInformationGain || left.id.localeCompare(right.id)
        ));
}

function buildDecisionTrace(normalised, metrics, questions) {
    return [
        {
            step: 1,
            operation: "normalise-input",
            explanation: "Combined protected assessment answers, report context and deterministic traceability records without modifying saved state."
        },
        ...DIMENSIONS.map((dimension, index) => ({
            step: index + 2,
            operation: `calculate-${dimension}`,
            value: metrics[dimension].value,
            explanation: metrics[dimension].basis
        })),
        {
            step: 5,
            operation: "rank-targeted-questions",
            value: questions.length,
            explanation: "Ranked only unanswered governed questions by estimated information gain; no blended health score was created."
        }
    ];
}

function buildExplainableIntelligence(input = {}) {
    const normalised = normaliseInput(input);
    const metrics = {
        profileCompleteness: profileCompleteness(normalised),
        applicabilityCertainty: applicabilityCertainty(normalised),
        evidenceCoverage: evidenceCoverage(normalised)
    };
    const questions = buildQuestionQueue(normalised, metrics);
    return Object.freeze({
        modelVersion: MODEL_VERSION,
        schemaVersion: SCHEMA_VERSION,
        generatedAt: new Date().toISOString(),
        metrics,
        questions,
        nextBestQuestion: questions[0] || null,
        decisionTrace: buildDecisionTrace(normalised, metrics, questions),
        safeguards: Object.freeze({
            noBlendedPercentage: true,
            deterministic: true,
            modifiesProtectedState: false,
            legalCertification: false,
            indiaOperationsOnly: true
        })
    });
}

const ExplainableIntelligence = Object.freeze({
    MODEL_VERSION,
    SCHEMA_VERSION,
    DIMENSIONS,
    QUESTION_CATALOG,
    buildExplainableIntelligence
});

if (typeof window !== "undefined") {
    window.GrowWithHRExplainableIntelligence = ExplainableIntelligence;
}

export {
    MODEL_VERSION,
    SCHEMA_VERSION,
    DIMENSIONS,
    QUESTION_CATALOG,
    buildExplainableIntelligence
};

export default ExplainableIntelligence;
