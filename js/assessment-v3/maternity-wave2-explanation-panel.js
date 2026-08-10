/**
 * GrowWithHR Compliance DNA — Maternity Benefit Wave 2 control-review panel.
 *
 * Provides an explicit, in-memory input surface for ten substantive Maternity
 * Benefit private-beta reviews. It makes no automatic request, writes no
 * browser storage and sends only the strict allow-listed payload produced by
 * maternity-wave2-explanation-api-client.js.
 */

import {
    MATERNITY_WAVE2_FEATURE_IDS,
    createMaternityWave2Payload,
    requestMaternityWave2Explanation
} from "./maternity-wave2-explanation-api-client.js";

export const MATERNITY_WAVE2_PANEL_VERSION = "1.0.0";

const STATUS_OPTIONS = Object.freeze(["evidenced", "not-evidenced", "unknown", "not-applicable", "conflict"]);
const YES_NO_OPTIONS = Object.freeze(["yes", "no", "unknown", "not-applicable", "conflict"]);
const statusFields = (entries) => entries.map(([key, label]) => ({ key, label, type: "select", options: STATUS_OPTIONS }));

const FEATURE_DEFINITIONS = Object.freeze({
    "feature.legal.maternity.establishment-coverage": Object.freeze({
        label: "Establishment coverage",
        description: "Review the establishment-specific Chapter VI boundary and appropriate-Government facts without generalising across offices.",
        fields: Object.freeze([
            { key: "maternityCountry", label: "Country", type: "select", options: ["india"] },
            { key: "maternityPrimaryState", label: "Primary State", type: "text", placeholder: "Maharashtra" },
            { key: "maternityOperatingStates", label: "Operating States", type: "csv", placeholder: "Maharashtra, Karnataka" },
            { key: "maternityAppropriateGovernmentSphere", label: "Appropriate Government sphere", type: "select", options: ["central", "state", "union-territory", "unknown"] },
            { key: "maternityEstablishmentType", label: "Establishment type", type: "text", placeholder: "commercial-establishment" },
            { key: "maternityEmployeeCount", label: "Establishment employee count", type: "number", min: 0 },
            { key: "maternityPrecedingTwelveMonthsThresholdStatus", label: "Preceding twelve-month threshold status", type: "select", options: ["met", "not-met", "unknown", "conflict"] },
            { key: "maternityChapterViCoveredStatus", label: "Chapter VI prior coverage status", type: "select", options: YES_NO_OPTIONS }
        ])
    }),
    "feature.legal.maternity.employee-eligibility": Object.freeze({
        label: "Employee eligibility route",
        description: "Use only a workday count and controlled event category. Do not enter attendance records, medical evidence, names or dates.",
        fields: Object.freeze([
            { key: "maternityWorkdaysBandValue", label: "Workdays in preceding twelve months", type: "number", min: 0, max: 366 },
            { key: "maternityEligibilityEventCategory", label: "Eligibility event category", type: "select", options: ["expected-delivery", "delivery", "miscarriage", "medical-termination", "adoption", "commissioning-mother", "tubectomy", "related-illness", "unknown"] }
        ])
    }),
    "feature.legal.maternity.benefit-duration-review": Object.freeze({
        label: "Benefit-duration category",
        description: "Use a controlled child-count band and event category only. Do not enter family history or child details.",
        fields: Object.freeze([
            { key: "maternitySurvivingChildCountBand", label: "Surviving-child count band", type: "select", options: ["zero-or-one", "two-or-more", "unknown"] },
            { key: "maternityDurationEventCategory", label: "Duration event category", type: "select", options: ["expected-delivery", "delivery", "adoption", "commissioning-mother", "unknown"] }
        ])
    }),
    "feature.legal.maternity.adopting-commissioning-mother-review": Object.freeze({
        label: "Adopting or commissioning mother",
        description: "Controlled category and work-from-home review only. Adoption, surrogacy and child documents are prohibited.",
        fields: Object.freeze([
            { key: "maternityAdoptingMotherStatus", label: "Adopting-mother status", type: "select", options: YES_NO_OPTIONS },
            { key: "maternityCommissioningMotherStatus", label: "Commissioning-mother status", type: "select", options: YES_NO_OPTIONS },
            { key: "maternityChildAgeEligibilityBand", label: "Child-age eligibility band", type: "select", options: ["below-three-months", "three-months-or-more", "unknown"] },
            { key: "maternityWorkFromHomeFeasibilityStatus", label: "Work-from-home feasibility", type: "select", options: ["feasible", "not-feasible", "unknown", "not-assessed"] },
            { key: "maternityWorkFromHomeAgreementStatus", label: "Work-from-home agreement", type: "select", options: ["agreed", "not-agreed", "unknown", "not-applicable"] }
        ])
    }),
    "feature.legal.maternity.miscarriage-tubectomy-illness-leave-review": Object.freeze({
        label: "Special-leave controls",
        description: "Organisation control-status review only. Diagnoses, procedure details, certificates and medical narratives are prohibited.",
        fields: Object.freeze(statusFields([
            ["maternityMiscarriageLeaveControlStatus", "Miscarriage leave control"],
            ["maternityMedicalTerminationLeaveControlStatus", "Medical-termination leave control"],
            ["maternityTubectomyLeaveControlStatus", "Tubectomy leave control"],
            ["maternityRelatedIllnessLeaveControlStatus", "Related-illness leave control"]
        ]))
    }),
    "feature.legal.maternity.nursing-break-review": Object.freeze({
        label: "Nursing-break controls",
        description: "Review nursing-break controls separately from crèche controls. Individual feeding or medical information is prohibited.",
        fields: Object.freeze(statusFields([
            ["maternityNursingBreakPolicyStatus", "Nursing-break policy"],
            ["maternityNursingBreakDurationControlStatus", "Duration control"],
            ["maternityNursingBreakJourneyTimeStatus", "Journey-time control"],
            ["maternityNursingBreakDisputeProcessStatus", "Dispute process"]
        ]))
    }),
    "feature.legal.maternity.creche-review": Object.freeze({
        label: "Crèche controls",
        description: "Review the establishment threshold and organisation-level facility controls. The product does not inspect or certify a facility.",
        fields: Object.freeze([
            { key: "maternityCrecheEmployeeCount", label: "Establishment employee count", type: "number", min: 0 },
            ...statusFields([
                ["maternityCrecheThresholdStatus", "Crèche threshold assessment"],
                ["maternityCrecheFacilityStatus", "Facility control"],
                ["maternityCrecheDistanceStatus", "Distance control"],
                ["maternityCrecheSpaceStatus", "Space control"],
                ["maternityCrecheSanitationStatus", "Sanitation control"],
                ["maternityCrecheStaffingStatus", "Staffing control"],
                ["maternityCrecheHoursStatus", "Operating-hours control"],
                ["maternityCrecheFeedingFacilityStatus", "Feeding-facility control"],
                ["maternityCrecheFirstAidStatus", "First-aid control"],
                ["maternityCrecheAllowanceArrangementStatus", "Allowance arrangement"],
                ["maternityNegotiatingUnionOrCouncilStatus", "Negotiating union or council status"]
            ])
        ])
    }),
    "feature.legal.maternity.notice-payment-records-review": Object.freeze({
        label: "Notice, payment and records",
        description: "Control-status review only. Completed forms, claims, bank details, registers and complaint records are prohibited.",
        fields: Object.freeze(statusFields([
            ["maternityNoticeClaimProcessStatus", "Notice and claim process"],
            ["maternityNominationProcessStatus", "Nomination process"],
            ["maternityAdvancePaymentControlStatus", "Advance payment control"],
            ["maternityPostDeliveryPaymentControlStatus", "Post-delivery payment control"],
            ["maternityDeathPaymentControlStatus", "Death-payment control"],
            ["maternityMedicalBonusControlStatus", "Medical-bonus control"],
            ["maternityEmployeeInformationProcessStatus", "Employee-information process"],
            ["maternityComplaintProcessStatus", "Complaint process"],
            ["maternityInspectionReadinessStatus", "Inspection readiness"],
            ["maternityPrescribedFormsAvailabilityStatus", "Prescribed forms availability"],
            ["maternityStatutoryAbstractDisplayStatus", "Statutory abstract display"],
            ["maternityRegisterMaintainedStatus", "Register maintained"],
            ["maternityRecordsRetentionStatus", "Records retention"],
            ["maternityAnnualReturnStatus", "Annual return"]
        ]))
    }),
    "feature.legal.maternity.employment-protection-review": Object.freeze({
        label: "Employment protection",
        description: "Organisation controls only. Individual disputes, allegations, disciplinary evidence and dismissal records are prohibited.",
        fields: Object.freeze(statusFields([
            ["maternityProtectedPeriodControlStatus", "Protected-period control"],
            ["maternityArduousWorkRequestProcessStatus", "Arduous-work request process"],
            ["maternityEmploymentProtectionPolicyStatus", "Employment-protection policy"],
            ["maternityDismissalReviewProcessStatus", "Dismissal review process"],
            ["maternityGrossMisconductProcessStatus", "Gross-misconduct process"],
            ["maternityAppealProcessStatus", "Appeal process"],
            ["maternityWageDeductionControlStatus", "Wage-deduction control"],
            ["maternityForfeitureControlStatus", "Forfeiture control"]
        ]))
    }),
    "feature.legal.maternity.esi-overlap-review": Object.freeze({
        label: "Maternity and ESI overlap",
        description: "Controlled route-status review only. ESI identifiers, claim documents, medical details and exact transition dates are prohibited.",
        fields: Object.freeze([
            { key: "maternityEmployeeEsiCoverageStatus", label: "Employee ESI coverage status", type: "select", options: YES_NO_OPTIONS },
            { key: "maternityEsiMaternityBenefitEligibilityStatus", label: "ESI maternity-benefit eligibility status", type: "select", options: YES_NO_OPTIONS },
            { key: "maternityChapterViExistingEntitlementStatus", label: "Existing Chapter VI entitlement status", type: "select", options: YES_NO_OPTIONS },
            { key: "maternityEsiTransitionDateStatus", label: "ESI transition-date control", type: "select", options: STATUS_OPTIONS }
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
        if (Number.isFinite(definition.max)) control.max = String(definition.max);
        if (definition.placeholder) control.placeholder = definition.placeholder;
    }

    control.name = definition.key;
    control.dataset.fieldType = definition.type;
    control.required = true;
    wrapper.append(control);
    return wrapper;
}

function parseControl(control) {
    const type = control.dataset.fieldType;
    const raw = text(control.value);
    if (!raw) throw new Error(`${control.name} is required.`);
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
        id: "dnaMaternityWave2",
        className: "dna-legal-explanation dna-posh-wave1 dna-maternity-wave2"
    });
    root.setAttribute("aria-labelledby", "dnaMaternityWave2Title");

    const header = createElement(documentObject, "header", { className: "dna-legal-explanation__header" });
    const heading = createElement(documentObject, "div", { className: "dna-legal-explanation__heading" });
    heading.append(
        createElement(documentObject, "p", { className: "dna-legal-explanation__eyebrow", text: "Maternity Benefit Wave 2 · substantive private beta" }),
        createElement(documentObject, "h2", { id: "dnaMaternityWave2Title", className: "dna-legal-explanation__title", text: "Review ten source-grounded Maternity Benefit routes" }),
        createElement(documentObject, "p", { className: "dna-legal-explanation__description", text: "Enter controlled organisation facts, categories and statuses. Deterministic rules produce the fixed result before governed statutory retrieval and explanation." })
    );
    header.append(heading);
    root.append(header);

    root.append(createElement(documentObject, "p", {
        className: "dna-private-note",
        text: "Inputs remain in memory and are sent only when you select Generate review. Nothing is saved. Do not enter names, contact details, medical narratives, certificates, exact event dates, child details, claim documents, ESI identifiers, bank details, disciplinary evidence or completed forms."
    }));

    const selectorLabel = createElement(documentObject, "label", { className: "dna-posh-wave1__selector" });
    selectorLabel.append(createElement(documentObject, "span", { className: "dna-posh-wave1__field-label", text: "Select a Maternity Benefit review" }));
    const selector = createElement(documentObject, "select", { id: "dnaMaternityWave2Feature", className: "dna-posh-wave1__control" });
    MATERNITY_WAVE2_FEATURE_IDS.forEach((featureId) => {
        const option = createElement(documentObject, "option", { text: FEATURE_DEFINITIONS[featureId].label });
        option.value = featureId;
        selector.append(option);
    });
    selectorLabel.append(selector);
    root.append(selectorLabel);

    const description = createElement(documentObject, "p", { id: "dnaMaternityWave2Description", className: "dna-legal-explanation__status" });
    const form = createElement(documentObject, "form", { id: "dnaMaternityWave2Form", className: "dna-posh-wave1__form" });
    const fields = createElement(documentObject, "div", { id: "dnaMaternityWave2Fields", className: "dna-posh-wave1__fields" });
    const actions = createElement(documentObject, "div", { className: "dna-posh-wave1__actions" });
    const button = createElement(documentObject, "button", {
        id: "dnaMaternityWave2Button",
        className: "dna-primary-button dna-legal-explanation__button",
        text: "Generate Maternity review",
        type: "submit"
    });
    const status = createElement(documentObject, "p", {
        id: "dnaMaternityWave2Status",
        className: "dna-legal-explanation__status",
        text: "No request has been made."
    });
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    actions.append(button, status);
    form.append(fields, actions);
    root.append(description, form);

    const error = createElement(documentObject, "p", {
        id: "dnaMaternityWave2Error",
        className: "dna-legal-explanation__notice dna-legal-explanation__notice--error"
    });
    error.hidden = true;
    error.setAttribute("role", "alert");
    root.append(error);

    const result = createElement(documentObject, "div", { id: "dnaMaternityWave2Result", className: "dna-legal-explanation__content" });
    result.hidden = true;
    const summaryCard = createElement(documentObject, "article", { className: "dna-legal-explanation__summary-card" });
    const summaryHeader = createElement(documentObject, "header", { className: "dna-legal-explanation__summary-header" });
    summaryHeader.append(
        createElement(documentObject, "h3", { text: "Deterministic result explained" }),
        createElement(documentObject, "span", { id: "dnaMaternityWave2Badge", className: "dna-legal-explanation__decision-badge", text: "Waiting" })
    );
    const summary = createElement(documentObject, "p", { id: "dnaMaternityWave2Summary", className: "dna-legal-explanation__summary" });
    summaryCard.append(summaryHeader, summary);

    const grid = createElement(documentObject, "div", { className: "dna-legal-explanation__detail-grid" });
    const details = [
        ["Why this result appears", "dnaMaternityWave2Rationale"],
        ["Next steps", "dnaMaternityWave2NextSteps"],
        ["Governed citations", "dnaMaternityWave2Citations"]
    ];
    details.forEach(([title, id]) => {
        const section = createElement(documentObject, "section", { className: "dna-legal-explanation__detail" });
        section.append(createElement(documentObject, "h3", { text: title }), createElement(documentObject, "div", { id }));
        grid.append(section);
    });
    const metadata = createElement(documentObject, "p", { id: "dnaMaternityWave2Metadata", className: "dna-legal-explanation__metadata" });
    result.append(summaryCard, grid, metadata);
    root.append(result);

    return { root, selector, description, form, fields, button, status, error, result };
}

export function createMaternityWave2Panel(options = {}) {
    const runtime = options.runtime || globalThis;
    const documentObject = options.documentObject || runtime.document;
    const shell = documentObject?.getElementById("dnaShell");
    if (!shell) throw new Error("GrowWithHR Maternity Wave 2 panel requires #dnaShell.");

    const markup = createMarkup(documentObject);
    const poshPanel = documentObject.getElementById("dnaPoshWave1");
    if (poshPanel?.parentNode === shell) poshPanel.insertAdjacentElement("afterend", markup.root);
    else shell.append(markup.root);

    const elements = {
        ...markup,
        badge: documentObject.getElementById("dnaMaternityWave2Badge"),
        summary: documentObject.getElementById("dnaMaternityWave2Summary"),
        rationale: documentObject.getElementById("dnaMaternityWave2Rationale"),
        nextSteps: documentObject.getElementById("dnaMaternityWave2NextSteps"),
        citations: documentObject.getElementById("dnaMaternityWave2Citations"),
        metadata: documentObject.getElementById("dnaMaternityWave2Metadata")
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
            payload = createMaternityWave2Payload(elements.selector.value, { answers: collectAnswers(elements.form) });
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
            const response = await requestMaternityWave2Explanation({
                featureId: elements.selector.value,
                payload,
                runtime,
                fetchImpl: options.fetchImpl,
                endpoint: options.endpoint
            });
            state.result = response;
            state.phase = "complete";
            renderResult(documentObject, elements, response);
            elements.status.textContent = "Maternity Benefit review completed. The result remains needs-legal-review.";
        } catch (error) {
            state.phase = "error";
            elements.error.textContent = text(error?.message) || "The Maternity Benefit review could not be prepared.";
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
        version: MATERNITY_WAVE2_PANEL_VERSION,
        featureIds: MATERNITY_WAVE2_FEATURE_IDS,
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
    if (!documentObject?.getElementById("dnaShell") || documentObject.getElementById("dnaMaternityWave2")) return;
    try {
        globalThis.window.GrowWithHRMaternityWave2Panel = createMaternityWave2Panel();
    } catch (error) {
        console.error("GrowWithHR Maternity Wave 2 panel could not start.", error);
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
    version: MATERNITY_WAVE2_PANEL_VERSION,
    featureIds: MATERNITY_WAVE2_FEATURE_IDS,
    createMaternityWave2Panel
});
