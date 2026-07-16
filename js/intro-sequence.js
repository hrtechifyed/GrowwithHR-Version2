/* ==========================================================
   GrowWithHR Executive Advisory Presentation Engine
   Time-driven shared-stage stack: Brand → story → briefing → invitation.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const e2eMode = new URLSearchParams(window.location.search).get("e2e") === "1";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sections = {
        hero: document.getElementById("introHero"),
        messages: document.getElementById("introMessages"),
        cards: document.getElementById("introCards"),
        transition: document.getElementById("introTransition"),
        coach: document.getElementById("coachIntroduction")
    };

    const stage = document.querySelector(".intro-stage");
    const messageScenes = Array.from(document.querySelectorAll(".intro-scene"));
    const briefingCards = Array.from(document.querySelectorAll(".intro-card"));
    const transitionScenes = Array.from(document.querySelectorAll(".intro-transition-scene"));
    const welcomeCard = document.querySelector(".advisory-welcome-card");
    const introActions = document.getElementById("introActions");
    const skipButton = document.getElementById("skipIntro");
    const beginButton = document.getElementById("startAssessment");

    const TIMING = e2eMode ? {
        hero: 250,
        scene: 220,
        card: 220,
        transition: 120,
        welcome: 220
    } : prefersReducedMotion.matches ? {
        hero: 700,
        scene: 800,
        card: 800,
        transition: 120,
        welcome: 900
    } : {
        hero: 2000,
        scene: 2700,
        card: 2700,
        transition: 650,
        welcome: 1750
    };

    const state = {
        timer: null,
        transitionTimer: null,
        index: 0,
        running: false,
        paused: false,
        activePanel: null,
        activeItem: null,
        advisoryState: "brand"
    };

    const steps = [
        { advisoryState: "brand", section: "hero", item: sections.hero, duration: TIMING.hero },
        ...messageScenes.map((item, index) => ({ advisoryState: "story", section: "messages", item, duration: TIMING.scene, index })),
        ...briefingCards.map((item, index) => ({ advisoryState: "briefing", section: "cards", item, duration: TIMING.card, index })),
        { advisoryState: "invitation", section: "transition", item: transitionScenes[0], duration: Infinity }
    ].filter(step => step.item);

    function clearTimers() {
        if (state.timer) clearTimeout(state.timer);
        if (state.transitionTimer) clearTimeout(state.transitionTimer);
        state.timer = null;
        state.transitionTimer = null;
    }

    function setHidden(element, hidden) {
        if (!element) return;
        element.classList.toggle("is-hidden", hidden);
        element.setAttribute("aria-hidden", hidden ? "true" : "false");
        if (hidden) element.setAttribute("inert", "");
        else element.removeAttribute("inert");
    }


    function setActionsVisible(visible) {
        if (!introActions) return;

        introActions.classList.toggle("is-visible", visible);
        introActions.setAttribute("aria-hidden", visible ? "false" : "true");

        if (visible) introActions.removeAttribute("inert");
        else introActions.setAttribute("inert", "");

        if (beginButton) {
            beginButton.disabled = false;
            beginButton.tabIndex = visible ? 0 : -1;
        }
    }

    function resetItems() {
        [...messageScenes, ...briefingCards, ...transitionScenes].forEach(item => {
            item.classList.remove("is-active", "is-entering", "is-behind", "is-leaving", "active");
            setHidden(item, true);
        });
        if (welcomeCard) {
            welcomeCard.classList.remove("is-active", "is-entering", "is-behind", "is-leaving");
            welcomeCard.hidden = true;
            setHidden(welcomeCard, true);
        }
    }

    function showSection(name) {
        Object.entries(sections).forEach(([key, section]) => {
            if (!section) return;
            const active = key === name;
            section.classList.toggle("is-active", active);
            section.classList.toggle("fade-in", active);
            section.classList.toggle("fade-out", !active);
            section.setAttribute("aria-hidden", active ? "false" : "true");
            if (!active) section.setAttribute("inert", "");
            else section.removeAttribute("inert");
        });
    }

    function activateItem(nextItem) {
        const previous = state.activeItem;

        if (previous && previous !== nextItem) {
            previous.classList.remove("is-active", "is-entering", "active");
            previous.classList.add("is-behind");
            setHidden(previous, false);
            state.transitionTimer = setTimeout(() => {
                previous.classList.remove("is-behind", "is-leaving");
                setHidden(previous, true);
            }, TIMING.transition);
        }

        nextItem.hidden = false;
        setHidden(nextItem, false);
        nextItem.classList.remove("is-hidden", "is-behind", "is-leaving");
        nextItem.classList.add("is-entering", "is-active", "active");
        state.activeItem = nextItem;
    }

    function completeIntro() {
        state.running = false;
        state.complete = true;
        setActionsVisible(true);
    }

    function runStep() {
        if (!state.running || state.paused) return;
        const step = steps[state.index];
        if (!step) return;

        state.advisoryState = step.advisoryState;
        if (stage) stage.dataset.state = step.advisoryState;
        showSection(step.section);
        activateItem(step.item);
        setActionsVisible(step.advisoryState === "invitation");

        if (step.advisoryState === "invitation") {
            state.running = false;
            if (beginButton) beginButton.focus({ preventScroll: true });
            return;
        }

        state.timer = setTimeout(() => {
            state.index += 1;
            runStep();
        }, step.duration);
    }

    function startTimeline() {
        clearTimers();
        resetItems();
        setActionsVisible(false);
        state.index = 0;
        state.running = true;
        state.paused = false;
        state.activeItem = null;
        runStep();
    }

    function showInvitationImmediately() {
        clearTimers();
        resetItems();
        state.index = steps.length - 1;
        state.running = false;
        state.paused = false;
        const finalStep = steps[state.index];
        if (!finalStep) return;
        showSection(finalStep.section);
        activateItem(finalStep.item);
        setActionsVisible(true);

        const beginTarget = beginButton || introActions;
        if (beginTarget && typeof beginTarget.scrollIntoView === "function") {
            beginTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (beginButton) beginButton.focus({ preventScroll: true });
    }

    function skipIntroduction() {
        showInvitationImmediately();
    }

    function beginAssessment() {
        if (!beginButton || beginButton.disabled) return;
        clearTimers();
        beginButton.disabled = true;
        setActionsVisible(false);
        showSection("coach");
        resetItems();
        if (welcomeCard) {
            welcomeCard.hidden = false;
            setHidden(welcomeCard, false);
            welcomeCard.classList.add("is-active", "is-entering");
            state.activeItem = welcomeCard;
        }
        if (stage) stage.dataset.state = "welcome";

        state.timer = setTimeout(() => {
            if (window.executiveAssessment && typeof window.executiveAssessment.startAssessment === "function") {
                window.executiveAssessment.startAssessment();
            }
        }, TIMING.welcome);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            state.paused = true;
            clearTimers();
        } else if (state.running) {
            state.paused = false;
            runStep();
        }
    });

    if (skipButton) skipButton.addEventListener("click", skipIntroduction);
    if (beginButton) beginButton.addEventListener("click", beginAssessment);

    window.introSequence = {
        start: startTimeline,
        showInvitation: showInvitationImmediately,
        skipIntroduction,
        beginAssessment,
        getState: () => ({ ...state })
    };

    startTimeline();
});
