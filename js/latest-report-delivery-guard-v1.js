/* GrowWithHR latest-report-only delivery guard
 *
 * Prevents cached/legacy PDFs from being reused by resend/download paths.
 * The assessment data remains the source of truth; a fresh PDF is generated
 * with the current editorial renderer whenever the supplied/cached PDF is not
 * the active report style.
 */
(() => {
    "use strict";

    const VERSION = "1.0.0-latest-report-only-delivery";
    const STYLE_ID = "editorial-research-v1";
    const PRESERVATION = "full-deterministic-finding-appendix";
    const INSTALL_FLAG = "__growwithhrLatestReportDeliveryGuardInstalled";

    const modules = window.GrowWithHRModules || {};
    const deliveryModule = modules.AdvisoryDelivery;
    const Service = deliveryModule?.AdvisoryDeliveryService;

    if (!Service?.prototype) {
        window.GrowWithHRLatestReportDeliveryGuard = Object.freeze({
            version: VERSION,
            installed: false,
            skipped: true,
            reason: "advisory-delivery-module-not-present",
            reportStyleId: STYLE_ID,
            informationPreservation: PRESERVATION
        });
        return;
    }

    if (Service.prototype[INSTALL_FLAG]) return;

    const originalSend = Service.prototype.send;
    const originalDownload = Service.prototype.download;

    function asObject(value) {
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function clean(value, fallback = "") {
        return String(value ?? "").trim() || fallback;
    }

    function isLatestPdf(pdf) {
        const candidate = asObject(pdf);
        return Boolean(
            candidate.reportStyleId === STYLE_ID &&
            candidate.informationPreservation === PRESERVATION &&
            candidate.singleEdition === true
        );
    }

    function latestRuntimeReady() {
        return Boolean(
            window.GrowWithHREditorialReportTemplate?.installed === true &&
            window.GrowWithHREditorialReportTemplate?.styleId === STYLE_ID &&
            window.GrowWithHRReportBrandTemplate?.reportStyle === STYLE_ID &&
            typeof window.GrowWithHRPDF?.buildAdvisoryPdf === "function"
        );
    }

    function identityFrom(source = {}, service) {
        const supplied = asObject(source);
        const suppliedPdf = asObject(supplied.pdf || supplied.pdfDocument || supplied.document);
        const cachedPdf = asObject(service?.lastPdf);
        const report = asObject(supplied.report || supplied.reportData || supplied.advisory);
        return {
            reportId: clean(supplied.reportId || report.reportId || suppliedPdf.reportId || cachedPdf.reportId),
            previousReportId: clean(supplied.previousReportId || report.previousReportId || suppliedPdf.previousReportId || cachedPdf.previousReportId)
        };
    }

    async function buildLatest(service, payload = {}) {
        if (!latestRuntimeReady()) {
            throw new Error("The latest GrowWithHR editorial report runtime is not ready. Reload the page before sending or downloading the report.");
        }

        const source = asObject(payload);
        const records = service.resolveRecords(source);
        const identity = identityFrom(source, service);
        const result = await window.GrowWithHRPDF.buildAdvisoryPdf({
            report: records.report,
            lead: records.lead,
            answers: records.answers,
            ...(identity.reportId ? { reportId: identity.reportId } : {}),
            ...(identity.previousReportId ? { previousReportId: identity.previousReportId } : {})
        });

        if (!isLatestPdf(result)) {
            throw new Error("GrowWithHR blocked a legacy report from delivery because the latest editorial format was not produced.");
        }

        service.lastPdf = result;
        return { records, pdf: result };
    }

    Service.prototype.preparePdf = async function prepareLatestPdf(payload = {}) {
        const source = asObject(payload);
        const candidate = source.pdf || source.pdfDocument || source.document || null;

        if (isLatestPdf(candidate)) {
            this.lastPdf = candidate;
            return candidate;
        }

        const built = await buildLatest(this, {
            ...source,
            pdf: null,
            pdfDocument: null,
            document: null
        });
        return built.pdf;
    };

    Service.prototype.send = async function sendLatestOnly(payload = {}) {
        const source = asObject(payload);
        const candidate = source.pdf || source.pdfDocument || source.document || this.lastPdf || null;
        let pdf = candidate;

        if (!isLatestPdf(pdf)) {
            pdf = (await buildLatest(this, {
                ...source,
                pdf: null,
                pdfDocument: null,
                document: null
            })).pdf;
        }

        return originalSend.call(this, {
            ...source,
            pdf,
            pdfDocument: null,
            document: null
        });
    };

    Service.prototype.resendCustomer = async function resendLatestCustomer(payload = {}) {
        const source = asObject(payload);
        const identity = identityFrom(source, this);

        /* A resend is deliberately regenerated from current assessment data.
         * Never reuse this.lastPdf or a PDF supplied by the caller. */
        this.lastPdf = null;

        const { records, pdf } = await buildLatest(this, {
            ...source,
            ...identity,
            pdf: null,
            pdfDocument: null,
            document: null,
            action: deliveryModule.RESEND_ACTION
        });

        const delivery = await originalSend.call(this, {
            ...source,
            ...records,
            action: deliveryModule.RESEND_ACTION,
            pdf,
            pdfDocument: null,
            document: null
        });

        this.lastPdf = pdf;
        this.lastDelivery = delivery;

        return {
            ok: delivery.ok !== false,
            action: deliveryModule.RESEND_ACTION,
            report: records.report,
            lead: records.lead,
            answers: records.answers,
            pdf,
            delivery,
            customerSent: deliveryModule.customerWasSent(delivery)
        };
    };

    Service.prototype.download = async function downloadLatestOnly(payload = {}) {
        const source = asObject(payload);
        const candidate = source.pdf || source.pdfDocument || source.document || this.lastPdf || null;
        let pdf = candidate;

        if (!isLatestPdf(pdf)) {
            pdf = (await buildLatest(this, {
                ...source,
                pdf: null,
                pdfDocument: null,
                document: null
            })).pdf;
        }

        return originalDownload.call(this, {
            ...source,
            pdf,
            pdfDocument: null,
            document: null
        });
    };

    Object.defineProperty(Service.prototype, INSTALL_FLAG, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: true
    });

    window.GrowWithHRLatestReportDeliveryGuard = Object.freeze({
        version: VERSION,
        installed: true,
        reportStyleId: STYLE_ID,
        informationPreservation: PRESERVATION,
        stalePdfReuseAllowed: false,
        resendRegeneratesFromCurrentAssessment: true,
        downloadLatestOnly: true,
        failClosedOnLegacyRenderer: true,
        isLatestPdf
    });
})();