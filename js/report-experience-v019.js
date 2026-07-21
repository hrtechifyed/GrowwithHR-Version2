/* ==========================================================
   GrowWithHR v0.19 report and assessment experience
   - central employee-count normalisation
   - One Person Company workforce lock
   - light/dark report choice at lead capture
   - actionable recommendation implementation guidance
   ========================================================== */
(() => {
    "use strict";

    const VERSION = "0.19.0-report-experience";
    const ASSESSMENT_STORAGE_KEY = "growwithhr-advisory-briefing-v2";
    const REPORT_THEME_KEY = "growwithhr-report-theme";
    const ONE_PERSON_COMPANY = "One Person Company";

    const RESOURCE_LIBRARY = Object.freeze({
        "Hiring and onboarding": {
            howTo: [
                "Create one approved role-profile format covering purpose, outcomes, skills and reporting line.",
                "Use the same interview scorecard for every candidate considered for the same role.",
                "Assign an onboarding owner and schedule the first-day, first-week and first-30-day checkpoints."
            ],
            owner: "Founder or People lead",
            timeframe: "Start within 14 days",
            resourceLabel: "Employee onboarding checklist",
            resourceUrl: "resources/employee-onboarding-checklist.csv"
        },
        "Policies and compliance": {
            howTo: [
                "List each applicable registration, filing, policy review and evidence requirement in one calendar.",
                "Record the responsible owner, due date, reminder dates and completion evidence for every item.",
                "Review overdue and high-risk items in a monthly leadership meeting."
            ],
            owner: "Founder, HR or compliance owner",
            timeframe: "Create within 14 days; review monthly",
            resourceLabel: "Compliance calendar template",
            resourceUrl: "resources/compliance-calendar-template.csv"
        },
        "Performance and rewards": {
            howTo: [
                "Define three to five measurable outcomes for each priority role.",
                "Run a short monthly check-in covering progress, support needed and agreed actions.",
                "Calibrate performance and reward decisions before communicating outcomes."
            ],
            owner: "Business leader and people managers",
            timeframe: "Pilot within 30 days",
            resourceLabel: "HR action plan template",
            resourceUrl: "resources/hr-action-plan-template.csv"
        },
        "Manager capability": {
            howTo: [
                "Publish a one-page manager standard covering communication, goals, feedback, conduct and escalation.",
                "Use real workplace scenarios in short manager practice sessions.",
                "Review adoption through employee feedback and documented manager check-ins."
            ],
            owner: "Leadership team",
            timeframe: "Define within 30 days",
            resourceLabel: "Manager action plan template",
            resourceUrl: "resources/hr-action-plan-template.csv"
        },
        "Culture and engagement": {
            howTo: [
                "Translate values into observable behaviours that employees and managers can recognise.",
                "Include those behaviours in onboarding, recognition and manager conversations.",
                "Run a short quarterly pulse and agree two visible follow-up actions."
            ],
            owner: "Founder and leadership team",
            timeframe: "Begin within 30 days",
            resourceLabel: "HR action plan template",
            resourceUrl: "resources/hr-action-plan-template.csv"
        },
        "HR operations and technology": {
            howTo: [
                "Map the employee-data, document, leave, attendance and reporting workflows currently in use.",
                "Choose one reliable source for employee records and assign data ownership.",
                "Standardise the process before selecting or expanding technology."
            ],
            owner: "HR, operations or administration owner",
            timeframe: "Map within 30 days",
            resourceLabel: "Employee document checklist",
            resourceUrl: "resources/employee-document-checklist.csv"
        },
        "Workforce planning": {
            howTo: [
                "List the roles and capabilities required for the next four quarters.",
                "Record timing, cost, business dependency and alternatives for each role.",
                "Review the plan monthly against demand, hiring progress and workforce cost."
            ],
            owner: "Business and finance leadership",
            timeframe: "Build within 30 days",
            resourceLabel: "Workforce action plan template",
            resourceUrl: "resources/hr-action-plan-template.csv"
        },
        "Organisation design": {
            howTo: [
                "Map current accountabilities and decisions, highlighting overlaps and missing owners.",
                "Define the structure and decision rights needed for the next stage rather than the current snapshot only.",
                "Communicate changes with role clarity, transition dates and a follow-up review."
            ],
            owner: "Founder or executive leadership",
            timeframe: "Review within 45 days",
            resourceLabel: "HR action plan template",
            resourceUrl: "resources/hr-action-plan-template.csv"
        }
    });

    function clean(value) {
        return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function isOnePersonCompany(entity) {
        return clean(entity).toLowerCase() === ONE_PERSON_COMPANY.toLowerCase();
    }

    function normaliseEmployeeCount(value, entity = "") {
        if (isOnePersonCompany(entity)) return 1;
        const parsed = Number.parseInt(value, 10);
        return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : 1;
    }

    function uniqueText(values) {
        const seen = new Set();
        return (Array.isArray(values) ? values : [])
            .map(clean)
            .filter((value) => {
                if (!value) return false;
                const key = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }

    function enhanceModel(model = {}) {
        const employees = normaliseEmployeeCount(model.employees, model.entity);
        const employeeLabel = `${employees} ${employees === 1 ? "employee" : "employees"}`;
        const recommendations = uniqueText(
            (model.recommendations || []).map((item) => item?.title)
        ).map((title) => {
            const original = (model.recommendations || []).find((item) => item?.title === title) || {};
            const implementation = RESOURCE_LIBRARY[title] || {
                howTo: [
                    "Assign one accountable owner and define the intended outcome.",
                    "Break the recommendation into dated actions and retain evidence of completion.",
                    "Review progress in a regular leadership meeting and adjust using evidence."
                ],
                owner: "Executive sponsor",
                timeframe: "Agree within 30 days",
                resourceLabel: "HR action plan template",
                resourceUrl: "resources/hr-action-plan-template.csv"
            };
            return {
                ...original,
                title,
                howTo: uniqueText(implementation.howTo),
                owner: implementation.owner,
                timeframe: implementation.timeframe,
                resourceLabel: implementation.resourceLabel,
                resourceUrl: implementation.resourceUrl
            };
        });

        return {
            ...model,
            employees,
            employeeLabel,
            employeeNoun: employees === 1 ? "employee" : "employees",
            employeePronoun: employees === 1 ? "this employee" : "these employees",
            executiveSummary: uniqueText(model.executiveSummary),
            perspective: uniqueText(model.perspective),
            strengths: uniqueText(model.strengths),
            compliance: uniqueText(model.compliance),
            opportunities: uniqueText(model.opportunities),
            priorities: uniqueText(model.priorities),
            recommendations
        };
    }

    function installPdfModelEnhancement() {
        const current = window.GrowWithHRPDF;
        if (!current || typeof current.buildAdvisoryModel !== "function" || current.v019Enhanced) return;
        const originalBuild = current.buildAdvisoryModel.bind(current);
        window.GrowWithHRPDF = Object.freeze({
            ...current,
            v019Enhanced: true,
            buildAdvisoryModel(payload = {}) {
                return enhanceModel(originalBuild(payload));
            }
        });
    }

    function readAssessmentRecord() {
        try {
            return JSON.parse(window.localStorage?.getItem(ASSESSMENT_STORAGE_KEY) || "{}");
        } catch (_error) {
            return {};
        }
    }

    function writeAssessmentEmployees(value) {
        try {
            const record = readAssessmentRecord();
            record.answers = { ...(record.answers || {}), employees: String(value) };
            window.localStorage?.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(record));
        } catch (_error) {
            // The controller remains the primary state owner; storage is best-effort.
        }
    }

    function selectedEntity() {
        const entityField = document.getElementById("entity");
        if (entityField?.value) return entityField.value;
        return readAssessmentRecord()?.answers?.entity || "";
    }

    function enforceEmployeeField() {
        const input = document.getElementById("employees");
        if (!input) return;

        const onePerson = isOnePersonCompany(selectedEntity());
        input.min = "1";
        input.step = "1";

        const parsed = normaliseEmployeeCount(input.value, onePerson ? ONE_PERSON_COMPANY : "");
        if (String(input.value) !== String(parsed)) {
            input.value = String(parsed);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            writeAssessmentEmployees(parsed);
        }

        input.disabled = onePerson;
        input.setAttribute("aria-readonly", onePerson ? "true" : "false");
        input.closest(".advisory-field")?.classList.toggle("is-system-locked", onePerson);

        const help = document.getElementById("employeesHelp");
        if (help) {
            help.textContent = onePerson
                ? "Set automatically to 1 because One Person Company was selected."
                : "A rounded whole number is fine. The minimum workforce count is 1.";
        }
    }

    function bindAssessmentSafeguards() {
        document.addEventListener("input", (event) => {
            if (event.target?.id !== "employees") return;
            const input = event.target;
            if (Number(input.value) < 1) input.value = "1";
        });
        document.addEventListener("blur", (event) => {
            if (event.target?.id !== "employees") return;
            enforceEmployeeField();
        }, true);
        document.addEventListener("change", (event) => {
            if (event.target?.id === "entity") {
                if (isOnePersonCompany(event.target.value)) writeAssessmentEmployees(1);
                queueMicrotask(enforceEmployeeField);
            }
        });

        const observer = new MutationObserver(enforceEmployeeField);
        observer.observe(document.body, { childList: true, subtree: true });
        enforceEmployeeField();
    }

    function currentTheme() {
        const selected = document.querySelector(
            "input[name='advisoryReportTheme']:checked, input[name='reportTheme']:checked"
        );
        const value = selected?.value || window.localStorage?.getItem(REPORT_THEME_KEY) || "light";
        return /dark/i.test(value) ? "dark" : "light";
    }

    function persistTheme() {
        try {
            window.localStorage?.setItem(REPORT_THEME_KEY, currentTheme());
        } catch (_error) {
            // Theme persistence is optional.
        }
    }

    function installLeadThemeChoice() {
        const form = document.getElementById("leadCaptureForm");
        const actions = form?.querySelector(".advisory-panel-actions");
        if (!form || !actions || form.querySelector("[data-report-theme-choice]")) return;

        const saved = currentTheme();
        const fieldset = document.createElement("fieldset");
        fieldset.className = "advisory-consent-group advisory-report-theme-choice";
        fieldset.dataset.reportThemeChoice = "true";
        fieldset.innerHTML = `
            <legend>PDF report style</legend>
            <p class="advisory-field-help">Choose the version you want to download and receive by email.</p>
            <label class="advisory-consent-option">
                <input type="radio" name="advisoryReportTheme" value="light" ${saved === "light" ? "checked" : ""}>
                <span><strong>Light</strong> — print-friendly with HRTechify navy and gold accents.</span>
            </label>
            <label class="advisory-consent-option">
                <input type="radio" name="advisoryReportTheme" value="dark" ${saved === "dark" ? "checked" : ""}>
                <span><strong>Dark</strong> — presentation-focused HRTechify dark palette.</span>
            </label>`;
        form.insertBefore(fieldset, actions);
        fieldset.addEventListener("change", persistTheme);
        form.addEventListener("submit", persistTheme, true);
    }

    installPdfModelEnhancement();
    bindAssessmentSafeguards();
    installLeadThemeChoice();

    window.GrowWithHRReportExperience = Object.freeze({
        version: VERSION,
        resourceLibrary: RESOURCE_LIBRARY,
        normaliseEmployeeCount,
        enhanceModel,
        currentTheme
    });
})();
