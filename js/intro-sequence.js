/* ==========================================================
   GrowWithHR Executive Introduction Engine
   Version 2.1
   ----------------------------------------------------------
   Single fixed Story Stage: Hero → story cards → briefing cards → Coach.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const sections = {
        hero: document.getElementById("introHero"),
        messages: document.getElementById("introMessages"),
        cards: document.getElementById("introCards"),
        transition: document.getElementById("introTransition"),
        coach: document.getElementById("coachIntroduction")
    };

    const messageScenes = Array.from(document.querySelectorAll(".intro-scene"));
    const briefingCards = Array.from(document.querySelectorAll(".intro-card"));
    const coachLines = Array.from(document.querySelectorAll(".coach-line"));
    const coachTyping = document.getElementById("coachTyping");
    const introActions = document.getElementById("introActions");
    const skipButton = document.getElementById("skipIntro");
    const beginButton = document.getElementById("startAssessment");

    const state = {
        stepIndex: 0,
        timer: null,
        running: false,
        skipped: false,
        complete: false
    };

    const TIMING = {
        hero: 2800,
        message: 2300,
        lastMessage: 2600,
        card: 2400,
        transition: 2200,
        typing: 550,
        coach: 1450
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) {
        TIMING.hero = 900;
        TIMING.message = 700;
        TIMING.lastMessage = 900;
        TIMING.card = 900;
        TIMING.transition = 700;
        TIMING.typing = 150;
        TIMING.coach = 650;
    }

    function clearTimer() {
        if (state.timer !== null) {
            clearTimeout(state.timer);
            state.timer = null;
        }
    }

    function setActionsVisible(visible) {
        if (!introActions) return;

        introActions.classList.toggle("is-visible", visible);
        introActions.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    function hideAllSections() {
        Object.values(sections).forEach(section => {
            if (!section) return;

            section.classList.remove("is-active", "fade-in");
            section.classList.add("fade-out");
            section.setAttribute("aria-hidden", "true");
        });

        if (coachTyping) {
            coachTyping.classList.remove("active");
            coachTyping.setAttribute("aria-hidden", "true");
        }

        setActionsVisible(false);
    }

    function showSection(name) {
        const nextSection = sections[name];

        if (!nextSection) return;

        Object.values(sections).forEach(section => {
            if (!section) return;

            const active = section === nextSection;

            section.classList.toggle("is-active", active);
            section.classList.toggle("fade-in", active);
            section.classList.toggle("fade-out", !active);
            section.setAttribute("aria-hidden", active ? "false" : "true");
        });
    }

    function activate(list, index) {
        list.forEach((item, itemIndex) => {
            const active = itemIndex === index;

            item.classList.toggle("active", active);
            item.setAttribute("aria-hidden", active ? "false" : "true");
        });

        if (list === coachLines && coachTyping) {
            coachTyping.classList.remove("active");
            coachTyping.setAttribute("aria-hidden", "true");
        }
    }

    function setTransitionMessage() {
        const transitionMessage = document.getElementById("transitionMessage");

        if (!transitionMessage) return;

        transitionMessage.textContent = "Coach HRTechify is ready to guide your assessment.";
    }

    const timeline = [
        { section: "hero", duration: TIMING.hero, action: () => {} },
        { section: "messages", duration: TIMING.message, action: () => activate(messageScenes, 0) },
        { section: "messages", duration: TIMING.message, action: () => activate(messageScenes, 1) },
        { section: "messages", duration: TIMING.message, action: () => activate(messageScenes, 2) },
        { section: "messages", duration: TIMING.lastMessage, action: () => activate(messageScenes, 3) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 0) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 1) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 2) },
        { section: "transition", duration: TIMING.transition, action: setTransitionMessage },
        ...coachLines.map((line, index) => ({
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, index)
        }))
    ];

    function next(delay) {
        clearTimer();

        if (!state.running || state.skipped || state.complete) return;

        state.timer = setTimeout(runTimeline, Math.max(0, delay));
    }

    function completeIntro() {
        state.running = false;
        state.complete = true;
        setActionsVisible(true);
    }

    function runTimeline() {
        if (state.skipped || state.complete) return;

        if (state.stepIndex >= timeline.length) {
            completeIntro();
            return;
        }

        const step = timeline[state.stepIndex];

        showSection(step.section);

        if (step.section === "coach") {
            if (coachTyping) {
                coachTyping.classList.add("active");
                coachTyping.setAttribute("aria-hidden", "false");
            }

            clearTimer();
            state.timer = setTimeout(() => {
                if (coachTyping) {
                    coachTyping.classList.remove("active");
                    coachTyping.setAttribute("aria-hidden", "true");
                }

                step.action();
                state.stepIndex += 1;
                next(step.duration);
            }, TIMING.typing);

            return;
        }

        step.action();
        state.stepIndex += 1;
        next(step.duration);
    }

    function startTimeline() {
        clearTimer();
        state.running = true;
        state.skipped = false;
        state.complete = false;
        state.stepIndex = 0;

        hideAllSections();
        activate(messageScenes, -1);
        activate(briefingCards, -1);
        activate(coachLines, -1);

        runTimeline();
    }

    function stopTimeline() {
        clearTimer();
        state.running = false;

        if (coachTyping) {
            coachTyping.classList.remove("active");
            coachTyping.setAttribute("aria-hidden", "true");
        }
    }

    function resetTimeline() {
        clearTimer();
        state.running = false;
        state.skipped = false;
        state.complete = false;
        state.stepIndex = 0;

        hideAllSections();
        activate(messageScenes, -1);
        activate(briefingCards, -1);
        activate(coachLines, -1);
    }

    function startAssessment() {
        stopTimeline();

        const landingScreen = document.getElementById("landingScreen");
        const conversationWorkspace = document.getElementById("conversationWorkspace");

        if (skipButton) skipButton.hidden = true;
        if (landingScreen) landingScreen.hidden = true;
        if (conversationWorkspace) conversationWorkspace.hidden = false;

        if (
            window.executiveAssessment &&
            typeof window.executiveAssessment.start === "function"
        ) {
            window.executiveAssessment.start();
        }
    }

    function skipIntroduction() {
        if (state.skipped) return;

        state.skipped = true;
        clearTimer();
        stopTimeline();
        showSection("coach");
        activate(coachLines, Math.max(0, coachLines.length - 1));
        completeIntro();

        const beginTarget = beginButton || introActions;
        if (beginTarget && typeof beginTarget.scrollIntoView === "function") {
            beginTarget.scrollIntoView({ block: "center", inline: "center" });
        }

        if (beginButton && typeof beginButton.focus === "function") {
            beginButton.focus({ preventScroll: true });
        }
    }

    if (skipButton) skipButton.addEventListener("click", skipIntroduction);
    if (beginButton) beginButton.addEventListener("click", startAssessment);

    document.addEventListener("visibilitychange", () => {
        if (!state.running) return;

        if (document.hidden) {
            clearTimer();
        } else {
            runTimeline();
        }
    });

    window.introEngine = {
        start: startTimeline,
        stop: stopTimeline,
        reset: resetTimeline,
        next: runTimeline,
        skip: skipIntroduction,
        startAssessment,
        restart: startTimeline,
        state
    };

    window.introDebug = {
        hero() {
            showSection("hero");
        },
        messages(index = 0) {
            showSection("messages");
            activate(messageScenes, index);
        },
        cards(index = 0) {
            showSection("cards");
            activate(briefingCards, index);
        },
        transition() {
            showSection("transition");
            setTransitionMessage();
        },
        coach(index = 0) {
            showSection("coach");
            activate(coachLines, index);
            setActionsVisible(index >= coachLines.length - 1);
        },
        restart() {
            startTimeline();
        }
    };

    messageScenes.forEach(scene => scene.setAttribute("aria-hidden", "true"));
    briefingCards.forEach(card => card.setAttribute("aria-hidden", "true"));
    coachLines.forEach(line => line.setAttribute("aria-hidden", "true"));
    setActionsVisible(false);

    startTimeline();
    window.startAssessment = startAssessment;
});
