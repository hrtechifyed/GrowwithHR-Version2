import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const exists = (path) => fs.existsSync(path) && fs.statSync(path).size > 20;

const experience = read("js/report-experience-v019.js");
const pdf = read("js/pdf-polish.js");
const report = read("js/executive-advisory-report.js");
const buildMarker = read("js/build-marker.js");
const css = read("css/23-report-experience.css");

new vm.Script(experience, { filename: "js/report-experience-v019.js" });
new vm.Script(pdf, { filename: "js/pdf-polish.js" });
new vm.Script(report, { filename: "js/executive-advisory-report.js" });
new vm.Script(buildMarker, { filename: "js/build-marker.js" });

assert(buildMarker.indexOf('import("./report-experience-v019.js")') < buildMarker.indexOf('import("./pdf-polish.js")'));
assert(buildMarker.includes("css/23-report-experience.css"));
assert(buildMarker.includes("if (!context.assessment && !context.report) return;"));

assert(experience.includes('const ONE_PERSON_COMPANY = "One Person Company"'));
assert(experience.includes("return 1"));
assert(experience.includes("input.disabled = onePerson"));
assert(experience.includes("advisoryReportTheme"));
assert(experience.includes("Compliance calendar template"));
assert(experience.includes("uniqueText"));
assert(experience.includes('observerScope: "story-container"'));
assert(!experience.includes("observer.observe(document.body"));
assert(experience.includes('document.getElementById("storyContainer")'));

assert(pdf.includes('const VERSION = "3.1.0-clean-report-layout"'));
assert(pdf.includes("const THEMES"));
assert(pdf.includes("light:"));
assert(pdf.includes("dark:"));
assert(pdf.includes('assets/hrtechify-logo.png'));
assert(!pdf.includes('hrtechify-logo-transparent.svg'));
assert(pdf.includes("function recommendationCard"));
assert(pdf.includes("function summaryTable"));
assert(pdf.includes("function roadmap"));
assert(pdf.includes("function ensureSpace"));
assert(pdf.includes("textWithLink"));
assert(pdf.includes("HOW TO IMPLEMENT"));
assert(pdf.includes("GrowWithHRPDFPolishReady"));

assert(report.includes("How to implement"));
assert(report.includes("employeeLabel"));
assert(report.includes("GrowWithHRReportExperience"));
assert(report.includes("resourceUrl"));
assert(css.includes("is-system-locked"));
assert(css.includes("advisory-report-theme-choice"));

[
    "resources/compliance-calendar-template.csv",
    "resources/employee-document-checklist.csv",
    "resources/employee-onboarding-checklist.csv",
    "resources/policy-register-template.csv",
    "resources/statutory-registration-tracker.csv",
    "resources/contractor-due-diligence-checklist.csv",
    "resources/hr-action-plan-template.csv"
].forEach((path) => assert(exists(path), `${path} must exist and contain a usable template`));

console.log("v0.19 report experience checks passed.");
