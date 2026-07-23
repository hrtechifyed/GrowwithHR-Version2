import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/gmail-service.js", "utf8");
new vm.Script(source, { filename: "js/gmail-service.js" });

assert(source.includes('const MAX_OPERATING_STATES = 3;'));
assert(source.includes('const PAN_INDIA_LABEL = "Pan India";'));
assert(source.includes("How many states or union territories are you operating from?"));
assert(source.includes("If you operate from more than three states or union territories, choose Pan India."));
assert(source.includes('data-maximum=""'));
assert(source.includes("Choose every priority that applies, or select All of the above."));
assert(!source.includes("Choose no more than three priorities."));
assert(source.includes("India compliance scope"));
assert(source.includes("restricted to the organisation’s India operations only"));
assert(source.includes('? "primaryState"'));
assert(source.includes(".map((value) => cleanText(value)).filter(Boolean)"));
assert(!source.includes(".map(cleanText)"));

class HTMLInputElement {}
class HTMLSelectElement {}
class HTMLTextAreaElement {}

const listeners = new Map();
const document = {
    readyState: "loading",
    body: { dataset: {} },
    addEventListener(name, handler) {
        listeners.set(name, handler);
    },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
};

const window = {
    location: {
        origin: "http://localhost",
        pathname: "/analyze-company.html",
        href: "http://localhost/analyze-company.html"
    },
    fetch() {},
    setTimeout,
    clearTimeout,
    requestAnimationFrame(callback) { callback(); },
    addEventListener() {},
    dispatchEvent() {},
    GrowWithHRModules: {},
    GrowWithHRPDF: {
        buildAdvisoryModel() {
            return { compliance: ["Existing consideration"] };
        }
    }
};

const context = vm.createContext({
    window,
    document,
    console,
    URL,
    Event,
    CustomEvent: class CustomEvent {},
    MutationObserver: class MutationObserver {
        observe() {}
    },
    HTMLInputElement,
    HTMLSelectElement,
    HTMLTextAreaElement,
    queueMicrotask
});

new vm.Script(source, { filename: "js/gmail-service.js" }).runInContext(context);
listeners.get("DOMContentLoaded")?.();

const helpers = window.GrowWithHRFootprintEnhancements;
assert.equal(helpers.maxOperatingStates, 3);
assert.equal(helpers.panIndiaValue, "pan-india");
assert.deepEqual(
    Array.from(helpers.normaliseStateList("Maharashtra; Karnataka; Telangana; Kerala")),
    ["Maharashtra", "Karnataka", "Telangana"]
);

const emptyFootprint = helpers.normaliseOperatingFootprintAnswers({});
assert.equal(emptyFootprint.operatingStateCount, "1");
assert.equal(emptyFootprint.primaryState, "");
assert.deepEqual(Array.from(emptyFootprint.operatingStates), []);

const twoStates = helpers.normaliseOperatingFootprintAnswers({
    operatingStateCount: "2",
    operatingState1: "Maharashtra",
    operatingState2: "Karnataka"
});
assert.equal(twoStates.primaryState, "Maharashtra; Karnataka");
assert.deepEqual(Array.from(twoStates.operatingStates), ["Maharashtra", "Karnataka"]);

const panIndia = helpers.normaliseOperatingFootprintAnswers({
    operatingStateCount: "pan-india",
    operatingState1: "Maharashtra"
});
assert.equal(panIndia.primaryState, "Pan India");
assert.deepEqual(Array.from(panIndia.operatingStates), []);

window.GrowWithHRModules.AssessmentValidation = {
    createResult(answers = {}) {
        return {
            valid: true,
            errors: {},
            firstInvalidField: "",
            normalizedAnswers: { ...answers }
        };
    },
    requireText(result, field, message) {
        if (!String(result.normalizedAnswers[field] || "").trim()) {
            result.valid = false;
            result.errors[field] = message;
            result.firstInvalidField ||= field;
        }
    },
    requireWholeNumber(result, field, message, minimum) {
        const value = Number(result.normalizedAnswers[field]);
        if (!Number.isInteger(value) || value < minimum) {
            result.valid = false;
            result.errors[field] = message;
            result.firstInvalidField ||= field;
        }
    }
};

window.GrowWithHRModules.AssessmentDefinition = {
    STATES: ["Maharashtra", "Karnataka", "Telangana"]
};

const validation = window.GrowWithHRModules.AssessmentValidation;
const prioritiesResult = validation.validatePeopleReadiness({
    peopleFunction: "Founder Led",
    priorities: ["a", "b", "c", "d", "e"]
});
assert.equal(prioritiesResult.valid, true);
assert.equal(prioritiesResult.normalizedAnswers.priorities.length, 5);

const footprintResult = validation.validateOperatingFootprint({
    operatingStateCount: "2",
    operatingState1: "Maharashtra",
    operatingState2: "Karnataka",
    locations: "2",
    countries: "3"
});
assert.equal(footprintResult.valid, true);
assert.equal(footprintResult.normalizedAnswers.primaryState, "Maharashtra; Karnataka");

const scopedModel = window.GrowWithHRPDF.buildAdvisoryModel({});
assert.equal(scopedModel.compliance[0], helpers.indiaComplianceScopeNotice);
assert(scopedModel.compliance.includes("Existing consideration"));

console.log("Operating-footprint and unlimited-priority checks passed.");
