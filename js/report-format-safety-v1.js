/* GrowWithHR PDF format safety patch.
 * Keeps status/review cards inside their measured bounds and uses restrained
 * brand/status colour combinations without changing report meaning.
 */
(() => {
    "use strict";
    const core = window.GrowWithHRVisualReportCore;
    if (!core?.createWriter || core.reportFormatSafetyVersion) return;
    const VERSION = "1.0.0";
    const originalCreateWriter = core.createWriter.bind(core);

    function clean(value) { return String(value ?? "").replace(/\s+/g, " ").trim(); }

    function createWriter(doc, colours, sectionPages = {}) {
        const writer = originalCreateWriter(doc, colours, sectionPages);
        writer.statCard = function safeStatCard(x, top, width, value, caption, colour) {
            const safeWidth = Math.max(30, Number(width) || 30);
            const innerWidth = Math.max(18, safeWidth - 18);
            const valueText = clean(value);
            const captionText = clean(caption);
            const valueSize = valueText.length > 18 ? 9.5 : valueText.length > 9 ? 11 : valueText.length > 4 ? 13 : 18;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(valueSize);
            const valueLines = doc.splitTextToSize(valueText, innerWidth).slice(0, 2);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.1);
            const captionLines = doc.splitTextToSize(captionText, innerWidth).slice(0, 3);
            const valueBlock = Math.max(7, valueLines.length * valueSize * 0.3528 * 1.05);
            const captionBlock = Math.max(4, captionLines.length * 7.1 * 0.3528 * 1.12);
            const height = Math.max(42, 12 + valueBlock + captionBlock + 8);

            doc.setFillColor(...colours.surface);
            doc.setDrawColor(...colours.line);
            doc.roundedRect(x, top, safeWidth, height, 3, 3, "FD");
            doc.setFillColor(...colour);
            doc.roundedRect(x, top, 4, height, 2, 2, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(valueSize);
            doc.setTextColor(...colours.heading);
            doc.text(valueLines, x + 10, top + 13, { lineHeightFactor: 1.05, maxWidth: innerWidth });

            const captionY = top + 13 + valueBlock + 3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.1);
            doc.setTextColor(...colours.muted);
            doc.text(captionLines, x + 10, captionY, { lineHeightFactor: 1.12, maxWidth: innerWidth });
            return height;
        };
        return writer;
    }

    window.GrowWithHRVisualReportCore = Object.freeze({
        ...core,
        createWriter,
        reportFormatSafetyVersion: VERSION,
        statusCardsMeasured: true,
        statusCardsWrapWithinBounds: true
    });
    window.GrowWithHRReportFormatSafety = Object.freeze({ version: VERSION, measuredStatusCards: true });
})();