(() => {
  "use strict";

  const form = document.getElementById("betaRequestForm");
  if (!form) return;

  const submit = document.getElementById("betaSubmit");
  const status = document.getElementById("betaStatus");

  function endpoint() {
    return location.origin === "https://hrtechifyed.github.io"
      ? "https://growwithhr.onrender.com/api/beta-interest"
      : "/api/beta-interest";
  }

  function setStatus(message, state = "") {
    status.textContent = message;
    status.classList.toggle("is-success", state === "success");
    status.classList.toggle("is-error", state === "error");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      employees: String(data.get("employees") || "").trim(),
      role: String(data.get("role") || "").trim(),
      question: String(data.get("question") || "").trim(),
      website: String(data.get("website") || "").trim(),
      source: "founding-beta"
    };

    submit.disabled = true;
    setStatus("Sending your request…");

    try {
      const response = await fetch(endpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify(payload)
      });

      let body = {};
      try { body = await response.json(); } catch (_error) {}

      if (!response.ok || body.ok !== true) {
        throw new Error(body.error || "We could not send your request.");
      }

      form.reset();
      setStatus(
        "Request received. HRTechify will follow up about the Founding Beta.",
        "success"
      );
    } catch (error) {
      setStatus(
        error?.message ||
          "We could not send your request. You can email hrtechifyed@gmail.com instead.",
        "error"
      );
    } finally {
      submit.disabled = false;
    }
  });
})();
