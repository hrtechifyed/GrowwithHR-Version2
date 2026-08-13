/* GrowWithHR founder assessment UX: guided industry search + lower-friction People step */
(() => {
    "use strict";

    const VERSION = "1.0.0-guided-industry-no-priority-gate";

    if (!document.body?.classList.contains("analyze-company-page")) return;

    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const normalise = (value) => clean(value)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    const GUIDED_ALIASES = Object.freeze([
        Object.freeze({
            label: "HR Consulting",
            canonical: "Consulting & Professional Services",
            terms: [
                "HR Consulting",
                "Human Resources Consulting",
                "People Consulting",
                "HR Advisory",
                "People Advisory"
            ]
        })
    ]);

    const aliasLookup = new Map();
    GUIDED_ALIASES.forEach((entry) => {
        entry.terms.forEach((term) => aliasLookup.set(normalise(term), entry.canonical));
        aliasLookup.set(normalise(entry.label), entry.canonical);
    });

    function injectStyles() {
        if (document.getElementById("growwithhrFounderUxStyles")) return;

        const style = document.createElement("style");
        style.id = "growwithhrFounderUxStyles";
        style.textContent = `
            .analyze-company-page .advisory-industry-combobox { position: relative; }
            .analyze-company-page .advisory-industry-suggestions {
                position: absolute;
                z-index: 1200;
                inset: calc(100% + 8px) 0 auto 0;
                width: 100%;
                max-height: 340px;
                overflow-y: auto;
                border: 1px solid rgba(255, 176, 0, 0.28);
                border-radius: 14px;
                padding: 6px;
                background: #111a2c;
                box-shadow: 0 22px 56px rgba(0, 0, 0, 0.42);
            }
            .analyze-company-page .advisory-industry-suggestions[hidden] { display: none !important; }
            .analyze-company-page .advisory-industry-option {
                display: grid;
                gap: 3px;
                width: 100%;
                border: 0;
                border-radius: 10px;
                padding: 11px 12px;
                color: #fff;
                background: transparent;
                text-align: left;
                cursor: pointer;
            }
            .analyze-company-page .advisory-industry-option:hover,
            .analyze-company-page .advisory-industry-option.is-active {
                background: rgba(255, 176, 0, 0.12);
                box-shadow: inset 0 0 0 1px rgba(255, 176, 0, 0.18);
            }
            .analyze-company-page .advisory-industry-option strong {
                font-size: 0.93rem;
                line-height: 1.25;
                color: #fff;
            }
            .analyze-company-page .advisory-industry-option small {
                font-size: 0.75rem;
                line-height: 1.35;
                color: #9aa8bc;
            }
            .analyze-company-page .advisory-industry-option mark {
                padding: 0;
                color: #ffcf66;
                background: transparent;
            }
            .analyze-company-page [data-field-wrapper="industry"] .advisory-field-help {
                margin-top: 9px;
            }
        `;
        document.head.appendChild(style);
    }

    function patchIndustryResolution(application) {
        const service = application?.industryCatalogService;
        if (!service || service.__growwithhrGuidedAliasesInstalled) return;

        const originalResolve = service.resolve.bind(service);
        service.resolve = function resolveGuidedIndustry(value) {
            const canonical = aliasLookup.get(normalise(value));
            return originalResolve(canonical || value);
        };

        Object.defineProperty(service, "__growwithhrGuidedAliasesInstalled", {
            value: true,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }

    function patchPeopleReadinessValidation(application) {
        if (!application || application.__growwithhrPriorityGateRemoved) return;

        const Validation = window.GrowWithHRModules?.AssessmentValidation;
        if (!Validation) return;

        application.validatePeopleReadiness = function validatePeopleReadinessWithoutPriorityGate() {
            const result = Validation.createResult(this.answers);
            Validation.requireText(
                result,
                "peopleFunction",
                "Choose the description closest to your current People or HR support."
            );

            result.normalizedAnswers.priorities = [];
            return this.applyValidationResult(result);
        };

        if (application.answers) application.answers.priorities = [];

        Object.defineProperty(application, "__growwithhrPriorityGateRemoved", {
            value: true,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }

    function highlight(label, query) {
        const source = clean(label);
        const q = clean(query);
        if (!q) return source;
        const index = source.toLowerCase().indexOf(q.toLowerCase());
        if (index < 0) return source;
        const before = source.slice(0, index);
        const match = source.slice(index, index + q.length);
        const after = source.slice(index + q.length);
        return `${before}<mark>${match}</mark>${after}`;
    }

    function buildSearchEntries(application) {
        const service = application?.industryCatalogService;
        const industries = typeof service?.getIndustries === "function"
            ? service.getIndustries()
            : (Array.isArray(application?.industryCatalog) ? application.industryCatalog : []);

        const entries = [];
        industries.forEach((industry) => {
            const canonical = clean(industry.name || industry.displayLabel);
            if (!canonical) return;

            entries.push({
                label: canonical,
                value: canonical,
                canonical,
                category: clean(industry.category),
                search: normalise([canonical, industry.category, ...(industry.aliases || [])].join(" ")),
                preferred: true
            });

            (industry.aliases || []).forEach((alias) => {
                const label = clean(alias);
                if (!label) return;
                entries.push({
                    label,
                    value: label,
                    canonical,
                    category: clean(industry.category),
                    search: normalise(`${label} ${canonical} ${industry.category || ""}`),
                    preferred: false
                });
            });
        });

        GUIDED_ALIASES.forEach((entry) => {
            entries.push({
                label: entry.label,
                value: entry.label,
                canonical: entry.canonical,
                category: "Professional & Business Services",
                search: normalise(`${entry.label} ${entry.terms.join(" ")} ${entry.canonical}`),
                preferred: true,
                guided: true
            });
        });

        return entries;
    }

    function scoreEntry(entry, query) {
        const q = normalise(query);
        if (!q) return Number.POSITIVE_INFINITY;

        const label = normalise(entry.label);
        const canonical = normalise(entry.canonical);
        const words = entry.search.split(/\s+/).filter(Boolean);

        if (label === q || canonical === q) return 0;
        if (label.startsWith(q)) return 1;
        if (canonical.startsWith(q)) return 2;
        if (words.some((word) => word.startsWith(q))) return 3;
        if (entry.search.includes(q)) return 4;

        const queryWords = q.split(/\s+/).filter(Boolean);
        if (queryWords.length > 1 && queryWords.every((word) => entry.search.includes(word))) return 5;

        return Number.POSITIVE_INFINITY;
    }

    function suggestionsFor(application, query) {
        const q = clean(query);
        if (!q) return [];

        const seen = new Set();
        return buildSearchEntries(application)
            .map((entry) => ({ entry, score: scoreEntry(entry, q) }))
            .filter((item) => Number.isFinite(item.score))
            .sort((a, b) => {
                if (a.score !== b.score) return a.score - b.score;
                if (a.entry.guided !== b.entry.guided) return a.entry.guided ? -1 : 1;
                if (a.entry.preferred !== b.entry.preferred) return a.entry.preferred ? -1 : 1;
                return a.entry.label.localeCompare(b.entry.label);
            })
            .filter(({ entry }) => {
                const key = `${normalise(entry.label)}|${normalise(entry.canonical)}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 8)
            .map(({ entry }) => entry);
    }

    function removePriorityQuestion(application) {
        const wrapper = application?.elements?.storyContainer
            ?.querySelector('[data-field-wrapper="priorities"]');
        if (wrapper) wrapper.remove();
    }

    function enhanceIndustryField(application) {
        const input = document.getElementById("industry");
        const wrapper = input?.closest('[data-field-wrapper="industry"]');
        if (!input || !wrapper || input.dataset.guidedIndustry === "true") return;

        input.dataset.guidedIndustry = "true";
        input.removeAttribute("list");
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("autocomplete", "off");

        wrapper.classList.add("advisory-industry-combobox");
        wrapper.querySelector("datalist")?.setAttribute("hidden", "hidden");

        const listbox = document.createElement("div");
        listbox.id = "industryGuidedOptions";
        listbox.className = "advisory-industry-suggestions";
        listbox.setAttribute("role", "listbox");
        listbox.hidden = true;
        input.setAttribute("aria-controls", listbox.id);
        input.insertAdjacentElement("afterend", listbox);

        let activeIndex = -1;
        let currentOptions = [];

        const close = () => {
            listbox.hidden = true;
            listbox.replaceChildren();
            input.setAttribute("aria-expanded", "false");
            input.removeAttribute("aria-activedescendant");
            activeIndex = -1;
            currentOptions = [];
        };

        const choose = (entry) => {
            input.value = entry.value;
            application.captureStoryInput?.(input);
            application.applyResolvedIndustry?.(input);
            application.clearFieldError?.("industry");
            application.updateDynamicVisibility?.();
            application.queueSave?.();
            close();
        };

        const setActive = (nextIndex) => {
            const buttons = Array.from(listbox.querySelectorAll(".advisory-industry-option"));
            if (!buttons.length) return;
            activeIndex = (nextIndex + buttons.length) % buttons.length;
            buttons.forEach((button, index) => button.classList.toggle("is-active", index === activeIndex));
            const active = buttons[activeIndex];
            input.setAttribute("aria-activedescendant", active.id);
            active.scrollIntoView({ block: "nearest" });
        };

        const render = () => {
            currentOptions = suggestionsFor(application, input.value);
            listbox.replaceChildren();
            activeIndex = -1;

            if (!currentOptions.length) {
                close();
                return;
            }

            currentOptions.forEach((entry, index) => {
                const button = document.createElement("button");
                button.type = "button";
                button.id = `industryGuidedOption${index}`;
                button.className = "advisory-industry-option";
                button.setAttribute("role", "option");
                button.innerHTML = `<strong>${highlight(entry.label, input.value)}</strong><small>${entry.canonical === entry.label ? entry.category : `${entry.canonical}${entry.category ? ` · ${entry.category}` : ""}`}</small>`;
                button.addEventListener("mousedown", (event) => event.preventDefault());
                button.addEventListener("click", () => choose(entry));
                listbox.appendChild(button);
            });

            listbox.hidden = false;
            input.setAttribute("aria-expanded", "true");
        };

        input.addEventListener("input", render);
        input.addEventListener("focus", () => {
            if (clean(input.value)) render();
        });
        input.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                if (listbox.hidden) render();
                setActive(activeIndex + 1);
                return;
            }
            if (event.key === "ArrowUp") {
                event.preventDefault();
                if (listbox.hidden) render();
                setActive(activeIndex - 1);
                return;
            }
            if (event.key === "Enter" && !listbox.hidden && activeIndex >= 0) {
                event.preventDefault();
                choose(currentOptions[activeIndex]);
                return;
            }
            if (event.key === "Escape") close();
        });
        input.addEventListener("blur", () => window.setTimeout(close, 120));
    }

    function enhance(application) {
        if (!application) return;
        injectStyles();
        patchIndustryResolution(application);
        patchPeopleReadinessValidation(application);
        removePriorityQuestion(application);
        enhanceIndustryField(application);

        const storyContainer = application.elements?.storyContainer;
        if (storyContainer && !storyContainer.__growwithhrFounderUxObserver) {
            const observer = new MutationObserver(() => {
                removePriorityQuestion(application);
                enhanceIndustryField(application);
            });
            observer.observe(storyContainer, { childList: true, subtree: true });
            Object.defineProperty(storyContainer, "__growwithhrFounderUxObserver", {
                value: observer,
                configurable: false,
                enumerable: false,
                writable: false
            });
        }

        window.GrowWithHRFounderAssessmentUX = Object.freeze({
            version: VERSION,
            guidedIndustryAutocomplete: true,
            hrConsultingAlias: true,
            priorityQuestionRemoved: true
        });
    }

    if (window.executiveAssessment) enhance(window.executiveAssessment);

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => {
        enhance(event?.detail?.application || window.executiveAssessment);
    });
})();
