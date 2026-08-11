/* GrowWithHR clean founder-facing web report */
(() => {
    "use strict";

    const VERSION = "1.0.0-founder-web-report";
    const STORAGE_KEY = "growwithhr-report";
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const escapeHtml = (value) => clean(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    function loadReport() {
        try { return JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || "{}"); } catch (_error) { return {}; }
    }

    function founderStatus(status) {
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

    function rowName(row = {}) {
        return clean(row.shortTitle || row.title, "Compliance area");
    }

    function sourceUrl(row = {}) {
        return clean(row.url || row.officialUrl || row.sourceUrl || row.statePortalUrl || row.officialSourceUrl || row.legalSourceUrl);
    }

    function verificationItems(row = {}) {
        const text = `${row.id || ""} ${rowName(row)}`.toLowerCase();
        if (/posh|sexual harassment|internal committee/.test(text)) return ["Applicable Internal Committee and governance requirements", "Required policy and workplace communication", "Awareness and training requirements", "Required records and reporting obligations"];
        if (/maternity/.test(text)) return ["Applicable leave and benefit administration requirements", "Required policy and employee communication", "Relevant records and payroll processes", "When an individual entitlement needs HR or specialist review"];
        if (/provident|epf|pf /.test(text)) return ["Coverage and registration position where applicable", "Employee eligibility and payroll information", "Contribution administration process", "Records used to support the organisation's position"];
        if (/esi|state insurance/.test(text)) return ["Establishment coverage and registration position", "Relevant wage-eligibility information", "Employee and payroll records", "Contribution administration process where applicable"];
        if (/shop|establishment/.test(text)) return ["Registration or renewal requirements for the relevant establishment", "Working-time, leave and workplace notice requirements", "Required registers and records", "State-specific requirements that need confirmation"];
        if (/contract|contractor/.test(text)) return ["Principal-employer and contractor arrangements", "Registration or licensing requirements where applicable", "Contractor workforce records", "Responsibilities that remain with the organisation"];
        return ["The organisational requirements associated with this compliance area", "Any policy, process or governance requirements that apply", "Relevant records or notices", "When specialist review is appropriate"];
    }

    function companyRows(data = {}) {
        const operatingStates = Array.isArray(data.operatingStates) ? data.operatingStates.join(", ") : clean(data.operatingStates);
        return [
            ["Company", clean(data.companyName, "Your Organisation")],
            ["Legal structure", clean(data.entity || data.establishmentType)],
            ["Industry", clean(data.customIndustry || data.industry)],
            ["Primary State / location", clean(data.primaryState || data.state)],
            ["Operating States", operatingStates],
            ["Employees", clean(data.employees || data.employeeCount || data.headcount)],
            ["Women employees", clean(data.womenEmployees || data.femaleEmployees || data.hasWomenEmployees)],
            ["Contractors", clean(data.contractors || data.contractWorkers || data.contractorCount)],
            ["Workers", clean(data.workers || data.workerCount || data.workmen)],
            ["Working model", clean(data.workModel)]
        ].filter(([, value]) => value);
    }

    function factsMarkup(row = {}, data = {}) {
        const facts = [];
        if (clean(row.thresholdResult?.positionText)) facts.push(clean(row.thresholdResult.positionText));
        if (clean(data.primaryState || data.state)) facts.push(`Primary State / location: ${clean(data.primaryState || data.state)}`);
        if (clean(data.entity || data.establishmentType)) facts.push(`Establishment / legal structure: ${clean(data.entity || data.establishmentType)}`);
        return [...new Set(facts)].slice(0, 3).map((fact) => `<li>${escapeHtml(fact)}</li>`).join("");
    }

    function positionGroup(title, rows, description) {
        if (!rows.length) return "";
        return `<section class="gwh-web-block"><h3>${escapeHtml(title)}</h3><p class="gwh-web-muted">${escapeHtml(description)}</p><div class="gwh-web-list">${rows.map((row) => `<article class="gwh-web-finding"><div class="gwh-web-finding__top"><h4>${escapeHtml(rowName(row))}</h4><span class="gwh-web-status ${statusClass(row.status)}">${escapeHtml(founderStatus(row.status))}</span></div><p>${escapeHtml(clean(row.thresholdResult?.explanation || row.whyIncluded, "The supplied company facts caused this result."))}</p></article>`).join("")}</div></section>`;
    }

    function detailedFinding(row, data) {
        const url = sourceUrl(row);
        return `<article class="gwh-web-detail" id="finding-${escapeHtml(clean(row.id, rowName(row)).replace(/[^a-z0-9-]/gi, "-").toLowerCase())}">
            <div class="gwh-web-finding__top"><h3>${escapeHtml(rowName(row))}</h3><span class="gwh-web-status ${statusClass(row.status)}">${escapeHtml(founderStatus(row.status))}</span></div>
            <div class="gwh-web-detail__section"><h4>Company facts used</h4><ul>${factsMarkup(row, data) || "<li>Relevant company facts supplied in the assessment</li>"}</ul></div>
            <div class="gwh-web-detail__section"><h4>Rule condition</h4><p>${escapeHtml(clean(row.thresholdResult?.triggerText || row.threshold || "The rule depends on the governed company facts for this compliance area."))}</p></div>
            <div class="gwh-web-detail__section"><h4>Why GrowWithHR identified this</h4><p>${escapeHtml(clean(row.thresholdResult?.explanation || row.whyIncluded || "The supplied company facts meet the conditions represented in the deterministic compliance rule."))}</p></div>
            <div class="gwh-web-detail__section"><h4>Result</h4><p><strong>${escapeHtml(founderStatus(row.status))}.</strong> This is an applicability result based on the information supplied.</p></div>
            <div class="gwh-web-detail__section"><h4>Things to verify internally</h4><ul>${verificationItems(row).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
            <div class="gwh-web-boundary"><strong>Important boundary</strong><p>GrowWithHR has not assessed whether your company has already completed or correctly implemented these requirements. This report does not certify compliance or non-compliance.</p></div>
            ${url ? `<a class="gwh-web-source" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">View reference source →</a>` : ""}
            <p class="gwh-web-legal">Legal review status: Needs legal review</p>
        </article>`;
    }

    async function waitForReportEngine() {
        for (let attempt = 0; attempt < 240; attempt += 1) {
            const pdf = window.GrowWithHRPDF;
            if (pdf?.buildAdvisoryModel && pdf?.buildReportLawTransparency && pdf?.reportStructureVersion === "founder-demo-single-v1") return pdf;
            await new Promise((resolve) => window.setTimeout(resolve, 25));
        }
        throw new Error("The GrowWithHR report engine did not become ready.");
    }

    async function buildView() {
        const root = document.getElementById("founderReportRoot");
        if (!root) return;
        const data = loadReport();
        if (!Object.keys(data).length) {
            root.innerHTML = `<section class="gwh-web-section"><h1>No report data found</h1><p>Complete the GrowWithHR assessment first.</p><a class="primary-btn" href="analyze-company.html">Start assessment</a></section>`;
            return;
        }
        try {
            const pdf = await waitForReportEngine();
            const payload = { report: data, answers: data };
            const model = pdf.buildAdvisoryModel(payload);
            const rows = Array.from(pdf.buildReportLawTransparency(payload, model) || []);
            const relevant = rows.filter((row) => row.status === "Applicable");
            const review = rows.filter((row) => row.status === "Review required");
            const missing = rows.filter((row) => row.status === "Needs information");
            const watch = rows.filter((row) => row.status === "Not currently triggered");
            const missingQuestions = [...new Set(missing.flatMap((row) => Array.isArray(row.missingQuestions || row.missingInputs) ? (row.missingQuestions || row.missingInputs) : []).map(clean).filter(Boolean))];

            root.innerHTML = `
                <header class="gwh-web-hero">
                    <img src="assets/hrtechify-logo.png" alt="HRTechify" class="gwh-web-logo">
                    <div><p class="gwh-web-eyebrow">GROWWITHHR · RESEARCH PROTOTYPE</p><h1>HR Compliance & Growth Report</h1><p>${escapeHtml(clean(data.companyName, "Your Organisation"))}</p></div>
                    <button class="primary-btn" id="downloadFounderReport">Download PDF</button>
                </header>
                <p id="reportIdentity" class="gwh-web-identity" aria-live="polite"></p>

                <section class="gwh-web-section"><p class="gwh-web-eyebrow">YOUR COMPANY PROFILE</p><h2>Your company information</h2><p class="gwh-web-lede">This report is based on the company information supplied in your assessment. If these facts change, the findings may also change. Missing information has not been inferred.</p><dl class="gwh-web-profile">${companyRows(data).map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
                    <div class="gwh-web-two"><div><h3>What this report assesses</h3><ul><li>HR compliance areas relevant to the company profile supplied</li><li>Areas where additional company information is needed</li><li>Compliance areas to reassess after material growth or operating change</li><li>Founder-friendly explanations and governed research references</li></ul></div><div><h3>What this report does not assess</h3><ul><li>Whether every applicable obligation has already been completed</li><li>Whether policies, filings, registrations or records are implemented correctly</li><li>Whether payroll calculations or statutory payments are correct</li><li>Whether the company is legally compliant or non-compliant</li><li>Individual employee entitlement, complaint, dispute or claim outcomes</li></ul></div></div>
                </section>

                <section class="gwh-web-section"><p class="gwh-web-eyebrow">YOUR HR COMPLIANCE POSITION</p><h2>What GrowWithHR identified</h2><p class="gwh-web-lede">These are applicability findings, not a compliance score or certification.</p>
                    ${positionGroup("Relevant to your company now", relevant, "Applicable based on the company information supplied")}
                    ${positionGroup("Review needed", review, "The legal or jurisdiction position needs confirmation before a stronger conclusion")}
                    ${positionGroup("More information required", missing, "One or more company facts are still needed for a reliable deterministic result")}
                    ${positionGroup("Watch as you grow", watch, "Not currently triggered by the supplied facts; reassess after relevant change")}
                    <div class="gwh-web-boundary"><strong>What deserves your attention</strong><p>First, understand the areas identified as relevant today. Second, complete missing company information because it can change unresolved findings. Third, reassess GrowWithHR before or when material company facts change.</p></div>
                </section>

                ${relevant.length || review.length ? `<section class="gwh-web-section"><p class="gwh-web-eyebrow">COMPLIANCE AREAS RELEVANT TODAY</p><h2>Why each area appears</h2><p class="gwh-web-lede">Every finding shows the company facts behind the deterministic result.</p>${[...relevant, ...review].map((row) => detailedFinding(row, data)).join("")}</section>` : ""}

                ${missing.length ? `<section class="gwh-web-section"><p class="gwh-web-eyebrow">INFORMATION THAT COULD CHANGE THIS REPORT</p><h2>Complete the picture</h2><p class="gwh-web-lede">GrowWithHR does not guess missing company facts. Update these details in the assessment and generate a fresh report.</p>${missing.map((row) => `<article class="gwh-web-simple"><h3>${escapeHtml(rowName(row))}</h3><span class="gwh-web-status is-missing">More information required</span><ul>${(Array.isArray(row.missingQuestions || row.missingInputs) ? (row.missingQuestions || row.missingInputs) : []).map((item) => `<li>${escapeHtml(clean(item))}</li>`).join("")}</ul><p class="gwh-web-muted">${escapeHtml(clean(row.whyIncluded || row.thresholdResult?.explanation, "This information is required before the deterministic rule can produce a reliable result."))}</p></article>`).join("")}${missingQuestions.length ? `<div class="gwh-web-boundary"><strong>Your next step</strong><p>Return to the GrowWithHR assessment, complete the missing facts and regenerate the report.</p></div>` : ""}</section>` : ""}

                ${watch.length ? `<section class="gwh-web-section"><p class="gwh-web-eyebrow">GROWTH COMPLIANCE RADAR</p><h2>What may change as you grow</h2><p class="gwh-web-lede">A future trigger is a reason to reassess. It is not, by itself, a declaration that a law automatically applies.</p>${watch.map((row) => `<article class="gwh-web-simple"><div class="gwh-web-finding__top"><h3>${escapeHtml(rowName(row))}</h3><span class="gwh-web-status is-watch">Watch as you grow</span></div><dl class="gwh-web-trigger"><div><dt>Current position</dt><dd>${escapeHtml(clean(row.thresholdResult?.positionText || row.thresholdResult?.label, "Not currently triggered"))}</dd></div><div><dt>Reassessment point</dt><dd>${escapeHtml(clean(row.thresholdResult?.triggerText || row.reassessWhen || row.futureTrigger, "Reassess after a relevant company change"))}</dd></div><div><dt>Why</dt><dd>${escapeHtml(clean(row.thresholdResult?.explanation || row.whyIncluded))}</dd></div></dl></article>`).join("")}<h3>When to run GrowWithHR again</h3><ul><li>Employee headcount changes materially</li><li>Employee wage or workforce-category information changes</li><li>Contractor arrangements change</li><li>A new State, office or establishment is added</li><li>The establishment activity or operating model changes</li></ul></section>` : ""}

                <section class="gwh-web-section"><p class="gwh-web-eyebrow">YOUR FOUNDER ACTION LIST</p><h2>What to do after reading this report</h2><ol class="gwh-web-steps"><li><strong>Review what is relevant today.</strong><span>Understand the compliance areas identified from your current company profile.</span></li><li><strong>Verify internally.</strong><span>Confirm whether your organisation has already addressed the relevant governance, policy, process, record and reporting requirements. GrowWithHR does not collect or verify evidence of completion.</span></li><li><strong>Complete missing company information.</strong><span>Missing facts can change unresolved applicability findings.</span></li><li><strong>Reassess after material change.</strong><span>Generate a fresh report when workforce, location, establishment type or other material company facts change.</span></li></ol></section>

                <section class="gwh-web-section"><p class="gwh-web-eyebrow">HOW GROWWITHHR REACHED THIS REPORT</p><h2>Deterministic first, explanation second</h2><div class="gwh-web-process"><span>Your company information</span><b>→</b><span>Deterministic compliance rules</span><b>→</b><span>Applicability result</span><b>→</b><span>Governed legal research</span><b>→</b><span>Founder-friendly explanation</span></div><div class="gwh-web-boundary"><strong>Important AI boundary</strong><p>AI / RAG does not decide whether a compliance area applies. The deterministic engine produces the result. <code>usedForDecision: false</code> · <code>applicabilityAuthority: none</code></p></div></section>

                <section class="gwh-web-section"><p class="gwh-web-eyebrow">REPORT BASIS, SCOPE & LIMITATIONS</p><h2>Research prototype</h2><dl class="gwh-web-profile"><div><dt>Source authority</dt><dd>Secondary research</dd></div><div><dt>Verification status</dt><dd>Prototype researched</dd></div><div><dt>Legal review status</dt><dd>Needs legal review</dd></div><div><dt>AI used for decision</dt><dd>No</dd></div></dl><h3>Outside the current prototype scope</h3><ul><li>International / multi-country employment</li><li>Unsupported State-specific matters</li><li>Individual employment disputes, claims or entitlement decisions</li><li>Tax or corporate-law compliance</li><li>Payroll contribution arithmetic</li><li>Live safeguarding investigations or complaint adjudication</li><li>Legal representation or legal certification</li></ul><div class="gwh-web-boundary"><strong>Important limitation</strong><p>GrowWithHR is a research-grade HR compliance prototype. This report helps founders understand potential HR compliance applicability and growth-related triggers based on the company information supplied. It is not legal advice, a legal opinion, or certification that the company is compliant or non-compliant.</p></div></section>

                <footer class="gwh-web-end"><img src="assets/hrtechify-logo.png" alt="HRTechify"><h2>End of Report</h2><p>GrowWithHR · HR Compliance for Growth</p></footer>`;

            document.getElementById("downloadFounderReport")?.addEventListener("click", async (event) => {
                const button = event.currentTarget;
                if (button instanceof HTMLButtonElement) {
                    button.disabled = true;
                    button.textContent = "Generating…";
                }
                try {
                    const built = await pdf.buildAdvisoryPdf({ report: data, answers: data });
                    if (built?.document?.save) built.document.save(built.filename);
                    const identity = document.getElementById("reportIdentity");
                    if (identity) identity.textContent = built?.reportId ? `PDF Report ID: ${built.reportId}` : "";
                } catch (error) {
                    window.alert(error?.message || "The report could not be generated.");
                } finally {
                    if (button instanceof HTMLButtonElement) {
                        button.disabled = false;
                        button.textContent = "Download PDF";
                    }
                }
            });
        } catch (error) {
            root.innerHTML = `<section class="gwh-web-section"><h1>Report unavailable</h1><p>${escapeHtml(error?.message || "The report could not be prepared.")}</p></section>`;
        }
    }

    window.GrowWithHRFounderWebReport = Object.freeze({ version: VERSION, buildView });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildView, { once: true });
    else buildView();
})();
