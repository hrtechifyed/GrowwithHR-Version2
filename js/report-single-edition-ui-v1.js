/* GrowWithHR single-edition report UI guard */
(() => {
    "use strict";

    const VERSION = "1.0.0-single-edition-ui";
    const SELECTORS = [
        "[data-report-theme-choice]",
        ".advisory-report-theme-choice",
        "fieldset:has(input[name='advisoryReportTheme'])",
        "fieldset:has(input[name='reportTheme'])"
    ];

    function forceStandardPreference() {
        try { window.localStorage?.setItem("growwithhr-report-theme", "light"); } catch (_error) {}
    }

    function removeThemeSelectors() {
        SELECTORS.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((element) => element.remove());
            } catch (_error) {}
        });
        document.querySelectorAll("input[name='advisoryReportTheme'], input[name='reportTheme']").forEach((input) => {
            const fieldset = input.closest("fieldset");
            if (fieldset) fieldset.remove();
            else input.remove();
        });
        forceStandardPreference();
    }

    removeThemeSelectors();
    document.addEventListener("DOMContentLoaded", removeThemeSelectors, { once: true });

    if (document.documentElement && typeof MutationObserver === "function") {
        let scheduled = false;
        const observer = new MutationObserver(() => {
            if (scheduled) return;
            scheduled = true;
            queueMicrotask(() => {
                scheduled = false;
                removeThemeSelectors();
            });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.setTimeout(() => observer.disconnect(), 15000);
    }

    window.GrowWithHRSingleEditionReportUI = Object.freeze({
        version: VERSION,
        reportStyle: "standard",
        darkOptionVisible: false,
        removeThemeSelectors
    });
})();
