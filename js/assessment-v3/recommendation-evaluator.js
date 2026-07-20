/**
 * GrowWithHR Compliance DNA
 * M2 Deterministic Recommendation Evaluator
 *
 * Evaluates a governed recommendation-rule catalog against confirmed and
 * derived facts and returns a complete traceability bundle.
 *
 * No DOM, browser-storage, network, PDF, email or delivery side effects.
 * Timestamps must be supplied explicitly so identical inputs remain
 * deterministic.
 */

import {
    APPLICABILITY_STATUS,
    APPLICABILITY_STATUSES,
    TRACEABILITY_CONTRACT_VERSION,
    TRACEABILITY_IDENTIFIER_PATTERNS,
    TraceabilityContractError,
    createRecommendation,
    createRuleEvaluation,
    createTraceabilityBundle
} from "./traceability-contract.js";

export const RECOMMENDATION_EVALUATOR_VERSION = "1.0.0";

export const SUPPORTED_CONDITION_OPERATORS = Object.freeze([
    "exists",
    "equals",
    "not-equals",
    "greater-than",
    "greater-than-or-equal",
    "less-than",
    "less-than-or-equal",
    "contains",
    "contains-any",
    "contains-all"
]);

const MATCH_MODES = Object.freeze([
    "all",
    "any"
]);

const DATE_TIME_PATTERN =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const SEMANTIC_VERSION_PATTERN =
    TRACEABILITY_IDENTIFIER_PATTERNS
        .semanticVersion;

function asObject(value) {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    )
        ? value
        : {};
}

function asArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}

function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
}

function hasOwn(
    value,
    property
) {
    return Object.prototype
        .hasOwnProperty.call(
            value,
            property
        );
}

function uniqueTexts(values) {
    return [
        ...new Set(
            asArray(values)
                .map(cleanText)
                .filter(Boolean)
        )
    ];
}

function createIssue(
    path,
    message
) {
    return Object.freeze({
        path:
            cleanText(path) ||
            "/",

        message:
            cleanText(message) ||
            "Recommendation evaluation failed."
    });
}

export class RecommendationEvaluatorError
    extends Error {
    constructor(issues) {
        const normalized =
            Object.freeze(
                (
                    Array.isArray(issues)
                        ? issues
                        : [issues]
                )
                    .filter(Boolean)
                    .map((issue) => {
                        const source =
                            asObject(issue);

                        return createIssue(
                            source.path,
                            source.message
                        );
                    })
            );

        super(
            normalized.length
                ? normalized
                    .map(
                        (issue) =>
                            `${issue.path}: ${issue.message}`
                    )
                    .join("\n")
                : "Recommendation evaluation failed."
        );

        this.name =
            "RecommendationEvaluatorError";

        this.issues =
            normalized;
    }
}

function fail(
    path,
    message
) {
    throw new RecommendationEvaluatorError([
        createIssue(
            path,
            message
        )
    ]);
}

function requireText(
    value,
    path
) {
    const text =
        cleanText(value);

    if (!text) {
        fail(
            path,
            "A non-empty string is required."
        );
    }

    return text;
}

function requireDateTime(
    value,
    path
) {
    const dateTime =
        requireText(
            value,
            path
        );

    if (
        !DATE_TIME_PATTERN.test(
            dateTime
        ) ||
        !Number.isFinite(
            Date.parse(
                dateTime
            )
        )
    ) {
        fail(
            path,
            "A valid ISO 8601 date-time with a timezone is required."
        );
    }

    return dateTime;
}

function hasMeaningfulValue(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return false;
    }

    if (
        typeof value ===
        "string"
    ) {
        return cleanText(
            value
        ) !== "";
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return true;
}

function jsonEqual(
    left,
    right
) {
    if (
        Object.is(
            left,
            right
        )
    ) {
        return true;
    }

    if (
        Array.isArray(left) ||
        Array.isArray(right)
    ) {
        return (
            Array.isArray(left) &&
            Array.isArray(right) &&
            left.length ===
                right.length &&
            left.every(
                (
                    item,
                    index
                ) =>
                    jsonEqual(
                        item,
                        right[index]
                    )
            )
        );
    }

    const leftIsObject =
        left &&
        typeof left ===
            "object";

    const rightIsObject =
        right &&
        typeof right ===
            "object";

    if (
        !leftIsObject ||
        !rightIsObject
    ) {
        return false;
    }

    const leftKeys =
        Object.keys(left)
            .sort();

    const rightKeys =
        Object.keys(right)
            .sort();

    return (
        leftKeys.length ===
            rightKeys.length &&
        leftKeys.every(
            (
                key,
                index
            ) => {
                return (
                    key ===
                        rightKeys[index] &&
                    jsonEqual(
                        left[key],
                        right[key]
                    )
                );
            }
        )
    );
}

function compareNumber(
    actual,
    expected,
    comparator
) {
    return (
        typeof actual ===
            "number" &&
        Number.isFinite(
            actual
        ) &&
        typeof expected ===
            "number" &&
        Number.isFinite(
            expected
        ) &&
        comparator(
            actual,
            expected
        )
    );
}

function valueContains(
    actual,
    expected
) {
    if (Array.isArray(actual)) {
        return actual.some(
            (item) =>
                jsonEqual(
                    item,
                    expected
                )
        );
    }

    if (
        typeof actual ===
        "string"
    ) {
        return actual.includes(
            String(
                expected ?? ""
            )
        );
    }

    return false;
}

function evaluateOperator(
    actual,
    operator,
    expected
) {
    switch (operator) {
        case "exists":
            return hasMeaningfulValue(
                actual
            );

        case "equals":
            return jsonEqual(
                actual,
                expected
            );

        case "not-equals":
            return !jsonEqual(
                actual,
                expected
            );

        case "greater-than":
            return compareNumber(
                actual,
                expected,
                (
                    left,
                    right
                ) =>
                    left > right
            );

        case "greater-than-or-equal":
            return compareNumber(
                actual,
                expected,
                (
                    left,
                    right
                ) =>
                    left >= right
            );

        case "less-than":
            return compareNumber(
                actual,
                expected,
                (
                    left,
                    right
                ) =>
                    left < right
            );

        case "less-than-or-equal":
            return compareNumber(
                actual,
                expected,
                (
                    left,
                    right
                ) =>
                    left <= right
            );

        case "contains":
            return valueContains(
                actual,
                expected
            );

        case "contains-any":
            return (
                Array.isArray(
                    expected
                ) &&
                expected.some(
                    (candidate) =>
                        valueContains(
                            actual,
                            candidate
                        )
                )
            );

        case "contains-all":
            return (
                Array.isArray(
                    expected
                ) &&
                expected.every(
                    (candidate) =>
                        valueContains(
                            actual,
                            candidate
                        )
                )
            );

        default:
            return false;
    }
}

function validateOutcome(
    outcome,
    path,
    expectedStatus,
    recommendationIds,
    issues
) {
    const source =
        asObject(
            outcome
        );

    const status =
        cleanText(
            source.status
        );

    if (
        !APPLICABILITY_STATUSES
            .includes(
                status
            )
    ) {
        issues.push(
            createIssue(
                `${path}/status`,
                `Status must be one of: ${APPLICABILITY_STATUSES.join(", ")}.`
            )
        );
    }

    if (
        expectedStatus &&
        status !==
            expectedStatus
    ) {
        issues.push(
            createIssue(
                `${path}/status`,
                `Status must be "${expectedStatus}" for this outcome.`
            )
        );
    }

    if (
        !cleanText(
            source.reason
        )
    ) {
        issues.push(
            createIssue(
                `${path}/reason`,
                "A human-readable reason is required."
            )
        );
    }

    if (
        source.recommendation ===
        null
    ) {
        return;
    }

    const recommendation =
        asObject(
            source.recommendation
        );

    const identifier =
        cleanText(
            recommendation.id
        );

    if (
        !TRACEABILITY_IDENTIFIER_PATTERNS
            .recommendation
            .test(
                identifier
            )
    ) {
        issues.push(
            createIssue(
                `${path}/recommendation/id`,
                "A valid recommendation identifier is required."
            )
        );
    } else if (
        recommendationIds.has(
            identifier
        )
    ) {
        issues.push(
            createIssue(
                `${path}/recommendation/id`,
                `Recommendation identifier "${identifier}" is duplicated.`
            )
        );
    } else {
        recommendationIds.add(
            identifier
        );
    }

    for (
        const property
        of [
            "title",
            "action",
            "timeline"
        ]
    ) {
        if (
            !cleanText(
                recommendation[
                    property
                ]
            )
        ) {
            issues.push(
                createIssue(
                    `${path}/recommendation/${property}`,
                    "A non-empty string is required."
                )
            );
        }
    }
}

function collectCatalogIssues(catalog) {
    const source =
        asObject(
            catalog
        );

    const issues = [];

    const catalogVersion =
        cleanText(
            source.catalogVersion
        );

    if (
        !SEMANTIC_VERSION_PATTERN
            .test(
                catalogVersion
            )
    ) {
        issues.push(
            createIssue(
                "/catalogVersion",
                "A semantic catalog version is required."
            )
        );
    }

    if (
        source.stableReportMutation !==
        false
    ) {
        issues.push(
            createIssue(
                "/stableReportMutation",
                "M2 rule catalogs must explicitly preserve the stable report contract."
            )
        );
    }

    if (
        source.advisoryOnly !==
        true
    ) {
        issues.push(
            createIssue(
                "/advisoryOnly",
                "M2 rule catalogs must remain explicitly advisory-only."
            )
        );
    }

    if (
        source.privateBetaOnly !==
        true
    ) {
        issues.push(
            createIssue(
                "/privateBetaOnly",
                "M2 rule catalogs must remain isolated to the private-beta experience."
            )
        );
    }

    const defaults =
        asObject(
            source.defaults
        );

    const defaultRuleVersion =
        cleanText(
            defaults.ruleVersion
        );

    const defaultMode =
        cleanText(
            defaults
                .requiredFactMode ||
            "all"
        );

    if (
        defaultRuleVersion &&
        !SEMANTIC_VERSION_PATTERN
            .test(
                defaultRuleVersion
            )
    ) {
        issues.push(
            createIssue(
                "/defaults/ruleVersion",
                "The default rule version must use semantic versioning."
            )
        );
    }

    if (
        !MATCH_MODES.includes(
            defaultMode
        )
    ) {
        issues.push(
            createIssue(
                "/defaults/requiredFactMode",
                "Required-fact mode must be all or any."
            )
        );
    }

    const sourceIds =
        new Set();

    asArray(
        source.sources
    ).forEach(
        (
            referenceValue,
            index
        ) => {
            const referenceId =
                cleanText(
                    asObject(
                        referenceValue
                    ).id
                );

            if (
                !TRACEABILITY_IDENTIFIER_PATTERNS
                    .source
                    .test(
                        referenceId
                    )
            ) {
                issues.push(
                    createIssue(
                        `/sources/${index}/id`,
                        "A valid source identifier is required."
                    )
                );
            } else if (
                sourceIds.has(
                    referenceId
                )
            ) {
                issues.push(
                    createIssue(
                        `/sources/${index}/id`,
                        `Source identifier "${referenceId}" is duplicated.`
                    )
                );
            } else {
                sourceIds.add(
                    referenceId
                );
            }
        }
    );

    if (
        sourceIds.size ===
        0
    ) {
        issues.push(
            createIssue(
                "/sources",
                "At least one structured source reference is required."
            )
        );
    }

    const rules =
        asArray(
            source.rules
        );

    if (
        rules.length ===
        0
    ) {
        issues.push(
            createIssue(
                "/rules",
                "At least one deterministic rule is required."
            )
        );
    }

    const ruleIds =
        new Set();

    const recommendationIds =
        new Set();

    rules.forEach(
        (
            ruleValue,
            ruleIndex
        ) => {
            const rule =
                asObject(
                    ruleValue
                );

            const path =
                `/rules/${ruleIndex}`;

            const ruleId =
                cleanText(
                    rule.id
                );

            if (
                !TRACEABILITY_IDENTIFIER_PATTERNS
                    .rule
                    .test(
                        ruleId
                    )
            ) {
                issues.push(
                    createIssue(
                        `${path}/id`,
                        "A valid rule identifier is required."
                    )
                );
            } else if (
                ruleIds.has(
                    ruleId
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/id`,
                        `Rule identifier "${ruleId}" is duplicated.`
                    )
                );
            } else {
                ruleIds.add(
                    ruleId
                );
            }

            const ruleVersion =
                cleanText(
                    rule.version ||
                    defaultRuleVersion
                );

            if (
                !SEMANTIC_VERSION_PATTERN
                    .test(
                        ruleVersion
                    )
            ) {
                issues.push(
                    createIssue(
                        `${path}/version`,
                        "A semantic rule version is required."
                    )
                );
            }

            const requiredMode =
                cleanText(
                    rule
                        .requiredFactMode ||
                    defaultMode
                );

            if (
                !MATCH_MODES.includes(
                    requiredMode
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/requiredFactMode`,
                        "Required-fact mode must be all or any."
                    )
                );
            }

            const rawRequiredFactIds =
                asArray(
                    rule.requiredFactIds
                )
                    .map(cleanText)
                    .filter(Boolean);

            const requiredFactIds = [
                ...new Set(
                    rawRequiredFactIds
                )
            ];

            if (
                requiredFactIds.length !==
                rawRequiredFactIds.length
            ) {
                issues.push(
                    createIssue(
                        `${path}/requiredFactIds`,
                        "Required fact identifiers must be unique."
                    )
                );
            }

            if (
                requiredFactIds.length ===
                0
            ) {
                issues.push(
                    createIssue(
                        `${path}/requiredFactIds`,
                        "At least one required fact identifier is required."
                    )
                );
            }

            requiredFactIds.forEach(
                (
                    identifier,
                    index
                ) => {
                    if (
                        !TRACEABILITY_IDENTIFIER_PATTERNS
                            .fact
                            .test(
                                identifier
                            )
                    ) {
                        issues.push(
                            createIssue(
                                `${path}/requiredFactIds/${index}`,
                                "A valid fact identifier is required."
                            )
                        );
                    }
                }
            );

            const ruleSourceIds =
                uniqueTexts(
                    rule.sourceIds
                );

            if (
                ruleSourceIds.length ===
                0
            ) {
                issues.push(
                    createIssue(
                        `${path}/sourceIds`,
                        "At least one source identifier is required."
                    )
                );
            }

            ruleSourceIds.forEach(
                (
                    identifier,
                    index
                ) => {
                    if (
                        !sourceIds.has(
                            identifier
                        )
                    ) {
                        issues.push(
                            createIssue(
                                `${path}/sourceIds/${index}`,
                                `Source "${identifier}" does not resolve to the catalog source list.`
                            )
                        );
                    }
                }
            );

            const match =
                asObject(
                    rule.match
                );

            const matchMode =
                cleanText(
                    match.mode ||
                    "all"
                );

            if (
                !MATCH_MODES.includes(
                    matchMode
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/match/mode`,
                        "Condition-match mode must be all or any."
                    )
                );
            }

            const conditions =
                asArray(
                    match.conditions
                );

            if (
                conditions.length ===
                0
            ) {
                issues.push(
                    createIssue(
                        `${path}/match/conditions`,
                        "At least one deterministic condition is required."
                    )
                );
            }

            conditions.forEach(
                (
                    conditionValue,
                    conditionIndex
                ) => {
                    const condition =
                        asObject(
                            conditionValue
                        );

                    const conditionPath =
                        `${path}/match/conditions/${conditionIndex}`;

                    const factId =
                        cleanText(
                            condition.factId
                        );

                    const operator =
                        cleanText(
                            condition.operator
                        );

                    if (
                        !requiredFactIds.includes(
                            factId
                        )
                    ) {
                        issues.push(
                            createIssue(
                                `${conditionPath}/factId`,
                                "Every condition fact must also appear in requiredFactIds."
                            )
                        );
                    }

                    if (
                        !SUPPORTED_CONDITION_OPERATORS
                            .includes(
                                operator
                            )
                    ) {
                        issues.push(
                            createIssue(
                                `${conditionPath}/operator`,
                                `Operator must be one of: ${SUPPORTED_CONDITION_OPERATORS.join(", ")}.`
                            )
                        );
                    }

                    if (
                        operator !==
                            "exists" &&
                        !hasOwn(
                            condition,
                            "value"
                        )
                    ) {
                        issues.push(
                            createIssue(
                                `${conditionPath}/value`,
                                "This operator requires an explicit comparison value."
                            )
                        );
                    }
                }
            );

            const outcomes =
                asObject(
                    rule.outcomes
                );

            validateOutcome(
                outcomes.matched,
                `${path}/outcomes/matched`,
                null,
                recommendationIds,
                issues
            );

            const matchedStatus =
                cleanText(
                    asObject(
                        outcomes.matched
                    ).status
                );

            if (
                matchedStatus ===
                    APPLICABILITY_STATUS
                        .NOT_CURRENTLY_APPLICABLE ||
                matchedStatus ===
                    APPLICABILITY_STATUS
                        .MORE_INFORMATION_NEEDED
            ) {
                issues.push(
                    createIssue(
                        `${path}/outcomes/matched/status`,
                        "A matched condition cannot use a missing-information or not-applicable status."
                    )
                );
            }

            validateOutcome(
                outcomes.notMatched,
                `${path}/outcomes/notMatched`,
                APPLICABILITY_STATUS
                    .NOT_CURRENTLY_APPLICABLE,
                recommendationIds,
                issues
            );

            validateOutcome(
                outcomes.missing,
                `${path}/outcomes/missing`,
                APPLICABILITY_STATUS
                    .MORE_INFORMATION_NEEDED,
                recommendationIds,
                issues
            );
        }
    );

    return issues;
}

export function validateRecommendationCatalog(
    catalog
) {
    const errors =
        Object.freeze(
            collectCatalogIssues(
                catalog
            )
        );

    return Object.freeze({
        valid:
            errors.length ===
            0,

        errors
    });
}

function assertRecommendationCatalog(
    catalog
) {
    const validation =
        validateRecommendationCatalog(
            catalog
        );

    if (
        !validation.valid
    ) {
        throw new RecommendationEvaluatorError(
            validation.errors
        );
    }

    return asObject(
        catalog
    );
}

function indexFacts(factsValue) {
    const facts =
        asObject(
            factsValue
        );

    const confirmed =
        asArray(
            facts.confirmed
        );

    const derived =
        asArray(
            facts.derived
        );

    const index =
        new Map();

    const issues = [];

    [
        ...confirmed,
        ...derived
    ].forEach(
        (
            factValue,
            factIndex
        ) => {
            const fact =
                asObject(
                    factValue
                );

            const identifier =
                cleanText(
                    fact.id
                );

            if (
                !TRACEABILITY_IDENTIFIER_PATTERNS
                    .fact
                    .test(
                        identifier
                    )
            ) {
                issues.push(
                    createIssue(
                        `/facts/all/${factIndex}/id`,
                        "A valid fact identifier is required."
                    )
                );

                return;
            }

            if (
                index.has(
                    identifier
                )
            ) {
                issues.push(
                    createIssue(
                        `/facts/all/${factIndex}/id`,
                        `Fact identifier "${identifier}" is duplicated.`
                    )
                );

                return;
            }

            index.set(
                identifier,
                fact
            );
        }
    );

    if (
        issues.length
    ) {
        throw new RecommendationEvaluatorError(
            issues
        );
    }

    return {
        confirmed,
        derived,
        index
    };
}

function evaluateCondition(
    conditionValue,
    factIndex
) {
    const condition =
        asObject(
            conditionValue
        );

    const factId =
        cleanText(
            condition.factId
        );

    const operator =
        cleanText(
            condition.operator
        );

    const fact =
        factIndex.get(
            factId
        );

    if (!fact) {
        return Object.freeze({
            factId,
            operator,

            available:
                false,

            matched:
                false
        });
    }

    return Object.freeze({
        factId,
        operator,

        available:
            true,

        matched:
            Boolean(
                evaluateOperator(
                    fact.value,
                    operator,
                    condition.value
                )
            )
    });
}

function selectOutcome({
    rule,
    defaults,
    factIndex
}) {
    const requiredFactMode =
        cleanText(
            rule.requiredFactMode ||
            defaults
                .requiredFactMode ||
            "all"
        );

    const requiredFactIds =
        uniqueTexts(
            rule.requiredFactIds
        );

    const presentRequiredFactIds =
        requiredFactIds.filter(
            (identifier) =>
                factIndex.has(
                    identifier
                )
        );

    const missingFactIds =
        requiredFactIds.filter(
            (identifier) =>
                !factIndex.has(
                    identifier
                )
        );

    const match =
        asObject(
            rule.match
        );

    const matchMode =
        cleanText(
            match.mode ||
            "all"
        );

    const conditionResults =
        asArray(
            match.conditions
        ).map(
            (condition) =>
                evaluateCondition(
                    condition,
                    factIndex
                )
        );

    const missingRequiredFacts =
        requiredFactMode ===
        "all"
            ? missingFactIds.length >
                0
            : presentRequiredFactIds.length ===
                0;

    const unavailableCondition =
        conditionResults.some(
            (result) =>
                !result.available
        );

    let matched =
        false;

    if (
        !missingRequiredFacts
    ) {
        matched =
            matchMode ===
            "all"
                ? (
                    !unavailableCondition &&
                    conditionResults.every(
                        (result) =>
                            result.matched
                    )
                )
                : conditionResults.some(
                    (result) =>
                        result.available &&
                        result.matched
                );
    }

    let outcomeName;

    if (
        missingRequiredFacts
    ) {
        outcomeName =
            "missing";
    } else if (
        matched
    ) {
        outcomeName =
            "matched";
    } else if (
        requiredFactMode ===
            "any" &&
        missingFactIds.length >
            0
    ) {
        outcomeName =
            "missing";
    } else if (
        matchMode ===
            "all" &&
        unavailableCondition
    ) {
        outcomeName =
            "missing";
    } else {
        outcomeName =
            "notMatched";
    }

    const triggeringFactIds =
        uniqueTexts(
            conditionResults
                .filter(
                    (result) => {
                        if (
                            !result.available
                        ) {
                            return false;
                        }

                        return outcomeName ===
                            "matched"
                            ? result.matched
                            : true;
                    }
                )
                .map(
                    (result) =>
                        result.factId
                )
        );

    return Object.freeze({
        outcomeName,

        outcome:
            asObject(
                asObject(
                    rule.outcomes
                )[
                    outcomeName
                ]
            ),

        requiredFactMode,
        requiredFactIds,
        triggeringFactIds,

        missingFactIds:
            outcomeName ===
            "missing"
                ? missingFactIds
                : [],

        conditionResults
    });
}

function mergeEvidence(
    defaults,
    recommendation
) {
    return {
        status:
            "not-requested",

        notes:
            "",

        verificationProcessId:
            null,

        verifiedAt:
            null,

        ...asObject(
            defaults.evidence
        ),

        ...asObject(
            recommendation.evidence
        )
    };
}

function buildRuleResult({
    rule,
    defaults,
    factIndex,
    evaluatedAt,
    catalogVersion
}) {
    const selection =
        selectOutcome({
            rule,
            defaults,
            factIndex
        });

    const outcome =
        selection.outcome;

    const status =
        cleanText(
            outcome.status
        );

    const sourceIds =
        uniqueTexts(
            rule.sourceIds
        );

    const evaluation =
        createRuleEvaluation({
            ruleId:
                rule.id,

            ruleVersion:
                rule.version ||
                defaults
                    .ruleVersion,

            status,

            reason:
                outcome.reason,

            requiredFactIds:
                selection
                    .requiredFactIds,

            triggeringFactIds:
                selection
                    .triggeringFactIds,

            missingFactIds:
                selection
                    .missingFactIds,

            sourceIds,

            evaluatedAt,

            metadata: {
                evaluatorVersion:
                    RECOMMENDATION_EVALUATOR_VERSION,

                catalogVersion,

                domain:
                    cleanText(
                        rule.domain
                    ),

                title:
                    cleanText(
                        rule.title
                    ),

                requiredFactMode:
                    selection
                        .requiredFactMode,

                outcome:
                    selection
                        .outcomeName,

                conditionResults:
                    selection
                        .conditionResults
                        .map(
                            (result) => ({
                                factId:
                                    result
                                        .factId,

                                operator:
                                    result
                                        .operator,

                                available:
                                    result
                                        .available,

                                matched:
                                    result
                                        .matched
                            })
                        )
            }
        });

    if (
        outcome.recommendation ===
        null
    ) {
        return Object.freeze({
            evaluation,

            recommendation:
                null
        });
    }

    const template =
        asObject(
            outcome.recommendation
        );

    const limitations =
        uniqueTexts([
            ...asArray(
                defaults.limitations
            ),

            ...asArray(
                template.limitations
            )
        ]);

    const recommendationSourceIds =
        uniqueTexts(
            template.sourceIds
        );

    const recommendation =
        createRecommendation({
            id:
                template.id,

            ruleId:
                rule.id,

            applicabilityStatus:
                status,

            evidence:
                mergeEvidence(
                    defaults,
                    template
                ),

            title:
                template.title,

            reason:
                outcome.reason,

            action:
                template.action,

            timeline:
                template.timeline,

            triggeringFactIds:
                selection
                    .triggeringFactIds,

            missingFactIds:
                selection
                    .missingFactIds,

            sourceIds:
                recommendationSourceIds
                    .length
                    ? recommendationSourceIds
                    : sourceIds,

            limitations,

            metadata: {
                evaluatorVersion:
                    RECOMMENDATION_EVALUATOR_VERSION,

                catalogVersion,

                domain:
                    cleanText(
                        rule.domain
                    ),

                ruleTitle:
                    cleanText(
                        rule.title
                    ),

                outcome:
                    selection
                        .outcomeName
            }
        });

    return Object.freeze({
        evaluation,
        recommendation
    });
}

/**
 * Evaluates all catalog rules and returns a governed traceability bundle.
 *
 * @param {Object} input
 * @param {{confirmed: Array, derived: Array}} input.facts
 * @param {Object} input.catalog
 * @param {string} input.evaluatedAt
 * @param {string} [input.generatedAt]
 * @param {Array<string>} [input.limitations]
 * @param {Object} [input.metadata]
 * @returns {Object}
 */
export function evaluateRecommendationRules(
    input = {}
) {
    const source =
        asObject(
            input
        );

    const catalog =
        assertRecommendationCatalog(
            source.catalog
        );

    const evaluatedAt =
        requireDateTime(
            source.evaluatedAt,
            "/evaluatedAt"
        );

    const generatedAt =
        requireDateTime(
            source.generatedAt ||
            evaluatedAt,
            "/generatedAt"
        );

    const facts =
        indexFacts(
            source.facts
        );

    const defaults =
        asObject(
            catalog.defaults
        );

    const catalogVersion =
        cleanText(
            catalog.catalogVersion
        );

    const results =
        asArray(
            catalog.rules
        ).map(
            (ruleValue) =>
                buildRuleResult({
                    rule:
                        asObject(
                            ruleValue
                        ),

                    defaults,

                    factIndex:
                        facts.index,

                    evaluatedAt,
                    catalogVersion
                })
        );

    return createTraceabilityBundle({
        contractVersion:
            TRACEABILITY_CONTRACT_VERSION,

        generatedAt,

        facts: {
            confirmed:
                facts.confirmed,

            derived:
                facts.derived
        },

        ruleEvaluations:
            results.map(
                (result) =>
                    result.evaluation
            ),

        recommendations:
            results
                .map(
                    (result) =>
                        result
                            .recommendation
                )
                .filter(Boolean),

        sources:
            catalog.sources,

        limitations:
            uniqueTexts([
                ...asArray(
                    defaults.limitations
                ),

                ...asArray(
                    source.limitations
                )
            ]),

        metadata: {
            ...asObject(
                source.metadata
            ),

            evaluatorVersion:
                RECOMMENDATION_EVALUATOR_VERSION,

            catalogVersion,

            jurisdiction:
                cleanText(
                    catalog.jurisdiction
                ),

            advisoryOnly:
                catalog.advisoryOnly ===
                true,

            privateBetaOnly:
                catalog.privateBetaOnly ===
                true,

            stableReportMutation:
                false
        }
    });
}

export function evaluateRecommendationRulesSafely(
    input = {}
) {
    try {
        return Object.freeze({
            valid:
                true,

            value:
                evaluateRecommendationRules(
                    input
                ),

            errors:
                Object.freeze([])
        });
    } catch (error) {
        const errors =
            (
                error instanceof
                    RecommendationEvaluatorError ||
                error instanceof
                    TraceabilityContractError
            )
                ? error.issues
                : Object.freeze([
                    createIssue(
                        "/",
                        error?.message ||
                        "Unknown recommendation evaluation error."
                    )
                ]);

        return Object.freeze({
            valid:
                false,

            value:
                null,

            errors
        });
    }
}

export default Object.freeze({
    version:
        RECOMMENDATION_EVALUATOR_VERSION,

    operators:
        SUPPORTED_CONDITION_OPERATORS,

    validateRecommendationCatalog,
    evaluateRecommendationRules,
    evaluateRecommendationRulesSafely
});
