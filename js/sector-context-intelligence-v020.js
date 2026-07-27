/* GrowWithHR v0.20.1 all-sector contextual question intelligence */
(() => {
    "use strict";

    const VERSION = "0.20.1-all-sector-context-intelligence";
    const INSTALL_FLAG = "__growwithhrAllSectorIntelligenceInstalled";
    const PROFILE_PATTERNS = Object.freeze([
        ["manufacturing", /manufactur|factory|plant|industrial|production|semiconductor|automotive|textile|pharma(?:ceutical)? manufacturing/i],
        ["bpo", /bpo|ites|contact centre|contact center|call centre|call center|shared services|business process/i],
        ["software", /software|saas|information technology|\bit\b|technology|digital product|cloud|cyber|data services/i],
        ["professional-services", /consult|professional service|legal service|accounting|audit|agency|advisory|design studio|engineering service/i],
        ["retail-ecommerce", /retail|e-?commerce|online marketplace|consumer store|supermarket|fashion|d2c/i],
        ["hospitality-travel", /hospitality|hotel|restaurant|food service|catering|travel|tourism|resort/i],
        ["healthcare-life-sciences", /healthcare|hospital|clinic|diagnostic|life science|biotech|pharma|medical|wellness/i],
        ["education-training", /education|school|college|university|training|edtech|academy|coaching/i],
        ["logistics-warehousing", /logistics|warehouse|transport|trucking|courier|delivery|supply chain|freight/i],
        ["construction-real-estate", /construction|real estate|property|infrastructure|civil|developer|project site/i],
        ["finance-fintech", /bank|financial service|insurance|fintech|nbfc|investment|wealth|payments/i],
        ["media-creative", /media|advertising|creative|film|television|broadcast|entertainment|events|gaming|publishing/i],
        ["nonprofit-social", /non-?profit|ngo|social enterprise|charit|foundation|development sector/i]
    ]);

    const SHIFT_HEAVY = new Set([
        "bpo", "retail-ecommerce", "hospitality-travel", "healthcare-life-sciences",
        "logistics-warehousing", "manufacturing", "media-creative"
    ]);

    const FIELD_DEFINITIONS = Object.freeze({
        businessActivities: {
            label: "Which operating activities are part of this business?",
            type: "multi",
            options: [
                ["office", "Office or remote knowledge work"],
                ["client-sites", "Work at client or customer sites"],
                ["store", "Retail stores or customer-facing outlets"],
                ["warehouse", "Warehousing, fulfilment or logistics operations"],
                ["facility", "Healthcare, education or hospitality facilities"],
                ["project-sites", "Construction, infrastructure or field project sites"],
                ["manufacturing", "Manufacturing, production or plant operations"],
                ["night-operations", "Night or continuous operations"],
                ["not-sure", "Not sure"]
            ],
            helper: "Select only activities the organisation currently carries out. Follow-up questions appear from these answers."
        },
        clientSiteWorkers: {
            label: "Do employees regularly work from client or customer sites?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        overseasWorkers: {
            label: "Are any employees engaged outside India?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        outsourcedOperations: {
            label: "Are any regular business operations delivered by an outsourced service provider?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        agencyLabourUsed: {
            label: "Are any people supplied through a staffing agency or labour contractor?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]],
            helper: "This is different from a vendor supplying a finished service with no personnel placed under your supervision."
        },
        seasonalWorkers: {
            label: "Does the organisation engage seasonal, casual or event-based workers?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        shiftOperations: {
            label: "Does any team work in shifts?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        nightShifts: {
            label: "Does any work regularly take place at night?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        womenNightShifts: {
            label: "Do women work during night operations?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]]
        },
        nightTransport: {
            label: "Is employer-arranged transport provided for night-shift staff where required?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]]
        },
        nightSecurity: {
            label: "Are documented safety and security controls in place for night work?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]]
        },
        warehouseOperations: {
            label: "Does the organisation operate a warehouse, fulfilment centre or distribution hub?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        projectSiteOperations: {
            label: "Does the organisation directly operate construction, infrastructure or other project sites?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        continuousOperations: {
            label: "Does any facility operate continuously or provide round-the-clock services?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        fieldBasedWork: {
            label: "Do employees or project teams regularly work in the field or at temporary locations?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        volunteersEngaged: {
            label: "Does the organisation regularly engage volunteers?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        partTimeFaculty: {
            label: "Does the organisation engage visiting, part-time or adjunct teaching staff?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        multiLocationOperations: {
            label: "Does the organisation operate from more than one establishment, facility or project location?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        manufacturingOperations: {
            label: "Does the organisation carry out a manufacturing or production process?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        },
        workers: {
            label: "How many factory, production or blue-collar workers are engaged in that manufacturing process?",
            type: "number"
        },
        usesPower: {
            label: "Is power used in the manufacturing process?",
            type: "choice",
            options: [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]]
        }
    });

    const PROFILE_FIELDS = Object.freeze({
        manufacturing: ["manufacturingOperations", "shiftOperations", "agencyLabourUsed"],
        bpo: ["shiftOperations", "outsourcedOperations"],
        software: ["clientSiteWorkers", "overseasWorkers", "outsourcedOperations"],
        "professional-services": ["clientSiteWorkers", "overseasWorkers", "outsourcedOperations"],
        "retail-ecommerce": ["warehouseOperations", "shiftOperations", "seasonalWorkers", "agencyLabourUsed", "multiLocationOperations"],
        "hospitality-travel": ["shiftOperations", "seasonalWorkers", "agencyLabourUsed", "multiLocationOperations"],
        "healthcare-life-sciences": ["continuousOperations", "agencyLabourUsed", "outsourcedOperations", "multiLocationOperations"],
        "education-training": ["partTimeFaculty", "agencyLabourUsed", "multiLocationOperations"],
        "logistics-warehousing": ["warehouseOperations", "shiftOperations", "agencyLabourUsed", "outsourcedOperations", "multiLocationOperations"],
        "construction-real-estate": ["projectSiteOperations", "agencyLabourUsed", "seasonalWorkers", "multiLocationOperations"],
        "finance-fintech": ["clientSiteWorkers", "overseasWorkers", "outsourcedOperations"],
        "media-creative": ["fieldBasedWork", "shiftOperations", "seasonalWorkers", "agencyLabourUsed"],
        "nonprofit-social": ["fieldBasedWork", "volunteersEngaged", "agencyLabourUsed", "multiLocationOperations"],
        mixed: ["businessActivities", "outsourcedOperations", "agencyLabourUsed"]
    });

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const list = (value) => Array.isArray(value)
        ? value.map((item) => clean(item)).filter(Boolean)
        : (clean(value) ? clean(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : []);
    const number = (value) => {
        const match = clean(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : 0;
    };
    const application = () => window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    const answersFor = (app) => app?.answers || app?.stateModel?.answers || app?.state?.answers || {};

    function profileFor(industry) {
        const text = clean(industry);
        return PROFILE_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] || "mixed";
    }

    function baseContext(data = {}) {
        const existing = window.GrowWithHRReportIntelligenceFixes?.contextFor?.(data) || {};
        const industry = clean(data.industryRuleProfile || data.industryCategory || data.customIndustry || data.industry);
        const profile = profileFor(industry);
        const activities = list(data.businessActivities).map((item) => item.toLowerCase());
        const manufacturingExplicit = clean(data.manufacturingOperations).toLowerCase() === "yes" || activities.includes("manufacturing");
        const agencyContext = clean(data.agencyLabourUsed).toLowerCase() === "yes" ||
            Number(existing.contractors || number(data.contractors || data.contractWorkers)) > 0 ||
            list(existing.categories || data.workerCategories).some((item) => /agency-contract-labour|contract labour/i.test(item));
        const shiftContext = clean(data.shiftOperations).toLowerCase() === "yes" ||
            clean(data.continuousOperations).toLowerCase() === "yes" ||
            activities.includes("night-operations") ||
            /multiple|rotational|continuous|24.?7|night/i.test(clean(data.shiftPattern));
        const nightContext = clean(data.nightShifts).toLowerCase() === "yes" || activities.includes("night-operations");
        const peoplePresent = Boolean(existing.peoplePresent);
        const ownerOnly = Boolean(existing.ownerOnly);
        return {
            ...existing,
            industry,
            profile,
            activities,
            peoplePresent,
            ownerOnly,
            manufacturingContext: Boolean(existing.manufacturingContext || manufacturingExplicit || profile === "manufacturing"),
            agencyContext,
            shiftContext,
            nightContext
        };
    }

    function activeQuestionFields(data = {}) {
        const context = baseContext(data);
        const active = new Set();
        if (context.opc) active.add("workforcePresence");
        if (context.ownerOnly || !context.peoplePresent) return active;

        active.add("workerCategories");
        active.add("womenEmployees");
        if (Number(context.employees || 0) >= 10) active.add("esiWageEligibility");
        if (Number(context.employees || 0) >= 20) active.add("bonusWageEligibility");

        (PROFILE_FIELDS[context.profile] || PROFILE_FIELDS.mixed).forEach((field) => active.add(field));
        if (context.profile === "mixed") {
            if (context.activities.includes("client-sites")) active.add("clientSiteWorkers");
            if (context.activities.includes("warehouse")) active.add("warehouseOperations");
            if (context.activities.includes("project-sites")) active.add("projectSiteOperations");
            if (context.activities.includes("manufacturing")) active.add("manufacturingOperations");
            if (context.activities.includes("night-operations")) active.add("shiftOperations");
        }

        if (context.manufacturingContext && clean(data.manufacturingOperations).toLowerCase() === "yes") {
            active.add("workers");
            active.add("usesPower");
            active.add("shiftOperations");
        }
        if (SHIFT_HEAVY.has(context.profile) && (active.has("shiftOperations") || clean(data.continuousOperations).toLowerCase() === "yes")) {
            if (clean(data.shiftOperations).toLowerCase() === "yes" || clean(data.continuousOperations).toLowerCase() === "yes") {
                active.add("nightShifts");
            }
        }
        if (context.nightContext) {
            if (clean(data.womenEmployees).toLowerCase() === "yes") active.add("womenNightShifts");
            if (["bpo", "hospitality-travel", "healthcare-life-sciences"].includes(context.profile)) {
                active.add("nightTransport");
                active.add("nightSecurity");
            }
        }
        return active;
    }

    function escapeHtml(value) {
        return clean(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function fieldMarkup(name, definition, value) {
        if (definition.type === "number") {
            return `<div class="advisory-field" data-field-wrapper="${escapeHtml(name)}" data-sector-context-field="${escapeHtml(name)}"><label for="sector-${escapeHtml(name)}">${escapeHtml(definition.label)}</label><input id="sector-${escapeHtml(name)}" name="${escapeHtml(name)}" type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(value)}"><p class="advisory-field-error" id="${escapeHtml(name)}Error" hidden></p></div>`;
        }
        const selected = list(value);
        const type = definition.type === "multi" ? "checkbox" : "radio";
        const options = definition.options.map(([optionValue, label]) => `
            <label class="advisory-choice-pill sector-context-option">
                <input type="${type}" name="${escapeHtml(name)}" value="${escapeHtml(optionValue)}" ${selected.includes(optionValue) ? "checked" : ""}>
                <span>${escapeHtml(label)}</span>
            </label>`).join("");
        return `<fieldset class="advisory-choice-fieldset industry-adaptive-field" data-field-wrapper="${escapeHtml(name)}" data-sector-context-field="${escapeHtml(name)}"><legend>${escapeHtml(definition.label)}</legend>${definition.helper ? `<p class="advisory-field-help">${escapeHtml(definition.helper)}</p>` : ""}<div class="advisory-choice-pills">${options}</div><p class="advisory-field-error" id="${escapeHtml(name)}Error" hidden></p></fieldset>`;
    }

    function setAnswer(app, name, value) {
        const answers = answersFor(app);
        if (JSON.stringify(answers[name]) === JSON.stringify(value)) return false;
        if (typeof app?.stateModel?.setAnswer === "function") app.stateModel.setAnswer(name, value);
        else answers[name] = value;
        return true;
    }

    function ensureSectorFields(app, section, context) {
        let block = section.querySelector("[data-sector-intelligence]");
        if (!block) {
            block = document.createElement("section");
            block.className = "advisory-sector-intelligence";
            block.dataset.sectorIntelligence = context.profile;
            block.innerHTML = `<div class="advisory-industry-adaptive__heading"><p class="advisory-field-help">SECTOR-RELEVANT OPERATING QUESTIONS</p><h3>Questions selected for your business context</h3><p>Only questions connected to the selected sector, workforce and operating activities are shown. Hidden questions are not counted as missing in the report.</p></div><div class="advisory-field-group" data-sector-field-group></div>`;
            section.appendChild(block);
        }
        block.dataset.sectorIntelligence = context.profile;
        const group = block.querySelector("[data-sector-field-group]");
        const candidateFields = new Set([...(PROFILE_FIELDS[context.profile] || PROFILE_FIELDS.mixed)]);
        ["workers", "usesPower", "nightShifts", "womenNightShifts", "nightTransport", "nightSecurity", "clientSiteWorkers", "warehouseOperations", "projectSiteOperations", "manufacturingOperations", "shiftOperations"].forEach((field) => candidateFields.add(field));
        candidateFields.forEach((name) => {
            if (section.querySelector(`[data-field-wrapper="${name}"]`)) return;
            const definition = FIELD_DEFINITIONS[name];
            if (!definition) return;
            group.insertAdjacentHTML("beforeend", fieldMarkup(name, definition, answersFor(app)[name]));
        });
        return block;
    }

    function filterWorkerCategoryOptions(section, context) {
        const wrapper = section.querySelector('[data-field-wrapper="workerCategories"]');
        if (!wrapper) return;
        const allowedByProfile = {
            manufacturing: /permanent|fixed-term|part-time|factory-workers|agency-contract-labour|independent-contractors|interns-trainees|apprentices|not-sure/,
            bpo: /permanent|fixed-term|part-time|agency-contract-labour|independent-contractors|interns-trainees|client-site-employees|not-sure/,
            software: /permanent|fixed-term|part-time|independent-contractors|interns-trainees|apprentices|client-site-employees|overseas-employees|not-sure/,
            "professional-services": /permanent|fixed-term|part-time|independent-contractors|interns-trainees|client-site-employees|overseas-employees|not-sure/,
            "finance-fintech": /permanent|fixed-term|part-time|independent-contractors|interns-trainees|client-site-employees|overseas-employees|not-sure/,
            "education-training": /permanent|fixed-term|part-time|independent-contractors|interns-trainees|apprentices|not-sure/,
            mixed: /./
        };
        const pattern = allowedByProfile[context.profile] || /permanent|fixed-term|part-time|agency-contract-labour|independent-contractors|interns-trainees|apprentices|not-sure/;
        wrapper.querySelectorAll('input[name="workerCategories"]').forEach((input) => {
            const label = input.closest("label");
            const allowed = pattern.test(input.value);
            if (label) label.hidden = !allowed;
            input.disabled = !allowed || wrapper.hidden;
            if (!allowed && input.checked) input.checked = false;
        });
    }

    function neutralValue(name) {
        if (name === "workerCategories" || name === "businessActivities") return [];
        if (name === "workers") return "0";
        if (["manufacturingOperations", "usesPower"].includes(name)) return "no";
        return "";
    }

    function syncSectorQuestions(app = application()) {
        if (!app || Number(app.currentMoment ?? app.stateModel?.currentMoment) !== 2) return false;
        const section = document.querySelector("[data-industry-adaptive]");
        if (!section) return false;
        const data = answersFor(app);
        const context = baseContext(data);
        const active = activeQuestionFields(data);
        const block = ensureSectorFields(app, section, context);

        section.querySelectorAll("[data-sector-context-field]").forEach((wrapper) => {
            const name = wrapper.dataset.sectorContextField;
            const visible = active.has(name);
            wrapper.hidden = !visible;
            wrapper.querySelectorAll("input, select, textarea").forEach((input) => { input.disabled = !visible; });
            if (!visible) setAnswer(app, name, neutralValue(name));
        });
        block.hidden = context.ownerOnly || !context.peoplePresent;
        filterWorkerCategoryOptions(section, context);

        if (context.ownerOnly) {
            ["businessActivities", "clientSiteWorkers", "overseasWorkers", "outsourcedOperations", "agencyLabourUsed", "seasonalWorkers", "shiftOperations", "nightShifts", "womenNightShifts", "nightTransport", "nightSecurity", "warehouseOperations", "projectSiteOperations", "continuousOperations", "fieldBasedWork", "volunteersEngaged", "partTimeFaculty", "multiLocationOperations"].forEach((name) => setAnswer(app, name, neutralValue(name)));
        }
        app.persist?.();
        app.saveNow?.();
        return true;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value || {}));
    }

    function normalisePayload(payload = {}) {
        const next = clone(payload);
        next.answers = clone(payload.answers);
        next.report = clone(payload.report);
        next.lead = clone(payload.lead);
        const combined = Object.assign({}, next, next.lead, next.answers, next.report);
        const context = baseContext(combined);

        const targets = [next.answers, next.report];
        if (context.ownerOnly) {
            targets.forEach((target) => Object.assign(target, {
                workerCategories: ["owner-only"], workers: 0, contractors: 0, contractWorkers: 0,
                womenEmployees: "no", esiWageEligibility: "no", bonusWageEligibility: "no",
                manufacturingOperations: "no", usesPower: "no"
            }));
        } else {
            if (Number(context.employees || 0) < 10) targets.forEach((target) => { target.esiWageEligibility = "no"; });
            if (Number(context.employees || 0) < 20) targets.forEach((target) => { target.bonusWageEligibility = "no"; });
            if (!context.manufacturingContext) {
                targets.forEach((target) => Object.assign(target, { manufacturingOperations: "no", workers: 0, usesPower: "no" }));
            }
            if (context.agencyContext) {
                targets.forEach((target) => {
                    const categories = list(target.workerCategories);
                    if (!categories.includes("agency-contract-labour")) target.workerCategories = [...categories, "agency-contract-labour"];
                });
            }
        }
        next.sectorContext = { profile: context.profile, activeQuestionFields: [...activeQuestionFields(combined)] };
        return next;
    }

    function installPdfWrapper() {
        const service = window.GrowWithHRPDF;
        if (!service || service[INSTALL_FLAG] || !service.reportIntelligenceFixVersion) return false;
        const buildPdf = service.buildAdvisoryPdf?.bind(service);
        const buildRows = service.buildReportLawTransparency?.bind(service);
        if (typeof buildPdf !== "function") return false;
        const enhanced = Object.freeze({
            ...service,
            [INSTALL_FLAG]: true,
            sectorContextIntelligenceVersion: VERSION,
            async buildAdvisoryPdf(payload = {}) {
                const normalised = normalisePayload(payload);
                const result = await buildPdf(normalised);
                return {
                    ...result,
                    sectorContextIntelligenceVersion: VERSION,
                    sectorProfile: normalised.sectorContext.profile,
                    activeQuestionFields: normalised.sectorContext.activeQuestionFields
                };
            },
            buildReportLawTransparency(payload = {}, model = {}) {
                if (typeof buildRows !== "function") return [];
                const normalised = normalisePayload({ ...payload, report: { ...(payload.report || {}), ...(model || {}) } });
                return buildRows(normalised, normalised.report);
            }
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        return true;
    }

    function installAssessment(app = application()) {
        if (!app || app[INSTALL_FLAG]) return false;
        Object.defineProperty(app, INSTALL_FLAG, { value: VERSION });
        const originalRender = app.renderCurrentMoment?.bind(app);
        if (originalRender) {
            app.renderCurrentMoment = function allSectorRender(...args) {
                const result = originalRender(...args);
                queueMicrotask(() => syncSectorQuestions(this));
                return result;
            };
        }
        document.addEventListener("input", () => queueMicrotask(() => syncSectorQuestions(app)), true);
        document.addEventListener("change", () => queueMicrotask(() => syncSectorQuestions(app)), true);
        queueMicrotask(() => syncSectorQuestions(app));
        return true;
    }

    window.GrowWithHRSectorContextIntelligence = Object.freeze({
        version: VERSION,
        profileFor,
        contextFor: baseContext,
        activeQuestionFields,
        normalisePayload,
        syncSectorQuestions,
        profileFields: PROFILE_FIELDS
    });

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => {
        installAssessment(event.detail?.application);
    });
    installAssessment();
    installPdfWrapper();

    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;
        const assessmentReady = installAssessment();
        const pdfReady = installPdfWrapper();
        if (((assessmentReady || application()?.[INSTALL_FLAG]) && (pdfReady || window.GrowWithHRPDF?.[INSTALL_FLAG])) || attempts >= 120) {
            window.clearInterval(timer);
        }
    }, 100);
})();
