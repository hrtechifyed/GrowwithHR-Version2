import { getUser, latestAssessment, listCompanies } from "./auth-client.js";

let selectedCompany = null;
let observer = null;

function applyAvailableFields() {
  if (!selectedCompany) return;
  const profile = selectedCompany.profile || {};
  const mappings = {
    companyName: selectedCompany.name,
    industry: selectedCompany.industry,
    employees: profile.currentEmployees,
    totalEmployees: profile.currentEmployees,
    locations: profile.operatingLocations
  };
  Object.entries(mappings).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (!field || value === undefined || value === null || value === "" || field.value) return;
    field.value = String(value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function boot() {
  const startButton = document.getElementById("startAssessmentButton");
  const entryCard = document.querySelector(".advisory-entry-card");
  if (!startButton || !entryCard) return;
  try {
    const user = await getUser();
    if (!user) return;
    const inProgress = await latestAssessment("compliance").catch(() => null);
    if (inProgress) return;
    const companies = await listCompanies();
    const company = companies[0];
    if (!company) return;

    const prompt = document.createElement("div");
    prompt.className = "prototype-card";
    prompt.style.margin = "18px 0";
    prompt.innerHTML = `
      <h3>Reuse saved company information?</h3>
      <p>We found <strong></strong> in My GrowWithHR. Reuse only the basic company facts you previously saved; you will still review the Compliance questions before analysis.</p>
      <div class="prototype-actions">
        <button class="prototype-btn secondary" type="button" data-compliance-reuse>Reuse saved company facts</button>
        <button class="prototype-btn secondary" type="button" data-compliance-skip>Use different company information</button>
      </div>`;
    prompt.querySelector("strong").textContent = company.name;
    const actionRow = entryCard.querySelector(".advisory-entry__actions");
    if (actionRow) actionRow.insertAdjacentElement("beforebegin", prompt);
    else entryCard.appendChild(prompt);

    prompt.querySelector("[data-compliance-reuse]").addEventListener("click", () => {
      selectedCompany = company;
      prompt.innerHTML = `<h3>Saved company facts selected</h3><p>GrowWithHR will prefill basic information for <strong></strong> where the Compliance assessment asks for it. Review each answer before continuing.</p>`;
      prompt.querySelector("strong").textContent = company.name;
    });
    prompt.querySelector("[data-compliance-skip]").addEventListener("click", () => prompt.remove());

    startButton.addEventListener("click", () => {
      if (!selectedCompany) return;
      window.setTimeout(applyAvailableFields, 0);
      window.setTimeout(applyAvailableFields, 120);
      observer = new MutationObserver(() => applyAvailableFields());
      const shell = document.getElementById("assessmentShell");
      if (shell) observer.observe(shell, { childList: true, subtree: true });
    });
  } catch (_error) {
    // Reuse is optional and must never block a fresh assessment.
  }
}

boot();
