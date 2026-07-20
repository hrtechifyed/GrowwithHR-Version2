/**
 * GrowWithHR Compliance DNA
 * M2 Private-Beta Traceability Diagnostics
 *
 * Reads the protected v2 assessment state without modifying it, evaluates
 * M2 traceability through the compatibility adapter and renders private-beta
 * diagnostic information.
 *
 * This controller:
 * - does not write to browser storage;
 * - does not introduce a new storage key;
 * - does not modify protected report, PDF, email or delivery records;
 * - does not calculate applicability in the presentation layer;
 * - renders only records produced by the deterministic M2 evaluator.
 */

import {
    LEGACY_KEYS
} from "./legacy-adapter.js";

import {
    createTraceabilityAdapter
} from "./traceability-adapter.js";

export const TRACEABILITY_DIAGNOSTICS_VERSION =
    "1.0.0";

const REQUIRED_ELEMENT_IDS =
    Object.freeze([
        "dnaTraceability",
        "dnaTraceabilityStatus",
        "dnaTraceabilityConfirmedCount",
        "dnaTraceabilityDerivedCount",
        "dnaTraceabilityRuleCount",
        "dnaTraceabilityRecommendationCount",
        "dnaTraceabilityRuleList",
        "dnaTraceabilityRecommendationList",
        "dnaTraceabilityEmpty",
        "dnaTraceabilityError",
        "dnaTraceabilityErrorMessage",
        "dnaTraceabilityRefreshButton"
    ]);

const APPLICABILITY_STATUS_ORDER =
    Object.freeze([
        "applicable",
        "likely-applicable",
        "specialist-review",
        "more-information-needed",
        "not-currently-applicable"
    ]);

const APPLICABILITY_STATUS_LABELS =
    Object.freeze({
        applicable:
            "Applicable",

        "likely-applicable":
            "Likely applicable",

        "not-currently-applicable":
            "Not currently applicable",

        "more-information-needed":
            "More information needed",

        "specialist-review":
            "Specialist review"
    });

const EVIDENCE_STATUS_LABELS =
    Object.freeze({
        "not-requested":
            "Not requested",

        "not-provided":
            "Not provided",

        provided:
            "Provided",

        "not-verified":
            "Not verified",

        verified:
            "Verified"
    });

const PHASE =
    Object.freeze({
        IDLE:
            "idle",

        LOADING:
            "loading",

        READY:
            "ready",

        EMPTY:
            "empty",

        ERROR:
            "error",

        DESTROYED:
            "destroyed"
    });

function asObject(value) {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    )
        ? value
        : {};
}

function asArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}

function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
}

function requireElement(
    documentObject,
    id
) {
    const element =
        documentObject
            .getElementById(id);

    if (!element) {
        throw new Error(
            `GrowWithHR M2 diagnostics requires #${id}.`
        );
    }

    return element;
}

function collectElements(
    documentObject
) {
    const elements = {};

    for (
        const id
        of REQUIRED_ELEMENT_IDS
    ) {
        elements[id] =
            requireElement(
                documentObject,
                id
            );
    }

    return elements;
}

function setHidden(
    element,
    hidden
) {
    element.hidden =
        Boolean(hidden);
}

function clearElement(element) {
    element.replaceChildren();
}

function createElement(
    documentObject,
    tagName,
    options = {}
) {
    const source =
        asObject(options);

    const element =
        documentObject
            .createElement(
                tagName
            );

    const className =
        cleanText(
            source.className
        );

    if (className) {
        element.className =
            className;
    }

    if (
        source.text !==
        undefined
    ) {
        element.textContent =
            String(
                source.text
            );
    }

    const attributes =
        asObject(
            source.attributes
        );

    for (
        const [
            name,
            value
        ]
        of Object.entries(
            attributes
        )
    ) {
        if (
            value ===
            undefined ||
            value ===
            null
        ) {
            continue;
        }

        element.setAttribute(
            name,
            String(value)
        );
    }

    return element;
}

function appendTextBlock(
    documentObject,
    parent,
    label,
    value,
    className = ""
) {
    const block =
        createElement(
            documentObject,
            "div",
            {
                className:
                    [
                        "dna-traceability__detail",
                        className
                    ]
                        .filter(Boolean)
                        .join(" ")
            }
        );

    const heading =
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__detail-label",

                text:
                    label
            }
        );

    const content =
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-traceability__detail-value",

                text:
                    value
            }
        );

    block.append(
        heading,
        content
    );

    parent.append(
        block
    );

    return block;
}

function humanizeIdentifier(identifier) {
    const segments =
        cleanText(identifier)
            .split(".")
            .filter(Boolean);

    const finalSegment =
        segments[
            segments.length - 1
        ] || "";

    return finalSegment
        .split("-")
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0)
                    .toUpperCase() +
                part.slice(1)
        )
        .join(" ");
}

function formatFactValue(value) {
    if (value === null) {
        return "Not supplied";
    }

    if (Array.isArray(value)) {
        return value.length
            ? value
                .map(
                    (item) =>
                        formatFactValue(
                            item
                        )
                )
                .join(", ")
            : "None";
    }

    if (
        typeof value ===
        "boolean"
    ) {
        return value
            ? "Yes"
            : "No";
    }

    if (
        typeof value ===
        "object"
    ) {
        try {
            return JSON.stringify(
                value
            );
        } catch (error) {
            return "Structured value";
        }
    }

    const text =
        cleanText(value);

    return text ||
        "Not supplied";
}

function statusLabel(status) {
    return (
        APPLICABILITY_STATUS_LABELS[
            status
        ] ||
        humanizeIdentifier(
            status
        ) ||
        "Unknown"
    );
}

function evidenceLabel(status) {
    return (
        EVIDENCE_STATUS_LABELS[
            status
        ] ||
        humanizeIdentifier(
            status
        ) ||
        "Unknown"
    );
}

function createApplicabilityBadge(
    documentObject,
    status
) {
    return createElement(
        documentObject,
        "span",
        {
            className:
                "dna-traceability__status-badge",

            text:
                statusLabel(
                    status
                ),

            attributes: {
                "data-applicability-status":
                    cleanText(status)
            }
        }
    );
}

function createEvidenceBadge(
    documentObject,
    status
) {
    return createElement(
        documentObject,
        "span",
        {
            className:
                "dna-traceability__evidence-badge",

            text:
                `Evidence: ${
                    evidenceLabel(
                        status
                    )
                }`,

            attributes: {
                "data-evidence-status":
                    cleanText(status)
            }
        }
    );
}

function createIdentifier(
    documentObject,
    identifier
) {
    return createElement(
        documentObject,
        "code",
        {
            className:
                "dna-traceability__identifier",

            text:
                identifier
        }
    );
}

function indexFacts(bundle) {
    const facts =
        asObject(
            bundle.facts
        );

    return new Map(
        [
            ...asArray(
                facts.confirmed
            ),

            ...asArray(
                facts.derived
            )
        ].map(
            (fact) => [
                fact.id,
                fact
            ]
        )
    );
}

function indexSources(bundle) {
    return new Map(
        asArray(
            bundle.sources
        ).map(
            (source) => [
                source.id,
                source
            ]
        )
    );
}

function createFactList(
    documentObject,
    factIds,
    factIndex,
    options = {}
) {
    const source =
        asObject(options);

    const identifiers =
        asArray(
            factIds
        );

    const list =
        createElement(
            documentObject,
            "ul",
            {
                className:
                    "dna-traceability__fact-list"
            }
        );

    if (!identifiers.length) {
        const emptyItem =
            createElement(
                documentObject,
                "li",
                {
                    className:
                        "dna-traceability__fact dna-traceability__fact--empty",

                    text:
                        source.emptyMessage ||
                        "None"
                }
            );

        list.append(
            emptyItem
        );

        return list;
    }

    for (
        const identifier
        of identifiers
    ) {
        const fact =
            factIndex.get(
                identifier
            );

        const item =
            createElement(
                documentObject,
                "li",
                {
                    className:
                        "dna-traceability__fact"
                }
            );

        const heading =
            createElement(
                documentObject,
                "div",
                {
                    className:
                        "dna-traceability__fact-heading"
                }
            );

        const label =
            createElement(
                documentObject,
                "strong",
                {
                    className:
                        "dna-traceability__fact-label",

                    text:
                        fact?.label ||
                        humanizeIdentifier(
                            identifier
                        ) ||
                        identifier
                }
            );

        heading.append(
            label
        );

        if (fact) {
            const kind =
                createElement(
                    documentObject,
                    "span",
                    {
                        className:
                            "dna-traceability__fact-kind",

                        text:
                            fact.kind ===
                            "derived"
                                ? "Derived fact"
                                : "Confirmed fact"
                    }
                );

            heading.append(
                kind
            );
        }

        const value =
            createElement(
                documentObject,
                "span",
                {
                    className:
                        "dna-traceability__fact-value",

                    text:
                        fact
                            ? formatFactValue(
                                fact.value
                            )
                            : (
                                source.missing
                                    ? "Information not supplied"
                                    : "Fact reference unavailable"
                            )
                }
            );

        item.append(
            heading,
            value,
            createIdentifier(
                documentObject,
                identifier
            )
        );

        list.append(
            item
        );
    }

    return list;
}

function createSourceList(
    documentObject,
    sourceIds,
    sourceIndex
) {
    const identifiers =
        asArray(
            sourceIds
        );

    const list =
        createElement(
            documentObject,
            "ul",
            {
                className:
                    "dna-traceability__source-list"
            }
        );

    for (
        const identifier
        of identifiers
    ) {
        const source =
            sourceIndex.get(
                identifier
            );

        const item =
            createElement(
                documentObject,
                "li",
                {
                    className:
                        "dna-traceability__source"
                }
            );

        if (!source) {
            item.append(
                createIdentifier(
                    documentObject,
                    identifier
                )
            );

            list.append(
                item
            );

            continue;
        }

        const link =
            createElement(
                documentObject,
                "a",
                {
                    className:
                        "dna-traceability__source-link",

                    text:
                        source.title,

                    attributes: {
                        href:
                            source.url,

                        target:
                            "_blank",

                        rel:
                            "noopener noreferrer"
                    }
                }
            );

        const metadata =
            createElement(
                documentObject,
                "span",
                {
                    className:
                        "dna-traceability__source-meta",

                    text:
                        [
                            source.publisher,
                            source.jurisdiction,
                            source.official
                                ? "Official source"
                                : "Authoritative source"
                        ]
                            .filter(Boolean)
                            .join(" · ")
                }
            );

        const note =
            createElement(
                documentObject,
                "span",
                {
                    className:
                        "dna-traceability__source-note",

                    text:
                        source.notes ||
                        "Source supplied for further review."
                }
            );

        item.append(
            link,
            metadata,
            note,
            createIdentifier(
                documentObject,
                source.id
            )
        );

        list.append(
            item
        );
    }

    return list;
}

function createLimitationsList(
    documentObject,
    limitations
) {
    const values =
        asArray(
            limitations
        );

    const list =
        createElement(
            documentObject,
            "ul",
            {
                className:
                    "dna-traceability__limitations"
            }
        );

    for (
        const limitation
        of values
    ) {
        list.append(
            createElement(
                documentObject,
                "li",
                {
                    text:
                        limitation
                }
            )
        );
    }

    return list;
}

function createRuleCard(
    documentObject,
    evaluation,
    factIndex
) {
    const card =
        createElement(
            documentObject,
            "article",
            {
                className:
                    "dna-traceability__rule-card",

                attributes: {
                    "data-rule-id":
                        evaluation.ruleId,

                    "data-applicability-status":
                        evaluation.status
                }
            }
        );

    const header =
        createElement(
            documentObject,
            "header",
            {
                className:
                    "dna-traceability__card-header"
            }
        );

    const headingGroup =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-traceability__card-heading"
            }
        );

    const title =
        createElement(
            documentObject,
            "h3",
            {
                className:
                    "dna-traceability__card-title",

                text:
                    evaluation
                        .metadata
                        ?.title ||
                    humanizeIdentifier(
                        evaluation.ruleId
                    ) ||
                    "Rule evaluation"
            }
        );

    headingGroup.append(
        title,
        createIdentifier(
            documentObject,
            evaluation.ruleId
        )
    );

    header.append(
        headingGroup,
        createApplicabilityBadge(
            documentObject,
            evaluation.status
        )
    );

    const reason =
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-traceability__reason",

                text:
                    evaluation.reason
            }
        );

    const details =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-traceability__detail-grid"
            }
        );

    appendTextBlock(
        documentObject,
        details,
        "Rule version",
        evaluation.ruleVersion
    );

    appendTextBlock(
        documentObject,
        details,
        "Evaluation outcome",
        statusLabel(
            evaluation.status
        )
    );

    const requiredSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    requiredSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Required facts"
            }
        ),

        createFactList(
            documentObject,
            evaluation.requiredFactIds,
            factIndex,
            {
                emptyMessage:
                    "No required facts recorded."
            }
        )
    );

    const triggeringSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    triggeringSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Facts used for this outcome"
            }
        ),

        createFactList(
            documentObject,
            evaluation.triggeringFactIds,
            factIndex,
            {
                emptyMessage:
                    "No triggering facts were available."
            }
        )
    );

    const missingSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    missingSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Missing information"
            }
        ),

        createFactList(
            documentObject,
            evaluation.missingFactIds,
            factIndex,
            {
                missing:
                    true,

                emptyMessage:
                    "No required information is currently missing."
            }
        )
    );

    card.append(
        header,
        reason,
        details,
        requiredSection,
        triggeringSection,
        missingSection
    );

    return card;
}

function createRecommendationCard(
    documentObject,
    recommendation,
    factIndex,
    sourceIndex
) {
    const card =
        createElement(
            documentObject,
            "article",
            {
                className:
                    "dna-traceability__recommendation-card",

                attributes: {
                    "data-recommendation-id":
                        recommendation.id,

                    "data-rule-id":
                        recommendation.ruleId,

                    "data-applicability-status":
                        recommendation
                            .applicabilityStatus
                }
            }
        );

    const header =
        createElement(
            documentObject,
            "header",
            {
                className:
                    "dna-traceability__card-header"
            }
        );

    const headingGroup =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-traceability__card-heading"
            }
        );

    const title =
        createElement(
            documentObject,
            "h3",
            {
                className:
                    "dna-traceability__card-title",

                text:
                    recommendation.title
            }
        );

    headingGroup.append(
        title,
        createIdentifier(
            documentObject,
            recommendation.id
        )
    );

    const badges =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-traceability__badges"
            }
        );

    badges.append(
        createApplicabilityBadge(
            documentObject,
            recommendation
                .applicabilityStatus
        ),

        createEvidenceBadge(
            documentObject,
            recommendation
                .evidence
                ?.status ||
            "not-requested"
        )
    );

    header.append(
        headingGroup,
        badges
    );

    const reason =
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-traceability__reason",

                text:
                    recommendation.reason
            }
        );

    const details =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-traceability__detail-grid"
            }
        );

    appendTextBlock(
        documentObject,
        details,
        "Recommended action",
        recommendation.action,
        "dna-traceability__detail--wide"
    );

    appendTextBlock(
        documentObject,
        details,
        "Suggested timeline",
        recommendation.timeline
    );

    const ruleSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    ruleSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Deterministic rule"
            }
        ),

        createIdentifier(
            documentObject,
            recommendation.ruleId
        )
    );

    const triggeringSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    triggeringSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Why this appears"
            }
        ),

        createFactList(
            documentObject,
            recommendation
                .triggeringFactIds,
            factIndex,
            {
                emptyMessage:
                    "No triggering facts were recorded."
            }
        )
    );

    const missingSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    missingSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Information still needed"
            }
        ),

        createFactList(
            documentObject,
            recommendation
                .missingFactIds,
            factIndex,
            {
                missing:
                    true,

                emptyMessage:
                    "No required information is currently missing."
            }
        )
    );

    const sourceSection =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-traceability__record-section"
            }
        );

    sourceSection.append(
        createElement(
            documentObject,
            "h4",
            {
                className:
                    "dna-traceability__section-title",

                text:
                    "Sources for further review"
            }
        ),

        createSourceList(
            documentObject,
            recommendation.sourceIds,
            sourceIndex
        )
    );

    const limitationDetails =
        createElement(
            documentObject,
            "details",
            {
                className:
                    "dna-traceability__limitation-details"
            }
        );

    limitationDetails.append(
        createElement(
            documentObject,
            "summary",
            {
                text:
                    "Limitations and review notices"
            }
        ),

        createLimitationsList(
            documentObject,
            recommendation.limitations
        )
    );

    card.append(
        header,
        reason,
        details,
        ruleSection,
        triggeringSection,
        missingSection,
        sourceSection,
        limitationDetails
    );

    return card;
}

function countStatuses(
    evaluations
) {
    const counts =
        new Map(
            APPLICABILITY_STATUS_ORDER
                .map(
                    (status) => [
                        status,
                        0
                    ]
                )
        );

    for (
        const evaluation
        of asArray(
            evaluations
        )
    ) {
        counts.set(
            evaluation.status,
            (
                counts.get(
                    evaluation.status
                ) ||
                0
            ) + 1
        );
    }

    return counts;
}

function createStatusSummary(
    evaluations
) {
    const counts =
        countStatuses(
            evaluations
        );

    return APPLICABILITY_STATUS_ORDER
        .filter(
            (status) =>
                (
                    counts.get(
                        status
                    ) ||
                    0
                ) > 0
        )
        .map(
            (status) => {
                const count =
                    counts.get(
                        status
                    );

                return `${
                    count
                } ${
                    statusLabel(
                        status
                    ).toLowerCase()
                }`;
            }
        )
        .join(" · ");
}

function resetMetrics(elements) {
    elements
        .dnaTraceabilityConfirmedCount
        .textContent =
        "0";

    elements
        .dnaTraceabilityDerivedCount
        .textContent =
        "0";

    elements
        .dnaTraceabilityRuleCount
        .textContent =
        "0";

    elements
        .dnaTraceabilityRecommendationCount
        .textContent =
        "0";
}

function renderBundle(
    documentObject,
    elements,
    bundle
) {
    clearElement(
        elements
            .dnaTraceabilityRuleList
    );

    clearElement(
        elements
            .dnaTraceabilityRecommendationList
    );

    const facts =
        asObject(
            bundle.facts
        );

    const confirmedFacts =
        asArray(
            facts.confirmed
        );

    const derivedFacts =
        asArray(
            facts.derived
        );

    const evaluations =
        asArray(
            bundle.ruleEvaluations
        );

    const recommendations =
        asArray(
            bundle.recommendations
        );

    elements
        .dnaTraceabilityConfirmedCount
        .textContent =
        String(
            confirmedFacts.length
        );

    elements
        .dnaTraceabilityDerivedCount
        .textContent =
        String(
            derivedFacts.length
        );

    elements
        .dnaTraceabilityRuleCount
        .textContent =
        String(
            evaluations.length
        );

    elements
        .dnaTraceabilityRecommendationCount
        .textContent =
        String(
            recommendations.length
        );

    const factIndex =
        indexFacts(
            bundle
        );

    const sourceIndex =
        indexSources(
            bundle
        );

    for (
        const evaluation
        of evaluations
    ) {
        elements
            .dnaTraceabilityRuleList
            .append(
                createRuleCard(
                    documentObject,
                    evaluation,
                    factIndex
                )
            );
    }

    if (recommendations.length) {
        for (
            const recommendation
            of recommendations
        ) {
            elements
                .dnaTraceabilityRecommendationList
                .append(
                    createRecommendationCard(
                        documentObject,
                        recommendation,
                        factIndex,
                        sourceIndex
                    )
                );
        }
    } else {
        elements
            .dnaTraceabilityRecommendationList
            .append(
                createElement(
                    documentObject,
                    "p",
                    {
                        className:
                            "dna-traceability__no-recommendations",

                        text:
                            "The evaluated rules did not create a current action recommendation."
                    }
                )
            );
    }

    elements
        .dnaTraceabilityStatus
        .textContent =
        [
            "Traceability ready.",
            createStatusSummary(
                evaluations
            )
        ]
            .filter(Boolean)
            .join(" ");

    elements
        .dnaTraceability
        .dataset
        .contractVersion =
        cleanText(
            bundle.contractVersion
        );

    elements
        .dnaTraceability
        .dataset
        .catalogVersion =
        cleanText(
            bundle.metadata
                ?.catalogVersion
        );
}

function readProtectedState(storage) {
    if (
        !storage ||
        typeof storage.getItem !==
            "function"
    ) {
        throw new Error(
            "Browser storage is unavailable. The protected assessment state cannot be read."
        );
    }

    let rawValue;

    try {
        rawValue =
            storage.getItem(
                LEGACY_KEYS.assessment
            );
    } catch (error) {
        throw new Error(
            "The protected assessment state could not be read from this browser."
        );
    }

    if (!rawValue) {
        return Object.freeze({
            found:
                false,

            value:
                null
        });
    }

    let parsed;

    try {
        parsed =
            JSON.parse(
                rawValue
            );
    } catch (error) {
        throw new Error(
            "The protected assessment state contains invalid JSON."
        );
    }

    if (
        !parsed ||
        typeof parsed !==
            "object" ||
        Array.isArray(parsed)
    ) {
        throw new Error(
            "The protected assessment state has an unsupported structure."
        );
    }

    return Object.freeze({
        found:
            true,

        value:
            parsed
    });
}

function resolveEvaluationTimestamp(
    state,
    now
) {
    const source =
        asObject(state);

    const candidates = [
        source.updatedAt,
        source.completedAt,
        source.generatedAt
    ];

    for (
        const candidate
        of candidates
    ) {
        const timestamp =
            Date.parse(
                cleanText(
                    candidate
                )
            );

        if (
            Number.isFinite(
                timestamp
            )
        ) {
            return new Date(
                timestamp
            ).toISOString();
        }
    }

    const fallback =
        typeof now ===
            "function"
            ? now()
            : new Date();

    const fallbackDate =
        fallback instanceof Date
            ? fallback
            : new Date(
                fallback
            );

    if (
        !Number.isFinite(
            fallbackDate.getTime()
        )
    ) {
        throw new Error(
            "A valid diagnostic evaluation time could not be determined."
        );
    }

    return fallbackDate
        .toISOString();
}

function createPublicState(
    internalState,
    adapter
) {
    return Object.freeze({
        version:
            TRACEABILITY_DIAGNOSTICS_VERSION,

        phase:
            internalState.phase,

        refreshedAt:
            internalState.refreshedAt,

        hasResult:
            Boolean(
                internalState.result
            ),

        error:
            internalState.error
                ? String(
                    internalState
                        .error
                        .message ||
                    internalState.error
                )
                : null,

        protectedAssessmentKey:
            LEGACY_KEYS.assessment,

        newStorageKeyIntroduced:
            false,

        stableReportMutation:
            false,

        adapterStatus:
            adapter.getStatus()
    });
}

function dispatchStatusEvent(
    runtime,
    state
) {
    if (
        !runtime ||
        typeof runtime.dispatchEvent !==
            "function" ||
        typeof runtime.CustomEvent !==
            "function"
    ) {
        return;
    }

    runtime.dispatchEvent(
        new runtime.CustomEvent(
            "growwithhr:traceability-diagnostics",
            {
                detail:
                    state
            }
        )
    );
}

/**
 * Creates the private-beta M2 diagnostic controller.
 *
 * The controller reads only the protected v2 assessment key. It never writes
 * traceability output to storage.
 *
 * @param {Object} options
 * @param {Document} [options.document]
 * @param {Window} [options.runtime]
 * @param {Storage} [options.storage]
 * @param {Function} [options.now]
 * @param {Object} [options.catalog]
 * @param {Function} [options.fetch]
 * @param {string} [options.catalogUrl]
 * @returns {Object}
 */
export function createTraceabilityDiagnostics(
    options = {}
) {
    const source =
        asObject(options);

    const runtime =
        source.runtime ||
        globalThis.window;

    const documentObject =
        source.document ||
        runtime?.document ||
        globalThis.document;

    if (!documentObject) {
        throw new Error(
            "GrowWithHR M2 diagnostics requires a document."
        );
    }

    const elements =
        collectElements(
            documentObject
        );

    const storage =
        source.storage ||
        runtime?.localStorage ||
        null;

    const now =
        typeof source.now ===
            "function"
            ? source.now
            : () => new Date();

    const adapter =
        createTraceabilityAdapter({
            runtime,

            catalog:
                source.catalog,

            fetch:
                source.fetch,

            catalogUrl:
                source.catalogUrl,

            now
        });

    const internalState = {
        phase:
            PHASE.IDLE,

        refreshedAt:
            null,

        result:
            null,

        error:
            null,

        destroyed:
            false,

        requestNumber:
            0
    };

    function publishState() {
        const state =
            createPublicState(
                internalState,
                adapter
            );

        dispatchStatusEvent(
            runtime,
            state
        );

        return state;
    }

    function setPhase(
        phase,
        message
    ) {
        internalState.phase =
            phase;

        elements
            .dnaTraceability
            .dataset
            .traceabilityState =
            phase;

        elements
            .dnaTraceabilityStatus
            .textContent =
            message;

        setHidden(
            elements
                .dnaTraceabilityEmpty,
            phase !==
                PHASE.EMPTY
        );

        setHidden(
            elements
                .dnaTraceabilityError,
            phase !==
                PHASE.ERROR
        );

        elements
            .dnaTraceabilityRefreshButton
            .disabled =
            phase ===
                PHASE.LOADING;

        elements
            .dnaTraceabilityRefreshButton
            .setAttribute(
                "aria-busy",
                phase ===
                    PHASE.LOADING
                    ? "true"
                    : "false"
            );
    }

    function resetRenderedRecords() {
        clearElement(
            elements
                .dnaTraceabilityRuleList
        );

        clearElement(
            elements
                .dnaTraceabilityRecommendationList
        );

        resetMetrics(
            elements
        );

        delete elements
            .dnaTraceability
            .dataset
            .contractVersion;

        delete elements
            .dnaTraceability
            .dataset
            .catalogVersion;
    }

    function renderEmptyState() {
        internalState.result =
            null;

        internalState.error =
            null;

        internalState.refreshedAt =
            now()
                instanceof Date
                ? now()
                    .toISOString()
                : new Date(
                    now()
                ).toISOString();

        resetRenderedRecords();

        setPhase(
            PHASE.EMPTY,
            "No saved assessment answers were found in this browser."
        );

        publishState();
    }

    function renderErrorState(error) {
        internalState.result =
            null;

        internalState.error =
            error;

        internalState.refreshedAt =
            new Date()
                .toISOString();

        resetRenderedRecords();

        elements
            .dnaTraceabilityErrorMessage
            .textContent =
            error?.message ||
            "The traceability diagnostic could not be prepared.";

        setPhase(
            PHASE.ERROR,
            "Traceability could not be prepared."
        );

        publishState();
    }

    async function refresh() {
        if (
            internalState.destroyed
        ) {
            throw new Error(
                "The traceability diagnostic controller has been destroyed."
            );
        }

        internalState.requestNumber +=
            1;

        const requestNumber =
            internalState.requestNumber;

        internalState.error =
            null;

        setPhase(
            PHASE.LOADING,
            "Loading protected assessment facts and deterministic recommendation traceability…"
        );

        publishState();

        try {
            await adapter.loadCatalog();

            if (
                requestNumber !==
                internalState.requestNumber
            ) {
                return null;
            }

            const protectedState =
                readProtectedState(
                    storage
                );

            if (!protectedState.found) {
                renderEmptyState();

                return null;
            }

            const evaluatedAt =
                resolveEvaluationTimestamp(
                    protectedState.value,
                    now
                );

            const result =
                adapter
                    .buildCompatibilityResult(
                        protectedState.value,
                        {
                            existingState:
                                protectedState.value,

                            evaluatedAt,

                            generatedAt:
                                evaluatedAt,

                            metadata: {
                                diagnosticsVersion:
                                    TRACEABILITY_DIAGNOSTICS_VERSION,

                                presentation:
                                    "private-beta-diagnostics",

                                protectedStateReadOnly:
                                    true,

                                newStorageKeyIntroduced:
                                    false,

                                stableReportMutation:
                                    false
                            }
                        }
                    );

            if (
                requestNumber !==
                internalState.requestNumber
            ) {
                return null;
            }

            internalState.result =
                result;

            internalState.error =
                null;

            internalState.refreshedAt =
                evaluatedAt;

            renderBundle(
                documentObject,
                elements,
                result.traceability
            );

            setPhase(
                PHASE.READY,
                elements
                    .dnaTraceabilityStatus
                    .textContent
            );

            publishState();

            return result;
        } catch (error) {
            if (
                requestNumber !==
                internalState.requestNumber
            ) {
                return null;
            }

            renderErrorState(
                error
            );

            return null;
        }
    }

    function handleStorageEvent(event) {
        if (
            event.key ===
                LEGACY_KEYS.assessment ||
            event.key ===
                null
        ) {
            refresh();
        }
    }

    function handleRefreshRequest() {
        refresh();
    }

    function handleRefreshEvent() {
        refresh();
    }

    elements
        .dnaTraceabilityRefreshButton
        .addEventListener(
            "click",
            handleRefreshRequest
        );

    runtime?.addEventListener(
        "storage",
        handleStorageEvent
    );

    runtime?.addEventListener(
        "growwithhr:traceability-refresh",
        handleRefreshEvent
    );

    const controller =
        Object.freeze({
            version:
                TRACEABILITY_DIAGNOSTICS_VERSION,

            protectedAssessmentKey:
                LEGACY_KEYS.assessment,

            refresh,

            getResult() {
                return internalState
                    .result;
            },

            getState() {
                return createPublicState(
                    internalState,
                    adapter
                );
            },

            getCatalog() {
                return adapter
                    .getCatalog();
            },

            destroy() {
                if (
                    internalState.destroyed
                ) {
                    return;
                }

                internalState.destroyed =
                    true;

                internalState.phase =
                    PHASE.DESTROYED;

                internalState.requestNumber +=
                    1;

                elements
                    .dnaTraceabilityRefreshButton
                    .removeEventListener(
                        "click",
                        handleRefreshRequest
                    );

                runtime?.removeEventListener(
                    "storage",
                    handleStorageEvent
                );

                runtime?.removeEventListener(
                    "growwithhr:traceability-refresh",
                    handleRefreshEvent
                );

                elements
                    .dnaTraceability
                    .dataset
                    .traceabilityState =
                    PHASE.DESTROYED;

                publishState();
            }
        });

    return controller;
}

function handleInitializationError(
    error
) {
    console.error(
        "GrowWithHR M2 traceability diagnostics could not start.",
        error
    );

    const root =
        globalThis.document
            ?.getElementById(
                "dnaTraceability"
            );

    const status =
        globalThis.document
            ?.getElementById(
                "dnaTraceabilityStatus"
            );

    const errorPanel =
        globalThis.document
            ?.getElementById(
                "dnaTraceabilityError"
            );

    const errorMessage =
        globalThis.document
            ?.getElementById(
                "dnaTraceabilityErrorMessage"
            );

    if (root) {
        root.dataset
            .traceabilityState =
            PHASE.ERROR;
    }

    if (status) {
        status.textContent =
            "Traceability could not be prepared.";
    }

    if (errorPanel) {
        errorPanel.hidden =
            false;
    }

    if (errorMessage) {
        errorMessage.textContent =
            error?.message ||
            "The traceability diagnostic controller could not start.";
    }
}

function start() {
    const documentObject =
        globalThis.document;

    if (
        !documentObject ||
        !documentObject
            .getElementById(
                "dnaTraceability"
            )
    ) {
        return;
    }

    try {
        const controller =
            createTraceabilityDiagnostics();

        globalThis.window
            .GrowWithHRTraceabilityDiagnostics =
            controller;

        controller.refresh();
    } catch (error) {
        handleInitializationError(
            error
        );
    }
}

if (
    typeof globalThis.document !==
        "undefined"
) {
    if (
        globalThis.document
            .readyState ===
        "loading"
    ) {
        globalThis.document
            .addEventListener(
                "DOMContentLoaded",
                start,
                {
                    once:
                        true
                }
            );
    } else {
        start();
    }
}

export default Object.freeze({
    version:
        TRACEABILITY_DIAGNOSTICS_VERSION,

    createTraceabilityDiagnostics
});
