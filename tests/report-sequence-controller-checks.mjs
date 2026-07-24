import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/report-sequence-controller.js", "utf8");
const founderSource = fs.readFileSync("js/report-founder-summary-corrections.js", "utf8");
new vm.Script(source, { filename: "js/report-sequence-controller.js" });
new vm.Script(founderSource, { filename: "js/report-founder-summary-corrections.js" });

const sandbox = {
    console,
    window: {
        GrowWithHRPDF: null,
        executiveAssessment: null,
        addEventListener() {},
        setInterval() { return 1; },
        clearInterval() {},
        location: { href: "https://example.com/analyze-company.html" }
    },
    document: {
        addEventListener() {},
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        createElement() { return null; }
    },
    MutationObserver: class { observe() {} },
    queueMicrotask
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const api = sandbox.window.GrowWithHRReportSequenceController;
assert(api);
assert.equal(api.version, "0.23.0-founder-first-report");
assert.deepEqual(Array.from(api.reportOrder), [
    "snapshot",
    "summary",
    "understanding",
    "evidence",
    "positive",
    "compliance",
    "strategic",
    "priority",
    "upcoming",
    "roadmap",
    "looking",
    "law",
    "index",
    "important",
    "end"
]);
assert.deepEqual(Array.from(api.tocItems, (item) => Array.from(item)), [
    ["Executive Snapshot", "snapshot"],
    ["Executive Summary", "summary"],
    ["Understanding Intelligence Engine", "understanding"],
    ["Evidence and Missing Information", "evidence"],
    ["Positive Foundations", "positive"],
    ["Compliance Review", "compliance"],
    ["Strategic Recommendations", "strategic"],
    ["Priority Compliance Actions", "priority"],
    ["Upcoming Compliance Triggers", "upcoming"],
    ["Roadmap - 0 to 90 days", "roadmap"],
    ["Looking Ahead", "looking"],
    ["ANNEXURE", "group"],
    ["Law-by-Law Understanding", "law"],
    ["Governed Law Index", "index"],
    ["Important Information", "important"]
]);

assert.equal(api.resolveRemoteBand("Remote"), "100");
assert.equal(api.resolveRemoteBand("Fully remote"), "100");
assert.equal(api.resolveRemoteBand("Office Based"), "0");
assert.equal(api.resolveRemoteBand("Full Onsite"), "0");
assert.equal(api.resolveRemoteBand("Hybrid"), "");

assert.equal(api.cleanRecommendation("Selected by you - Manager capability"), "Manager capability");
assert.equal(api.cleanRecommendation("Company DNA suggestion: Policies and compliance"), "Policies and compliance");
assert.match(api.fieldQuestions.esiWageEligibility, /ESI wage-eligibility/i);
assert.match(api.fieldQuestions.workerCategories, /types of people/i);

const rows = [
    { id: "a", status: "Applicable", priority: "HIGH", shortTitle: "Act A" },
    { id: "b", status: "Needs information", priority: "REVIEW", shortTitle: "Act B" },
    { id: "c", status: "Review required", priority: "MEDIUM", shortTitle: "Act C" },
    { id: "d", status: "Not currently triggered", priority: "LOW", shortTitle: "Act D" }
];
const actionIds = api.assignActionIds(rows);
assert.equal(actionIds.get("a"), "A1");
assert.equal(actionIds.get("b"), "A2");
assert.equal(actionIds.get("c"), "A3");
assert.equal(actionIds.has("d"), false);

const a = { id: "a" };
const b = { id: "b" };
const c = { id: "c" };
const doc = {
    internal: { pages: [null, a, b, c] },
    movePage(from, to) {
        const [page] = this.internal.pages.splice(from, 1);
        this.internal.pages.splice(to, 0, page);
    }
};
assert(api.reorderPageReferences(doc, [null, c, a, b]));
assert.deepEqual(doc.internal.pages.slice(1).map((page) => page.id), ["c", "a", "b"]);

[
    "STATUS_EXPLANATIONS",
    "PRESENT · UNDERSTAND",
    "FUTURE · WATCH THE TRIGGERS",
    "ACT · SEQUENCE THE WORK",
    "R1 · Assign an owner",
    "R2 · Retain evidence",
    "R3 · Review on a cadence",
    "R4 · Escalate exceptions",
    "R5 · Reassess after change",
    "Required inputs confirmed",
    "Still needed:",
    "lawIndexTable",
    "LAW & STATUS",
    "GENERAL TRIGGER",
    "YOUR CURRENT STATE",
    "NEXT STEP",
    "Detailed reference: Law-by-Law Understanding",
    "Where to answer: Story 3 — Your people",
    "doc.addImage",
    "HRTECHIFY · GROWWITHHR",
    "input.disabled = locked",
    "selected.checked = true",
    "setAnswer(application, \"remoteBand\", target)",
    "target === \"100\" ? \"Fully remote\" : \"None\"",
    "Array.isArray(result?.pdfs)",
    "deleteSectionBlocks(doc",
    "reorderSections(doc)",
    "palette(themeName)"
].forEach((marker) => assert(source.includes(marker), `missing sequence marker: ${marker}`));

[
    "PRESENT · LEADERSHIP BRIEF",
    "FOUNDER FIVE-MINUTE BRIEF",
    "Where you are today",
    "What needs attention now",
    "What changes the answer in future",
    "Founder takeaway",
    "AREAS REQUIRING LEADERSHIP ATTENTION",
    "SELECTED BY YOU",
    "COMPANY DNA SUGGESTION",
    "deleteSourceLabelledPages",
    "deleteOldExecutiveSummary",
    "moveSummaryAfterSnapshot",
    "redrawContents",
    "redrawPageNumbers"
].forEach((marker) => assert(founderSource.includes(marker), `missing founder summary marker: ${marker}`));
assert(founderSource.includes('content.includes("SELECTED BY YOU")'));
assert(founderSource.includes('content.includes("COMPANY DNA SUGGESTION")'));
assert(!source.includes("sourceLabel:"), "the report must not render selected/suggested source labels");
assert(!source.includes("Selected by you - ${"), "roadmap must not prefix actions with selected-by-you labels");

console.log("Founder-first report sequence, summary cleanup and working-model lock checks passed.");
