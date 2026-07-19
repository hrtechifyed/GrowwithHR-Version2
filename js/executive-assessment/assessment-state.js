/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment State

   Responsibility:
   - Create the default mutable assessment state
   - Restore and normalise saved state
   - Update answers, lead data, UI state and delivery state
   - Create safe persistence snapshots
   - Support state-change subscriptions
   - Expose compatibility properties on the existing controller

   This module must not:
   - access localStorage;
   - access or modify the DOM;
   - validate assessment answers;
   - render assessment screens;
   - generate reports or PDFs;
   - send email-delivery requests.

   Persistence remains the responsibility of AssessmentStorage.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    const LEGACY_STATE_VERSION =
        "2.1.0";

    const COMPATIBILITY_PROPERTIES =
        Object.freeze([
            "started",
            "completed",
            "currentMoment",
            "answers",
            "lead",
            "ui",
            "delivery"
        ]);

    /**
     * Returns the shared assessment definitions.
     *
     * @returns {Object}
     */
    function definitions() {
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
     * Creates a safe clone of simple assessment data.
     *
     * Assessment state contains JSON-compatible values, so a recursive
     * object and array clone is sufficient.
     *
     * @param {*} value
     * @returns {*}
     */
    function clone(value) {
        if (Array.isArray(value)) {
            return value.map((item) => {
                return clone(item);
            });
        }

        if (
            value &&
            typeof value === "object"
        ) {
            return Object.fromEntries(
                Object.entries(value)
                    .map(([key, item]) => {
                        return [
                            key,
                            clone(item)
                        ];
                    })
            );
        }

        return value;
    }

    /**
     * Returns the active persisted-state schema version.
     *
     * @returns {number}
     */
    function schemaVersion() {
        const value =
            Number(
                definitions()
                    .STATE_SCHEMA_VERSION
            );

        return (
            Number.isInteger(value) &&
            value > 0
        )
            ? value
            : 1;
    }

    /**
     * Creates the default answer object.
     *
     * @returns {Object}
     */
    function createInitialAnswers() {
        const factory =
            definitions()
                .createInitialAnswers;

        if (
            typeof factory === "function"
        ) {
            return clone(
                factory()
            );
        }

        return {
            locations: "1",
            countries: "1",
            expansionPlans: [],
            priorities: []
        };
    }

    /**
     * Creates the default lead object.
     *
     * @returns {Object}
     */
    function createInitialLead() {
        const factory =
            definitions()
                .createInitialLead;

        if (
            typeof factory === "function"
        ) {
            return clone(
                factory()
            );
        }

        return {
            name: "",
            email: "",
            role: "",
            marketingConsent: false
        };
    }

    /**
     * Creates the default UI-only state.
     *
     * @returns {Object}
     */
    function createInitialUi() {
        const factory =
            definitions()
                .createInitialUiState;

        if (
            typeof factory === "function"
        ) {
            return clone(
                factory()
            );
        }

        return {
            showSupplementalWorkforce: false
        };
    }

    /**
     * Creates the default delivery state.
     *
     * @returns {Object}
     */
    function createInitialDelivery() {
        const factory =
            definitions()
                .createInitialDeliveryState;

        if (
            typeof factory === "function"
        ) {
            return clone(
                factory()
            );
        }

        return {};
    }

    /**
     * Keeps a moment index within the configured assessment range.
     *
     * @param {*} value
     * @returns {number}
     */
    function clampMoment(value) {
        const moments =
            definitions().MOMENTS;

        const totalMoments =
            Array.isArray(moments) &&
            moments.length
                ? moments.length
                : 1;

        const helper =
            utils().clampMoment;

        if (
            typeof helper === "function"
        ) {
            return helper(
                value,
                totalMoments
            );
        }

        const maximum =
            Math.max(
                totalMoments - 1,
                0
            );

        return Math.min(
            Math.max(
                Number(value) || 0,
                0
            ),
            maximum
        );
    }

    /**
     * Normalises the answer object while preserving unknown fields.
     *
     * Unknown fields are retained because future assessment questions may
     * add values that older modules do not yet recognise.
     *
     * @param {*} value
     * @returns {Object}
     */
    function normaliseAnswers(value) {
        const answers = {
            ...createInitialAnswers(),
            ...clone(
                asObject(value)
            )
        };

        answers.expansionPlans =
            asArray(
                answers.expansionPlans
            );

        answers.priorities =
            asArray(
                answers.priorities
            );

        answers.foundedNotSure =
            Boolean(
                answers.foundedNotSure
            );

        return answers;
    }

    /**
     * Normalises lead data.
     *
     * @param {*} value
     * @returns {Object}
     */
    function normaliseLead(value) {
        const lead = {
            ...createInitialLead(),
            ...clone(
                asObject(value)
            )
        };

        lead.name =
            String(
                lead.name || ""
            ).trim();

        lead.email =
            String(
                lead.email || ""
            ).trim();

        lead.role =
            String(
                lead.role || ""
            ).trim();

        lead.marketingConsent =
            Boolean(
                lead.marketingConsent
            );

        return lead;
    }

    /**
     * Normalises UI-only state.
     *
     * @param {*} value
     * @returns {Object}
     */
    function normaliseUi(value) {
        const ui = {
            ...createInitialUi(),
            ...clone(
                asObject(value)
            )
        };

        ui.showSupplementalWorkforce =
            Boolean(
                ui.showSupplementalWorkforce
            );

        return ui;
    }

    /**
     * Normalises delivery state.
     *
     * @param {*} value
     * @returns {Object}
     */
    function normaliseDelivery(value) {
        return {
            ...createInitialDelivery(),
            ...clone(
                asObject(value)
            )
        };
    }

    /**
     * Unwraps a schema-envelope record when one is supplied.
     *
     * Both formats are supported:
     *
     * {
     *   started: true,
     *   answers: {}
     * }
     *
     * and:
     *
     * {
     *   schemaVersion: 1,
     *   data: {
     *     started: true,
     *     answers: {}
     *   }
     * }
     *
     * @param {*} value
     * @returns {Object}
     */
    function unwrapState(value) {
        const source =
            asObject(value);

        const data =
            asObject(source.data);

        if (!Object.keys(data).length) {
            return source;
        }

        return {
            ...data,

            version:
                source.version ??
                data.version,

            schemaVersion:
                source.schemaVersion ??
                data.schemaVersion,

            updatedAt:
                source.updatedAt ??
                data.updatedAt
        };
    }

    /**
     * Creates a complete normalised state object.
     *
     * @param {*} value
     * @returns {Object}
     */
    function normaliseState(value = {}) {
        const source =
            unwrapState(value);

        return {
            version:
                String(
                    source.version ||
                    LEGACY_STATE_VERSION
                ),

            schemaVersion:
                schemaVersion(),

            started:
                Boolean(
                    source.started
                ),

            completed:
                Boolean(
                    source.completed
                ),

            currentMoment:
                clampMoment(
                    source.currentMoment
                ),

            answers:
                normaliseAnswers(
                    source.answers
                ),

            lead:
                normaliseLead(
                    source.lead
                ),

            ui:
                normaliseUi(
                    source.ui
                ),

            delivery:
                normaliseDelivery(
                    source.delivery
                ),

            updatedAt:
                String(
                    source.updatedAt || ""
                )
        };
    }

    /**
     * Creates a new default state.
     *
     * @returns {Object}
     */
    function createDefaultState() {
        return normaliseState({
            version:
                LEGACY_STATE_VERSION,

            schemaVersion:
                schemaVersion(),

            started:
                false,

            completed:
                false,

            currentMoment:
                0,

            answers:
                createInitialAnswers(),

            lead:
                createInitialLead(),

            ui:
                createInitialUi(),

            delivery:
                createInitialDelivery(),

            updatedAt:
                ""
        });
    }

    /**
     * Replaces the contents of a target object while preserving its object
     * reference.
     *
     * This is useful where controller methods retain references to answers,
     * lead or UI objects.
     *
     * @param {Object} target
     * @param {Object} source
     * @returns {Object}
     */
    function replaceObjectContents(
        target,
        source
    ) {
        if (
            !target ||
            typeof target !== "object" ||
            Array.isArray(target)
        ) {
            return clone(source);
        }

        Object.keys(target)
            .forEach((key) => {
                delete target[key];
            });

        Object.assign(
            target,
            clone(source)
        );

        return target;
    }

    class AssessmentStateModel {
        /**
         * @param {Object} [initialState]
         */
        constructor(initialState = {}) {
            this._listeners =
                new Set();

            this._state =
                normaliseState(
                    initialState
                );
        }

        get version() {
            return this
                ._state
                .version;
        }

        set version(value) {
            this.setVersion(value);
        }

        get schemaVersion() {
            return this
                ._state
                .schemaVersion;
        }

        get started() {
            return this
                ._state
                .started;
        }

        set started(value) {
            this.setStarted(value);
        }

        get completed() {
            return this
                ._state
                .completed;
        }

        set completed(value) {
            this.setCompleted(value);
        }

        get currentMoment() {
            return this
                ._state
                .currentMoment;
        }

        set currentMoment(value) {
            this.setCurrentMoment(value);
        }

        get answers() {
            return this
                ._state
                .answers;
        }

        set answers(value) {
            this.replaceAnswers(value);
        }

        get lead() {
            return this
                ._state
                .lead;
        }

        set lead(value) {
            this.replaceLead(value);
        }

        get ui() {
            return this
                ._state
                .ui;
        }

        set ui(value) {
            this.replaceUi(value);
        }

        get delivery() {
            return this
                ._state
                .delivery;
        }

        set delivery(value) {
            this.replaceDelivery(
                value
            );
        }

        get updatedAt() {
            return this
                ._state
                .updatedAt;
        }

        /**
         * Returns the current live state object.
         *
         * Prefer snapshot() when the result will be persisted or sent to
         * another service.
         *
         * @returns {Object}
         */
        getState() {
            return this._state;
        }

        /**
         * Returns a safe clone of the current state.
         *
         * @returns {Object}
         */
        snapshot() {
            return {
                version:
                    this
                        ._state
                        .version,

                schemaVersion:
                    schemaVersion(),

                started:
                    Boolean(
                        this
                            ._state
                            .started
                    ),

                completed:
                    Boolean(
                        this
                            ._state
                            .completed
                    ),

                currentMoment:
                    clampMoment(
                        this
                            ._state
                            .currentMoment
                    ),

                answers:
                    normaliseAnswers(
                        this
                            ._state
                            .answers
                    ),

                lead:
                    normaliseLead(
                        this
                            ._state
                            .lead
                    ),

                ui:
                    normaliseUi(
                        this
                            ._state
                            .ui
                    ),

                delivery:
                    normaliseDelivery(
                        this
                            ._state
                            .delivery
                    ),

                updatedAt:
                    new Date()
                        .toISOString()
            };
        }

        /**
         * Returns a snapshot suitable for AssessmentStorage.writeAssessment.
         *
         * Delivery is omitted because it has its own storage record in the
         * current architecture.
         *
         * @returns {Object}
         */
        createPersistenceSnapshot() {
            const snapshot =
                this.snapshot();

            return {
                version:
                    snapshot.version,

                schemaVersion:
                    snapshot
                        .schemaVersion,

                started:
                    snapshot.started,

                completed:
                    snapshot.completed,

                currentMoment:
                    snapshot
                        .currentMoment,

                answers:
                    snapshot.answers,

                lead:
                    snapshot.lead,

                ui:
                    snapshot.ui,

                updatedAt:
                    snapshot.updatedAt
            };
        }

        /**
         * Restores a complete saved state.
         *
         * Existing object references for answers, lead, UI and delivery are
         * preserved where possible.
         *
         * @param {Object} savedState
         * @returns {Object}
         */
        restore(savedState) {
            const restored =
                normaliseState(
                    savedState
                );

            this._state.version =
                restored.version;

            this._state.schemaVersion =
                restored.schemaVersion;

            this._state.started =
                restored.started;

            this._state.completed =
                restored.completed;

            this._state.currentMoment =
                restored.currentMoment;

            this._state.answers =
                replaceObjectContents(
                    this._state.answers,
                    restored.answers
                );

            this._state.lead =
                replaceObjectContents(
                    this._state.lead,
                    restored.lead
                );

            this._state.ui =
                replaceObjectContents(
                    this._state.ui,
                    restored.ui
                );

            this._state.delivery =
                replaceObjectContents(
                    this._state.delivery,
                    restored.delivery
                );

            this._state.updatedAt =
                restored.updatedAt;

            this.notify({
                type: "restore",
                state:
                    this.snapshot()
            });

            return this.getState();
        }

        /**
         * Resets the assessment to its initial state.
         *
         * @param {Object} [options]
         * @param {boolean} [options.preserveDelivery=false]
         * @returns {Object}
         */
        reset(options = {}) {
            const preserveDelivery =
                Boolean(
                    options
                        .preserveDelivery
                );

            const previousDelivery =
                preserveDelivery
                    ? normaliseDelivery(
                        this.delivery
                    )
                    : createInitialDelivery();

            const initial =
                createDefaultState();

            initial.delivery =
                previousDelivery;

            return this.restore(
                initial
            );
        }

        /**
         * Updates the internal state from a partial object.
         *
         * @param {Object} update
         * @returns {Object}
         */
        patch(update = {}) {
            const source =
                asObject(update);

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "version"
                )
            ) {
                this.setVersion(
                    source.version,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "started"
                )
            ) {
                this.setStarted(
                    source.started,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "completed"
                )
            ) {
                this.setCompleted(
                    source.completed,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "currentMoment"
                )
            ) {
                this.setCurrentMoment(
                    source.currentMoment,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "answers"
                )
            ) {
                this.patchAnswers(
                    source.answers,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "lead"
                )
            ) {
                this.patchLead(
                    source.lead,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "ui"
                )
            ) {
                this.patchUi(
                    source.ui,
                    false
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    "delivery"
                )
            ) {
                this.patchDelivery(
                    source.delivery,
                    false
                );
            }

            this.touch();

            this.notify({
                type: "patch",
                update:
                    clone(source)
            });

            return this.getState();
        }

        setVersion(
            value,
            notify = true
        ) {
            this._state.version =
                String(
                    value ||
                    LEGACY_STATE_VERSION
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-version",

                    value:
                        this
                            ._state
                            .version
                });
            }

            return this
                ._state
                .version;
        }

        setStarted(
            value,
            notify = true
        ) {
            this._state.started =
                Boolean(value);

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-started",

                    value:
                        this
                            ._state
                            .started
                });
            }

            return this
                ._state
                .started;
        }

        setCompleted(
            value,
            notify = true
        ) {
            this._state.completed =
                Boolean(value);

            if (
                this._state.completed
            ) {
                this._state.started =
                    true;
            }

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-completed",

                    value:
                        this
                            ._state
                            .completed
                });
            }

            return this
                ._state
                .completed;
        }

        setCurrentMoment(
            value,
            notify = true
        ) {
            this._state.currentMoment =
                clampMoment(value);

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-current-moment",

                    value:
                        this
                            ._state
                            .currentMoment
                });
            }

            return this
                ._state
                .currentMoment;
        }

        replaceAnswers(
            value,
            notify = true
        ) {
            const normalized =
                normaliseAnswers(
                    value
                );

            this._state.answers =
                replaceObjectContents(
                    this._state.answers,
                    normalized
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "replace-answers",

                    answers:
                        clone(
                            this
                                ._state
                                .answers
                        )
                });
            }

            return this.answers;
        }

        patchAnswers(
            value,
            notify = true
        ) {
            const update =
                asObject(value);

            Object.assign(
                this._state.answers,
                clone(update)
            );

            this._state.answers =
                replaceObjectContents(
                    this._state.answers,
                    normaliseAnswers(
                        this
                            ._state
                            .answers
                    )
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "patch-answers",

                    update:
                        clone(update)
                });
            }

            return this.answers;
        }

        setAnswer(
            name,
            value,
            notify = true
        ) {
            const fieldName =
                String(
                    name || ""
                ).trim();

            if (!fieldName) {
                return undefined;
            }

            if (
                fieldName ===
                    "expansionPlans" ||
                fieldName ===
                    "priorities"
            ) {
                this._state.answers[
                    fieldName
                ] = asArray(value);
            } else if (
                fieldName ===
                "foundedNotSure"
            ) {
                this._state.answers[
                    fieldName
                ] = Boolean(value);

                if (
                    this._state.answers[
                        fieldName
                    ]
                ) {
                    this._state.answers
                        .founded =
                        "";
                }
            } else {
                this._state.answers[
                    fieldName
                ] = value;
            }

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-answer",

                    name:
                        fieldName,

                    value:
                        clone(
                            this
                                ._state
                                .answers[
                                    fieldName
                                ]
                        )
                });
            }

            return this
                ._state
                .answers[
                    fieldName
                ];
        }

        toggleAnswerInArray(
            name,
            value,
            selected,
            options = {}
        ) {
            const fieldName =
                String(
                    name || ""
                ).trim();

            if (!fieldName) {
                return {
                    accepted: false,
                    values: []
                };
            }

            const maximum =
                Number(
                    options.maximum
                ) || 0;

            const current =
                asArray(
                    this
                        ._state
                        .answers[
                            fieldName
                        ]
                );

            const item =
                String(
                    value ?? ""
                );

            let next =
                current.filter(
                    (currentValue) => {
                        return (
                            currentValue !==
                            item
                        );
                    }
                );

            if (selected) {
                next.push(item);
            }

            next = [
                ...new Set(next)
            ];

            if (
                maximum > 0 &&
                next.length > maximum
            ) {
                return {
                    accepted: false,
                    reason:
                        "maximum-exceeded",
                    maximum,
                    values:
                        current
                };
            }

            this.setAnswer(
                fieldName,
                next
            );

            return {
                accepted: true,
                maximum,
                values:
                    next
            };
        }

        replaceLead(
            value,
            notify = true
        ) {
            const normalized =
                normaliseLead(
                    value
                );

            this._state.lead =
                replaceObjectContents(
                    this._state.lead,
                    normalized
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "replace-lead",

                    lead:
                        clone(
                            this
                                ._state
                                .lead
                        )
                });
            }

            return this.lead;
        }

        patchLead(
            value,
            notify = true
        ) {
            const update =
                asObject(value);

            Object.assign(
                this._state.lead,
                clone(update)
            );

            this._state.lead =
                replaceObjectContents(
                    this._state.lead,
                    normaliseLead(
                        this
                            ._state
                            .lead
                    )
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "patch-lead",

                    update:
                        clone(update)
                });
            }

            return this.lead;
        }

        setLeadField(
            name,
            value,
            notify = true
        ) {
            const fieldName =
                String(
                    name || ""
                ).trim();

            if (!fieldName) {
                return undefined;
            }

            if (
                fieldName ===
                "marketingConsent"
            ) {
                this._state.lead[
                    fieldName
                ] = Boolean(value);
            } else {
                this._state.lead[
                    fieldName
                ] = String(
                    value ?? ""
                ).trim();
            }

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-lead-field",

                    name:
                        fieldName,

                    value:
                        this
                            ._state
                            .lead[
                                fieldName
                            ]
                });
            }

            return this
                ._state
                .lead[
                    fieldName
                ];
        }

        replaceUi(
            value,
            notify = true
        ) {
            const normalized =
                normaliseUi(
                    value
                );

            this._state.ui =
                replaceObjectContents(
                    this._state.ui,
                    normalized
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "replace-ui",

                    ui:
                        clone(
                            this
                                ._state
                                .ui
                        )
                });
            }

            return this.ui;
        }

        patchUi(
            value,
            notify = true
        ) {
            const update =
                asObject(value);

            Object.assign(
                this._state.ui,
                clone(update)
            );

            this._state.ui =
                replaceObjectContents(
                    this._state.ui,
                    normaliseUi(
                        this
                            ._state
                            .ui
                    )
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "patch-ui",

                    update:
                        clone(update)
                });
            }

            return this.ui;
        }

        setUiField(
            name,
            value,
            notify = true
        ) {
            const fieldName =
                String(
                    name || ""
                ).trim();

            if (!fieldName) {
                return undefined;
            }

            this._state.ui[
                fieldName
            ] = value;

            if (
                fieldName ===
                "showSupplementalWorkforce"
            ) {
                this._state.ui[
                    fieldName
                ] = Boolean(value);
            }

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "set-ui-field",

                    name:
                        fieldName,

                    value:
                        clone(
                            this
                                ._state
                                .ui[
                                    fieldName
                                ]
                        )
                });
            }

            return this
                ._state
                .ui[
                    fieldName
                ];
        }

        toggleUiField(name) {
            const fieldName =
                String(
                    name || ""
                ).trim();

            if (!fieldName) {
                return false;
            }

            const value =
                !Boolean(
                    this
                        ._state
                        .ui[
                            fieldName
                        ]
                );

            this.setUiField(
                fieldName,
                value
            );

            return value;
        }

        replaceDelivery(
            value,
            notify = true
        ) {
            const normalized =
                normaliseDelivery(
                    value
                );

            this._state.delivery =
                replaceObjectContents(
                    this._state.delivery,
                    normalized
                );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "replace-delivery",

                    delivery:
                        clone(
                            this
                                ._state
                                .delivery
                        )
                });
            }

            return this.delivery;
        }

        patchDelivery(
            value,
            notify = true
        ) {
            const update =
                asObject(value);

            Object.assign(
                this._state.delivery,
                clone(update)
            );

            this.touch();

            if (notify) {
                this.notify({
                    type:
                        "patch-delivery",

                    update:
                        clone(update)
                });
            }

            return this.delivery;
        }

        touch() {
            this._state.updatedAt =
                new Date()
                    .toISOString();

            return this
                ._state
                .updatedAt;
        }

        /**
         * Registers a state-change listener.
         *
         * @param {Function} listener
         * @returns {Function} unsubscribe function
         */
        subscribe(listener) {
            if (
                typeof listener !==
                "function"
            ) {
                return () => {};
            }

            this._listeners.add(
                listener
            );

            return () => {
                this._listeners.delete(
                    listener
                );
            };
        }

        /**
         * Notifies state subscribers.
         *
         * Listener errors are isolated so one integration cannot break the
         * assessment.
         *
         * @param {Object} event
         */
        notify(event = {}) {
            const payload = {
                ...asObject(event),

                timestamp:
                    new Date()
                        .toISOString(),

                model:
                    this
            };

            this._listeners
                .forEach((listener) => {
                    try {
                        listener(
                            payload
                        );
                    } catch (error) {
                        console.warn(
                            "GrowWithHR: an assessment-state listener failed.",
                            error
                        );
                    }
                });
        }
    }

    /**
     * Creates a new state model.
     *
     * @param {Object} [initialState]
     * @returns {AssessmentStateModel}
     */
    function create(initialState = {}) {
        return new AssessmentStateModel(
            initialState
        );
    }

    /**
     * Creates a state model using the default state.
     *
     * @returns {AssessmentStateModel}
     */
    function createDefault() {
        return create(
            createDefaultState()
        );
    }

    /**
     * Connects the existing controller properties to an AssessmentStateModel.
     *
     * After binding, existing controller code can continue using:
     *
     * this.started
     * this.completed
     * this.currentMoment
     * this.answers
     * this.lead
     * this.ui
     * this.delivery
     *
     * while the values are owned by the state model.
     *
     * Existing controller values are imported before property descriptors are
     * installed.
     *
     * @param {Object} target
     * @param {AssessmentStateModel} [model]
     * @returns {AssessmentStateModel}
     */
    function bindCompatibilityFacade(
        target,
        model
    ) {
        if (
            !target ||
            (
                typeof target !== "object" &&
                typeof target !== "function"
            )
        ) {
            throw new TypeError(
                "GrowWithHR: a controller object is required to bind assessment state."
            );
        }

        const stateModel =
            model instanceof
                AssessmentStateModel
                ? model
                : create({
                    started:
                        target.started,

                    completed:
                        target.completed,

                    currentMoment:
                        target.currentMoment,

                    answers:
                        target.answers,

                    lead:
                        target.lead,

                    ui:
                        target.ui,

                    delivery:
                        target.delivery
                });

        const descriptors = {
            started: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .started;
                },

                set(value) {
                    stateModel
                        .started =
                        value;
                }
            },

            completed: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .completed;
                },

                set(value) {
                    stateModel
                        .completed =
                        value;
                }
            },

            currentMoment: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .currentMoment;
                },

                set(value) {
                    stateModel
                        .currentMoment =
                        value;
                }
            },

            answers: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .answers;
                },

                set(value) {
                    stateModel
                        .answers =
                        value;
                }
            },

            lead: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .lead;
                },

                set(value) {
                    stateModel
                        .lead =
                        value;
                }
            },

            ui: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .ui;
                },

                set(value) {
                    stateModel
                        .ui =
                        value;
                }
            },

            delivery: {
                configurable: true,
                enumerable: true,

                get() {
                    return stateModel
                        .delivery;
                },

                set(value) {
                    stateModel
                        .delivery =
                        value;
                }
            }
        };

        Object.defineProperties(
            target,
            descriptors
        );

        Object.defineProperty(
            target,
            "assessmentState",
            {
                configurable: true,
                enumerable: false,
                writable: false,
                value:
                    stateModel
            }
        );

        return stateModel;
    }

    /**
     * Removes the compatibility property descriptors while retaining their
     * current values directly on the target.
     *
     * This is primarily intended for tests and rollback support.
     *
     * @param {Object} target
     * @returns {Object}
     */
    function unbindCompatibilityFacade(
        target
    ) {
        if (
            !target ||
            typeof target !== "object"
        ) {
            return target;
        }

        const values = {};

        COMPATIBILITY_PROPERTIES
            .forEach((propertyName) => {
                values[propertyName] =
                    clone(
                        target[
                            propertyName
                        ]
                    );
            });

        COMPATIBILITY_PROPERTIES
            .forEach((propertyName) => {
                delete target[
                    propertyName
                ];

                target[propertyName] =
                    values[
                        propertyName
                    ];
            });

        try {
            delete target
                .assessmentState;
        } catch (error) {
            console.warn(
                "GrowWithHR: the assessment-state facade reference could not be removed.",
                error
            );
        }

        return target;
    }

    const AssessmentState = {
        moduleVersion: "1.0.0",

        LEGACY_STATE_VERSION,
        COMPATIBILITY_PROPERTIES,

        create,
        createDefault,
        createDefaultState,

        normaliseState,
        normaliseAnswers,
        normaliseLead,
        normaliseUi,
        normaliseDelivery,

        bindCompatibilityFacade,
        unbindCompatibilityFacade,

        AssessmentStateModel
    };

    modules.AssessmentState =
        Object.freeze(
            AssessmentState
        );
})();
