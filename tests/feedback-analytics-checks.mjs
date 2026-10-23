import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const analytics = read("js/product-analytics.js");
const feedback = read("js/report-feedback.js");
const shell = read("js/site-shell.js");
const server = read("server.js");
const privacy = read("more-info.html");

assert.match(analytics, /const UMAMI_WEBSITE_ID = "";/, "Analytics stays off until the owner supplies a real Website ID.");
assert.match(analytics, /data|dataset\.excludeSearch/);
assert.match(analytics, /dataset\.excludeHash = "true"/);
assert.match(analytics, /dataset\.doNotTrack = "true"/);
assert.match(analytics, /new URL\(String\(data\.url/);
assert.match(analytics, /data\.referrer = referrer\.origin \+ referrer\.pathname/);
for (const event of ["assessment_started", "assessment_completed", "report_viewed", "full_report_requested", "feedback_submitted", "return_visit"]) {
  assert.ok(analytics.includes(event), "Missing event " + event);
}
assert.match(shell, /js\/product-analytics\.js/);
assert.match(shell, /js\/report-feedback\.js/);
assert.match(shell, /css\/39-report-feedback\.css/);
assert.match(feedback, /"\/api\/report-feedback"/);
assert.match(feedback, /gwhReportFeedbackForm/);
assert.match(feedback, /\["yes", "partly", "no"\]/);
assert.match(feedback, /maxlength="400"/);
assert.match(feedback, /if \(!response\.ok \|\| body\.ok !== true\)/);
assert.match(feedback, /GrowWithHRAnalytics\?\.track\("feedback_submitted"/);
assert.match(server, /app\.post\("\/api\/report-feedback"/);
assert.match(server, /reportFeedbackLimiter/);
assert.match(server, /comment\.length > 400/);
assert.match(server, /sendGmailApiMessage/);
assert.match(privacy, /Usage analytics and report feedback/);

// Execute the tracker without an ID, proving nothing is injected or reported.
// Approved event types are queued internally for a later configured tracker,
// while arbitrary objects and event names cannot enter the telemetry pipeline.
const listeners = {};
const injected = [];
const fakeDocument = {
  addEventListener(name, callback) { listeners[name] = callback; },
  createElement(tag) { return { tag, dataset: {}, addEventListener() {} }; },
  head: { appendChild(node) { injected.push(node); } }
};
const fakeWindow = {};
const fakeLocation = { origin: "https://hrtechifyed.github.io", hostname: "hrtechifyed.github.io", pathname: "/GrowwithHR-Version2/index.html" };
vm.runInNewContext(analytics, {
  window: fakeWindow,
  document: fakeDocument,
  location: fakeLocation,
  URL,
  Set
}, { filename: "js/product-analytics.js" });
assert.equal(fakeWindow.GrowWithHRAnalytics.configured, false);
assert.equal(injected.length, 0, "No Umami script should load until Website ID is configured.");
assert.equal(fakeWindow.GrowWithHRAnalytics.track("assessment_started", "organization"), true);
assert.equal(fakeWindow.GrowWithHRAnalytics.track("assessment_started", "customer-email@example.com"), false);
assert.equal(fakeWindow.GrowWithHRAnalytics.track("companyName", "organization"), false);

console.log("Privacy-first analytics and report feedback checks passed.");
