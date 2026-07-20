/**
 * GrowWithHR Compliance DNA
 * M1 Five-Act Bootstrap
 *
 * Connects:
 * - the private-beta HTML shell;
 * - the Five-Act story engine;
 * - the configurable narrative-copy JSON.
 *
 * This file does not calculate compliance results
 * or modify the stable v2 assessment.
 */

import createStoryEngine from "./story-engine.js";

const STABLE_ASSESSMENT_ROUTE =
    "analyze-company.html";

const NARRATIVE_COPY_URL =
    "data/assessment/narrative-copy.json";

const REQUIRED_ELEMENT_IDS =
    Object.freeze([
        "dnaCurrentAct",
        "dnaProgressLabel",
        "dnaProgressValue",
        "dnaStageEyebrow",
        "dnaStageTitle",
        "dnaStageDescription",
        "dnaStartButton",
        "dnaActList",
        "dnaLiveRegion"
    ]);

function asObject(value) {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    )
        ? value
        : {};
}

function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
}

function requireElement(id) {
    const element =
        document.getElementById(id);

    if (!element) {
        throw new Error(
            `GrowWithHR Compliance DNA requires #${id}.`
        );
    }

    return element;
}

function collectElements() {
    const elements = {};

    for (
        const id
        of REQUIRED_ELEMENT_IDS
    ) {
        elements[id] =
            requireElement(id);
    }

    elements.progressBar =
        document.querySelector(
            '[role="progressbar"]'
        );

    elements.actItems =
        Array.from(
            document.querySelectorAll(
                "[data-act]"
            )
        );

    elements.actButtons =
        Array.from(
            document.querySelectorAll(
                "[data-act-button]"
            )
        );

    if (!elements.progressBar) {
        throw new Error(
            "GrowWithHR Compliance DNA requires a progressbar."
        );
    }

    if (
        elements.actItems.length !== 5 ||
        elements.actButtons.length !== 5
    ) {
        throw new Error(
            "GrowWithHR Compliance DNA requires five story acts."
        );
    }

    return elements;
}

function normalizeNarrativeAct(
    value,
    index
) {
    const source =
        asObject(value);

    const number =
        Number.parseInt(
            String(source.number),
            10
        );

    const id =
        cleanText(source.id);

    const label =
        cleanText(source.label);

    const title =
        cleanText(source.title);

    const description =
        cleanText(
            source.description
        );

    if (
        number !== index + 1 ||
        !id ||
        !label ||
        !title ||
        !description
    ) {
        throw new Error(
            `Narrative act ${index + 1} is invalid.`
        );
    }

    return Object.freeze({
        number,
        id,
        label,
        title,
        description
    });
}

function normalizeNarrative(
    value
) {
    const source =
        asObject(value);

    if (
        Number(source.schemaVersion) !==
        1
    ) {
        throw new Error(
            "Unsupported Compliance DNA narrative schema."
        );
    }

    if (
        !Array.isArray(source.acts) ||
        source.acts.length !== 5
    ) {
        throw new Error(
            "Compliance DNA narrative requires exactly five acts."
        );
    }

    return Object.freeze({
        schemaVersion:
            1,

        experience:
            cleanText(
                source.experience
            ),

        acts:
            Object.freeze(
                source.acts.map(
                    normalizeNarrativeAct
                )
            ),

        screens:
            Object.freeze({
                ...asObject(
                    source.screens
                )
            }),

        review:
            Object.freeze({
                ...asObject(
                    source.review
                )
            }),

        analysis:
            Object.freeze({
                ...asObject(
                    source.analysis
                )
            }),

        contact:
            Object.freeze({
                ...asObject(
                    source.contact
                )
            }),

        success:
            Object.freeze({
                ...asObject(
                    source.success
                )
            })
    });
}

async function loadNarrative() {
    try {
        const response =
            await fetch(
                NARRATIVE_COPY_URL,
                {
                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                `Narrative request failed with status ${response.status}.`
            );
        }

        return normalizeNarrative(
            await response.json()
        );
    } catch (error) {
        console.warn(
            "GrowWithHR: configurable narrative could not be loaded. The built-in Five-Act copy will be used.",
            error
        );

        return null;
    }
}

function mergeNarrativeWithState(
    state,
    narrative
) {
    if (!narrative) {
        return state;
    }

    const acts =
        state.acts.map(
            (engineAct, index) => {
                const configuredAct =
                    narrative.acts[index];

                return Object.freeze({
                    ...engineAct,

                    id:
                        configuredAct.id,

                    label:
                        configuredAct.label,

                    eyebrow:
                        `Act ${configuredAct.number} · ${configuredAct.label}`,

                    title:
                        configuredAct.title,

                    description:
                        configuredAct.description
                });
            }
        );

    return Object.freeze({
        ...state,

        acts:
            Object.freeze(acts),

        currentAct:
            acts[
                state.currentActNumber - 1
            ]
    });
}

function getPrimaryButtonLabel(
    state
) {
    if (state.isFinalAct) {
        return "Open the stable assessment";
    }

    const nextAct =
        state.acts[
            state.currentActNumber
        ];

    return `Continue to ${nextAct.label}`;
}

function announce(
    elements,
    message
) {
    elements.dnaLiveRegion.hidden =
        false;

    elements.dnaLiveRegion.textContent =
        "";

    window.requestAnimationFrame(
        () => {
            elements
                .dnaLiveRegion
                .textContent =
                message;
        }
    );
}

function updateActNavigation(
    elements,
    state
) {
    for (
        const item
        of elements.actItems
    ) {
        const itemActNumber =
            Number.parseInt(
                item.dataset.act,
                10
            );

        item.classList.toggle(
            "is-active",
            itemActNumber ===
                state.currentActNumber
        );

        item.classList.toggle(
            "is-complete",
            itemActNumber <
                state.currentActNumber
        );
    }

    for (
        const button
        of elements.actButtons
    ) {
        const buttonActNumber =
            Number.parseInt(
                button.dataset.actButton,
                10
            );

        const act =
            state.acts[
                buttonActNumber - 1
            ];

        const isActive =
            buttonActNumber ===
            state.currentActNumber;

        if (isActive) {
            button.setAttribute(
                "aria-current",
                "step"
            );
        } else {
            button.removeAttribute(
                "aria-current"
            );
        }

        button.setAttribute(
            "aria-label",
            `Act ${act.number} of ${state.totalActs}, ${act.label}: ${act.status}`
        );

        const labelElement =
            button.querySelector(
                ".dna-act__label"
            );

        const statusElement =
            button.querySelector(
                ".dna-act__status"
            );

        if (labelElement) {
            labelElement.textContent =
                act.label;
        }

        if (statusElement) {
            statusElement.textContent =
                act.status;
        }
    }
}

function updateProgress(
    elements,
    state
) {
    elements.dnaCurrentAct.textContent =
        `Act ${state.currentActNumber} of ${state.totalActs}`;

    elements.dnaProgressLabel.textContent =
        state.currentAct.label;

    elements.dnaProgressValue.style.width =
        `${state.progress}%`;

    elements.progressBar.setAttribute(
        "aria-valuenow",
        String(
            state.currentActNumber
        )
    );

    elements.progressBar.setAttribute(
        "aria-valuetext",
        `Act ${state.currentActNumber} of ${state.totalActs}: ${state.currentAct.label}`
    );
}

function updateStage(
    elements,
    state
) {
    elements.dnaStageEyebrow.textContent =
        state.currentAct.eyebrow;

    elements.dnaStageTitle.textContent =
        state.currentAct.title;

    elements.dnaStageDescription.textContent =
        state.currentAct.description;

    elements.dnaStartButton.textContent =
        getPrimaryButtonLabel(
            state
        );

    elements.dnaStartButton.dataset.currentAct =
        String(
            state.currentActNumber
        );
}

function render(
    elements,
    state,
    options = {}
) {
    updateProgress(
        elements,
        state
    );

    updateActNavigation(
        elements,
        state
    );

    updateStage(
        elements,
        state
    );

    if (options.announce) {
        announce(
            elements,
            `${state.currentAct.eyebrow}. ${state.currentAct.title}`
        );
    }
}

function focusStageTitle(
    elements
) {
    elements.dnaStageTitle.setAttribute(
        "tabindex",
        "-1"
    );

    elements.dnaStageTitle.focus({
        preventScroll:
            false
    });
}

function bindActButtons(
    elements,
    engine
) {
    for (
        const button
        of elements.actButtons
    ) {
        button.addEventListener(
            "click",
            () => {
                engine.setAct(
                    Number.parseInt(
                        button
                            .dataset
                            .actButton,
                        10
                    )
                );

                focusStageTitle(
                    elements
                );
            }
        );
    }
}

function bindPrimaryButton(
    elements,
    engine
) {
    elements.dnaStartButton.addEventListener(
        "click",
        () => {
            const state =
                engine.getState();

            if (state.isFinalAct) {
                window.location.assign(
                    STABLE_ASSESSMENT_ROUTE
                );

                return;
            }

            engine.next();

            focusStageTitle(
                elements
            );
        }
    );
}

async function initializeComplianceDna() {
    const elements =
        collectElements();

    const narrative =
        await loadNarrative();

    const engine =
        createStoryEngine({
            initialAct:
                1
        });

    let isInitialRender =
        true;

    engine.subscribe(
        (engineState) => {
            const state =
                mergeNarrativeWithState(
                    engineState,
                    narrative
                );

            render(
                elements,
                state,
                {
                    announce:
                        !isInitialRender
                }
            );

            isInitialRender =
                false;
        }
    );

    bindActButtons(
        elements,
        engine
    );

    bindPrimaryButton(
        elements,
        engine
    );

    window.GrowWithHRComplianceDna =
        Object.freeze({
            version:
                "m1-five-act-shell",

            route:
                "analyze-company-v3.html",

            fallbackRoute:
                STABLE_ASSESSMENT_ROUTE,

            narrativeUrl:
                NARRATIVE_COPY_URL,

            narrativeLoaded:
                Boolean(narrative),

            narrative,

            getState() {
                return mergeNarrativeWithState(
                    engine.getState(),
                    narrative
                );
            },

            setAct:
                engine.setAct,

            next:
                engine.next,

            previous:
                engine.previous,

            reset:
                engine.reset
        });
}

function handleInitializationError(
    error
) {
    console.error(
        "GrowWithHR Compliance DNA could not start.",
        error
    );

    const startButton =
        document.getElementById(
            "dnaStartButton"
        );

    if (!startButton) {
        return;
    }

    startButton.textContent =
        "Open the stable assessment";

    startButton.addEventListener(
        "click",
        () => {
            window.location.assign(
                STABLE_ASSESSMENT_ROUTE
            );
        },
        {
            once:
                true
        }
    );
}

async function start() {
    try {
        await initializeComplianceDna();
    } catch (error) {
        handleInitializationError(
            error
        );
    }
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        () => {
            void start();
        },
        {
            once:
                true
        }
    );
} else {
    void start();
}
