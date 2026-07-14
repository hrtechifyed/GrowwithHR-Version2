/* ==========================================================
   GrowWithHR Executive Introduction Engine
   Version 1.0
   ----------------------------------------------------------
   Controls:
   • Hero
   • Intro Messages
   • Executive Briefing Cards
   • Transition
   • Coach
   • CTA
   • Skip Introduction
   • Assessment Handoff

   DO NOT MODIFY THIS FILE STRUCTURE.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* ==========================================================
       DOM REFERENCES
    ========================================================== */

    const sections = {

        hero: document.getElementById("introHero"),

        messages: document.getElementById("introMessages"),

        cards: document.getElementById("introCards"),

        transition: document.getElementById("introTransition"),

        coach: document.getElementById("coachIntroduction"),

        actions: document.getElementById("introActions")

    };

    const messageScenes = Array.from(
        document.querySelectorAll(".intro-scene")
    );

    const briefingCards = Array.from(
        document.querySelectorAll(".intro-card")
    );

    const coachLines = Array.from(
        document.querySelectorAll(".coach-line")
    );

    const skipButton =
        document.getElementById("skipIntro");

    const beginButton =
        document.getElementById("beginConversation");

    /* ==========================================================
       ENGINE STATE
    ========================================================== */

    const state = {

        stepIndex: 0,

        timer: null,

        running: false,

        skipped: false

    };

    /* ==========================================================
       TIMINGS
    ========================================================== */

    const TIMING = {

        hero: 2000,

        message: 2000,

        lastMessage: 2500,

        card: 2250,

        transition: 2000,

        coach: 1900

    };

    /* ==========================================================
       HELPERS
    ========================================================== */

    function clearTimer() {

        if (state.timer) {

            clearTimeout(state.timer);

            state.timer = null;

        }

    }

   /* ==========================================================
   FADE TRANSITION ENGINE
========================================================== */

function hideAllSections() {

    Object.values(sections).forEach(section => {

        if (!section) return;

        section.classList.remove(
            "is-active",
            "fade-in"
        );

        section.classList.add("fade-out");

    });

}

function showSection(name) {

    const nextSection = sections[name];

    if (!nextSection) return;

    hideAllSections();

    requestAnimationFrame(() => {

        nextSection.classList.remove("fade-out");

        nextSection.classList.add(
            "is-active",
            "fade-in"
        );

    });

}

    function activate(list, index) {

        list.forEach(item => {

            item.classList.remove("active");

        });

        if (list[index]) {

            list[index].classList.add("active");

        }

    }

    function next(delay) {

        clearTimer();

        state.timer = setTimeout(runTimeline, delay);

    }

    /* ==========================================================
       TIMELINE
       (continues in Part 2)
    ========================================================== */


                              const timeline = [

        /* --------------------------------------------------
           HERO
        -------------------------------------------------- */

        {
            section: "hero",
            duration: TIMING.hero,
            action: () => {}
        },

        /* --------------------------------------------------
           INTRO MESSAGES
        -------------------------------------------------- */

        {
            section: "messages",
            duration: TIMING.message,
            action: () => activate(messageScenes, 0)
        },

        {
            section: "messages",
            duration: TIMING.message,
            action: () => activate(messageScenes, 1)
        },

        {
            section: "messages",
            duration: TIMING.lastMessage,
            action: () => activate(messageScenes, 2)
        },

        /* --------------------------------------------------
           EXECUTIVE BRIEFING
        -------------------------------------------------- */

        {
            section: "cards",
            duration: TIMING.card,
            action: () => activate(briefingCards, 0)
        },

        {
            section: "cards",
            duration: TIMING.card,
            action: () => activate(briefingCards, 1)
        },

        {
            section: "cards",
            duration: TIMING.card,
            action: () => activate(briefingCards, 2)
        },

        {
            section: "cards",
            duration: TIMING.card,
            action: () => activate(briefingCards, 3)
        },

        {
            section: "cards",
            duration: TIMING.card,
            action: () => activate(briefingCards, 4)
        },

        {
            section: "cards",
            duration: TIMING.card,
            action: () => activate(briefingCards, 5)
        },

        /* --------------------------------------------------
           TRANSITION
        -------------------------------------------------- */

        {
            section: "transition",
            duration: TIMING.transition,
            action: () => {}
        },

        /* --------------------------------------------------
           COACH
        -------------------------------------------------- */

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 0)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 1)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 2)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 3)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 4)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 5)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 6)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 7)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 8)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 9)
        },

        {
            section: "coach",
            duration: TIMING.coach,
            action: () => activate(coachLines, 10)
        },

        /* --------------------------------------------------
           CTA
        -------------------------------------------------- */

        {
            section: "actions",
            duration: 0,
            action: () => {}
        }

    ];

    /* ==========================================================
       TIMELINE PLAYER
       (continues in Part 3)
    ========================================================== */


      function runTimeline() {

        if (state.skipped) {

            return;

        }

        if (state.stepIndex >= timeline.length) {

            return;

        }

        const step = timeline[state.stepIndex];

        showSection(step.section);

        if (typeof step.action === "function") {

            step.action();

        }

        state.stepIndex++;

        if (step.duration > 0) {

            next(step.duration);

        }

    }

    /* ==========================================================
       ENGINE CONTROLS
    ========================================================== */

    function startTimeline() {

        clearTimer();

        state.stepIndex = 0;

        state.running = true;

        state.skipped = false;

        runTimeline();

    }

    function stopTimeline() {

        clearTimer();

        state.running = false;

    }

    function resetTimeline() {

        stopTimeline();

        state.stepIndex = 0;

        state.skipped = false;

        hideAllSections();

        activate(messageScenes, -1);

        activate(briefingCards, -1);

        activate(coachLines, -1);

    }

    /* ==========================================================
       PUBLIC API
    ========================================================== */

    window.introEngine = {

        start: startTimeline,

        stop: stopTimeline,

        reset: resetTimeline,

        next: runTimeline,

        state

    };

    /* ==========================================================
       INTRODUCTION ENTRY POINT
       (continues in Part 4)
    ========================================================== */

       /* ==========================================================
       ASSESSMENT HANDOFF
    ========================================================== */

    function startAssessment() {

        stopTimeline();

        hideAllSections();

        /*
         * =====================================================
         * IMPORTANT
         *
         * DO NOT CHANGE THIS FUNCTION.
         *
         * We will connect it to the existing
         * executive-assessment.js in Part 8.
         *
         * Until then this is simply a placeholder.
         * =====================================================
         */

        console.log("Starting Executive Assessment...");

    }

    /* ==========================================================
       SKIP INTRODUCTION
    ========================================================== */

    function skipIntroduction() {

        state.skipped = true;

        startAssessment();

    }

    /* ==========================================================
       CTA
    ========================================================== */

    function beginConversation() {

        startAssessment();

    }

    /* ==========================================================
       EVENT LISTENERS
    ========================================================== */

    if (skipButton) {

        skipButton.addEventListener(

            "click",

            skipIntroduction

        );

    }

    if (beginButton) {

        beginButton.addEventListener(

            "click",

            beginConversation

        );

    }

    /* ==========================================================
       PAGE VISIBILITY
       Pause timeline when browser tab loses focus.
    ========================================================== */

    document.addEventListener(

        "visibilitychange",

        () => {

            if (!state.running) {

                return;

            }

            if (document.hidden) {

                clearTimer();

            } else {

                runTimeline();

            }

        }

    );

    /* ==========================================================
       INITIALIZATION
       (continues in Part 5)
    ========================================================== */

          function initialize() {

        /*
         * Reset everything to a known state.
         */

        resetTimeline();

        /*
         * Hero is always the first experience.
         */

        showSection("hero");

        /*
         * Give the user a moment before
         * beginning the sequence.
         */

        state.running = true;

        state.timer = setTimeout(() => {

            state.stepIndex = 1;

            runTimeline();

        }, TIMING.hero);

    }

    /* ==========================================================
       DEBUG UTILITIES
       (Available only from browser console)
    ========================================================== */

    window.introDebug = {

        hero() {

            showSection("hero");

        },

        messages() {

            showSection("messages");

        },

        cards() {

            showSection("cards");

        },

        transition() {

            showSection("transition");

        },

        coach() {

            showSection("coach");

        },

        actions() {

            showSection("actions");

        },

        restart() {

            initialize();

        }

    };

    /* ==========================================================
       ACCESSIBILITY
    ========================================================== */

    const prefersReducedMotion = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    );

    if (prefersReducedMotion.matches) {

        TIMING.hero = 500;

        TIMING.message = 500;

        TIMING.lastMessage = 700;

        TIMING.card = 700;

        TIMING.transition = 500;

        TIMING.coach = 700;

    }

    /* ==========================================================
       START ENGINE
       (continues in Part 6)
    ========================================================== */

   initialize();

});
                          
