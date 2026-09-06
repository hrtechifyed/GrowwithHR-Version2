(() => {
  "use strict";

  const api = window.GrowWithHRCompanyWorkspace;
  if (!api || api.workforceCapabilityHorizonSafe === true) return;

  const SESSION_KEY = "growwithhr.workspace";

  function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function previousTwelveMonthValue() {
    try {
      const workspace = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      return workspace?.companyData?.workforce?.expectedEmployees12Months ?? null;
    } catch (_error) {
      return null;
    }
  }

  function normalizePayload(payload = {}) {
    if (String(payload.completedEngine || "").trim() !== "workforce-capability") return payload;

    const horizonMonths = numberOrNull(document.getElementById("wcpHorizonMonths")?.value);
    const horizonEmployees = numberOrNull(document.getElementById("wcpExpectedEmployees")?.value);
    const companyData = payload.companyData && typeof payload.companyData === "object"
      ? structuredClone(payload.companyData)
      : {};

    companyData.workforce = companyData.workforce && typeof companyData.workforce === "object"
      ? companyData.workforce
      : {};
    companyData.workforceCapability = companyData.workforceCapability && typeof companyData.workforceCapability === "object"
      ? companyData.workforceCapability
      : {};

    companyData.workforceCapability.planningHorizonMonths = horizonMonths;
    companyData.workforceCapability.planningHorizonEmployees = horizonEmployees;

    if (horizonMonths === 12) {
      companyData.workforce.expectedEmployees12Months = horizonEmployees;
    } else {
      const previous = previousTwelveMonthValue();
      if (previous !== null) companyData.workforce.expectedEmployees12Months = previous;
      else delete companyData.workforce.expectedEmployees12Months;
    }

    return { ...payload, companyData };
  }

  const wrapped = Object.freeze({
    ...api,
    workforceCapabilityHorizonSafe: true,
    create: (payload) => api.create(normalizePayload(payload)),
    complete: (payload) => api.complete(normalizePayload(payload))
  });

  window.GrowWithHRCompanyWorkspace = wrapped;
})();
