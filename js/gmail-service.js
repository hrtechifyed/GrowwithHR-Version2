/* ==========================================================
   GrowWithHR Gmail delivery client
   File: js/gmail-service.js

   This file does not contain Gmail credentials.

   It sends the generated PDF and advisory data to the
   server-side Gmail endpoint at /api/send-advisory.
========================================================== */

(function initialiseGrowWithHRGmailService(window) {
    "use strict";

    const STORAGE_KEY =
        "growwithhr-gmail-delivery-v1";

    const DEFAULT_ENDPOINT =
        "/api/send-advisory";

    const MAX_PDF_BYTES =
        8 * 1024 * 1024;

    let activeRequest = null;

    function cleanText(
        value,
        fallback = ""
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value).trim() ||
            fallback;
    }

    function getEndpoint() {
        return (
            document.body?.dataset
                ?.emailEndpoint ||
            window
                .GROWWITHHR_EMAIL_ENDPOINT ||
            DEFAULT_ENDPOINT
        );
    }

    function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            cleanText(value)
        );
    }

    function normaliseBase64(value) {
        const source =
            cleanText(value);

        if (!source) {
            return "";
        }

        const commaIndex =
            source.indexOf(",");

        if (
            source.startsWith("data:") &&
            commaIndex >= 0
        ) {
            return source.slice(
                commaIndex + 1
            );
        }

        return source;
    }

    function estimateBase64Bytes(
        base64
    ) {
        const source =
            cleanText(base64)
                .replace(/\s/g, "");

        if (!source) {
            return 0;
        }

        const padding =
            source.endsWith("==")
                ? 2
                : source.endsWith("=")
                    ? 1
                    : 0;

        return Math.max(
            0,
            Math.floor(
                (source.length * 3) / 4
            ) - padding
        );
    }

    function serialisePdf(pdf) {
        if (!pdf) {
            throw new Error(
                "The advisory PDF was not generated."
            );
        }

        const base64 =
            normaliseBase64(
                pdf.base64 ||
                pdf.dataUri ||
                pdf.data ||
                pdf.attachment
            );

        const filename =
            cleanText(
                pdf.filename,
                "GrowWithHR-Advisory.pdf"
            );

        const sizeBytes =
            Number(pdf.sizeBytes) ||
            estimateBase64Bytes(base64);

        if (!base64) {
            throw new Error(
                "The generated PDF does not contain attachment data."
            );
        }

        if (!sizeBytes) {
            throw new Error(
                "The generated PDF is empty."
            );
        }

        if (
            sizeBytes >
            MAX_PDF_BYTES
        ) {
            throw new Error(
                "The generated PDF is too large to email."
            );
        }

        return {
            base64,
            filename,
            sizeBytes
        };
    }

    function saveStatus(record) {
        const saved = {
            ...record,
            updatedAt:
                new Date().toISOString()
        };

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(saved)
            );
        } catch (error) {
            console.warn(
                "GrowWithHR Gmail: delivery status could not be saved.",
                error
            );
        }

        try {
            window.dispatchEvent(
                new CustomEvent(
                    "growwithhr:email-delivery",
                    {
                        detail: saved
                    }
                )
            );
        } catch (error) {
            console.warn(
                "GrowWithHR Gmail: delivery event could not be dispatched.",
                error
            );
        }

        return saved;
    }

    function saveFailure(
        action,
        error
    ) {
        return saveStatus({
            ok: false,
            mode: "gmail",
            action,
            customerStatus: "failed",
            customerSent: false,
            error:
                cleanText(
                    error?.message,
                    "Email delivery failed."
                )
        });
    }

    async function readJsonResponse(
        response
    ) {
        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    async function postDelivery(
        action,
        payload = {}
    ) {
        const email =
            cleanText(
                payload.lead?.email ||
                payload.report
                    ?.recipientEmail
            ).toLowerCase();

        if (!email) {
            throw new Error(
                "A recipient email address is required."
            );
        }

        if (!isEmail(email)) {
            throw new Error(
                "Please enter a valid recipient email address."
            );
        }

        const pdf =
            serialisePdf(payload.pdf);

        try {
            const response =
                await window.fetch(
                    getEndpoint(),
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "same-origin",

                        body:
                            JSON.stringify({
                                action,

                                lead: {
                                    ...(
                                        payload.lead ||
                                        {}
                                    ),
                                    email
                                },

                                report:
                                    payload.report ||
                                    {},

                                answers:
                                    payload.answers ||
                                    {},

                                pdf
                            })
                    }
                );

            const result =
                await readJsonResponse(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    `Gmail endpoint returned status ${response.status}.`
                );
            }

            return saveStatus({
                ok: true,
                mode: "gmail",
                action,
                ...result
            });
        } catch (error) {
            const failure =
                saveFailure(
                    action,
                    error
                );

            const deliveryError =
                new Error(
                    failure.error
                );

            deliveryError.delivery =
                failure;

            throw deliveryError;
        }
    }

    async function sendAdvisory(
        payload = {}
    ) {
        if (activeRequest) {
            return activeRequest;
        }

        const action =
            payload.action ||
            "capture";

        activeRequest =
            postDelivery(
                action,
                payload
            )
                .finally(() => {
                    activeRequest = null;
                });

        return activeRequest;
    }

    async function resendCustomer(
        payload = {}
    ) {
        return postDelivery(
            "resend-customer",
            payload
        );
    }

    function getStatus() {
        try {
            const raw =
                window.localStorage.getItem(
                    STORAGE_KEY
                );

            return raw
                ? JSON.parse(raw)
                : null;
        } catch (error) {
            console.warn(
                "GrowWithHR Gmail: delivery status could not be read.",
                error
            );

            return null;
        }
    }

    function clearStatus() {
        try {
            window.localStorage.removeItem(
                STORAGE_KEY
            );
        } catch (error) {
            console.warn(
                "GrowWithHR Gmail: delivery status could not be cleared.",
                error
            );
        }
    }

    function initialise() {
        return true;
    }

    function isAvailable() {
        return Boolean(
            window.fetch &&
            getEndpoint()
        );
    }

    window.GrowWithHREmail =
        Object.freeze({
            initialise,
            isAvailable,
            sendAdvisory,
            resendCustomer,
            getStatus,
            clearStatus,

            config:
                Object.freeze({
                    endpoint:
                        getEndpoint(),

                    maxAttachmentBytes:
                        MAX_PDF_BYTES
                })
        });
})(window);
