/* GrowWithHR law intelligence runtime loader */
(function loadGrowWithHRLawTransparency(window, document) {
    "use strict";

    const PRESENTATION_VERSION =
        window.GrowWithHRPDF?.version ||
        "3.3.0-justified-dual-theme";
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;

    /*
     * Lightweight test and fallback constructors may not expose jsPDF.API.
     * The law renderer treats the API object as an optional patch target, so
     * provide an empty object rather than failing document generation.
     */
    if (JsPDF && !JsPDF.API) {
        try {
            Object.defineProperty(JsPDF, "API", {
                configurable: true,
                writable: true,
                value: {}
            });
        } catch (_error) {
            try {
                JsPDF.API = {};
            } catch (_ignored) {}
        }
    }

    async function waitForFounderRuntime() {
        for (let attempt = 0; attempt < 120; attempt += 1) {
            if (window.GrowWithHRReportRuntimeBootstrap?.ready) return;
            await new Promise((resolve) => window.setTimeout(resolve, 25));
        }
    }

    const ready = (async () => {
        await import("./pdf-law-transparency-core.js");

        const service = window.GrowWithHRPDF;
        if (service?.lawTransparencyIntegrated) {
            const lawTransparencyVersion = service.version;
            const stableService = Object.freeze({
                ...service,
                version: PRESENTATION_VERSION,
                lawTransparencyVersion
            });
            window.GrowWithHRPDF = stableService;
            window.GrowWithHRPDFPolishReady =
                Promise.resolve(stableService);
        }

        await import("./report-runtime-bootstrap.js");
        await waitForFounderRuntime();

        const finalService = window.GrowWithHRPDF;
        window.GrowWithHRPDFPolishReady =
            Promise.resolve(finalService);
        return finalService;
    })().catch((error) => {
        console.error(
            "GrowWithHR law intelligence runtime could not load.",
            error
        );
        throw error;
    });

    window.GrowWithHRLawTransparencyReady = ready;
    window.GrowWithHRPDFPolishReady = ready;
})(window, document);
