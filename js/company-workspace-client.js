(() => {
    "use strict";

    const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
    const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
    const RENDER_BASE = "https://growwithhr.onrender.com";
    const SESSION_KEY = "growwithhr.workspace";
    const PREVIOUS_SNAPSHOT_KEY = "growwithhr.workspace.previous";

    function cleanText(value, fallback = "") {
        return String(value ?? "").trim() || fallback;
    }

    function isGitHubPages() {
        const location = window.location;
        return Boolean(
            location &&
            location.origin === GITHUB_PAGES_ORIGIN &&
            (location.pathname === "/GrowwithHR-Version2" || location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH))
        );
    }

    function endpoint(path) {
        const explicit = cleanText(window.GROWWITHHR_WORKSPACE_API_BASE || document.body?.dataset?.workspaceApiBase);
        const base = explicit || (isGitHubPages() ? RENDER_BASE : "");
        return `${base}${path}`;
    }

    async function post(path, payload) {
        const response = await fetch(endpoint(path), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload || {}),
            credentials: "omit"
        });
        let body = {};
        try { body = await response.json(); } catch (_error) {}
        if (!response.ok || body.ok === false) {
            throw new Error(cleanText(body.error, "GrowWithHR could not complete this Company Workspace request."));
        }
        return body;
    }

    function readCurrentSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
        catch (_error) { return null; }
    }

    function preservePreviousSnapshot() {
        try {
            const current = readCurrentSession();
            if (!current?.companyData) return;
            sessionStorage.setItem(PREVIOUS_SNAPSHOT_KEY, JSON.stringify({
                reportId: current.reportId || "",
                companyName: current.companyName || "",
                capturedAt: new Date().toISOString(),
                companyData: current.companyData
            }));
        } catch (_error) {}
    }

    async function create(payload) {
        try { sessionStorage.removeItem(PREVIOUS_SNAPSHOT_KEY); } catch (_error) {}
        return post("/api/company-workspace/create", payload);
    }

    async function complete(payload) {
        preservePreviousSnapshot();
        return post("/api/company-workspace/complete", payload);
    }

    const api = Object.freeze({
        create,
        recover: (reportId, accessKey) => post("/api/company-workspace/recover", { reportId, accessKey }),
        complete,
        erase: (reportId, accessKey) => post("/api/company-workspace/delete", { reportId, accessKey }),
        createHandoff: (reportId, accessKey, target = "organization-structure") =>
            post("/api/company-workspace/handoff/create", { reportId, accessKey, target }),
        redeemHandoff: (token) => post("/api/company-workspace/handoff/redeem", { token }),
        previousSnapshotKey: PREVIOUS_SNAPSHOT_KEY
    });

    window.GrowWithHRCompanyWorkspace = api;
})();