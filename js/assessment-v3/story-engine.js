import "./epf-wave3a-explanation-panel.js";
import "./epf-wave3b-explanation-panel.js";
import "./epf-wave3c-explanation-panel.js";
import "./esi-wave4a-explanation-panel.js";
import "./esi-wave4b-explanation-panel.js";
import "./esi-wave4c-explanation-panel.js";
import "./esi-wave4d-explanation-panel.js";
import "./jurisdiction-wave5a-explanation-panel.js";
import "./shops-wave5b-explanation-panel.js";
import "./code-on-wages-wave5c-explanation-panel.js";
import "./gratuity-wave5d-explanation-panel.js";
import "./employee-compensation-wave5e-explanation-panel.js";
import "./oshwc-wave5f-explanation-panel.js";
import "./industrial-relations-wave5g-explanation-panel.js";
import "./apprentices-wave5h-explanation-panel.js";

/**
 * GrowWithHR Compliance DNA
 * M1 Five-Act Story Engine
 *
 * Controls the presentation sequence only.
 * It does not calculate compliance results or alter recommendations.
 */

const STORY_ACTS = Object.freeze([
    Object.freeze({
        number: 1,
        id: "discover",
        label: "Discover",
        status: "Organisation",
        eyebrow: "Act 1 · Discover",
        title:
            "Begin with the organisation behind the obligations.",
        description:
            "Capture the organisation identity, business stage and operating context already used by the stable GrowWithHR advisory.",
        progress: 20
    }),

    Object.freeze({
        number: 2,
        id: "people",
        label: "People",
        status: "Workforce",
        eyebrow: "Act 2 · People",
        title:
            "Map the people who make the organisation work.",
        description:
            "Describe the workforce groups and working model while preserving the meaning of the existing assessment answers.",
        progress: 40
    }),

    Object.freeze({
        number: 3,
        id: "footprint",
        label: "Footprint",
        status: "Operations",
        eyebrow: "Act 3 · Footprint",
        title:
            "Trace where work, growth and change create signals.",
        description:
            "Connect operating locations, growth plans and People support to the current advisory model without introducing new applicability decisions.",
        progress: 60
    }),

    Object.freeze({
        number: 4,
        id: "understand",
        label: "Understand",
        status: "Analysis",
        eyebrow: "Act 4 · Understand",
        title:
            "Review the organisation story before analysis.",
        description:
            "Confirm the captured facts and run only genuine processing stages that prepare the existing report model.",
        progress: 80
    }),

    Object.freeze({
        number: 5,
        id: "act",
        label: "Act",
        status: "Advisory",
        eyebrow: "Act 5 · Act",
        title:
            "Continue to the current GrowWithHR advisory.",
        description:
            "Use the existing recommendation, report, PDF and email delivery contracts while the Five-Act experience remains private beta.",
        progress: 100
    })
]);

function normalizeActNumber(value) {
    const parsedValue = Number.parseInt(
        String(value),
        10
    );

    if (!Number.isFinite(parsedValue)) {
        return 1;
    }

    return Math.min(
        STORY_ACTS.length,
        Math.max(1, parsedValue)
    );
}

function findAct(actNumber) {
    const normalizedNumber =
        normalizeActNumber(actNumber);

    return STORY_ACTS[
        normalizedNumber - 1
    ];
}

function createSnapshot(currentActNumber) {
    const currentAct =
        findAct(currentActNumber);

    return Object.freeze({
        currentActNumber:
            currentAct.number,

        currentAct,

        totalActs:
            STORY_ACTS.length,

        canGoBack:
            currentAct.number > 1,

        canGoForward:
            currentAct.number <
            STORY_ACTS.length,

        isFirstAct:
            currentAct.number === 1,

        isFinalAct:
            currentAct.number ===
            STORY_ACTS.length,

        progress:
            currentAct.progress,

        acts:
            STORY_ACTS
    });
}

export function createStoryEngine(options = {}) {
    let currentActNumber =
        normalizeActNumber(
            options.initialAct
        );

    const subscribers =
        new Set();

    if (
        typeof options.onChange ===
        "function"
    ) {
        subscribers.add(
            options.onChange
        );
    }

    function getState() {
        return createSnapshot(
            currentActNumber
        );
    }

    function notify() {
        const snapshot =
            getState();

        for (
            const subscriber
            of subscribers
        ) {
            try {
                subscriber(
                    snapshot
                );
            } catch (error) {
                console.error(
                    "GrowWithHR: story-engine subscriber failed.",
                    error
                );
            }
        }

        return snapshot;
    }

    function setAct(actNumber) {
        const nextActNumber =
            normalizeActNumber(
                actNumber
            );

        if (
            nextActNumber ===
            currentActNumber
        ) {
            return getState();
        }

        currentActNumber =
            nextActNumber;

        return notify();
    }

    function next() {
        return setAct(
            currentActNumber + 1
        );
    }

    function previous() {
        return setAct(
            currentActNumber - 1
        );
    }

    function reset() {
        return setAct(1);
    }

    function subscribe(subscriber) {
        if (
            typeof subscriber !==
            "function"
        ) {
            throw new TypeError(
                "Story-engine subscriber must be a function."
            );
        }

        subscribers.add(
            subscriber
        );

        subscriber(
            getState()
        );

        return function unsubscribe() {
            subscribers.delete(
                subscriber
            );
        };
    }

    return Object.freeze({
        getState,
        setAct,
        next,
        previous,
        reset,
        subscribe
    });
}

export function getStoryActs() {
    return STORY_ACTS;
}

export function getStoryAct(
    actNumber
) {
    return findAct(
        actNumber
    );
}

export default createStoryEngine;
