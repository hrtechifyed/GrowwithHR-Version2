/* GrowWithHR v0.22 one-email, two-attachment delivery refinement */
(() => {
    "use strict";

    const base = window.GrowWithHREmail;
    if (!base) throw new Error("GrowWithHR email service must load before dual-edition delivery.");

    const VERSION = "0.22.1-dual-edition-email";
    const MAX_PDF_BYTES = Number(base.config?.maxAttachmentBytes) || 8 * 1024 * 1024;
    let activeRequest = null;
    let lastStatus = null;

    function clean(value, fallback = "") {
        if (value === null || value === undefined) return fallback;
        return String(value).trim() || fallback;
    }

    function removeDataUriPrefix(value) {
        const source = clean(value);
        const commaIndex = source.indexOf(",");
        return source.startsWith("data:") && commaIndex >= 0 ? source.slice(commaIndex + 1) : source;
    }

    function estimateBase64Size(base64) {
        const source = clean(base64).replace(/\s/g, "");
        if (!source) return 0;
        const padding = source.endsWith("==") ? 2 : source.endsWith("=") ? 1 : 0;
        return Math.max(0, Math.floor(source.length * 3 / 4) - padding);
    }

    function serialisePdf(pdf = {}) {
        const base64 = removeDataUriPrefix(pdf.base64 || pdf.dataUri || pdf.data);
        const filename = clean(pdf.filename, `GrowWithHR-${clean(pdf.theme, "Report")}.pdf`);
        const sizeBytes = Number(pdf.sizeBytes) || estimateBase64Size(base64);
        if (!base64) throw new Error(`The ${clean(pdf.theme, "selected")} report was not generated.`);
        if (!sizeBytes) throw new Error(`The ${clean(pdf.theme, "selected")} report is empty.`);
        if (sizeBytes > MAX_PDF_BYTES) throw new Error(`The ${clean(pdf.theme, "selected")} report is too large to email.`);
        return { base64, filename, sizeBytes, theme: clean(pdf.theme).toLowerCase() };
    }

    function dualAttachments(pdf = {}) {
        const candidates = Array.isArray(pdf.emailAttachments)
            ? pdf.emailAttachments
            : Array.isArray(pdf.deliveryAttachments)
                ? pdf.deliveryAttachments
                : Array.isArray(pdf.pdfs)
                    ? pdf.pdfs
                    : [];
        if (candidates.length !== 2) return [];
        const attachments = candidates.map(serialisePdf);
        const themes = attachments.map((item) => item.theme);
        if (!(themes.includes("light") && themes.includes("dark"))) return [];
        return attachments.sort((left, right) => left.theme === "light" ? -1 : right.theme === "light" ? 1 : 0);
    }

    function saveStatus(status) {
        lastStatus = { ...status, updatedAt: new Date().toISOString() };
        try {
            window.dispatchEvent(new CustomEvent("growwithhr:email-delivery", { detail: lastStatus }));
        } catch (error) {
            console.warn("Could not dispatch dual-edition email status.", error);
        }
        return lastStatus;
    }

    async function readJson(response) {
        try { return await response.json(); } catch (_error) { return {}; }
    }

    async function sendOneEmailWithTwoAttachments(action, payload = {}) {
        const validation = typeof base.validateRecipientEmails === "function"
            ? base.validateRecipientEmails(payload.lead?.email || payload.report?.recipientEmail)
            : { valid: true, emails: [clean(payload.lead?.email || payload.report?.recipientEmail)] };
        if (!validation.valid) throw new Error(validation.message || "Enter a valid recipient email address.");

        const attachments = dualAttachments(payload.pdf);
        if (attachments.length !== 2) return null;
        const endpoint = clean(base.config?.endpoint, "/api/send-advisory");
        const deliveries = [];

        for (const email of validation.emails) {
            const lead = { ...(payload.lead || {}), email };
            const report = {
                ...(payload.report || {}),
                recipientEmail: email,
                recipientEmails: validation.emails,
                selectedThemes: ["light", "dark"],
                attachmentDelivery: "two-separate-pdfs-one-email"
            };
            const response = await window.fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-GrowWithHR-Attachment-Count": "2"
                },
                credentials: "omit",
                body: JSON.stringify({
                    action,
                    lead,
                    report,
                    answers: payload.answers || {},
                    pdfs: attachments
                })
            });
            const result = await readJson(response);
            if (!response.ok) throw new Error(result.error || `Email server returned status ${response.status}.`);
            if (result.customerSent !== true && result.customerStatus !== "sent") {
                throw new Error(result.error || "The email server did not confirm delivery.");
            }
            deliveries.push(result);
        }

        return saveStatus({
            ...(deliveries[deliveries.length - 1] || {}),
            ok: true,
            mode: "gmail-two-attachments",
            action,
            customerSent: true,
            customerStatus: "sent",
            recipientCount: validation.emails.length,
            recipients: validation.emails,
            attachmentCount: 2,
            attachmentThemes: ["light", "dark"],
            singleEmailPerRecipient: true
        });
    }

    function sendAdvisory(payload = {}) {
        if (activeRequest) return activeRequest;
        const action = payload.action || "capture";
        const dual = dualAttachments(payload.pdf);
        if (dual.length !== 2) return base.sendAdvisory(payload);
        activeRequest = sendOneEmailWithTwoAttachments(action, payload)
            .catch((error) => {
                const failure = saveStatus({
                    ok: false,
                    mode: "gmail-two-attachments",
                    action,
                    customerStatus: "failed",
                    customerSent: false,
                    attachmentCount: 2,
                    error: clean(error.message, "The Light and Dark reports could not be sent.")
                });
                const deliveryError = new Error(failure.error);
                deliveryError.delivery = failure;
                throw deliveryError;
            })
            .finally(() => { activeRequest = null; });
        return activeRequest;
    }

    function resendCustomer(payload = {}) {
        const dual = dualAttachments(payload.pdf);
        if (dual.length !== 2) return base.resendCustomer(payload);
        return sendOneEmailWithTwoAttachments("resend-customer", payload);
    }

    window.GrowWithHREmail = Object.freeze({
        ...base,
        version: VERSION,
        dualEditionAttachmentMode: "two-separate-pdfs-one-email",
        sendAdvisory,
        resendCustomer,
        getStatus: () => lastStatus || base.getStatus?.() || null,
        clearStatus: () => { lastStatus = null; base.clearStatus?.(); }
    });

    window.GrowWithHRDualEditionEmail = Object.freeze({
        version: VERSION,
        mode: "two-separate-pdfs-one-email",
        dualAttachments
    });
})();
