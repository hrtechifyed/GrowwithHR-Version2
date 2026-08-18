import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");

const legacy = read("analyze-company.html");
const dedicated = read("compliance-intelligence.html");
const hub = read("intelligence-hub.html");
const assessmentRedirect = read("assessment.html");
const shell = read("js/site-shell.js");
const storage = read("js/executive-assessment/assessment-storage.js");

const requiredIds = [
  "assessmentShell",
  "landingScreen",
  "firstVisitActions",
  "startAssessment",
  "resumePanel",
  "resumeAssessmentButton",
  "conversationWorkspace",
  "storyForm",
  "storyContainer",
  "nextButton",
  "reviewScreen",
  "continueToContactButton",
  "contactScreen",
  "leadCaptureForm",
  "generateReportButton",
  "loadingScreen",
  "successScreen",
  "viewReportButton",
  "downloadReportButton",
  "assessmentConfig"
];

for (const id of requiredIds) {
  const contract = new RegExp(`id=["']${id}["']`);
  assert.match(dedicated, contract, `Dedicated Compliance entry is missing #${id}.`);
  assert.match(legacy, contract, `Legacy assessment route is missing #${id}.`);
}

const scriptSources = (html) => Array.from(html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g), (match) => match[1]);
const stylesheetSources = (html) => Array.from(html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/g), (match) => match[1]);
const configJson = (html) => {
  const match = html.match(/<script id=["']assessmentConfig["'] type=["']application\/json["']>\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match, "assessmentConfig JSON must exist.");
  return JSON.parse(match[1]);
};

assert.deepEqual(
  scriptSources(dedicated),
  scriptSources(legacy),
  "Dedicated Compliance entry must load the exact same shared JavaScript dependencies as the stable assessment route."
);
assert.deepEqual(
  stylesheetSources(dedicated),
  stylesheetSources(legacy),
  "Dedicated Compliance entry must load the exact same stylesheets as the stable assessment route."
);
assert.deepEqual(
  configJson(dedicated),
  configJson(legacy),
  "Dedicated Compliance entry must preserve the stable assessment configuration during the compatibility-first migration."
);

assert.match(dedicated, /src=["']js\/executive-assessment\.js["']/);
assert.match(dedicated, /src=["']js\/executive-assessment\/assessment-storage\.js["']/);
assert.match(dedicated, /src=["']js\/executive-assessment\/report-mapper\.js["']/);
assert.match(dedicated, /src=["']js\/executive-assessment\/advisory-delivery\.js["']/);
assert.match(dedicated, /src=["']js\/pdf\.js["']/);
assert.match(dedicated, /src=["']js\/gmail-service\.js["']/);

assert.match(hub, /href=["']compliance-intelligence\.html["']/);
assert.doesNotMatch(hub, /href=["']analyze-company\.html\?engine=compliance["']/);
assert.match(hub, /href=["']organization-intelligence\.html["']/);
assert.match(shell, /["']compliance-intelligence\.html["']:\s*["']analyze["']/);

assert.match(assessmentRedirect, /url=analyze-company\.html/);
assert.match(assessmentRedirect, /window\.location\.replace\("analyze-company\.html" \+ window\.location\.search \+ window\.location\.hash\)/);
assert.match(storage, /growwithhr-advisory-briefing-v2/);

assert.equal(
  fs.existsSync(new URL("js/compliance-intelligence.js", root)),
  false,
  "The dedicated URL must reuse shared assessment logic instead of forking a second Compliance controller."
);

console.log("Dedicated Compliance entry compatibility checks passed.");