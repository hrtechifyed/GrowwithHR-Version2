import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const transparency = read("js/pdf-law-transparency.js");
const serverEntry = read("server-entry.js");
const delivery = read("server-m4-delivery.js");

new vm.Script(transparency, { filename: "js/pdf-law-transparency.js" });
new vm.Script(serverEntry, { filename: "server-entry.js" });
new vm.Script(delivery, { filename: "server-m4-delivery.js" });

const sandbox = {
    console,
    window: {
        GrowWithHRPDF: {
            buildAdvisoryPdf: async () => ({ document: null, theme: "light" }),
            buildAdvisoryModel: (payload) => payload.model || {}
        }
    }
};
vm.createContext(sandbox);
vm.runInContext(transparency, sandbox);

const api = sandbox.window.GrowWithHRLawTransparency;
assert(api, "M4 report transparency API must install without a browser DOM");
assert.equal(api.integrationVersion, "0.19.0-m4-report-integration");

const completeAnswers = {
    companyName: "ABC Technologies Pvt Ltd",
    employees: 62,
    workers: 62,
    contractors: 25,
    indiaOperations: true,
    establishmentType: "Private Limited",
    primaryState: "Karnataka",
    operatingStates: ["Karnataka", "Maharashtra"],
    womenEmployees: true,
    wageBand: "Confirmed",
    industry: "Technology",
    workerCategories: ["Employees", "Workers"],
    usesPower: false,
    manufacturingOperations: false
};

const allLaws = sandbox.window.GrowWithHRPDF.buildReportLawTransparency(
    { answers: completeAnswers },
    { recommendations: [] }
);
assert.equal(allLaws.length, api.lawCatalog.length, "the production report must show every governed law");
assert(allLaws.every((law) => law.status && law.priority && law.requiredAction));
assert(allLaws.some((law) => law.thresholdResult.state === "crossed"));

const scoped = sandbox.window.GrowWithHRPDF.buildLawTransparency(
    { answers: completeAnswers },
    { recommendations: [{ title: "Review ESIC coverage" }] }
);
assert.deepEqual(Array.from(scoped, (law) => law.id), ["esi"], "ESIC must not cross-match POSH IC");

[
    "Executive compliance summary",
    "Law-by-law explainability",
    "UPCOMING COMPLIANCE TRIGGERS",
    "Missing information",
    "Evidence used",
    "Recommendations roadmap",
    "Governed law index",
    "REQUIRED INPUTS CONFIRMED",
    "This is input coverage, not legal certainty",
    "buildReportLawTransparency",
    "withoutNestedRoadmapLabel",
    "Math.abs(Number(width)-40)",
    "Math.abs(Number(height)-11)"
].forEach((expected) => assert(transparency.includes(expected), `missing report integration marker: ${expected}`));

[
    "Enter one state or union territory in each box.",
    "change the selection to 1 state",
    "A state or union territory cannot be repeated.",
    "Step ${step} of ${total}",
    "Your advisory sections",
    "Select all",
    "Office Based",
    "Remote",
    "remoteBand",
    "advisory-report-theme-choice",
    ".advisory-state-separator{display:none"
].forEach((expected) => assert(transparency.includes(expected), `missing assessment UX marker: ${expected}`));
assert(!transparency.includes("The report combines selected states with semicolons."));

assert(transparency.includes('DELIVERY_PATH="/api/send-advisory-v2"'));
assert(transparency.includes("reportThemes:variants.map") && transparency.includes("pdfs:variants"), "both variants must be submitted in one delivery payload");
assert(!transparency.includes("for (const variant of variants)"), "the final delivery wrapper must not send one email per theme");

assert(serverEntry.includes('require("./server-m4-delivery")'));
assert(serverEntry.includes("handleM4DeliveryRequest(request, response)"));
assert(delivery.includes('const ROUTE = "/api/send-advisory-v2"'));
assert(delivery.includes("GMAIL_SAFE_RAW_ATTACHMENT_BYTES"));
assert(delivery.includes("createZip(pdfs)"));
assert(delivery.includes('contentType: "application/zip"'));
assert(delivery.includes('"Report versions delivered"'));
assert(delivery.includes("bundledAsZip"));
assert(delivery.includes("bcc: recipients.slice(1)"));

const founderHtmlPosition = delivery.indexOf("${escapeHtml(FOUNDER_NAME)}</span>");
assert(founderHtmlPosition >= 0, "the founder name must be plain text in the customer HTML signature");
const founderContext = delivery.slice(Math.max(0, founderHtmlPosition - 80), founderHtmlPosition + 80);
assert(!/<strong/i.test(founderContext), "Anurag Sinha must not be bold in the email body");

assert(!transparency.includes("confidencePercent"));
assert(!transparency.includes("overallScore"));

console.log("M4 report integration and UX checks passed.");
