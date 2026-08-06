/**
 * GrowWithHR Compliance DNA — POSH Wave 1 control-review panel.
 *
 * Provides an explicit, in-memory private-beta input surface for the six
 * substantive POSH control profiles. It makes no automatic request, writes no
 * browser storage and sends only the strict allow-listed payload produced by
 * posh-wave1-explanation-api-client.js.
 */

import {
    POSH_WAVE1_FEATURE_IDS,
    createPoshWave1Payload,
    requestPoshWave1Explanation
} from "./posh-wave1-explanation-api-client.js";

export const POSH_WAVE1_PANEL_VERSION = "1.0.0";

const FEATURE_DEFINITIONS = Object.freeze({
    "feature.legal.posh.policy-review": Object.freeze({
        label: "Policy and dissemination",
        description: "Review policy existence, ownership, coverage, dissemination and review evidence references.",
        fields: Object.freeze([
            { key: "poshPolicyExists", label: "Policy exists", type: "boolean" },
            { key: "poshPolicyIssueDate", label: "Policy issue date", type: "date" },
            { key: "poshPolicyOwnerRole", label: "Policy owner role", type: "text", placeholder: "People Operations" },
            { key: "poshPolicyCoverage", label: "Coverage categories", type: "csv", placeholder: "prevention, prohibition, redressal" },
            { key: "poshPolicyDisseminationEvidence", label: "Dissemination evidence references", type: "csv", placeholder: "policy-circulation-2026" },
            { key: "poshPolicyReviewEvidence", label: "Review evidence references", type: "csv", placeholder: "policy-review-2026" }
        ])
    }),
    "feature.legal.posh.awareness-training-review": Object.freeze({
        label: "Awareness and training",
        description: "Review employee awareness cadence, committee orientation and capacity-building evidence references.",
        fields: Object.freeze([
            { key: "poshEmployeeAwarenessCadence", label: "Employee awareness cadence", type: "select", options: ["regular", "annual", "half-yearly", "quarterly", "none"] },
            { key: "poshEmployeeAwarenessEvidence", label: "Employee awareness evidence references", type: "csv", placeholder: "awareness-session-2026" },
            { key: "poshIcOrientationEvidence", label: "Committee orientation evidence references", type: "csv", placeholder: "ic-orientation-2026" },
            { key: "poshCapacityBuildingEvidence", label: "Capacity-building evidence references", type: "csv", placeholder: "capacity-programme-2026" }
        ])
    }),
    "feature.legal.posh.notice-display-review": Object.freeze({
        label: "Notice and display",
        description: "Review each location separately. Do not infer one office's display controls for another.",
        fields: Object.freeze([
            { key: "poshNoticeLocationsReviewed", label: "Location references", type: "csv", placeholder: "mumbai-hq, pune-office" },
            { key: "poshPenalConsequencesDisplayByLocation", label: "Penal-consequences display by location", type: "json", placeholder: '[{"locationRef":"mumbai-hq","status":"implemented"}]' },
            { key: "poshIcOrderDisplayByLocation", label: "Committee-order display by location", type: "json", placeholder: '[{"locationRef":"mumbai-hq","status":"implemented"}]' },
            { key: "poshMemberContactDisplayByLocation", label: "Member contact-display control by location", type: "json", placeholder: '[{"locationRef":"mumbai-hq","status":"implemented"}]' }
        ])
    }),
    "feature.legal.posh.complaint-mechanism-records-review": Object.freeze({
        label: "Complaint mechanism and records",
        description: "Control-status review only. Do not enter names, allegations, narratives, evidence, findings or case statistics.",
        fields: Object.freeze([
            { key: "poshComplaintRouteDefined", label: "Complaint route defined", type: "boolean" },
            { key: "poshComplaintProcessOwnerRole", label: "Process owner role", type: "text", placeholder: "Internal Committee" },
            { key: "poshComplaintTimelineControls", label: "Timeline controls", type: "status" },
            { key: "poshComplaintConfidentialityControls", label: "Confidentiality controls", type: "status" },
            { key: "poshComplaintRetentionControls", label: "Retention controls", type: "status" },
            { key: "poshComplaintAgainstEmployerRoute", label: "Complaint-against-employer route", type: "status" }
        ])
    }),
    "feature.legal.posh.internal-committee-composition-unit-review": Object.freeze({
        label: "Committee composition and unit coverage",
        description: "Review role eligibility, composition and office or administrative-unit coverage without personal names.",
        fields: Object.freeze([
            { key: "poshIcPresidingOfficerEligibility", label: "Presiding Officer eligibility record", type: "json", placeholder: '{"eligible":true}' },
            { key: "poshIcEmployeeMemberCount", label: "Employee-member count", type: "number", min: 0 },
            { key: "poshIcExternalMemberEligibility", label: "External-member eligibility record", type: "json", placeholder: '{"eligible":true}' },
            { key: "poshIcWomenMemberRatio", label: "Women-member ratio (%)", type: "number", min: 0, max: 100 },
            { key: "poshIcNominationDates", label: "Nomination dates", type: "csv", placeholder: "2025-01-15" },
            { key: "poshIcUnitCount", label: "Office or administrative-unit count", type: "number", min: 1 },
            { key: "poshWorkersByUnit", label: "Worker counts by unit", type: "json", placeholder: '[{"unitRef":"mumbai-hq","workerCount":20}]' },
            { key: "poshCommitteesByUnit", label: "Committee controls by unit", type: "json", placeholder: '[{"unitRef":"mumbai-hq","status":"implemented"}]' }
        ])
    }),
    "feature.legal.posh.annual-reporting-review": Object.freeze({
        label: "Annual reporting",
        description: "Presence-only control review. Complaint counts and case-level details are not collected.",
        fields: Object.freeze([
            { key: "poshAnnualReportYear", label: "Reporting year", type: "number", min: 2013, max: 2200 },
            { key: "poshAnnualReportPrepared", label: "Annual report prepared", type: "boolean" },
            { key: "poshAnnualReportSubmittedToEmployer", label: "Submitted to employer", type: "boolean" },
            { key: "poshAnnualReportSubmittedToDistrictOfficer", label: "Submitted to District Officer", type: "boolean" },
            { key: "poshAnnualReportAggregateStatsPresent", label: "Aggregate-statistics categories present", type: "boolean" },
            { key: "poshAnnualReportWorkshopCountPresent", label: "Workshop-count category present", type: "boolean" },
            { key: "poshAnnualReportActionStatusPresent", label: "Action-status category present", type: "boolean" },
            { key: "poshEmployerAnnualDisclosureRecorded", label: "Employer annual disclosure recorded", type: "boolean" }
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
    const wrapper = createElement(documentObject, "label", {
        className: "dna-posh-wave1__field"
    });
    const label = createElement(documentObject, "span", {
        className: "dna-posh-wave1__field-label",
        text: definition.label
    });
    wrapper.append(label);

    let control;
    if (definition.type === "boolean") {
        control = createElement(documentObject, "select", { className: "dna-posh-wave1__control" });
        [["", "Select…"], ["true", "Yes"], ["false", "No"]].forEach(([value, optionLabel]) => {
            const option = createElement(documentObject, "option", { text: optionLabel });
            option.value = value;
            control.append(option);
        });
    } else if (["select", "status"].includes(definition.type)) {
        control = createElement(documentObject, "select", { className: "dna-posh-wave1__control" });
        const values = definition.type === "status"
            ? ["implemented", "partial", "missing"]
            : definition.options;
        const empty = createElement(documentObject, "option", { text: "Select…" });
        empty.value = "";
        control.append(empty);
        values.forEach((value) => {
            const option = createElement(documentObject, "option", { text: value });
            option.value = value;
            control.append(option);
        });
    } else if (definition.type === "json") {
        control = createElement(documentObject, "textarea", { className: "dna-posh-wave1__control dna-posh-wave1__control--code" });
        control.rows = 3;
    } else {
        control = createElement(documentObject, "input", { className: "dna-posh-wave1__control" });
        control.type = definition.type === "csv" ? "text" : definition.type;
        if (Number.isFinite(definition.min)) control.min = String(definition.min);
        if (Number.isFinite(definition.max)) control.max = String(definition.max);
    }

    control.name = definition.key;
    control.dataset.fieldType = definition.type;
    control.required = true;
    if (definition.placeholder) control.placeholder = definition.placeholder;
    wrapper.append(control);
    return wrapper;
}

function parseControl(control) {
    const type = control.dataset.fieldType;
    const raw = text(control.value);
    if (!raw) throw new Error(`${control.name} is required.`);
    if (type === "boolean") return raw === "true";
    if (type === "number") {
        const value = Number.parseInt(raw, 10);
        if (!Number.isSafeInteger(value)) throw new Error(`${control.name} must be an integer.`);
        return value;
    }
    if (type === "csv") {
        const values = raw.split(",").map(text).filter(Boolean);
        if (!values.length) throw new Error(`${control.name} requires at least one value.`);
        return values;
    }
    if (type === "json") {
        let value;
        try {
            value = JSON.parse(raw);
        } catch (_error) {
            throw new Error(`${control.name} must contain valid JSON.`);
        }
        if (value === null || value === undefined) throw new Error(`${control.name} is required.`);
        return value;
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
        id: "dnaPoshWave1",
        className: "dna-legal-explanation dna-posh-wave1"
    });
    root.setAttribute("aria-labelledby", "dnaPoshWave1Title");

    const header = createElement(documentObject, "header", { className: "dna-legal-explanation__header" });
    const heading = createElement(documentObject, "div", { className: "dna-legal-explanation__heading" });
    heading.append(
        createElement(documentObject, "p", { className: "dna-legal-explanation__eyebrow", text: "POSH Wave 1 · substantive private beta" }),
        createElement(documentObject, "h2", { id: "dnaPoshWave1Title", className: "dna-legal-explanation__title", text: "Review six source-grounded POSH controls" }),
        createElement(documentObject, "p", { className: "dna-legal-explanation__description", text: "Enter privacy-safe organisational control facts. Deterministic rules produce the fixed result before governed statutory retrieval and explanation." })
    );
    header.append(heading);
    root.append(header);

    const note = createElement(documentObject, "p", { className: "dna-private-note" });
    note.textContent = "Inputs remain in memory and are sent only when you select Generate review. Nothing is saved. Do not enter names, complaint narratives, allegations, evidence bodies, findings, contact details or case-level statistics.";
    root.append(note);

    const selectorLabel = createElement(documentObject, "label", { className: "dna-posh-wave1__selector" });
    selectorLabel.append(createElement(documentObject, "span", { className: "dna-posh-wave1__field-label", text: "Select a POSH control" }));
    const selector = createElement(documentObject, "select", { id: "dnaPoshWave1Feature", className: "dna-posh-wave1__control" });
    POSH_WAVE1_FEATURE_IDS.forEach((featureId) => {
        const option = createElement(documentObject, "option", { text: FEATURE_DEFINITIONS[featureId].label });
        option.value = featureId;
        selector.append(option);
    });
    selectorLabel.append(selector);
    root.append(selectorLabel);

    const description = createElement(documentObject, "p", { id: "dnaPoshWave1Description", className: "dna-legal-explanation__status" });
    const form = createElement(documentObject, "form", { id: "dnaPoshWave1Form", className: "dna-posh-wave1__form" });
    const fields = createElement(documentObject, "div", { id: "dnaPoshWave1Fields", className: "dna-posh-wave1__fields" });
    const actions = createElement(documentObject, "div", { className: "dna-posh-wave1__actions" });
    const submit = createElement(documentObject, "button", { id: "dnaPoshWave1Submit", className: "dna-primary-button", text: "Generate review", type: "submit" });
    actions.append(submit);
    form.append(fields, actions);
    root.append(description, form);

    const status = createElement(documentObject, "p", { id: "dnaPoshWave1Status", className: "dna-legal-explanation__status", text: "Select a feature and complete its required control facts." });
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    root.append(status);

    const error = createElement(documentObject, "section", { id: "dnaPoshWave1Error", className: "dna-legal-explanation__notice dna-legal-explanation__notice--error" });
    error.hidden = true;
    const errorText = createElement(documentObject, "p", { id: "dnaPoshWave1ErrorMessage" });
    error.append(createElement(documentObject, "h3", { text: "Review could not be prepared" }), errorText);
    root.append(error);

    const result = createElement(documentObject, "div", { id: "dnaPoshWave1Result", className: "dna-legal-explanation__content" });
    result.hidden = true;
    const summaryCard = createElement(documentObject, "article", { className: "dna-legal-explanation__summary-card" });
    const summaryHeader = createElement(documentObject, "header", { className: "dna-legal-explanation__summary-header" });
    const badge = createElement(documentObject, "span", { id: "dnaPoshWave1Badge", className: "dna-legal-explanation__decision-badge", text: "Waiting" });
    summaryHeader.append(createElement(documentObject, "h3", { text: "Deterministic control result explained" }), badge);
    const summary = createElement(documentObject, "p", { id: "dnaPoshWave1Summary", className: "dna-legal-explanation__summary" });
    summaryCard.append(summaryHeader, summary);

    const grid = createElement(documentObject, "div", { className: "dna-legal-explanation__detail-grid" });
    const createDetail = (title, id) => {
        const section = createElement(documentObject, "section", { className: "dna-legal-explanation__detail" });
        section.append(createElement(documentObject, "h3", { text: title }));
        const mount = createElement(documentObject, "div", { id });
        section.append(mount);
        return { section, mount };
    };
    const rationale = createDetail("Why this result appears", "dnaPoshWave1Rationale");
    const nextSteps = createDetail("Next steps", "dnaPoshWave1NextSteps");
    const citations = createDetail("Governed statutory citations", "dnaPoshWave1Citations");
    grid.append(rationale.section, nextSteps.section, citations.section);
    const metadata = createElement(documentObject, "p", { id: "dnaPoshWave1Metadata", className: "dna-legal-explanation__metadata" });
    result.append(summaryCard, grid, metadata);
    root.append(result);

    return {
        root,
        selector,
        description,
        form,
        fields,
        submit,
        status,
        error,
        errorText,
        result,
        badge,
        summary,
        rationale: rationale.mount,
        nextSteps: nextSteps.mount,
        citations: citations.mount,
        metadata
    };
}

function ensureStyles(documentObject) {
    if (documentObject.getElementById("growwithhrPoshWave1Styles")) return;
    const style = createElement(documentObject, "style", { id: "growwithhrPoshWave1Styles" });
    style.textContent = `
.dna-posh-wave1__selector{display:grid;gap:.45rem;max-width:34rem;margin:1rem 0}
.dna-posh-wave1__form{display:grid;gap:1rem}
.dna-posh-wave1__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem}
.dna-posh-wave1__field{display:grid;gap:.4rem;align-content:start}
.dna-posh-wave1__field-label{font-weight:700}
.dna-posh-wave1__control{width:100%;min-height:2.75rem;padding:.65rem .75rem;border:1px solid currentColor;border-radius:.55rem;background:var(--surface,#fff);color:inherit;font:inherit}
.dna-posh-wave1__control--code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;resize:vertical}
.dna-posh-wave1__actions{display:flex;justify-content:flex-start}
.dna-posh-wave1__metadata{margin-top:1rem;font-size:.875rem;opacity:.8}
`;
    documentObject.head?.append(style);
}

export function createPoshWave1ExplanationPanel(options = {}) {
    const runtime = options.runtime || globalThis;
    const documentObject = options.documentObject || runtime.document;
    if (!documentObject?.getElementById("dnaShell")) return null;
    ensureStyles(documentObject);

    const existing = documentObject.getElementById("dnaPoshWave1");
    if (existing) return runtime.window?.GrowWithHRPoshWave1Panel || null;

    const elements = createMarkup(documentObject);
    const anchor = documentObject.getElementById("dnaLegalExplanation");
    const shell = documentObject.getElementById("dnaShell");
    if (anchor?.parentNode === shell) anchor.insertAdjacentElement("afterend", elements.root);
    else shell.append(elements.root);

    let activeRequest = null;
    let destroyed = false;

    function renderFields() {
        const featureId = elements.selector.value;
        const definition = FEATURE_DEFINITIONS[featureId];
        elements.description.textContent = definition.description;
        elements.fields.replaceChildren();
        definition.fields.forEach((field) => elements.fields.append(fieldInput(documentObject, field)));
        elements.error.hidden = true;
        elements.result.hidden = true;
        elements.status.textContent = "Complete every required field, then generate the private-beta review.";
    }

    async function submit(event) {
        event?.preventDefault();
        if (destroyed || activeRequest) return null;
        elements.error.hidden = true;
        elements.result.hidden = true;
        elements.submit.disabled = true;
        elements.submit.setAttribute("aria-busy", "true");
        elements.status.textContent = "Running the deterministic control rule, governed retrieval and explanation…";

        try {
            const featureId = elements.selector.value;
            const answers = collectAnswers(elements.form);
            const savedRecord = { answers };
            createPoshWave1Payload(featureId, savedRecord);
            activeRequest = requestPoshWave1Explanation({
                featureId,
                savedRecord,
                runtime,
                documentObject,
                fetchImpl: options.fetchImpl
            });
            const response = await activeRequest;
            if (destroyed) return null;
            renderResult(documentObject, elements, response);
            elements.status.textContent = "Review completed. The result remains deterministic-only, advisory and needs qualified legal review.";
            return response;
        } catch (error) {
            if (destroyed) return null;
            elements.error.hidden = false;
            elements.errorText.textContent = text(error?.message) || "The review could not be prepared.";
            elements.status.textContent = "No result was saved or added to the stable report.";
            return null;
        } finally {
            activeRequest = null;
            elements.submit.disabled = false;
            elements.submit.setAttribute("aria-busy", "false");
        }
    }

    const handleFeatureChange = () => renderFields();
    elements.selector.addEventListener("change", handleFeatureChange);
    elements.form.addEventListener("submit", submit);
    renderFields();

    return Object.freeze({
        version: POSH_WAVE1_PANEL_VERSION,
        featureIds: POSH_WAVE1_FEATURE_IDS,
        renderFields,
        requestReview: submit,
        destroy() {
            if (destroyed) return;
            destroyed = true;
            elements.selector.removeEventListener("change", handleFeatureChange);
            elements.form.removeEventListener("submit", submit);
            elements.root.remove();
        }
    });
}

function start() {
    const documentObject = globalThis.document;
    if (!documentObject?.getElementById("dnaShell")) return;
    try {
        globalThis.window.GrowWithHRPoshWave1Panel = createPoshWave1ExplanationPanel();
    } catch (error) {
        console.error("GrowWithHR POSH Wave 1 panel could not start.", error);
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
    version: POSH_WAVE1_PANEL_VERSION,
    featureIds: POSH_WAVE1_FEATURE_IDS,
    createPoshWave1ExplanationPanel
});
