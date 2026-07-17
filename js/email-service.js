/* ==========================================================
   GrowWithHR EmailJS delivery service
   File: js/email-service.js

   Responsibilities:
   - Initialise the existing EmailJS account.
   - Send the HRTechify lead notification.
   - Send the customer advisory email.
   - Attach the generated advisory PDF when available.
   - Prevent duplicate internal lead notifications.
   - Support customer-only resend requests.
========================================================== */

(function initialiseGrowWithHREmailService(window) {
    "use strict";

    const STORAGE_KEY = "growwithhr-emailjs-delivery-v1";

    /* ------------------------------------------------------
       Existing EmailJS configuration from js/pdf.js.

       These values may be overridden before this file loads:

       window.GROWWITHHR_EMAILJS_CONFIG = {
           serviceId: "service_xxx",
           internalTemplateId: "template_xxx",
           customerTemplateId: "template_xxx",
           publicKey: "public_key",
           sendDelayMs: 1100,
           maxAttachmentBytes: 4500000
       };
    ------------------------------------------------------ */

    const DEFAULT_CONFIG = Object.freeze({
        serviceId: "service_as95qfh",
        internalTemplateId: "template_4j8ld17",
        customerTemplateId: "template_9ii4u3e",
        publicKey: "VW0eRAbcJdIvP4Mc3",
        sendDelayMs: 1100,
        maxAttachmentBytes: 4500000
    });

    const configuredValues = window.GROWWITHHR_EMAILJS_CONFIG || {};

    const CONFIG = Object.freeze({
        ...DEFAULT_CONFIG,
        ...configuredValues
    });

    let initialised = false;
    let activeRequest = null;

    function getEmailJS() {
        return window.emailjs || null;
    }

    function hasRequiredConfiguration() {
        return Boolean(
            CONFIG.serviceId &&
            CONFIG.internalTemplateId &&
            CONFIG.customerTemplateId &&
            CONFIG.publicKey
        );
    }

    function initialise() {
        if (initialised) {
            return true;
        }

        const emailjs = getEmailJS();

        if (!emailjs) {
            console.warn("GrowWithHR Email: EmailJS browser SDK is not available.");
            return false;
        }

        if (!hasRequiredConfiguration()) {
            console.error("GrowWithHR Email: EmailJS configuration is incomplete.");
            return false;
        }

        try {
            emailjs.init({
                publicKey: CONFIG.publicKey
            });

            initialised = true;
            return true;
        } catch (error) {
            console.error("GrowWithHR Email: EmailJS initialisation failed.", error);
            return false;
        }
    }

    function cleanText(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }

        return String(value).trim() || fallback;
    }

    function cleanEmail(value) {
        return cleanText(value).toLowerCase();
    }

    function yesNo(value) {
        return value ? "Yes" : "No";
    }

    function listText(value, fallback = "Not provided") {
        if (Array.isArray(value)) {
            const cleaned = value
                .map((item) => cleanText(item))
                .filter(Boolean);

            return cleaned.length ? cleaned.join(", ") : fallback;
        }

        return cleanText(value, fallback);
    }

    function numberText(value, fallback = "Not provided") {
        if (value === 0 || value === "0") {
            return "0";
        }

        return cleanText(value, fallback);
    }

    function formatDate(value) {
        const date = value ? new Date(value) : new Date();

        if (Number.isNaN(date.getTime())) {
            return new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            });
        }

        return date.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function sleep(milliseconds) {
        const duration = Number(milliseconds) || 0;

        if (duration <= 0) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            window.setTimeout(resolve, duration);
        });
    }

    function createId(prefix = "delivery") {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function simpleHash(value) {
        const source = String(value || "");
        let hash = 2166136261;

        for (let index = 0; index < source.length; index += 1) {
            hash ^= source.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return (hash >>> 0).toString(36);
    }

    function createSubmissionFingerprint({ lead = {}, report = {}, answers = {} } = {}) {
        const identity = [
            cleanEmail(lead.email || report.recipientEmail),
            cleanText(lead.companyName || report.companyName).toLowerCase(),
            cleanText(report.industry || lead.industry).toLowerCase(),
            numberText(report.employees || lead.employees, ""),
            cleanText(report.hiringPlans || answers.hiringPlans).toLowerCase(),
            listText(report.priorities || lead.priorities || answers.priorities, "").toLowerCase()
        ].join("|");

        return simpleHash(identity);
    }

    function readDeliveryRecord() {
        try {
            const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
            return parsed && typeof parsed === "object" ? parsed : null;
        } catch (error) {
            console.warn("GrowWithHR Email: saved delivery status could not be read.", error);
            return null;
        }
    }

    function saveDeliveryRecord(record) {
        const nextRecord = {
            ...(record || {}),
            updatedAt: new Date().toISOString()
        };

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecord));
        } catch (error) {
            console.warn("GrowWithHR Email: delivery status could not be saved.", error);
        }

        window.dispatchEvent(new CustomEvent("growwithhr:email-delivery", {
            detail: nextRecord
        }));

        return nextRecord;
    }

    function errorMessage(error) {
        if (!error) {
            return "Unknown EmailJS error";
        }

        return cleanText(
            error.text ||
            error.message ||
            error.statusText ||
            error.status,
            "Email delivery failed"
        );
    }

    function normaliseBase64(value) {
        const source = cleanText(value);

        if (!source) {
            return "";
        }

        const commaIndex = source.indexOf(",");

        if (source.startsWith("data:") && commaIndex >= 0) {
            return source.slice(commaIndex + 1);
        }

        return source;
    }

    function estimateBase64Bytes(base64) {
        const source = cleanText(base64).replace(/\s/g, "");

        if (!source) {
            return 0;
        }

        const padding = source.endsWith("==") ? 2 : source.endsWith("=") ? 1 : 0;
        return Math.max(0, Math.floor((source.length * 3) / 4) - padding);
    }

    function extractPdfAttachment(pdf, companyName) {
        if (!pdf) {
            return {
                base64: "",
                filename: "",
                included: false,
                reason: "not-generated"
            };
        }

        const base64 = normaliseBase64(
            pdf.base64 ||
            pdf.dataUri ||
            pdf.dataURI ||
            pdf.attachment ||
            ""
        );

        const safeCompanyName = cleanText(companyName, "Organisation")
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "Organisation";

        const filename = cleanText(
            pdf.filename,
            `GrowWithHR-Advisory-${safeCompanyName}.pdf`
        );

        if (!base64) {
            return {
                base64: "",
                filename,
                included: false,
                reason: "base64-unavailable"
            };
        }

        const bytes = Number(pdf.sizeBytes) || estimateBase64Bytes(base64);

        if (bytes > Number(CONFIG.maxAttachmentBytes || DEFAULT_CONFIG.maxAttachmentBytes)) {
            console.warn(
                `GrowWithHR Email: PDF attachment omitted because it is ${bytes} bytes.`
            );

            return {
                base64: "",
                filename,
                included: false,
                reason: "attachment-too-large",
                bytes
            };
        }

        return {
            base64,
            filename,
            included: true,
            reason: "included",
            bytes
        };
    }

    function buildCommonTemplateData({ lead = {}, report = {}, answers = {}, deliveryId } = {}) {
        const companyName = cleanText(lead.companyName || report.companyName, "Organisation");
        const userName = cleanText(lead.name || report.recipientName, "there");
        const userEmail = cleanEmail(lead.email || report.recipientEmail);
       const deliveryRequested =
          lead.deliveryRequested !== false &&
          Boolean(userEmail);
        const industry = cleanText(report.industry || lead.industry, "Not provided");
        const priorities = listText(report.priorities || lead.priorities || answers.priorities);
        const expansionPlans = listText(report.expansionPlans || answers.expansionPlans);
        const generatedOn = formatDate(report.generatedAt || lead.capturedAt);

        return {
            /* Existing template compatibility. */
            user_name: userName,
            user_email: userEmail,
            to_name: userName,
            to_email: userEmail,
            reply_to: userEmail,
            report_type: "Executive Advisory Report",
            state: cleanText(report.primaryState || answers.primaryState, "Not provided"),
            industry,
            entity: cleanText(report.entity || answers.entity, "Not provided"),
            employee_count: numberText(report.employees || lead.employees || answers.employees),
            theme: "HRTechify",
            consent: yesNo(deliveryRequested),
            delivery_requested: yesNo(deliveryRequested),
            generated_on: generatedOn,

            /* Expanded customer and lead variables. */
            delivery_id: deliveryId,
            report_reference: deliveryId,
            company_name: companyName,
            organisation_name: companyName,
            lead_name: userName,
            lead_email: userEmail,
            lead_role: cleanText(lead.role || report.recipientRole, "Not provided"),
            industry_id: cleanText(report.industryId || lead.industryId, "Not provided"),
            industry_category: cleanText(report.industryCategory || lead.industryCategory, "Not provided"),
            industry_rule_profile: cleanText(report.industryRuleProfile || lead.industryRuleProfile, "Not provided"),
            business_description: cleanText(report.nature || answers.nature, "Not provided"),
            founded: cleanText(report.founded || answers.founded, "Not provided"),
            funding_stage: cleanText(report.fundingStage || answers.fundingStage, "Not provided"),
            contractor_count: numberText(report.contractWorkers || answers.contractWorkers, "0"),
            intern_count: numberText(report.interns || answers.interns, "0"),
            apprentice_count: numberText(report.apprentices || answers.apprentices, "0"),
            workforce_model: cleanText(report.workModel || answers.workModel, "Not provided"),
            remote_workforce: cleanText(report.remoteWorkforce || answers.remoteWorkforce, "Not provided"),
            primary_location: cleanText(report.primaryState || answers.primaryState, "Not provided"),
            operating_locations: numberText(report.locations || answers.locations),
            operating_countries: numberText(report.countries || answers.countries),
            hiring_plan: cleanText(report.hiringPlans || answers.hiringPlans, "Not provided"),
            expansion_plans: expansionPlans,
            growth_context: cleanText(report.growthContext || answers.growthContext, "Not provided"),
            people_function: cleanText(report.peopleFunction || lead.peopleFunction || answers.peopleFunction, "Not provided"),
            priorities,
            service_consent: "Not separately required",
            marketing_consent: yesNo(lead.marketingConsent || report.marketingConsent),
            captured_on: formatDate(lead.capturedAt),
            source: cleanText(lead.source || report.source, "Executive Advisory Briefing"),

            /* Helpful plain-text summaries for flexible EmailJS templates. */
            customer_summary:
                `${companyName} is a ${industry} organisation with approximately ` +
                `${numberText(report.employees || lead.employees || answers.employees)} employees.`,
            lead_summary:
                `${userName} (${userEmail}) completed the GrowWithHR advisory for ${companyName}. ` +
                `Priority areas: ${priorities}.`
        };
    }

    function buildInternalTemplateData(payload, deliveryId) {
        return {
            ...buildCommonTemplateData({ ...payload, deliveryId }),
            email_type: "internal-lead-notification",
            attachment_status: "Not attached to internal notification",
            advisory_pdf: "",
            advisory_pdf_filename: ""
        };
    }

    function buildCustomerTemplateData(payload, deliveryId) {
        const common = buildCommonTemplateData({ ...payload, deliveryId });
        const attachment = extractPdfAttachment(payload.pdf, common.company_name);

        return {
            ...common,
            email_type: "customer-advisory-delivery",
            attachment_status: attachment.reason,
            advisory_pdf: attachment.base64,
            advisory_pdf_filename: attachment.filename,
            pdf_filename: attachment.filename,
            has_pdf_attachment: yesNo(attachment.included)
        };
    }

    async function sendTemplate(templateId, templateData) {
        if (!initialise()) {
            throw new Error("EmailJS is not available or is not configured.");
        }

        const emailjs = getEmailJS();

        return emailjs.send(
            CONFIG.serviceId,
            templateId,
            templateData
        );
    }

    async function sendInternal(payload, deliveryId) {
        const templateData = buildInternalTemplateData(payload, deliveryId);
        const response = await sendTemplate(CONFIG.internalTemplateId, templateData);

        return {
            status: "sent",
            responseStatus: response?.status || 200,
            responseText: cleanText(response?.text, "OK"),
            sentAt: new Date().toISOString()
        };
    }

    async function sendCustomer(payload, deliveryId) {
        const templateData = buildCustomerTemplateData(payload, deliveryId);
        const response = await sendTemplate(CONFIG.customerTemplateId, templateData);

        return {
            status: "sent",
            responseStatus: response?.status || 200,
            responseText: cleanText(response?.text, "OK"),
            sentAt: new Date().toISOString(),
            attachmentStatus: templateData.attachment_status,
            attachmentFilename: templateData.advisory_pdf_filename || ""
        };
    }

    async function performInitialDelivery(payload = {}) {
        const fingerprint = createSubmissionFingerprint(payload);
        const previous = readDeliveryRecord();
        const sameSubmission = previous?.fingerprint === fingerprint;
        const deliveryId = sameSubmission && previous?.deliveryId
            ? previous.deliveryId
            : createId("advisory");

        const record = {
            ...(sameSubmission ? previous : {}),
            deliveryId,
            fingerprint,
            mode: "emailjs",
            email: cleanEmail(payload.lead?.email || payload.report?.recipientEmail),
            companyName: cleanText(payload.lead?.companyName || payload.report?.companyName),
            internalStatus: sameSubmission ? previous?.internalStatus || "pending" : "pending",
            customerStatus: sameSubmission ? previous?.customerStatus || "pending" : "pending",
            startedAt: sameSubmission && previous?.startedAt
                ? previous.startedAt
                : new Date().toISOString()
        };

        const shouldSendInternal = record.internalStatus !== "sent";
        const shouldSendCustomer = record.customerStatus !== "sent";

        if (!shouldSendInternal && !shouldSendCustomer) {
            return saveDeliveryRecord({
                ...record,
                ok: true,
                duplicateSuppressed: true,
                completedAt: record.completedAt || new Date().toISOString()
            });
        }

        if (shouldSendInternal) {
            try {
                const internalResult = await sendInternal(payload, deliveryId);
                record.internalStatus = internalResult.status;
                record.internalSentAt = internalResult.sentAt;
                record.internalResponseStatus = internalResult.responseStatus;
                record.internalResponseText = internalResult.responseText;
                delete record.internalError;
            } catch (error) {
                record.internalStatus = "failed";
                record.internalError = errorMessage(error);
                record.internalFailedAt = new Date().toISOString();
                console.error("GrowWithHR Email: internal lead email failed.", error);
            }

            saveDeliveryRecord(record);
        }

        if (shouldSendCustomer) {
            if (shouldSendInternal) {
                await sleep(CONFIG.sendDelayMs);
            }

            try {
                const customerResult = await sendCustomer(payload, deliveryId);
                record.customerStatus = customerResult.status;
                record.customerSentAt = customerResult.sentAt;
                record.customerResponseStatus = customerResult.responseStatus;
                record.customerResponseText = customerResult.responseText;
                record.attachmentStatus = customerResult.attachmentStatus;
                record.attachmentFilename = customerResult.attachmentFilename;
                delete record.customerError;
            } catch (error) {
                record.customerStatus = "failed";
                record.customerError = errorMessage(error);
                record.customerFailedAt = new Date().toISOString();
                console.error("GrowWithHR Email: customer advisory email failed.", error);
            }
        }

        const internalSent = record.internalStatus === "sent";
        const customerSent = record.customerStatus === "sent";

        return saveDeliveryRecord({
            ...record,
            ok: internalSent || customerSent,
            internalSent,
            customerSent,
            completedAt: new Date().toISOString()
        });
    }

    async function sendAdvisory(payload = {}) {
        if (activeRequest) {
            return activeRequest;
        }

        activeRequest = performInitialDelivery(payload)
            .finally(() => {
                activeRequest = null;
            });

        return activeRequest;
    }

    async function resendCustomer(payload = {}) {
        const previous = readDeliveryRecord();
        const fingerprint = createSubmissionFingerprint(payload);
        const deliveryId = previous?.fingerprint === fingerprint && previous?.deliveryId
            ? previous.deliveryId
            : createId("advisory");

        try {
            const result = await sendCustomer(payload, deliveryId);

            return saveDeliveryRecord({
                ...(previous || {}),
                deliveryId,
                fingerprint,
                mode: "emailjs",
                ok: true,
                customerStatus: "sent",
                customerSent: true,
                customerSentAt: result.sentAt,
                customerResentAt: result.sentAt,
                customerResponseStatus: result.responseStatus,
                customerResponseText: result.responseText,
                attachmentStatus: result.attachmentStatus,
                attachmentFilename: result.attachmentFilename,
                resendCount: Number(previous?.resendCount || 0) + 1
            });
        } catch (error) {
            const failedRecord = saveDeliveryRecord({
                ...(previous || {}),
                deliveryId,
                fingerprint,
                mode: "emailjs",
                customerStatus: "failed",
                customerSent: false,
                customerError: errorMessage(error),
                customerFailedAt: new Date().toISOString()
            });

            const resendError = new Error(failedRecord.customerError);
            resendError.delivery = failedRecord;
            throw resendError;
        }
    }

    function getStatus() {
        return readDeliveryRecord();
    }

    function clearStatus() {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn("GrowWithHR Email: delivery status could not be cleared.", error);
        }
    }

    window.GrowWithHREmail = Object.freeze({
        initialise,
        isAvailable: () => Boolean(getEmailJS() && hasRequiredConfiguration()),
        sendAdvisory,
        resendCustomer,
        getStatus,
        clearStatus,
        config: Object.freeze({
            serviceId: CONFIG.serviceId,
            internalTemplateId: CONFIG.internalTemplateId,
            customerTemplateId: CONFIG.customerTemplateId,
            sendDelayMs: CONFIG.sendDelayMs,
            maxAttachmentBytes: CONFIG.maxAttachmentBytes
        })
    });

    initialise();
})(window);
