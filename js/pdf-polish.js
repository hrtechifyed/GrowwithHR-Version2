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
            page: [248, 250, 253],
            cover: [8, 22, 45],
            panel: [255, 255, 255],
            panelAlt: [241, 245, 250],
            text: [27, 38, 55],
            muted: [82, 96, 116],
            heading: [8, 22, 45],
            line: [207, 216, 228],
            accent: [245, 158, 11],
            accentDark: [183, 102, 3],
            accentSoft: [255, 244, 218],
            white: [255, 255, 255]
        }),
        dark: Object.freeze({
            page: [7, 16, 31],
            cover: [4, 11, 24],
            panel: [15, 29, 50],
            panelAlt: [20, 37, 62],
            text: [234, 240, 248],
            muted: [164, 178, 199],
            heading: [255, 255, 255],
            line: [47, 67, 94],
            accent: [245, 158, 11],
            accentDark: [255, 190, 75],
            accentSoft: [55, 41, 18],
            white: [255, 255, 255]
        })
    });

    const PAGE = Object.freeze({
        width: 210,
        height: 297,
        left: 17,
        right: 17,
        top: 27,
        contentBottom: 273,
        headerY: 12,
        headerRuleY: 18,
        footerRuleY: 278,
        footerMainY: 286,
        footerSubY: 291,
        borderInset: 6
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
        const stored = window.localStorage?.getItem(REPORT_THEME_KEY);
        const requested = cleanText(
            payload.theme ||
                payload.reportTheme ||
                payload.pdfTheme ||
                selected?.value ||
                stored,
            "light"
        );
        const theme = /dark/i.test(requested) ? "dark" : "light";

        try {
            window.localStorage?.setItem(REPORT_THEME_KEY, theme);
        } catch (_error) {}

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

        const setFont = (style = "normal", size = 10) => {
            doc.setFont("helvetica", style);
            doc.setFontSize(size);
        };
        const setText = (colour) => doc.setTextColor(...colour);
        const setFill = (colour) => doc.setFillColor(...colour);
        const setDraw = (colour) => doc.setDrawColor(...colour);
        const split = (text, width) => doc.splitTextToSize(cleanText(text), width);
        const lineHeight = (size, factor = 1.38) => size * 0.3528 * factor;

        function drawPageBorder(isCover = false) {
            setDraw(isCover ? theme.accent : theme.line);
            doc.setLineWidth(isCover ? 0.55 : 0.35);
            doc.roundedRect(
                PAGE.borderInset,
                PAGE.borderInset,
                PAGE.width - PAGE.borderInset * 2,
                PAGE.height - PAGE.borderInset * 2,
                2,
                2,
                "S"
            );
        }

        function paintPage(isCover = false) {
            setFill(isCover ? theme.cover : theme.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
            drawPageBorder(isCover);
        }

        function header() {
            setFont("normal", 7.6);
            setText(theme.muted);
            doc.text(options.runningTitle, PAGE.width / 2, PAGE.headerY, {
                align: "center"
            });
            setDraw(theme.line);
            doc.setLineWidth(0.25);
            doc.line(PAGE.left, PAGE.headerRuleY, PAGE.width - PAGE.right, PAGE.headerRuleY);
        }

        function addPage() {
            doc.addPage();
            paintPage(false);
            cursorY = PAGE.top;
            header();
        }

        function remainingHeight() {
            return PAGE.contentBottom - cursorY;
        }

        function ensureSpace(height) {
            if (height > remainingHeight()) addPage();
        }

        function cover() {
            paintPage(true);
            const centreX = PAGE.width / 2;

            if (logoDataUrl) {
                try {
                    doc.addImage(
                        logoDataUrl,
                        "PNG",
                        centreX - 15,
                        22,
                        30,
                        30,
                        undefined,
                        "FAST"
                    );
                } catch (_error) {}
            }

            setFont("bold", 15);
            setText(theme.white);
            doc.text("HRTechify", centreX, 62, { align: "center" });

            setFont("normal", 9.4);
            setText([198, 211, 230]);
            doc.text("People • Technology • Growth", centreX, 69, { align: "center" });

            setFont("bold", 9.2);
            setText(theme.accent);
            doc.text(options.coverLabel, centreX, 91, { align: "center" });

            setFont("bold", 28);
            setText(theme.white);
            const title = split(options.coverTitle, 166);
            doc.text(title, centreX, 109, {
                align: "center",
                lineHeightFactor: 1.08
            });

            const titleY = 109 + title.length * lineHeight(28, 1.08) + 7;
            setFont("normal", 15);
            setText([218, 228, 242]);
            doc.text(split(model.companyName, 166), centreX, titleY, {
                align: "center",
                lineHeightFactor: 1.18
            });

            setFill([15, 31, 54]);
            setDraw([48, 68, 96]);
            doc.setLineWidth(0.3);
            doc.roundedRect(24, 164, 162, 48, 4, 4, "FD");
            setDraw(theme.accent);
            doc.setLineWidth(0.8);
            doc.line(39, 164, 171, 164);

            setFont("normal", 10.1);
            setText([229, 236, 246]);
            doc.text(split(options.coverIntro, 142), centreX, 180, {
                align: "center",
                lineHeightFactor: 1.45
            });

            setFont("normal", 9);
            setText([176, 190, 210]);
            doc.text(`Prepared for ${model.recipientName}`, centreX, 229, {
                align: "center"
            });
            doc.text(`Prepared ${formatDate(model.generatedAt)}`, centreX, 237, {
                align: "center"
            });
            doc.text(
                `Report style: ${options.theme === "dark" ? "Dark presentation" : "Light print-friendly"}`,
                centreX,
                245,
                { align: "center" }
            );

            setFont("italic", 8.1);
            setText([176, 190, 210]);
            doc.text(
                split(
                    options.isSample
                        ? "Illustrative sample using fictional organisation information."
                        : "Confidential working document. Verify legal and regulatory requirements with qualified professionals and current official sources.",
                    156
                ),
                centreX,
                261,
                {
                    align: "center",
                    lineHeightFactor: 1.3
                }
            );
        }

        function paragraph(text, settings = {}) {
            const size = settings.size || 9.4;
            const factor = settings.lineHeight || 1.42;
            const spacingAfter = settings.spacingAfter ?? 4.5;
            const indent = settings.indent || 0;
            const width = settings.width || usableWidth - indent;
            const lines = split(text, width);
            const height = lineHeight(size, factor);
            let index = 0;

            while (index < lines.length) {
                if (remainingHeight() < height + 2) addPage();
                const available = Math.max(1, Math.floor(remainingHeight() / height));
                const chunk = lines.slice(index, index + available);
                setFont(settings.style || "normal", size);
                setText(settings.colour || theme.text);
                doc.text(chunk, PAGE.left + indent, cursorY, {
                    lineHeightFactor: factor,
                    align: settings.align || "left"
                });
                cursorY += chunk.length * height;
                index += chunk.length;
                if (index < lines.length) addPage();
            }

            cursorY += spacingAfter;
        }

        function sectionHeading(heading, subheading, introduction = "") {
            ensureSpace(introduction ? 34 : 25);

            setFont("bold", 15.5);
            setText(theme.heading);
            const headingLines = split(heading, usableWidth);
            doc.text(headingLines, PAGE.left, cursorY, {
                lineHeightFactor: 1.12
            });
            cursorY += headingLines.length * lineHeight(15.5, 1.12) + 2.5;

            if (subheading) {
                setFont("normal", 10.5);
                setText(theme.muted);
                const subheadingLines = split(subheading, usableWidth);
                doc.text(subheadingLines, PAGE.left, cursorY, {
                    lineHeightFactor: 1.25
                });
                cursorY += subheadingLines.length * lineHeight(10.5, 1.25) + 4;
            }

            setDraw(theme.accent);
            doc.setLineWidth(0.75);
            doc.line(PAGE.left, cursorY, PAGE.left + 26, cursorY);
            cursorY += 7;

            if (introduction) {
                paragraph(introduction, {
                    size: 9.2,
                    colour: theme.muted,
                    spacingAfter: 6
                });
            }
        }

        function subheading(title) {
            ensureSpace(14);
            setFont("bold", 11.2);
            setText(theme.heading);
            const lines = split(title, usableWidth);
            doc.text(lines, PAGE.left, cursorY, {
                lineHeightFactor: 1.18
            });
            cursorY += lines.length * lineHeight(11.2, 1.18) + 4;
        }

        function numberedList(items, settings = {}) {
            unique(toArray(items)).forEach((item, index) => {
                const lines = split(item, usableWidth - 15);
                const height = lines.length * lineHeight(9.2, 1.4) + 3;
                ensureSpace(Math.min(height, 22));
                setFill(theme.accentSoft);
                doc.circle(PAGE.left + 3.7, cursorY - 1.5, 3.2, "F");
                setFont("bold", 7.8);
                setText(theme.accentDark);
                doc.text(String(index + 1), PAGE.left + 3.7, cursorY - 0.35, {
                    align: "center"
                });
                setFont("normal", 9.2);
                setText(theme.text);
                doc.text(lines, PAGE.left + 11, cursorY, {
                    lineHeightFactor: 1.4
                });
                cursorY += height;
            });
            cursorY += settings.spacingAfter ?? 1.5;
        }

        function bulletList(items) {
            unique(toArray(items)).forEach((item) => {
                const lines = split(item, usableWidth - 11);
                const height = lines.length * lineHeight(9.2, 1.4) + 2.8;
                ensureSpace(Math.min(height, 22));
                setFill(theme.accent);
                doc.circle(PAGE.left + 2.2, cursorY - 1, 0.9, "F");
                setFont("normal", 9.2);
                setText(theme.text);
                doc.text(lines, PAGE.left + 7.5, cursorY, {
                    lineHeightFactor: 1.4
                });
                cursorY += height;
            });
            cursorY += 1.5;
        }

        function profileRow(label, value, alternate) {
            const labelWidth = 46;
            const valueWidth = usableWidth - labelWidth - 14;
            const labelLines = split(label, labelWidth - 7);
            const valueLines = split(cleanText(value, "Not specified"), valueWidth);
            const textHeight = Math.max(
                labelLines.length * lineHeight(8.7, 1.32),
                valueLines.length * lineHeight(9.2, 1.38)
            );
            const rowHeight = Math.max(13, textHeight + 7.5);

            ensureSpace(rowHeight + 2);
            setFill(alternate ? theme.panelAlt : theme.panel);
            setDraw(theme.line);
            doc.setLineWidth(0.25);
            doc.roundedRect(PAGE.left, cursorY - 4, usableWidth, rowHeight, 2.2, 2.2, "FD");
            setFill(theme.accent);
            doc.roundedRect(PAGE.left, cursorY - 4, 2, rowHeight, 1, 1, "F");

            setFont("bold", 8.7);
            setText(theme.heading);
            doc.text(labelLines, PAGE.left + 6, cursorY + 1, {
                lineHeightFactor: 1.32
            });

            setFont("normal", 9.2);
            setText(theme.text);
            doc.text(valueLines, PAGE.left + labelWidth + 4, cursorY + 1, {
                lineHeightFactor: 1.38
            });

            cursorY += rowHeight + 2;
        }

        function profileTable(rows) {
            rows.forEach(([label, value], index) => {
                profileRow(label, value, index % 2 === 1);
            });
            cursorY += 2;
        }

        function resourceSubject(item, title) {
            const source = cleanText(item.resourceLabel, title)
                .replace(/^(?:click here to\s*)?(?:open|view|download|get)\s+/i, "")
                .replace(/\s*(?:template|resource|toolkit|guide)\s*$/i, "")
                .trim();

            return source || title;
        }

        function templateLink(item, title) {
            if (!item.resourceUrl) return;

            ensureSpace(13);
            const label = `Click here to download template for ${resourceSubject(item, title)}`;
            const linkLines = split(label, usableWidth - 5);
            const url = new URL(item.resourceUrl, window.location.href).href;

            setFont("bold", 8.8);
            setText(theme.accentDark);
            linkLines.forEach((line) => {
                doc.textWithLink(line, PAGE.left, cursorY, { url });
                cursorY += lineHeight(8.8, 1.28);
            });
            cursorY += 4;
        }

        function recommendationCard(item, index) {
            const title = cleanText(item.title, `Recommendation ${index + 1}`);
            const observation = cleanText(item.observation);
            const recommendation = cleanText(item.recommendation);
            const howTo = unique(toArray(item.howTo));
            const estimated =
                24 +
                split(title, usableWidth - 14).length * 5 +
                split(recommendation, usableWidth - 14).length * 4 +
                howTo.length * 8;

            ensureSpace(Math.min(estimated, 78));

            setFill(theme.panelAlt);
            setDraw(theme.line);
            doc.setLineWidth(0.25);
            doc.roundedRect(PAGE.left, cursorY - 5, usableWidth, 11, 2.5, 2.5, "FD");
            setFill(theme.accent);
            doc.roundedRect(PAGE.left, cursorY - 5, 2, 11, 1, 1, "F");

            setFont("bold", 7.7);
            setText(theme.accentDark);
            doc.text(`RECOMMENDATION ${index + 1}`, PAGE.left + 7, cursorY + 2);
            cursorY += 10;

            subheading(title);

            if (observation) {
                paragraph(observation, {
                    size: 8.9,
                    colour: theme.muted,
                    spacingAfter: 3.5
                });
            }

            paragraph(recommendation, {
                size: 9.3,
                spacingAfter: 4.5
            });

            if (howTo.length) {
                setFont("bold", 8.1);
                setText(theme.accentDark);
                doc.text("HOW TO IMPLEMENT", PAGE.left, cursorY);
                cursorY += 5.5;
                numberedList(howTo, { spacingAfter: 2.5 });
            }

            const meta = [
                item.owner ? `Owner: ${item.owner}` : "",
                item.timeframe ? `Timing: ${item.timeframe}` : ""
            ].filter(Boolean);

            if (meta.length) {
                paragraph(meta.join("   •   "), {
                    size: 8.2,
                    colour: theme.muted,
                    spacingAfter: 3
                });
            }

            templateLink(item, title);
            setDraw(theme.line);
            doc.setLineWidth(0.25);
            doc.line(PAGE.left, cursorY, PAGE.width - PAGE.right, cursorY);
            cursorY += 7;
        }

        function footerLogo(page) {
            if (!logoDataUrl) return;

            try {
                doc.addImage(
                    logoDataUrl,
                    "PNG",
                    PAGE.left,
                    PAGE.footerMainY - 4.8,
                    5.6,
                    5.6,
                    `footer-logo-${page}`,
                    "FAST"
                );
            } catch (_error) {}
        }

        function footers() {
            const total = doc.getNumberOfPages();

            for (let page = 1; page <= total; page += 1) {
                doc.setPage(page);
                const isCover = page === 1;
                const footerText = isCover ? [190, 203, 222] : theme.muted;
                const footerAccent = isCover ? theme.accent : theme.accentDark;
                const footerLine = isCover ? [65, 84, 111] : theme.line;

                setDraw(footerLine);
                doc.setLineWidth(0.28);
                doc.line(PAGE.left, PAGE.footerRuleY, PAGE.width - PAGE.right, PAGE.footerRuleY);

                footerLogo(page);
                setFont("bold", 7.4);
                setText(footerAccent);
                doc.text("GrowWithHR", PAGE.left + (logoDataUrl ? 7.5 : 0), PAGE.footerMainY);

                setFont("bold", 7.2);
                setText(footerText);
                doc.text(
                    "HRTechify - People • Technology • Growth",
                    PAGE.width / 2,
                    PAGE.footerMainY,
                    { align: "center" }
                );

                setFont("normal", 6.7);
                doc.text(
                    "© 2026 All Rights Reserved",
                    PAGE.width / 2,
                    PAGE.footerSubY,
                    { align: "center" }
                );

                setFont("normal", 7.1);
                doc.text(
                    `Page ${page} of ${total}`,
                    PAGE.width - PAGE.right,
                    PAGE.footerMainY,
                    { align: "right" }
                );
            }
        }

        paintPage(false);

        return {
            cover,
            addPage,
            ensureSpace,
            sectionHeading,
            paragraph,
            subheading,
            numberedList,
            bulletList,
            profileRow,
            profileTable,
            recommendationCard,
            footers
        };
    }

    function render(doc, model, logoDataUrl, options) {
        const writer = createWriter(doc, model, logoDataUrl, options);

        writer.cover();
        writer.addPage();

        writer.sectionHeading(
            "Executive Snapshot",
            "About Your Organisation",
            "The organisation context used to shape this advisory."
        );
        writer.profileTable([
            ["Organisation", model.companyName],
            ["Industry", model.industry],
            ["What it does", model.nature],
            ["Legal structure", model.entity],
            ["Workforce", model.employeeLabel || pluralise(model.employees, "employee")],
            [
                "Other workers",
                [
                    model.contractWorkers
                        ? pluralise(model.contractWorkers, "contract worker")
                        : "",
                    model.interns ? pluralise(model.interns, "intern") : "",
                    model.apprentices
                        ? pluralise(model.apprentices, "apprentice")
                        : ""
                ]
                    .filter(Boolean)
                    .join(", ") || "None specified"
            ],
            ["Working model", model.workModel],
            ["Primary base", model.primaryState],
            [
                "Footprint",
                `${pluralise(model.locations, "location")} across ${pluralise(
                    model.countries,
                    "country",
                    "countries"
                )}`
            ],
            ["Hiring direction", model.hiringPlans],
            ["People support", model.peopleFunction]
        ]);

        writer.sectionHeading("Executive Summary", "What Matters Next");
        unique(model.executiveSummary || []).forEach((text) => writer.paragraph(text));
        writer.subheading("Immediate leadership focus");
        writer.numberedList(model.priorities);

        writer.sectionHeading("Positive Foundations", "What Is Already Working");
        writer.bulletList(model.strengths);

        writer.sectionHeading(
            "Recommended Actions",
            "Strategic Recommendations",
            "Each recommendation includes practical implementation steps and a reusable starting template."
        );
        (model.recommendations || []).forEach((item, index) => {
            writer.recommendationCard(item, index);
        });

        writer.sectionHeading("Implementation Roadmap", "First 90 Days");
        writer.subheading("First 30 days — Create clarity");
        writer.numberedList(model.roadmap?.first30 || []);
        writer.subheading("Days 31–60 — Build consistency");
        writer.numberedList(model.roadmap?.next60 || []);
        writer.subheading("Days 61–90 — Embed and review");
        writer.numberedList(model.roadmap?.next90 || []);

        writer.sectionHeading(
            "Compliance Review",
            "What You Should Review",
            "Governance prompts only; confirm applicability with qualified advisers and official sources."
        );
        writer.bulletList(model.compliance);
        writer.subheading("Suggested governance rhythm");
        writer.numberedList([
            "Assign one accountable owner for each obligation or policy area.",
            "Record completion evidence and the next review date.",
            "Escalate overdue or high-risk items through a regular leadership forum.",
            "Reassess after changes in workforce count, location, worker type or operating model."
        ]);

        writer.sectionHeading("Looking Ahead", "Preparing for the Next Stage");
        writer.bulletList(model.opportunities);
        writer.paragraph(
            `${model.companyName} should select a small number of actions, assign clear owners and review progress alongside business performance.`
        );

        writer.sectionHeading(
            "Important Information",
            options.isSample ? "Sample Notice and Disclaimer" : "Confidentiality and Disclaimer"
        );
        writer.paragraph(
            options.isSample
                ? "This sample uses fictional information and demonstrates the structure of a GrowWithHR advisory."
                : "This advisory is a confidential leadership working document prepared from information supplied by the user."
        );
        writer.paragraph(
            "It provides general business and people-management guidance and is not legal, tax, accounting, employment-law or regulatory advice. Verify requirements with qualified professionals and current official sources."
        );

        writer.footers();
    }

    async function buildAdvisoryPdf(payload = {}) {
        const model = previous.buildAdvisoryModel(payload);
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
                    ? "ILLUSTRATIVE SAMPLE EXECUTIVE ADVISORY"
                    : "PERSONALISED EXECUTIVE ADVISORY"
            ),
            coverTitle: cleanText(payload.coverTitle, "Executive Advisory"),
            coverIntro: cleanText(
                payload.coverIntro,
                "A practical leadership briefing connecting your organisation profile with people, governance, compliance and growth priorities."
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
