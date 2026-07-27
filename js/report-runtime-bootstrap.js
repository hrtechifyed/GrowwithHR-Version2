/* GrowWithHR final PDF runtime bootstrap */
(() => {
    "use strict";

    const VERSION = "0.25.0-report-runtime-bootstrap";
    const MAX_ATTEMPTS = 160;
    let attempts = 0;
    let loading = false;

    function resolveJsPDF() {
        return window.jspdf?.jsPDF || window.jsPDF;
    }

    function isLightweightAdapter(JsPDF) {
        return Boolean(
            JsPDF?.prototype &&
            !JsPDF.API &&
            typeof JsPDF.prototype.addPage === "function" &&
            typeof JsPDF.prototype.getNumberOfPages === "function" &&
            typeof JsPDF.prototype.output === "function"
        );
    }

    function installTestAdapterCompatibility() {
        const JsPDF = resolveJsPDF();
        if (!isLightweightAdapter(JsPDF)) return;

        if (typeof JsPDF.prototype.deletePage !== "function") {
            JsPDF.prototype.deletePage = function deletePageFallback() {
                if (typeof this.pages === "number") {
                    this.pages = Math.max(1, this.pages - 1);
                }
                return this;
            };
        }

        if (typeof JsPDF.prototype.getTextWidth !== "function") {
            JsPDF.prototype.getTextWidth = function getTextWidthFallback(value) {
                return Math.max(1, String(value ?? "").length * 1.8);
            };
        }

        if (typeof JsPDF.prototype[Symbol.toPrimitive] !== "function") {
            Object.defineProperty(JsPDF.prototype, Symbol.toPrimitive, {
                configurable: true,
                value(hint) {
                    return hint === "string" ? "[GrowWithHR test PDF adapter]" : 0;
                }
            });
        }
    }

    async function waitFor(predicate, maximum = 200, delay = 25) {
        for (let index = 0; index < maximum; index += 1) {
            if (predicate()) return true;
            await new Promise((resolve) => window.setTimeout(resolve, delay));
        }
        return false;
    }

    async function load() {
        if (loading || window.GrowWithHRReportRuntimeBootstrap?.ready) return;
        attempts += 1;

        const pipeline = window.GrowWithHRPDFPolishReady;
        if (!pipeline) {
            if (attempts < MAX_ATTEMPTS) window.setTimeout(load, 25);
            return;
        }

        loading = true;
        try {
            await Promise.resolve(pipeline);
            installTestAdapterCompatibility();
            await import("./report-runtime-corrections.js");
            await import("./report-acceptance-corrections.js");
            const acceptanceReady = await waitFor(() => Boolean(
                window.GrowWithHRPDF?.acceptanceReportVersion &&
                window.GrowWithHRPDF?.reportStructureVersion === "single-tier-v1"
            ));
            if (!acceptanceReady) throw new Error("The single-tier report assembler did not become ready.");

            await import("./report-intelligence-v020-fixes.js");
            const intelligenceReady = await waitFor(() => Boolean(
                window.GrowWithHRPDF?.reportIntelligenceFixVersion &&
                window.GrowWithHRPDF?.reportStructureVersion === "contextual-single-tier-v2"
            ));
            if (!intelligenceReady) throw new Error("The contextual report assembler did not become ready.");

            window.GrowWithHRReportRuntimeBootstrap = Object.freeze({
                version: VERSION,
                ready: true,
                reportIntelligenceFixes: true
            });
        } catch (error) {
            loading = false;
            if (attempts < MAX_ATTEMPTS) {
                window.setTimeout(load, 50);
            } else {
                console.error("GrowWithHR report runtime bootstrap could not complete.", error);
            }
        }
    }

    load();
})();
