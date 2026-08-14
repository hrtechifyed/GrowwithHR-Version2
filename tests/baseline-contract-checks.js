"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

function filePath(relativePath) {
    return path.join(root, relativePath);
}

function read(relativePath) {
    return fs.readFileSync(filePath(relativePath), "utf8");
}

function assertFileExists(relativePath) {
    assert(
        fs.existsSync(filePath(relativePath)),
        `Required baseline file is missing: ${relativePath}`
    );
}

function assertIncludes(source, expected, message) {
    assert(
        source.includes(expected),
        message || `Expected to find: ${expected}`
    );
}

/* ==========================================================
   Required baseline files
========================================================== */

const requiredFiles = [
    "index.html",
    "analyze-company.html",
    "intelligence-hub.html",
    "organization-intelligence.html",
    "executive-advisory-report.html",
    "package.json",
    "server.js",
    "server-company-workspace.js",
    "server-company-workspace-v2.js",
    "js/config/app-config.js",
    "js/executive-assessment.js",
    "js/executive-assessment/assessment-storage.js",
    "js/company-workspace-client.js",
    "js/company-workspace-continuity.js",
    "js/pdf.js",
    "js/gmail-service.js"
];

for (const requiredFile of requiredFiles) {
    assertFileExists(requiredFile);
}

/* ==========================================================
   Canonical version
========================================================== */

const packageJson = JSON.parse(read("package.json"));
const appConfig = read("js/config/app-config.js");
const versionMatch = appConfig.match(/version:\s*"([^"]+)"/);

assert(versionMatch, "Application configuration version was not found.");
assert.strictEqual(
    versionMatch[1],
    packageJson.version,
    "package.json and app-config.js versions must match."
);
assert.match(
    packageJson.version,
    /^0\.20\.\d+(?:-[0-9A-Za-z.-]+)?$/,
    "The current public release baseline must remain on the approved v0.20 line."
);

const indexHtml = read("index.html");
assertIncludes(
    indexHtml,
    `GrowWithHR Public ${packageJson.version}`,
    "The homepage must display the canonical version."
);

/* ==========================================================
   Stable assessment route
========================================================== */

const assessmentHtml = read("analyze-company.html");
const assessmentContracts = [
    'id="assessmentShell"',
    'id="landingScreen"',
    'id="startAssessment"',
    'id="resumeAssessmentButton"',
    'id="startAgainButton"',
    'id="conversationWorkspace"',
    'id="storyForm"',
    'id="storyContainer"',
    'id="reviewScreen"',
    'id="contactScreen"',
    'id="leadCaptureForm"',
    'id="loadingScreen"',
    'id="successScreen"',
    'id="downloadReportButton"',
    'id="emailAgainButton"'
];

for (const contract of assessmentContracts) {
    assertIncludes(
        assessmentHtml,
        contract,
        `Stable assessment contract is missing: ${contract}`
    );
}
assertIncludes(assessmentHtml, '"chapters": 4', "The stable route must retain four chapters.");
assertIncludes(assessmentHtml, '"storyMoments": 7', "The stable route must retain seven story moments.");

/* ==========================================================
   Saved progress
========================================================== */

const storageJs = read("js/executive-assessment/assessment-storage.js");
assertIncludes(storageJs, '"growwithhr-advisory-briefing-v2"', "The existing assessment storage key must be preserved.");
assertIncludes(storageJs, '"growwithhr-report"', "The existing report storage key must be preserved.");
assertIncludes(storageJs, "window.localStorage.getItem", "Saved progress must remain readable.");
assertIncludes(storageJs, "window.localStorage.setItem", "Saved progress must remain writable.");

/* ==========================================================
   PDF generation
========================================================== */

const pdfJs = read("js/pdf.js");
assertIncludes(assessmentHtml, 'src="js/pdf.js"', "The stable route must load the PDF service.");
assertIncludes(pdfJs, 'const REPORT_STORAGE_KEY = "growwithhr-report"', "PDF generation must retain the report storage contract.");
assertIncludes(pdfJs, 'const DEFAULT_FILENAME = "GrowWithHR-Executive-Advisory.pdf"', "PDF generation must retain its default filename.");

/* ==========================================================
   Email delivery
========================================================== */

const gmailJs = read("js/gmail-service.js");
const serverJs = read("server.js");
assertIncludes(assessmentHtml, 'src="js/gmail-service.js"', "The stable route must load the Gmail delivery client.");
assertIncludes(gmailJs, '"/api/send-advisory"', "The Gmail client must retain its delivery endpoint.");
assertIncludes(gmailJs, 'method: "POST"', "The Gmail client must continue using POST delivery.");
assertIncludes(serverJs, 'app.get("/api/health"', "The server health endpoint must remain available.");
assert(
    /app\.post\s*\(\s*["']\/api\/send-advisory["']/.test(serverJs),
    "The advisory email endpoint must remain available."
);
assertIncludes(serverJs, "gmailApi.users.messages.send", "The server must retain Gmail API delivery.");

/* ==========================================================
   Company Workspace continuity and retention
========================================================== */

const hubHtml = read("intelligence-hub.html");
const organizationHtml = read("organization-intelligence.html");
const continuityJs = read("js/company-workspace-continuity.js");
const reportBootstrap = read("js/report-runtime-bootstrap.js");
const workspaceFacade = read("server-company-workspace.js");
const workspaceServer = require(filePath("server-company-workspace-v2.js"));

assertIncludes(hubHtml, "Compliance Intelligence", "Intelligence Hub must expose Compliance Intelligence.");
assertIncludes(hubHtml, "Organization Intelligence", "Intelligence Hub must expose Organization Intelligence.");
assertIncludes(hubHtml, "Delete my reusable company data now", "Returning users must have an early-delete control.");
assertIncludes(hubHtml, "GrowWithHRCompanyWorkspace.erase", "Early-delete control must call the Company Workspace API.");
assertIncludes(organizationHtml, "workspace.companyData||data", "Organization Intelligence must preserve merged cross-engine Company Workspace data.");
assertIncludes(continuityJs, 'completedEngine: "compliance"', "Compliance Intelligence must write to the shared Company Workspace.");
assertIncludes(continuityJs, "previousReportId", "Compliance Intelligence must preserve report lineage for returning workspaces.");
assertIncludes(continuityJs, "Workspace Recovery Code", "Compliance completion must surface the recovery credential.");
assertIncludes(reportBootstrap, "company-workspace-client.js", "Compliance runtime must load the Company Workspace client.");
assertIncludes(reportBootstrap, "company-workspace-continuity.js", "Compliance runtime must load the continuity bridge.");
assertIncludes(workspaceFacade, "server-company-workspace-v2", "Server entry compatibility facade must use the hardened workspace service.");

const retention = workspaceServer.retentionDates(new Date("2026-08-13T12:00:00.000Z"));
assert.strictEqual(retention.expiresAt, "2027-02-13T12:00:00.000Z", "Six months must mean six calendar months.");
assert.strictEqual(
    new Date(retention.expiresAt).getTime() - new Date(retention.reminderDueAt).getTime(),
    7 * 24 * 60 * 60 * 1000,
    "Deletion reminder must be exactly seven days before expiry."
);

const mergedCompanyData = workspaceServer.mergeCompanyData(
    { shared: { companyName: "Acme", employees: 50 }, compliance: { answers: { entity: "Private Limited" } } },
    { shared: { employees: 55 }, organization: { managerCount: 6 } }
);
assert.strictEqual(mergedCompanyData.shared.companyName, "Acme", "Cross-engine merge must preserve existing shared facts.");
assert.strictEqual(mergedCompanyData.shared.employees, 55, "Newest confirmed shared fact must update the workspace.");
assert.strictEqual(mergedCompanyData.compliance.answers.entity, "Private Limited", "Organization completion must not erase Compliance facts.");
assert.strictEqual(mergedCompanyData.organization.managerCount, 6, "Organization facts must be added to the workspace.");

const modernSupabaseHeaders = workspaceServer.supabaseAuthHeaders("sb_secret_example_only");
assert.strictEqual(modernSupabaseHeaders.apikey, "sb_secret_example_only");
assert.strictEqual(
    Object.prototype.hasOwnProperty.call(modernSupabaseHeaders, "Authorization"),
    false,
    "Modern Supabase secret keys must not be treated as JWT Bearer tokens."
);

const cronEntry = read("cloudflare/report-id-worker/src/entry-v2.mjs");
const rootWrangler = read("wrangler.jsonc");
assertIncludes(rootWrangler, "entry-v2.mjs", "Production Cloudflare Worker must use the retention-aware entrypoint.");
assertIncludes(rootWrangler, '"0 * * * *"', "Cloudflare must schedule an hourly retention sweep.");
assertIncludes(cronEntry, "WORKSPACE_RETENTION_SECRET", "Cloudflare retention bridge must require the private retention secret at runtime.");
assertIncludes(cronEntry, "/api/company-workspace/retention/run", "Cloudflare cron must invoke the protected Render retention endpoint.");
assert(!/companyData|encrypted_company_data|access_key_hash/.test(cronEntry), "Cloudflare cron must not send Company Workspace content.");

/* ==========================================================
   Privacy disclosure
========================================================== */

const moreInfoHtml = read("more-info.html");
assertIncludes(moreInfoHtml, "stored in your browser", "Privacy information must disclose browser progress storage.");
assertIncludes(moreInfoHtml, "Gmail API", "Privacy information must disclose Gmail API delivery.");
assertIncludes(moreInfoHtml, "six months from your latest completed intelligence analysis", "Privacy information must disclose the six-month Company Workspace policy.");
assertIncludes(moreInfoHtml, "seven days before the scheduled deletion date", "Privacy information must disclose the deletion reminder timing.");
assertIncludes(moreInfoHtml, "earlier deletion", "Privacy information must disclose user-requested early deletion.");
assert(
    !moreInfoHtml.includes("does not currently maintain a dedicated assessment database"),
    "Privacy information must not claim that GrowWithHR has no assessment database after Company Workspace launch."
);

console.log("Baseline contract checks passed.");
