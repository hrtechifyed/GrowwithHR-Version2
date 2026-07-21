"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

function filePath(relativePath) {
    return path.join(root, relativePath);
}

function read(relativePath) {
    return fs.readFileSync(
        filePath(relativePath),
        "utf8"
    );
}

function assertFileExists(relativePath) {
    assert(
        fs.existsSync(filePath(relativePath)),
        `Required baseline file is missing: ${relativePath}`
    );
}

function assertIncludes(
    source,
    expected,
    message
) {
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
    "executive-advisory-report.html",
    "package.json",
    "server.js",
    "js/config/app-config.js",
    "js/executive-assessment.js",
    "js/executive-assessment/assessment-storage.js",
    "js/pdf.js",
    "js/gmail-service.js"
];

for (const requiredFile of requiredFiles) {
    assertFileExists(requiredFile);
}

/* ==========================================================
   Canonical version
========================================================== */

const packageJson = JSON.parse(
    read("package.json")
);

const appConfig = read(
    "js/config/app-config.js"
);

const versionMatch = appConfig.match(
    /version:\s*"([^"]+)"/
);

assert(
    versionMatch,
    "Application configuration version was not found."
);

assert.strictEqual(
    versionMatch[1],
    packageJson.version,
    "package.json and app-config.js versions must match."
);

assert.strictEqual(
    packageJson.version,
    "0.18.0",
    "The current release baseline must use version 0.18.0."
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

const assessmentHtml = read(
    "analyze-company.html"
);

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

assertIncludes(
    assessmentHtml,
    '"chapters": 4',
    "The stable route must retain four chapters."
);

assertIncludes(
    assessmentHtml,
    '"storyMoments": 7',
    "The stable route must retain seven story moments."
);

/* ==========================================================
   Saved progress
========================================================== */

const storageJs = read(
    "js/executive-assessment/assessment-storage.js"
);

assertIncludes(
    storageJs,
    '"growwithhr-advisory-briefing-v2"',
    "The existing assessment storage key must be preserved."
);

assertIncludes(
    storageJs,
    '"growwithhr-report"',
    "The existing report storage key must be preserved."
);

assertIncludes(
    storageJs,
    "window.localStorage.getItem",
    "Saved progress must remain readable."
);

assertIncludes(
    storageJs,
    "window.localStorage.setItem",
    "Saved progress must remain writable."
);

/* ==========================================================
   PDF generation
========================================================== */

const pdfJs = read("js/pdf.js");

assertIncludes(
    assessmentHtml,
    'src="js/pdf.js"',
    "The stable route must load the PDF service."
);

assertIncludes(
    pdfJs,
    'const REPORT_STORAGE_KEY = "growwithhr-report"',
    "PDF generation must retain the report storage contract."
);

assertIncludes(
    pdfJs,
    'const DEFAULT_FILENAME = "GrowWithHR-Executive-Advisory.pdf"',
    "PDF generation must retain its default filename."
);

/* ==========================================================
   Email delivery
========================================================== */

const gmailJs = read(
    "js/gmail-service.js"
);

const serverJs = read("server.js");

assertIncludes(
    assessmentHtml,
    'src="js/gmail-service.js"',
    "The stable route must load the Gmail delivery client."
);

assertIncludes(
    gmailJs,
    '"/api/send-advisory"',
    "The Gmail client must retain its delivery endpoint."
);

assertIncludes(
    gmailJs,
    'method: "POST"',
    "The Gmail client must continue using POST delivery."
);

assertIncludes(
    serverJs,
    'app.get("/api/health"',
    "The server health endpoint must remain available."
);

assertIncludes(
    serverJs,
    'app.post("/api/send-advisory"',
    "The advisory email endpoint must remain available."
);

assertIncludes(
    serverJs,
    "gmailApi.users.messages.send",
    "The server must retain Gmail API delivery."
);

/* ==========================================================
   Privacy disclosure
========================================================== */

const moreInfoHtml = read(
    "more-info.html"
);

assertIncludes(
    moreInfoHtml,
    "stored in your browser",
    "Privacy information must disclose browser progress storage."
);

assertIncludes(
    moreInfoHtml,
    "Gmail API",
    "Privacy information must disclose Gmail API delivery."
);

assertIncludes(
    moreInfoHtml,
    "does not currently maintain a dedicated assessment",
    "Privacy information must disclose the current no-database posture."
);

console.log(
    "Baseline contract checks passed."
);
