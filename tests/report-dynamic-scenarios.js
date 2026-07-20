"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

const reportSource = fs.readFileSync(
    path.join(
        root,
        "js/executive-advisory-report.js"
    ),
    "utf8"
);

function createElement() {
    const listeners = new Map();

    return {
        textContent: "",
        innerHTML: "",

        addEventListener(type, handler) {
            listeners.set(type, handler);
        },

        listeners
    };
}

function runScenario(reportData) {
    const elements = new Map();
    let printCount = 0;

    function getElement(id) {
        if (!elements.has(id)) {
            elements.set(
                id,
                createElement()
            );
        }

        return elements.get(id);
    }

    const downloadButton =
        getElement("downloadPdf");

    const context = {
        console,

        localStorage: {
            getItem(key) {
                if (
                    key ===
                    "growwithhr-report"
                ) {
                    return JSON.stringify(
                        reportData
                    );
                }

                return null;
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

            querySelectorAll(selector) {
                if (
                    selector.includes(
                        "download-pdf"
                    ) ||
                    selector.includes(
                        "downloadPdf"
                    )
                ) {
                    return [
                        downloadButton
                    ];
                }

                return [];
            }
        },

        window: {
            print() {
                printCount += 1;
            }
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

    const downloadHandler =
        downloadButton.listeners.get(
            "click"
        );

    if (
        typeof downloadHandler ===
        "function"
    ) {
        downloadHandler();
    }

    return {
        companyName:
            getElement("companyName")
                .textContent,

        companyState:
            getElement("companyState")
                .textContent,

        companyIndustry:
            getElement("companyIndustry")
                .textContent,

        companyEntity:
            getElement("companyEntity")
                .textContent,

        employeeCount:
            getElement("employeeCount")
                .textContent,

        growthStage:
            getElement("growthStage")
                .textContent,

        peopleStructure:
            getElement("peopleStructure")
                .textContent,

        organisationStage:
            getElement("organisationStage")
                .textContent,

        executiveFocus:
            getElement("executiveFocus")
                .textContent,

        narrative:
            getElement("executiveNarrative")
                .innerHTML,

        observations:
            getElement(
                "observationsContainer"
            ).innerHTML,

        attention:
            getElement(
                "attentionContainer"
            ).innerHTML,

        compliance:
            getElement(
                "complianceContainer"
            ).innerHTML,

        recommendations:
            getElement(
                "recommendationsContainer"
            ).innerHTML,

        roadmap:
            getElement(
                "roadmapContainer"
            ).innerHTML,

        opportunities:
            getElement(
                "opportunitiesContainer"
            ).innerHTML,

        lookingAhead:
            getElement("lookingAheadText")
                .textContent,

        downloadBound:
            typeof downloadHandler ===
            "function",

        printCount
    };
}

const employeeCounts = [
    0,
    1,
    9,
    10,
    19,
    20,
    49,
    50,
    99,
    100,
    249,
    499,
    500,
    1000
];

const industries = [
    "Information Technology / SaaS",
    "Semiconductor",
    "Consulting & Professional Services",
    "Manufacturing",
    "Healthcare",
    "Financial Services"
];

const states = [
    "Karnataka",
    "Maharashtra",
    "Delhi (NCT)",
    "Tamil Nadu",
    "Gujarat",
    "Telangana"
];

const entities = [
    "Private Limited",
    "LLP",
    "One Person Company",
    "Public Limited"
];

const peopleFunctions = [
    "Dedicated HR Team",
    "Single HR/People Professional",
    "Founder Led",
    "Shared Admin Function",
    "External Consultant",
    "No Formal HR/People Function"
];

const fundingStages = [
    "Bootstrapped",
    "Seed",
    "Series A",
    "Series B",
    "Series C+",
    "Public"
];

const hiringPlans = [
    "Significant Growth",
    "Moderate Growth",
    "Selective Hiring",
    "Maintain Current Size",
    "Unsure; Market drives hiring needs"
];

const scenarios = Array.from(
    { length: 56 },
    (_, index) => ({
        companyName:
            `Scenario Company ${index + 1}`,

        industry:
            industries[
                index %
                industries.length
            ],

        primaryState:
            states[
                index %
                states.length
            ],

        entity:
            entities[
                index %
                entities.length
            ],

        employees:
            employeeCounts[
                index %
                employeeCounts.length
            ],

        contractWorkers:
            index % 3 === 0
                ? 5
                : 0,

        interns:
            index % 5 === 0
                ? 3
                : 0,

        apprentices:
            index % 4 === 0
                ? 2
                : 0,

        peopleFunction:
            peopleFunctions[
                index %
                peopleFunctions.length
            ],

        fundingStage:
            fundingStages[
                index %
                fundingStages.length
            ],

        hiringPlans:
            hiringPlans[
                index %
                hiringPlans.length
            ],

        workModel:
            index % 2 === 0
                ? "Hybrid"
                : "Office Based",

        locations:
            String(
                index % 4 + 1
            )
    })
);

const outputs =
    scenarios.map(runScenario);

assert.strictEqual(
    outputs.length,
    56,
    "Expected exactly 56 report scenarios."
);

/* ==========================================================
   Scenario-specific output
========================================================== */

outputs.forEach(
    (output, index) => {
        const scenario =
            scenarios[index];

        assert.strictEqual(
            output.companyName,
            scenario.companyName,
            "Company name must remain scenario-specific."
        );

        assert.strictEqual(
            output.companyState,
            scenario.primaryState,
            "Primary state must remain scenario-specific."
        );

        assert.strictEqual(
            output.companyIndustry,
            scenario.industry,
            "Industry must remain scenario-specific."
        );

        assert.strictEqual(
            output.companyEntity,
            scenario.entity,
            "Entity must remain scenario-specific."
        );

        assert(
            output.narrative.includes(
                scenario.industry
            ),
            "Narrative must contain the selected industry."
        );

        assert(
            output.recommendations.includes(
                scenario.hiringPlans
            ),
            "Recommendations must reflect the hiring outlook."
        );

        assert(
            output.compliance.includes(
                scenario.primaryState
            ),
            "Compliance output must reflect the primary state."
        );

        assert(
            output.roadmap.includes(
                "0–30 days"
            ),
            "Every report must include the first roadmap phase."
        );

        assert(
            output.roadmap.includes(
                "90+ days"
            ),
            "Every report must include the long-term roadmap phase."
        );

        assert(
            output.opportunities.includes(
                "Digital HR foundation"
            ),
            "Every report must retain strategic opportunities."
        );

        assert(
            output.lookingAhead.length > 0,
            "Every report must include a looking-ahead statement."
        );

        assert.strictEqual(
            output.downloadBound,
            true,
            "The report download action must be connected."
        );

        assert.strictEqual(
            output.printCount,
            1,
            "The connected download action must invoke printing once."
        );

        const combinedOutput = [
            output.narrative,
            output.observations,
            output.attention,
            output.compliance,
            output.recommendations,
            output.roadmap,
            output.opportunities
        ].join(" ");

        assert(
            !combinedOutput.includes(
                "undefined"
            ),
            "Report output must not expose undefined values."
        );

        assert(
            !combinedOutput.includes(
                "[object Object]"
            ),
            "Report output must not expose object coercion."
        );
    }
);

/* ==========================================================
   Organisation-stage boundaries
========================================================== */

function outputForEmployeeCount(
    employeeCount
) {
    const index =
        scenarios.findIndex(
            (scenario) => {
                return (
                    scenario.employees ===
                    employeeCount
                );
            }
        );

    assert(
        index >= 0,
        `Missing employee-count scenario: ${employeeCount}`
    );

    return outputs[index];
}

assert.strictEqual(
    outputForEmployeeCount(19)
        .organisationStage,
    "Developing Organisation",
    "Nineteen employees must remain in the developing stage."
);

assert.strictEqual(
    outputForEmployeeCount(20)
        .organisationStage,
    "Growth Organisation",
    "Twenty employees must enter the growth stage."
);

assert.strictEqual(
    outputForEmployeeCount(99)
        .organisationStage,
    "Growth Organisation",
    "Ninety-nine employees must remain in the growth stage."
);

assert.strictEqual(
    outputForEmployeeCount(100)
        .organisationStage,
    "Scaling Organisation",
    "One hundred employees must enter the scaling stage."
);

assert.strictEqual(
    outputForEmployeeCount(499)
        .organisationStage,
    "Scaling Organisation",
    "Four hundred and ninety-nine employees must remain in the scaling stage."
);

assert.strictEqual(
    outputForEmployeeCount(500)
        .organisationStage,
    "Enterprise Organisation",
    "Five hundred employees must enter the enterprise stage."
);

/* ==========================================================
   Compliance thresholds
========================================================== */

assert(
    !outputForEmployeeCount(9)
        .compliance.includes(
            "ESI and gratuity applicability"
        ),
    "The ten-employee compliance item must not appear below its threshold."
);

assert(
    outputForEmployeeCount(10)
        .compliance.includes(
            "ESI and gratuity applicability"
        ),
    "The ten-employee compliance item must appear at its threshold."
);

assert(
    !outputForEmployeeCount(19)
        .compliance.includes(
            "Provident Fund review"
        ),
    "Provident Fund review must not appear below twenty employees."
);

assert(
    outputForEmployeeCount(20)
        .compliance.includes(
            "Provident Fund review"
        ),
    "Provident Fund review must appear at twenty employees."
);

scenarios.forEach(
    (scenario, index) => {
        const compliance =
            outputs[index].compliance;

        assert.strictEqual(
            compliance.includes(
                "Contract workforce governance"
            ),
            scenario.contractWorkers > 0,
            "Contract-workforce guidance must follow the scenario input."
        );

        assert.strictEqual(
            compliance.includes(
                "Apprenticeship governance"
            ),
            scenario.apprentices > 0,
            "Apprenticeship guidance must follow the scenario input."
        );
    }
);

/* ==========================================================
   People-operating focus
========================================================== */

scenarios.forEach(
    (scenario, index) => {
        const focus =
            outputs[index]
                .executiveFocus;

        if (
            scenario.peopleFunction ===
            "No Formal HR/People Function"
        ) {
            assert(
                focus.includes(
                    "Establish a clear people operating model"
                ),
                "No-formal-HR scenarios require an operating-model focus."
            );

            return;
        }

        if (
            scenario.peopleFunction ===
            "Founder Led"
        ) {
            assert(
                focus.includes(
                    "Move founder-led people decisions"
                ),
                "Founder-led scenarios require a repeatable-management focus."
            );

            return;
        }

        assert(
            focus.includes(
                "Use the existing people capability"
            ),
            "Established People-function scenarios require a capability focus."
        );
    }
);

/* ==========================================================
   Fallback behaviour
========================================================== */

const emptyOutput =
    runScenario({});

assert.strictEqual(
    emptyOutput.companyName,
    "Not Provided",
    "Missing company names must use the established fallback."
);

assert.strictEqual(
    emptyOutput.employeeCount,
    "Not Provided",
    "Missing headcount must use the established fallback."
);

assert.strictEqual(
    emptyOutput.organisationStage,
    "Developing Organisation",
    "An empty scenario must default safely to the developing stage."
);

assert(
    emptyOutput.narrative.includes(
        "The organisation"
    ),
    "An empty scenario must still produce a readable narrative."
);

/* ==========================================================
   Output variation
========================================================== */

const uniqueSignatures =
    new Set(
        outputs.map((output) => {
            return [
                output.organisationStage,
                output.executiveFocus,
                output.compliance,
                output.observations,
                output.recommendations
            ].join("|");
        })
    );

assert(
    uniqueSignatures.size >= 24,
    `Expected meaningful report variation; received ${uniqueSignatures.size} unique signatures.`
);

console.log(
    `Dynamic advisory report scenarios passed: ${outputs.length} scenarios, ${uniqueSignatures.size} unique output signatures.`
);
