/* ==========================================================
   HRTECHIFY DESIGN SYSTEM
   Module 12
   Executive Assessment
   JavaScript Engine
   Version : v1.1.0
========================================================== */

class ExecutiveAssessment {

    constructor() {

        /* ==========================================
           APPLICATION
        ========================================== */

        this.application = "GrowWithHR";

        this.version = "1.1.0";

        this.coach = "Coach HRTechify";


        /* ==========================================
           STEP STATE
        ========================================== */

        this.currentStep = 0;

        this.currentQuestion = 0;

        this.started = false;

        this.completed = false;

        this.onWelcome = false;

        this.reportStage = "review";

        this.pendingQuestionRender = null;

        this.sectionTransitionTimer = null;

        this.reportGenerationTimer = null;

        this.boundEvents = false;

        this.assessmentState = "brand";

        this.isAdvancing = false;

        this.isGenerating = false;

        this.isDownloading = false;


        /* ==========================================
           STEP DEFINITIONS
        ========================================== */

        this.steps = [

            "Company",

            "Workforce",

            "Operations",

            "Growth"

        ];


        /* ==========================================
           USER RESPONSES
        ========================================== */

        this.responses = {};


        /* ==========================================
           DOM CACHE
        ========================================== */

        this.cacheElements();


        /* ==========================================
           EVENTS
        ========================================== */

        this.bindEvents();

    }



    /* ==========================================================
       CACHE DOM
    ========================================================== */

    cacheElements() {

        this.shell =
            document.getElementById("assessmentShell");

        this.landingScreen =
            document.getElementById("landingScreen");

        this.workspace =
            document.getElementById("conversationWorkspace");

        this.reviewScreen =
            document.getElementById("reviewScreen");

        this.loadingScreen =
            document.getElementById("loadingScreen");

        this.successScreen =
            document.getElementById("successScreen");


        this.startButton =
            document.getElementById("startAssessment");

        this.backButton =
            document.getElementById("backButton");

        this.nextButton =
            document.getElementById("nextButton");

        this.reviewBackButton =
            document.getElementById("reviewBackButton");

        this.generateButton =
            document.getElementById("generateReportButton");

        this.viewReportButton =
            document.getElementById("viewReportButton");


        this.progressBar =
            document.getElementById("progressBar");

        this.stepIndicator =
            document.getElementById("stepIndicator");

        this.stepTitle =
            document.getElementById("stepTitle");

        this.stepDescription =
            document.getElementById("stepDescription");

        this.coachMessage =
            document.getElementById("coachMessage");

        this.coachSection =
            document.querySelector(".exec-coach");

        this.footerMessage =
            document.getElementById("footerMessage");

        this.conversationContainer =
            document.getElementById("conversationContainer");

        this.reviewContainer =
            document.getElementById("reviewContainer");

        this.loadingMessage =
            document.getElementById("loadingMessage");

    }



    /* ==========================================================
       ANIMATE TEXT CHANGE
       Retriggers a fade-in whenever a message updates, so new
       lines feel like they're arriving in conversation rather
       than snapping into place.
    ========================================================== */

    animateTextChange(element, text) {

        if (!element) {

            return;

        }

        element.textContent = text;

        element.classList.remove("exec-fade-in");

        void element.offsetWidth;

        element.classList.add("exec-fade-in");

    }



    /* ==========================================================
       SET COACH MESSAGE
       Updates the coach's line and decides whether the avatar
       and "Coach HRTechify" label should be shown. They only
       reappear when the coach is opening a new topic (welcome,
       or the first question of a step) — not on every single
       question, which read as robotic and repetitive.
    ========================================================== */

    setCoachMessage(text, isNewTopic) {

        this.animateTextChange(this.coachMessage, text);

        if (!this.coachSection) {

            return;

        }

        this.coachSection.classList.toggle(

            "exec-coach--compact",

            !isNewTopic

        );

    }



    /* ==========================================================
       EVENT LISTENERS
    ========================================================== */

    bindEvents() {

        if (this.boundEvents) {
            return;
        }

        this.boundEvents = true;

        /* intro-sequence.js owns the Begin Executive Assessment click so the first
           question is not rendered twice by duplicate start handlers. */

        if (this.nextButton) {

            this.nextButton.addEventListener(

                "click",

                () => this.next()

            );

        }

        if (this.backButton) {

            this.backButton.addEventListener(

                "click",

                () => this.previous()

            );

        }

        if (this.reviewBackButton) {

            this.reviewBackButton.addEventListener(

                "click",

                () => this.backToAssessment()

            );

        }

        if (this.generateButton) {

            this.generateButton.addEventListener(

                "click",

                () => this.generateReport()

            );

        }

        if (this.viewReportButton) {

            this.viewReportButton.addEventListener(

                "click",

                () => this.openReport()

            );

        }

               const homeButtons = document.querySelectorAll(

            "[data-action='back-home']"

        );

        homeButtons.forEach(button => {

            button.addEventListener(

                "click",

                () => this.showLanding()

            );

        });

               const officialSourcesButton =

            document.getElementById("officialSources");

        if (officialSourcesButton) {

            officialSourcesButton.addEventListener(

                "click",

                () => {

                    window.open(

                        "official-resources.html",

                        "_blank"

                    );

                }

            );

        }

    }



    /* ==========================================================
       INITIAL VIEW
    ========================================================== */

showLanding() {

    this.hideAll();

       this.started = false;

    this.completed = false;

    this.currentStep = 0;

    this.currentQuestion = 0;

    this.onWelcome = false;

    this.landingScreen.hidden = false;

    if (this.questionBank) {

        this.updateProgress();

        this.updateProgressBar();

    }

    this.animateTextChange(

        this.footerMessage,

        ""

    );

    if (this.conversationContainer) {

        this.conversationContainer.innerHTML = "";

    }

       if (this.backButton) {

        this.backButton.hidden = true;

    }

    if (this.nextButton) {

        this.nextButton.innerHTML =

            `Begin <i class="fa-solid fa-arrow-right"></i>`;

    }

    this.setCoachMessage(

        "",

        true

    );

    if (this.progressBar) {

        this.progressBar.style.width = "0%";

    }

    if (this.stepIndicator) {

        this.stepIndicator.textContent = "Welcome";

    }

    if (this.stepTitle) {

        this.stepTitle.textContent =

            "Let's begin by understanding your organisation.";

    }

    if (this.stepDescription) {

        this.stepDescription.textContent = "";

    }

       if (this.reviewContainer) {

        this.reviewContainer.innerHTML = "";

    }

    if (this.loadingMessage) {

        this.loadingMessage.textContent = "";

    }

    if (this.responses) {

        this.responses = {};

    }
}

    /* ==========================================================
       HIDE ALL SCREENS
    ========================================================== */

    hideAll() {

        this.landingScreen.hidden = true;

        this.workspace.hidden = true;

        this.reviewScreen.hidden = true;

        this.loadingScreen.hidden = true;

        this.successScreen.hidden = true;

    }

showScreen(screen, stateName = "assessment") {

    [this.landingScreen, this.workspace, this.reviewScreen, this.loadingScreen, this.successScreen].forEach(panel => {
        if (!panel) return;
        const active = panel === screen;
        panel.hidden = !active;
        panel.setAttribute("aria-hidden", active ? "false" : "true");
        if (active) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
    });

    this.assessmentState = stateName;
    if (this.shell) {
        this.shell.dataset.state = stateName;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
   
    /* ==========================================================
       STEP DATA
    ========================================================== */

    initializeQuestions() {

        this.questionBank = [

            /* ==========================================
               STEP 1
               COMPANY
            ========================================== */

            {

                step: 0,

                title: "Company",

                description:
                    "Let's begin by understanding your organisation.",

                coach:
                    "Every organisation has its own identity. We'll begin with a few foundational questions that help us understand the environment in which your people and business operate.",

                questions: [

                    {
                        id: "companyName",

                        type: "text",

                        icon: "fa-building",

                        label: "What is your organisation called?",

                        helper:
                            "Use the commonly recognised name of your organisation.",

                        placeholder:
                            "Company Name"

                    },

                    {

                        id: "entity",

                        type: "select",

                        icon: "fa-scale-balanced",

                        label: "How is your organisation legally structured?",

                        helper:
                            "Select the option that most closely reflects your organisation today.",

                        options: [

                            "Private Limited",

                            "Public Limited",

                            "LLP",

                            "One Person Company",

                            "DPIIT Recognized Startup",

                            "Partnership",

                            "Proprietorship",

                            "Trust",

                            "Society",

                            "Government",

                            "PSU",

                            "Other"

                        ]

                    },

                    {

                        id: "industry",

                        type: "select",

                        icon: "fa-industry",

                        label: "Which industry best represents your organisation?",

                        helper:
                            "Examples include Manufacturing, IT Services, Healthcare or Retail.",

                        options: [
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
                        ]

                    },

                    {

                        id: "nature",

                        type: "text",

                        icon: "fa-briefcase",

                        label: "How would you describe your primary business?",

                        helper:
                            "Briefly describe what you sell or deliver. Example: We provide cloud payroll software to mid-sized Indian companies. Use letters, numbers, commas, full stops and hyphens only.",

                        placeholder:
                            "Example: We manufacture automotive components for OEM clients"

                    },

                    {

                        id: "founded",

                        type: "select",

                        icon: "fa-calendar",

                        label: "In which year was your organisation established?",

                        helper:
                            "An approximate year is perfectly acceptable if you're unsure.(but this is one year you won't like to forget \ud83d\ude1c)",

                        options: Array.from(
                            { length: new Date().getFullYear() - 1899 },
                            (_, index) => String(new Date().getFullYear() - index)
                        )

                    }

                ]

            },



            /* ==========================================
               STEP 2
               WORKFORCE
            ========================================== */

            {

                step: 1,

                title: "Workforce",

                description:
                    "Let's understand the people who contribute to your organisation.",

                coach:
                    "People are central to every organisation. These questions help us appreciate the scale and composition of your workforce rather than evaluate individuals.",

                questions: [

                    {

                        id: "employees",

                        type: "number",

                        icon: "fa-users",

                        label: "Approximately how many employees work with your organisation?",

                        helper:
                            "Enter a positive whole number only. Example: 75."

                    },

                    {

                        id: "contractWorkers",

                        type: "number",

                        icon: "fa-user-tie",

                        label: "Approximately how many contract workers support your operations?",

                        helper:
                            "Include outsourced manpower if applicable."

                    },

                    {

                        id: "interns",

                        type: "number",

                        icon: "fa-user-graduate",

                        label: "How many interns are currently engaged?",

                        helper:
                            "Don't worry if you don't know the exact numbers. Reasonable approximations are also acceptable."

                    },

                    {

                        id: "apprentices",

                        type: "number",

                        icon: "fa-user-gear",

                        label: "Would you know how many apprentices work with your organisation?",

                        helper:
                            "In case you are not aware just leave it blank."

                    },

                    {

                        id: "remoteWorkforce",

                        type: "number",

                        icon: "fa-laptop-house",

                        label: "Approximately what percentage of your workforce works remotely?",

                        helper:
                            "Enter any value between 0 and 100 which you think would be the right number."

                    }

                ]

            }

        ];

        /* ==========================================================
           STEP DATA (CONTINUED)
        ========================================================== */

        this.questionBank.push(

            /* ==========================================
               STEP 3
               OPERATIONS
            ========================================== */

            {

                step: 2,

                title: "Operations",

                description:
                    "Let's understand how your organisation operates.",

                coach:
                    "Every organisation functions differently. These questions help us appreciate the environment in which your teams collaborate and deliver value.",

                questions: [

                    {

                        id: "primaryState",

                        type: "select",

                        icon: "fa-location-dot",

                        label: "Which is your primary operating state?",

                        helper:
                            "If you operate in multiple locations, enter the state where your headquarters or principal office is located.",

                        options: [
                            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                            "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                            "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
                            "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi (NCT)",
                            "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                        ]

                    },

                    {

                        id: "workModel",

                        type: "select",

                        icon: "fa-building-user",

                        label: "Which work model best describes your organisation?",

                        helper:
                            "Select the option that most closely reflects current practice.",

                        options: [

                            "Office Based",

                            "Hybrid",

                            "Remote",

                            "Field Workforce",

                            "Manufacturing / Plant",

                            "Mixed"

                        ]

                    },

                    {

                        id: "locations",

                        type: "number",

                        icon: "fa-map-location-dot",

                        label: "Approximately how many operating locations do you have?",

                        helper:
                            "Include offices, plants, branches and other permanent locations."

                    },

                    {

                        id: "countries",

                        type: "number",

                        icon: "fa-earth-asia",

                        label: "In how many countries does your organisation currently operate?",

                        helper:
                            "Enter 1 if your organisation operates only within one country."

                    }

                ]

            },



            /* ==========================================
               STEP 4
               GROWTH
            ========================================== */

            {

                step: 3,

                title: "Growth",

                description:
                    "Finally, let's understand where your organisation is heading.",

                coach:
                    "Understanding future direction helps us place today's decisions into tomorrow's context. There are no right or wrong answers\u2014only your current plans and expectations.",

                questions: [

                    {

                        id: "hiringPlans",

                        type: "select",

                        icon: "fa-user-plus",

                        label: "What best describes your hiring plans over the next 12 months?",

                        helper:
                            "Choose the option that best reflects your current expectations.",

                        options: [

                            "Significant Growth",

                            "Moderate Growth",

                            "Selective Hiring",

                            "Maintain Current Size",

                            "Unsure; Market drives hiring needs"

                        ]

                    },

                    {

                        id: "fundingStage",

                        type: "select",

                        icon: "fa-chart-line",

                        label: "Which funding stage best describes your organisation?",

                        helper:
                            "Choose the closest available option.",

                        options: [

                            "Bootstrapped",

                            "Seed",

                            "Series A",

                            "Series B",

                            "Series C+",

                            "Public",

                            "Not Applicable"

                        ]

                    },

                    {

                        id: "expansionPlans",

                        type: "textarea",

                        icon: "fa-arrow-trend-up",

                        label: "Are there any expansion plans you would like us to understand?",

                        helper:
                            "A few sentences are sufficient."

                    },

                    {

                        id: "peopleFunction",

                        type: "select",

                        icon: "fa-users-gear",

                        label: "How is your People / HR function currently structured?",

                        helper:
                            "Select the option closest to your organisation today.",

                        options: [

                            "Dedicated HR Team",

                            "Single HR/People Professional",

                            "Founder Led",

                            "Shared Admin Function",

                            "External Consultant",

                            "No Formal HR/People Function"

                        ]

                    }

                ]

            }

        );

    }


    /* ==========================================================
       RENDER CURRENT QUESTION
    ========================================================== */
    renderCurrentQuestion() {

        const step = this.questionBank[this.currentStep];

        const question = step.questions[this.currentQuestion];

        this.stepIndicator.textContent =
            `Step ${this.currentStep + 1} of ${this.steps.length}`;

        this.stepTitle.textContent =
            step.title;

        this.stepDescription.textContent =
            step.description;

        if (this.coachSection) {
            this.coachSection.hidden = true;
        }

        this.updateFooterMessage();

        const template =
            document.getElementById("conversationTemplate");

        const card =
            template.content.cloneNode(true);

        card.querySelector(".exec-conversation-card").setAttribute("data-testid", "assessment-question-card");

        card.getElementById("questionCategory").textContent =
            step.title || "";

        card.getElementById("questionTitle").textContent =
            question.label;

        card.getElementById("questionIcon").className =
            `fa-solid ${question.icon}`;

        card.getElementById("coachContext").textContent =
            question.helper || "Share the closest accurate response available today.";

        card.getElementById("questionText").textContent =
            "";

        card.getElementById("questionExplanation").textContent =
            "";

        const responseContainer =
            card.getElementById("questionResponse");

        responseContainer.appendChild(

            this.createInput(question)

        );

        if (this.pendingQuestionRender) {
            clearTimeout(this.pendingQuestionRender);
            this.pendingQuestionRender = null;
        }

        this.conversationContainer.innerHTML = "";

        this.conversationContainer.appendChild(card);

    }



    /* ==========================================================
       CREATE INPUT
    ========================================================== */

    createInput(question) {

        let element;

        switch(question.type){

            case "text":

                element =
                    document
                    .getElementById("textInputTemplate")
                    .content
                    .firstElementChild
                    .cloneNode(true);

                element.placeholder =
                    question.placeholder || "";

                element.pattern = "[A-Za-z0-9 .,/&()\\-]+";

                break;

            case "number":

                element =
                    document
                    .getElementById("numberInputTemplate")
                    .content
                    .firstElementChild
                    .cloneNode(true);

                element.placeholder =
                    question.placeholder || "";

                element.min = "0";
                element.step = "1";
                element.inputMode = "numeric";
                element.pattern = "[0-9]*";
                element.addEventListener("input", () => {
                    element.value = element.value.replace(/[^0-9]/g, "");
                });

                break;

            case "textarea":

                element =
                    document
                    .getElementById("textareaTemplate")
                    .content
                    .firstElementChild
                    .cloneNode(true);

                break;

            case "select":

                element =
                    document
                    .getElementById("selectTemplate")
                    .content
                    .firstElementChild
                    .cloneNode(true);

                const placeholder =
                    document.createElement("option");

                placeholder.textContent =
                    "Please Select";

                placeholder.value = "";

                element.appendChild(placeholder);

                question.options.forEach(option=>{

                    const item =
                        document.createElement("option");

                    item.value = option;

                    item.textContent = option;

                    element.appendChild(item);

                });

                break;

        }

        element.id = question.id;

        if(this.responses[question.id] !== undefined){

            element.value =
                this.responses[question.id];

        }

        return element;

    }

    /* ==========================================================
       NEXT
    ========================================================== */
    next() {

   if (this.isAdvancing) {

    return;

   }

   if (this.onWelcome) {

    this.onWelcome = false;

    this.backButton.hidden = false;

    this.nextButton.innerHTML =
        `Continue <i class="fa-solid fa-arrow-right"></i>`;

    requestAnimationFrame(() => {

        this.refreshUI();

        this.renderCurrentQuestion();

    });

    return;

}

        if (!this.saveCurrentAnswer()) {

            return;

        }

        this.isAdvancing = true;

        if (this.nextButton) {
            this.nextButton.disabled = true;
        }

        const step =
            this.questionBank[this.currentStep];

        const question =
            step.questions[this.currentQuestion];

        const acknowledgement =
            this.getCoachAcknowledgement(

                this.responses[question.id]

            );

        this.setCoachMessage(

            acknowledgement,

            false

        );

        this.autoSave();

      setTimeout(() => {

    this.goToNextQuestion();
    this.isAdvancing = false;
    if (this.nextButton) this.nextButton.disabled = false;

}, 900);

    }



    /* ==========================================================
       PREVIOUS
    ========================================================== */

    previous() {

        if (this.onWelcome) {

            return;

        }

        if (this.currentQuestion > 0) {

            this.currentQuestion--;

            this.renderCurrentQuestion();

            return;

        }

        if (this.currentStep > 0) {

            this.currentStep--;

            const previousStep =
                this.questionBank[this.currentStep];

            this.currentQuestion =
                previousStep.questions.length - 1;

            this.updateProgress();

            this.renderCurrentQuestion();

            return;

        }

        this.showWelcomeMessage();

    }



    /* ==========================================================
       SAVE ANSWER
    ========================================================== */

    saveCurrentAnswer() {

        const step =
            this.questionBank[this.currentStep];

        const question =
            step.questions[this.currentQuestion];

        const field =
            document.getElementById(question.id);

        if (!field) {

            return false;

        }

        const value =
            field.value.trim();

        if (question.type === "number") {
            const numericValue = Number(value);
            if (!/^\d+$/.test(value) || numericValue < 0) {
                field.focus();
                alert("Please enter a positive whole number only.");
                return false;
            }
            if (question.id === "founded" && numericValue > new Date().getFullYear()) {
                field.focus();
                alert("Please enter a valid year that is not in the future.");
                return false;
            }
            if (question.id === "remoteWorkforce" && numericValue > 100) {
                field.focus();
                alert("Please enter a remote workforce percentage between 0 and 100.");
                return false;
            }
        }

        if (["nature", "companyName"].includes(question.id) && /[^A-Za-z0-9 .,/&()\-]/.test(value)) {
            field.focus();
            alert("Please use letters, numbers and basic punctuation only.");
            return false;
        }

        if (value === "") {

            field.focus();

            alert(
                "Please answer this question before continuing."
            );

            return false;

        }

        this.responses[question.id] = value;

        return true;

    }



    /* ==========================================================
       UPDATE PROGRESS
    ========================================================== */

    updateProgress() {

        const percentage =
            ((this.currentStep + 1) / this.steps.length) * 100;

        this.progressBar.style.width =
            `${percentage}%`;

        this.stepIndicator.textContent =
            `Step ${this.currentStep + 1} of ${this.steps.length}`;

        this.stepTitle.textContent =
            this.questionBank[this.currentStep].title;

        this.stepDescription.textContent =
            this.questionBank[this.currentStep].description;

    }



    /* ==========================================================
       BACK TO ASSESSMENT
    ========================================================== */

    backToAssessment() {

        this.hideAll();

        this.workspace.hidden = false;

        this.renderCurrentQuestion();

    }

    /* ==========================================================
       REVIEW SCREEN
    ========================================================== */

    showReview() {

           this.showScreen(this.reviewScreen, "assessment-complete");
         
           this.reviewContainer.innerHTML = "";

           this.reportStage = "review";
           this.setReviewHeader("Assessment Complete", "Your answers are saved. Generate your Executive Advisory when you're ready.");

           if (this.pendingQuestionRender) {
               clearTimeout(this.pendingQuestionRender);
               this.pendingQuestionRender = null;
           }

           if (this.generateButton) {

               this.generateButton.disabled = false;
               this.generateButton.innerHTML =
                   `Generate Executive Advisory <i class="fa-solid fa-wand-magic-sparkles"></i>`;

           }

           this.conversationContainer.innerHTML = "";

           this.questionBank.forEach(step => {

            const section = document.createElement("div");

            section.className = "exec-review-item";

            const heading = document.createElement("h3");

            heading.textContent = step.title;

            section.appendChild(heading);

            step.questions.forEach(question => {

                const row = document.createElement("p");

                const value =
                    this.responses[question.id] || "Not Answered";

                row.innerHTML =
                    `<strong>${question.label}</strong><br>${value}`;

                section.appendChild(row);

            });

            this.reviewContainer.appendChild(section);

        });

         this.backButton.hidden = true;

         this.nextButton.hidden = true;

    }



    validateName(value) {
        const name = String(value || "").trim();
        if (!name) return { valid: false, value: name, message: "Please enter your name." };
        if (name.length > 80) return { valid: false, value: name, message: "Please use 80 characters or fewer." };
        return { valid: true, value: name, message: "" };
    }

    validateEmail(value) {
        const email = String(value || "").trim();
        if (!email) return { valid: false, value: email, message: "Please enter your email address." };
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email) && !email.includes("..") && !email.startsWith(".") && !email.endsWith(".");
        return { valid, value: email, message: valid ? "" : "Please enter a valid email address." };
    }

    setReviewHeader(title, intro) {
        const heading = document.querySelector(".exec-review-card > h2");
        const introText = document.querySelector(".exec-review-intro");
        if (heading) heading.textContent = title;
        if (introText) introText.textContent = intro;
    }

    setValidationMessage(message = "") {
        const validation = document.getElementById("contactValidation");
        if (validation) validation.textContent = message;
    }

    generateReport() {
        if (this.isGenerating && ["generating", "report-ready"].includes(this.reportStage)) return;

        if (this.reportStage === "name") {
            this.showEmailCapture();
            return;
        }

        if (this.reportStage === "email") {
            this.startReportGeneration();
            return;
        }

        if (this.reportStage === "preview") {
            this.downloadReport();
            return;
        }

        if (this.reportStage === "error") {
            this.startReportGeneration();
            return;
        }

        this.showNameCapture();
    }

    showNameCapture() {
        this.showScreen(this.reviewScreen, "name");
        this.reportStage = "name";
        this.setReviewHeader("What is your name?", "This name appears on your Executive Advisory preview.");
        this.reviewContainer.innerHTML = `
            <div class="exec-review-item exec-contact-step" data-testid="advisory-name-screen">
                <label for="recipientName">What is your name?</label>
                <input id="recipientName" class="exec-input" type="text" maxlength="80" autocomplete="name" value="${this.responses.recipientName || ''}" required>
                <div id="contactValidation" class="exec-validation-message" role="alert" aria-live="polite"></div>
            </div>`;
        this.generateButton.disabled = false;
        this.generateButton.innerHTML = `Continue <i class="fa-solid fa-arrow-right"></i>`;
        const input = document.getElementById("recipientName");
        if (input) input.focus({ preventScroll: true });
    }

    showEmailCapture() {
        const name = document.getElementById("recipientName");
        const result = this.validateName(name ? name.value : this.responses.recipientName);
        if (!result.valid) {
            this.setValidationMessage(result.message);
            if (name) name.focus({ preventScroll: true });
            return;
        }
        this.responses.recipientName = result.value;
        this.autoSave();
        this.showScreen(this.reviewScreen, "email");
        this.reportStage = "email";
        this.setReviewHeader("What is your email address?", "We use this only to label this downloadable advisory preview in your browser session.");
        this.reviewContainer.innerHTML = `
            <div class="exec-review-item exec-contact-step" data-testid="advisory-email-screen">
                <label for="recipientEmail">What is your email address?</label>
                <input id="recipientEmail" class="exec-input" type="email" autocomplete="email" value="${this.responses.recipientEmail || ''}" required>
                <div id="contactValidation" class="exec-validation-message" role="alert" aria-live="polite"></div>
            </div>`;
        this.generateButton.disabled = false;
        this.generateButton.innerHTML = `Generate Report <i class="fa-solid fa-wand-magic-sparkles"></i>`;
        const input = document.getElementById("recipientEmail");
        if (input) input.focus({ preventScroll: true });
    }

    startReportGeneration() {
        const email = document.getElementById("recipientEmail");
        const result = this.validateEmail(email ? email.value : this.responses.recipientEmail);
        if (!result.valid) {
            this.setValidationMessage(result.message);
            if (email) email.focus({ preventScroll: true });
            return;
        }
        this.responses.recipientEmail = result.value;
        this.autoSave();
        this.isGenerating = true;
        this.reportStage = "generating";
        this.generateButton.disabled = true;
        this.showScreen(this.reviewScreen, "generating");
        this.setReviewHeader("Preparing your Executive Advisory...", "");
        this.reviewContainer.innerHTML = `<div class="exec-review-item" data-testid="advisory-generating"><p id="advisoryGenerationStatus" class="exec-loading-message">Preparing your Executive Advisory...</p></div>`;
        const messages = ["Preparing your Executive Advisory...", "Analysing responses...", "Building recommendations...", "Preparing your report...", "Almost ready..."];
        let index = 0;
        clearInterval(this.reportGenerationTimer);
        this.reportGenerationTimer = setInterval(() => {
            index += 1;
            const status = document.getElementById("advisoryGenerationStatus");
            if (status && messages[index]) status.textContent = messages[index];
            if (index >= messages.length - 1) {
                clearInterval(this.reportGenerationTimer);
                this.reportGenerationTimer = null;
                this.isGenerating = false;
                this.showInputPreview();
            }
        }, new URLSearchParams(window.location.search).get("e2e") === "1" ? 120 : 700);
    }

    showReportError(message = "We could not prepare the report. Please try again.", detail = "report-generation-failed") {
        console.error("GrowWithHR report generation error", { detail });
        this.isGenerating = false;
        clearInterval(this.reportGenerationTimer);
        this.reportStage = "error";
        this.showScreen(this.reviewScreen, "report-error");
        this.setReviewHeader("Report generation needs another try", "Your answers, name and email are still saved in this session.");
        this.reviewContainer.innerHTML = `<div class="exec-review-item" data-testid="advisory-report-error"><p>${message}</p></div>`;
        this.generateButton.disabled = false;
        this.generateButton.innerHTML = `Retry <i class="fa-solid fa-rotate-right"></i>`;
    }

    showInputPreview() {
        this.showScreen(this.reviewScreen, "report-ready");
        this.reportStage = "preview";
        this.setReviewHeader("Executive Advisory Ready", "Your advisory preview is ready to download.");
        const organisation = this.responses.companyName || "Not provided";
        const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        this.reviewContainer.innerHTML = `
            <div class="exec-review-item advisory-report-summary" data-testid="advisory-report-preview">
                <p><strong>Prepared for:</strong><br>${this.responses.recipientName || "Recipient"}</p>
                <p><strong>Email:</strong><br>${this.responses.recipientEmail || "Not provided"}</p>
                <p><strong>Organisation:</strong><br>${organisation}</p>
                <p><strong>Assessment date:</strong><br>${date}</p>
            </div>`;
        this.generateButton.disabled = false;
        this.generateButton.innerHTML = `Download Executive Advisory <i class="fa-solid fa-download"></i>`;
    }

    downloadReport() {
        if (this.isDownloading) return;
        this.isDownloading = true;
        try {
            const html = this.buildDownloadableReport();
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "GrowWithHR-Executive-Advisory.html";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("GrowWithHR download failed", { message: error && error.message });
            this.showReportError("The preview is still available, but the download could not be created. Please try again.", "download-failed");
        } finally {
            setTimeout(() => { this.isDownloading = false; }, 600);
        }
    }

    buildDownloadableReport() {
        const rows = Object.entries(this.responses).map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join("");
        return `<!doctype html><html><head><meta charset="utf-8"><title>HRTechify GrowWithHR Advisory</title><style>body{margin:0;font-family:Inter,Arial,sans-serif;background:#07111f;color:#eaf4ff}.page{max-width:980px;margin:0 auto;padding:48px}.brand{text-align:center;color:#7dd3fc}.card{background:linear-gradient(135deg,rgba(14,165,233,.18),rgba(20,184,166,.12));border:1px solid rgba(125,211,252,.28);border-radius:28px;padding:32px}h1{text-align:center;color:#fff}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:14px;border-bottom:1px solid rgba(255,255,255,.14);text-align:left}th{color:#7dd3fc;text-transform:capitalize}</style></head><body><main class="page"><section class="card"><div class="brand"><strong>HRTechify</strong><br><span>GrowWithHR</span></div><h1>Executive Advisory</h1><p>Prepared for ${this.responses.recipientName || "Recipient"}. This browser-generated advisory preview uses the information captured in the assessment.</p><table>${rows}</table></section></main></body></html>`;
    }

    /* ==========================================================
       LOADING SEQUENCE
    ========================================================== */

    runLoadingSequence() {

        const messages = [

            "Understanding your organisation...",

            "Reviewing organisational context...",

            "Identifying people priorities...",

            "Connecting organisational insights...",

            "Preparing Executive Advisory..."

        ];

        let index = 0;

                this.animateTextChange(

            this.loadingMessage,

            messages[index]

        );

        const timer = setInterval(() => {

            index++;

            if (index >= messages.length) {

                clearInterval(timer);

                this.showSuccess();

                return;

            }

                        this.animateTextChange(

                this.loadingMessage,

                messages[index]

            );

        }, 1400);

    }



    /* ==========================================================
       SUCCESS
    ========================================================== */

showSuccess() {

    this.completeAssessment();

    this.showScreen(this.successScreen);

}



    /* ==========================================================
       OPEN REPORT
    ========================================================== */

openReport() {

    localStorage.setItem(
        "growwithhr-report",
        JSON.stringify(this.responses)
    );

    window.location.href =
        "executive-advisory-report.html";

}
   
    /* ==========================================================
       COACH ACKNOWLEDGEMENT
    ========================================================== */

    getCoachAcknowledgement(value) {

        if (!value || value.trim() === "") {

            return "";

        }

        const responses = [

            "Thank you. That gives us a little more context about your organisation.",

            "That's helpful. Every organisation has its own journey and context.",

            "Appreciated. We'll keep this in mind as we continue our conversation.",

            "Thank you for sharing that. Let's continue building our understanding together.",

            "That's useful context. We'll now move to the next part of our conversation."

        ];

        return responses[
            Math.floor(Math.random() * responses.length)
        ];

    }



    /* ==========================================================
       UPDATE COACH MESSAGE
    ========================================================== */

    updateCoachMessage(message = "") {

        if (!this.coachMessage) {

            return;

        }

        this.setCoachMessage(

            message ||

            this.questionBank[this.currentStep].coach,

            !message

        );

    }



    /* ==========================================================
       MOVE TO NEXT QUESTION
    ========================================================== */

    goToNextQuestion() {

    const step = this.questionBank[this.currentStep];

    if (this.currentQuestion < step.questions.length - 1) {

        this.currentQuestion++;

        this.renderCurrentQuestion();

        return;

    }

    if (this.currentStep < this.questionBank.length - 1) {

        this.currentStep++;

        this.currentQuestion = 0;

        this.updateProgress();

        this.showStepIntroduction();

        if (this.pendingQuestionRender) {
            clearTimeout(this.pendingQuestionRender);
        }
        if (this.sectionTransitionTimer) {
            clearTimeout(this.sectionTransitionTimer);
        }

        this.pendingQuestionRender = this.sectionTransitionTimer = setTimeout(() => {

            this.pendingQuestionRender = null;
            this.sectionTransitionTimer = null;
            this.conversationContainer.innerHTML = "";
            this.renderCurrentQuestion();

        }, 2800);

        return;

    }

    this.showReview();
}

    /* ==========================================================
       STEP TRANSITION MESSAGE
    ========================================================== */
showStepIntroduction() {

    const previousSection = this.steps[this.currentStep - 1];
    const nextSection = this.steps[this.currentStep];
    const introductions = [

        `${previousSection} complete. Preparing ${nextSection}...`,

        `${previousSection} complete. Preparing ${nextSection}...`,

        `${previousSection} complete. Preparing ${nextSection}...`

    ];

    if (

        this.currentStep > 0 &&

        this.currentStep <= introductions.length

    ) {

        if (this.coachSection) {
            this.coachSection.hidden = true;
        }

        this.renderSegmentTransitionCard(
            this.steps[this.currentStep],
            introductions[this.currentStep - 1]
        );

        this.animateTextChange(

            this.footerMessage,

            `${previousSection} complete. Preparing ${nextSection}...`

        );

    }

}


renderSegmentTransitionCard(title, message) {

    if (!this.conversationContainer) {

        return;

    }

    this.conversationContainer.innerHTML = `
        <article class="exec-segment-card exec-fade-in">
            <span>Next Section</span>
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="exec-segment-progress">Preparing your next set of questions...</div>
        </article>
    `;

}

    /* ==========================================================
       AUTO SAVE
    ========================================================== */

    autoSave() {

        try {

            localStorage.setItem(

                "growwithhr-assessment",

                JSON.stringify(this.responses)

            );

        }

        catch (error) {

            console.warn(

                "Unable to save assessment progress.",

                error

            );

        }

    }



    /* ==========================================================
       RESTORE SAVED SESSION
    ========================================================== */

    restoreSession() {

        try {

            const savedData = localStorage.getItem(

                "growwithhr-assessment"

            );

            if (!savedData) {

                return;

            }
            this.responses = JSON.parse(savedData);

            if (

                typeof this.responses !== "object" ||

                this.responses === null

            ) {

                this.responses = {};

            }

        }

        catch (error) {

            console.warn(

                "Unable to restore saved assessment.",

                error

            );

        }

    }



    /* ==========================================================
       RESET ASSESSMENT
    ========================================================== */

resetAssessment() {

    this.currentStep = 0;

    this.currentQuestion = 0;

    this.started = false;

    this.completed = false;

    this.onWelcome = false;

    this.responses = {};

    localStorage.removeItem(

        "growwithhr-assessment"

    );

    this.showLanding();

}


    /* ==========================================================
       UPDATE FOOTER MESSAGE
    ========================================================== */

    updateFooterMessage() {

        const step = this.questionBank[this.currentStep];

        const totalQuestions = step.questions.length;

        this.animateTextChange(

            this.footerMessage,

            `Question ${this.currentQuestion + 1} of ${totalQuestions}`

        );

    }



    /* ==========================================================
       UPDATE PROGRESS BAR
    ========================================================== */

    updateProgressBar() {

        const totalQuestions =

            this.questionBank.reduce(

                (count, section) =>

                    count + section.questions.length,

                0

            );

        let completedQuestions = 0;

        for (

            let i = 0;

            i < this.currentStep;

            i++

        ) {

            completedQuestions +=

                this.questionBank[i].questions.length;

        }

        completedQuestions +=

            this.currentQuestion;

        const percentage =

            (completedQuestions / totalQuestions) * 100;

        this.progressBar.style.width =

            `${percentage}%`;

    }



    /* ==========================================================
       REFRESH UI
    ========================================================== */

   refreshUI() {

    if (!this.started) {

        return;

    }

    this.updateProgress();

    this.updateProgressBar();

    this.updateFooterMessage();

}


    /* ==========================================================
       START ASSESSMENT
    ========================================================== */

    startAssessment() {

        this.started = true;

        this.completed = false;

        this.responses = {};

        localStorage.removeItem(

            "growwithhr-assessment"

        );

        this.currentStep = 0;

        this.currentQuestion = 0;

        this.showScreen(this.workspace, "assessment");

        this.onWelcome = false;

        this.updateProgress();
   
        this.updateProgressBar();

        this.renderCurrentQuestion();

        if (this.backButton) {

            this.backButton.hidden = false;

        }

        if (this.nextButton) {

            this.nextButton.innerHTML =

                `Continue <i class="fa-solid fa-arrow-right"></i>`;

        }

    }



    /* ==========================================================
       WELCOME MESSAGE
    ========================================================== */

    showWelcomeMessage() {

        this.onWelcome = true;

        this.stepIndicator.textContent =
            "Welcome";

        this.stepTitle.textContent =
            "Let's begin by understanding your organisation.";

        this.stepDescription.textContent =
            "";

        this.animateTextChange(

            this.footerMessage,

            "Welcome"

        );

        this.progressBar.style.width =
            "0%";

        if (this.coachSection) {
            this.coachSection.hidden = true;
        }

        this.conversationContainer.innerHTML = `
            <article class="exec-coach-intro-card exec-page-turn-in">
                <span>Company</span>
                <h2>Coach HRTechify</h2>
                <p>Every organisation has its own identity. We'll begin with a few foundational questions that help us understand the environment in which your people and business operate.</p>
                <div class="exec-buffer"><i></i></div>
            </article>
        `;

        this.backButton.hidden =
            true;

        this.nextButton.innerHTML =

            `Begin <i class="fa-solid fa-arrow-right"></i>`;

    }

    /* ==========================================================
       KEYBOARD NAVIGATION
    ========================================================== */

    bindKeyboardShortcuts() {

        document.addEventListener("keydown", (event) => {

            if (this.loadingScreen.hidden === false) {

                return;

            }

            switch (event.key) {

                case "Enter":

                    if (

                        document.activeElement.tagName !== "TEXTAREA"

                    ) {

                        event.preventDefault();

                        this.next();

                    }

                    break;

                case "ArrowRight":

                    event.preventDefault();

                    this.next();

                    break;

                case "ArrowLeft":

                    event.preventDefault();

                    this.previous();

                    break;

                case "Escape":

                    this.showExitDialog();

                    break;

            }

        });

    }



    /* ==========================================================
       EXIT DIALOG
    ========================================================== */

    showExitDialog() {

        const modal = document.getElementById("exitModal");

        if (!modal) {

            return;

        }

        modal.hidden = false;

    }



    hideExitDialog() {

        const modal = document.getElementById("exitModal");

        if (!modal) {

            return;

        }

        modal.hidden = true;

    }



    /* ==========================================================
       BIND EXIT EVENTS
    ========================================================== */

    bindExitEvents() {

        const leaveButton =
            document.getElementById("confirmExitButton");

        const stayButton =
            document.getElementById("cancelExitButton");

        if (leaveButton) {

            leaveButton.addEventListener("click", () => {

                this.resetAssessment();

            });

        }

        if (stayButton) {

            stayButton.addEventListener("click", () => {

                this.hideExitDialog();

            });

        }

    }



    /* ==========================================================
       BEFORE UNLOAD WARNING
    ========================================================== */

    bindBeforeUnload() {

        window.addEventListener("beforeunload", (event) => {

            if (

                this.started &&

                !this.completed

            ) {

                event.preventDefault();

                event.returnValue = "";

            }

        });

    }



    /* ==========================================================
       SESSION COMPLETE
    ========================================================== */

    completeAssessment() {

        this.completed = true;

        this.autoSave();

    }



    /* ==========================================================
       CLEANUP / DESTROY
    ========================================================== */

    destroy() {

        this.responses = {};

        this.currentStep = 0;

        this.currentQuestion = 0;

        this.started = false;

        this.completed = false;

        this.onWelcome = false;

        localStorage.removeItem(

            "growwithhr-assessment"

        );

    }



    /* ==========================================================
       APPLICATION STARTUP
    ========================================================== */

    init() {

        this.initializeQuestions();

        this.responses = {};

        localStorage.removeItem(

            "growwithhr-assessment"

        );

        this.bindKeyboardShortcuts();

        this.bindExitEvents();

        this.bindBeforeUnload();

        this.hideAll();

        this.showLanding();


    }
}
/* ==========================================================
   SAFE EVENT BINDING
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        if (window.executiveAssessment) {
            return;
        }

        window.executiveAssessment =

            new ExecutiveAssessment();

        window.executiveAssessment.init();

    }

);
