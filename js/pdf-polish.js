/* ==========================================================
   GrowWithHR PDF presentation polish
   Clean A4 advisory renderer with consistent page furniture.
   ========================================================== */
(function installGrowWithHRPdfPolish(window, document) {
    "use strict";

    const previous = window.GrowWithHRPDF;
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;

    if (!previous || typeof previous.buildAdvisoryModel !== "function" || !JsPDF) {
        console.warn("GrowWithHR PDF polish: the base PDF service is unavailable.");
        return;
    }

    const VERSION = "3.1.0-clean-report-layout";
    const EXPERIENCE_VERSION = "0.19.0";
    const DEFAULT_FILENAME = "GrowWithHR-Executive-Advisory.pdf";
    const REPORT_STORAGE_KEY = "growwithhr-report";
    const REPORT_THEME_KEY = "growwithhr-report-theme";
    const LAST_DOWNLOAD_KEY = "growwithhrLastReportDownload";

    const THEMES = Object.freeze({
        light: Object.freeze({
            page: [255, 255, 255], panel: [255, 255, 255], panelAlt: [244, 248, 253],
            text: [15, 32, 61], muted: [70, 87, 111], heading: [7, 28, 62],
            line: [199, 211, 226], accent: [245, 158, 11], accentDark: [190, 103, 0],
            accentSoft: [255, 245, 220], navy: [4, 28, 67], white: [255, 255, 255]
        }),
        dark: Object.freeze({
            page: [7, 16, 31], panel: [15, 29, 50], panelAlt: [20, 37, 62],
            text: [234, 240, 248], muted: [164, 178, 199], heading: [255, 255, 255],
            line: [47, 67, 94], accent: [245, 158, 11], accentDark: [255, 190, 75],
            accentSoft: [55, 41, 18], navy: [12, 38, 72], white: [255, 255, 255]
        })
    });

    const PAGE = Object.freeze({
        width: 210, height: 297, left: 16, right: 16, top: 25,
        contentBottom: 270, headerY: 12, headerRuleY: 18,
        footerRuleY: 276, footerMainY: 284, footerSubY: 288,
        borderInset: 5.5
    });
    const usableWidth = PAGE.width - PAGE.left - PAGE.right;
    let logoPromise = null;

    function cleanText(value, fallback = "") {
        const text = String(value ?? "").replace(/\s+/g, " ").trim();
        return text || fallback;
    }
    function toArray(value) {
        if (Array.isArray(value)) return value.map((item) => cleanText(item)).filter(Boolean);
        const source = cleanText(value);
        return source ? source.split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : [];
    }
    function unique(values) {
        const seen = new Set();
        return values.filter((value) => {
            const key = cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    function pluralise(value, singular, plural = `${singular}s`) {
        const number = Math.max(0, Number(value) || 0);
        return `${number} ${number === 1 ? singular : plural}`;
    }
    function formatDate(value) {
        const date = value ? new Date(value) : new Date();
        const safe = Number.isNaN(date.getTime()) ? new Date() : date;
        return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(safe);
    }
    function escapeFilename(value) {
        return cleanText(value, "Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "Organisation";
    }
    function getStoredReport() {
        try { return JSON.parse(window.localStorage?.getItem(REPORT_STORAGE_KEY) || "{}"); }
        catch (_error) { return {}; }
    }
    function resolveTheme(payload = {}) {
        const selected = document.querySelector("input[name='advisoryReportTheme']:checked, input[name='reportTheme']:checked");
        const requested = cleanText(payload.theme || payload.reportTheme || payload.pdfTheme || selected?.value || window.localStorage?.getItem(REPORT_THEME_KEY), "light");
        const theme = /dark/i.test(requested) ? "dark" : "light";
        try { window.localStorage?.setItem(REPORT_THEME_KEY, theme); } catch (_error) {}
        return theme;
    }
    function loadTransparentLogo() {
        if (logoPromise) return logoPromise;
        logoPromise = new Promise((resolve) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => {
                try {
                    const size = 320;
                    const canvas = document.createElement("canvas");
                    canvas.width = size; canvas.height = size;
                    const context = canvas.getContext("2d");
                    context.clearRect(0, 0, size, size);
                    context.save(); context.beginPath(); context.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2); context.clip();
                    context.drawImage(image, 0, 0, size, size); context.restore();
                    resolve(canvas.toDataURL("image/png"));
                } catch (_error) { resolve(""); }
            };
            image.onerror = () => resolve("");
            image.src = new URL("assets/hrtechify-logo.png", window.location.href).href;
        });
        return logoPromise;
    }

    function createWriter(doc, model, logoDataUrl, options) {
        const theme = THEMES[options.theme];
        let cursorY = PAGE.top;
        const setFont = (style = "normal", size = 10) => { doc.setFont("helvetica", style); doc.setFontSize(size); };
        const setText = (colour) => doc.setTextColor(...colour);
        const setFill = (colour) => doc.setFillColor(...colour);
        const setDraw = (colour) => doc.setDrawColor(...colour);
        const split = (text, width) => doc.splitTextToSize(cleanText(text), width);
        const lineHeight = (size, factor = 1.35) => size * 0.3528 * factor;

        function paintPage() {
            setFill(theme.page); doc.rect(0, 0, PAGE.width, PAGE.height, "F");
            setDraw(theme.line); doc.setLineWidth(0.35);
            doc.rect(PAGE.borderInset, PAGE.borderInset, PAGE.width - PAGE.borderInset * 2, PAGE.height - PAGE.borderInset * 2, "S");
        }
        function header() {
            setFont("normal", 7.4); setText(theme.muted);
            doc.text(options.runningTitle, PAGE.width / 2, PAGE.headerY, { align: "center" });
            setDraw(theme.line); doc.setLineWidth(0.25);
            doc.line(PAGE.left, PAGE.headerRuleY, PAGE.width - PAGE.right, PAGE.headerRuleY);
        }
        function addPage() { doc.addPage(); paintPage(); cursorY = PAGE.top; header(); }
        function remainingHeight() { return PAGE.contentBottom - cursorY; }
        function ensureSpace(height) { if (height > remainingHeight()) addPage(); }

        function cover() {
            paintPage();
            const x = PAGE.width / 2;
            if (logoDataUrl) {
                try { doc.addImage(logoDataUrl, "PNG", x - 15, 22, 30, 30, undefined, "FAST"); } catch (_error) {}
            }
            setFont("bold", 25); setText(theme.heading); doc.text("GrowWithHR", x, 66, { align: "center" });
            setFont("bold", 12); setText(theme.accentDark); doc.text("Executive Advisory Report", x, 77, { align: "center" });
            setDraw(theme.accent); doc.setLineWidth(0.6); doc.line(x - 36, 82, x - 14, 82); doc.line(x + 14, 82, x + 36, 82);
            setFont("bold", 8.5); setText(theme.heading); doc.text(options.coverLabel, x, 95, { align: "center" });
            setFont("normal", 11); setText(theme.text);
            doc.text(split(model.companyName, 160), x, 110, { align: "center", lineHeightFactor: 1.2 });
            setFill(theme.panelAlt); setDraw(theme.line); doc.roundedRect(25, 135, 160, 50, 3, 3, "FD");
            const cols = [52, 105, 158];
            [["INDUSTRY", model.industry], ["WORKFORCE", model.employeeLabel || pluralise(model.employees, "employee")], ["LOCATION", model.primaryState]].forEach((item, index) => {
                setFont("bold", 7.2); setText(theme.heading); doc.text(item[0], cols[index], 151, { align: "center" });
                setFont("normal", 8.2); setText(theme.text); doc.text(split(item[1], 44), cols[index], 161, { align: "center", lineHeightFactor: 1.25 });
                if (index < 2) { setDraw(theme.line); doc.line(cols[index] + 26, 142, cols[index] + 26, 178); }
            });
            setFont("normal", 9.2); setText(theme.text);
            doc.text(split(options.coverIntro, 145), x, 203, { align: "center", lineHeightFactor: 1.4 });
            setFont("normal", 9); setText(theme.muted); doc.text(formatDate(model.generatedAt), x, 237, { align: "center" });
        }

        function paragraph(text, settings = {}) {
            if (!cleanText(text)) return;
            const size = settings.size || 9.1, factor = settings.lineHeight || 1.4;
            const lines = split(text, settings.width || usableWidth - (settings.indent || 0));
            const height = lineHeight(size, factor);
            ensureSpace(Math.min(lines.length * height + 3, 24));
            setFont(settings.style || "normal", size); setText(settings.colour || theme.text);
            doc.text(lines, PAGE.left + (settings.indent || 0), cursorY, { lineHeightFactor: factor });
            cursorY += lines.length * height + (settings.spacingAfter ?? 4.5);
        }

        function sectionHeading(label, title, introduction = "") {
            ensureSpace(introduction ? 34 : 25);
            setFont("bold", 7.8); setText(theme.accentDark); doc.text(cleanText(label).toUpperCase(), PAGE.left, cursorY);
            cursorY += 7;
            setFont("bold", 16); setText(theme.heading);
            const titleLines = split(title, usableWidth); doc.text(titleLines, PAGE.left, cursorY, { lineHeightFactor: 1.1 });
            cursorY += titleLines.length * lineHeight(16, 1.1) + 3;
            setDraw(theme.accent); doc.setLineWidth(0.7); doc.line(PAGE.left, cursorY, PAGE.left + 28, cursorY); cursorY += 8;
            if (introduction) {
                const introLines = split(introduction, usableWidth - 12);
                const boxHeight = introLines.length * lineHeight(8.8, 1.35) + 9;
                setFill(theme.panelAlt); setDraw(theme.panelAlt); doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, boxHeight, 2, 2, "FD");
                setFont("normal", 8.8); setText(theme.text); doc.text(introLines, PAGE.left + 6, cursorY + 2, { lineHeightFactor: 1.35 });
                cursorY += boxHeight + 4;
            }
        }
        function subheading(title) {
            ensureSpace(15); setFont("bold", 11.2); setText(theme.heading);
            const lines = split(title, usableWidth); doc.text(lines, PAGE.left, cursorY, { lineHeightFactor: 1.18 });
            cursorY += lines.length * lineHeight(11.2, 1.18) + 5;
        }
        function numberedList(items, settings = {}) {
            unique(toArray(items)).forEach((item, index) => {
                const lines = split(item, usableWidth - 16), height = lines.length * lineHeight(8.9, 1.38) + 3.5;
                ensureSpace(Math.min(height, 22));
                setFill(theme.accentSoft); doc.circle(PAGE.left + 3.5, cursorY - 1.4, 3.1, "F");
                setFont("bold", 7.5); setText(theme.accentDark); doc.text(String(index + 1), PAGE.left + 3.5, cursorY - 0.2, { align: "center" });
                setFont("normal", 8.9); setText(theme.text); doc.text(lines, PAGE.left + 11.5, cursorY, { lineHeightFactor: 1.38 });
                cursorY += height;
            });
            cursorY += settings.spacingAfter ?? 2;
        }
        function bulletList(items) {
            unique(toArray(items)).forEach((item) => {
                const lines = split(item, usableWidth - 10), height = lines.length * lineHeight(9, 1.38) + 3;
                ensureSpace(Math.min(height, 22)); setFill(theme.accent); doc.circle(PAGE.left + 2.2, cursorY - 1, 0.85, "F");
                setFont("normal", 9); setText(theme.text); doc.text(lines, PAGE.left + 7, cursorY, { lineHeightFactor: 1.38 }); cursorY += height;
            }); cursorY += 2;
        }
        function profileTable(rows) {
            const labelWidth = 47;
            rows.forEach(([label, value], index) => {
                const valueLines = split(cleanText(value, "Not specified"), usableWidth - labelWidth - 12);
                const rowHeight = Math.max(13, valueLines.length * lineHeight(8.8, 1.3) + 7);
                ensureSpace(rowHeight + 2); setFill(index % 2 ? theme.panelAlt : theme.panel); setDraw(theme.line);
                doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, rowHeight, 1.5, 1.5, "FD");
                setFont("bold", 8.3); setText(theme.heading); doc.text(split(label, labelWidth - 7), PAGE.left + 5, cursorY + 1, { lineHeightFactor: 1.25 });
                setFont("normal", 8.8); setText(theme.text); doc.text(valueLines, PAGE.left + labelWidth + 3, cursorY + 1, { lineHeightFactor: 1.3 });
                cursorY += rowHeight + 2;
            }); cursorY += 3;
        }
        function templateSubject(item, title) {
            return cleanText(item.resourceLabel, title).replace(/^(?:click here to\s*)?(?:open|view|download|get)\s+/i, "").replace(/\s*(?:template|resource|toolkit|guide)\s*$/i, "").trim() || title;
        }
        function recommendationCard(item, index) {
            const title = cleanText(item.title, `Recommendation ${index + 1}`), howTo = unique(toArray(item.howTo));
            ensureSpace(72);
            setFill(theme.navy); setDraw(theme.navy); doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, 11, 1.7, 1.7, "FD");
            setFill(theme.accent); doc.roundedRect(PAGE.left, cursorY - 4, 2.4, 11, 1.2, 1.2, "F");
            setFont("bold", 7.6); setText(theme.accent); doc.text(`RECOMMENDATION ${index + 1}`, PAGE.left + 8, cursorY + 2.3);
            cursorY += 14;
            subheading(title);
            paragraph(item.observation, { size: 8.7, colour: theme.muted, spacingAfter: 5 });
            paragraph(item.recommendation, { size: 9, spacingAfter: 7 });
            if (howTo.length) {
                setFont("bold", 8); setText(theme.accentDark); doc.text("HOW TO IMPLEMENT", PAGE.left, cursorY); cursorY += 8;
                numberedList(howTo, { spacingAfter: 4 });
            }
            const meta = [item.owner ? `Owner: ${item.owner}` : "", item.timeframe ? `Timing: ${item.timeframe}` : ""].filter(Boolean);
            if (meta.length || item.resourceUrl) {
                ensureSpace(22); const boxTop = cursorY - 3;
                const linkLabel = item.resourceUrl ? `Click here to download template for ${templateSubject(item, title)}` : "";
                const metaLines = meta.length ? split(meta.join("   •   "), usableWidth - 12) : [];
                const linkLines = linkLabel ? split(linkLabel, usableWidth - 18) : [];
                const boxHeight = 8 + metaLines.length * lineHeight(8, 1.25) + linkLines.length * lineHeight(8.3, 1.25) + (linkLines.length ? 5 : 0);
                setFill(theme.panel); setDraw(theme.line); doc.roundedRect(PAGE.left, boxTop, usableWidth, boxHeight, 2, 2, "FD");
                if (metaLines.length) { setFont("normal", 8); setText(theme.text); doc.text(metaLines, PAGE.left + 6, cursorY + 2, { lineHeightFactor: 1.25 }); cursorY += metaLines.length * lineHeight(8, 1.25) + 4; }
                if (linkLines.length) {
                    setFont("bold", 8.3); setText(theme.accentDark); const url = new URL(item.resourceUrl, window.location.href).href;
                    linkLines.forEach((line) => { doc.textWithLink(line, PAGE.left + 11, cursorY, { url }); cursorY += lineHeight(8.3, 1.25); });
                }
                cursorY = boxTop + boxHeight + 7;
            } else { cursorY += 4; }
        }
        function summaryTable(rows, title = "AT A GLANCE") {
            if (!rows.length) return;
            ensureSpace(35); setFill(theme.panelAlt); setDraw(theme.line);
            const rowHeight = 10, height = 14 + rows.length * rowHeight;
            doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, height, 2, 2, "FD");
            setFont("bold", 7.5); setText(theme.accentDark); doc.text(title, PAGE.left + 5, cursorY + 1); cursorY += 8;
            const widths = [63, 63, 52], headers = ["Focus Area", "Why It Matters", "First Step"];
            let x = PAGE.left + 5;
            headers.forEach((headerText, i) => { setFont("bold", 7); setText(theme.heading); doc.text(headerText, x, cursorY); x += widths[i]; }); cursorY += 5;
            rows.forEach((row) => {
                x = PAGE.left + 5; setDraw(theme.line); doc.line(PAGE.left + 5, cursorY - 3, PAGE.width - PAGE.right - 5, cursorY - 3);
                row.forEach((cell, i) => { setFont("normal", 6.8); setText(theme.text); doc.text(split(cell, widths[i] - 4).slice(0, 2), x, cursorY, { lineHeightFactor: 1.15 }); x += widths[i]; }); cursorY += rowHeight;
            }); cursorY += 5;
        }
        function roadmap(roadmapData) {
            sectionHeading("0–90 DAYS ROADMAP", "Your First Steps", "A phased roadmap to help you build momentum and create impact quickly.");
            ensureSpace(68);
            const groups = [
                ["0–30 DAYS", "Build the Foundation", roadmapData?.first30 || []],
                ["31–60 DAYS", "Strengthen and Align", roadmapData?.next60 || []],
                ["61–90 DAYS", "Scale with Confidence", roadmapData?.next90 || []]
            ];
            const boxTop = cursorY - 3, colW = usableWidth / 3;
            setFill(theme.panelAlt); setDraw(theme.line); doc.roundedRect(PAGE.left, boxTop, usableWidth, 58, 2, 2, "FD");
            groups.forEach((group, index) => {
                const x = PAGE.left + index * colW + 5;
                if (index) { setDraw(theme.line); doc.line(PAGE.left + index * colW, boxTop + 5, PAGE.left + index * colW, boxTop + 53); }
                setFont("bold", 7.2); setText(theme.heading); doc.text(group[0], x, cursorY + 2);
                setFont("bold", 8.7); doc.text(split(group[1], colW - 10), x, cursorY + 10, { lineHeightFactor: 1.15 });
                let y = cursorY + 22;
                unique(toArray(group[2])).slice(0, 4).forEach((item) => { setFont("normal", 6.9); setText(theme.text); doc.text(split(`• ${item}`, colW - 10).slice(0, 2), x, y, { lineHeightFactor: 1.15 }); y += 8; });
            });
            cursorY = boxTop + 65;
            ensureSpace(27); setFill(theme.panelAlt); setDraw(theme.panelAlt); doc.roundedRect(PAGE.left, cursorY - 3, usableWidth, 22, 2, 2, "FD");
            setFont("bold", 7.2); setText(theme.accentDark); doc.text("SUCCESS LOOKS LIKE", PAGE.left + 5, cursorY + 2);
            const success = ["Compliant and audit-ready", "Efficient processes", "Engaged and productive team", "Ready to scale"];
            success.forEach((text, index) => { setFont("normal", 7); setText(theme.text); doc.text(split(text, 36), PAGE.left + 8 + index * 43, cursorY + 11, { align: "center", lineHeightFactor: 1.1 }); });
            cursorY += 27;
        }
        function footerLogo(page) {
            if (!logoDataUrl) return;
            try { doc.addImage(logoDataUrl, "PNG", PAGE.left, PAGE.footerMainY - 4.7, 5.5, 5.5, `footer-logo-${page}`, "FAST"); } catch (_error) {}
        }
        function footers() {
            const total = doc.getNumberOfPages();
            for (let page = 1; page <= total; page += 1) {
                doc.setPage(page); setDraw(theme.line); doc.setLineWidth(0.25);
                doc.line(PAGE.left, PAGE.footerRuleY, PAGE.width - PAGE.right, PAGE.footerRuleY);
                footerLogo(page); setFont("bold", 7.1); setText(theme.accentDark);
                doc.text("GrowWithHR", PAGE.left + (logoDataUrl ? 7.5 : 0), PAGE.footerMainY);
                setFont("bold", 6.8); setText(theme.muted);
                doc.text("HRTechify - People • Technology • Growth", PAGE.width / 2, PAGE.footerMainY, { align: "center" });
                setFont("normal", 6.2); doc.text("© 2026 All Rights Reserved", PAGE.width / 2, PAGE.footerSubY, { align: "center" });
                setFont("normal", 6.8); doc.text(`Page ${page} of ${total}`, PAGE.width - PAGE.right, PAGE.footerMainY, { align: "right" });
            }
        }
        paintPage();
        return { cover, addPage, sectionHeading, paragraph, subheading, numberedList, bulletList, profileTable, recommendationCard, summaryTable, roadmap, footers };
    }

    function render(doc, model, logoDataUrl, options) {
        const writer = createWriter(doc, model, logoDataUrl, options);
        writer.cover(); writer.addPage();
        writer.sectionHeading("EXECUTIVE SNAPSHOT", "About Your Organisation", "The organisation context used to shape this advisory.");
        writer.profileTable([
            ["Organisation", model.companyName], ["Industry", model.industry], ["What it does", model.nature], ["Legal structure", model.entity],
            ["Workforce", model.employeeLabel || pluralise(model.employees, "employee")], ["Working model", model.workModel], ["Primary base", model.primaryState],
            ["Footprint", `${pluralise(model.locations, "location")} across ${pluralise(model.countries, "country", "countries")}`], ["Hiring direction", model.hiringPlans], ["People support", model.peopleFunction]
        ]);
        writer.sectionHeading("EXECUTIVE SUMMARY", "What Matters Next");
        unique(model.executiveSummary || []).forEach((text) => writer.paragraph(text));
        writer.subheading("Immediate leadership focus"); writer.numberedList(model.priorities);
        writer.sectionHeading("POSITIVE FOUNDATIONS", "What Is Already Working"); writer.bulletList(model.strengths);
        writer.sectionHeading("RECOMMENDED ACTIONS", "Strategic Recommendations", "Each recommendation includes practical implementation steps and a reusable starting template.");
        const recommendations = model.recommendations || [];
        recommendations.forEach((item, index) => {
            writer.recommendationCard(item, index);
            if ((index + 1) % 2 === 0 || index === recommendations.length - 1) {
                const start = Math.max(0, index - 1);
                writer.summaryTable(recommendations.slice(start, index + 1).map((rec) => [cleanText(rec.title), cleanText(rec.observation, "Supports organisational readiness"), cleanText(toArray(rec.howTo)[0], "Assign an owner and begin") ]));
            }
        });
        writer.sectionHeading("COMPLIANCE REVIEW", "What You Should Do", "Governance prompts only; confirm applicability with qualified advisers and official sources.");
        writer.bulletList(model.compliance);
        writer.subheading("Suggested governance rhythm");
        writer.numberedList(["Assign one accountable owner for each obligation or policy area.", "Record completion evidence and the next review date.", "Escalate overdue or high-risk items through a regular leadership forum.", "Reassess after changes in workforce count, location, worker type or operating model."]);
        writer.roadmap(model.roadmap);
        writer.sectionHeading("LOOKING AHEAD", "Sustainable Growth, People First");
        writer.bulletList(model.opportunities);
        writer.paragraph(`${model.companyName} should select a small number of actions, assign clear owners and review progress alongside business performance.`);
        writer.sectionHeading("IMPORTANT INFORMATION", options.isSample ? "Sample Notice and Disclaimer" : "Confidentiality and Disclaimer");
        writer.paragraph(options.isSample ? "This sample uses fictional information and demonstrates the structure of a GrowWithHR advisory." : "This advisory is a confidential leadership working document prepared from information supplied by the user.");
        writer.paragraph("It provides general business and people-management guidance and is not legal, tax, accounting, employment-law or regulatory advice. Verify requirements with qualified professionals and current official sources.");
        writer.footers();
    }

    async function buildAdvisoryPdf(payload = {}) {
        const model = previous.buildAdvisoryModel(payload), theme = resolveTheme(payload);
        const options = {
            theme, isSample: Boolean(payload.isSample),
            runningTitle: cleanText(payload.runningTitle, "GrowWithHR Executive Advisory"),
            coverLabel: cleanText(payload.coverLabel, payload.isSample ? "ILLUSTRATIVE SAMPLE" : "PERSONALISED FOR YOUR ORGANISATION"),
            coverIntro: cleanText(payload.coverIntro, "Your personalised people and HR advisory report with practical recommendations to help you build a scalable, compliant and high-performing organisation.")
        };
        const logoDataUrl = await loadTransparentLogo();
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        doc.setProperties({ title: `${options.isSample ? "Sample " : ""}Executive Advisory - ${model.companyName}`, subject: "HRTechify GrowWithHR Executive Advisory", author: "HRTechify", creator: `GrowWithHR PDF ${VERSION} / ${EXPERIENCE_VERSION}`, keywords: "HRTechify, GrowWithHR, executive advisory, people strategy" });
        render(doc, model, logoDataUrl, options);
        const filename = cleanText(payload.filename, options.isSample ? `HRTechify-Sample-Executive-Advisory-${theme}.pdf` : `GrowWithHR-Advisory-${escapeFilename(model.companyName)}-${theme}.pdf`);
        const dataUri = doc.output("datauristring"), arrayBuffer = doc.output("arraybuffer");
        return { document: doc, filename, base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri, dataUri, sizeBytes: arrayBuffer.byteLength, pageCount: doc.getNumberOfPages(), generatedAt: new Date().toISOString(), companyName: model.companyName, version: VERSION, theme, isSample: options.isSample };
    }
    async function downloadAdvisoryPdf(payload = {}) {
        let result = payload.document || payload.pdf || null;
        if (result && typeof result.save === "function") result = { document: result, filename: cleanText(payload.filename, DEFAULT_FILENAME) };
        if (!result || (!result.document && typeof result.save !== "function")) result = await buildAdvisoryPdf(payload);
        const doc = result.document || result, filename = cleanText(result.filename || payload.filename, DEFAULT_FILENAME);
        if (!doc || typeof doc.save !== "function") throw new Error("A valid jsPDF document was not available for download.");
        doc.save(filename); try { window.localStorage?.setItem(LAST_DOWNLOAD_KEY, new Date().toISOString()); } catch (_error) {}
        return result;
    }
    async function generatePDFReport() {
        const button = document.getElementById("generateReportBtn");
        if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
        try {
            const result = await buildAdvisoryPdf({ report: getStoredReport(), theme: resolveTheme(), lead: { email: cleanText(document.getElementById("userEmail")?.value), deliveryRequested: true } });
            await downloadAdvisoryPdf(result); window.closePDFModal?.();
        } catch (error) { console.error("GrowWithHR PDF polish: report generation failed.", error); window.alert?.("We could not prepare the PDF just yet. Please try again."); }
        finally { if (button) { button.disabled = false; button.removeAttribute("aria-busy"); } }
    }

    window.GrowWithHRPDF = Object.freeze({ version: VERSION, experienceVersion: EXPERIENCE_VERSION, buildAdvisoryPdf, downloadAdvisoryPdf, buildAdvisoryModel: previous.buildAdvisoryModel });
    window.generatePDFReport = generatePDFReport;
    window.GrowWithHRPDFPolishReady = Promise.resolve(window.GrowWithHRPDF);
})(window, document);
