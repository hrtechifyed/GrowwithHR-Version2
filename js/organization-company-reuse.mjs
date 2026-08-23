import { getUser, latestAssessment, listCompanies } from "./auth-client.js";

function applySavedCompany(company) {
  const form = document.getElementById("organizationGrowthForm");
  if (!form || !company) return;
  const profile = company.profile || {};
  const mappings = {
    companyName: company.name,
    industry: company.industry,
    growthStage: profile.growthStage,
    businessModel: profile.businessModel,
    employees: profile.currentEmployees,
    locations: profile.operatingLocations,
    productsCount: profile.productsCount
  };
  Object.entries(mappings).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field || value === undefined || value === null || value === "") return;
    field.value = String(value);
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function boot() {
  const intro = document.getElementById("engineIntro");
  const actions = document.getElementById("introSignedInActions");
  if (!intro || !actions) return;
  try {
    const user = await getUser();
    if (!user) return;
    const inProgress = await latestAssessment("organization-growth").catch(() => null);
    if (inProgress) return;
    const companies = await listCompanies();
    const company = companies[0];
    if (!company) return;

    const card = document.createElement("div");
    card.className = "prototype-card";
    card.id = "savedCompanyReusePrompt";
    card.style.marginTop = "18px";
    card.innerHTML = `
      <h3>Reuse saved company information?</h3>
      <p>We found <strong></strong> in My GrowWithHR. You can reuse the basic company facts and review every answer before analysis. Nothing is reused silently.</p>
      <div class="prototype-actions">
        <button class="prototype-btn secondary" type="button" data-reuse-company>Reuse saved company facts</button>
        <button class="prototype-btn secondary" type="button" data-skip-company>Start with different company information</button>
      </div>`;
    card.querySelector("strong").textContent = company.name;
    actions.insertAdjacentElement("beforebegin", card);

    card.querySelector("[data-reuse-company]").addEventListener("click", () => {
      applySavedCompany(company);
      card.innerHTML = `<h3>Saved company facts ready to reuse</h3><p>Basic information for <strong></strong> has been prefilled. Review and update it during the assessment before GrowWithHR uses it.</p>`;
      card.querySelector("strong").textContent = company.name;
    });
    card.querySelector("[data-skip-company]").addEventListener("click", () => card.remove());
  } catch (_error) {
    // Reuse is optional; a failure should never block starting a fresh assessment.
  }
}

boot();
