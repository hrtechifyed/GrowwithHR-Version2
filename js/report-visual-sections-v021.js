/* GrowWithHR v0.22 visual, section-led advisory report installer */
(() => {
    "use strict";

    const INSTALL_FLAG = "__growwithhrVisualSectionedReportInstalled";
    const STRUCTURE_VERSION = "visual-sectioned-v5";

    async function install() {
        const core = window.GrowWithHRVisualReportCore;
        const renderers = window.GrowWithHRVisualReportRenderers;
        const service = window.GrowWithHRPDF;
        const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
        if (!core || !renderers || !service || !JsPDF || service[INSTALL_FLAG]) return false;
        if (typeof service.buildAdvisoryModel !== "function" || typeof service.buildReportLawTransparency !== "function") return false;

        const buildModel = service.buildAdvisoryModel.bind(service);
        const buildRows = service.buildReportLawTransparency.bind(service);
        const logo = await core.loadLogo();

        async function buildAdvisoryPdf(payload = {}) {
            const model = buildModel(payload);
            const rows = core.values(buildRows(payload, model));
            const themes = core.selectedThemes(payload);
            const data = core.mergeSource(payload, model);
            const trace = { changes: core.values(payload.inputChanges || payload.trace?.changes) };
            const pdfs = themes.map((theme) => renderers.buildVariant(JsPDF, theme, rows, model, payload, trace, logo));
            const deliveryPdf = themes.length === 2 && typeof renderers.buildBundleVariant === "function"
                ? renderers.buildBundleVariant(JsPDF, themes, rows, model, payload, trace, logo)
                : pdfs[0];
            return {
                ...deliveryPdf,
                pdfs,
                pageCounts: Object.fromEntries(pdfs.map((item) => [item.theme, item.pageCount])),
                totalSizeBytes: pdfs.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0),
                deliverySizeBytes: Number(deliveryPdf?.sizeBytes || 0),
                generatedAt: new Date().toISOString(),
                companyName: core.clean(data.companyName, "Your Organisation"),
                selectedThemes: themes,
                dualThemeDelivery: themes.length === 2,
                oneEmailDelivery: themes.length === 2,
                bundledThemes: themes.length === 2 ? themes : [],
                reportLayoutVersion: core.VERSION,
                reportStructureVersion: STRUCTURE_VERSION,
                readingSections: [
                    "Table of Contents",
                    "Executive summary",
                    "At a glance",
                    "What to do now",
                    "Complete the picture",
                    "Your 90-day plan",
                    "Watch as you grow",
                    "The profile used",
                    "End of Report"
                ]
            };
        }

        const enhanced = Object.freeze({
            ...service,
            [INSTALL_FLAG]: true,
            visualSectionedReportVersion: core.VERSION,
            reportLayoutVersion: core.VERSION,
            reportStructureVersion: STRUCTURE_VERSION,
            buildAdvisoryPdf
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        window.GrowWithHRVisualSectionedReport = Object.freeze({
            version: core.VERSION,
            structureVersion: STRUCTURE_VERSION,
            installed: true,
            selectedThemes: core.selectedThemes,
            compact: core.compact
        });
        return true;
    }

    install().catch((error) => console.error("GrowWithHR visual sectioned report could not install.", error));
})();
