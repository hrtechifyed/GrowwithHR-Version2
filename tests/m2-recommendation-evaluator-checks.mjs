/**
 * GrowWithHR Compliance DNA
 * M2 Recommendation Evaluator Checks
 *
 * Validates:
 * - protected assessment answers map to confirmed facts;
 * - derived facts remain deterministic and traceable;
 * - the governed rule catalog is valid;
 * - applicable recommendations explain their triggering facts;
 * - missing information is represented explicitly;
 * - not-currently-applicable outcomes remain distinct;
 * - evidence defaults remain conservative;
 * - structured sources resolve correctly;
 * - output is deterministic and deeply frozen;
 * - stable report and persistence contracts remain untouched;
 * - evaluator modules contain no browser or delivery side effects.
 */

import assert from "node:assert/strict";

import {
    mkdtemp,
    readFile,
    rm,
    writeFile
} from "node:fs/promises";

import {
    tmpdir
} from "node:os";

import path from "node:path";

import {
    fileURLToPath,
    pathToFileURL
} from "node:url";

const TEST_FILE =
    fileURLToPath(
        import.meta.url
    );

const TEST_DIRECTORY =
    path.dirname(
        TEST_FILE
    );

const PROJECT_ROOT =
    path.resolve(
        TEST_DIRECTORY,
        ".."
    );

const CONTRACT_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "traceability-contract.js"
    );

const FACT_MAPPER_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "fact-mapper.js"
    );

const EVALUATOR_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "recommendation-evaluator.js"
    );

const CATALOG_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "assessment",
        "recommendation-rules.v1.json"
    );

const FIXED_DATE_TIME =
    "2026-07-21T00:00:00.000Z";

const EXPECTED_CONTRACT_VERSION =
    "1.0.0";

const EXPECTED_CATALOG_VERSION =
    "1.0.0";

const EXPECTED_RULE_COUNT =
    7;

function clone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function indexBy(
    records,
    property
) {
    return new Map(
        records.map(
            (record) => [
                record[property],
                record
            ]
        )
    );
}

function assertIssue(
    result,
    expectedPath,
    message
) {
    assert.equal(
        result.valid,
        false,
        message
    );

    assert(
        result.errors.some(
            (error) =>
                error.path ===
                expectedPath
        ),
        [
            message,
            `Expected issue path: ${expectedPath}`,
            "Actual issues:",
            JSON.stringify(
                result.errors,
                null,
                2
            )
        ].join("\n")
    );
}

function rewriteContractImport(
    source
) {
    return source
        .replaceAll(
            "\"./traceability-contract.js\"",
            "\"./traceability-contract.mjs\""
        )
        .replaceAll(
            "'./traceability-contract.js'",
            "'./traceability-contract.mjs'"
        );
}

async function loadModules() {
    const temporaryDirectory =
        await mkdtemp(
            path.join(
                tmpdir(),
                "growwithhr-m2-evaluator-"
            )
        );

    const contractSource =
        await readFile(
            CONTRACT_PATH,
            "utf8"
        );

    const factMapperSource =
        await readFile(
            FACT_MAPPER_PATH,
            "utf8"
        );

    const evaluatorSource =
        await readFile(
            EVALUATOR_PATH,
            "utf8"
        );

    const contractModulePath =
        path.join(
            temporaryDirectory,
            "traceability-contract.mjs"
        );

    const factMapperModulePath =
        path.join(
            temporaryDirectory,
            "fact-mapper.mjs"
        );

    const evaluatorModulePath =
        path.join(
            temporaryDirectory,
            "recommendation-evaluator.mjs"
        );

    await writeFile(
        contractModulePath,
        contractSource,
        "utf8"
    );

    await writeFile(
        factMapperModulePath,
        rewriteContractImport(
            factMapperSource
        ),
        "utf8"
    );

    await writeFile(
        evaluatorModulePath,
        rewriteContractImport(
            evaluatorSource
        ),
        "utf8"
    );

    const [
        contract,
        factMapper,
        evaluator
    ] =
        await Promise.all([
            import(
                pathToFileURL(
                    contractModulePath
                ).href
            ),

            import(
                pathToFileURL(
                    factMapperModulePath
                ).href
            ),

            import(
                pathToFileURL(
                    evaluatorModulePath
                ).href
            )
        ]);

    return {
        temporaryDirectory,
        contractSource,
        factMapperSource,
        evaluatorSource,
        contract,
        factMapper,
        evaluator
    };
}

function createApplicableAnswers() {
    return {
        employees:
            32,

        contractWorkers:
            4,

        interns:
            2,

        apprentices:
            1,

        workModel:
            "Hybrid",

        remoteBand:
            "25-50",

        primaryState:
            "Maharashtra",

        locations:
            3,

        countries:
            1,

        hiringPlans:
            "Significant Growth",

        expansionPlans: [
            "new-locations",
            "scale-operations"
        ],

        peopleFunction:
            "Founder Led",

        priorities: [
            "policies-compliance",
            "workforce-planning"
        ]
    };
}

function createNotApplicableAnswers() {
    return {
        employees:
            0,

        workModel:
            "Office Based",

        remoteBand:
            "0",

        primaryState:
            "Maharashtra",

        locations:
            1,

        countries:
            1,

        hiringPlans:
            "Maintain Current Size",

        expansionPlans: [
            "no-major-expansion"
        ],

        peopleFunction:
            "Dedicated HR Team",

        priorities: [
            "hiring-onboarding"
        ]
    };
}

async function main() {
    const loaded =
        await loadModules();

    try {
        const {
            contractSource,
            factMapperSource,
            evaluatorSource,
            factMapper,
            evaluator
        } =
            loaded;

        const catalog =
            JSON.parse(
                await readFile(
                    CATALOG_PATH,
                    "utf8"
                )
            );

        /* ======================================================
           Module and catalog identity
        ====================================================== */

        assert.equal(
            factMapper
                .FACT_MAPPER_VERSION,
            "1.0.0",
            "The fact-mapper version must remain stable."
        );

        assert.equal(
            evaluator
                .RECOMMENDATION_EVALUATOR_VERSION,
            "1.0.0",
            "The recommendation-evaluator version must remain stable."
        );

        assert.equal(
            catalog.catalogVersion,
            EXPECTED_CATALOG_VERSION,
            "The governed catalog version must remain stable."
        );

        assert.equal(
            catalog.advisoryOnly,
            true,
            "The M2 catalog must remain advisory-only."
        );

        assert.equal(
            catalog.privateBetaOnly,
            true,
            "The M2 catalog must remain private-beta-only."
        );

        assert.equal(
            catalog.stableReportMutation,
            false,
            "The M2 catalog must not mutate protected report output."
        );

        assert.equal(
            catalog.rules.length,
            EXPECTED_RULE_COUNT,
            "The representative M2 catalog must contain seven governed rules."
        );

        const catalogValidation =
            evaluator
                .validateRecommendationCatalog(
                    catalog
                );

        assert.deepEqual(
            catalogValidation,
            {
                valid:
                    true,

                errors:
                    Object.freeze([])
            },
            "The committed rule catalog must pass evaluator validation."
        );

        /* ======================================================
           Side-effect boundary
        ====================================================== */

        const prohibitedRuntimePatterns = [
            /\bdocument\b/,
            /\bwindow\b/,
            /\blocalStorage\b/,
            /\bsessionStorage\b/,
            /\bXMLHttpRequest\b/,
            /\bfetch\s*\(/,
            /\bsetTimeout\s*\(/,
            /\bsetInterval\s*\(/,
            /\bDate\.now\s*\(/,
            /\bnew\s+Date\s*\(\s*\)/
        ];

        for (
            const [
                moduleName,
                source
            ]
            of [
                [
                    "fact mapper",
                    factMapperSource
                ],
                [
                    "recommendation evaluator",
                    evaluatorSource
                ]
            ]
        ) {
            for (
                const pattern
                of prohibitedRuntimePatterns
            ) {
                assert.equal(
                    pattern.test(
                        source
                    ),
                    false,
                    `${moduleName} must not contain prohibited runtime reference ${pattern}.`
                );
            }

            assert.equal(
                source.includes(
                    "growwithhr-advisory-briefing-v2"
                ),
                false,
                `${moduleName} must not access the protected progress key.`
            );

            assert.equal(
                source.includes(
                    "growwithhr-report"
                ),
                false,
                `${moduleName} must not access the protected report key.`
            );

            assert.equal(
                source.includes(
                    "growwithhr-lead"
                ),
                false,
                `${moduleName} must not access the protected lead key.`
            );

            assert.equal(
                source.includes(
                    "growwithhr-advisory-delivery-v1"
                ),
                false,
                `${moduleName} must not access the protected delivery key.`
            );
        }

        assert.equal(
            contractSource.includes(
                "localStorage"
            ),
            false,
            "The traceability contract must remain free from storage access."
        );

        /* ======================================================
           Applicable assessment facts
        ====================================================== */

        const applicableAnswers =
            createApplicableAnswers();

        const applicableAnswersSnapshot =
            clone(
                applicableAnswers
            );

        const applicableFacts =
            factMapper
                .createTraceabilityFacts(
                    applicableAnswers,
                    {
                        recordedAt:
                            FIXED_DATE_TIME
                    }
                );

        assert.deepEqual(
            applicableAnswers,
            applicableAnswersSnapshot,
            "Fact mapping must not mutate protected assessment answers."
        );

        assert.equal(
            applicableFacts
                .confirmed
                .length,
            13,
            "The representative assessment must create thirteen confirmed facts."
        );

        assert.equal(
            applicableFacts
                .derived
                .length,
            8,
            "The representative assessment must create eight derived facts."
        );

        assert.equal(
            Object.isFrozen(
                applicableFacts
            ),
            true,
            "The fact collection must be frozen."
        );

        assert.equal(
            Object.isFrozen(
                applicableFacts.confirmed
            ),
            true,
            "The confirmed-fact collection must be frozen."
        );

        assert.equal(
            Object.isFrozen(
                applicableFacts.derived
            ),
            true,
            "The derived-fact collection must be frozen."
        );

        const confirmedFactIndex =
            indexBy(
                applicableFacts.confirmed,
                "id"
            );

        const derivedFactIndex =
            indexBy(
                applicableFacts.derived,
                "id"
            );

        assert.equal(
            confirmedFactIndex
                .get(
                    "fact.workforce.employee-count"
                )
                .value,
            32
        );

        assert.equal(
            confirmedFactIndex
                .get(
                    "fact.footprint.primary-state"
                )
                .value,
            "Maharashtra"
        );

        assert.deepEqual(
            confirmedFactIndex
                .get(
                    "fact.people.priorities"
                )
                .value,
            [
                "policies-compliance",
                "workforce-planning"
            ]
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.workforce.total-reported-workforce"
                )
                .value,
            39,
            "Reported workforce must include employees, contractors, interns and apprentices."
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.workforce.size-band"
                )
                .value,
            "20-49"
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.footprint.multi-location"
                )
                .value,
            true
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.footprint.multi-country"
                )
                .value,
            false
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.workforce.distributed-workforce"
                )
                .value,
            true
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.growth.rapid-growth"
                )
                .value,
            true
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.growth.expansion-activity"
                )
                .value,
            true
        );

        assert.equal(
            derivedFactIndex
                .get(
                    "fact.people.formal-people-function"
                )
                .value,
            false
        );

        for (
            const fact
            of applicableFacts.derived
        ) {
            assert(
                fact.derivedFrom.length >
                    0,
                `${fact.id} must identify the facts used in its derivation.`
            );

            assert.equal(
                fact.metadata
                    .deterministic,
                true,
                `${fact.id} must be marked deterministic.`
            );
        }

        /* ======================================================
           Applicable recommendation evaluation
        ====================================================== */

        const catalogSnapshot =
            clone(
                catalog
            );

        const applicableBundle =
            evaluator
                .evaluateRecommendationRules({
                    facts:
                        applicableFacts,

                    catalog,

                    evaluatedAt:
                        FIXED_DATE_TIME,

                    generatedAt:
                        FIXED_DATE_TIME,

                    metadata: {
                        fixture:
                            "applicable"
                    }
                });

        assert.deepEqual(
            catalog,
            catalogSnapshot,
            "Rule evaluation must not mutate the governed catalog."
        );

        assert.equal(
            applicableBundle
                .contractVersion,
            EXPECTED_CONTRACT_VERSION
        );

        assert.equal(
            applicableBundle
                .ruleEvaluations
                .length,
            EXPECTED_RULE_COUNT
        );

        assert.equal(
            applicableBundle
                .recommendations
                .length,
            EXPECTED_RULE_COUNT,
            "Every representative applicable rule must create a recommendation."
        );

        assert.equal(
            applicableBundle
                .sources
                .length,
            2
        );

        assert.equal(
            applicableBundle
                .metadata
                .stableReportMutation,
            false
        );

        assert.equal(
            applicableBundle
                .metadata
                .advisoryOnly,
            true
        );

        assert.equal(
            applicableBundle
                .metadata
                .privateBetaOnly,
            true
        );

        assert.equal(
            Object.isFrozen(
                applicableBundle
            ),
            true,
            "The traceability bundle must be frozen."
        );

        assert.equal(
            Object.isFrozen(
                applicableBundle
                    .ruleEvaluations[0]
            ),
            true,
            "Rule evaluations must be frozen."
        );

        assert.equal(
            Object.isFrozen(
                applicableBundle
                    .recommendations[0]
            ),
            true,
            "Recommendations must be frozen."
        );

        const applicableRuleIndex =
            indexBy(
                applicableBundle
                    .ruleEvaluations,
                "ruleId"
            );

        for (
            const evaluation
            of applicableBundle
                .ruleEvaluations
        ) {
            assert.equal(
                evaluation.status,
                "applicable",
                `${evaluation.ruleId} must evaluate as applicable in the representative scenario.`
            );

            assert(
                evaluation
                    .triggeringFactIds
                    .length >
                    0,
                `${evaluation.ruleId} must identify its triggering facts.`
            );

            assert.equal(
                evaluation
                    .missingFactIds
                    .length,
                0
            );

            assert(
                evaluation
                    .sourceIds
                    .length >
                    0,
                `${evaluation.ruleId} must reference a structured source.`
            );
        }

        const expectedRecommendationIds = [
            "recommendation.governance.review-state-specific-requirements",
            "recommendation.governance.review-employment-documentation",
            "recommendation.workplace.review-multi-location-practices",
            "recommendation.workforce.review-distributed-work-practices",
            "recommendation.growth.create-workforce-plan",
            "recommendation.people.assign-governance-owner",
            "recommendation.people.review-policy-framework"
        ].sort();

        assert.deepEqual(
            applicableBundle
                .recommendations
                .map(
                    (recommendation) =>
                        recommendation.id
                )
                .sort(),
            expectedRecommendationIds
        );

        for (
            const recommendation
            of applicableBundle
                .recommendations
        ) {
            const evaluation =
                applicableRuleIndex.get(
                    recommendation.ruleId
                );

            assert(
                evaluation,
                `${recommendation.id} must resolve to its rule evaluation.`
            );

            assert.equal(
                recommendation
                    .applicabilityStatus,
                evaluation.status
            );

            assert.deepEqual(
                recommendation
                    .triggeringFactIds,
                evaluation
                    .triggeringFactIds
            );

            assert.deepEqual(
                recommendation
                    .missingFactIds,
                evaluation
                    .missingFactIds
            );

            assert.equal(
                recommendation
                    .evidence
                    .status,
                "not-requested",
                "M2 must use the conservative evidence default."
            );

            assert.equal(
                recommendation
                    .evidence
                    .verificationProcessId,
                null
            );

            assert.equal(
                recommendation
                    .evidence
                    .verifiedAt,
                null
            );

            assert(
                recommendation
                    .limitations
                    .includes(
                        "This advisory result is not legal certification."
                    ),
                `${recommendation.id} must retain the advisory limitation.`
            );
        }

        assert.equal(
            hasOwnProperty.call(
                applicableBundle,
                "report"
            ),
            false,
            "M2 traceability must not introduce a stable report property."
        );

        assert.equal(
            hasOwnProperty.call(
                applicableBundle,
                "pdf"
            ),
            false,
            "M2 traceability must not introduce a PDF property."
        );

        /* ======================================================
           Determinism
        ====================================================== */

        const repeatedApplicableBundle =
            evaluator
                .evaluateRecommendationRules({
                    facts:
                        applicableFacts,

                    catalog,

                    evaluatedAt:
                        FIXED_DATE_TIME,

                    generatedAt:
                        FIXED_DATE_TIME,

                    metadata: {
                        fixture:
                            "applicable"
                    }
                });

        assert.deepEqual(
            repeatedApplicableBundle,
            applicableBundle,
            "Identical inputs and timestamps must produce identical output."
        );

        /* ======================================================
           Missing-information scenario
        ====================================================== */

        const missingFacts =
            factMapper
                .createTraceabilityFacts(
                    {},
                    {
                        recordedAt:
                            FIXED_DATE_TIME
                    }
                );

        const missingBundle =
            evaluator
                .evaluateRecommendationRules({
                    facts:
                        missingFacts,

                    catalog,

                    evaluatedAt:
                        FIXED_DATE_TIME
                });

        assert.equal(
            missingBundle
                .ruleEvaluations
                .length,
            EXPECTED_RULE_COUNT
        );

        assert.equal(
            missingBundle
                .recommendations
                .length,
            6,
            "Six missing-information outcomes provide a follow-up recommendation."
        );

        for (
            const evaluation
            of missingBundle
                .ruleEvaluations
        ) {
            assert.equal(
                evaluation.status,
                "more-information-needed",
                `${evaluation.ruleId} must represent absent required information explicitly.`
            );

            assert(
                evaluation
                    .missingFactIds
                    .length >
                    0,
                `${evaluation.ruleId} must name the missing facts.`
            );
        }

        for (
            const recommendation
            of missingBundle
                .recommendations
        ) {
            assert.equal(
                recommendation
                    .applicabilityStatus,
                "more-information-needed"
            );

            assert(
                recommendation
                    .missingFactIds
                    .length >
                    0,
                `${recommendation.id} must name the missing facts.`
            );

            assert.equal(
                recommendation
                    .evidence
                    .status,
                "not-requested"
            );
        }

        /* ======================================================
           Not-currently-applicable scenario
        ====================================================== */

        const notApplicableFacts =
            factMapper
                .createTraceabilityFacts(
                    createNotApplicableAnswers(),
                    {
                        recordedAt:
                            FIXED_DATE_TIME
                    }
                );

        const notApplicableBundle =
            evaluator
                .evaluateRecommendationRules({
                    facts:
                        notApplicableFacts,

                    catalog,

                    evaluatedAt:
                        FIXED_DATE_TIME
                });

        const notApplicableRuleIndex =
            indexBy(
                notApplicableBundle
                    .ruleEvaluations,
                "ruleId"
            );

        assert.equal(
            notApplicableRuleIndex
                .get(
                    "rule.governance.primary-state.review"
                )
                .status,
            "applicable"
        );

        const expectedNotApplicableRuleIds = [
            "rule.governance.employment-documentation.review",
            "rule.workplace.multi-location.review",
            "rule.workforce.distributed-workforce.review",
            "rule.growth.rapid-change.workforce-planning",
            "rule.people.ownership.formal-function-review",
            "rule.people.priority.policies-compliance"
        ];

        for (
            const ruleId
            of expectedNotApplicableRuleIds
        ) {
            const evaluation =
                notApplicableRuleIndex.get(
                    ruleId
                );

            assert(
                evaluation,
                `${ruleId} must be evaluated.`
            );

            assert.equal(
                evaluation.status,
                "not-currently-applicable"
            );

            assert.equal(
                evaluation
                    .missingFactIds
                    .length,
                0,
                `${ruleId} must not hide missing information behind a not-applicable status.`
            );

            assert(
                evaluation
                    .triggeringFactIds
                    .length >
                    0,
                `${ruleId} must record the facts used to reach the outcome.`
            );
        }

        assert.deepEqual(
            notApplicableBundle
                .recommendations
                .map(
                    (recommendation) =>
                        recommendation.id
                ),
            [
                "recommendation.governance.review-state-specific-requirements"
            ],
            "Not-currently-applicable rules must not create action recommendations."
        );

        /* ======================================================
           Invalid fact values are omitted
        ====================================================== */

        const invalidFacts =
            factMapper
                .createTraceabilityFacts({
                    employees:
                        -1,

                    locations:
                        0,

                    countries:
                        "invalid",

                    remoteExact:
                        101
                });

        const invalidFactIds = [
            ...invalidFacts.confirmed,
            ...invalidFacts.derived
        ].map(
            (fact) =>
                fact.id
        );

        assert.equal(
            invalidFactIds.includes(
                "fact.workforce.employee-count"
            ),
            false
        );

        assert.equal(
            invalidFactIds.includes(
                "fact.footprint.location-count"
            ),
            false
        );

        assert.equal(
            invalidFactIds.includes(
                "fact.footprint.country-count"
            ),
            false
        );

        assert.equal(
            invalidFactIds.includes(
                "fact.workforce.remote-workforce-percentage"
            ),
            false
        );

        /* ======================================================
           Invalid catalog protections
        ====================================================== */

        const mutatingCatalog =
            clone(
                catalog
            );

        mutatingCatalog
            .stableReportMutation =
            true;

        assertIssue(
            evaluator
                .validateRecommendationCatalog(
                    mutatingCatalog
                ),
            "/stableReportMutation",
            "A catalog that mutates stable report output must be rejected."
        );

        const duplicateRuleCatalog =
            clone(
                catalog
            );

        duplicateRuleCatalog
            .rules[1]
            .id =
            duplicateRuleCatalog
                .rules[0]
                .id;

        assertIssue(
            evaluator
                .validateRecommendationCatalog(
                    duplicateRuleCatalog
                ),
            "/rules/1/id",
            "Duplicate rule identifiers must be rejected."
        );

        const invalidOperatorCatalog =
            clone(
                catalog
            );

        invalidOperatorCatalog
            .rules[0]
            .match
            .conditions[0]
            .operator =
            "guess";

        assertIssue(
            evaluator
                .validateRecommendationCatalog(
                    invalidOperatorCatalog
                ),
            "/rules/0/match/conditions/0/operator",
            "Unsupported condition operators must be rejected."
        );

        /* ======================================================
           Safe evaluation failure
        ====================================================== */

        const invalidTimestampResult =
            evaluator
                .evaluateRecommendationRulesSafely({
                    facts:
                        applicableFacts,

                    catalog,

                    evaluatedAt:
                        "not-a-date"
                });

        assertIssue(
            invalidTimestampResult,
            "/evaluatedAt",
            "Evaluation must require an explicit valid timestamp."
        );

        console.log(
            "GrowWithHR M2 recommendation evaluator checks passed."
        );
    } finally {
        await rm(
            loaded.temporaryDirectory,
            {
                recursive:
                    true,

                force:
                    true
            }
        );
    }
}

main().catch(
    (error) => {
        console.error(
            "GrowWithHR M2 recommendation evaluator checks failed."
        );

        console.error(
            error
        );

        process.exitCode =
            1;
    }
);
