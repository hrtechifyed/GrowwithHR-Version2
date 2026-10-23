(() => {
  "use strict";
  const status = document.querySelector("#reminderPreferenceStatus");
  const button = document.querySelector("#stopReminderButton");
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const token = params.get("token") || "";
  // Do not leave the unsubscribe credential in browser-visible URL history.
  history.replaceState(null, "", location.pathname + location.search);
  if (!/^[a-zA-Z0-9_-]{40,90}$/.test(token)) {
    status.textContent = "This reminder-management link is invalid or has expired.";
    return;
  }
  button.disabled = false;
  status.textContent = "Confirm below to stop your optional compliance review reminders.";
  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Updating your preferences…";
    const base = location.hostname === "hrtechifyed.github.io" ? "https://growwithhr.onrender.com" : "";
    try {
      const response = await fetch(base + "/api/company-workspace/review-reminders/unsubscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "omit", body: JSON.stringify({ token })
      });
      if (!response.ok) throw new Error("The server could not confirm your choice.");
      status.textContent = "Your optional compliance review reminders have been turned off.";
      button.hidden = true;
    } catch (_error) {
      status.textContent = "We could not update your preferences. Please try again.";
      button.disabled = false;
    }
  });
})();
