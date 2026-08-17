const BRAND = Object.freeze({
    navy: [10, 24, 48],
    navySoft: [31, 48, 77],
    amber: [245, 158, 11],
    orange: [255, 122, 0],
    redOrange: [255, 77, 0],
    text: [35, 41, 52],
    muted: [92, 101, 116],
    line: [214, 218, 225],
    paper: [255, 255, 255],
    soft: [248, 250, 252]
});

const PAGE = Object.freeze({ width: 210, height: 297, left: 18, right: 18, top: 20, bottom: 20 });

function cleanText(value, fallback = "") {
    return String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
}

function cleanFilename(value) {
    return cleanText(value, "Organization")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "Organization";
}

function jsPDFConstructor() {
    return window.jspdf?.jsPDF || window.jsPDF || null;
}

function formatDate(value) {
    const date = new Date(value || Date.now());
    const safe = Number.isFinite(date.getTime()) ? date : new Date();
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(safe);
}

function statusLabel(status) {
    return ({ action: "Action", watch: "Watch", stable: "Stable", "needs-information": "Needs Information" })[status] || cleanText(status, "Unknown");
}

function statusColor(status) {
    if (status === "action") return [185, 28, 28];
    if (status === "watch") return [180, 83, 9];
    if (status === "stable") return [21, 128, 61];
    return [59, 89, 152];
}

function normalizePayload(payload = {}) {
    const analysis = payload.analysis || {};
    const reportModel = payload.reportModel || analysis.reportModel || {};
    const facts = analysis.facts || {};
    return {
        analysis,
        reportModel,
        facts,
        findings: Array.isArray(analysis.findings) ? analysis.findings : [],
        scenario: analysis.scenario || reportModel.scenario || {},
        reportId: cleanText(payload.reportId || reportModel.reportId, "Local analysis"),
        companyName: cleanText(reportModel.company?.name || facts.companyName || payload.data?.shared?.companyName, "Your Organisation"),
        generatedAt: reportModel.generatedAt || analysis.generatedAt || new Date().toISOString(),
        framework: reportModel.framework || analysis.methodology || {},
        sample: Boolean(payload.sample)
    };
}

function pageHeader(doc, title, pageNumber) {
    doc.setFillColor(...BRAND.navy);
    doc.rect(0, 0, PAGE.width, 13, "F");
    doc.setFillColor(...BRAND.amber);
    doc.rect(0, 13, PAGE.width * 0.36, 1.5, "F");
    doc.setFillColor(...BRAND.orange);
    doc.rect(PAGE.width * 0.36, 13, PAGE.width * 0.34, 1.5, "F");
    doc.setFillColor(...BRAND.redOrange);
    doc.rect(PAGE.width * 0.70, 13, PAGE.width * 0.30, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("HRTECHIFY · GROWWITHHR", PAGE.left, 8.5);
    doc.setFont("helvetica", "normal");
    doc.text(cleanText(title), PAGE.width - PAGE.right, 8.5, { align: "right" });
    doc.setDrawColor(...BRAND.line);
    doc.line(PAGE.left, PAGE.height - 13, PAGE.width - PAGE.right, PAGE.height - 13);
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);
    doc.text("GrowWithHR Organization Structure · Research prototype", PAGE.left, PAGE.height - 8);
    doc.text(`Page ${pageNumber}`, PAGE.width - PAGE.right, PAGE.height - 8, { align: "right" });
}

function addPage(doc, state, title) {
    if (state.page > 0) doc.addPage();
    state.page += 1;
    pageHeader(doc, title, state.page);
    state.y = 23;
}

function ensureSpace(doc, state, needed, title) {
    if (state.y + needed <= PAGE.height - PAGE.bottom - 12) return;
    addPage(doc, state, title);
}

function wrap(doc, text, width, size = 10) {
    doc.setFontSize(size);
    return doc.splitTextToSize(cleanText(text), width);
}

function paragraph(doc, state, text, options = {}) {
    const size = options.size || 9.5;
    const lineHeight = options.lineHeight || 4.6;
    const width = options.width || PAGE.width - PAGE.left - PAGE.right;
    const lines = wrap(doc, text, width, size);
    ensureSpace(doc, state, lines.length * lineHeight + 2, options.pageTitle || "Organization Structure");
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(options.color || BRAND.text));
    doc.text(lines, options.x || PAGE.left, state.y, { lineHeightFactor: 1.15 });
    state.y += lines.length * lineHeight + (options.after ?? 2.5);
}

function heading(doc, state, text, level = 2, pageTitle = "Organization Structure") {
    const size = level === 1 ? 22 : level === 2 ? 15 : 11;
    ensureSpace(doc, state, size / 2 + 10, pageTitle);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...BRAND.navy);
    doc.text(cleanText(text), PAGE.left, state.y);
    state.y += level === 1 ? 10 : level === 2 ? 8 : 6;
}

function labelValue(doc, state, label, value, pageTitle = "Organization Structure") {
    ensureSpace(doc, state, 9, pageTitle);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.muted);
    doc.text(`${cleanText(label)}:`, PAGE.left, state.y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.text);
    const x = PAGE.left + 43;
    const lines = doc.splitTextToSize(cleanText(value, "Not provided"), PAGE.width - PAGE.right - x);
    doc.text(lines, x, state.y);
    state.y += Math.max(5, lines.length * 4.2);
}

function linkLine(doc, state, label, title, url, pageTitle = "Organization Structure") {
    const safeTitle = cleanText(title);
    const safeUrl = cleanText(url);
    if (!safeTitle) return;
    const lines = doc.splitTextToSize(`${label}: ${safeTitle}`, PAGE.width - PAGE.left - PAGE.right);
    ensureSpace(doc, state, lines.length * 4.3 + 3, pageTitle);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(154, 52, 18);
    doc.text(lines, PAGE.left, state.y);
    if (safeUrl) {
        const targetY = state.y - 3.5;
        doc.link(PAGE.left, targetY, PAGE.width - PAGE.left - PAGE.right, Math.max(5, lines.length * 4.3), { url: safeUrl });
    }
    state.y += lines.length * 4.3 + 2;
}

function statusChip(doc, state, status, pageTitle) {
    ensureSpace(doc, state, 10, pageTitle);
    const label = statusLabel(status).toUpperCase();
    const color = statusColor(status);
    doc.setFillColor(...color);
    doc.roundedRect(PAGE.left, state.y - 4.5, Math.max(21, label.length * 2.2 + 7), 7, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label, PAGE.left + 3, state.y);
    state.y += 7;
}

function cover(doc, state, payload) {
    state.page = 1;
    doc.setFillColor(...BRAND.navy);
    doc.rect(0, 0, PAGE.width, PAGE.height, "F");
    doc.setFillColor(...BRAND.amber);
    doc.rect(0, 0, PAGE.width * .38, 4, "F");
    doc.setFillColor(...BRAND.orange);
    doc.rect(PAGE.width * .38, 0, PAGE.width * .34, 4, "F");
    doc.setFillColor(...BRAND.redOrange);
    doc.rect(PAGE.width * .72, 0, PAGE.width * .28, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.amber);
    doc.text("HRTECHIFY · GROWWITHHR", PAGE.left, 28);
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("Organization Structure", PAGE.left, 51);
    doc.text("Report", PAGE.left, 63);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(203, 213, 225);
    doc.text(doc.splitTextToSize("Executive overview, detailed structural findings and a 12-month planning scenario with transparent rules and public source links.", 150), PAGE.left, 76);

    doc.setFillColor(...BRAND.navySoft);
    doc.roundedRect(PAGE.left, 106, PAGE.width - PAGE.left - PAGE.right, 57, 4, 4, "F");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.amber);
    doc.setFont("helvetica", "bold");
    doc.text("REPORT IDENTITY", PAGE.left + 8, 119);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text(`Company: ${payload.companyName}`, PAGE.left + 8, 130);
    doc.text(`Report ID: ${payload.reportId}`, PAGE.left + 8, 139);
    doc.text(`Generated: ${formatDate(payload.generatedAt)}`, PAGE.left + 8, 148);
    doc.text(`Framework: ${cleanText(payload.framework.name, "GrowWithHR Organization Structure Assessment Framework")} v${cleanText(payload.framework.version, "1.1")}`, PAGE.left + 8, 157);

    doc.setFillColor(255, 247, 237);
    doc.roundedRect(PAGE.left, 178, PAGE.width - PAGE.left - PAGE.right, 52, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(154, 52, 18);
    doc.setFontSize(10);
    doc.text("HOW TO READ THE RECOMMENDATIONS", PAGE.left + 8, 191);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(67, 20, 7);
    const disclosure = "A public source supports the underlying organization-design principle. The GrowWithHR rule explains how that principle was applied to the facts you supplied. GrowWithHR prototype guardrails are not represented as source-published benchmarks.";
    doc.text(doc.splitTextToSize(disclosure, PAGE.width - PAGE.left - PAGE.right - 16), PAGE.left + 8, 201);

    const methodologyUrl = cleanText(payload.framework.methodologyUrl, "organization-structure-methodology.html");
    doc.setTextColor(...BRAND.amber);
    doc.setFont("helvetica", "bold");
    doc.text("Framework access: Free public methodology", PAGE.left, 251);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text("Methodology and source links are also listed in the final section of this PDF.", PAGE.left, 260);
    if (/^https?:\/\//.test(methodologyUrl)) {
        doc.textWithLink(methodologyUrl, PAGE.left, 270, { url: methodologyUrl });
    }
}

function executiveSection(doc, state, payload) {
    const model = payload.reportModel;
    addPage(doc, state, "Executive Overview");
    heading(doc, state, "Executive Overview", 1, "Executive Overview");
    paragraph(doc, state, cleanText(model.executiveSummary, "No executive summary is available."), { size: 11, bold: true, color: BRAND.navy, pageTitle: "Executive Overview" });
    labelValue(doc, state, "Company", payload.companyName, "Executive Overview");
    labelValue(doc, state, "Report ID", payload.reportId, "Executive Overview");
    labelValue(doc, state, "Framework", `${cleanText(payload.framework.name)} v${cleanText(payload.framework.version)}`, "Executive Overview");
    state.y += 4;

    heading(doc, state, "Status Overview", 2, "Executive Overview");
    const summary = model.statusSummary || {};
    paragraph(doc, state, `Action: ${summary.action || 0} · Watch: ${summary.watch || 0} · Stable: ${summary.stable || 0} · Needs information: ${summary["needs-information"] || 0}`, { pageTitle: "Executive Overview" });

    heading(doc, state, "Key Structural Metrics", 2, "Executive Overview");
    const metrics = model.metrics || {};
    labelValue(doc, state, "Employees", metrics.employees ?? "Not provided", "Executive Overview");
    labelValue(doc, state, "People managers", metrics.peopleManagers ?? "Not provided", "Executive Overview");
    labelValue(doc, state, "Employees per manager", metrics.currentEmployeeToManagerRatio ?? "Not available", "Executive Overview");
    labelValue(doc, state, "Management context", cleanText(metrics.managementContextBand, "Not enough context").replaceAll("-", " "), "Executive Overview");
    labelValue(doc, state, "12-month headcount", metrics.expectedEmployees12Months ?? "Not provided", "Executive Overview");

    heading(doc, state, "Primary Constraint", 2, "Executive Overview");
    const primary = model.primaryConstraint;
    if (primary) {
        statusChip(doc, state, primary.status, "Executive Overview");
        paragraph(doc, state, primary.title, { bold: true, size: 11, pageTitle: "Executive Overview" });
        paragraph(doc, state, primary.whyItMatters, { pageTitle: "Executive Overview" });
        paragraph(doc, state, `What to do next: ${primary.action}`, { pageTitle: "Executive Overview" });
        labelValue(doc, state, "Rule", `${primary.id} v${primary.ruleVersion}`, "Executive Overview");
    } else {
        paragraph(doc, state, "No primary structural constraint was identified from the supplied facts.", { pageTitle: "Executive Overview" });
    }

    heading(doc, state, "Top Priorities", 2, "Executive Overview");
    (model.priorities || []).forEach((item, index) => {
        paragraph(doc, state, `${index + 1}. ${item.title}`, { bold: true, pageTitle: "Executive Overview" });
        paragraph(doc, state, item.action, { size: 8.8, color: BRAND.muted, pageTitle: "Executive Overview" });
    });
}

function findingSection(doc, state, payload) {
    addPage(doc, state, "Detailed Findings");
    heading(doc, state, "Detailed Structural Findings", 1, "Detailed Findings");
    paragraph(doc, state, "Each finding below separates the GrowWithHR rule from the public source supporting the underlying organization-design principle.", { color: BRAND.muted, pageTitle: "Detailed Findings" });

    payload.findings.forEach((item, index) => {
        ensureSpace(doc, state, 45, "Detailed Findings");
        doc.setFillColor(...BRAND.soft);
        doc.setDrawColor(...BRAND.line);
        doc.roundedRect(PAGE.left, state.y - 4, PAGE.width - PAGE.left - PAGE.right, 8, 2, 2, "FD");
        state.y += 2;
        statusChip(doc, state, item.status, "Detailed Findings");
        paragraph(doc, state, `${index + 1}. ${item.title}`, { bold: true, size: 11, pageTitle: "Detailed Findings" });
        paragraph(doc, state, item.whyItMatters, { pageTitle: "Detailed Findings" });
        paragraph(doc, state, `What to do next: ${item.action}`, { bold: true, pageTitle: "Detailed Findings" });
        paragraph(doc, state, `Reassess when: ${item.growthTrigger}`, { size: 8.8, color: BRAND.muted, pageTitle: "Detailed Findings" });
        labelValue(doc, state, "Confidence", `${cleanText(item.confidence)} — fact completeness / deterministic rule path, not statistical confidence`, "Detailed Findings");
        labelValue(doc, state, "Facts used", (item.factsUsed || []).join(", ") || "No confirmed fact used yet", "Detailed Findings");
        if ((item.missingFacts || []).length) labelValue(doc, state, "Missing", item.missingFacts.join(", "), "Detailed Findings");
        labelValue(doc, state, "GrowWithHR rule", `${cleanText(item.ruleId || item.id)} v${cleanText(item.ruleVersion, "1.1")}`, "Detailed Findings");
        paragraph(doc, state, item.ruleBasis, { size: 8.7, color: [92, 60, 20], pageTitle: "Detailed Findings" });
        (item.sources || []).forEach((source) => {
            linkLine(doc, state, "Public source", `${source.title} — ${source.publisher} — ${source.section}`, source.url, "Detailed Findings");
            paragraph(doc, state, `What this source supports: ${source.supports}`, { size: 7.9, color: BRAND.muted, pageTitle: "Detailed Findings" });
        });
        state.y += 5;
    });
}

function scenarioSection(doc, state, payload) {
    addPage(doc, state, "12-Month Growth Scenario");
    heading(doc, state, "12-Month Growth Scenario", 1, "12-Month Growth Scenario");
    paragraph(doc, state, "What changes if headcount grows as planned and manager count stays the same? This is a deterministic planning scenario based on supplied assumptions. It is not a forecast.", { color: BRAND.muted, pageTitle: "12-Month Growth Scenario" });
    const model = payload.reportModel;
    const metrics = model.metrics || {};
    labelValue(doc, state, "Current employees", metrics.employees ?? "Not provided", "12-Month Growth Scenario");
    labelValue(doc, state, "Current people managers", metrics.peopleManagers ?? "Not provided", "12-Month Growth Scenario");
    labelValue(doc, state, "Current employees per manager", metrics.currentEmployeeToManagerRatio ?? "Not available", "12-Month Growth Scenario");
    labelValue(doc, state, "12-month headcount assumption", metrics.expectedEmployees12Months ?? "Not provided", "12-Month Growth Scenario");
    labelValue(doc, state, "Projected employees per manager", payload.scenario.projectedEmployeeToManagerRatio ?? "Not available", "12-Month Growth Scenario");
    labelValue(doc, state, "Projected status", statusLabel(payload.scenario.projectedStatus), "12-Month Growth Scenario");
    labelValue(doc, state, "Management context", cleanText(metrics.managementContextBand, "Not enough context").replaceAll("-", " "), "12-Month Growth Scenario");
    if ((metrics.expansionSignals || []).length) labelValue(doc, state, "Expansion signals", metrics.expansionSignals.join(", "), "12-Month Growth Scenario");
    state.y += 4;
    heading(doc, state, "What This Means", 2, "12-Month Growth Scenario");
    paragraph(doc, state, payload.scenario.interpretation, { bold: true, size: 11, pageTitle: "12-Month Growth Scenario" });
    paragraph(doc, state, payload.scenario.disclaimer, { size: 8.8, color: BRAND.muted, pageTitle: "12-Month Growth Scenario" });
    labelValue(doc, state, "Scenario rule", `${cleanText(payload.scenario.ruleId || payload.scenario.id)} v${cleanText(payload.scenario.ruleVersion, "1.1")}`, "12-Month Growth Scenario");
    paragraph(doc, state, payload.scenario.ruleBasis, { size: 8.7, color: [92, 60, 20], pageTitle: "12-Month Growth Scenario" });
    (payload.scenario.sources || []).forEach((source) => linkLine(doc, state, "Public source", `${source.title} — ${source.publisher}`, source.url, "12-Month Growth Scenario"));

    heading(doc, state, "Structural Priorities Before the Next Hiring Wave", 2, "12-Month Growth Scenario");
    (model.priorities || []).forEach((item, index) => {
        paragraph(doc, state, `${index + 1}. ${item.title}`, { bold: true, pageTitle: "12-Month Growth Scenario" });
        paragraph(doc, state, item.action, { size: 8.8, pageTitle: "12-Month Growth Scenario" });
    });
}

function evidenceSection(doc, state, payload) {
    addPage(doc, state, "Framework & Evidence");
    heading(doc, state, "Framework & Evidence", 1, "Framework & Evidence");
    const framework = payload.framework || {};
    labelValue(doc, state, "Framework", cleanText(framework.name, "GrowWithHR Organization Structure Assessment Framework"), "Framework & Evidence");
    labelValue(doc, state, "Version", cleanText(framework.version, "1.1"), "Framework & Evidence");
    labelValue(doc, state, "Access", cleanText(framework.access, "Free public methodology"), "Framework & Evidence");
    labelValue(doc, state, "Last reviewed", cleanText(framework.lastReviewed, "Not recorded"), "Framework & Evidence");
    labelValue(doc, state, "Review owner", cleanText(framework.reviewOwner, "GrowWithHR organisation-design methodology"), "Framework & Evidence");
    paragraph(doc, state, framework.statement, { color: BRAND.muted, pageTitle: "Framework & Evidence" });

    const methodologyUrl = cleanText(framework.methodologyUrl);
    if (methodologyUrl) linkLine(doc, state, "Methodology", "GrowWithHR Organization Structure methodology and source library", methodologyUrl, "Framework & Evidence");
    heading(doc, state, "Public Source Library Used in This Report", 2, "Framework & Evidence");
    (payload.reportModel.sources || []).forEach((source) => {
        paragraph(doc, state, source.title, { bold: true, pageTitle: "Framework & Evidence" });
        labelValue(doc, state, "Publisher", source.publisher, "Framework & Evidence");
        labelValue(doc, state, "Access / licence", `${cleanText(source.access)} · ${cleanText(source.license)}`, "Framework & Evidence");
        paragraph(doc, state, `Used for: ${source.supports}`, { size: 8.5, color: BRAND.muted, pageTitle: "Framework & Evidence" });
        linkLine(doc, state, "Link", source.url, source.url, "Framework & Evidence");
        state.y += 3;
    });
    heading(doc, state, "Important Boundary", 2, "Framework & Evidence");
    paragraph(doc, state, "Public sources do not endorse GrowWithHR. They support the underlying organization-design principles used in the analysis. GrowWithHR remains responsible for its disclosed deterministic rule interpretation. The report does not score people, assess individual capability, determine compensation or decide legal applicability.", { pageTitle: "Framework & Evidence" });
}

function absoluteMethodologyUrl(framework = {}) {
    const current = cleanText(framework.methodologyUrl);
    if (/^https?:\/\//.test(current)) return current;
    try {
        return new URL(current || "organization-structure-methodology.html", window.location.href).href;
    } catch (_error) {
        return current || "organization-structure-methodology.html";
    }
}

async function generateOrganizationStructurePdf(payload = {}, options = {}) {
    const JsPDF = jsPDFConstructor();
    if (!JsPDF) throw new Error("The GrowWithHR PDF library is unavailable.");
    const normalized = normalizePayload(payload);
    normalized.framework = { ...normalized.framework, methodologyUrl: absoluteMethodologyUrl(normalized.framework) };
    const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const state = { page: 0, y: 0 };

    cover(doc, state, normalized);
    executiveSection(doc, state, normalized);
    findingSection(doc, state, normalized);
    scenarioSection(doc, state, normalized);
    evidenceSection(doc, state, normalized);

    const filename = `GrowWithHR-Organization-Structure-${cleanFilename(normalized.companyName)}.pdf`;
    const mode = cleanText(options.mode, "download");
    if (mode === "download") {
        doc.save(filename);
        return { filename, pageCount: doc.getNumberOfPages() };
    }
    if (mode === "blob") {
        return { filename, blob: doc.output("blob"), pageCount: doc.getNumberOfPages() };
    }
    if (mode === "base64") {
        const dataUri = doc.output("datauristring");
        return {
            filename,
            base64: dataUri.replace(/^data:application\/pdf;filename=.*?;base64,/i, "").replace(/^data:application\/pdf;base64,/i, ""),
            dataUri,
            pageCount: doc.getNumberOfPages()
        };
    }
    throw new Error("Unsupported Organization Structure PDF mode.");
}

export { generateOrganizationStructurePdf };
export default generateOrganizationStructurePdf;
