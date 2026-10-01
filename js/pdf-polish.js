/* ==========================================================
   GrowWithHR PDF presentation polish
   Executive A4 advisory renderer with branded themes,
   page-safe content, topic pagination and a table of contents.
========================================================== */
(function installGrowWithHRPdfPolish(window, document) {
    "use strict";

    const previous = window.GrowWithHRPDF;
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;

    if (!previous || typeof previous.buildAdvisoryModel !== "function" || !JsPDF) {
        console.warn("GrowWithHR PDF polish: the base PDF service is unavailable.");
        return;
    }

    const VERSION = "3.2.0-executive-pagination";
    const EXPERIENCE_VERSION = "0.19.0";
    const DEFAULT_FILENAME = "GrowWithHR-Executive-Advisory.pdf";
    const REPORT_STORAGE_KEY = "growwithhr-report";
    const REPORT_THEME_KEY = "growwithhr-report-theme";
    const LAST_DOWNLOAD_KEY = "growwithhrLastReportDownload";
    const FONT_FAMILY = "helvetica";
    const BODY_SIZE = 9.1;
    const BODY_LINE_HEIGHT = 1.42;

    const THEMES = Object.freeze({
        light: Object.freeze({
            page: [255, 255, 255],
            panel: [244, 247, 251],
            panelAlt: [232, 239, 248],
            text: [10, 24, 48],
            muted: [53, 72, 99],
            heading: [4, 28, 67],
            line: [166, 181, 202],
            accent: [245, 158, 11],
            accentDark: [190, 103, 0],
            accentSoft: [255, 239, 204],
            navy: [4, 28, 67],
            white: [255, 255, 255]
        }),
        dark: Object.freeze({
            page: [7, 16, 31],
            panel: [15, 29, 50],
            panelAlt: [24, 43, 70],
            text: [234, 240, 248],
            muted: [174, 188, 207],
            heading: [255, 255, 255],
            line: [61, 82, 111],
            accent: [245, 158, 11],
            accentDark: [255, 190, 75],
            accentSoft: [55, 41, 18],
            navy: [12, 38, 72],
            white: [255, 255, 255]
        })
    });

    const PAGE = Object.freeze({
        width: 210,
        height: 297,
        left: 16,
        right: 16,
        top: 25,
        contentBottom: 270,
        headerY: 12,
        headerRuleY: 18,
        footerRuleY: 276,
        footerMainY: 284,
        footerSubY: 288,
        borderInset: 5.5
    });

    const usableWidth = PAGE.width - PAGE.left - PAGE.right;
    let logoPromise = null;

    function cleanText(value, fallback = "") {
        const text = String(value ?? "").replace(/\s+/g, " ").trim();
        return text || fallback;
    }

    function toArray(value) {
        if (Array.isArray(value)) {
            return value.map((item) => cleanText(item)).filter(Boolean);
        }

        const source = cleanText(value);
        return source
            ? source.split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
            : [];
    }

    function unique(values) {
        const seen = new Set();

        return values.filter((value) => {
            const key = cleanText(value)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, " ")
                .trim();

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

        return new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(safe);
    }

    function escapeFilename(value) {
        return cleanText(value, "Organisation")
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 70) || "Organisation";
    }

    function getStoredReport() {
        try {
            return JSON.parse(window.localStorage?.getItem(REPORT_STORAGE_KEY) || "{}");
        } catch (_error) {
            return {};
        }
    }

    function resolveTheme(payload = {}) {
        const selected = document.querySelector(
            "input[name='advisoryReportTheme']:checked, input[name='reportTheme']:checked"
        );
        const requested = cleanText(
            payload.theme ||
            payload.reportTheme ||
            payload.pdfTheme ||
            selected?.value ||
            window.localStorage?.getItem(REPORT_THEME_KEY),
            "light"
        );
        const theme = /dark/i.test(requested) ? "dark" : "light";

        try {
            window.localStorage?.setItem(REPORT_THEME_KEY, theme);
        } catch (_error) {}

        return theme;
    }

    function sentenceList(items) {
        const values = unique(toArray(items));

        if (!values.length) return "none specified";
        if (values.length === 1) return values[0];
        if (values.length === 2) return `${values[0]} and ${values[1]}`;

        return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
    }

    function suggestionReason(name, model) {
        if (name === "Hiring and onboarding" || name === "Workforce planning") {
            return !/not specified/i.test(cleanText(model.hiringPlans))
                ? `your stated hiring direction (${model.hiringPlans})`
                : "your anticipated workforce growth";
        }

        if (name === "Manager capability" || name === "Performance and rewards") {
            return Number(model.employees) >= 75
                ? `your workforce size of approximately ${model.employees} employees`
                : `your current People/HR support model (${cleanText(model.peopleFunction, "not specified")})`;
        }

        if (name === "Policies and compliance" || name === "HR operations and technology") {
            if (Number(model.locations) > 1 || Number(model.countries) > 1) {
                return `your operating footprint across ${pluralise(model.locations, "location")} and ${pluralise(model.countries, "country", "countries")}`;
            }

            if (/remote|hybrid|mixed/i.test(cleanText(model.workModel))) {
                return `your ${cleanText(model.workModel).toLowerCase()} working model`;
            }

            return `your current People/HR support model (${cleanText(model.peopleFunction, "not specified")})`;
        }

        return "the wider company profile shared in the briefing";
    }

    function buildExecutiveContext(model) {
        const workforce = cleanText(
            model.employeeLabel,
            pluralise(model.employees, "employee")
        );
        const industry = cleanText(model.industry, "its market");
        const workModel = cleanText(model.workModel, "the current operating model");
        const footprint = Number(model.countries) > 1
            ? `${pluralise(model.locations, "location")} across ${pluralise(model.countries, "country", "countries")}`
            : `${pluralise(model.locations, "location")} in ${cleanText(model.primaryState, "the primary operating region")}`;
        const growthSignal = !/not specified/i.test(cleanText(model.hiringPlans))
            ? `The stated hiring direction is ${cleanText(model.hiringPlans).toLowerCase()}, which makes workforce capacity, manager readiness and role clarity important leadership considerations.`
            : "Even without a confirmed hiring plan, leadership will benefit from clearer workforce assumptions, manager ownership and scalable people practices.";

        return [
            `${cleanText(model.companyName, "The organisation")} operates in ${industry} with ${workforce}, using ${workModel.toLowerCase()} across ${footprint}. At this stage, the leadership challenge is typically to preserve speed while introducing enough structure for decisions, accountability and employee experience to remain consistent.`,
            `Within the ${industry} market, people capability can increasingly influence execution quality, customer confidence, cost control and the organisation's ability to respond to change. The report therefore treats HR priorities as business capabilities rather than isolated administrative activities.`,
            growthSignal
        ];
    }

    function enrichPrioritySources(payload, baseModel) {
        const submitted = unique([
            ...toArray(payload.report?.priorities),
            ...toArray(payload.lead?.priorities),
            ...toArray(payload.answers?.priorities)
        ]);
        const modelPriorities = unique(baseModel.priorities || []);
        const selectedPriorities = modelPriorities.filter((name) =>
            submitted.some((selected) => selected.toLowerCase() === name.toLowerCase())
        );
        const suggestedPriorities = modelPriorities.filter(
            (name) => !selectedPriorities.includes(name)
        );
        const suggestionReasons = Object.fromEntries(
            suggestedPriorities.map((name) => [
                name,
                suggestionReason(name, baseModel)
            ])
        );
        const selectedSet = new Set(selectedPriorities);
        const recommendations = (baseModel.recommendations || []).map((item) => ({
            ...item,
            source: selectedSet.has(item.title) ? "selected" : "suggested",
            sourceLabel: selectedSet.has(item.title) ? "Selected by you" : "Company DNA suggestion",
            suggestionReason: suggestionReasons[item.title] || ""
        }));
        const selectedText = selectedPriorities.length
            ? `Leadership selected ${sentenceList(selectedPriorities)} as the immediate priority${selectedPriorities.length === 1 ? "" : " areas"}.`
            : "No specific priority was selected, so the report uses the company profile to identify an initial leadership focus.";
        const suggestedText = suggestedPriorities.length
            ? `The Company DNA review also identified ${sentenceList(suggestedPriorities)} as complementary strategic priorities for leadership consideration.`
            : "The Company DNA review did not add a separate priority beyond the areas selected by leadership.";
        const executiveSummary = unique([
            ...(baseModel.executiveSummary || []).filter(
                (text) => !/next-stage people agenda|shaped around/i.test(cleanText(text))
            ),
            selectedText,
            suggestedText
        ]);
        const roadmap = {
            first30: [],
            next60: [],
            next90: []
        };

        recommendations.forEach((item) => {
            const prefix = `${item.sourceLabel} - ${item.title}: `;
            if (item.first30) roadmap.first30.push(prefix + item.first30);
            if (item.next60) roadmap.next60.push(prefix + item.next60);
            if (item.next90) roadmap.next90.push(prefix + item.next90);
        });

        return {
            ...baseModel,
            selectedPriorities,
            suggestedPriorities,
            suggestionReasons,
            recommendations,
            executiveContext: buildExecutiveContext(baseModel),
            executiveSummary,
            roadmap: {
                first30: unique(roadmap.first30).slice(0, 4),
                next60: unique(roadmap.next60).slice(0, 4),
                next90: unique(roadmap.next90).slice(0, 4)
            }
        };
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
                    canvas.width = size;
                    canvas.height = size;
                    const context = canvas.getContext("2d");
                    context.clearRect(0, 0, size, size);
                    context.save();
                    context.beginPath();
                    context.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
                    context.clip();
                    context.drawImage(image, 0, 0, size, size);
                    context.restore();
                    resolve(canvas.toDataURL("image/png"));
                } catch (_error) {
                    resolve("");
                }
            };

            image.onerror = () => resolve("");
            image.src = new URL("assets/hrtechify-logo.png", window.location.href).href;
        });

        return logoPromise;
    }

    function createWriter(doc, model, logoDataUrl, options) {
        const theme = THEMES[options.theme];
        let cursorY = PAGE.top;

        const setFont = (style = "normal", size = BODY_SIZE) => {
            doc.setFont(FONT_FAMILY, style);
            doc.setFontSize(size);
        };
        const setText = (colour) => doc.setTextColor(...colour);
        const setFill = (colour) => doc.setFillColor(...colour);
        const setDraw = (colour) => doc.setDrawColor(...colour);
        const split = (text, width) => doc.splitTextToSize(cleanText(text), width);
        const lineHeight = (size, factor = BODY_LINE_HEIGHT) => size * 0.3528 * factor;

        function paintPage() {
            setFill(theme.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
            setDraw(theme.line);
            doc.setLineWidth(0.35);
            doc.rect(
                PAGE.borderInset,
                PAGE.borderInset,
                PAGE.width - PAGE.borderInset * 2,
                PAGE.height - PAGE.borderInset * 2,
                "S"
            );
        }

        function header() {
            setFont("normal", 7.4);
            setText(theme.muted);
            doc.text(options.runningTitle, PAGE.width / 2, PAGE.headerY, {
                align: "center"
            });
            setDraw(theme.line);
            doc.setLineWidth(0.25);
            doc.line(
                PAGE.left,
                PAGE.headerRuleY,
                PAGE.width - PAGE.right,
                PAGE.headerRuleY
            );
        }

        function addPage({ withHeader = true } = {}) {
            doc.addPage();
            paintPage();
            cursorY = PAGE.top;
            if (withHeader) header();
            return doc.getNumberOfPages();
        }

        function remainingHeight() {
            return PAGE.contentBottom - cursorY;
        }

        function ensureSpace(height) {
            if (height > remainingHeight()) addPage();
        }

        function cover() {
            paintPage();
            const x = PAGE.width / 2;

            if (logoDataUrl) {
                try {
                    doc.addImage(
                        logoDataUrl,
                        "PNG",
                        x - 15,
                        22,
                        30,
                        30,
                        undefined,
                        "FAST"
                    );
                } catch (_error) {}
            }

            setFont("bold", 25);
            setText(theme.heading);
            doc.text("GrowWithHR", x, 66, { align: "center" });

            setFont("bold", 12);
            setText(theme.accentDark);
            doc.text("Executive Advisory Report", x, 77, { align: "center" });

            setDraw(theme.accent);
            doc.setLineWidth(0.6);
            doc.line(x - 36, 82, x - 14, 82);
            doc.line(x + 14, 82, x + 36, 82);

            setFont("bold", 8.5);
            setText(theme.heading);
            doc.text(options.coverLabel, x, 95, { align: "center" });

            setFont("normal", 11);
            setText(theme.text);
            doc.text(split(model.companyName, 160), x, 110, {
                align: "center",
                lineHeightFactor: 1.2
            });

            setFill(theme.panelAlt);
            setDraw(theme.line);
            doc.roundedRect(25, 135, 160, 50, 3, 3, "FD");

            const columns = [52, 105, 158];
            [
                ["INDUSTRY", model.industry],
                ["WORKFORCE", model.employeeLabel || pluralise(model.employees, "employee")],
                ["LOCATION", model.primaryState]
            ].forEach((item, index) => {
                setFont("bold", 7.2);
                setText(theme.heading);
                doc.text(item[0], columns[index], 151, { align: "center" });
                setFont("normal", 8.2);
                setText(theme.text);
                doc.text(split(item[1], 44), columns[index], 161, {
                    align: "center",
                    lineHeightFactor: 1.25
                });

                if (index < 2) {
                    setDraw(theme.line);
                    doc.line(columns[index] + 26, 142, columns[index] + 26, 178);
                }
            });

            setFont("normal", BODY_SIZE);
            setText(theme.text);
            doc.text(split(options.coverIntro, 145), x, 203, {
                align: "center",
                lineHeightFactor: BODY_LINE_HEIGHT
            });

            setFont("normal", 9);
            setText(theme.muted);
            doc.text(formatDate(model.generatedAt), x, 237, { align: "center" });
        }

        function paragraph(text, settings = {}) {
            if (!cleanText(text)) return;

            const size = settings.size || BODY_SIZE;
            const factor = settings.lineHeight || BODY_LINE_HEIGHT;
            const indent = settings.indent || 0;
            const width = settings.width || usableWidth - indent;
            const lines = split(text, width);
            const height = lineHeight(size, factor);
            const spacingAfter = settings.spacingAfter ?? 4.5;
            let lineIndex = 0;

            while (lineIndex < lines.length) {
                let availableLines = Math.floor(remainingHeight() / height);

                if (availableLines < 1) {
                    addPage();
                    availableLines = Math.floor(remainingHeight() / height);
                }

                const chunk = lines.slice(lineIndex, lineIndex + availableLines);
                setFont(settings.style || "normal", size);
                setText(settings.colour || theme.text);
                doc.text(chunk, PAGE.left + indent, cursorY, {
                   align: settings.align ?? "justify",
                   lineHeightFactor: factor,
                   maxWidth: width
               });
                cursorY += chunk.length * height;
                lineIndex += chunk.length;

                if (lineIndex < lines.length) addPage();
            }

            cursorY += spacingAfter;
        }

        function sectionHeading(label, title, introduction = "") {
            const labelSize = 11.5;
            const titleSize = 11.2;
            const titleLines = split(title, usableWidth);
            const labelHeight = lineHeight(labelSize, 1.15);
            const titleHeight = titleLines.length * lineHeight(titleSize, 1.18);
            const introLines = introduction
                ? split(introduction, usableWidth - 12)
                : [];
            const introHeight = introLines.length
                ? introLines.length * lineHeight(BODY_SIZE, BODY_LINE_HEIGHT) + 12
                : 0;
            const required = labelHeight + titleHeight + introHeight + 23;

            ensureSpace(required);

            setFont("bold", labelSize);
            setText(theme.accentDark);
            doc.text(cleanText(label).toUpperCase(), PAGE.left, cursorY);
            cursorY += labelHeight + 2.5;

            setFont("bold", titleSize);
            setText(theme.heading);
            doc.text(titleLines, PAGE.left, cursorY, {
                lineHeightFactor: 1.18
            });
            cursorY += titleHeight + 1.8;

            setDraw(theme.accent);
            doc.setLineWidth(0.7);
            doc.line(PAGE.left, cursorY, PAGE.left + 28, cursorY);
            cursorY += 7;

            if (introLines.length) {
                const boxTop = cursorY - 3;
                setFill(theme.panelAlt);
                setDraw(theme.line);
                doc.roundedRect(
                    PAGE.left,
                    boxTop,
                    usableWidth,
                    introHeight,
                    2,
                    2,
                    "FD"
                );
                setFont("normal", BODY_SIZE);
                setText(theme.text);
                doc.text(introLines, PAGE.left + 6, boxTop + 7, {
                    lineHeightFactor: BODY_LINE_HEIGHT,
                    maxWidth: usableWidth - 12
                });
                cursorY = boxTop + introHeight + 8;
            }
        }

        function startTopic(label, title, introduction = "") {
            const page = addPage();
            sectionHeading(label, title, introduction);
            return page;
        }

        function subheading(title) {
            const lines = split(title, usableWidth);
            const required = lines.length * lineHeight(11.2, 1.18) + 5;
            ensureSpace(required);
            setFont("bold", 11.2);
            setText(theme.heading);
            doc.text(lines, PAGE.left, cursorY, {
                lineHeightFactor: 1.18
            });
            cursorY += required;
        }

        function numberedList(items, settings = {}) {
            unique(toArray(items)).forEach((item, index) => {
                const lines = split(item, usableWidth - 16);
                const itemHeight = lines.length * lineHeight(BODY_SIZE, 1.38) + 4;
                ensureSpace(itemHeight);
                setFill(theme.accentSoft);
                doc.circle(PAGE.left + 3.5, cursorY - 1.4, 3.1, "F");
                setFont("bold", 7.5);
                setText(theme.accentDark);
                doc.text(String(index + 1), PAGE.left + 3.5, cursorY - 0.2, {
                    align: "center"
                });
                setFont("normal", BODY_SIZE);
                setText(theme.text);
                doc.text(lines, PAGE.left + 11.5, cursorY, {
                    lineHeightFactor: 1.38,
                    maxWidth: usableWidth - 16
                });
                cursorY += itemHeight;
            });
            cursorY += settings.spacingAfter ?? 2;
        }

        function bulletList(items) {
            unique(toArray(items)).forEach((item) => {
                const lines = split(item, usableWidth - 10);
                const itemHeight = lines.length * lineHeight(BODY_SIZE, 1.38) + 3;
                ensureSpace(itemHeight);
                setFill(theme.accent);
                doc.circle(PAGE.left + 2.2, cursorY - 1, 0.85, "F");
                setFont("normal", BODY_SIZE);
                setText(theme.text);
                doc.text(lines, PAGE.left + 7, cursorY, {
                    lineHeightFactor: 1.38,
                    maxWidth: usableWidth - 10
                });
                cursorY += itemHeight;
            });
            cursorY += 4;
        }

        function profileTable(rows) {
            const labelWidth = 47;

            rows.forEach(([label, value], index) => {
                const valueLines = split(
                    cleanText(value, "Not specified"),
                    usableWidth - labelWidth - 12
                );
                const rowHeight = Math.max(
                    13,
                    valueLines.length * lineHeight(BODY_SIZE, 1.3) + 8
                );
                ensureSpace(rowHeight + 2);
                setFill(index % 2 ? theme.panelAlt : theme.panel);
                setDraw(theme.line);
                doc.roundedRect(
                    PAGE.left,
                    cursorY - 4,
                    usableWidth,
                    rowHeight,
                    1.5,
                    1.5,
                    "FD"
                );
                setFont("bold", 8.3);
                setText(theme.heading);
                doc.text(split(label, labelWidth - 7), PAGE.left + 5, cursorY + 1, {
                    lineHeightFactor: 1.25
                });
                setFont("normal", BODY_SIZE);
                setText(theme.text);
                doc.text(valueLines, PAGE.left + labelWidth + 3, cursorY + 1, {
                    lineHeightFactor: 1.3,
                    maxWidth: usableWidth - labelWidth - 12
                });
                cursorY += rowHeight + 2;
            });

            cursorY += 3;
        }

        function templateSubject(item, title) {
            return cleanText(item.resourceLabel, title)
                .replace(/^(?:click here to\s*)?(?:open|view|download|get)\s+/i, "")
                .replace(/\s*(?:template|resource|toolkit|guide)\s*$/i, "")
                .trim() || title;
        }

        function recommendationCard(item, index) {
            const title = cleanText(item.title, `Recommendation ${index + 1}`);
            const howTo = unique(toArray(item.howTo));
            ensureSpace(38);

            setFill(theme.navy);
            setDraw(theme.navy);
            doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, 11, 1.7, 1.7, "FD");
            setFill(theme.accent);
            doc.roundedRect(PAGE.left, cursorY - 4, 2.4, 11, 1.2, 1.2, "F");
            setFont("bold", 7.6);
            setText(theme.accent);
            doc.text(
                `${cleanText(item.sourceLabel, "Recommendation").toUpperCase()} ${index + 1}`,
                PAGE.left + 8,
                cursorY + 2.3
            );
            cursorY += 14;

            subheading(title);

            if (item.source === "suggested" && item.suggestionReason) {
                paragraph(
                    `Why GrowWithHR suggests this: ${item.suggestionReason}.`,
                    {
                        style: "italic",
                        colour: theme.accentDark,
                        spacingAfter: 4
                    }
                );
            }

            paragraph(item.observation, {
                colour: theme.muted,
                spacingAfter: 5
            });
            paragraph(item.recommendation, { spacingAfter: 7 });

            if (howTo.length) {
                ensureSpace(12);
                setFont("bold", 8);
                setText(theme.accentDark);
                doc.text("HOW TO IMPLEMENT", PAGE.left, cursorY);
                cursorY += 8;
                numberedList(howTo, { spacingAfter: 4 });
            }

            const metadata = [
                item.owner ? `Owner: ${item.owner}` : "",
                item.timeframe ? `Timing: ${item.timeframe}` : ""
            ].filter(Boolean);

            if (metadata.length || item.resourceUrl) {
                const linkLabel = item.resourceUrl
                    ? `Click here to download template for ${templateSubject(item, title)}`
                    : "";
                const metadataLines = metadata.length
                    ? split(metadata.join("   •   "), usableWidth - 12)
                    : [];
                const linkLines = linkLabel
                    ? split(linkLabel, usableWidth - 18)
                    : [];
                const boxHeight = 8 +
                    metadataLines.length * lineHeight(8, 1.25) +
                    linkLines.length * lineHeight(8.3, 1.25) +
                    (linkLines.length ? 5 : 0);

                ensureSpace(boxHeight + 5);
                const boxTop = cursorY - 3;
                setFill(theme.panel);
                setDraw(theme.line);
                doc.roundedRect(
                    PAGE.left,
                    boxTop,
                    usableWidth,
                    boxHeight,
                    2,
                    2,
                    "FD"
                );

                if (metadataLines.length) {
                    setFont("normal", 8);
                    setText(theme.text);
                    doc.text(metadataLines, PAGE.left + 6, cursorY + 2, {
                        lineHeightFactor: 1.25
                    });
                    cursorY += metadataLines.length * lineHeight(8, 1.25) + 4;
                }

                if (linkLines.length) {
                    setFont("bold", 8.3);
                    setText(theme.accentDark);
                    const url = new URL(item.resourceUrl, window.location.href).href;
                    linkLines.forEach((line) => {
                        doc.textWithLink(line, PAGE.left + 11, cursorY, { url });
                        cursorY += lineHeight(8.3, 1.25);
                    });
                }

                cursorY = boxTop + boxHeight + 7;
            } else {
                cursorY += 4;
            }
        }

        function summaryTable(rows, title = "AT A GLANCE") {
            if (!rows.length) return;

            const widths = [63, 63, 52];
            const headers = ["Focus Area", "Why It Matters", "First Step"];
            const bodySize = 7.1;
            const bodyFactor = 1.24;
            const paddingY = 4;
            const preparedRows = rows.map((row) =>
                row.map((cell, index) => split(cell, widths[index] - 5))
            );
            const rowHeights = preparedRows.map((row) =>
                Math.max(
                    10,
                    ...row.map(
                        (lines) => lines.length * lineHeight(bodySize, bodyFactor) + paddingY * 2
                    )
                )
            );

            function drawTableHeader() {
                ensureSpace(25);
                setFill(theme.panelAlt);
                setDraw(theme.line);
                doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, 18, 2, 2, "FD");
                setFont("bold", 7.5);
                setText(theme.accentDark);
                doc.text(title, PAGE.left + 5, cursorY + 1);
                cursorY += 8;
                let x = PAGE.left + 5;
                headers.forEach((headerText, index) => {
                    setFont("bold", 7);
                    setText(theme.heading);
                    doc.text(headerText, x, cursorY);
                    x += widths[index];
                });
                cursorY += 7;
            }

            drawTableHeader();

            preparedRows.forEach((row, rowIndex) => {
                const rowHeight = rowHeights[rowIndex];

                if (rowHeight + 4 > remainingHeight()) {
                    addPage();
                    drawTableHeader();
                }

                const rowTop = cursorY - 3;
                setFill(rowIndex % 2 ? theme.panel : theme.panelAlt);
                setDraw(theme.line);
                doc.rect(PAGE.left, rowTop, usableWidth, rowHeight, "FD");

                let x = PAGE.left + 5;
                row.forEach((lines, index) => {
                    setFont("normal", bodySize);
                    setText(theme.text);
                    doc.text(lines, x, cursorY + paddingY - 1, {
                        lineHeightFactor: bodyFactor,
                        maxWidth: widths[index] - 5
                    });
                    x += widths[index];
                });
                cursorY += rowHeight;
            });

            cursorY += 5;
        }

        function roadmapStage(label, title, items) {
            const prepared = unique(toArray(items)).map((item) =>
                split(item, usableWidth - 18)
            );
            const listHeight = prepared.reduce(
                (sum, lines) => sum + lines.length * lineHeight(8.7, 1.34) + 3.5,
                0
            );
            const boxHeight = Math.max(31, 22 + listHeight);
            ensureSpace(boxHeight + 7);
            const boxTop = cursorY - 3;

            setFill(theme.panelAlt);
            setDraw(theme.line);
            doc.roundedRect(
                PAGE.left,
                boxTop,
                usableWidth,
                boxHeight,
                2,
                2,
                "FD"
            );
            setFill(theme.navy);
            doc.roundedRect(PAGE.left, boxTop, 40, 11, 2, 2, "F");
            setFont("bold", 7.4);
            setText(theme.accent);
            doc.text(label, PAGE.left + 5, boxTop + 7);
            setFont("bold", 10.2);
            setText(theme.heading);
            doc.text(title, PAGE.left + 46, boxTop + 7);

            let y = boxTop + 18;
            prepared.forEach((lines) => {
                setFill(theme.accent);
                doc.circle(PAGE.left + 7, y - 1.1, 0.8, "F");
                setFont("normal", 8.7);
                setText(theme.text);
                doc.text(lines, PAGE.left + 12, y, {
                    lineHeightFactor: 1.34,
                    maxWidth: usableWidth - 18
                });
                y += lines.length * lineHeight(8.7, 1.34) + 3.5;
            });

            cursorY = boxTop + boxHeight + 7;
        }

        function successBox() {
            const success = [
                "Compliant and audit-ready",
                "Efficient processes",
                "Engaged and productive team",
                "Ready to scale"
            ];
            const gap = 6;
            const columnWidth = (usableWidth - gap) / 2;
            const rows = [success.slice(0, 2), success.slice(2, 4)];
            const prepared = rows.map((row) =>
                row.map((text) => split(text, columnWidth - 12))
            );
            const rowHeights = prepared.map((row) =>
                Math.max(
                    ...row.map((lines) => lines.length * lineHeight(8.5, 1.28) + 12)
                )
            );
            const boxHeight = 18 + rowHeights.reduce((sum, value) => sum + value, 0) + 5;
            ensureSpace(boxHeight + 5);
            const boxTop = cursorY - 3;

            setFill(theme.panelAlt);
            setDraw(theme.line);
            doc.roundedRect(
                PAGE.left,
                boxTop,
                usableWidth,
                boxHeight,
                2,
                2,
                "FD"
            );
            setFont("bold", 9.2);
            setText(theme.accentDark);
            doc.text("SUCCESS LOOKS LIKE", PAGE.left + 6, boxTop + 8);

            let rowTop = boxTop + 15;
            prepared.forEach((row, rowIndex) => {
                row.forEach((lines, columnIndex) => {
                    const x = PAGE.left + columnIndex * (columnWidth + gap);
                    setFill(theme.panel);
                    setDraw(theme.line);
                    doc.roundedRect(
                        x + 3,
                        rowTop,
                        columnWidth - 6,
                        rowHeights[rowIndex] - 3,
                        1.5,
                        1.5,
                        "FD"
                    );
                    setFont("normal", 8.5);
                    setText(theme.text);
                    doc.text(lines, x + columnWidth / 2, rowTop + 7, {
                        align: "center",
                        lineHeightFactor: 1.28,
                        maxWidth: columnWidth - 12
                    });
                });
                rowTop += rowHeights[rowIndex];
            });

            cursorY = boxTop + boxHeight + 7;
        }

        function roadmap(roadmapData) {
            roadmapStage("0–30 DAYS", "Build the Foundation", roadmapData?.first30 || []);
            roadmapStage("31–60 DAYS", "Strengthen and Align", roadmapData?.next60 || []);
            roadmapStage("61–90 DAYS", "Scale with Confidence", roadmapData?.next90 || []);
            successBox();
        }

        function tableOfContents(entries, pageNumber, contentStartPage) {
            doc.setPage(pageNumber);
            paintPage();
            cursorY = 34;

            setFont("bold", 12);
            setText(theme.accentDark);
            doc.text("REPORT GUIDE", PAGE.left, cursorY);
            cursorY += 10;

            setFont("bold", 22);
            setText(theme.heading);
            doc.text("Table of Contents", PAGE.left, cursorY);
            cursorY += 5;

            setDraw(theme.accent);
            doc.setLineWidth(0.8);
            doc.line(PAGE.left, cursorY, PAGE.left + 35, cursorY);
            cursorY += 14;

            paragraph(
                "Each major topic begins on a new page. Page numbering starts with the Executive Snapshot so the advisory sections can be referenced independently of the cover and contents pages.",
                { spacingAfter: 10 }
            );

            entries.forEach((entry, index) => {
                const displayPage = entry.page - contentStartPage + 1;
                const itemHeight = 15;
                ensureSpace(itemHeight);
                setFill(index % 2 ? theme.panel : theme.panelAlt);
                setDraw(theme.line);
                doc.roundedRect(
                    PAGE.left,
                    cursorY - 5,
                    usableWidth,
                    12,
                    1.5,
                    1.5,
                    "FD"
                );
                setFont("normal", 9.2);
                setText(theme.text);
                doc.text(entry.title, PAGE.left + 6, cursorY + 1);
                setDraw(theme.line);
                doc.setLineDashPattern([1.2, 1.2], 0);
                doc.line(PAGE.left + 78, cursorY, PAGE.width - PAGE.right - 16, cursorY);
                doc.setLineDashPattern([], 0);
                setFont("bold", 9.2);
                setText(theme.accentDark);
                doc.text(String(displayPage), PAGE.width - PAGE.right - 7, cursorY + 1, {
                    align: "right"
                });
                cursorY += itemHeight;
            });
        }

        function endPage() {
            const page = addPage({ withHeader: false });
            const x = PAGE.width / 2;
            const y = PAGE.height / 2;

            setFill(theme.panelAlt);
            setDraw(theme.line);
            doc.roundedRect(30, y - 27, 150, 54, 3, 3, "FD");
            setDraw(theme.accent);
            doc.setLineWidth(0.7);
            doc.line(x - 36, y - 10, x - 14, y - 10);
            doc.line(x + 14, y - 10, x + 36, y - 10);
            setFont("bold", 23);
            setText(theme.heading);
            doc.text("End of Report", x, y + 4, { align: "center" });

            return page;
        }

        function footerLogo(page) {
            if (!logoDataUrl) return;

            try {
                doc.addImage(
                    logoDataUrl,
                    "PNG",
                    PAGE.left,
                    PAGE.footerMainY - 4.7,
                    5.5,
                    5.5,
                    `footer-logo-${page}`,
                    "FAST"
                );
            } catch (_error) {}
        }

        function footers({ startPage, endPage }) {
            const total = Math.max(0, endPage - startPage + 1);

            for (let page = startPage; page <= endPage; page += 1) {
                doc.setPage(page);
                setDraw(theme.line);
                doc.setLineWidth(0.25);
                doc.line(
                    PAGE.left,
                    PAGE.footerRuleY,
                    PAGE.width - PAGE.right,
                    PAGE.footerRuleY
                );
                footerLogo(page);
                setFont("bold", 7.1);
                setText(theme.accentDark);
                doc.text("GrowWithHR", PAGE.left + (logoDataUrl ? 7.5 : 0), PAGE.footerMainY);
                setFont("bold", 6.8);
                setText(theme.muted);
                doc.text(
                    "HRTechify - People • Technology • Growth",
                    PAGE.width / 2,
                    PAGE.footerMainY,
                    { align: "center" }
                );
                setFont("normal", 6.2);
                doc.text(
                    "© 2026 HRTechify. All rights reserved.",
                    PAGE.width / 2,
                    PAGE.footerSubY,
                    { align: "center" }
                );
                setFont("normal", 6.8);
                doc.text(
                    `Page ${page - startPage + 1} of ${total}`,
                    PAGE.width - PAGE.right,
                    PAGE.footerMainY,
                    { align: "right" }
                );
            }
        }

        paintPage();

        return {
            cover,
            addPage,
            startTopic,
            sectionHeading,
            paragraph,
            subheading,
            numberedList,
            bulletList,
            profileTable,
            recommendationCard,
            summaryTable,
            roadmap,
            tableOfContents,
            endPage,
            footers
        };
    }

    function render(doc, model, logoDataUrl, options) {
        const writer = createWriter(doc, model, logoDataUrl, options);
        const contents = [];

        writer.cover();
        const contentsPage = writer.addPage({ withHeader: false });

        const executiveSnapshotPage = writer.startTopic(
            "EXECUTIVE SNAPSHOT",
            "About Your Organisation",
            "The organisation context used to shape this advisory."
        );
        contents.push({ title: "Executive Snapshot", page: executiveSnapshotPage });
        writer.profileTable([
            ["Organisation", model.companyName],
            ["Industry", model.industry],
            ["What it does", model.nature],
            ["Legal structure", model.entity],
            ["Workforce", model.employeeLabel || pluralise(model.employees, "employee")],
            ["Working model", model.workModel],
            ["Primary base", model.primaryState],
            ["Footprint", `${pluralise(model.locations, "location")} across ${pluralise(model.countries, "country", "countries")}`],
            ["Hiring direction", model.hiringPlans],
            ["People support", model.peopleFunction]
        ]);

        const executiveSummaryPage = writer.startTopic(
            "EXECUTIVE SUMMARY",
            "What Matters Next",
            "Your leadership selections remain the primary focus of this advisory. Complementary Company DNA insights are presented separately to help you consider the broader capabilities needed for resilient, sustainable growth."
        );
        contents.push({ title: "Executive Summary", page: executiveSummaryPage });
        writer.subheading("Organisation and market context");
        unique(model.executiveContext || []).forEach((text) => writer.paragraph(text));
        writer.subheading("Leadership implications");
        unique(model.executiveSummary || []).forEach((text) => writer.paragraph(text));
        writer.subheading("Priorities selected by you");

        if (model.selectedPriorities.length) {
            writer.numberedList(model.selectedPriorities);
        } else {
            writer.paragraph("No specific priority was selected in the briefing.", {
                style: "italic"
            });
        }

        if (model.suggestedPriorities.length) {
            writer.subheading("Additional Strategic Priorities Informed by Your Company DNA");
            writer.paragraph(
                "While this report highlights the areas that require the most immediate attention based on your stated priorities, your Company DNA also points to complementary capabilities that merit leadership consideration. Strengthening the areas below can improve organisational resilience, support sustainable growth and prepare the business for its next stage of development.",
                { spacingAfter: 5 }
            );
            writer.numberedList(
                model.suggestedPriorities.map(
                    (name) => `${name} - recommended in view of ${model.suggestionReasons[name]}.`
                )
            );
        }

        const foundationsPage = writer.startTopic(
            "POSITIVE FOUNDATIONS",
            "What Is Already Working",
            "These strengths provide a base for the organisation's next stage of development and should be protected as new structure is introduced."
        );
        contents.push({ title: "Positive Foundations", page: foundationsPage });
        writer.bulletList(model.strengths);

        const recommendationsPage = writer.startTopic(
            "RECOMMENDED ACTIONS",
            "Strategic Recommendations",
            "Recommendations are grouped by source so leadership-selected priorities remain distinct from complementary Company DNA suggestions."
        );
        contents.push({ title: "Strategic Recommendations", page: recommendationsPage });
        const selectedRecommendations = (model.recommendations || []).filter(
            (item) => item.source === "selected"
        );
        const suggestedRecommendations = (model.recommendations || []).filter(
            (item) => item.source === "suggested"
        );

        if (selectedRecommendations.length) {
            writer.subheading("Selected by you");
            selectedRecommendations.forEach((item, index) =>
                writer.recommendationCard(item, index)
            );
            writer.summaryTable(
                selectedRecommendations.map((recommendation) => [
                    `${cleanText(recommendation.title)} (Selected by you)`,
                    cleanText(recommendation.observation, "Supports organisational readiness"),
                    cleanText(toArray(recommendation.howTo)[0], "Assign an owner and begin")
                ]),
                "YOUR SELECTED PRIORITIES AT A GLANCE"
            );
        }

        if (suggestedRecommendations.length) {
            writer.subheading("Additional Strategic Priorities Informed by Your Company DNA");
            writer.paragraph(
                "These recommendations draw on organisation characteristics such as workforce size, work model, operating footprint, hiring direction and People/HR support. They are complementary considerations and do not replace the priorities selected by leadership.",
                { spacingAfter: 6 }
            );
            suggestedRecommendations.forEach((item, index) =>
                writer.recommendationCard(item, index)
            );
            writer.summaryTable(
                suggestedRecommendations.map((recommendation) => [
                    `${cleanText(recommendation.title)} (Company DNA suggestion)`,
                    cleanText(
                        recommendation.suggestionReason || recommendation.observation,
                        "Supports organisational readiness"
                    ),
                    cleanText(toArray(recommendation.howTo)[0], "Assign an owner and begin")
                ]),
                "COMPANY DNA SUGGESTIONS AT A GLANCE"
            );
        }

        const compliancePage = writer.startTopic(
            "COMPLIANCE REVIEW",
            "What You Should Do",
            "These are governance prompts only. Confirm applicability with qualified advisers and current official sources before implementation."
        );
        contents.push({ title: "Compliance Review", page: compliancePage });
        writer.bulletList(model.compliance);
        writer.subheading("Suggested governance rhythm");
        writer.numberedList([
            "Assign one accountable owner for each obligation or policy area.",
            "Record completion evidence and the next review date.",
            "Escalate overdue or high-risk items through a regular leadership forum.",
            "Reassess after changes in workforce count, location, worker type or operating model."
        ]);

        const roadmapPage = writer.startTopic(
            "0–90 DAYS ROADMAP",
            "Your First Steps",
            "Each action is labelled to show whether it comes from a priority selected by leadership or a complementary Company DNA suggestion."
        );
        contents.push({ title: "0–90 Days Roadmap", page: roadmapPage });
        writer.roadmap(model.roadmap);

        const lookingAheadPage = writer.startTopic(
            "LOOKING AHEAD",
            "Sustainable Growth, People First",
            "The organisation should build capability in sequence, protecting what already works while increasing clarity, consistency and evidence."
        );
        contents.push({ title: "Looking Ahead", page: lookingAheadPage });
        writer.bulletList(model.opportunities);
        writer.paragraph(
            `${model.companyName} should begin with the priorities selected by leadership, then review the separate Company DNA suggestions as supporting considerations alongside business performance.`
        );

        const importantInformationPage = writer.startTopic(
            "IMPORTANT INFORMATION",
            options.isSample
                ? "Sample Notice and Disclaimer"
                : "Confidentiality and Disclaimer",
            "Please read this section before sharing or acting on the advisory."
        );
        contents.push({ title: "Important Information", page: importantInformationPage });
        writer.subheading(options.isSample ? "Illustrative sample notice" : "Confidentiality notice");
        writer.paragraph(
            options.isSample
                ? "This sample uses fictional information and demonstrates the structure of a GrowWithHR advisory."
                : "This advisory is a confidential leadership working document prepared from information supplied by the user. It should be shared only with appropriate stakeholders."
        );
        writer.subheading("Advisory disclaimer");
        writer.paragraph(
            "It provides general business and people-management guidance and is not legal, tax, accounting, employment-law or regulatory advice. Verify requirements with qualified professionals and current official sources."
        );

        const endPage = writer.endPage();
        writer.tableOfContents(contents, contentsPage, executiveSnapshotPage);
        writer.footers({
            startPage: executiveSnapshotPage,
            endPage: endPage - 1
        });
    }

    async function buildAdvisoryPdf(payload = {}) {
        const baseModel = previous.buildAdvisoryModel(payload);
        const model = enrichPrioritySources(payload, baseModel);
        const theme = resolveTheme(payload);
        const options = {
            theme,
            isSample: Boolean(payload.isSample),
            runningTitle: cleanText(
                payload.runningTitle,
                "GrowWithHR Executive Advisory"
            ),
            coverLabel: cleanText(
                payload.coverLabel,
                payload.isSample
                    ? "ILLUSTRATIVE SAMPLE"
                    : "PERSONALISED FOR YOUR ORGANISATION"
            ),
            coverIntro: cleanText(
                payload.coverIntro,
                "Your personalised people and HR advisory report with practical recommendations to help you build a scalable, compliant and high-performing organisation."
            )
        };
        const logoDataUrl = await loadTransparentLogo();
        const doc = new JsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
            putOnlyUsedFonts: true
        });

        doc.setProperties({
            title: `${options.isSample ? "Sample " : ""}Executive Advisory - ${model.companyName}`,
            subject: "HRTechify GrowWithHR Executive Advisory",
            author: "HRTechify",
            creator: `GrowWithHR PDF ${VERSION} / ${EXPERIENCE_VERSION}`,
            keywords: "HRTechify, GrowWithHR, executive advisory, people strategy"
        });

        render(doc, model, logoDataUrl, options);

        const filename = cleanText(
            payload.filename,
            options.isSample
                ? `HRTechify-Sample-Executive-Advisory-${theme}.pdf`
                : `GrowWithHR-Advisory-${escapeFilename(model.companyName)}-${theme}.pdf`
        );
        const dataUri = doc.output("datauristring");
        const arrayBuffer = doc.output("arraybuffer");

        return {
            document: doc,
            filename,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            dataUri,
            sizeBytes: arrayBuffer.byteLength,
            pageCount: doc.getNumberOfPages(),
            generatedAt: new Date().toISOString(),
            companyName: model.companyName,
            version: VERSION,
            theme,
            isSample: options.isSample
        };
    }

    async function downloadAdvisoryPdf(payload = {}) {
        let result = payload.document || payload.pdf || null;

        if (result && typeof result.save === "function") {
            result = {
                document: result,
                filename: cleanText(payload.filename, DEFAULT_FILENAME)
            };
        }

        if (!result || (!result.document && typeof result.save !== "function")) {
            result = await buildAdvisoryPdf(payload);
        }

        const doc = result.document || result;
        const filename = cleanText(
            result.filename || payload.filename,
            DEFAULT_FILENAME
        );

        if (!doc || typeof doc.save !== "function") {
            throw new Error("A valid jsPDF document was not available for download.");
        }

        doc.save(filename);

        try {
            window.localStorage?.setItem(LAST_DOWNLOAD_KEY, new Date().toISOString());
        } catch (_error) {}

        return result;
    }

    async function generatePDFReport() {
        const button = document.getElementById("generateReportBtn");

        if (button) {
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
        }

        try {
            const result = await buildAdvisoryPdf({
                report: getStoredReport(),
                theme: resolveTheme(),
                lead: {
                    email: cleanText(document.getElementById("userEmail")?.value),
                    deliveryRequested: true
                }
            });
            await downloadAdvisoryPdf(result);
            window.closePDFModal?.();
        } catch (error) {
            console.error("GrowWithHR PDF polish: report generation failed.", error);
            window.alert?.("We could not prepare the PDF just yet. Please try again.");
        } finally {
            if (button) {
                button.disabled = false;
                button.removeAttribute("aria-busy");
            }
        }
    }

    window.GrowWithHRPDF = Object.freeze({
        version: VERSION,
        experienceVersion: EXPERIENCE_VERSION,
        buildAdvisoryPdf,
        downloadAdvisoryPdf,
        buildAdvisoryModel: previous.buildAdvisoryModel
    });
    window.generatePDFReport = generatePDFReport;
    window.GrowWithHRPDFPolishReady = Promise.resolve(window.GrowWithHRPDF);
})(window, document);
