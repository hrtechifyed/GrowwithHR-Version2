/* GrowWithHR founder report snapshot navigation */
(() => {
    "use strict";

    const VERSION = "1.0.0-report-snapshot-navigation";
    const STORAGE_KEY = "growwithhr-report";
    const MAX_ATTEMPTS = 100;
    const POLL_MS = 50;

    function readReportId() {
        try {
            const saved = JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || "{}");
            return String(saved?.reportId || "").trim();
        } catch (_error) {
            return "";
        }
    }

    function refreshWhenSnapshotChanges(previousReportId) {
        let attempt = 0;
        const timer = window.setInterval(() => {
            attempt += 1;
            const nextReportId = readReportId();
            if (nextReportId && nextReportId !== previousReportId) {
                window.clearInterval(timer);
                window.location.reload();
                return;
            }
            if (attempt >= MAX_ATTEMPTS) window.clearInterval(timer);
        }, POLL_MS);
    }

    document.addEventListener("click", (event) => {
        const button = event.target?.closest?.("#generateRevisedReport");
        if (!button) return;
        refreshWhenSnapshotChanges(readReportId());
    });

    window.GrowWithHRFounderReportSnapshotNavigation = Object.freeze({
        version: VERSION,
        storageKey: STORAGE_KEY
    });
})();
