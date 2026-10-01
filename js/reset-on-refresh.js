(() => {
    "use strict";

    const body = document.body;
    const scope = String(body?.dataset?.refreshResetScope || "").trim();

    if (!scope) return;

    const KEYS = Object.freeze({
        organization: Object.freeze({
            session: [
                "growwithhr.workspace",
                "growwithhr.workspace.previous",
                "growwithhr.organization.report"
            ],
            local: []
        }),
        compliance: Object.freeze({
            session: [],
            local: [
                "growwithhr-advisory-briefing-v2",
                "growwithhr-report",
                "growwithhr-lead",
                "growwithhr-advisory-delivery-v1"
            ]
        })
    });

    const keys = KEYS[scope];
    if (!keys) return;

    function remove(storage, names) {
        names.forEach((name) => {
            try { storage.removeItem(name); }
            catch (_error) {}
        });
    }

    function hasStoredData() {
        const has = (storage, names) =>
            names.some((name) => {
                try { return storage.getItem(name) !== null; }
                catch (_error) { return false; }
            });

        return (
            has(window.sessionStorage, keys.session) ||
            has(window.localStorage, keys.local)
        );
    }

    function isReloadNavigation() {
        try {
            const entry =
                performance.getEntriesByType("navigation")[0];

            if (entry?.type) {
                return entry.type === "reload";
            }

            return (
                performance.navigation?.type ===
                performance.navigation?.TYPE_RELOAD
            );
        } catch (_error) {
            return false;
        }
    }

    function removeHandoffFromUrl() {
        if (scope !== "organization") return;

        try {
            const url = new URL(window.location.href);
            if (!url.searchParams.has("handoff")) return;
            url.searchParams.delete("handoff");
            history.replaceState(
                null,
                "",
                url.pathname +
                    (url.searchParams.toString()
                        ? "?" + url.searchParams.toString()
                        : "") +
                    url.hash
            );
        } catch (_error) {}
    }

    function clearPageData() {
        remove(window.sessionStorage, keys.session);
        remove(window.localStorage, keys.local);
        removeHandoffFromUrl();
    }

    const reloaded = isReloadNavigation();

    if (reloaded) {
        clearPageData();
    }

    let dirty = !reloaded && hasStoredData();

    function markDirty(event) {
        const target = event?.target;
        if (
            target &&
            target.closest &&
            target.closest("form")
        ) {
            dirty = true;
        }
    }

    document.addEventListener(
        "input",
        markDirty,
        true
    );

    document.addEventListener(
        "change",
        markDirty,
        true
    );

    window.addEventListener(
        "beforeunload",
        (event) => {
            if (!dirty) return;

            event.preventDefault();
            event.returnValue = "";
        }
    );

    window.GrowWithHRRefreshReset =
        Object.freeze({
            scope,
            clearPageData,
            markClean: () => {
                dirty = false;
            },
            markDirty: () => {
                dirty = true;
            }
        });
})();
