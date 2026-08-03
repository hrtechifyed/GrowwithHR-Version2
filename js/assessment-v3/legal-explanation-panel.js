/**
 * GrowWithHR Compliance DNA — Private-Beta POSH Legal Explanation Panel
 *
 * Reads only employees, primaryState and locations from the protected
 * assessment record. The server recomputes the deterministic POSH decision.
 * This module makes no automatic provider call, writes no browser storage and
 * does not modify the stable report, PDF, email or delivery contracts.
 */

import { LEGACY_KEYS } from "./legacy-adapter.js";

export const LEGAL_EXPLANATION_PANEL_VERSION = "1.0.0";
export const LEGAL_EXPLANATION_ROUTE = "/api/legal-explanation/posh";
export const LEGAL_EXPLANATION_RENDER_ENDPOINT =
    `https://growwithhr.onrender.com${LEGAL_EXPLANATION_ROUTE}`;
export const LEGAL_EXPLANATION_STYLESHEET =
    "css/20-legal-explanation-panel.css";
export const LEGAL_EXPLANATION_REQUEST_TIMEOUT_MS = 30_000;

const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
const MAX_INTEGER_ANSWER = 10_000_000;
const MAX_STATE_LENGTH = 120;
const ALLOWED_DECISION_STATUSES = new Set([
    "specialist-review",
    "not-currently-applicable",
    "more-information-needed"
]);
const REQUIRED_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic decision.",
    "The rule and source interpretation remain subject to legal review.",
    "Assessment answers and evidence have not been independently verified."
]);
const PHASE = Object.freeze({
    IDLE: "idle",
    READY: "ready",
    LOADING: "loading",
    COMPLETE: "complete",
    MISSING: "missing",
    ERROR: "error",
    DESTROYED: "destroyed"
});
const IDS = Object.freeze([
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

const MARKUP = `
<header class="dna-legal-explanation__header">
  <div class="dna-legal-explanation__heading">
    <p class="dna-legal-explanation__eyebrow">Private-beta legal explanation</p>
    <h2 id="dnaLegalExplanationTitle" class="dna-legal-explanation__title">POSH source-grounded explanation</h2>
    <p id="dnaLegalExplanationDescription" class="dna-legal-explanation__description">The server recomputes the deterministic POSH result, retrieves only approved source chunks and uses Cloudflare only to explain that fixed result.</p>
  </div>
  <button id="dnaLegalExplanationButton" class="dna-primary-button dna-legal-explanation__button" type="button" aria-busy="false">Generate POSH explanation</button>
</header>
<p class="dna-private-note"><span class="dna-private-note__icon" aria-hidden="true">●</span><span>Only employee count, primary operating state and location count are sent. The output remains needs-legal-review, is not legal advice and is not saved into the report, PDF, email or browser storage.</span></p>
<p id="dnaLegalExplanationStatus" class="dna-legal-explanation__status" role="status" aria-live="polite" aria-atomic="true">Checking the saved assessment answers required for the POSH explanation…</p>
<section id="dnaLegalExplanationMissing" class="dna-legal-explanation__notice" aria-labelledby="dnaLegalExplanationMissingTitle" hidden>
  <h3 id="dnaLegalExplanationMissingTitle">Saved POSH facts are incomplete</h3>
  <p id="dnaLegalExplanationMissingMessage">Complete the required fields in the stable assessment before requesting this private-beta explanation.</p>
  <a class="dna-secondary-button" href="analyze-company.html">Open the stable assessment</a>
</section>
<section id="dnaLegalExplanationError" class="dna-legal-explanation__notice dna-legal-explanation__notice--error" aria-labelledby="dnaLegalExplanationErrorTitle" role="alert" hidden>
  <h3 id="dnaLegalExplanationErrorTitle">POSH explanation could not be prepared</h3>
  <p id="dnaLegalExplanationErrorMessage">The private-beta explanation service did not complete this request.</p>
</section>
<div id="dnaLegalExplanationContent" class="dna-legal-explanation__content" hidden>
  <article class="dna-legal-explanation__summary-card">
    <header class="dna-legal-explanation__summary-header">
      <h3>Deterministic result explained</h3>
      <span id="dnaLegalExplanationDecisionBadge" class="dna-legal-explanation__decision-badge">Waiting</span>
    </header>
    <p id="dnaLegalExplanationSummary" class="dna-legal-explanation__summary"></p>
  </article>
  <div class="dna-legal-explanation__detail-grid">
    <section class="dna-legal-explanation__detail"><h3>Why this result appears</h3><div id="dnaLegalExplanationRationale"></div></section>
    <section class="dna-legal-explanation__detail"><h3>Next steps</h3><div id="dnaLegalExplanationNextSteps"></div></section>
    <section class="dna-legal-explanation__detail"><h3>Approved citations</h3><div id="dnaLegalExplanationCitations"></div></section>
    <section class="dna-legal-explanation__detail"><h3>Limitations</h3><div id="dnaLegalExplanationLimitations"></div></section>
  </div>
  <dl id="dnaLegalExplanationMetadata" class="dna-legal-explanation__metadata"></dl>
</div>`;

const asObject = (value) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
const asArray = (value) => Array.isArray(value) ? value : [];
const cleanText = (value) => String(value ?? "").trim();

function parseInteger(value) {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    const text = cleanText(value);
    if (!/^\d+$/.test(text)) return null;
    const parsed = Number.parseInt(text, 10);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

function unwrapSavedRecord(value) {
    const source = asObject(value);
    const wrapped = asObject(source.data);
    return Object.keys(wrapped).length ? wrapped : source;
}

function safeHttpsUrl(value) {
    try {
        const parsed = new URL(cleanText(value));
        return parsed.protocol === "https:" ? parsed.href : "";
    } catch (_error) {
        return "";
    }
}

function statusLabel(status) {
    return cleanText(status)
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

/** Extracts only the exact answer subset accepted by the POSH endpoint. */
export function extractPoshExplanationAnswers(value) {
    const answers = asObject(unwrapSavedRecord(value).answers);
    const employees = parseInteger(answers.employees);
    const locations = parseInteger(answers.locations);
    const primaryState = cleanText(answers.primaryState);
    const missingFields = [];

    if (employees === null || employees < 0 || employees > MAX_INTEGER_ANSWER) {
        missingFields.push("employee count");
    }
    if (!primaryState || primaryState.length > MAX_STATE_LENGTH) {
        missingFields.push("primary operating state");
    }
    if (locations === null || locations < 1 || locations > MAX_INTEGER_ANSWER) {
        missingFields.push("operating location count");
    }

    if (missingFields.length) {
        return Object.freeze({
            ready: false,
            answers: null,
            missingFields: Object.freeze([...missingFields])
        });
    }

    return Object.freeze({
        ready: true,
        answers: Object.freeze({ employees, primaryState, locations }),
        missingFields: Object.freeze([])
    });
}

export function createPoshExplanationRequestPayload(value) {
    const extracted = extractPoshExplanationAnswers(value);
    if (!extracted.ready) {
        throw new Error(
            `POSH explanation requires ${extracted.missingFields.join(", ")}.`
        );
    }
    return Object.freeze({ answers: extracted.answers });
}

function isGitHubPagesDeployment(runtime) {
    const location = runtime?.location;
    return Boolean(
        location &&
        location.origin === GITHUB_PAGES_ORIGIN &&
        (
            location.pathname === "/GrowwithHR-Version2" ||
            location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH)
        )
    );
}

export function resolveLegalExplanationEndpoint(
    runtime = globalThis,
    documentObject = runtime?.document
) {
    const explicit = cleanText(
        documentObject?.body?.dataset?.legalExplanationEndpoint ||
        runtime?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT
    );
    if (explicit) return explicit;
    return isGitHubPagesDeployment(runtime)
        ? LEGAL_EXPLANATION_RENDER_ENDPOINT
        : LEGAL_EXPLANATION_ROUTE;
}

function assertFalse(source, property) {
    if (source[property] !== false) {
        throw new Error(
            `The legal explanation response has an invalid ${property} boundary.`
        );
    }
}

function validateRationale(rationale, citationIds) {
    if (!Array.isArray(rationale) || !rationale.length) return false;
    return rationale.every((item) => {
        const record = asObject(item);
        const ids = asArray(record.citationChunkIds).map(cleanText).filter(Boolean);
        return cleanText(record.statement) &&
            ids.length > 0 &&
            ids.every((id) => citationIds.has(id));
    });
}

/** Browser-side rendering boundary; the server contract remains authoritative. */
export function validateLegalExplanationResponse(value) {
    const response = asObject(value);
    const decision = asObject(response.decision);
    const retrieval = asObject(response.retrieval);
    const explanation = asObject(response.explanation);
    const provider = asObject(explanation.provider);
    const generated = asObject(explanation.response);
    const citations = asArray(retrieval.citations);
    const citationIds = new Set(
        citations.map((item) => cleanText(asObject(item).chunkId)).filter(Boolean)
    );

    if (
        response.lawId !== "posh" ||
        response.legalReviewStatus !== "needs-legal-review" ||
        response.applicabilityAuthority !== "deterministic-only" ||
        response.providerRole !== "explanation-only"
    ) {
        throw new Error(
            "The legal explanation response did not preserve its governed authority boundaries."
        );
    }
    assertFalse(response, "usedForDecision");
    assertFalse(response, "mayChangeDecision");

    if (
        !ALLOWED_DECISION_STATUSES.has(cleanText(decision.status)) ||
        decision.legalReviewStatus !== "needs-legal-review" ||
        !cleanText(decision.reasonCode)
    ) {
        throw new Error("The deterministic POSH decision is missing or unsupported.");
    }

    if (
        retrieval.retrievalStatus !== "completed" ||
        !cleanText(retrieval.decisionFingerprint) ||
        !cleanText(retrieval.retrievalFingerprint) ||
        !citations.length ||
        citationIds.size !== citations.length ||
        !citations.every((item) => {
            const citation = asObject(item);
            return cleanText(citation.chunkId) &&
                cleanText(citation.sourceTitle) &&
                safeHttpsUrl(citation.officialUrl);
        })
    ) {
        throw new Error("The governed POSH retrieval trace is incomplete.");
    }

    if (
        explanation.explanationStatus !== "completed" ||
        provider.role !== "explanation-only" ||
        !cleanText(provider.name) ||
        !cleanText(provider.model)
    ) {
        throw new Error("The explanation provider result is incomplete.");
    }
    assertFalse(explanation, "usedForDecision");
    assertFalse(explanation, "mayChangeDecision");
    assertFalse(explanation, "legalAdvice");
    assertFalse(generated, "usedForDecision");
    assertFalse(generated, "mayChangeDecision");
    assertFalse(generated, "legalAdvice");

    const limitations = asArray(generated.limitations);
    if (
        generated.contractVersion !== "1.0.0" ||
        generated.legalReviewStatus !== "needs-legal-review" ||
        generated.decisionStatus !== decision.status ||
        generated.reasonCode !== decision.reasonCode ||
        generated.decisionFingerprint !== retrieval.decisionFingerprint ||
        explanation.decisionFingerprint !== retrieval.decisionFingerprint ||
        explanation.retrievalFingerprint !== retrieval.retrievalFingerprint ||
        !cleanText(generated.summary) ||
        !validateRationale(generated.rationale, citationIds) ||
        !Array.isArray(generated.nextSteps) ||
        !REQUIRED_LIMITATIONS.every((item) => limitations.includes(item))
    ) {
        throw new Error(
            "The generated POSH explanation did not match the deterministic decision and retrieval trace."
        );
    }

    return response;
}

function ensureAssets(documentObject) {
    if (!documentObject.getElementById("growwithhrLegalExplanationStyles")) {
        const link = documentObject.createElement("link");
        link.id = "growwithhrLegalExplanationStyles";
        link.rel = "stylesheet";
        link.href = LEGAL_EXPLANATION_STYLESHEET;
        documentObject.head?.append(link);
    }

    let root = documentObject.getElementById("dnaLegalExplanation");
    if (root) return root;

    const shell = documentObject.getElementById("dnaShell");
    if (!shell) return null;

    root = documentObject.createElement("section");
    root.id = "dnaLegalExplanation";
    root.className = "dna-legal-explanation";
    root.dataset.legalExplanationState = PHASE.IDLE;
    root.setAttribute("aria-labelledby", "dnaLegalExplanationTitle");
    root.setAttribute("aria-describedby", "dnaLegalExplanationDescription");
    root.innerHTML = MARKUP;

    const traceability = documentObject.getElementById("dnaTraceability");
    if (traceability?.parentNode === shell) {
        traceability.insertAdjacentElement("afterend", root);
    } else {
        shell.append(root);
    }
    return root;
}

function collect(documentObject) {
    const elements = {};
    IDS.forEach((id) => {
        const node = documentObject.getElementById(id);
        if (!node) throw new Error(`GrowWithHR legal explanation panel requires #${id}.`);
        elements[id] = node;
    });
    return elements;
}

function readProtectedState(storage) {
    if (!storage || typeof storage.getItem !== "function") {
        throw new Error("Browser storage is unavailable.");
    }
    const raw = storage.getItem(LEGACY_KEYS.assessment);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("The saved assessment has an unsupported structure.");
    }
    return parsed;
}

function element(documentObject, tagName, className = "", text = "") {
    const node = documentObject.createElement(tagName);
    if (className) node.className = className;
    if (text !== "") node.textContent = String(text);
    return node;
}

function renderStringList(documentObject, mount, values) {
    mount.replaceChildren();
    const list = element(documentObject, "ul", "dna-legal-explanation__list");
    asArray(values).map(cleanText).filter(Boolean).forEach((value) => {
        list.append(element(documentObject, "li", "", value));
    });
    mount.append(list);
}

function renderRationale(documentObject, mount, rationale) {
    mount.replaceChildren();
    const list = element(documentObject, "ul", "dna-legal-explanation__list");
    asArray(rationale).forEach((item) => {
        const record = asObject(item);
        const listItem = element(documentObject, "li");
        listItem.append(element(documentObject, "p", "", record.statement));
        const ids = asArray(record.citationChunkIds).map(cleanText).filter(Boolean);
        if (ids.length) listItem.append(element(documentObject, "code", "", ids.join(", ")));
        list.append(listItem);
    });
    mount.append(list);
}

function renderCitations(documentObject, mount, citations) {
    mount.replaceChildren();
    const list = element(documentObject, "ul", "dna-legal-explanation__citation-list");
    asArray(citations).forEach((item) => {
        const citation = asObject(item);
        const title = cleanText(citation.sourceTitle);
        const url = safeHttpsUrl(citation.officialUrl);
        if (!title || !url) return;

        const listItem = element(documentObject, "li");
        const link = element(documentObject, "a", "", title);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        listItem.append(
            link,
            element(
                documentObject,
                "span",
                "",
                [
                    cleanText(citation.sectionReference),
                    citation.pageStart
                        ? `pages ${citation.pageStart}-${citation.pageEnd || citation.pageStart}`
                        : ""
                ].filter(Boolean).join(" · ")
            ),
            element(documentObject, "code", "", cleanText(citation.chunkId))
        );
        list.append(listItem);
    });
    mount.append(list);
}

function appendMetadata(documentObject, mount, label, value) {
    const wrapper = element(documentObject, "div");
    wrapper.append(
        element(documentObject, "dt", "", label),
        element(documentObject, "dd", "", value)
    );
    mount.append(wrapper);
}

function renderResponse(documentObject, elements, response) {
    const decision = asObject(response.decision);
    const retrieval = asObject(response.retrieval);
    const explanation = asObject(response.explanation);
    const generated = asObject(explanation.response);
    const delivery = asObject(response.delivery);
    const provider = asObject(explanation.provider);

    elements.dnaLegalExplanationDecisionBadge.textContent = statusLabel(decision.status);
    elements.dnaLegalExplanationDecisionBadge.dataset.decisionStatus = decision.status;
    elements.dnaLegalExplanationSummary.textContent = generated.summary;
    renderRationale(documentObject, elements.dnaLegalExplanationRationale, generated.rationale);
    renderStringList(documentObject, elements.dnaLegalExplanationNextSteps, generated.nextSteps);
    renderCitations(documentObject, elements.dnaLegalExplanationCitations, retrieval.citations);
    renderStringList(documentObject, elements.dnaLegalExplanationLimitations, generated.limitations);

    const metadata = elements.dnaLegalExplanationMetadata;
    metadata.replaceChildren();
    appendMetadata(documentObject, metadata, "Provider", `${provider.name} · ${provider.model}`);
    appendMetadata(documentObject, metadata, "Provider role", provider.role);
    appendMetadata(documentObject, metadata, "Legal review status", response.legalReviewStatus);
    appendMetadata(documentObject, metadata, "Decision authority", response.applicabilityAuthority);
    appendMetadata(
        documentObject,
        metadata,
        "Delivery",
        `${cleanText(delivery.cacheStatus) || "unknown"} · ${Number(delivery.providerRequestsForThisResponse) || 0} provider request(s)`
    );
    appendMetadata(documentObject, metadata, "Decision fingerprint", retrieval.decisionFingerprint);
}

async function readJson(response) {
    try {
        return await response.json();
    } catch (_error) {
        return {};
    }
}

function publicErrorMessage(payload, status) {
    return cleanText(asObject(asObject(payload).error).message) ||
        `The POSH explanation request returned status ${status}.`;
}

function publicState(internalState, endpoint) {
    return Object.freeze({
        version: LEGAL_EXPLANATION_PANEL_VERSION,
        phase: internalState.phase,
        hasResult: Boolean(internalState.result),
        error: internalState.error
            ? cleanText(internalState.error.message || internalState.error)
            : null,
        endpoint,
        protectedAssessmentKey: LEGACY_KEYS.assessment,
        submittedFields: Object.freeze(["employees", "primaryState", "locations"]),
        automaticProviderCall: false,
        newStorageKeyIntroduced: false,
        stableReportMutation: false,
        stablePdfMutation: false,
        stableEmailMutation: false
    });
}

export function createLegalExplanationPanel(options = {}) {
    const source = asObject(options);
    const runtime = source.runtime || globalThis.window;
    const documentObject = source.document || runtime?.document || globalThis.document;
    if (!documentObject) throw new Error("GrowWithHR legal explanation panel requires a document.");
    if (!ensureAssets(documentObject)) {
        throw new Error("GrowWithHR legal explanation panel requires #dnaShell.");
    }

    const elements = collect(documentObject);
    const storage = source.storage || runtime?.localStorage || null;
    const fetchImpl = source.fetch || runtime?.fetch?.bind(runtime) || globalThis.fetch;
    if (typeof fetchImpl !== "function") {
        throw new Error("GrowWithHR legal explanation panel requires Fetch.");
    }
    const endpoint = cleanText(source.endpoint) ||
        resolveLegalExplanationEndpoint(runtime, documentObject);
    const timeoutMs = Number.isInteger(source.timeoutMs)
        ? source.timeoutMs
        : LEGAL_EXPLANATION_REQUEST_TIMEOUT_MS;
    const internalState = {
        phase: PHASE.IDLE,
        result: null,
        error: null,
        destroyed: false,
        activeRequest: null,
        activeController: null
    };

    function setPhase(phase, message) {
        internalState.phase = phase;
        elements.dnaLegalExplanation.dataset.legalExplanationState = phase;
        elements.dnaLegalExplanationStatus.textContent = message;
        const loading = phase === PHASE.LOADING;
        elements.dnaLegalExplanationButton.setAttribute(
            "aria-busy",
            loading ? "true" : "false"
        );
        if (loading) elements.dnaLegalExplanationButton.disabled = true;
    }

    function resetOutput() {
        internalState.result = null;
        internalState.error = null;
        elements.dnaLegalExplanationContent.hidden = true;
        elements.dnaLegalExplanationError.hidden = true;
        delete elements.dnaLegalExplanationDecisionBadge.dataset.decisionStatus;
        elements.dnaLegalExplanationDecisionBadge.textContent = "Waiting";
        elements.dnaLegalExplanationSummary.textContent = "";
        [
            elements.dnaLegalExplanationRationale,
            elements.dnaLegalExplanationNextSteps,
            elements.dnaLegalExplanationCitations,
            elements.dnaLegalExplanationLimitations,
            elements.dnaLegalExplanationMetadata
        ].forEach((node) => node.replaceChildren());
    }

    function setMissing(message) {
        resetOutput();
        elements.dnaLegalExplanationButton.disabled = true;
        elements.dnaLegalExplanationMissingMessage.textContent = message;
        elements.dnaLegalExplanationMissing.hidden = false;
        setPhase(
            PHASE.MISSING,
            "The saved assessment does not yet contain every fact required for this POSH explanation."
        );
    }

    function refreshAvailability() {
        if (internalState.destroyed) return null;
        resetOutput();
        let savedState;
        try {
            savedState = readProtectedState(storage);
        } catch (error) {
            setMissing(error.message);
            return null;
        }
        if (!savedState) {
            setMissing("No saved assessment answers were found in this browser.");
            return null;
        }

        const extracted = extractPoshExplanationAnswers(savedState);
        if (!extracted.ready) {
            setMissing(`Complete ${extracted.missingFields.join(", ")} in the stable assessment.`);
            return null;
        }

        elements.dnaLegalExplanationMissing.hidden = true;
        elements.dnaLegalExplanationError.hidden = true;
        elements.dnaLegalExplanationButton.disabled = false;
        setPhase(
            PHASE.READY,
            "Saved answers are ready. Generate the explanation only when you choose to call the free provider."
        );
        return extracted.answers;
    }

    function renderError(error) {
        internalState.result = null;
        internalState.error = error;
        elements.dnaLegalExplanationContent.hidden = true;
        elements.dnaLegalExplanationMissing.hidden = true;
        elements.dnaLegalExplanationError.hidden = false;
        elements.dnaLegalExplanationErrorMessage.textContent =
            cleanText(error?.message) ||
            "The private-beta explanation service did not complete this request.";
        elements.dnaLegalExplanationButton.disabled = false;
        setPhase(
            PHASE.ERROR,
            "The POSH explanation could not be prepared. The deterministic assessment and stable delivery paths are unchanged."
        );
    }

    async function requestExplanation() {
        if (internalState.destroyed) {
            throw new Error("The legal explanation panel has been destroyed.");
        }
        if (internalState.activeRequest) return internalState.activeRequest;

        let payload;
        try {
            const savedState = readProtectedState(storage);
            if (!savedState) {
                setMissing("No saved assessment answers were found in this browser.");
                return null;
            }
            payload = createPoshExplanationRequestPayload(savedState);
        } catch (error) {
            setMissing(error.message);
            return null;
        }

        resetOutput();
        elements.dnaLegalExplanationMissing.hidden = true;
        setPhase(
            PHASE.LOADING,
            "The server is recomputing the deterministic POSH result, retrieving approved sources and requesting an explanation…"
        );

        const AbortControllerClass = runtime?.AbortController || globalThis.AbortController;
        const controller = typeof AbortControllerClass === "function"
            ? new AbortControllerClass()
            : null;
        internalState.activeController = controller;
        const schedule = runtime?.setTimeout?.bind(runtime) || globalThis.setTimeout;
        const cancel = runtime?.clearTimeout?.bind(runtime) || globalThis.clearTimeout;
        const timer = schedule(() => controller?.abort(), timeoutMs);

        internalState.activeRequest = (async () => {
            try {
                const response = await fetchImpl(endpoint, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    credentials: "omit",
                    cache: "no-store",
                    body: JSON.stringify(payload),
                    signal: controller?.signal
                });
                const result = await readJson(response);
                if (!response.ok) {
                    throw new Error(publicErrorMessage(result, response.status));
                }
                const validated = validateLegalExplanationResponse(result);
                if (internalState.destroyed) return null;

                internalState.result = validated;
                internalState.error = null;
                renderResponse(documentObject, elements, validated);
                elements.dnaLegalExplanationError.hidden = true;
                elements.dnaLegalExplanationContent.hidden = false;
                elements.dnaLegalExplanationButton.disabled = false;
                setPhase(
                    PHASE.COMPLETE,
                    "POSH explanation completed. The result remains deterministic-only and needs legal review."
                );
                return validated;
            } catch (error) {
                renderError(
                    error?.name === "AbortError"
                        ? new Error(
                            "The POSH explanation request took too long. Please try again after the service is available."
                        )
                        : error
                );
                return null;
            } finally {
                cancel(timer);
                internalState.activeRequest = null;
                internalState.activeController = null;
            }
        })();

        return internalState.activeRequest;
    }

    const handleRequest = () => { void requestExplanation(); };
    const handleStorage = (event) => {
        if (event.key === LEGACY_KEYS.assessment || event.key === null) {
            refreshAvailability();
        }
    };
    const handleTraceabilityStatus = () => {
        if (internalState.phase !== PHASE.LOADING) refreshAvailability();
    };

    elements.dnaLegalExplanationButton.addEventListener("click", handleRequest);
    runtime?.addEventListener("storage", handleStorage);
    runtime?.addEventListener(
        "growwithhr:traceability-diagnostics",
        handleTraceabilityStatus
    );
    refreshAvailability();

    return Object.freeze({
        version: LEGAL_EXPLANATION_PANEL_VERSION,
        endpoint,
        protectedAssessmentKey: LEGACY_KEYS.assessment,
        refreshAvailability,
        requestExplanation,
        getResult: () => internalState.result,
        getState: () => publicState(internalState, endpoint),
        destroy() {
            if (internalState.destroyed) return;
            internalState.destroyed = true;
            internalState.phase = PHASE.DESTROYED;
            internalState.activeController?.abort();
            elements.dnaLegalExplanationButton.removeEventListener("click", handleRequest);
            runtime?.removeEventListener("storage", handleStorage);
            runtime?.removeEventListener(
                "growwithhr:traceability-diagnostics",
                handleTraceabilityStatus
            );
            elements.dnaLegalExplanation.dataset.legalExplanationState = PHASE.DESTROYED;
        }
    });
}

function start() {
    const documentObject = globalThis.document;
    if (!documentObject?.getElementById("dnaShell")) return;
    try {
        globalThis.window.GrowWithHRLegalExplanationPanel =
            createLegalExplanationPanel();
    } catch (error) {
        console.error(
            "GrowWithHR POSH legal explanation panel could not start.",
            error
        );
    }
}

if (typeof globalThis.document !== "undefined") {
    if (globalThis.document.readyState === "loading") {
        globalThis.document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
}

export default Object.freeze({
    version: LEGAL_EXPLANATION_PANEL_VERSION,
    extractPoshExplanationAnswers,
    createPoshExplanationRequestPayload,
    resolveLegalExplanationEndpoint,
    validateLegalExplanationResponse,
    createLegalExplanationPanel
});
