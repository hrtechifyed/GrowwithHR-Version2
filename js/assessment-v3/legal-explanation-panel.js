/**
 * GrowWithHR Compliance DNA
 * Private-Beta POSH Legal Explanation Panel
 *
 * Reads only the three protected assessment answers accepted by the server:
 * employees, primaryState and locations. The server recomputes the
 * deterministic POSH decision before retrieval and explanation.
 *
 * This controller:
 * - makes no automatic provider request;
 * - writes nothing to browser storage;
 * - sends no name, email, company profile, evidence or wider assessment data;
 * - does not calculate or change legal applicability in the browser;
 * - does not modify the stable report, PDF, email or delivery contracts.
 */

import {
    LEGACY_KEYS
} from "./legacy-adapter.js";

export const LEGAL_EXPLANATION_PANEL_VERSION =
    "1.0.0";

export const LEGAL_EXPLANATION_ROUTE =
    "/api/legal-explanation/posh";

export const LEGAL_EXPLANATION_RENDER_ENDPOINT =
    `https://growwithhr.onrender.com${LEGAL_EXPLANATION_ROUTE}`;

export const LEGAL_EXPLANATION_STYLESHEET =
    "css/20-legal-explanation-panel.css";

export const LEGAL_EXPLANATION_REQUEST_TIMEOUT_MS =
    30 * 1000;

const GITHUB_PAGES_ORIGIN =
    "https://hrtechifyed.github.io";

const GITHUB_PAGES_PROJECT_PATH =
    "/GrowwithHR-Version2/";

const ALLOWED_DECISION_STATUSES =
    new Set([
        "specialist-review",
        "not-currently-applicable",
        "more-information-needed"
    ]);

const REQUIRED_ELEMENT_IDS =
    Object.freeze([
        "dnaLegalExplanation",
        "dnaLegalExplanationStatus",
        "dnaLegalExplanationButton",
        "dnaLegalExplanationMissing",
        "dnaLegalExplanationMissingMessage",
        "dnaLegalExplanationError",
        "dnaLegalExplanationErrorMessage",
        "dnaLegalExplanationContent",
        "dnaLegalExplanationDecisionBadge",
        "dnaLegalExplanationSummary",
        "dnaLegalExplanationRationale",
        "dnaLegalExplanationNextSteps",
        "dnaLegalExplanationCitations",
        "dnaLegalExplanationLimitations",
        "dnaLegalExplanationMetadata"
    ]);

const PHASE =
    Object.freeze({
        IDLE:
            "idle",

        READY:
            "ready",

        LOADING:
            "loading",

        COMPLETE:
            "complete",

        MISSING:
            "missing",

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

function parseInteger(value) {
    if (
        typeof value === "number" &&
        Number.isInteger(value)
    ) {
        return value;
    }

    const text =
        cleanText(value);

    if (!/^\d+$/.test(text)) {
        return null;
    }

    const parsed =
        Number.parseInt(
            text,
            10
        );

    return Number.isSafeInteger(parsed)
        ? parsed
        : null;
}

function unwrapSavedRecord(value) {
    const source =
        asObject(value);

    const wrapped =
        asObject(source.data);

    return Object.keys(wrapped).length
        ? wrapped
        : source;
}

function createElement(
    documentObject,
    tagName,
    options = {}
) {
    const source =
        asObject(options);

    const element =
        documentObject.createElement(
            tagName
        );

    if (cleanText(source.className)) {
        element.className =
            cleanText(source.className);
    }

    if (source.text !== undefined) {
        element.textContent =
            String(source.text);
    }

    for (
        const [name, value]
        of Object.entries(
            asObject(source.attributes)
        )
    ) {
        if (
            value === undefined ||
            value === null
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

function safeHttpsUrl(value) {
    const text =
        cleanText(value);

    if (!text) {
        return "";
    }

    try {
        const parsed =
            new URL(text);

        return parsed.protocol === "https:"
            ? parsed.href
            : "";
    } catch (_error) {
        return "";
    }
}

function statusLabel(status) {
    return cleanText(status)
        .split("-")
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0).toUpperCase() +
                part.slice(1)
        )
        .join(" ");
}

/**
 * Extracts only the server-approved POSH answer subset.
 *
 * @param {*} value
 * @returns {{ready: boolean, answers: Object|null, missingFields: readonly string[]}}
 */
export function extractPoshExplanationAnswers(value) {
    const record =
        unwrapSavedRecord(value);

    const answers =
        asObject(record.answers);

    const employees =
        parseInteger(
            answers.employees
        );

    const locations =
        parseInteger(
            answers.locations
        );

    const primaryState =
        cleanText(
            answers.primaryState
        );

    const missingFields = [];

    if (
        employees === null ||
        employees < 0
    ) {
        missingFields.push(
            "employee count"
        );
    }

    if (!primaryState) {
        missingFields.push(
            "primary operating state"
        );
    }

    if (
        locations === null ||
        locations < 1
    ) {
        missingFields.push(
            "operating location count"
        );
    }

    if (missingFields.length) {
        return Object.freeze({
            ready:
                false,

            answers:
                null,

            missingFields:
                Object.freeze([
                    ...missingFields
                ])
        });
    }

    return Object.freeze({
        ready:
            true,

        answers:
            Object.freeze({
                employees,
                primaryState:
                    primaryState.slice(0, 120),
                locations
            }),

        missingFields:
            Object.freeze([])
    });
}

export function createPoshExplanationRequestPayload(value) {
    const extracted =
        extractPoshExplanationAnswers(
            value
        );

    if (!extracted.ready) {
        throw new Error(
            `POSH explanation requires ${extracted.missingFields.join(", ")}.`
        );
    }

    return Object.freeze({
        answers:
            extracted.answers
    });
}

function isGitHubPagesDeployment(runtime) {
    const location =
        runtime?.location;

    if (
        !location ||
        location.origin !==
            GITHUB_PAGES_ORIGIN
    ) {
        return false;
    }

    return (
        location.pathname ===
            "/GrowwithHR-Version2" ||
        location.pathname.startsWith(
            GITHUB_PAGES_PROJECT_PATH
        )
    );
}

export function resolveLegalExplanationEndpoint(
    runtime = globalThis,
    documentObject = runtime?.document
) {
    const explicitEndpoint =
        cleanText(
            documentObject
                ?.body
                ?.dataset
                ?.legalExplanationEndpoint ||
            runtime
                ?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT
        );

    if (explicitEndpoint) {
        return explicitEndpoint;
    }

    return isGitHubPagesDeployment(runtime)
        ? LEGAL_EXPLANATION_RENDER_ENDPOINT
        : LEGAL_EXPLANATION_ROUTE;
}

function assertBooleanBoundary(
    source,
    property,
    expected
) {
    if (source[property] !== expected) {
        throw new Error(
            `The legal explanation response has an invalid ${property} boundary.`
        );
    }
}

/**
 * Performs a browser-side boundary check before rendering. The server's
 * governed explanation contract remains authoritative.
 *
 * @param {*} value
 * @returns {Object}
 */
export function validateLegalExplanationResponse(value) {
    const response =
        asObject(value);

    const decision =
        asObject(response.decision);

    const retrieval =
        asObject(response.retrieval);

    const explanation =
        asObject(response.explanation);

    const provider =
        asObject(explanation.provider);

    const generated =
        asObject(explanation.response);

    if (
        response.lawId !== "posh" ||
        response.legalReviewStatus !==
            "needs-legal-review" ||
        response.applicabilityAuthority !==
            "deterministic-only" ||
        response.providerRole !==
            "explanation-only"
    ) {
        throw new Error(
            "The legal explanation response did not preserve its governed authority boundaries."
        );
    }

    assertBooleanBoundary(
        response,
        "usedForDecision",
        false
    );

    assertBooleanBoundary(
        response,
        "mayChangeDecision",
        false
    );

    if (
        !ALLOWED_DECISION_STATUSES.has(
            cleanText(decision.status)
        ) ||
        decision.legalReviewStatus !==
            "needs-legal-review"
    ) {
        throw new Error(
            "The deterministic POSH decision is missing or unsupported."
        );
    }

    if (
        retrieval.retrievalStatus !==
            "completed" ||
        !cleanText(
            retrieval.decisionFingerprint
        ) ||
        !cleanText(
            retrieval.retrievalFingerprint
        ) ||
        !Array.isArray(
            retrieval.citations
        )
    ) {
        throw new Error(
            "The governed POSH retrieval trace is incomplete."
        );
    }

    if (
        explanation.explanationStatus !==
            "completed" ||
        provider.role !==
            "explanation-only" ||
        !cleanText(provider.name) ||
        !cleanText(provider.model)
    ) {
        throw new Error(
            "The explanation provider result is incomplete."
        );
    }

    assertBooleanBoundary(
        explanation,
        "usedForDecision",
        false
    );

    assertBooleanBoundary(
        explanation,
        "mayChangeDecision",
        false
    );

    assertBooleanBoundary(
        explanation,
        "legalAdvice",
        false
    );

    assertBooleanBoundary(
        generated,
        "usedForDecision",
        false
    );

    assertBooleanBoundary(
        generated,
        "mayChangeDecision",
        false
    );

    assertBooleanBoundary(
        generated,
        "legalAdvice",
        false
    );

    if (
        generated.legalReviewStatus !==
            "needs-legal-review" ||
        generated.decisionStatus !==
            decision.status ||
        generated.reasonCode !==
            decision.reasonCode ||
        generated.decisionFingerprint !==
            retrieval.decisionFingerprint ||
        explanation.decisionFingerprint !==
            retrieval.decisionFingerprint ||
        explanation.retrievalFingerprint !==
            retrieval.retrievalFingerprint ||
        !cleanText(generated.summary) ||
        !Array.isArray(generated.rationale) ||
        !generated.rationale.length ||
        !Array.isArray(generated.limitations) ||
        generated.limitations.length < 3
    ) {
        throw new Error(
            "The generated POSH explanation did not match the deterministic decision and retrieval trace."
        );
    }

    return response;
}

function ensureStylesheet(documentObject) {
    if (
        documentObject.getElementById(
            "growwithhrLegalExplanationStyles"
        )
    ) {
        return;
    }

    const stylesheet =
        createElement(
            documentObject,
            "link",
            {
                attributes: {
                    id:
                        "growwithhrLegalExplanationStyles",

                    rel:
                        "stylesheet",

                    href:
                        LEGAL_EXPLANATION_STYLESHEET
                }
            }
        );

    documentObject.head.append(
        stylesheet
    );
}

function createPanelMarkup(documentObject) {
    const root =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-legal-explanation",

                attributes: {
                    id:
                        "dnaLegalExplanation",

                    "data-legal-explanation-state":
                        PHASE.IDLE,

                    "aria-labelledby":
                        "dnaLegalExplanationTitle",

                    "aria-describedby":
                        "dnaLegalExplanationDescription"
                }
            }
        );

    const header =
        createElement(
            documentObject,
            "header",
            {
                className:
                    "dna-legal-explanation__header"
            }
        );

    const heading =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-legal-explanation__heading"
            }
        );

    heading.append(
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-legal-explanation__eyebrow",

                text:
                    "Private-beta legal explanation"
            }
        ),
        createElement(
            documentObject,
            "h2",
            {
                className:
                    "dna-legal-explanation__title",

                text:
                    "POSH source-grounded explanation",

                attributes: {
                    id:
                        "dnaLegalExplanationTitle"
                }
            }
        ),
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-legal-explanation__description",

                text:
                    "The server recomputes the deterministic POSH result, retrieves only approved source chunks and uses Cloudflare only to explain that fixed result.",

                attributes: {
                    id:
                        "dnaLegalExplanationDescription"
                }
            }
        )
    );

    const button =
        createElement(
            documentObject,
            "button",
            {
                className:
                    "dna-primary-button dna-legal-explanation__button",

                text:
                    "Generate POSH explanation",

                attributes: {
                    id:
                        "dnaLegalExplanationButton",

                    type:
                        "button",

                    "aria-busy":
                        "false"
                }
            }
        );

    header.append(
        heading,
        button
    );

    const note =
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-private-note"
            }
        );

    note.append(
        createElement(
            documentObject,
            "span",
            {
                className:
                    "dna-private-note__icon",

                text:
                    "●",

                attributes: {
                    "aria-hidden":
                        "true"
                }
            }
        ),
        createElement(
            documentObject,
            "span",
            {
                text:
                    "Only employee count, primary operating state and location count are sent. The output remains needs-legal-review, is not legal advice and is not saved into the report, PDF, email or browser storage."
            }
        )
    );

    const status =
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-legal-explanation__status",

                text:
                    "Checking the saved assessment answers required for the POSH explanation…",

                attributes: {
                    id:
                        "dnaLegalExplanationStatus",

                    role:
                        "status",

                    "aria-live":
                        "polite",

                    "aria-atomic":
                        "true"
                }
            }
        );

    const missing =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-legal-explanation__notice",

                attributes: {
                    id:
                        "dnaLegalExplanationMissing",

                    hidden:
                        "",

                    "aria-labelledby":
                        "dnaLegalExplanationMissingTitle"
                }
            }
        );

    missing.append(
        createElement(
            documentObject,
            "h3",
            {
                text:
                    "Saved POSH facts are incomplete",

                attributes: {
                    id:
                        "dnaLegalExplanationMissingTitle"
                }
            }
        ),
        createElement(
            documentObject,
            "p",
            {
                text:
                    "Complete the required fields in the stable assessment before requesting this private-beta explanation.",

                attributes: {
                    id:
                        "dnaLegalExplanationMissingMessage"
                }
            }
        )
    );

    const stableLink =
        createElement(
            documentObject,
            "a",
            {
                className:
                    "dna-secondary-button",

                text:
                    "Open the stable assessment",

                attributes: {
                    href:
                        "analyze-company.html"
                }
            }
        );

    missing.append(
        stableLink
    );

    const error =
        createElement(
            documentObject,
            "section",
            {
                className:
                    "dna-legal-explanation__notice dna-legal-explanation__notice--error",

                attributes: {
                    id:
                        "dnaLegalExplanationError",

                    hidden:
                        "",

                    role:
                        "alert",

                    "aria-labelledby":
                        "dnaLegalExplanationErrorTitle"
                }
            }
        );

    error.append(
        createElement(
            documentObject,
            "h3",
            {
                text:
                    "POSH explanation could not be prepared",

                attributes: {
                    id:
                        "dnaLegalExplanationErrorTitle"
                }
            }
        ),
        createElement(
            documentObject,
            "p",
            {
                text:
                    "The private-beta explanation service did not complete this request.",

                attributes: {
                    id:
                        "dnaLegalExplanationErrorMessage"
                }
            }
        )
    );

    const content =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-legal-explanation__content",

                attributes: {
                    id:
                        "dnaLegalExplanationContent",

                    hidden:
                        ""
                }
            }
        );

    const summaryCard =
        createElement(
            documentObject,
            "article",
            {
                className:
                    "dna-legal-explanation__summary-card"
            }
        );

    const summaryHeader =
        createElement(
            documentObject,
            "header",
            {
                className:
                    "dna-legal-explanation__summary-header"
            }
        );

    summaryHeader.append(
        createElement(
            documentObject,
            "h3",
            {
                text:
                    "Deterministic result explained"
            }
        ),
        createElement(
            documentObject,
            "span",
            {
                className:
                    "dna-legal-explanation__decision-badge",

                text:
                    "Waiting",

                attributes: {
                    id:
                        "dnaLegalExplanationDecisionBadge"
                }
            }
        )
    );

    summaryCard.append(
        summaryHeader,
        createElement(
            documentObject,
            "p",
            {
                className:
                    "dna-legal-explanation__summary",

                attributes: {
                    id:
                        "dnaLegalExplanationSummary"
                }
            }
        )
    );

    const detailGrid =
        createElement(
            documentObject,
            "div",
            {
                className:
                    "dna-legal-explanation__detail-grid"
            }
        );

    const detailDefinitions = [
        [
            "Why this result appears",
            "dnaLegalExplanationRationale"
        ],
        [
            "Next steps",
            "dnaLegalExplanationNextSteps"
        ],
        [
            "Approved citations",
            "dnaLegalExplanationCitations"
        ],
        [
            "Limitations",
            "dnaLegalExplanationLimitations"
        ]
    ];

    for (
        const [title, id]
        of detailDefinitions
    ) {
        const section =
            createElement(
                documentObject,
                "section",
                {
                    className:
                        "dna-legal-explanation__detail"
                }
            );

        section.append(
            createElement(
                documentObject,
                "h3",
                {
                    text:
                        title
                }
            ),
            createElement(
                documentObject,
                "div",
                {
                    attributes: {
                        id
                    }
                }
            )
        );

        detailGrid.append(
            section
        );
    }

    content.append(
        summaryCard,
        detailGrid,
        createElement(
            documentObject,
            "dl",
            {
                className:
                    "dna-legal-explanation__metadata",

                attributes: {
                    id:
                        "dnaLegalExplanationMetadata"
                }
            }
        )
    );

    root.append(
        header,
        note,
        status,
        missing,
        error,
        content
    );

    return root;
}

function collectElements(documentObject) {
    const elements = {};

    for (
        const id
        of REQUIRED_ELEMENT_IDS
    ) {
        const element =
            documentObject.getElementById(id);

        if (!element) {
            throw new Error(
                `GrowWithHR legal explanation panel requires #${id}.`
            );
        }

        elements[id] =
            element;
    }

    return elements;
}

function readProtectedState(storage) {
    if (
        !storage ||
        typeof storage.getItem !==
            "function"
    ) {
        throw new Error(
            "Browser storage is unavailable."
        );
    }

    const raw =
        storage.getItem(
            LEGACY_KEYS.assessment
        );

    if (!raw) {
        return null;
    }

    const parsed =
        JSON.parse(raw);

    if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
    ) {
        throw new Error(
            "The saved assessment has an unsupported structure."
        );
    }

    return parsed;
}

function listFromStrings(
    documentObject,
    values,
    options = {}
) {
    const source =
        asObject(options);

    const list =
        createElement(
            documentObject,
            "ul",
            {
                className:
                    cleanText(source.className) ||
                    "dna-legal-explanation__list"
            }
        );

    for (
        const value
        of asArray(values)
    ) {
        const text =
            cleanText(value);

        if (!text) {
            continue;
        }

        list.append(
            createElement(
                documentObject,
                "li",
                {
                    text
                }
            )
        );
    }

    return list;
}

function renderRationale(
    documentObject,
    element,
    rationale
) {
    clearElement(element);

    const list =
        createElement(
            documentObject,
            "ul",
            {
                className:
                    "dna-legal-explanation__list"
            }
        );

    for (
        const item
        of asArray(rationale)
    ) {
        const record =
            asObject(item);

        const statement =
            cleanText(record.statement);

        if (!statement) {
            continue;
        }

        const listItem =
            createElement(
                documentObject,
                "li"
            );

        listItem.append(
            createElement(
                documentObject,
                "p",
                {
                    text:
                        statement
                }
            )
        );

        const citationIds =
            asArray(
                record.citationChunkIds
            )
                .map(cleanText)
                .filter(Boolean);

        if (citationIds.length) {
            listItem.append(
                createElement(
                    documentObject,
                    "code",
                    {
                        text:
                            citationIds.join(", ")
                    }
                )
            );
        }

        list.append(
            listItem
        );
    }

    element.append(
        list
    );
}

function renderCitations(
    documentObject,
    element,
    citations
) {
    clearElement(element);

    const list =
        createElement(
            documentObject,
            "ul",
            {
                className:
                    "dna-legal-explanation__citation-list"
            }
        );

    for (
        const item
        of asArray(citations)
    ) {
        const citation =
            asObject(item);

        const title =
            cleanText(
                citation.sourceTitle
            );

        const url =
            safeHttpsUrl(
                citation.officialUrl
            );

        if (!title || !url) {
            continue;
        }

        const listItem =
            createElement(
                documentObject,
                "li"
            );

        listItem.append(
            createElement(
                documentObject,
                "a",
                {
                    text:
                        title,

                    attributes: {
                        href:
                            url,

                        target:
                            "_blank",

                        rel:
                            "noopener noreferrer"
                    }
                }
            ),
            createElement(
                documentObject,
                "span",
                {
                    text:
                        [
                            cleanText(
                                citation.sectionReference
                            ),
                            citation.pageStart
                                ? `pages ${citation.pageStart}-${citation.pageEnd || citation.pageStart}`
                                : ""
                        ]
                            .filter(Boolean)
                            .join(" · ")
                }
            ),
            createElement(
                documentObject,
                "code",
                {
                    text:
                        cleanText(
                            citation.chunkId
                        )
                }
            )
        );

        list.append(
            listItem
        );
    }

    element.append(
        list
    );
}

function appendMetadata(
    documentObject,
    element,
    label,
    value
) {
    const wrapper =
        createElement(
            documentObject,
            "div"
        );

    wrapper.append(
        createElement(
            documentObject,
            "dt",
            {
                text:
                    label
            }
        ),
        createElement(
            documentObject,
            "dd",
            {
                text:
                    value
            }
        )
    );

    element.append(
        wrapper
    );
}

function renderResponse(
    documentObject,
    elements,
    response
) {
    const decision =
        asObject(response.decision);

    const retrieval =
        asObject(response.retrieval);

    const explanation =
        asObject(response.explanation);

    const generated =
        asObject(explanation.response);

    const delivery =
        asObject(response.delivery);

    const provider =
        asObject(explanation.provider);

    elements
        .dnaLegalExplanationDecisionBadge
        .textContent =
        statusLabel(
            decision.status
        );

    elements
        .dnaLegalExplanationDecisionBadge
        .dataset
        .decisionStatus =
        decision.status;

    elements
        .dnaLegalExplanationSummary
        .textContent =
        generated.summary;

    renderRationale(
        documentObject,
        elements.dnaLegalExplanationRationale,
        generated.rationale
    );

    clearElement(
        elements.dnaLegalExplanationNextSteps
    );

    elements
        .dnaLegalExplanationNextSteps
        .append(
            listFromStrings(
                documentObject,
                generated.nextSteps
            )
        );

    renderCitations(
        documentObject,
        elements.dnaLegalExplanationCitations,
        retrieval.citations
    );

    clearElement(
        elements.dnaLegalExplanationLimitations
    );

    elements
        .dnaLegalExplanationLimitations
        .append(
            listFromStrings(
                documentObject,
                generated.limitations
            )
        );

    clearElement(
        elements.dnaLegalExplanationMetadata
    );

    appendMetadata(
        documentObject,
        elements.dnaLegalExplanationMetadata,
        "Provider",
        `${provider.name} · ${provider.model}`
    );

    appendMetadata(
        documentObject,
        elements.dnaLegalExplanationMetadata,
        "Provider role",
        provider.role
    );

    appendMetadata(
        documentObject,
        elements.dnaLegalExplanationMetadata,
        "Legal review status",
        response.legalReviewStatus
    );

    appendMetadata(
        documentObject,
        elements.dnaLegalExplanationMetadata,
        "Decision authority",
        response.applicabilityAuthority
    );

    appendMetadata(
        documentObject,
        elements.dnaLegalExplanationMetadata,
        "Delivery",
        `${cleanText(delivery.cacheStatus) || "unknown"} · ${Number(delivery.providerRequestsForThisResponse) || 0} provider request(s)`
    );

    appendMetadata(
        documentObject,
        elements.dnaLegalExplanationMetadata,
        "Decision fingerprint",
        retrieval.decisionFingerprint
    );
}

async function readJson(response) {
    try {
        return await response.json();
    } catch (_error) {
        return {};
    }
}

function publicErrorMessage(payload, status) {
    const error =
        asObject(
            asObject(payload).error
        );

    return cleanText(error.message) ||
        `The POSH explanation request returned status ${status}.`;
}

function createPublicState(
    internalState,
    endpoint
) {
    return Object.freeze({
        version:
            LEGAL_EXPLANATION_PANEL_VERSION,

        phase:
            internalState.phase,

        hasResult:
            Boolean(
                internalState.result
            ),

        error:
            internalState.error
                ? cleanText(
                    internalState.error.message ||
                    internalState.error
                )
                : null,

        endpoint,

        protectedAssessmentKey:
            LEGACY_KEYS.assessment,

        submittedFields:
            Object.freeze([
                "employees",
                "primaryState",
                "locations"
            ]),

        automaticProviderCall:
            false,

        newStorageKeyIntroduced:
            false,

        stableReportMutation:
            false,

        stablePdfMutation:
            false,

        stableEmailMutation:
            false
    });
}

export function createLegalExplanationPanel(
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
            "GrowWithHR legal explanation panel requires a document."
        );
    }

    const shell =
        source.mount ||
        documentObject.getElementById(
            "dnaShell"
        );

    if (!shell) {
        throw new Error(
            "GrowWithHR legal explanation panel requires #dnaShell."
        );
    }

    ensureStylesheet(
        documentObject
    );

    let root =
        documentObject.getElementById(
            "dnaLegalExplanation"
        );

    if (!root) {
        root =
            createPanelMarkup(
                documentObject
            );

        const traceability =
            documentObject.getElementById(
                "dnaTraceability"
            );

        if (
            traceability &&
            traceability.parentNode === shell
        ) {
            traceability.insertAdjacentElement(
                "afterend",
                root
            );
        } else {
            shell.append(
                root
            );
        }
    }

    const elements =
        collectElements(
            documentObject
        );

    const storage =
        source.storage ||
        runtime?.localStorage ||
        null;

    const fetchImpl =
        source.fetch ||
        runtime?.fetch?.bind(runtime) ||
        globalThis.fetch;

    if (typeof fetchImpl !== "function") {
        throw new Error(
            "GrowWithHR legal explanation panel requires Fetch."
        );
    }

    const endpoint =
        cleanText(source.endpoint) ||
        resolveLegalExplanationEndpoint(
            runtime,
            documentObject
        );

    const timeoutMs =
        Number.isInteger(
            source.timeoutMs
        )
            ? source.timeoutMs
            : LEGAL_EXPLANATION_REQUEST_TIMEOUT_MS;

    const internalState = {
        phase:
            PHASE.IDLE,

        result:
            null,

        error:
            null,

        destroyed:
            false,

        activeRequest:
            null,

        activeController:
            null
    };

    function setPhase(
        phase,
        message
    ) {
        internalState.phase =
            phase;

        elements
            .dnaLegalExplanation
            .dataset
            .legalExplanationState =
            phase;

        elements
            .dnaLegalExplanationStatus
            .textContent =
            message;

        const loading =
            phase ===
                PHASE.LOADING;

        elements
            .dnaLegalExplanationButton
            .setAttribute(
                "aria-busy",
                loading
                    ? "true"
                    : "false"
            );

        if (loading) {
            elements
                .dnaLegalExplanationButton
                .disabled =
                true;
        }
    }

    function resetOutput() {
        internalState.result =
            null;

        internalState.error =
            null;

        setHidden(
            elements
                .dnaLegalExplanationContent,
            true
        );

        setHidden(
            elements
                .dnaLegalExplanationError,
            true
        );

        delete elements
            .dnaLegalExplanationDecisionBadge
            .dataset
            .decisionStatus;

        elements
            .dnaLegalExplanationDecisionBadge
            .textContent =
            "Waiting";

        elements
            .dnaLegalExplanationSummary
            .textContent =
            "";

        for (
            const element
            of [
                elements.dnaLegalExplanationRationale,
                elements.dnaLegalExplanationNextSteps,
                elements.dnaLegalExplanationCitations,
                elements.dnaLegalExplanationLimitations,
                elements.dnaLegalExplanationMetadata
            ]
        ) {
            clearElement(element);
        }
    }

    function setMissingState(message) {
        resetOutput();

        elements
            .dnaLegalExplanationButton
            .disabled =
            true;

        elements
            .dnaLegalExplanationMissingMessage
            .textContent =
            message;

        setHidden(
            elements
                .dnaLegalExplanationMissing,
            false
        );

        setPhase(
            PHASE.MISSING,
            "The saved assessment does not yet contain every fact required for this POSH explanation."
        );
    }

    function refreshAvailability() {
        if (internalState.destroyed) {
            return null;
        }

        resetOutput();

        let savedState;

        try {
            savedState =
                readProtectedState(
                    storage
                );
        } catch (error) {
            setMissingState(
                error.message
            );

            return null;
        }

        if (!savedState) {
            setMissingState(
                "No saved assessment answers were found in this browser."
            );

            return null;
        }

        const extracted =
            extractPoshExplanationAnswers(
                savedState
            );

        if (!extracted.ready) {
            setMissingState(
                `Complete ${extracted.missingFields.join(", ")} in the stable assessment.`
            );

            return null;
        }

        setHidden(
            elements
                .dnaLegalExplanationMissing,
            true
        );

        setHidden(
            elements
                .dnaLegalExplanationError,
            true
        );

        elements
            .dnaLegalExplanationButton
            .disabled =
            false;

        setPhase(
            PHASE.READY,
            "Saved answers are ready. Generate the explanation only when you choose to call the free provider."
        );

        return extracted.answers;
    }

    function renderError(error) {
        internalState.result =
            null;

        internalState.error =
            error;

        setHidden(
            elements
                .dnaLegalExplanationContent,
            true
        );

        setHidden(
            elements
                .dnaLegalExplanationMissing,
            true
        );

        setHidden(
            elements
                .dnaLegalExplanationError,
            false
        );

        elements
            .dnaLegalExplanationErrorMessage
            .textContent =
            cleanText(
                error?.message
            ) ||
            "The private-beta explanation service did not complete this request.";

        elements
            .dnaLegalExplanationButton
            .disabled =
            false;

        setPhase(
            PHASE.ERROR,
            "The POSH explanation could not be prepared. The deterministic assessment and stable delivery paths are unchanged."
        );
    }

    async function requestExplanation() {
        if (internalState.destroyed) {
            throw new Error(
                "The legal explanation panel has been destroyed."
            );
        }

        if (internalState.activeRequest) {
            return internalState.activeRequest;
        }

        let savedState;
        let payload;

        try {
            savedState =
                readProtectedState(
                    storage
                );

            if (!savedState) {
                setMissingState(
                    "No saved assessment answers were found in this browser."
                );

                return null;
            }

            payload =
                createPoshExplanationRequestPayload(
                    savedState
                );
        } catch (error) {
            setMissingState(
                error.message
            );

            return null;
        }

        resetOutput();

        setHidden(
            elements
                .dnaLegalExplanationMissing,
            true
        );

        setPhase(
            PHASE.LOADING,
            "The server is recomputing the deterministic POSH result, retrieving approved sources and requesting an explanation…"
        );

        const controller =
            typeof runtime?.AbortController ===
                "function"
                ? new runtime.AbortController()
                : (
                    typeof AbortController ===
                        "function"
                        ? new AbortController()
                        : null
                );

        internalState.activeController =
            controller;

        const timer =
            runtime?.setTimeout
                ? runtime.setTimeout(
                    () => controller?.abort(),
                    timeoutMs
                )
                : setTimeout(
                    () => controller?.abort(),
                    timeoutMs
                );

        internalState.activeRequest =
            (async () => {
                try {
                    const response =
                        await fetchImpl(
                            endpoint,
                            {
                                method:
                                    "POST",

                                headers: {
                                    Accept:
                                        "application/json",

                                    "Content-Type":
                                        "application/json"
                                },

                                credentials:
                                    "omit",

                                cache:
                                    "no-store",

                                body:
                                    JSON.stringify(
                                        payload
                                    ),

                                signal:
                                    controller?.signal
                            }
                        );

                    const result =
                        await readJson(
                            response
                        );

                    if (!response.ok) {
                        throw new Error(
                            publicErrorMessage(
                                result,
                                response.status
                            )
                        );
                    }

                    const validated =
                        validateLegalExplanationResponse(
                            result
                        );

                    if (internalState.destroyed) {
                        return null;
                    }

                    internalState.result =
                        validated;

                    internalState.error =
                        null;

                    renderResponse(
                        documentObject,
                        elements,
                        validated
                    );

                    setHidden(
                        elements
                            .dnaLegalExplanationError,
                        true
                    );

                    setHidden(
                        elements
                            .dnaLegalExplanationContent,
                        false
                    );

                    elements
                        .dnaLegalExplanationButton
                        .disabled =
                        false;

                    setPhase(
                        PHASE.COMPLETE,
                        "POSH explanation completed. The result remains deterministic-only and needs legal review."
                    );

                    return validated;
                } catch (error) {
                    if (
                        error?.name ===
                            "AbortError"
                    ) {
                        renderError(
                            new Error(
                                "The POSH explanation request took too long. Please try again after the service is available."
                            )
                        );
                    } else {
                        renderError(
                            error
                        );
                    }

                    return null;
                } finally {
                    if (runtime?.clearTimeout) {
                        runtime.clearTimeout(
                            timer
                        );
                    } else {
                        clearTimeout(
                            timer
                        );
                    }

                    internalState.activeRequest =
                        null;

                    internalState.activeController =
                        null;
                }
            })();

        return internalState.activeRequest;
    }

    function handleStorage(event) {
        if (
            event.key ===
                LEGACY_KEYS.assessment ||
            event.key ===
                null
        ) {
            refreshAvailability();
        }
    }

    function handleTraceabilityStatus() {
        if (
            internalState.phase !==
                PHASE.LOADING
        ) {
            refreshAvailability();
        }
    }

    function handleRequest() {
        void requestExplanation();
    }

    elements
        .dnaLegalExplanationButton
        .addEventListener(
            "click",
            handleRequest
        );

    runtime?.addEventListener(
        "storage",
        handleStorage
    );

    runtime?.addEventListener(
        "growwithhr:traceability-diagnostics",
        handleTraceabilityStatus
    );

    refreshAvailability();

    return Object.freeze({
        version:
            LEGAL_EXPLANATION_PANEL_VERSION,

        endpoint,

        protectedAssessmentKey:
            LEGACY_KEYS.assessment,

        refreshAvailability,

        requestExplanation,

        getResult() {
            return internalState.result;
        },

        getState() {
            return createPublicState(
                internalState,
                endpoint
            );
        },

        destroy() {
            if (internalState.destroyed) {
                return;
            }

            internalState.destroyed =
                true;

            internalState.phase =
                PHASE.DESTROYED;

            internalState.activeController
                ?.abort();

            elements
                .dnaLegalExplanationButton
                .removeEventListener(
                    "click",
                    handleRequest
                );

            runtime?.removeEventListener(
                "storage",
                handleStorage
            );

            runtime?.removeEventListener(
                "growwithhr:traceability-diagnostics",
                handleTraceabilityStatus
            );

            elements
                .dnaLegalExplanation
                .dataset
                .legalExplanationState =
                PHASE.DESTROYED;
        }
    });
}

function start() {
    const documentObject =
        globalThis.document;

    if (
        !documentObject ||
        !documentObject.getElementById(
            "dnaShell"
        )
    ) {
        return;
    }

    try {
        const controller =
            createLegalExplanationPanel();

        globalThis.window
            .GrowWithHRLegalExplanationPanel =
            controller;
    } catch (error) {
        console.error(
            "GrowWithHR POSH legal explanation panel could not start.",
            error
        );
    }
}

if (
    typeof globalThis.document !==
        "undefined"
) {
    if (
        globalThis.document.readyState ===
            "loading"
    ) {
        globalThis.document.addEventListener(
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
        LEGAL_EXPLANATION_PANEL_VERSION,

    extractPoshExplanationAnswers,
    createPoshExplanationRequestPayload,
    resolveLegalExplanationEndpoint,
    validateLegalExplanationResponse,
    createLegalExplanationPanel
});
