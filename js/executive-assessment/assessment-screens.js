/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment Screen Renderers

   Responsibility:
   - Render each assessment moment
   - Use reusable field builders
   - Preserve current production HTML structure
   - Preserve CSS classes, DOM IDs and data attributes
   - Preserve restored answer values
   - Preserve conditional fields

   This module must not:
   - attach event listeners;
   - access localStorage;
   - validate answers;
   - change assessment navigation;
   - prepare reports or PDFs;
   - send email-delivery requests.

   All required state is supplied through an explicit context.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    /**
     * Returns the shared definition module.
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
     * Returns the shared field-builder module.
     *
     * @returns {Object}
     */
    function fieldModule() {
        return (
            modules.AssessmentFields ||
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
     * Escapes content inserted into an HTML attribute.
     *
     * @param {*} value
     * @returns {string}
     */
    function escapeAttribute(value) {
        const helper =
            utils().escapeAttribute;

        if (
            typeof helper === "function"
        ) {
            return helper(value);
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/`/g, "&#96;");
    }

    /**
     * Resolves definitions supplied by the caller.
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
     * Resolves the current answer object.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function resolveAnswers(context) {
        return asObject(
            context?.answers
        );
    }

    /**
     * Resolves the current UI-only state.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function resolveUi(context) {
        return asObject(
            context?.ui
        );
    }

    /**
     * Resolves field-builder functions.
     *
     * A caller may supply an already-bound field-builder object. Otherwise,
     * this module creates one using the current answer object.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function resolveFields(context) {
        const supplied =
            asObject(
                context?.fields
            );

        if (
            typeof supplied.textField === "function" &&
            typeof supplied.numberField === "function"
        ) {
            return supplied;
        }

        const create =
            fieldModule().create;

        if (
            typeof create !== "function"
        ) {
            throw new Error(
                "GrowWithHR: AssessmentFields must load before AssessmentScreens."
            );
        }

        return create({
            answers:
                resolveAnswers(
                    context
                )
        });
    }

    /**
     * Resolves the industry-search options used by the datalist.
     *
     * Supported context shapes:
     *
     * {
     *   industrySearchOptions: []
     * }
     *
     * or:
     *
     * {
     *   industryCatalog: {
     *     getSearchOptions() {}
     *   }
     * }
     *
     * @param {Object} context
     * @returns {Array}
     */
    function resolveIndustrySearchOptions(
        context
    ) {
        if (
            Array.isArray(
                context
                    ?.industrySearchOptions
            )
        ) {
            return (
                context
                    .industrySearchOptions
            );
        }

        const catalog =
            context?.industryCatalog;

        if (
            catalog &&
            typeof catalog
                .getSearchOptions ===
                "function"
        ) {
            return asArray(
                catalog
                    .getSearchOptions()
            );
        }

        return [];
    }

    /**
     * Determines whether the Other industry path is active.
     *
     * @param {Object} context
     * @returns {boolean}
     */
    function isOtherIndustrySelected(
        context
    ) {
        const answers =
            resolveAnswers(
                context
            );

        if (
            typeof context
                ?.isOtherIndustrySelected ===
                "function"
        ) {
            return Boolean(
                context
                    .isOtherIndustrySelected(
                        answers
                    )
            );
        }

        const catalog =
            context?.industryCatalog;

        if (
            catalog &&
            typeof catalog.isOther ===
                "function"
        ) {
            return Boolean(
                catalog.isOther(
                    answers.industry
                )
            );
        }

        const normalise =
            utils()
                .normaliseSearchText;

        const normalizedIndustry =
            typeof normalise === "function"
                ? normalise(
                    answers.industry
                )
                : String(
                    answers.industry || ""
                )
                    .trim()
                    .toLowerCase();

        return (
            answers.industryId ===
                "other" ||
            normalizedIndustry ===
                "other"
        );
    }

    /**
     * Renders the company basics screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderBusinessBasics(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const fields =
            resolveFields(
                context
            );

        const industryOptions =
            resolveIndustrySearchOptions(
                context
            );

        const showCustomIndustry =
            isOtherIndustrySelected(
                context
            );

        return `
            <div class="advisory-field-group">
                ${fields.textField({
                    id: "companyName",
                    label: "What should we call your organisation?",
                    helper: "Use the name your team and customers recognise.",
                    placeholder: "Example: Acme Technologies",
                    autocomplete: "organization",
                    required: true,
                    value:
                        answers
                            .companyName ||
                        ""
                })}

                ${fields.datalistField({
                    id: "industry",
                    label: "Which industry comes closest?",
                    helper: "Search by sector or a familiar term—for example, chips, VLSI, NBFC or hospital.",
                    placeholder: "Start typing an industry",
                    options:
                        industryOptions,
                    required: true,
                    value:
                        answers.industry ||
                        ""
                })}

                <div
                    id="customIndustryField"
                    class="advisory-field advisory-field--nested"
                    data-field-wrapper="customIndustry"
                    ${showCustomIndustry ? "" : "hidden"}>
                    <label for="customIndustry">
                        Tell us your industry
                        <span aria-hidden="true">*</span>
                    </label>

                    <input
                        id="customIndustry"
                        name="customIndustry"
                        type="text"
                        autocomplete="organization-title"
                        maxlength="100"
                        placeholder="Example: Space technology"
                        value="${escapeAttribute(
                            answers
                                .customIndustry ||
                            ""
                        )}"
                        aria-describedby="customIndustryHelp customIndustryError">

                    <p
                        id="customIndustryHelp"
                        class="advisory-field-help">
                        Enter the sector that best describes your organisation.
                    </p>

                    <p
                        id="customIndustryError"
                        class="advisory-field-error"
                        hidden>
                    </p>
                </div>

                ${fields.textareaField({
                    id: "nature",
                    label: "In one sentence, what does your organisation do?",
                    helper: "Focus on what you provide and who you provide it to.",
                    placeholder: "Example: We provide payroll software to growing Indian businesses.",
                    maxlength: 220,
                    required: true,
                    value:
                        answers.nature ||
                        ""
                })}
            </div>
        `;
    }

    /**
     * Renders the organisation stage screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderBusinessStage(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const fields =
            resolveFields(
                context
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const notSure =
            Boolean(
                answers
                    .foundedNotSure
            );

        return `
            <div class="advisory-field-group">
                <div
                    class="advisory-field"
                    data-field-wrapper="founded">

                    <label for="founded">
                        When did the organisation begin operating?
                        <span aria-hidden="true">*</span>
                    </label>

                    <input
                        id="founded"
                        name="founded"
                        type="text"
                        inputmode="numeric"
                        maxlength="4"
                        pattern="[0-9]{4}"
                        placeholder="YYYY"
                        value="${escapeAttribute(
                            answers.founded ||
                            ""
                        )}"
                        aria-describedby="foundedHelp foundedError"
                        ${notSure ? "disabled" : ""}>

                    <p
                        id="foundedHelp"
                        class="advisory-field-help">
                        An approximate year is enough.
                    </p>

                    <label
                        class="advisory-inline-check"
                        for="foundedNotSure">

                        <input
                            id="foundedNotSure"
                            name="foundedNotSure"
                            type="checkbox"
                            ${notSure ? "checked" : ""}>

                        <span>I’m not sure</span>
                    </label>

                    <p
                        id="foundedError"
                        class="advisory-field-error"
                        hidden>
                    </p>
                </div>

                ${fields.selectField({
                    id: "entity",
                    label: "How is the organisation legally structured?",
                    helper: "Choose the closest option. Not sure is a valid answer.",
                    options:
                        asArray(
                            definitions
                                .ENTITY_OPTIONS
                        ),
                    placeholder: "Select a legal structure",
                    required: true,
                    value:
                        answers.entity ||
                        ""
                })}

                ${fields.selectField({
                    id: "fundingStage",
                    label: "Which funding position is closest today?",
                    helper: "Choose the closest position when it is relevant to your organisation.",
                    options:
                        asArray(
                            definitions
                                .FUNDING_OPTIONS
                        ),
                    placeholder: "Select a funding position",
                    optional: true,
                    value:
                        answers
                            .fundingStage ||
                        ""
                })}
            </div>
        `;
    }

    /**
     * Renders the workforce screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderWorkforce(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const ui =
            resolveUi(
                context
            );

        const fields =
            resolveFields(
                context
            );

        const expanded =
            Boolean(
                ui
                    .showSupplementalWorkforce
            );

        return `
            <div class="advisory-field-group">
                ${fields.numberField({
                    id: "employees",
                    label: "Roughly how many employees are on the team today?",
                    helper: "A rounded number is perfectly fine.",
                    placeholder: "Example: 75",
                    required: true,
                    min: 0,
                    value:
                        answers.employees ??
                        ""
                })}

                <div class="advisory-disclosure">
                    <button
                        class="advisory-disclosure__button"
                        type="button"
                        data-toggle-supplemental-workforce
                        aria-expanded="${expanded}">

                        <span>
                            <strong>
                                Add contractors, interns or apprentices
                            </strong>

                            <small>Optional</small>
                        </span>

                        <i
                            class="fa-solid fa-chevron-${expanded ? "up" : "down"}"
                            aria-hidden="true">
                        </i>
                    </button>

                    <div
                        class="advisory-disclosure__content"
                        ${expanded ? "" : "hidden"}>

                        <div class="advisory-compact-field-grid">
                            ${fields.numberField({
                                id: "contractWorkers",
                                label: "Contract and outsourced workers",
                                optional: true,
                                min: 0,
                                value:
                                    answers
                                        .contractWorkers ??
                                    ""
                            })}

                            ${fields.numberField({
                                id: "interns",
                                label: "Interns",
                                optional: true,
                                min: 0,
                                value:
                                    answers.interns ??
                                    ""
                            })}

                            ${fields.numberField({
                                id: "apprentices",
                                label: "Apprentices",
                                optional: true,
                                min: 0,
                                value:
                                    answers
                                        .apprentices ??
                                    ""
                            })}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renders the working-model screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderWorkingModel(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const fields =
            resolveFields(
                context
            );

        const showExactPercentage =
            answers.remoteBand ===
            "exact";

        return `
            <div class="advisory-field-group">
                ${fields.choiceCards({
                    id: "workModel",
                    legend: "Which working model is closest?",
                    options:
                        asArray(
                            definitions
                                .WORK_MODEL_OPTIONS
                        ),
                    columns: 2,
                    required: true,
                    value:
                        answers.workModel ||
                        ""
                })}

                ${fields.choicePills({
                    id: "remoteBand",
                    legend: "About how much of the workforce works remotely?",
                    options:
                        asArray(
                            definitions
                                .REMOTE_OPTIONS
                        ),
                    required: true,
                    value:
                        answers.remoteBand ||
                        ""
                })}

                <div
                    id="remoteExactField"
                    class="advisory-field advisory-field--nested"
                    data-field-wrapper="remoteExact"
                    ${showExactPercentage ? "" : "hidden"}>

                    <label for="remoteExact">
                        Exact remote workforce percentage
                    </label>

                    <div class="advisory-suffix-input">
                        <input
                            id="remoteExact"
                            name="remoteExact"
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            inputmode="numeric"
                            value="${escapeAttribute(
                                answers
                                    .remoteExact ||
                                ""
                            )}"
                            aria-describedby="remoteExactError">

                        <span aria-hidden="true">%</span>
                    </div>

                    <p
                        id="remoteExactError"
                        class="advisory-field-error"
                        hidden>
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Renders the operating-footprint screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderOperatingFootprint(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const fields =
            resolveFields(
                context
            );

        return `
            <div class="advisory-field-group">
                ${fields.datalistField({
                    id: "primaryState",
                    label: "Where is your primary operating base?",
                    helper: "Select the headquarters or principal operating location.",
                    placeholder: "Start typing a state or union territory",
                    options:
                        asArray(
                            definitions.STATES
                        ),
                    required: true,
                    value:
                        answers
                            .primaryState ||
                        ""
                })}

                <div
                    class="advisory-compact-field-grid advisory-compact-field-grid--two">

                    ${fields.numberField({
                        id: "locations",
                        label: "How many permanent operating locations do you have?",
                        helper: "Include offices, plants, branches and other permanent sites.",
                        required: true,
                        min: 1,
                        value:
                            answers.locations ??
                            "1"
                    })}

                    ${fields.numberField({
                        id: "countries",
                        label: "In how many countries do you currently operate?",
                        helper: "Enter one when all operations are within a single country.",
                        required: true,
                        min: 1,
                        value:
                            answers.countries ??
                            "1"
                    })}
                </div>
            </div>
        `;
    }

    /**
     * Renders the growth-direction screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderGrowthDirection(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const fields =
            resolveFields(
                context
            );

        return `
            <div class="advisory-field-group">
                ${fields.choiceCards({
                    id: "hiringPlans",
                    legend: "What best describes your hiring plans for the next 12 months?",
                    options:
                        asArray(
                            definitions
                                .HIRING_OPTIONS
                        ),
                    columns: 1,
                    required: true,
                    value:
                        answers
                            .hiringPlans ||
                        ""
                })}

                ${fields.checkboxCards({
                    id: "expansionPlans",
                    legend: "What changes are most likely over the next 12–18 months?",
                    helper: "Select everything that applies.",
                    options:
                        asArray(
                            definitions
                                .EXPANSION_OPTIONS
                        ),
                    required: true,
                    selected:
                        asArray(
                            answers
                                .expansionPlans
                        )
                })}

                ${fields.textareaField({
                    id: "growthContext",
                    label: "Is there anything else about your plans that would help us understand the context?",
                    helper: "Optional · A sentence or two is enough.",
                    placeholder: "Add any useful context",
                    maxlength: 240,
                    optional: true,
                    showCounter: true,
                    value:
                        answers
                            .growthContext ||
                        ""
                })}
            </div>
        `;
    }

    /**
     * Renders the People-readiness screen.
     *
     * @param {Object} context
     * @returns {string}
     */
    function renderPeopleReadiness(
        context = {}
    ) {
        const answers =
            resolveAnswers(
                context
            );

        const definitions =
            resolveDefinitions(
                context
            );

        const fields =
            resolveFields(
                context
            );

        return `
            <div class="advisory-field-group">
                ${fields.choiceCards({
                    id: "peopleFunction",
                    legend: "Which description is closest to your current People or HR function?",
                    options:
                        asArray(
                            definitions
                                .PEOPLE_FUNCTION_OPTIONS
                        ),
                    columns: 2,
                    required: true,
                    value:
                        answers
                            .peopleFunction ||
                        ""
                })}

                ${fields.checkboxCards({
                    id: "priorities",
                    legend: "Where would guidance be most useful right now?",
                    helper: "Choose up to three priorities.",
                    options:
                        asArray(
                            definitions
                                .PRIORITY_OPTIONS
                        ),
                    required: true,
                    maximum: 3,
                    selected:
                        asArray(
                            answers.priorities
                        )
                })}
            </div>
        `;
    }

    const SCREEN_RENDERERS = Object.freeze({
        "business-basics":
            renderBusinessBasics,

        "business-stage":
            renderBusinessStage,

        "workforce":
            renderWorkforce,

        "working-model":
            renderWorkingModel,

        "operating-footprint":
            renderOperatingFootprint,

        "growth-direction":
            renderGrowthDirection,

        "people-readiness":
            renderPeopleReadiness,

        "renderBusinessBasics":
            renderBusinessBasics,

        "renderBusinessStage":
            renderBusinessStage,

        "renderWorkforce":
            renderWorkforce,

        "renderWorkingModel":
            renderWorkingModel,

        "renderOperatingFootprint":
            renderOperatingFootprint,

        "renderGrowthDirection":
            renderGrowthDirection,

        "renderPeopleReadiness":
            renderPeopleReadiness
    });

    /**
     * Renders a screen by moment ID, renderer method name or moment index.
     *
     * @param {string|number} identifier
     * @param {Object} context
     * @returns {string}
     */
    function renderMoment(
        identifier,
        context = {}
    ) {
        let renderer = null;

        if (
            typeof identifier ===
            "number"
        ) {
            const definitions =
                resolveDefinitions(
                    context
                );

            const moment =
                asArray(
                    definitions.MOMENTS
                )[identifier];

            if (moment) {
                renderer =
                    SCREEN_RENDERERS[
                        moment.id
                    ] ||
                    SCREEN_RENDERERS[
                        moment
                            .renderMethod
                    ];
            }
        } else {
            renderer =
                SCREEN_RENDERERS[
                    String(identifier)
                ];
        }

        if (
            typeof renderer !==
            "function"
        ) {
            console.warn(
                "GrowWithHR: no assessment screen renderer was found for:",
                identifier
            );

            return "";
        }

        return renderer(
            context
        );
    }

    /**
     * Creates screen-rendering functions bound to one context.
     *
     * @param {Object} context
     * @returns {Object}
     */
    function create(context = {}) {
        return Object.freeze({
            renderBusinessBasics() {
                return renderBusinessBasics(
                    context
                );
            },

            renderBusinessStage() {
                return renderBusinessStage(
                    context
                );
            },

            renderWorkforce() {
                return renderWorkforce(
                    context
                );
            },

            renderWorkingModel() {
                return renderWorkingModel(
                    context
                );
            },

            renderOperatingFootprint() {
                return renderOperatingFootprint(
                    context
                );
            },

            renderGrowthDirection() {
                return renderGrowthDirection(
                    context
                );
            },

            renderPeopleReadiness() {
                return renderPeopleReadiness(
                    context
                );
            },

            renderMoment(identifier) {
                return renderMoment(
                    identifier,
                    context
                );
            }
        });
    }

    const AssessmentScreens = {
        moduleVersion: "1.0.0",

        create,
        renderMoment,

        renderBusinessBasics,
        renderBusinessStage,
        renderWorkforce,
        renderWorkingModel,
        renderOperatingFootprint,
        renderGrowthDirection,
        renderPeopleReadiness
    };

    modules.AssessmentScreens =
        Object.freeze(
            AssessmentScreens
        );
})();
