/* Compliance Change Intelligence: compare the current assessment with the last confirmed Company Workspace baseline. */
(() => {
    "use strict";

    const VERSION = "1.0.0";
    const SESSION_KEY = "growwithhr.workspace";
    const INSTALL_FLAG = "__growwithhrComplianceChangeIntelligenceInstalled";
    const clean = (value) => String(value ?? "").trim();
    const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const serial = (value) => Array.isArray(value) ? value.map(clean).filter(Boolean).join(", ") : clean(value);

    function readSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
        catch (_error) { return null; }
    }

    function currentValues(app) {
        const answers = object(app?.answers);
        return {
            employees: answers.employees,
            workers: answers.workers || answers.workerCount,
            contractors: answers.contractors || answers.contractWorkers || answers.contractorCount,
            womenEmployees: answers.womenEmployees || answers.femaleEmployees,
            operatingStates: answers.operatingStates || answers.primaryState || answers.state,
            operatingStateCount: answers.operatingStateCount || answers.locations,
            workModel: answers.workModel,
            entity: answers.entity || answers.establishmentType,
            peopleFunction: answers.peopleFunction,
            fundingStage: answers.fundingStage,
            expansionPlans: answers.expansionPlans
        };
    }

    function previousValues(session) {
        const data = object(session?.companyData);
        const shared = object(data.shared || data);
        const compliance = object(data.compliance);
        const answers = object(compliance.answers || compliance);
        return {
            employees: answers.employees ?? shared.employees,
            workers: answers.workers || answers.workerCount,
            contractors: answers.contractors || answers.contractWorkers || answers.contractorCount,
            womenEmployees: answers.womenEmployees || answers.femaleEmployees,
            operatingStates: answers.operatingStates || answers.primaryState || answers.state || shared.primaryState,
            operatingStateCount: answers.operatingStateCount || answers.locations || shared.locations,
            workModel: answers.workModel || shared.workModel,
            entity: answers.entity || answers.establishmentType || shared.entity,
            peopleFunction: answers.peopleFunction || shared.peopleFunction,
            fundingStage: answers.fundingStage || shared.fundingStage,
            expansionPlans: answers.expansionPlans
        };
    }

    const LABELS = Object.freeze({
        employees: "Employees",
        workers: "Workers",
        contractors: "Contractors",
        womenEmployees: "Women employees",
        operatingStates: "Operating States / locations",
        operatingStateCount: "Operating footprint",
        workModel: "Working model",
        entity: "Legal / establishment structure",
        peopleFunction: "People / HR support model",
        fundingStage: "Growth / funding stage",
        expansionPlans: "Expansion plans"
    });

    function compare(previous, current) {
        const changes = [];
        for (const key of Object.keys(LABELS)) {
            const before = serial(previous[key]);
            const after = serial(current[key]);
            if (!before || !after || before === after) continue;
            changes.push({
                field: key,
                label: LABELS[key],
                before,
                after,
                changedAt: new Date().toISOString()
            });
        }
        return changes;
    }

    function install(app) {
        if (!app?.deliveryService?.prepareAndSend || app[INSTALL_FLAG]) return false;
        const original = app.deliveryService.prepareAndSend.bind(app.deliveryService);
        app.deliveryService.prepareAndSend = async function changeAwarePrepare(payload = {}) {
            const prior = readSession();
            const changes = prior?.companyData ? compare(previousValues(prior), currentValues(app)) : [];
            const enriched = {
                ...payload,
                inputChanges: changes,
                trace: { ...object(payload.trace), changes },
                report: {
                    ...object(payload.report),
                    inputChanges: changes,
                    changeIntelligence: {
                        baselineAvailable: Boolean(prior?.companyData),
                        previousReportId: clean(prior?.reportId),
                        changedFactCount: changes.length,
                        changes
                    }
                }
            };
            return original(enriched);
        };
        Object.defineProperty(app, INSTALL_FLAG, { value: true });
        window.GrowWithHRComplianceChangeIntelligence = Object.freeze({ version: VERSION, install, compare });
        return true;
    }

    function tryInstall() {
        if (install(window.executiveAssessment)) return;
        let attempts = 0;
        const timer = window.setInterval(() => {
            attempts += 1;
            if (install(window.executiveAssessment) || attempts > 240) window.clearInterval(timer);
        }, 25);
    }

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => install(event?.detail?.application || window.executiveAssessment));
    tryInstall();
})();