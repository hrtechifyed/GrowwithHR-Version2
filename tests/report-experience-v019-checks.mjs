import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const exists = (path) => fs.existsSync(path) && fs.statSync(path).size > 20;

const experience = read("js/report-experience-v019.js");
const pdf = read("js/pdf-polish.js");
const executiveEnhancements = read("js/pdf-executive-enhancements.js");
const report = read("js/executive-advisory-report.js");
const buildMarker = read("js/build-marker.js");
const css = read("css/23-report-experience.css");

new vm.Script(experience, { filename: "js/report-experience-v019.js" });
new vm.Script(pdf, { filename: "js/pdf-polish.js" });
new vm.Script(executiveEnhancements, { filename: "js/pdf-executive-enhancements.js" });
new vm.Script(report, { filename: "js/executive-advisory-report.js" });
new vm.Script(buildMarker, { filename: "js/build-marker.js" });

assert(buildMarker.indexOf('import("./report-experience-v019.js")') < buildMarker.indexOf('import("./pdf-polish.js")'));
assert(buildMarker.includes("css/23-report-experience.css"));
assert(buildMarker.includes("if (!context.assessment && !context.report) return;"));

assert(experience.includes("0.19.2-complete-priorities-dual-theme"));
assert(experience.includes("ONE_PERSON_COMPANY"));
assert(experience.includes("return 1"));
assert(experience.includes("input.disabled=onePerson"));
assert(experience.includes("advisoryReportTheme"));
assert(experience.includes('value="both"'));
assert(experience.includes("Both versions"));
assert(experience.includes("Compliance calendar template"));
assert(experience.includes("uniqueText"));
assert(experience.includes("completePriorityModel"));
assert(experience.includes("all-of-the-above"));
assert(experience.includes('Remote:"100"'));
assert(experience.includes('"Office Based":"0"'));
assert(experience.includes("applyRemoteBandDefault"));
assert(experience.includes('observerScope:"story-container"'));
assert(!experience.includes("observer.observe(document.body"));
assert(experience.includes('document.getElementById("storyContainer")'));
assert(experience.includes('import("./pdf-executive-enhancements.js")'));

assert(pdf.includes('const VERSION = "3.2.0-executive-pagination"'));
assert(pdf.includes("const THEMES"));
assert(pdf.includes("light:"));
assert(pdf.includes("dark:"));
assert(pdf.includes("panelAlt: [232, 239, 248]"));
assert(pdf.includes("assets/hrtechify-logo.png"));
assert(!pdf.includes("hrtechify-logo-transparent.svg"));
assert(pdf.includes("function recommendationCard"));
assert(pdf.includes("function summaryTable"));
assert(pdf.includes("const rowHeights = preparedRows.map"));
assert(pdf.includes("function roadmap"));
assert(pdf.includes("function ensureSpace"));
assert(pdf.includes("function enrichPrioritySources"));
assert(pdf.includes("function tableOfContents"));
assert(pdf.includes("function endPage"));
assert(pdf.includes("Selected by you"));
assert(pdf.includes("Company DNA suggestion"));
assert(pdf.includes("Additional Strategic Priorities Informed by Your Company DNA"));
assert(pdf.includes("textWithLink"));
assert(pdf.includes("HOW TO IMPLEMENT"));
assert(pdf.includes("GrowWithHRPDFPolishReady"));

assert(executiveEnhancements.includes("3.3.0-justified-dual-theme"));
assert(executiveEnhancements.includes('align:"justify"'));
assert(executiveEnhancements.includes("EXECUTIVE REPORT NAVIGATION"));
assert(executiveEnhancements.includes("supportsDualTheme:true"));
assert(executiveEnhancements.includes('theme:"both"'));
assert(executiveEnhancements.includes("pdfs"));
assert(executiveEnhancements.includes("dualThemeDelivery:true"));
assert(executiveEnhancements.includes("variantCount"));

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
