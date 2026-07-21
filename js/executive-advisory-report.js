/* ==========================================
   executive-advisory-report.js
   Dynamic Executive Advisory Engine
========================================== */
class ExecutiveAdvisoryReport {
    constructor() {
        this.reportData = JSON.parse(localStorage.getItem("growwithhr-report") || "{}");
        this.model = this.reportData;
        this.cacheElements();
        this.init();

        if (typeof window.setTimeout === "function") {
            window.setTimeout(() => this.refreshEnhancedModel(), 900);
        }
    }

    refreshEnhancedModel() {
        const pdf = window.GrowWithHRPDF;
        const enhancer = window.GrowWithHRReportExperience;
        if (pdf && typeof pdf.buildAdvisoryModel === "function") {
            this.model = pdf.buildAdvisoryModel({ report: this.reportData });
        } else if (enhancer?.enhanceModel) {
            this.model = enhancer.enhanceModel(this.buildCompatibilityModel());
        } else {
            return;
        }
        this.populateCompanyProfile();
        this.generateExecutiveNarrative();
        this.generateStrengths();
        this.generateLeadershipPriorities();
        this.generateRecommendations();
        this.generateRoadmap();
        this.generateComplianceReview();
        this.generateStrategicOpportunities();
        this.generateLookingAhead();
    }

    buildCompatibilityModel() {
        const recommendations = this.baseRecommendations().map(([title, recommendation]) => ({
            title,
            observation: this.observationFor(title),
            recommendation
        }));
        return {
            ...this.reportData,
            employees: this.number(this.reportData.employees, 1),
            recommendations,
            priorities: recommendations.map((item) => item.title),
            strengths: this.baseStrengths().map(([, body]) => body),
            executiveSummary: [
                `${this.text(this.reportData.companyName, "The organisation")} operates in the ${this.text(this.reportData.industry, "selected")} sector with ${this.employeeLabel()}.`,
                "The advisory translates the assessment inputs into practical leadership actions across structure, compliance, people operations and growth readiness."
            ],
            roadmap: {
                first30: ["Confirm statutory applicability, validate workforce numbers and close critical documentation gaps."],
                next60: ["Publish core policies, assign compliance owners and standardise onboarding and employee records."],
                next90: ["Launch manager routines, quarterly people review metrics and a practical workforce planning cadence."]
            },
            compliance: this.baseCompliance().map(([, body]) => body),
            opportunities: this.baseOpportunities().map(([, body]) => body)
        };
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
        this.reduceStaticRepetition();
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

    number(value, minimum = 0) {
        const parsed = Number.parseInt(value, 10);
        return Number.isSafeInteger(parsed) && parsed >= minimum ? parsed : minimum;
    }

    employeeCount() {
        return this.number(this.model.employees ?? this.reportData.employees, 1);
    }

    employeeLabel() {
        const count = this.employeeCount();
        return `${count} ${count === 1 ? "employee" : "employees"}`;
    }

    stage() {
        const employees = this.employeeCount();
        if (employees >= 500) return "Enterprise Organisation";
        if (employees >= 100) return "Scaling Organisation";
        if (employees >= 20) return "Growth Organisation";
        return "Developing Organisation";
    }

    set(id, value) {
        if (this.ids[id]) this.ids[id].textContent = value;
    }

    escape(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    card(title, body, meta = "Executive Guidance", extra = "") {
        return `<article class="exec-card"><span>${this.escape(meta)}</span><h3>${this.escape(title)}</h3><p>${this.escape(body)}</p>${extra}</article>`;
    }

    reduceStaticRepetition() {
        const about = document.querySelector("section .executive-summary-card .summary-hero-copy");
        if (about && about.querySelector) {
            about.innerHTML = `
                <p class="eyebrow">ABOUT THIS ADVISORY</p>
                <h2>Prepared for Executive Leadership</h2>
                <p>This personalised working document translates the information supplied during the GrowWithHR Executive Assessment into practical leadership actions. It supports discussion and planning and is not legal or regulatory advice.</p>`;
        }
    }

    populateCompanyProfile() {
        const data = this.model;
        const stage = this.stage();
        this.set("companyName", this.text(data.companyName || this.reportData.companyName));
        this.set("companyState", this.text(data.primaryState || data.state || this.reportData.primaryState || this.reportData.state));
        this.set("companyIndustry", this.text(data.industry || this.reportData.industry));
        this.set("companyEntity", this.text(data.entity || this.reportData.entity));
        this.set("employeeCount", data.employeeLabel || this.employeeLabel());
        this.set("growthStage", this.text(data.fundingStage || this.reportData.fundingStage, stage));
        this.set("peopleStructure", this.text(data.peopleFunction || this.reportData.peopleFunction));
        this.set("organisationStage", stage);

        const peopleFunction = data.peopleFunction || this.reportData.peopleFunction;
        const focus = peopleFunction === "No Formal HR/People Function"
            ? "Establish a clear people operating model before growth creates avoidable execution and compliance pressure."
            : peopleFunction === "Founder Led"
                ? "Move founder-led people decisions into repeatable management routines, policies and ownership."
                : "Use the existing people capability to strengthen leadership cadence, workforce planning and governance.";
        this.set("executiveFocus", focus);
    }

    generateExecutiveNarrative() {
        const target = document.getElementById("executiveNarrative") || document.querySelector(".executive-narrative p");
        if (!target) return;
        if (Array.isArray(this.model.executiveSummary) && this.model.executiveSummary.length) {
            target.innerHTML = this.model.executiveSummary.map((text) => `<p>${this.escape(text)}</p>`).join("");
            return;
        }
        const data = this.reportData;
        target.innerHTML = `${this.text(data.companyName, "The organisation")} operates in the <strong>${this.text(data.industry, "selected")}</strong> sector with an approximate workforce of <strong>${this.employeeLabel()}</strong>. The advisory below translates the assessment inputs into practical leadership actions across structure, compliance, people operations and growth readiness.`;
    }

    baseStrengths() {
        const data = this.reportData;
        const strengths = [
            ["Clear organisational context", "The organisation has articulated its legal structure, operating model and business direction, creating a useful baseline for executive people decisions."],
            ["Visible workforce profile", "Employee, contract, intern and apprentice inputs give leadership a clearer view of workforce complexity and statutory touchpoints."],
            ["Growth conversation started", `${this.text(data.hiringPlans, "The stated hiring outlook")} gives the leadership team a practical trigger for planning capacity, policies and governance.`]
        ];
        if (data.peopleFunction && data.peopleFunction !== "No Formal HR/People Function") {
            strengths.push(["People ownership exists", `The current ${data.peopleFunction} model provides a foundation that can be formalised into scalable people practices.`]);
        }
        return strengths;
    }

    generateStrengths() {
        const source = Array.isArray(this.model.strengths)
            ? this.model.strengths.map((body, index) => [`Positive foundation ${index + 1}`, body])
            : this.baseStrengths();
        this.renderCards("observationsContainer", source, "Organisational Strength");
    }

    basePriorities() {
        const priorities = [
            ["Clarify people governance", "Define who owns workforce decisions, policy approvals, documentation quality and statutory follow-through."],
            ["Standardise employee lifecycle", "Create consistent onboarding, contracts, records, leave, performance and exit practices across teams."],
            ["Build compliance confidence", "Review registrations, filings, notices and state-specific obligations before scale increases operational pressure."]
        ];
        if (this.employeeCount() >= 50) priorities.push(["Strengthen manager capability", "Equip managers with basic routines for feedback, accountability, conduct, documentation and team planning."]);
        return priorities;
    }

    observationFor(title) {
        const map = {
            "Hiring and onboarding": "Growth will place greater pressure on role clarity, selection quality and onboarding consistency.",
            "Policies and compliance": "People policies and statutory governance need to keep pace with workforce size, location and operating complexity.",
            "Performance and rewards": "Clear expectations and transparent reward decisions become more important as the organisation grows.",
            "Manager capability": "Growth outcomes depend heavily on the quality and consistency of day-to-day management.",
            "Culture and engagement": "Culture becomes less dependent on founder proximity and more dependent on repeated leadership behaviour.",
            "HR operations and technology": "Fragmented people administration can reduce visibility and create avoidable operational risk.",
            "Workforce planning": "Hiring plans need a practical view of capability, cost, timing and organisational capacity.",
            "Organisation design": "Unclear accountabilities and overlapping decision rights can slow execution."
        };
        return map[title] || "This area deserves leadership attention before additional organisational complexity is introduced.";
    }

    generateLeadershipPriorities() {
        const recommendations = Array.isArray(this.model.recommendations) ? this.model.recommendations : [];
        const priorities = recommendations.length
            ? recommendations.map((item) => [item.title, item.observation])
            : this.basePriorities();
        this.renderCards("attentionContainer", priorities, "Leadership Priority");
    }

    baseRecommendations() {
        const data = this.reportData;
        return [
            ["Create a board-ready people operating model", "Document people ownership, decision rights, policy governance and escalation routes so HR is managed as a business capability rather than an administrative function."],
            ["Formalise core employment documentation", "Ensure offer letters, appointment terms, contractor agreements, intern letters and apprentice documentation are complete, consistent and retrievable."],
            ["Introduce a quarterly people review", `Review hiring plans, attrition signals, compliance status and capability gaps every quarter, especially under a ${this.text(data.hiringPlans, "changing")} hiring outlook.`]
        ];
    }

    implementationMarkup(item) {
        const steps = (item.howTo || []).map((step) => `<li>${this.escape(step)}</li>`).join("");
        if (!steps && !item.resourceUrl) return "";
        const resource = item.resourceUrl
            ? `<a class="exec-card__resource" href="${this.escape(item.resourceUrl)}" download>${this.escape(item.resourceLabel || "Open template")} →</a>`
            : "";
        return `<div class="exec-card__implementation"><h4>How to implement</h4><ol>${steps}</ol><div class="exec-card__meta-row">${item.owner ? `<span><strong>Owner:</strong> ${this.escape(item.owner)}</span>` : ""}${item.timeframe ? `<span><strong>Timing:</strong> ${this.escape(item.timeframe)}</span>` : ""}</div>${resource}</div>`;
    }

    generateRecommendations() {
        const target = this.ids.recommendationsContainer;
        if (!target) return;
        const recommendations = Array.isArray(this.model.recommendations) ? this.model.recommendations : [];
        if (recommendations.length) {
            target.innerHTML = recommendations.map((item) => this.card(item.title, item.recommendation, "Strategic Recommendation", this.implementationMarkup(item))).join("");
            return;
        }
        target.innerHTML = this.baseRecommendations().map(([title, body]) => this.card(title, body, "Strategic Recommendation")).join("");
    }

    baseRoadmap() {
        return [
            ["0–30 days", "Confirm statutory applicability, validate workforce numbers and close critical documentation gaps."],
            ["31–60 days", "Publish core policies, assign compliance owners and standardise onboarding and employee records."],
            ["61–90 days", "Launch manager routines, quarterly people review metrics and a practical workforce planning cadence."],
            ["90+ days", "Digitise repeatable HR processes and refresh the advisory as the organisation scales or expands locations."]
        ];
    }

    generateRoadmap() {
        const roadmap = this.model.roadmap;
        const source = roadmap
            ? [
                ["0–30 days", (roadmap.first30 || []).join(" ")],
                ["31–60 days", (roadmap.next60 || []).join(" ")],
                ["61–90 days", (roadmap.next90 || []).join(" ")],
                ["90+ days", "Review outcomes, digitise stable processes and refresh the advisory after material organisational change."]
            ]
            : this.baseRoadmap();
        this.renderCards("roadmapContainer", source, "Executive Roadmap");
    }

    baseCompliance() {
        const data = this.reportData;
        const items = [
            ["Employment records", "Maintain appointment letters, identity records, attendance, leave and wage documentation for all worker categories."],
            ["State-specific labour obligations", `Review Shops & Establishments or applicable local registrations for ${this.text(data.primaryState || data.state, "the primary state")}.`]
        ];
        if (this.employeeCount() >= 20) items.push(["Provident Fund review", "Validate EPF registration, eligibility, contributions and monthly filing discipline."]);
        if (this.employeeCount() >= 10) items.push(["ESI and gratuity applicability", "Review ESI eligibility and gratuity readiness based on employee count, wages and tenure profile."]);
        if (this.number(data.contractWorkers) > 0) items.push(["Contract workforce governance", "Confirm contractor documentation, principal employer responsibilities and compliance evidence."]);
        if (this.number(data.apprentices) > 0) items.push(["Apprenticeship governance", "Review apprenticeship agreements, records and applicable statutory requirements."]);
        return items;
    }

    generateComplianceReview() {
        const source = Array.isArray(this.model.compliance)
            ? this.model.compliance.map((body, index) => [`Review area ${index + 1}`, body])
            : this.baseCompliance();
        this.renderCards("complianceContainer", source, "Compliance Review");
    }

    baseOpportunities() {
        return [
            ["Digital HR foundation", "Digitise employee records, onboarding, leave and basic reporting to improve decision speed and audit readiness."],
            ["Leadership rhythm", "Use monthly people conversations to connect hiring, productivity, retention and compliance to business outcomes."],
            ["Employer trust", "Clear policies and consistent employee communication can improve confidence across employees, managers and investors."]
        ];
    }

    generateStrategicOpportunities() {
        const source = Array.isArray(this.model.opportunities)
            ? this.model.opportunities.map((body, index) => [`Opportunity ${index + 1}`, body])
            : this.baseOpportunities();
        this.renderCards("opportunitiesContainer", source, "Strategic Opportunity");
    }

    generateLookingAhead() {
        const target = document.getElementById("lookingAheadText") || document.querySelector("#lookingAhead p");
        if (!target) return;
        target.textContent = `As the organisation grows, people decisions should become more intentional, documented and leadership-owned. Revisit this advisory whenever headcount, locations, funding stage or operating model materially changes. Current workforce: ${this.employeeLabel()}.`;
    }

    renderCards(containerId, items, meta) {
        const container = this.ids[containerId];
        if (container) container.innerHTML = items.filter(([, body]) => body).map(([title, body]) => this.card(title, body, meta)).join("");
    }

    bindDownload() {
        document.querySelectorAll("[data-action='download-pdf'], #downloadPdf, #downloadReport").forEach((button) => {
            if (button.dataset?.reportDownloadBound === "true") return;
            if (button.dataset) button.dataset.reportDownloadBound = "true";
            button.addEventListener("click", async () => {
                if (window.GrowWithHRPDF?.downloadAdvisoryPdf) {
                    await window.GrowWithHRPDF.downloadAdvisoryPdf({ report: this.reportData });
                } else {
                    window.print();
                }
            });
        });
    }
}
