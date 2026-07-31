/**
 * GrowWithHR Legal Rule Assurance
 *
 * Legal-specific validation and evaluation wrapper around the existing M2
 * deterministic fact mapper, recommendation evaluator and traceability
 * contract. This module has no DOM, browser-storage, network, retrieval,
 * language-model, PDF, email or delivery side effects.
 */

import {
    APPLICABILITY_STATUSES
} from "./traceability-contract.js";

import {
    createTraceabilityFacts
} from "./fact-mapper.js";

import {
    evaluateRecommendationRules,
    validateRecommendationCatalog
} from "./recommendation-evaluator.js";

export const LEGAL_RULE_ASSURANCE_VERSION =
    "0.1.0";

export const LEGAL_REVIEW_STATUSES =
    Object.freeze([
        "needs-legal-review",
        "under-legal-review",
        "legally-approved",
        "superseded"
    ]);

const DATE_PATTERN =
    /^\d{4}-\d{2}-\d{2}$/;

const REGISTRY_SOURCE_ID_PATTERN =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function uniqueTexts(values) {
    return [
        ...new Set(
            asArray(values)
                .map(cleanText)
                .filter(Boolean)
        )
    ];
}

function deepFreeze(value) {
    if (
        !value ||
        typeof value !== "object" ||
        Object.isFrozen(value)
    ) {
        return value;
    }

    Object.freeze(value);

    for (
        const nestedValue
        of Object.values(value)
    ) {
        deepFreeze(
            nestedValue
        );
    }

    return value;
}

function cloneJson(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
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
            "Legal rule assurance validation failed."
    });
}

export class LegalRuleAssuranceError
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
                : "Legal rule assurance validation failed."
        );

        this.name =
            "LegalRuleAssuranceError";

        this.issues =
            normalized;
    }
}

function isValidDate(value) {
    const text =
        cleanText(value);

    if (!DATE_PATTERN.test(text)) {
        return false;
    }

    const timestamp =
        Date.parse(
            `${text}T00:00:00Z`
        );

    return (
        Number.isFinite(timestamp) &&
        new Date(timestamp)
            .toISOString()
            .slice(0, 10) ===
            text
    );
}

function validateCatalogBoundary(
    catalog,
    issues
) {
    if (
        catalog.legalRuleCatalog !==
        true
    ) {
        issues.push(
            createIssue(
                "/legalRuleCatalog",
                "Legal rule catalogs must be explicitly identified."
            )
        );
    }

    if (
        catalog.applicabilityAuthority !==
        "deterministic-only"
    ) {
        issues.push(
            createIssue(
                "/applicabilityAuthority",
                "Applicability authority must remain deterministic-only."
            )
        );
    }

    if (
        catalog.retrievalRole !==
        "source-retrieval-only"
    ) {
        issues.push(
            createIssue(
                "/retrievalRole",
                "Retrieval must be limited to registered-source retrieval."
            )
        );
    }

    if (
        catalog.llmRole !==
        "explanation-only"
    ) {
        issues.push(
            createIssue(
                "/llmRole",
                "Language-model use must be limited to explanation."
            )
        );
    }

    const legalReviewStatus =
        cleanText(
            catalog.legalReviewStatus
        );

    if (
        !LEGAL_REVIEW_STATUSES.includes(
            legalReviewStatus
        )
    ) {
        issues.push(
            createIssue(
                "/legalReviewStatus",
                `Legal review status must be one of: ${LEGAL_REVIEW_STATUSES.join(", ")}.`
            )
        );
    }

    const approval =
        asObject(
            catalog.approval
        );

    if (
        legalReviewStatus ===
        "legally-approved"
    ) {
        if (
            approval.status !==
            "approved"
        ) {
            issues.push(
                createIssue(
                    "/approval/status",
                    "A legally approved catalog must have approved governance status."
                )
            );
        }

        if (!cleanText(approval.approvedBy)) {
            issues.push(
                createIssue(
                    "/approval/approvedBy",
                    "A legally approved catalog must identify the approver."
                )
            );
        }

        if (!cleanText(approval.approvedAt)) {
            issues.push(
                createIssue(
                    "/approval/approvedAt",
                    "A legally approved catalog must include an approval timestamp."
                )
            );
        }
    }
}

function validateSources(
    catalog,
    issues
) {
    const sourceById =
        new Map();

    const sourceByRegistryId =
        new Map();

    asArray(
        catalog.sources
    ).forEach(
        (
            sourceValue,
            index
        ) => {
            const source =
                asObject(
                    sourceValue
                );

            const path =
                `/sources/${index}`;

            const sourceId =
                cleanText(
                    source.id
                );

            const registrySourceId =
                cleanText(
                    source.registrySourceId
                );

            if (sourceId) {
                sourceById.set(
                    sourceId,
                    source
                );
            }

            if (
                !REGISTRY_SOURCE_ID_PATTERN.test(
                    registrySourceId
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/registrySourceId`,
                        "A stable lower-case Source Register ID is required."
                    )
                );
            } else if (
                sourceByRegistryId.has(
                    registrySourceId
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/registrySourceId`,
                        `Source Register ID "${registrySourceId}" is duplicated.`
                    )
                );
            } else {
                sourceByRegistryId.set(
                    registrySourceId,
                    source
                );
            }

            if (
                source.official !==
                true
            ) {
                issues.push(
                    createIssue(
                        `${path}/official`,
                        "Legal applicability sources must be marked official."
                    )
                );
            }

            if (
                cleanText(
                    source.reviewStatus
                ) !==
                "needs-legal-review"
            ) {
                issues.push(
                    createIssue(
                        `${path}/reviewStatus`,
                        "The provisional POSH source pack must remain needs-legal-review."
                    )
                );
            }

            for (
                const property
                of [
                    "fileName",
                    "drivePath",
                    "documentType"
                ]
            ) {
                if (!cleanText(source[property])) {
                    issues.push(
                        createIssue(
                            `${path}/${property}`,
                            "A non-empty source-governance value is required."
                        )
                    );
                }
            }
        }
    );

    return {
        sourceById,
        sourceByRegistryId
    };
}

function validateRule(
    ruleValue,
    ruleIndex,
    catalog,
    registries,
    issues
) {
    const rule =
        asObject(
            ruleValue
        );

    const path =
        `/rules/${ruleIndex}`;

    if (!cleanText(rule.productRuleId)) {
        issues.push(
            createIssue(
                `${path}/productRuleId`,
                "A stable product rule ID is required."
            )
        );
    }

    if (!cleanText(rule.sourceRecordId)) {
        issues.push(
            createIssue(
                `${path}/sourceRecordId`,
                "The governed compliance-law source record ID is required."
            )
        );
    }

    const legalReviewStatus =
        cleanText(
            rule.legalReviewStatus
        );

    if (
        !LEGAL_REVIEW_STATUSES.includes(
            legalReviewStatus
        )
    ) {
        issues.push(
            createIssue(
                `${path}/legalReviewStatus`,
                `Legal review status must be one of: ${LEGAL_REVIEW_STATUSES.join(", ")}.`
            )
        );
    }

    if (
        legalReviewStatus !==
        cleanText(
            catalog.legalReviewStatus
        )
    ) {
        issues.push(
            createIssue(
                `${path}/legalReviewStatus`,
                "Rule and catalog legal-review status must match."
            )
        );
    }

    const requiredFactIds =
        uniqueTexts(
            rule.requiredFactIds
        );

    const requiredAssessmentFacts =
        asArray(
            rule.requiredAssessmentFacts
        );

    const assessmentFactIds =
        uniqueTexts(
            requiredAssessmentFacts.map(
                (fact) =>
                    asObject(fact).factId
            )
        );

    if (
        requiredFactIds.length !==
            assessmentFactIds.length ||
        requiredFactIds.some(
            (identifier) =>
                !assessmentFactIds.includes(
                    identifier
                )
        )
    ) {
        issues.push(
            createIssue(
                `${path}/requiredAssessmentFacts`,
                "Required assessment facts must map one-to-one to requiredFactIds."
            )
        );
    }

    requiredAssessmentFacts.forEach(
        (
            factValue,
            factIndex
        ) => {
            const fact =
                asObject(
                    factValue
                );

            const factPath =
                `${path}/requiredAssessmentFacts/${factIndex}`;

            if (!cleanText(fact.sourceAssessmentField)) {
                issues.push(
                    createIssue(
                        `${factPath}/sourceAssessmentField`,
                        "The protected assessment field is required."
                    )
                );
            }

            if (
                fact.required !==
                true
            ) {
                issues.push(
                    createIssue(
                        `${factPath}/required`,
                        "Provisional legal-rule facts must be explicitly required."
                    )
                );
            }
        }
    );

    const missingInformationHandling =
        asObject(
            rule.missingInformationHandling
        );

    if (
        missingInformationHandling.defaultStatus !==
        "more-information-needed"
    ) {
        issues.push(
            createIssue(
                `${path}/missingInformationHandling/defaultStatus`,
                "Missing information must produce more-information-needed."
            )
        );
    }

    if (
        missingInformationHandling.neverInferMissingFacts !==
        true
    ) {
        issues.push(
            createIssue(
                `${path}/missingInformationHandling/neverInferMissingFacts`,
                "Missing legal facts must never be inferred."
            )
        );
    }

    if (
        missingInformationHandling.allowRetrievalToFillFacts !==
        false
    ) {
        issues.push(
            createIssue(
                `${path}/missingInformationHandling/allowRetrievalToFillFacts`,
                "Retrieval must not fill assessment facts."
            )
        );
    }

    if (
        missingInformationHandling.allowLlmToFillFacts !==
        false
    ) {
        issues.push(
            createIssue(
                `${path}/missingInformationHandling/allowLlmToFillFacts`,
                "A language model must not fill assessment facts."
            )
        );
    }

    const permittedStatuses =
        uniqueTexts(
            rule.permittedResultStatuses
        );

    if (
        permittedStatuses.length ===
        0
    ) {
        issues.push(
            createIssue(
                `${path}/permittedResultStatuses`,
                "At least one permitted result status is required."
            )
        );
    }

    permittedStatuses.forEach(
        (
            status,
            statusIndex
        ) => {
            if (
                !APPLICABILITY_STATUSES.includes(
                    status
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/permittedResultStatuses/${statusIndex}`,
                        `Status must be one of: ${APPLICABILITY_STATUSES.join(", ")}.`
                    )
                );
            }
        }
    );

    const outcomes =
        asObject(
            rule.outcomes
        );

    for (
        const outcomeName
        of [
            "matched",
            "notMatched",
            "missing"
        ]
    ) {
        const outcome =
            asObject(
                outcomes[outcomeName]
            );

        if (
            !permittedStatuses.includes(
                cleanText(
                    outcome.status
                )
            )
        ) {
            issues.push(
                createIssue(
                    `${path}/outcomes/${outcomeName}/status`,
                    "Outcome status must be listed in permittedResultStatuses."
                )
            );
        }

        if (!cleanText(outcome.reasonCode)) {
            issues.push(
                createIssue(
                    `${path}/outcomes/${outcomeName}/reasonCode`,
                    "A stable machine-readable reason code is required."
                )
            );
        }
    }

    if (
        legalReviewStatus !==
            "legally-approved" &&
        [
            "applicable",
            "likely-applicable"
        ].includes(
            cleanText(
                asObject(
                    outcomes.matched
                ).status
            )
        )
    ) {
        issues.push(
            createIssue(
                `${path}/outcomes/matched/status`,
                "A rule that is not legally approved cannot emit applicable or likely-applicable."
            )
        );
    }

    const officialSourceIds =
        uniqueTexts(
            rule.officialSourceIds
        );

    if (
        officialSourceIds.length ===
        0
    ) {
        issues.push(
            createIssue(
                `${path}/officialSourceIds`,
                "At least one Source Register ID is required."
            )
        );
    }

    officialSourceIds.forEach(
        (
            registrySourceId,
            sourceIndex
        ) => {
            if (
                !registries.sourceByRegistryId.has(
                    registrySourceId
                )
            ) {
                issues.push(
                    createIssue(
                        `${path}/officialSourceIds/${sourceIndex}`,
                        `Source Register ID "${registrySourceId}" is not declared by a catalog source.`
                    )
                );
            }
        }
    );

    asArray(
        rule.sourceSections
    ).forEach(
        (
            sectionValue,
            sectionIndex
        ) => {
            const section =
                asObject(
                    sectionValue
                );

            const sectionPath =
                `${path}/sourceSections/${sectionIndex}`;

            if (
                !registries.sourceByRegistryId.has(
                    cleanText(
                        section.registrySourceId
                    )
                )
            ) {
                issues.push(
                    createIssue(
                        `${sectionPath}/registrySourceId`,
                        "Source section must resolve to a registered source."
                    )
                );
            }

            if (!cleanText(section.reference)) {
                issues.push(
                    createIssue(
                        `${sectionPath}/reference`,
                        "A source-section reference is required."
                    )
                );
            }
        }
    );

    const effectiveDateMetadata =
        asObject(
            rule.effectiveDateMetadata
        );

    if (
        !isValidDate(
            effectiveDateMetadata.effectiveFrom
        )
    ) {
        issues.push(
            createIssue(
                `${path}/effectiveDateMetadata/effectiveFrom`,
                "A valid effective-from date is required."
            )
        );
    }

    if (
        effectiveDateMetadata.effectiveTo !==
            null &&
        !isValidDate(
            effectiveDateMetadata.effectiveTo
        )
    ) {
        issues.push(
            createIssue(
                `${path}/effectiveDateMetadata/effectiveTo`,
                "Effective-to must be null or a valid date."
            )
        );
    }

    if (
        !registries.sourceByRegistryId.has(
            cleanText(
                effectiveDateMetadata.sourceRegistryId
            )
        )
    ) {
        issues.push(
            createIssue(
                `${path}/effectiveDateMetadata/sourceRegistryId`,
                "Effective-date metadata must resolve to a registered source."
            )
        );
    }

    const scenarios =
        asArray(
            rule.automatedBoundaryTestScenarios
        );

    if (
        scenarios.length ===
        0
    ) {
        issues.push(
            createIssue(
                `${path}/automatedBoundaryTestScenarios`,
                "At least one automated boundary-test scenario is required."
            )
        );
    }

    scenarios.forEach(
        (
            scenarioValue,
            scenarioIndex
        ) => {
            const scenario =
                asObject(
                    scenarioValue
                );

            const scenarioPath =
                `${path}/automatedBoundaryTestScenarios/${scenarioIndex}`;

            if (!cleanText(scenario.scenarioId)) {
                issues.push(
                    createIssue(
                        `${scenarioPath}/scenarioId`,
                        "A stable scenario ID is required."
                    )
                );
            }

            if (
                !permittedStatuses.includes(
                    cleanText(
                        scenario.expectedStatus
                    )
                )
            ) {
                issues.push(
                    createIssue(
                        `${scenarioPath}/expectedStatus`,
                        "Expected status must be permitted by the rule."
                    )
                );
            }

            if (!cleanText(scenario.expectedReasonCode)) {
                issues.push(
                    createIssue(
                        `${scenarioPath}/expectedReasonCode`,
                        "An expected reason code is required."
                    )
                );
            }

            if (
                !scenario.answers ||
                typeof scenario.answers !==
                    "object" ||
                Array.isArray(
                    scenario.answers
                )
            ) {
                issues.push(
                    createIssue(
                        `${scenarioPath}/answers`,
                        "Scenario answers must be an object."
                    )
                );
            }
        }
    );
}

export function validateLegalRuleCatalog(
    catalogValue
) {
    const catalog =
        asObject(
            catalogValue
        );

    const baseValidation =
        validateRecommendationCatalog(
            catalog
        );

    const issues = [
        ...baseValidation.errors
    ];

    validateCatalogBoundary(
        catalog,
        issues
    );

    const registries =
        validateSources(
            catalog,
            issues
        );

    asArray(
        catalog.rules
    ).forEach(
        (
            rule,
            index
        ) =>
            validateRule(
                rule,
                index,
                catalog,
                registries,
                issues
            )
    );

    const errors =
        Object.freeze(
            issues.map(
                (issue) =>
                    createIssue(
                        issue.path,
                        issue.message
                    )
            )
        );

    return Object.freeze({
        valid:
            errors.length ===
            0,

        errors
    });
}

function assertLegalRuleCatalog(
    catalog
) {
    const validation =
        validateLegalRuleCatalog(
            catalog
        );

    if (!validation.valid) {
        throw new LegalRuleAssuranceError(
            validation.errors
        );
    }

    return catalog;
}

function buildDecisions(
    catalog,
    traceability
) {
    const ruleById =
        new Map(
            asArray(
                catalog.rules
            ).map(
                (rule) => [
                    rule.id,
                    rule
                ]
            )
        );

    const sourceById =
        new Map(
            asArray(
                catalog.sources
            ).map(
                (source) => [
                    source.id,
                    source
                ]
            )
        );

    return traceability.ruleEvaluations.map(
        (evaluation) => {
            const rule =
                asObject(
                    ruleById.get(
                        evaluation.ruleId
                    )
                );

            const outcomeName =
                cleanText(
                    asObject(
                        evaluation.metadata
                    ).outcome
                );

            const outcome =
                asObject(
                    asObject(
                        rule.outcomes
                    )[outcomeName]
                );

            const registrySourceIds =
                uniqueTexts(
                    asArray(
                        evaluation.sourceIds
                    ).map(
                        (sourceId) =>
                            asObject(
                                sourceById.get(
                                    sourceId
                                )
                            ).registrySourceId
                    )
                );

            return deepFreeze({
                productRuleId:
                    cleanText(
                        rule.productRuleId
                    ),

                ruleId:
                    evaluation.ruleId,

                ruleVersion:
                    evaluation.ruleVersion,

                sourceRecordId:
                    cleanText(
                        rule.sourceRecordId
                    ),

                status:
                    evaluation.status,

                reasonCode:
                    cleanText(
                        outcome.reasonCode
                    ),

                reason:
                    evaluation.reason,

                requiredFactIds:
                    evaluation.requiredFactIds,

                triggeringFactIds:
                    evaluation.triggeringFactIds,

                missingFactIds:
                    evaluation.missingFactIds,

                sourceIds:
                    evaluation.sourceIds,

                sourceRegistryIds:
                    registrySourceIds,

                sourceSections:
                    cloneJson(
                        rule.sourceSections
                    ),

                effectiveDateMetadata:
                    cloneJson(
                        rule.effectiveDateMetadata
                    ),

                legalReviewStatus:
                    cleanText(
                        rule.legalReviewStatus
                    ),

                limitations:
                    uniqueTexts(
                        rule.limitations
                    )
            });
        }
    );
}

/**
 * Maps protected assessment answers to confirmed/derived facts, evaluates the
 * legal catalog through the existing deterministic evaluator and returns a
 * legal-assurance envelope. All timestamps must be supplied by the caller.
 *
 * @param {Object} input
 * @param {Object} input.answers
 * @param {Object} input.catalog
 * @param {string} input.evaluatedAt
 * @returns {Object}
 */
export function evaluateLegalRuleAssurance(
    input = {}
) {
    const source =
        asObject(
            input
        );

    const catalog =
        assertLegalRuleCatalog(
            source.catalog
        );

    const evaluatedAt =
        cleanText(
            source.evaluatedAt
        );

    const facts =
        createTraceabilityFacts(
            asObject(
                source.answers
            ),
            {
                recordedAt:
                    evaluatedAt
            }
        );

    const traceability =
        evaluateRecommendationRules({
            facts,
            catalog,
            evaluatedAt,
            generatedAt:
                evaluatedAt,
            limitations: [
                "Legal applicability is determined only by the governed deterministic catalog and supplied assessment facts.",
                "Retrieval and language-model output cannot change this result."
            ],
            metadata: {
                assuranceVersion:
                    LEGAL_RULE_ASSURANCE_VERSION,
                legalRuleCatalog:
                    true,
                applicabilityAuthority:
                    "deterministic-only",
                retrievalRole:
                    "source-retrieval-only",
                llmRole:
                    "explanation-only"
            }
        });

    return deepFreeze({
        assuranceVersion:
            LEGAL_RULE_ASSURANCE_VERSION,

        evaluatedAt,

        legalReviewStatus:
            cleanText(
                catalog.legalReviewStatus
            ),

        applicabilityAuthority:
            "deterministic-only",

        retrievalRole:
            "source-retrieval-only",

        llmRole:
            "explanation-only",

        decisions:
            buildDecisions(
                catalog,
                traceability
            ),

        traceability
    });
}

export function evaluateLegalRuleAssuranceSafely(
    input = {}
) {
    try {
        return Object.freeze({
            valid:
                true,

            value:
                evaluateLegalRuleAssurance(
                    input
                ),

            errors:
                Object.freeze([])
        });
    } catch (error) {
        const errors =
            error instanceof
                LegalRuleAssuranceError
                ? error.issues
                : Object.freeze([
                    createIssue(
                        "/",
                        error?.message ||
                        "Unknown legal rule assurance error."
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
        LEGAL_RULE_ASSURANCE_VERSION,

    legalReviewStatuses:
        LEGAL_REVIEW_STATUSES,

    validateLegalRuleCatalog,
    evaluateLegalRuleAssurance,
    evaluateLegalRuleAssuranceSafely
});
