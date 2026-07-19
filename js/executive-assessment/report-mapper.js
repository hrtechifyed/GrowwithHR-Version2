/* ==========================================================
   GrowWithHR
   Executive Advisory Report Mapper

   Responsibility:
   - Convert assessment answers into the existing report shape
   - Convert lead information into the existing lead-record shape
   - Preserve field names consumed by PDF and email services
   - Resolve industry, role, priority and expansion labels
   - Normalise workforce and location numbers

   This module must not:
   - access localStorage;
   - dispatch browser events;
   - access or modify the DOM;
   - generate a PDF;
   - send email;
   - change assessment navigation or state.

   Persistence and event dispatch remain responsibilities of the
   compatibility facade and AssessmentStorage module.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    const DEFAULT_REPORT_SOURCE =
        "Executive Advisory Briefing v2";

    const DEFAULT_LEAD_SOURCE =
        "Executive Advisory Briefing";

    /**
     * Returns the shared assessment definitions.
     *
     * @returns {Object}
     */
    function defaultDefinitions() {
        return (
            modules.AssessmentDefinition ||
            {}
        );
    }

    /**
     * Returns the shared utility module.
     *
     * @returns {Object}
     */
    function utils() {
        return (
            modules.AssessmentUtils ||
            {}
        );
    }

    /**
     * Returns a safe object.
     *
     * @param {*} value
     * @returns {Object}
     */
    function asObject(value) {
        return (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        )
            ? value
            : {};
    }

    /**
     * Returns a new array.
     *
     * @param {*} value
     * @returns {Array}
     */
    function asArray(value) {
        return Array.isArray(value)
            ? [...value]
            : [];
    }

    /**
     * Returns a trimmed string.
     *
     * @param {*} value
     * @returns {string}
     */
    function cleanText(value) {
        return String(
            value ?? ""
        ).trim();
    }

    /**
     * Resolves definitions supplied through the mapping context.
     *
     * Caller-supplied definitions take priority over the shared module.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function resolveDefinitions(context) {
        return {
            ...defaultDefinitions(),
            ...asObject(
                context?.definitions
            )
        };
    }

    /**
     * Converts a value into a non-negative integer.
     *
     * @param {*} value
     * @param {number} [fallback=0]
     * @returns {number}
     */
    function normaliseNumber(
        value,
        fallback = 0
    ) {
        const helper =
            utils().normaliseNumber;

        if (
            typeof helper === "function"
        ) {
            return helper(
                value,
                fallback
            );
        }

        const numeric =
            Number.parseInt(
                value,
                10
            );

        return (
            Number.isFinite(numeric) &&
            numeric >= 0
        )
            ? numeric
            : fallback;
    }

    /**
     * Returns display labels matching selected option values.
     *
     * @param {Array} values
     * @param {Array} options
     * @returns {Array<string>}
     */
    function labelsFor(
        values,
        options
    ) {
        const helper =
            utils().labelsFor;

        if (
            typeof helper === "function"
        ) {
            return helper(
                values,
                options
            );
        }

        const labels =
            Object.fromEntries(
                (
                    Array.isArray(options)
                        ? options
                        : []
                )
                    .filter((option) => {
                        return (
                            Array.isArray(option) &&
                            option.length >= 2
                        );
                    })
                    .map(([value, label]) => {
                        return [
                            value,
                            label
                        ];
                    })
            );

        return (
            Array.isArray(values)
                ? values
                : []
        )
            .map((value) => {
                return labels[value];
            })
            .filter(Boolean);
    }

    /**
     * Converts the selected remote-work range into the value expected by the
     * report and compliance logic.
     *
     * @param {Object} answers
     * @returns {number|string}
     */
    function remoteReportValue(answers) {
        const helper =
            utils().remoteReportValue;

        if (
            typeof helper === "function"
        ) {
            return helper(answers);
        }

        if (
            answers.remoteBand ===
            "exact"
        ) {
            return normaliseNumber(
                answers.remoteExact
            );
        }

        const values = {
            "0": 0,
            "1-24": 12,
            "25-50": 38,
            "51-75": 63,
            "76-99": 88,
            "100": 100,
            "not-sure": "Not Sure"
        };

        return (
            values[
                answers.remoteBand
            ] ??
            ""
        );
    }

    /**
     * Normalises text for simple comparisons.
     *
     * @param {*} value
     * @returns {string}
     */
    function normaliseSearchText(value) {
        const helper =
            utils()
                .normaliseSearchText;

        if (
            typeof helper === "function"
        ) {
            return helper(value);
        }

        return cleanText(value)
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[&]/g, " and ")
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\s+/g, " ");
    }

    /**
     * Resolves the industry name to store in the report.
     *
     * Supported context shapes:
     *
     * {
     *   effectiveIndustryName(answers) {}
     * }
     *
     * or:
     *
     * {
     *   industryCatalog: {
     *     getEffectiveName(answers) {}
     *   }
     * }
     *
     * @param {Object} answers
     * @param {Object} context
     * @returns {string}
     */
    function effectiveIndustryName(
        answers,
        context = {}
    ) {
        if (
            typeof context
                .effectiveIndustryName ===
                "function"
        ) {
            try {
                const value =
                    context
                        .effectiveIndustryName(
                            answers
                        );

                if (cleanText(value)) {
                    return cleanText(
                        value
                    );
                }
            } catch (error) {
                console.warn(
                    "GrowWithHR: the supplied industry-name resolver failed.",
                    error
                );
            }
        }

        const catalog =
            context.industryCatalog;

        if (
            catalog &&
            typeof catalog
                .getEffectiveName ===
                "function"
        ) {
            try {
                const value =
                    catalog
                        .getEffectiveName(
                            answers
                        );

                if (cleanText(value)) {
                    return cleanText(
                        value
                    );
                }
            } catch (error) {
                console.warn(
                    "GrowWithHR: the industry catalogue could not resolve the report industry.",
                    error
                );
            }
        }

        const industry =
            cleanText(
                answers.industry
            );

        const customIndustry =
            cleanText(
                answers
                    .customIndustry
            );

        const isOther =
            cleanText(
                answers.industryId
            ) === "other" ||
            normaliseSearchText(
                industry
            ) === "other";

        if (isOther) {
            return (
                customIndustry ||
                "Other"
            );
        }

        return industry;
    }

    /**
     * Resolves the user-facing recipient-role label.
     *
     * @param {*} role
     * @param {Object} definitions
     * @returns {string}
     */
    function roleLabel(
        role,
        definitions
    ) {
        const value =
            cleanText(role);

        const labels =
            asObject(
                definitions
                    .ROLE_LABELS
            );

        return cleanText(
            labels[value] ||
            value
        );
    }

    /**
     * Returns a valid ISO date string.
     *
     * A supplied timestamp is useful for tests and coordinated record
     * creation. Invalid or missing values use the current date and time.
     *
     * @param {*} value
     * @returns {string}
     */
    function isoTimestamp(value) {
        if (value instanceof Date) {
            if (
                Number.isFinite(
                    value.getTime()
                )
            ) {
                return value
                    .toISOString();
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
                return date
                    .toISOString();
            }
        }

        return new Date()
            .toISOString();
    }

    /**
     * Creates the report object currently consumed by:
     *
     * - executive-advisory-report.js
     * - pdf.js
     * - gmail-service.js
     *
     * @param {Object} context
     * @param {Object} context.answers
     * @param {Object} context.lead
     * @param {Object} [context.definitions]
     * @param {Object} [context.industryCatalog]
     * @param {Function} [context.effectiveIndustryName]
     * @param {string|Date} [context.generatedAt]
     * @param {string} [context.reportSource]
     * @returns {Object}
     */
    function buildReportData(
        context = {}
    ) {
        const answers =
            asObject(
                context.answers
            );

        const lead =
            asObject(
                context.lead
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const expansionPlanCodes =
            asArray(
                answers
                    .expansionPlans
            );

        const priorityCodes =
            asArray(
                answers.priorities
            );

        const expansionLabels =
            labelsFor(
                expansionPlanCodes,
                definitions
                    .EXPANSION_OPTIONS
            );

        const priorityLabels =
            labelsFor(
                priorityCodes,
                definitions
                    .PRIORITY_OPTIONS
            );

        return {
            companyName:
                cleanText(
                    answers
                        .companyName
                ),

            industry:
                effectiveIndustryName(
                    answers,
                    context
                ),

            industryId:
                cleanText(
                    answers
                        .industryId
                ),

            industryCategory:
                cleanText(
                    answers
                        .industryCategory
                ),

            industryRuleProfile:
                cleanText(
                    answers
                        .industryRuleProfile
                ),

            customIndustry:
                cleanText(
                    answers
                        .customIndustry
                ),

            nature:
                cleanText(
                    answers.nature
                ),

            founded:
                answers.foundedNotSure
                    ? "Not Sure"
                    : cleanText(
                        answers.founded
                    ),

            entity:
                cleanText(
                    answers.entity
                ),

            fundingStage:
                cleanText(
                    answers
                        .fundingStage
                ),

            employees:
                normaliseNumber(
                    answers.employees
                ),

            contractWorkers:
                normaliseNumber(
                    answers
                        .contractWorkers
                ),

            interns:
                normaliseNumber(
                    answers.interns
                ),

            apprentices:
                normaliseNumber(
                    answers.apprentices
                ),

            workModel:
                cleanText(
                    answers.workModel
                ),

            remoteWorkforce:
                remoteReportValue(
                    answers
                ),

            primaryState:
                cleanText(
                    answers
                        .primaryState
                ),

            /*
             * `state` is retained for compatibility with older report and
             * compliance consumers.
             */
            state:
                cleanText(
                    answers
                        .primaryState
                ),

            locations:
                normaliseNumber(
                    answers.locations,
                    1
                ),

            countries:
                normaliseNumber(
                    answers.countries,
                    1
                ),

            hiringPlans:
                cleanText(
                    answers
                        .hiringPlans
                ),

            expansionPlans:
                expansionLabels
                    .join(", "),

            expansionPlanCodes,

            growthContext:
                cleanText(
                    answers
                        .growthContext
                ),

            peopleFunction:
                cleanText(
                    answers
                        .peopleFunction
                ),

            priorities:
                priorityLabels,

            priorityCodes,

            recipientName:
                cleanText(
                    lead.name
                ),

            recipientEmail:
                cleanText(
                    lead.email
                ),

            recipientRole:
                roleLabel(
                    lead.role,
                    definitions
                ),

            deliveryRequested:
                true,

            marketingConsent:
                Boolean(
                    lead
                        .marketingConsent
                ),

            generatedAt:
                isoTimestamp(
                    context.generatedAt
                ),

            source:
                cleanText(
                    context.reportSource
                ) ||
                DEFAULT_REPORT_SOURCE
        };
    }

    /**
     * Creates the lead record currently consumed by delivery integrations.
     *
     * @param {Object} context
     * @param {Object} context.answers
     * @param {Object} context.lead
     * @param {Object} [context.definitions]
     * @param {Object} [context.industryCatalog]
     * @param {Function} [context.effectiveIndustryName]
     * @param {string|Date} [context.capturedAt]
     * @param {string} [context.leadSource]
     * @returns {Object}
     */
    function buildLeadRecord(
        context = {}
    ) {
        const answers =
            asObject(
                context.answers
            );

        const lead =
            asObject(
                context.lead
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const priorityCodes =
            asArray(
                answers.priorities
            );

        return {
            name:
                cleanText(
                    lead.name
                ),

            email:
                cleanText(
                    lead.email
                ),

            role:
                roleLabel(
                    lead.role,
                    definitions
                ),

            deliveryRequested:
                true,

            marketingConsent:
                Boolean(
                    lead
                        .marketingConsent
                ),

            companyName:
                cleanText(
                    answers
                        .companyName
                ),

            industry:
                effectiveIndustryName(
                    answers,
                    context
                ),

            industryId:
                cleanText(
                    answers
                        .industryId
                ),

            industryCategory:
                cleanText(
                    answers
                        .industryCategory
                ),

            industryRuleProfile:
                cleanText(
                    answers
                        .industryRuleProfile
                ),

            employees:
                normaliseNumber(
                    answers.employees
                ),

            peopleFunction:
                cleanText(
                    answers
                        .peopleFunction
                ),

            priorities:
                labelsFor(
                    priorityCodes,
                    definitions
                        .PRIORITY_OPTIONS
                ),

            capturedAt:
                isoTimestamp(
                    context.capturedAt
                ),

            source:
                cleanText(
                    context.leadSource
                ) ||
                DEFAULT_LEAD_SOURCE
        };
    }

    /**
     * Builds both records using one shared timestamp.
     *
     * This is useful when a single submission should have matching report
     * and lead-record timestamps.
     *
     * @param {Object} context
     * @returns {{
     *   report: Object,
     *   lead: Object
     * }}
     */
    function buildRecords(
        context = {}
    ) {
        const timestamp =
            isoTimestamp(
                context.timestamp ||
                context.generatedAt ||
                context.capturedAt
            );

        return {
            report:
                buildReportData({
                    ...context,
                    generatedAt:
                        timestamp
                }),

            lead:
                buildLeadRecord({
                    ...context,
                    capturedAt:
                        timestamp
                })
        };
    }

    /**
     * Builds the data sent to the PDF service.
     *
     * @param {Object} context
     * @param {Object} [context.report]
     * @param {Object} [context.leadRecord]
     * @returns {Object}
     */
    function buildPdfPayload(
        context = {}
    ) {
        const answers =
            asObject(
                context.answers
            );

        const report =
            asObject(
                context.report
            );

        const lead =
            asObject(
                context.leadRecord
            );

        return {
            report:
                Object.keys(report)
                    .length
                    ? report
                    : buildReportData(
                        context
                    ),

            lead:
                Object.keys(lead)
                    .length
                    ? lead
                    : buildLeadRecord(
                        context
                    ),

            answers: {
                ...answers,

                expansionPlans:
                    asArray(
                        answers
                            .expansionPlans
                    ),

                priorities:
                    asArray(
                        answers.priorities
                    )
            }
        };
    }

    /**
     * Creates mapping functions bound to one shared context.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function create(context = {}) {
        return Object.freeze({
            buildReportData(
                overrides = {}
            ) {
                return buildReportData({
                    ...context,
                    ...asObject(
                        overrides
                    )
                });
            },

            buildReport(
                overrides = {}
            ) {
                return buildReportData({
                    ...context,
                    ...asObject(
                        overrides
                    )
                });
            },

            buildLeadRecord(
                overrides = {}
            ) {
                return buildLeadRecord({
                    ...context,
                    ...asObject(
                        overrides
                    )
                });
            },

            buildRecords(
                overrides = {}
            ) {
                return buildRecords({
                    ...context,
                    ...asObject(
                        overrides
                    )
                });
            },

            buildPdfPayload(
                overrides = {}
            ) {
                return buildPdfPayload({
                    ...context,
                    ...asObject(
                        overrides
                    )
                });
            }
        });
    }

    const ReportMapper = {
        moduleVersion: "1.0.0",

        DEFAULT_REPORT_SOURCE,
        DEFAULT_LEAD_SOURCE,

        create,

        buildReport:
            buildReportData,

        buildReportData,
        buildLeadRecord,
        buildRecords,
        buildPdfPayload,

        effectiveIndustryName,
        remoteReportValue,
        roleLabel,
        labelsFor,
        normaliseNumber,
        isoTimestamp
    };

    modules.ReportMapper =
        Object.freeze(
            ReportMapper
        );
})();
