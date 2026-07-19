/* ==========================================================
   GrowWithHR
   Executive Advisory Briefing
   Modular compatibility facade
   Version: 3.0.0
========================================================== */

(() => {
    "use strict";

    const Modules =
        window.GrowWithHRModules || {};

    const requiredModules = [
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

    const missingModules =
        requiredModules.filter(
            (name) => !Modules[name]
        );

    if (missingModules.length) {
        console.error(
            "GrowWithHR: executive assessment could not start because modules are missing:",
            missingModules
        );

        return;
    }

    const Definitions =
        Modules.AssessmentDefinition;

    const Utils =
        Modules.AssessmentUtils;

    const Storage =
        Modules.AssessmentStorage;

    const Validation =
        Modules.AssessmentValidation;

    const Fields =
        Modules.AssessmentFields;

    const Screens =
        Modules.AssessmentScreens;

    const Review =
        Modules.AssessmentReview;

    const ReportMapper =
        Modules.ReportMapper;

    const Delivery =
        Modules.AdvisoryDelivery;

    const State =
        Modules.AssessmentState;

    const MOMENTS =
        Definitions.MOMENTS;

    const CHAPTERS =
        Definitions.CHAPTERS;

    class ExecutiveAdvisoryBriefing {
        constructor() {
            this.config =
                this.readConfig();

            this.reportUrl =
                this.resolveReportUrl();

            this.generationTimers = [];
            this.saveTimer = null;
            this.lastFocusedElement = null;
            this.isSubmitting = false;
            this.lastPdfDocument = null;

            this.cacheElements();

 const savedState =
    Storage.readAssessment();

const initialState =
    savedState
        ? {
            ...savedState
        }
        : State.createDefaultState();

initialState.delivery =
    Storage.readDelivery();

this.stateModel =
    State.create(
        initialState
    );

            State.bindCompatibilityFacade(
                this,
                this.stateModel
            );

            this.industryCatalogService =
                Modules
                    .IndustryCatalog
                    .create({
                        dataUrl:
                            Definitions
                                .INDUSTRY_DATA_URL,

                        fallback:
                            Definitions
                                .INDUSTRY_FALLBACK,

                        storage:
                            Storage
                    });

            this.syncIndustryCatalog();

            this.deliveryService =
                Delivery.create({
                    reportMapper:
                        ReportMapper
                });

            this.bindEvents();
            this.initialiseView();
            this.loadIndustries();

            /*
             * This tells the temporary compatibility-facade.js bridge that
             * this controller is already fully connected to the modules.
             */
            Object.defineProperty(
                this,
                "__modularFacadeInstalled",
                {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: true
                }
            );

            Object.defineProperty(
                this,
                "__modularFacadeVersion",
                {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: "1.0.0"
                }
            );
        }

        readConfig() {
            const element =
                document.getElementById(
                    "assessmentConfig"
                );

            if (!element) {
                return {};
            }

            try {
                return JSON.parse(
                    element.textContent ||
                    "{}"
                );
            } catch (error) {
                console.warn(
                    "GrowWithHR: assessment configuration could not be read.",
                    error
                );

                return {};
            }
        }

resolveReportUrl() {
    const configured =
        String(
            this.config.report ||
            ""
        ).trim();

    if (
        configured &&
        configured !==
            "sample-advisory-report.html"
    ) {
        return configured;
    }

    return (
        Definitions.REPORT_URL ||
        Definitions.DEFAULT_REPORT_URL ||
        "executive-advisory-report.html"
    );
}

        createModuleContext() {
            return {
                answers:
                    this.answers,

                lead:
                    this.lead,

                ui:
                    this.ui,

                definitions:
                    Definitions,

                industryCatalog:
                    this
                        .industryCatalogService,

                industrySearchOptions:
                    this
                        .industrySearchOptions,

                effectiveIndustryName:
                    () => {
                        return this
                            .effectiveIndustryName();
                    },

                isOtherIndustrySelected:
                    () => {
                        return this
                            .isOtherIndustrySelected();
                    }
            };
        }

        syncIndustryCatalog() {
            this.industryCatalog =
                this
                    .industryCatalogService
                    .getIndustries();

            this.industrySearchOptions =
                this
                    .industryCatalogService
                    .getSearchOptions();

            this.industryLookup =
                this
                    .industryCatalogService
                    .lookup instanceof Map
                    ? this
                        .industryCatalogService
                        .lookup
                    : new Map();
        }

        readCachedIndustryCatalog() {
            return Storage
                .readIndustryCache(
                    Definitions
                        .INDUSTRY_FALLBACK
                );
        }

        async loadIndustries() {
            const result =
                await this
                    .industryCatalogService
                    .load();

            this.syncIndustryCatalog();
            this.refreshIndustryDatalist();

            return result;
        }

        prepareIndustryCatalog(
            industries
        ) {
            const prepared =
                this
                    .industryCatalogService
                    .prepare(
                        industries
                    );

            this.syncIndustryCatalog();

            return prepared;
        }

        refreshIndustryDatalist() {
            const datalist =
                document.getElementById(
                    "industryOptions"
                );

            if (!datalist) {
                return;
            }

            datalist.innerHTML =
                Fields
                    .renderDatalistOptions(
                        this
                            .industrySearchOptions
                    );

            this.updateDynamicVisibility();
        }

        resolveIndustry(value) {
            return this
                .industryCatalogService
                .resolve(value);
        }

        applyResolvedIndustry(
            input = null
        ) {
            const rawValue =
                String(
                    input?.value ??
                    this.answers.industry ??
                    ""
                ).trim();

            const industry =
                this
                    .industryCatalogService
                    .applyToAnswers(
                        this.answers,
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
        }

        isOtherIndustrySelected() {
            return this
                .industryCatalogService
                .isOther(
                    this.answers.industry
                );
        }

        effectiveIndustryName() {
            return this
                .industryCatalogService
                .getEffectiveName(
                    this.answers
                );
        }

        readDeliveryRecord() {
            return Storage
                .readDelivery();
        }

        cacheElements() {
            const byId = (id) =>
                document.getElementById(id);

            this.elements = {
                shell:
                    byId(
                        "assessmentShell"
                    ),

                landing:
                    byId(
                        "landingScreen"
                    ),

                workspace:
                    byId(
                        "conversationWorkspace"
                    ),

                review:
                    byId(
                        "reviewScreen"
                    ),

                contact:
                    byId(
                        "contactScreen"
                    ),

                loading:
                    byId(
                        "loadingScreen"
                    ),

                success:
                    byId(
                        "successScreen"
                    ),

                firstVisitActions:
                    byId(
                        "firstVisitActions"
                    ),

                resumePanel:
                    byId(
                        "resumePanel"
                    ),

                resumeMessage:
                    byId(
                        "resumeMessage"
                    ),

                resumeButton:
                    byId(
                        "resumeAssessmentButton"
                    ),

                startAgainButton:
                    byId(
                        "startAgainButton"
                    ),

                startButton:
                    byId(
                        "startAssessment"
                    ),

                saveStatus:
                    byId(
                        "saveStatus"
                    ),

                saveExitButton:
                    byId(
                        "saveExitButton"
                    ),

                storyForm:
                    byId(
                        "storyForm"
                    ),

                storyContainer:
                    byId(
                        "storyContainer"
                    ),

                storyEyebrow:
                    byId(
                        "storyEyebrow"
                    ),

                stepTitle:
                    byId(
                        "stepTitle"
                    ),

                stepDescription:
                    byId(
                        "stepDescription"
                    ),

                stepIndicator:
                    byId(
                        "stepIndicator"
                    ),

                desktopTime:
                    byId(
                        "desktopTimeRemaining"
                    ),

                mobileTime:
                    byId(
                        "mobileTimeRemaining"
                    ),

                progressTrack:
                    byId(
                        "progressTrack"
                    ),

                progressBar:
                    byId(
                        "progressBar"
                    ),

                footerMessage:
                    byId(
                        "footerMessage"
                    ),

                backButton:
                    byId(
                        "backButton"
                    ),

                nextButton:
                    byId(
                        "nextButton"
                    ),

                chapterRail:
                    byId(
                        "chapterRail"
                    ),

                businessSummary:
                    byId(
                        "businessSummary"
                    ),

                peopleSummary:
                    byId(
                        "peopleSummary"
                    ),

                operationsSummary:
                    byId(
                        "operationsSummary"
                    ),

                growthSummary:
                    byId(
                        "growthSummary"
                    ),

                reviewBackButton:
                    byId(
                        "reviewBackButton"
                    ),

                continueToContactButton:
                    byId(
                        "continueToContactButton"
                    ),

                leadForm:
                    byId(
                        "leadCaptureForm"
                    ),

                leadName:
                    byId(
                        "leadName"
                    ),

                leadEmail:
                    byId(
                        "leadEmail"
                    ),

                leadRole:
                    byId(
                        "leadRole"
                    ),

                marketingConsent:
                    byId(
                        "marketingConsent"
                    ),

                leadNameError:
                    byId(
                        "leadNameError"
                    ),

                leadEmailError:
                    byId(
                        "leadEmailError"
                    ),

                contactBackButton:
                    byId(
                        "contactBackButton"
                    ),

                generateButton:
                    byId(
                        "generateReportButton"
                    ),

                generationSteps:
                    byId(
                        "generationSteps"
                    ),

                loadingMessage:
                    byId(
                        "loadingMessage"
                    ),

                generationError:
                    byId(
                        "generationError"
                    ),

                retryGenerationButton:
                    byId(
                        "retryGenerationButton"
                    ),

                returnToReviewButton:
                    byId(
                        "returnToReviewButton"
                    ),

                preparedForName:
                    byId(
                        "preparedForName"
                    ),

                preparedForCompany:
                    byId(
                        "preparedForCompany"
                    ),

                preparedDate:
                    byId(
                        "preparedDate"
                    ),

                viewReportButton:
                    byId(
                        "viewReportButton"
                    ),

                downloadReportButton:
                    byId(
                        "downloadReportButton"
                    ),

                emailAgainButton:
                    byId(
                        "emailAgainButton"
                    ),

                editAnswersButton:
                    byId(
                        "editAnswersButton"
                    ),

                exitModal:
                    byId(
                        "exitModal"
                    ),

                cancelExitButton:
                    byId(
                        "cancelExitButton"
                    ),

                confirmExitButton:
                    byId(
                        "confirmExitButton"
                    ),

                liveRegion:
                    byId(
                        "liveRegion"
                    ),

                assertiveRegion:
                    byId(
                        "assertiveRegion"
                    )
            };
        }

        bindEvents() {
            const { elements } =
                this;

            elements
                .startButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.startNewBriefing();
                    }
                );

            elements
                .resumeButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.resumeBriefing();
                    }
                );

            elements
                .startAgainButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.requestRestart();
                    }
                );

            elements
                .storyForm
                ?.addEventListener(
                    "submit",
                    (event) => {
                        event.preventDefault();
                        this.continueFromMoment();
                    }
                );

            elements
                .backButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.goBack();
                    }
                );

            elements
                .storyContainer
                ?.addEventListener(
                    "input",
                    (event) => {
                        this.captureStoryInput(
                            event.target
                        );
                    }
                );

            elements
                .storyContainer
                ?.addEventListener(
                    "change",
                    (event) => {
                        this.captureStoryInput(
                            event.target
                        );

                        this.handleDynamicControl(
                            event.target
                        );
                    }
                );

            elements
                .storyContainer
                ?.addEventListener(
                    "click",
                    (event) => {
                        const toggle =
                            event.target.closest(
                                "[data-toggle-supplemental-workforce]"
                            );

                        if (!toggle) {
                            return;
                        }

                        this
                            .stateModel
                            .toggleUiField(
                                "showSupplementalWorkforce"
                            );

                        this.queueSave();

                        this.renderCurrentMoment({
                            preserveFocus: true
                        });
                    }
                );

            document
                .querySelectorAll(
                    "[data-edit-screen]"
                )
                .forEach((button) => {
                    button.addEventListener(
                        "click",
                        () => {
                            const moment =
                                Number(
                                    button
                                        .dataset
                                        .editScreen
                                );

                            this.showMoment(
                                Number.isInteger(
                                    moment
                                )
                                    ? moment
                                    : 0
                            );
                        }
                    );
                });

            elements
                .reviewBackButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.showMoment(
                            MOMENTS.length - 1
                        );
                    }
                );

            elements
                .continueToContactButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.showContact();
                    }
                );

            elements
                .contactBackButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.showReview();
                    }
                );

            elements
                .leadForm
                ?.addEventListener(
                    "input",
                    () => {
                        this.captureLeadData();
                        this.queueSave();
                    }
                );

            elements
                .leadForm
                ?.addEventListener(
                    "change",
                    () => {
                        this.captureLeadData();
                        this.queueSave();
                    }
                );

            elements
                .leadForm
                ?.addEventListener(
                    "submit",
                    (event) => {
                        event.preventDefault();
                        this.submitLeadAndGenerate();
                    }
                );

            elements
                .retryGenerationButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.submitLeadAndGenerate();
                    }
                );

            elements
                .returnToReviewButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.showReview();
                    }
                );

            elements
                .viewReportButton
                ?.addEventListener(
                    "click",
                    () => {
                        window.location.href =
                            this.reportUrl;
                    }
                );

            elements
                .downloadReportButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.downloadReport();
                    }
                );

            elements
                .emailAgainButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.requestAnotherEmail();
                    }
                );

            elements
                .editAnswersButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.showReview();
                    }
                );

            elements
                .saveExitButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.openExitModal();
                    }
                );

            elements
                .cancelExitButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.closeExitModal();
                    }
                );

            elements
                .confirmExitButton
                ?.addEventListener(
                    "click",
                    () => {
                        this.saveNow();

                        window.location.href =
                            "index.html";
                    }
                );

            document
                .querySelectorAll(
                    "[data-close-exit-modal]"
                )
                .forEach((element) => {
                    element.addEventListener(
                        "click",
                        () => {
                            this.closeExitModal();
                        }
                    );
                });

            document.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key !==
                            "Escape" ||
                        elements
                            .exitModal
                            ?.hidden
                    ) {
                        return;
                    }

                    event.preventDefault();
                    this.closeExitModal();
                }
            );
        }

        initialiseView() {
            this.populateLeadForm();

            if (
                this.completed &&
                this.hasReportData()
            ) {
                this.configureResumePanel(
                    true
                );
            } else if (
                this.started
            ) {
                this.configureResumePanel(
                    false
                );
            } else {
                this.configureFirstVisit();
            }

            this.showOnly(
                "landing"
            );
        }

        configureFirstVisit() {
            if (
                this.elements
                    .firstVisitActions
            ) {
                this.elements
                    .firstVisitActions
                    .hidden =
                    false;
            }

            if (
                this.elements
                    .resumePanel
            ) {
                this.elements
                    .resumePanel
                    .hidden =
                    true;
            }
        }

        configureResumePanel(
            isCompleted
        ) {
            const {
                firstVisitActions,
                resumePanel,
                resumeMessage,
                resumeButton
            } = this.elements;

            if (firstVisitActions) {
                firstVisitActions.hidden =
                    true;
            }

            if (
                !resumePanel ||
                !resumeMessage ||
                !resumeButton
            ) {
                return;
            }

            resumePanel.hidden =
                false;

            if (isCompleted) {
                resumeMessage.textContent =
                    "Your completed advisory is available on this device.";

                resumeButton.innerHTML =
                    "Open my saved advisory " +
                    '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
            } else {
                resumeMessage.textContent =
                    "Your progress is saved.";

                resumeButton.innerHTML =
                    "Continue my advisory " +
                    '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
            }
        }

        startNewBriefing() {
            this.stateModel.reset();

            this.started =
                true;

            this.populateLeadForm();
            this.saveNow();
            this.showMoment(0);

            this.announce(
                "Executive Advisory Briefing started."
            );
        }

        resumeBriefing() {
            if (
                this.completed &&
                this.hasReportData()
            ) {
                this.showSuccess();
                return;
            }

            this.started =
                true;

            this.showMoment(
                this.currentMoment
            );

            this.announce(
                `Continuing at story ${this.currentMoment + 1} of ${MOMENTS.length}.`
            );
        }

        requestRestart() {
            const shouldRestart =
                window.confirm(
                    "Start the advisory again? Your saved answers on this device will be cleared."
                );

            if (!shouldRestart) {
                return;
            }

            this.clearSavedState();
            this.startNewBriefing();
        }

        continueFromMoment() {
            this.captureAllStoryInputs();

            const moment =
                MOMENTS[
                    this.currentMoment
                ];

            const validator =
                moment
                    ?.validateMethod;

            const isValid =
                validator &&
                typeof this[
                    validator
                ] === "function"
                    ? this[
                        validator
                    ]()
                    : false;

            if (!isValid) {
                return;
            }

            this.clearMomentErrors();
            this.saveNow();

            if (
                this.currentMoment >=
                MOMENTS.length - 1
            ) {
                this.showReview();
                return;
            }

            this.showMoment(
                this.currentMoment + 1
            );
        }

        goBack() {
            if (
                this.currentMoment <=
                0
            ) {
                this.configureResumePanel(
                    false
                );

                this.showOnly(
                    "landing"
                );

                return;
            }

            this.captureAllStoryInputs();
            this.saveNow();

            this.showMoment(
                this.currentMoment - 1
            );
        }

        showMoment(momentIndex) {
            this.started =
                true;

            this.currentMoment =
                this.clampMoment(
                    momentIndex
                );

            this.showOnly(
                "workspace"
            );

            this.renderCurrentMoment();
            this.saveNow();

            this.focusScreen(
                this.elements
                    .stepTitle
            );
        }

        renderCurrentMoment(
            options = {}
        ) {
            const moment =
                MOMENTS[
                    this.currentMoment
                ];

            if (
                !moment ||
                !this.elements
                    .storyContainer
            ) {
                return;
            }

            const focusedId =
                options.preserveFocus
                    ? document
                        .activeElement
                        ?.id
                    : null;

            this.elements
                .storyEyebrow
                .textContent =
                moment.eyebrow;

            this.elements
                .stepTitle
                .textContent =
                moment.title;

            this.elements
                .stepDescription
                .textContent =
                moment.description;

            this.elements
                .storyContainer
                .innerHTML =
                Screens.renderMoment(
                    moment.id,
                    this
                        .createModuleContext()
                );

            this.updateProgress();
            this.updateChapterRail();
            this.updateNavigation();
            this.updateDynamicVisibility();

            if (focusedId) {
                document
                    .getElementById(
                        focusedId
                    )
                    ?.focus({
                        preventScroll:
                            true
                    });
            }
        }

        updateProgress() {
            const moment =
                MOMENTS[
                    this.currentMoment
                ];

            const progress =
                (
                    (
                        this.currentMoment +
                        1
                    ) /
                    MOMENTS.length
                ) *
                100;

            const remainingMinutes =
                Math.max(
                    1,
                    Math.ceil(
                        (
                            MOMENTS.length -
                            this.currentMoment
                        ) *
                        0.7
                    )
                );

            const timeText =
                this.currentMoment >=
                MOMENTS.length - 1
                    ? "About 1 minute remaining"
                    : `About ${remainingMinutes} minutes remaining`;

            if (
                this.elements
                    .stepIndicator
            ) {
                this.elements
                    .stepIndicator
                    .textContent =
                    `Chapter ${moment.chapter + 1} of ${CHAPTERS.length} · ${CHAPTERS[moment.chapter]}`;
            }

            if (
                this.elements
                    .desktopTime
            ) {
                this.elements
                    .desktopTime
                    .textContent =
                    timeText;
            }

            if (
                this.elements
                    .mobileTime
            ) {
                this.elements
                    .mobileTime
                    .textContent =
                    timeText;
            }

            if (
                this.elements
                    .footerMessage
            ) {
                this.elements
                    .footerMessage
                    .textContent =
                    `Story ${this.currentMoment + 1} of ${MOMENTS.length}`;
            }

            if (
                this.elements
                    .progressBar
            ) {
                this.elements
                    .progressBar
                    .style
                    .width =
                    `${progress}%`;
            }

            this.elements
                .progressTrack
                ?.setAttribute(
                    "aria-valuenow",
                    String(
                        this.currentMoment +
                        1
                    )
                );

            this.elements
                .progressTrack
                ?.setAttribute(
                    "aria-valuetext",
                    `Story ${this.currentMoment + 1} of ${MOMENTS.length}. ${timeText}.`
                );
        }

        updateChapterRail() {
            const currentChapter =
                MOMENTS[
                    this.currentMoment
                ].chapter;

            this.elements
                .chapterRail
                ?.querySelectorAll(
                    "[data-chapter]"
                )
                .forEach((item) => {
                    const chapter =
                        Number(
                            item
                                .dataset
                                .chapter
                        );

                    const marker =
                        item
                            .querySelector(
                                ".advisory-chapter__marker"
                            );

                    item.classList.toggle(
                        "is-current",
                        chapter ===
                            currentChapter
                    );

                    item.classList.toggle(
                        "is-complete",
                        chapter <
                            currentChapter
                    );

                    if (
                        chapter ===
                        currentChapter
                    ) {
                        item.setAttribute(
                            "aria-current",
                            "step"
                        );
                    } else {
                        item.removeAttribute(
                            "aria-current"
                        );
                    }

                    if (marker) {
                        marker.textContent =
                            chapter <
                            currentChapter
                                ? "✓"
                                : String(
                                    chapter +
                                    1
                                );
                    }
                });
        }

        updateNavigation() {
            const finalMoment =
                this.currentMoment ===
                MOMENTS.length - 1;

            if (
                this.elements
                    .backButton
            ) {
                this.elements
                    .backButton
                    .hidden =
                    false;
            }

            if (
                this.elements
                    .nextButton
            ) {
                this.elements
                    .nextButton
                    .innerHTML =
                    finalMoment
                        ? "Review my organisation story " +
                            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>'
                        : "Continue " +
                            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
            }
        }

        showReview() {
            this.captureAllStoryInputs();
            this.saveNow();
            this.buildReviewSummaries();

            this.showOnly(
                "review"
            );

            this.focusScreen(
                this.elements.review
            );

            this.announce(
                "Your organisation story is ready to review."
            );
        }

        showContact() {
            this.populateLeadForm();
            this.clearLeadErrors();

            this.showOnly(
                "contact"
            );

            this.focusScreen(
                this.elements.contact
            );

            this.announce(
                "Final step. Enter your name and work email to generate the advisory."
            );
        }

        showSuccess() {
            this.completed =
                true;

            this.started =
                true;

            this.populateSuccessDetails();

            this.showOnly(
                "success"
            );

            this.saveNow();

            this.focusScreen(
                this.elements.success
            );

            this.announce(
                "Your advisory is ready."
            );
        }

        showOnly(screenName) {
            const screens = {
                landing:
                    this.elements
                        .landing,

                workspace:
                    this.elements
                        .workspace,

                review:
                    this.elements
                        .review,

                contact:
                    this.elements
                        .contact,

                loading:
                    this.elements
                        .loading,

                success:
                    this.elements
                        .success
            };

            Object.entries(
                screens
            ).forEach(
                ([
                    name,
                    element
                ]) => {
                    if (element) {
                        element.hidden =
                            name !==
                            screenName;
                    }
                }
            );

            if (
                this.elements.shell
            ) {
                this.elements
                    .shell
                    .dataset
                    .screen =
                    screenName;
            }

            if (
                this.elements
                    .saveExitButton
            ) {
                this.elements
                    .saveExitButton
                    .hidden =
                    screenName ===
                        "landing" ||
                    screenName ===
                        "success";
            }
        }

        renderBusinessBasics() {
            return Screens
                .renderBusinessBasics(
                    this
                        .createModuleContext()
                );
        }

        renderBusinessStage() {
            return Screens
                .renderBusinessStage(
                    this
                        .createModuleContext()
                );
        }

        renderWorkforce() {
            return Screens
                .renderWorkforce(
                    this
                        .createModuleContext()
                );
        }

        renderWorkingModel() {
            return Screens
                .renderWorkingModel(
                    this
                        .createModuleContext()
                );
        }

        renderOperatingFootprint() {
            return Screens
                .renderOperatingFootprint(
                    this
                        .createModuleContext()
                );
        }

        renderGrowthDirection() {
            return Screens
                .renderGrowthDirection(
                    this
                        .createModuleContext()
                );
        }

        renderPeopleReadiness() {
            return Screens
                .renderPeopleReadiness(
                    this
                        .createModuleContext()
                );
        }

        textField(configuration) {
            return Fields.textField(
                configuration,
                {
                    answers:
                        this.answers
                }
            );
        }

        textareaField(configuration) {
            return Fields
                .textareaField(
                    configuration,
                    {
                        answers:
                            this.answers
                    }
                );
        }

        numberField(configuration) {
            return Fields.numberField(
                configuration,
                {
                    answers:
                        this.answers
                }
            );
        }

        datalistField(configuration) {
            return Fields
                .datalistField(
                    configuration,
                    {
                        answers:
                            this.answers
                    }
                );
        }

        renderDatalistOptions(
            options
        ) {
            return Fields
                .renderDatalistOptions(
                    options
                );
        }

        selectField(configuration) {
            return Fields.selectField(
                configuration,
                {
                    answers:
                        this.answers
                }
            );
        }

        choiceCards(configuration) {
            return Fields.choiceCards(
                configuration,
                {
                    answers:
                        this.answers
                }
            );
        }

        choicePills(configuration) {
            return Fields.choicePills(
                configuration,
                {
                    answers:
                        this.answers
                }
            );
        }

        checkboxCards(configuration) {
            return Fields
                .checkboxCards(
                    configuration,
                    {
                        answers:
                            this.answers
                    }
                );
        }

        captureStoryInput(target) {
            if (
                !(
                    target instanceof
                        HTMLInputElement ||
                    target instanceof
                        HTMLSelectElement ||
                    target instanceof
                        HTMLTextAreaElement
                )
            ) {
                return;
            }

            const {
                name,
                type
            } = target;

            if (!name) {
                return;
            }

            if (
                type ===
                "checkbox"
            ) {
                if (
                    name ===
                    "foundedNotSure"
                ) {
                    this
                        .stateModel
                        .setAnswer(
                            name,
                            target.checked
                        );
                } else {
                    const checked =
                        Array.from(
                            this.elements
                                .storyContainer
                                .querySelectorAll(
                                    `input[name="${this.cssEscape(name)}"]:checked`
                                )
                        ).map(
                            (input) =>
                                input.value
                        );

                    const maximum =
                        Number(
                            target
                                .closest(
                                    "[data-maximum]"
                                )
                                ?.dataset
                                .maximum ||
                            0
                        );

                    if (
                        maximum &&
                        checked.length >
                            maximum
                    ) {
                        target.checked =
                            false;

                        this.setFieldError(
                            name,
                            `Choose no more than ${maximum} priorities.`
                        );

                        this.announce(
                            `Choose no more than ${maximum} priorities.`,
                            true
                        );

                        return;
                    }

                    this
                        .stateModel
                        .setAnswer(
                            name,
                            checked
                        );

                    this.clearFieldError(
                        name
                    );
                }
            } else if (
                type === "radio"
            ) {
                if (!target.checked) {
                    return;
                }

                this
                    .stateModel
                    .setAnswer(
                        name,
                        target.value
                    );

                this.clearFieldError(
                    name
                );
            } else {
                this
                    .stateModel
                    .setAnswer(
                        name,
                        target.value
                    );

                if (
                    target.id ===
                    "growthContext"
                ) {
                    const counter =
                        document
                            .getElementById(
                                "growthContextCounter"
                            );

                    if (counter) {
                        counter.textContent =
                            `${target.value.length}/${target.maxLength}`;
                    }
                }
            }

            this.updateDynamicVisibility();
            this.queueSave();
        }

        captureAllStoryInputs() {
            this.elements
                .storyContainer
                ?.querySelectorAll(
                    "input, select, textarea"
                )
                .forEach((input) => {
                    this.captureStoryInput(
                        input
                    );
                });
        }

        handleDynamicControl(target) {
            if (
                target.name ===
                "industry"
            ) {
                this.applyResolvedIndustry(
                    target
                );

                this.clearFieldError(
                    "industry"
                );

                this.updateDynamicVisibility();
                this.queueSave();

                return;
            }

            if (
                target.name ===
                    "foundedNotSure" ||
                target.name ===
                    "remoteBand"
            ) {
                this.updateDynamicVisibility();
            }
        }

        updateDynamicVisibility() {
            const founded =
                document.getElementById(
                    "founded"
                );

            const foundedNotSure =
                document.getElementById(
                    "foundedNotSure"
                );

            if (
                founded &&
                foundedNotSure
            ) {
                founded.disabled =
                    foundedNotSure
                        .checked;
            }

            const remoteExactField =
                document.getElementById(
                    "remoteExactField"
                );

            if (remoteExactField) {
                remoteExactField.hidden =
                    this.answers
                        .remoteBand !==
                    "exact";
            }

            const customIndustryField =
                document.getElementById(
                    "customIndustryField"
                );

            if (customIndustryField) {
                customIndustryField.hidden =
                    !this
                        .isOtherIndustrySelected();
            }
        }

        applyValidationResult(result) {
            Validation
                .applyNormalizedAnswers(
                    this.answers,
                    result
                );

            this.clearMomentErrors();

            Object.entries(
                result.errors ||
                {}
            ).forEach(
                ([
                    field,
                    message
                ]) => {
                    if (
                        field !==
                        "_moment"
                    ) {
                        this.setFieldError(
                            field,
                            message
                        );
                    }
                }
            );

            const industryInput =
                document.getElementById(
                    "industry"
                );

            if (
                industryInput &&
                this.answers.industry
            ) {
                industryInput.value =
                    this.answers
                        .industry;
            }

            this.updateDynamicVisibility();

            return this
                .finishMomentValidation(
                    Boolean(
                        result.valid
                    )
                );
        }

        validateBusinessBasics() {
            return this
                .applyValidationResult(
                    Validation
                        .validateBusinessBasics(
                            this.answers,
                            {
                                industryCatalog:
                                    this
                                        .industryCatalogService
                            }
                        )
                );
        }

        validateBusinessStage() {
            return this
                .applyValidationResult(
                    Validation
                        .validateBusinessStage(
                            this.answers,
                            {
                                currentYear:
                                    new Date()
                                        .getFullYear()
                            }
                        )
                );
        }

        validateWorkforce() {
            return this
                .applyValidationResult(
                    Validation
                        .validateWorkforce(
                            this.answers
                        )
                );
        }

        validateWorkingModel() {
            return this
                .applyValidationResult(
                    Validation
                        .validateWorkingModel(
                            this.answers
                        )
                );
        }

        validateOperatingFootprint() {
            return this
                .applyValidationResult(
                    Validation
                        .validateOperatingFootprint(
                            this.answers
                        )
                );
        }

        validateGrowthDirection() {
            return this
                .applyValidationResult(
                    Validation
                        .validateGrowthDirection(
                            this.answers
                        )
                );
        }

        validatePeopleReadiness() {
            return this
                .applyValidationResult(
                    Validation
                        .validatePeopleReadiness(
                            this.answers
                        )
                );
        }

        requireText(id, message) {
            const result =
                Validation.createResult(
                    this.answers
                );

            Validation.requireText(
                result,
                id,
                message
            );

            Validation
                .applyNormalizedAnswers(
                    this.answers,
                    result
                );

            if (result.valid) {
                this.clearFieldError(
                    id
                );
            } else {
                this.setFieldError(
                    id,
                    message
                );
            }

            return result.valid;
        }

        requireWholeNumber(
            id,
            message,
            minimum
        ) {
            const result =
                Validation.createResult(
                    this.answers
                );

            Validation
                .requireWholeNumber(
                    result,
                    id,
                    message,
                    minimum
                );

            if (result.valid) {
                this.clearFieldError(
                    id
                );
            } else {
                this.setFieldError(
                    id,
                    message
                );
            }

            return result.valid;
        }

        isWholeNumber(
            value,
            minimum = 0
        ) {
            return Validation
                .isWholeNumber(
                    value,
                    minimum
                );
        }

        finishMomentValidation(valid) {
            if (valid) {
                return true;
            }

            const firstInvalid =
                this.elements
                    .storyContainer
                    ?.querySelector(
                        ".has-error input:not([type='hidden']), " +
                        ".has-error select, " +
                        ".has-error textarea, " +
                        ".has-error [tabindex='0']"
                    ) ||
                this.elements
                    .storyContainer
                    ?.querySelector(
                        ".has-error input"
                    );

            firstInvalid?.focus({
                preventScroll:
                    false
            });

            firstInvalid
                ?.scrollIntoView({
                    behavior:
                        this
                            .prefersReducedMotion()
                            ? "auto"
                            : "smooth",

                    block:
                        "center"
                });

            this.announce(
                "Review the highlighted information before continuing.",
                true
            );

            return false;
        }

        setFieldError(id, message) {
            const wrapper =
                this.elements
                    .storyContainer
                    ?.querySelector(
                        `[data-field-wrapper="${this.cssEscape(id)}"]`
                    );

            const error =
                document.getElementById(
                    `${id}Error`
                );

            const input =
                wrapper
                    ?.querySelector(
                        "input, select, textarea"
                    );

            wrapper
                ?.classList
                .add(
                    "has-error"
                );

            input
                ?.setAttribute(
                    "aria-invalid",
                    "true"
                );

            if (error) {
                error.textContent =
                    message;

                error.hidden =
                    false;
            }
        }

        clearFieldError(id) {
            const wrapper =
                this.elements
                    .storyContainer
                    ?.querySelector(
                        `[data-field-wrapper="${this.cssEscape(id)}"]`
                    );

            const error =
                document.getElementById(
                    `${id}Error`
                );

            wrapper
                ?.classList
                .remove(
                    "has-error"
                );

            wrapper
                ?.querySelectorAll(
                    "[aria-invalid='true']"
                )
                .forEach(
                    (element) => {
                        element
                            .removeAttribute(
                                "aria-invalid"
                            );
                    }
                );

            if (error) {
                error.textContent =
                    "";

                error.hidden =
                    true;
            }
        }

        clearMomentErrors() {
            this.elements
                .storyContainer
                ?.querySelectorAll(
                    ".has-error"
                )
                .forEach(
                    (element) => {
                        element
                            .classList
                            .remove(
                                "has-error"
                            );
                    }
                );

            this.elements
                .storyContainer
                ?.querySelectorAll(
                    "[aria-invalid='true']"
                )
                .forEach(
                    (element) => {
                        element
                            .removeAttribute(
                                "aria-invalid"
                            );
                    }
                );

            this.elements
                .storyContainer
                ?.querySelectorAll(
                    ".advisory-field-error"
                )
                .forEach(
                    (element) => {
                        element.textContent =
                            "";

                        element.hidden =
                            true;
                    }
                );
        }

        buildReviewSummaries() {
            return Review
                .renderReview(
                    this
                        .createModuleContext(),
                    this.elements
                );
        }

        captureLeadData() {
            this
                .stateModel
                .patchLead({
                    name:
                        this.elements
                            .leadName
                            ?.value
                            .trim() ||
                        "",

                    email:
                        this.elements
                            .leadEmail
                            ?.value
                            .trim() ||
                        "",

                    role:
                        this.elements
                            .leadRole
                            ?.value ||
                        "",

                    marketingConsent:
                        Boolean(
                            this.elements
                                .marketingConsent
                                ?.checked
                        )
                });
        }

        populateLeadForm() {
            if (
                this.elements.leadName
            ) {
                this.elements
                    .leadName
                    .value =
                    this.lead.name ||
                    "";
            }

            if (
                this.elements.leadEmail
            ) {
                this.elements
                    .leadEmail
                    .value =
                    this.lead.email ||
                    "";
            }

            if (
                this.elements.leadRole
            ) {
                this.elements
                    .leadRole
                    .value =
                    this.lead.role ||
                    "";
            }

            if (
                this.elements
                    .marketingConsent
            ) {
                this.elements
                    .marketingConsent
                    .checked =
                    Boolean(
                        this.lead
                            .marketingConsent
                    );
            }
        }

        validateLead() {
            this.captureLeadData();

            const result =
                Validation.validateLead(
                    this.lead
                );

            Validation
                .applyNormalizedLead(
                    this.lead,
                    result
                );

            this.clearLeadErrors();

            if (
                result.errors.name
            ) {
                this.showLeadError(
                    this.elements
                        .leadName,

                    this.elements
                        .leadNameError,

                    result
                        .errors
                        .name
                );
            }

            if (
                result.errors.email
            ) {
                this.showLeadError(
                    this.elements
                        .leadEmail,

                    this.elements
                        .leadEmailError,

                    result
                        .errors
                        .email
                );
            }

            if (!result.valid) {
                const firstInvalid =
                    this.elements
                        .leadForm
                        ?.querySelector(
                            "[aria-invalid='true']"
                        );

                firstInvalid?.focus();

                firstInvalid
                    ?.scrollIntoView({
                        behavior:
                            this
                                .prefersReducedMotion()
                                ? "auto"
                                : "smooth",

                        block:
                            "center"
                    });

                this.announce(
                    "Enter your name and a valid email address before generating your advisory.",
                    true
                );
            }

            return result.valid;
        }

        showLeadError(
            input,
            errorElement,
            message
        ) {
            input
                ?.setAttribute(
                    "aria-invalid",
                    "true"
                );

            input
                ?.closest(
                    ".advisory-field, .advisory-consent-group"
                )
                ?.classList
                .add(
                    "has-error"
                );

            if (errorElement) {
                errorElement.textContent =
                    message;

                errorElement.hidden =
                    false;
            }
        }

        clearLeadErrors() {
            [
                this.elements.leadName,
                this.elements.leadEmail
            ].forEach((input) => {
                input
                    ?.removeAttribute(
                        "aria-invalid"
                    );

                input
                    ?.closest(
                        ".advisory-field"
                    )
                    ?.classList
                    .remove(
                        "has-error"
                    );
            });

            [
                this.elements
                    .leadNameError,

                this.elements
                    .leadEmailError
            ].forEach((error) => {
                if (error) {
                    error.textContent =
                        "";

                    error.hidden =
                        true;
                }
            });
        }

        async submitLeadAndGenerate() {
            if (
                this.isSubmitting ||
                !this.validateLead()
            ) {
                return;
            }

            this.isSubmitting =
                true;

            this.setGenerateButtonState(
                true
            );

            this.saveNow();

            const records =
                ReportMapper.buildRecords(
                    this
                        .createModuleContext()
                );

            Storage.writeLead(
                records.lead
            );

            Storage.writeReport(
                records.report
            );

            window.dispatchEvent(
                new CustomEvent(
                    "growwithhr:lead-captured",
                    {
                        detail:
                            records.lead
                    }
                )
            );

            this.beginGeneration();

            try {
                const result =
                    await this
                        .deliveryService
                        .prepareAndSend({
                            action:
                                "capture",

                            lead:
                                records.lead,

                            report:
                                records.report,

                            answers: {
                                ...this.answers
                            },

                            onProgress:
                                (stage) => {
                                    this.setGenerationStep(
                                        stage.index,
                                        stage.message
                                    );
                                }
                        });

                this.lastPdfDocument =
                    result.pdf;

                this.writeDeliveryRecord(
                    result.delivery
                );

                this.completeGenerationSteps();

                this.configureSuccessMessage(
                    result.delivery
                );

                this.showSuccess();
            } catch (error) {
                console.error(
                    "GrowWithHR: advisory generation or delivery failed.",
                    error
                );

                this.showGenerationError(
                    "Your answers are safe, but we couldn’t finish the advisory delivery. Try again without completing the briefing again."
                );
            } finally {
                this.isSubmitting =
                    false;

                this.setGenerateButtonState(
                    false
                );
            }
        }

        beginGeneration() {
            this.clearGenerationTimers();

            this.showOnly(
                "loading"
            );

            if (
                this.elements
                    .generationError
            ) {
                this.elements
                    .generationError
                    .hidden =
                    true;
            }

            if (
                this.elements
                    .generationSteps
            ) {
                this.elements
                    .generationSteps
                    .hidden =
                    false;
            }

            if (
                this.elements
                    .loadingMessage
            ) {
                this.elements
                    .loadingMessage
                    .hidden =
                    false;
            }

            this.configureGenerationLabels([
                "Organising your context",
                "Building your advisory document",
                "Sending your advisory"
            ]);

            this.resetGenerationSteps();

            this.focusScreen(
                this.elements.loading
            );
        }

        configureGenerationLabels(
            labels
        ) {
            this.elements
                .generationSteps
                ?.querySelectorAll(
                    "[data-generation-step]"
                )
                .forEach(
                    (item, index) => {
                        const icon =
                            item
                                .querySelector(
                                    "i"
                                );

                        item.replaceChildren();

                        if (icon) {
                            item.appendChild(
                                icon
                            );
                        }

                        item.append(
                            document
                                .createTextNode(
                                    labels[index] ||
                                    `Step ${index + 1}`
                                )
                        );
                    }
                );
        }

        completeGenerationSteps() {
            this.elements
                .generationSteps
                ?.querySelectorAll(
                    "[data-generation-step]"
                )
                .forEach((item) => {
                    item
                        .classList
                        .remove(
                            "is-active"
                        );

                    item
                        .classList
                        .add(
                            "is-complete"
                        );

                    const icon =
                        item
                            .querySelector(
                                "i"
                            );

                    if (icon) {
                        icon.className =
                            "fa-solid fa-circle-check";
                    }
                });

            if (
                this.elements
                    .loadingMessage
            ) {
                this.elements
                    .loadingMessage
                    .textContent =
                    "Your advisory is ready.";
            }
        }

        setGenerateButtonState(
            isBusy
        ) {
            const button =
                this.elements
                    .generateButton;

            if (!button) {
                return;
            }

            if (isBusy) {
                button
                    .dataset
                    .originalHtml =
                    button.innerHTML;

                button.disabled =
                    true;

                button.setAttribute(
                    "aria-busy",
                    "true"
                );

                button.innerHTML =
                    '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Preparing advisory';
            } else {
                button.disabled =
                    false;

                button.removeAttribute(
                    "aria-busy"
                );

                if (
                    button
                        .dataset
                        .originalHtml
                ) {
                    button.innerHTML =
                        button
                            .dataset
                            .originalHtml;

                    delete button
                        .dataset
                        .originalHtml;
                }
            }
        }

        async prepareAdvisoryPdf(
            reportData,
            leadRecord
        ) {
            const documentResult =
                await this
                    .deliveryService
                    .preparePdf({
                        report:
                            reportData,

                        lead:
                            leadRecord,

                        answers: {
                            ...this.answers
                        }
                    });

            this.lastPdfDocument =
                documentResult;

            return documentResult;
        }

        async deliverAdvisory({
            action,
            leadRecord,
            reportData,
            pdfDocument
        }) {
            return this
                .deliveryService
                .send({
                    action,

                    lead:
                        leadRecord,

                    report:
                        reportData,

                    answers: {
                        ...this.answers
                    },

                    pdf:
                        pdfDocument
                });
        }

        configureSuccessMessage(
            delivery
        ) {
            const paragraph =
                this.elements
                    .success
                    ?.querySelector(
                        ".advisory-panel-heading p"
                    );

            if (!paragraph) {
                return;
            }

            const customerSent =
                Delivery
                    .customerWasSent(
                        delivery
                    );

            paragraph.textContent =
                customerSent
                    ? `Built around your organisation’s current stage and sent to ${this.lead.email}.`
                    : "Built around your organisation’s current stage—not a generic score or checklist.";
        }

        allowInterfacePaint() {
            return Delivery
                .allowInterfacePaint();
        }

        resetGenerationSteps() {
            this.elements
                .generationSteps
                ?.querySelectorAll(
                    "[data-generation-step]"
                )
                .forEach(
                    (item, index) => {
                        item
                            .classList
                            .toggle(
                                "is-active",
                                index === 0
                            );

                        item
                            .classList
                            .remove(
                                "is-complete"
                            );

                        const icon =
                            item
                                .querySelector(
                                    "i"
                                );

                        if (icon) {
                            icon.className =
                                index === 0
                                    ? "fa-solid fa-circle-notch"
                                    : "fa-regular fa-circle";
                        }
                    }
                );
        }

        setGenerationStep(
            activeIndex,
            message
        ) {
            this.elements
                .generationSteps
                ?.querySelectorAll(
                    "[data-generation-step]"
                )
                .forEach(
                    (item, index) => {
                        const icon =
                            item
                                .querySelector(
                                    "i"
                                );

                        item
                            .classList
                            .toggle(
                                "is-active",
                                index ===
                                    activeIndex
                            );

                        item
                            .classList
                            .toggle(
                                "is-complete",
                                index <
                                    activeIndex
                            );

                        if (!icon) {
                            return;
                        }

                        if (
                            index <
                            activeIndex
                        ) {
                            icon.className =
                                "fa-solid fa-circle-check";
                        } else if (
                            index ===
                            activeIndex
                        ) {
                            icon.className =
                                "fa-solid fa-circle-notch";
                        } else {
                            icon.className =
                                "fa-regular fa-circle";
                        }
                    }
                );

            if (
                this.elements
                    .loadingMessage
            ) {
                this.elements
                    .loadingMessage
                    .textContent =
                    message;
            }
        }

        showGenerationError(message) {
            this.clearGenerationTimers();

            this.showOnly(
                "loading"
            );

            if (
                this.elements
                    .generationSteps
            ) {
                this.elements
                    .generationSteps
                    .hidden =
                    true;
            }

            if (
                this.elements
                    .loadingMessage
            ) {
                this.elements
                    .loadingMessage
                    .hidden =
                    true;
            }

            if (
                this.elements
                    .generationError
            ) {
                this.elements
                    .generationError
                    .hidden =
                    false;

                const paragraph =
                    this.elements
                        .generationError
                        .querySelector(
                            "p"
                        );

                if (
                    paragraph &&
                    message
                ) {
                    paragraph.textContent =
                        message;
                }
            }

            this.focusScreen(
                this.elements.loading
            );

            this.announce(
                "We could not prepare the advisory yet. Your answers are saved.",
                true
            );
        }

        populateSuccessDetails() {
            const now =
                new Date();

            const date =
                new Intl.DateTimeFormat(
                    "en-IN",
                    {
                        day:
                            "numeric",

                        month:
                            "long",

                        year:
                            "numeric"
                    }
                ).format(now);

            if (
                this.elements
                    .preparedForName
            ) {
                this.elements
                    .preparedForName
                    .textContent =
                    this.lead.name ||
                    "you";
            }

            if (
                this.elements
                    .preparedForCompany
            ) {
                this.elements
                    .preparedForCompany
                    .textContent =
                    this.answers
                        .companyName ||
                    "Your organisation";
            }

            if (
                this.elements
                    .preparedDate
            ) {
                this.elements
                    .preparedDate
                    .textContent =
                    date;

                this.elements
                    .preparedDate
                    .dateTime =
                    now
                        .toISOString()
                        .slice(
                            0,
                            10
                        );
            }
        }

        async downloadReport() {
            const button =
                this.elements
                    .downloadReportButton;

            if (button) {
                button.disabled =
                    true;
            }

            try {
                const result =
                    await this
                        .deliveryService
                        .download({
                            report:
                                this
                                    .writeReportData(),

                            lead:
                                this
                                    .writeLeadRecord(),

                            answers: {
                                ...this.answers
                            },

                            pdf:
                                this
                                    .lastPdfDocument,

                            reportUrl:
                                this
                                    .reportUrl
                        });

                this.lastPdfDocument =
                    result.pdf ||
                    this
                        .lastPdfDocument;

                if (
                    result.mode ===
                    "print-fallback"
                ) {
                    this.openPrintableReport();
                }
            } catch (error) {
                console.error(
                    "GrowWithHR: PDF download failed.",
                    error
                );

                this.announce(
                    "We could not download the PDF just yet. Open the advisory and use Print instead.",
                    true
                );
            } finally {
                if (button) {
                    button.disabled =
                        false;
                }
            }
        }

        openPrintableReport() {
            const reportWindow =
                window.open(
                    this.reportUrl,
                    "_blank"
                );

            if (!reportWindow) {
                this.announce(
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

            reportWindow.addEventListener(
                "load",
                () => {
                    window.setTimeout(
                        () => {
                            try {
                                reportWindow.focus();
                                reportWindow.print();
                            } catch (error) {
                                console.warn(
                                    "GrowWithHR: automatic print could not start.",
                                    error
                                );
                            }
                        },
                        500
                    );
                },
                {
                    once: true
                }
            );
        }

        async requestAnotherEmail() {
            const button =
                this.elements
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
                    await this
                        .deliveryService
                        .resendCustomer({
                            lead:
                                this
                                    .writeLeadRecord(),

                            report:
                                this
                                    .writeReportData(),

                            answers: {
                                ...this.answers
                            },

                            pdf:
                                this
                                    .lastPdfDocument
                        });

                this.lastPdfDocument =
                    result.pdf ||
                    this
                        .lastPdfDocument;

                this.writeDeliveryRecord(
                    result.delivery
                );

                button.textContent =
                    "Copy sent";

                this.announce(
                    `Another advisory copy has been sent to ${this.lead.email}.`
                );
            } catch (error) {
                console.error(
                    "GrowWithHR: advisory resend failed.",
                    error
                );

                button.textContent =
                    "Couldn’t send copy";

                this.announce(
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
        }

        writeReportData() {
            const report =
                ReportMapper
                    .buildReportData(
                        this
                            .createModuleContext()
                    );

            Storage.writeReport(
                report
            );

            return report;
        }

        writeLeadRecord() {
            const leadRecord =
                ReportMapper
                    .buildLeadRecord(
                        this
                            .createModuleContext()
                    );

            Storage.writeLead(
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
        }

        async submitLeadToEndpoint(
            action,
            existingPayload = null
        ) {
            const payload =
                existingPayload ||
                {
                    lead:
                        this
                            .writeLeadRecord(),

                    advisory:
                        this
                            .writeReportData()
                };

            return this
                .deliveryService
                .submitLeadToEndpoint(
                    action,
                    {
                        lead:
                            payload.lead,

                        report:
                            payload.advisory ||
                            payload.report,

                        answers: {
                            ...this.answers
                        }
                    }
                );
        }

        writeDeliveryRecord(
            record = {}
        ) {
            const deliveryRecord =
                Storage.mergeDelivery(
                    this.delivery,
                    record
                );

            if (deliveryRecord) {
                this.delivery =
                    deliveryRecord;
            }

            return (
                deliveryRecord ||
                this.delivery
            );
        }

        saveNow() {
            const saved =
                Storage.writeAssessment(
                    this
                        .stateModel
                        .createPersistenceSnapshot()
                );

            this.updateSaveStatus(
                saved
                    ? "Progress saved"
                    : "Progress could not be saved"
            );

            return saved;
        }

        queueSave() {
            this.updateSaveStatus(
                "Saving…"
            );

            window.clearTimeout(
                this.saveTimer
            );

            this.saveTimer =
                window.setTimeout(
                    () => {
                        this.saveNow();
                    },
                    300
                );
        }

        restoreState() {
            const saved =
                Storage.readAssessment();

            if (!saved) {
                return null;
            }

            this.stateModel.restore({
                ...saved,

                delivery:
                    Storage.readDelivery()
            });

            this.syncIndustryCatalog();
            this.populateLeadForm();

            return saved;
        }

        clearSavedState() {
            const cleared =
                Storage.clearUserData();

            this
                .deliveryService
                .clearRuntimeState();

            this.lastPdfDocument =
                null;

            return cleared;
        }

        updateSaveStatus(message) {
            if (
                !this.elements
                    .saveStatus
            ) {
                return;
            }

            this.elements
                .saveStatus
                .textContent =
                message;

            if (
                message ===
                "Progress saved"
            ) {
                window.setTimeout(
                    () => {
                        if (
                            this.elements
                                .saveStatus
                                ?.textContent ===
                            "Progress saved"
                        ) {
                            this.elements
                                .saveStatus
                                .textContent =
                                "Progress saves automatically";
                        }
                    },
                    1600
                );
            }
        }

        openExitModal() {
            if (
                !this.elements
                    .exitModal
            ) {
                return;
            }

            this.lastFocusedElement =
                document
                    .activeElement;

            this.saveNow();

            this.elements
                .exitModal
                .hidden =
                false;

            document
                .body
                .classList
                .add(
                    "has-advisory-modal"
                );

            this.elements
                .cancelExitButton
                ?.focus();
        }

        closeExitModal() {
            if (
                !this.elements
                    .exitModal
            ) {
                return;
            }

            this.elements
                .exitModal
                .hidden =
                true;

            document
                .body
                .classList
                .remove(
                    "has-advisory-modal"
                );

            this.lastFocusedElement
                ?.focus
                ?.();
        }

        hasReportData() {
            return Storage.hasReport();
        }

        clearGenerationTimers() {
            this.generationTimers
                .forEach((timer) => {
                    window.clearTimeout(
                        timer
                    );
                });

            this.generationTimers = [];
        }

        populateSuccessFromReport() {
            this.populateSuccessDetails();
        }

        answerText(key, fallback) {
            return Utils.answerText(
                this.answers,
                key,
                fallback
            );
        }

        remoteDescription() {
            return Utils
                .remoteDescription(
                    this.answers,
                    Definitions
                        .REMOTE_OPTIONS
                );
        }

        remoteReportValue() {
            return Utils
                .remoteReportValue(
                    this.answers
                );
        }

        hiringDescription() {
            return Utils
                .hiringDescription(
                    this.answers,
                    Definitions
                        .HIRING_OPTIONS
                );
        }

        labelsFor(values, options) {
            return Utils.labelsFor(
                values,
                options
            );
        }

        humanList(items) {
            return Utils.humanList(
                items
            );
        }

        numberText(
            value,
            fallback
        ) {
            return Utils.numberText(
                value,
                fallback
            );
        }

        hasNumber(value) {
            return Utils.hasNumber(
                value
            );
        }

        normaliseNumber(
            value,
            fallback = 0
        ) {
            return Utils
                .normaliseNumber(
                    value,
                    fallback
                );
        }

        pluralise(word, value) {
            return Utils.pluralise(
                word,
                value
            );
        }

        withArticle(value) {
            return Utils.withArticle(
                value
            );
        }

        ensureSentence(value) {
            return Utils
                .ensureSentence(
                    value
                );
        }

        isValidEmail(email) {
            return Utils.isValidEmail(
                email
            );
        }

        clampMoment(moment) {
            return Utils.clampMoment(
                moment,
                MOMENTS.length
            );
        }

        focusScreen(target) {
            window.requestAnimationFrame(
                () => {
                    if (
                        target?.matches(
                            "[tabindex]"
                        )
                    ) {
                        target.focus({
                            preventScroll:
                                true
                        });
                    } else {
                        target?.setAttribute(
                            "tabindex",
                            "-1"
                        );

                        target?.focus({
                            preventScroll:
                                true
                        });
                    }

                    window.scrollTo({
                        top:
                            0,

                        behavior:
                            this
                                .prefersReducedMotion()
                                ? "auto"
                                : "smooth"
                    });
                }
            );
        }

        announce(
            message,
            assertive = false
        ) {
            const region =
                assertive
                    ? this.elements
                        .assertiveRegion
                    : this.elements
                        .liveRegion;

            if (!region) {
                return;
            }

            region.textContent =
                "";

            window.requestAnimationFrame(
                () => {
                    region.textContent =
                        message;
                }
            );
        }

        prefersReducedMotion() {
            return (
                window
                    .matchMedia
                    ?.(
                        "(prefers-reduced-motion: reduce)"
                    )
                    .matches ||
                false
            );
        }

        cssEscape(value) {
            return Utils.cssEscape(
                value
            );
        }

        escapeAttribute(value) {
            return Utils
                .escapeAttribute(
                    value
                );
        }

        escapeHtml(value) {
            return Utils.escapeHtml(
                value
            );
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            if (
                !document
                    .body
                    .classList
                    .contains(
                        "analyze-company-page"
                    ) ||
                window
                    .executiveAssessment
            ) {
                return;
            }

            window
                .ExecutiveAdvisoryBriefing =
                ExecutiveAdvisoryBriefing;

            window
                .executiveAssessment =
                new ExecutiveAdvisoryBriefing();

            window.dispatchEvent(
                new CustomEvent(
                    "growwithhr:assessment-modules-ready",
                    {
                        detail: {
                            version:
                                "1.0.0",

                            modules: [
                                ...requiredModules
                            ],

                            application:
                                window
                                    .executiveAssessment
                        }
                    }
                )
            );
        }
    );
})();
