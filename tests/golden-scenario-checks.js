"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(
        path.join(root, relativePath),
        "utf8"
    );
}

const fixture = JSON.parse(
    read(
        "tests/fixtures/m0-golden-scenarios.json"
    )
);

const reportSource = read(
    "js/executive-advisory-report.js"
);

function createElement() {
    return {
        textContent: "",
        innerHTML: "",
        addEventListener() {}
    };
}

function executeScenario(input) {
    const elements = new Map();

    function getElement(id) {
        if (!elements.has(id)) {
            elements.set(
                id,
                createElement()
            );
        }

        return elements.get(id);
    }

    const context = {
        console,

        localStorage: {
            getItem(key) {
                return key ===
                    "growwithhr-report"
                    ? JSON.stringify(input)
                    : null;
            }
        },

        document: {
            getElementById(id) {
                return getElement(id);
            },

            querySelector(selector) {
                if (
                    selector ===
                    ".executive-narrative p"
                ) {
                    return getElement(
                        "executiveNarrative"
                    );
                }

                if (
                    selector ===
                    "#lookingAhead p"
                ) {
                    return getElement(
                        "lookingAheadText"
                    );
                }

                return getElement(
                    selector.replace(
                        /[^a-zA-Z0-9_-]/g,
                        ""
                    ) || "query"
                );
            },

            querySelectorAll() {
                return [];
            }
        },

        window: {
            print() {}
        }
    };

    vm.createContext(context);

    vm.runInContext(
        `${reportSource}
this.ExecutiveAdvisoryReport =
    ExecutiveAdvisoryReport;`,
        context
    );

    new context.ExecutiveAdvisoryReport();

    return {
        companyName:
            getElement("companyName")
                .textContent,

        organisationStage:
            getElement("organisationStage")
                .textContent,

        executiveFocus:
            getElement("executiveFocus")
                .textContent,

        compliance:
            getElement("complianceContainer")
                .innerHTML,

        narrative:
            getElement("executiveNarrative")
                .innerHTML
    };
}

/* Fixture metadata */

assert.strictEqual(
    fixture.schemaVersion,
    1,
    "Golden-scenario schema version must remain 1."
);

assert.strictEqual(
    fixture.release,
    "0.15.1-beta",
    "Golden scenarios must match the M0 release."
);

assert.strictEqual(
    fixture.milestone,
    "M0 Baseline Freeze",
    "Golden scenarios must identify the M0 milestone."
);

assert(
    Array.isArray(fixture.scenarios),
    "Golden scenarios must be an array."
);

assert.strictEqual(
    fixture.scenarios.length,
    6,
    "The M0 baseline must contain six golden scenarios."
);

/* Unique scenario identities */

const scenarioIds =
    fixture.scenarios.map(
        (scenario) => scenario.id
    );

assert.strictEqual(
    new Set(scenarioIds).size,
    scenarioIds.length,
    "Every golden scenario must have a unique ID."
);

/* Deterministic output validation */

fixture.scenarios.forEach((scenario) => {
    assert(
        scenario.id,
        "Every golden scenario requires an ID."
    );

    assert(
        scenario.name,
        `${scenario.id} requires a name.`
    );

    assert(
        scenario.input &&
        typeof scenario.input === "object",
        `${scenario.id} requires input data.`
    );

    assert(
        scenario.expected &&
        typeof scenario.expected === "object",
        `${scenario.id} requires expected output.`
    );

    const firstRun =
        executeScenario(scenario.input);

    const secondRun =
        executeScenario(scenario.input);

    assert.deepStrictEqual(
        firstRun,
        secondRun,
        `${scenario.id} must produce deterministic output.`
    );

    assert.strictEqual(
        firstRun.companyName,
        scenario.input.companyName,
        `${scenario.id} must preserve the company name.`
    );

    assert.strictEqual(
        firstRun.organisationStage,
        scenario.expected
            .organisationStage,
        `${scenario.id} produced the wrong organisation stage.`
    );

    assert(
        firstRun.executiveFocus.includes(
            scenario.expected
                .executiveFocusContains
        ),
        `${scenario.id} produced the wrong executive focus.`
    );

    assert(
        firstRun.narrative.includes(
            scenario.input.industry
        ),
        `${scenario.id} narrative must include the selected industry.`
    );

    assert(
        firstRun.compliance.includes(
            scenario.input.primaryState
        ),
        `${scenario.id} compliance output must include the primary state.`
    );

    const requiredCompliance =
        scenario.expected
            .requiredCompliance || [];

    requiredCompliance.forEach(
        (expectedItem) => {
            assert(
                firstRun.compliance.includes(
                    expectedItem
                ),
                `${scenario.id} is missing required compliance output: ${expectedItem}`
            );
        }
    );

    const forbiddenCompliance =
        scenario.expected
            .forbiddenCompliance || [];

    forbiddenCompliance.forEach(
        (forbiddenItem) => {
            assert(
                !firstRun.compliance.includes(
                    forbiddenItem
                ),
                `${scenario.id} unexpectedly produced compliance output: ${forbiddenItem}`
            );
        }
    );
});

console.log(
    `M0 golden scenario checks passed: ${fixture.scenarios.length} deterministic scenarios.`
);
