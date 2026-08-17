const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const RENDER_BASE = "https://growwithhr.onrender.com";
const METHOD_URL = "https://hrtechifyed.github.io/GrowwithHR-Version2/organization-structure-methodology.html";

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function apiBase() {
    return window.location.origin === GITHUB_PAGES_ORIGIN ? RENDER_BASE : "";
}

function safeSlug(value) {
    return cleanText(value, "Company")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "Company";
}

function pdfConstructor() {
    return window.jspdf?.jsPDF || window.jsPDF || null;
}

function statusLabel(value) {
    return ({ action: "Action", watch: "Watch", stable: "Stable", "needs-information": "Needs information" })[value] || value;
}

function uniqueSources(analysis) {
    const seen = new Set();
    const output = [];
    const items = [...(analysis.findings || []), analysis.scenario].filter(Boolean);
    for (const item of items) {
        for (const source of item.sources || []) {
            if (!source?.id || seen.has(source.id)) continue;
            seen.add(source.id);
            output.push(source);
        }
    }
    return output;
}

function primaryFinding(payload) {
    const id = payload.analysis?.report?.primaryConstraintId;
    return payload.analysis?.findings?.find((item) => item.id === id) || payload.analysis?.findings?.[0] || null;
}

function priorityFindings(payload) {
    const ids = payload.analysis?.report?.priorityFindingIds || [];
    return ids.map((id) => payload.analysis?.findings?.find((item) => item.id === id)).filter(Boolean);
}

function buildOrganizationStructurePdf(payload) {
    const JsPDF = pdfConstructor();
    if (!JsPDF) throw new Error("The PDF library is not available yet.");
    if (!payload?.analysis) throw new Error("No Organization Structure analysis is available.");

    const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
    const analysis = payload.analysis;
    const facts = analysis.facts || {};
    const report = analysis.report || {};
    const framework = analysis.methodology || {};
    const companyName = cleanText(facts.companyName || payload.data?.shared?.companyName, "Your Organisation");
    const reportId = cleanText(payload.reportId, payload.sample ? "SAMPLE-GWHR-ORG-001" : "Local analysis");
    const filename = `GrowWithHR-Organization-Structure-${safeSlug(companyName)}.pdf`;
    const pageWidth = 210;
    const pageHeight = 297;
    const left = 18;
    const right = 18;
    const contentWidth = pageWidth - left - right;
    const bottom = 24;
    let y = 24;

    const brand = {
        navy: [10, 16, 32],
        navy2: [18, 26, 43],
        orange: [255, 122, 0],
        gold: [255, 176, 0],
        text: [30, 41, 59],
        muted: [92, 101, 116],
        line: [219, 224, 231],
        white: [255, 255, 255],
        soft: [255, 247, 237]
    };

    function setColor(rgb) { doc.setTextColor(...rgb); }
    function lineHeight(size, factor = 1.35) { return size * 0.3528 * factor; }
    function ensure(height) {
        if (y + height <= pageHeight - bottom) return;
        doc.addPage();
        y = 22;
    }
    function heading(text, size = 17) {
        ensure(16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        setColor(brand.navy);
        const lines = doc.splitTextToSize(cleanText(text), contentWidth);
        doc.text(lines, left, y);
        y += lines.length * lineHeight(size, 1.18) + 4;
    }
    function kicker(text) {
        ensure(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.2);
        setColor(brand.orange);
        doc.text(cleanText(text).toUpperCase(), left, y);
        y += 5.5;
    }
    function paragraph(text, options = {}) {
        const size = options.size || 9.5;
        const color = options.color || brand.text;
        const width = options.width || contentWidth;
        const spacing = options.spacing ?? 5;
        const lines = doc.splitTextToSize(cleanText(text, "Not provided"), width);
        ensure(lines.length * lineHeight(size) + spacing);
        doc.setFont("helvetica", options.bold ? "bold" : "normal");
        doc.setFontSize(size);
        setColor(color);
        doc.text(lines, left + (options.indent || 0), y, { lineHeightFactor: 1.35 });
        y += lines.length * lineHeight(size) + spacing;
    }
    function ruleLine(label, value) {
        ensure(9);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.6);
        setColor(brand.navy);
        doc.text(`${label}:`, left, y);
        doc.setFont("helvetica", "normal");
        setColor(brand.text);
        const lines = doc.splitTextToSize(cleanText(value, "Not provided"), contentWidth - 42);
        doc.text(lines, left + 42, y, { lineHeightFactor: 1.3 });
        y += Math.max(6, lines.length * lineHeight(8.6, 1.3) + 2);
    }
    function sourceList(sources) {
        for (const source of sources || []) {
            ensure(14);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            setColor(brand.orange);
            const title = doc.splitTextToSize(`${source.publisher}: ${source.title}`, contentWidth - 4);
            doc.text(title, left + 3, y, { lineHeightFactor: 1.2 });
            y += title.length * lineHeight(8.5, 1.2) + 1;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.7);
            setColor(brand.muted);
            const meta = doc.splitTextToSize(`${source.section} · ${source.access} · reviewed ${source.reviewedAt || framework.reviewedAt || "not recorded"}`, contentWidth - 4);
            doc.text(meta, left + 3, y, { lineHeightFactor: 1.2 });
            y += meta.length * lineHeight(7.7, 1.2) + 1;
            const url = cleanText(source.url);
            if (url) {
                setColor([5, 99, 193]);
                doc.textWithLink?.("Open public source", left + 3, y, { url });
                if (!doc.textWithLink) doc.text(url, left + 3, y);
                y += 5;
            }
        }
    }
    function divider() {
        ensure(4);
        doc.setDrawColor(...brand.line);
        doc.line(left, y, pageWidth - right, y);
        y += 5;
    }

    // Cover
    doc.setFillColor(...brand.navy);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(...brand.gold);
    doc.rect(0, 0, 74, 5, "F");
    doc.setFillColor(...brand.orange);
    doc.rect(74, 0, 78, 5, "F");
    doc.setFillColor(255, 77, 0);
    doc.rect(152, 0, 58, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...brand.gold);
    doc.text("HRTECHIFY · GROWWITHHR", left, 35);
    doc.setFontSize(30);
    doc.setTextColor(...brand.white);
    doc.text(doc.splitTextToSize("Organization Structure Report", 150), left, 58, { lineHeightFactor: 1.05 });
    doc.setFontSize(15);
    doc.setTextColor(203, 213, 225);
    doc.text(doc.splitTextToSize(companyName, 150), left, 90);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Report ID: ${reportId}`, left, 111);
    doc.text(`Framework: ${cleanText(framework.name)} v${cleanText(framework.version)}`, left, 119);
    doc.text(`Generated: ${new Date(payload.generatedAt || analysis.generatedAt || Date.now()).toLocaleDateString("en-IN")}`, left, 127);
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize("A deterministic structural assessment with the public source and GrowWithHR rule shown for each recommendation.", 160), left, 155, { lineHeightFactor: 1.4 });
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(doc.splitTextToSize("This report evaluates organizational structure and operating patterns. It does not assess individual capability, recommend dismissals, determine compensation, or provide legal advice.", 160), left, 244, { lineHeightFactor: 1.4 });

    doc.addPage(); y = 22;
    kicker("Executive Overview");
    heading(report.executiveSummary || "Organization Structure overview", 19);
    paragraph(`Company: ${companyName} · Report ID: ${reportId}`, { color: brand.muted, size: 8.5 });
    ruleLine("Action", analysis.statusSummary?.action || 0);
    ruleLine("Watch", analysis.statusSummary?.watch || 0);
    ruleLine("Stable", analysis.statusSummary?.stable || 0);
    ruleLine("Needs information", analysis.statusSummary?.["needs-information"] || 0);
    divider();
    heading("Key structural metrics", 13);
    ruleLine("Employees", facts.employees ?? "Not provided");
    ruleLine("People managers", facts.peopleManagerCount ?? "Not provided");
    ruleLine("Employees per manager", analysis.derivedMetrics?.currentEmployeeToManagerRatio ?? "Not available");
    ruleLine("12-month planned headcount", facts.expectedEmployees12Months ?? "Not provided");
    ruleLine("Contextual span watch / action triggers", `${analysis.derivedMetrics?.contextualSpanWatchTrigger ?? "—"}:1 / ${analysis.derivedMetrics?.contextualSpanActionTrigger ?? "—"}:1`);
    const primary = primaryFinding(payload);
    if (primary) {
        divider(); kicker("Primary Constraint"); heading(primary.title, 14); paragraph(primary.whyItMatters); paragraph(`What to do next: ${primary.action}`, { bold: true });
        paragraph(`GrowWithHR rule: ${primary.ruleBasis}`, { color: brand.muted, size: 8.7 });
        sourceList(primary.sources);
    }
    const priorities = priorityFindings(payload);
    if (priorities.length) {
        divider(); heading("Top priorities", 13);
        priorities.forEach((item, index) => paragraph(`${index + 1}. ${item.title} — ${item.action}`, { size: 9.2 }));
    }

    doc.addPage(); y = 22;
    kicker("Detailed Findings");
    heading("What triggered each result, why it matters, and where the principle comes from", 16);
    paragraph("Public sources support the organization-design principle. The GrowWithHR rule explains how the supplied company facts were converted into the displayed status. Prototype numeric triggers are identified as GrowWithHR rules rather than external benchmarks.", { color: brand.muted, size: 8.8 });
    for (const item of analysis.findings || []) {
        ensure(58);
        divider();
        kicker(`${statusLabel(item.status)} · ${item.id}`);
        heading(item.title, 12.5);
        paragraph(item.whyItMatters, { size: 9 });
        paragraph(`What to do next: ${item.action}`, { bold: true, size: 9 });
        paragraph(`Reassess when: ${item.growthTrigger}`, { color: brand.muted, size: 8.4 });
        paragraph(`Facts used: ${(item.factsUsed || []).join(", ") || "No confirmed fact used yet"}`, { color: brand.muted, size: 8.2 });
        if ((item.missingFacts || []).length) paragraph(`Missing information: ${item.missingFacts.join(", ")}`, { color: brand.muted, size: 8.2 });
        paragraph(`GrowWithHR rule: ${item.ruleBasis}`, { color: brand.muted, size: 8.5 });
        sourceList(item.sources);
    }

    doc.addPage(); y = 22;
    kicker("12-Month Growth Scenario");
    heading("If headcount changes and manager count stays unchanged", 17);
    paragraph(analysis.scenario?.disclaimer, { color: brand.muted, size: 8.8 });
    ruleLine("Today", `${facts.employees ?? "—"} employees · ${facts.peopleManagerCount ?? "—"} people managers · ${analysis.derivedMetrics?.currentEmployeeToManagerRatio ?? "—"}:1`);
    ruleLine("12-month assumption", `${facts.expectedEmployees12Months ?? "—"} employees · ${facts.peopleManagerCount ?? "—"} people managers · ${analysis.scenario?.projectedEmployeeToManagerRatio ?? "—"}:1`);
    ruleLine("Contextual watch / action triggers", `${analysis.scenario?.contextualWatchTrigger ?? "—"}:1 / ${analysis.scenario?.contextualActionTrigger ?? "—"}:1`);
    paragraph(analysis.scenario?.interpretation, { bold: true });
    if ((analysis.scenario?.assumptions || []).length) {
        heading("Assumptions", 12.5);
        analysis.scenario.assumptions.forEach((item) => paragraph(`• ${item}`, { size: 9 }));
    }
    paragraph(`GrowWithHR rule: ${analysis.scenario?.ruleBasis || "Not recorded"}`, { color: brand.muted, size: 8.5 });
    sourceList(analysis.scenario?.sources);

    doc.addPage(); y = 22;
    kicker("Framework & Evidence");
    heading(`${cleanText(framework.name)} v${cleanText(framework.version)}`, 16);
    paragraph(cleanText(framework.statement), { size: 9.2 });
    ruleLine("Framework access", cleanText(framework.access, "Free public methodology"));
    ruleLine("Last reviewed", cleanText(framework.reviewedAt, "Not recorded"));
    paragraph(`Methodology: ${cleanText(framework.publicMethodologyUrl, METHOD_URL)}`, { color: [5, 99, 193], size: 8.4 });
    heading("Public sources used", 13);
    sourceList(uniqueSources(analysis));
    heading("Framework version history", 13);
    (framework.versionHistory || []).forEach((item) => paragraph(`${item.version} · ${item.date} — ${item.summary}`, { size: 8.8 }));
    heading("Important boundaries", 13);
    paragraph("GrowWithHR Organization Structure is a structural planning tool. It does not assess individuals, determine legal applicability, decide compensation, or claim that a public source prescribed GrowWithHR's prototype thresholds.", { size: 8.8 });

    const pages = doc.getNumberOfPages();
    for (let page = 2; page <= pages; page += 1) {
        doc.setPage(page);
        doc.setDrawColor(...brand.orange);
        doc.line(left, pageHeight - 15, pageWidth - right, pageHeight - 15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(...brand.navy);
        doc.text("HRTechify | GrowWithHR · Organization Structure", left, pageHeight - 10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...brand.muted);
        doc.text(`Page ${page} of ${pages}`, pageWidth - right, pageHeight - 10, { align: "right" });
    }

    const dataUri = doc.output("datauristring");
    const base64 = dataUri.split(",")[1] || "";
    const sizeBytes = Math.max(0, Math.floor(base64.length * 3 / 4));
    return { doc, base64, dataUri, filename, sizeBytes };
}

function eventPayload(payload, eventType, filename = "") {
    const analysis = payload.analysis || {};
    const framework = analysis.methodology || {};
    return {
        eventType,
        reportType: "organization-structure",
        reportId: cleanText(payload.reportId),
        companyName: cleanText(analysis.facts?.companyName || payload.data?.shared?.companyName),
        userEmail: cleanText(analysis.facts?.email || payload.data?.shared?.email),
        filename,
        framework: `${cleanText(framework.name)} v${cleanText(framework.version)}`
    };
}

function notifyReportEvent(payload, eventType, filename = "") {
    if (payload?.sample) return Promise.resolve({ skipped: true });
    const url = `${apiBase()}/api/report-event`;
    const body = JSON.stringify(eventPayload(payload, eventType, filename));
    try {
        if (navigator.sendBeacon) {
            const sent = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
            if (sent) return Promise.resolve({ accepted: true, transport: "beacon" });
        }
    } catch (_error) {}
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        keepalive: true,
        body
    }).then((response) => response.json().catch(() => ({}))).catch(() => ({ accepted: false }));
}

async function downloadOrganizationStructurePdf(payload) {
    const generated = buildOrganizationStructurePdf(payload);
    generated.doc.save(generated.filename);
    void notifyReportEvent(payload, "report-downloaded", generated.filename);
    return generated;
}

async function emailOrganizationStructureReport(payload) {
    if (payload?.sample) throw new Error("Sample reports are not emailed. Complete your own Organization Structure assessment first.");
    const generated = buildOrganizationStructurePdf(payload);
    const analysis = payload.analysis || {};
    const framework = analysis.methodology || {};
    const recipientEmail = cleanText(analysis.facts?.email || payload.data?.shared?.email);
    if (!/^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(recipientEmail)) {
        throw new Error("A valid work email is required to send this report.");
    }
    const response = await fetch(`${apiBase()}/api/send-organization-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
            recipientEmail,
            recipientName: cleanText(payload.data?.shared?.contactName),
            companyName: cleanText(analysis.facts?.companyName || payload.data?.shared?.companyName),
            reportId: cleanText(payload.reportId),
            frameworkName: cleanText(framework.name),
            frameworkVersion: cleanText(framework.version),
            methodologyUrl: cleanText(framework.publicMethodologyUrl, METHOD_URL),
            pdf: { base64: generated.base64, filename: generated.filename, sizeBytes: generated.sizeBytes }
        })
    });
    let body = {};
    try { body = await response.json(); } catch (_error) {}
    if (!response.ok || body.ok === false || body.customerSent !== true) {
        throw new Error(cleanText(body.error, "The Organization Structure report could not be emailed."));
    }
    return { ...body, generated };
}

export {
    buildOrganizationStructurePdf,
    downloadOrganizationStructurePdf,
    emailOrganizationStructureReport,
    notifyReportEvent
};
