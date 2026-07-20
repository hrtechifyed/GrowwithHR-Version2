"use strict";

/**
 * GrowWithHR
 * Compliance DNA M1 Contract Checks
 *
 * Verifies that:
 * - the stable v2 route remains protected;
 * - the private-beta v3 route is isolated;
 * - all M1 foundation files exist;
 * - the feature flag remains disabled by default;
 * - narrative data contains exactly five ordered acts;
 * - compatibility and truthful-analysis contracts remain present.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root =
    path.resolve(__dirname, "..");

function resolvePath(relativePath) {
    return path.join(
        root,
        relativePath
    );
}

function exists(relativePath) {
    return fs.existsSync(
        resolvePath(relativePath)
    );
}

function read(relativePath) {
    const absolutePath =
        resolvePath(relativePath);

    assert(
        fs.existsSync(absolutePath),
        `Required M1 file is missing: ${relativePath}`
    );

    return fs.readFileSync(
        absolutePath,
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
            `${relativePath} must contain valid JSON: ${error.message}`
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

/* ==========================================================
   Required M1 files
========================================================== */

const requiredFiles = [
    "analyze-company-v3.html",
    "css/19-compliance-dna.css",
    "data/assessment/narrative-copy.json",
    "js/config/app-config.js",
    "js/assessment-v3/story-engine.js",
    "js/assessment-v3/bootstrap.js",
    "js/assessment-v3/legacy-adapter.js",
    "js/assessment-v3/analysis-sequence.js"
];

for (const file of requiredFiles) {
    assert(
        exists(file),
        `Required M1 file is missing: ${file}`
    );
}

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
    "The stable route must retain its current assessment controller."
);

includes(
    stableAssessment,
    'href="css/17-advisory-briefing.css"',
    "The stable route must retain its current assessment stylesheet."
);

excludes(
    stableAssessment,
    "assessment-v3/bootstrap.js",
    "The stable v2 route must not load the v3 bootstrap."
);

excludes(
    stableAssessment,
    "19-compliance-dna.css",
    "The stable v2 route must not load the v3 stylesheet."
);

/* ==========================================================
   Private-beta v3 route
========================================================== */

const v3Assessment =
    read("analyze-company-v3.html");

includes(
    v3Assessment,
    'class="compliance-dna-page"',
    "The v3 route must use the isolated Compliance DNA page class."
);

includes(
    v3Assessment,
    'content="noindex, nofollow"',
    "The private-beta route must remain excluded from search indexing."
);

includes(
    v3Assessment,
    'href="css/19-compliance-dna.css"',
    "The v3 route must load the Compliance DNA stylesheet."
);

includes(
    v3Assessment,
    'src="js/assessment-v3/bootstrap.js"',
    "The v3 route must load the Compliance DNA bootstrap."
);

includes(
    v3Assessment,
    'href="analyze-company.html"',
    "The v3 route must provide a stable-assessment fallback."
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
    "The v3 route must contain its primary journey action."
);

const actButtonMatches =
    v3Assessment.match(
        /data-act-button="/g
    ) || [];

assert.strictEqual(
    actButtonMatches.length,
    5,
    "The v3 route must expose exactly five act buttons."
);

/* ==========================================================
   Feature flag and route configuration
========================================================== */

const appConfig =
    read("js/config/app-config.js");

includes(
    appConfig,
    'assessmentV2: "analyze-company.html"',
    "Application configuration must retain the stable v2 route."
);

includes(
    appConfig,
    'assessmentV3: "analyze-company-v3.html"',
    "Application configuration must define the private-beta v3 route."
);

includes(
    appConfig,
    "complianceDnaV3: false",
    "Compliance DNA v3 must remain disabled by default during M1."
);

includes(
    appConfig,
    '"complianceDnaV3"',
    "The assessment-route resolver must use the Compliance DNA feature flag."
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

const actualActIds =
    narrative.acts.map(
        (act) => act.id
    );

assert.deepStrictEqual(
    actualActIds,
    expectedActIds,
    "Narrative acts must retain the approved Five-Act order."
);

const uniqueActIds =
    new Set(actualActIds);

assert.strictEqual(
    uniqueActIds.size,
    5,
    "Every narrative act must have a unique id."
);

narrative.acts.forEach(
    (act, index) => {
        assert.strictEqual(
            act.number,
            index + 1,
            `Narrative act ${index + 1} must use the correct number.`
        );

        assert(
            typeof act.label === "string" &&
                act.label.trim(),
            `Narrative act ${index + 1} requires a label.`
        );

        assert(
            typeof act.title === "string" &&
                act.title.trim(),
            `Narrative act ${index + 1} requires a title.`
        );

        assert(
            typeof act.description === "string" &&
                act.description.trim(),
            `Narrative act ${index + 1} requires a description.`
        );
    }
);

/* ==========================================================
   Story engine
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
    "The story engine must export its engine factory."
);

includes(
    storyEngine,
    "function setAct",
    "The story engine must support direct act navigation."
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

for (const actId of expectedActIds) {
    includes(
        storyEngine,
        `id: "${actId}"`,
        `The story engine must retain the "${actId}" act.`
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
    "The bootstrap must use the Five-Act story engine."
);

includes(
    bootstrap,
    '"data/assessment/narrative-copy.json"',
    "The bootstrap must load the narrative configuration."
);

includes(
    bootstrap,
    "await loadNarrative()",
    "The narrative configuration must be loaded before rendering."
);

includes(
    bootstrap,
    'const STABLE_ASSESSMENT_ROUTE =',
    "The bootstrap must retain a stable fallback route."
);

includes(
    bootstrap,
    '"analyze-company.html"',
    "The bootstrap fallback must point to the stable assessment."
);

includes(
    bootstrap,
    "window.GrowWithHRComplianceDna",
    "The bootstrap must expose private-beta diagnostics."
);

/* ==========================================================
   Legacy compatibility adapter
========================================================== */

const legacyAdapter =
    read(
        "js/assessment-v3/legacy-adapter.js"
    );

includes(
    legacyAdapter,
    '"growwithhr-advisory-briefing-v2"',
    "The adapter must preserve the protected v2 progress key."
);

includes(
    legacyAdapter,
    '"growwithhr-report"',
    "The adapter must preserve the existing report key."
);

includes(
    legacyAdapter,
    '"growwithhr-lead"',
    "The adapter must preserve the existing lead key."
);

includes(
    legacyAdapter,
    '"growwithhr-advisory-delivery-v1"',
    "The adapter must preserve the existing delivery key."
);

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
    "The adapter must delegate report mapping to the existing mapper."
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
    "The analysis module must define real processing stages."
);

includes(
    analysisSequence,
    "typeof callback",
    "Every displayed analysis stage must require a callback."
);

includes(
    analysisSequence,
    "await callbacks[",
    "A stage must wait for its real callback to complete."
);

includes(
    analysisSequence,
    "onStageComplete",
    "The sequence must expose genuine stage completion."
);

includes(
    analysisSequence,
    "prefers-reduced-motion: reduce",
    "The analysis sequence must respect reduced-motion preferences."
);

includes(
    analysisSequence,
    'status:\n                    "failed"',
    "The analysis sequence must expose a failed state."
);

/* ==========================================================
   Isolated v3 styling
========================================================== */

const complianceDnaCss =
    read(
        "css/19-compliance-dna.css"
    );

includes(
    complianceDnaCss,
    "body.compliance-dna-page",
    "Compliance DNA styling must remain scoped to its page."
);

includes(
    complianceDnaCss,
    ".dna-act-list",
    "The Five-Act navigation must have dedicated styling."
);

includes(
    complianceDnaCss,
    ".dna-progress__value",
    "The Five-Act progress indicator must have dedicated styling."
);

includes(
    complianceDnaCss,
    "@media (prefers-reduced-motion: reduce)",
    "Compliance DNA styling must support reduced motion."
);

console.log(
    "GrowWithHR Compliance DNA M1 contract checks passed."
);
