import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json"));
const assessment = read("analyze-company.html");
const homepage = read("index.html");
const sample = read("sample-advisory-report.html");
const readme = read("README.md");
const knownIssues = read("docs/KNOWN_ISSUES.md");

assert(assessment.includes(`"applicationVersion": "${packageJson.version}"`));
assert(assessment.includes('"experienceVersion": "2.0.0"'));
assert(!assessment.includes('href="assets/favicon.ico"'));
assert(homepage.includes('Current capabilities and roadmap'));
assert(homepage.includes('aria-label="Next capability"'));
assert(!homepage.includes('(to be done)'));
assert(!homepage.includes('(in progress)'));
assert(!sample.includes('VERIFIED SOURCES'));
assert(!sample.includes('Mandatory Compliance Obligations'));
assert(readme.startsWith('# GrowWithHR'));
assert(readme.includes('archived experimental React/TypeScript UX layer'));
assert(knownIssues.includes('Historical Git analysis found a committed `.env`'));
for (const retired of ['backupstyles.css','js/intro-sequence.js','js/old-email-service.js','pages/company-profile.html','pages/organization-profile.html']) {
    assert(!fs.existsSync(retired), `${retired} must be retired.`);
}
assert(fs.existsSync('css/13-legacy-compatibility.css'));
assert(fs.existsSync('assets/favicon.svg'));
console.log('Client-readiness static checks passed.');
