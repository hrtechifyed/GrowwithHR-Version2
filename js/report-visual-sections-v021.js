/* GrowWithHR single, founder-demo report installer */
(() => {
    "use strict";

    const INSTALL_FLAG = "__growwithhrVisualSectionedReportInstalled";
    const STRUCTURE_VERSION = "founder-demo-single-v1";
    const TEMPLATE_ID = "hrtechify-founder-compliance-growth-v1";
    const BRAND_LOGO_ASSET = "assets/hrtechify-logo.png";

    async function install() {
        const core = window.GrowWithHRVisualReportCore;
        const renderers = window.GrowWithHRVisualReportRenderers;
        const identity = window.GrowWithHRReportIdentity;
        const service = window.GrowWithHRPDF;
        const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
        if (!core || !renderers || !identity || !service || !JsPDF || service[INSTALL_FLAG]) return false;
        if (typeof service.buildAdvisoryModel !== "function" || typeof service.buildReportLawTransparency !== "function") return false;
        if (typeof identity.allocate !== "function") return false;

        const buildModel = service.buildAdvisoryModel.bind(service);
        const buildRows = service.buildReportLawTransparency.bind(service);
        const logo = await core.loadLogo();

        async function buildAdvisoryPdf(payload = {}) {
            const identityRecord = await identity.allocate(payload);
            const enrichedPayload = {
                ...payload,
                reportId: identityRecord.reportId,
                generatedAt: identityRecord.generatedAt,
                report: {
                    ...(payload.report || {}),
                    reportId: identityRecord.reportId,
                    generatedAt: identityRecord.generatedAt
                }
            };
            const model = buildModel(enrichedPayload);
            const rows = core.values(buildRows(enrichedPayload, model));
            const data = core.mergeSource(enrichedPayload, model);
            const trace = { changes: core.values(enrichedPayload.inputChanges || enrichedPayload.trace?.changes) };
            const report = renderers.buildVariant(JsPDF, "standard", rows, model, enrichedPayload, trace, logo);

            return {
                ...report,
                pdfs: [report],
                emailAttachments: [report],
                deliveryAttachments: [report],
                attachmentCount: 1,
                totalSizeBytes: Number(report.sizeBytes || 0),
                generatedAt: identityRecord.generatedAt,
                reportId: identityRecord.reportId,
                reportIdentity: identityRecord,
                companyName: core.clean(data.companyName, "Your Organisation"),
                selectedThemes: ["standard"],
                singleReportDelivery: true,
                dualThemeDelivery: false,
                oneEmailDelivery: true,
                deliveryMode: "single-pdf-one-email",
                sharedTemplateId: TEMPLATE_ID,
                brandLogoAsset: BRAND_LOGO_ASSET,
                reportLayoutVersion: core.VERSION,
                reportStructureVersion: STRUCTURE_VERSION,
                readingSections: [
                    "Your company profile",
                    "Your HR compliance position",
                    "Compliance areas relevant today",
                    "Information that could change this report",
                    "Growth compliance radar",
                    "Your founder action list",
                    "How GrowWithHR reached this report",
                    "Report basis, scope & limitations",
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
            sharedTemplateId: TEMPLATE_ID,
            brandLogoAsset: BRAND_LOGO_ASSET,
            supportsDualTheme: false,
            singleReportDelivery: true,
            buildAdvisoryPdf
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        window.GrowWithHRVisualSectionedReport = Object.freeze({
            version: core.VERSION,
            structureVersion: STRUCTURE_VERSION,
            sharedTemplateId: TEMPLATE_ID,
            brandLogoAsset: BRAND_LOGO_ASSET,
            singleEdition: true,
            installed: true,
            selectedThemes: () => ["standard"],
            compact: core.compact
        });
        return true;
    }

    install().catch((error) => console.error("GrowWithHR single founder-demo report could not install.", error));
})();
