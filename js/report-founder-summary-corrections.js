/* GrowWithHR founder-brief final report corrections */
(() => {
    "use strict";

    const VERSION = "0.23.1-founder-summary-corrections";
    const INSTALL_FLAG = "__growwithhrFounderSummaryCorrectionsInstalled";

    const TOC_ITEMS = Object.freeze([
        ["Executive Snapshot", ["EXECUTIVE SNAPSHOT", "ABOUT YOUR ORGANISATION"]],
        ["Executive Summary", ["EXECUTIVE SUMMARY", "FOUNDER FIVE-MINUTE BRIEF"]],
        ["Understanding Intelligence Engine", ["UNDERSTANDING INTELLIGENCE ENGINE"]],
        ["Evidence and Missing Information", ["EVIDENCE AND MISSING INFORMATION"]],
        ["Positive Foundations", ["POSITIVE FOUNDATIONS"]],
        ["Compliance Review", ["COMPLIANCE REVIEW"]],
        ["Strategic Recommendations", ["STRATEGIC RECOMMENDATIONS"]],
        ["Priority Compliance Actions", ["PRIORITY COMPLIANCE ACTIONS"]],
        ["Upcoming Compliance Triggers", ["UPCOMING COMPLIANCE TRIGGERS"]],
        ["Roadmap - 0 to 90 days", ["ROADMAP - 0 TO 90 DAYS"]],
        ["Looking Ahead", ["LOOKING AHEAD", "PREPARING FOR THE NEXT STAGE OF GROWTH"]],
        ["ANNEXURE", []],
        ["Law-by-Law Understanding", ["LAW-BY-LAW UNDERSTANDING"]],
        ["Governed Law Index", ["GOVERNED LAW INDEX"]],
        ["Important Information", ["IMPORTANT INFORMATION", "CONFIDENTIALITY, PRIVACY AND DISCLAIMER"]]
    ]);

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const colour = (doc, method, value) => doc[method](...value);

    function palette(name) {
        return /dark/i.test(clean(name))
            ? {
                page: [0, 0, 0], panel: [10, 10, 10], alt: [21, 21, 21],
                text: [238, 238, 238], muted: [184, 184, 184], head: [255, 255, 255],
                line: [68, 68, 68], accent: [245, 158, 11], green: [91, 214, 148],
                amber: [255, 190, 75], red: [255, 120, 110]
            }
            : {
                page: [255, 255, 255], panel: [244, 247, 251], alt: [232, 239, 248],
                text: [10, 24, 48], muted: [53, 72, 99], head: [4, 28, 67],
                line: [166, 181, 202], accent: [245, 158, 11], green: [23, 128, 73],
                amber: [184, 102, 0], red: [180, 35, 24]
            };
    }

    function paintPage(doc, colours) {
        colour(doc, "setFillColor", colours.page);
        doc.rect(0, 0, 210, 297, "F");
        colour(doc, "setDrawColor", colours.line);
        doc.setLineWidth(0.35);
        doc.rect(5.5, 5.5, 199, 286, "S");
    }

    function pageText(doc, page) {
        try {
            return (doc.internal.pages?.[page] || []).join(" ").toUpperCase();
        } catch (_error) {
            return "";
        }
    }

    function pageContains(doc, page, phrases) {
        const content = pageText(doc, page);
        return phrases.some((phrase) => content.includes(phrase));
    }

    function findPage(doc, phrases) {
        for (let page = 3; page <= doc.getNumberOfPages(); page += 1) {
            if (pageContains(doc, page, phrases)) return page;
        }
        return 0;
    }

    function deleteSourceLabelledPages(doc) {
        const targets = [];
        for (let page = 3; page <= doc.getNumberOfPages(); page += 1) {
            const content = pageText(doc, page);
            if (
                content.includes("AREAS REQUIRING LEADERSHIP ATTENTION") ||
                content.includes("SELECTED BY YOU") ||
                content.includes("COMPANY DNA SUGGESTION")
            ) {
                targets.push(page);
            }
        }
        targets.sort((left, right) => right - left).forEach((page) => doc.deletePage(page));
    }

    function deleteOldExecutiveSummary(doc) {
        const targets = [];
        for (let page = 3; page <= doc.getNumberOfPages(); page += 1) {
            const content = pageText(doc, page);
            if (
                content.includes("WHAT MATTERS NEXT") ||
                content.includes("EXECUTIVE SUMMARY · CONTINUED")
            ) {
                targets.push(page);
            }
        }
        targets.sort((left, right) => right - left).forEach((page) => doc.deletePage(page));
    }

    function source(payload = {}, model = {}) {
        return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});
    }

    function actionRows(rows) {
        const rank = { "Applicable": 0, "Needs information": 1, "Review required": 2 };
        return rows
            .filter((row) => row.status !== "Not currently triggered")
            .sort((left, right) => (rank[left.status] ?? 9) - (rank[right.status] ?? 9) || clean(left.shortTitle).localeCompare(clean(right.shortTitle)))
            .slice(0, 3);
    }

    function addFounderSummary(doc, colours, payload, model, rows) {
        const data = source(payload, model);
        const split = (value, width = 178) => doc.splitTextToSize(clean(value), width);
        let y = 24;

        function ensure(height) {
            if (y + height <= 270) return;
            doc.addPage();
            paintPage(doc, colours);
            y = 24;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            colour(doc, "setTextColor", colours.accent);
            doc.text("EXECUTIVE SUMMARY · CONTINUED", 16, y);
            y += 10;
        }

        function text(value, options = {}) {
            const size = Number(options.size || 8.7);
            const factor = Number(options.factor || 1.34);
            const lines = split(value, Number(options.width || 178));
            const height = lines.length * size * 0.3528 * factor;
            ensure(height + Number(options.after ?? 4));
            doc.setFont("helvetica", options.style || "normal");
            doc.setFontSize(size);
            colour(doc, "setTextColor", options.colour || colours.text);
            doc.text(lines, Number(options.x || 16), y, { lineHeightFactor: factor, maxWidth: Number(options.width || 178) });
            y += height + Number(options.after ?? 4);
        }

        function callout(title, body, titleColour = colours.head) {
            const titleLines = split(title, 166);
            const bodyLines = split(body, 166);
            const height = Math.max(23, titleLines.length * 4.2 + bodyLines.length * 3.8 + 15);
            ensure(height + 5);
            colour(doc, "setFillColor", colours.panel);
            colour(doc, "setDrawColor", colours.line);
            doc.roundedRect(16, y - 4, 178, height, 2, 2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.4);
            colour(doc, "setTextColor", titleColour);
            doc.text(titleLines, 22, y + 3, { lineHeightFactor: 1.2, maxWidth: 166 });
            const bodyY = y + 7 + titleLines.length * 4.2;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.2);
            colour(doc, "setTextColor", colours.text);
            doc.text(bodyLines, 22, bodyY, { lineHeightFactor: 1.32, maxWidth: 166 });
            y += height + 5;
        }

        doc.addPage();
        const newPage = doc.getNumberOfPages();
        paintPage(doc, colours);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        colour(doc, "setTextColor", colours.accent);
        doc.text("PRESENT · LEADERSHIP BRIEF", 16, y);
        y += 8;
        text("Executive Summary", { size: 19, style: "bold", colour: colours.head, factor: 1.15, after: 5 });
        text("Founder five-minute brief: where the organisation is today, what requires attention, what to do next and what future change may alter the answer.", { colour: colours.muted, after: 7 });

        const employeeCount = Number(data.employees ?? 0);
        const workforce = employeeCount === 1 ? "1 reported employee" : `${employeeCount || "Unconfirmed"} reported employees`;
        const footprint = clean(data.primaryState || data.state, "the reported operating location");
        callout(
            "Where you are today",
            `${clean(data.companyName, "The organisation")} operates in ${clean(data.industry, "the reported industry")} with ${workforce}. The working model is ${clean(data.workModel, "not confirmed")} and the primary operating base is ${footprint}.`
        );

        const counts = Object.fromEntries(["Applicable", "Review required", "Needs information", "Not currently triggered"]
            .map((status) => [status, rows.filter((row) => row.status === status).length]));
        const attention = actionRows(rows);
        callout(
            "What needs attention now",
            `${counts.Applicable} laws are assessed as applicable, ${counts["Review required"]} require review, ${counts["Needs information"]} need more information and ${counts["Not currently triggered"]} are not currently triggered. ${attention.length ? `Start with ${attention.map((row, index) => `A${index + 1} ${row.shortTitle}`).join(", ")}.` : "No immediate governed action was generated."}`,
            attention.length ? colours.amber : colours.green
        );

        attention.forEach((row, index) => {
            callout(
                `A${index + 1} · ${row.shortTitle}`,
                `${clean(row.thresholdResult?.explanation, row.thresholdResult?.label)}\n\nDo now: ${clean(row.requiredAction)}`,
                row.status === "Applicable" ? colours.green : row.status === "Needs information" ? colours.red : colours.amber
            );
        });

        callout(
            "What changes the answer in future",
            "Reassess when employee or worker counts change, a new worker category is engaged, the organisation enters another state, manufacturing or power usage changes, night shifts begin, or the working model materially changes."
        );
        callout(
            "Founder takeaway",
            "Do not try to complete the whole report at once. Confirm the first three actions, assign one owner to each, retain evidence of completion and review progress inside the 0–90-day roadmap."
        );

        return newPage;
    }

    function moveSummaryAfterSnapshot(doc, summaryPage) {
        if (typeof doc.movePage !== "function") return;
        const snapshotPage = findPage(doc, ["EXECUTIVE SNAPSHOT", "ABOUT YOUR ORGANISATION"]);
        if (!snapshotPage || summaryPage === snapshotPage + 1) return;
        doc.movePage(summaryPage, snapshotPage + 1);
    }

    function redrawContents(doc, colours) {
        if (doc.getNumberOfPages() < 2) return;
        doc.setPage(2);
        paintPage(doc, colours);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        colour(doc, "setTextColor", colours.accent);
        doc.text("REPORT GUIDE", 16, 24);
        doc.setFontSize(22);
        colour(doc, "setTextColor", colours.head);
        doc.text("Table of Contents", 16, 39);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.2);
        colour(doc, "setTextColor", colours.muted);
        doc.text("Read the founder brief first: present position → meaning → action → future triggers. Use the annexure for detailed legal reference.", 16, 49, { maxWidth: 178 });

        let y = 63;
        TOC_ITEMS.forEach(([label, phrases], index) => {
            if (!phrases.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                colour(doc, "setTextColor", colours.accent);
                doc.text(label, 20, y + 1);
                y += 9;
                return;
            }
            const page = findPage(doc, phrases);
            if (!page || y > 267) return;
            colour(doc, "setFillColor", index % 2 ? colours.panel : colours.alt);
            doc.roundedRect(16, y - 6, 178, 10.5, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.8);
            colour(doc, "setTextColor", colours.text);
            const indent = ["Law-by-Law Understanding", "Governed Law Index", "Important Information"].includes(label) ? 27 : 21;
            doc.text(label, indent, y + 0.5);
            colour(doc, "setTextColor", colours.accent);
            doc.text(String(Math.max(1, page - 2)), 188, y + 0.5, { align: "right" });
            y += 11.5;
        });
    }

    function redrawPageNumbers(doc, colours) {
        const total = Math.max(0, doc.getNumberOfPages() - 3);
        for (let page = 3; page < doc.getNumberOfPages(); page += 1) {
            doc.setPage(page);
            colour(doc, "setFillColor", colours.page);
            doc.rect(158, 278, 38, 10, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            colour(doc, "setTextColor", colours.muted);
            doc.text(`Page ${page - 2} of ${total}`, 190, 284, { align: "right" });
        }
    }

    function serialiseVariant(variant) {
        if (!variant?.document?.output) return;
        const dataUri = variant.document.output("datauristring");
        const buffer = variant.document.output("arraybuffer");
        Object.assign(variant, {
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: buffer.byteLength,
            pageCount: variant.document.getNumberOfPages(),
            founderSummaryVersion: VERSION
        });
    }

    function install() {
        const service = window.GrowWithHRPDF;
        if (
            !service ||
            typeof service.buildAdvisoryPdf !== "function" ||
            typeof service.buildAdvisoryModel !== "function" ||
            !service.reportSequenceVersion ||
            service[INSTALL_FLAG]
        ) return false;

        const originalBuild = service.buildAdvisoryPdf.bind(service);
        const originalModel = service.buildAdvisoryModel.bind(service);

        async function buildAdvisoryPdf(payload = {}) {
            const result = await originalBuild(payload);
            if (!result) return result;

            const model = originalModel(payload);
            const rows = typeof service.buildReportLawTransparency === "function"
                ? service.buildReportLawTransparency(payload, model)
                : [];
            const variants = Array.isArray(result?.pdfs) ? result.pdfs : [result];

            variants.forEach((variant) => {
                if (!variant?.document) return;
                const doc = variant.document;
                const colours = palette(variant.theme || payload.theme || result.theme);
                deleteSourceLabelledPages(doc);
                deleteOldExecutiveSummary(doc);
                const summaryPage = addFounderSummary(doc, colours, payload, model, rows);
                moveSummaryAfterSnapshot(doc, summaryPage);
                redrawContents(doc, colours);
                redrawPageNumbers(doc, colours);
                serialiseVariant(variant);
            });

            if (Array.isArray(result?.pdfs)) {
                result.sizeBytes = result.pdfs.reduce((sum, variant) => sum + Number(variant.sizeBytes || 0), 0);
                result.pageCounts = Object.fromEntries(result.pdfs.map((variant) => [variant.theme, variant.pageCount]));
                const first = result.pdfs[0];
                if (first) Object.assign(result, { dataUri: first.dataUri, base64: first.base64, pageCount: first.pageCount });
            }
            return Object.assign(result, { founderSummaryVersion: VERSION });
        }

        const enhanced = Object.freeze({ ...service, [INSTALL_FLAG]: true, founderSummaryVersion: VERSION, buildAdvisoryPdf });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        return true;
    }

    if (!install()) {
        let attempts = 0;
        const timer = window.setInterval?.(() => {
            attempts += 1;
            if (install() || attempts >= 100) window.clearInterval?.(timer);
        }, 100);
    }

    window.GrowWithHRFounderSummaryCorrections = Object.freeze({
        version: VERSION,
        install,
        deleteSourceLabelledPages,
        deleteOldExecutiveSummary
    });
})();
