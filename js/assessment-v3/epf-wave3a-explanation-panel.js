/**
 * GrowWithHR Compliance DNA — EPF Wave 3A operational-control panel.
 *
 * The panel is explicit-submit and in-memory only. It sends only the strict
 * allow-listed payload produced by epf-wave3a-explanation-api-client.js.
 */

import {
    EPF_WAVE3A_FEATURE_IDS,
    createEpfWave3aPayload,
    requestEpfWave3aExplanation
} from "./epf-wave3a-explanation-api-client.js";

export const EPF_WAVE3A_PANEL_VERSION = "1.0.0";

const STATUS_OPTIONS = Object.freeze(["evidenced", "not-evidenced", "unknown", "not-applicable", "conflict"]);
const YES_NO_OPTIONS = Object.freeze(["yes", "no", "unknown", "conflict"]);

const FEATURE_DEFINITIONS = Object.freeze({
    "feature.legal.epf.establishment-coverage": Object.freeze({
        label: "Establishment coverage",
        description: "Review India operations, establishment-wide headcount scope, branch inclusion and prior-coverage records.",
        fields: Object.freeze([
            { key: "epfIndiaOperations", label: "India operations", type: "select", options: YES_NO_OPTIONS },
            { key: "epfTotalEmployeeCount", label: "Total employee count across the reviewed establishment", type: "number", min: 0 },
            { key: "epfAllBranchesIncluded", label: "All branches included in the count", type: "select", options: YES_NO_OPTIONS },
            { key: "epfPriorCoverageKnown", label: "Prior EPF coverage status is known", type: "select", options: YES_NO_OPTIONS },
            { key: "epfPriorCodePresent", label: "Prior EPF code is present", type: "select", options: YES_NO_OPTIONS }
        ])
    }),
    "feature.legal.epf.member-inclusion": Object.freeze({
        label: "Member inclusion controls",
        description: "Review workforce reconciliation and classification controls without employee identities, wages or UANs.",
        fields: Object.freeze([
            { key: "epfPopulationReconciled", label: "Direct and contract population reconciled", type: "select", options: STATUS_OPTIONS },
            { key: "epfApprenticeClassificationReviewed", label: "Apprentice and trainee classification reviewed", type: "select", options: STATUS_OPTIONS },
            { key: "epfPriorMemberRoutingReviewed", label: "Prior-member routing reviewed", type: "select", options: STATUS_OPTIONS },
            { key: "epfExcludedEmployeeReviewRecorded", label: "Excluded-employee review recorded", type: "select", options: STATUS_OPTIONS },
            { key: "epfInternationalWorkerEscalationReviewed", label: "International-worker escalation reviewed", type: "select", options: STATUS_OPTIONS }
        ])
    }),
    "feature.legal.epf.monthly-contribution-control": Object.freeze({
        label: "Monthly contribution process",
        description: "Review operational controls only. Do not enter rates, wage amounts, payroll rows, contribution amounts or ECR bodies.",
        fields: Object.freeze([
            { key: "epfRateBasisRecorded", label: "Official rate basis recorded", type: "select", options: STATUS_OPTIONS },
            { key: "epfEmployeeDeductionControl", label: "Employee-deduction control", type: "select", options: STATUS_OPTIONS },
            { key: "epfEmployerShareControl", label: "Employer-share control", type: "select", options: STATUS_OPTIONS },
            { key: "epfEcrFilingControl", label: "ECR filing control", type: "select", options: STATUS_OPTIONS },
            { key: "epfPaymentDueDateControl", label: "Payment due-date control", type: "select", options: STATUS_OPTIONS },
            { key: "epfPayrollReconciliationControl", label: "Payroll reconciliation control", type: "select", options: STATUS_OPTIONS },
            { key: "epfExceptionManagementControl", label: "Exception-management control", type: "select", options: STATUS_OPTIONS }
        ])
    }),
    "feature.legal.epf.contractor-control": Object.freeze({
        label: "Contractor controls",
        description: "Review contractor declarations, monthly data and principal-employer reconciliation without contractor worker records.",
        fields: Object.freeze([
            { key: "epfContractorCount", label: "Contractor count", type: "number", min: 0 },
            { key: "epfContractorDeclarationControl", label: "Contractor declaration control", type: "select", options: STATUS_OPTIONS },
            { key: "epfContractorMonthlyDataControl", label: "Contractor monthly-data control", type: "select", options: STATUS_OPTIONS },
            { key: "epfPrincipalEmployerReconciliation", label: "Principal-employer reconciliation", type: "select", options: STATUS_OPTIONS }
        ])
    }),
    "feature.legal.epf.records-returns": Object.freeze({
        label: "Records and returns",
        description: "Review ownership, authorisation, onboarding, nomination, retention and evidence references only.",
        fields: Object.freeze([
            { key: "epfRecordsOwnershipControl", label: "Records and returns ownership control", type: "select", options: STATUS_OPTIONS },
            { key: "epfAuthorisedSignatoryControl", label: "Authorised-signatory control", type: "select", options: STATUS_OPTIONS },
            { key: "epfUanOnboardingControl", label: "UAN onboarding control", type: "select", options: STATUS_OPTIONS },
            { key: "epfNominationControl", label: "Nomination process control", type: "select", options: STATUS_OPTIONS },
            { key: "epfRetentionAccessControl", label: "Retention and access control", type: "select", options: STATUS_OPTIONS },
            { key: "epfEvidenceReferences", label: "Evidence references", type: "csv", placeholder: "epf-control-register, monthly-review-log" }
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
    wrapper.append(createElement(documentObject, "span", {
        className: "dna-posh-wave1__field-label",
        text: definition.label
    }));

    let control;
    if (definition.type === "select") {
        control = createElement(documentObject, "select", { className: "dna-posh-wave1__control" });
        const empty = createElement(documentObject, "option", { text: "Select…" });
        empty.value = "";
        control.append(empty);
        definition.options.forEach((value) => {
            const option = createElement(documentObject, "option", { text: value });
            option.value = value;
            control.append(option);
        });
    } else {
        control = createElement(documentObject, "input", { className: "dna-posh-wave1__control" });
        control.type = definition.type === "csv" ? "text" : definition.type;
        if (Number.isFinite(definition.min)) control.min = String(definition.min);
    }
    control.name = definition.key;
    control.dataset.fieldType = definition.type;
    control.required = true;
    if (definition.placeholder) control.placeholder = definition.placeholder;
    wrapper.append(control);
    return wrapper;
}

function parseControl(control) {
    const raw = text(control.value);
    if (!raw) throw new Error(`${control.name} is required.`);
    if (control.dataset.fieldType === "number") {
        const value = Number.parseInt(raw, 10);
        if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${control.name} must be a non-negative integer.`);
        return value;
    }
    if (control.dataset.fieldType === "csv") {
        const values = raw.split(",").map(text).filter(Boolean);
        if (!values.length) throw new Error(`${control.name} requires at least one reference.`);
        return values;
    }
    return raw;
}

function collectAnswers(form) {
    const answers = {};
    form.querySelectorAll("[name]").forEach((control) => {
        answers[control.name] = parseControl(control);
    });
    return answers;
}

function statusLabel(value) {
    return text(value).split("-").filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function renderList(documentObject, mount, values) {
    mount.replaceChildren();
    const list = createElement(documentObject, "ul", { className: "dna-legal-explanation__list" });
    array(values).forEach((value) => {
        const item = createElement(documentObject, "li", {
            text: typeof value === "string" ? value : text(object(value).statement || object(value).title)
        });
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
    const root = createElement(documentObject, "section", {
        id: "dnaEpfWave3a",
        className: "dna-legal-explanation dna-posh-wave1 dna-epf-wave3a"
    });
    root.setAttribute("aria-labelledby", "dnaEpfWave3aTitle");

    const header = createElement(documentObject, "header", { className: "dna-legal-explanation__header" });
    const heading = createElement(documentObject, "div", { className: "dna-legal-explanation__heading" });
    heading.append(
        createElement(documentObject, "p", { className: "dna-legal-explanation__eyebrow", text: "EPF Wave 3A · substantive private beta" }),
        createElement(documentObject, "h2", { id: "dnaEpfWave3aTitle", className: "dna-legal-explanation__title", text: "Review five source-grounded EPF operational controls" }),
        createElement(documentObject, "p", { className: "dna-legal-explanation__description", text: "Enter organisation-level statuses, counts and evidence references. Deterministic rules produce the fixed result before governed retrieval and explanation." })
    );
    header.append(heading);
    root.append(header);

    root.append(createElement(documentObject, "p", {
        className: "dna-private-note",
        text: "Inputs remain in memory and are sent only after Generate review. Nothing is saved. Do not enter names, UANs, employee wages, payroll rows, contribution histories, ECR bodies, bank details, claims, completed forms or evidence bodies."
    }));

    const selectorLabel = createElement(documentObject, "label", { className: "dna-posh-wave1__selector" });
    selectorLabel.append(createElement(documentObject, "span", { className: "dna-posh-wave1__field-label", text: "Select an EPF operational review" }));
    const selector = createElement(documentObject, "select", { id: "dnaEpfWave3aFeature", className: "dna-posh-wave1__control" });
    EPF_WAVE3A_FEATURE_IDS.forEach((featureId) => {
        const option = createElement(documentObject, "option", { text: FEATURE_DEFINITIONS[featureId].label });
        option.value = featureId;
        selector.append(option);
    });
    selectorLabel.append(selector);
    root.append(selectorLabel);

    const description = createElement(documentObject, "p", { id: "dnaEpfWave3aDescription", className: "dna-legal-explanation__status" });
    const form = createElement(documentObject, "form", { id: "dnaEpfWave3aForm", className: "dna-posh-wave1__form" });
    const fields = createElement(documentObject, "div", { id: "dnaEpfWave3aFields", className: "dna-posh-wave1__fields" });
    const actions = createElement(documentObject, "div", { className: "dna-posh-wave1__actions" });
    const button = createElement(documentObject, "button", {
        id: "dnaEpfWave3aButton",
        className: "dna-primary-button dna-legal-explanation__button",
        text: "Generate EPF review",
        type: "submit"
    });
    const status = createElement(documentObject, "p", {
        id: "dnaEpfWave3aStatus",
        className: "dna-legal-explanation__status",
        text: "No request has been made."
    });
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    actions.append(button, status);
    form.append(fields, actions);
    root.append(description, form);

    const error = createElement(documentObject, "p", {
        id: "dnaEpfWave3aError",
        className: "dna-legal-explanation__notice dna-legal-explanation__notice--error"
    });
    error.hidden = true;
    error.setAttribute("role", "alert");
    root.append(error);

    const result = createElement(documentObject, "div", { id: "dnaEpfWave3aResult", className: "dna-legal-explanation__content" });
    result.hidden = true;
    const summaryCard = createElement(documentObject, "article", { className: "dna-legal-explanation__summary-card" });
    const summaryHeader = createElement(documentObject, "header", { className: "dna-legal-explanation__summary-header" });
    summaryHeader.append(
        createElement(documentObject, "h3", { text: "Deterministic result explained" }),
        createElement(documentObject, "span", { id: "dnaEpfWave3aBadge", className: "dna-legal-explanation__decision-badge", text: "Waiting" })
    );
    const summary = createElement(documentObject, "p", { id: "dnaEpfWave3aSummary", className: "dna-legal-explanation__summary" });
    summaryCard.append(summaryHeader, summary);

    const grid = createElement(documentObject, "div", { className: "dna-legal-explanation__detail-grid" });
    [["Why this result appears", "dnaEpfWave3aRationale"], ["Next steps", "dnaEpfWave3aNextSteps"], ["Governed citations", "dnaEpfWave3aCitations"]]
        .forEach(([title, id]) => {
            const section = createElement(documentObject, "section", { className: "dna-legal-explanation__detail" });
            section.append(createElement(documentObject, "h3", { text: title }), createElement(documentObject, "div", { id }));
            grid.append(section);
        });
    const metadata = createElement(documentObject, "p", { id: "dnaEpfWave3aMetadata", className: "dna-legal-explanation__metadata" });
    result.append(summaryCard, grid, metadata);
    root.append(result);
    return { root, selector, description, form, fields, button, status, error, result };
}

export function createEpfWave3aPanel(options = {}) {
    const runtime = options.runtime || globalThis;
    const documentObject = options.documentObject || runtime.document;
    const shell = documentObject?.getElementById("dnaShell");
    if (!shell) throw new Error("GrowWithHR EPF Wave 3A panel requires #dnaShell.");

    const markup = createMarkup(documentObject);
    const maternityPanel = documentObject.getElementById("dnaMaternityWave2");
    if (maternityPanel?.parentNode === shell) maternityPanel.insertAdjacentElement("afterend", markup.root);
    else shell.append(markup.root);

    const elements = {
        ...markup,
        badge: documentObject.getElementById("dnaEpfWave3aBadge"),
        summary: documentObject.getElementById("dnaEpfWave3aSummary"),
        rationale: documentObject.getElementById("dnaEpfWave3aRationale"),
        nextSteps: documentObject.getElementById("dnaEpfWave3aNextSteps"),
        citations: documentObject.getElementById("dnaEpfWave3aCitations"),
        metadata: documentObject.getElementById("dnaEpfWave3aMetadata")
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
            payload = createEpfWave3aPayload(elements.selector.value, { answers: collectAnswers(elements.form) });
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
            const response = await requestEpfWave3aExplanation({
                featureId: elements.selector.value,
                payload,
                runtime,
                fetchImpl: options.fetchImpl,
                endpoint: options.endpoint
            });
            state.result = response;
            state.phase = "complete";
            renderResult(documentObject, elements, response);
            elements.status.textContent = "EPF operational review completed. The result remains needs-legal-review.";
        } catch (error) {
            state.phase = "error";
            elements.error.textContent = text(error?.message) || "The EPF operational review could not be prepared.";
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
        version: EPF_WAVE3A_PANEL_VERSION,
        featureIds: EPF_WAVE3A_FEATURE_IDS,
        getState: () => Object.freeze({
            phase: state.phase,
            requestCount: state.requestCount,
            selectedFeatureId: elements.selector.value,
            hasResult: Boolean(state.result),
            automaticRequest: false,
            browserStorageWrites: 0,
            stableReportMutation: false,
            stablePdfMutation: false,
            stableEmailMutation: false
        }),
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
    if (!documentObject?.getElementById("dnaShell") || documentObject.getElementById("dnaEpfWave3a")) return;
    try {
        globalThis.window.GrowWithHREpfWave3aPanel = createEpfWave3aPanel();
    } catch (error) {
        console.error("GrowWithHR EPF Wave 3A panel could not start.", error);
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
    version: EPF_WAVE3A_PANEL_VERSION,
    featureIds: EPF_WAVE3A_FEATURE_IDS,
    createEpfWave3aPanel
});
