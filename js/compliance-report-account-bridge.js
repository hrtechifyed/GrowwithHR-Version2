const REPORT_STORAGE_KEY = "growwithhr-report";

function writeReport(value) {
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch (_error) {
    return false;
  }
}

export async function bootstrapComplianceReportAccountBridge() {
  const params = new URLSearchParams(location.search);
  if (params.get("sample") === "1") return;
  const reportId = params.get("report");
  if (!reportId || params.get("accountLoaded") === "1") return;

  try {
    const auth = await import("./auth-client.js");
    const user = await auth.getUser();
    if (!user) return;
    const report = await auth.getReport(reportId);
    const legacyReport = report?.payload?.legacyReport;
    if (!legacyReport) return;
    if (!writeReport(legacyReport)) throw new Error("Browser report cache was unavailable.");
    params.set("accountLoaded", "1");
    location.replace(`${location.pathname}?${params.toString()}${location.hash}`);
  } catch (error) {
    console.warn("GrowWithHR account-linked Compliance report could not be restored.", error);
  }
}

bootstrapComplianceReportAccountBridge();
