import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/industry-adaptive-assessment.js", "utf8");
new vm.Script(source, { filename: "js/industry-adaptive-assessment.js" });

assert(source.includes("manufacturing:"));
assert(source.includes("bpo:"));
assert(source.includes("software:"));
assert(source.includes('"workers"'));
assert(source.includes('"womenEmployees"'));
assert(source.includes('"usesPower"'));
assert(source.includes('"manufacturingOperations"'));
assert(source.includes('"shiftPattern"'));
assert(source.includes('"nightShifts"'));
assert(source.includes('"womenNightShifts"'));
assert(source.includes('"nightTransport"'));
assert(source.includes('"nightSecurity"'));
assert(source.includes('"workerCategories"'));
assert(source.includes('"clientSiteWorkers"'));
assert(source.includes('"overseasWorkers"'));
assert(source.includes("applicationMoment(application) !== 2"));
assert(source.includes("Please answer this industry-specific question."));
assert(source.includes("application.stateModel.setAnswer(name, value)"));
assert(source.includes("application.persist?.()"));
assert(source.includes("application.saveProgress?.()"));
assert(source.includes("installSubmitGuard(application)"));
assert(source.includes('form.addEventListener("submit"'));
assert(source.includes("event.stopImmediatePropagation()"));
assert(source.includes("unlockNavigation(application)"));
assert(source.includes("Review the highlighted required information before continuing."));
assert(!source.includes("application.continueFromMoment = function industryAwareContinue"));

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
        getElementById() { return null; },
        addEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; }
    },
    MutationObserver: class { observe() {} },
    HTMLInputElement: class {},
    CSS: { escape: (value) => value },
    queueMicrotask,
    Event
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const api = sandbox.window.GrowWithHRIndustryAdaptiveAssessment;
assert(api);
assert.equal(api.resolveProfile("Manufacturing"), "manufacturing");
assert.equal(api.resolveProfile("BPO contact centre"), "bpo");
assert.equal(api.resolveProfile("Information Technology / SaaS"), "software");
assert.equal(api.resolveProfile("Healthcare"), "");
assert(!api.profiles.software.fields.some(([name]) => name === "usesPower"));
assert(!api.profiles.software.fields.some(([name]) => name === "workers"));
assert(api.profiles.manufacturing.fields.some(([name]) => name === "workers"));
assert(api.profiles.bpo.fields.some(([name]) => name === "nightTransport"));

console.log("Industry-adaptive assessment checks passed.");