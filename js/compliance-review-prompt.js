/* Optional, consent-first reminders shown only after HR Compliance Readiness completion. */
export function render(host, workspace) {
    if (!host || !workspace?.reportId || !workspace?.accessKey ||
        workspace.lastComplianceReportId !== workspace.reportId) return;
    const api = window.GrowWithHRCompanyWorkspace;
    if (!api?.enrollReviewReminder) return;

    let section = document.getElementById("gwhComplianceReviewReminders");
    if (section?.dataset.reportId === workspace.reportId) return;
    section?.remove();
    section = document.createElement("section");
    section.id = "gwhComplianceReviewReminders";
    section.className = "gwh-review-optin";
    section.dataset.reportId = workspace.reportId;
    section.innerHTML = `
        <h3>Would you like reminders based on your latest HR Compliance Readiness assessment?</h3>
        <p>Get a reminder to review relevant compliance areas, confirm missing information and reassess when your business changes. These are <strong>review reminders, not statutory deadline alerts.</strong></p>
        <div class="gwh-review-choice">
          <button type="button" data-action="no">No, thanks</button>
          <button type="button" data-action="yes">Yes, set up reminders</button>
        </div>
        <form class="gwh-review-confirm" hidden>
          <p><strong>Review before enabling</strong></p>
          <label>Work email (must be verified)</label>
          <p data-email></p>
          <label for="gwhReviewCadence">Remind me</label>
          <select id="gwhReviewCadence" name="cadence">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <p class="gwh-review-notice">Requires sign-in with the same work email used for this report. No reminders are sent until you select Start reminders.</p>
          <button type="submit">Start reminders</button>
          <button type="button" data-action="back">Back</button>
        </form>
        <div class="gwh-review-active" hidden>
          <p data-summary></p>
          <button type="button" data-action="pause">Pause reminders</button>
          <button type="button" data-action="resume" hidden>Resume reminders</button>
          <button type="button" data-action="stop">Turn off reminders</button>
        </div>
        <p class="gwh-review-status" role="status" aria-live="polite"></p>`;
    host.insertAdjacentElement("afterend", section);
    section.querySelector("[data-email]").textContent = workspace.email || "";
    const choices = section.querySelector(".gwh-review-choice");
    const form = section.querySelector(".gwh-review-confirm");
    const active = section.querySelector(".gwh-review-active");
    const status = section.querySelector(".gwh-review-status");
    const summary = section.querySelector("[data-summary]");
    const pause = section.querySelector('[data-action="pause"]');
    const resume = section.querySelector('[data-action="resume"]');
    const stop = section.querySelector('[data-action="stop"]');
    const dismissKey = "gwh.review.dismiss." + workspace.reportId;
    const credentials = { reportId: workspace.reportId, accessKey: workspace.accessKey };
    let busy = false;

    function setStatus(message, error = false) {
        status.textContent = message || "";
        status.classList.toggle("is-error", error);
    }
    function showChoice() {
        choices.hidden = false;
        form.hidden = true;
        active.hidden = true;
    }
    function showSubscribed(result) {
        const isPaused = result.status === "paused";
        choices.hidden = true;
        form.hidden = true;
        active.hidden = false;
        pause.hidden = isPaused;
        resume.hidden = !isPaused;
        const next = result.nextReviewAt ? new Intl.DateTimeFormat("en-IN", {
            day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata"
        }).format(new Date(result.nextReviewAt)) : "not scheduled";
        summary.textContent = isPaused
            ? "Your review reminders are paused. You can resume or turn them off."
            : (result.cadence === "quarterly" ? "Quarterly" : "Monthly") + " review reminders are enabled. Next review: " + next + ".";
    }
    const enable = () => {
        form.hidden = false;
        choices.hidden = true;
        active.hidden = true;
        setStatus("");
    };
    function offerReconsider() {
        if (section.querySelector('[data-review-reconsider]')) return;
        const reconsider = document.createElement("button");
        reconsider.type = "button";
        reconsider.dataset.reviewReconsider = "";
        reconsider.textContent = "Set up reminders";
        reconsider.addEventListener("click", () => {
            reconsider.remove();
            sessionStorage.removeItem(dismissKey);
            showChoice();
            setStatus("");
        });
        status.insertAdjacentElement("afterend", reconsider);
    }
    choices.querySelector('[data-action="no"]').addEventListener("click", () => {
        // Skipping is not consent: no backend request.
        sessionStorage.setItem(dismissKey, "yes");
        choices.hidden = true;
        form.hidden = true;
        setStatus("No reminders scheduled. You can enable them from this assessment later.");
        offerReconsider();
    });
    choices.querySelector('[data-action="yes"]').addEventListener("click", enable);
    section.querySelector('[data-action="back"]').addEventListener("click", showChoice);

    async function verifiedToken() {
        const auth = window.GrowWithHRCustomerAuth;
        if (!auth?.requireMatchingSession) throw new Error("Sign in via the full-report access panel before enabling reminders.");
        const session = await auth.requireMatchingSession(workspace.email);
        if (!session?.access_token) throw new Error("Your sign-in session is unavailable. Please sign in.");
        return session.access_token;
    }
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        setStatus("Confirming your reminder preferences…");
        try {
            const token = await verifiedToken();
            const payload = { ...credentials, email: workspace.email,
                cadence: form.elements.cadence.value, confirm: true };
            const result = await api.enrollReviewReminder(payload, token);
            showSubscribed(result);
            setStatus("Reminders enabled. You can pause or turn them off at any time.");
        } catch (error) {
            setStatus(error.message || "Could not enable reminders. No confirmation was recorded.", true);
        } finally {
            submit.disabled = false;
            busy = false;
        }
    });

    for (const button of [pause, resume, stop]) {
        button.addEventListener("click", async () => {
            if (busy) return;
            busy = true; button.disabled = true;
            setStatus("Updating your reminder preferences…");
            try {
                const token = await verifiedToken();
                const result = await api.manageReviewReminder({
                    ...credentials, action: button.dataset.action
                }, token);
                if (result.status === "revoked") {
                    showChoice();
                    setStatus("Reminders turned off. No future review reminders are scheduled.");
                } else {
                    showSubscribed(result);
                    setStatus(result.status === "paused" ? "Reminders paused." : "Reminders resumed.");
                }
            } catch (error) {
                setStatus(error.message || "Could not update reminder preferences.", true);
            } finally { button.disabled = false; busy = false; }
        });
    }

    if (sessionStorage.getItem(dismissKey) === "yes") {
        choices.hidden = true;
        setStatus("You have not opted in to compliance review reminders.");
        offerReconsider();
    }
    api.reviewReminderStatus(workspace.reportId, workspace.accessKey)
        .then(result => {
            if (["active", "paused"].includes(result.status)) {
                showSubscribed(result);
                setStatus("");
            }
        })
        .catch(() => {
            // Status is read-only. Failure never triggers scheduling or consent.
            setStatus("Reminder preferences could not be loaded. No changes were made.", true);
        });
}
