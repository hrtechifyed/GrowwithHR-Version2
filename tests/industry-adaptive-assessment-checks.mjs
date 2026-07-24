import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/industry-adaptive-assessment.js", "utf8");
new vm.Script(source, { filename: "js/industry-adaptive-assessment.js", importModuleDynamically: async () => ({}) });

[
    "UNIVERSAL_FIELDS",
    '"workerCategories"',
    '"womenEmployees"',
    '"esiWageEligibility"',
    '"bonusWageEligibility"',
    "No individual salary is requested",
    "Optional, but recommended",
    "You may continue and the report will show exactly what remains unconfirmed.",
    "manufacturing:",
    "bpo:",
    "software:",
    '"workers"',
    '"usesPower"',
    '"manufacturingOperations"',
    '"shiftPattern"',
    '"nightShifts"',
    '"womenNightShifts"',
    '"nightTransport"',
    '"nightSecurity"',
    '"clientSiteWorkers"',
    '"overseasWorkers"',
    "applicationMoment(application) !== 2",
    "Please answer this question before continuing.",
    "application.stateModel.setAnswer(name, value)",
    "application.persist?.()",
    "application.saveProgress?.()",
    "installSubmitGuard(application)",
    'form.addEventListener("submit"',
    "event.stopImmediatePropagation()",
    "unlockNavigation(application)",
    "Review the highlighted required information before continuing.",
    "existing?.dataset.industryAdaptive === renderKey",
    "if (!setAnswer(application, name, value)) return"
].forEach((marker) => assert(source.includes(marker), `missing assessment marker: ${marker}`));
assert(!source.includes("application.continueFromMoment = function industryAwareContinue"));
assert(!source.includes("new MutationObserver"), "adaptive questions must not observe and rebuild their own container");
assert(!source.includes('["workerCategories", "Which workforce groups are used?"'), "worker categories must not be software-only");

let currentSection = null;
let appendCount = 0;
const container = {
    querySelector(selector) {
        return selector === "[data-industry-adaptive]" ? currentSection : null;
    },
    appendChild(section) {
        currentSection = section;
        appendCount += 1;
    }
};

const sandbox = {
    console,
    window: {
        addEventListener() {},
        executiveAssessment: null,
        setInterval() { return 1; },
        clearInterval() {},
        setTimeout(callback) { callback(); return 1; }
    },
    document: {
        body: null,
        getElementById(id) { return id === "storyContainer" ? container : null; },
        createElement() {
            const section = {
                className: "",
                dataset: {},
                innerHTML: "",
                remove() {
                    if (currentSection === section) currentSection = null;
                }
            };
            return section;
        },
        addEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; }
    },
    HTMLInputElement: class {},
    CSS: { escape: (value) => value },
    queueMicrotask,
    Event
};
vm.createContext(sandbox);
const script = new vm.Script(source, {
    filename: "js/industry-adaptive-assessment.js",
    importModuleDynamically: async () => ({})
});
script.runInContext(sandbox);
const api = sandbox.window.GrowWithHRIndustryAdaptiveAssessment;
assert(api);
assert.equal(api.resolveProfile("Manufacturing"), "manufacturing");
assert.equal(api.resolveProfile("BPO contact centre"), "bpo");
assert.equal(api.resolveProfile("Information Technology / SaaS"), "software");
assert.equal(api.resolveProfile("Healthcare"), "");
assert(api.universalFields.some(([name]) => name === "workerCategories"));
assert(api.universalFields.some(([name]) => name === "esiWageEligibility"));
assert(api.universalFields.some(([name]) => name === "bonusWageEligibility"));
assert(api.universalFields.every(([, , , , required]) => required === false), "universal compliance inputs must improve precision without blocking the journey");
assert(!api.profiles.software.fields.some(([name]) => name === "workerCategories"));
assert(!api.profiles.software.fields.some(([name]) => name === "usesPower"));
assert(!api.profiles.software.fields.some(([name]) => name === "workers"));
assert(api.profiles.manufacturing.fields.some(([name]) => name === "workers"));
assert(api.profiles.bpo.fields.some(([name]) => name === "nightTransport"));

const manufacturingApplication = {
    currentMoment: 2,
    answers: { industry: "Manufacturing" }
};
assert.equal(api.render(manufacturingApplication), true);
assert.equal(api.render(manufacturingApplication), true);
assert.equal(appendCount, 1, "rendering the same workforce profile twice must not rebuild the section");
assert.match(currentSection.innerHTML, /WORKFORCE AND STATUTORY ELIGIBILITY/);
assert.match(currentSection.innerHTML, /Manufacturing and plant operations/);

currentSection = null;
appendCount = 0;
const healthcareApplication = {
    currentMoment: 2,
    answers: { industry: "Healthcare" }
};
assert.equal(api.render(healthcareApplication), true);
assert.equal(api.validate(healthcareApplication), true, "unanswered universal precision questions must not block Continue");
assert.equal(appendCount, 1, "universal statutory questions must render even without an industry profile");
assert.match(currentSection.innerHTML, /ESI wage-eligibility limit/);
assert.doesNotMatch(currentSection.innerHTML, /INDUSTRY-SPECIFIC QUESTIONS/);

console.log("Industry-adaptive assessment checks passed.");
