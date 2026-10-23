import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const compliance = readFileSync("js/report-editorial-template-v1.js", "utf8");
const organization = readFileSync("js/organization-structure-pdf.mjs", "utf8");
const reminders = readFileSync("docs/OPT_IN_COMPLIANCE_REMINDERS_SPEC_2026-10-23.md", "utf8");

// Parse both production PDF renderers, not merely a copied layout fixture.
execFileSync(process.execPath, ["--check", "js/report-editorial-template-v1.js"]);
execFileSync(process.execPath, ["--check", "js/organization-structure-pdf.mjs"]);

assert.match(compliance, /function keyValueGrid\(rows, columns = 4\)/);
assert.match(compliance, /for \(let start = 0; start < prepared\.length; start \+= count\)/);
assert.match(compliance, /const cellHeight = Math\.max\(28,/);
assert.match(compliance, /ensure\(cellHeight \+ 5\)/);
assert.match(compliance, /cell\.labelLines\.length \* lineHeight\(6\.3, 1\.1\)/);
assert.match(compliance, /cell\.valueLines\.length \* lineHeight\(8\.3, 1\.25\)/);
assert.match(compliance, /const height = Math\.max\(19,/);
assert.match(compliance, /ensure\(height \+ 5\)/);
assert.match(compliance, /const barY = canvas\.getY\(\) \+ 7/);
assert.match(compliance, /const blockHeight = 56 \+/);
assert.match(compliance, /headline: clean\(supplied\.headline, "HR Compliance Readiness"\)/);

assert.match(organization, /const identityHeight = 18 \+/);
assert.match(organization, /let identityTextY = identityY \+ 22/);
assert.match(organization, /const noteY = Math\.max\(190, identityY \+ identityHeight \+ 9\)/);
assert.match(organization, /doc\.splitTextToSize\(readNote, CONTENT_W - 16\)/);

// Reminders are not silently enabled as a side effect of the PDF change.
assert.match(reminders, /Default: No/);
assert.match(reminders, /No, thanks/);
assert.match(reminders, /Start reminders/);
assert.match(reminders, /NOT implemented or activated/);
assert.match(reminders, /unsubscribe/i);
assert.match(reminders, /statutory due dates/i);

console.log("GrowWithHR PDF formatting and optional-reminder consent guardrails passed.");
