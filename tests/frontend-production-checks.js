const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

const read = (file) =>
    fs.readFileSync(
        path.join(root, file),
        "utf8"
    );

const html = read("analyze-company.html");
const assessmentJs = read(
    "js/executive-assessment.js"
);
const storageJs = read(
    "js/executive-assessment/assessment-storage.js"
);
const advisoryCss = read(
    "css/17-advisory-briefing.css"
);

function assertIncludes(
    source,
    expected,
    message
) {
    assert(
        source.includes(expected),
        message || `Expected to find: ${expected}`
    );
}

function assertBefore(
    source,
    first,
    second,
    message
) {
    const firstPosition = source.indexOf(first);
    const secondPosition = source.indexOf(second);

    assert(
        firstPosition !== -1,
        `Expected to find: ${first}`
    );

    assert(
        secondPosition !== -1,
        `Expected to find: ${second}`
    );

    assert(
        firstPosition < secondPosition,
        message || `${first} must appear before ${second}`
    );
}

function count(source, expected) {
    return source.split(expected).length - 1;
}

/* ==========================================================
   Stable assessment route
========================================================== */

assertIncludes(
    html,
    'class="analyze-company-page"',
    "The assessment page must retain its scoped body class."
);

assertIncludes(
    html,
    'id="assessmentShell"',
    "The stable assessment shell is required."
);

assertIncludes(
    html,
    'data-testid="advisory-experience-stage"',
    "The advisory experience test hook is required."
);

assertIncludes(
    html,
    'id="landingScreen"',
    "The assessment entry screen is required."
);

assert.strictEqual(
    count(html, 'id="startAssessment"'),
    1,
    "The start assessment button must render exactly once."
);

assertIncludes(
    html,
    'id="resumeAssessmentButton"',
    "Resume assessment support is required."
);

assertIncludes(
    html,
    'id="startAgainButton"',
    "Start-again support is required."
);

/* ==========================================================
   Guided assessment journey
========================================================== */

assertIncludes(
    html,
    'id="conversationWorkspace"',
    "The guided assessment workspace is required."
);

assertIncludes(
    html,
    'id="storyForm"',
    "The assessment story form is required."
);

assertIncludes(
    html,
    'id="storyContainer"',
    "The dynamic story container is required."
);

assertIncludes(
    html,
    'id="chapterRail"',
    "The four-chapter progress rail is required."
);

assertIncludes(
    html,
    'id="progressTrack"',
    "The accessible progress indicator is required."
);

assertBefore(
    html,
    'id="landingScreen"',
    'id="conversationWorkspace"',
    "The entry screen must appear before the assessment workspace."
);

/* ==========================================================
   Review, contact and report generation
========================================================== */

assertIncludes(
    html,
    'id="reviewScreen"',
    "The organisation-story review screen is required."
);

assertIncludes(
    html,
    'id="reviewContainer"',
    "The review summary container is required."
);

assertIncludes(
    html,
    'id="contactScreen"',
    "The advisory contact screen is required."
);

assertIncludes(
    html,
    'id="leadCaptureForm"',
    "The lead-capture form is required."
);

assertIncludes(
    html,
    'id="loadingScreen"',
    "The report-generation state is required."
);

assertIncludes(
    html,
    'id="generationSteps"',
    "The report-generation progress list is required."
);

assertIncludes(
    html,
    'id="successScreen"',
    "The report completion screen is required."
);

assertIncludes(
    html,
    'id="downloadReportButton"',
    "PDF download must remain available."
);

assertIncludes(
    html,
    'id="emailAgainButton"',
    "Email redelivery must remain available."
);

assertBefore(
    html,
    'id="conversationWorkspace"',
    'id="reviewScreen"',
    "The assessment workspace must precede review."
);

assertBefore(
    html,
    'id="reviewScreen"',
    'id="contactScreen"',
    "Review must precede contact collection."
);

assertBefore(
    html,
    'id="contactScreen"',
    'id="loadingScreen"',
    "Contact collection must precede report generation."
);

assertBefore(
    html,
    'id="loadingScreen"',
    'id="successScreen"',
    "Generation must precede the success state."
);

/* ==========================================================
   Assessment configuration
========================================================== */

assertIncludes(
    html,
    'id="assessmentConfig"',
    "The embedded assessment configuration is required."
);

assertIncludes(
    html,
    '"chapters": 4',
    "The stable assessment must retain four chapters."
);

assertIncludes(
    html,
    '"storyMoments": 7',
    "The stable assessment must retain seven story moments."
);

/* ==========================================================
   Script contracts and loading order
========================================================== */

assertIncludes(
    html,
    'src="js/pdf.js"',
    "The existing PDF service must remain connected."
);

assertIncludes(
    html,
    'src="js/gmail-service.js"',
    "The existing Gmail delivery service must remain connected."
);

assertIncludes(
    html,
    'src="js/executive-assessment/assessment-storage.js"',
    "The assessment storage module must remain connected."
);

assertIncludes(
    html,
    'src="js/executive-assessment.js"',
    "The modular compatibility controller is required."
);

assertBefore(
    html,
    'src="js/pdf.js"',
    'src="js/executive-assessment.js"',
    "PDF support must load before the assessment controller."
);

assertBefore(
    html,
    'src="js/executive-assessment/assessment-definition.js"',
    'src="js/executive-assessment.js"',
    "Assessment modules must load before the controller."
);

/* ==========================================================
   Controller and saved-progress contracts
========================================================== */

assertIncludes(
    assessmentJs,
    "Storage.readAssessment();",
    "The controller must restore saved progress."
);

assertIncludes(
    assessmentJs,
    "State.createDefaultState();",
    "The controller must support a clean initial state."
);

assertIncludes(
    assessmentJs,
    "this.bindEvents();",
    "Assessment interactions must be connected."
);

assertIncludes(
    assessmentJs,
    "this.initialiseView();",
    "The initial view must be prepared."
);

assertIncludes(
    storageJs,
    '"growwithhr-advisory-briefing-v2"',
    "The current browser-storage key must remain compatible."
);

assertIncludes(
    storageJs,
    "window.localStorage.getItem",
    "Saved progress must be readable."
);

assertIncludes(
    storageJs,
    "window.localStorage.setItem",
    "Assessment progress must remain saveable."
);

/* ==========================================================
   Accessibility and responsive safeguards
========================================================== */

assertIncludes(
    advisoryCss,
    "body.analyze-company-page",
    "Assessment styling must remain page scoped."
);

assertIncludes(
    advisoryCss,
    "min-height: 100dvh",
    "Dynamic viewport height support is required."
);

assertIncludes(
    advisoryCss,
    "overflow-x: clip",
    "The assessment must prevent horizontal overflow."
);

assertIncludes(
    advisoryCss,
    ":focus-visible",
    "Visible keyboard focus styling is required."
);

assertIncludes(
    advisoryCss,
    "[hidden]",
    "Hidden assessment states must remain safely concealed."
);

assert(
    /@media\s*\(/.test(advisoryCss),
    "Responsive assessment breakpoints are required."
);

/* ==========================================================
   Obsolete intro route must not be required
========================================================== */

assert(
    !html.includes('src="js/intro-sequence.js"'),
    "The current stable route must not depend on the obsolete intro sequence."
);

console.log(
    "Frontend production checks passed."
);
