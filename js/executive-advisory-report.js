/* ==========================================
   executive-advisory-report.js
   Report Initialisation
========================================== */

class ExecutiveAdvisoryReport {

    constructor() {

    this.reportData =
        JSON.parse(
            localStorage.getItem("growwithhr-report")
        ) || {};

    this.cacheElements();

    this.init();

}

   cacheElements() {

    this.companyName =
        document.getElementById("companyName");

    this.companyState =
        document.getElementById("companyState");

    this.companyIndustry =
        document.getElementById("companyIndustry");

    this.companyEntity =
        document.getElementById("companyEntity");

    this.employeeCount =
        document.getElementById("employeeCount");

    this.growthStage =
        document.getElementById("growthStage");

}

    init() {

        populateCompanyProfile() {

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    let stage =
        "Developing Organisation";

    if (employees >= 500) {

        stage =
            "Enterprise Organisation";

    }

    else if (employees >= 100) {

        stage =
            "Scaling Organisation";

    }

    else if (employees >= 20) {

        stage =
            "Growth Organisation";

    }

    document.getElementById(
        "companyName"
    ).textContent =
        data.companyName || "Not Provided";

    document.getElementById(
        "companyIndustry"
    ).textContent =
        data.industry || "Not Provided";

    document.getElementById(
        "employeeCount"
    ).textContent =
        employees || "Not Provided";

    document.getElementById(
        "peopleStructure"
    ).textContent =
        data.peopleFunction || "Not Provided";

    document.getElementById(
        "organisationStage"
    ).textContent =
        stage;

    let focus = "";

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        focus =
            "Establish a structured people function before organisational growth introduces unnecessary complexity.";

    }

    else if (

        data.peopleFunction ===
        "Single HR Professional"

    ) {

        focus =
            "Expand the existing HR capability into a strategic people function capable of supporting future growth.";

    }

    else {

        focus =
            "Leverage the existing HR capability to strengthen leadership, workforce planning and organisational effectiveness.";

    }

    document.getElementById(
        "executiveFocus"
    ).textContent =
        focus;

}

       
   generateCompliance() {

    const container =
        document.getElementById("complianceContainer");

    if (!container) {

        return;

    }

    container.innerHTML = "";

    const data = this.reportData;

    const obligations = [];

    const employees =
        parseInt(data.employees || 0);

    /* ==========================================
       GENERAL
    ========================================== */

    obligations.push({

        title: "Employment Documentation",

        priority: "High",

        description:
            "Ensure appointment letters, employment contracts, HR policies and employee records are maintained for all employees."

    });

    /* ==========================================
       SHOPS & ESTABLISHMENTS
    ========================================== */

    obligations.push({

        title: "Shops & Establishments Compliance",

        priority: "High",

        description:
            "Verify registration, working hours, leave records, holidays and statutory notices applicable in your operating state."

    });

    /* ==========================================
       EPF
    ========================================== */

    if (employees >= 20) {

        obligations.push({

            title: "Employees' Provident Fund (EPF)",

            priority: "Critical",

            description:
                "Review PF registration, monthly contributions, employee onboarding and statutory filings."

        });

    }

    /* ==========================================
       ESI
    ========================================== */

    if (employees >= 10) {

        obligations.push({

            title: "Employees' State Insurance (ESI)",

            priority: "Critical",

            description:
                "Assess ESI applicability, employee eligibility, registrations and monthly compliance."

        });

    }

    /* ==========================================
       POSH
    ========================================== */

    if (employees >= 10) {

        obligations.push({

            title: "POSH Compliance",

            priority: "High",

            description:
                "Review Internal Committee constitution, annual awareness programmes and complaint procedures."

        });

    }

    /* ==========================================
       CONTRACT LABOUR
    ========================================== */

    if (

        parseInt(data.contractWorkers || 0) > 0

    ) {

        obligations.push({

            title: "Contract Labour Compliance",

            priority: "High",

            description:
                "Review contractor registrations, agreements and principal employer responsibilities."

        });

    }

    /* ==========================================
       APPRENTICES
    ========================================== */

    if (

        parseInt(data.apprentices || 0) > 0

    ) {

        obligations.push({

            title: "Apprenticeship Compliance",

            priority: "Medium",

            description:
                "Verify apprenticeship engagement under the Apprentices Act wherever applicable."

        });

    }

    /* ==========================================
       REMOTE WORK
    ========================================== */

    if (

        parseInt(data.remoteWorkforce || 0) > 30

    ) {

        obligations.push({

            title: "Remote Workforce Governance",

            priority: "Medium",

            description:
                "Establish hybrid working policies, information security expectations and remote work guidelines."

        });

    }

    /* ==========================================
       RENDER
    ========================================== */

    obligations.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "value-card";

        card.innerHTML =

        `
            <div class="value-icon">

                📋

            </div>

            <h3>

                ${item.title}

            </h3>

            <span class="priority-badge priority-${item.priority.toLowerCase()}">

                ${item.priority}

            </span>

            <p>

                ${item.description}

            </p>

        `;

        container.appendChild(card);

    });

}

       

        generateObservations() {

    const container =
        document.getElementById(
            "observationsContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const observations = [];

    const employees =
        parseInt(data.employees || 0);

    /* ==========================================
       PEOPLE FUNCTION
    ========================================== */

    switch (data.peopleFunction) {

        case "No Formal HR/People Function":

            observations.push({

                icon: "👥",

                title: "Founder-led People Management",

                text:
                    "People responsibilities currently appear to be managed without a dedicated HR function. This is common in early-stage organisations but introduces operational and compliance risks as headcount grows."

            });

            break;

        case "Single HR Professional":

            observations.push({

                icon: "👤",

                title: "Emerging HR Capability",

                text:
                    "A dedicated HR resource exists, providing a foundation for improving employee experience, compliance and organisational capability."

            });

            break;

        case "HR Team":

            observations.push({

                icon: "🏢",

                title: "Established HR Function",

                text:
                    "The organisation has invested in a structured HR function capable of supporting workforce planning and organisational growth."

            });

            break;

    }

    /* ==========================================
       WORK MODEL
    ========================================== */

    if (data.workModel === "Hybrid") {

        observations.push({

            icon: "🏠",

            title: "Hybrid Workforce",

            text:
                "Hybrid work arrangements require consistent policies, manager capability and technology-enabled collaboration."

        });

    }

    if (data.workModel === "Remote") {

        observations.push({

            icon: "💻",

            title: "Remote Organisation",

            text:
                "A predominantly remote workforce increases the importance of digital onboarding, communication and performance management."

        });

    }

    /* ==========================================
       GROWTH
    ========================================== */

    if (employees >= 100) {

        observations.push({

            icon: "📈",

            title: "Scaling Organisation",

            text:
                "Current workforce size indicates a transition from operational HR towards strategic workforce planning and governance."

        });

    }

    if (

        data.hiringPlans &&
        data.hiringPlans !== "No Hiring Planned"

    ) {

        observations.push({

            icon: "🚀",

            title: "Growth Intent",

            text:
                "Planned recruitment activity suggests the organisation is preparing for expansion and should strengthen hiring processes accordingly."

        });

    }

    /* ==========================================
       RENDER
    ========================================== */

    observations.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "value-card";

        card.innerHTML =

        `
            <div class="value-icon">

                ${item.icon}

            </div>

            <h3>

                ${item.title}

            </h3>

            <p>

                ${item.text}

            </p>

        `;

        container.appendChild(card);

    });

}

       

        generateRisks() {

    const container =
        document.getElementById(
            "risksContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const risks = [];

    const employees =
        parseInt(data.employees || 0);

    /* ==========================================
       PEOPLE FUNCTION
    ========================================== */

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        risks.push({

            icon: "⚠️",

            title: "HR Governance Risk",

            text:
                "Without a dedicated HR function, compliance responsibilities, employee documentation and people processes may become inconsistent as the organisation grows.",

            level: "High"

        });

    }

    /* ==========================================
       RAPID HIRING
    ========================================== */

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        risks.push({

            icon: "📈",

            title: "Growth Execution Risk",

            text:
                "Rapid workforce expansion may outpace recruitment capability, onboarding quality and manager readiness.",

            level: "Medium"

        });

    }

    /* ==========================================
       HYBRID / REMOTE
    ========================================== */

    if (

        data.workModel === "Hybrid" ||

        data.workModel === "Remote"

    ) {

        risks.push({

            icon: "💻",

            title: "Distributed Workforce Risk",

            text:
                "Remote and hybrid teams require stronger communication, cybersecurity awareness and performance management practices.",

            level: "Medium"

        });

    }

    /* ==========================================
       COMPLIANCE
    ========================================== */

    if (

        employees >= 20

    ) {

        risks.push({

            icon: "📋",

            title: "Statutory Compliance Risk",

            text:
                "Larger workforces increase statutory obligations across payroll, labour legislation, employee benefits and record keeping.",

            level: "High"

        });

    }

    /* ==========================================
       SCALE
    ========================================== */

    if (

        employees >= 100

    ) {

        risks.push({

            icon: "🏢",

            title: "Leadership Capacity",

            text:
                "Growing organisations frequently experience inconsistent management capability and organisational alignment if leadership development does not keep pace.",

            level: "Medium"

        });

    }

    /* ==========================================
       DEFAULT
    ========================================== */

    if (

        risks.length === 0

    ) {

        risks.push({

            icon: "✅",

            title: "No Immediate Critical Risks",

            text:
                "No significant organisational risks were identified from the assessment responses. Continue monitoring compliance and workforce practices as the organisation evolves.",

            level: "Low"

        });

    }

    /* ==========================================
       RENDER
    ========================================== */

    risks.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "value-card";

        card.innerHTML =

        `

        <div class="value-icon">

            ${item.icon}

        </div>

        <h3>

            ${item.title}

        </h3>

        <span class="priority-badge priority-${item.level.toLowerCase()}">

            ${item.level}

        </span>

        <p>

            ${item.text}

        </p>

        `;

        container.appendChild(card);

    });

}

      generateOpportunities() {

    const container =
        document.getElementById(
            "opportunitiesContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const opportunities = [];

    const employees =
        parseInt(data.employees || 0);

    /* ==========================================
       HR FUNCTION
    ========================================== */

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        opportunities.push({

            icon: "👥",

            title: "Build Your First HR Function",

            text:
                "Introducing structured HR practices will improve compliance, employee experience and organisational scalability."

        });

    }

    else if (

        data.peopleFunction ===
        "Single HR Professional"

    ) {

        opportunities.push({

            icon: "📈",

            title: "Expand HR Capability",

            text:
                "Growing the HR function into specialised areas such as talent acquisition, learning and compliance can improve organisational effectiveness."

        });

    }

    else {

        opportunities.push({

            icon: "🚀",

            title: "Strategic HR Leadership",

            text:
                "Leverage the existing HR team to drive workforce planning, succession planning and organisational transformation."

        });

    }

    /* ==========================================
       DIGITAL TRANSFORMATION
    ========================================== */

    opportunities.push({

        icon: "💻",

        title: "HR Technology",

        text:
            "Automating HR administration through digital systems can improve efficiency, reporting accuracy and employee experience."

    });

    /* ==========================================
       HIRING
    ========================================== */

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        opportunities.push({

            icon: "🎯",

            title: "Strengthen Talent Acquisition",

            text:
                "Planned recruitment provides an opportunity to standardise hiring, onboarding and employer branding."

        });

    }

    /* ==========================================
       SCALE
    ========================================== */

    if (

        employees >= 50

    ) {

        opportunities.push({

            icon: "📊",

            title: "People Analytics",

            text:
                "Workforce growth creates opportunities to use HR metrics and dashboards for better executive decision-making."

        });

    }

    /* ==========================================
       LEARNING
    ========================================== */

    opportunities.push({

        icon: "🎓",

        title: "Learning & Development",

        text:
            "Structured employee development programmes can improve retention, engagement and leadership capability."

    });

    /* ==========================================
       PERFORMANCE
    ========================================== */

    opportunities.push({

        icon: "⭐",

        title: "Performance Management",

        text:
            "Introducing regular performance conversations and measurable objectives will improve organisational alignment."

    });

    /* ==========================================
       RENDER
    ========================================== */

    opportunities.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "value-card";

        card.innerHTML =

        `

        <div class="value-icon">

            ${item.icon}

        </div>

        <h3>

            ${item.title}

        </h3>

        <p>

            ${item.text}

        </p>

        `;

        container.appendChild(card);

    });

}
       

     generateSWOT() {

    const strengthsContainer =
        document.getElementById(
            "strengthsContainer"
        );

    const weaknessesContainer =
        document.getElementById(
            "weaknessesContainer"
        );

    const opportunitiesContainer =
        document.getElementById(
            "swotOpportunitiesContainer"
        );

    const threatsContainer =
        document.getElementById(
            "threatsContainer"
        );

    if (
        !strengthsContainer ||
        !weaknessesContainer ||
        !opportunitiesContainer ||
        !threatsContainer
    ) {

        return;

    }

    strengthsContainer.innerHTML = "";
    weaknessesContainer.innerHTML = "";
    opportunitiesContainer.innerHTML = "";
    threatsContainer.innerHTML = "";

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    const threats = [];

    /* ==========================================
       STRENGTHS
    ========================================== */

    if (employees >= 100) {

        strengths.push(
            "Established workforce capable of supporting future growth."
        );

    }

    if (

        data.peopleFunction ===
        "HR Team"

    ) {

        strengths.push(
            "Dedicated HR capability supporting organisational development."
        );

    }

    if (

        data.workModel === "Hybrid" ||

        data.workModel === "Remote"

    ) {

        strengths.push(
            "Flexible workforce model supporting talent attraction."
        );

    }

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        strengths.push(
            "Positive growth outlook supported by planned recruitment."
        );

    }

    if (

        strengths.length === 0

    ) {

        strengths.push(
            "Leadership commitment to improving people practices."
        );

    }

    /* ==========================================
       WEAKNESSES
    ========================================== */

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        weaknesses.push(
            "No dedicated HR capability currently in place."
        );

    }

    if (

        employees < 20

    ) {

        weaknesses.push(
            "People processes remain largely informal."
        );

    }

    if (

        data.workModel === "Remote"

    ) {

        weaknesses.push(
            "Remote workforce requires stronger governance."
        );

    }

    if (

        weaknesses.length === 0

    ) {

        weaknesses.push(
            "Continued investment in HR maturity will strengthen organisational capability."
        );

    }

    /* ==========================================
       OPPORTUNITIES
    ========================================== */

    opportunities.push(
        "Introduce HR technology to improve efficiency."
    );

    opportunities.push(
        "Develop structured employee lifecycle processes."
    );

    if (

        employees >= 50

    ) {

        opportunities.push(
            "Leverage workforce analytics for executive decision-making."
        );

    }

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        opportunities.push(
            "Strengthen employer branding before expansion."
        );

    }

    /* ==========================================
       THREATS
    ========================================== */

    if (

        employees >= 20

    ) {

        threats.push(
            "Increasing statutory obligations as workforce grows."
        );

    }

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        threats.push(
            "Compliance exposure without dedicated HR ownership."
        );

    }

    if (

        data.workModel === "Hybrid" ||

        data.workModel === "Remote"

    ) {

        threats.push(
            "Distributed workforce increases management complexity."
        );

    }

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        threats.push(
            "Rapid hiring may impact onboarding quality and culture."
        );

    }

    /* ==========================================
       RENDER
    ========================================== */

    const renderList = (

        container,
        items

    ) => {

        items.forEach(item => {

            const p =
                document.createElement("p");

            p.innerHTML =
                `• ${item}`;

            container.appendChild(p);

        });

    };

    renderList(
        strengthsContainer,
        strengths
    );

    renderList(
        weaknessesContainer,
        weaknesses
    );

    renderList(
        opportunitiesContainer,
        opportunities
    );

    renderList(
        threatsContainer,
        threats
    );

}

        generateRecommendations() {

    const container =
        document.getElementById(
            "recommendationsContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    const recommendations = [];

    /* ==========================================
       HR FUNCTION
    ========================================== */

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        recommendations.push({

            priority: "Critical",

            icon: "👥",

            title: "Establish a Dedicated HR Function",

            description:
                "Appoint an HR resource or engage an external HR partner to formalise employee lifecycle management and statutory compliance."

        });

    }

    else if (

        data.peopleFunction ===
        "Single HR Professional"

    ) {

        recommendations.push({

            priority: "High",

            icon: "📈",

            title: "Strengthen HR Capability",

            description:
                "Expand HR responsibilities through structured recruitment, employee engagement, compliance and workforce planning."

        });

    }

    /* ==========================================
       POLICIES
    ========================================== */

    recommendations.push({

        priority: "High",

        icon: "📚",

        title: "Review HR Policies",

        description:
            "Implement and regularly update employee policies, code of conduct, leave policy, disciplinary procedures and workplace guidelines."

    });

    /* ==========================================
       COMPLIANCE
    ========================================== */

    if (

        employees >= 20

    ) {

        recommendations.push({

            priority: "Critical",

            icon: "⚖️",

            title: "Conduct a Compliance Audit",

            description:
                "Review statutory registrations, payroll compliance, labour law obligations and mandatory records."

        });

    }

    /* ==========================================
       PERFORMANCE
    ========================================== */

    recommendations.push({

        priority: "Medium",

        icon: "⭐",

        title: "Introduce Performance Management",

        description:
            "Implement structured goal setting, periodic reviews and manager feedback conversations."

    });

    /* ==========================================
       TECHNOLOGY
    ========================================== */

    recommendations.push({

        priority: "Medium",

        icon: "💻",

        title: "Adopt HR Technology",

        description:
            "Digitise employee records, onboarding, leave management and HR reporting to improve operational efficiency."

    });

    /* ==========================================
       LEARNING
    ========================================== */

    recommendations.push({

        priority: "Medium",

        icon: "🎓",

        title: "Invest in Capability Development",

        description:
            "Develop learning pathways for employees and managers to strengthen organisational capability."

    });

    /* ==========================================
       GROWTH
    ========================================== */

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        recommendations.push({

            priority: "High",

            icon: "🚀",

            title: "Prepare for Workforce Expansion",

            description:
                "Develop recruitment, onboarding and workforce planning processes before scaling headcount."

        });

    }

    /* ==========================================
       LEADERSHIP
    ========================================== */

    if (

        employees >= 100

    ) {

        recommendations.push({

            priority: "Medium",

            icon: "🏢",

            title: "Develop Leadership Capability",

            description:
                "Strengthen management capability through coaching, succession planning and leadership development."

        });

    }

    /* ==========================================
       RENDER
    ========================================== */

    recommendations.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "value-card";

        card.innerHTML =

        `

        <div class="value-icon">

            ${item.icon}

        </div>

        <span class="priority-badge priority-${item.priority.toLowerCase()}">

            ${item.priority}

        </span>

        <h3>

            ${item.title}

        </h3>

        <p>

            ${item.description}

        </p>

        `;

        container.appendChild(card);

    });

}

        generatePriorityMatrix() {

    const container =
        document.getElementById(
            "priorityMatrix"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    const priorities = [];

    /* ==========================================
       IMMEDIATE
    ========================================== */

    if (

        data.peopleFunction ===
        "No Formal HR/People Function"

    ) {

        priorities.push({

            phase: "Immediate",

            colour: "critical",

            title: "Establish HR Ownership",

            description:
                "Assign responsibility for HR operations and statutory compliance."

        });

    }

    priorities.push({

        phase: "Immediate",

        colour: "critical",

        title: "Review Statutory Compliance",

        description:
            "Verify registrations, payroll compliance and employee documentation."

    });

    /* ==========================================
       30–90 DAYS
    ========================================== */

    priorities.push({

        phase: "30–90 Days",

        colour: "high",

        title: "Strengthen HR Policies",

        description:
            "Implement employee handbook, leave policy, code of conduct and disciplinary procedures."

    });

    priorities.push({

        phase: "30–90 Days",

        colour: "high",

        title: "Standardise Recruitment",

        description:
            "Introduce structured hiring, interview and onboarding processes."

    });

    /* ==========================================
       3–6 MONTHS
    ========================================== */

    priorities.push({

        phase: "3–6 Months",

        colour: "medium",

        title: "Implement Performance Management",

        description:
            "Introduce objective setting, reviews and manager feedback."

    });

    priorities.push({

        phase: "3–6 Months",

        colour: "medium",

        title: "Deploy HR Technology",

        description:
            "Digitise HR administration and employee records."

    });

    /* ==========================================
       6–12 MONTHS
    ========================================== */

    if (

        employees >= 50

    ) {

        priorities.push({

            phase: "6–12 Months",

            colour: "low",

            title: "Develop Leadership Capability",

            description:
                "Invest in leadership development and succession planning."

        });

    }

    priorities.push({

        phase: "6–12 Months",

        colour: "low",

        title: "People Analytics",

        description:
            "Introduce workforce dashboards and executive HR metrics."

    });

    /* ==========================================
       RENDER
    ========================================== */

    priorities.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "timeline-card";

        card.innerHTML =

        `

        <span class="priority-badge priority-${item.colour}">

            ${item.phase}

        </span>

        <h3>

            ${item.title}

        </h3>

        <p>

            ${item.description}

        </p>

        `;

        container.appendChild(card);

    });

}

generateRoadmap() {

    const container =
        document.getElementById(
            "roadmapContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    const roadmap = [];

    /* ==========================================
       0–30 DAYS
    ========================================== */

    roadmap.push({

        phase: "0–30 Days",

        icon: "🚩",

        title: "Stabilise HR Foundations",

        actions: [

            "Review current HR practices",

            "Confirm statutory registrations",

            "Verify employee documentation",

            "Identify immediate compliance gaps"

        ]

    });

    /* ==========================================
       30–90 DAYS
    ========================================== */

    roadmap.push({

        phase: "30–90 Days",

        icon: "⚙️",

        title: "Standardise People Processes",

        actions: [

            "Implement HR policies",

            "Improve onboarding",

            "Standardise recruitment",

            "Introduce manager guidance"

        ]

    });

    /* ==========================================
       3–6 MONTHS
    ========================================== */

    const mediumActions = [

        "Implement performance management",

        "Deploy HR technology",

        "Develop employee learning programmes"

    ];

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        mediumActions.push(

            "Scale recruitment capability"

        );

    }

    roadmap.push({

        phase: "3–6 Months",

        icon: "📈",

        title: "Strengthen Organisational Capability",

        actions: mediumActions

    });

    /* ==========================================
       6–12 MONTHS
    ========================================== */

    const longTermActions = [

        "Develop workforce analytics",

        "Introduce succession planning",

        "Embed continuous improvement"

    ];

    if (

        employees >= 100

    ) {

        longTermActions.push(

            "Develop executive leadership capability"

        );

    }

    roadmap.push({

        phase: "6–12 Months",

        icon: "🚀",

        title: "Enable Strategic Growth",

        actions: longTermActions

    });

    /* ==========================================
       RENDER
    ========================================== */

    roadmap.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "timeline-card";

        card.innerHTML =

        `

        <div class="value-icon">

            ${item.icon}

        </div>

        <h3>

            ${item.phase}

        </h3>

        <h4>

            ${item.title}

        </h4>

        <ul>

            ${item.actions
                .map(action =>
                    `<li>${action}</li>`
                )
                .join("")}

        </ul>

        `;

        container.appendChild(card);

    });

}

 generateWorkforceAnalytics() {

    const container =
        document.getElementById(
            "analyticsContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    let hrScore = 40;
    let complianceScore = 55;
    let growthScore = 50;
    let maturity = "Developing";

    /* ==========================================
       HR MATURITY
    ========================================== */

    switch (data.peopleFunction) {

        case "No Formal HR/People Function":

            hrScore = 30;

            break;

        case "Single HR Professional":

            hrScore = 60;

            break;

        case "HR Team":

            hrScore = 85;

            break;

    }

    /* ==========================================
       COMPLIANCE
    ========================================== */

    if (employees >= 20) {

        complianceScore += 10;

    }

    if (employees >= 100) {

        complianceScore += 10;

    }

    complianceScore =
        Math.min(complianceScore, 100);

    /* ==========================================
       GROWTH
    ========================================== */

    if (

        data.hiringPlans &&
        data.hiringPlans !==
        "No Hiring Planned"

    ) {

        growthScore += 20;

    }

    if (

        data.workModel === "Hybrid"

    ) {

        growthScore += 5;

    }

    if (

        data.workModel === "Remote"

    ) {

        growthScore += 10;

    }

    growthScore =
        Math.min(growthScore, 100);

    /* ==========================================
       MATURITY
    ========================================== */

    const overall =
        Math.round(

            (

                hrScore +

                complianceScore +

                growthScore

            ) / 3

        );

    if (overall >= 85) {

        maturity = "Advanced";

    }

    else if (overall >= 70) {

        maturity = "Scaling";

    }

    else if (overall >= 55) {

        maturity = "Growth";

    }

    else {

        maturity = "Developing";

    }

    /* ==========================================
       METRICS
    ========================================== */

    const metrics = [

        {

            label: "HR Maturity",

            value: `${hrScore}%`,

            note: maturity

        },

        {

            label: "Compliance",

            value: `${complianceScore}%`,

            note: "Current Readiness"

        },

        {

            label: "Growth",

            value: `${growthScore}%`,

            note: "Growth Readiness"

        },

        {

            label: "Overall",

            value: `${overall}%`,

            note: "Organisation Health"

        }

    ];

    /* ==========================================
       SCORECARD
    ========================================== */

    document.getElementById(

        "hrMaturityScore"

    ).textContent =
        `${hrScore}%`;

    document.getElementById(

        "complianceScore"

    ).textContent =
        `${complianceScore}%`;

    document.getElementById(

        "growthScore"

    ).textContent =
        `${growthScore}%`;

    document.getElementById(

        "overallScore"

    ).textContent =
        `${overall}%`;

    /* ==========================================
       RENDER ANALYTICS
    ========================================== */

    metrics.forEach(metric => {

        const card =
            document.createElement("div");

        card.className =
            "executive-metric-card";

        card.innerHTML =

        `

        <span class="metric-label">

            ${metric.label}

        </span>

        <strong class="metric-value">

            ${metric.value}

        </strong>

        <span class="metric-note">

            ${metric.note}

        </span>

        `;

        container.appendChild(card);

    });

}

        generateComplianceReadiness() {

    const container =
        document.getElementById(
            "complianceReadinessContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const data = this.reportData;

    const employees =
        parseInt(data.employees || 0);

    const checks = [];

    /* ==========================================
       EMPLOYMENT DOCUMENTATION
    ========================================== */

    checks.push({

        title: "Employment Documentation",

        status: "Required",

        description:
            "Appointment letters, employee records and HR policies should be maintained for every employee."

    });

    /* ==========================================
       SHOPS & ESTABLISHMENTS
    ========================================== */

    checks.push({

        title: "Shops & Establishments",

        status: "Applicable",

        description:
            "Review registration, notices, leave records and working hour requirements applicable in your state."

    });

    /* ==========================================
       EPF
    ========================================== */

    if (employees >= 20) {

        checks.push({

            title: "Employees' Provident Fund (EPF)",

            status: "Applicable",

            description:
                "Organisation is likely to fall within EPF applicability thresholds. Verify registration and monthly compliance."

        });

    }

    /* ==========================================
       ESI
    ========================================== */

    if (employees >= 10) {

        checks.push({

            title: "Employees' State Insurance (ESI)",

            status: "Applicable",

            description:
                "Review employee eligibility, registration and statutory contribution requirements."

        });

    }

    /* ==========================================
       POSH
    ========================================== */

    if (employees >= 10) {

        checks.push({

            title: "POSH Compliance",

            status: "Mandatory",

            description:
                "Review Internal Committee constitution, awareness programmes and annual compliance obligations."

        });

    }

    /* ==========================================
       CONTRACT LABOUR
    ========================================== */

    if (

        parseInt(data.contractWorkers || 0) > 0

    ) {

        checks.push({

            title: "Contract Labour",

            status: "Review",

            description:
                "Verify contractor registrations, agreements and principal employer responsibilities."

        });

    }

    /* ==========================================
       APPRENTICES
    ========================================== */

    if (

        parseInt(data.apprentices || 0) > 0

    ) {

        checks.push({

            title: "Apprentices Act",

            status: "Review",

            description:
                "Review apprenticeship agreements and statutory obligations."

        });

    }

    /* ==========================================
       RENDER
    ========================================== */

    checks.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "value-card";

        card.innerHTML =

        `

        <div class="value-icon">

            🛡️

        </div>

        <h3>

            ${item.title}

        </h3>

        <span class="priority-badge priority-medium">

            ${item.status}

        </span>

        <p>

            ${item.description}

        </p>

        `;

        container.appendChild(card);

    });

}
       

 generateExecutiveNarrative() {

    const container =
        document.getElementById(
            "executiveNarrative"
        );

    if (!container) return;

    const data = this.reportData;

    const company =
        data.companyName || "the organisation";

    const industry =
        data.industry || "its industry";

    const employees =
        parseInt(data.employees || 0);

    const peopleFunction =
        data.peopleFunction ||
        "its current HR structure";

    const workModel =
        data.workModel ||
        "its current operating model";

    const hiring =
        data.hiringPlans ||
        "current hiring plans";

    let maturity =
        "Developing";

    if (employees >= 500) {

        maturity = "Enterprise";

    }

    else if (employees >= 100) {

        maturity = "Scaling";

    }

    else if (employees >= 20) {

        maturity = "Growth";

    }

    let narrative = `

<p>

<strong>${company}</strong> operates within the
<strong>${industry}</strong> sector and currently
demonstrates the characteristics of a
<strong>${maturity}</strong> organisation.

</p>

<p>

Based on the Executive Assessment, the organisation
currently manages its people function through
<strong>${peopleFunction}</strong> while operating
primarily under a
<strong>${workModel}</strong> workforce model.

</p>

<p>

The assessment indicates that the organisation should
focus on strengthening governance, improving workforce
planning, standardising HR processes and ensuring
continued compliance with applicable employment
legislation as the business continues to evolve.

</p>

`;

    /* ==========================================
       GROWTH
    ========================================== */

    if (

        hiring !==
        "No Hiring Planned"

    ) {

        narrative += `

<p>

The planned recruitment activity presents an excellent
opportunity to build scalable HR processes before
additional organisational complexity is introduced.
Investment in structured recruitment, onboarding,
manager capability and workforce planning will help
support sustainable growth.

</p>

`;

    }

    /* ==========================================
       HR
    ========================================== */

    if (

        peopleFunction ===
        "No Formal HR/People Function"

    ) {

        narrative += `

<p>

A dedicated HR capability is likely to become
increasingly important as workforce size grows.
Introducing formal ownership of people processes will
reduce compliance exposure while improving employee
experience and organisational consistency.

</p>

`;

    }

    else if (

        peopleFunction ===
        "Single HR Professional"

    ) {

        narrative += `

<p>

The existing HR capability provides a strong foundation.
The next stage should focus on expanding HR beyond
administration towards workforce planning, capability
development and organisational effectiveness.

</p>

`;

    }

    else {

        narrative += `

<p>

The organisation already possesses an established HR
capability. Continued investment in leadership,
analytics and strategic workforce planning will position
the business for long-term sustainable growth.

</p>

`;

    }

    /* ==========================================
       EXECUTIVE CONCLUSION
    ========================================== */

    narrative += `

<p>

Overall, <strong>${company}</strong> seems well positioned for
its next stage of organisational development. The
recommendations contained within this Executive
Advisory prioritise practical improvements that can be
implemented progressively while strengthening
compliance, workforce capability and long-term business
resilience. However, please do not consider this as a final report. 

</p>

`;

    container.innerHTML =
        narrative;

}

        this.bindEvents();

    }

    bindEvents() {

        const downloadButton =
            document.getElementById("downloadReport");

        if (downloadButton) {

            downloadButton.addEventListener(
                "click",
                () => window.print()
            );

        }

        const retakeButton =
            document.getElementById("retakeAssessment");

        if (retakeButton) {

            retakeButton.addEventListener(
                "click",
                () => {

                    localStorage.removeItem(
                        "growwithhr-report"
                    );

                    window.location.href =
                        "analyze-company.html";

                }

            );

        }

    }

    populateCompanyProfile() {

    this.companyName.textContent =
        this.reportData.companyName || "Not Provided";

    this.companyState.textContent =
        this.reportData.state || "Not Provided";

    this.companyIndustry.textContent =
        this.reportData.industry || "Not Provided";

    this.companyEntity.textContent =
        this.reportData.legalStructure || "Not Provided";

    this.employeeCount.textContent =
        this.reportData.employeeCount || "Not Provided";

    this.growthStage.textContent =
        this.reportData.growthStage || "Not Provided";

}

    generateExecutiveSummary() {}

    generateCompliance() {}

    generateObservations() {}

    generateRisks() {}

    generateOpportunities() {}

    generateSWOT() {}

    generateRecommendations() {}

    generatePriorityMatrix() {}

    generateRoadmap() {}

    generateWorkforceAnalytics() {}

    generateComplianceReadiness() {}

    generateExecutiveNarrative() {}

}

window.ExecutiveAdvisoryReport =
    ExecutiveAdvisoryReport;
