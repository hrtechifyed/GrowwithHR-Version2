/* GrowWithHR company-wide founder intelligence PDF parity */
(() => {
    "use strict";

    const VERSION = "1.0.0-founder-intelligence-pdf-parity";
    const baseRenderers = window.GrowWithHRVisualReportRenderers;
    if (!baseRenderers || typeof baseRenderers.buildVariant !== "function") {
        throw new Error("GrowWithHR founder report renderers must load before founder intelligence parity.");
    }

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const list = (value) => Array.isArray(value) ? value : [];
    const COLOURS = Object.freeze({ heading: [10, 35, 66], text: [35, 51, 71], muted: [93, 109, 129], line: [219, 226, 234], accent: [217, 119, 6] });
    const PAGE = Object.freeze({ left: 18, right: 192, top: 22, bottom: 264 });

    function source(payload = {}, model = {}) {
        return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});
    }

    function addSummaryPages(doc, assessment, data, logo) {
        let y = PAGE.top;
        let summaryPages = [];
        const width = PAGE.right - PAGE.left;
        const lineHeight = (size, factor = 1.25) => size * 0.3528 * factor;
        const split = (value, maxWidth = width) => doc.splitTextToSize(clean(value), maxWidth);

        function startPage() {
            doc.addPage();
            summaryPages.push(doc.getNumberOfPages());
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 210, 297, "F");
            y = PAGE.top;
        }
        function ensure(height) { if (y + height > PAGE.bottom) startPage(); }
        function text(value, options = {}) {
            const content = clean(value);
            if (!content) return;
            const size = Number(options.size || 8.6);
            const maxWidth = Number(options.width || width);
            const factor = Number(options.factor || 1.25);
            const lines = split(content, maxWidth);
            const height = Math.max(lineHeight(size, factor), lines.length * lineHeight(size, factor));
            ensure(height + Number(options.after ?? 3));
            doc.setFont("helvetica", options.bold ? "bold" : "normal");
            doc.setFontSize(size);
            doc.setTextColor(...(options.colour || COLOURS.text));
            doc.text(lines, Number(options.x ?? PAGE.left), y, { maxWidth, lineHeightFactor: factor });
            y += height + Number(options.after ?? 3);
        }
        function heading(value) { text(value, { size: 17, bold: true, colour: COLOURS.heading, factor: 1.12, after: 6 }); }
        function eyebrow(value) { text(value.toUpperCase(), { size: 7, bold: true, colour: COLOURS.accent, after: 4 }); }
        function subheading(value) { text(value, { size: 10.5, bold: true, colour: COLOURS.heading, after: 4 }); }
        function bullet(value) { text(`• ${clean(value)}`, { size: 8.3, x: PAGE.left + 3, width: width - 3, after: 2 }); }
        function rule() { ensure(5); doc.setDrawColor(...COLOURS.line); doc.line(PAGE.left, y, PAGE.right, y); y += 5; }

        startPage();
        eyebrow("Company-wide founder intelligence");
        heading("Founder intelligence summary");
        text("This section uses the same deterministic company-wide applicability output as the web report. The object, action, missing-fact and trigger layers organise fixed results; they do not create another applicability engine.", { size: 8.8, colour: COLOURS.muted, after: 7 });

        const obligations = list(assessment.obligationObjects);
        subheading("Obligation objects");
        obligations.forEach((item) => {
            text(`${clean(item.title, "Compliance area")} — ${clean(item.founderLabel)}`, { size: 9, bold: true, colour: COLOURS.heading, after: 2 });
            text(clean(item.whatToUnderstand), { after: 2 });
            text(`Next action: ${clean(item.nextAction)}`, { size: 8.2, after: 2 });
            text(`Suggested routing: ${clean(item.ownerSuggestion, "Founder / HR / Specialist")} · Legal review status: Needs legal review`, { size: 7.5, colour: COLOURS.muted, after: 4 });
        });
        rule();

        subheading("Founder next actions");
        list(assessment.founderActions).forEach((action) => {
            text(clean(action.title), { size: 9, bold: true, colour: COLOURS.heading, after: 2 });
            text(clean(action.body), { size: 8.3, after: 3 });
        });
        rule();

        subheading("Missing company information");
        if (!list(assessment.missingFacts).length) text("No unresolved company fact is recorded for this snapshot.", { size: 8.3 });
        list(assessment.missingFacts).forEach((item) => bullet(`${clean(item.question, item.field)} — could affect ${list(item.affectedAreas).join(", ")}`));
        rule();

        subheading("Scale Trigger Matrix");
        if (!list(assessment.scaleTriggerMatrix).length) text("No below/near deterministic trigger row is recorded for this snapshot.", { size: 8.3 });
        list(assessment.scaleTriggerMatrix).forEach((item) => {
            text(`${clean(item.title)} — ${clean(item.currentLabel)}`, { size: 9, bold: true, colour: COLOURS.heading, after: 2 });
            text(`Current position: ${clean(item.currentPosition)} · Reassessment point: ${clean(item.reassessmentPoint)}`, { size: 8.2, after: 2 });
            text(clean(item.explanation), { size: 8, colour: COLOURS.muted, after: 4 });
        });
        rule();
        subheading("Deterministic and AI boundary");
        bullet("All applicability, status and trigger values originate in the deterministic engine.");
        bullet("RAG/provider output is explanation-only: usedForDecision: false; applicabilityAuthority: none.");
        bullet("No completion percentage, compliance score, evidence-upload state or legal certification is created.");

        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, "F");
        if (logo) {
            try { doc.addImage(logo, "PNG", 74, 48, 62, 62, undefined, "FAST"); } catch (_error) {}
        }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLOURS.heading);
        doc.setFontSize(25);
        doc.text("END OF REPORT", 105, 141, { align: "center" });
        doc.setFontSize(14);
        doc.text("GrowWithHR", 105, 168, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLOURS.muted);
        doc.text("HR Compliance for Growth", 105, 181, { align: "center" });
        doc.text(clean(data.companyName, "Your Organisation"), 105, 204, { align: "center", maxWidth: 170 });
        doc.text(clean(data.reportId, "Research Prototype"), 105, 218, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLOURS.accent);
        doc.text("RESEARCH PROTOTYPE", 105, 246, { align: "center" });
        return summaryPages;
    }

    function rewriteFooters(doc, data) {
        const total = doc.getNumberOfPages();
        for (let page = 2; page < total; page += 1) {
            doc.setPage(page);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 269, 210, 28, "F");
            doc.setDrawColor(...COLOURS.line);
            doc.line(PAGE.left, 274, PAGE.right, 274);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.7);
            doc.setTextColor(...COLOURS.muted);
            doc.text(`GrowWithHR · ${clean(data.reportId, "Research Prototype")}`, PAGE.left, 282, { maxWidth: 135 });
            doc.text(`${page} / ${total}`, PAGE.right, 282, { align: "right" });
        }
    }

    function resynchronise(report, data) {
        const doc = report.document;
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        return {
            ...report,
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: Number(buffer?.byteLength || 0),
            pageCount: Number(doc.getNumberOfPages?.() || 0),
            founderIntelligenceParityVersion: VERSION,
            companyWideIntelligence: true
        };
    }

    function buildVariant(JsPDF, theme, rows, model, payload, trace, logo) {
        const report = baseRenderers.buildVariant(JsPDF, theme, rows, model, payload, trace, logo);
        const api = window.GrowWithHRCompanyApplicability;
        if (!report?.document || typeof api?.assess !== "function") return report;
        const data = source(payload, model);
        const assessment = api.assess(payload, model);
        const doc = report.document;
        const originalTotal = doc.getNumberOfPages();
        if (originalTotal > 1 && typeof doc.deletePage === "function") doc.deletePage(originalTotal);
        addSummaryPages(doc, assessment, data, logo);
        rewriteFooters(doc, data);
        return resynchronise(report, data);
    }

    window.GrowWithHRVisualReportRenderers = Object.freeze({ ...baseRenderers, buildVariant, founderIntelligenceParityVersion: VERSION });
    window.GrowWithHRFounderIntelligenceParity = Object.freeze({ version: VERSION, installed: true, webPdfSharedOrchestrator: true, singlePdf: true, scorecards: false, evidenceUpload: false });
})();
