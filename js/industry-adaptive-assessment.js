/* GrowWithHR industry-adaptive assessment questions */
(() => {
    "use strict";

    const VERSION = "0.21.0-industry-adaptive-runtime";
    const INSTALL_FLAG = "__industryAdaptiveAssessmentInstalled";

    import("./report-runtime-corrections.js").catch((error) => {
        console.error("GrowWithHR report runtime corrections could not load.", error);
    });

    const PROFILE_RULES = Object.freeze({
        manufacturing: {
            matches: /manufactur|factory|plant|industrial|production|semiconductor/i,
            title: "Manufacturing and plant operations",
            description: "These questions are shown because factory, worker, shift and welfare obligations depend on how production work is organised.",
            fields: [
                ["manufacturingOperations", "Does the organisation carry out a manufacturing process?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
                ["workers", "How many factory, production or blue-collar workers are engaged?", "number", null, true],
                ["womenEmployees", "Are women employed at this establishment?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
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
                ["womenEmployees", "Are women employed in these operations?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], true],
                ["womenNightShifts", "Do women work night shifts?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false],
                ["nightTransport", "Is employer-arranged transport provided for night-shift staff?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false],
                ["nightSecurity", "Are documented night-shift safety and security controls in place?", "choice", [["yes", "Yes"], ["no", "No"], ["not-applicable", "Not applicable"], ["not-sure", "Not sure"]], false]
            ]
        },
        software: {
            matches: /software|saas|information technology|\bit\b|technology|digital product|cloud/i,
            title: "Software and technology operations",
            description: "These questions are shown because distributed teams, contractors and multi-state employment are usually more relevant than factory-specific questions.",
            fields: [
                ["workerCategories", "Which workforce groups are used?", "multi", [["employees", "Employees"], ["contractors", "Independent contractors or consultants"], ["interns", "Interns or trainees"], ["agency", "Agency or outsourced staff"]], true],
                ["clientSiteWorkers", "Do employees regularly work from client sites?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], false],
                ["overseasWorkers", "Are any employees engaged outside India?", "choice", [["yes", "Yes"], ["no", "No"], ["not-sure", "Not sure"]], false]
            ]
        }
    });

    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
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
        const [name, label, type, options, required] = field;
        const value = answers?.[name];
        if (type === "number") {
            return `<div class="advisory-field" data-industry-field="${escapeHtml(name)}">
                <label for="${escapeHtml(name)}">${escapeHtml(label)}${required ? " <span aria-hidden=\"true\">*</span>" : ""}</label>
                <input id="${escapeHtml(name)}" name="${escapeHtml(name)}" type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(value)}" ${required ? "required" : ""}>
                <p class="advisory-field-error" id="${escapeHtml(name)}Error" hidden></p>
            </div>`;
        }
        const multiple = type === "multi";
        return `<fieldset class="advisory-choice-fieldset industry-adaptive-field" data-industry-field="${escapeHtml(name)}">
            <legend>${escapeHtml(label)}${required ? " <span aria-hidden=\"true\">*</span>" : ""}</legend>
            <div class="advisory-choice-pills">${optionMarkup(name, options, value, multiple)}</div>
            <p class="advisory-field-error" id="${escapeHtml(name)}Error" hidden></p>
        </fieldset>`;
    }

    function syncField(application, target) {
        if (!(target instanceof HTMLInputElement) || !target.closest("[data-industry-adaptive]")) return;
        const name = target.name;
        if (!name) return;
        const answers = applicationAnswers(application);
        answers[name] = target.type === "checkbox"
            ? Array.from(document.querySelectorAll(`[data-industry-adaptive] input[name="${CSS.escape(name)}"]:checked`)).map((input) => input.value)
            : target.value;
        application.persist?.();
        application.saveProgress?.();
        application.saveNow?.();
    }

    function render(application) {
        const container = document.getElementById("storyContainer");
        if (!container || applicationMoment(application) !== 2) return;
        const profileKey = resolveProfile(resolveIndustry(application));
        container.querySelector("[data-industry-adaptive]")?.remove();
        if (!profileKey) return;
        const profile = PROFILE_RULES[profileKey];
        const section = document.createElement("section");
        section.className = "advisory-industry-adaptive";
        section.dataset.industryAdaptive = profileKey;
        section.innerHTML = `
            <div class="advisory-industry-adaptive__heading">
                <p class="advisory-field-help">INDUSTRY-SPECIFIC QUESTIONS</p>
                <h3>${escapeHtml(profile.title)}</h3>
                <p>${escapeHtml(profile.description)}</p>
            </div>
            <div class="advisory-field-group">${profile.fields.map((field) => fieldMarkup(field, applicationAnswers(application))).join("")}</div>`;
        container.appendChild(section);
    }

    function validate(application) {
        if (applicationMoment(application) !== 2) return true;
        const profileKey = resolveProfile(resolveIndustry(application));
        if (!profileKey) return true;
        const answers = applicationAnswers(application);
        let valid = true;
        for (const [name, , type, , required] of PROFILE_RULES[profileKey].fields) {
            if (!required) continue;
            const value = answers[name];
            const missing = type === "multi" ? !Array.isArray(value) || !value.length : clean(value) === "";
            const error = document.getElementById(`${name}Error`);
            if (error) {
                error.hidden = !missing;
                error.textContent = missing ? "Please answer this industry-specific question." : "";
            }
            if (missing) valid = false;
        }
        if (!valid) document.querySelector("[data-industry-adaptive]")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
        return valid;
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

        const originalContinue = application.continueFromMoment?.bind(application);
        if (originalContinue) {
            application.continueFromMoment = function industryAwareContinue(...args) {
                this.captureAllStoryInputs?.();
                if (!validate(this)) return false;
                return originalContinue(...args);
            };
        }

        document.addEventListener("input", (event) => syncField(application, event.target));
        document.addEventListener("change", (event) => syncField(application, event.target));
        const story = document.getElementById("storyContainer");
        if (story) new MutationObserver(() => queueMicrotask(() => render(application))).observe(story, { childList: true });
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
            if (install(findApplication()) || attempts >= 80) window.clearInterval(timer);
        }, 100);
    }

    window.GrowWithHRIndustryAdaptiveAssessment = Object.freeze({
        version: VERSION,
        profiles: PROFILE_RULES,
        resolveProfile,
        validate,
        install,
        render
    });
})();
