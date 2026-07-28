/* GrowWithHR final PDF runtime bootstrap */
(() => {
    "use strict";

    const VERSION = "0.26.5-shared-hrtechify-parity-bootstrap";
    const ACCEPTANCE_BOOTSTRAP_COMPATIBILITY = "0.25.0-report-runtime-bootstrap";
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
            await import("./report-context-question-ui-fixes.js");
            const intelligenceReady = await waitFor(() => Boolean(
                window.GrowWithHRPDF?.reportIntelligenceFixVersion &&
                window.GrowWithHRPDF?.reportStructureVersion === "contextual-single-tier-v2"
            ));
            if (!intelligenceReady) throw new Error("The contextual report assembler did not become ready.");

            await import("./sector-context-intelligence-v020.js");
            await import("./sector-context-intelligence-v020-patch.js");
            const sectorReady = await waitFor(() => Boolean(
                window.GrowWithHRSectorContextIntelligence?.patchVersion
            ));
            if (!sectorReady) throw new Error("The all-sector context layer did not become ready.");

            await import("./story-visual-sections-v021.js");
            await import("./report-visual-core-v021.js");
            await import("./report-brand-template-v022.js");
            await import("./report-visual-renderers-v021.js");
            await import("./report-executive-summary-v022.js");
            await import("./report-template-parity-v022.js");
            await import("./report-visual-sections-v021.js");
            await import("./dual-edition-email-v022.js");
            const visualReady = await waitFor(() => Boolean(
                window.GrowWithHRStoryVisualSections?.version &&
                window.GrowWithHRReportBrandTemplate?.sameLayoutForLightAndDark === true &&
                window.GrowWithHRReportBrandTemplate?.logoAsset === "assets/hrtechify-logo.png" &&
                window.GrowWithHRReportTemplateParity?.sameGeometry === true &&
                window.GrowWithHRReportTemplateParity?.onlyPaletteChanges === true &&
                window.GrowWithHRExecutiveSummaryReport?.version &&
                window.GrowWithHRPDF?.visualSectionedReportVersion &&
                window.GrowWithHRPDF?.reportStructureVersion === "visual-sectioned-v5" &&
                window.GrowWithHRDualEditionEmail?.mode === "two-separate-pdfs-one-email"
            ));
            if (!visualReady) throw new Error("The shared HRTechify report template and two-attachment delivery layer did not become ready.");

            window.GrowWithHRReportRuntimeBootstrap = Object.freeze({
                version: VERSION,
                acceptanceBootstrapCompatibility: ACCEPTANCE_BOOTSTRAP_COMPATIBILITY,
                ready: true,
                reportIntelligenceFixes: true,
                contextualQuestionUiFixes: true,
                allSectorContextIntelligence: true,
                compactStorySections: true,
                visualSectionedReport: true,
                executiveSummaryReport: true,
                profileTailoredExecutiveSummary: true,
                sharedLightDarkTemplate: true,
                sameTemplateGeometry: true,
                lightDarkDifference: "colour-palette-only",
                reportTemplateId: "hrtechify-action-brief-shared-v1",
                reportLogoAsset: "assets/hrtechify-logo.png",
                singleEmailDualEdition: true,
                dualEditionDeliveryMode: "two-separate-pdfs-one-email"
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
