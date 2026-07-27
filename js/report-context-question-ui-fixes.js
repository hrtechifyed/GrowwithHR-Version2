/* GrowWithHR contextual question transition fixes */
(() => {
    "use strict";

    const VERSION = "0.20.1-context-question-ui";
    const MARKER = "ownerOnlyDefaultsApplied";

    import("./sector-context-intelligence-v020.js").catch((error) => {
        console.error("GrowWithHR all-sector contextual intelligence could not load.", error);
    });

    function application() {
        return window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    }

    function answers(app) {
        return app?.answers || app?.stateModel?.answers || app?.state?.answers || {};
    }

    function setAnswer(app, name, value) {
        const current = answers(app)[name];
        if (JSON.stringify(current) === JSON.stringify(value)) return false;
        if (typeof app?.stateModel?.setAnswer === "function") app.stateModel.setAnswer(name, value);
        else answers(app)[name] = value;
        return true;
    }

    function workforceGate() {
        return document.querySelector('[data-industry-adaptive] [data-field-wrapper="workforcePresence"]');
    }

    function repairGate() {
        const field = workforceGate();
        if (!field) return false;
        field.querySelector('input[name="workforcePresence"][value="not-sure"]')?.closest("label")?.remove();
        const help = field.querySelector(".advisory-field-help");
        if (help) help.textContent = "Only relevant workforce, payroll and operating questions will appear after this answer.";
        return true;
    }

    function clearOwnerOnlyDefaults(app) {
        const data = answers(app);
        const changes = [
            ["workerCategories", Array.isArray(data.workerCategories) && data.workerCategories.includes("owner-only") ? [] : data.workerCategories],
            ["workers", String(data.workers ?? "") === "0" ? "" : data.workers],
            ["contractors", String(data.contractors ?? "") === "0" ? "" : data.contractors],
            ["contractWorkers", String(data.contractWorkers ?? "") === "0" ? "" : data.contractWorkers],
            ["womenEmployees", data.womenEmployees === "no" ? "" : data.womenEmployees],
            ["esiWageEligibility", data.esiWageEligibility === "no" ? "" : data.esiWageEligibility],
            ["bonusWageEligibility", data.bonusWageEligibility === "no" ? "" : data.bonusWageEligibility],
            ["manufacturingOperations", data.manufacturingOperations === "no" ? "" : data.manufacturingOperations],
            ["usesPower", data.usesPower === "no" ? "" : data.usesPower],
            ["shiftPattern", data.shiftPattern === "not-sure" ? "" : data.shiftPattern],
            ["nightShifts", data.nightShifts === "no" ? "" : data.nightShifts],
            ["womenNightShifts", data.womenNightShifts === "not-applicable" ? "" : data.womenNightShifts]
        ];
        let changed = false;
        changes.forEach(([name, value]) => {
            if (value !== data[name]) changed = setAnswer(app, name, value) || changed;
        });
        if (changed) {
            app?.persist?.();
            app?.saveNow?.();
        }
    }

    function onWorkforcePresenceChange(event) {
        if (event.target?.name !== "workforcePresence") return;
        const field = workforceGate();
        const app = application();
        if (!field || !app) return;

        if (event.target.value === "owner-only") {
            field.dataset[MARKER] = "true";
        } else if (event.target.value === "other-people" && field.dataset[MARKER] === "true") {
            clearOwnerOnlyDefaults(app);
            delete field.dataset[MARKER];
        }

        repairGate();
        queueMicrotask(() => {
            window.GrowWithHRReportIntelligenceFixes?.syncAssessmentQuestions?.(app);
            window.GrowWithHRSectorContextIntelligence?.syncSectorQuestions?.(app);
        });
    }

    document.addEventListener("change", onWorkforcePresenceChange, true);
    window.addEventListener("growwithhr:assessment-modules-ready", () => queueMicrotask(repairGate));

    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;
        if (repairGate() || attempts >= 80) window.clearInterval(timer);
    }, 100);

    window.GrowWithHRContextQuestionUiFixes = Object.freeze({
        version: VERSION,
        repairGate,
        clearOwnerOnlyDefaults
    });
})();
