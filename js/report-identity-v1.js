/* GrowWithHR unique report identity allocator */
(() => {
    "use strict";

    const VERSION = "1.1.0-report-lineage";
    const LOCAL_ENDPOINT = "/api/report-id";
    const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
    const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
    const RENDER_ENDPOINT = "https://growwithhr.onrender.com/api/report-id";
    let activeAllocation = null;

    function clean(value, fallback = "") { return String(value ?? "").trim() || fallback; }

    function isGitHubPagesDeployment() {
        const location = window.location;
        if (!location || location.origin !== GITHUB_PAGES_ORIGIN) return false;
        return location.pathname === "/GrowwithHR-Version2" || location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH);
    }

    function endpoint() {
        const explicit = clean(document.body?.dataset?.reportIdEndpoint || window.GROWWITHHR_REPORT_ID_ENDPOINT);
        if (explicit) return explicit;
        return isGitHubPagesDeployment() ? RENDER_ENDPOINT : LOCAL_ENDPOINT;
    }

    function randomRequestKey() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const random = Math.random().toString(36).slice(2);
        return `report-${Date.now()}-${random}`;
    }

    function mergeSource(payload = {}) { return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}); }

    async function readJson(response) { try { return await response.json(); } catch (_error) { return {}; } }

    async function allocate(payload = {}) {
        if (clean(payload.reportId)) {
            return {
                reportId: clean(payload.reportId),
                previousReportId: clean(payload.previousReportId || payload.report?.previousReportId),
                generatedAt: clean(payload.generatedAt, new Date().toISOString()),
                replayed: true
            };
        }
        if (activeAllocation) return activeAllocation;

        const source = mergeSource(payload);
        const requestKey = clean(payload.reportRequestKey || payload.requestKey, randomRequestKey());
        const previousReportId = clean(payload.previousReportId || source.previousReportId);
        activeAllocation = (async () => {
            const response = await window.fetch(endpoint(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "omit",
                cache: "no-store",
                body: JSON.stringify({
                    requestKey,
                    userKey: clean(source.userId || source.email || source.recipientEmail),
                    companyKey: clean(source.companyId || source.companyName),
                    companyName: clean(source.companyName),
                    assessmentId: clean(source.assessmentId || source.assessmentKey),
                    previousReportId
                })
            });
            const result = await readJson(response);
            if (!response.ok || !clean(result.reportId)) throw new Error(result.error || "GrowWithHR could not reserve a unique report ID.");
            return Object.freeze({
                reportId: clean(result.reportId),
                previousReportId: clean(result.previousReportId, previousReportId),
                suffix: clean(result.suffix),
                generatedAt: clean(result.generatedAt, new Date().toISOString()),
                requestKey,
                replayed: Boolean(result.replayed),
                durableStorageConfigured: Boolean(result.durableStorageConfigured),
                persistenceRequirement: clean(result.persistenceRequirement)
            });
        })().finally(() => { activeAllocation = null; });
        return activeAllocation;
    }

    window.GrowWithHRReportIdentity = Object.freeze({ version: VERSION, endpoint: endpoint(), allocate });
})();
