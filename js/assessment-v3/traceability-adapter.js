/**
 * GrowWithHR Compliance DNA
 * M2 Traceability Compatibility Adapter
 *
 * Connects the protected v2 assessment-answer contract to the M2 fact mapper
 * and deterministic recommendation evaluator without changing protected
 * persistence, report, PDF, email or delivery fields.
 */

import {
    LEGACY_KEYS,
    toLegacyState
} from "./legacy-adapter.js";

import {
    FACT_MAPPER_VERSION,
    createTraceabilityFacts
} from "./fact-mapper.js";

import {
    RECOMMENDATION_EVALUATOR_VERSION,
    evaluateRecommendationRules,
    validateRecommendationCatalog
} from "./recommendation-evaluator.js";

export const TRACEABILITY_ADAPTER_VERSION =
    "1.0.0";

export const RECOMMENDATION_CATALOG_URL =
    "data/assessment/recommendation-rules.v1.json";

function asObject(value) {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    )
        ? value
        : {};
}

function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
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
            "Traceability compatibility adaptation failed."
    });
}

export class TraceabilityAdapterError
    extends Error {
    constructor(issues) {
        const normalizedIssues =
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
            normalizedIssues.length
                ? normalizedIssues
                    .map(
                        (issue) =>
                            `${issue.path}: ${issue.message}`
                    )
                    .join("\n")
                : "Traceability compatibility adaptation failed."
        );

        this.name =
            "TraceabilityAdapterError";

        this.issues =
            normalizedIssues;
    }
}

function fail(
    path,
    message
) {
    throw new TraceabilityAdapterError([
        createIssue(
            path,
            message
        )
    ]);
}

function isValidDateTime(value) {
    const text =
        cleanText(value);

    return (
        text !== "" &&
        Number.isFinite(
            Date.parse(text)
        ) &&
        /(?:Z|[+-]\d{2}:\d{2})$/.test(text)
    );
}

function normalizeDateTime(
    value,
    path
) {
    const text =
        cleanText(value);

    if (!isValidDateTime(text)) {
        fail(
            path,
            "A valid ISO 8601 date-time with a timezone is required."
        );
    }

    return new Date(text)
        .toISOString();
}

function resolveTimestamp(options) {
    const supplied =
        options.evaluatedAt ??
        options.generatedAt;

    if (
        supplied !== undefined &&
        supplied !== null &&
        cleanText(supplied) !== ""
    ) {
        return normalizeDateTime(
            supplied,
            "/evaluatedAt"
        );
    }

    if (
        typeof options.now ===
        "function"
    ) {
        return normalizeDateTime(
            options.now(),
            "/now"
        );
    }

    return new Date()
        .toISOString();
}

function requireCatalog(catalog) {
    const source =
        asObject(catalog);

    if (
        !Object.keys(source)
            .length
    ) {
        fail(
            "/catalog",
            "A recommendation-rule catalog is required."
        );
    }

    const validation =
        validateRecommendationCatalog(
            source
        );

    if (!validation.valid) {
        throw new TraceabilityAdapterError(
            validation.errors.map(
                (issue) => ({
                    path:
                        `/catalog${
                            issue.path === "/"
                                ? ""
                                : issue.path
                        }`,

                    message:
                        issue.message
                })
            )
        );
    }

    return source;
}

function resolveFetch(
    runtime,
    suppliedFetch
) {
    if (
        typeof suppliedFetch ===
        "function"
    ) {
        return suppliedFetch;
    }

    if (
        runtime &&
        typeof runtime.fetch ===
        "function"
    ) {
        return runtime.fetch.bind(
            runtime
        );
    }

    if (
        typeof globalThis.fetch ===
        "function"
    ) {
        return globalThis.fetch.bind(
            globalThis
        );
    }

    return null;
}

/**
 * Loads and validates the governed M2 rule catalog.
 *
 * The catalog is not written to browser storage and no new persistence key is
 * introduced.
 *
 * @param {Object} options
 * @param {Object} [options.runtime]
 * @param {Function} [options.fetch]
 * @param {string} [options.catalogUrl]
 * @returns {Promise<Object>}
 */
export async function loadRecommendationCatalog(
    options = {}
) {
    const source =
        asObject(options);

    if (
        source.catalog &&
        typeof source.catalog ===
            "object"
    ) {
        return requireCatalog(
            source.catalog
        );
    }

    const runtime =
        source.runtime ||
        globalThis;

    const fetchImplementation =
        resolveFetch(
            runtime,
            source.fetch
        );

    if (!fetchImplementation) {
        fail(
            "/fetch",
            "A fetch implementation is required to load the recommendation catalog."
        );
    }

    const catalogUrl =
        cleanText(
            source.catalogUrl
        ) ||
        RECOMMENDATION_CATALOG_URL;

    let response;

    try {
        response =
            await fetchImplementation(
                catalogUrl,
                {
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );
    } catch (error) {
        fail(
            "/catalog",
            `The recommendation catalog could not be loaded: ${
                error?.message ||
                "network error"
            }.`
        );
    }

    if (
        !response ||
        response.ok !== true
    ) {
        fail(
            "/catalog",
            `The recommendation catalog request failed with status ${
                response?.status ??
                "unknown"
            }.`
        );
    }

    let catalog;

    try {
        catalog =
            await response.json();
    } catch (error) {
        fail(
            "/catalog",
            "The recommendation catalog response was not valid JSON."
        );
    }

    return requireCatalog(
        catalog
    );
}

/**
 * Builds the protected v2 assessment-state shape used as the source for M2
 * fact mapping. The returned state is separate from the traceability bundle.
 *
 * @param {Object} state
 * @param {Object} options
 * @returns {Object}
 */
export function createTraceabilityLegacyState(
    state = {},
    options = {}
) {
    const source =
        asObject(options);

    const timestamp =
        resolveTimestamp(
            source
        );

    return toLegacyState(
        state,
        {
            existingState:
                source.existingState,

            updatedAt:
                timestamp
        }
    );
}

/**
 * Creates confirmed and derived facts from the protected answer contract.
 *
 * @param {Object} state
 * @param {Object} options
 * @returns {Object}
 */
export function createCompatibilityFacts(
    state = {},
    options = {}
) {
    const source =
        asObject(options);

    const timestamp =
        resolveTimestamp(
            source
        );

    const legacyState =
        toLegacyState(
            state,
            {
                existingState:
                    source.existingState,

                updatedAt:
                    timestamp
            }
        );

    return createTraceabilityFacts(
        legacyState.answers,
        {
            recordedAt:
                source.recordedAt ||
                timestamp,

            recordedAtByAnswer:
                source.recordedAtByAnswer
        }
    );
}

/**
 * Builds a complete M2 traceability bundle while preserving protected v2
 * report, PDF, email and persistence contracts.
 *
 * @param {Object} state
 * @param {Object} options
 * @param {Object} options.catalog
 * @param {string} [options.evaluatedAt]
 * @param {string} [options.generatedAt]
 * @param {Object} [options.existingState]
 * @param {Object} [options.recordedAtByAnswer]
 * @param {Array<string>} [options.limitations]
 * @param {Object} [options.metadata]
 * @returns {Object}
 */
export function buildTraceabilityBundle(
    state = {},
    options = {}
) {
    const source =
        asObject(options);

    const catalog =
        requireCatalog(
            source.catalog
        );

    const evaluatedAt =
        resolveTimestamp(
            source
        );

    const generatedAt =
        source.generatedAt
            ? normalizeDateTime(
                source.generatedAt,
                "/generatedAt"
            )
            : evaluatedAt;

    const legacyState =
        toLegacyState(
            state,
            {
                existingState:
                    source.existingState,

                updatedAt:
                    evaluatedAt
            }
        );

    const facts =
        createTraceabilityFacts(
            legacyState.answers,
            {
                recordedAt:
                    source.recordedAt ||
                    evaluatedAt,

                recordedAtByAnswer:
                    source.recordedAtByAnswer
            }
        );

    return evaluateRecommendationRules({
        facts,
        catalog,
        evaluatedAt,
        generatedAt,

        limitations:
            source.limitations,

        metadata: {
            ...asObject(
                source.metadata
            ),

            adapterVersion:
                TRACEABILITY_ADAPTER_VERSION,

            factMapperVersion:
                FACT_MAPPER_VERSION,

            evaluatorVersion:
                RECOMMENDATION_EVALUATOR_VERSION,

            sourceContract:
                "executive-advisory-briefing-v2",

            sourceSchemaVersion:
                legacyState.schemaVersion,

            protectedAssessmentKey:
                LEGACY_KEYS.assessment,

            stableReportMutation:
                false
        }
    });
}

/**
 * Returns the protected compatibility state and M2 traceability as separate
 * siblings. The traceability bundle is never inserted into the protected
 * state or report records.
 *
 * @param {Object} state
 * @param {Object} options
 * @returns {{legacyState: Object, traceability: Object}}
 */
export function buildCompatibilityTraceability(
    state = {},
    options = {}
) {
    const source =
        asObject(options);

    const timestamp =
        resolveTimestamp(
            source
        );

    const legacyState =
        toLegacyState(
            state,
            {
                existingState:
                    source.existingState,

                updatedAt:
                    timestamp
            }
        );

    const traceability =
        buildTraceabilityBundle(
            state,
            {
                ...source,

                existingState:
                    legacyState,

                evaluatedAt:
                    timestamp,

                generatedAt:
                    source.generatedAt ||
                    timestamp
            }
        );

    return Object.freeze({
        legacyState,
        traceability
    });
}

/**
 * Creates a browser-bound compatibility adapter with catalog loading isolated
 * from deterministic fact mapping and evaluation.
 *
 * @param {Object} options
 * @returns {Object}
 */
export function createTraceabilityAdapter(
    options = {}
) {
    const source =
        asObject(options);

    const runtime =
        source.runtime ||
        globalThis;

    const catalogUrl =
        cleanText(
            source.catalogUrl
        ) ||
        RECOMMENDATION_CATALOG_URL;

    let catalog =
        source.catalog
            ? requireCatalog(
                source.catalog
            )
            : null;

    let catalogPromise =
        null;

    async function ensureCatalog(
        overrides = {}
    ) {
        const request =
            asObject(overrides);

        if (request.catalog) {
            catalog =
                requireCatalog(
                    request.catalog
                );

            catalogPromise =
                null;

            return catalog;
        }

        if (
            catalog &&
            request.force !== true
        ) {
            return catalog;
        }

        if (
            catalogPromise &&
            request.force !== true
        ) {
            return catalogPromise;
        }

        catalogPromise =
            loadRecommendationCatalog({
                runtime,

                fetch:
                    request.fetch ||
                    source.fetch,

                catalogUrl:
                    request.catalogUrl ||
                    catalogUrl
            })
                .then(
                    (loadedCatalog) => {
                        catalog =
                            loadedCatalog;

                        return loadedCatalog;
                    }
                )
                .finally(
                    () => {
                        catalogPromise =
                            null;
                    }
                );

        return catalogPromise;
    }

    function sharedOptions(
        overrides = {}
    ) {
        const request =
            asObject(overrides);

        return {
            ...source,
            ...request,

            now:
                request.now ||
                source.now,

            catalog:
                request.catalog ||
                catalog
        };
    }

    return Object.freeze({
        version:
            TRACEABILITY_ADAPTER_VERSION,

        catalogUrl,

        loadCatalog:
            ensureCatalog,

        getCatalog() {
            return catalog;
        },

        createLegacyState(
            state,
            overrides = {}
        ) {
            return createTraceabilityLegacyState(
                state,
                sharedOptions(
                    overrides
                )
            );
        },

        createFacts(
            state,
            overrides = {}
        ) {
            return createCompatibilityFacts(
                state,
                sharedOptions(
                    overrides
                )
            );
        },

        buildBundle(
            state,
            overrides = {}
        ) {
            return buildTraceabilityBundle(
                state,
                sharedOptions(
                    overrides
                )
            );
        },

        async buildBundleAsync(
            state,
            overrides = {}
        ) {
            const loadedCatalog =
                await ensureCatalog(
                    overrides
                );

            return buildTraceabilityBundle(
                state,
                {
                    ...sharedOptions(
                        overrides
                    ),

                    catalog:
                        loadedCatalog
                }
            );
        },

        buildCompatibilityResult(
            state,
            overrides = {}
        ) {
            return buildCompatibilityTraceability(
                state,
                sharedOptions(
                    overrides
                )
            );
        },

        async buildCompatibilityResultAsync(
            state,
            overrides = {}
        ) {
            const loadedCatalog =
                await ensureCatalog(
                    overrides
                );

            return buildCompatibilityTraceability(
                state,
                {
                    ...sharedOptions(
                        overrides
                    ),

                    catalog:
                        loadedCatalog
                }
            );
        },

        getStatus() {
            return Object.freeze({
                version:
                    TRACEABILITY_ADAPTER_VERSION,

                catalogUrl,

                catalogLoaded:
                    Boolean(catalog),

                catalogLoading:
                    Boolean(
                        catalogPromise
                    ),

                protectedAssessmentKey:
                    LEGACY_KEYS.assessment,

                newStorageKeyIntroduced:
                    false,

                stableReportMutation:
                    false
            });
        }
    });
}

export default Object.freeze({
    version:
        TRACEABILITY_ADAPTER_VERSION,

    catalogUrl:
        RECOMMENDATION_CATALOG_URL,

    loadRecommendationCatalog,
    createTraceabilityLegacyState,
    createCompatibilityFacts,
    buildTraceabilityBundle,
    buildCompatibilityTraceability,
    createTraceabilityAdapter
});
