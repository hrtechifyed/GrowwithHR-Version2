/* ==========================================================
   GrowWithHR
   Executive Assessment Compatibility Facade

   Responsibility:
   - Connect the existing ExecutiveAdvisoryBriefing instance
     to the newly extracted modules
   - Preserve all current public controller properties
   - Preserve existing DOM IDs, event listeners and navigation
   - Allow incremental controller cutover
   - Fall back to the original controller when modules are absent

   Temporary migration file:
   Remove this file only after executive-assessment.js has been
   reduced to the final modular facade.
========================================================== */

(() => {
    "use strict";

    const FACADE_VERSION = "1.0.0";

    const REQUIRED_MODULES = [
        "AssessmentDefinition",
        "AssessmentUtils",
        "AssessmentStorage",
        "IndustryCatalog",
        "AssessmentValidation",
        "AssessmentFields",
        "AssessmentScreens",
        "AssessmentReview",
        "ReportMapper",
        "AdvisoryDelivery",
        "AssessmentState"
    ];

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
     * Returns a safe array copy.
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
     * Returns the shared module namespace.
     *
     * @returns {Object}
     */
    function getModules() {
        return asObject(
            window.GrowWithHRModules
        );
    }

    /**
     * Returns the names of modules that have not loaded.
     *
     * @param {Object} modules
     * @returns {Array<string>}
     */
    function missingModules(modules) {
        return REQUIRED_MODULES.filter(
            (moduleName) => {
                return !modules[moduleName];
            }
        );
    }

    /**
     * Synchronises the legacy controller catalogue properties with the
     * extracted catalogue service.
     *
     * @param {Object} application
     * @param {Object} catalogue
     */
    function synchroniseIndustryCatalogue(
        application,
        catalogue
    ) {
        application.industryCatalog =
            catalogue.getIndustries();

        application.industrySearchOptions =
            catalogue.getSearchOptions();

        application.industryLookup =
            catalogue.lookup instanceof Map
                ? catalogue.lookup
                : new Map();
    }

    /**
     * Creates the context supplied to screen, review and report modules.
     *
     * @param {Object} application
     * @param {Object} modules
     * @returns {Object}
     */
    function createModuleContext(
        application,
        modules
    ) {
        return {
            answers:
                application.answers,

            lead:
                application.lead,

            ui:
                application.ui,

            definitions:
                modules
                    .AssessmentDefinition,

            industryCatalog:
                application
                    .industryCatalogService,

            industrySearchOptions:
                application
                    .industrySearchOptions,

            effectiveIndustryName() {
                return application
                    .industryCatalogService
                    .getEffectiveName(
                        application.answers
                    );
            },

            isOtherIndustrySelected() {
                return application
                    .industryCatalogService
                    .isOther(
                        application
                            .answers
                            .industry
                    );
            }
        };
    }

    /**
     * Applies a structured assessment-validation result to the existing DOM.
     *
     * @param {Object} application
     * @param {Object} modules
     * @param {Object} result
     * @returns {boolean}
     */
    function applyAssessmentValidation(
        application,
        modules,
        result
    ) {
        modules
            .AssessmentValidation
            .applyNormalizedAnswers(
                application.answers,
                result
            );

        application.clearMomentErrors();

        Object.entries(
            asObject(result.errors)
        ).forEach(
            ([fieldName, message]) => {
                if (
                    fieldName ===
                    "_moment"
                ) {
                    return;
                }

                application.setFieldError(
                    fieldName,
                    message
                );
            }
        );

        const industryInput =
            document.getElementById(
                "industry"
            );

        if (
            industryInput &&
            application
                .answers
                .industry
        ) {
            industryInput.value =
                application
                    .answers
                    .industry;
        }

        application
            .updateDynamicVisibility();

        return application
            .finishMomentValidation(
                Boolean(result.valid)
            );
    }

    /**
     * Applies structured lead validation to the current lead form.
     *
     * @param {Object} application
     * @param {Object} modules
     * @param {Object} result
     * @returns {boolean}
     */
    function applyLeadValidation(
        application,
        modules,
        result
    ) {
        modules
            .AssessmentValidation
            .applyNormalizedLead(
                application.lead,
                result
            );

        application.clearLeadErrors();

        if (result.errors?.name) {
            application.showLeadError(
                application
                    .elements
                    .leadName,

                application
                    .elements
                    .leadNameError,

                result.errors.name
            );
        }

        if (result.errors?.email) {
            application.showLeadError(
                application
                    .elements
                    .leadEmail,

                application
                    .elements
                    .leadEmailError,

                result.errors.email
            );
        }

        if (!result.valid) {
            const firstInvalid =
                application
                    .elements
                    .leadForm
                    ?.querySelector(
                        "[aria-invalid='true']"
                    );

            firstInvalid?.focus();

            firstInvalid
                ?.scrollIntoView({
                    behavior:
                        application
                            .prefersReducedMotion()
                            ? "auto"
                            : "smooth",

                    block:
                        "center"
                });

            application.announce(
                "Enter your name and a valid email address before generating your advisory.",
                true
            );
        }

        return Boolean(result.valid);
    }

    /**
     * Opens the printable report as the fallback when direct PDF download is
     * unavailable.
     *
     * @param {Object} application
     */
    function openPrintableReport(
        application
    ) {
        const reportWindow =
            window.open(
                application.reportUrl,
                "_blank"
            );

        if (!reportWindow) {
            application.announce(
                "Allow pop-ups to open the printable advisory.",
                true
            );

            return;
        }

        try {
            reportWindow.opener =
                null;
        } catch (error) {
            /*
             * Some browsers protect the opener property.
             * Printing can continue.
             */
        }

        const requestPrint = () => {
            try {
                reportWindow.focus();
                reportWindow.print();
            } catch (error) {
                console.warn(
                    "GrowWithHR: automatic print could not start.",
                    error
                );
            }
        };

        reportWindow.addEventListener(
            "load",
            () => {
                window.setTimeout(
                    requestPrint,
                    500
                );
            },
            {
                once: true
            }
        );
    }

    /**
     * Installs catalogue delegation.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installIndustryCatalogue(
        application,
        modules
    ) {
        const catalogue =
            modules
                .IndustryCatalog
                .create({
                    dataUrl:
                        modules
                            .AssessmentDefinition
                            .INDUSTRY_DATA_URL,

                    fallback:
                        modules
                            .AssessmentDefinition
                            .INDUSTRY_FALLBACK,

                    storage:
                        modules
                            .AssessmentStorage
                });

        catalogue.prepare(
            application
                .industryCatalog
        );

        application
            .industryCatalogService =
            catalogue;

        synchroniseIndustryCatalogue(
            application,
            catalogue
        );

        application
            .readCachedIndustryCatalog =
            function readCachedIndustryCatalog() {
                return modules
                    .AssessmentStorage
                    .readIndustryCache(
                        modules
                            .AssessmentDefinition
                            .INDUSTRY_FALLBACK
                    );
            };

        application
            .prepareIndustryCatalog =
            function prepareIndustryCatalog(
                industries
            ) {
                const prepared =
                    catalogue.prepare(
                        industries
                    );

                synchroniseIndustryCatalogue(
                    application,
                    catalogue
                );

                return prepared;
            };

        application.loadIndustries =
            async function loadIndustries() {
                const result =
                    await catalogue.load();

                synchroniseIndustryCatalogue(
                    application,
                    catalogue
                );

                application
                    .refreshIndustryDatalist();

                return result;
            };

        application.resolveIndustry =
            function resolveIndustry(
                value
            ) {
                return catalogue.resolve(
                    value
                );
            };

        application.applyResolvedIndustry =
            function applyResolvedIndustry(
                input = null
            ) {
                const rawValue =
                    String(
                        input?.value ??
                        application
                            .answers
                            .industry ??
                        ""
                    ).trim();

                const industry =
                    catalogue
                        .applyToAnswers(
                            application.answers,
                            rawValue
                        );

                if (
                    input &&
                    industry
                ) {
                    input.value =
                        industry.name;
                }

                return industry;
            };

        application
            .isOtherIndustrySelected =
            function isOtherIndustrySelected() {
                return catalogue.isOther(
                    application
                        .answers
                        .industry
                );
            };

        application
            .effectiveIndustryName =
            function effectiveIndustryName() {
                return catalogue
                    .getEffectiveName(
                        application.answers
                    );
            };
    }

    /**
     * Installs rendering delegation.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installRendering(
        application,
        modules
    ) {
        const renderContext = () => {
            return createModuleContext(
                application,
                modules
            );
        };

        application.renderBusinessBasics =
            function renderBusinessBasics() {
                return modules
                    .AssessmentScreens
                    .renderBusinessBasics(
                        renderContext()
                    );
            };

        application.renderBusinessStage =
            function renderBusinessStage() {
                return modules
                    .AssessmentScreens
                    .renderBusinessStage(
                        renderContext()
                    );
            };

        application.renderWorkforce =
            function renderWorkforce() {
                return modules
                    .AssessmentScreens
                    .renderWorkforce(
                        renderContext()
                    );
            };

        application.renderWorkingModel =
            function renderWorkingModel() {
                return modules
                    .AssessmentScreens
                    .renderWorkingModel(
                        renderContext()
                    );
            };

        application.renderOperatingFootprint =
            function renderOperatingFootprint() {
                return modules
                    .AssessmentScreens
                    .renderOperatingFootprint(
                        renderContext()
                    );
            };

        application.renderGrowthDirection =
            function renderGrowthDirection() {
                return modules
                    .AssessmentScreens
                    .renderGrowthDirection(
                        renderContext()
                    );
            };

        application.renderPeopleReadiness =
            function renderPeopleReadiness() {
                return modules
                    .AssessmentScreens
                    .renderPeopleReadiness(
                        renderContext()
                    );
            };

        application.textField =
            function textField(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .textField(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.textareaField =
            function textareaField(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .textareaField(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.numberField =
            function numberField(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .numberField(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.datalistField =
            function datalistField(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .datalistField(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.renderDatalistOptions =
            function renderDatalistOptions(
                options
            ) {
                return modules
                    .AssessmentFields
                    .renderDatalistOptions(
                        options
                    );
            };

        application.selectField =
            function selectField(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .selectField(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.choiceCards =
            function choiceCards(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .choiceCards(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.choicePills =
            function choicePills(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .choicePills(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.checkboxCards =
            function checkboxCards(
                configuration
            ) {
                return modules
                    .AssessmentFields
                    .checkboxCards(
                        configuration,
                        {
                            answers:
                                application
                                    .answers
                        }
                    );
            };
    }

    /**
     * Installs validation delegation.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installValidation(
        application,
        modules
    ) {
        const validationContext = () => ({
            industryCatalog:
                application
                    .industryCatalogService,

            currentYear:
                new Date()
                    .getFullYear()
        });

        application.validateBusinessBasics =
            function validateBusinessBasics() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validateBusinessBasics(
                            application.answers,
                            validationContext()
                        )
                );
            };

        application.validateBusinessStage =
            function validateBusinessStage() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validateBusinessStage(
                            application.answers,
                            validationContext()
                        )
                );
            };

        application.validateWorkforce =
            function validateWorkforce() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validateWorkforce(
                            application.answers
                        )
                );
            };

        application.validateWorkingModel =
            function validateWorkingModel() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validateWorkingModel(
                            application.answers
                        )
                );
            };

        application.validateOperatingFootprint =
            function validateOperatingFootprint() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validateOperatingFootprint(
                            application.answers
                        )
                );
            };

        application.validateGrowthDirection =
            function validateGrowthDirection() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validateGrowthDirection(
                            application.answers
                        )
                );
            };

        application.validatePeopleReadiness =
            function validatePeopleReadiness() {
                return applyAssessmentValidation(
                    application,
                    modules,
                    modules
                        .AssessmentValidation
                        .validatePeopleReadiness(
                            application.answers
                        )
                );
            };

        application.isWholeNumber =
            function isWholeNumber(
                value,
                minimum = 0
            ) {
                return modules
                    .AssessmentValidation
                    .isWholeNumber(
                        value,
                        minimum
                    );
            };

        application.validateLead =
            function validateLead() {
                application
                    .captureLeadData();

                const result =
                    modules
                        .AssessmentValidation
                        .validateLead(
                            application.lead
                        );

                return applyLeadValidation(
                    application,
                    modules,
                    result
                );
            };
    }

    /**
     * Installs review-summary delegation.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installReview(
        application,
        modules
    ) {
        application.buildReviewSummaries =
            function buildReviewSummaries() {
                return modules
                    .AssessmentReview
                    .renderReview(
                        createModuleContext(
                            application,
                            modules
                        ),
                        application.elements
                    );
            };
    }

    /**
     * Installs report, lead and storage delegation.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installMappingAndStorage(
        application,
        modules
    ) {
        application.readDeliveryRecord =
            function readDeliveryRecord() {
                return modules
                    .AssessmentStorage
                    .readDelivery();
            };

        application.writeReportData =
            function writeReportData() {
                const reportData =
                    modules
                        .ReportMapper
                        .buildReportData(
                            createModuleContext(
                                application,
                                modules
                            )
                        );

                modules
                    .AssessmentStorage
                    .writeReport(
                        reportData
                    );

                return reportData;
            };

        application.writeLeadRecord =
            function writeLeadRecord() {
                const leadRecord =
                    modules
                        .ReportMapper
                        .buildLeadRecord(
                            createModuleContext(
                                application,
                                modules
                            )
                        );

                modules
                    .AssessmentStorage
                    .writeLead(
                        leadRecord
                    );

                window.dispatchEvent(
                    new CustomEvent(
                        "growwithhr:lead-captured",
                        {
                            detail:
                                leadRecord
                        }
                    )
                );

                return leadRecord;
            };

        application.writeDeliveryRecord =
            function writeDeliveryRecord(
                record = {}
            ) {
                const deliveryRecord =
                    modules
                        .AssessmentStorage
                        .mergeDelivery(
                            application.delivery,
                            record
                        );

                if (deliveryRecord) {
                    application.delivery =
                        deliveryRecord;
                }

                return (
                    deliveryRecord ||
                    application.delivery
                );
            };

        application.saveNow =
            function saveNow() {
                const state =
                    application
                        .assessmentState
                        ?.createPersistenceSnapshot()
                    || {
                        version:
                            "2.1.0",

                        started:
                            application.started,

                        completed:
                            application.completed,

                        currentMoment:
                            application
                                .currentMoment,

                        answers:
                            application.answers,

                        lead:
                            application.lead,

                        ui:
                            application.ui,

                        updatedAt:
                            new Date()
                                .toISOString()
                    };

                const saved =
                    modules
                        .AssessmentStorage
                        .writeAssessment(
                            state
                        );

                application
                    .updateSaveStatus(
                        saved
                            ? "Progress saved"
                            : "Progress could not be saved"
                    );

                return saved;
            };

        application.restoreState =
            function restoreState() {
                const saved =
                    modules
                        .AssessmentStorage
                        .readAssessment();

                if (!saved) {
                    return null;
                }

                const restored = {
                    ...saved,

                    delivery:
                        modules
                            .AssessmentStorage
                            .readDelivery()
                };

                if (
                    application
                        .assessmentState
                ) {
                    application
                        .assessmentState
                        .restore(
                            restored
                        );
                } else {
                    application.started =
                        Boolean(
                            restored.started
                        );

                    application.completed =
                        Boolean(
                            restored.completed
                        );

                    application.currentMoment =
                        restored
                            .currentMoment;

                    application.answers =
                        restored.answers;

                    application.lead =
                        restored.lead;

                    application.ui =
                        restored.ui;

                    application.delivery =
                        restored.delivery;
                }

                return restored;
            };

        application.clearSavedState =
            function clearSavedState() {
                const cleared =
                    modules
                        .AssessmentStorage
                        .clearUserData();

                application
                    .deliveryService
                    ?.clearRuntimeState();

                application.lastPdfDocument =
                    null;

                return cleared;
            };

        application.hasReportData =
            function hasReportData() {
                return modules
                    .AssessmentStorage
                    .hasReport();
            };
    }

    /**
     * Installs delivery orchestration.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installDelivery(
        application,
        modules
    ) {
        const deliveryService =
            modules
                .AdvisoryDelivery
                .create({
                    reportMapper:
                        modules
                            .ReportMapper
                });

        application.deliveryService =
            deliveryService;

        application.allowInterfacePaint =
            function allowInterfacePaint() {
                return modules
                    .AdvisoryDelivery
                    .allowInterfacePaint();
            };

        application.prepareAdvisoryPdf =
            async function prepareAdvisoryPdf(
                reportData,
                leadRecord
            ) {
                const documentResult =
                    await deliveryService
                        .preparePdf({
                            report:
                                reportData,

                            lead:
                                leadRecord,

                            answers:
                                application
                                    .answers
                        });

                application.lastPdfDocument =
                    documentResult;

                return documentResult;
            };

        application.deliverAdvisory =
            async function deliverAdvisory({
                action,
                leadRecord,
                reportData,
                pdfDocument
            }) {
                return deliveryService.send({
                    action,

                    lead:
                        leadRecord,

                    report:
                        reportData,

                    answers:
                        application.answers,

                    pdf:
                        pdfDocument
                });
            };

        application.submitLeadToEndpoint =
            async function submitLeadToEndpoint(
                action,
                existingPayload = null
            ) {
                const payload =
                    asObject(
                        existingPayload
                    );

                return deliveryService
                    .submitLeadToEndpoint(
                        action,
                        {
                            lead:
                                payload.lead ||
                                application
                                    .writeLeadRecord(),

                            report:
                                payload.advisory ||
                                payload.report ||
                                application
                                    .writeReportData(),

                            answers:
                                application
                                    .answers
                        }
                    );
            };

        application.submitLeadAndGenerate =
            async function submitLeadAndGenerate() {
                if (
                    application.isSubmitting ||
                    !application.validateLead()
                ) {
                    return;
                }

                application.isSubmitting =
                    true;

                application
                    .setGenerateButtonState(
                        true
                    );

                application.saveNow();

                const leadRecord =
                    application
                        .writeLeadRecord();

                const reportData =
                    application
                        .writeReportData();

                application
                    .beginGeneration();

                try {
                    const result =
                        await deliveryService
                            .prepareAndSend({
                                action:
                                    "capture",

                                lead:
                                    leadRecord,

                                report:
                                    reportData,

                                answers:
                                    application
                                        .answers,

                                onProgress(
                                    stage
                                ) {
                                    application
                                        .setGenerationStep(
                                            stage.index,
                                            stage.message
                                        );
                                }
                            });

                    application.lastPdfDocument =
                        result.pdf;

                    application
                        .writeDeliveryRecord(
                            result.delivery
                        );

                    application
                        .completeGenerationSteps();

                    application
                        .configureSuccessMessage(
                            result.delivery
                        );

                    application
                        .showSuccess();
                } catch (error) {
                    console.error(
                        "GrowWithHR: advisory generation or delivery failed.",
                        error
                    );

                    application
                        .showGenerationError(
                            "Your answers are safe, but we couldn’t finish the advisory delivery. Try again without completing the briefing again."
                        );
                } finally {
                    application.isSubmitting =
                        false;

                    application
                        .setGenerateButtonState(
                            false
                        );
                }
            };

        application.downloadReport =
            async function downloadReport() {
                const button =
                    application
                        .elements
                        .downloadReportButton;

                const reportData =
                    application
                        .writeReportData();

                const leadRecord =
                    application
                        .writeLeadRecord();

                if (button) {
                    button.disabled =
                        true;
                }

                try {
                    const result =
                        await deliveryService
                            .download({
                                report:
                                    reportData,

                                lead:
                                    leadRecord,

                                answers:
                                    application
                                        .answers,

                                pdf:
                                    application
                                        .lastPdfDocument,

                                reportUrl:
                                    application
                                        .reportUrl
                            });

                    application.lastPdfDocument =
                        result.pdf ||
                        application
                            .lastPdfDocument;

                    if (
                        result.mode ===
                        "print-fallback"
                    ) {
                        openPrintableReport(
                            application
                        );
                    }
                } catch (error) {
                    console.error(
                        "GrowWithHR: PDF download failed.",
                        error
                    );

                    application.announce(
                        "We could not download the PDF just yet. Open the advisory and use Print instead.",
                        true
                    );
                } finally {
                    if (button) {
                        button.disabled =
                            false;
                    }
                }
            };

        application.requestAnotherEmail =
            async function requestAnotherEmail() {
                const button =
                    application
                        .elements
                        .emailAgainButton;

                if (
                    !button ||
                    button.disabled
                ) {
                    return;
                }

                const originalText =
                    button.textContent;

                button.disabled =
                    true;

                button.textContent =
                    "Sending another copy…";

                try {
                    const result =
                        await deliveryService
                            .resendCustomer({
                                lead:
                                    application
                                        .writeLeadRecord(),

                                report:
                                    application
                                        .writeReportData(),

                                answers:
                                    application
                                        .answers,

                                pdf:
                                    application
                                        .lastPdfDocument
                            });

                    application.lastPdfDocument =
                        result.pdf ||
                        application
                            .lastPdfDocument;

                    application
                        .writeDeliveryRecord(
                            result.delivery
                        );

                    button.textContent =
                        "Copy sent";

                    application.announce(
                        `Another advisory copy has been sent to ${application.lead.email}.`
                    );
                } catch (error) {
                    console.error(
                        "GrowWithHR: advisory resend failed.",
                        error
                    );

                    button.textContent =
                        "Couldn’t send copy";

                    application.announce(
                        "We could not send another email copy just yet.",
                        true
                    );
                } finally {
                    window.setTimeout(
                        () => {
                            button.disabled =
                                false;

                            button.textContent =
                                originalText;
                        },
                        1800
                    );
                }
            };
    }

    /**
     * Installs utility delegation while preserving all existing controller
     * method names.
     *
     * @param {Object} application
     * @param {Object} modules
     */
    function installUtilities(
        application,
        modules
    ) {
        const utility =
            modules
                .AssessmentUtils;

        application.normaliseSearchText =
            function normaliseSearchText(
                value
            ) {
                return utility
                    .normaliseSearchText(
                        value
                    );
            };

        application.answerText =
            function answerText(
                key,
                fallback
            ) {
                return utility.answerText(
                    application.answers,
                    key,
                    fallback
                );
            };

        application.remoteDescription =
            function remoteDescription() {
                return utility
                    .remoteDescription(
                        application.answers,
                        modules
                            .AssessmentDefinition
                            .REMOTE_OPTIONS
                    );
            };

        application.remoteReportValue =
            function remoteReportValue() {
                return utility
                    .remoteReportValue(
                        application.answers
                    );
            };

        application.hiringDescription =
            function hiringDescription() {
                return utility
                    .hiringDescription(
                        application.answers,
                        modules
                            .AssessmentDefinition
                            .HIRING_OPTIONS
                    );
            };

        application.labelsFor =
            function labelsFor(
                values,
                options
            ) {
                return utility.labelsFor(
                    values,
                    options
                );
            };

        application.humanList =
            function humanList(items) {
                return utility
                    .humanList(items);
            };

        application.numberText =
            function numberText(
                value,
                fallback
            ) {
                return utility
                    .numberText(
                        value,
                        fallback
                    );
            };

        application.hasNumber =
            function hasNumber(value) {
                return utility
                    .hasNumber(value);
            };

        application.normaliseNumber =
            function normaliseNumber(
                value,
                fallback = 0
            ) {
                return utility
                    .normaliseNumber(
                        value,
                        fallback
                    );
            };

        application.pluralise =
            function pluralise(
                word,
                value
            ) {
                return utility
                    .pluralise(
                        word,
                        value
                    );
            };

        application.withArticle =
            function withArticle(value) {
                return utility
                    .withArticle(value);
            };

        application.ensureSentence =
            function ensureSentence(
                value
            ) {
                return utility
                    .ensureSentence(value);
            };

        application.isValidEmail =
            function isValidEmail(
                email
            ) {
                return utility
                    .isValidEmail(email);
            };

        application.clampMoment =
            function clampMoment(
                moment
            ) {
                return utility
                    .clampMoment(
                        moment,
                        modules
                            .AssessmentDefinition
                            .MOMENTS
                            .length
                    );
            };

        application.cssEscape =
            function cssEscape(value) {
                return utility
                    .cssEscape(value);
            };

        application.escapeAttribute =
            function escapeAttribute(
                value
            ) {
                return utility
                    .escapeAttribute(
                        value
                    );
            };

        application.escapeHtml =
            function escapeHtml(value) {
                return utility
                    .escapeHtml(value);
            };
    }

    /**
     * Installs the complete compatibility facade.
     *
     * @returns {Object|null}
     */
    function installCompatibilityFacade() {
        const application =
            window.executiveAssessment;

        if (!application) {
            console.warn(
                "GrowWithHR: the assessment compatibility facade could not find the application instance."
            );

            return null;
        }

        if (
            application
                .__modularFacadeInstalled
        ) {
            return application;
        }

        const modules =
            getModules();

        const unavailable =
            missingModules(modules);

        if (unavailable.length) {
            console.warn(
                "GrowWithHR: modular assessment integration was skipped because these modules are unavailable:",
                unavailable
            );

            return application;
        }

        /*
         * Bind mutable state first. Existing controller values are imported
         * into the state model before compatibility accessors are installed.
         */
        const stateModel =
            modules
                .AssessmentState
                .bindCompatibilityFacade(
                    application
                );

        application.stateModel =
            stateModel;

        installIndustryCatalogue(
            application,
            modules
        );

        installRendering(
            application,
            modules
        );

        installValidation(
            application,
            modules
        );

        installReview(
            application,
            modules
        );

        installMappingAndStorage(
            application,
            modules
        );

        installDelivery(
            application,
            modules
        );

        installUtilities(
            application,
            modules
        );

        Object.defineProperty(
            application,
            "__modularFacadeInstalled",
            {
                configurable:
                    false,

                enumerable:
                    false,

                writable:
                    false,

                value:
                    true
            }
        );

        Object.defineProperty(
            application,
            "__modularFacadeVersion",
            {
                configurable:
                    false,

                enumerable:
                    false,

                writable:
                    false,

                value:
                    FACADE_VERSION
            }
        );

        window.dispatchEvent(
            new CustomEvent(
                "growwithhr:assessment-modules-ready",
                {
                    detail: {
                        version:
                            FACADE_VERSION,

                        modules:
                            [...REQUIRED_MODULES],

                        application
                    }
                }
            )
        );

        console.info(
            "GrowWithHR: executive assessment modular compatibility facade installed."
        );

        return application;
    }

    window
        .GrowWithHRCompatibilityFacade =
        Object.freeze({
            version:
                FACADE_VERSION,

            requiredModules:
                [...REQUIRED_MODULES],

            install:
                installCompatibilityFacade
        });

    /*
     * executive-assessment.js registers its DOMContentLoaded listener before
     * this file. Its listener therefore creates window.executiveAssessment
     * first, and this listener then installs the modular facade.
     */
    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            installCompatibilityFacade
        );
    } else {
        window.queueMicrotask(
            installCompatibilityFacade
        );
    }
})();
