/* GrowWithHR v0.20.1 sector-intelligence hardening */
(() => {
    "use strict";

    const VERSION = "0.20.1-sector-context-hardening";
    const PDF_FLAG = "__growwithhrSectorContextHardeningInstalled";
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const list = (value) => Array.isArray(value)
        ? value.map((item) => clean(item)).filter(Boolean)
        : (clean(value) ? clean(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : []);
    const clone = (value) => JSON.parse(JSON.stringify(value || {}));
    const application = () => window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    const answersFor = (app) => app?.answers || app?.stateModel?.answers || app?.state?.answers || {};
    let originalApi = null;

    function baseApi() {
        return originalApi || window.GrowWithHRSectorContextIntelligence || null;
    }

    function withSelectedTheme(payload = {}) {
        const next = clone(payload);
        const explicit = clean(
            next.theme || next.reportTheme || next.pdfTheme || next.reportOptions?.theme
        ).toLowerCase();
        if (explicit) return next;
        let checked = [];
        try {
            checked = Array.from(document.querySelectorAll(
                "input[name='advisoryReportTheme']:checked, input[name='reportTheme']:checked"
            )).map((input) => clean(input.value).toLowerCase());
        } catch (_error) {}
        if (checked.includes("both")) next.theme = "both";
        else if (checked.includes("dark")) next.theme = "dark";
        else if (checked.includes("light")) next.theme = "light";
        return next;
    }

    function sanitiseKnownSectorPayload(payload = {}) {
        const api = baseApi();
        if (!api) return clone(payload);
        const next = clone(payload);
        next.answers = clone(payload.answers);
        next.report = clone(payload.report);
        next.lead = clone(payload.lead);
        const combined = Object.assign({}, next, next.lead, next.answers, next.report);
        const profile = api.profileFor(clean(
            combined.industryRuleProfile || combined.industryCategory ||
            combined.customIndustry || combined.industry
        ));
        const activities = list(combined.businessActivities).map((item) => item.toLowerCase());
        const manufacturingActivity = activities.includes("manufacturing");
        const knownNonManufacturing = !["manufacturing", "mixed"].includes(profile);
        if (knownNonManufacturing && !manufacturingActivity) {
            [next.answers, next.report].forEach((target) => Object.assign(target, {
                manufacturingOperations: "no",
                workers: 0,
                usesPower: "no"
            }));
        }
        return next;
    }

    function enhancedActiveQuestionFields(data = {}) {
        const api = baseApi();
        const active = new Set(api ? [...api.activeQuestionFields(data)] : []);
        if (!api) return active;
        const context = api.contextFor(data);
        const activities = list(data.businessActivities).map((item) => item.toLowerCase());
        const shiftsConfirmed = clean(data.shiftOperations).toLowerCase() === "yes" ||
            clean(data.continuousOperations).toLowerCase() === "yes" ||
            activities.includes("night-operations");
        if (!context.ownerOnly && context.peoplePresent && shiftsConfirmed) {
            active.add("nightShifts");
        }
        if (!context.ownerOnly && context.peoplePresent && clean(data.nightShifts).toLowerCase() === "yes") {
            if (clean(data.womenEmployees).toLowerCase() === "yes") active.add("womenNightShifts");
            if (["bpo", "hospitality-travel", "healthcare-life-sciences"].includes(context.profile)) {
                active.add("nightTransport");
                active.add("nightSecurity");
            }
        }
        return active;
    }

    function normalisePayload(payload = {}) {
        const api = baseApi();
        const sanitised = sanitiseKnownSectorPayload(payload);
        return api ? api.normalisePayload(sanitised) : sanitised;
    }

    function syncActivityFollowUps(app = application()) {
        const api = baseApi();
        if (!api || !app) return false;
        api.syncSectorQuestions(app);
        if (Number(app.currentMoment ?? app.stateModel?.currentMoment) !== 2) return false;
        const section = document.querySelector("[data-industry-adaptive]");
        if (!section) return false;
        const active = enhancedActiveQuestionFields(answersFor(app));
        ["nightShifts", "womenNightShifts", "nightTransport", "nightSecurity"].forEach((name) => {
            const wrapper = section.querySelector(`[data-field-wrapper="${name}"]`);
            if (!wrapper) return;
            const visible = active.has(name);
            wrapper.hidden = !visible;
            wrapper.querySelectorAll("input, select, textarea").forEach((input) => { input.disabled = !visible; });
        });
        return true;
    }

    function installApi() {
        const current = window.GrowWithHRSectorContextIntelligence || null;
        if (!current) return false;
        if (current.patchVersion === VERSION) return true;
        originalApi = current;
        window.GrowWithHRSectorContextIntelligence = Object.freeze({
            ...current,
            patchVersion: VERSION,
            activeQuestionFields: enhancedActiveQuestionFields,
            normalisePayload,
            syncSectorQuestions: syncActivityFollowUps
        });
        return true;
    }

    function installPdfWrapper() {
        const service = window.GrowWithHRPDF;
        if (!service || service[PDF_FLAG] || !service.sectorContextIntelligenceVersion) return false;
        const buildPdf = service.buildAdvisoryPdf?.bind(service);
        const buildRows = service.buildReportLawTransparency?.bind(service);
        if (typeof buildPdf !== "function") return false;
        const enhanced = Object.freeze({
            ...service,
            [PDF_FLAG]: true,
            sectorContextHardeningVersion: VERSION,
            buildAdvisoryPdf(payload = {}) {
                return buildPdf(sanitiseKnownSectorPayload(withSelectedTheme(payload)));
            },
            buildReportLawTransparency(payload = {}, model = {}) {
                if (typeof buildRows !== "function") return [];
                const sanitised = sanitiseKnownSectorPayload({
                    ...payload,
                    report: { ...(payload.report || {}), ...(model || {}) }
                });
                return buildRows(sanitised, sanitised.report);
            }
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        return true;
    }

    function installAssessmentListeners() {
        if (window.__growwithhrSectorContextHardeningListeners) return;
        window.__growwithhrSectorContextHardeningListeners = true;
        document.addEventListener("input", () => queueMicrotask(() => syncActivityFollowUps()), true);
        document.addEventListener("change", () => queueMicrotask(() => syncActivityFollowUps()), true);
        window.addEventListener("growwithhr:assessment-modules-ready", (event) => {
            queueMicrotask(() => syncActivityFollowUps(event.detail?.application));
        });
    }

    installApi();
    installPdfWrapper();
    installAssessmentListeners();

    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;
        const apiReady = installApi();
        const pdfReady = installPdfWrapper() || Boolean(window.GrowWithHRPDF?.[PDF_FLAG]);
        if ((apiReady && pdfReady) || attempts >= 120) window.clearInterval(timer);
    }, 100);
})();
