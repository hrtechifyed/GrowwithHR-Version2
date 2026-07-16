/* ==========================================================
   GrowWithHR Executive Introduction Engine
   Version 2.0
   ----------------------------------------------------------
   Persistent hero + anchored story stage.
   The hero is not part of the animated timeline.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const sections = {
        messages: document.getElementById("introMessages"),
        cards: document.getElementById("introCards"),
        transition: document.getElementById("introTransition"),
        coach: document.getElementById("coachIntroduction"),
        actions: document.getElementById("introActions")
    };

    const hero = document.getElementById("introHero");
    const messageScenes = Array.from(document.querySelectorAll(".intro-scene"));
    const briefingCards = Array.from(document.querySelectorAll(".intro-card"));
    const coachLines = Array.from(document.querySelectorAll(".coach-line"));
    const coachTyping = document.getElementById("coachTyping");
    const skipButton = document.getElementById("skipIntro");
    const beginButton = document.getElementById("startAssessment");

    const state = {
        stepIndex: 0,
        timer: null,
        running: false,
        skipped: false
    };

    const TIMING = {
        message: 2000,
        lastMessage: 2500,
        card: 2250,
        transition: 3500,
        typing: 700,
        coach: 1900,
        cta: 800
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) {
        TIMING.message = 500;
        TIMING.lastMessage = 700;
        TIMING.card = 700;
        TIMING.transition = 500;
        TIMING.typing = 250;
        TIMING.coach = 700;
        TIMING.cta = 300;
    }

    function clearTimer() {
        if (state.timer !== null) {
            clearTimeout(state.timer);
            state.timer = null;
        }
    }

    function setHeroVisible() {
        if (!hero) return;
        hero.classList.add("is-visible");
        hero.setAttribute("aria-hidden", "false");
    }

    function hideAllStageSections() {
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

        transitionMessage.textContent =
            "Every recommendation begins with understanding your organisation.";
    }

    const timeline = [
        { section: "messages", duration: TIMING.message, action: () => activate(messageScenes, 0) },
        { section: "messages", duration: TIMING.message, action: () => activate(messageScenes, 1) },
        { section: "messages", duration: TIMING.lastMessage, action: () => activate(messageScenes, 2) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 0) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 1) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 2) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 3) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 4) },
        { section: "cards", duration: TIMING.card, action: () => activate(briefingCards, 5) },
        { section: "transition", duration: TIMING.transition, action: setTransitionMessage },
        ...coachLines.map((line, index) => ({
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, index)
        })),
        { section: "actions", duration: TIMING.cta, action: () => sections.actions?.classList.add("is-active") }
    ];

    function next(delay) {
        clearTimer();

        if (!state.running || state.skipped) return;

        state.timer = setTimeout(runTimeline, Math.max(0, delay));
    }

    function runTimeline() {
        if (state.skipped) return;

        if (state.stepIndex >= timeline.length) {
            startAssessment();
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
        state.stepIndex = 0;

        setHeroVisible();
        hideAllStageSections();
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
        state.stepIndex = 0;

        setHeroVisible();
        hideAllStageSections();
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
        startAssessment();
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
        messages() {
            showSection("messages");
            activate(messageScenes, 0);
        },
        cards() {
            showSection("cards");
            activate(briefingCards, 0);
        },
        transition() {
            showSection("transition");
            setTransitionMessage();
        },
        coach() {
            showSection("coach");
            activate(coachLines, 0);
        },
        actions() {
            showSection("actions");
        },
        restart() {
            startTimeline();
        }
    };

    messageScenes.forEach(scene => scene.setAttribute("aria-hidden", "true"));
    briefingCards.forEach(card => card.setAttribute("aria-hidden", "true"));
    coachLines.forEach(line => line.setAttribute("aria-hidden", "true"));

    startTimeline();
    window.startAssessment = startAssessment;
});
