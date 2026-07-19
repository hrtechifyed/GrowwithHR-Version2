/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment Review Builder

   Responsibility:
   - Build the four assessment review summaries
   - Format company, workforce, operations and growth answers
   - Preserve the current production review wording
   - Apply completed summaries to the review-screen elements

   This module must not:
   - read or write localStorage;
   - attach event listeners;
   - validate assessment answers;
   - change assessment navigation;
   - generate report data;
   - generate PDFs;
   - send email-delivery requests.

   The primary output is a structured review-summary object.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

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
     * Returns the shared utility helpers.
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
     * Returns a safe array.
     *
     * @param {*} value
     * @returns {Array}
     */
    function asArray(value) {
        return Array.isArray(value)
            ? value
            : [];
    }

    /**
     * Resolves definitions supplied by the facade.
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
     * Returns one trimmed answer or a fallback.
     *
     * @param {Object} answers
     * @param {string} key
     * @param {*} fallback
     * @returns {*}
     */
    function answerText(
        answers,
        key,
        fallback
    ) {
        const helper =
            utils().answerText;

        if (
            typeof helper === "function"
        ) {
            return helper(
                answers,
                key,
                fallback
            );
        }

        const value =
            String(
                answers?.[key] ?? ""
            ).trim();

        return value || fallback;
    }

    /**
     * Determines whether a value represents a finite number.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function hasNumber(value) {
        const helper =
            utils().hasNumber;

        if (
            typeof helper === "function"
        ) {
            return helper(value);
        }

        return (
            value !== "" &&
            value !== null &&
            value !== undefined &&
            Number.isFinite(
                Number(value)
            )
        );
    }

    /**
     * Returns a numeric value as text or returns a fallback.
     *
     * @param {*} value
     * @param {*} fallback
     * @returns {*}
     */
    function numberText(
        value,
        fallback
    ) {
        const helper =
            utils().numberText;

        if (
            typeof helper === "function"
        ) {
            return helper(
                value,
                fallback
            );
        }

        return hasNumber(value)
            ? String(value)
            : fallback;
    }

    /**
     * Adds an English article to a label.
     *
     * @param {*} value
     * @returns {string}
     */
    function withArticle(value) {
        const helper =
            utils().withArticle;

        if (
            typeof helper === "function"
        ) {
            return helper(value);
        }

        const cleaned =
            String(value || "").trim();

        if (!cleaned) {
            return "the selected structure";
        }

        if (
            /^(a|an|the)\s/i.test(
                cleaned
            )
        ) {
            return cleaned;
        }

        const article =
            /^[aeiou]/i.test(cleaned)
                ? "an"
                : "a";

        return `${article} ${cleaned}`;
    }

    /**
     * Ensures a non-empty value ends with sentence punctuation.
     *
     * @param {*} value
     * @returns {string}
     */
    function ensureSentence(value) {
        const helper =
            utils().ensureSentence;

        if (
            typeof helper === "function"
        ) {
            return helper(value);
        }

        const cleaned =
            String(value || "").trim();

        if (!cleaned) {
            return "";
        }

        return /[.!?]$/.test(cleaned)
            ? cleaned
            : `${cleaned}.`;
    }

    /**
     * Formats a list using natural-language punctuation.
     *
     * @param {Array} items
     * @returns {string}
     */
    function humanList(items) {
        const helper =
            utils().humanList;

        if (
            typeof helper === "function"
        ) {
            return helper(items);
        }

        const safeItems =
            asArray(items)
                .filter((item) => {
                    return (
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== ""
                    );
                });

        if (safeItems.length <= 1) {
            return safeItems[0] || "";
        }

        if (safeItems.length === 2) {
            return (
                `${safeItems[0]} and ` +
                `${safeItems[1]}`
            );
        }

        return (
            `${safeItems.slice(0, -1).join(", ")}, ` +
            `and ${safeItems[safeItems.length - 1]}`
        );
    }

    /**
     * Returns the correct singular or plural noun.
     *
     * @param {string} word
     * @param {*} value
     * @returns {string}
     */
    function pluralise(
        word,
        value
    ) {
        const helper =
            utils().pluralise;

        if (
            typeof helper === "function"
        ) {
            return helper(
                word,
                value
            );
        }

        return Number(value) === 1
            ? word
            : `${word}s`;
    }

    /**
     * Returns display labels for selected option values.
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

        const labelLookup =
            Object.fromEntries(
                asArray(options)
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

        return asArray(values)
            .map((value) => {
                return labelLookup[value];
            })
            .filter(Boolean);
    }

    /**
     * Returns a user-facing remote-work description.
     *
     * @param {Object} answers
     * @param {Array} remoteOptions
     * @returns {string}
     */
    function remoteDescription(
        answers,
        remoteOptions
    ) {
        const helper =
            utils().remoteDescription;

        if (
            typeof helper === "function"
        ) {
            return helper(
                answers,
                remoteOptions
            );
        }

        const labels =
            Object.fromEntries(
                asArray(remoteOptions)
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

        if (
            answers.remoteBand ===
            "exact"
        ) {
            return (
                `${answers.remoteExact || 0}% ` +
                "of the workforce working remotely"
            );
        }

        const label =
            labels[
                answers.remoteBand
            ] ||
            "the remote-work proportion not specified";

        return label === "None"
            ? "no regular remote workforce"
            : (
                `${String(label).toLowerCase()} ` +
                "working remotely"
            );
    }

    /**
     * Returns a sentence fragment describing hiring plans.
     *
     * @param {Object} answers
     * @param {Array} hiringOptions
     * @returns {string}
     */
    function hiringDescription(
        answers,
        hiringOptions
    ) {
        const helper =
            utils().hiringDescription;

        if (
            typeof helper === "function"
        ) {
            return helper(
                answers,
                hiringOptions
            );
        }

        const labels =
            Object.fromEntries(
                asArray(hiringOptions)
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

        const label =
            labels[
                answers.hiringPlans
            ] ||
            "keep hiring flexible";

        return String(label)
            .replace(
                /^Grow /,
                "grow "
            )
            .replace(
                /^Hire /,
                "hire "
            )
            .replace(
                /^Stay /,
                "stay "
            )
            .replace(
                /^Unsure /,
                "remain unsure "
            );
    }

    /**
     * Resolves the effective industry name.
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
        context
    ) {
        if (
            typeof context
                ?.effectiveIndustryName ===
                "function"
        ) {
            const supplied =
                context
                    .effectiveIndustryName(
                        answers
                    );

            if (
                String(
                    supplied || ""
                ).trim()
            ) {
                return String(
                    supplied
                ).trim();
            }
        }

        const catalog =
            context?.industryCatalog;

        if (
            catalog &&
            typeof catalog
                .getEffectiveName ===
                "function"
        ) {
            const resolved =
                catalog
                    .getEffectiveName(
                        answers
                    );

            if (
                String(
                    resolved || ""
                ).trim()
            ) {
                return String(
                    resolved
                ).trim();
            }
        }

        const selectedIndustry =
            String(
                answers.industry || ""
            ).trim();

        const customIndustry =
            String(
                answers.customIndustry ||
                ""
            ).trim();

        const industryId =
            String(
                answers.industryId ||
                ""
            ).trim();

        if (
            industryId === "other" ||
            selectedIndustry.toLowerCase() ===
                "other"
        ) {
            return (
                customIndustry ||
                "Other"
            );
        }

        return selectedIndustry;
    }

    /**
     * Builds the business summary shown on the review screen.
     *
     * @param {Object} answers
     * @param {Object} context
     * @returns {string}
     */
    function buildBusinessSummary(
        answers,
        context = {}
    ) {
        const company =
            answerText(
                answers,
                "companyName",
                "Your organisation"
            );

        const industry =
            effectiveIndustryName(
                answers,
                context
            ) ||
            "the selected industry";

        const founded =
            answers.foundedNotSure
                ? (
                    "with its founding " +
                    "year not specified"
                )
                : answers.founded
                    ? (
                        `established in ` +
                        `${answers.founded}`
                    )
                    : (
                        "with its founding " +
                        "year not specified"
                    );

        const entity =
            answerText(
                answers,
                "entity",
                "its selected legal structure"
            );

        const nature =
            answerText(
                answers,
                "nature",
                "Its primary business has not been described yet"
            );

        return (
            `${company} is a ${industry} ` +
            `organisation ${founded}. ` +
            `It operates as ${withArticle(entity)}. ` +
            `${ensureSentence(nature)}`
        );
    }

    /**
     * Builds the workforce summary shown on the review screen.
     *
     * @param {Object} answers
     * @param {Object} definitions
     * @returns {string}
     */
    function buildPeopleSummary(
        answers,
        definitions
    ) {
        const employees =
            numberText(
                answers.employees,
                "an unspecified number of"
            );

        const workforceParts = [];

        if (
            hasNumber(
                answers.contractWorkers
            )
        ) {
            workforceParts.push(
                `${answers.contractWorkers} supporting contractors`
            );
        }

        if (
            hasNumber(
                answers.interns
            )
        ) {
            workforceParts.push(
                `${answers.interns} interns`
            );
        }

        if (
            hasNumber(
                answers.apprentices
            )
        ) {
            workforceParts.push(
                `${answers.apprentices} apprentices`
            );
        }

        const workforceDetail =
            workforceParts.length
                ? (
                    `, alongside ` +
                    `${humanList(workforceParts)}`
                )
                : "";

        const workModel =
            String(
                answerText(
                    answers,
                    "workModel",
                    "the selected working model"
                )
            ).toLowerCase();

        const remote =
            remoteDescription(
                answers,
                asArray(
                    definitions
                        .REMOTE_OPTIONS
                )
            );

        return (
            `The organisation has approximately ` +
            `${employees} employees${workforceDetail}. ` +
            `The team works through ${workModel}, ` +
            `with ${remote}.`
        );
    }

    /**
     * Builds the operating-footprint summary shown on the review screen.
     *
     * @param {Object} answers
     * @returns {string}
     */
    function buildOperationsSummary(
        answers
    ) {
        const state =
            answerText(
                answers,
                "primaryState",
                "an unspecified primary location"
            );

        const locations =
            answerText(
                answers,
                "locations",
                "an unspecified number of"
            );

        const countries =
            answerText(
                answers,
                "countries",
                "an unspecified number of"
            );

        return (
            `Operations are primarily based in ${state}, ` +
            `across ${locations} permanent ` +
            `${pluralise("location", locations)} ` +
            `in ${countries} ` +
            `${pluralise("country", countries)}.`
        );
    }

    /**
     * Builds the growth and priority summary shown on the review screen.
     *
     * @param {Object} answers
     * @param {Object} definitions
     * @returns {string}
     */
    function buildGrowthSummary(
        answers,
        definitions
    ) {
        const hiring =
            hiringDescription(
                answers,
                asArray(
                    definitions
                        .HIRING_OPTIONS
                )
            );

        const expansion =
            labelsFor(
                asArray(
                    answers
                        .expansionPlans
                ),
                asArray(
                    definitions
                        .EXPANSION_OPTIONS
                )
            );

        const priorities =
            labelsFor(
                asArray(
                    answers.priorities
                ),
                asArray(
                    definitions
                        .PRIORITY_OPTIONS
                )
            );

        const expansionText =
            expansion.length
                ? (
                    humanList(
                        expansion
                    ).toLowerCase()
                )
                : (
                    "keep its plans flexible"
                );

        const priorityText =
            priorities.length
                ? (
                    humanList(
                        priorities
                    ).toLowerCase()
                )
                : "people planning";

        return (
            `The organisation expects to ${hiring} ` +
            `and is likely to ${expansionText}. ` +
            `Its immediate advisory priorities are ` +
            `${priorityText}.`
        );
    }

    /**
     * Builds all four review summaries.
     *
     * @param {Object} context
     * @param {Object} context.answers
     * @param {Object} [context.definitions]
     * @param {Object} [context.industryCatalog]
     * @param {Function} [context.effectiveIndustryName]
     * @returns {{
     *   business: string,
     *   people: string,
     *   operations: string,
     *   growth: string
     * }}
     */
    function buildReviewSummaries(
        context = {}
    ) {
        const answers =
            asObject(
                context.answers
            );

        const definitions =
            resolveDefinitions(
                context
            );

        return {
            business:
                buildBusinessSummary(
                    answers,
                    context
                ),

            people:
                buildPeopleSummary(
                    answers,
                    definitions
                ),

            operations:
                buildOperationsSummary(
                    answers
                ),

            growth:
                buildGrowthSummary(
                    answers,
                    definitions
                )
        };
    }

    /**
     * Applies review-summary strings to the existing review-screen elements.
     *
     * Supported element object:
     *
     * {
     *   businessSummary: HTMLElement,
     *   peopleSummary: HTMLElement,
     *   operationsSummary: HTMLElement,
     *   growthSummary: HTMLElement
     * }
     *
     * @param {Object} elements
     * @param {Object} summaries
     * @returns {Object}
     */
    function applyReviewSummaries(
        elements,
        summaries
    ) {
        const targets =
            asObject(elements);

        const review =
            asObject(summaries);

        if (
            targets.businessSummary
        ) {
            targets
                .businessSummary
                .textContent =
                String(
                    review.business ||
                    ""
                );
        }

        if (
            targets.peopleSummary
        ) {
            targets
                .peopleSummary
                .textContent =
                String(
                    review.people ||
                    ""
                );
        }

        if (
            targets.operationsSummary
        ) {
            targets
                .operationsSummary
                .textContent =
                String(
                    review.operations ||
                    ""
                );
        }

        if (
            targets.growthSummary
        ) {
            targets
                .growthSummary
                .textContent =
                String(
                    review.growth ||
                    ""
                );
        }

        return review;
    }

    /**
     * Builds and immediately applies the review summaries.
     *
     * @param {Object} context
     * @param {Object} elements
     * @returns {Object}
     */
    function renderReview(
        context,
        elements
    ) {
        const summaries =
            buildReviewSummaries(
                context
            );

        applyReviewSummaries(
            elements,
            summaries
        );

        return summaries;
    }

    /**
     * Creates review functions bound to a shared context.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function create(context = {}) {
        return Object.freeze({
            buildReviewSummaries() {
                return buildReviewSummaries(
                    context
                );
            },

            renderReview(elements) {
                return renderReview(
                    context,
                    elements
                );
            },

            buildBusinessSummary() {
                return buildBusinessSummary(
                    asObject(
                        context.answers
                    ),
                    context
                );
            },

            buildPeopleSummary() {
                return buildPeopleSummary(
                    asObject(
                        context.answers
                    ),
                    resolveDefinitions(
                        context
                    )
                );
            },

            buildOperationsSummary() {
                return buildOperationsSummary(
                    asObject(
                        context.answers
                    )
                );
            },

            buildGrowthSummary() {
                return buildGrowthSummary(
                    asObject(
                        context.answers
                    ),
                    resolveDefinitions(
                        context
                    )
                );
            }
        });
    }

    const AssessmentReview = {
        moduleVersion: "1.0.0",

        create,

        buildReviewSummaries,
        applyReviewSummaries,
        renderReview,

        buildBusinessSummary,
        buildPeopleSummary,
        buildOperationsSummary,
        buildGrowthSummary
    };

    modules.AssessmentReview =
        Object.freeze(
            AssessmentReview
        );
})();
