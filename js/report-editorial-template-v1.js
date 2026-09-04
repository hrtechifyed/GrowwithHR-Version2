/* GrowWithHR editorial research report template
 *
 * This layer is presentation-only. It intentionally consumes the existing
 * deterministic assessment/model/rows and does not replace applicability,
 * report identity, email delivery, or company-wide intelligence logic.
 */
(() => {
    "use strict";

    const baseCore = window.GrowWithHRVisualReportCore;
    const baseRenderers = window.GrowWithHRVisualReportRenderers;
    if (!baseCore || !baseRenderers || typeof baseRenderers.buildVariant !== "function") {
        throw new Error("GrowWithHR visual report renderers must load before the editorial template.");
    }

    const VERSION = "1.0.0-editorial-research-template";
    const TEMPLATE_ID = "hrtechify-founder-compliance-growth-v1";
    const STYLE_ID = "editorial-research-v1";
    const LOGO_ASSET = "assets/hrtechify-logo.png";
    const STRUCTURE_VERSION = "founder-demo-single-v1";

    const PAGE = Object.freeze({ width: 210, height: 297, left: 10, right: 200, top: 26, bottom: 267 });
    const COLOURS = Object.freeze({
        page: [244, 240, 230],
        ink: [39, 42, 42],
        muted: [82, 86, 86],
        rule: [55, 59, 58],
        softRule: [205, 199, 185],
        green: [118, 151, 126],
        greenDark: [72, 103, 81],
        amber: [157, 116, 39],
        red: [139, 73, 62],
        blue: [64, 92, 119]
    });

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
    const uniq = (items) => [...new Set(items.map((item) => clean(item)).filter(Boolean))];
    const mergeSource = (payload = {}, model = {}) => Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});

    function displayTimestamp(value) {
        const date = value ? new Date(value) : new Date();
        try {
            return new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).format(date).replace(/\s?(am|pm)$/i, (match) => match.trim().toLowerCase());
        } catch (_error) {
            return date.toISOString();
        }
    }

    function formatCount(value, fallback = "—") {
        if (value === 0 || value === "0") return "0";
        return clean(value, fallback);
    }

    function formatAnswer(value, fallback = "—") {
        if (value === true) return "Yes";
        if (value === false) return "No";
        return formatCount(value, fallback);
    }

    function rowTitle(row = {}) {
        return clean(row.shortTitle || row.title || row.name || row.id, "Compliance area");
    }

    function sourceUrl(row = {}) {
        return clean(row.sourceReference || row.url || row.officialUrl || row.sourceUrl || row.statePortalUrl || row.officialSourceUrl || row.legalSourceUrl);
    }

    function founderLabel(row = {}) {
        const value = clean(row.founderLabel || row.status);
        if (value === "Applicable") return "Relevant now";
        if (value === "Review required") return "Review needed";
        if (value === "Needs information") return "Needs information";
        if (value === "Not currently triggered") return "Watch as you grow";
        return value || "Review needed";
    }

    function statusKind(row = {}) {
        const value = clean(row.backendStatus || row.status);
        if (value === "Applicable") return "relevant";
        if (value === "Review required") return "review";
        if (value === "Needs information") return "missing";
        return "watch";
    }

    function statusColour(kind) {
        if (kind === "relevant") return COLOURS.greenDark;
        if (kind === "review") return COLOURS.amber;
        if (kind === "missing") return COLOURS.red;
        return COLOURS.blue;
    }

    function assessmentFor(payload, model, rows) {
        const api = window.GrowWithHRCompanyApplicability;
        if (typeof api?.assess === "function") {
            try { return api.assess(payload, model); } catch (_error) {}
        }
        return {
            findings: rows,
            obligationObjects: [],
            founderActions: [],
            missingFacts: [],
            scaleTriggerMatrix: [],
            ragPolicy: { usedForDecision: false, applicabilityAuthority: "none" }
        };
    }

    function normaliseObligations(assessment, rows) {
        const sourceRows = list(assessment?.findings).length ? list(assessment.findings) : list(rows);
        const rowById = new Map(sourceRows.map((row) => [clean(row.id || row.findingId), row]));
        const objects = list(assessment?.obligationObjects);
        if (objects.length) {
            return objects.map((item) => {
                const row = rowById.get(clean(item.findingId || item.complianceFamily)) || {};
                return {
                    ...row,
                    ...item,
                    id: clean(item.findingId || row.id),
                    title: clean(item.title || rowTitle(row)),
                    status: clean(item.backendStatus || row.status),
                    founderLabel: clean(item.founderLabel || founderLabel(row)),
                    reason: clean(item.reason || item.whatToUnderstand || row.thresholdResult?.explanation || row.whyIncluded),
                    nextAction: clean(item.nextAction || row.action),
                    ownerSuggestion: clean(item.ownerSuggestion),
                    sourceReference: clean(item.sourceReference || sourceUrl(row)),
                    companyFactsUsed: list(item.companyFactsUsed).length ? list(item.companyFactsUsed) : list(row.confirmedInputs),
                    missingFacts: list(item.missingFacts).length ? list(item.missingFacts) : list(row.missingInputs),
                    trigger: item.trigger || row.thresholdResult || {}
                };
            });
        }
        return sourceRows.map((row) => ({
            ...row,
            id: clean(row.id),
            title: rowTitle(row),
            status: clean(row.status),
            founderLabel: founderLabel(row),
            reason: clean(row.thresholdResult?.explanation || row.whyIncluded),
            nextAction: clean(row.action),
            ownerSuggestion: clean(row.ownerSuggestion),
            sourceReference: sourceUrl(row),
            companyFactsUsed: list(row.confirmedInputs),
            missingFacts: list(row.missingInputs),
            trigger: row.trigger || row.thresholdResult || {}
        }));
    }

    function companyFacts(data) {
        const states = Array.isArray(data.operatingStates) ? data.operatingStates.join(", ") : clean(data.operatingStates);
        return [
            ["Legal structure", clean(data.entity || data.legalStructure || data.establishmentType)],
            ["Industry", clean(data.customIndustry || data.industry)],
            ["Primary state", clean(data.primaryState || data.state)],
            ["Working model", clean(data.workModel || data.workingModel)],
            ["Employees", formatCount(data.employees ?? data.employeeCount ?? data.headcount)],
            ["Women employees", formatAnswer(data.womenEmployees ?? data.femaleEmployees ?? data.hasWomenEmployees)],
            ["Contractors", formatCount(data.contractors ?? data.contractWorkers ?? data.contractorCount, "0")],
            ["Workers", formatCount(data.workers ?? data.workerCount ?? data.workmen, "0")],
            ["Operating states", states],
            ["Planned workforce", formatCount(data.plannedEmployees ?? data.plannedHeadcount ?? data.futureEmployees ?? data.targetHeadcount, "")]
        ].filter(([, value]) => clean(value));
    }

    function reportGroups(obligations) {
        return {
            relevant: obligations.filter((item) => statusKind(item) === "relevant"),
            review: obligations.filter((item) => statusKind(item) === "review"),
            missing: obligations.filter((item) => statusKind(item) === "missing"),
            watch: obligations.filter((item) => statusKind(item) === "watch")
        };
    }

    function templateContext(data, groups) {
        const company = clean(data.companyName, "Your organisation");
        const employees = formatCount(data.employees ?? data.employeeCount ?? data.headcount, "");
        const employeePhrase = employees ? `${employees}-employee company today` : "Company snapshot today";
        const unresolved = groups.missing.length;
        const current = groups.relevant.length + groups.review.length;
        const watch = groups.watch.length;
        const supplied = data.reportTemplateContext || data.templateContext || {};
        const summary = [
            employeePhrase,
            `${current} area${current === 1 ? "" : "s"} relevant now or needing review`,
            `${watch} growth trigger${watch === 1 ? "" : "s"} to watch`,
            unresolved ? `${unresolved} area${unresolved === 1 ? "" : "s"} blocked on missing information` : "no unresolved missing-information finding"
        ].join(" · ");
        return {
            productLine: clean(supplied.productLine || data.reportProductLine, "GrowWithHR — HR Compliance & Growth"),
            prototypeLabel: clean(supplied.prototypeLabel || data.prototypeLabel, "Research prototype"),
            headline: clean(supplied.headline, `${company},\ncompliance-ready\nor not.`),
            dek: clean(supplied.dek, `${summary}. The report preserves the deterministic finding, its trigger, the company facts used, and the next action without inferring missing information.`)
        };
    }

    function buildCanvas(doc, logo) {
        let y = PAGE.top;
        let pageIndex = 1;
        const pendingLinks = [];
        const split = (value, width) => doc.splitTextToSize(clean(value), width);
        const mmPerPt = 0.3528;
        const lineHeight = (size, factor = 1.25) => size * mmPerPt * factor;

        function paintBackground() {
            doc.setFillColor(...COLOURS.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
        }

        function drawHeader() {
            if (logo) {
                try { doc.addImage(logo, "PNG", PAGE.left, 8.2, 8.5, 8.5, undefined, "FAST"); } catch (_error) {}
            }
        }

        function startPage() {
            if (pageIndex > 0) doc.addPage();
            pageIndex = doc.getNumberOfPages();
            paintBackground();
            drawHeader();
            y = PAGE.top;
        }

        function nextPage() {
            doc.addPage();
            pageIndex = doc.getNumberOfPages();
            paintBackground();
            drawHeader();
            y = PAGE.top;
        }

        function ensure(height) {
            if (y + height > PAGE.bottom) nextPage();
        }

        function font(name = "helvetica", style = "normal") {
            doc.setFont(name, style);
        }

        function text(value, options = {}) {
            const content = clean(value);
            if (!content) return 0;
            const size = Number(options.size || 9);
            const width = Number(options.width || PAGE.right - PAGE.left);
            const factor = Number(options.factor || 1.25);
            const lines = split(content, width);
            const height = Math.max(lineHeight(size, factor), lines.length * lineHeight(size, factor));
            const after = Number(options.after ?? 3);
            if (!options.noEnsure) ensure(height + after);
            font(options.font || "helvetica", options.bold ? "bold" : (options.style || "normal"));
            doc.setFontSize(size);
            doc.setTextColor(...(options.colour || COLOURS.ink));
            doc.text(lines, Number(options.x ?? PAGE.left), y, {
                maxWidth: width,
                lineHeightFactor: factor,
                align: options.align || "left"
            });
            y += height + after;
            return height + after;
        }

        function serif(value, options = {}) {
            return text(value, { ...options, font: "times" });
        }

        function mono(value, options = {}) {
            return text(value, { ...options, font: "courier" });
        }

        function rule(options = {}) {
            const after = Number(options.after ?? 6);
            ensure(after + 1);
            doc.setDrawColor(...(options.colour || COLOURS.rule));
            doc.setLineWidth(Number(options.width || 0.35));
            doc.line(Number(options.x1 ?? PAGE.left), y, Number(options.x2 ?? PAGE.right), y);
            y += after;
        }

        function sectionHeading(title, number, intro = "") {
            ensure(intro ? 35 : 24);
            const titleLines = split(title, 165);
            font("times", "normal");
            doc.setFontSize(18);
            doc.setTextColor(...COLOURS.ink);
            doc.text(titleLines, PAGE.left, y, { lineHeightFactor: 1.12, maxWidth: 165 });
            font("courier", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...COLOURS.muted);
            doc.text(clean(number), PAGE.right, y, { align: "right" });
            y += titleLines.length * lineHeight(18, 1.12) + 7;
            if (intro) text(intro, { size: 8.8, colour: COLOURS.muted, width: 180, after: 7 });
        }

        function smallLabel(value, options = {}) {
            text(value, { size: 6.7, colour: options.colour || COLOURS.muted, font: "helvetica", bold: Boolean(options.bold), after: options.after ?? 1.8 });
        }

        function card(title, body, options = {}) {
            const width = Number(options.width || 190);
            const x = Number(options.x ?? PAGE.left);
            const titleLines = split(title, width - 12);
            const bodyLines = split(body, width - 12);
            const height = 7 + titleLines.length * lineHeight(10.5, 1.16) + bodyLines.length * lineHeight(8.3, 1.28) + 8;
            ensure(height + 4);
            doc.setDrawColor(...COLOURS.rule);
            doc.setLineWidth(0.28);
            doc.rect(x, y - 2, width, height, "S");
            font("times", "normal");
            doc.setFontSize(10.5);
            doc.setTextColor(...(options.titleColour || COLOURS.ink));
            doc.text(titleLines, x + 6, y + 5, { lineHeightFactor: 1.16, maxWidth: width - 12 });
            const bodyY = y + 7 + titleLines.length * lineHeight(10.5, 1.16);
            font("helvetica", "normal");
            doc.setFontSize(8.3);
            doc.setTextColor(...COLOURS.muted);
            doc.text(bodyLines, x + 6, bodyY, { lineHeightFactor: 1.28, maxWidth: width - 12 });
            y += height + 4;
        }

        function bullet(value, options = {}) {
            const content = clean(value);
            if (!content) return;
            const width = Number(options.width || 176);
            const lines = split(content, width);
            const height = Math.max(3.8, lines.length * lineHeight(8.2, 1.28));
            ensure(height + 2.5);
            doc.setFillColor(...(options.dotColour || COLOURS.ink));
            doc.circle(PAGE.left + 1.8, y - 1.4, 0.55, "F");
            font("helvetica", "normal");
            doc.setFontSize(8.2);
            doc.setTextColor(...(options.colour || COLOURS.ink));
            doc.text(lines, PAGE.left + 6, y, { lineHeightFactor: 1.28, maxWidth: width });
            y += height + 2.5;
        }

        function keyValueGrid(rows, columns = 4) {
            const items = rows.filter(([, value]) => clean(value));
            if (!items.length) return;
            const width = (PAGE.right - PAGE.left) / columns;
            const rowCount = Math.ceil(items.length / columns);
            const cellHeight = 28;
            ensure(rowCount * cellHeight + 3);
            const startY = y;
            items.forEach(([label, value], index) => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                const x = PAGE.left + col * width;
                const top = startY + row * cellHeight;
                doc.setDrawColor(...COLOURS.rule);
                doc.setLineWidth(0.22);
                doc.rect(x, top, width, cellHeight, "S");
                font("helvetica", "normal");
                doc.setFontSize(6.3);
                doc.setTextColor(...COLOURS.muted);
                doc.text(split(label, width - 8), x + 4, top + 6, { maxWidth: width - 8, lineHeightFactor: 1.1 });
                font("courier", "normal");
                doc.setFontSize(8.3);
                doc.setTextColor(...COLOURS.ink);
                doc.text(split(value, width - 8), x + 4, top + 14, { maxWidth: width - 8, lineHeightFactor: 1.25 });
            });
            y = startY + rowCount * cellHeight + 5;
        }

        function metadataGrid(rows) {
            const width = (PAGE.right - PAGE.left) / rows.length;
            const startY = y;
            rows.forEach(([label, value], index) => {
                const x = PAGE.left + index * width;
                font("helvetica", "normal");
                doc.setFontSize(6.2);
                doc.setTextColor(...COLOURS.muted);
                doc.text(label, x, startY);
                font("courier", "normal");
                doc.setFontSize(7.2);
                doc.setTextColor(...COLOURS.ink);
                doc.text(split(value, width - 4), x, startY + 6, { maxWidth: width - 4, lineHeightFactor: 1.18 });
            });
            y += 19;
        }

        function statusStrip(groups) {
            const parts = [
                ["Relevant now", groups.relevant.length, COLOURS.greenDark],
                ["Review needed", groups.review.length, COLOURS.amber],
                ["Watch as you grow", groups.watch.length, COLOURS.blue],
                ["Needs information", groups.missing.length, COLOURS.red]
            ];
            const width = (PAGE.right - PAGE.left) / parts.length;
            ensure(18);
            const startY = y;
            parts.forEach(([label, count, colour], index) => {
                const x = PAGE.left + index * width;
                doc.setDrawColor(...COLOURS.softRule);
                doc.rect(x, startY, width, 14, "S");
                font("courier", "bold");
                doc.setFontSize(10);
                doc.setTextColor(...colour);
                doc.text(String(count), x + 4, startY + 6);
                font("helvetica", "normal");
                doc.setFontSize(6.1);
                doc.setTextColor(...COLOURS.muted);
                doc.text(split(label, width - 16), x + 14, startY + 5, { maxWidth: width - 16, lineHeightFactor: 1.1 });
            });
            y += 20;
        }

        function link(label, href, options = {}) {
            const url = clean(href);
            if (!url) return;
            const x = Number(options.x ?? PAGE.left);
            ensure(7);
            font("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(...COLOURS.blue);
            if (typeof doc.textWithLink === "function") doc.textWithLink(label, x, y, { url });
            else doc.text(label, x, y);
            pendingLinks.push(url);
            y += 6;
        }

        function setY(value) { y = Number(value); }
        function getY() { return y; }

        paintBackground();
        drawHeader();
        pageIndex = 1;

        return {
            nextPage,
            ensure,
            text,
            serif,
            mono,
            rule,
            sectionHeading,
            smallLabel,
            card,
            bullet,
            keyValueGrid,
            metadataGrid,
            statusStrip,
            link,
            getY,
            setY,
            split,
            lineHeight,
            pendingLinks
        };
    }

    function addDocumentChrome(doc, logo, context) {
        const total = doc.getNumberOfPages();
        for (let page = 1; page <= total; page += 1) {
            doc.setPage(page);
            doc.setFillColor(...COLOURS.page);
            doc.rect(0, 0, 210, 6, "F");
            if (logo) {
                try { doc.addImage(logo, "PNG", PAGE.left, 8.2, 8.5, 8.5, undefined, "FAST"); } catch (_error) {}
            }
            doc.setFont("courier", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(...COLOURS.muted);
            doc.text(context.productLine, PAGE.left + 15, 13.3, { maxWidth: 120 });
            doc.text(context.prototypeLabel, PAGE.right, 13.3, { align: "right" });
            doc.setDrawColor(...COLOURS.softRule);
            doc.setLineWidth(0.25);
            doc.line(PAGE.left, 274, PAGE.right, 274);
            doc.setFontSize(5.8);
            doc.text("© 2026 HRTechify. All rights reserved. · Powered by GrowWithHR", PAGE.left, 282);
            doc.text(`Page ${page} of ${total}`, PAGE.right, 282, { align: "right" });
        }
    }

    function renderFrontPage(canvas, data, groups, context) {
        canvas.setY(34);
        const headlineLines = canvas.split(context.headline, 150);
        canvas.serif(headlineLines.join("\n"), { size: 25, factor: 1.05, width: 152, after: 7 });
        canvas.text(context.dek, { size: 8.8, colour: COLOURS.muted, width: 168, factor: 1.35, after: 9 });
        canvas.metadataGrid([
            ["Report ID", clean(data.reportId, "Not allocated")],
            ["Generated", displayTimestamp(data.generatedAt)],
            ["Engine version", clean(window.GROWWITHHR_VERSION || window.APP_VERSION || "v0.20.3-prototype.1")],
            ["Legal review", "Needs review"]
        ]);
        canvas.rule({ colour: COLOURS.rule, after: 12 });
        canvas.sectionHeading("Company snapshot", "01", "Built from the facts supplied in the GrowWithHR assessment. Missing information is never inferred — it remains visible later in the report.");
        canvas.keyValueGrid(companyFacts(data).slice(0, 8), 4);
        const overflowFacts = companyFacts(data).slice(8);
        if (overflowFacts.length) canvas.keyValueGrid(overflowFacts, Math.min(4, overflowFacts.length));
    }

    function renderCompliancePosition(canvas, obligations, groups) {
        canvas.sectionHeading("Compliance position", "02", "These are applicability findings, not a compliance score or certification. They show what GrowWithHR could determine from the facts supplied, what needs review, what should be watched as the company grows, and what is blocked on missing information.");
        canvas.statusStrip(groups);

        const focus = [...groups.relevant, ...groups.review];
        if (!focus.length) {
            canvas.card("No current relevant/review finding recorded", "The deterministic engine did not return an Applicable or Review required finding for this snapshot. Watch and missing-information findings are preserved in later sections.");
        }
        focus.forEach((item) => {
            const kind = statusKind(item);
            const facts = uniq(list(item.companyFactsUsed)).slice(0, 4);
            const detail = [
                clean(item.reason || item.whatToUnderstand, "The supplied company facts produced this deterministic result."),
                facts.length ? `Facts used: ${facts.join(" · ")}` : "",
                clean(item.trigger?.reassessmentPoint || item.trigger?.triggerText) ? `Rule / trigger: ${clean(item.trigger?.reassessmentPoint || item.trigger?.triggerText)}` : "",
                clean(item.nextAction) ? `Next: ${clean(item.nextAction)}` : "",
                clean(item.ownerSuggestion) ? `Routing: ${clean(item.ownerSuggestion)} · Needs legal review` : "Needs legal review"
            ].filter(Boolean).join("\n");
            canvas.smallLabel(`${founderLabel(item)} · ${item.title}`, { colour: statusColour(kind), bold: true, after: 2.5 });
            canvas.card(item.title, detail, { titleColour: statusColour(kind) });
            if (item.sourceReference) canvas.link("View supporting source ↗", item.sourceReference);
        });
    }

    function groupTriggerMatrix(matrix) {
        const groups = new Map();
        list(matrix).forEach((item) => {
            const fact = clean(item.companyFact, "other");
            if (!groups.has(fact)) groups.set(fact, []);
            groups.get(fact).push(item);
        });
        return [...groups.entries()];
    }

    function triggerFactLabel(field) {
        const value = clean(field).toLowerCase();
        if (/contract/.test(value)) return "Contract workers";
        if (/worker/.test(value)) return "Factory / blue-collar workers";
        if (/employee|headcount/.test(value)) return "Total employees";
        return clean(field, "Other supported company fact");
    }

    function drawTriggerBar(canvas, doc, fact, items) {
        const numeric = items.filter((item) => Number.isFinite(item.count) && Number.isFinite(item.threshold));
        const title = triggerFactLabel(fact);
        if (!numeric.length) {
            canvas.smallLabel(title, { bold: true, colour: COLOURS.ink, after: 2 });
            items.forEach((item) => canvas.bullet(`${clean(item.title)} — current position: ${clean(item.currentPosition, "recorded by the deterministic engine")} · reassessment point: ${clean(item.reassessmentPoint, "reassess after relevant company change")}`));
            return;
        }
        const current = Math.max(...numeric.map((item) => Number(item.count || 0)));
        const thresholdMax = Math.max(...numeric.map((item) => Number(item.threshold || 0)), 1);
        const scaleMax = Math.max(thresholdMax * 1.1, current * 1.1, 1);
        const x = PAGE.left;
        const width = PAGE.right - PAGE.left;
        const barY = canvas.getY() + 10;
        const barH = 10;
        const blockHeight = 35 + Math.min(16, numeric.length * 3.2);
        canvas.ensure(blockHeight);
        canvas.smallLabel(title, { bold: true, colour: COLOURS.ink, after: 1 });
        canvas.mono(`Current: ${current}`, { size: 7.3, x: PAGE.right - 35, width: 35, align: "right", after: 2, noEnsure: true });
        doc.setFillColor(...COLOURS.page);
        doc.setDrawColor(...COLOURS.rule);
        doc.setLineWidth(0.24);
        doc.rect(x, barY, width, barH, "S");
        const fillWidth = Math.max(1.5, Math.min(width, (current / scaleMax) * width));
        doc.setFillColor(...COLOURS.green);
        doc.rect(x, barY, fillWidth, barH, "F");
        doc.setFillColor(...COLOURS.amber);
        doc.setDrawColor(...COLOURS.rule);
        doc.circle(x + Math.min(width - 1.5, Math.max(1.5, (current / scaleMax) * width)), barY + barH / 2, 1.5, "FD");

        const byThreshold = new Map();
        numeric.forEach((item) => {
            const threshold = Number(item.threshold);
            if (!byThreshold.has(threshold)) byThreshold.set(threshold, []);
            byThreshold.get(threshold).push(item.title);
        });
        [...byThreshold.entries()].sort((a, b) => a[0] - b[0]).forEach(([threshold, titles], index) => {
            const tx = x + Math.min(width, (threshold / scaleMax) * width);
            doc.setDrawColor(...COLOURS.rule);
            doc.setLineWidth(0.28);
            doc.line(tx, barY - 2, tx, barY + barH + 4);
            doc.setFont("courier", "normal");
            doc.setFontSize(6.1);
            doc.setTextColor(...COLOURS.ink);
            doc.text(String(threshold), tx, barY - 3, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(5.8);
            doc.setTextColor(...COLOURS.muted);
            const label = uniq(titles).join(" · ");
            const labelWidth = Math.min(65, Math.max(35, width / Math.max(2, byThreshold.size)));
            const labelX = Math.min(PAGE.right - labelWidth, Math.max(PAGE.left, tx - labelWidth / 2));
            doc.text(canvas.split(label, labelWidth), labelX, barY + barH + 8 + (index % 2) * 4.5, { maxWidth: labelWidth, lineHeightFactor: 1.08, align: "center" });
        });
        canvas.setY(barY + barH + 22 + Math.min(12, byThreshold.size * 2));
    }

    function renderGrowthTriggers(canvas, doc, assessment, data) {
        const matrix = list(assessment?.scaleTriggerMatrix);
        canvas.sectionHeading(`Where ${clean(data.companyName, "the company")} sits vs. growth triggers`, "03", "The trigger view reuses the deterministic current position and reassessment point already produced by GrowWithHR. Numeric thresholds are visualised where the engine exposes a count and threshold; conditional triggers remain written out rather than being converted into invented numbers.");
        if (!matrix.length) {
            canvas.card("No numeric or near/below growth trigger recorded", "The current deterministic snapshot does not expose a below/near trigger in the Scale Trigger Matrix. This does not mean no law can become relevant after future operating changes.");
            return;
        }
        groupTriggerMatrix(matrix).forEach(([fact, items]) => drawTriggerBar(canvas, doc, fact, items));
        const conditional = matrix.filter((item) => !Number.isFinite(item.count) || !Number.isFinite(item.threshold));
        if (conditional.length) {
            canvas.rule({ colour: COLOURS.softRule, after: 6 });
            canvas.smallLabel("Conditional / non-numeric triggers", { bold: true, colour: COLOURS.ink, after: 3 });
            conditional.forEach((item) => canvas.bullet(`${clean(item.title)} — ${clean(item.explanation || item.currentPosition)} · Reassess: ${clean(item.reassessmentPoint, "after relevant company change")}`));
        }
    }

    function renderMissingAndActions(canvas, assessment, obligations) {
        const missingFacts = list(assessment?.missingFacts);
        const missingObligations = obligations.filter((item) => statusKind(item) === "missing");
        canvas.sectionHeading("Blocked on missing information", "04", "GrowWithHR does not infer missing company facts. Unresolved questions are preserved so the report can be rerun later without invalidating the findings that were already supported by supplied information.");
        if (!missingFacts.length && !missingObligations.length) {
            canvas.card("No missing-information finding", "This snapshot did not return an unresolved company fact from the deterministic engine.");
        }
        missingFacts.forEach((item) => {
            const affected = list(item.affectedAreas).join(", ");
            canvas.smallLabel("Needs information", { bold: true, colour: COLOURS.red, after: 2 });
            canvas.card(clean(item.question, item.field), affected ? `Could affect: ${affected}.\nNext: answer the missing question and re-run the assessment.` : "Next: answer the missing question and re-run the assessment.", { titleColour: COLOURS.red });
        });
        missingObligations.filter((item) => !missingFacts.some((fact) => list(fact.affectedLawIds).includes(item.id))).forEach((item) => {
            canvas.card(item.title, `${clean(item.reason || item.whatToUnderstand)}\nNext: ${clean(item.nextAction, "complete the missing company information and rerun")}`, { titleColour: COLOURS.red });
        });

        canvas.rule({ colour: COLOURS.softRule, after: 8 });
        canvas.sectionHeading("Founder action list", "05", "Actions come from the company-wide founder intelligence layer and remain tied to the deterministic findings. Completion is not inferred or scored.");
        const actions = list(assessment?.founderActions);
        if (actions.length) {
            actions.forEach((action, index) => {
                canvas.smallLabel(String(index + 1).padStart(2, "0"), { bold: true, colour: COLOURS.ink, after: 1.5 });
                canvas.serif(clean(action.title), { size: 12.5, after: 2.5 });
                canvas.text(clean(action.body), { size: 8.4, colour: COLOURS.muted, after: 2.5 });
                if (action.ownerSuggestion) canvas.mono(`Routing: ${clean(action.ownerSuggestion)}`, { size: 6.8, colour: COLOURS.muted, after: 6 });
            });
        } else {
            canvas.bullet("Review areas relevant now and confirm internal implementation separately from applicability.");
            canvas.bullet("Complete unresolved company facts and rerun the assessment where needed.");
            canvas.bullet("Reassess before supported workforce or operating triggers are reached.");
        }
    }

    function renderMethodologyAndScope(canvas) {
        canvas.sectionHeading("How this report was reached", "06", "The report keeps applicability and explanation responsibilities separate.");
        const steps = [
            ["01", "Company facts", "The assessment starts from what you supplied — nothing is inferred."],
            ["02", "Deterministic rules", "Facts are checked against structured applicability rules."],
            ["03", "Applicability result", "The rule engine produces the compliance-family result."],
            ["04", "Governed research", "A controlled research layer retrieves context for the result already reached."],
            ["05", "Plain-language layer", "Findings are explained in founder-readable terms."],
            ["06", "This report", "The current assessment snapshot is rendered into this reusable editorial template."]
        ];
        steps.forEach(([number, title, body]) => {
            canvas.mono(number, { size: 7.2, bold: true, colour: COLOURS.muted, after: 1 });
            canvas.serif(title, { size: 11, after: 1.5 });
            canvas.text(body, { size: 7.9, colour: COLOURS.muted, after: 4.5 });
        });
        canvas.card("AI boundary", "AI / retrieval does not decide applicability. Every status and threshold comes from the deterministic engine. usedForDecision: false · applicabilityAuthority: none.", { titleColour: COLOURS.ink });

        canvas.rule({ colour: COLOURS.softRule, after: 8 });
        canvas.sectionHeading("Scope & limitations", "07");
        canvas.serif("This report assesses", { size: 11.5, after: 3 });
        [
            "HR compliance areas relevant to the profile supplied",
            "Areas where more information is needed first",
            "Areas to reassess after material growth or change",
            "Founder next actions and supported trigger positions derived from the same deterministic assessment"
        ].forEach((item) => canvas.bullet(item));
        canvas.serif("This report does not assess", { size: 11.5, after: 3 });
        [
            "Whether obligations are already completed or correctly implemented",
            "Statutory payments, payroll or contribution accuracy",
            "Individual entitlement, dispute, complaint or claim outcomes",
            "International, multi-country or unsupported state-specific matters",
            "Legal compliance certification, legal opinion or legal representation"
        ].forEach((item) => canvas.bullet(item));
        canvas.text("This is a research-grade prototype, not legal advice, a legal opinion, or certification of compliance or non-compliance. Legal review status: needs legal review. Source authority: secondary research.", { size: 7.8, colour: COLOURS.muted, after: 5 });
    }

    function renderDetailedAppendix(canvas, obligations, data) {
        if (!obligations.length) return;
        canvas.sectionHeading("Detailed findings & source register", "08", "This appendix prevents presentation changes from dropping information. Every deterministic finding is retained with its status, reason, known facts, missing facts, trigger, routing, next action and source where available.");
        obligations.forEach((item, index) => {
            if (index > 0) canvas.rule({ colour: COLOURS.softRule, after: 5 });
            const kind = statusKind(item);
            canvas.smallLabel(founderLabel(item), { bold: true, colour: statusColour(kind), after: 2 });
            canvas.serif(item.title, { size: 12.5, after: 2.5 });
            if (item.reason) {
                canvas.smallLabel("Why this result", { bold: true, colour: COLOURS.muted, after: 1.5 });
                canvas.text(item.reason, { size: 8.1, colour: COLOURS.ink, after: 4 });
            }
            const facts = uniq(list(item.companyFactsUsed));
            if (facts.length) {
                canvas.smallLabel("Company facts used", { bold: true, colour: COLOURS.muted, after: 1.5 });
                facts.forEach((fact) => canvas.bullet(fact));
            }
            const missing = uniq(list(item.missingFacts));
            if (missing.length) {
                canvas.smallLabel("Missing facts", { bold: true, colour: COLOURS.muted, after: 1.5 });
                missing.forEach((fact) => canvas.bullet(fact, { dotColour: COLOURS.red }));
            }
            const currentPosition = clean(item.trigger?.currentPosition || item.trigger?.positionText);
            const reassessmentPoint = clean(item.trigger?.reassessmentPoint || item.trigger?.triggerText);
            if (currentPosition || reassessmentPoint) {
                canvas.smallLabel("Trigger position", { bold: true, colour: COLOURS.muted, after: 1.5 });
                if (currentPosition) canvas.text(`Current position: ${currentPosition}`, { size: 8, after: 2 });
                if (reassessmentPoint) canvas.text(`Reassessment point: ${reassessmentPoint}`, { size: 8, after: 3 });
            }
            if (item.nextAction) {
                canvas.smallLabel("Next action", { bold: true, colour: COLOURS.muted, after: 1.5 });
                canvas.text(item.nextAction, { size: 8, after: 3 });
            }
            if (item.ownerSuggestion) canvas.mono(`Routing: ${item.ownerSuggestion} · Needs legal review`, { size: 6.8, colour: COLOURS.muted, after: 3 });
            if (item.sourceReference) canvas.link("Supporting source ↗", item.sourceReference);
        });

        canvas.rule({ colour: COLOURS.softRule, after: 7 });
        canvas.smallLabel("Report basis", { bold: true, colour: COLOURS.ink, after: 3 });
        canvas.mono(`Report ID: ${clean(data.reportId, "Not allocated")}`, { size: 6.8, colour: COLOURS.muted, after: 2 });
        canvas.mono(`Generated: ${displayTimestamp(data.generatedAt)}`, { size: 6.8, colour: COLOURS.muted, after: 2 });
        canvas.mono(`Engine version: ${clean(window.GROWWITHHR_VERSION || window.APP_VERSION || "v0.20.3-prototype.1")}`, { size: 6.8, colour: COLOURS.muted, after: 2 });
        canvas.mono("Source authority: secondary research · Legal review: needs legal review · AI used for decision: no", { size: 6.8, colour: COLOURS.muted, after: 3 });
    }

    function serialise(doc, data) {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 45) || "Organisation";
        const reportId = clean(data.reportId, "GWHR-REPORT");
        return {
            document: doc,
            theme: "standard",
            filename: `GrowWithHR-HR-Compliance-Growth-Report-${company}-${reportId}.pdf`,
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: Number(buffer?.byteLength || 0),
            pageCount: Number(doc.getNumberOfPages?.() || 0),
            reportId,
            generatedAt: clean(data.generatedAt),
            reportLayoutVersion: VERSION,
            reportStructureVersion: STRUCTURE_VERSION,
            sharedTemplateId: TEMPLATE_ID,
            reportStyleId: STYLE_ID,
            brandLogoAsset: LOGO_ASSET,
            singleEdition: true,
            informationPreservation: "full-deterministic-finding-appendix"
        };
    }

    function buildVariant(JsPDF, _theme, rows, model, payload, _trace, logo) {
        const data = mergeSource(payload, model);
        const assessment = assessmentFor(payload, model, rows);
        const obligations = normaliseObligations(assessment, rows);
        const groups = reportGroups(obligations);
        const context = templateContext(data, groups);
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        const canvas = buildCanvas(doc, logo);

        renderFrontPage(canvas, data, groups, context);
        canvas.nextPage();
        renderCompliancePosition(canvas, obligations, groups);
        canvas.nextPage();
        renderGrowthTriggers(canvas, doc, assessment, data);
        canvas.nextPage();
        renderMissingAndActions(canvas, assessment, obligations);
        canvas.nextPage();
        renderMethodologyAndScope(canvas);
        canvas.nextPage();
        renderDetailedAppendix(canvas, obligations, data);

        addDocumentChrome(doc, logo, context);
        return serialise(doc, data);
    }

    window.GrowWithHRVisualReportRenderers = Object.freeze({
        ...baseRenderers,
        buildVariant,
        editorialReportTemplateVersion: VERSION,
        reportStyleId: STYLE_ID
    });

    window.GrowWithHRReportBrandTemplate = Object.freeze({
        ...(window.GrowWithHRReportBrandTemplate || {}),
        version: VERSION,
        templateId: TEMPLATE_ID,
        logoAsset: LOGO_ASSET,
        singleEdition: true,
        reportStyle: STYLE_ID,
        editorialResearchTemplate: true,
        reusableTemplateContext: true,
        preservesDeterministicInformation: true
    });

    window.GrowWithHREditorialReportTemplate = Object.freeze({
        version: VERSION,
        templateId: TEMPLATE_ID,
        styleId: STYLE_ID,
        logoAsset: LOGO_ASSET,
        installed: true,
        presentationOnly: true,
        deterministicEngineUntouched: true,
        reusableTemplateContext: true,
        detailedFindingAppendix: true,
        supportsDynamicPagination: true
    });
})();
