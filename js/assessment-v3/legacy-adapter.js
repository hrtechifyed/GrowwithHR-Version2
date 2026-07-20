/**
 * GrowWithHR Compliance DNA
 * M1 Legacy Compatibility Adapter
 *
 * Converts Compliance DNA v3 state into the existing
 * Executive Advisory Briefing v2 contracts.
 *
 * M1 rules:
 * - Do not delete or rename existing storage keys.
 * - Do not introduce a new saved-state schema.
 * - Do not change recommendation decisions.
 * - Use the existing report mapper when it is available.
 */

const LEGACY_STATE_VERSION =
    "2.1.0";

const LEGACY_SCHEMA_VERSION =
    1;

export const LEGACY_KEYS =
    Object.freeze({
        assessment:
            "growwithhr-advisory-briefing-v2",

        report:
            "growwithhr-report",

        lead:
            "growwithhr-lead",

        delivery:
            "growwithhr-advisory-delivery-v1",

        industryCache:
            "growwithhr-industry-catalog-v1"
    });

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
        ? [...value]
        : [];
}

function cloneValue(value) {
    if (
        typeof structuredClone ===
        "function"
    ) {
        try {
            return structuredClone(
                value
            );
        } catch (error) {
            // Continue to the JSON-safe fallback.
        }
    }

    try {
        return JSON.parse(
            JSON.stringify(value)
        );
    } catch (error) {
        return value;
    }
}

function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
}

function booleanValue(
    value,
    fallback = false
) {
    if (
        typeof value ===
        "boolean"
    ) {
        return value;
    }

    return Boolean(
        fallback
    );
}

function nonNegativeInteger(
    value,
    fallback = 0
) {
    const number =
        Number.parseInt(
            String(value),
            10
        );

    return (
        Number.isFinite(number) &&
        number >= 0
    )
        ? number
        : fallback;
}

function isoTimestamp(value) {
    if (value instanceof Date) {
        if (
            Number.isFinite(
                value.getTime()
            )
        ) {
            return value.toISOString();
        }
    }

    const supplied =
        cleanText(value);

    if (supplied) {
        const date =
            new Date(supplied);

        if (
            Number.isFinite(
                date.getTime()
            )
        ) {
            return date.toISOString();
        }
    }

    return new Date()
        .toISOString();
}

function getModules(
    runtime = globalThis
) {
    return asObject(
        runtime
            ?.GrowWithHRModules
    );
}

function getStorage(
    runtime = globalThis
) {
    try {
        return runtime
            ?.localStorage ||
            null;
    } catch (error) {
        return null;
    }
}

function unwrapSavedRecord(record) {
    const source =
        asObject(record);

    const wrappedData =
        asObject(source.data);

    if (
        !Object.keys(
            wrappedData
        ).length
    ) {
        return source;
    }

    return {
        ...wrappedData,

        version:
            source.version ??
            wrappedData.version,

        schemaVersion:
            source.schemaVersion ??
            wrappedData.schemaVersion,

        updatedAt:
            source.updatedAt ??
            wrappedData.updatedAt
    };
}

function normalizeAnswers(value) {
    const source =
        asObject(value);

    return {
        ...cloneValue(source),

        locations:
            source.locations ??
            "1",

        countries:
            source.countries ??
            "1",

        expansionPlans:
            asArray(
                source.expansionPlans
            ),

        priorities:
            asArray(
                source.priorities
            )
    };
}

function normalizeLead(value) {
    const source =
        asObject(value);

    return {
        ...cloneValue(source),

        name:
            cleanText(
                source.name
            ),

        email:
            cleanText(
                source.email
            ),

        role:
            cleanText(
                source.role
            ),

        marketingConsent:
            Boolean(
                source
                    .marketingConsent
            )
    };
}

function normalizeUi(value) {
    const source =
        asObject(value);

    return {
        ...cloneValue(source),

        showSupplementalWorkforce:
            Boolean(
                source
                    .showSupplementalWorkforce
            )
    };
}

/**
 * Normalizes a record already stored under the v2 key.
 *
 * @param {*} record
 * @returns {Object|null}
 */
export function normalizeLegacyState(
    record
) {
    const source =
        unwrapSavedRecord(
            record
        );

    if (
        !Object.keys(source)
            .length
    ) {
        return null;
    }

    return {
        version:
            cleanText(
                source.version
            ) ||
            LEGACY_STATE_VERSION,

        schemaVersion:
            LEGACY_SCHEMA_VERSION,

        started:
            Boolean(
                source.started
            ),

        completed:
            Boolean(
                source.completed
            ),

        currentMoment:
            nonNegativeInteger(
                source.currentMoment,
                0
            ),

        answers:
            normalizeAnswers(
                source.answers
            ),

        lead:
            normalizeLead(
                source.lead
            ),

        ui:
            normalizeUi(
                source.ui
            ),

        updatedAt:
            cleanText(
                source.updatedAt
            )
    };
}

/**
 * Converts a v3 state object into the current v2 saved-state shape.
 *
 * The adapter copies existing answer field names. It does not
 * reinterpret answers or calculate compliance applicability.
 *
 * @param {Object} v3State
 * @param {Object} options
 * @returns {Object}
 */
export function toLegacyState(
    v3State = {},
    options = {}
) {
    const source =
        asObject(v3State);

    const previous =
        normalizeLegacyState(
            options.existingState
        ) || {};

    const previousAnswers =
        asObject(
            previous.answers
        );

    const profileAnswers =
        asObject(
            source.profile
        );

    const suppliedAnswers =
        asObject(
            source.answers
        );

    const previousLead =
        asObject(
            previous.lead
        );

    const suppliedLead =
        asObject(
            source.lead
        );

    const previousUi =
        asObject(
            previous.ui
        );

    const suppliedUi =
        asObject(
            source.ui
        );

    return {
        version:
            cleanText(
                previous.version
            ) ||
            LEGACY_STATE_VERSION,

        schemaVersion:
            LEGACY_SCHEMA_VERSION,

        started:
            booleanValue(
                source.started,
                previous.started
            ),

        completed:
            booleanValue(
                source.completed,
                previous.completed
            ),

        currentMoment:
            nonNegativeInteger(
                source.currentMoment,
                nonNegativeInteger(
                    previous.currentMoment,
                    0
                )
            ),

        answers:
            normalizeAnswers({
                ...previousAnswers,
                ...profileAnswers,
                ...suppliedAnswers
            }),

        lead:
            normalizeLead({
                ...previousLead,
                ...suppliedLead
            }),

        ui:
            normalizeUi({
                ...previousUi,
                ...suppliedUi
            }),

        updatedAt:
            isoTimestamp(
                options.updatedAt
            )
    };
}

/**
 * Reads the protected v2 progress key.
 *
 * Uses the existing AssessmentStorage module when it has
 * already been loaded. Otherwise it uses localStorage safely.
 *
 * @param {Object} runtime
 * @returns {Object|null}
 */
export function readLegacyProgress(
    runtime = globalThis
) {
    const modules =
        getModules(runtime);

    const assessmentStorage =
        modules.AssessmentStorage;

    if (
        assessmentStorage &&
        typeof assessmentStorage
            .readAssessment ===
            "function"
    ) {
        return normalizeLegacyState(
            assessmentStorage
                .readAssessment()
        );
    }

    const storage =
        getStorage(runtime);

    if (!storage) {
        return null;
    }

    try {
        const raw =
            storage.getItem(
                LEGACY_KEYS.assessment
            );

        if (!raw) {
            return null;
        }

        return normalizeLegacyState(
            JSON.parse(raw)
        );
    } catch (error) {
        console.warn(
            "GrowWithHR: existing v2 progress could not be read.",
            error
        );

        return null;
    }
}

/**
 * Writes a v3 state using the protected v2 storage contract.
 *
 * This method never removes the v2 key.
 *
 * @param {Object} v3State
 * @param {Object} options
 * @returns {Object|null}
 */
export function writeLegacyProgress(
    v3State = {},
    options = {}
) {
    const runtime =
        options.runtime ||
        globalThis;

    const existingState =
        options.existingState ||
        readLegacyProgress(
            runtime
        );

    const legacyState =
        toLegacyState(
            v3State,
            {
                existingState,

                updatedAt:
                    options.updatedAt
            }
        );

    const modules =
        getModules(runtime);

    const assessmentStorage =
        modules.AssessmentStorage;

    if (
        assessmentStorage &&
        typeof assessmentStorage
            .writeAssessment ===
            "function"
    ) {
        return (
            assessmentStorage
                .writeAssessment(
                    legacyState
                ) ||
            null
        );
    }

    const storage =
        getStorage(runtime);

    if (!storage) {
        console.warn(
            "GrowWithHR: browser storage is unavailable."
        );

        return null;
    }

    try {
        storage.setItem(
            LEGACY_KEYS.assessment,
            JSON.stringify(
                legacyState
            )
        );

        return legacyState;
    } catch (error) {
        console.warn(
            "GrowWithHR: v3 progress could not be saved through the v2 contract.",
            error
        );

        return null;
    }
}

function requireReportMapper(
    runtime = globalThis
) {
    const mapper =
        getModules(runtime)
            .ReportMapper;

    if (
        !mapper ||
        typeof mapper
            .buildRecords !==
            "function"
    ) {
        throw new Error(
            "GrowWithHR ReportMapper must be loaded before building legacy report records."
        );
    }

    return mapper;
}

/**
 * Builds the existing report and lead records.
 *
 * The existing ReportMapper remains responsible for the
 * actual field names consumed by PDF and email delivery.
 *
 * @param {Object} v3State
 * @param {Object} options
 * @returns {Object}
 */
export function buildLegacyRecords(
    v3State = {},
    options = {}
) {
    const runtime =
        options.runtime ||
        globalThis;

    const legacyState =
        toLegacyState(
            v3State,
            {
                existingState:
                    options
                        .existingState,

                updatedAt:
                    options
                        .generatedAt
            }
        );

    const mapper =
        requireReportMapper(
            runtime
        );

    return mapper.buildRecords({
        answers:
            legacyState.answers,

        lead:
            legacyState.lead,

        definitions:
            options.definitions,

        industryCatalog:
            options
                .industryCatalog,

        effectiveIndustryName:
            options
                .effectiveIndustryName,

        generatedAt:
            options.generatedAt,

        reportSource:
            options.reportSource ||
            "Compliance DNA v3 via Executive Advisory Briefing v2"
    });
}

/**
 * Builds the existing PDF payload through ReportMapper.
 *
 * @param {Object} v3State
 * @param {Object} options
 * @returns {Object}
 */
export function buildLegacyPdfPayload(
    v3State = {},
    options = {}
) {
    const runtime =
        options.runtime ||
        globalThis;

    const legacyState =
        toLegacyState(
            v3State,
            {
                existingState:
                    options
                        .existingState,

                updatedAt:
                    options
                        .generatedAt
            }
        );

    const mapper =
        requireReportMapper(
            runtime
        );

    if (
        typeof mapper
            .buildPdfPayload !==
            "function"
    ) {
        throw new Error(
            "GrowWithHR ReportMapper does not expose buildPdfPayload."
        );
    }

    return mapper.buildPdfPayload({
        answers:
            legacyState.answers,

        lead:
            legacyState.lead,

        definitions:
            options.definitions,

        industryCatalog:
            options
                .industryCatalog,

        effectiveIndustryName:
            options
                .effectiveIndustryName,

        generatedAt:
            options.generatedAt,

        reportSource:
            options.reportSource ||
            "Compliance DNA v3 via Executive Advisory Briefing v2"
    });
}

/**
 * Creates an adapter bound to one browser runtime.
 *
 * @param {Object} options
 * @returns {Object}
 */
export function createLegacyAdapter(
    options = {}
) {
    const runtime =
        options.runtime ||
        globalThis;

    return Object.freeze({
        keys:
            LEGACY_KEYS,

        readProgress() {
            return readLegacyProgress(
                runtime
            );
        },

        toLegacyState(
            state,
            overrides = {}
        ) {
            return toLegacyState(
                state,
                {
                    ...overrides,

                    existingState:
                        overrides
                            .existingState ||
                        readLegacyProgress(
                            runtime
                        )
                }
            );
        },

        writeProgress(
            state,
            overrides = {}
        ) {
            return writeLegacyProgress(
                state,
                {
                    ...overrides,
                    runtime
                }
            );
        },

        buildRecords(
            state,
            overrides = {}
        ) {
            return buildLegacyRecords(
                state,
                {
                    ...overrides,
                    runtime
                }
            );
        },

        buildPdfPayload(
            state,
            overrides = {}
        ) {
            return buildLegacyPdfPayload(
                state,
                {
                    ...overrides,
                    runtime
                }
            );
        },

        getStatus() {
            const modules =
                getModules(runtime);

            return Object.freeze({
                storageAvailable:
                    Boolean(
                        getStorage(
                            runtime
                        )
                    ),

                assessmentStorageLoaded:
                    Boolean(
                        modules
                            .AssessmentStorage
                    ),

                reportMapperLoaded:
                    Boolean(
                        modules
                            .ReportMapper
                    ),

                protectedKey:
                    LEGACY_KEYS
                        .assessment
            });
        }
    });
}

export default createLegacyAdapter;
