"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(
        path.join(root, relativePath),
        "utf8"
    );
}

function includes(source, expected, message) {
    assert(
        source.includes(expected),
        message || `Expected to find: ${expected}`
    );
}

function ordered(source, milestones, label) {
    let previousPosition = -1;

    for (const milestone of milestones) {
        const position = source.indexOf(milestone);

        assert(
            position >= 0,
            `${label}: missing ${milestone}`
        );

        assert(
            position > previousPosition,
            `${label}: ${milestone} is out of order`
        );

        previousPosition = position;
    }
}

const home = read("index.html");
const hub = read("intelligence-hub.html");
const siteShell = read("js/site-shell.js");
const analyze = read("analyze-company.html");

const definitions = read(
    "js/executive-assessment/assessment-definition.js"
);

const controller = read(
    "js/executive-assessment.js"
);

const storage = read(
    "js/executive-assessment/assessment-storage.js"
);

const reportMapper = read(
    "js/executive-assessment/report-mapper.js"
);

const delivery = read(
    "js/executive-assessment/advisory-delivery.js"
);

/* ==========================================================
   Homepage entry journey
========================================================== */

includes(
    home,
    'id="home"',
    "The homepage hero must remain available."
);

includes(
    home,
    'href="intelligence-hub.html"',
    "The homepage must route Company Insights through the intelligence hub."
);

includes(
    home,
    "Understand My Company",
    "The approved homepage Company Insights CTA must remain visible."
);

includes(
    hub,
    'href="analyze-company.html?engine=compliance"',
    "The Company Insights hub must retain the stable Compliance assessment route."
);

includes(
    hub,
    'href="organization-intelligence.html"',
    "The Company Insights hub must retain the Organization Structure assessment route."
);

includes(
    home,
    'src="js/site-shell.js"',
    "The homepage must load the shared site shell."
);

includes(
    home,
    'data-testid="home-executive-stack"',
    "The homepage executive-intelligence preview is required."
);

/* ==========================================================
   Shared responsive navigation
========================================================== */

includes(
    siteShell,
    'class="site-nav-toggle"',
    "The shared mobile-navigation toggle is required."
);

includes(
    siteShell,
    'aria-expanded="false"',
    "Navigation must begin in a collapsed state."
);

includes(
    siteShell,
    'aria-controls="siteNavLinks"',
    "The navigation toggle must identify its controlled menu."
);

includes(
    siteShell,
    'nav.classList.add("is-open")',
    "The mobile navigation must support opening."
);

includes(
    siteShell,
    'nav.classList.remove("is-open")',
    "The mobile navigation must support closing."
);

includes(
    siteShell,
    'toggle.setAttribute("aria-expanded", "true")',
    "Opening navigation must update its accessible state."
);

includes(
    siteShell,
    'toggle.setAttribute("aria-expanded", "false")',
    "Closing navigation must update its accessible state."
);

includes(
    siteShell,
    'event.key === "Escape"',
    "The navigation must close with the Escape key."
);

includes(
    siteShell,
    'document.body.classList.toggle("site-nav-open", locked)',
    "Opening mobile navigation must control page scrolling."
);

/* ==========================================================
   Stable assessment journey
========================================================== */

ordered(
    analyze,
    [
        'id="landingScreen"',
        'id="conversationWorkspace"',
        'id="reviewScreen"',
        'id="contactScreen"',
        'id="loadingScreen"',
        'id="successScreen"'
    ],
    "Assessment journey"
);

includes(
    analyze,
    'id="startAssessment"',
    "The journey must provide a start action."
);

includes(
    analyze,
    'id="resumeAssessmentButton"',
    "The journey must support resuming progress."
);

includes(
    analyze,
    'id="startAgainButton"',
    "The journey must support starting again."
);

includes(
    analyze,
    'id="storyForm"',
    "The guided organisation-story form is required."
);

includes(
    analyze,
    'id="storyContainer"',
    "The dynamic story-moment container is required."
);

includes(
    analyze,
    'id="backButton"',
    "The journey must support backward navigation."
);

includes(
    analyze,
    'id="nextButton"',
    "The journey must support forward navigation."
);

includes(
    analyze,
    'id="reviewContainer"',
    "The completed organisation story must be reviewable."
);

includes(
    analyze,
    'data-edit-screen="0"',
    "The review must allow answers to be edited."
);

includes(
    analyze,
    'id="leadCaptureForm"',
    "Lead details must be collected before delivery."
);

includes(
    analyze,
    'id="leadName"',
    "The lead name field is required."
);

includes(
    analyze,
    'id="leadEmail"',
    "The lead email field is required."
);

includes(
    analyze,
    'id="marketingConsent"',
    "Optional marketing consent must remain separate."
);

/* ==========================================================
   Journey configuration
========================================================== */

includes(
    analyze,
    '"chapters": 4',
    "The current assessment must retain four chapters."
);

includes(
    analyze,
    '"storyMoments": 7',
    "The current assessment must retain seven story moments."
);

includes(
    definitions,
    'const STATE_SCHEMA_VERSION = 1',
    "The current saved-state schema version must remain explicit."
);

includes(
    definitions,
    '"growwithhr-advisory-briefing-v2"',
    "The existing assessment storage key must be preserved."
);

includes(
    definitions,
    '"executive-advisory-report.html"',
    "The default advisory report route must remain defined."
);

/* ==========================================================
   State and saved progress
========================================================== */

includes(
    controller,
    "Storage.readAssessment();",
    "The assessment must restore saved progress."
);

includes(
    controller,
    "State.createDefaultState();",
    "The assessment must support a clean first visit."
);

includes(
    controller,
    "this.bindEvents();",
    "Journey interactions must be bound."
);

includes(
    controller,
    "this.initialiseView();",
    "The correct initial journey view must be selected."
);

includes(
    storage,
    "window.localStorage.getItem",
    "Saved assessment progress must remain readable."
);

includes(
    storage,
    "window.localStorage.setItem",
    "Assessment progress must remain writable."
);

includes(
    storage,
    "window.localStorage.removeItem",
    "Users must be able to clear or restart saved progress."
);

/* ==========================================================
   Report mapping
========================================================== */

includes(
    reportMapper,
    '"Executive Advisory Briefing v2"',
    "Generated reports must retain their current source identifier."
);

includes(
    reportMapper,
    '"Executive Advisory Briefing"',
    "Generated leads must retain their current source identifier."
);

includes(
    reportMapper,
    "normaliseNumber",
    "Report mapping must normalise workforce and location numbers."
);

includes(
    reportMapper,
    "remoteReportValue",
    "Remote-work answers must remain mapped into report data."
);

/* ==========================================================
   PDF and email-delivery journey
========================================================== */

includes(
    analyze,
    'id="generateReportButton"',
    "The journey must provide a report-generation action."
);

includes(
    analyze,
    'id="generationSteps"',
    "Report generation must expose progress."
);

includes(
    analyze,
    'id="downloadReportButton"',
    "The completed advisory must remain downloadable."
);

includes(
    analyze,
    'id="emailAgainButton"',
    "The completed advisory must support email redelivery."
);

includes(
    delivery,
    "window.GrowWithHRPDF",
    "Delivery must use the shared PDF service."
);

includes(
    delivery,
    "window.GrowWithHREmail",
    "Delivery must use the shared email service."
);

includes(
    delivery,
    '"organise-context"',
    "Delivery must retain its context-organisation stage."
);

includes(
    delivery,
    '"build-document"',
    "Delivery must retain its document-generation stage."
);

includes(
    delivery,
    '"send-advisory"',
    "Delivery must retain its email-delivery stage."
);

includes(
    delivery,
    '"resend-customer"',
    "Customer email redelivery must remain available."
);

/* ==========================================================
   Required module order
========================================================== */

ordered(
    analyze,
    [
        'src="js/executive-assessment/assessment-definition.js"',
        'src="js/executive-assessment/assessment-storage.js"',
        'src="js/executive-assessment/report-mapper.js"',
        'src="js/executive-assessment/advisory-delivery.js"',
        'src="js/executive-assessment.js"'
    ],
    "Assessment module loading"
);

console.log(
    "Assessment journey checks passed."
);
