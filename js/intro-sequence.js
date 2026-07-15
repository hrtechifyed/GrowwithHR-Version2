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
   
const coachTyping =
    document.getElementById("coachTyping");

const TYPING_DELAY = 700;

    const skipButton =
        document.getElementById("skipIntro");

   const beginButton =
    document.getElementById("startAssessment");
   
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

    transition: 3500,

    typing: 700,

    coach: 1900,

    cta: 800

};

   
/* ==========================================================
       HELPERS
    ========================================================== */

function clearTimer() {

    if (state.timer !== null) {

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

        if (section === nextSection) {

            section.classList.remove("fade-out");

            section.classList.add(
                "is-active",
                "fade-in"
            );

        } else {

            section.classList.remove(
                "is-active",
                "fade-in"
            );

            section.classList.add("fade-out");

        }

    });

}
function activate(list, index) {

    list.forEach((item, itemIndex) => {

        const active = itemIndex === index;

        item.classList.toggle("active", active);

        item.setAttribute(
            "aria-hidden",
            active ? "false" : "true"
        );

    });

    if (list === coachLines && coachTyping) {

        coachTyping.classList.remove("active");

    }

}
   
   
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
        action: () => {

            const transitionMessage =
                document.getElementById("transitionMessage");

            if (!transitionMessage) return;

            transitionMessage.textContent =
                "Every recommendation begins with understanding your organisation.";

        }
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
    duration: TIMING.cta,

    action: () => {

        const actions = document.getElementById("introActions");

        if (!actions) return;

        actions.classList.add("is-active");

    }

}

];

function next(delay) {

    clearTimer();

    if (!state.running || state.skipped) {

        return;

    }

    state.timer = setTimeout(runTimeline, Math.max(0, delay));

}

    /* ==========================================================
       TIMELINE PLAYER
    ========================================================== */

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

        }

        if (typeof step.action === "function") {

            step.action();

        }

        state.stepIndex++;

        next(step.duration);

    }, TYPING_DELAY);

    return;

}

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

    state.running = true;

    state.skipped = false;

    state.stepIndex = 0;

    showSection("hero");

    activate(messageScenes, -1);

    activate(briefingCards, -1);

    activate(coachLines, -1);

    if (coachTyping) {

        coachTyping.classList.remove("active");

    }

    next(TIMING.hero);

}

function stopTimeline() {

    clearTimer();

    state.running = false;

    if (coachTyping) {

        coachTyping.classList.remove("active");

    }

}

function resetTimeline() {

    clearTimer();

    state.running = false;

    state.skipped = false;

    state.stepIndex = 0;

    hideAllSections();

    activate(messageScenes, -1);

    activate(briefingCards, -1);

    activate(coachLines, -1);

    if (coachTyping) {

        coachTyping.classList.remove("active");

    }

    showSection("hero");

}

   
    /* ==========================================================
       PUBLIC API
    ========================================================== */

window.introEngine = {

    start: startTimeline,

    stop: stopTimeline,

    reset: resetTimeline,

    next: runTimeline,

    skip: skipIntroduction,

    startAssessment,

    restart: initialize,

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

    const landingScreen =
        document.getElementById("landingScreen");

    const conversationWorkspace =
        document.getElementById("conversationWorkspace");

    if (skipButton) {

        skipButton.hidden = true;

    }

    if (landingScreen) {

        landingScreen.hidden = true;

    }

    if (conversationWorkspace) {

        conversationWorkspace.hidden = false;

    }

    if (
        window.executiveAssessment &&
        typeof window.executiveAssessment.start === "function"
    ) {

        window.executiveAssessment.start();

    }

}
    /* ==========================================================
       SKIP INTRODUCTION
    ========================================================== */

function skipIntroduction() {

    if (state.skipped) return;

    state.skipped = true;

    clearTimer();

    stopTimeline();

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
      
              startAssessment
      
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

            stopTimeline();

        } else {

            state.running = true;

            runTimeline();

        }

    }
);

    /* ==========================================================
       INITIALIZATION
       (continues in Part 5)
    ========================================================== */

function initialize() {

    resetTimeline();

    state.running = true;

    state.skipped = false;

    state.stepIndex = 0;

    showSection("hero");

    activate(messageScenes, -1);

    activate(briefingCards, -1);

    activate(coachLines, -1);

    if (coachTyping) {

        coachTyping.classList.remove("active");

    }

    next(TIMING.hero);

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

        activate(coachLines, 0);

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

coachLines.forEach(line => {

    line.setAttribute("aria-hidden", "true");

});

if (coachTyping) {

    coachTyping.classList.remove("active");

}
   
   
initialize();

window.startAssessment = startAssessment;

});
