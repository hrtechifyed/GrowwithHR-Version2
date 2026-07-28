/* GrowWithHR v0.22 final shared-template parity layer */
(() => {
    "use strict";

    const core = window.GrowWithHRVisualReportCore;
    const renderers = window.GrowWithHRVisualReportRenderers;
    if (!core || !renderers) throw new Error("GrowWithHR report core and renderers must load before template parity enforcement.");

    const VERSION = "0.22.1-shared-hrtechify-template";
    const TEMPLATE_ID = "hrtechify-action-brief-shared-v1";
    const LOGO_ASSET = "assets/hrtechify-logo.png";
    const buildVariantBase = renderers.buildVariant.bind(renderers);

    function addContentsLogo(doc, logo) {
        if (!doc || !logo || typeof doc.setPage !== "function" || typeof doc.addImage !== "function") return;
        try {
            if (Number(doc.getNumberOfPages?.() || 0) >= 2) {
                doc.setPage(2);
                doc.addImage(logo, "PNG", 177, 17, 17, 17, "HRTECHIFY_CONTENTS_LOGO", "FAST");
            }
        } catch (_error) {}
    }

    function refreshSerialisation(result) {
        const doc = result.document;
        if (!doc || typeof doc.output !== "function") return result;
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        return {
            ...result,
            dataUri,
            base64: String(dataUri).includes(",") ? String(dataUri).split(",")[1] : String(dataUri),
            sizeBytes: Number(buffer?.byteLength || result.sizeBytes || 0),
            pageCount: Number(doc.getNumberOfPages?.() || result.pageCount || 0),
            reportLayoutVersion: VERSION,
            sharedTemplateId: TEMPLATE_ID,
            brandLogoAsset: LOGO_ASSET,
            templateGeometry: "identical-light-dark",
            themeDifference: "colour-palette-only"
        };
    }

    function buildVariant(JsPDF, theme, rows, model, payload, trace, logo) {
        const result = buildVariantBase(JsPDF, theme, rows, model, payload, trace, logo);
        addContentsLogo(result.document, logo);
        return refreshSerialisation(result);
    }

    window.GrowWithHRVisualReportCore = Object.freeze({
        ...core,
        VERSION,
        sharedTemplateId: TEMPLATE_ID,
        brandLogoAsset: LOGO_ASSET
    });

    window.GrowWithHRVisualReportRenderers = Object.freeze({
        ...renderers,
        VERSION,
        sharedTemplateId: TEMPLATE_ID,
        brandLogoAsset: LOGO_ASSET,
        buildVariant
    });

    window.GrowWithHRReportTemplateParity = Object.freeze({
        version: VERSION,
        templateId: TEMPLATE_ID,
        logoAsset: LOGO_ASSET,
        sameGeometry: true,
        onlyPaletteChanges: true
    });
})();
