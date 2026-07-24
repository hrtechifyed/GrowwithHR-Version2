/* ==========================================================
   GrowWithHR Gmail delivery client
   File: js/gmail-service.js

   Gmail credentials must never be placed in this file.
   This client sends the generated PDF to the Node server.
========================================================== */
(function initialiseGmailService(window) {
    "use strict";

    const DEFAULT_ENDPOINT = "/api/send-advisory";
    const DEFAULT_HEALTH_ENDPOINT = "/api/health";
    const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
    const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
    const RENDER_ENDPOINT = "https://growwithhr.onrender.com/api/send-advisory";
    const RENDER_HEALTH_ENDPOINT = "https://growwithhr.onrender.com/api/health";
    const MAX_PDF_BYTES = 8 * 1024 * 1024;
    const REQUEST_TIMEOUT_MS = 60 * 1000;
    const HEALTH_TIMEOUT_MS = 15 * 1000;
    const MAX_RECIPIENTS = 5;
    const MAX_OPERATING_STATES = 3;
    const PAN_INDIA_VALUE = "pan-india";
    const PAN_INDIA_LABEL = "Pan India";
    const ALL_PRIORITIES_VALUE = "all-of-the-above";
    const INDIA_COMPLIANCE_SCOPE_NOTICE =
        "Compliance analysis in this report is restricted to the organisation’s India operations only. International compliance is not in the scope of the report for now.";
    const ALL_PRIORITY_VALUES = Object.freeze([
        "hiring-onboarding", "policies-compliance", "performance-rewards",
        "manager-capability", "culture-engagement", "hr-operations-technology",
        "workforce-planning", "organisation-design"
    ]);

    let activeRequest = null;
    let warmUpRequest = null;
    let lastStatus = null;
    let lastHealthStatus = null;

    function cleanText(value, fallback = "") {
        if (value === null || value === undefined) return fallback;
        return String(value).trim() || fallback;
    }

    function escapeAttribute(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function isValidEmail(value) {
        return /^[^\s@;]+@[^\s@;]+\.[^\s@;]+$/.test(cleanText(value));
    }

    function parseRecipientEmails(value) {
        return cleanText(value)
            .split(";")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
            .filter((email, index, emails) => emails.indexOf(email) === index);
    }

    function validateRecipientEmails(value) {
        const emails = parseRecipientEmails(value);
        if (!emails.length) {
            return { valid: false, emails, message: "Enter at least one work email address." };
        }
        if (emails.length > MAX_RECIPIENTS) {
            return {
                valid: false,
                emails,
                message: `Enter no more than ${MAX_RECIPIENTS} email addresses, separated by semicolons.`
            };
        }
        const invalid = emails.find((email) => !isValidEmail(email));
        if (invalid) {
            return { valid: false, emails, message: `Enter a valid email address. “${invalid}” is not valid.` };
        }
        return { valid: true, emails, normalized: emails.join("; "), message: "" };
    }

    function isGitHubPagesDeployment() {
        const location = window.location;
        if (!location || location.origin !== GITHUB_PAGES_ORIGIN) return false;
        return location.pathname === "/GrowwithHR-Version2" || location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH);
    }

    function getEndpoint() {
        const explicitEndpoint = document.body?.dataset?.emailEndpoint || window.GROWWITHHR_EMAIL_ENDPOINT;
        if (cleanText(explicitEndpoint)) return cleanText(explicitEndpoint);
        return isGitHubPagesDeployment() ? RENDER_ENDPOINT : DEFAULT_ENDPOINT;
    }

    function getHealthEndpoint() {
        const explicitHealthEndpoint = document.body?.dataset?.healthEndpoint || window.GROWWITHHR_HEALTH_ENDPOINT;
        if (cleanText(explicitHealthEndpoint)) return cleanText(explicitHealthEndpoint);
        const emailEndpoint = getEndpoint();
        if (emailEndpoint === RENDER_ENDPOINT) return RENDER_HEALTH_ENDPOINT;
        if (emailEndpoint === DEFAULT_ENDPOINT) return DEFAULT_HEALTH_ENDPOINT;
        try {
            const resolved = new URL(emailEndpoint, window.location.href);
            resolved.pathname = resolved.pathname.replace(/\/api\/send-advisory\/?$/, "/api/health");
            resolved.search = "";
            resolved.hash = "";
            return resolved.href;
        } catch (_error) {
            return DEFAULT_HEALTH_ENDPOINT;
        }
    }

    function removeDataUriPrefix(value) {
        const source = cleanText(value);
        if (!source) return "";
        const commaIndex = source.indexOf(",");
        return source.startsWith("data:") && commaIndex >= 0 ? source.slice(commaIndex + 1) : source;
    }

    function estimateBase64Size(base64) {
        const source = cleanText(base64).replace(/\s/g, "");
        if (!source) return 0;
        const padding = source.endsWith("==") ? 2 : source.endsWith("=") ? 1 : 0;
        return Math.max(0, Math.floor(source.length * 3 / 4) - padding);
    }

    function serialisePdf(pdf = {}) {
        const base64 = removeDataUriPrefix(pdf.base64 || pdf.dataUri || pdf.data);
        const filename = cleanText(pdf.filename, "GrowWithHR-Advisory.pdf");
        const sizeBytes = Number(pdf.sizeBytes) || estimateBase64Size(base64);
        if (!base64) throw new Error("The advisory PDF was not generated.");
        if (!sizeBytes) throw new Error("The advisory PDF is empty.");
        if (sizeBytes > MAX_PDF_BYTES) throw new Error("The advisory PDF is too large to email.");
        return { base64, filename, sizeBytes };
    }

    function saveStatus(status) {
        lastStatus = { ...status, updatedAt: new Date().toISOString() };
        try {
            window.dispatchEvent(new CustomEvent("growwithhr:email-delivery", { detail: lastStatus }));
        } catch (error) {
            console.warn("Could not dispatch email status event.", error);
        }
        return lastStatus;
    }

    async function readJson(response) {
        try { return await response.json(); } catch (_error) { return {}; }
    }

    async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
        const supportsAbort = typeof window.AbortController === "function";
        const controller = supportsAbort ? new window.AbortController() : null;
        const timer = window.setTimeout(() => controller?.abort(), timeoutMs);
        try {
            return await window.fetch(url, { ...options, signal: controller?.signal || options.signal });
        } catch (error) {
            if (error?.name === "AbortError") {
                throw new Error("The delivery server took too long to respond. Your answers are saved; please try again.");
            }
            throw error;
        } finally {
            window.clearTimeout(timer);
        }
    }

    async function warmUp() {
        if (warmUpRequest) return warmUpRequest;
        warmUpRequest = (async () => {
            const response = await fetchWithTimeout(getHealthEndpoint(), {
                method: "GET", headers: { Accept: "application/json" }, credentials: "omit", cache: "no-store"
            }, HEALTH_TIMEOUT_MS);
            const result = await readJson(response);
            if (!response.ok) throw new Error(result.error || `Delivery server health check returned status ${response.status}.`);
            lastHealthStatus = {
                ok: result.ok !== false,
                gmailConfigured: result.gmailConfigured !== false,
                ...result,
                checkedAt: new Date().toISOString()
            };
            return lastHealthStatus;
        })().finally(() => { warmUpRequest = null; });
        return warmUpRequest;
    }

    async function postDelivery(action, payload = {}) {
        const lead = { ...(payload.lead || {}) };
        const report = payload.report || {};
        const answers = payload.answers || {};
        const recipient = cleanText(lead.email || report.recipientEmail).toLowerCase();
        if (!isValidEmail(recipient)) throw new Error("Please enter a valid recipient email address.");
        lead.email = recipient;
        const pdf = serialisePdf(payload.pdf);
        try {
            const response = await fetchWithTimeout(getEndpoint(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "omit",
                body: JSON.stringify({ action, lead, report, answers, pdf })
            });
            const result = await readJson(response);
            if (!response.ok) throw new Error(result.error || `Email server returned status ${response.status}.`);
            if (result.customerSent !== true && result.customerStatus !== "sent") {
                throw new Error(result.error || "The email server did not confirm delivery.");
            }
            return saveStatus({ ok: true, mode: "gmail", action, ...result });
        } catch (error) {
            const failure = saveStatus({
                ok: false, mode: "gmail", action, customerStatus: "failed", customerSent: false,
                error: cleanText(error.message, "Email delivery failed.")
            });
            const deliveryError = new Error(failure.error);
            deliveryError.delivery = failure;
            throw deliveryError;
        }
    }

    async function postToRecipients(action, payload = {}) {
        const validation = validateRecipientEmails(payload.lead?.email || payload.report?.recipientEmail);
        if (!validation.valid) throw new Error(validation.message);
        const deliveries = [];
        for (const email of validation.emails) {
            deliveries.push(await postDelivery(action, {
                ...payload,
                lead: { ...(payload.lead || {}), email },
                report: { ...(payload.report || {}), recipientEmail: email, recipientEmails: validation.emails }
            }));
        }
        return saveStatus({
            ...(deliveries[deliveries.length - 1] || {}), ok: true, action,
            recipientCount: validation.emails.length, recipients: validation.emails,
            customerSent: true, customerStatus: "sent"
        });
    }

    function sendAdvisory(payload = {}) {
        if (activeRequest) return activeRequest;
        activeRequest = postToRecipients(payload.action || "capture", payload).finally(() => { activeRequest = null; });
        return activeRequest;
    }
    function resendCustomer(payload = {}) { return postToRecipients("resend-customer", payload); }
    function getStatus() { return lastStatus; }
    function getHealthStatus() { return lastHealthStatus; }
    function clearStatus() { lastStatus = null; }
    function initialise() { return true; }
    function isAvailable() { return Boolean(window.fetch && getEndpoint()); }

    window.GrowWithHREmail = Object.freeze({
        initialise, isAvailable, warmUp, sendAdvisory, resendCustomer,
        getStatus, getHealthStatus, clearStatus, parseRecipientEmails, validateRecipientEmails,
        config: Object.freeze({
            endpoint: getEndpoint(), healthEndpoint: getHealthEndpoint(), maxAttachmentBytes: MAX_PDF_BYTES,
            requestTimeoutMs: REQUEST_TIMEOUT_MS, healthTimeoutMs: HEALTH_TIMEOUT_MS, maxRecipients: MAX_RECIPIENTS
        })
    });

    function normaliseStateList(value) {
        const rawValues = Array.isArray(value)
            ? value
            : cleanText(value)
                .split(/[;,|]/);
        const seen = new Set();
        return rawValues
            .map((state) => cleanText(state).replace(/[;,\s]+$/g, ""))
            .filter(Boolean)
            .filter((state) => {
                const key = state.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, MAX_OPERATING_STATES);
    }

    function rawOperatingStateList(value) {
        const rawValues = Array.isArray(value)
            ? value
            : cleanText(value).split(/[;,|]/);
        const seen = new Set();
        return rawValues
            .map((state) => cleanText(state).replace(/[;,\s]+$/g, ""))
            .filter(Boolean)
            .filter((state) => {
                const key = state.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }

    function operatingStatesFromAnswers(answers = {}) {
        const explicit = rawOperatingStateList(answers.operatingStates);
        if (explicit.length) return explicit.slice(0, MAX_OPERATING_STATES);

        const indexed = [
            answers.operatingState1,
            answers.operatingState2,
            answers.operatingState3
        ].map((value) => cleanText(value)).filter(Boolean);
        if (indexed.length) return rawOperatingStateList(indexed).slice(0, MAX_OPERATING_STATES);

        const primaryState = cleanText(answers.primaryState);
        if (!primaryState || primaryState.toLowerCase() === PAN_INDIA_LABEL.toLowerCase()) return [];
        return rawOperatingStateList(primaryState).slice(0, MAX_OPERATING_STATES);
    }

    function resolvedOperatingStateCount(answers = {}) {
        const configured = cleanText(answers.operatingStateCount);
        if ([PAN_INDIA_VALUE, "1", "2", "3"].includes(configured)) return configured;
        const primaryState = cleanText(answers.primaryState);
        if (primaryState.toLowerCase() === PAN_INDIA_LABEL.toLowerCase()) {
            return PAN_INDIA_VALUE;
        }
        const rawStates = rawOperatingStateList(
            Array.isArray(answers.operatingStates) && answers.operatingStates.length
                ? answers.operatingStates
                : primaryState
        );
        if (rawStates.length > MAX_OPERATING_STATES) return PAN_INDIA_VALUE;
        const stateCount = operatingStatesFromAnswers(answers).length;
        return String(Math.min(MAX_OPERATING_STATES, Math.max(1, stateCount || 1)));
    }

    function normaliseOperatingFootprintAnswers(answers = {}) {
        const normalized = { ...(answers || {}) };
        const count = resolvedOperatingStateCount(normalized);

        normalized.operatingStateCount = count;
        normalized.indiaComplianceScopeNotice = INDIA_COMPLIANCE_SCOPE_NOTICE;

        if (count === PAN_INDIA_VALUE) {
            normalized.operatingStates = [];
            normalized.primaryState = PAN_INDIA_LABEL;
            normalized.stateCoverage = PAN_INDIA_LABEL;
            normalized.operatingState1 = "";
            normalized.operatingState2 = "";
            normalized.operatingState3 = "";
            return normalized;
        }

        const numericCount = Number(count);
        const indexedStates = rawOperatingStateList([
            normalized.operatingState1,
            normalized.operatingState2,
            normalized.operatingState3
        ]);
        const states = (
            indexedStates.length
                ? indexedStates
                : operatingStatesFromAnswers(normalized)
        ).slice(0, numericCount);

        states.forEach((state, index) => {
            normalized[`operatingState${index + 1}`] = state;
        });
        normalized.operatingStates = states;
        normalized.primaryState = states.join("; ");
        normalized.stateCoverage = normalized.primaryState;
        return normalized;
    }

    function addAllPrioritiesOption(markup) {
        const source = String(markup || "");
        if (!source.includes('data-field-wrapper="priorities"')) return source;
        const option = source.includes(`value="${ALL_PRIORITIES_VALUE}"`)
            ? ""
            : `
            <label class="advisory-checkbox-card advisory-checkbox-card--all">
                <input type="checkbox" name="priorities" value="${ALL_PRIORITIES_VALUE}">
                <span class="advisory-checkbox-card__surface"><strong>All of the above</strong></span>
            </label>`;

        return source
            .replace(/data-maximum="[^"]*"/, 'data-maximum=""')
            .replace(
                "Choose up to three priorities.",
                "Choose every priority that applies, or select All of the above."
            )
            .replace(
                "Choose up to three priorities, or select All of the above.",
                "Choose every priority that applies, or select All of the above."
            )
            .replace(/(<p\s+id="prioritiesError")/, `${option}$1`);
    }

    function expandAllPriorities(value) {
        if (!Array.isArray(value)) return value;
        return value.includes(ALL_PRIORITIES_VALUE) ? [...ALL_PRIORITY_VALUES] : [...value];
    }

    function renderOperatingFootprint(context = {}) {
        const answers = context.answers || {};
        const definitions = context.definitions || window.GrowWithHRModules?.AssessmentDefinition || {};
        const fields = context.fields || window.GrowWithHRModules?.AssessmentFields?.create?.({ answers });
        if (!fields) return "";

        const count = resolvedOperatingStateCount(answers);
        const existingStates = operatingStatesFromAnswers(answers);
        const stateValues = [
            cleanText(answers.operatingState1, existingStates[0] || ""),
            cleanText(answers.operatingState2, existingStates[1] || ""),
            cleanText(answers.operatingState3, existingStates[2] || "")
        ];
        const numericCount = count === PAN_INDIA_VALUE ? 0 : Number(count);

        const stateFields = stateValues.map((value, index) => {
            const stateNumber = index + 1;
            const visible = stateNumber <= numericCount;
            const separatorVisible = visible && stateNumber < numericCount;
            const fieldId = stateNumber === 1
                ? "primaryState"
                : `operatingState${stateNumber}`;
            return `
                <div data-operating-state-slot="${stateNumber}" ${visible ? "" : "hidden"}>
                    ${fields.datalistField({
                        id: fieldId,
                        label: `State or union territory ${stateNumber}`,
                        helper: stateNumber === 1
                            ? "Enter one state in each box. The report combines selected states with semicolons,
                        placeholder: "Start typing a state or union territory",
                        options: Array.isArray(definitions.STATES) ? definitions.STATES : [],
                        required: visible,
                        value
                    })}
                    <span
                        class="advisory-state-separator"
                        data-operating-state-separator="${stateNumber}"
                        aria-hidden="true"
                        ${separatorVisible ? "" : "hidden"}>;</span>
                </div>`;
        }).join("");

        return `
            <div class="advisory-field-group">
                ${fields.choicePills({
                    id: "operatingStateCount",
                    legend: "How many states or union territories are you operating from?",
                    options: [
                        ["1", "1"],
                        ["2", "2"],
                        ["3", "3"],
                        [PAN_INDIA_VALUE, PAN_INDIA_LABEL]
                    ],
                    required: true,
                    value: count
                })}
                <p class="advisory-field-help">
                    Select up to three states. If you operate from more than three states or union territories, choose Pan India.
                </p>

                <div
                    id="operatingStatesField"
                    class="advisory-field advisory-field--nested"
                    data-field-wrapper="operatingStates"
                    ${count === PAN_INDIA_VALUE ? "hidden" : ""}>
                    <div class="advisory-field-group">
                        ${stateFields}
                    </div>
                    <p id="operatingStatesError" class="advisory-field-error" hidden></p>
                </div>

                <div
                    class="advisory-notice"
                    data-india-compliance-scope>
                    <strong>India compliance scope</strong>
                    <p>${INDIA_COMPLIANCE_SCOPE_NOTICE}</p>
                </div>

                <div class="advisory-compact-field-grid advisory-compact-field-grid--two">
                    ${fields.numberField({
                        id: "locations",
                        label: "How many permanent operating locations do you have?",
                        helper: "Include offices, plants, branches and other permanent sites.",
                        required: true,
                        min: 1,
                        value: answers.locations ?? "1"
                    })}

                    ${fields.numberField({
                        id: "countries",
                        label: "In how many countries do you currently operate?",
                        helper: "Enter all countries for context. The generated compliance report assesses India operations only.",
                        required: true,
                        min: 1,
                        value: answers.countries ?? "1"
                    })}
                </div>
            </div>`;
    }

    function addTemplateSampleData(value, industry) {
        const sampleData = [
            { id: "EMP-001", role: "Operations Associate", location: "Bengaluru", status: "Active", note: `${industry || "Industry"} sample record` },
            { id: "EMP-002", role: "Customer Success Lead", location: "Mumbai", status: "Active", note: `${industry || "Industry"} sample record` },
            { id: "EMP-003", role: "Finance Analyst", location: "Delhi", status: "Planned", note: `${industry || "Industry"} sample record` },
            { id: "EMP-004", role: "People Operations Partner", location: "Hyderabad", status: "Active", note: `${industry || "Industry"} sample record` },
            { id: "EMP-005", role: "Technology Specialist", location: "Pune", status: "Planned", note: `${industry || "Industry"} sample record` }
        ];
        const report = value && typeof value === "object" ? { ...value } : value;
        if (!report || typeof report !== "object") return report;
        if (Array.isArray(report.recommendations)) {
            report.recommendations = report.recommendations.map((item) => ({
                ...item,
                templateSampleData: Array.isArray(item?.templateSampleData) && item.templateSampleData.length >= 5
                    ? item.templateSampleData : sampleData.map((record) => ({ ...record }))
            }));
        }
        report.templateSampleData = Array.isArray(report.templateSampleData) && report.templateSampleData.length >= 5
            ? report.templateSampleData : sampleData;
        report.indiaComplianceScopeNotice = INDIA_COMPLIANCE_SCOPE_NOTICE;
        report.complianceScopeNotice = INDIA_COMPLIANCE_SCOPE_NOTICE;
        return report;
    }

    function wrapModule(moduleName, wrapper) {
        const modules = window.GrowWithHRModules = window.GrowWithHRModules || {};
        let stored = modules[moduleName];
        Object.defineProperty(modules, moduleName, {
            configurable: true, enumerable: true,
            get() { return stored; },
            set(value) { stored = wrapper(value); }
        });
        if (stored) stored = wrapper(stored);
    }

    wrapModule("AssessmentScreens", (original) => {
        if (!original || original.__requestedChangesWrapped) return original;
        const enhanceMarkup = (identifier, context, markup) => {
            const key = String(identifier || "");
            if (key === "operating-footprint" || key === "renderOperatingFootprint") {
                return renderOperatingFootprint(context);
            }
            return addAllPrioritiesOption(markup);
        };
        return Object.freeze({
            ...original,
            renderOperatingFootprint(context) {
                return renderOperatingFootprint(context);
            },
            renderPeopleReadiness(context) {
                return addAllPrioritiesOption(original.renderPeopleReadiness(context));
            },
            renderMoment(identifier, context) {
                return enhanceMarkup(identifier, context, original.renderMoment(identifier, context));
            },
            __requestedChangesWrapped: true
        });
    });

    wrapModule("AssessmentValidation", (original) => {
        if (!original || original.__requestedChangesWrapped) return original;

        function validatePeopleReadiness(answers = {}) {
            const result = original.createResult(answers);
            original.requireText(
                result,
                "peopleFunction",
                "Choose the description closest to your current People or HR support."
            );
            const priorities = Array.isArray(result.normalizedAnswers.priorities)
                ? result.normalizedAnswers.priorities.map((value) => cleanText(value)).filter(Boolean)
                : [];
            result.normalizedAnswers.priorities = priorities;
            if (!priorities.length) {
                result.valid = false;
                result.errors.priorities = "Choose at least one area where guidance would help.";
                result.firstInvalidField = result.firstInvalidField || "priorities";
            }
            return result;
        }

        function validateOperatingFootprint(answers = {}) {
            const result = original.createResult(answers);
            const normalized = normaliseOperatingFootprintAnswers(result.normalizedAnswers);
            Object.assign(result.normalizedAnswers, normalized);
            const count = normalized.operatingStateCount;

            if (![PAN_INDIA_VALUE, "1", "2", "3"].includes(count)) {
                result.valid = false;
                result.errors.operatingStateCount = "Choose how many states or union territories you operate from.";
                result.firstInvalidField = result.firstInvalidField || "operatingStateCount";
            } else if (count !== PAN_INDIA_VALUE) {
                const requiredCount = Number(count);
                const states = [
                    cleanText(normalized.operatingState1),
                    cleanText(normalized.operatingState2),
                    cleanText(normalized.operatingState3)
                ].slice(0, requiredCount);
                const allowedStates = new Set(
                    (window.GrowWithHRModules?.AssessmentDefinition?.STATES || [])
                        .map((state) => cleanText(state).toLowerCase())
                );
                states.forEach((state, index) => {
                    const field = index === 0
                        ? "primaryState"
                        : `operatingState${index + 1}`;
                    if (!state) {
                        result.valid = false;
                        result.errors[field] = `Enter state or union territory ${index + 1}.`;
                        result.firstInvalidField = result.firstInvalidField || field;
                    } else if (allowedStates.size && !allowedStates.has(state.toLowerCase())) {
                        result.valid = false;
                        result.errors[field] = "Choose a state or union territory from the suggestions.";
                        result.firstInvalidField = result.firstInvalidField || field;
                    }
                });
                const uniqueStates = normaliseStateList(states);
                if (states.filter(Boolean).length === requiredCount && uniqueStates.length !== requiredCount) {
                    result.valid = false;
                    result.errors.operatingStates = "Enter a different state or union territory in each box.";
                    result.firstInvalidField = result.firstInvalidField || "operatingState1";
                }
                result.normalizedAnswers.operatingStates = uniqueStates;
                result.normalizedAnswers.primaryState = uniqueStates.join("; ");
                result.normalizedAnswers.stateCoverage = result.normalizedAnswers.primaryState;
            }

            original.requireWholeNumber(
                result,
                "locations",
                "Enter at least one permanent operating location.",
                1
            );
            original.requireWholeNumber(
                result,
                "countries",
                "Enter at least one country.",
                1
            );
            result.normalizedAnswers.indiaComplianceScopeNotice = INDIA_COMPLIANCE_SCOPE_NOTICE;
            return result;
        }

        return Object.freeze({
            ...original,
            validateLead(lead) {
                const normalizedLead = {
                    ...(lead || {}), name: cleanText(lead?.name), email: cleanText(lead?.email),
                    role: cleanText(lead?.role), marketingConsent: Boolean(lead?.marketingConsent)
                };
                const result = { valid: true, errors: {}, firstInvalidField: "", normalizedLead };
                if (!normalizedLead.name) {
                    result.valid = false; result.errors.name = "Enter your name to continue."; result.firstInvalidField = "name";
                }
                const emailValidation = validateRecipientEmails(normalizedLead.email);
                if (!emailValidation.valid) {
                    result.valid = false; result.errors.email = emailValidation.message;
                    result.firstInvalidField = result.firstInvalidField || "email";
                } else {
                    normalizedLead.email = emailValidation.normalized;
                    normalizedLead.emails = emailValidation.emails;
                }
                return result;
            },
            validatePeopleReadiness,
            validateOperatingFootprint,
            __requestedChangesWrapped: true
        });
    });

    wrapModule("ReportMapper", (original) => {
        if (!original || original.__requestedChangesWrapped) return original;
        const preparePayload = (payload = {}) => ({
            ...payload,
            answers: {
                ...normaliseOperatingFootprintAnswers(payload.answers || {}),
                priorities: expandAllPriorities(payload.answers?.priorities)
            }
        });
        const wrapResult = (result, payload) => {
            const report = addTemplateSampleData(
                result,
                payload?.answers?.industry || payload?.report?.industry
            );
            if (!report || typeof report !== "object") return report;
            const footprint = normaliseOperatingFootprintAnswers(payload?.answers || {});
            return {
                ...report,
                primaryState: cleanText(report.primaryState || footprint.primaryState),
                state: cleanText(report.state || footprint.primaryState),
                operatingStates: footprint.operatingStates,
                operatingStateCount: footprint.operatingStateCount,
                stateCoverage: footprint.stateCoverage,
                indiaComplianceScopeNotice: INDIA_COMPLIANCE_SCOPE_NOTICE,
                complianceScopeNotice: INDIA_COMPLIANCE_SCOPE_NOTICE
            };
        };
        const wrapped = { ...original, __requestedChangesWrapped: true };
        ["buildReportData", "buildRecords", "buildLeadRecord", "buildPdfPayload"].forEach((method) => {
            if (typeof original[method] !== "function") return;
            wrapped[method] = function requestedChangesMapper(payload) {
                const prepared = preparePayload(payload);
                const result = original[method](prepared);
                if (method === "buildRecords" && result && typeof result === "object") {
                    return { ...result, report: wrapResult(result.report, prepared) };
                }
                if (method === "buildPdfPayload" && result && typeof result === "object") {
                    return {
                        ...result,
                        report: wrapResult(result.report, prepared),
                        answers: normaliseOperatingFootprintAnswers(result.answers || prepared.answers)
                    };
                }
                return method === "buildReportData" ? wrapResult(result, prepared) : result;
            };
        });
        return Object.freeze(wrapped);
    });

    function installIndiaComplianceScope() {
        const current = window.GrowWithHRPDF;
        if (
            !current ||
            typeof current.buildAdvisoryModel !== "function" ||
            current.indiaComplianceScope
        ) {
            return;
        }
        const originalBuild = current.buildAdvisoryModel.bind(current);
        window.GrowWithHRPDF = Object.freeze({
            ...current,
            indiaComplianceScope: true,
            buildAdvisoryModel(payload = {}) {
                const model = originalBuild(payload);
                const compliance = [
                    INDIA_COMPLIANCE_SCOPE_NOTICE,
                    ...(Array.isArray(model.compliance) ? model.compliance : [])
                ].filter((value, index, values) => values.indexOf(value) === index);
                return {
                    ...model,
                    indiaComplianceScopeNotice: INDIA_COMPLIANCE_SCOPE_NOTICE,
                    compliance
                };
            }
        });
    }

    function assessmentApplication() {
        return window.executiveAssessment || null;
    }

    function setAssessmentAnswer(name, value) {
        const application = assessmentApplication();
        if (application?.stateModel?.setAnswer) {
            application.stateModel.setAnswer(name, value);
        } else if (application?.answers) {
            application.answers[name] = value;
        }
    }

    function synchroniseOperatingStateFields() {
        const fieldset = document.querySelector('[data-field-wrapper="operatingStateCount"]');
        if (!fieldset) return;

        const checked = fieldset.querySelector('input[name="operatingStateCount"]:checked');
        const count = cleanText(
            checked?.value ||
            assessmentApplication()?.answers?.operatingStateCount ||
            "1"
        );
        const panIndia = count === PAN_INDIA_VALUE;
        const numericCount = panIndia ? 0 : Math.min(MAX_OPERATING_STATES, Math.max(1, Number(count) || 1));
        const states = [];

        for (let index = 1; index <= MAX_OPERATING_STATES; index += 1) {
            const slot = document.querySelector(`[data-operating-state-slot="${index}"]`);
            const separator = document.querySelector(`[data-operating-state-separator="${index}"]`);
            const input = document.getElementById(
                index === 1 ? "primaryState" : `operatingState${index}`
            );
            const visible = !panIndia && index <= numericCount;
            if (slot) slot.hidden = !visible;
            if (input) {
                input.required = visible;
                if (!visible && input.value) {
                    input.value = "";
                    setAssessmentAnswer(`operatingState${index}`, "");
                    if (index === 1) setAssessmentAnswer("primaryState", "");
                }
                if (visible && cleanText(input.value)) {
                    const state = cleanText(input.value);
                    states.push(state);
                    setAssessmentAnswer(`operatingState${index}`, state);
                }
            }
            if (separator) separator.hidden = !(visible && index < numericCount);
        }

        const stateField = document.getElementById("operatingStatesField");
        if (stateField) stateField.hidden = panIndia;

        const uniqueStates = normaliseStateList(states);
        setAssessmentAnswer("operatingStateCount", count);
        setAssessmentAnswer("operatingStates", panIndia ? [] : uniqueStates);
        setAssessmentAnswer("primaryState", panIndia ? PAN_INDIA_LABEL : uniqueStates.join("; "));
        setAssessmentAnswer("stateCoverage", panIndia ? PAN_INDIA_LABEL : uniqueStates.join("; "));
        setAssessmentAnswer("indiaComplianceScopeNotice", INDIA_COMPLIANCE_SCOPE_NOTICE);
    }

    document.addEventListener("change", (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.name === "priorities") {
            const controls = Array.from(document.querySelectorAll('input[name="priorities"]'));
            const allControl = controls.find((control) => control.value === ALL_PRIORITIES_VALUE);
            if (target.value === ALL_PRIORITIES_VALUE && target.checked) {
                controls.forEach((control) => { if (control !== target) control.checked = false; });
            } else if (target.checked && allControl) {
                allControl.checked = false;
            }
            queueMicrotask(() => {
                const selected = controls.filter((control) => control.checked).map((control) => control.value);
                setAssessmentAnswer("priorities", selected);
            });
        }

        if (
            target instanceof HTMLInputElement &&
            (
                target.name === "operatingStateCount" ||
                target.name === "primaryState" ||
                /^operatingState[2-3]$/.test(target.name)
            )
        ) {
            queueMicrotask(synchroniseOperatingStateFields);
        }
    }, true);

    document.addEventListener("input", (event) => {
        const target = event.target;
        if (
            target instanceof HTMLInputElement &&
            (
                target.name === "primaryState" ||
                /^operatingState[2-3]$/.test(target.name)
            )
        ) {
            synchroniseOperatingStateFields();
        }
    }, true);

    function configureEmailInput() {
        const emailInput = document.getElementById("leadEmail");
        const emailLabel = document.querySelector('label[for="leadEmail"]');
        const emailHelp = document.getElementById("leadEmailHelp");
        if (emailInput && !emailInput.dataset.multiEmailConfigured) {
            emailInput.dataset.multiEmailConfigured = "true";
            emailInput.type = "text";
            emailInput.inputMode = "email";
            emailInput.autocomplete = "email";
            emailInput.placeholder = "name@company.com; colleague@company.com";
            emailInput.addEventListener("blur", () => {
                const raw = emailInput.value.trim();
                if (!raw || raw.includes(";")) return;
                if (isValidEmail(raw)) {
                    emailInput.value = `${raw};`;
                    emailInput.dispatchEvent(new Event("input", { bubbles: true }));
                }
            });
            emailInput.addEventListener("focus", () => {
                const raw = emailInput.value.trim();
                if (/^[^;]+;$/.test(raw)) {
                    window.setTimeout(() => emailInput.setSelectionRange(raw.length, raw.length), 0);
                }
            });
        }
        if (emailLabel?.childNodes?.length) emailLabel.childNodes[0].textContent = "Work email address(es) ";
        if (emailHelp) emailHelp.textContent = "Enter up to five email addresses separated by semicolons (;). Each address will receive the advisory.";
    }

    function configureAssessmentEnhancements() {
        installIndiaComplianceScope();
        synchroniseOperatingStateFields();

        const storyContainer = document.getElementById("storyContainer");
        if (storyContainer && !storyContainer.dataset.footprintObserverConfigured) {
            storyContainer.dataset.footprintObserverConfigured = "true";
            const observer = new MutationObserver(() => {
                window.requestAnimationFrame(synchroniseOperatingStateFields);
            });
            observer.observe(storyContainer, { childList: true, subtree: true });
        }
    }

    window.addEventListener("growwithhr:pdf-service-ready", installIndiaComplianceScope);
    window.addEventListener("growwithhr:assessment-modules-ready", configureAssessmentEnhancements);

    document.addEventListener("DOMContentLoaded", () => {
        configureEmailInput();
        configureAssessmentEnhancements();
    });
    if (document.readyState !== "loading") {
        configureEmailInput();
        configureAssessmentEnhancements();
    }

    window.GrowWithHRFootprintEnhancements = Object.freeze({
        version: "1.0.0",
        maxOperatingStates: MAX_OPERATING_STATES,
        panIndiaValue: PAN_INDIA_VALUE,
        indiaComplianceScopeNotice: INDIA_COMPLIANCE_SCOPE_NOTICE,
        normaliseStateList,
        normaliseOperatingFootprintAnswers,
        synchroniseOperatingStateFields
    });
})(window);
