/**
 * GrowWithHR Compliance DNA — Private-Beta Operational Explanation Panel
 *
 * Provides manual explanation-only requests for six existing deterministic
 * operational recommendations. It reads a minimal allowlisted subset from the
 * protected assessment record, writes no storage and does not modify the
 * stable report, PDF, email or evidence contracts.
 */

import { LEGACY_KEYS } from "./legacy-adapter.js";

export const OPERATIONAL_EXPLANATION_PANEL_VERSION = "1.0.0";
export const OPERATIONAL_EXPLANATION_ROUTE = "/api/operational-explanation";
export const OPERATIONAL_EXPLANATION_RENDER_ENDPOINT =
    `https://growwithhr.onrender.com${OPERATIONAL_EXPLANATION_ROUTE}`;
export const OPERATIONAL_EXPLANATION_STYLESHEET =
    "css/21-operational-explanation-panel.css";
export const OPERATIONAL_EXPLANATION_REQUEST_TIMEOUT_MS = 30_000;

const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
const MAX_INTEGER_ANSWER = 10_000_000;
const ALLOWED_STATUSES = new Set([
    "recommended",
    "not-triggered",
    "more-information-needed"
]);
const REQUIRED_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic operational recommendation.",
    "This output is general HR guidance and not legal advice.",
    "Assessment answers and supporting evidence have not been independently verified."
]);

export const OPERATIONAL_FEATURES = Object.freeze([
    Object.freeze({
        id: "feature.advisory.employment-documentation",
        title: "Employment documentation",
        description: "Review whether current workforce documentation needs structured attention.",
        fields: Object.freeze(["employees"])
    }),
    Object.freeze({
        id: "feature.advisory.multi-location-workplace",
        title: "Multi-location workplace practices",
        description: "Review consistency of workplace ownership, notices, records and communication across locations.",
        fields: Object.freeze(["locations"])
    }),
    Object.freeze({
        id: "feature.advisory.distributed-workforce",
        title: "Distributed workforce practices",
        description: "Review operational practices for remote, hybrid, field-based or mixed teams.",
        fields: Object.freeze(["workModel", "remoteBand", "remoteExact"])
    }),
    Object.freeze({
        id: "feature.advisory.workforce-planning",
        title: "Workforce planning",
        description: "Review hiring and expansion plans against People and manager capacity.",
        fields: Object.freeze(["hiringPlans", "expansionPlans"])
    }),
    Object.freeze({
        id: "feature.advisory.people-governance-ownership",
        title: "People-governance ownership",
        description: "Review whether accountability for People decisions, records and escalation is clear.",
        fields: Object.freeze(["peopleFunction"])
    }),
    Object.freeze({
        id: "feature.advisory.policies-compliance-priority",
        title: "Policies and compliance priority",
        description: "Explain the operational recommendation triggered by the selected People priorities.",
        fields: Object.freeze(["priorities"])
    })
]);

const FEATURE_INDEX = new Map(OPERATIONAL_FEATURES.map((feature) => [feature.id, feature]));
const asObject = (value) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
const asArray = (value) => Array.isArray(value) ? value : [];
const cleanText = (value) => String(value ?? "").trim();

function parseInteger(value) {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    const source = cleanText(value);
    if (!/^\d+$/.test(source)) return null;
    const parsed = Number.parseInt(source, 10);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

function unwrapSavedRecord(value) {
    const source = asObject(value);
    const wrapped = asObject(source.data);
    return Object.keys(wrapped).length ? wrapped : source;
}

function normalizeText(value, maximum = 160) {
    const normalized = cleanText(value);
    return normalized && normalized.length <= maximum ? normalized : null;
}

function normalizeTextArray(value) {
    if (!Array.isArray(value) || value.length > 20) return null;
    const normalized = [
        ...new Set(value.map((item) => normalizeText(item, 120)).filter(Boolean))
    ];
    return normalized.length ? normalized : null;
}

function normalizeField(key, value) {
    switch (key) {
        case "employees": {
            const parsed = parseInteger(value);
            return parsed !== null && parsed >= 0 && parsed <= MAX_INTEGER_ANSWER
                ? parsed
                : null;
        }
        case "locations": {
            const parsed = parseInteger(value);
            return parsed !== null && parsed >= 1 && parsed <= MAX_INTEGER_ANSWER
                ? parsed
                : null;
        }
        case "remoteExact": {
            const parsed = parseInteger(value);
            return parsed !== null && parsed >= 0 && parsed <= 100
                ? parsed
                : null;
        }
        case "workModel":
        case "remoteBand":
        case "hiringPlans":
        case "peopleFunction":
            return normalizeText(value);
        case "expansionPlans":
        case "priorities":
            return normalizeTextArray(value);
        default:
            return null;
    }
}

function fieldLabel(key) {
    return {
        employees: "employee count",
        locations: "location count",
        workModel: "working model",
        remoteBand: "remote workforce band",
        remoteExact: "remote workforce percentage",
        hiringPlans: "hiring plan",
        expansionPlans: "expansion plans",
        peopleFunction: "People-function model",
        priorities: "selected priorities"
    }[key] || key;
}

/** Extracts only the selected feature's endpoint allowlist. */
export function extractOperationalExplanationAnswers(value, featureId) {
    const feature = FEATURE_INDEX.get(cleanText(featureId));
    if (!feature) throw new Error("Unsupported operational explanation feature.");

    const answers = asObject(unwrapSavedRecord(value).answers);
    const selected = {};
    const missingFields = [];

    feature.fields.forEach((key) => {
        const normalized = normalizeField(key, answers[key]);
        if (normalized === null) missingFields.push(fieldLabel(key));
        else selected[key] = normalized;
    });

    return Object.freeze({
        featureId: feature.id,
        answers: Object.freeze(selected),
        missingFields: Object.freeze(missingFields)
    });
}

export function createOperationalExplanationRequestPayload(value, featureId) {
    const extracted = extractOperationalExplanationAnswers(value, featureId);
    return Object.freeze({
        featureId: extracted.featureId,
        answers: extracted.answers
    });
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

export function resolveOperationalExplanationEndpoint(
    runtime = globalThis,
    documentObject = runtime?.document
) {
    const explicit = cleanText(
        documentObject?.body?.dataset?.operationalExplanationEndpoint ||
        runtime?.GROWWITHHR_OPERATIONAL_EXPLANATION_ENDPOINT
    );
    if (explicit) return explicit;
    return isGitHubPagesDeployment(runtime)
        ? OPERATIONAL_EXPLANATION_RENDER_ENDPOINT
        : OPERATIONAL_EXPLANATION_ROUTE;
}

function safeHttpsUrl(value) {
    try {
        const parsed = new URL(cleanText(value));
        return parsed.protocol === "https:" ? parsed.href : "";
    } catch (_error) {
        return "";
    }
}

function assertFalse(source, property) {
    if (source[property] !== false) {
        throw new Error(`The operational explanation response has an invalid ${property} boundary.`);
    }
}

export function validateOperationalExplanationEnvelope(value, expectedFeatureId = "") {
    const response = asObject(value);
    const recommendation = asObject(response.recommendation);
    const guidance = asObject(response.guidance);
    const explanation = asObject(response.explanation);
    const provider = asObject(explanation.provider);
    const generated = asObject(explanation.response);
    const sources = asArray(guidance.sources);
    const featureId = cleanText(response.featureId);

    if (
        !FEATURE_INDEX.has(featureId) ||
        (expectedFeatureId && featureId !== expectedFeatureId) ||
        response.recommendationAuthority !== "deterministic-operational" ||
        response.providerRole !== "explanation-only" ||
        response.legalAdvice !== false
    ) {
        throw new Error("The operational explanation response did not preserve its authority boundaries.");
    }
    assertFalse(response, "usedForRecommendation");
    assertFalse(response, "mayChangeRecommendation");

    if (
        recommendation.featureId !== featureId ||
        !ALLOWED_STATUSES.has(cleanText(recommendation.operationalStatus)) ||
        !cleanText(recommendation.ruleId) ||
        !cleanText(recommendation.reasonCode) ||
        !/^[a-f0-9]{64}$/.test(cleanText(recommendation.recommendationFingerprint))
    ) {
        throw new Error("The deterministic operational recommendation is incomplete.");
    }

    const sourceIds = new Set();
    if (!sources.length || !sources.every((sourceValue) => {
        const source = asObject(sourceValue);
        const id = cleanText(source.id);
        const valid = id && cleanText(source.title) && source.official === true && safeHttpsUrl(source.url);
        if (!valid || sourceIds.has(id)) return false;
        sourceIds.add(id);
        return true;
    })) {
        throw new Error("The operational guidance references are incomplete.");
    }

    if (
        explanation.explanationStatus !== "completed" ||
        provider.role !== "explanation-only" ||
        !cleanText(provider.name) ||
        !cleanText(provider.model)
    ) {
        throw new Error("The operational explanation provider result is incomplete.");
    }
    assertFalse(explanation, "usedForRecommendation");
    assertFalse(explanation, "mayChangeRecommendation");
    assertFalse(explanation, "legalAdvice");
    assertFalse(generated, "usedForRecommendation");
    assertFalse(generated, "mayChangeRecommendation");
    assertFalse(generated, "legalAdvice");

    const limitations = asArray(generated.limitations);
    const rationale = asArray(generated.rationale);
    if (
        generated.contractVersion !== "1.0.0" ||
        generated.recommendationFingerprint !== recommendation.recommendationFingerprint ||
        generated.operationalStatus !== recommendation.operationalStatus ||
        generated.reasonCode !== recommendation.reasonCode ||
        explanation.recommendationFingerprint !== recommendation.recommendationFingerprint ||
        !cleanText(generated.summary) ||
        !rationale.length ||
        !rationale.every((itemValue) => {
            const item = asObject(itemValue);
            const ids = asArray(item.sourceIds).map(cleanText).filter(Boolean);
            return cleanText(item.statement) &&
                ids.length > 0 &&
                ids.every((id) => sourceIds.has(id));
        }) ||
        !Array.isArray(generated.nextSteps) ||
        !REQUIRED_LIMITATIONS.every((item) => limitations.includes(item))
    ) {
        throw new Error("The generated explanation did not match the deterministic operational recommendation.");
    }

    return response;
}

const MARKUP = `
<header class="dna-operational-explanation__header">
  <div>
    <p class="dna-operational-explanation__eyebrow">Private-beta operational explanations</p>
    <h2 id="dnaOperationalExplanationTitle" class="dna-operational-explanation__title">Explain other governed HR recommendations</h2>
    <p id="dnaOperationalExplanationDescription" class="dna-operational-explanation__description">Choose a feature below. The server recomputes the existing deterministic recommendation and Cloudflare may explain it, but cannot change it or turn it into a legal conclusion.</p>
  </div>
</header>
<p class="dna-private-note"><span class="dna-private-note__icon" aria-hidden="true">●</span><span>Only the selected feature's allowlisted assessment fields are sent. No automatic provider request is made and no result is saved into the report, PDF, email, evidence or browser storage.</span></p>
<p id="dnaOperationalExplanationStatus" class="dna-operational-explanation__status" role="status" aria-live="polite" aria-atomic="true">Checking the saved assessment for operational features…</p>
<div id="dnaOperationalFeatureList" class="dna-operational-explanation__feature-grid"></div>
<section id="dnaOperationalExplanationError" class="dna-operational-explanation__notice dna-operational-explanation__notice--error" role="alert" hidden>
  <h3>Operational explanation could not be prepared</h3>
  <p id="dnaOperationalExplanationErrorMessage"></p>
</section>
<div id="dnaOperationalExplanationContent" class="dna-operational-explanation__content" hidden>
  <article class="dna-operational-explanation__summary-card">
    <header class="dna-operational-explanation__summary-header">
      <div><p id="dnaOperationalExplanationFeature" class="dna-operational-explanation__result-eyebrow"></p><h3>Deterministic recommendation explained</h3></div>
      <span id="dnaOperationalExplanationBadge" class="dna-operational-explanation__badge">Waiting</span>
    </header>
    <p id="dnaOperationalExplanationSummary" class="dna-operational-explanation__summary"></p>
  </article>
  <div class="dna-operational-explanation__detail-grid">
    <section class="dna-operational-explanation__detail"><h3>Why this appears</h3><div id="dnaOperationalExplanationRationale"></div></section>
    <section class="dna-operational-explanation__detail"><h3>Next steps</h3><div id="dnaOperationalExplanationNextSteps"></div></section>
    <section class="dna-operational-explanation__detail"><h3>Official guidance references</h3><div id="dnaOperationalExplanationSources"></div></section>
    <section class="dna-operational-explanation__detail"><h3>Limitations</h3><div id="dnaOperationalExplanationLimitations"></div></section>
  </div>
  <dl id="dnaOperationalExplanationMetadata" class="dna-operational-explanation__metadata"></dl>
</div>`;

function ensureAssets(documentObject) {
    if (!documentObject.getElementById("growwithhrOperationalExplanationStyles")) {
        const link = documentObject.createElement("link");
        link.id = "growwithhrOperationalExplanationStyles";
        link.rel = "stylesheet";
        link.href = OPERATIONAL_EXPLANATION_STYLESHEET;
        documentObject.head?.append(link);
    }

    let root = documentObject.getElementById("dnaOperationalExplanation");
    if (root) return root;

    const shell = documentObject.getElementById("dnaShell");
    if (!shell) return null;

    root = documentObject.createElement("section");
    root.id = "dnaOperationalExplanation";
    root.className = "dna-operational-explanation";
    root.dataset.operationalExplanationState = "idle";
    root.setAttribute("aria-labelledby", "dnaOperationalExplanationTitle");
    root.setAttribute("aria-describedby", "dnaOperationalExplanationDescription");
    root.innerHTML = MARKUP;

    const legalPanel = documentObject.getElementById("dnaLegalExplanation");
    const traceability = documentObject.getElementById("dnaTraceability");
    const anchor = legalPanel || traceability;
    if (anchor?.parentNode === shell) anchor.insertAdjacentElement("afterend", root);
    else shell.append(root);
    return root;
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

function statusLabel(status) {
    return cleanText(status)
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function appendMetadata(documentObject, mount, label, value) {
    const wrapper = element(documentObject, "div");
    wrapper.append(
        element(documentObject, "dt", "", label),
        element(documentObject, "dd", "", value)
    );
    mount.append(wrapper);
}

function renderStringList(documentObject, mount, values) {
    mount.replaceChildren();
    const list = element(documentObject, "ul", "dna-operational-explanation__list");
    asArray(values).map(cleanText).filter(Boolean).forEach((value) => {
        list.append(element(documentObject, "li", "", value));
    });
    if (!list.children.length) list.append(element(documentObject, "li", "", "No additional action is suggested for this result."));
    mount.append(list);
}

function renderRationale(documentObject, mount, rationale) {
    mount.replaceChildren();
    const list = element(documentObject, "ul", "dna-operational-explanation__list");
    asArray(rationale).forEach((itemValue) => {
        const item = asObject(itemValue);
        const listItem = element(documentObject, "li");
        listItem.append(element(documentObject, "p", "", item.statement));
        listItem.append(element(documentObject, "code", "", asArray(item.sourceIds).join(", ")));
        list.append(listItem);
    });
    mount.append(list);
}

function renderSources(documentObject, mount, sources) {
    mount.replaceChildren();
    const list = element(documentObject, "ul", "dna-operational-explanation__source-list");
    asArray(sources).forEach((sourceValue) => {
        const source = asObject(sourceValue);
        const url = safeHttpsUrl(source.url);
        if (!url) return;
        const item = element(documentObject, "li");
        const link = element(documentObject, "a", "", source.title);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        item.append(
            link,
            element(documentObject, "span", "", `${source.publisher} · ${source.sourceType || "official reference"}`),
            element(documentObject, "code", "", source.id)
        );
        list.append(item);
    });
    mount.append(list);
}

function publicErrorMessage(payload, status) {
    return cleanText(asObject(asObject(payload).error).message) ||
        `The operational explanation request returned status ${status}.`;
}

async function readJson(response) {
    try {
        return await response.json();
    } catch (_error) {
        return {};
    }
}

export function createOperationalExplanationPanel(options = {}) {
    const source = asObject(options);
    const runtime = source.runtime || globalThis.window;
    const documentObject = source.document || runtime?.document || globalThis.document;
    if (!documentObject) throw new Error("GrowWithHR operational explanation panel requires a document.");
    const root = ensureAssets(documentObject);
    if (!root) throw new Error("GrowWithHR operational explanation panel requires #dnaShell.");

    const storage = source.storage || runtime?.localStorage || null;
    const fetchImpl = source.fetch || runtime?.fetch?.bind(runtime) || globalThis.fetch;
    if (typeof fetchImpl !== "function") throw new Error("GrowWithHR operational explanation panel requires Fetch.");
    const endpoint = cleanText(source.endpoint) ||
        resolveOperationalExplanationEndpoint(runtime, documentObject);
    const timeoutMs = Number.isInteger(source.timeoutMs)
        ? source.timeoutMs
        : OPERATIONAL_EXPLANATION_REQUEST_TIMEOUT_MS;

    const elements = {
        status: documentObject.getElementById("dnaOperationalExplanationStatus"),
        featureList: documentObject.getElementById("dnaOperationalFeatureList"),
        error: documentObject.getElementById("dnaOperationalExplanationError"),
        errorMessage: documentObject.getElementById("dnaOperationalExplanationErrorMessage"),
        content: documentObject.getElementById("dnaOperationalExplanationContent"),
        feature: documentObject.getElementById("dnaOperationalExplanationFeature"),
        badge: documentObject.getElementById("dnaOperationalExplanationBadge"),
        summary: documentObject.getElementById("dnaOperationalExplanationSummary"),
        rationale: documentObject.getElementById("dnaOperationalExplanationRationale"),
        nextSteps: documentObject.getElementById("dnaOperationalExplanationNextSteps"),
        sources: documentObject.getElementById("dnaOperationalExplanationSources"),
        limitations: documentObject.getElementById("dnaOperationalExplanationLimitations"),
        metadata: documentObject.getElementById("dnaOperationalExplanationMetadata")
    };
    Object.entries(elements).forEach(([name, node]) => {
        if (!node) throw new Error(`GrowWithHR operational explanation panel requires ${name}.`);
    });

    const state = {
        activeFeatureId: null,
        activeController: null,
        activeRequest: null,
        result: null,
        error: null,
        destroyed: false
    };
    const buttons = new Map();

    function savedState() {
        return readProtectedState(storage);
    }

    function availability(featureId) {
        const current = savedState();
        if (!current) return Object.freeze({ answers: {}, missingFields: ["saved assessment"] });
        return extractOperationalExplanationAnswers(current, featureId);
    }

    function setStatus(phase, message) {
        root.dataset.operationalExplanationState = phase;
        elements.status.textContent = message;
    }

    function featureCard(feature) {
        const card = element(documentObject, "article", "dna-operational-explanation__feature-card");
        const heading = element(documentObject, "h3", "", feature.title);
        const description = element(documentObject, "p", "", feature.description);
        const readiness = element(documentObject, "p", "dna-operational-explanation__feature-status");
        const button = element(
            documentObject,
            "button",
            "dna-secondary-button dna-operational-explanation__feature-button",
            "Generate explanation"
        );
        button.type = "button";
        button.dataset.featureId = feature.id;
        button.addEventListener("click", () => { void requestExplanation(feature.id); });
        buttons.set(feature.id, { button, readiness });
        card.append(heading, description, readiness, button);
        return card;
    }

    function renderFeatureCards() {
        elements.featureList.replaceChildren();
        OPERATIONAL_FEATURES.forEach((feature) => {
            elements.featureList.append(featureCard(feature));
        });
        refreshAvailability();
    }

    function refreshAvailability() {
        if (state.destroyed) return;
        let hasSavedAssessment = true;
        try {
            if (!savedState()) hasSavedAssessment = false;
        } catch (_error) {
            hasSavedAssessment = false;
        }

        OPERATIONAL_FEATURES.forEach((feature) => {
            const record = buttons.get(feature.id);
            if (!record) return;
            let extracted;
            try {
                extracted = availability(feature.id);
            } catch (_error) {
                extracted = { missingFields: ["saved assessment"] };
            }
            record.button.disabled = state.activeRequest !== null || !hasSavedAssessment;
            record.readiness.textContent = !hasSavedAssessment
                ? "Complete and save the stable assessment first."
                : extracted.missingFields.length
                    ? `May return more information needed: ${extracted.missingFields.join(", ")}.`
                    : "Saved facts available for deterministic evaluation.";
        });

        setStatus(
            hasSavedAssessment ? "ready" : "missing",
            hasSavedAssessment
                ? "Choose any feature to generate a governed operational explanation."
                : "No saved assessment was found in this browser. Complete the stable assessment first."
        );
    }

    function setButtonsLoading(featureId, loading) {
        buttons.forEach((record, id) => {
            record.button.disabled = loading || id !== featureId && state.activeRequest !== null;
            record.button.setAttribute("aria-busy", loading && id === featureId ? "true" : "false");
            record.button.textContent = loading && id === featureId
                ? "Generating…"
                : "Generate explanation";
        });
    }

    function renderError(error) {
        state.result = null;
        state.error = error;
        elements.content.hidden = true;
        elements.error.hidden = false;
        elements.errorMessage.textContent = cleanText(error?.message) ||
            "The private-beta operational explanation service did not complete this request.";
        setStatus(
            "error",
            "The operational explanation could not be prepared. Existing deterministic recommendations and stable delivery paths are unchanged."
        );
    }

    function renderResponse(response) {
        const recommendation = asObject(response.recommendation);
        const explanation = asObject(response.explanation);
        const generated = asObject(explanation.response);
        const provider = asObject(explanation.provider);
        const delivery = asObject(response.delivery);
        const feature = FEATURE_INDEX.get(response.featureId);

        elements.feature.textContent = feature?.title || response.featureId;
        elements.badge.textContent = statusLabel(recommendation.operationalStatus);
        elements.badge.dataset.operationalStatus = recommendation.operationalStatus;
        elements.summary.textContent = generated.summary;
        renderRationale(documentObject, elements.rationale, generated.rationale);
        renderStringList(documentObject, elements.nextSteps, generated.nextSteps);
        renderSources(documentObject, elements.sources, asObject(response.guidance).sources);
        renderStringList(documentObject, elements.limitations, generated.limitations);

        elements.metadata.replaceChildren();
        appendMetadata(documentObject, elements.metadata, "Provider", `${provider.name} · ${provider.model}`);
        appendMetadata(documentObject, elements.metadata, "Provider role", provider.role);
        appendMetadata(documentObject, elements.metadata, "Recommendation authority", response.recommendationAuthority);
        appendMetadata(documentObject, elements.metadata, "Legal advice", "false");
        appendMetadata(
            documentObject,
            elements.metadata,
            "Delivery",
            `${cleanText(delivery.cacheStatus) || "unknown"} · ${Number(delivery.providerRequestsForThisResponse) || 0} provider request(s)`
        );
        appendMetadata(
            documentObject,
            elements.metadata,
            "Recommendation fingerprint",
            recommendation.recommendationFingerprint
        );

        elements.error.hidden = true;
        elements.content.hidden = false;
        setStatus(
            "complete",
            "Operational explanation completed. The recommendation remains deterministic and the output is not legal advice."
        );
    }

    async function requestExplanation(featureId) {
        if (state.destroyed) throw new Error("The operational explanation panel has been destroyed.");
        if (state.activeRequest) return state.activeRequest;

        const feature = FEATURE_INDEX.get(featureId);
        if (!feature) throw new Error("Unsupported operational explanation feature.");

        let payload;
        try {
            const current = savedState();
            if (!current) throw new Error("No saved assessment answers were found in this browser.");
            payload = createOperationalExplanationRequestPayload(current, featureId);
        } catch (error) {
            renderError(error);
            return null;
        }

        state.activeFeatureId = featureId;
        state.error = null;
        elements.error.hidden = true;
        setButtonsLoading(featureId, true);
        setStatus(
            "loading",
            `The server is recomputing ${feature.title} and requesting an explanation of that fixed recommendation…`
        );

        const AbortControllerClass = runtime?.AbortController || globalThis.AbortController;
        const controller = typeof AbortControllerClass === "function"
            ? new AbortControllerClass()
            : null;
        state.activeController = controller;
        const schedule = runtime?.setTimeout?.bind(runtime) || globalThis.setTimeout;
        const cancel = runtime?.clearTimeout?.bind(runtime) || globalThis.clearTimeout;
        const timer = schedule(() => controller?.abort(), timeoutMs);

        state.activeRequest = (async () => {
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
                if (!response.ok) throw new Error(publicErrorMessage(result, response.status));
                const validated = validateOperationalExplanationEnvelope(result, featureId);
                if (state.destroyed) return null;
                state.result = validated;
                state.error = null;
                renderResponse(validated);
                return validated;
            } catch (error) {
                renderError(
                    error?.name === "AbortError"
                        ? new Error("The operational explanation request took too long. Please try again after the service is available.")
                        : error
                );
                return null;
            } finally {
                cancel(timer);
                state.activeRequest = null;
                state.activeController = null;
                setButtonsLoading(featureId, false);
                refreshAvailability();
            }
        })();

        return state.activeRequest;
    }

    const handleStorage = (event) => {
        if (event.key === LEGACY_KEYS.assessment || event.key === null) refreshAvailability();
    };
    runtime?.addEventListener("storage", handleStorage);
    renderFeatureCards();

    return Object.freeze({
        version: OPERATIONAL_EXPLANATION_PANEL_VERSION,
        endpoint,
        protectedAssessmentKey: LEGACY_KEYS.assessment,
        automaticProviderCall: false,
        submittedFeatureFields: Object.freeze(
            Object.fromEntries(OPERATIONAL_FEATURES.map((feature) => [feature.id, feature.fields]))
        ),
        refreshAvailability,
        requestExplanation,
        getResult: () => state.result,
        getState: () => Object.freeze({
            activeFeatureId: state.activeFeatureId,
            hasResult: Boolean(state.result),
            error: state.error ? cleanText(state.error.message || state.error) : null,
            endpoint,
            automaticProviderCall: false,
            newStorageKeyIntroduced: false,
            stableReportMutation: false,
            stablePdfMutation: false,
            stableEmailMutation: false
        }),
        destroy() {
            if (state.destroyed) return;
            state.destroyed = true;
            state.activeController?.abort();
            runtime?.removeEventListener("storage", handleStorage);
            root.dataset.operationalExplanationState = "destroyed";
        }
    });
}

function start() {
    const documentObject = globalThis.document;
    if (!documentObject?.getElementById("dnaShell")) return;
    try {
        globalThis.window.GrowWithHROperationalExplanationPanel =
            createOperationalExplanationPanel();
    } catch (error) {
        console.error("GrowWithHR operational explanation panel could not start.", error);
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
    version: OPERATIONAL_EXPLANATION_PANEL_VERSION,
    features: OPERATIONAL_FEATURES,
    extractOperationalExplanationAnswers,
    createOperationalExplanationRequestPayload,
    resolveOperationalExplanationEndpoint,
    validateOperationalExplanationEnvelope,
    createOperationalExplanationPanel
});
