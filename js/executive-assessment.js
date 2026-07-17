/* ==========================================================
   GrowWithHR
   Executive Advisory Briefing
   Story-led assessment engine
   Version: 2.0.0
========================================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "growwithhr-advisory-briefing-v2";
    const REPORT_KEY = "growwithhr-report";
    const LEAD_KEY = "growwithhr-lead";
    const DEFAULT_REPORT_URL = "executive-advisory-report.html";

    const INDUSTRIES = [
        "Information Technology / SaaS",
        "Consulting & Professional Services",
        "Manufacturing",
        "Retail",
        "Healthcare",
        "Education",
        "Financial Services",
        "Logistics",
        "Hospitality",
        "Construction",
        "Other"
    ];

    const STATES = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi (NCT)",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry"
    ];

    const ENTITY_OPTIONS = [
        ["Private Limited", "Private Limited"],
        ["Public Limited", "Public Limited"],
        ["LLP", "LLP"],
        ["One Person Company", "One Person Company"],
        ["DPIIT Recognized Startup", "Recognised startup"],
        ["Partnership", "Partnership"],
        ["Proprietorship", "Proprietorship"],
        ["Trust / Society", "Trust or society"],
        ["Government / PSU", "Government or PSU"],
        ["Other", "Other"],
        ["Not Sure", "Not sure"]
    ];

    const FUNDING_OPTIONS = [
        ["Bootstrapped", "Self-funded or bootstrapped"],
        ["Seed", "Seed"],
        ["Series A", "Series A"],
        ["Series B", "Series B"],
        ["Series C+", "Series C or later"],
        ["Public", "Publicly listed"],
        ["Not Applicable", "Not applicable"],
        ["Not Sure", "Not sure"]
    ];

    const WORK_MODEL_OPTIONS = [
        ["Office Based", "Mainly on-site", "Most people work from a shared workplace."],
        ["Hybrid", "Hybrid", "People divide their time between on-site and remote work."],
        ["Remote", "Mainly remote", "Most people work away from a permanent workplace."],
        ["Field Workforce", "Field-based", "A large part of the team works at customer or field locations."],
        ["Manufacturing / Plant", "Plant or manufacturing", "Work is primarily delivered from plants or production sites."],
        ["Mixed", "Mixed", "The organisation uses several different working models."]
    ];

    const REMOTE_OPTIONS = [
        ["0", "None"],
        ["1-24", "Less than 25%"],
        ["25-50", "25–50%"],
        ["51-75", "51–75%"],
        ["76-99", "More than 75%"],
        ["100", "Fully remote"],
        ["not-sure", "Not sure"],
        ["exact", "Enter an exact percentage"]
    ];

    const HIRING_OPTIONS = [
        ["Significant Growth", "Grow significantly", "A meaningful increase in team size is expected."],
        ["Moderate Growth", "Grow steadily", "The team will grow at a measured pace."],
        ["Selective Hiring", "Hire selectively", "Hiring will focus on a small number of priority roles."],
        ["Maintain Current Size", "Stay about the same size", "The organisation expects limited net headcount growth."],
        ["Unsure; Market drives hiring needs", "Unsure or market-led", "Hiring will depend on market and business conditions."]
    ];

    const EXPANSION_OPTIONS = [
        ["new-locations", "Open new locations"],
        ["new-markets", "Enter new markets or countries"],
        ["new-products", "Introduce new products or services"],
        ["scale-operations", "Scale current operations"],
        ["restructure", "Restructure or improve efficiency"],
        ["no-major-expansion", "No major expansion planned"],
        ["still-deciding", "Still deciding"]
    ];

    const PEOPLE_FUNCTION_OPTIONS = [
        ["Dedicated HR Team", "Dedicated HR or People team", "A team owns the organisation's People or HR work."],
        ["Single HR/People Professional", "One HR or People professional", "One dedicated person leads the function."],
        ["Founder Led", "Founder-led", "Founders or senior leaders make most people decisions."],
        ["Shared Admin Function", "Shared with administration or operations", "People work is combined with another business function."],
        ["External Consultant", "Supported by an external consultant", "External specialists provide ongoing HR support."],
        ["No Formal HR/People Function", "No formal HR or People function", "There is no defined owner or structure today."]
    ];

    const PRIORITY_OPTIONS = [
        ["hiring-onboarding", "Hiring and onboarding"],
        ["policies-compliance", "Policies and compliance"],
        ["performance-rewards", "Performance and rewards"],
        ["manager-capability", "Manager capability"],
        ["culture-engagement", "Culture and engagement"],
        ["hr-operations-technology", "HR operations and technology"],
        ["workforce-planning", "Workforce planning"],
        ["organisation-design", "Organisation design"]
    ];

    const ROLE_LABELS = {
        "founder-business-leader": "Founder or business leader",
        "hr-people-leader": "HR or People leader",
        "operations-leader": "Operations leader",
        "finance-leader": "Finance leader",
        "consultant-advisor": "Consultant or advisor",
        "other": "Other"
    };

    const MOMENTS = [
        {
            chapter: 0,
            eyebrow: "Your business",
            title: "Let’s start with the business you’re building.",
            description: "These basics help us keep every recommendation grounded in your organisation’s reality.",
            render: (app) => app.renderBusinessBasics(),
            validate: (app) => app.validateBusinessBasics()
        },
        {
            chapter: 0,
            eyebrow: "Your business",
            title: "Give us a little context around its stage.",
            description: "Approximate answers are enough. Choose “Not sure” whenever you do not have the information.",
            render: (app) => app.renderBusinessStage(),
            validate: (app) => app.validateBusinessStage()
        },
        {
            chapter: 1,
            eyebrow: "Your people",
            title: "Who helps the organisation deliver?",
            description: "Start with the core team. Add other workforce groups only when they apply.",
            render: (app) => app.renderWorkforce(),
            validate: (app) => app.validateWorkforce()
        },
        {
            chapter: 1,
            eyebrow: "Your people",
            title: "How does the team usually work?",
            description: "Choose what best reflects everyday working arrangements rather than formal policy.",
            render: (app) => app.renderWorkingModel(),
            validate: (app) => app.validateWorkingModel()
        },
        {
            chapter: 2,
            eyebrow: "How work happens",
            title: "How distributed are your operations?",
            description: "This helps us understand the complexity of communication, policy and people operations across the organisation.",
            render: (app) => app.renderOperatingFootprint(),
            validate: (app) => app.validateOperatingFootprint()
        },
        {
            chapter: 3,
            eyebrow: "Your next chapter",
            title: "What is likely to change next?",
            description: "Your future direction helps us prioritise the people foundations you may need next—not only what you need today.",
            render: (app) => app.renderGrowthDirection(),
            validate: (app) => app.validateGrowthDirection()
        },
        {
            chapter: 3,
            eyebrow: "Your next chapter",
            title: "How are people decisions supported today?",
            description: "This final step helps us make the advisory practical for your current level of People and HR support.",
            render: (app) => app.renderPeopleReadiness(),
            validate: (app) => app.validatePeopleReadiness()
        }
    ];

    const CHAPTERS = [
        "Your business",
        "Your people",
        "How work happens",
        "Your next chapter"
    ];

    class ExecutiveAdvisoryBriefing {
        constructor() {
            this.config = this.readConfig();
            this.reportUrl = this.resolveReportUrl();
            this.currentMoment = 0;
            this.started = false;
            this.completed = false;
            this.answers = {
                locations: "1",
                countries: "1",
                expansionPlans: [],
                priorities: []
            };
            this.lead = {
                name: "",
                email: "",
                role: "",
                serviceConsent: false,
                marketingConsent: false
            };
            this.ui = {
                showSupplementalWorkforce: false
            };
            this.generationTimers = [];
            this.saveTimer = null;
            this.lastFocusedElement = null;

            this.cacheElements();
            this.bindEvents();
            this.restoreState();
            this.initialiseView();
        }

        readConfig() {
            const element = document.getElementById("assessmentConfig");

            if (!element) {
                return {};
            }

            try {
                return JSON.parse(element.textContent || "{}");
            } catch (error) {
                console.warn("GrowWithHR: assessment configuration could not be read.", error);
                return {};
            }
        }

        resolveReportUrl() {
            const configured = String(this.config.report || "").trim();

            // The sample report remains available from the entry screen. The completed
            // briefing must open the dynamic executive report.
            if (!configured || configured === "sample-advisory-report.html") {
                return DEFAULT_REPORT_URL;
            }

            return configured;
        }

        cacheElements() {
            const byId = (id) => document.getElementById(id);

            this.elements = {
                shell: byId("assessmentShell"),
                landing: byId("landingScreen"),
                workspace: byId("conversationWorkspace"),
                review: byId("reviewScreen"),
                contact: byId("contactScreen"),
                loading: byId("loadingScreen"),
                success: byId("successScreen"),

                resumePanel: byId("resumePanel"),
                resumeMessage: byId("resumeMessage"),
                resumeButton: byId("resumeAssessmentButton"),
                startAgainButton: byId("startAgainButton"),
                startButton: byId("startAssessment"),

                saveStatus: byId("saveStatus"),
                saveExitButton: byId("saveExitButton"),

                storyForm: byId("storyForm"),
                storyContainer: byId("storyContainer"),
                storyEyebrow: byId("storyEyebrow"),
                stepTitle: byId("stepTitle"),
                stepDescription: byId("stepDescription"),
                stepIndicator: byId("stepIndicator"),
                desktopTime: byId("desktopTimeRemaining"),
                mobileTime: byId("mobileTimeRemaining"),
                progressTrack: byId("progressTrack"),
                progressBar: byId("progressBar"),
                footerMessage: byId("footerMessage"),
                backButton: byId("backButton"),
                nextButton: byId("nextButton"),
                chapterRail: byId("chapterRail"),

                businessSummary: byId("businessSummary"),
                peopleSummary: byId("peopleSummary"),
                operationsSummary: byId("operationsSummary"),
                growthSummary: byId("growthSummary"),
                reviewBackButton: byId("reviewBackButton"),
                continueToContactButton: byId("continueToContactButton"),

                leadForm: byId("leadCaptureForm"),
                leadName: byId("leadName"),
                leadEmail: byId("leadEmail"),
                leadRole: byId("leadRole"),
                serviceConsent: byId("serviceConsent"),
                marketingConsent: byId("marketingConsent"),
                leadNameError: byId("leadNameError"),
                leadEmailError: byId("leadEmailError"),
                serviceConsentError: byId("serviceConsentError"),
                contactBackButton: byId("contactBackButton"),
                generateButton: byId("generateReportButton"),

                generationSteps: byId("generationSteps"),
                loadingMessage: byId("loadingMessage"),
                generationError: byId("generationError"),
                retryGenerationButton: byId("retryGenerationButton"),
                returnToReviewButton: byId("returnToReviewButton"),

                preparedForName: byId("preparedForName"),
                preparedForCompany: byId("preparedForCompany"),
                preparedDate: byId("preparedDate"),
                viewReportButton: byId("viewReportButton"),
                downloadReportButton: byId("downloadReportButton"),
                emailAgainButton: byId("emailAgainButton"),
                editAnswersButton: byId("editAnswersButton"),

                exitModal: byId("exitModal"),
                cancelExitButton: byId("cancelExitButton"),
                confirmExitButton: byId("confirmExitButton"),

                liveRegion: byId("liveRegion"),
                assertiveRegion: byId("assertiveRegion")
            };
        }

        bindEvents() {
            const { elements } = this;

            elements.startButton?.addEventListener("click", () => this.startNewBriefing());
            elements.resumeButton?.addEventListener("click", () => this.resumeBriefing());
            elements.startAgainButton?.addEventListener("click", () => this.requestRestart());

            elements.storyForm?.addEventListener("submit", (event) => {
                event.preventDefault();
                this.continueFromMoment();
            });

            elements.backButton?.addEventListener("click", () => this.goBack());

            elements.storyContainer?.addEventListener("input", (event) => {
                this.captureStoryInput(event.target);
            });

            elements.storyContainer?.addEventListener("change", (event) => {
                this.captureStoryInput(event.target);
                this.handleDynamicControl(event.target);
            });

            elements.storyContainer?.addEventListener("click", (event) => {
                const toggle = event.target.closest("[data-toggle-supplemental-workforce]");

                if (toggle) {
                    this.ui.showSupplementalWorkforce = !this.ui.showSupplementalWorkforce;
                    this.queueSave();
                    this.renderCurrentMoment({ preserveFocus: true });
                }
            });

            document.querySelectorAll("[data-edit-screen]").forEach((button) => {
                button.addEventListener("click", () => {
                    const moment = Number(button.dataset.editScreen);
                    this.showMoment(Number.isInteger(moment) ? moment : 0);
                });
            });

            elements.reviewBackButton?.addEventListener("click", () => this.showMoment(MOMENTS.length - 1));
            elements.continueToContactButton?.addEventListener("click", () => this.showContact());
            elements.contactBackButton?.addEventListener("click", () => this.showReview());

            elements.leadForm?.addEventListener("input", () => {
                this.captureLeadData();
                this.queueSave();
            });

            elements.leadForm?.addEventListener("change", () => {
                this.captureLeadData();
                this.queueSave();
            });

            elements.leadForm?.addEventListener("submit", (event) => {
                event.preventDefault();
                this.submitLeadAndGenerate();
            });

            elements.retryGenerationButton?.addEventListener("click", () => this.submitLeadAndGenerate());
            elements.returnToReviewButton?.addEventListener("click", () => this.showReview());

            elements.viewReportButton?.addEventListener("click", () => {
                window.location.href = this.reportUrl;
            });

            elements.downloadReportButton?.addEventListener("click", () => this.downloadReport());
            elements.emailAgainButton?.addEventListener("click", () => this.requestAnotherEmail());
            elements.editAnswersButton?.addEventListener("click", () => this.showReview());

            elements.saveExitButton?.addEventListener("click", () => this.openExitModal());
            elements.cancelExitButton?.addEventListener("click", () => this.closeExitModal());
            elements.confirmExitButton?.addEventListener("click", () => {
                this.saveNow();
                window.location.href = "index.html";
            });

            document.querySelectorAll("[data-close-exit-modal]").forEach((element) => {
                element.addEventListener("click", () => this.closeExitModal());
            });

            document.addEventListener("keydown", (event) => {
                if (event.key !== "Escape" || elements.exitModal?.hidden) {
                    return;
                }

                event.preventDefault();
                this.closeExitModal();
            });
        }

        initialiseView() {
            this.populateLeadForm();

            if (this.completed && this.hasReportData()) {
                this.configureResumePanel(true);
            } else if (this.started) {
                this.configureResumePanel(false);
            }

            this.showOnly("landing");
        }

        configureResumePanel(isCompleted) {
            const { resumePanel, resumeMessage, resumeButton } = this.elements;

            if (!resumePanel || !resumeMessage || !resumeButton) {
                return;
            }

            resumePanel.hidden = false;

            if (isCompleted) {
                resumeMessage.textContent = "Your completed advisory is available on this device.";
                resumeButton.textContent = "Open my saved advisory";
            } else {
                const chapter = MOMENTS[this.currentMoment]?.chapter ?? 0;
                resumeMessage.textContent = `Continue with ${CHAPTERS[chapter].toLowerCase()}, or begin again.`;
                resumeButton.textContent = "Continue my advisory";
            }
        }

        startNewBriefing() {
            this.started = true;
            this.completed = false;
            this.currentMoment = 0;
            this.answers = {
                locations: "1",
                countries: "1",
                expansionPlans: [],
                priorities: []
            };
            this.lead = {
                name: "",
                email: "",
                role: "",
                serviceConsent: false,
                marketingConsent: false
            };
            this.ui = {
                showSupplementalWorkforce: false
            };
            this.populateLeadForm();
            this.saveNow();
            this.showMoment(0);
            this.announce("Executive Advisory Briefing started.");
        }

        resumeBriefing() {
            if (this.completed && this.hasReportData()) {
                this.showSuccess();
                return;
            }

            this.started = true;
            this.showMoment(this.clampMoment(this.currentMoment));
            this.announce(`Continuing at story ${this.currentMoment + 1} of ${MOMENTS.length}.`);
        }

        requestRestart() {
            const shouldRestart = window.confirm(
                "Start the advisory again? Your saved answers on this device will be cleared."
            );

            if (shouldRestart) {
                this.clearSavedState();
                this.startNewBriefing();
            }
        }

        continueFromMoment() {
            this.captureAllStoryInputs();
            const isValid = MOMENTS[this.currentMoment].validate(this);

            if (!isValid) {
                return;
            }

            this.clearMomentErrors();
            this.saveNow();

            if (this.currentMoment >= MOMENTS.length - 1) {
                this.showReview();
                return;
            }

            this.showMoment(this.currentMoment + 1);
        }

        goBack() {
            if (this.currentMoment <= 0) {
                this.showOnly("landing");
                this.elements.resumePanel.hidden = false;
                return;
            }

            this.captureAllStoryInputs();
            this.saveNow();
            this.showMoment(this.currentMoment - 1);
        }

        showMoment(momentIndex) {
            this.started = true;
            this.currentMoment = this.clampMoment(momentIndex);
            this.showOnly("workspace");
            this.renderCurrentMoment();
            this.saveNow();
            this.focusScreen(this.elements.stepTitle);
        }

        renderCurrentMoment(options = {}) {
            const moment = MOMENTS[this.currentMoment];

            if (!moment || !this.elements.storyContainer) {
                return;
            }

            const focusedId = options.preserveFocus ? document.activeElement?.id : null;

            this.elements.storyEyebrow.textContent = moment.eyebrow;
            this.elements.stepTitle.textContent = moment.title;
            this.elements.stepDescription.textContent = moment.description;
            this.elements.storyContainer.innerHTML = moment.render(this);

            this.updateProgress();
            this.updateChapterRail();
            this.updateNavigation();
            this.updateDynamicVisibility();

            if (focusedId) {
                document.getElementById(focusedId)?.focus({ preventScroll: true });
            }
        }

        updateProgress() {
            const moment = MOMENTS[this.currentMoment];
            const progress = ((this.currentMoment + 1) / MOMENTS.length) * 100;
            const remainingMinutes = Math.max(1, Math.ceil((MOMENTS.length - this.currentMoment) * 0.7));
            const timeText = this.currentMoment >= MOMENTS.length - 1
                ? "About 1 minute remaining"
                : `About ${remainingMinutes} minutes remaining`;

            this.elements.stepIndicator.textContent =
                `Chapter ${moment.chapter + 1} of ${CHAPTERS.length} · ${CHAPTERS[moment.chapter]}`;
            this.elements.desktopTime.textContent = timeText;
            this.elements.mobileTime.textContent = timeText;
            this.elements.footerMessage.textContent = `Story ${this.currentMoment + 1} of ${MOMENTS.length}`;
            this.elements.progressBar.style.width = `${progress}%`;
            this.elements.progressTrack.setAttribute("aria-valuenow", String(this.currentMoment + 1));
            this.elements.progressTrack.setAttribute(
                "aria-valuetext",
                `Story ${this.currentMoment + 1} of ${MOMENTS.length}. ${timeText}.`
            );
        }

        updateChapterRail() {
            const currentChapter = MOMENTS[this.currentMoment].chapter;

            this.elements.chapterRail?.querySelectorAll("[data-chapter]").forEach((item) => {
                const chapter = Number(item.dataset.chapter);
                const marker = item.querySelector(".advisory-chapter__marker");

                item.classList.toggle("is-current", chapter === currentChapter);
                item.classList.toggle("is-complete", chapter < currentChapter);

                if (chapter === currentChapter) {
                    item.setAttribute("aria-current", "step");
                } else {
                    item.removeAttribute("aria-current");
                }

                if (marker) {
                    marker.textContent = chapter < currentChapter ? "✓" : String(chapter + 1);
                }
            });
        }

        updateNavigation() {
            const finalMoment = this.currentMoment === MOMENTS.length - 1;

            this.elements.backButton.hidden = false;
            this.elements.nextButton.innerHTML = finalMoment
                ? 'Review my organisation story <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>'
                : 'Continue <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
        }

        showReview() {
            this.captureAllStoryInputs();
            this.saveNow();
            this.buildReviewSummaries();
            this.showOnly("review");
            this.focusScreen(this.elements.review);
            this.announce("Your organisation story is ready to review.");
        }

        showContact() {
            this.populateLeadForm();
            this.clearLeadErrors();
            this.showOnly("contact");
            this.focusScreen(this.elements.contact);
            this.announce("Final step. Enter your name and work email to generate the advisory.");
        }

        showSuccess() {
            this.completed = true;
            this.started = true;
            this.populateSuccessDetails();
            this.showOnly("success");
            this.saveNow();
            this.focusScreen(this.elements.success);
            this.announce("Your advisory is ready.");
        }

        showOnly(screenName) {
            const screens = {
                landing: this.elements.landing,
                workspace: this.elements.workspace,
                review: this.elements.review,
                contact: this.elements.contact,
                loading: this.elements.loading,
                success: this.elements.success
            };

            Object.entries(screens).forEach(([name, element]) => {
                if (element) {
                    element.hidden = name !== screenName;
                }
            });

            if (this.elements.shell) {
                this.elements.shell.dataset.screen = screenName;
            }

            this.elements.saveExitButton.hidden =
                screenName === "landing" || screenName === "success";
        }

        renderBusinessBasics() {
            return `
                <div class="advisory-field-group">
                    ${this.textField({
                        id: "companyName",
                        label: "What should we call your organisation?",
                        helper: "Use the name your team and customers recognise.",
                        placeholder: "Example: Acme Technologies",
                        autocomplete: "organization",
                        required: true
                    })}

                    ${this.datalistField({
                        id: "industry",
                        label: "Which industry comes closest?",
                        helper: "Choose the nearest match. Enter Other when none fits exactly.",
                        placeholder: "Start typing an industry",
                        options: INDUSTRIES,
                        required: true
                    })}

                    ${this.textareaField({
                        id: "nature",
                        label: "In one sentence, what does your organisation do?",
                        helper: "Focus on what you provide and who you provide it to.",
                        placeholder: "Example: We provide payroll software to growing Indian businesses.",
                        maxlength: 220,
                        required: true
                    })}
                </div>
            `;
        }

        renderBusinessStage() {
            const notSure = Boolean(this.answers.foundedNotSure);

            return `
                <div class="advisory-field-group">
                    <div class="advisory-field" data-field-wrapper="founded">
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
                            value="${this.escapeAttribute(this.answers.founded || "")}"
                            aria-describedby="foundedHelp foundedError"
                            ${notSure ? "disabled" : ""}>
                        <p id="foundedHelp" class="advisory-field-help">
                            An approximate year is enough.
                        </p>
                        <label class="advisory-inline-check" for="foundedNotSure">
                            <input
                                id="foundedNotSure"
                                name="foundedNotSure"
                                type="checkbox"
                                ${notSure ? "checked" : ""}>
                            <span>I’m not sure</span>
                        </label>
                        <p id="foundedError" class="advisory-field-error" hidden></p>
                    </div>

                    ${this.selectField({
                        id: "entity",
                        label: "How is the organisation legally structured?",
                        helper: "Choose the closest option. Not sure is a valid answer.",
                        options: ENTITY_OPTIONS,
                        placeholder: "Select a legal structure",
                        required: true
                    })}

                    ${this.selectField({
                        id: "fundingStage",
                        label: "Which funding position is closest today?",
                        helper: "Choose the closest position when it is relevant to your organisation.",
                        options: FUNDING_OPTIONS,
                        placeholder: "Select a funding position",
                        optional: true
                    })}
                </div>
            `;
        }

        renderWorkforce() {
            const expanded = this.ui.showSupplementalWorkforce;

            return `
                <div class="advisory-field-group">
                    ${this.numberField({
                        id: "employees",
                        label: "Roughly how many employees are on the team today?",
                        helper: "A rounded number is perfectly fine.",
                        placeholder: "Example: 75",
                        required: true,
                        min: 0
                    })}

                    <div class="advisory-disclosure">
                        <button
                            class="advisory-disclosure__button"
                            type="button"
                            data-toggle-supplemental-workforce
                            aria-expanded="${expanded}">
                            <span>
                                <strong>Add contractors, interns or apprentices</strong>
                                <small>Optional</small>
                            </span>
                            <i class="fa-solid fa-chevron-${expanded ? "up" : "down"}" aria-hidden="true"></i>
                        </button>

                        <div class="advisory-disclosure__content" ${expanded ? "" : "hidden"}>
                            <div class="advisory-compact-field-grid">
                                ${this.numberField({
                                    id: "contractWorkers",
                                    label: "Contract and outsourced workers",
                                    optional: true,
                                    min: 0
                                })}

                                ${this.numberField({
                                    id: "interns",
                                    label: "Interns",
                                    optional: true,
                                    min: 0
                                })}

                                ${this.numberField({
                                    id: "apprentices",
                                    label: "Apprentices",
                                    optional: true,
                                    min: 0
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        renderWorkingModel() {
            return `
                <div class="advisory-field-group">
                    ${this.choiceCards({
                        id: "workModel",
                        legend: "Which working model is closest?",
                        options: WORK_MODEL_OPTIONS,
                        columns: 2,
                        required: true
                    })}

                    ${this.choicePills({
                        id: "remoteBand",
                        legend: "About how much of the workforce works remotely?",
                        options: REMOTE_OPTIONS,
                        required: true
                    })}

                    <div
                        id="remoteExactField"
                        class="advisory-field advisory-field--nested"
                        data-field-wrapper="remoteExact"
                        ${this.answers.remoteBand === "exact" ? "" : "hidden"}>
                        <label for="remoteExact">Exact remote workforce percentage</label>
                        <div class="advisory-suffix-input">
                            <input
                                id="remoteExact"
                                name="remoteExact"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                inputmode="numeric"
                                value="${this.escapeAttribute(this.answers.remoteExact || "")}"
                                aria-describedby="remoteExactError">
                            <span aria-hidden="true">%</span>
                        </div>
                        <p id="remoteExactError" class="advisory-field-error" hidden></p>
                    </div>
                </div>
            `;
        }

        renderOperatingFootprint() {
            return `
                <div class="advisory-field-group">
                    ${this.datalistField({
                        id: "primaryState",
                        label: "Where is your primary operating base?",
                        helper: "Select the headquarters or principal operating location.",
                        placeholder: "Start typing a state or union territory",
                        options: STATES,
                        required: true
                    })}

                    <div class="advisory-compact-field-grid advisory-compact-field-grid--two">
                        ${this.numberField({
                            id: "locations",
                            label: "How many permanent operating locations do you have?",
                            helper: "Include offices, plants, branches and other permanent sites.",
                            required: true,
                            min: 1
                        })}

                        ${this.numberField({
                            id: "countries",
                            label: "In how many countries do you currently operate?",
                            helper: "Enter one when all operations are within a single country.",
                            required: true,
                            min: 1
                        })}
                    </div>
                </div>
            `;
        }

        renderGrowthDirection() {
            return `
                <div class="advisory-field-group">
                    ${this.choiceCards({
                        id: "hiringPlans",
                        legend: "What best describes your hiring plans for the next 12 months?",
                        options: HIRING_OPTIONS,
                        columns: 1,
                        required: true
                    })}

                    ${this.checkboxCards({
                        id: "expansionPlans",
                        legend: "What changes are most likely over the next 12–18 months?",
                        helper: "Select everything that applies.",
                        options: EXPANSION_OPTIONS,
                        required: true
                    })}

                    ${this.textareaField({
                        id: "growthContext",
                        label: "Is there anything else about your plans that would help us understand the context?",
                        helper: "Optional · A sentence or two is enough.",
                        placeholder: "Add any useful context",
                        maxlength: 240,
                        optional: true,
                        showCounter: true
                    })}
                </div>
            `;
        }

        renderPeopleReadiness() {
            return `
                <div class="advisory-field-group">
                    ${this.choiceCards({
                        id: "peopleFunction",
                        legend: "Which description is closest to your current People or HR function?",
                        options: PEOPLE_FUNCTION_OPTIONS,
                        columns: 2,
                        required: true
                    })}

                    ${this.checkboxCards({
                        id: "priorities",
                        legend: "Where would guidance be most useful right now?",
                        helper: "Choose up to three priorities.",
                        options: PRIORITY_OPTIONS,
                        required: true,
                        maximum: 3
                    })}
                </div>
            `;
        }

        textField({ id, label, helper = "", placeholder = "", autocomplete = "off", required = false, optional = false }) {
            return `
                <div class="advisory-field" data-field-wrapper="${id}">
                    <label for="${id}">
                        ${label}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                        ${optional ? '<span class="advisory-optional-label">Optional</span>' : ""}
                    </label>
                    <input
                        id="${id}"
                        name="${id}"
                        type="text"
                        autocomplete="${autocomplete}"
                        placeholder="${this.escapeAttribute(placeholder)}"
                        value="${this.escapeAttribute(this.answers[id] || "")}"
                        aria-describedby="${helper ? `${id}Help ` : ""}${id}Error"
                        ${required ? "required" : ""}>
                    ${helper ? `<p id="${id}Help" class="advisory-field-help">${helper}</p>` : ""}
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </div>
            `;
        }

        textareaField({ id, label, helper = "", placeholder = "", maxlength = 240, required = false, optional = false, showCounter = false }) {
            const value = String(this.answers[id] || "");

            return `
                <div class="advisory-field" data-field-wrapper="${id}">
                    <label for="${id}">
                        ${label}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                        ${optional ? '<span class="advisory-optional-label">Optional</span>' : ""}
                    </label>
                    <textarea
                        id="${id}"
                        name="${id}"
                        rows="4"
                        maxlength="${maxlength}"
                        placeholder="${this.escapeAttribute(placeholder)}"
                        aria-describedby="${helper ? `${id}Help ` : ""}${id}Error"
                        ${required ? "required" : ""}>${this.escapeHtml(value)}</textarea>
                    <div class="advisory-field-meta">
                        ${helper ? `<p id="${id}Help" class="advisory-field-help">${helper}</p>` : "<span></span>"}
                        ${showCounter ? `<span id="${id}Counter" class="advisory-character-count">${value.length}/${maxlength}</span>` : ""}
                    </div>
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </div>
            `;
        }

        numberField({ id, label, helper = "", placeholder = "", required = false, optional = false, min = 0, max = "" }) {
            return `
                <div class="advisory-field" data-field-wrapper="${id}">
                    <label for="${id}">
                        ${label}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                        ${optional ? '<span class="advisory-optional-label">Optional</span>' : ""}
                    </label>
                    <input
                        id="${id}"
                        name="${id}"
                        type="number"
                        inputmode="numeric"
                        step="1"
                        min="${min}"
                        ${max !== "" ? `max="${max}"` : ""}
                        placeholder="${this.escapeAttribute(placeholder)}"
                        value="${this.escapeAttribute(this.answers[id] ?? "")}"
                        aria-describedby="${helper ? `${id}Help ` : ""}${id}Error"
                        ${required ? "required" : ""}>
                    ${helper ? `<p id="${id}Help" class="advisory-field-help">${helper}</p>` : ""}
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </div>
            `;
        }

        datalistField({ id, label, helper = "", placeholder = "", options = [], required = false }) {
            return `
                <div class="advisory-field" data-field-wrapper="${id}">
                    <label for="${id}">
                        ${label}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                    </label>
                    <input
                        id="${id}"
                        name="${id}"
                        type="search"
                        list="${id}Options"
                        autocomplete="off"
                        placeholder="${this.escapeAttribute(placeholder)}"
                        value="${this.escapeAttribute(this.answers[id] || "")}"
                        aria-describedby="${helper ? `${id}Help ` : ""}${id}Error"
                        ${required ? "required" : ""}>
                    <datalist id="${id}Options">
                        ${options.map((option) => `<option value="${this.escapeAttribute(option)}"></option>`).join("")}
                    </datalist>
                    ${helper ? `<p id="${id}Help" class="advisory-field-help">${helper}</p>` : ""}
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </div>
            `;
        }

        selectField({ id, label, helper = "", options = [], placeholder = "Please select", required = false, optional = false }) {
            return `
                <div class="advisory-field" data-field-wrapper="${id}">
                    <label for="${id}">
                        ${label}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                        ${optional ? '<span class="advisory-optional-label">Optional</span>' : ""}
                    </label>
                    <select
                        id="${id}"
                        name="${id}"
                        aria-describedby="${helper ? `${id}Help ` : ""}${id}Error"
                        ${required ? "required" : ""}>
                        <option value="">${placeholder}</option>
                        ${options.map(([value, optionLabel]) => `
                            <option
                                value="${this.escapeAttribute(value)}"
                                ${this.answers[id] === value ? "selected" : ""}>
                                ${optionLabel}
                            </option>
                        `).join("")}
                    </select>
                    ${helper ? `<p id="${id}Help" class="advisory-field-help">${helper}</p>` : ""}
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </div>
            `;
        }

        choiceCards({ id, legend, options, columns = 2, required = false }) {
            return `
                <fieldset
                    class="advisory-choice-fieldset advisory-choice-fieldset--columns-${columns}"
                    data-field-wrapper="${id}">
                    <legend>
                        ${legend}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                    </legend>
                    <div class="advisory-choice-grid">
                        ${options.map(([value, label, description]) => `
                            <label class="advisory-choice-card">
                                <input
                                    type="radio"
                                    name="${id}"
                                    value="${this.escapeAttribute(value)}"
                                    ${this.answers[id] === value ? "checked" : ""}>
                                <span class="advisory-choice-card__surface">
                                    <strong>${label}</strong>
                                    ${description ? `<small>${description}</small>` : ""}
                                </span>
                            </label>
                        `).join("")}
                    </div>
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </fieldset>
            `;
        }

        choicePills({ id, legend, options, required = false }) {
            return `
                <fieldset class="advisory-choice-fieldset" data-field-wrapper="${id}">
                    <legend>
                        ${legend}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                    </legend>
                    <div class="advisory-choice-pills">
                        ${options.map(([value, label]) => `
                            <label class="advisory-choice-pill">
                                <input
                                    type="radio"
                                    name="${id}"
                                    value="${this.escapeAttribute(value)}"
                                    ${this.answers[id] === value ? "checked" : ""}>
                                <span>${label}</span>
                            </label>
                        `).join("")}
                    </div>
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </fieldset>
            `;
        }

        checkboxCards({ id, legend, helper = "", options, required = false, maximum = null }) {
            const selected = Array.isArray(this.answers[id]) ? this.answers[id] : [];

            return `
                <fieldset class="advisory-choice-fieldset" data-field-wrapper="${id}" data-maximum="${maximum || ""}">
                    <legend>
                        ${legend}
                        ${required ? '<span aria-hidden="true">*</span>' : ""}
                    </legend>
                    ${helper ? `<p class="advisory-field-help">${helper}</p>` : ""}
                    <div class="advisory-checkbox-grid">
                        ${options.map(([value, label]) => `
                            <label class="advisory-checkbox-card">
                                <input
                                    type="checkbox"
                                    name="${id}"
                                    value="${this.escapeAttribute(value)}"
                                    ${selected.includes(value) ? "checked" : ""}>
                                <span>
                                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                                    ${label}
                                </span>
                            </label>
                        `).join("")}
                    </div>
                    <p id="${id}Error" class="advisory-field-error" hidden></p>
                </fieldset>
            `;
        }

        captureStoryInput(target) {
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
                return;
            }

            const { name, type } = target;

            if (!name) {
                return;
            }

            if (type === "checkbox") {
                if (name === "foundedNotSure") {
                    this.answers.foundedNotSure = target.checked;

                    if (target.checked) {
                        this.answers.founded = "";
                    }
                } else {
                    const checked = Array.from(
                        this.elements.storyContainer.querySelectorAll(`input[name="${this.cssEscape(name)}"]:checked`)
                    ).map((input) => input.value);

                    const maximum = Number(target.closest("[data-maximum]")?.dataset.maximum || 0);

                    if (maximum && checked.length > maximum) {
                        target.checked = false;
                        this.setFieldError(name, `Choose no more than ${maximum} priorities.`);
                        this.announce(`Choose no more than ${maximum} priorities.`, true);
                        return;
                    }

                    this.answers[name] = checked;
                    this.clearFieldError(name);
                }
            } else if (type === "radio") {
                if (!target.checked) {
                    return;
                }

                this.answers[name] = target.value;
                this.clearFieldError(name);
            } else {
                this.answers[name] = target.value;

                if (target.id === "growthContext") {
                    const counter = document.getElementById("growthContextCounter");
                    if (counter) {
                        counter.textContent = `${target.value.length}/${target.maxLength}`;
                    }
                }
            }

            this.updateDynamicVisibility();
            this.queueSave();
        }

        captureAllStoryInputs() {
            this.elements.storyContainer?.querySelectorAll("input, select, textarea").forEach((input) => {
                this.captureStoryInput(input);
            });
        }

        handleDynamicControl(target) {
            if (target.name === "foundedNotSure" || target.name === "remoteBand") {
                this.updateDynamicVisibility();
            }
        }

        updateDynamicVisibility() {
            const founded = document.getElementById("founded");
            const foundedNotSure = document.getElementById("foundedNotSure");

            if (founded && foundedNotSure) {
                founded.disabled = foundedNotSure.checked;
            }

            const remoteExactField = document.getElementById("remoteExactField");

            if (remoteExactField) {
                remoteExactField.hidden = this.answers.remoteBand !== "exact";
            }
        }

        validateBusinessBasics() {
            let valid = true;

            valid = this.requireText("companyName", "Enter your organisation’s name.") && valid;
            valid = this.requireText("industry", "Choose or enter the closest industry.") && valid;
            valid = this.requireText("nature", "Describe what your organisation does in one sentence.") && valid;

            return this.finishMomentValidation(valid);
        }

        validateBusinessStage() {
            let valid = true;
            const year = String(this.answers.founded || "").trim();
            const currentYear = new Date().getFullYear();

            if (!this.answers.foundedNotSure) {
                const numericYear = Number(year);
                const yearValid = /^\d{4}$/.test(year) && numericYear >= 1800 && numericYear <= currentYear;

                if (!yearValid) {
                    this.setFieldError("founded", `Enter a four-digit year between 1800 and ${currentYear}, or choose “I’m not sure”.`);
                    valid = false;
                } else {
                    this.clearFieldError("founded");
                }
            } else {
                this.clearFieldError("founded");
            }

            valid = this.requireText("entity", "Select the closest legal structure.") && valid;

            return this.finishMomentValidation(valid);
        }

        validateWorkforce() {
            const valid = this.requireWholeNumber(
                "employees",
                "Enter an approximate employee count. Zero is valid when there are currently no employees.",
                0
            );

            ["contractWorkers", "interns", "apprentices"].forEach((id) => {
                const value = String(this.answers[id] ?? "").trim();

                if (value && !this.isWholeNumber(value, 0)) {
                    this.setFieldError(id, "Enter a whole number of zero or more, or leave this optional field blank.");
                } else {
                    this.clearFieldError(id);
                }
            });

            const optionalValid = ["contractWorkers", "interns", "apprentices"].every((id) => {
                const value = String(this.answers[id] ?? "").trim();
                return !value || this.isWholeNumber(value, 0);
            });

            return this.finishMomentValidation(valid && optionalValid);
        }

        validateWorkingModel() {
            let valid = true;

            valid = this.requireText("workModel", "Choose the working model that is closest today.") && valid;
            valid = this.requireText("remoteBand", "Choose the closest remote-work range.") && valid;

            if (this.answers.remoteBand === "exact") {
                const exact = String(this.answers.remoteExact ?? "").trim();
                const numeric = Number(exact);

                if (exact === "" || !Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
                    this.setFieldError("remoteExact", "Enter a percentage between 0 and 100.");
                    valid = false;
                } else {
                    this.clearFieldError("remoteExact");
                }
            } else {
                this.clearFieldError("remoteExact");
            }

            return this.finishMomentValidation(valid);
        }

        validateOperatingFootprint() {
            let valid = true;

            valid = this.requireText("primaryState", "Enter the organisation’s primary operating location.") && valid;
            valid = this.requireWholeNumber("locations", "Enter at least one permanent operating location.", 1) && valid;
            valid = this.requireWholeNumber("countries", "Enter at least one country.", 1) && valid;

            return this.finishMomentValidation(valid);
        }

        validateGrowthDirection() {
            let valid = true;

            valid = this.requireText("hiringPlans", "Choose the hiring outlook that is closest today.") && valid;

            if (!Array.isArray(this.answers.expansionPlans) || this.answers.expansionPlans.length === 0) {
                this.setFieldError("expansionPlans", "Select at least one likely change.");
                valid = false;
            } else {
                this.clearFieldError("expansionPlans");
            }

            return this.finishMomentValidation(valid);
        }

        validatePeopleReadiness() {
            let valid = true;

            valid = this.requireText("peopleFunction", "Choose the description closest to your current People or HR support.") && valid;

            const priorities = Array.isArray(this.answers.priorities) ? this.answers.priorities : [];

            if (priorities.length === 0) {
                this.setFieldError("priorities", "Choose at least one area where guidance would help.");
                valid = false;
            } else if (priorities.length > 3) {
                this.setFieldError("priorities", "Choose no more than three priorities.");
                valid = false;
            } else {
                this.clearFieldError("priorities");
            }

            return this.finishMomentValidation(valid);
        }

        requireText(id, message) {
            const value = String(this.answers[id] ?? "").trim();

            if (!value) {
                this.setFieldError(id, message);
                return false;
            }

            this.answers[id] = value;
            this.clearFieldError(id);
            return true;
        }

        requireWholeNumber(id, message, minimum) {
            const value = String(this.answers[id] ?? "").trim();

            if (!this.isWholeNumber(value, minimum)) {
                this.setFieldError(id, message);
                return false;
            }

            this.clearFieldError(id);
            return true;
        }

        isWholeNumber(value, minimum = 0) {
            if (!/^\d+$/.test(String(value))) {
                return false;
            }

            const numeric = Number(value);
            return Number.isSafeInteger(numeric) && numeric >= minimum;
        }

        finishMomentValidation(valid) {
            if (valid) {
                return true;
            }

            const firstInvalid = this.elements.storyContainer?.querySelector(
                ".has-error input:not([type='hidden']), .has-error select, .has-error textarea, .has-error [tabindex='0']"
            ) || this.elements.storyContainer?.querySelector(".has-error input");

            firstInvalid?.focus({ preventScroll: false });
            firstInvalid?.scrollIntoView({ behavior: this.prefersReducedMotion() ? "auto" : "smooth", block: "center" });
            this.announce("Review the highlighted information before continuing.", true);
            return false;
        }

        setFieldError(id, message) {
            const wrapper = this.elements.storyContainer?.querySelector(`[data-field-wrapper="${this.cssEscape(id)}"]`);
            const error = document.getElementById(`${id}Error`);
            const input = wrapper?.querySelector("input, select, textarea");

            wrapper?.classList.add("has-error");

            if (input) {
                input.setAttribute("aria-invalid", "true");
            }

            if (error) {
                error.textContent = message;
                error.hidden = false;
            }
        }

        clearFieldError(id) {
            const wrapper = this.elements.storyContainer?.querySelector(`[data-field-wrapper="${this.cssEscape(id)}"]`);
            const error = document.getElementById(`${id}Error`);

            wrapper?.classList.remove("has-error");
            wrapper?.querySelectorAll("[aria-invalid='true']").forEach((element) => {
                element.removeAttribute("aria-invalid");
            });

            if (error) {
                error.textContent = "";
                error.hidden = true;
            }
        }

        clearMomentErrors() {
            this.elements.storyContainer?.querySelectorAll(".has-error").forEach((element) => {
                element.classList.remove("has-error");
            });
            this.elements.storyContainer?.querySelectorAll("[aria-invalid='true']").forEach((element) => {
                element.removeAttribute("aria-invalid");
            });
            this.elements.storyContainer?.querySelectorAll(".advisory-field-error").forEach((element) => {
                element.textContent = "";
                element.hidden = true;
            });
        }

        buildReviewSummaries() {
            const company = this.answerText("companyName", "Your organisation");
            const industry = this.answerText("industry", "the selected industry");
            const founded = this.answers.foundedNotSure
                ? "with its founding year not specified"
                : this.answers.founded
                    ? `established in ${this.answers.founded}`
                    : "with its founding year not specified";
            const entity = this.answerText("entity", "its selected legal structure");
            const nature = this.answerText("nature", "Its primary business has not been described yet");

            this.elements.businessSummary.textContent =
                `${company} is a ${industry} organisation ${founded}. It operates as ${this.withArticle(entity)}. ${this.ensureSentence(nature)}`;

            const employees = this.numberText(this.answers.employees, "an unspecified number of");
            const workforceParts = [];

            if (this.hasNumber(this.answers.contractWorkers)) {
                workforceParts.push(`${this.answers.contractWorkers} supporting contractors`);
            }
            if (this.hasNumber(this.answers.interns)) {
                workforceParts.push(`${this.answers.interns} interns`);
            }
            if (this.hasNumber(this.answers.apprentices)) {
                workforceParts.push(`${this.answers.apprentices} apprentices`);
            }

            const workforceDetail = workforceParts.length
                ? `, alongside ${this.humanList(workforceParts)}`
                : "";
            const workModel = this.answerText("workModel", "the selected working model").toLowerCase();
            const remoteDescription = this.remoteDescription();

            this.elements.peopleSummary.textContent =
                `The organisation has approximately ${employees} employees${workforceDetail}. The team works through ${workModel}, with ${remoteDescription}.`;

            const state = this.answerText("primaryState", "an unspecified primary location");
            const locations = this.answerText("locations", "an unspecified number of");
            const countries = this.answerText("countries", "an unspecified number of");

            this.elements.operationsSummary.textContent =
                `Operations are primarily based in ${state}, across ${locations} permanent ${this.pluralise("location", locations)} in ${countries} ${this.pluralise("country", countries)}.`;

            const hiring = this.hiringDescription();
            const expansion = this.labelsFor(this.answers.expansionPlans, EXPANSION_OPTIONS);
            const priorities = this.labelsFor(this.answers.priorities, PRIORITY_OPTIONS);
            const expansionText = expansion.length ? this.humanList(expansion).toLowerCase() : "keep its plans flexible";
            const priorityText = priorities.length ? this.humanList(priorities).toLowerCase() : "people planning";

            this.elements.growthSummary.textContent =
                `The organisation expects to ${hiring} and is likely to ${expansionText}. Its immediate advisory priorities are ${priorityText}.`;
        }

        captureLeadData() {
            this.lead.name = this.elements.leadName?.value.trim() || "";
            this.lead.email = this.elements.leadEmail?.value.trim() || "";
            this.lead.role = this.elements.leadRole?.value || "";
            this.lead.serviceConsent = Boolean(this.elements.serviceConsent?.checked);
            this.lead.marketingConsent = Boolean(this.elements.marketingConsent?.checked);
        }

        populateLeadForm() {
            if (this.elements.leadName) {
                this.elements.leadName.value = this.lead.name || "";
            }
            if (this.elements.leadEmail) {
                this.elements.leadEmail.value = this.lead.email || "";
            }
            if (this.elements.leadRole) {
                this.elements.leadRole.value = this.lead.role || "";
            }
            if (this.elements.serviceConsent) {
                this.elements.serviceConsent.checked = Boolean(this.lead.serviceConsent);
            }
            if (this.elements.marketingConsent) {
                this.elements.marketingConsent.checked = Boolean(this.lead.marketingConsent);
            }
        }

        validateLead() {
            this.captureLeadData();
            this.clearLeadErrors();
            let valid = true;

            if (!this.lead.name) {
                this.showLeadError(this.elements.leadName, this.elements.leadNameError, "Enter your name to continue.");
                valid = false;
            }

            if (!this.lead.email) {
                this.showLeadError(this.elements.leadEmail, this.elements.leadEmailError, "Enter your work email to continue.");
                valid = false;
            } else if (!this.isValidEmail(this.lead.email)) {
                this.showLeadError(
                    this.elements.leadEmail,
                    this.elements.leadEmailError,
                    "Enter a valid email address, such as name@company.com."
                );
                valid = false;
            }

            if (!this.lead.serviceConsent) {
                this.showLeadError(
                    this.elements.serviceConsent,
                    this.elements.serviceConsentError,
                    "Please confirm that we may send your advisory and related service communications."
                );
                valid = false;
            }

            if (!valid) {
                const firstInvalid = this.elements.leadForm?.querySelector("[aria-invalid='true']");
                firstInvalid?.focus();
                firstInvalid?.scrollIntoView({ behavior: this.prefersReducedMotion() ? "auto" : "smooth", block: "center" });
                this.announce("Review the highlighted contact details before generating your advisory.", true);
            }

            return valid;
        }

        showLeadError(input, errorElement, message) {
            input?.setAttribute("aria-invalid", "true");
            input?.closest(".advisory-field, .advisory-consent-group")?.classList.add("has-error");

            if (errorElement) {
                errorElement.textContent = message;
                errorElement.hidden = false;
            }
        }

        clearLeadErrors() {
            [this.elements.leadName, this.elements.leadEmail, this.elements.serviceConsent].forEach((input) => {
                input?.removeAttribute("aria-invalid");
                input?.closest(".advisory-field, .advisory-consent-group")?.classList.remove("has-error");
            });

            [this.elements.leadNameError, this.elements.leadEmailError, this.elements.serviceConsentError].forEach((error) => {
                if (error) {
                    error.textContent = "";
                    error.hidden = true;
                }
            });
        }

        async submitLeadAndGenerate() {
            if (!this.validateLead()) {
                return;
            }

            this.saveNow();
            this.writeLeadRecord();
            this.writeReportData();

            try {
                await this.submitLeadToEndpoint("capture");
                this.generateAdvisory();
            } catch (error) {
                console.error("GrowWithHR: lead submission failed.", error);
                this.showGenerationError(
                    "We couldn’t securely save your advisory details. Your answers remain saved on this device."
                );
            }
        }

        generateAdvisory() {
            this.clearGenerationTimers();
            this.showOnly("loading");
            this.elements.generationError.hidden = true;
            this.elements.generationSteps.hidden = false;
            this.elements.loadingMessage.hidden = false;
            this.resetGenerationSteps();
            this.focusScreen(this.elements.loading);

            const messages = [
                "Organising your context…",
                "Identifying people priorities…",
                "Preparing recommended next steps…"
            ];
            const delay = this.prefersReducedMotion() ? 80 : 360;

            messages.forEach((message, index) => {
                const timer = window.setTimeout(() => {
                    this.setGenerationStep(index, message);
                }, delay * index);

                this.generationTimers.push(timer);
            });

            const completionTimer = window.setTimeout(() => {
                this.writeReportData();
                this.showSuccess();
            }, delay * messages.length + (this.prefersReducedMotion() ? 80 : 220));

            this.generationTimers.push(completionTimer);
        }

        resetGenerationSteps() {
            this.elements.generationSteps?.querySelectorAll("[data-generation-step]").forEach((item, index) => {
                item.classList.toggle("is-active", index === 0);
                item.classList.remove("is-complete");
                const icon = item.querySelector("i");
                if (icon) {
                    icon.className = index === 0
                        ? "fa-solid fa-circle-notch"
                        : "fa-regular fa-circle";
                }
            });
        }

        setGenerationStep(activeIndex, message) {
            this.elements.generationSteps?.querySelectorAll("[data-generation-step]").forEach((item, index) => {
                const icon = item.querySelector("i");
                item.classList.toggle("is-active", index === activeIndex);
                item.classList.toggle("is-complete", index < activeIndex);

                if (!icon) {
                    return;
                }

                if (index < activeIndex) {
                    icon.className = "fa-solid fa-circle-check";
                } else if (index === activeIndex) {
                    icon.className = "fa-solid fa-circle-notch";
                } else {
                    icon.className = "fa-regular fa-circle";
                }
            });

            this.elements.loadingMessage.textContent = message;
        }

        showGenerationError(message) {
            this.clearGenerationTimers();
            this.showOnly("loading");
            this.elements.generationSteps.hidden = true;
            this.elements.loadingMessage.hidden = true;
            this.elements.generationError.hidden = false;

            const paragraph = this.elements.generationError.querySelector("p");
            if (paragraph && message) {
                paragraph.textContent = message;
            }

            this.focusScreen(this.elements.loading);
            this.announce("We could not prepare the advisory yet. Your answers are saved.", true);
        }

        populateSuccessDetails() {
            const date = new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(new Date());

            this.elements.preparedForName.textContent = this.lead.name || "you";
            this.elements.preparedForCompany.textContent = this.answers.companyName || "Your organisation";
            this.elements.preparedDate.textContent = date;
            this.elements.preparedDate.dateTime = new Date().toISOString().slice(0, 10);
        }

        downloadReport() {
            this.writeReportData();
            const reportWindow = window.open(this.reportUrl, "_blank");

            if (!reportWindow) {
                this.announce("Allow pop-ups to open the printable advisory.", true);
                return;
            }

            try {
                reportWindow.opener = null;
            } catch (error) {
                // Some browsers protect the opener property. Printing can continue.
            }

            const requestPrint = () => {
                try {
                    reportWindow.focus();
                    reportWindow.print();
                } catch (error) {
                    console.warn("GrowWithHR: automatic print could not start.", error);
                }
            };

            reportWindow.addEventListener("load", () => window.setTimeout(requestPrint, 500), { once: true });
        }

        async requestAnotherEmail() {
            const button = this.elements.emailAgainButton;

            if (!button) {
                return;
            }

            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = "Requesting another copy…";

            try {
                await this.submitLeadToEndpoint("resend");
                button.textContent = "Copy requested";
                this.announce(`Another advisory copy has been requested for ${this.lead.email}.`);
            } catch (error) {
                button.textContent = "Couldn’t request copy";
                this.announce("We could not request another email copy just yet.", true);
            } finally {
                window.setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                }, 1800);
            }
        }

        writeReportData() {
            const reportData = {
                companyName: this.answers.companyName || "",
                industry: this.answers.industry || "",
                nature: this.answers.nature || "",
                founded: this.answers.foundedNotSure ? "Not Sure" : (this.answers.founded || ""),
                entity: this.answers.entity || "",
                fundingStage: this.answers.fundingStage || "",
                employees: this.normaliseNumber(this.answers.employees),
                contractWorkers: this.normaliseNumber(this.answers.contractWorkers),
                interns: this.normaliseNumber(this.answers.interns),
                apprentices: this.normaliseNumber(this.answers.apprentices),
                workModel: this.answers.workModel || "",
                remoteWorkforce: this.remoteReportValue(),
                primaryState: this.answers.primaryState || "",
                state: this.answers.primaryState || "",
                locations: this.normaliseNumber(this.answers.locations, 1),
                countries: this.normaliseNumber(this.answers.countries, 1),
                hiringPlans: this.answers.hiringPlans || "",
                expansionPlans: this.labelsFor(this.answers.expansionPlans, EXPANSION_OPTIONS).join(", "),
                expansionPlanCodes: Array.isArray(this.answers.expansionPlans) ? this.answers.expansionPlans : [],
                growthContext: this.answers.growthContext || "",
                peopleFunction: this.answers.peopleFunction || "",
                priorities: this.labelsFor(this.answers.priorities, PRIORITY_OPTIONS),
                priorityCodes: Array.isArray(this.answers.priorities) ? this.answers.priorities : [],
                recipientName: this.lead.name,
                recipientEmail: this.lead.email,
                recipientRole: ROLE_LABELS[this.lead.role] || this.lead.role || "",
                serviceConsent: this.lead.serviceConsent,
                marketingConsent: this.lead.marketingConsent,
                generatedAt: new Date().toISOString(),
                source: "Executive Advisory Briefing v2"
            };

            try {
                localStorage.setItem(REPORT_KEY, JSON.stringify(reportData));
            } catch (error) {
                console.warn("GrowWithHR: report data could not be saved.", error);
            }

            return reportData;
        }

        writeLeadRecord() {
            const leadRecord = {
                name: this.lead.name,
                email: this.lead.email,
                role: ROLE_LABELS[this.lead.role] || this.lead.role || "",
                serviceConsent: this.lead.serviceConsent,
                marketingConsent: this.lead.marketingConsent,
                companyName: this.answers.companyName || "",
                industry: this.answers.industry || "",
                employees: this.normaliseNumber(this.answers.employees),
                peopleFunction: this.answers.peopleFunction || "",
                priorities: this.labelsFor(this.answers.priorities, PRIORITY_OPTIONS),
                capturedAt: new Date().toISOString(),
                source: "Executive Advisory Briefing"
            };

            try {
                localStorage.setItem(LEAD_KEY, JSON.stringify(leadRecord));
            } catch (error) {
                console.warn("GrowWithHR: lead record could not be saved locally.", error);
            }

            window.dispatchEvent(new CustomEvent("growwithhr:lead-captured", {
                detail: leadRecord
            }));

            return leadRecord;
        }

        async submitLeadToEndpoint(action) {
            const endpoint = document.body.dataset.leadEndpoint || window.GROWWITHHR_LEAD_ENDPOINT;
            const payload = {
                action,
                lead: this.writeLeadRecord(),
                advisory: this.writeReportData()
            };

            // The repository currently has no lead API. The event and local record
            // above keep the page functional and provide an integration point.
            if (!endpoint) {
                return { ok: true, mode: "local-integration-hook" };
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                credentials: "same-origin"
            });

            if (!response.ok) {
                throw new Error(`Lead endpoint returned ${response.status}.`);
            }

            return response;
        }

        saveNow() {
            const state = {
                version: "2.0.0",
                started: this.started,
                completed: this.completed,
                currentMoment: this.currentMoment,
                answers: this.answers,
                lead: this.lead,
                ui: this.ui,
                updatedAt: new Date().toISOString()
            };

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                this.updateSaveStatus("Progress saved");
            } catch (error) {
                console.warn("GrowWithHR: progress could not be saved.", error);
                this.updateSaveStatus("Progress could not be saved");
            }
        }

        queueSave() {
            this.updateSaveStatus("Saving…");
            window.clearTimeout(this.saveTimer);
            this.saveTimer = window.setTimeout(() => this.saveNow(), 300);
        }

        restoreState() {
            let saved;

            try {
                saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            } catch (error) {
                console.warn("GrowWithHR: saved progress could not be read.", error);
                return;
            }

            if (!saved || typeof saved !== "object") {
                return;
            }

            this.started = Boolean(saved.started);
            this.completed = Boolean(saved.completed);
            this.currentMoment = this.clampMoment(Number(saved.currentMoment) || 0);
            this.answers = {
                locations: "1",
                countries: "1",
                expansionPlans: [],
                priorities: [],
                ...(saved.answers || {})
            };
            this.lead = {
                name: "",
                email: "",
                role: "",
                serviceConsent: false,
                marketingConsent: false,
                ...(saved.lead || {})
            };
            this.ui = {
                showSupplementalWorkforce: false,
                ...(saved.ui || {})
            };
        }

        clearSavedState() {
            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(REPORT_KEY);
                localStorage.removeItem(LEAD_KEY);
            } catch (error) {
                console.warn("GrowWithHR: saved data could not be cleared.", error);
            }
        }

        updateSaveStatus(message) {
            if (!this.elements.saveStatus) {
                return;
            }

            this.elements.saveStatus.textContent = message;

            if (message === "Progress saved") {
                window.setTimeout(() => {
                    if (this.elements.saveStatus?.textContent === "Progress saved") {
                        this.elements.saveStatus.textContent = "Progress saves automatically";
                    }
                }, 1600);
            }
        }

        openExitModal() {
            if (!this.elements.exitModal) {
                return;
            }

            this.lastFocusedElement = document.activeElement;
            this.saveNow();
            this.elements.exitModal.hidden = false;
            document.body.classList.add("has-advisory-modal");
            this.elements.cancelExitButton?.focus();
        }

        closeExitModal() {
            if (!this.elements.exitModal) {
                return;
            }

            this.elements.exitModal.hidden = true;
            document.body.classList.remove("has-advisory-modal");
            this.lastFocusedElement?.focus?.();
        }

        hasReportData() {
            try {
                return Boolean(localStorage.getItem(REPORT_KEY));
            } catch (error) {
                return false;
            }
        }

        clearGenerationTimers() {
            this.generationTimers.forEach((timer) => window.clearTimeout(timer));
            this.generationTimers = [];
        }

        populateSuccessFromReport() {
            this.populateSuccessDetails();
        }

        answerText(key, fallback) {
            const value = String(this.answers[key] ?? "").trim();
            return value || fallback;
        }

        remoteDescription() {
            const labels = Object.fromEntries(REMOTE_OPTIONS);

            if (this.answers.remoteBand === "exact") {
                return `${this.answers.remoteExact || 0}% of the workforce working remotely`;
            }

            const label = labels[this.answers.remoteBand] || "the remote-work proportion not specified";
            return label === "None"
                ? "no regular remote workforce"
                : `${label.toLowerCase()} working remotely`;
        }

        remoteReportValue() {
            if (this.answers.remoteBand === "exact") {
                return this.normaliseNumber(this.answers.remoteExact);
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

            return values[this.answers.remoteBand] ?? "";
        }

        hiringDescription() {
            const labels = Object.fromEntries(HIRING_OPTIONS.map(([value, label]) => [value, label]));
            const label = labels[this.answers.hiringPlans] || "keep hiring flexible";

            return label
                .replace(/^Grow /, "grow ")
                .replace(/^Hire /, "hire ")
                .replace(/^Stay /, "stay ")
                .replace(/^Unsure /, "remain unsure ");
        }

        labelsFor(values, options) {
            const labels = Object.fromEntries(options.map(([value, label]) => [value, label]));
            return (Array.isArray(values) ? values : [])
                .map((value) => labels[value])
                .filter(Boolean);
        }

        humanList(items) {
            if (items.length <= 1) {
                return items[0] || "";
            }

            if (items.length === 2) {
                return `${items[0]} and ${items[1]}`;
            }

            return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
        }

        numberText(value, fallback) {
            return this.hasNumber(value) ? String(value) : fallback;
        }

        hasNumber(value) {
            return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
        }

        normaliseNumber(value, fallback = 0) {
            const numeric = Number.parseInt(value, 10);
            return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
        }

        pluralise(word, value) {
            return Number(value) === 1 ? word : `${word}s`;
        }

        withArticle(value) {
            const cleaned = String(value || "").trim();
            if (!cleaned) {
                return "the selected structure";
            }
            if (/^(a|an|the)\s/i.test(cleaned)) {
                return cleaned;
            }
            return `${/^[aeiou]/i.test(cleaned) ? "an" : "a"} ${cleaned}`;
        }

        ensureSentence(value) {
            const cleaned = String(value || "").trim();
            if (!cleaned) {
                return "";
            }
            return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
        }

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        }

        clampMoment(moment) {
            return Math.min(Math.max(Number(moment) || 0, 0), MOMENTS.length - 1);
        }

        focusScreen(target) {
            window.requestAnimationFrame(() => {
                if (target?.matches("[tabindex]")) {
                    target.focus({ preventScroll: true });
                } else {
                    target?.setAttribute("tabindex", "-1");
                    target?.focus({ preventScroll: true });
                }

                window.scrollTo({
                    top: 0,
                    behavior: this.prefersReducedMotion() ? "auto" : "smooth"
                });
            });
        }

        announce(message, assertive = false) {
            const region = assertive ? this.elements.assertiveRegion : this.elements.liveRegion;

            if (!region) {
                return;
            }

            region.textContent = "";
            window.requestAnimationFrame(() => {
                region.textContent = message;
            });
        }

        prefersReducedMotion() {
            return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
        }

        cssEscape(value) {
            if (window.CSS && typeof window.CSS.escape === "function") {
                return window.CSS.escape(String(value));
            }

            return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
        }

        escapeAttribute(value) {
            return this.escapeHtml(String(value)).replace(/`/g, "&#96;");
        }

        escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (!document.body.classList.contains("analyze-company-page")) {
            return;
        }

        if (window.executiveAssessment) {
            return;
        }

        window.ExecutiveAdvisoryBriefing = ExecutiveAdvisoryBriefing;
        window.executiveAssessment = new ExecutiveAdvisoryBriefing();
    });
})();
