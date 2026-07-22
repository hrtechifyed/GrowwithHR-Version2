import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const styles = read("styles.css");
const polish = read("css/19-presentation-polish.css");
const logoRestore = read("css/21-logo-restore.css");
const pdfPolish = read("js/pdf-polish.js");
const buildMarker = read("js/build-marker.js");

assert(styles.includes('@import url("css/19-presentation-polish.css");'));
assert(styles.includes('@import url("css/21-logo-restore.css");'));
assert(polish.includes(".site-nav-glass"));
assert(logoRestore.includes("hrtechify-logo.png"));
assert(logoRestore.includes("mix-blend-mode: screen"));
assert(polish.includes("grid-template-columns: repeat(6"));
assert(polish.includes("@media print"));
assert(polish.includes("break-inside: avoid-page"));

assert(buildMarker.includes('import("./pdf-polish.js")'));
assert(pdfPolish.includes('const VERSION = "3.1.3-priority-source-separation"'));
assert(pdfPolish.includes("function ensureSpace"));
assert(pdfPolish.includes("function recommendationCard"));
assert(pdfPolish.includes("function summaryTable"));
assert(pdfPolish.includes("const rowHeights=preparedRows.map"));
assert(pdfPolish.includes("function roadmap"));
assert(pdfPolish.includes("function enrichPrioritySources"));
assert(pdfPolish.includes('sourceLabel: selectedSet.has(item.title) ? "Selected by you" : "Company DNA suggestion"'));
assert(pdfPolish.includes('writer.subheading("Priorities selected by you")'));
assert(pdfPolish.includes('writer.subheading("Additional suggestions based on your Company DNA")'));
assert(pdfPolish.includes('writer.subheading("Additional Company DNA suggestions")'));
assert(pdfPolish.includes("These are additional suggestions and were not selected by you."));
assert(pdfPolish.includes("They do not override your selection."));
assert(pdfPolish.includes("Why GrowWithHR suggests this:"));
assert(pdfPolish.includes('doc.text("GrowWithHR"'));
assert(pdfPolish.includes('"HRTechify - People • Technology • Growth"'));
assert(pdfPolish.includes('"© 2026 All Rights Reserved"'));
assert(pdfPolish.includes('`Page ${page} of ${total}`'));
assert(pdfPolish.includes('`Click here to download template for ${templateSubject(item,title)}`'));
assert(pdfPolish.includes('writer.sectionHeading("COMPLIANCE REVIEW","What You Should Do"'));
assert(pdfPolish.includes('writer.roadmap(model.roadmap)'));
assert(pdfPolish.indexOf('writer.roadmap(model.roadmap)') < pdfPolish.indexOf('writer.sectionHeading("LOOKING AHEAD"'));
assert(pdfPolish.includes('doc.text(options.coverLabel'));
assert(pdfPolish.includes('align:"center"'));
assert(pdfPolish.includes("GrowWithHRPDFPolishReady"));

new vm.Script(pdfPolish, { filename: "js/pdf-polish.js" });
new vm.Script(buildMarker, { filename: "js/build-marker.js" });

console.log("Presentation polish checks passed.");
