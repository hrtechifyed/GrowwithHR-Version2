/**
 * GrowWithHR Compliance DNA
 * M2 Traceability Compatibility Adapter Checks
 *
 * Validates:
 * - protected v2 assessment answers remain the source contract;
 * - confirmed and derived facts are created through the compatibility layer;
 * - traceability remains separate from protected state and report records;
 * - protected persistence keys are not renamed or extended;
 * - no new browser-storage key is introduced;
 * - synchronous and asynchronous adapter paths produce equivalent output;
 * - catalog loading is validated and cached;
 * - deterministic timestamps produce deterministic bundles;
 * - adapter failures expose structured issue paths;
 * - the adapter does not access the DOM or browser storage.
 */

import assert from "node:assert/strict";

import {
    cp,
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

const SOURCE_JS_DIRECTORY =
    path.join(
        PROJECT_ROOT,
        "js"
    );

const ADAPTER_SOURCE_PATH =
    path.join(
        SOURCE_JS_DIRECTORY,
        "assessment-v3",
        "traceability-adapter.js"
    );

const LEGACY_ADAPTER_SOURCE_PATH =
    path.join(
        SOURCE_JS_DIRECTORY,
        "assessment-v3",
        "legacy-adapter.js"
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

const EXPECTED_ASSESSMENT_KEY =
    "growwithhr-advisory-briefing-v2";

const EXPECTED_CONTRACT_VERSION =
    "1.0.0";

const EXPECTED_RULE_COUNT =
    7;

const EXPECTED_CONFIRMED_FACT_COUNT =
    13;

const EXPECTED_DERIVED_FACT_COUNT =
    8;

function clone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
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

function createAnswers() {
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

function createPrivateBetaState() {
    return {
        currentAct:
            "act",

        currentQuestionIndex:
            0,

        answers:
            createAnswers(),

        completed:
            false
    };
}

function createExistingLegacyState() {
    return {
        schemaVersion:
            1,

        currentStep:
            0,

        answers:
            {},

        completed:
            false,

        updatedAt:
            FIXED_DATE_TIME
    };
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

function issuePaths(error) {
    return Array.isArray(
        error?.issues
    )
        ? error.issues.map(
            (issue) =>
                issue.path
        )
        : [];
}

function assertStructuredError(
    error,
    expectedPath
) {
    assert(
        error,
        "An error was expected."
    );

    assert(
        issuePaths(error)
            .includes(
                expectedPath
            ),
        [
            `Expected issue path: ${expectedPath}`,
            "Actual issues:",
            JSON.stringify(
                error?.issues,
                null,
                2
            )
        ].join("\n")
    );

    return true;
}

async function loadAdapterModule() {
    const temporaryDirectory =
        await mkdtemp(
            path.join(
                tmpdir(),
                "growwithhr-m2-adapter-"
            )
        );

    await writeFile(
        path.join(
            temporaryDirectory,
            "package.json"
        ),
        JSON.stringify(
            {
                type:
                    "module"
            },
            null,
            2
        ),
        "utf8"
    );

    await cp(
        SOURCE_JS_DIRECTORY,
        path.join(
            temporaryDirectory,
            "js"
        ),
        {
            recursive:
                true
        }
    );

    const adapterModulePath =
        path.join(
            temporaryDirectory,
            "js",
            "assessment-v3",
            "traceability-adapter.js"
        );

    return {
        temporaryDirectory,

        module:
            await import(
                pathToFileURL(
                    adapterModulePath
                ).href
            )
    };
}

async function main() {
    const adapterSource =
        await readFile(
            ADAPTER_SOURCE_PATH,
            "utf8"
        );

    const legacyAdapterSource =
        await readFile(
            LEGACY_ADAPTER_SOURCE_PATH,
            "utf8"
        );

    const catalog =
        JSON.parse(
            await readFile(
                CATALOG_PATH,
                "utf8"
            )
        );

    const loaded =
        await loadAdapterModule();

    try {
        const adapterModule =
            loaded.module;

        /* ======================================================
           Module identity
        ====================================================== */

        assert.equal(
            adapterModule
                .TRACEABILITY_ADAPTER_VERSION,
            "1.0.0",
            "The traceability-adapter version must remain stable."
        );

        assert.equal(
            adapterModule
                .RECOMMENDATION_CATALOG_URL,
            "data/assessment/recommendation-rules.v1.json",
            "The adapter must use the governed M2 catalog path."
        );

        assert.equal(
            typeof adapterModule
                .createTraceabilityAdapter,
            "function"
        );

        assert.equal(
            typeof adapterModule
                .buildTraceabilityBundle,
            "function"
        );

        assert.equal(
            typeof adapterModule
                .buildCompatibilityTraceability,
            "function"
        );

        assert.equal(
            typeof adapterModule
                .loadRecommendationCatalog,
            "function"
        );

        /* ======================================================
           Source-code boundaries
        ====================================================== */

        const forbiddenAdapterPatterns = [
            /\bdocument\b/,
            /\bwindow\b/,
            /\blocalStorage\b/,
            /\bsessionStorage\b/,
            /\.setItem\s*\(/,
            /\.getItem\s*\(/,
            /\.removeItem\s*\(/,
            /\bXMLHttpRequest\b/,
            /\breport-mapper\b/,
            /\bpdf-generator\b/,
            /\bemail-delivery\b/
        ];

        for (
            const pattern
            of forbiddenAdapterPatterns
        ) {
            assert.equal(
                pattern.test(
                    adapterSource
                ),
                false,
                `The traceability adapter must not contain prohibited reference ${pattern}.`
            );
        }

        assert.equal(
            adapterSource.includes(
                "growwithhr-report"
            ),
            false,
            "The adapter must not access the protected report key."
        );

        assert.equal(
            adapterSource.includes(
                "growwithhr-lead"
            ),
            false,
            "The adapter must not access the protected lead key."
        );

        assert.equal(
            adapterSource.includes(
                "growwithhr-advisory-delivery-v1"
            ),
            false,
            "The adapter must not access the protected delivery key."
        );

        assert.equal(
            legacyAdapterSource.includes(
                EXPECTED_ASSESSMENT_KEY
            ),
            true,
            "The compatibility layer must retain the protected v2 assessment key."
        );

        /* ======================================================
           Adapter status and catalog identity
        ====================================================== */

        const adapter =
            adapterModule
                .createTraceabilityAdapter({
                    catalog,

                    now() {
                        return FIXED_DATE_TIME;
                    }
                });

        const initialStatus =
            adapter.getStatus();

        assert.deepEqual(
            initialStatus,
            {
                version:
                    "1.0.0",

                catalogUrl:
                    "data/assessment/recommendation-rules.v1.json",

                catalogLoaded:
                    true,

                catalogLoading:
                    false,

                protectedAssessmentKey:
                    EXPECTED_ASSESSMENT_KEY,

                newStorageKeyIntroduced:
                    false,

                stableReportMutation:
                    false
            },
            "The adapter status must explicitly preserve the protected contract."
        );

        assert.strictEqual(
            adapter.getCatalog(),
            catalog,
            "A supplied governed catalog must be retained without cloning or mutation."
        );

        /* ======================================================
           Compatibility-state mapping
        ====================================================== */

        const privateBetaState =
            createPrivateBetaState();

        const existingLegacyState =
            createExistingLegacyState();

        const privateBetaSnapshot =
            clone(
                privateBetaState
            );

        const existingLegacySnapshot =
            clone(
                existingLegacyState
            );

        const legacyState =
            adapter.createLegacyState(
                privateBetaState,
                {
                    existingState:
                        existingLegacyState,

                    evaluatedAt:
                        FIXED_DATE_TIME
                }
            );

        assert.equal(
            legacyState.schemaVersion,
            1,
            "The protected state schema must remain version 1."
        );

        assert.equal(
            legacyState.updatedAt,
            FIXED_DATE_TIME
        );

        assert.equal(
            legacyState
                .answers
                .employees,
            32
        );

        assert.equal(
            legacyState
                .answers
                .primaryState,
            "Maharashtra"
        );

        assert.deepEqual(
            legacyState
                .answers
                .priorities,
            [
                "policies-compliance",
                "workforce-planning"
            ]
        );

        assert.deepEqual(
            privateBetaState,
            privateBetaSnapshot,
            "Compatibility mapping must not mutate private-beta state."
        );

        assert.deepEqual(
            existingLegacyState,
            existingLegacySnapshot,
            "Compatibility mapping must not mutate existing protected state."
        );

        /* ======================================================
           Fact mapping through compatibility layer
        ====================================================== */

        const facts =
            adapter.createFacts(
                privateBetaState,
                {
                    existingState:
                        existingLegacyState,

                    evaluatedAt:
                        FIXED_DATE_TIME
                }
            );

        assert.equal(
            facts.confirmed.length,
            EXPECTED_CONFIRMED_FACT_COUNT
        );

        assert.equal(
            facts.derived.length,
            EXPECTED_DERIVED_FACT_COUNT
        );

        assert.equal(
            Object.isFrozen(
                facts
            ),
            true
        );

        assert.equal(
            Object.isFrozen(
                facts.confirmed
            ),
            true
        );

        assert.equal(
            Object.isFrozen(
                facts.derived
            ),
            true
        );

        const confirmedFacts =
            indexBy(
                facts.confirmed,
                "id"
            );

        const derivedFacts =
            indexBy(
                facts.derived,
                "id"
            );

        assert.equal(
            confirmedFacts
                .get(
                    "fact.workforce.employee-count"
                )
                .value,
            32
        );

        assert.equal(
            confirmedFacts
                .get(
                    "fact.footprint.primary-state"
                )
                .value,
            "Maharashtra"
        );

        assert.equal(
            derivedFacts
                .get(
                    "fact.workforce.total-reported-workforce"
                )
                .value,
            39
        );

        assert.equal(
            derivedFacts
                .get(
                    "fact.footprint.multi-location"
                )
                .value,
            true
        );

        assert.equal(
            derivedFacts
                .get(
                    "fact.workforce.distributed-workforce"
                )
                .value,
            true
        );

        /* ======================================================
           Separate compatibility and traceability records
        ====================================================== */

        const compatibilityResult =
            adapter
                .buildCompatibilityResult(
                    privateBetaState,
                    {
                        existingState:
                            existingLegacyState,

                        evaluatedAt:
                            FIXED_DATE_TIME,

                        generatedAt:
                            FIXED_DATE_TIME
                    }
                );

        assert.equal(
            Object.isFrozen(
                compatibilityResult
            ),
            true
        );

        assert.deepEqual(
            Object.keys(
                compatibilityResult
            ).sort(),
            [
                "legacyState",
                "traceability"
            ]
        );

        assert.equal(
            hasOwn(
                compatibilityResult
                    .legacyState,
                "traceability"
            ),
            false,
            "Traceability must not be inserted into protected saved state."
        );

        assert.equal(
            hasOwn(
                compatibilityResult
                    .legacyState,
                "recommendations"
            ),
            false,
            "M2 recommendations must not be inserted into protected saved state."
        );

        assert.equal(
            hasOwn(
                compatibilityResult
                    .legacyState,
                "report"
            ),
            false,
            "The adapter must not create a report field in protected state."
        );

        assert.equal(
            hasOwn(
                compatibilityResult
                    .legacyState,
                "pdf"
            ),
            false,
            "The adapter must not create a PDF field in protected state."
        );

        assert.equal(
            hasOwn(
                compatibilityResult
                    .legacyState,
                "delivery"
            ),
            false,
            "The adapter must not create a delivery field in protected state."
        );

        const traceability =
            compatibilityResult
                .traceability;

        assert.equal(
            traceability.contractVersion,
            EXPECTED_CONTRACT_VERSION
        );

        assert.equal(
            traceability.generatedAt,
            FIXED_DATE_TIME
        );

        assert.equal(
            traceability.ruleEvaluations.length,
            EXPECTED_RULE_COUNT
        );

        assert.equal(
            traceability.recommendations.length,
            EXPECTED_RULE_COUNT
        );

        assert.equal(
            traceability.metadata
                .adapterVersion,
            "1.0.0"
        );

        assert.equal(
            traceability.metadata
                .sourceContract,
            "executive-advisory-briefing-v2"
        );

        assert.equal(
            traceability.metadata
                .sourceSchemaVersion,
            1
        );

        assert.equal(
            traceability.metadata
                .protectedAssessmentKey,
            EXPECTED_ASSESSMENT_KEY
        );

        assert.equal(
            traceability.metadata
                .stableReportMutation,
            false
        );

        assert.equal(
            hasOwn(
                traceability,
                "report"
            ),
            false
        );

        assert.equal(
            hasOwn(
                traceability,
                "pdf"
            ),
            false
        );

        assert.equal(
            hasOwn(
                traceability,
                "email"
            ),
            false
        );

        assert.equal(
            hasOwn(
                traceability,
                "delivery"
            ),
            false
        );

        for (
            const recommendation
            of traceability.recommendations
        ) {
            assert(
                recommendation
                    .triggeringFactIds
                    .length >
                    0,
                `${recommendation.id} must retain its triggering facts.`
            );

            assert(
                recommendation
                    .sourceIds
                    .length >
                    0,
                `${recommendation.id} must retain structured sources.`
            );

            assert.equal(
                recommendation
                    .evidence
                    .status,
                "not-requested"
            );
        }

        /* ======================================================
           Deterministic output
        ====================================================== */

        const repeatedResult =
            adapter
                .buildCompatibilityResult(
                    createPrivateBetaState(),
                    {
                        existingState:
                            createExistingLegacyState(),

                        evaluatedAt:
                            FIXED_DATE_TIME,

                        generatedAt:
                            FIXED_DATE_TIME
                    }
                );

        assert.deepEqual(
            repeatedResult,
            compatibilityResult,
            "Identical state, catalog and timestamps must produce identical compatibility output."
        );

        const directBundle =
            adapterModule
                .buildTraceabilityBundle(
                    createPrivateBetaState(),
                    {
                        catalog,

                        existingState:
                            createExistingLegacyState(),

                        evaluatedAt:
                            FIXED_DATE_TIME,

                        generatedAt:
                            FIXED_DATE_TIME
                    }
                );

        assert.deepEqual(
            directBundle,
            traceability,
            "The direct adapter helper and configured adapter must produce equivalent traceability."
        );

        /* ======================================================
           Catalog loading and caching
        ====================================================== */

        const fetchCalls = [];

        const catalogFetch =
            async (
                url,
                options
            ) => {
                fetchCalls.push({
                    url,
                    options
                });

                return {
                    ok:
                        true,

                    status:
                        200,

                    async json() {
                        return clone(
                            catalog
                        );
                    }
                };
            };

        const loadingAdapter =
            adapterModule
                .createTraceabilityAdapter({
                    runtime: {
                        fetch:
                            catalogFetch
                    },

                    catalogUrl:
                        "/data/assessment/recommendation-rules.v1.json",

                    now() {
                        return FIXED_DATE_TIME;
                    }
                });

        assert.equal(
            loadingAdapter
                .getStatus()
                .catalogLoaded,
            false
        );

        const loadedCatalog =
            await loadingAdapter
                .loadCatalog();

        assert.equal(
            loadedCatalog.catalogVersion,
            "1.0.0"
        );

        assert.equal(
            fetchCalls.length,
            1
        );

        assert.equal(
            fetchCalls[0].url,
            "/data/assessment/recommendation-rules.v1.json"
        );

        assert.equal(
            fetchCalls[0]
                .options
                .headers
                .Accept,
            "application/json"
        );

        assert.equal(
            loadingAdapter
                .getStatus()
                .catalogLoaded,
            true
        );

        const asynchronousResult =
            await loadingAdapter
                .buildCompatibilityResultAsync(
                    createPrivateBetaState(),
                    {
                        existingState:
                            createExistingLegacyState(),

                        evaluatedAt:
                            FIXED_DATE_TIME,

                        generatedAt:
                            FIXED_DATE_TIME
                    }
                );

        assert.equal(
            fetchCalls.length,
            1,
            "A successfully loaded catalog must be reused rather than fetched again."
        );

        assert.deepEqual(
            asynchronousResult
                .traceability,
            traceability,
            "Asynchronous catalog loading must produce the same governed traceability output."
        );

        /* ======================================================
           Missing-information behavior
        ====================================================== */

        const missingResult =
            adapter
                .buildCompatibilityResult(
                    {
                        answers:
                            {},

                        completed:
                            false
                    },
                    {
                        existingState:
                            createExistingLegacyState(),

                        evaluatedAt:
                            FIXED_DATE_TIME,

                        generatedAt:
                            FIXED_DATE_TIME
                    }
                );

        assert.equal(
            missingResult
                .traceability
                .ruleEvaluations
                .length,
            EXPECTED_RULE_COUNT
        );

        for (
            const evaluation
            of missingResult
                .traceability
                .ruleEvaluations
        ) {
            assert.equal(
                evaluation.status,
                "more-information-needed"
            );

            assert(
                evaluation
                    .missingFactIds
                    .length >
                    0,
                `${evaluation.ruleId} must identify missing information.`
            );
        }

        assert.equal(
            hasOwn(
                missingResult
                    .legacyState,
                "traceability"
            ),
            false
        );

        /* ======================================================
           Structured adapter failures
        ====================================================== */

        assert.throws(
            () => {
                adapterModule
                    .buildTraceabilityBundle(
                        createPrivateBetaState(),
                        {
                            catalog,

                            evaluatedAt:
                                "not-a-date"
                        }
                    );
            },
            (error) =>
                assertStructuredError(
                    error,
                    "/evaluatedAt"
                ),
            "Invalid evaluation timestamps must be rejected."
        );

        await assert.rejects(
            () => {
                return adapterModule
                    .loadRecommendationCatalog({
                        fetch:
                            async () => ({
                                ok:
                                    false,

                                status:
                                    503
                            })
                    });
            },
            (error) =>
                assertStructuredError(
                    error,
                    "/catalog"
                ),
            "Failed catalog requests must expose a structured catalog issue."
        );

        await assert.rejects(
            () => {
                return adapterModule
                    .loadRecommendationCatalog({
                        fetch:
                            async () => ({
                                ok:
                                    true,

                                status:
                                    200,

                                async json() {
                                    throw new Error(
                                        "Invalid JSON"
                                    );
                                }
                            })
                    });
            },
            (error) =>
                assertStructuredError(
                    error,
                    "/catalog"
                ),
            "Invalid catalog JSON must expose a structured catalog issue."
        );

        const invalidCatalog =
            clone(
                catalog
            );

        invalidCatalog
            .stableReportMutation =
            true;

        await assert.rejects(
            () => {
                return adapterModule
                    .loadRecommendationCatalog({
                        catalog:
                            invalidCatalog
                    });
            },
            (error) =>
                assertStructuredError(
                    error,
                    "/catalog/stableReportMutation"
                ),
            "Catalogs that permit stable-report mutation must be rejected."
        );

        /* ======================================================
           Final protected-contract assertions
        ====================================================== */

        assert.deepEqual(
            privateBetaState,
            privateBetaSnapshot,
            "Adapter evaluation must leave the caller's private-beta state unchanged."
        );

        assert.deepEqual(
            existingLegacyState,
            existingLegacySnapshot,
            "Adapter evaluation must leave the caller's protected state unchanged."
        );

        assert.equal(
            adapter
                .getStatus()
                .newStorageKeyIntroduced,
            false
        );

        assert.equal(
            adapter
                .getStatus()
                .stableReportMutation,
            false
        );

        console.log(
            "GrowWithHR M2 traceability adapter checks passed."
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
            "GrowWithHR M2 traceability adapter checks failed."
        );

        console.error(
            error
        );

        process.exitCode =
            1;
    }
);
