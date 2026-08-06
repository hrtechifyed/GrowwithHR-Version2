/**
 * Catalog-defined legal fact assurance.
 *
 * The original assurance module maps the stable organisation assessment.
 * Substantive legal feature catalogs can opt into `factMappingMode:
 * "catalog-defined"` so their explicitly declared, privacy-safe fields become
 * deterministic traceability facts without teaching the general assessment
 * mapper about every law-specific field.
 */

import {
    LEGAL_RULE_ASSURANCE_VERSION,
    LEGAL_REVIEW_STATUSES,
    LegalRuleAssuranceError,
    validateLegalRuleCatalog as validateBaseCatalog,
    evaluateLegalRuleAssurance as evaluateBaseAssurance
} from "./legal-rule-assurance.js";

import {
    createConfirmedFact
} from "./traceability-contract.js";

import {
    evaluateRecommendationRules
} from "./recommendation-evaluator.js";

export {
    LEGAL_RULE_ASSURANCE_VERSION,
    LEGAL_REVIEW_STATUSES,
    LegalRuleAssuranceError
};

const object = (value) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function hasOwn(value, property) {
    return Object.prototype.hasOwnProperty.call(value, property);
}

function meaningful(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return text(value).length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

function integer(value) {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    const normalized = text(value);
    if (!/^-?\d+$/.test(normalized)) return null;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

function validDate(value) {
    const normalized = text(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return "";
    const timestamp = Date.parse(`${normalized}T00:00:00Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === normalized
        ? normalized
        : "";
}

function uniqueTextArray(value) {
    return [...new Set(array(value).map(text).filter(Boolean))];
}

function jsonArray(value) {
    return array(value)
        .filter((item) => item !== null && item !== undefined)
        .map((item) => clone(item));
}

function normalize(value, type) {
    switch (text(type)) {
        case "boolean":
            return typeof value === "boolean" ? value : null;
        case "date":
            return validDate(value) || null;
        case "date-array": {
            const dates = array(value).map(validDate).filter(Boolean);
            return dates.length ? [...new Set(dates)] : [];
        }
        case "year": {
            const parsed = integer(value);
            return parsed !== null && parsed >= 1900 && parsed <= 2200 ? parsed : null;
        }
        case "non-negative-integer": {
            const parsed = integer(value);
            return parsed !== null && parsed >= 0 ? parsed : null;
        }
        case "positive-integer": {
            const parsed = integer(value);
            return parsed !== null && parsed >= 1 ? parsed : null;
        }
        case "percentage": {
            const parsed = integer(value);
            return parsed !== null && parsed >= 0 && parsed <= 100 ? parsed : null;
        }
        case "controlled-text":
        case "role-reference":
        case "control-status":
        case "text":
            return text(value) || null;
        case "controlled-text-array":
        case "evidence-reference-array":
        case "location-reference-array":
        case "text-array":
            return uniqueTextArray(value);
        case "role-eligibility-record":
            return Object.keys(object(value)).length ? clone(object(value)) : null;
        case "location-control-array":
        case "unit-count-array":
        case "unit-control-array":
            return jsonArray(value);
        default:
            return clone(value);
    }
}

function factDefinitions(catalog) {
    const definitions = new Map();
    array(object(catalog).rules).forEach((rule) => {
        array(object(rule).requiredAssessmentFacts).forEach((definitionValue) => {
            const definition = object(definitionValue);
            const factId = text(definition.factId);
            if (!factId || definitions.has(factId)) return;
            definitions.set(factId, Object.freeze({
                factId,
                answerKey: text(definition.sourceAssessmentField),
                type: text(definition.type || "text"),
                label: text(definition.label || factId)
            }));
        });
    });
    return [...definitions.values()];
}

function createCatalogFacts(answersValue, catalog, evaluatedAt) {
    const answers = object(answersValue);
    const facts = [];

    factDefinitions(catalog).forEach((definition) => {
        if (!definition.answerKey || !hasOwn(answers, definition.answerKey)) return;
        const raw = answers[definition.answerKey];
        if (!meaningful(raw)) return;
        const value = normalize(raw, definition.type);
        if (!meaningful(value)) return;

        facts.push(createConfirmedFact({
            id: definition.factId,
            kind: "confirmed",
            label: definition.label,
            value,
            answerKey: definition.answerKey,
            recordedAt: evaluatedAt || null,
            metadata: {
                mapperVersion: "catalog-defined-1.0.0",
                source: "privacy-safe-legal-feature-answer",
                catalogDefined: true
            }
        }));
    });

    return Object.freeze(facts);
}

function uniqueTexts(values) {
    return [...new Set(array(values).map(text).filter(Boolean))];
}

function usesControlReviewOutcomeModel(catalog) {
    return text(object(catalog).outcomeModel) === "control-review";
}

function createEvaluatorCompatibleCatalog(catalogValue) {
    const catalog = clone(object(catalogValue));
    if (!usesControlReviewOutcomeModel(catalog)) return catalog;

    array(catalog.rules).forEach((rule) => {
        const source = object(rule);
        const outcomes = object(source.outcomes);
        const notMatched = object(outcomes.notMatched);
        if (text(notMatched.status) !== "specialist-review") return;
        notMatched.status = "not-currently-applicable";
        source.permittedResultStatuses = uniqueTexts([
            ...array(source.permittedResultStatuses),
            "not-currently-applicable"
        ]);
    });
    return catalog;
}

function restoreControlReviewStatuses(traceabilityValue, catalog) {
    if (!usesControlReviewOutcomeModel(catalog)) return traceabilityValue;
    const traceability = clone(traceabilityValue);
    const ruleById = new Map(array(catalog.rules).map((rule) => [text(rule.id), rule]));

    array(traceability.ruleEvaluations).forEach((evaluation) => {
        if (text(object(evaluation.metadata).outcome) !== "notMatched") return;
        const rule = object(ruleById.get(text(evaluation.ruleId)));
        const status = text(object(object(rule.outcomes).notMatched).status);
        if (status) evaluation.status = status;
    });
    array(traceability.recommendations).forEach((recommendation) => {
        if (text(object(recommendation.metadata).outcome) !== "notMatched") return;
        const rule = object(ruleById.get(text(recommendation.ruleId)));
        const status = text(object(object(rule.outcomes).notMatched).status);
        if (status) recommendation.applicabilityStatus = status;
    });
    traceability.metadata = {
        ...object(traceability.metadata),
        outcomeModel: "control-review",
        notMatchedMeaning: "reported-control-gap"
    };
    return traceability;
}

function buildDecisions(catalog, traceability) {
    const ruleById = new Map(array(catalog.rules).map((rule) => [text(rule.id), rule]));
    const sourceById = new Map(array(catalog.sources).map((source) => [text(source.id), source]));

    return traceability.ruleEvaluations.map((evaluation) => {
        const rule = object(ruleById.get(text(evaluation.ruleId)));
        const outcomeName = text(object(evaluation.metadata).outcome);
        const outcome = object(object(rule.outcomes)[outcomeName]);
        const registrySourceIds = uniqueTexts(
            array(evaluation.sourceIds).map((sourceId) =>
                object(sourceById.get(text(sourceId))).registrySourceId
            )
        );

        return deepFreeze({
            productRuleId: text(rule.productRuleId),
            ruleId: text(evaluation.ruleId),
            ruleVersion: text(evaluation.ruleVersion),
            sourceRecordId: text(rule.sourceRecordId),
            status: text(evaluation.status),
            reasonCode: text(outcome.reasonCode),
            reason: text(evaluation.reason),
            requiredFactIds: clone(array(evaluation.requiredFactIds)),
            triggeringFactIds: clone(array(evaluation.triggeringFactIds)),
            missingFactIds: clone(array(evaluation.missingFactIds)),
            sourceIds: clone(array(evaluation.sourceIds)),
            sourceRegistryIds: registrySourceIds,
            sourceSections: clone(array(rule.sourceSections)),
            effectiveDateMetadata: clone(object(rule.effectiveDateMetadata)),
            legalReviewStatus: text(rule.legalReviewStatus),
            limitations: uniqueTexts(rule.limitations)
        });
    });
}

export function validateLegalRuleCatalog(catalog) {
    const source = object(catalog);
    if (text(source.factMappingMode) !== "catalog-defined") {
        return validateBaseCatalog(source);
    }
    return validateBaseCatalog(createEvaluatorCompatibleCatalog(source));
}

export function evaluateLegalRuleAssurance(input = {}) {
    const source = object(input);
    const catalog = object(source.catalog);
    if (text(catalog.factMappingMode) !== "catalog-defined") {
        return evaluateBaseAssurance(source);
    }

    const evaluatorCatalog = createEvaluatorCompatibleCatalog(catalog);
    const validation = validateBaseCatalog(evaluatorCatalog);
    if (!validation.valid) throw new LegalRuleAssuranceError(validation.errors);

    const evaluatedAt = text(source.evaluatedAt);
    const facts = createCatalogFacts(source.answers, catalog, evaluatedAt);
    const evaluatedTraceability = evaluateRecommendationRules({
        facts,
        catalog: evaluatorCatalog,
        evaluatedAt,
        generatedAt: evaluatedAt,
        limitations: [
            "Legal applicability and control-review outcomes are determined only by the governed deterministic catalog and supplied assessment facts.",
            "Retrieval and language-model output cannot create facts or change the deterministic result."
        ],
        metadata: {
            assuranceVersion: LEGAL_RULE_ASSURANCE_VERSION,
            legalRuleCatalog: true,
            factMappingMode: "catalog-defined",
            applicabilityAuthority: "deterministic-only",
            retrievalRole: "source-retrieval-only",
            llmRole: "explanation-only"
        }
    });
    const traceability = restoreControlReviewStatuses(evaluatedTraceability, catalog);

    return deepFreeze({
        assuranceVersion: LEGAL_RULE_ASSURANCE_VERSION,
        evaluatedAt,
        legalReviewStatus: text(catalog.legalReviewStatus),
        applicabilityAuthority: "deterministic-only",
        retrievalRole: "source-retrieval-only",
        llmRole: "explanation-only",
        decisions: buildDecisions(catalog, traceability),
        traceability
    });
}

export function evaluateLegalRuleAssuranceSafely(input = {}) {
    try {
        return Object.freeze({
            valid: true,
            value: evaluateLegalRuleAssurance(input),
            errors: Object.freeze([])
        });
    } catch (error) {
        const errors = error instanceof LegalRuleAssuranceError
            ? error.issues
            : Object.freeze([{ path: "/", message: text(error?.message) || "Unknown legal rule assurance error." }]);
        return Object.freeze({ valid: false, value: null, errors });
    }
}

export default Object.freeze({
    version: LEGAL_RULE_ASSURANCE_VERSION,
    legalReviewStatuses: LEGAL_REVIEW_STATUSES,
    validateLegalRuleCatalog,
    evaluateLegalRuleAssurance,
    evaluateLegalRuleAssuranceSafely
});
