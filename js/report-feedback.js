/* Short, optional feedback under personalized report summaries.
 * Only product, rating and a short optional comment are submitted.
 */
(() => {
  "use strict";
  if (window.GrowWithHRReportFeedback) return;
  const path = location.pathname;
  const product = path.endsWith("/organization-structure-report.html") ? "organization"
    : path.endsWith("/compliance-intelligence.html") || path.endsWith("/analyze-company.html") ? "compliance"
    : "";
  if (!product) return;
  const endpoint = location.origin === "https://hrtechifyed.github.io"
    ? "https://growwithhr.onrender.com/api/report-feedback" : "/api/report-feedback";
  let observer = null;

  function mount() {
    if (document.getElementById("gwhReportFeedback")) return true;
    const result = product === "organization"
      ? document.querySelector("#screen-overview .gwh-report-glimpse")
      : document.querySelector("#personalReportGlimpse");
    if (!result) return false;
    const section = document.createElement("section");
    section.id = "gwhReportFeedback";
    section.className = "gwh-report-feedback";
    section.setAttribute("aria-label", "Optional product feedback");
    section.innerHTML = `<h3>Did this assessment help you?</h3>
      <p>Your feedback helps improve GrowWithHR. No payment or subscription is needed.</p>
      <form id="gwhReportFeedbackForm">
        <fieldset><legend>How useful was this assessment?</legend>
          <div class="gwh-feedback-options">
            <label><input type="radio" name="rating" value="yes" required> Yes</label>
            <label><input type="radio" name="rating" value="partly"> Partly</label>
            <label><input type="radio" name="rating" value="no"> Not yet</label>
          </div>
        </fieldset>
        <label for="gwhFeedbackComment">What could be better? (optional)</label>
        <textarea id="gwhFeedbackComment" name="comment" maxlength="400" rows="2"
          placeholder="Clarity, recommendations, missing context…"></textarea>
        <p class="gwh-feedback-privacy">Please do not include names, email addresses or sensitive employee or company information.</p>
        <div class="gwh-feedback-honeypot" aria-hidden="true"><label for="gwhFeedbackWebsite">Website</label>
          <input id="gwhFeedbackWebsite" name="website" type="text" autocomplete="off" tabindex="-1"></div>
        <button type="submit">Share feedback</button>
        <p role="status" id="gwhFeedbackStatus" aria-live="polite"></p>
      </form>`;
    result.insertAdjacentElement("afterend", section);
    const form = section.querySelector("form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const rating = String(data.get("rating") || "");
      if (!["yes", "partly", "no"].includes(rating)) return;
      const comment = String(data.get("comment") || "").trim().slice(0, 400);
      const button = form.querySelector('button[type="submit"]');
      const status = section.querySelector("#gwhFeedbackStatus");
      button.disabled = true;
      status.textContent = "Sending feedback…";
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "omit",
          body: JSON.stringify({
            product, rating, comment,
            website: String(data.get("website") || "")
          })
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.ok !== true) throw new Error(body.error || "Could not send feedback.");
        form.reset();
        form.hidden = true;
        const thanks = document.createElement("p");
        thanks.setAttribute("role", "status");
        thanks.textContent = "Thank you. Your feedback has been shared with HRTechify.";
        section.appendChild(thanks);
        window.GrowWithHRAnalytics?.track("feedback_submitted", product, { rating });
      } catch (_error) {
        status.textContent = "Feedback could not be sent. Please try again or contact HRTechify.";
      } finally { button.disabled = false; }
    });
    window.GrowWithHRAnalytics?.trackOnce("report_viewed", product);
    return true;
  }

  function bootstrap() {
    if (mount()) return;
    observer = new MutationObserver(() => {
      if (mount()) observer?.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  window.GrowWithHRReportFeedback = Object.freeze({ mount, product });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  else bootstrap();
})();
