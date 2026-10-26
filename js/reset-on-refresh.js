(() => {
    "use strict";

    // This script runs before each assessment's initialization scripts.
    // Never clear a completed report, saved workspace or authentication/consent.
    const scope = String(document.body?.dataset?.refreshResetScope || "").trim();
    if (!["organization", "compliance"].includes(scope)) return;

    const ORGANIZATION_DRAFT_PREFIX = "growwithhr.organization.draft.v1";
    const COMPLIANCE_DRAFT_KEY = "growwithhr-advisory-briefing-v2";
    const WORKSPACE_SESSION_KEY = "growwithhr.workspace";
    const PAGE_RESET_KEY = "growwithhr.start-fresh.page-reset";

    function store() {
        try { return window.localStorage; } catch (_error) { return null; }
    }

    function organizationDraftKey() {
        try {
            const workspace = JSON.parse(window.sessionStorage.getItem(WORKSPACE_SESSION_KEY) || "null");
            return workspace?.reportId
                ? ORGANIZATION_DRAFT_PREFIX + ":" + workspace.reportId
                : ORGANIZATION_DRAFT_PREFIX + ":local";
        } catch (_error) {
            return ORGANIZATION_DRAFT_PREFIX + ":local";
        }
    }

    function readDraft() {
        const storage = store();
        if (!storage) return null;
        const key = scope === "organization" ? organizationDraftKey() : COMPLIANCE_DRAFT_KEY;
        try {
            const raw = storage.getItem(key);
            if (!raw) return null;
            const value = JSON.parse(raw);
            if (!value || typeof value !== "object" || Array.isArray(value)) return null;
            if (scope === "organization") {
                if (value.version !== 1 || !value.values || typeof value.values !== "object") return null;
                if (!Object.keys(value.values).length) return null;
            } else if (!value.started || value.completed) {
                // Completed assessments are not unfinished drafts.
                return null;
            }
            return { key, value };
        } catch (_error) {
            return null;
        }
    }

    function clearDraft(draft) {
        const storage = store();
        if (!storage || !draft) return false;
        try {
            if (scope === "compliance") {
                // The legacy assessment snapshot also contains marketingConsent;
                // preserve it while discarding only the unfinished draft state.
                const consent = draft.value?.lead?.marketingConsent === true;
                if (consent) {
                    storage.setItem(draft.key, JSON.stringify({
                        started: false,
                        completed: false,
                        currentMoment: 0,
                        answers: {},
                        lead: { marketingConsent: true }
                    }));
                } else {
                    storage.removeItem(draft.key);
                }
            } else {
                storage.removeItem(draft.key);
            }
            return true;
        } catch (_error) {
            return false;
        }
    }

    // No prompt without a persisted, unfinished assessment draft.
    const draft = readDraft();
    if (draft) {
        const startFresh = window.confirm(
            "Start a new assessment?\n\n" +
            "Yes — clear your unsaved answers for this assessment and start fresh.\n" +
            "No — keep your answers and continue.\n\n" +
            "Completed reports, saved workspaces, sign-in and reminder preferences will not be deleted."
        );
        if (startFresh) clearDraft(draft);
    }

    // Compatibility API for existing callers: deliberately draft-scoped.
    window.GrowWithHRRefreshReset = Object.freeze({
        scope,
        clearPageData: () => clearDraft(readDraft()),
        markClean: () => {},
        markDirty: () => {}
    });
})();
