/* ==========================================
   executive-advisory-report.js
   Dynamic Executive Advisory Engine
========================================== */

class ExecutiveAdvisoryReport {
    constructor() {
        this.reportData = JSON.parse(localStorage.getItem("growwithhr-report") || "{}");
        this.cacheElements();
        this.init();
    }

    cacheElements() {
        this.ids = [
            "companyName", "companyState", "companyIndustry", "companyEntity", "employeeCount",
            "growthStage", "peopleStructure", "organisationStage", "executiveFocus",
            "observationsContainer", "attentionContainer", "recommendationsContainer",
            "roadmapContainer", "complianceContainer", "opportunitiesContainer"
        ].reduce((items, id) => ({ ...items, [id]: document.getElementById(id) }), {});
    }

    init() {
        this.populateCompanyProfile();
        this.generateExecutiveNarrative();
        this.generateStrengths();
        this.generateLeadershipPriorities();
        this.generateRecommendations();
        this.generateRoadmap();
        this.generateComplianceReview();
        this.generateStrategicOpportunities();
        this.generateLookingAhead();
        this.bindDownload();
    }

    text(value, fallback = "Not Provided") {
        return value && String(value).trim() ? String(value).trim() : fallback;
    }

    number(value) {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }

    stage() {
        const employees = this.number(this.reportData.employees);
        if (employees >= 500) return "Enterprise Organisation";
        if (employees >= 100) return "Scaling Organisation";
        if (employees >= 20) return "Growth Organisation";
        return "Developing Organisation";
    }

    set(id, value) {
        if (this.ids[id]) this.ids[id].textContent = value;
    }

    card(title, body, meta = "Executive Guidance") {
        return `<article class="exec-card"><span>${meta}</span><h3>${title}</h3><p>${body}</p></article>`;
    }

    populateCompanyProfile() {
        const data = this.reportData;
        const employees = this.number(data.employees);
        const stage = this.stage();
        this.set("companyName", this.text(data.companyName));
        this.set("companyState", this.text(data.primaryState || data.state));
        this.set("companyIndustry", this.text(data.industry));
        this.set("companyEntity", this.text(data.entity));
        this.set("employeeCount", employees ? String(employees) : "Not Provided");
        this.set("growthStage", this.text(data.fundingStage, stage));
        this.set("peopleStructure", this.text(data.peopleFunction));
        this.set("organisationStage", stage);

        const focus = data.peopleFunction === "No Formal HR/People Function"
            ? "Establish a clear people operating model before growth creates avoidable execution and compliance pressure."
            : data.peopleFunction === "Founder Led"
                ? "Move founder-led people decisions into repeatable management routines, policies and ownership."
                : "Use the existing people capability to strengthen leadership cadence, workforce planning and governance.";
        this.set("executiveFocus", focus);
    }

    generateExecutiveNarrative() {
        const target = document.getElementById("executiveNarrative") || document.querySelector(".executive-narrative p");
        if (!target) return;
        const data = this.reportData;
        target.innerHTML = `${this.text(data.companyName, "The organisation")} operates in the <strong>${this.text(data.industry, "selected")}</strong> sector with an approximate workforce of <strong>${this.number(data.employees) || "not specified"}</strong>. The advisory below translates the assessment inputs into practical leadership actions across structure, compliance, people operations and growth readiness.`;
    }

    generateStrengths() {
        const data = this.reportData;
        const strengths = [
            ["Clear organisational context", `The organisation has articulated its legal structure, operating model and business direction, creating a useful baseline for executive people decisions.`],
            ["Visible workforce profile", `Employee, contract, intern and apprentice inputs give leadership a clearer view of workforce complexity and statutory touchpoints.`],
            ["Growth conversation started", `${this.text(data.hiringPlans, "The stated hiring outlook")} gives the leadership team a practical trigger for planning capacity, policies and governance.`]
        ];
        if (data.peopleFunction && data.peopleFunction !== "No Formal HR/People Function") {
            strengths.push(["People ownership exists", `The current ${data.peopleFunction} model provides a foundation that can be formalised into scalable people practices.`]);
        }
        this.renderCards("observationsContainer", strengths, "Organisational Strength");
    }

    generateLeadershipPriorities() {
        const employees = this.number(this.reportData.employees);
        const priorities = [
            ["Clarify people governance", "Define who owns workforce decisions, policy approvals, documentation quality and statutory follow-through."],
            ["Standardise employee lifecycle", "Create consistent onboarding, contracts, records, leave, performance and exit practices across teams."],
            ["Build compliance confidence", "Review registrations, filings, notices and state-specific obligations before scale increases operational pressure."]
        ];
        if (employees >= 50) priorities.push(["Strengthen manager capability", "Equip managers with basic routines for feedback, accountability, conduct, documentation and team planning."]);
        this.renderCards("attentionContainer", priorities, "Leadership Priority");
    }

    generateRecommendations() {
        const data = this.reportData;
        const recommendations = [
            ["Create a board-ready people operating model", "Document people ownership, decision rights, policy governance and escalation routes so HR is managed as a business capability rather than an administrative function."],
            ["Formalise core employment documentation", "Ensure offer letters, appointment terms, contractor agreements, intern letters and apprentice documentation are complete, consistent and retrievable."],
            ["Introduce a quarterly people review", `Review hiring plans, attrition signals, compliance status and capability gaps every quarter, especially under a ${this.text(data.hiringPlans, "changing")} hiring outlook.`]
        ];
        this.renderCards("recommendationsContainer", recommendations, "Strategic Recommendation");
    }

    generateRoadmap() {
        const roadmap = [
            ["0–30 days", "Confirm statutory applicability, validate workforce numbers and close critical documentation gaps."],
            ["31–60 days", "Publish core policies, assign compliance owners and standardise onboarding and employee records."],
            ["61–90 days", "Launch manager routines, quarterly people review metrics and a practical workforce planning cadence."],
            ["90+ days", "Digitise repeatable HR processes and refresh the advisory as the organisation scales or expands locations."]
        ];
        this.renderCards("roadmapContainer", roadmap, "Executive Roadmap");
    }

    generateComplianceReview() {
        const employees = this.number(this.reportData.employees);
        const contractWorkers = this.number(this.reportData.contractWorkers);
        const apprentices = this.number(this.reportData.apprentices);
        const items = [
            ["Employment records", "Maintain appointment letters, identity records, attendance, leave and wage documentation for all worker categories."],
            ["State-specific labour obligations", `Review Shops & Establishments or applicable local registrations for ${this.text(this.reportData.primaryState || this.reportData.state, "the primary state")}.`]
        ];
        if (employees >= 20) items.push(["Provident Fund review", "Validate EPF registration, eligibility, contributions and monthly filing discipline."]);
        if (employees >= 10) items.push(["ESI and gratuity applicability", "Review ESI eligibility and gratuity readiness based on employee count, wages and tenure profile."]);
        if (contractWorkers > 0) items.push(["Contract workforce governance", "Confirm contractor documentation, principal employer responsibilities and compliance evidence."]);
        if (apprentices > 0) items.push(["Apprenticeship governance", "Review apprenticeship agreements, records and applicable statutory requirements."]);
        this.renderCards("complianceContainer", items, "Compliance Review");
    }

    generateStrategicOpportunities() {
        const opportunities = [
            ["Digital HR foundation", "Digitise employee records, onboarding, leave and basic reporting to improve decision speed and audit readiness."],
            ["Leadership rhythm", "Use monthly people conversations to connect hiring, productivity, retention and compliance to business outcomes."],
            ["Employer trust", "Clear policies and consistent employee communication can improve confidence across employees, managers and investors."]
        ];
        this.renderCards("opportunitiesContainer", opportunities, "Strategic Opportunity");
    }

    generateLookingAhead() {
        const target = document.getElementById("lookingAheadText") || document.querySelector("#lookingAhead p");
        if (!target) return;
        target.textContent = "As the organisation grows, people decisions should become more intentional, documented and leadership-owned. Revisit this advisory whenever headcount, locations, funding stage or operating model materially changes.";
    }

    renderCards(containerId, items, meta) {
        const container = this.ids[containerId];
        if (!container) return;
        container.innerHTML = items.map(([title, body]) => this.card(title, body, meta)).join("");
    }

    bindDownload() {
        document.querySelectorAll("[data-action='download-pdf'], #downloadPdf").forEach((button) => {
            button.addEventListener("click", () => window.print());
        });
    }
}
