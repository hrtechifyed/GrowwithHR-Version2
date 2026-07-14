/* ==========================================================
   HRTECHIFY DESIGN SYSTEM
   Module 12
   Executive Assessment
   JavaScript Engine
   Version : v1.0.0
========================================================== */

class ExecutiveAssessment {

    constructor() {

        /* ==========================================
           APPLICATION
        ========================================== */

        this.application = "GrowWithHR";

        this.version = "1.0.0";

        this.coach = "Coach HRTechify";


        /* ==========================================
           STEP STATE
        ========================================== */

        this.currentStep = 0;

        this.currentQuestion = 0;

        this.started = false;

        this.completed = false;

        this.onWelcome = false;


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

        if (this.startButton) {

            this.startButton.addEventListener(

                "click",

                () => this.startAssessment()

            );

        }

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

                        type: "text",

                        icon: "fa-industry",

                        label: "Which industry best represents your organisation?",

                        helper:
                            "Examples include Manufacturing, IT Services, Healthcare or Retail.",

                        placeholder:
                            "Industry"

                    },

                    {

                        id: "nature",

                        type: "text",

                        icon: "fa-briefcase",

                        label: "How would you describe your primary business?",

                        helper:
                            "A short description is sufficient.",

                        placeholder:
                            "Nature of Business"

                    },

                    {

                        id: "founded",

                        type: "number",

                        icon: "fa-calendar",

                        label: "In which year was your organisation established?",

                        helper:
                            "An approximate year is perfectly acceptable if you're unsure.(but this is one year you won't like to forget \ud83d\ude1c)",

                        placeholder:
                            "Year"

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
                            "An approximate figure is sufficient."

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

                        type: "text",

                        icon: "fa-location-dot",

                        label: "Which is your primary operating state?",

                        helper:
                            "If you operate in multiple locations, enter the state where your headquarters or principal office is located.",

                        placeholder:
                            "Primary State"

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
       console.log("RENDER CURRENT QUESTION");

        const step = this.questionBank[this.currentStep];

        const question = step.questions[this.currentQuestion];

        this.stepIndicator.textContent =
            `Step ${this.currentStep + 1} of ${this.steps.length}`;

        this.stepTitle.textContent =
            step.title;

        this.stepDescription.textContent =
            step.description;

        this.setCoachMessage(

            step.coach,

            this.currentQuestion === 0

        );

        this.updateFooterMessage();

        const template =
            document.getElementById("conversationTemplate");

        const card =
            template.content.cloneNode(true);

        card.getElementById("questionCategory").textContent =
            step.title;

        card.getElementById("questionTitle").textContent =
            question.label;

        card.getElementById("questionIcon").className =
            `fa-solid ${question.icon}`;

        card.getElementById("coachContext").textContent =
            "Take your time. Thoughtful responses may help us better understand your organisation.";

        card.getElementById("questionText").textContent =
            question.label;

        card.getElementById("questionExplanation").textContent =
            question.helper;

        const responseContainer =
            card.getElementById("questionResponse");

        responseContainer.appendChild(

            this.createInput(question)

        );

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

    console.log("NEXT");
    console.log("onWelcome:", this.onWelcome);
    console.log("started:", this.started);
    console.log("currentStep:", this.currentStep);
    console.log("currentQuestion:", this.currentQuestion);


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

    console.log("GOING TO NEXT QUESTION");

    this.goToNextQuestion();

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

       console.log("SHOW REVIEW");

        this.hideAll();

        this.reviewScreen.hidden = false;

        this.reviewContainer.innerHTML = "";

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

    }



    /* ==========================================================
       GENERATE REPORT
    ========================================================== */

    generateReport() {

        this.hideAll();

        this.loadingScreen.hidden = false;

        this.runLoadingSequence();

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

        this.hideAll();

        this.successScreen.hidden = false;

    }



    /* ==========================================================
       OPEN REPORT
    ========================================================== */

    openReport() {

        window.location.href =
            "sample-advisory-report.html";

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

    console.log("goToNextQuestion", this.currentStep, this.currentQuestion);

    const step = this.questionBank[this.currentStep];

    if (this.currentQuestion < step.questions.length - 1) {

        this.currentQuestion++;

        console.log("NEXT QUESTION");

        this.renderCurrentQuestion();

        return;

    }

    if (this.currentStep < this.questionBank.length - 1) {

        this.currentStep++;

        this.currentQuestion = 0;

        console.log("NEXT STEP");

        this.updateProgress();

        this.showStepIntroduction();

        setTimeout(() => {

            this.renderCurrentQuestion();

        }, 1800);

        return;

    }

    console.log("ABOUT TO SHOW REVIEW");

    this.showReview();

    console.log("SHOW REVIEW FINISHED");
}

    /* ==========================================================
       STEP TRANSITION MESSAGE
    ========================================================== */
showStepIntroduction() {

    const introductions = [

        "Thank you. We now have a better understanding of your organisation. Let's now talk about your people.",

        "Thank you for sharing that. I'd now love to learn more about how your organisation works and creates value... In simple terms how do you operate?",

        "Excellent. Looking ahead, where do you see your organisation heading in the future."

    ];

    if (

        this.currentStep > 0 &&

        this.currentStep <= introductions.length

    ) {

        this.setCoachMessage(

            introductions[this.currentStep - 1],

            true

        );

        this.animateTextChange(

            this.footerMessage,

            `Preparing ${this.steps[this.currentStep]}...`

        );

    }

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

        this.restoreSession();

        this.currentStep = 0;

        this.currentQuestion = 0;

        this.hideAll();

        this.workspace.hidden = false;

        this.updateProgress();
   
        this.updateProgressBar();

        this.showWelcomeMessage();

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

        this.setCoachMessage(

            "Welcome, and thank you for taking the time to have this conversation. " +
            "Every organisation has its own journey, ambitions and unique way of working, " +
            "and before we're ready to offer any meaningful guidance, we'd like to understand " +
            "yours a little better. There are no right or wrong answers here \u2014 simply answer " +
            "each question to the best of your current knowledge, and we'll take it one step at a time.",

            true

        );

        this.conversationContainer.innerHTML =
            "";

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

        this.restoreSession();

        this.bindKeyboardShortcuts();

        this.bindExitEvents();

        this.bindBeforeUnload();

       this.startAssessment();


    }
}
/* ==========================================================
   SAFE EVENT BINDING
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        window.executiveAssessment =

            new ExecutiveAssessment();

        window.executiveAssessment.init();

    }

);
