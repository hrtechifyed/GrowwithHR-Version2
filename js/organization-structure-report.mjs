import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";

const REPORT_KEY = "growwithhr.organization.report";
const STATUS_ORDER = ["action", "watch", "stable", "needs-information"];
const STATUS_LABELS = {
    action: "Action",
    watch: "Watch",
    stable: "Stable",
    "needs-information": "Needs information"
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function readStoredReport() {
    try {
        return JSON.parse(sessionStorage.getItem(REPORT_KEY) || "null");
    } catch (_error) {
        return null;
    }
}

function samplePayload() {
    const data = {
        shared: {
            companyName: "Northstar Labs (Sample)",
            email: "sample@example.com",
            industry: "Technology",
            growthStage: "Scaling",
            employees: 86,
            expectedEmployees: 110
        },
        workforce: {
            totalEmployees: 86,
            expectedEmployees12Months: 110
        },
        geography: {
            operatingLocationCount: 2
        },
        organization: {
            peopleManagerCount: 11,
            reportingLevels: 2,
            founderDirectReports: 9,
            departments: ["Product", "Engineering", "Sales", "Customer Success", "Finance", "People"],
            roleClarity: "mixed",
            decisionRights: "mixed",
            governanceCadence: "ad-hoc",
            coordinationFriction: "some",
            founderDecisions: "Senior hiring, pricing exceptions, major spend and selected customer commitments",
            expansion: "Planned hiring to 110 employees and expansion of customer operations",
            confirmedAt: new Date().toISOString()
        }
    };
    return {
        sample: true,
        reportId: "SAMPLE-GWHR-ORG-001",
        data,
        analysis: analyzeOrganizationStructure(data)
    };
}

function payloadFromPage() {
    const params = new URLSearchParams(location.search);
    if (params.get("sample") === "1" || params.get("sample") === "organization") return samplePayload();
    return readStoredReport();
}

function priorityFindings(analysis, limit = 3) {
    const rank = { action: 0, watch: 1, "needs-information": 2, stable: 3 };
    return [...analysis.findings]
        .sort((a, b) => rank[a.status] - rank[b.status])
        .slice(0, limit);
}

function primaryConstraint(analysis) {
    return priorityFindings(analysis, 1)[0] || null;
}

function executiveSummary(analysis) {
    const primary = primaryConstraint(analysis);
    const actionCount = analysis.statusSummary.action || 0;
    const watchCount = analysis.statusSummary.watch || 0;
    if (!primary) return "No structural finding is available yet.";
    if (actionCount > 0) {
        return `Your structure has ${actionCount} area${actionCount === 1 ? "" : "s"} requiring action and ${watchCount} watchpoint${watchCount === 1 ? "" : "s"}. The clearest current constraint is ${primary.title.toLowerCase()}.`;
    }
    if (watchCount > 0) {
        return `Your current structure is broadly workable, with ${watchCount} scaling watchpoint${watchCount === 1 ? "" : "s"}. The main area to monitor is ${primary.title.toLowerCase()}.`;
    }
    return "Your supplied structural facts do not create an immediate GrowWithHR action or watch trigger. Reassess when headcount, reporting lines, locations or decision ownership change materially.";
}

function statusCards(analysis) {
    return STATUS_ORDER.map((status) => `
        <article class="org-panel org-status-card">
            <strong>${escapeHtml(analysis.statusSummary[status] || 0)}</strong>
            <span>${escapeHtml(STATUS_LABELS[status])}</span>
        </article>
    `).join("");
}

function metric(label, value) {
    return `<article class="org-panel org-metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`;
}

function sourceBlock(item) {
    const sources = Array.isArray(item.sources) ? item.sources : [];
    return `
        <div class="org-source-block">
            <h4>Source basis</h4>
            <p class="org-rule-basis"><strong>GrowWithHR rule:</strong> ${escapeHtml(item.ruleBasis || "No rule basis recorded.")}</p>
            <ul class="org-source-list">
                ${sources.map((source) => `
                    <li>
                        <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)} ↗</a>
                        <small>${escapeHtml(source.publisher)} · ${escapeHtml(source.section)} · ${escapeHtml(source.access)}</small>
                        <small>${escapeHtml(source.supports)}</small>
                    </li>
                `).join("") || "<li><small>No public source is currently attached to this rule.</small></li>"}
            </ul>
        </div>
    `;
}

function renderOverview(payload) {
    const { analysis, data, reportId, sample, persistenceWarning } = payload;
    const facts = analysis.facts;
    const metrics = analysis.derivedMetrics;
    const primary = primaryConstraint(analysis);
    const priorities = priorityFindings(analysis, 3);
    const expected = facts.expectedEmployees12Months === null ? "Not provided" : facts.expectedEmployees12Months;
    const managers = facts.peopleManagerCount === null ? "Not provided" : facts.peopleManagerCount;
    const ratio = metrics.currentEmployeeToManagerRatio === null ? "Not available" : `${metrics.currentEmployeeToManagerRatio}:1`;

    document.getElementById("screen-overview").innerHTML = `
        ${sample ? '<div class="org-banner"><strong>Illustrative sample:</strong> fictional company data is being used to demonstrate the Organization Structure report.</div>' : ""}
        ${persistenceWarning ? `<div class="org-banner"><strong>Save warning:</strong> ${escapeHtml(persistenceWarning)} Your analysis is still available in this browser.</div>` : ""}
        <article class="org-panel">
            <div class="org-kicker">Executive Summary</div>
            <h2 style="margin:13px 0 8px">${escapeHtml(executiveSummary(analysis))}</h2>
            <p class="org-subtle">Company: ${escapeHtml(facts.companyName || data?.shared?.companyName || "Not provided")} · Report ID: ${escapeHtml(reportId || "Local analysis")}</p>
            <div class="org-evidence-note"><strong>How this was decided:</strong> GrowWithHR applied deterministic structural rules to the facts you supplied. Each detailed finding shows the exact public source supporting the principle and separately shows the GrowWithHR rule used to interpret your facts. <a class="org-link" href="organization-structure-methodology.html" target="_blank" rel="noopener">Read the methodology ↗</a></div>
        </article>

        <div class="org-summary-grid">${statusCards(analysis)}</div>

        <h2>Key structural metrics</h2>
        <div class="org-metric-grid">
            ${metric("Employees", facts.employees ?? "Not provided")}
            ${metric("People managers", managers)}
            ${metric("Current employees per manager", ratio)}
            ${metric("12-month planned headcount", expected)}
        </div>

        <div class="org-overview-grid">
            <article class="org-panel org-primary-constraint">
                <div class="org-kicker">Primary Constraint</div>
                <h2 style="margin:12px 0 8px">${escapeHtml(primary?.title || "No immediate structural constraint")}</h2>
                <p>${escapeHtml(primary?.whyItMatters || "No immediate structural trigger was identified from the supplied facts.")}</p>
                ${primary ? sourceBlock(primary) : ""}
            </article>
            <article class="org-panel">
                <div class="org-kicker">Top Priorities</div>
                <h2 style="margin:12px 0">What to focus on next</h2>
                <ol class="org-priority-list">
                    ${priorities.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span class="org-subtle">${escapeHtml(item.action)}</span></li>`).join("")}
                </ol>
            </article>
        </div>

        <div class="org-actions">
            <button class="org-primary" type="button" data-next="findings">View Detailed Findings →</button>
        </div>
    `;
}

function renderFindings(payload) {
    const { analysis } = payload;
    document.getElementById("screen-findings").innerHTML = `
        <div class="org-kicker">Detailed Structural Findings</div>
        <h2 style="margin:12px 0 8px">See what is working, what needs attention, and what supports each recommendation.</h2>
        <p class="org-subtle">A public source supports the organization-design principle. The GrowWithHR rule explains how that principle was applied to your facts. Where a numeric trigger is proprietary to this prototype, it is disclosed as such.</p>
        <div class="org-findings-list" style="margin-top:18px">
            ${analysis.findings.map((item) => `
                <article class="org-finding">
                    <div class="org-finding-top">
                        <div>
                            <span class="org-status org-status--${escapeHtml(item.status)}">${escapeHtml(STATUS_LABELS[item.status] || item.status)}</span>
                            <h3>${escapeHtml(item.title)}</h3>
                        </div>
                        <small class="org-subtle">Confidence in supplied facts/rule path: ${escapeHtml(item.confidence)}</small>
                    </div>
                    <p>${escapeHtml(item.whyItMatters)}</p>
                    <p><strong>What to do next:</strong> ${escapeHtml(item.action)}</p>
                    <p><strong>Reassess when:</strong> ${escapeHtml(item.growthTrigger)}</p>
                    ${sourceBlock(item)}
                    <details class="org-facts">
                        <summary>Facts used and missing information</summary>
                        <ul>${(item.factsUsed || []).map((fact) => `<li>${escapeHtml(fact)}</li>`).join("") || "<li>No confirmed fact used yet.</li>"}</ul>
                        ${(item.missingFacts || []).length ? `<p><strong>Missing:</strong> ${item.missingFacts.map(escapeHtml).join(", ")}</p>` : ""}
                    </details>
                </article>
            `).join("")}
        </div>
        <div class="org-actions">
            <button class="org-secondary" type="button" data-next="overview">← Executive Overview</button>
            <button class="org-primary" type="button" data-next="scenario">View 12-Month Growth Scenario →</button>
        </div>
    `;
}

function renderScenario(payload) {
    const { analysis } = payload;
    const facts = analysis.facts;
    const scenario = analysis.scenario;
    const currentRatio = analysis.derivedMetrics.currentEmployeeToManagerRatio;
    const projectedRatio = scenario.projectedEmployeeToManagerRatio;
    const priorities = priorityFindings(analysis, 3);

    document.getElementById("screen-scenario").innerHTML = `
        <div class="org-kicker">12-Month Growth Scenario</div>
        <h2 style="margin:12px 0 8px">What changes if headcount grows as planned and manager count stays the same?</h2>
        <p class="org-subtle">This is a deterministic planning scenario based on your assumptions. It is not a forecast.</p>

        <div class="org-scenario-grid">
            <article class="org-panel">
                <div class="org-kicker">Today</div>
                <h3 style="margin:12px 0 6px">Current structure</h3>
                <div class="org-scenario-number">${escapeHtml(facts.employees ?? "—")} employees</div>
                <p>${escapeHtml(facts.peopleManagerCount ?? "—")} people managers · ${escapeHtml(currentRatio === null ? "Ratio unavailable" : `${currentRatio}:1 employees per manager`)}</p>
            </article>
            <article class="org-panel">
                <div class="org-kicker">12-Month Assumption</div>
                <h3 style="margin:12px 0 6px">If manager count is unchanged</h3>
                <div class="org-scenario-number">${escapeHtml(facts.expectedEmployees12Months ?? "—")} employees</div>
                <p>${escapeHtml(facts.peopleManagerCount ?? "—")} people managers · ${escapeHtml(projectedRatio === null ? "Ratio unavailable" : `${projectedRatio}:1 employees per manager`)}</p>
            </article>
        </div>

        <article class="org-scenario-callout">
            <div class="org-kicker">What This Means</div>
            <h2 style="margin:12px 0 8px">${escapeHtml(scenario.interpretation)}</h2>
            <p>${escapeHtml(scenario.disclaimer)}</p>
            ${sourceBlock(scenario)}
        </article>

        <h2 style="margin-top:28px">Recommended structural changes to review before the next hiring wave</h2>
        <div class="org-roadmap">
            ${priorities.map((item, index) => `
                <article class="org-panel">
                    <div class="org-kicker">Priority ${index + 1}</div>
                    <h3 style="margin:12px 0 8px">${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.action)}</p>
                </article>
            `).join("")}
        </div>

        <div class="org-actions">
            <button class="org-secondary" type="button" data-next="findings">← Detailed Findings</button>
            <button class="org-primary" type="button" id="printReportBottom">Print / Save Full Report</button>
        </div>
    `;
}

function setStep(step) {
    document.querySelectorAll("[data-screen]").forEach((screen) => {
        screen.hidden = screen.dataset.screen !== step;
    });
    document.querySelectorAll(".org-step").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.step === step);
        button.setAttribute("aria-current", button.dataset.step === step ? "step" : "false");
    });
    history.replaceState(null, "", `#${step}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindNavigation() {
    document.querySelectorAll(".org-step").forEach((button) => button.addEventListener("click", () => setStep(button.dataset.step)));
    document.addEventListener("click", (event) => {
        const next = event.target.closest("[data-next]");
        if (next) setStep(next.dataset.next);
        if (event.target.closest("#printReportBottom")) window.print();
    });
    document.getElementById("printReport")?.addEventListener("click", () => window.print());
}

function renderFailure() {
    document.getElementById("reportSubtitle").textContent = "We could not find a completed Organization Structure analysis in this browser.";
    document.getElementById("screen-overview").innerHTML = `
        <article class="org-panel">
            <h2>No Organization Structure report found</h2>
            <p>Complete the Organization Structure assessment first, or open the illustrative sample.</p>
            <div class="org-actions">
                <a class="org-primary" href="organization-intelligence.html">Start Organization Structure</a>
                <a class="org-secondary" href="organization-structure-report.html?sample=1">View Sample Report</a>
            </div>
        </article>
    `;
    document.querySelector(".org-stepper").hidden = true;
}

const payload = payloadFromPage();
if (!payload?.analysis) {
    renderFailure();
} else {
    const companyName = payload.analysis.facts.companyName || payload.data?.shared?.companyName || "your company";
    document.getElementById("reportSubtitle").textContent = `See where ${companyName}'s structure, reporting lines and decision-making may create friction as the company grows.`;
    renderOverview(payload);
    renderFindings(payload);
    renderScenario(payload);
    bindNavigation();
    const initial = ["overview", "findings", "scenario"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
    setStep(initial);
}
