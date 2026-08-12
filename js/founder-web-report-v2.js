/* GrowWithHR founder-facing web report: deterministic founder intelligence */
(() => {
    "use strict";

    const VERSION = "3.0.0-founder-intelligence-web";
    const STORAGE_KEY = "growwithhr-report";
    const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
    const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
    const RENDER_ORIGIN = "https://growwithhr.onrender.com";
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const list = (value) => Array.isArray(value) ? value : [];
    const esc = (value) => clean(value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    function loadReport() {
        try { return JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || "{}"); }
        catch (_error) { return {}; }
    }

    function saveReport(data = {}) {
        window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function statusLabel(status) {
        if (status === "Applicable") return "Relevant now";
        if (status === "Needs information") return "More information required";
        if (status === "Review required") return "Review needed";
        return "Watch as you grow";
    }

    function statusClass(status) {
        if (status === "Applicable") return "is-relevant";
        if (status === "Needs information") return "is-missing";
        if (status === "Review required") return "is-review";
        return "is-watch";
    }

    const rowName = (row = {}) => clean(row.shortTitle || row.title, "Compliance area");
    const sourceUrl = (row = {}) => clean(row.url || row.officialUrl || row.sourceUrl || row.statePortalUrl || row.officialSourceUrl || row.legalSourceUrl);

    function injectStyles() {
        if (document.getElementById("gwhFounderIntelligenceStyles")) return;
        const style = document.createElement("style");
        style.id = "gwhFounderIntelligenceStyles";
        style.textContent = `
            .gwh-intel-grid{display:grid;gap:16px}.gwh-intel-card{border:1px solid #dbe2ea;border-radius:12px;padding:18px;background:#fff}.gwh-intel-card h3{margin-top:0}.gwh-intel-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.gwh-intel-meta div{background:#f7f9fc;border-radius:8px;padding:10px}.gwh-intel-meta dt{font-size:.75rem;font-weight:700;text-transform:uppercase;color:#5d6d81}.gwh-intel-meta dd{margin:4px 0 0}.gwh-intel-form{display:grid;gap:14px}.gwh-intel-field{display:grid;gap:6px}.gwh-intel-field input,.gwh-intel-field select{max-width:560px;padding:10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:inherit}.gwh-intel-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.gwh-intel-secondary{border:1px solid #1e3a5f;background:#fff;color:#1e3a5f;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}.gwh-intel-secondary:disabled{opacity:.55;cursor:wait}.gwh-intel-result{margin-top:14px;padding:14px;border-radius:9px;background:#f7f9fc}.gwh-intel-change{padding:12px 0;border-bottom:1px solid #dbe2ea}.gwh-intel-change:last-child{border-bottom:0}.gwh-intel-q{display:grid;gap:10px;margin-top:12px}.gwh-intel-q select{padding:9px;border:1px solid #cbd5e1;border-radius:8px}.gwh-intel-error{border-left:4px solid #b91c1c;padding:10px 12px;background:#fff7f7}.gwh-intel-note{font-size:.9rem;color:#5d6d81}.gwh-intel-lineage{font-size:.85rem;color:#5d6d81;margin-top:4px}@media(max-width:640px){.gwh-intel-actions{display:grid}.gwh-intel-actions button{width:100%}}
        `;
        document.head.appendChild(style);
    }

    function companyRows(data = {}) {
        const states = Array.isArray(data.operatingStates) ? data.operatingStates.join(", ") : clean(data.operatingStates);
        return [
            ["Company", clean(data.companyName, "Your Organisation")],
            ["Legal structure", clean(data.entity || data.establishmentType)],
            ["Industry", clean(data.customIndustry || data.industry)],
            ["Primary State / location", clean(data.primaryState || data.state)],
            ["Operating States", states],
            ["Employees", clean(data.employees || data.employeeCount || data.headcount)],
            ["Women employees", clean(data.womenEmployees || data.femaleEmployees || data.hasWomenEmployees)],
            ["Contractors", clean(data.contractors || data.contractWorkers || data.contractorCount)],
            ["Workers", clean(data.workers || data.workerCount || data.workmen)],
            ["Working model", clean(data.workModel)]
        ].filter(([, value]) => value);
    }

    function facts(row = {}, data = {}) {
        const values = [];
        list(row.companyFactsUsed).forEach((item) => values.push(clean(item)));
        if (clean(row.thresholdResult?.positionText || row.trigger?.currentPosition)) values.push(clean(row.thresholdResult?.positionText || row.trigger?.currentPosition));
        if (clean(data.primaryState || data.state)) values.push(`Primary State / location: ${clean(data.primaryState || data.state)}`);
        if (clean(data.entity || data.establishmentType)) values.push(`Establishment / legal structure: ${clean(data.entity || data.establishmentType)}`);
        return [...new Set(values.filter(Boolean))].slice(0, 5);
    }

    function group(title, rows, description) {
        if (!rows.length) return "";
        return `<section class="gwh-web-block"><h3>${esc(title)}</h3><p class="gwh-web-muted">${esc(description)}</p><div class="gwh-web-list">${rows.map((row) => `<article class="gwh-web-finding"><div class="gwh-web-finding__top"><h4>${esc(rowName(row))}</h4><span class="gwh-web-status ${statusClass(row.status)}">${esc(statusLabel(row.status))}</span></div><p>${esc(clean(row.trigger?.explanation || row.thresholdResult?.explanation || row.whyIncluded, "The supplied company facts caused this deterministic result."))}</p></article>`).join("")}</div></section>`;
    }

    function obligationCard(item = {}, data = {}) {
        const url = clean(item.sourceReference || sourceUrl(item));
        const internal = list(item.thingsToVerifyInternally);
        return `<article class="gwh-intel-card" id="obligation-${esc(clean(item.findingId).replace(/[^a-z0-9-]/gi, "-").toLowerCase())}">
            <div class="gwh-web-finding__top"><h3>${esc(clean(item.title, "Compliance area"))}</h3><span class="gwh-web-status ${statusClass(item.backendStatus)}">${esc(clean(item.founderLabel, statusLabel(item.backendStatus)))}</span></div>
            <p>${esc(clean(item.whatToUnderstand))}</p>
            <dl class="gwh-intel-meta"><div><dt>Suggested routing</dt><dd>${esc(clean(item.ownerSuggestion, "Founder / HR / Specialist"))}</dd></div><div><dt>Next action</dt><dd>${esc(clean(item.nextAction))}</dd></div><div><dt>Legal review status</dt><dd>Needs legal review</dd></div></dl>
            <h4>Company facts used</h4><ul>${facts(item, data).map((fact) => `<li>${esc(fact)}</li>`).join("") || "<li>Relevant supplied company facts</li>"}</ul>
            <h4>Things to verify internally</h4><ul>${internal.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>
            <p class="gwh-intel-note">These are static verification prompts, not completion tracking. GrowWithHR does not infer whether any item has been completed.</p>
            ${url ? `<a class="gwh-web-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">View reference source →</a>` : ""}
            ${item.ragScope?.featureId ? `<div class="gwh-intel-q" data-rag-obligation="${esc(item.findingId)}"><label><strong>Ask about this fixed finding</strong><select data-founder-question><option value="why">Why does this appear?</option><option value="facts">Which company facts caused it?</option><option value="missing">What information is missing?</option><option value="growth">What changes with growth?</option><option value="source">Which governed source supports the explanation?</option></select></label><div data-deterministic-answer class="gwh-intel-result"></div><button class="gwh-intel-secondary" type="button" data-rag-explain="${esc(item.findingId)}">Get governed source-backed explanation</button><div data-rag-result aria-live="polite"></div><p class="gwh-intel-note">RAG explains the already-fixed result. It cannot change applicability.</p></div>` : ""}
        </article>`;
    }

    function actionList(actions = []) {
        if (!actions.length) return "<p>No founder actions were generated for this snapshot.</p>";
        return `<ol class="gwh-web-steps">${actions.map((action) => `<li><strong>${esc(action.title)}</strong><span>${esc(action.body)}</span><small>Suggested routing: ${esc(action.ownerSuggestion)}</small></li>`).join("")}</ol>`;
    }

    function triggerCard(trigger = {}) {
        const css = trigger.currentState === "review-needed" ? "is-review" : "is-watch";
        return `<article class="gwh-web-simple"><div class="gwh-web-finding__top"><h3>${esc(clean(trigger.title, "Compliance area"))}</h3><span class="gwh-web-status ${css}">${esc(clean(trigger.currentLabel, "Watch as you grow"))}</span></div><dl class="gwh-web-trigger"><div><dt>Current position</dt><dd>${esc(clean(trigger.currentPosition, "Current position recorded by the deterministic rule"))}</dd></div><div><dt>Reassessment point</dt><dd>${esc(clean(trigger.reassessmentPoint, "Reassess after a relevant company change"))}</dd></div><div><dt>Company fact</dt><dd>${esc(clean(trigger.companyFact, "Supported company fact"))}</dd></div><div><dt>Why</dt><dd>${esc(clean(trigger.explanation, "A change in the relevant company facts may change the deterministic result."))}</dd></div></dl></article>`;
    }

    function inputMarkup(item = {}, prefix = "missing") {
        const field = clean(item.field);
        const id = `${prefix}-${field.replace(/[^a-z0-9-]/gi, "-")}`;
        const yesNo = new Set(["indiaOperations", "womenEmployees", "esiWageEligibility", "bonusWageEligibility", "usesPower", "manufacturingOperations"]);
        const numeric = new Set(["employees", "workers", "contractors"]);
        if (yesNo.has(field)) {
            return `<label class="gwh-intel-field" for="${esc(id)}"><strong>${esc(clean(item.question, field))}</strong><select id="${esc(id)}" data-missing-field="${esc(field)}"><option value="">Select an answer</option><option value="yes">Yes</option><option value="no">No</option><option value="not-sure">Not sure</option></select><span class="gwh-intel-note">Could affect: ${esc(list(item.affectedAreas).join(", "))}</span></label>`;
        }
        return `<label class="gwh-intel-field" for="${esc(id)}"><strong>${esc(clean(item.question, field))}</strong><input id="${esc(id)}" data-missing-field="${esc(field)}" ${numeric.has(field) ? 'type="number" min="0" step="1" inputmode="numeric"' : 'type="text"'} autocomplete="off"><span class="gwh-intel-note">Could affect: ${esc(list(item.affectedAreas).join(", "))}</span></label>`;
    }

    function scenarioValueControl(fields = []) {
        const labels = {
            employees: "Employees", workers: "Workers", contractors: "Contractors", indiaOperations: "India operations",
            establishmentType: "Establishment type", primaryState: "Primary State", womenEmployees: "Women employees",
            esiWageEligibility: "ESI wage eligibility", bonusWageEligibility: "Bonus wage eligibility", industry: "Industry",
            workerCategories: "Worker categories", usesPower: "Uses power", manufacturingOperations: "Manufacturing operations"
        };
        return `<div class="gwh-intel-form"><label class="gwh-intel-field"><strong>Company fact to change</strong><select id="scenarioField">${fields.map((field) => `<option value="${esc(field)}">${esc(labels[field] || field)}</option>`).join("")}</select></label><label class="gwh-intel-field"><strong>Scenario value</strong><input id="scenarioValue" type="text" autocomplete="off" aria-describedby="scenarioHint"><span id="scenarioHint" class="gwh-intel-note">Use a number for workforce counts; use yes/no for boolean company facts.</span></label></div>`;
    }

    function diffMarkup(changes = [], unchangedCount = 0) {
        if (!changes.length) return `<p>No deterministic finding changed for this explicit fact change. ${unchangedCount ? `${unchangedCount} finding${unchangedCount === 1 ? " remained" : "s remained"} unchanged.` : ""}</p>`;
        return `${changes.map((change) => `<div class="gwh-intel-change"><strong>${esc(change.title)}</strong><p>${esc(statusLabel(change.before?.backendStatus))} → <strong>${esc(statusLabel(change.after?.backendStatus))}</strong></p><p class="gwh-intel-note">Changed through the deterministic rule engine only.</p></div>`).join("")}${unchangedCount ? `<p class="gwh-intel-note">${unchangedCount} other finding${unchangedCount === 1 ? " remained" : "s remained"} unchanged.</p>` : ""}`;
    }

    async function waitForWebEngine() {
        for (let attempt = 0; attempt < 320; attempt += 1) {
            const pdf = window.GrowWithHRPDF;
            if (typeof pdf?.buildAdvisoryModel === "function" && typeof pdf?.buildReportLawTransparency === "function") {
                if (!window.GrowWithHRCompanyApplicability?.version) await import("./company-applicability-orchestrator-v1.js");
                if (typeof window.GrowWithHRCompanyApplicability?.assess === "function") return pdf;
            }
            await new Promise((resolve) => window.setTimeout(resolve, 25));
        }
        throw new Error("The GrowWithHR assessment engine did not become ready.");
    }

    async function waitForIdentity() {
        for (let attempt = 0; attempt < 480; attempt += 1) {
            if (typeof window.GrowWithHRReportIdentity?.allocate === "function") return window.GrowWithHRReportIdentity;
            await new Promise((resolve) => window.setTimeout(resolve, 25));
        }
        throw new Error("The Report ID allocator is still loading. Please try again.");
    }

    async function waitForFinalPdfEngine() {
        for (let attempt = 0; attempt < 480; attempt += 1) {
            const pdf = window.GrowWithHRPDF;
            if (window.GrowWithHRReportRuntimeBootstrap?.ready && pdf?.singleReportDelivery === true && pdf?.reportStructureVersion === "founder-demo-single-v1" && typeof pdf?.buildAdvisoryPdf === "function") return pdf;
            await new Promise((resolve) => window.setTimeout(resolve, 25));
        }
        throw new Error("The final PDF report engine is still loading. Please try the download again.");
    }

    function parseFieldValue(field, rawValue) {
        const value = clean(rawValue);
        if (!value) return undefined;
        if (["employees", "workers", "contractors"].includes(field)) {
            const parsed = Number(value);
            return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
        }
        if (field === "workerCategories") return value.split(",").map(clean).filter(Boolean);
        if (["indiaOperations", "womenEmployees", "esiWageEligibility", "bonusWageEligibility", "usesPower", "manufacturingOperations"].includes(field)) return value.toLowerCase();
        return value;
    }

    function collectMissingAnswers(root) {
        return Object.fromEntries([...root.querySelectorAll("[data-missing-field]")].map((control) => {
            const field = clean(control.dataset.missingField);
            return [field, parseFieldValue(field, control.value)];
        }).filter(([, value]) => value !== undefined));
    }

    function isGitHubPages() {
        const location = window.location;
        return Boolean(location && location.origin === GITHUB_PAGES_ORIGIN && (location.pathname === "/GrowwithHR-Version2" || location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH)));
    }

    function ragEndpoint(featureId) {
        const route = `/api/legal-explanation/feature/${encodeURIComponent(featureId)}`;
        return isGitHubPages() ? `${RENDER_ORIGIN}${route}` : route;
    }

    function ragAnswers(data = {}) {
        const answers = {};
        Object.entries(data).forEach(([key, value]) => {
            if (["string", "number", "boolean"].includes(typeof value) && clean(value) !== "") answers[key] = value;
        });
        if (answers.locations === undefined) {
            if (Array.isArray(data.operatingStates) && data.operatingStates.length) answers.locations = data.operatingStates.length;
            else if (clean(data.primaryState || data.state)) answers.locations = 1;
        }
        return answers;
    }

    function validateRagResponse(response = {}, obligation = {}) {
        if (response.usedForDecision !== false || response.mayChangeDecision !== false || response.applicabilityAuthority !== "deterministic-only" || response.providerRole !== "explanation-only") {
            throw new Error("The governed explanation response did not preserve deterministic authority boundaries.");
        }
        if (clean(response.lawFamilyId) !== clean(obligation.ragScope?.lawFamilyId)) throw new Error("The explanation response was outside the selected governed law family.");
        return response;
    }

    function ragMarkup(response = {}, fixedLabel = "") {
        const generated = response.explanation?.response || {};
        const citations = list(response.retrieval?.citations);
        return `<div class="gwh-intel-result"><p><strong>Fixed applicability result:</strong> ${esc(fixedLabel)}. This explanation does not change it.</p>${clean(generated.summary) ? `<p>${esc(generated.summary)}</p>` : ""}${list(generated.rationale).length ? `<h4>Why</h4><ul>${list(generated.rationale).map((item) => `<li>${esc(clean(item.statement))}</li>`).join("")}</ul>` : ""}${list(generated.nextSteps).length ? `<h4>Next steps</h4><ul>${list(generated.nextSteps).map((item) => `<li>${esc(typeof item === "string" ? item : clean(item.statement || item.text))}</li>`).join("")}</ul>` : ""}${citations.length ? `<h4>Governed citations</h4><ul>${citations.map((item) => `<li>${esc(clean(item.title || item.reference || item.sourceId || item.chunkId, "Governed source"))}</li>`).join("")}</ul>` : ""}<p class="gwh-intel-note">Legal review status: Needs legal review · AI used for decision: No</p></div>`;
    }

    function deterministicQuestionAnswer(obligation = {}, question = "why") {
        if (question === "facts") return list(obligation.companyFactsUsed).length ? list(obligation.companyFactsUsed).join("; ") : "The supplied company facts recorded with this deterministic finding.";
        if (question === "missing") return list(obligation.missingFacts).length ? `Still needed: ${list(obligation.missingFacts).join(", ")}.` : "No missing company fact is recorded for this fixed finding.";
        if (question === "growth") return clean(obligation.trigger?.reassessmentPoint) ? `Reassess at the engine-derived point: ${obligation.trigger.reassessmentPoint}.` : "No numeric growth trigger is recorded for this finding; reassess after a relevant supported company change.";
        if (question === "source") return clean(obligation.sourceReference) ? "A governed/source reference is attached to this fixed finding. Use the source-backed explanation button for the governed RAG explanation." : "No direct source URL is attached to this finding; legal review remains required.";
        return clean(obligation.whatToUnderstand, "The supplied company facts produced this deterministic result.");
    }

    function bindQandA(root, obligations, data) {
        const byId = new Map(obligations.map((item) => [clean(item.findingId), item]));
        root.querySelectorAll("[data-rag-obligation]").forEach((panel) => {
            const obligation = byId.get(clean(panel.dataset.ragObligation));
            const select = panel.querySelector("[data-founder-question]");
            const deterministic = panel.querySelector("[data-deterministic-answer]");
            const refresh = () => { if (deterministic) deterministic.textContent = deterministicQuestionAnswer(obligation, select?.value || "why"); };
            select?.addEventListener("change", refresh);
            refresh();
        });
        root.querySelectorAll("[data-rag-explain]").forEach((button) => {
            button.addEventListener("click", async () => {
                const obligation = byId.get(clean(button.dataset.ragExplain));
                const panel = button.closest("[data-rag-obligation]");
                const result = panel?.querySelector("[data-rag-result]");
                if (!obligation?.ragScope?.featureId || !result) return;
                button.disabled = true;
                button.textContent = "Retrieving governed explanation…";
                result.innerHTML = "";
                try {
                    const response = await window.fetch(ragEndpoint(obligation.ragScope.featureId), {
                        method: "POST",
                        headers: { Accept: "application/json", "Content-Type": "application/json" },
                        credentials: "omit",
                        cache: "no-store",
                        body: JSON.stringify({ answers: ragAnswers(data) })
                    });
                    const body = await response.json();
                    if (!response.ok) throw new Error(clean(body?.error?.message || body?.error, "The governed explanation is not available for this finding yet."));
                    result.innerHTML = ragMarkup(validateRagResponse(body, obligation), obligation.founderLabel);
                } catch (error) {
                    result.innerHTML = `<p class="gwh-intel-error">${esc(error?.message || "The governed explanation could not be retrieved.")}</p>`;
                } finally {
                    button.disabled = false;
                    button.textContent = "Get governed source-backed explanation";
                }
            });
        });
    }

    async function buildView() {
        injectStyles();
        const root = document.getElementById("founderReportRoot");
        if (!root) return;
        const data = loadReport();
        if (!Object.keys(data).length) {
            root.innerHTML = `<section class="gwh-web-section"><h1>No report data found</h1><p>Complete the GrowWithHR assessment first.</p><a class="primary-btn" href="analyze-company.html">Start assessment</a></section>`;
            return;
        }

        try {
            const engine = await waitForWebEngine();
            const api = window.GrowWithHRCompanyApplicability;
            const payload = { report: data, answers: data };
            const model = engine.buildAdvisoryModel(payload);
            const assessment = api.assess(payload, model);
            const relevant = Array.from(assessment.groups.relevantNow || []);
            const review = Array.from(assessment.groups.reviewNeeded || []);
            const missing = Array.from(assessment.groups.moreInformationRequired || []);
            const watch = Array.from(assessment.groups.watchAsYouGrow || []);
            const missingFacts = Array.from(assessment.missingFacts || []);
            const scaleTriggers = Array.from(assessment.scaleTriggerMatrix || []);
            const obligations = Array.from(assessment.obligationObjects || []);
            const actions = Array.from(assessment.founderActions || []);
            const supportedScenarioFields = Array.from(assessment.supportedScenarioFields || []);
            const currentObligations = obligations.filter((item) => ["Applicable", "Review required"].includes(item.backendStatus));

            root.innerHTML = `<header class="gwh-web-hero"><img src="assets/hrtechify-logo.png" alt="HRTechify" class="gwh-web-logo"><div><p class="gwh-web-eyebrow">GROWWITHHR · RESEARCH PROTOTYPE</p><h1>HR Compliance & Growth Report</h1><p>${esc(clean(data.companyName, "Your Organisation"))}</p>${clean(data.reportId) ? `<p class="gwh-intel-lineage">Report ID: ${esc(data.reportId)}${clean(data.previousReportId) ? ` · Revised from ${esc(data.previousReportId)}` : ""}</p>` : ""}</div><button class="primary-btn" id="downloadFounderReport">Download PDF</button></header>
                <p id="reportIdentity" class="gwh-web-identity" aria-live="polite"></p>
                <section class="gwh-web-section"><p class="gwh-web-eyebrow">YOUR COMPANY PROFILE</p><h2>Your company information</h2><p class="gwh-web-lede">This report is based on the company information supplied in your assessment. If these facts change, the findings may also change. Missing information has not been inferred.</p><dl class="gwh-web-profile">${companyRows(data).map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl><div class="gwh-web-two"><div><h3>What this report assesses</h3><ul><li>HR compliance requirements that appear relevant to the supplied company profile</li><li>Company facts still needed for deterministic resolution</li><li>Engine-derived reassessment points and supported what-if scenarios</li><li>Founder next actions and governed source-backed explanations</li></ul></div><div><h3>What this report does not assess</h3><ul><li>Whether every applicable obligation has already been completed</li><li>Whether policies, filings, registrations or records are implemented correctly</li><li>Whether payroll calculations or statutory payments are correct</li><li>Whether the company is legally compliant or non-compliant</li><li>Individual employee entitlement, complaint, dispute or claim outcomes</li></ul></div></section>
                <section class="gwh-web-section"><p class="gwh-web-eyebrow">YOUR HR COMPLIANCE POSITION</p><h2>What GrowWithHR identified</h2><p class="gwh-web-lede">These are deterministic applicability findings, not a compliance score, completion measure or certification.</p>${group("Relevant to your company now", relevant, "Applicable based on the company information supplied")}${group("Review needed", review, "The legal or jurisdiction position needs confirmation before a stronger conclusion")}${group("More information required", missing, "One or more company facts are still needed for a reliable deterministic result")}${group("Watch as you grow", watch, "Not currently triggered by the supplied facts; reassess after relevant change")}</section>
                ${currentObligations.length ? `<section class="gwh-web-section"><p class="gwh-web-eyebrow">OBLIGATION OBJECTS</p><h2>What to understand about each fixed finding</h2><p class="gwh-web-lede">The object layer organises deterministic findings. It does not create a second applicability engine.</p><div class="gwh-intel-grid">${currentObligations.map((item) => obligationCard(item, data)).join("")}</div></section>` : ""}
                <section class="gwh-web-section"><p class="gwh-web-eyebrow">YOUR FOUNDER ACTION LIST</p><h2>What to do next</h2><p class="gwh-web-lede">Actions are ordered without a compliance score: relevant-now work, missing company information, growth planning, then specialist-review boundaries.</p>${actionList(actions)}</section>
                ${missingFacts.length ? `<section class="gwh-web-section" id="missingFactResolution"><p class="gwh-web-eyebrow">COMPLETE THE PICTURE</p><h2>Resolve missing company facts</h2><p class="gwh-web-lede">Each unresolved company fact is asked once, even when multiple compliance areas depend on it. Existing confirmed answers are preserved and only explicit answers below are applied.</p><form id="missingFactForm" class="gwh-intel-form">${missingFacts.map((item) => inputMarkup(item)).join("")}<div class="gwh-intel-actions"><button class="gwh-intel-secondary" type="button" id="previewMissingFacts">Preview deterministic changes</button><button class="primary-btn" type="button" id="generateRevisedReport">Generate revised report</button></div></form><div id="missingFactPreview" class="gwh-intel-result" aria-live="polite">No missing fact has been inferred.</div></section>` : ""}
                ${supportedScenarioFields.length ? `<section class="gwh-web-section" id="scenarioPlanner"><p class="gwh-web-eyebrow">WHAT CHANGES IF…</p><h2>Founder scenario simulation</h2><p class="gwh-web-lede">Change one supported company fact and preview the deterministic planning view. Scenarios are temporary and are not report history.</p>${scenarioValueControl(supportedScenarioFields)}<div class="gwh-intel-actions"><button class="gwh-intel-secondary" type="button" id="runScenario">Run scenario</button><button class="gwh-intel-secondary" type="button" id="resetScenario">Reset to current facts</button></div><div id="scenarioResult" class="gwh-intel-result" aria-live="polite">Current company facts remain the baseline.</div></section>` : ""}
                ${scaleTriggers.length ? `<section class="gwh-web-section"><p class="gwh-web-eyebrow">SCALE TRIGGER MATRIX</p><h2>What may change as you grow</h2><p class="gwh-web-lede">These reassessment points come directly from the deterministic rule results. Near triggers are shown first; no new threshold or readiness percentage is created.</p>${scaleTriggers.map(triggerCard).join("")}</section>` : ""}
                <section class="gwh-web-section"><p class="gwh-web-eyebrow">HOW GROWWITHHR REACHED THIS REPORT</p><h2>Deterministic first, explanation second</h2><div class="gwh-web-process"><span>Your company information</span><b>→</b><span>Deterministic compliance rules</span><b>→</b><span>Applicability result</span><b>→</b><span>Obligation objects & actions</span><b>→</b><span>Governed legal explanation</span></div><div class="gwh-web-boundary"><strong>Important AI boundary</strong><p>AI / RAG does not decide whether a compliance area applies. <code>usedForDecision: false</code> · <code>applicabilityAuthority: none</code></p></div></section>
                <section class="gwh-web-section"><p class="gwh-web-eyebrow">REPORT BASIS, SCOPE & LIMITATIONS</p><h2>Research prototype</h2><dl class="gwh-web-profile"><div><dt>Source authority</dt><dd>Secondary research</dd></div><div><dt>Verification status</dt><dd>Prototype researched</dd></div><div><dt>Legal review status</dt><dd>Needs legal review</dd></div><div><dt>AI used for decision</dt><dd>No</dd></div></dl><div class="gwh-web-boundary"><strong>Important limitation</strong><p>GrowWithHR is a research-grade HR compliance prototype. It is not legal advice, a legal opinion, or certification that the company is compliant or non-compliant.</p></div></section>
                <footer class="gwh-web-end"><img src="assets/hrtechify-logo.png" alt="HRTechify"><h2>End of Report</h2><p>GrowWithHR · HR Compliance for Growth</p></footer>`;

            bindQandA(root, obligations, data);

            const missingForm = document.getElementById("missingFactForm");
            const missingPreview = document.getElementById("missingFactPreview");
            let latestResolution = null;
            document.getElementById("previewMissingFacts")?.addEventListener("click", () => {
                const explicitAnswers = collectMissingAnswers(missingForm);
                if (!Object.keys(explicitAnswers).length) {
                    missingPreview.innerHTML = "<p>Enter at least one explicit company fact. Nothing has been inferred.</p>";
                    latestResolution = null;
                    return;
                }
                latestResolution = api.resolveMissingFacts(payload, model, explicitAnswers);
                missingPreview.innerHTML = `<p><strong>Preview only.</strong> ${Object.keys(latestResolution.acceptedAnswers).length} explicit fact${Object.keys(latestResolution.acceptedAnswers).length === 1 ? "" : "s"} will be applied.</p>${diffMarkup(latestResolution.changes, latestResolution.assessment.findings.length - latestResolution.changes.length)}<p class="gwh-intel-note">Generating a revised report will reserve a fresh server-issued Report ID. The current report is not overwritten.</p>`;
            });

            document.getElementById("generateRevisedReport")?.addEventListener("click", async (event) => {
                const button = event.currentTarget;
                const explicitAnswers = collectMissingAnswers(missingForm);
                if (!Object.keys(explicitAnswers).length) { missingPreview.innerHTML = "<p class=\"gwh-intel-error\">Provide at least one unresolved company fact before generating a revised report.</p>"; return; }
                button.disabled = true;
                button.textContent = "Reserving fresh Report ID…";
                try {
                    latestResolution = api.resolveMissingFacts(payload, model, explicitAnswers);
                    const revised = { ...data, ...latestResolution.payload.answers };
                    delete revised.reportId;
                    delete revised.generatedAt;
                    delete revised.reportRequestKey;
                    const previousReportId = clean(data.reportId);
                    if (previousReportId) revised.previousReportId = previousReportId;
                    else delete revised.previousReportId;
                    const identity = await waitForIdentity();
                    const allocated = await identity.allocate({ report: revised, answers: revised, previousReportId });
                    const saved = { ...revised, reportId: allocated.reportId, generatedAt: allocated.generatedAt, previousReportId: clean(allocated.previousReportId, previousReportId) };
                    saveReport(saved);
                    missingPreview.innerHTML = `<p><strong>Revised snapshot created.</strong> Report ID ${esc(saved.reportId)}${saved.previousReportId ? ` replaces no prior identity; it is linked internally to ${esc(saved.previousReportId)}.` : "."}</p><p>Reloading the deterministic report…</p>`;
                    await buildView();
                } catch (error) {
                    missingPreview.innerHTML = `<p class="gwh-intel-error">${esc(error?.message || "The revised report could not be generated.")}</p>`;
                } finally {
                    button.disabled = false;
                    button.textContent = "Generate revised report";
                }
            });

            document.getElementById("runScenario")?.addEventListener("click", () => {
                const field = clean(document.getElementById("scenarioField")?.value);
                const raw = document.getElementById("scenarioValue")?.value;
                const value = parseFieldValue(field, raw);
                const result = document.getElementById("scenarioResult");
                if (value === undefined) { result.innerHTML = "<p class=\"gwh-intel-error\">Enter a valid explicit scenario value.</p>"; return; }
                const scenario = api.simulate(payload, model, { [field]: value });
                result.innerHTML = `<p><strong>Planning view only.</strong> Changed company fact: ${esc(field)} → ${esc(Array.isArray(value) ? value.join(", ") : value)}</p>${diffMarkup(scenario.changes, scenario.unchangedLawIds.length)}<p class="gwh-intel-note">These are deterministic status transitions, not AI predictions or legal forecasts.</p>`;
            });
            document.getElementById("resetScenario")?.addEventListener("click", () => {
                const input = document.getElementById("scenarioValue"); if (input) input.value = "";
                const result = document.getElementById("scenarioResult"); if (result) result.textContent = "Current company facts remain the baseline.";
            });

            document.getElementById("downloadFounderReport")?.addEventListener("click", async (event) => {
                const button = event.currentTarget;
                button.disabled = true;
                button.textContent = "Generating…";
                try {
                    const pdf = await waitForFinalPdfEngine();
                    const built = await pdf.buildAdvisoryPdf({ report: data, answers: data, reportId: clean(data.reportId), previousReportId: clean(data.previousReportId), generatedAt: clean(data.generatedAt) });
                    if (built?.document?.save) built.document.save(built.filename);
                    if (built?.reportId && clean(data.reportId) !== clean(built.reportId)) {
                        data.reportId = built.reportId;
                        data.generatedAt = built.generatedAt;
                        data.previousReportId = clean(built.reportIdentity?.previousReportId, clean(data.previousReportId));
                        saveReport(data);
                    }
                    const identity = document.getElementById("reportIdentity");
                    if (identity) identity.textContent = built?.reportId ? `PDF Report ID: ${built.reportId}` : "";
                } catch (error) {
                    window.alert(error?.message || "The report could not be generated.");
                } finally {
                    button.disabled = false;
                    button.textContent = "Download PDF";
                }
            });
        } catch (error) {
            root.innerHTML = `<section class="gwh-web-section"><h1>Report unavailable</h1><p>${esc(error?.message || "The report could not be prepared.")}</p><p>Existing company facts were not changed.</p></section>`;
        }
    }

    window.GrowWithHRFounderWebReport = Object.freeze({ version: VERSION, buildView });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildView, { once: true });
    else buildView();
})();
