import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";
import { generateOrganizationStructurePdf } from "./organization-structure-pdf.mjs";

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
            managerRole: "player-coach",
            workComplexity: "complex",
            workStandardization: "mixed",
            teamIndependence: "mixed",
            coachingIntensity: "high",
            roleClarity: "mixed",
            decisionRights: "mixed",
            governanceCadence: "ad-hoc",
            coordinationFriction: "some",
            founderDecisions: "Senior hiring, pricing exceptions, major spend and selected customer commitments",
            expansion: "Planned hiring to 110 employees and expansion of customer operations into another location",
            confirmedAt: new Date().toISOString()
        }
    };
    const analysis = analyzeOrganizationStructure(data);
    analysis.reportModel.reportId = "SAMPLE-GWHR-ORG-001";
    return {
        sample: true,
        reportId: "SAMPLE-GWHR-ORG-001",
        data,
        analysis,
        reportModel: analysis.reportModel
    };
}

function payloadFromPage() {
    const params = new URLSearchParams(location.search);
    if (params.get("sample") === "1" || params.get("sample") === "organization") return samplePayload();
    const stored = readStoredReport();
    if (stored?.analysis && !stored.reportModel) stored.reportModel = stored.analysis.reportModel;
    if (stored?.reportModel && stored.reportId) stored.reportModel.reportId = stored.reportId;
    return stored;
}

function reportModel(payload) {
    return payload?.reportModel || payload?.analysis?.reportModel || {};
}

function statusCards(model) {
    return STATUS_ORDER.map((status) => `
        <article class="org-panel org-status-card">
            <strong>${escapeHtml(model.statusSummary?.[status] || 0)}</strong>
            <span>${escapeHtml(STATUS_LABELS[status])}</span>
        </article>
    `).join("");
}

function metric(label, value) {
    return `<article class="org-panel org-metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`;
}

function sourceBlock(item) {
    const sources = Array.isArray(item?.sources) ? item.sources : [];
    const ruleId = item?.ruleId || item?.id || "Unrecorded rule";
    return `
        <div class="org-source-block">
            <h4>Basis & Sources</h4>
            <p class="org-rule-id"><strong>GrowWithHR rule:</strong> ${escapeHtml(ruleId)}${item?.ruleVersion ? ` · v${escapeHtml(item.ruleVersion)}` : ""}${item?.ruleLastReviewed ? ` · reviewed ${escapeHtml(item.ruleLastReviewed)}` : ""}</p>
            <p class="org-rule-basis">${escapeHtml(item?.ruleBasis || "No rule basis recorded.")}</p>
            <ul class="org-source-list">
                ${sources.map((source) => `
                    <li>
                        <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)} ↗</a>
                        <small>${escapeHtml(source.publisher)} · ${escapeHtml(source.section)} · ${escapeHtml(source.access)}</small>
                        <small><strong>What this source supports:</strong> ${escapeHtml(source.supports)}</small>
                    </li>
                `).join("") || "<li><small>No public source is currently attached to this rule.</small></li>"}
            </ul>
            <small class="org-source-disclosure">The public source supports the underlying organization-design principle. GrowWithHR remains responsible for the disclosed deterministic interpretation above.</small>
        </div>
    `;
}

function renderOverview(payload) {
    const { analysis, data, reportId, sample, persistenceWarning } = payload;
    const model = reportModel(payload);
    const facts = analysis.facts;
    const metrics = model.metrics || {};
    const primary = model.primaryConstraint;
    const priorities = model.priorities || [];
    const expected = metrics.expectedEmployees12Months ?? "Not provided";
    const managers = metrics.peopleManagers ?? "Not provided";
    const ratio = metrics.currentEmployeeToManagerRatio === null || metrics.currentEmployeeToManagerRatio === undefined ? "Not available" : `${metrics.currentEmployeeToManagerRatio}:1`;
    const primaryFinding = primary ? analysis.findings.find((item) => item.id === primary.id) : null;
    const contextBand = String(metrics.managementContextBand || "Not enough context").replaceAll("-", " ");

    document.getElementById("screen-overview").innerHTML = `
        ${sample ? '<div class="org-banner"><strong>Illustrative sample:</strong> fictional company data is being used to demonstrate the Organization Structure report. No sample download or view activity is sent to HRTechifyed.</div>' : ""}
        ${persistenceWarning ? `<div class="org-banner"><strong>Save warning:</strong> ${escapeHtml(persistenceWarning)} Your analysis is still available in this browser.</div>` : ""}
        <article class="org-panel">
            <div class="org-kicker">Executive Summary</div>
            <h2 style="margin:13px 0 8px">${escapeHtml(model.executiveSummary || "No executive summary is available.")}</h2>
            <p class="org-subtle">Company: ${escapeHtml(model.company?.name || facts.companyName || data?.shared?.companyName || "Not provided")} · Report ID: ${escapeHtml(reportId || "Local analysis")}</p>
            <div class="org-evidence-note"><strong>Framework used:</strong> ${escapeHtml(model.framework?.name || analysis.methodology?.name)} v${escapeHtml(model.framework?.version || analysis.methodology?.version)} · ${escapeHtml(model.framework?.access || "Free public methodology")}. Every detailed finding shows the exact public source supporting the principle and separately shows the GrowWithHR rule used to interpret your facts. <a class="org-link" href="organization-structure-methodology.html" target="_blank" rel="noopener">Read the framework & sources ↗</a></div>
        </article>

        <div class="org-summary-grid">${statusCards(model)}</div>

        <h2>Key structural metrics</h2>
        <div class="org-metric-grid">
            ${metric("Employees", metrics.employees ?? facts.employees ?? "Not provided")}
            ${metric("People managers", managers)}
            ${metric("Current employees per manager", ratio)}
            ${metric("12-month planned headcount", expected)}
        </div>
        <p class="org-subtle" style="margin-top:10px">Management-capacity context: ${escapeHtml(contextBand)}. GrowWithHR considers the ratio together with work complexity, standardization, manager role, team independence, coaching intensity and location context.</p>

        <div class="org-overview-grid">
            <article class="org-panel org-primary-constraint">
                <div class="org-kicker">Primary Constraint</div>
                <h2 style="margin:12px 0 8px">${escapeHtml(primary?.title || "No immediate structural constraint")}</h2>
                <p>${escapeHtml(primary?.whyItMatters || "No immediate structural trigger was identified from the supplied facts.")}</p>
                ${primaryFinding ? sourceBlock(primaryFinding) : ""}
            </article>
            <article class="org-panel">
                <div class="org-kicker">Top Priorities</div>
                <h2 style="margin:12px 0">What to focus on next</h2>
                <ol class="org-priority-list">
                    ${priorities.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span class="org-subtle">${escapeHtml(item.action)}</span></li>`).join("") || "<li>No immediate priority was generated.</li>"}
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
        <h2 style="margin:12px 0 8px">See what triggered each result, why it matters, what to do, and exactly what supports the recommendation.</h2>
        <p class="org-subtle">A public source supports the organization-design principle. The GrowWithHR rule explains how that principle was applied to your facts. Prototype guardrails are disclosed as GrowWithHR rules rather than presented as universal external benchmarks.</p>
        <div class="org-findings-list" style="margin-top:18px">
            ${analysis.findings.map((item) => `
                <article class="org-finding">
                    <div class="org-finding-top">
                        <div>
                            <span class="org-status org-status--${escapeHtml(item.status)}">${escapeHtml(STATUS_LABELS[item.status] || item.status)}</span>
                            <h3>${escapeHtml(item.title)}</h3>
                        </div>
                        <small class="org-subtle">Evidence/input confidence: ${escapeHtml(item.confidence)}</small>
                    </div>
                    <p>${escapeHtml(item.whyItMatters)}</p>
                    <p><strong>What to do next:</strong> ${escapeHtml(item.action)}</p>
                    <p><strong>Reassess when:</strong> ${escapeHtml(item.growthTrigger)}</p>
                    <p class="org-subtle"><strong>Confidence meaning:</strong> ${escapeHtml(item.confidenceMeaning || "Confidence reflects fact completeness and the deterministic rule path, not statistical certainty.")}</p>
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
    const model = reportModel(payload);
    const facts = analysis.facts;
    const scenario = model.scenario || analysis.scenario;
    const currentRatio = model.metrics?.currentEmployeeToManagerRatio;
    const projectedRatio = scenario.projectedEmployeeToManagerRatio;
    const priorities = model.priorities || [];

    document.getElementById("screen-scenario").innerHTML = `
        <div class="org-kicker">12-Month Growth Scenario</div>
        <h2 style="margin:12px 0 8px">What changes if headcount grows as planned and manager count stays the same?</h2>
        <p class="org-subtle">This is a deterministic planning scenario based on your assumptions. It is not a forecast.</p>

        <div class="org-scenario-grid">
            <article class="org-panel">
                <div class="org-kicker">Today</div>
                <h3 style="margin:12px 0 6px">Current structure</h3>
                <div class="org-scenario-number">${escapeHtml(facts.employees ?? "—")} employees</div>
                <p>${escapeHtml(facts.peopleManagerCount ?? "—")} people managers · ${escapeHtml(currentRatio === null || currentRatio === undefined ? "Ratio unavailable" : `${currentRatio}:1 employees per manager`)}</p>
            </article>
            <article class="org-panel">
                <div class="org-kicker">12-Month Assumption</div>
                <h3 style="margin:12px 0 6px">If manager count is unchanged</h3>
                <div class="org-scenario-number">${escapeHtml(facts.expectedEmployees12Months ?? "—")} employees</div>
                <p>${escapeHtml(facts.peopleManagerCount ?? "—")} people managers · ${escapeHtml(projectedRatio === null || projectedRatio === undefined ? "Ratio unavailable" : `${projectedRatio}:1 employees per manager`)} · ${escapeHtml(STATUS_LABELS[scenario.projectedStatus] || scenario.projectedStatus || "Needs information")}</p>
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
                    <p class="org-subtle">Rule ${escapeHtml(item.id)} v${escapeHtml(item.ruleVersion)}</p>
                </article>
            `).join("")}
        </div>

        <div class="org-actions">
            <button class="org-secondary" type="button" data-next="findings">← Detailed Findings</button>
            <button class="org-primary" type="button" id="downloadReportBottom">Download Full PDF</button>
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

function apiBase() {
    return location.origin === "https://hrtechifyed.github.io" ? "https://growwithhr.onrender.com" : "";
}

function deliveryStatus(message, isError = false) {
    const element = document.getElementById("reportDeliveryStatus");
    if (!element) return;
    element.hidden = false;
    element.textContent = message;
    element.classList.toggle("is-error", Boolean(isError));
}

function activityEvent(payload, event, filename) {
    if (payload.sample) return;
    const model = reportModel(payload);
    const body = {
        event: {
            event,
            companyName: model.company?.name || payload.analysis?.facts?.companyName,
            email: model.company?.email || payload.analysis?.facts?.email || payload.data?.shared?.email,
            reportId: payload.reportId || model.reportId,
            filename,
            framework: model.framework?.name,
            frameworkVersion: model.framework?.version,
            occurredAt: new Date().toISOString()
        }
    };
    fetch(`${apiBase()}/api/organization-report/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true
    }).catch(() => {});
}

async function downloadPdf(payload) {
    const button = document.getElementById("downloadReport");
    const bottom = document.getElementById("downloadReportBottom");
    [button, bottom].filter(Boolean).forEach((item) => { item.disabled = true; });
    deliveryStatus("Preparing your branded Organization Structure PDF…");
    try {
        const result = await generateOrganizationStructurePdf(payload, { mode: "download" });
        deliveryStatus(`Your Organization Structure PDF download has started: ${result.filename}`);
        activityEvent(payload, "downloaded", result.filename);
    } catch (error) {
        console.error("Organization Structure PDF generation failed.", error);
        deliveryStatus(error.message || "We could not prepare the Organization Structure PDF.", true);
    } finally {
        [button, bottom].filter(Boolean).forEach((item) => { item.disabled = false; });
    }
}

async function emailPdf(payload) {
    if (payload.sample) return;
    const model = reportModel(payload);
    const recipient = model.company?.email || payload.analysis?.facts?.email || payload.data?.shared?.email;
    if (!recipient) {
        deliveryStatus("No report email address is available. Return to the assessment and provide a work email.", true);
        return;
    }
    const button = document.getElementById("emailReport");
    button.disabled = true;
    deliveryStatus(`Preparing the PDF and sending it to ${recipient}…`);
    try {
        const pdf = await generateOrganizationStructurePdf(payload, { mode: "base64" });
        const methodologyUrl = new URL(model.framework?.methodologyUrl || "organization-structure-methodology.html", location.href).href;
        const response = await fetch(`${apiBase()}/api/organization-report/deliver`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lead: { email: recipient, companyName: model.company?.name || payload.analysis?.facts?.companyName },
                report: {
                    recipientEmail: recipient,
                    companyName: model.company?.name || payload.analysis?.facts?.companyName,
                    reportId: payload.reportId || model.reportId,
                    reportType: "organization-structure",
                    frameworkName: model.framework?.name,
                    frameworkVersion: model.framework?.version,
                    methodologyUrl
                },
                pdf: { filename: pdf.filename, base64: pdf.base64 }
            })
        });
        let body = {};
        try { body = await response.json(); } catch (_error) {}
        if (!response.ok || body.ok === false) throw new Error(body.error || "The Organization Structure report email could not be sent.");
        deliveryStatus(`Organization Structure report emailed to ${recipient}. HRTechifyed received the operational delivery metadata notification${body.internalSent ? "." : " when configured."}`);
    } catch (error) {
        console.error("Organization Structure email delivery failed.", error);
        deliveryStatus(error.message || "The Organization Structure report email could not be sent.", true);
    } finally {
        button.disabled = false;
    }
}

function bindNavigation(payload) {
    document.querySelectorAll(".org-step").forEach((button) => button.addEventListener("click", () => setStep(button.dataset.step)));
    document.addEventListener("click", (event) => {
        const next = event.target.closest("[data-next]");
        if (next) setStep(next.dataset.next);
        if (event.target.closest("#downloadReportBottom")) downloadPdf(payload);
    });
    document.getElementById("printReport")?.addEventListener("click", () => window.print());
    document.getElementById("downloadReport")?.addEventListener("click", () => downloadPdf(payload));
    document.getElementById("emailReport")?.addEventListener("click", () => emailPdf(payload));
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
    document.getElementById("downloadReport").hidden = true;
    document.getElementById("emailReport").hidden = true;
}

const payload = payloadFromPage();
if (!payload?.analysis) {
    renderFailure();
} else {
    const model = reportModel(payload);
    const companyName = model.company?.name || payload.analysis.facts.companyName || payload.data?.shared?.companyName || "your company";
    document.getElementById("reportSubtitle").textContent = `See where ${companyName}'s structure, reporting lines and decision-making may create friction as the company grows.`;
    if (payload.sample) {
        document.getElementById("emailReport").hidden = true;
        document.getElementById("downloadReport").textContent = "Download Sample PDF";
    }
    renderOverview(payload);
    renderFindings(payload);
    renderScenario(payload);
    bindNavigation(payload);
    const initial = ["overview", "findings", "scenario"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
    setStep(initial);
}
