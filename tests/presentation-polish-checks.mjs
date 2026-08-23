import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const styles = read("styles.css");
const polish = read("css/19-presentation-polish.css");
const samplePolish = read("css/29-sample-report-refinement.css");
const shell = read("css/18-site-shell.css");
const logoRestore = read("css/21-logo-restore.css");
const pdfPolish = read("js/pdf-polish.js");
const samplePdf = read("js/sample-advisory-pdf.js");
const buildMarker = read("js/build-marker.js");

assert(styles.includes('@import url("css/19-presentation-polish.css");'));
assert(styles.includes('@import url("css/21-logo-restore.css");'));
assert(styles.includes('@import url("css/29-sample-report-refinement.css");'));
assert(shell.includes(".site-nav-glass"));
assert(!polish.includes(".site-nav-glass"), "Page presentation CSS must not redefine the shared navbar.");
assert(logoRestore.includes("hrtechify-logo.png"));
assert(logoRestore.includes("mix-blend-mode: screen"));
assert(polish.includes("grid-template-columns: repeat(6"));
assert(polish.includes("@media print"));
assert(polish.includes("break-inside: avoid-page"));

assert(
    samplePolish.includes(".sample-advisory-page .executive-status-grid") &&
    samplePolish.includes("grid-template-columns: repeat(2, minmax(0, 1fr))"),
    "The sample executive status cards must use a dedicated two-column desktop grid."
);
assert(
    samplePolish.includes(".sample-advisory-page .section") &&
    samplePolish.includes("padding: clamp(44px, 5vw, 64px) 0"),
    "The sample report must use the compact section rhythm rather than the legacy 120px spacing."
);
assert(
    samplePolish.includes(".sample-advisory-page .section-heading") &&
    samplePolish.includes("text-align: left"),
    "Sample section headings and their explanatory copy must share a consistent left edge."
);
assert(
    samplePolish.includes(".sample-advisory-page .timeline-grid > div") &&
    samplePolish.includes("background: #161d34"),
    "The sample roadmap items must be aligned as explicit timeline cards."
);
assert(samplePolish.includes("@media (max-width: 640px)"));
assert(samplePolish.includes("@media print"));

assert(samplePdf.includes('const SAMPLE_REPORT_SUFFIX = "SM01"'));
assert(samplePdf.includes("function buildSampleReportId"));
assert(samplePdf.includes("`GWHR-${year}-${month}${day}-${SAMPLE_REPORT_SUFFIX}`"));
assert(samplePdf.includes("reportId: SAMPLE_REPORT_ID"));
assert(samplePdf.includes('identity.id = "sampleReportIdentity"'));
assert(samplePdf.includes("Sample Report ID: ${SAMPLE_REPORT_ID}"));
assert(
    !samplePdf.includes("/api/report-id"),
    "Viewing or downloading an illustrative sample must not consume a production Report ID."
);

assert(
    buildMarker.includes('"./pdf-polish.js"') &&
    buildMarker.includes("await import(path)"),
    "The build loader must load the PDF polish module through its module helper."
);
assert(pdfPolish.includes('const VERSION = "3.2.0-executive-pagination"'));
assert(pdfPolish.includes("function ensureSpace"));
assert(pdfPolish.includes("function recommendationCard"));
assert(pdfPolish.includes("function summaryTable"));
assert(pdfPolish.includes("const rowHeights = preparedRows.map"));
assert(pdfPolish.includes("function roadmap"));
assert(pdfPolish.includes("function enrichPrioritySources"));
assert(pdfPolish.includes("function startTopic"));
assert(pdfPolish.includes("function tableOfContents"));
assert(pdfPolish.includes("function endPage"));
assert(pdfPolish.includes("panelAlt: [232, 239, 248]"));
assert(pdfPolish.includes('sourceLabel: selectedSet.has(item.title) ? "Selected by you" : "Company DNA suggestion"'));
assert(pdfPolish.includes('writer.subheading("Priorities selected by you")'));
assert(pdfPolish.includes('writer.subheading("Additional Strategic Priorities Informed by Your Company DNA")'));
assert(pdfPolish.includes("complementary capabilities that merit leadership consideration"));
assert(pdfPolish.includes("Organisation and market context"));
assert(pdfPolish.includes("Each major topic begins on a new page"));
assert(pdfPolish.includes('doc.text("End of Report"'));
assert(pdfPolish.includes("Why GrowWithHR suggests this:"));
assert(pdfPolish.includes('doc.text("GrowWithHR"'));
assert(pdfPolish.includes('"HRTechify - People • Technology • Growth"'));
assert(pdfPolish.includes('"© 2026 All Rights Reserved"'));
assert(pdfPolish.includes('`Page ${page - startPage + 1} of ${total}`'));
assert(pdfPolish.includes('`Click here to download template for ${templateSubject(item, title)}`'));
assert(pdfPolish.includes('"COMPLIANCE REVIEW"'));
assert(pdfPolish.includes("writer.roadmap(model.roadmap)"));
assert(pdfPolish.indexOf("writer.roadmap(model.roadmap)") < pdfPolish.indexOf('"LOOKING AHEAD"'));
assert(pdfPolish.includes("doc.text(options.coverLabel"));
assert(pdfPolish.includes('align: "center"'));
assert(pdfPolish.includes("GrowWithHRPDFPolishReady"));

new vm.Script(pdfPolish, { filename: "js/pdf-polish.js" });
new vm.Script(samplePdf, { filename: "js/sample-advisory-pdf.js" });
new vm.Script(buildMarker, { filename: "js/build-marker.js" });

console.log("Presentation polish checks passed.");
