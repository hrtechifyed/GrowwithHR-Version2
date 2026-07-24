/* GrowWithHR universal and industry-adaptive assessment questions */
(() => {
    "use strict";

    const VERSION = "0.23.0-founder-compliance-inputs";
    const INSTALL_FLAG = "__industryAdaptiveAssessmentInstalled";
    const SUBMIT_GUARD_FLAG = "industryAdaptiveSubmitGuard";

    import("./report-runtime-corrections.js").catch((error) => {
        console.error("GrowWithHR report runtime corrections could not load.", error);
    });

    const UNIVERSAL_FIELDS = Object.freeze([
        [
            "workerCategories",
            "Which types of people work with your organisation?",
            "multi",
            [
                ["permanent-employees", "Permanent employees"],
                ["fixed-term-employees", "Fixed-term employees"],
                ["part-time-employees", "Part-time employees"],
                ["factory-workers", "Factory, production or blue-collar workers"],
                ["agency-contract-labour", "Contract labour supplied by an agency"],
                ["independent-contractors", "Independent contractors or consultants"],
                ["interns-trainees", "Interns or trainees"],
                ["apprentices", "Apprentices"],
                ["client-site-employees", "Employees working at client sites"],
                ["overseas-employees", "Employees working outside India"],
                ["not-sure", "Not sure"]
            ],
            true,
            "Select every category that applies. This helps identify which employment rules are relevant."
        ],
        [
            "womenEmployees",
            "Are women employed by the organisation?",
            "choice",
            [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]],
            true,
            "This helps assess maternity-benefit, workplace-safety and related obligations."
        ],
        [
            "esiWageEligibility",
            "Are any employees likely to fall within the current ESI wage-eligibility limit?",
            "choice",
            [
                ["yes", "Yes — at least one employee may be eligible"],
                ["no", "No — no employee is likely to be eligible"],
                ["not-sure", "Not sure — payroll review is needed"]
            ],
            true,
            "No individual salary is requested. Choose Not sure when payroll needs to confirm the current statutory limit."
        ],
        [
            "bonusWageEligibility",
            "Are any employees likely to fall within the statutory bonus eligibility limit?",
            "choice",
            [
                ["yes", "Yes — at least one employee may be eligible"],
                ["no", "No — no employee is likely to be eligible"],
                ["not-sure", "Not sure — payroll review is needed"]
            ],
            true,
            "No individual salary is requested. Choose Not sure when payroll needs to confirm eligibility."
        ]
    ]);

    const PROFILE_RULES = Object.freeze({
        manufacturing: {
            matches: /manufactur|factory|plant|industrial|production|semiconductor/i,
            title: "Manufacturing and plant operations",
            description: "These questions are shown because factory, worker, shift and welfare obligations depend on how production work is organised.",
            fields: [
                ["manufacturingOperations", "Does the organisation carry out a manufacturing process?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
                ["workers", "How many factory, production or blue-collar workers are engaged?", "number", null, true],
                ["usesPower", "Is power used in the manufacturing process?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
                ["shiftPattern", "How is production work scheduled?", "choice", [["day-only", "Day shift only"], ["multiple", "Two or more shifts"], ["continuous", "Continuous operations"], ["not-sure", "Not sure"]], true],
                ["nightShifts", "Does any shift operate at night?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
                ["womenNightShifts", "Do women work night shifts?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false]
            ]
        },
        bpo: {
            matches: /bpo|ites|contact centre|contact center|call centre|call center|business process|shared services/i,
            title: "BPO, ITES and contact-centre operations",
            description: "These questions are shown because shift work, night operations, transport and security arrangements can change employment obligations.",
            fields: [
                ["shiftPattern", "How are teams scheduled?", "choice", [["day-only", "Day shift only"], ["rotational", "Rotational shifts"], ["continuous", "24×7 operations"], ["not-sure", "Not sure"]], true],
                ["nightShifts", "Do employees work night shifts?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
                ["womenNightShifts", "Do women work night shifts?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false],
                ["nightTransport", "Is employer-arranged transport provided for night-shift staff?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false],
                ["nightSecurity", "Are documented night-shift safety and security controls in place?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false]
            ]
        },
        software: {
            matches: /software|saas|information technology|\bit\b|technology|digital product|cloud/i,
            title: "Software and technology operations",
            description: "These questions are shown because distributed teams, client-site work and international employment may be more relevant than factory-specific questions.",
            fields: [
                ["clientSiteWorkers", "Do employees regularly work from client sites?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], false],
                ["overseasWorkers", "Are any employees engaged outside India?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], false]
            ]
        }
    });

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const escapeHtml = (value) => clean(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    function applicationAnswers(application) {
        return application?.answers || application?.stateModel?.answers || application?.state?.answers || {};
    }

    function applicationMoment(application) {
        return Number(application?.currentMoment ?? application?.stateModel?.currentMoment ?? application?.state?.currentMoment);
    }

    function resolveIndustry(application) {
        const answers = applicationAnswers(application);
        return clean(
            answers.industryRuleProfile ||
            answers.industryCategory ||
            answers.industry ||
            answers.customIndustry ||
            document.getElementById("industry")?.value ||
            document.getElementById("customIndustry")?.value
        );
    }

    function resolveProfile(industry) {
        return Object.entries(PROFILE_RULES).find(([, profile]) => profile.matches.test(industry))?.[0] || "";
    }

    function optionMarkup(name, options, selected, multiple = false) {
        const values = Array.isArray(selected) ? selected.map(clean) : [clean(selected)];
        return options.map(([value, label]) => `
            <label class="advisory-choice-pill industry-adaptive-option">
                <input type="${multiple ? "checkbox" : "radio"}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${values.includes(value) ? "checked" : ""}>
                <span>${escapeHtml(label)}</span>
            </label>`).join("");
    }

    function fieldMarkup(field, answers) {
        const [name, label, type, options, required, helper = ""] = field;
        const value = answers?.[name];
        if (type === "number") {
            return `<div class="advisory-field" data-field-wrapper="${escapeHtml(name)}" data-industry-field="${escapeHtml(name)}">
                <label for="${escapeHtml(name)}">${escapeHtml(label)}${required ? " <span aria-hidden=\"true\">*</span>" : ""}</label>
                ${helper ? `<p class="advisory-field-help">${escapeHtml(helper)}</p>` : ""}
                <input id="${escapeHtml(name)}" name="${escapeHtml(name)}" type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(value)}" ${required ? "required" : ""}>
                <p class="advisory-field-error" id="${escapeHtml(name)}Error" hidden></p>
            </div>`;
        }
        const multiple = type === "multi";
        return `<fieldset class="advisory-choice-fieldset industry-adaptive-field" data-field-wrapper="${escapeHtml(name)}" data-industry-field="${escapeHtml(name)}">
            <legend>${escapeHtml(label)}${required ? " <span aria-hidden=\"true\">*</span>" : ""}</legend>
            ${helper ? `<p class="advisory-field-help">${escapeHtml(helper)}</p>` : ""}
            <div class="advisory-choice-pills">${optionMarkup(name, options, value, multiple)}</div>
            <p class="advisory-field-error" id="${escapeHtml(name)}Error" hidden></p>
        </fieldset>`;
    }

    function valuesEqual(current, next) {
        if (Array.isArray(current) || Array.isArray(next)) {
            if (!Array.isArray(current) || !Array.isArray(next) || current.length !== next.length) return false;
            return current.every((value, index) => value === next[index]);
        }
        return current === next;
    }

    function setAnswer(application, name, value) {
        const answers = applicationAnswers(application);
        if (valuesEqual(answers[name], value)) return false;
        if (typeof application?.stateModel?.setAnswer === "function") {
            application.stateModel.setAnswer(name, value);
        } else {
            answers[name] = value;
        }
        return true;
    }

    function syncField(application, target) {
        if (!(target instanceof HTMLInputElement) || !target.closest("[data-industry-adaptive]")) return;
        const name = target.name;
        if (!name) return;
        const value = target.type === "checkbox"
            ? Array.from(document.querySelectorAll(`[data-industry-adaptive] input[name="${CSS.escape(name)}"]:checked`)).map((input) => input.value)
            : target.value;
        if (!setAnswer(application, name, value)) return;
        application.persist?.();
        application.saveProgress?.();
        application.saveNow?.();
    }

    function activeFields(application) {
        const profileKey = resolveProfile(resolveIndustry(application));
        const profileFields = profileKey ? PROFILE_RULES[profileKey].fields : [];
        return { profileKey, fields: [...UNIVERSAL_FIELDS, ...profileFields] };
    }

    function render(application) {
        const container = document.getElementById("storyContainer");
        if (!container) return false;

        const existing = container.querySelector("[data-industry-adaptive]");
        if (applicationMoment(application) !== 2) {
            existing?.remove();
            return false;
        }

        const { profileKey } = activeFields(application);
        const renderKey = profileKey || "universal";
        if (existing?.dataset.industryAdaptive === renderKey) return true;
        existing?.remove();

        const profile = profileKey ? PROFILE_RULES[profileKey] : null;
        const section = document.createElement("section");
        section.className = "advisory-industry-adaptive";
        section.dataset.industryAdaptive = renderKey;
        section.innerHTML = `
            <div class="advisory-industry-adaptive__heading">
                <p class="advisory-field-help">WORKFORCE AND STATUTORY ELIGIBILITY</p>
                <h3>Help us understand who works with you</h3>
                <p>These questions make the legal assessment more precise. They do not request individual employee salaries.</p>
            </div>
            <div class="advisory-field-group">${UNIVERSAL_FIELDS.map((field) => fieldMarkup(field, applicationAnswers(application))).join("")}</div>
            ${profile ? `
                <div class="advisory-industry-adaptive__heading">
                    <p class="advisory-field-help">INDUSTRY-SPECIFIC QUESTIONS</p>
                    <h3>${escapeHtml(profile.title)}</h3>
                    <p>${escapeHtml(profile.description)}</p>
                </div>
                <div class="advisory-field-group">${profile.fields.map((field) => fieldMarkup(field, applicationAnswers(application))).join("")}</div>` : ""}`;
        container.appendChild(section);
        return true;
    }

    function validate(application) {
        if (applicationMoment(application) !== 2) return true;
        const answers = applicationAnswers(application);
        const { fields } = activeFields(application);
        let valid = true;

        for (const [name, , type, , required] of fields) {
            if (!required) continue;
            const value = answers[name];
            const missing = type === "multi" ? !Array.isArray(value) || !value.length : clean(value) === "";
            const wrapper = document.querySelector(`[data-industry-adaptive] [data-field-wrapper="${CSS.escape(name)}"]`);
            const error = document.getElementById(`${name}Error`);
            wrapper?.classList.toggle("has-error", missing);
            wrapper?.querySelector("input")?.setAttribute("aria-invalid", missing ? "true" : "false");
            if (error) {
                error.hidden = !missing;
                error.textContent = missing ? "Please answer this question before continuing." : "";
            }
            if (missing) valid = false;
        }

        if (!valid) document.querySelector("[data-industry-adaptive]")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
        return valid;
    }

    function unlockNavigation(application) {
        const button = application?.elements?.nextButton || document.getElementById("nextButton");
        const shell = application?.elements?.shell || document.getElementById("assessmentShell");
        if (button) {
            button.disabled = false;
            button.removeAttribute("aria-busy");
            button.removeAttribute("aria-disabled");
            delete button.dataset.navigationBusy;
        }
        if (shell) shell.dataset.navigationGuard = "ready";
    }

    function showValidationFeedback(application) {
        const container = document.getElementById("storyContainer");
        const visibleError = container?.querySelector(".advisory-field-error:not([hidden])");
        const footer = application?.elements?.footerMessage || document.getElementById("footerMessage");
        const message = clean(visibleError?.textContent, "Review the highlighted required information before continuing.");
        if (footer) footer.textContent = message;
        application?.announce?.(message, true);
    }

    function installSubmitGuard(application) {
        const form = application?.elements?.storyForm || document.getElementById("storyForm");
        if (!form || form.dataset[SUBMIT_GUARD_FLAG] === "true") return;
        form.dataset[SUBMIT_GUARD_FLAG] = "true";

        form.addEventListener("submit", (event) => {
            const startingMoment = applicationMoment(application);
            application.captureAllStoryInputs?.();

            if (!validate(application)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                unlockNavigation(application);
                showValidationFeedback(application);
                return;
            }

            window.setTimeout(() => {
                if (applicationMoment(application) !== startingMoment) return;
                unlockNavigation(application);
                showValidationFeedback(application);
            }, 0);
        }, true);
    }

    function install(application) {
        if (!application || application[INSTALL_FLAG]) return false;
        Object.defineProperty(application, INSTALL_FLAG, { value: true });

        const originalRender = application.renderCurrentMoment?.bind(application);
        if (originalRender) {
            application.renderCurrentMoment = function industryAwareRender(...args) {
                const result = originalRender(...args);
                queueMicrotask(() => render(this));
                return result;
            };
        }

        installSubmitGuard(application);
        document.addEventListener("input", (event) => syncField(application, event.target));
        document.addEventListener("change", (event) => syncField(application, event.target));

        /*
         * Rendering is driven by the controller's renderCurrentMoment lifecycle.
         * Do not observe storyContainer mutations here: the adaptive section is
         * itself a child of that container, so observing and rebuilding it causes
         * an unbounded remove/append loop that can freeze the assessment page.
         */
        queueMicrotask(() => render(application));
        return true;
    }

    function findApplication() {
        return window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    }

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => install(event.detail?.application));
    if (!install(findApplication())) {
        let attempts = 0;
        const timer = window.setInterval(() => {
            attempts += 1;
            if (install(findApplication()) || attempts >= 40) window.clearInterval(timer);
        }, 100);
    }

    window.GrowWithHRIndustryAdaptiveAssessment = Object.freeze({
        version: VERSION,
        universalFields: UNIVERSAL_FIELDS,
        profiles: PROFILE_RULES,
        resolveProfile,
        activeFields,
        validate,
        install,
        render
    });
})();
