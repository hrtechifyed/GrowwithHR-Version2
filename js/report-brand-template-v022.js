/* GrowWithHR v0.22 shared Light/Dark template and HRTechify branding */
(() => {
    "use strict";

    const base = window.GrowWithHRVisualReportCore;
    if (!base) throw new Error("GrowWithHR visual report core must load before brand template enforcement.");

    const VERSION = "0.22.1-shared-hrtechify-template";
    const TEMPLATE_ID = "hrtechify-action-brief-shared-v1";
    const HRTECHIFY_LOGO_ASSET = "assets/hrtechify-logo.png";
    const PAGE = Object.freeze({ width: 210, height: 297, left: 16, right: 194, top: 20, bottom: 266 });
    let logoPromise = null;
    let logoData = "";

    function clean(value, fallback = "") {
        return String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    }

    function loadLogo() {
        if (logoPromise) return logoPromise;
        logoPromise = new Promise((resolve) => {
            if (typeof window.Image !== "function" || !document?.createElement) return resolve("");
            const image = new window.Image();
            image.crossOrigin = "anonymous";
            image.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 640;
                    canvas.height = 640;
                    const context = canvas.getContext("2d");
                    if (!context) return resolve("");
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    const naturalWidth = Math.max(1, Number(image.naturalWidth || image.width || 1));
                    const naturalHeight = Math.max(1, Number(image.naturalHeight || image.height || 1));
                    const scale = Math.min(560 / naturalWidth, 560 / naturalHeight);
                    const width = naturalWidth * scale;
                    const height = naturalHeight * scale;
                    const x = (canvas.width - width) / 2;
                    const y = (canvas.height - height) / 2;
                    context.drawImage(image, x, y, width, height);
                    logoData = canvas.toDataURL("image/png");
                    resolve(logoData);
                } catch (_error) {
                    resolve("");
                }
            };
            image.onerror = () => resolve("");
            image.src = new URL(HRTECHIFY_LOGO_ASSET, window.location.href).href;
        });
        return logoPromise;
    }

    function drawPageBrand(doc) {
        if (!logoData) return;
        try {
            doc.addImage(logoData, "PNG", 178, 12, 16, 16, "HRTECHIFY_PAGE_LOGO", "FAST");
        } catch (_error) {}
    }

    function createWriter(doc, colours, sectionPages = {}) {
        let y = PAGE.top;
        const split = (value, width = 178) => doc.splitTextToSize(clean(value), width);
        const lineHeight = (size, factor = 1.22) => size * 0.3528 * factor;

        function paint() {
            doc.setFillColor(...colours.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
            drawPageBrand(doc);
        }
        function newPage() {
            doc.addPage();
            paint();
            y = PAGE.top;
        }
        function ensure(height) {
            if (y + height > PAGE.bottom) newPage();
        }
        function label(value, colour = colours.accent) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(...colour);
            doc.text(clean(value).toUpperCase(), PAGE.left, y);
            y += 7;
        }
        function title(value, intro = "") {
            const headingLines = split(value, 150);
            label(value);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(21);
            doc.setTextColor(...colours.heading);
            doc.text(headingLines, PAGE.left, y, { lineHeightFactor: 1.08, maxWidth: 150 });
            y += headingLines.length * lineHeight(21, 1.08) + 4;
            if (intro) {
                const introLines = split(intro, 166);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.8);
                doc.setTextColor(...colours.muted);
                doc.text(introLines, PAGE.left, y, { lineHeightFactor: 1.28, maxWidth: 166 });
                y += introLines.length * lineHeight(8.8, 1.28) + 8;
            }
        }
        function sectionPage(key, value, intro = "") {
            if (y > PAGE.top + 2) newPage();
            sectionPages[key] = doc.getNumberOfPages();
            title(value, intro);
        }
        function statCard(x, top, width, value, caption, colour) {
            const height = 42;
            const valueText = String(value);
            const captionLines = split(caption, width - 18);
            doc.setFillColor(...colours.surface);
            doc.setDrawColor(...colours.line);
            doc.roundedRect(x, top, width, height, 3, 3, "FD");
            doc.setFillColor(...colour);
            doc.roundedRect(x, top, 4, height, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(valueText.length > 16 ? 10.5 : valueText.length > 4 ? 12.5 : 18);
            doc.setTextColor(...colours.heading);
            doc.text(valueText, x + 10, top + 15, { maxWidth: width - 18 });
            doc.setFontSize(7.3);
            doc.setTextColor(...colours.muted);
            doc.text(captionLines, x + 10, top + 25, { lineHeightFactor: 1.15, maxWidth: width - 18 });
        }
        function infoCard(cardTitle, rows, options = {}) {
            const width = Number(options.width || 178);
            const titleLines = split(cardTitle, width - 20);
            const prepared = rows
                .filter((row) => clean(row?.[1]))
                .map(([rowLabel, value]) => ({
                    label: clean(rowLabel),
                    lines: split(base.compact(value, options.maxChars || 190), width - 28)
                }));
            const linkUrl = clean(options.link?.url);
            const linkLabel = clean(options.link?.label, "Open official source");
            const linkHeight = linkUrl ? 17 : 0;
            const height = 16 + titleLines.length * lineHeight(10, 1.16) + prepared.reduce((sum, row) => sum + 6 + row.lines.length * lineHeight(8, 1.24), 0) + linkHeight + 8;
            ensure(height + 5);
            const top = y;
            doc.setFillColor(...(options.fill || colours.surface));
            doc.setDrawColor(...colours.line);
            doc.roundedRect(PAGE.left, top, width, height, 3, 3, "FD");
            if (options.accent) {
                doc.setFillColor(...options.accent);
                doc.roundedRect(PAGE.left, top, 4, height, 2, 2, "F");
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...colours.heading);
            doc.text(titleLines, PAGE.left + 10, top + 10, { lineHeightFactor: 1.16, maxWidth: width - 20 });
            let cursor = top + 12 + titleLines.length * lineHeight(10, 1.16);
            prepared.forEach((row) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(6.8);
                doc.setTextColor(...(options.accent || colours.accent));
                doc.text(row.label.toUpperCase(), PAGE.left + 10, cursor);
                cursor += 4.5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(...colours.text);
                doc.text(row.lines, PAGE.left + 10, cursor, { lineHeightFactor: 1.24, maxWidth: width - 28 });
                cursor += row.lines.length * lineHeight(8, 1.24) + 5;
            });
            if (linkUrl) {
                let measuredWidth = NaN;
                try {
                    const candidate = typeof doc.getTextWidth === "function" ? doc.getTextWidth(linkLabel) : undefined;
                    if (typeof candidate === "number" && Number.isFinite(candidate)) measuredWidth = candidate;
                } catch (_error) {}
                const labelWidth = Number.isFinite(measuredWidth) ? measuredWidth : linkLabel.length * 2;
                const chipWidth = Math.min(width - 20, Math.max(48, 14 + labelWidth));
                doc.setFillColor(...colours.surfaceAlt);
                doc.setDrawColor(...colours.blue);
                doc.roundedRect(PAGE.left + 10, cursor, chipWidth, 10, 2, 2, "FD");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.2);
                doc.setTextColor(...colours.blue);
                if (typeof doc.textWithLink === "function") {
                    doc.textWithLink(linkLabel, PAGE.left + 15, cursor + 6.5, { url: linkUrl });
                } else {
                    doc.text(linkLabel, PAGE.left + 15, cursor + 6.5);
                    if (typeof doc.link === "function") doc.link(PAGE.left + 10, cursor, chipWidth, 10, { url: linkUrl });
                }
            }
            y = top + height + 5;
        }
        function checkItem(value, colour = colours.red) {
            const lines = split(base.compact(value, 210), 154);
            const height = Math.max(14, lines.length * lineHeight(8.2, 1.25) + 8);
            ensure(height + 3);
            doc.setFillColor(...colours.surface);
            doc.setDrawColor(...colours.line);
            doc.roundedRect(PAGE.left, y, 178, height, 2, 2, "FD");
            doc.setDrawColor(...colour);
            doc.setLineWidth(0.8);
            doc.rect(PAGE.left + 7, y + 5, 5, 5, "S");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.2);
            doc.setTextColor(...colours.text);
            doc.text(lines, PAGE.left + 18, y + 7, { lineHeightFactor: 1.25, maxWidth: 154 });
            y += height + 3;
        }
        function timelineCard(windowLabel, heading, references, colour) {
            const lines = split(base.compact(references, 180), 152);
            const height = Math.max(34, 22 + lines.length * lineHeight(8.2, 1.22));
            ensure(height + 4);
            const top = y;
            doc.setFillColor(...colours.surface);
            doc.setDrawColor(...colours.line);
            doc.roundedRect(PAGE.left, top, 178, height, 3, 3, "FD");
            doc.setFillColor(...colour);
            doc.circle(PAGE.left + 13, top + 13, 6, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(...colours.page);
            doc.text(windowLabel, PAGE.left + 13, top + 15, { align: "center" });
            doc.setFontSize(10);
            doc.setTextColor(...colours.heading);
            doc.text(heading, PAGE.left + 25, top + 11);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.2);
            doc.setTextColor(...colours.text);
            doc.text(lines, PAGE.left + 25, top + 20, { lineHeightFactor: 1.22, maxWidth: 152 });
            y += height + 4;
        }
        function compactTable(headers, rows, widths) {
            const size = 7;
            const drawRow = (cells, header = false) => {
                const lines = cells.map((cell, index) => split(base.compact(cell, 120), widths[index] - 4));
                const height = Math.max(9, ...lines.map((entry) => entry.length * lineHeight(size, 1.18) + 4));
                ensure(height + 1);
                let x = PAGE.left;
                cells.forEach((_cell, index) => {
                    doc.setFillColor(...(header ? colours.surfaceAlt : colours.surface));
                    doc.setDrawColor(...colours.line);
                    doc.rect(x, y, widths[index], height, "FD");
                    doc.setFont("helvetica", header ? "bold" : "normal");
                    doc.setFontSize(size);
                    doc.setTextColor(...(header ? colours.heading : colours.text));
                    doc.text(lines[index], x + 2, y + 5, { lineHeightFactor: 1.18, maxWidth: widths[index] - 4 });
                    x += widths[index];
                });
                y += height;
            };
            drawRow(headers, true);
            rows.forEach((row) => drawRow(row));
            y += 4;
        }

        paint();
        return {
            document: doc,
            colours,
            sectionPages,
            newPage,
            ensure,
            label,
            title,
            sectionPage,
            statCard,
            infoCard,
            checkItem,
            timelineCard,
            compactTable,
            getY: () => y,
            setY: (value) => { y = value; }
        };
    }

    window.GrowWithHRVisualReportCore = Object.freeze({
        ...base,
        VERSION,
        sharedTemplateId: TEMPLATE_ID,
        brandLogoAsset: HRTECHIFY_LOGO_ASSET,
        loadLogo,
        createWriter
    });

    window.GrowWithHRReportBrandTemplate = Object.freeze({
        version: VERSION,
        templateId: TEMPLATE_ID,
        logoAsset: HRTECHIFY_LOGO_ASSET,
        sameLayoutForLightAndDark: true
    });
})();
