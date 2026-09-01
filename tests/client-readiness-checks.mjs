import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json"));
const assessment = read("analyze-company.html");
const homepage = read("index.html");
const sample = read("sample-advisory-report.html");
const readme = read("README.md");
const knownIssues = read("docs/KNOWN_ISSUES.md");
const gmailService = read("js/gmail-service.js");
const serverEntry = read("server-entry.js");

assert(assessment.includes(`"applicationVersion": "${packageJson.version}"`));
assert(assessment.includes('"experienceVersion": "2.0.0"'));
assert(!assessment.includes('href="assets/favicon.ico"'));
assert(homepage.includes('CURRENT PRODUCT'));
assert(homepage.includes('<span class="buyer-card__label">Compliance Needs</span>'));
assert(homepage.includes('<span class="buyer-card__label">Organization Structure &amp; Growth Engine</span>'));
assert(!homepage.includes('aria-label="Next capability"'));
assert(!homepage.includes('(to be done)'));
assert(!homepage.includes('(in progress)'));
assert(!sample.includes('VERIFIED SOURCES'));
assert(!sample.includes('Mandatory Compliance Obligations'));
assert(readme.startsWith('# GrowWithHR'));
assert(readme.includes('archived experimental React/TypeScript UX layer'));
assert(knownIssues.includes('historically committed `.env`'));
assert(knownIssues.includes('removed from reachable Git history'));
assert(gmailService.includes('https://growwithhr.onrender.com/api/send-advisory'));
assert(gmailService.includes('https://hrtechifyed.github.io'));
assert(serverEntry.includes('Access-Control-Allow-Origin'));
assert(serverEntry.includes('ALLOWED_CORS_ORIGINS'));
for (const retired of ['backupstyles.css','js/intro-sequence.js','js/old-email-service.js','pages/company-profile.html','pages/organization-profile.html']) {
    assert(!fs.existsSync(retired), `${retired} must be retired.`);
}
assert(fs.existsSync('css/13-legacy-compatibility.css'));
assert(fs.existsSync('assets/favicon.svg'));
console.log('Client-readiness static checks passed.');
