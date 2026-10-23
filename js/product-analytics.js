/* GrowWithHR privacy-first analytics. Set UMAMI_WEBSITE_ID after creating
 * a website in Umami Cloud. Until configured, the product keeps working
 * without any third-party tracking request. Never pass user input here.
 */
(() => {
  "use strict";
  const UMAMI_WEBSITE_ID = ""; // Paste the public Umami Website ID here to activate tracking.
  const EVENT_NAMES = new Set([
    "assessment_started", "assessment_completed", "report_viewed",
    "full_report_requested", "feedback_submitted", "return_visit"
  ]);
  const PRODUCTS = new Set(["organization", "compliance"]);
  const queue = [];
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const siteDomain = location.hostname === "hrtechifyed.github.io";
  let ready = false;
  const once = new Set();

  function beforeSend(type, input) {
    if (!input || typeof input !== "object") return false;
    const data = { ...input };
    // Redirect and one-time workspace handoff values can appear in query strings.
    // Only path-level destinations may leave GrowWithHR.
    try { data.url = new URL(String(data.url || location.pathname), location.origin).pathname; }
    catch (_error) { data.url = location.pathname; }
    if (data.referrer) {
      try {
        const referrer = new URL(String(data.referrer));
        data.referrer = referrer.origin + referrer.pathname;
      } catch (_error) { delete data.referrer; }
    }
    // Custom properties are compiled in track(), not copied from arbitrary objects.
    return data;
  }

  function flush() {
    if (!ready || !window.umami?.track) return;
    while (queue.length) {
      const event = queue.shift();
      try {
        window.umami.track((props) => ({
          ...props,
          url: location.pathname,
          name: event.name,
          data: { product: event.product, ...(event.rating ? { rating: event.rating } : {}) }
        }));
      } catch (_error) { /* analytics must never block the product */ }
    }
  }

  function track(name, product, details = {}) {
    if (!EVENT_NAMES.has(name) || !PRODUCTS.has(product)) return false;
    const rating = name === "feedback_submitted" &&
      ["yes", "partly", "no"].includes(details?.rating) ? details.rating : "";
    queue.push({ name, product, rating });
    if (queue.length > 40) queue.shift();
    flush();
    return true;
  }

  function trackOnce(name, product) {
    const key = name + ":" + product;
    if (once.has(key)) return;
    once.add(key);
    track(name, product);
  }

  window.GrowWithHRAnalytics = Object.freeze({ track, trackOnce, configured: uuid.test(UMAMI_WEBSITE_ID) && siteDomain });
  document.addEventListener("focusin", (event) => {
    if (event.target?.closest?.("#organizationForm")) trackOnce("assessment_started", "organization");
  }, true);
  document.addEventListener("submit", (event) => {
    if (event.target?.id === "organizationForm") trackOnce("assessment_started", "organization");
  }, true);
  document.addEventListener("click", (event) => {
    const target = event.target?.closest?.("button, a");
    if (!target) return;
    if (target.matches("#startAssessment")) trackOnce("assessment_started", "compliance");
    if (target.matches("#resumeAssessmentButton")) {
      trackOnce("return_visit", "compliance");
      trackOnce("assessment_started", "compliance");
    }
    if (target.matches("#orgEmailFullReport")) track("full_report_requested", "organization");
    if (target.matches("#emailFullReportButton")) track("full_report_requested", "compliance");
  }, true);

  if (!siteDomain || !uuid.test(UMAMI_WEBSITE_ID)) return;
  window.growwithhrAnalyticsBeforeSend = beforeSend;
  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://cloud.umami.is/script.js";
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.domains = "hrtechifyed.github.io";
  script.dataset.excludeSearch = "true";
  script.dataset.excludeHash = "true";
  script.dataset.doNotTrack = "true";
  script.dataset.beforeSend = "growwithhrAnalyticsBeforeSend";
  script.addEventListener("load", () => { ready = true; flush(); }, { once: true });
  script.addEventListener("error", () => { queue.length = 0; }, { once: true });
  document.head.appendChild(script);
})();
