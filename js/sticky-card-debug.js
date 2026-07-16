/* ==========================================================
   GrowWithHR sticky 3D card validation logs
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const stackSelector = ".home-stack-section, .gwhr-peel-stack";
    const cardSelector = ".home-stack-card, .gwhr-peel-card";
    const stacks = Array.from(document.querySelectorAll(stackSelector));
    const supportsViewTimeline = CSS.supports("animation-timeline: view()");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    console.groupCollapsed("[GrowWithHR] 3D sticky card animation validation");
    console.log("Stacks found:", stacks.length);
    console.log("Supports scroll-driven view timeline:", supportsViewTimeline);
    console.log("Reduced motion enabled:", reducedMotion);

    stacks.forEach((stack, stackIndex) => {
        const cards = Array.from(stack.querySelectorAll(cardSelector));
        const stackStyle = window.getComputedStyle(stack);

        console.log(`Stack ${stackIndex + 1}`, {
            testId: stack.dataset.testid || null,
            cards: cards.length,
            perspective: stackStyle.perspective,
            overflow: stackStyle.overflow,
            contain: stackStyle.contain
        });

        cards.forEach((card, cardIndex) => {
            const cardStyle = window.getComputedStyle(card);
            console.log(`Stack ${stackIndex + 1} card ${cardIndex + 1}`, {
                position: cardStyle.position,
                top: cardStyle.top,
                transform: cardStyle.transform,
                animationName: cardStyle.animationName,
                animationTimeline: cardStyle.animationTimeline || "not reported",
                zIndex: cardStyle.zIndex
            });
        });
    });

    console.groupEnd();
});
