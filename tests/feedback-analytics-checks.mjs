import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const analytics = read("js/product-analytics.js");
const feedback = read("js/report-feedback.js");
const shell = read("js/site-shell.js");
const server = read("server.js");
const privacy = read("more-info.html");

assert.match(analytics, /const UMAMI_WEBSITE_ID = "e41d89b2-f9b4-441d-9018-d15e14c7bbd8";/, "Configured GrowWithHR website ID must match the owner-supplied Umami ID.");
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

// Simulate the configured tracker without actually sending data to Umami.
// Verify the script configuration, allowlisted event properties, and URL sanitization.
const listeners = {};
const injected = [];
const sent = [];
const fakeDocument = {
  addEventListener(name, callback) { listeners[name] = callback; },
  createElement(tag) {
    return {
      tag,
      dataset: {},
      handlers: {},
      addEventListener(name, handler) { this.handlers[name] = handler; }
    };
  },
  head: { appendChild(node) { injected.push(node); } }
};
const fakeWindow = {
  umami: {
    track(buildPayload) {
      sent.push(buildPayload({
        website: "e41d89b2-f9b4-441d-9018-d15e14c7bbd8",
        url: "/GrowwithHR-Version2/index.html?secret=private",
        referrer: "https://example.org/source?token=private"
      }));
    }
  }
};
const fakeLocation = {
  origin: "https://hrtechifyed.github.io",
  hostname: "hrtechifyed.github.io",
  pathname: "/GrowwithHR-Version2/index.html"
};
vm.runInNewContext(analytics, {
  window: fakeWindow,
  document: fakeDocument,
  location: fakeLocation,
  URL,
  Set
}, { filename: "js/product-analytics.js" });
assert.equal(fakeWindow.GrowWithHRAnalytics.configured, true);
assert.equal(injected.length, 1, "Umami should load only on the official site.");
const tracker = injected[0];
assert.equal(tracker.src, "https://cloud.umami.is/script.js");
assert.equal(tracker.dataset.websiteId, "e41d89b2-f9b4-441d-9018-d15e14c7bbd8");
assert.equal(tracker.dataset.domains, "hrtechifyed.github.io");
assert.equal(tracker.dataset.excludeSearch, "true");
assert.equal(tracker.dataset.excludeHash, "true");
assert.equal(tracker.dataset.doNotTrack, "true");
assert.equal(tracker.dataset.beforeSend, "growwithhrAnalyticsBeforeSend");
const sanitized = fakeWindow.growwithhrAnalyticsBeforeSend("event", {
  url: "/GrowwithHR-Version2/index.html?secret=private#recover",
  referrer: "https://example.org/source?token=private#fragment",
  name: "assessment_started",
  data: { product: "organization" }
});
assert.equal(sanitized.url, "/GrowwithHR-Version2/index.html");
assert.equal(sanitized.referrer, "https://example.org/source");
assert.equal(fakeWindow.GrowWithHRAnalytics.track("assessment_started", "organization"), true);
assert.equal(fakeWindow.GrowWithHRAnalytics.track("assessment_started", "customer-email@example.com"), false);
assert.equal(fakeWindow.GrowWithHRAnalytics.track("companyName", "organization"), false);
assert.equal(fakeWindow.GrowWithHRAnalytics.track("feedback_submitted", "compliance", {
  rating: "partly", company: "Sensitive Company", comment: "Do not share"
}), true);
assert.equal(sent.length, 0, "Events are buffered until the tracking script loads.");
tracker.handlers.load();
assert.equal(sent.length, 2, "Only approved events should be sent.");
assert.equal(sent[0].name, "assessment_started");
assert.equal(sent[0].url, "/GrowwithHR-Version2/index.html");
assert.deepEqual(JSON.parse(JSON.stringify(sent[0].data)), { product: "organization" });
assert.deepEqual(JSON.parse(JSON.stringify(sent[1].data)), { product: "compliance", rating: "partly" });
assert.ok(!JSON.stringify(sent).includes("Sensitive Company"));
assert.ok(!JSON.stringify(sent).includes("customer-email@example.com"));

console.log("Privacy-first analytics and report feedback checks passed.");
