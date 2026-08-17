"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const root = path.resolve(__dirname, "..");
const filePath = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => fs.readFileSync(filePath(relativePath), "utf8");
const assertFileExists = (relativePath) => assert(fs.existsSync(filePath(relativePath)), `Required baseline file is missing: ${relativePath}`);
const assertIncludes = (source, expected, message) => assert(source.includes(expected), message || `Expected to find: ${expected}`);

const requiredFiles = [
  "index.html", "analyze-company.html", "intelligence-hub.html", "organization-intelligence.html",
  "executive-advisory-report.html", "package.json", "server.js", "server-company-workspace.js",
  "server-company-workspace-v2.js", "js/config/app-config.js", "js/executive-assessment.js",
  "js/executive-assessment/assessment-storage.js", "js/company-workspace-client.js",
  "js/company-workspace-continuity.js", "js/pdf.js", "js/gmail-service.js"
];
requiredFiles.forEach(assertFileExists);

const packageJson = JSON.parse(read("package.json"));
const appConfig = read("js/config/app-config.js");
const versionMatch = appConfig.match(/version:\s*"([^"]+)"/);
assert(versionMatch, "Application configuration version was not found.");
assert.strictEqual(versionMatch[1], packageJson.version, "package.json and app-config.js versions must match.");
assert.match(packageJson.version, /^0\.20\.\d+(?:-[0-9A-Za-z.-]+)?$/, "The current public release baseline must remain on the approved v0.20 line.");

const indexHtml = read("index.html");
assertIncludes(indexHtml, 'src="js/build-marker.js"', "The homepage must retain the build marker while release identifiers stay out of buyer-facing copy.");
assert(!indexHtml.includes(`GrowWithHR Public ${packageJson.version}`), "The prototype release identifier should not be presented as buyer-facing homepage value copy.");

const assessmentHtml = read("analyze-company.html");
[
  'id="assessmentShell"','id="landingScreen"','id="startAssessment"','id="resumeAssessmentButton"',
  'id="startAgainButton"','id="conversationWorkspace"','id="storyForm"','id="storyContainer"',
  'id="reviewScreen"','id="contactScreen"','id="leadCaptureForm"','id="loadingScreen"',
  'id="successScreen"','id="downloadReportButton"','id="emailAgainButton"'
].forEach((contract) => assertIncludes(assessmentHtml, contract, `Stable assessment contract is missing: ${contract}`));
assertIncludes(assessmentHtml, '"chapters": 4', "The stable route must retain four chapters.");
assertIncludes(assessmentHtml, '"storyMoments": 7', "The stable route must retain seven story moments.");

const storageJs = read("js/executive-assessment/assessment-storage.js");
assertIncludes(storageJs, '"growwithhr-advisory-briefing-v2"');
assertIncludes(storageJs, '"growwithhr-report"');
assertIncludes(storageJs, "window.localStorage.getItem");
assertIncludes(storageJs, "window.localStorage.setItem");

const pdfJs = read("js/pdf.js");
assertIncludes(assessmentHtml, 'src="js/pdf.js"');
assertIncludes(pdfJs, 'const REPORT_STORAGE_KEY = "growwithhr-report"');
assertIncludes(pdfJs, 'const DEFAULT_FILENAME = "GrowWithHR-Executive-Advisory.pdf"');

const gmailJs = read("js/gmail-service.js");
const serverJs = read("server.js");
assertIncludes(assessmentHtml, 'src="js/gmail-service.js"');
assertIncludes(gmailJs, '"/api/send-advisory"');
assertIncludes(gmailJs, 'method: "POST"');
assertIncludes(serverJs, 'app.get("/api/health"');
assert(/app\.post\s*\(\s*["']\/api\/send-advisory["']/.test(serverJs), "The advisory email endpoint must remain available.");
assertIncludes(serverJs, "gmailApi.users.messages.send");

const hubHtml = read("intelligence-hub.html");
const organizationHtml = read("organization-intelligence.html");
const continuityJs = read("js/company-workspace-continuity.js");
const reportBootstrap = read("js/report-runtime-bootstrap.js");
const workspaceFacade = read("server-company-workspace.js");
const workspaceServer = require(filePath("server-company-workspace-v2.js"));
assertIncludes(hubHtml, "Compliance Intelligence", "Intelligence Hub must retain the Compliance Intelligence compatibility label.");
assertIncludes(hubHtml, "Organization Intelligence", "Intelligence Hub must retain the Organization Intelligence compatibility label.");
assertIncludes(hubHtml, "Delete my reusable company data now");
assertIncludes(hubHtml, "GrowWithHRCompanyWorkspace.erase");
assert(/workspace\.companyData\s*\|\|\s*workspaceData/.test(organizationHtml), "Organization Intelligence must preserve merged cross-engine Company Workspace data.");
assertIncludes(continuityJs, 'completedEngine: "compliance"');
assertIncludes(continuityJs, "previousReportId");
assertIncludes(continuityJs, "Workspace Recovery Code");
assertIncludes(reportBootstrap, "company-workspace-client.js");
assertIncludes(reportBootstrap, "company-workspace-continuity.js");
assertIncludes(workspaceFacade, "server-company-workspace-v2");

const retention = workspaceServer.retentionDates(new Date("2026-08-13T12:00:00.000Z"));
assert.strictEqual(retention.expiresAt, "2027-02-13T12:00:00.000Z");
assert.strictEqual(new Date(retention.expiresAt).getTime() - new Date(retention.reminderDueAt).getTime(), 7 * 24 * 60 * 60 * 1000);
const mergedCompanyData = workspaceServer.mergeCompanyData(
  { shared: { companyName: "Acme", employees: 50 }, compliance: { answers: { entity: "Private Limited" } } },
  { shared: { employees: 55 }, organization: { managerCount: 6 } }
);
assert.strictEqual(mergedCompanyData.shared.companyName, "Acme");
assert.strictEqual(mergedCompanyData.shared.employees, 55);
assert.strictEqual(mergedCompanyData.compliance.answers.entity, "Private Limited");
assert.strictEqual(mergedCompanyData.organization.managerCount, 6);
const modernSupabaseHeaders = workspaceServer.supabaseAuthHeaders("sb_secret_example_only");
assert.strictEqual(modernSupabaseHeaders.apikey, "sb_secret_example_only");
assert.strictEqual(Object.prototype.hasOwnProperty.call(modernSupabaseHeaders, "Authorization"), false);

const cronEntry = read("cloudflare/report-id-worker/src/entry-v2.mjs");
const rootWrangler = read("wrangler.jsonc");
assertIncludes(rootWrangler, "entry-v2.mjs");
assertIncludes(rootWrangler, '"0 * * * *"');
assertIncludes(cronEntry, "WORKSPACE_RETENTION_SECRET");
assertIncludes(cronEntry, "/api/company-workspace/retention/run");
assert(!/companyData|encrypted_company_data|access_key_hash/.test(cronEntry));

const moreInfoHtml = read("more-info.html");
assertIncludes(moreInfoHtml, "stored in your browser");
assertIncludes(moreInfoHtml, "Gmail API");
assert(/six months from your latest completed (?:intelligence )?analysis/.test(moreInfoHtml), "Privacy information must disclose the six-month Company Workspace policy.");
assertIncludes(moreInfoHtml, "seven days before the scheduled deletion date");
assertIncludes(moreInfoHtml, "earlier deletion");
assert(!moreInfoHtml.includes("does not currently maintain a dedicated assessment database"));

console.log("Baseline contract checks passed.");