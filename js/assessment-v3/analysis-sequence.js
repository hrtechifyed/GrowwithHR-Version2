/**
 * GrowWithHR Compliance DNA
 * M1 Truthful Analysis Sequence
 *
 * Runs real processing callbacks in a defined order.
 *
 * Important:
 * - A stage is displayed only when its callback starts.
 * - A stage completes only after its callback succeeds.
 * - Missing callbacks cause an error instead of showing fake progress.
 * - Reduced-motion mode removes presentation delays.
 */

export const DEFAULT_ANALYSIS_STAGES =
    Object.freeze([
        Object.freeze({
            id: "organise-context",
            label:
                "Organising your organisation context",
            completionLabel:
                "Organisation context prepared"
        }),

        Object.freeze({
            id: "prepare-legacy-state",
            label:
                "Preparing your compatible assessment state",
            completionLabel:
                "Compatible assessment state prepared"
        }),

        Object.freeze({
            id: "build-advisory-records",
            label:
                "Preparing your advisory records",
            completionLabel:
                "Advisory records prepared"
        })
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

function positiveNumber(
    value,
    fallback
) {
    const number =
        Number(value);

    return (
        Number.isFinite(number) &&
        number >= 0
    )
        ? number
        : fallback;
}

function createAbortError() {
    const error =
        new Error(
            "GrowWithHR analysis was cancelled."
        );

    error.name =
        "AbortError";

    return error;
}

function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw createAbortError();
    }
}

function prefersReducedMotion(
    runtime = globalThis
) {
    try {
        return Boolean(
            runtime
                ?.matchMedia?.(
                    "(prefers-reduced-motion: reduce)"
                )
                ?.matches
        );
    } catch (error) {
        return false;
    }
}

function wait(
    duration,
    options = {}
) {
    const milliseconds =
        positiveNumber(
            duration,
            0
        );

    const signal =
        options.signal;

    const runtime =
        options.runtime ||
        globalThis;

    if (milliseconds === 0) {
        throwIfAborted(
            signal
        );

        return Promise.resolve();
    }

    return new Promise(
        (resolve, reject) => {
            throwIfAborted(
                signal
            );

            const timeoutId =
                runtime.setTimeout(
                    () => {
                        cleanup();
                        resolve();
                    },
                    milliseconds
                );

            function handleAbort() {
                runtime.clearTimeout(
                    timeoutId
                );

                cleanup();

                reject(
                    createAbortError()
                );
            }

            function cleanup() {
                signal?.removeEventListener(
                    "abort",
                    handleAbort
                );
            }

            signal?.addEventListener(
                "abort",
                handleAbort,
                {
                    once: true
                }
            );
        }
    );
}

function normalizeStage(
    stage,
    index
) {
    const source =
        asObject(stage);

    const id =
        cleanText(
            source.id
        );

    if (!id) {
        throw new Error(
            `GrowWithHR analysis stage ${index + 1} requires an id.`
        );
    }

    const label =
        cleanText(
            source.label
        );

    if (!label) {
        throw new Error(
            `GrowWithHR analysis stage "${id}" requires a label.`
        );
    }

    return Object.freeze({
        id,

        label,

        completionLabel:
            cleanText(
                source
                    .completionLabel
            ) ||
            `${label} complete`
    });
}

function normalizeStages(value) {
    const suppliedStages =
        Array.isArray(value)
            ? value
            : DEFAULT_ANALYSIS_STAGES;

    if (
        suppliedStages.length === 0
    ) {
        throw new Error(
            "GrowWithHR analysis requires at least one stage."
        );
    }

    const normalized =
        suppliedStages.map(
            normalizeStage
        );

    const identifiers =
        new Set();

    for (
        const stage
        of normalized
    ) {
        if (
            identifiers.has(
                stage.id
            )
        ) {
            throw new Error(
                `GrowWithHR analysis stage id "${stage.id}" is duplicated.`
            );
        }

        identifiers.add(
            stage.id
        );
    }

    return Object.freeze(
        normalized
    );
}

function normalizeCallbacks(
    stages,
    callbacks
) {
    const source =
        asObject(callbacks);

    const normalized = {};

    for (
        const stage
        of stages
    ) {
        const callback =
            source[stage.id];

        if (
            typeof callback !==
            "function"
        ) {
            throw new Error(
                `GrowWithHR analysis callback "${stage.id}" is required.`
            );
        }

        normalized[stage.id] =
            callback;
    }

    return Object.freeze(
        normalized
    );
}

async function callHandler(
    handler,
    payload
) {
    if (
        typeof handler !==
        "function"
    ) {
        return;
    }

    await handler(
        payload
    );
}

function createStageSnapshot(
    stage,
    index,
    total,
    status,
    result
) {
    return Object.freeze({
        id:
            stage.id,

        label:
            stage.label,

        completionLabel:
            stage.completionLabel,

        index,

        position:
            index + 1,

        total,

        status,

        result
    });
}

/**
 * Runs the configured processing stages.
 *
 * Required callbacks must be supplied using the stage IDs:
 *
 * {
 *   "organise-context": async (context) => {},
 *   "prepare-legacy-state": async (context) => {},
 *   "build-advisory-records": async (context) => {}
 * }
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function runAnalysisSequence(
    options = {}
) {
    const runtime =
        options.runtime ||
        globalThis;

    const signal =
        options.signal;

    const stages =
        normalizeStages(
            options.stages
        );

    const callbacks =
        normalizeCallbacks(
            stages,
            options.callbacks
        );

    const reducedMotion =
        typeof options
            .reducedMotion ===
            "boolean"
            ? options
                .reducedMotion
            : prefersReducedMotion(
                runtime
            );

    const presentationDelay =
        reducedMotion
            ? 0
            : positiveNumber(
                options
                    .presentationDelay,
                300
            );

    const context = {
        ...asObject(
            options.context
        )
    };

    const results = {};

    const startedAt =
        new Date()
            .toISOString();

    throwIfAborted(
        signal
    );

    await callHandler(
        options.onSequenceStart,
        Object.freeze({
            stages,
            total:
                stages.length,
            reducedMotion,
            startedAt,
            context
        })
    );

    try {
        for (
            let index = 0;
            index < stages.length;
            index += 1
        ) {
            throwIfAborted(
                signal
            );

            const stage =
                stages[index];

            const activeSnapshot =
                createStageSnapshot(
                    stage,
                    index,
                    stages.length,
                    "active",
                    undefined
                );

            await callHandler(
                options.onStageStart,
                activeSnapshot
            );

            await wait(
                presentationDelay,
                {
                    runtime,
                    signal
                }
            );

            throwIfAborted(
                signal
            );

            const result =
                await callbacks[
                    stage.id
                ](
                    Object.freeze({
                        stage,
                        index,
                        position:
                            index + 1,
                        total:
                            stages.length,
                        context,
                        previousResults:
                            Object.freeze({
                                ...results
                            }),
                        signal,
                        reducedMotion
                    })
                );

            results[stage.id] =
                result;

            context[
                stage.id
            ] = result;

            const completeSnapshot =
                createStageSnapshot(
                    stage,
                    index,
                    stages.length,
                    "complete",
                    result
                );

            await callHandler(
                options.onStageComplete,
                completeSnapshot
            );

            await wait(
                presentationDelay,
                {
                    runtime,
                    signal
                }
            );
        }

        const completedAt =
            new Date()
                .toISOString();

        const output =
            Object.freeze({
                status:
                    "complete",

                startedAt,

                completedAt,

                reducedMotion,

                stages,

                results:
                    Object.freeze({
                        ...results
                    }),

                context:
                    Object.freeze({
                        ...context
                    })
            });

        await callHandler(
            options.onSequenceComplete,
            output
        );

        return output;
    } catch (error) {
        const failure =
            Object.freeze({
                status:
                    error?.name ===
                    "AbortError"
                        ? "cancelled"
                        : "failed",

                startedAt,

                failedAt:
                    new Date()
                        .toISOString(),

                reducedMotion,

                error,

                completedResults:
                    Object.freeze({
                        ...results
                    }),

                context:
                    Object.freeze({
                        ...context
                    })
            });

        await callHandler(
            options.onError,
            failure
        );

        throw error;
    }
}

/**
 * Creates a sequence runner with shared defaults.
 *
 * @param {Object} defaults
 * @returns {Function}
 */
export function createAnalysisSequence(
    defaults = {}
) {
    return function execute(
        overrides = {}
    ) {
        return runAnalysisSequence({
            ...defaults,
            ...overrides,

            callbacks: {
                ...asObject(
                    defaults.callbacks
                ),
                ...asObject(
                    overrides.callbacks
                )
            },

            context: {
                ...asObject(
                    defaults.context
                ),
                ...asObject(
                    overrides.context
                )
            }
        });
    };
}

export default createAnalysisSequence;
