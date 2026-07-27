/* GrowWithHR v0.21 compact story-page presentation */
(() => {
    "use strict";

    const VERSION = "0.21.0-story-visual-sections";
    const INSTALL_FLAG = "__growwithhrStoryVisualSectionsInstalled";
    const COPY = Object.freeze({
        "business-basics": {
            eyebrow: "Business snapshot",
            title: "Tell us the essentials.",
            description: "Three quick answers about the organisation.",
            legacyTitle: "Let’s start with the business you’re building."
        },
        "business-stage": {
            eyebrow: "Business snapshot",
            title: "Where is the business today?",
            description: "Approximate answers are fine.",
            legacyTitle: "Give us a little context around its stage."
        },
        workforce: {
            eyebrow: "People",
            title: "Who works with the organisation?",
            description: "Only relevant workforce questions will appear.",
            legacyTitle: "Who helps the organisation deliver?"
        },
        "working-model": {
            eyebrow: "People",
            title: "How does the team work?",
            description: "Choose the closest everyday working pattern.",
            legacyTitle: "How does the team usually work?"
        },
        "operating-footprint": {
            eyebrow: "Operations",
            title: "Where does work happen?",
            description: "Locations and operating reach shape the advice.",
            legacyTitle: "How distributed are your operations?"
        },
        "growth-direction": {
            eyebrow: "Next 12 months",
            title: "What is changing next?",
            description: "Select the changes most likely to affect your team.",
            legacyTitle: "What is likely to change next?"
        },
        "people-readiness": {
            eyebrow: "People support",
            title: "How are people decisions managed?",
            description: "A final snapshot of ownership and priorities.",
            legacyTitle: "How are people decisions supported today?"
        }
    });

    function ensureStylesheet() {
        if (document.querySelector('link[data-growwithhr-story-visual-sections]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL("css/21-story-visual-sections.css", window.location.href).href;
        link.dataset.growwithhrStoryVisualSections = VERSION;
        document.head.appendChild(link);
    }

    function application() {
        return window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    }

    function visibleQuestionCards(container) {
        return [...container.querySelectorAll(".advisory-question-card")]
            .filter((card) => !card.hidden && card.getClientRects().length > 0);
    }

    function addQuickGuide(app, container) {
        const description = app?.elements?.stepDescription || document.getElementById("stepDescription");
        if (!description) return;
        let guide = document.getElementById("storyQuickGuide");
        if (!guide) {
            guide = document.createElement("div");
            guide.id = "storyQuickGuide";
            guide.className = "advisory-story-quick-guide";
            guide.setAttribute("aria-live", "polite");
            description.insertAdjacentElement("afterend", guide);
        }
        const count = visibleQuestionCards(container).length;
        const content = [
            `<span><strong>${count || 1}</strong> ${count === 1 ? "question" : "questions"}</span>`,
            "<span>Answer only what applies</span>",
            "<span>Saved automatically</span>"
        ].join("");
        if (guide.innerHTML !== content) guide.innerHTML = content;
    }

    function createHelpDisclosure(help, card) {
        if (!help?.textContent?.trim() || card.querySelector(".advisory-help-disclosure")) return;
        help.classList.add("advisory-field-help--compact-source");
        const disclosure = document.createElement("details");
        disclosure.className = "advisory-help-disclosure";
        disclosure.innerHTML = `<summary>Why this matters</summary><p>${help.textContent.trim()}</p>`;
        card.appendChild(disclosure);
    }

    function findHelperCopy(card) {
        const candidates = [...card.querySelectorAll("p")];
        return candidates.find((paragraph) => {
            if (!paragraph.textContent?.trim()) return false;
            if (paragraph.closest(".advisory-help-disclosure")) return false;
            if (paragraph.matches(".advisory-field-error, [role='alert']")) return false;
            return true;
        }) || null;
    }

    function decorateCards(container) {
        container.querySelectorAll(".advisory-field-group").forEach((group) => {
            group.classList.add("advisory-field-group--sectioned");
            [...group.children].forEach((child) => {
                if (!(child instanceof HTMLElement) || child.hidden) return;
                if (!child.matches(".advisory-field, .advisory-choice-fieldset, .industry-adaptive-field, [data-field-wrapper]")) return;
                child.classList.add("advisory-question-card");
                const choiceCount = child.querySelectorAll('input[type="radio"], input[type="checkbox"]').length;
                if (child.querySelector("textarea") || child.matches("fieldset") || choiceCount > 4 || child.classList.contains("advisory-field--nested")) {
                    child.classList.add("advisory-question-card--wide");
                }
                const help = findHelperCopy(child);
                if (help) createHelpDisclosure(help, child);
            });
        });
    }

    function compactCopy(app) {
        const moment = window.GrowWithHRModules?.AssessmentDefinition?.MOMENTS?.[
            Number(app?.currentMoment ?? app?.stateModel?.currentMoment ?? 0)
        ];
        const copy = COPY[moment?.id];
        if (!copy) return;
        const eyebrow = app?.elements?.storyEyebrow || document.getElementById("storyEyebrow");
        const title = app?.elements?.stepTitle || document.getElementById("stepTitle");
        const description = app?.elements?.stepDescription || document.getElementById("stepDescription");
        if (eyebrow && eyebrow.textContent !== copy.eyebrow) eyebrow.textContent = copy.eyebrow;
        if (title) {
            const content = `<span class="advisory-visible-step-title">${copy.title}</span><span class="advisory-visually-hidden" aria-hidden="true">${copy.legacyTitle || ""}</span>`;
            if (title.innerHTML !== content) title.innerHTML = content;
        }
        if (description && description.textContent !== copy.description) description.textContent = copy.description;
    }

    function decorate(app = application()) {
        ensureStylesheet();
        const container = app?.elements?.storyContainer || document.getElementById("storyContainer");
        if (!container) return false;
        document.body.classList.add("advisory-compact-story");
        compactCopy(app);
        decorateCards(container);
        addQuickGuide(app, container);
        container.dataset.visualSectionVersion = VERSION;
        return true;
    }

    function install(app = application()) {
        if (!app) return false;
        if (app[INSTALL_FLAG]) {
            queueMicrotask(() => decorate(app));
            return true;
        }
        Object.defineProperty(app, INSTALL_FLAG, { value: VERSION });
        const originalRender = app.renderCurrentMoment?.bind(app);
        if (originalRender) {
            app.renderCurrentMoment = function renderVisualStory(...args) {
                const result = originalRender(...args);
                queueMicrotask(() => decorate(this));
                return result;
            };
        }
        document.addEventListener("input", () => queueMicrotask(() => decorate(app)), true);
        document.addEventListener("change", () => queueMicrotask(() => decorate(app)), true);
        queueMicrotask(() => decorate(app));
        return true;
    }

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => install(event.detail?.application));
    install();

    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;
        if (install() || attempts >= 120) window.clearInterval(timer);
    }, 100);

    window.GrowWithHRStoryVisualSections = Object.freeze({
        version: VERSION,
        ensureStylesheet,
        install,
        decorate,
        copy: COPY
    });
})();
