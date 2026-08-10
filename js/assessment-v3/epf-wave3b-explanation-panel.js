/**
 * GrowWithHR Compliance DNA — EPF Wave 3B verification and routing panel.
 * Explicit-submit, in-memory only, with strict payload allowlists.
 */
import {
    EPF_WAVE3B_FEATURE_IDS,
    createEpfWave3bPayload,
    requestEpfWave3bExplanation
} from "./epf-wave3b-explanation-api-client.js";

export const EPF_WAVE3B_PANEL_VERSION = "1.0.0";
const STATUS_OPTIONS = Object.freeze(["evidenced", "not-evidenced", "unknown", "not-applicable", "conflict"]);
const FEATURE_DEFINITIONS = Object.freeze({
    "feature.legal.epf.wage-ceiling": Object.freeze({
        label: "Wage-ceiling source",
        description: "Review the controlled wage-ceiling source, a non-identifying wage band and routing statuses. Do not enter wage amounts.",
        fields: Object.freeze([
            { key: "epfWageCeilingSourceStatus", label: "Notified wage-ceiling source status", options: STATUS_OPTIONS },
            { key: "epfStatutoryWageBand", label: "Statutory wage band", options: ["at-or-below-notified-ceiling", "above-notified-ceiling", "unknown", "conflict"] },
            { key: "epfPriorMemberStatus", label: "Prior-member status", options: ["prior-member", "not-prior-member", "unknown", "conflict"] },
            { key: "epfHigherWageContributionStatus", label: "Higher-wage contribution review status", options: STATUS_OPTIONS }
        ])
    }),
    "feature.legal.epf.contribution-rate-source": Object.freeze({
        label: "Contribution-rate source",
        description: "Verify a declared rate branch and its source controls. The product does not select an applicable branch or calculate contributions.",
        fields: Object.freeze([
            { key: "epfDeclaredRateBranch", label: "Declared contribution-rate branch", options: ["ten-percent-branch", "twelve-percent-branch", "other", "unknown", "conflict"] },
            { key: "epfOfficialRateBasisStatus", label: "Official rate basis recorded", options: STATUS_OPTIONS },
            { key: "epfRateSourceReferenceStatus", label: "Official rate-source reference recorded", options: STATUS_OPTIONS },
            { key: "epfRateHigherWageStatus", label: "Higher-wage contribution review status", options: STATUS_OPTIONS },
            { key: "epfRateTransitionReviewStatus", label: "Transition and savings review status", options: STATUS_OPTIONS }
        ])
    }),
    "feature.legal.eps.membership-routing": Object.freeze({
        label: "EPS membership routing",
        description: "Review controlled EPS routing facts without employee identity, wage amount, membership history or pension records.",
        fields: Object.freeze([
            { key: "epsMembershipRoutingStatus", label: "EPS membership-routing status", options: ["routed", "not-routed", "unknown", "conflict"] },
            { key: "epsPriorMemberStatus", label: "Prior-member status", options: ["prior-member", "not-prior-member", "unknown", "conflict"] },
            { key: "epsStatutoryWageBand", label: "Statutory wage band", options: ["at-or-below-notified-ceiling", "above-notified-ceiling", "unknown", "conflict"] },
            { key: "epsHigherWageCaseStatus", label: "Higher-wage case review status", options: STATUS_OPTIONS },
            { key: "epsEmployerDiversionControl", label: "Employer-diversion control", options: STATUS_OPTIONS }
        ])
    }),
    "feature.legal.eps.pension-control": Object.freeze({
        label: "EPS pension-process controls",
        description: "Review organisation process controls and evidence references only. Do not enter completed claims or pension records.",
        fields: Object.freeze([
            { key: "epsMembershipRoutingControl", label: "Membership-routing control", options: STATUS_OPTIONS },
            { key: "epsPensionEmployerDiversionControl", label: "Employer-diversion control", options: STATUS_OPTIONS },
            { key: "epsRecordsControl", label: "EPS records control", options: STATUS_OPTIONS },
            { key: "epsClaimControl", label: "EPS claim-process control", options: STATUS_OPTIONS },
            { key: "epsHigherWageEscalationControl", label: "Higher-wage case escalation control", options: STATUS_OPTIONS },
            { key: "epsEvidenceReferences", label: "EPS evidence references", type: "csv", placeholder: "eps-control-register, routing-review-log" }
        ])
    }),
    "feature.legal.edli.coverage-control": Object.freeze({
        label: "EDLI coverage controls",
        description: "Review EDLI membership, rate-source, contribution, claim and transition controls without claim or family data.",
        fields: Object.freeze([
            { key: "edliMembershipControl", label: "EDLI membership control", options: STATUS_OPTIONS },
            { key: "edliRateSourceStatus", label: "Current EDLI rate-source status", options: STATUS_OPTIONS },
            { key: "edliContributionControl", label: "EDLI contribution-process control", options: STATUS_OPTIONS },
            { key: "edliClaimControl", label: "EDLI claim-process control", options: STATUS_OPTIONS },
            { key: "edliTransitionReviewStatus", label: "EDLI transition review status", options: STATUS_OPTIONS },
            { key: "edliEvidenceReferences", label: "EDLI evidence references", type: "csv", placeholder: "edli-control-register, rate-source-review" }
        ])
    })
});
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();

function createElement(documentObject, tagName, options = {}) {
    const node = documentObject.createElement(tagName);
    if (options.id) node.id = options.id;
    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = String(options.text);
    if (options.type) node.type = options.type;
    return node;
}
function fieldInput(documentObject, definition) {
    const wrapper = createElement(documentObject, "label", { className: "dna-posh-wave1__field" });
    wrapper.append(createElement(documentObject, "span", { className: "dna-posh-wave1__field-label", text: definition.label }));
    let control;
    if (definition.type === "csv") {
        control = createElement(documentObject, "input", { className: "dna-posh-wave1__control" });
        control.type = "text";
        control.placeholder = definition.placeholder || "controlled-reference";
    } else {
        control = createElement(documentObject, "select", { className: "dna-posh-wave1__control" });
        const empty = createElement(documentObject, "option", { text: "Select…" });
        empty.value = "";
        control.append(empty);
        definition.options.forEach((value) => {
            const option = createElement(documentObject, "option", { text: value });
            option.value = value;
            control.append(option);
        });
    }
    control.name = definition.key;
    control.dataset.fieldType = definition.type || "select";
    control.required = true;
    wrapper.append(control);
    return wrapper;
}
function parseControl(control) {
    const raw = text(control.value);
    if (!raw) throw new Error(`${control.name} is required.`);
    if (control.dataset.fieldType === "csv") {
        const values = raw.split(",").map(text).filter(Boolean);
        if (!values.length) throw new Error(`${control.name} requires at least one reference.`);
        return values;
    }
    return raw;
}
function collectAnswers(form) {
    const answers = {};
    form.querySelectorAll("[name]").forEach((control) => { answers[control.name] = parseControl(control); });
    return answers;
}
function statusLabel(value) {
    return text(value).split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function renderList(documentObject, mount, values) {
    mount.replaceChildren();
    const list = createElement(documentObject, "ul", { className: "dna-legal-explanation__list" });
    array(values).forEach((value) => {
        const item = createElement(documentObject, "li", { text: typeof value === "string" ? value : text(object(value).statement || object(value).title) });
        if (item.textContent) list.append(item);
    });
    mount.append(list);
}
function renderResult(documentObject, elements, response) {
    const decision = object(response.decision);
    const generated = object(object(response.explanation).response);
    const citations = array(object(response.retrieval).citations);
    elements.result.hidden = false;
    elements.badge.textContent = statusLabel(decision.status);
    elements.badge.dataset.decisionStatus = text(decision.status);
    elements.summary.textContent = text(generated.summary);
    renderList(documentObject, elements.rationale, generated.rationale);
    renderList(documentObject, elements.nextSteps, generated.nextSteps);
    elements.citations.replaceChildren();
    const citationList = createElement(documentObject, "ul", { className: "dna-legal-explanation__list" });
    citations.forEach((citationValue) => {
        const citation = object(citationValue);
        const item = createElement(documentObject, "li");
        const title = text(citation.sourceTitle || citation.title || citation.registrySourceId);
        const section = text(citation.sectionReference || citation.reference);
        item.textContent = section ? `${title} — ${section}` : title;
        citationList.append(item);
    });
    elements.citations.append(citationList);
    elements.metadata.textContent = `Reason code: ${text(decision.reasonCode)} · Rule: ${text(decision.ruleId)} · Legal review: needs-legal-review`;
}
function createMarkup(documentObject) {
    const root = createElement(documentObject, "section", { id: "dnaEpfWave3b", className: "dna-legal-explanation dna-posh-wave1 dna-epf-wave3b" });
    root.setAttribute("aria-labelledby", "dnaEpfWave3bTitle");
    const header = createElement(documentObject, "header", { className: "dna-legal-explanation__header" });
    const heading = createElement(documentObject, "div", { className: "dna-legal-explanation__heading" });
    heading.append(
        createElement(documentObject, "p", { className: "dna-legal-explanation__eyebrow", text: "EPF Wave 3B · substantive private beta" }),
        createElement(documentObject, "h2", { id: "dnaEpfWave3bTitle", className: "dna-legal-explanation__title", text: "Review five EPF, EPS and EDLI source and routing controls" }),
        createElement(documentObject, "p", { className: "dna-legal-explanation__description", text: "Enter controlled organisation statuses, bands and evidence references. Deterministic rules produce the fixed review result before governed retrieval and explanation." })
    );
    header.append(heading);
    root.append(header);
    root.append(createElement(documentObject, "p", {
        className: "dna-private-note",
        text: "Inputs remain in memory and are sent only after Generate review. Nothing is saved. Do not enter names, UANs, wage amounts, payroll rows, contribution histories, ECR bodies, bank details, claims, nominee or family details, completed forms or evidence bodies."
    }));
    const selectorLabel = createElement(documentObject, "label", { className: "dna-posh-wave1__selector" });
    selectorLabel.append(createElement(documentObject, "span", { className: "dna-posh-wave1__field-label", text: "Select an EPF, EPS or EDLI review" }));
    const selector = createElement(documentObject, "select", { id: "dnaEpfWave3bFeature", className: "dna-posh-wave1__control" });
    EPF_WAVE3B_FEATURE_IDS.forEach((featureId) => {
        const option = createElement(documentObject, "option", { text: FEATURE_DEFINITIONS[featureId].label });
        option.value = featureId;
        selector.append(option);
    });
    selectorLabel.append(selector);
    root.append(selectorLabel);
    const description = createElement(documentObject, "p", { id: "dnaEpfWave3bDescription", className: "dna-legal-explanation__status" });
    const form = createElement(documentObject, "form", { id: "dnaEpfWave3bForm", className: "dna-posh-wave1__form" });
    const fields = createElement(documentObject, "div", { id: "dnaEpfWave3bFields", className: "dna-posh-wave1__fields" });
    const actions = createElement(documentObject, "div", { className: "dna-posh-wave1__actions" });
    const button = createElement(documentObject, "button", { id: "dnaEpfWave3bButton", className: "dna-primary-button dna-legal-explanation__button", text: "Generate EPF/EPS/EDLI review", type: "submit" });
    const status = createElement(documentObject, "p", { id: "dnaEpfWave3bStatus", className: "dna-legal-explanation__status", text: "No request has been made." });
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    actions.append(button, status);
    form.append(fields, actions);
    root.append(description, form);
    const error = createElement(documentObject, "p", { id: "dnaEpfWave3bError", className: "dna-legal-explanation__notice dna-legal-explanation__notice--error" });
    error.hidden = true;
    error.setAttribute("role", "alert");
    root.append(error);
    const result = createElement(documentObject, "div", { id: "dnaEpfWave3bResult", className: "dna-legal-explanation__content" });
    result.hidden = true;
    const summaryCard = createElement(documentObject, "article", { className: "dna-legal-explanation__summary-card" });
    const summaryHeader = createElement(documentObject, "header", { className: "dna-legal-explanation__summary-header" });
    summaryHeader.append(createElement(documentObject, "h3", { text: "Deterministic result explained" }), createElement(documentObject, "span", { id: "dnaEpfWave3bBadge", className: "dna-legal-explanation__decision-badge", text: "Waiting" }));
    const summary = createElement(documentObject, "p", { id: "dnaEpfWave3bSummary", className: "dna-legal-explanation__summary" });
    summaryCard.append(summaryHeader, summary);
    const grid = createElement(documentObject, "div", { className: "dna-legal-explanation__detail-grid" });
    [["Why this result appears", "dnaEpfWave3bRationale"], ["Next steps", "dnaEpfWave3bNextSteps"], ["Governed citations", "dnaEpfWave3bCitations"]].forEach(([title, id]) => {
        const section = createElement(documentObject, "section", { className: "dna-legal-explanation__detail" });
        section.append(createElement(documentObject, "h3", { text: title }), createElement(documentObject, "div", { id }));
        grid.append(section);
    });
    const metadata = createElement(documentObject, "p", { id: "dnaEpfWave3bMetadata", className: "dna-legal-explanation__metadata" });
    result.append(summaryCard, grid, metadata);
    root.append(result);
    return { root, selector, description, form, fields, button, status, error, result };
}
export function createEpfWave3bPanel(options = {}) {
    const runtime = options.runtime || globalThis;
    const documentObject = options.documentObject || runtime.document;
    const shell = documentObject?.getElementById("dnaShell");
    if (!shell) throw new Error("GrowWithHR EPF Wave 3B panel requires #dnaShell.");
    const markup = createMarkup(documentObject);
    const wave3aPanel = documentObject.getElementById("dnaEpfWave3a");
    if (wave3aPanel?.parentNode === shell) wave3aPanel.insertAdjacentElement("afterend", markup.root);
    else shell.append(markup.root);
    const elements = {
        ...markup,
        badge: documentObject.getElementById("dnaEpfWave3bBadge"),
        summary: documentObject.getElementById("dnaEpfWave3bSummary"),
        rationale: documentObject.getElementById("dnaEpfWave3bRationale"),
        nextSteps: documentObject.getElementById("dnaEpfWave3bNextSteps"),
        citations: documentObject.getElementById("dnaEpfWave3bCitations"),
        metadata: documentObject.getElementById("dnaEpfWave3bMetadata")
    };
    const state = { phase: "idle", requestCount: 0, result: null, destroyed: false };
    function renderFields() {
        const definition = FEATURE_DEFINITIONS[elements.selector.value];
        elements.description.textContent = definition.description;
        elements.fields.replaceChildren(...definition.fields.map((field) => fieldInput(documentObject, field)));
        elements.result.hidden = true;
        elements.error.hidden = true;
        elements.status.textContent = "No request has been made.";
        state.phase = "ready";
    }
    async function submit(event) {
        event.preventDefault();
        if (state.destroyed || state.phase === "loading") return;
        elements.error.hidden = true;
        elements.result.hidden = true;
        let payload;
        try {
            payload = createEpfWave3bPayload(elements.selector.value, { answers: collectAnswers(elements.form) });
        } catch (error) {
            elements.error.textContent = text(error?.message) || "Complete every controlled field.";
            elements.error.hidden = false;
            state.phase = "error";
            return;
        }
        state.phase = "loading";
        state.requestCount += 1;
        elements.button.disabled = true;
        elements.button.setAttribute("aria-busy", "true");
        elements.status.textContent = "Recomputing the deterministic review and retrieving governed source context…";
        try {
            const response = await requestEpfWave3bExplanation({ featureId: elements.selector.value, payload, runtime, fetchImpl: options.fetchImpl, endpoint: options.endpoint });
            state.result = response;
            state.phase = "complete";
            renderResult(documentObject, elements, response);
            elements.status.textContent = "EPF Wave 3B review completed. The result remains needs-legal-review.";
        } catch (error) {
            state.phase = "error";
            elements.error.textContent = text(error?.message) || "The EPF Wave 3B review could not be prepared.";
            elements.error.hidden = false;
            elements.status.textContent = "The review did not complete. No input was saved.";
        } finally {
            elements.button.disabled = false;
            elements.button.setAttribute("aria-busy", "false");
        }
    }
    elements.selector.addEventListener("change", renderFields);
    elements.form.addEventListener("submit", submit);
    renderFields();
    return Object.freeze({
        version: EPF_WAVE3B_PANEL_VERSION,
        featureIds: EPF_WAVE3B_FEATURE_IDS,
        getState: () => Object.freeze({ phase: state.phase, requestCount: state.requestCount, selectedFeatureId: elements.selector.value, hasResult: Boolean(state.result), automaticRequest: false, browserStorageWrites: 0, stableReportMutation: false, stablePdfMutation: false, stableEmailMutation: false }),
        destroy() {
            if (state.destroyed) return;
            state.destroyed = true;
            state.phase = "destroyed";
            elements.selector.removeEventListener("change", renderFields);
            elements.form.removeEventListener("submit", submit);
            elements.root.remove();
        }
    });
}
function start() {
    const documentObject = globalThis.document;
    if (!documentObject?.getElementById("dnaShell") || documentObject.getElementById("dnaEpfWave3b")) return;
    try { globalThis.window.GrowWithHREpfWave3bPanel = createEpfWave3bPanel(); }
    catch (error) { console.error("GrowWithHR EPF Wave 3B panel could not start.", error); }
}
if (typeof globalThis.document !== "undefined") {
    if (globalThis.document.readyState === "loading") globalThis.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
}
export default Object.freeze({ version: EPF_WAVE3B_PANEL_VERSION, featureIds: EPF_WAVE3B_FEATURE_IDS, createEpfWave3bPanel });
