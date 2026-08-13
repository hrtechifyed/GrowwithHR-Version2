(() => {
    "use strict";

    const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
    const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
    const RENDER_BASE = "https://growwithhr.onrender.com";

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
            body: JSON.stringify(payload || {})
        });
        let body = {};
        try { body = await response.json(); } catch (_error) {}
        if (!response.ok || body.ok === false) {
            throw new Error(cleanText(body.error, "GrowWithHR could not complete this Company Workspace request."));
        }
        return body;
    }

    const api = Object.freeze({
        create: (payload) => post("/api/company-workspace/create", payload),
        recover: (reportId, accessKey) => post("/api/company-workspace/recover", { reportId, accessKey }),
        complete: (payload) => post("/api/company-workspace/complete", payload),
        erase: (reportId, accessKey) => post("/api/company-workspace/delete", { reportId, accessKey })
    });

    window.GrowWithHRCompanyWorkspace = api;
})();
