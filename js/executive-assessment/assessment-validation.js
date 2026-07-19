/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment Validation

   Responsibility:
   - Validate each assessment moment
   - Validate lead and recipient information
   - Return structured validation results
   - Normalise validated text and array values
   - Preserve the existing validation messages

   This module must not:
   - access or modify the DOM;
   - display validation errors;
   - move focus;
   - scroll the page;
   - write to localStorage;
   - generate reports or PDFs;
   - send email-delivery requests.

   The compatibility facade remains responsible for displaying
   returned errors and focusing the first invalid field.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    function definitions() {
        return (
            modules.AssessmentDefinition ||
            {}
        );
    }

    function utils() {
        return (
            modules.AssessmentUtils ||
            {}
        );
    }

    /**
     * Returns a safe shallow copy of an object.
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
            ? { ...value }
            : {};
    }

    /**
     * Returns a new array containing only non-empty string values.
     *
     * @param {*} value
     * @returns {Array<string>}
     */
    function normaliseStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .map((item) => {
                return String(
                    item ?? ""
                ).trim();
            })
            .filter(Boolean);
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
     * Determines whether a value is a whole number equal to or greater than
     * the supplied minimum.
     *
     * @param {*} value
     * @param {number} [minimum=0]
     * @returns {boolean}
     */
    function isWholeNumber(
        value,
        minimum = 0
    ) {
        const text =
            String(
                value ?? ""
            ).trim();

        if (!/^\d+$/.test(text)) {
            return false;
        }

        const numeric =
            Number(text);

        return (
            Number.isSafeInteger(numeric) &&
            numeric >= minimum
        );
    }

    /**
     * Determines whether an email has a basic valid format.
     *
     * This does not confirm that the mailbox exists.
     *
     * @param {*} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        const helper =
            utils().isValidEmail;

        if (
            typeof helper === "function"
        ) {
            return helper(
                String(email || "")
            );
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
            String(email || "")
        );
    }

    /**
     * Creates an empty structured validation result.
     *
     * @param {Object} answers
     * @returns {Object}
     */
    function createResult(answers = {}) {
        return {
            valid: true,
            errors: {},
            firstInvalidField: "",
            normalizedAnswers:
                asObject(answers),
            metadata: {}
        };
    }

    /**
     * Adds one field error to a validation result.
     *
     * @param {Object} result
     * @param {string} field
     * @param {string} message
     */
    function addError(
        result,
        field,
        message
    ) {
        if (
            !result ||
            !field ||
            !message
        ) {
            return;
        }

        result.valid = false;

        result.errors[field] =
            message;

        if (!result.firstInvalidField) {
            result.firstInvalidField =
                field;
        }
    }

    /**
     * Removes a field error from a validation result.
     *
     * This is primarily useful when composing multiple validations.
     *
     * @param {Object} result
     * @param {string} field
     */
    function removeError(
        result,
        field
    ) {
        if (
            !result ||
            !result.errors ||
            !field
        ) {
            return;
        }

        delete result.errors[field];

        const fields =
            Object.keys(
                result.errors
            );

        result.valid =
            fields.length === 0;

        result.firstInvalidField =
            fields[0] || "";
    }

    /**
     * Validates and trims a required text field.
     *
     * @param {Object} result
     * @param {string} field
     * @param {string} message
     * @returns {boolean}
     */
    function requireText(
        result,
        field,
        message
    ) {
        const value =
            cleanText(
                result
                    .normalizedAnswers[
                        field
                    ]
            );

        if (!value) {
            addError(
                result,
                field,
                message
            );

            return false;
        }

        result.normalizedAnswers[
            field
        ] = value;

        return true;
    }

    /**
     * Validates a required whole-number field.
     *
     * @param {Object} result
     * @param {string} field
     * @param {string} message
     * @param {number} minimum
     * @returns {boolean}
     */
    function requireWholeNumber(
        result,
        field,
        message,
        minimum
    ) {
        const value =
            cleanText(
                result
                    .normalizedAnswers[
                        field
                    ]
            );

        if (
            !isWholeNumber(
                value,
                minimum
            )
        ) {
            addError(
                result,
                field,
                message
            );

            return false;
        }

        result.normalizedAnswers[
            field
        ] = value;

        return true;
    }

    /**
     * Finds an industry resolver from a supplied validation context.
     *
     * Accepted context shapes:
     *
     * {
     *   resolveIndustry(value) {}
     * }
     *
     * or:
     *
     * {
     *   industryCatalog: {
     *     resolve(value) {}
     *   }
     * }
     *
     * @param {Object} context
     * @returns {Function|null}
     */
    function getIndustryResolver(
        context
    ) {
        if (
            context &&
            typeof context
                .resolveIndustry ===
                "function"
        ) {
            return context
                .resolveIndustry;
        }

        if (
            context &&
            context.industryCatalog &&
            typeof context
                .industryCatalog
                .resolve ===
                "function"
        ) {
            return context
                .industryCatalog
                .resolve
                .bind(
                    context
                        .industryCatalog
                );
        }

        return null;
    }

    /**
     * Resolves an industry while allowing the compatibility facade to supply
     * the current industry-catalogue service.
     *
     * @param {string} value
     * @param {Object} answers
     * @param {Object} context
     * @returns {Object|null}
     */
    function resolveIndustry(
        value,
        answers,
        context
    ) {
        const resolver =
            getIndustryResolver(
                context
            );

        if (resolver) {
            try {
                return (
                    resolver(value) ||
                    null
                );
            } catch (error) {
                console.warn(
                    "GrowWithHR: industry validation could not resolve the selected industry.",
                    error
                );

                return null;
            }
        }

        /*
         * Temporary compatibility fallback:
         *
         * A previously resolved answer normally contains industryId. This
         * allows restored records to validate before the catalogue service is
         * fully connected to the facade.
         */
        if (
            cleanText(
                answers.industryId
            )
        ) {
            return {
                id:
                    cleanText(
                        answers.industryId
                    ),

                name:
                    cleanText(
                        answers.industry
                    ),

                category:
                    cleanText(
                        answers
                            .industryCategory
                    ),

                ruleProfile:
                    cleanText(
                        answers
                            .industryRuleProfile
                    )
            };
        }

        const normalise =
            utils()
                .normaliseSearchText;

        const normalizedValue =
            typeof normalise ===
                "function"
                ? normalise(value)
                : cleanText(value)
                    .toLowerCase();

        if (normalizedValue === "other") {
            return {
                id: "other",
                name: "Other",
                category: "Other",
                ruleProfile: "Other"
            };
        }

        return null;
    }

    /**
     * Applies a resolved industry to the normalized answer object.
     *
     * @param {Object} answers
     * @param {Object|null} industry
     * @param {string} rawValue
     */
    function applyResolvedIndustry(
        answers,
        industry,
        rawValue
    ) {
        if (!industry) {
            answers.industry =
                cleanText(rawValue);

            answers.industryId =
                "";

            answers.industryCategory =
                "";

            answers.industryRuleProfile =
                "";

            return;
        }

        answers.industry =
            cleanText(
                industry.name ||
                rawValue
            );

        answers.industryId =
            cleanText(
                industry.id
            );

        answers.industryCategory =
            cleanText(
                industry.category
            );

        answers.industryRuleProfile =
            cleanText(
                industry.ruleProfile ||
                industry.name
            );
    }

    /**
     * Validates the first assessment moment.
     *
     * @param {Object} answers
     * @param {Object} [context]
     * @returns {Object}
     */
    function validateBusinessBasics(
        answers,
        context = {}
    ) {
        const result =
            createResult(
                answers
            );

        requireText(
            result,
            "companyName",
            "Enter your organisation’s name."
        );

        const industryValue =
            cleanText(
                result
                    .normalizedAnswers
                    .industry
            );

        let industry = null;

        if (!industryValue) {
            addError(
                result,
                "industry",
                "Choose the industry that comes closest."
            );

            applyResolvedIndustry(
                result.normalizedAnswers,
                null,
                ""
            );
        } else {
            industry =
                resolveIndustry(
                    industryValue,
                    result
                        .normalizedAnswers,
                    context
                );

            applyResolvedIndustry(
                result.normalizedAnswers,
                industry,
                industryValue
            );

            if (!industry) {
                addError(
                    result,
                    "industry",
                    "Choose an industry from the suggestions, or select Other / Not listed."
                );
            }
        }

        if (
            industry?.id === "other"
        ) {
            requireText(
                result,
                "customIndustry",
                "Enter the industry that best describes your organisation."
            );
        } else {
            result.normalizedAnswers
                .customIndustry =
                cleanText(
                    result
                        .normalizedAnswers
                        .customIndustry
                );
        }

        requireText(
            result,
            "nature",
            "Describe what your organisation does in one sentence."
        );

        result.metadata
            .resolvedIndustry =
            industry;

        return result;
    }

    /**
     * Validates the company-stage moment.
     *
     * @param {Object} answers
     * @param {Object} [context]
     * @returns {Object}
     */
    function validateBusinessStage(
        answers,
        context = {}
    ) {
        const result =
            createResult(
                answers
            );

        const configuredYear =
            Number(
                context.currentYear
            );

        const currentYear =
            Number.isInteger(
                configuredYear
            )
                ? configuredYear
                : new Date()
                    .getFullYear();

        result.normalizedAnswers
            .foundedNotSure =
            Boolean(
                result
                    .normalizedAnswers
                    .foundedNotSure
            );

        const year =
            cleanText(
                result
                    .normalizedAnswers
                    .founded
            );

        if (
            !result
                .normalizedAnswers
                .foundedNotSure
        ) {
            const numericYear =
                Number(year);

            const yearValid =
                /^\d{4}$/.test(year) &&
                numericYear >= 1800 &&
                numericYear <= currentYear;

            if (!yearValid) {
                addError(
                    result,
                    "founded",
                    `Enter a four-digit year between 1800 and ${currentYear}, or choose “I’m not sure”.`
                );
            } else {
                result.normalizedAnswers
                    .founded =
                    year;
            }
        } else {
            result.normalizedAnswers
                .founded =
                "";
        }

        requireText(
            result,
            "entity",
            "Select the closest legal structure."
        );

        result.normalizedAnswers
            .fundingStage =
            cleanText(
                result
                    .normalizedAnswers
                    .fundingStage
            );

        return result;
    }

    /**
     * Validates the workforce moment.
     *
     * @param {Object} answers
     * @returns {Object}
     */
    function validateWorkforce(
        answers
    ) {
        const result =
            createResult(
                answers
            );

        requireWholeNumber(
            result,
            "employees",
            "Enter an approximate employee count. Zero is valid when there are currently no employees.",
            0
        );

        [
            "contractWorkers",
            "interns",
            "apprentices"
        ].forEach((field) => {
            const value =
                cleanText(
                    result
                        .normalizedAnswers[
                            field
                        ]
                );

            if (
                value &&
                !isWholeNumber(
                    value,
                    0
                )
            ) {
                addError(
                    result,
                    field,
                    "Enter a whole number of zero or more, or leave this optional field blank."
                );

                return;
            }

            result.normalizedAnswers[
                field
            ] = value;
        });

        return result;
    }

    /**
     * Validates the working-model moment.
     *
     * @param {Object} answers
     * @returns {Object}
     */
    function validateWorkingModel(
        answers
    ) {
        const result =
            createResult(
                answers
            );

        requireText(
            result,
            "workModel",
            "Choose the working model that is closest today."
        );

        requireText(
            result,
            "remoteBand",
            "Choose the closest remote-work range."
        );

        if (
            result
                .normalizedAnswers
                .remoteBand ===
                "exact"
        ) {
            const exact =
                cleanText(
                    result
                        .normalizedAnswers
                        .remoteExact
                );

            const numeric =
                Number(exact);

            if (
                exact === "" ||
                !Number.isFinite(
                    numeric
                ) ||
                numeric < 0 ||
                numeric > 100
            ) {
                addError(
                    result,
                    "remoteExact",
                    "Enter a percentage between 0 and 100."
                );
            } else {
                result.normalizedAnswers
                    .remoteExact =
                    exact;
            }
        } else {
            result.normalizedAnswers
                .remoteExact =
                cleanText(
                    result
                        .normalizedAnswers
                        .remoteExact
                );
        }

        return result;
    }

    /**
     * Validates the operating-footprint moment.
     *
     * @param {Object} answers
     * @returns {Object}
     */
    function validateOperatingFootprint(
        answers
    ) {
        const result =
            createResult(
                answers
            );

        requireText(
            result,
            "primaryState",
            "Enter the organisation’s primary operating location."
        );

        requireWholeNumber(
            result,
            "locations",
            "Enter at least one permanent operating location.",
            1
        );

        requireWholeNumber(
            result,
            "countries",
            "Enter at least one country.",
            1
        );

        return result;
    }

    /**
     * Validates the growth-direction moment.
     *
     * @param {Object} answers
     * @returns {Object}
     */
    function validateGrowthDirection(
        answers
    ) {
        const result =
            createResult(
                answers
            );

        requireText(
            result,
            "hiringPlans",
            "Choose the hiring outlook that is closest today."
        );

        const expansionPlans =
            normaliseStringArray(
                result
                    .normalizedAnswers
                    .expansionPlans
            );

        result.normalizedAnswers
            .expansionPlans =
            expansionPlans;

        if (
            expansionPlans.length === 0
        ) {
            addError(
                result,
                "expansionPlans",
                "Select at least one likely change."
            );
        }

        result.normalizedAnswers
            .growthContext =
            cleanText(
                result
                    .normalizedAnswers
                    .growthContext
            );

        return result;
    }

    /**
     * Validates the People-readiness moment.
     *
     * @param {Object} answers
     * @returns {Object}
     */
    function validatePeopleReadiness(
        answers
    ) {
        const result =
            createResult(
                answers
            );

        requireText(
            result,
            "peopleFunction",
            "Choose the description closest to your current People or HR support."
        );

        const priorities =
            normaliseStringArray(
                result
                    .normalizedAnswers
                    .priorities
            );

        result.normalizedAnswers
            .priorities =
            priorities;

        if (
            priorities.length === 0
        ) {
            addError(
                result,
                "priorities",
                "Choose at least one area where guidance would help."
            );
        } else if (
            priorities.length > 3
        ) {
            addError(
                result,
                "priorities",
                "Choose no more than three priorities."
            );
        }

        return result;
    }

    /**
     * Validates recipient information.
     *
     * Marketing consent and role remain optional in the current flow.
     *
     * @param {Object} lead
     * @returns {Object}
     */
    function validateLead(lead) {
        const normalizedLead = {
            ...asObject(lead),

            name:
                cleanText(
                    lead?.name
                ),

            email:
                cleanText(
                    lead?.email
                ),

            role:
                cleanText(
                    lead?.role
                ),

            marketingConsent:
                Boolean(
                    lead
                        ?.marketingConsent
                )
        };

        const result = {
            valid: true,
            errors: {},
            firstInvalidField: "",
            normalizedLead
        };

        if (!normalizedLead.name) {
            result.valid = false;

            result.errors.name =
                "Enter your name to continue.";

            result.firstInvalidField =
                "name";
        }

        if (!normalizedLead.email) {
            result.valid = false;

            result.errors.email =
                "Enter your work email to continue.";

            if (
                !result
                    .firstInvalidField
            ) {
                result.firstInvalidField =
                    "email";
            }
        } else if (
            !isValidEmail(
                normalizedLead.email
            )
        ) {
            result.valid = false;

            result.errors.email =
                "Enter a valid email address, such as name@company.com.";

            if (
                !result
                    .firstInvalidField
            ) {
                result.firstInvalidField =
                    "email";
            }
        }

        return result;
    }

    /**
     * Validates a moment using its ID, method name or numeric index.
     *
     * Supported identifiers:
     *
     * - "business-basics"
     * - "renderBusinessBasics"
     * - "validateBusinessBasics"
     * - 0
     *
     * @param {string|number} identifier
     * @param {Object} answers
     * @param {Object} [context]
     * @returns {Object}
     */
    function validateMoment(
        identifier,
        answers,
        context = {}
    ) {
        const validators = {
            "business-basics":
                validateBusinessBasics,

            "business-stage":
                validateBusinessStage,

            "workforce":
                validateWorkforce,

            "working-model":
                validateWorkingModel,

            "operating-footprint":
                validateOperatingFootprint,

            "growth-direction":
                validateGrowthDirection,

            "people-readiness":
                validatePeopleReadiness,

            "renderBusinessBasics":
                validateBusinessBasics,

            "renderBusinessStage":
                validateBusinessStage,

            "renderWorkforce":
                validateWorkforce,

            "renderWorkingModel":
                validateWorkingModel,

            "renderOperatingFootprint":
                validateOperatingFootprint,

            "renderGrowthDirection":
                validateGrowthDirection,

            "renderPeopleReadiness":
                validatePeopleReadiness,

            "validateBusinessBasics":
                validateBusinessBasics,

            "validateBusinessStage":
                validateBusinessStage,

            "validateWorkforce":
                validateWorkforce,

            "validateWorkingModel":
                validateWorkingModel,

            "validateOperatingFootprint":
                validateOperatingFootprint,

            "validateGrowthDirection":
                validateGrowthDirection,

            "validatePeopleReadiness":
                validatePeopleReadiness
        };

        if (
            typeof identifier ===
                "number"
        ) {
            const moments =
                definitions().MOMENTS;

            const moment =
                Array.isArray(moments)
                    ? moments[
                        identifier
                    ]
                    : null;

            if (moment) {
                const validator =
                    validators[
                        moment.id
                    ] ||
                    validators[
                        moment
                            .validateMethod
                    ];

                if (
                    typeof validator ===
                        "function"
                ) {
                    return validator(
                        answers,
                        context
                    );
                }
            }
        }

        const validator =
            validators[
                String(identifier)
            ];

        if (
            typeof validator !==
                "function"
        ) {
            const result =
                createResult(
                    answers
                );

            addError(
                result,
                "_moment",
                "The selected assessment step could not be validated."
            );

            return result;
        }

        return validator(
            answers,
            context
        );
    }

    /**
     * Applies normalized answers from a validation result to an existing
     * answer object.
     *
     * The facade may use this after every validation so trimmed values and
     * normalized arrays are preserved without replacing the answer reference.
     *
     * @param {Object} target
     * @param {Object} result
     * @returns {Object}
     */
    function applyNormalizedAnswers(
        target,
        result
    ) {
        if (
            !target ||
            typeof target !== "object" ||
            !result ||
            !result
                .normalizedAnswers
        ) {
            return target;
        }

        Object.assign(
            target,
            result
                .normalizedAnswers
        );

        return target;
    }

    /**
     * Applies normalized lead data to an existing lead object.
     *
     * @param {Object} target
     * @param {Object} result
     * @returns {Object}
     */
    function applyNormalizedLead(
        target,
        result
    ) {
        if (
            !target ||
            typeof target !== "object" ||
            !result ||
            !result
                .normalizedLead
        ) {
            return target;
        }

        Object.assign(
            target,
            result
                .normalizedLead
        );

        return target;
    }

    const AssessmentValidation = {
        moduleVersion: "1.0.0",

        cleanText,
        normaliseStringArray,
        isWholeNumber,
        isValidEmail,

        createResult,
        addError,
        removeError,
        requireText,
        requireWholeNumber,

        validateBusinessBasics,
        validateBusinessStage,
        validateWorkforce,
        validateWorkingModel,
        validateOperatingFootprint,
        validateGrowthDirection,
        validatePeopleReadiness,
        validateLead,
        validateMoment,

        applyNormalizedAnswers,
        applyNormalizedLead
    };

    modules.AssessmentValidation =
        Object.freeze(
            AssessmentValidation
        );
})();
