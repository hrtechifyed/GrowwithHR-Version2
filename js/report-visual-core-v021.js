/* GrowWithHR v0.21 visual report core */
(() => {
    "use strict";

    const VERSION = "0.21.0-visual-sectioned-report";
    const PAGE = Object.freeze({ width: 210, height: 297, left: 16, right: 194, top: 20, bottom: 266 });
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const values = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
    const unique = (items) => [...new Set(items.map((item) => clean(item)).filter(Boolean))];
    const mergeSource = (payload = {}, model = {}) => Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});

    function compact(value, maximum = 170) {
        const text = clean(value);
        if (text.length <= maximum) return text;
        const clipped = text.slice(0, maximum - 1).replace(/\s+\S*$/, "");
        return `${clipped || text.slice(0, maximum - 1)}…`;
    }

    function palette(theme) {
        return theme === "dark"
            ? { page: [4,6,10], surface: [18,22,30], surfaceAlt: [29,34,44], text: [244,246,250], muted: [171,181,196], heading: [255,255,255], line: [67,75,89], accent: [245,158,11], green: [74,222,128], amber: [251,191,36], red: [248,113,113], blue: [96,165,250] }
            : { page: [250,251,253], surface: [255,255,255], surfaceAlt: [239,244,250], text: [24,38,58], muted: [84,101,125], heading: [8,30,62], line: [200,210,222], accent: [217,119,6], green: [22,124,70], amber: [180,83,9], red: [185,28,28], blue: [37,99,235] };
    }

    function statusColour(status, colours) {
        if (status === "Applicable") return colours.green;
        if (status === "Review required") return colours.amber;
        if (status === "Needs information") return colours.red;
        return colours.blue;
    }

    function selectedThemes(payload = {}) {
        const api = window.GrowWithHRReportIntelligenceFixes;
        if (typeof api?.selectedThemes === "function") return api.selectedThemes(payload);
        const requested = clean(payload.theme || payload.reportTheme || payload.reportOptions?.theme || "light").toLowerCase();
        return requested === "both" ? ["light", "dark"] : [requested.includes("dark") ? "dark" : "light"];
    }

    let logoPromise = null;
    function loadLogo() {
        if (logoPromise) return logoPromise;
        logoPromise = new Promise((resolve) => {
            if (typeof window.Image !== "function" || !document?.createElement) return resolve("");
            const image = new window.Image();
            image.crossOrigin = "anonymous";
            image.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 512;
                    canvas.height = 512;
                    const context = canvas.getContext("2d");
                    if (!context) return resolve("");
                    context.clearRect(0, 0, 512, 512);
                    context.drawImage(image, 0, 0, 512, 512);
                    resolve(canvas.toDataURL("image/png"));
                } catch (_error) { resolve(""); }
            };
            image.onerror = () => resolve("");
            image.src = new URL("assets/hrtechify-logo.png", window.location.href).href;
        });
        return logoPromise;
    }

    function createWriter(doc, colours) {
        let y = PAGE.top;
        const split = (value, width = 178) => doc.splitTextToSize(clean(value), width);
        const lineHeight = (size, factor = 1.22) => size * 0.3528 * factor;

        function paint() {
            doc.setFillColor(...colours.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
        }
        function newPage() { doc.addPage(); paint(); y = PAGE.top; }
        function ensure(height) { if (y + height > PAGE.bottom) newPage(); }
        function label(value, colour = colours.accent) {
            doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...colour);
            doc.text(clean(value).toUpperCase(), PAGE.left, y); y += 7;
        }
        function title(value, intro = "") {
            const headingLines = split(value, 178);
            label(value);
            doc.setFont("helvetica", "bold"); doc.setFontSize(21); doc.setTextColor(...colours.heading);
            doc.text(headingLines, PAGE.left, y, { lineHeightFactor: 1.08, maxWidth: 178 });
            y += headingLines.length * lineHeight(21, 1.08) + 4;
            if (intro) {
                const introLines = split(intro, 166);
                doc.setFont("helvetica", "normal"); doc.setFontSize(8.8); doc.setTextColor(...colours.muted);
                doc.text(introLines, PAGE.left, y, { lineHeightFactor: 1.28, maxWidth: 166 });
                y += introLines.length * lineHeight(8.8, 1.28) + 8;
            }
        }
        function sectionPage(value, intro = "") { if (y > PAGE.top + 2) newPage(); title(value, intro); }
        function statCard(x, top, width, value, caption, colour) {
            doc.setFillColor(...colours.surface); doc.setDrawColor(...colours.line);
            doc.roundedRect(x, top, width, 34, 3, 3, "FD");
            doc.setFillColor(...colour); doc.roundedRect(x, top, 4, 34, 2, 2, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...colours.heading);
            doc.text(String(value), x + 10, top + 15);
            doc.setFontSize(7.5); doc.setTextColor(...colours.muted);
            doc.text(split(caption, width - 18), x + 10, top + 24, { lineHeightFactor: 1.15, maxWidth: width - 18 });
        }
        function infoCard(cardTitle, rows, options = {}) {
            const width = Number(options.width || 178);
            const titleLines = split(cardTitle, width - 20);
            const prepared = rows.filter((row) => clean(row?.[1])).map(([rowLabel, value]) => ({ label: clean(rowLabel), lines: split(compact(value, options.maxChars || 190), width - 28) }));
            const height = 16 + titleLines.length * lineHeight(10, 1.16) + prepared.reduce((sum, row) => sum + 6 + row.lines.length * lineHeight(8, 1.24), 0) + 8;
            ensure(height + 5);
            const top = y;
            doc.setFillColor(...(options.fill || colours.surface)); doc.setDrawColor(...colours.line);
            doc.roundedRect(PAGE.left, top, width, height, 3, 3, "FD");
            if (options.accent) { doc.setFillColor(...options.accent); doc.roundedRect(PAGE.left, top, 4, height, 2, 2, "F"); }
            doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...colours.heading);
            doc.text(titleLines, PAGE.left + 10, top + 10, { lineHeightFactor: 1.16, maxWidth: width - 20 });
            let cursor = top + 12 + titleLines.length * lineHeight(10, 1.16);
            prepared.forEach((row) => {
                doc.setFont("helvetica", "bold"); doc.setFontSize(6.8); doc.setTextColor(...(options.accent || colours.accent));
                doc.text(row.label.toUpperCase(), PAGE.left + 10, cursor); cursor += 4.5;
                doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...colours.text);
                doc.text(row.lines, PAGE.left + 10, cursor, { lineHeightFactor: 1.24, maxWidth: width - 28 });
                cursor += row.lines.length * lineHeight(8, 1.24) + 5;
            });
            y = top + height + 5;
        }
        function checkItem(value, colour = colours.red) {
            const lines = split(compact(value, 210), 154);
            const height = Math.max(14, lines.length * lineHeight(8.2, 1.25) + 8);
            ensure(height + 3);
            doc.setFillColor(...colours.surface); doc.setDrawColor(...colours.line);
            doc.roundedRect(PAGE.left, y, 178, height, 2, 2, "FD");
            doc.setDrawColor(...colour); doc.setLineWidth(0.8); doc.rect(PAGE.left + 7, y + 5, 5, 5, "S");
            doc.setFont("helvetica", "normal"); doc.setFontSize(8.2); doc.setTextColor(...colours.text);
            doc.text(lines, PAGE.left + 18, y + 7, { lineHeightFactor: 1.25, maxWidth: 154 });
            y += height + 3;
        }
        function timelineCard(windowLabel, heading, references, colour) {
            const lines = split(compact(references, 180), 152);
            const height = Math.max(34, 22 + lines.length * lineHeight(8.2, 1.22));
            ensure(height + 4);
            const top = y;
            doc.setFillColor(...colours.surface); doc.setDrawColor(...colours.line);
            doc.roundedRect(PAGE.left, top, 178, height, 3, 3, "FD");
            doc.setFillColor(...colour); doc.circle(PAGE.left + 13, top + 13, 6, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(7.2); doc.setTextColor(...colours.page);
            doc.text(windowLabel, PAGE.left + 13, top + 15, { align: "center" });
            doc.setFontSize(10); doc.setTextColor(...colours.heading); doc.text(heading, PAGE.left + 25, top + 11);
            doc.setFont("helvetica", "normal"); doc.setFontSize(8.2); doc.setTextColor(...colours.text);
            doc.text(lines, PAGE.left + 25, top + 20, { lineHeightFactor: 1.22, maxWidth: 152 });
            y += height + 4;
        }
        function linkChip(labelText, url, colour = colours.blue) {
            if (!clean(url)) return;
            ensure(14);
            doc.setFillColor(...colours.surfaceAlt); doc.setDrawColor(...colour);
            doc.roundedRect(PAGE.left, y, 58, 10, 2, 2, "FD");
            doc.setFont("helvetica", "bold"); doc.setFontSize(7.2); doc.setTextColor(...colour);
            if (typeof doc.textWithLink === "function") doc.textWithLink(clean(labelText, "Official source"), PAGE.left + 5, y + 6.5, { url });
            else { doc.text(clean(labelText, "Official source"), PAGE.left + 5, y + 6.5); if (typeof doc.link === "function") doc.link(PAGE.left, y, 58, 10, { url }); }
            y += 14;
        }
        function compactTable(headers, rows, widths) {
            const size = 7;
            const drawRow = (cells, header = false) => {
                const lines = cells.map((cell, index) => split(compact(cell, 120), widths[index] - 4));
                const height = Math.max(9, ...lines.map((entry) => entry.length * lineHeight(size, 1.18) + 4));
                ensure(height + 1);
                let x = PAGE.left;
                cells.forEach((_cell, index) => {
                    doc.setFillColor(...(header ? colours.surfaceAlt : colours.surface)); doc.setDrawColor(...colours.line);
                    doc.rect(x, y, widths[index], height, "FD");
                    doc.setFont("helvetica", header ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...(header ? colours.heading : colours.text));
                    doc.text(lines[index], x + 2, y + 5, { lineHeightFactor: 1.18, maxWidth: widths[index] - 4 });
                    x += widths[index];
                });
                y += height;
            };
            drawRow(headers, true); rows.forEach((row) => drawRow(row)); y += 4;
        }
        paint();
        return { document: doc, colours, newPage, ensure, label, title, sectionPage, statCard, infoCard, checkItem, timelineCard, linkChip, compactTable, getY: () => y, setY: (value) => { y = value; } };
    }

    const actionRows = (rows) => rows.filter((row) => ["Applicable", "Review required", "Needs information"].includes(row.status));
    const actionId = (row, index) => clean(row.actionId, `A${index + 1}`);

    function addFooter(doc, colours, companyName) {
        const total = doc.getNumberOfPages();
        for (let page = 1; page <= total; page += 1) {
            doc.setPage(page);
            doc.setFillColor(...colours.page); doc.rect(0, 270, 210, 27, "F");
            doc.setDrawColor(...colours.line); doc.line(16, 276, 194, 276);
            doc.setFont("helvetica", "bold"); doc.setFontSize(7.2); doc.setTextColor(...colours.accent);
            doc.text("HRTechify · GrowWithHR", 16, 284);
            doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...colours.muted);
            doc.text(`Confidential · ${clean(companyName, "Your Organisation")}`, 16, 290, { maxWidth: 145 });
            doc.text(`${page} / ${total}`, 194, 284, { align: "right" });
        }
    }

    function serialise(doc, theme, data) {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "Organisation";
        return { document: doc, theme, filename: `GrowWithHR-Action-Brief-${company}-${theme === "dark" ? "Dark" : "Light"}.pdf`, dataUri, base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri, sizeBytes: buffer.byteLength, pageCount: doc.getNumberOfPages(), reportLayoutVersion: VERSION, reportStructureVersion: "visual-sectioned-v3" };
    }

    window.GrowWithHRVisualReportCore = Object.freeze({ VERSION, PAGE, clean, values, unique, mergeSource, compact, palette, statusColour, selectedThemes, loadLogo, createWriter, actionRows, actionId, addFooter, serialise });
})();
