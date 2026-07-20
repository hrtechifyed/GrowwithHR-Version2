"use strict";

/**
 * GrowWithHR Compliance DNA
 * M1 Contract Checks
 *
 * Protects the stable v2 experience and verifies the
 * isolated Five-Act private-beta foundation.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root =
    path.resolve(__dirname, "..");

function absolutePath(relativePath) {
    return path.join(
        root,
        relativePath
    );
}

function read(relativePath) {
    const filePath =
        absolutePath(relativePath);

    assert(
        fs.existsSync(filePath),
        `Required file is missing: ${relativePath}`
    );

    return fs.readFileSync(
        filePath,
        "utf8"
    );
}

function readJson(relativePath) {
    const source =
        read(relativePath);

    try {
        return JSON.parse(source);
    } catch (error) {
        throw new Error(
            `${relativePath} contains invalid JSON: ${error.message}`
        );
    }
}

function includes(
    source,
    expected,
    message
) {
    assert(
        source.includes(expected),
        message ||
            `Expected source to contain: ${expected}`
    );
}

function excludes(
    source,
    unexpected,
    message
) {
    assert(
        !source.includes(unexpected),
        message ||
            `Expected source not to contain: ${unexpected}`
    );
}

function matches(
    source,
    pattern,
    message
) {
    assert(
        pattern.test(source),
        message ||
            `Expected source to match: ${pattern}`
    );
}

function countMatches(
    source,
    pattern
) {
    return (
        source.match(pattern) ||
        []
    ).length;
}

/* ==========================================================
   Required files
========================================================== */

const requiredFiles = [
    "analyze-company.html",
    "analyze-company-v3.html",
    "css/19-compliance-dna.css",
    "data/assessment/narrative-copy.json",
    "js/config/app-config.js",
    "js/assessment-v3/story-engine.js",
    "js/assessment-v3/bootstrap.js",
    "js/assessment-v3/legacy-adapter.js",
    "js/assessment-v3/analysis-sequence.js"
];

for (
    const relativePath
    of requiredFiles
) {
    assert(
        fs.existsSync(
            absolutePath(relativePath)
        ),
        `Required M1 file is missing: ${relativePath}`
    );
}

/* ==========================================================
   Version alignment
========================================================== */

const packageJson =
    readJson("package.json");

const appConfig =
    read(
        "js/config/app-config.js"
    );

const appVersionMatch =
    appConfig.match(
        /\bversion:\s*"([^"]+)"/
    );

assert(
    appVersionMatch,
    "Application configuration must define a version."
);

assert.strictEqual(
    appVersionMatch[1],
    packageJson.version,
    "Application configuration must match package.json version."
);

/* ==========================================================
   Stable v2 route protection
========================================================== */

const stableAssessment =
    read("analyze-company.html");

includes(
    stableAssessment,
    'id="assessmentShell"',
    "The stable v2 assessment shell must remain available."
);

includes(
    stableAssessment,
    'src="js/executive-assessment.js"',
    "The stable route must retain its current controller."
);

includes(
    stableAssessment,
    'href="css/17-advisory-briefing.css"',
    "The stable route must retain its current stylesheet."
);

excludes(
    stableAssessment,
    "assessment-v3/bootstrap.js",
    "The stable route must not load the v3 bootstrap."
);

excludes(
    stableAssessment,
    "19-compliance-dna.css",
    "The stable route must not load the v3 stylesheet."
);

/* ==========================================================
   Private-beta v3 route
========================================================== */

const v3Assessment =
    read(
        "analyze-company-v3.html"
    );

includes(
    v3Assessment,
    'class="compliance-dna-page"',
    "The v3 route must use its isolated body class."
);

includes(
    v3Assessment,
    'content="noindex, nofollow"',
    "The private-beta route must remain noindex."
);

includes(
    v3Assessment,
    'href="css/19-compliance-dna.css"',
    "The v3 route must load its isolated stylesheet."
);

includes(
    v3Assessment,
    'src="js/assessment-v3/bootstrap.js"',
    "The v3 route must load its module bootstrap."
);

includes(
    v3Assessment,
    'href="analyze-company.html"',
    "The v3 route must retain a stable-assessment fallback."
);

includes(
    v3Assessment,
    'id="dnaShell"',
    "The v3 route must contain the Compliance DNA shell."
);

includes(
    v3Assessment,
    'id="dnaProgressValue"',
    "The v3 route must contain its progress indicator."
);

includes(
    v3Assessment,
    'id="dnaStartButton"',
    "The v3 route must contain its primary action."
);

assert.strictEqual(
    countMatches(
        v3Assessment,
        /data-act-button="/g
    ),
    5,
    "The v3 route must contain exactly five act buttons."
);

/* ==========================================================
   Feature configuration
========================================================== */

includes(
    appConfig,
    'assessmentV2: "analyze-company.html"',
    "Configuration must retain the stable v2 route."
);

includes(
    appConfig,
    'assessmentV3: "analyze-company-v3.html"',
    "Configuration must define the private-beta route."
);

includes(
    appConfig,
    "complianceDnaV3: false",
    "Compliance DNA v3 must remain disabled by default."
);

includes(
    appConfig,
    "resolveAssessmentRoute",
    "Configuration must provide an assessment-route resolver."
);

/* ==========================================================
   Narrative configuration
========================================================== */

const narrative =
    readJson(
        "data/assessment/narrative-copy.json"
    );

assert.strictEqual(
    narrative.schemaVersion,
    1,
    "Narrative configuration must use schema version 1."
);

assert(
    Array.isArray(narrative.acts),
    "Narrative configuration must contain an acts array."
);

assert.strictEqual(
    narrative.acts.length,
    5,
    "Narrative configuration must contain exactly five acts."
);

const expectedActIds = [
    "discover",
    "people",
    "footprint",
    "understand",
    "act"
];

assert.deepStrictEqual(
    narrative.acts.map(
        (act) => act.id
    ),
    expectedActIds,
    "Narrative acts must retain the approved order."
);

assert.strictEqual(
    new Set(
        narrative.acts.map(
            (act) => act.id
        )
    ).size,
    5,
    "Narrative act identifiers must be unique."
);

narrative.acts.forEach(
    (act, index) => {
        assert.strictEqual(
            act.number,
            index + 1,
            `Narrative act ${index + 1} has an incorrect number.`
        );

        for (
            const property
            of [
                "id",
                "label",
                "title",
                "description"
            ]
        ) {
            assert(
                typeof act[property] ===
                    "string" &&
                    act[property].trim(),
                `Narrative act ${index + 1} requires ${property}.`
            );
        }
    }
);

/* ==========================================================
   Five-Act story engine
========================================================== */

const storyEngine =
    read(
        "js/assessment-v3/story-engine.js"
    );

includes(
    storyEngine,
    "const STORY_ACTS",
    "The story engine must define its Five-Act sequence."
);

includes(
    storyEngine,
    "export function createStoryEngine",
    "The story engine must export its factory."
);

includes(
    storyEngine,
    "function setAct",
    "The story engine must support direct navigation."
);

includes(
    storyEngine,
    "function next",
    "The story engine must support forward navigation."
);

includes(
    storyEngine,
    "function previous",
    "The story engine must support backward navigation."
);

for (
    const actId
    of expectedActIds
) {
    includes(
        storyEngine,
        `id: "${actId}"`,
        `The story engine must include "${actId}".`
    );
}

/* ==========================================================
   Bootstrap and narrative loading
========================================================== */

const bootstrap =
    read(
        "js/assessment-v3/bootstrap.js"
    );

includes(
    bootstrap,
    'import createStoryEngine from "./story-engine.js"',
    "The bootstrap must import the story engine."
);

includes(
    bootstrap,
    '"data/assessment/narrative-copy.json"',
    "The bootstrap must use the narrative configuration."
);

includes(
    bootstrap,
    "await loadNarrative()",
    "Narrative loading must complete before initialization."
);

includes(
    bootstrap,
    "mergeNarrativeWithState",
    "Configured narrative must be merged into rendered state."
);

includes(
    bootstrap,
    '"analyze-company.html"',
    "The bootstrap must retain the stable fallback."
);

includes(
    bootstrap,
    "window.GrowWithHRComplianceDna",
    "The bootstrap must expose private-beta diagnostics."
);

/* ==========================================================
   Legacy compatibility
========================================================== */

const legacyAdapter =
    read(
        "js/assessment-v3/legacy-adapter.js"
    );

const protectedKeys = [
    "growwithhr-advisory-briefing-v2",
    "growwithhr-report",
    "growwithhr-lead",
    "growwithhr-advisory-delivery-v1",
    "growwithhr-industry-catalog-v1"
];

for (
    const protectedKey
    of protectedKeys
) {
    includes(
        legacyAdapter,
        `"${protectedKey}"`,
        `The adapter must preserve ${protectedKey}.`
    );
}

includes(
    legacyAdapter,
    "buildLegacyRecords",
    "The adapter must support existing report records."
);

includes(
    legacyAdapter,
    "buildLegacyPdfPayload",
    "The adapter must support the existing PDF payload."
);

includes(
    legacyAdapter,
    ".ReportMapper",
    "The adapter must delegate to the existing report mapper."
);

/* ==========================================================
   Truthful analysis sequence
========================================================== */

const analysisSequence =
    read(
        "js/assessment-v3/analysis-sequence.js"
    );

includes(
    analysisSequence,
    "DEFAULT_ANALYSIS_STAGES",
    "The analysis sequence must define its stages."
);

includes(
    analysisSequence,
    "normalizeCallbacks",
    "The analysis sequence must validate real callbacks."
);

includes(
    analysisSequence,
    "await callbacks[",
    "Each stage must await its real callback."
);

includes(
    analysisSequence,
    "onStageComplete",
    "The sequence must expose genuine stage completion."
);

includes(
    analysisSequence,
    "prefers-reduced-motion: reduce",
    "The sequence must respect reduced-motion preferences."
);

matches(
    analysisSequence,
    /\?\s*"cancelled"\s*:\s*"failed"/,
    "The sequence must distinguish cancelled and failed states."
);

/* ==========================================================
   Isolated styling
========================================================== */

const complianceDnaCss =
    read(
        "css/19-compliance-dna.css"
    );

includes(
    complianceDnaCss,
    "body.compliance-dna-page",
    "Compliance DNA styling must remain page-scoped."
);

includes(
    complianceDnaCss,
    ".dna-act-list",
    "The Five-Act navigation must have dedicated styling."
);

includes(
    complianceDnaCss,
    ".dna-progress__value",
    "The progress indicator must have dedicated styling."
);

includes(
    complianceDnaCss,
    "@media (prefers-reduced-motion: reduce)",
    "Compliance DNA styling must support reduced motion."
);

console.log(
    "GrowWithHR Compliance DNA M1 contract checks passed."
);
