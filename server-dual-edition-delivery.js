"use strict";

const crypto = require("crypto");
const { google } = require("googleapis");

const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_PDF_BYTES = 16 * 1024 * 1024;
const MAX_REQUEST_BYTES = 24 * 1024 * 1024;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestWindows = new Map();

function cleanText(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    return String(value).trim() || fallback;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value));
}

function safeHeaderValue(value) {
    return cleanText(value).replace(/[\r\n]+/g, " ");
}

function encodeMimeHeader(value) {
    return `=?UTF-8?B?${Buffer.from(safeHeaderValue(value), "utf8").toString("base64")}?=`;
}

function wrapBase64(value) {
    return String(value).match(/.{1,76}/g)?.join("\r\n") || "";
}

function encodeBase64Url(value) {
    return Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function escapeHtml(value) {
    return cleanText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeFilename(value) {
    let filename = cleanText(value, "GrowWithHR-Advisory.pdf")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 120);
    if (!filename.toLowerCase().endsWith(".pdf")) filename += ".pdf";
    return filename;
}

function createPdfAttachment(pdf = {}) {
    const rawBase64 = cleanText(pdf.base64 || pdf.dataUri || pdf.data)
        .replace(/^data:application\/pdf;base64,/i, "")
        .replace(/\s/g, "");
    if (!rawBase64) throw new Error("A PDF attachment is missing.");
    if (!/^[a-zA-Z0-9+/=]+$/.test(rawBase64)) throw new Error("A PDF attachment contains invalid data.");
    const content = Buffer.from(rawBase64, "base64");
    if (!content.length) throw new Error("A PDF attachment is empty.");
    if (content.length > MAX_PDF_BYTES) throw new Error("Each PDF attachment must be 8 MB or smaller.");
    if (content.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("An attachment is not a valid PDF document.");
    return { filename: safeFilename(pdf.filename), content, contentType: "application/pdf" };
}

function buildRawEmail({ from, to, replyTo, subject, text, html, attachments = [] }) {
    const mixedBoundary = `mixed_${crypto.randomUUID()}`;
    const alternativeBoundary = `alternative_${crypto.randomUUID()}`;
    const lines = [
        `From: ${safeHeaderValue(from)}`,
        `To: ${safeHeaderValue(to)}`,
        ...(replyTo ? [`Reply-To: ${safeHeaderValue(replyTo)}`] : []),
        `Subject: ${encodeMimeHeader(subject)}`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        "",
        `--${mixedBoundary}`,
        `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
        "",
        `--${alternativeBoundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        wrapBase64(Buffer.from(cleanText(text), "utf8").toString("base64")),
        "",
        `--${alternativeBoundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        wrapBase64(Buffer.from(cleanText(html), "utf8").toString("base64")),
        "",
        `--${alternativeBoundary}--`,
        ""
    ];
    attachments.forEach((attachment) => {
        const filename = safeFilename(attachment.filename);
        lines.push(
            `--${mixedBoundary}`,
            `Content-Type: ${safeHeaderValue(attachment.contentType || "application/pdf")}; name="${filename}"`,
            `Content-Disposition: attachment; filename="${filename}"`,
            "Content-Transfer-Encoding: base64",
            "",
            wrapBase64(attachment.content.toString("base64")),
            ""
        );
    });
    lines.push(`--${mixedBoundary}--`, "");
    return encodeBase64Url(lines.join("\r\n"));
}

function customerMessage(lead = {}, report = {}, filenames = []) {
    const recipientName = cleanText(lead.name, "there");
    const companyName = cleanText(report.companyName || lead.companyName, "your organisation");
    const subject = `Your GrowWithHR Light and Dark reports for ${companyName}`;
    const text = [
        `Hello ${recipientName},`,
        "",
        `Your personalised GrowWithHR reports for ${companyName} are attached in two separate files:`,
        ...filenames.map((filename) => `• ${filename}`),
        "",
        "Both attachments contain the same assessment findings and the same report template. The Light and Dark editions differ only in colour.",
        "",
        "This advisory is general guidance and does not replace legal or other professional advice.",
        "",
        "Warm Wishes,",
        "Anurag Sinha",
        "Founder, HRTechify"
    ].join("\n");
    const items = filenames.map((filename) => `<li style="margin:6px 0;color:#1e293b;font-weight:700">${escapeHtml(filename)}</li>`).join("");
    const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#05070b;font-family:Inter,Segoe UI,Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border-radius:16px;overflow:hidden"><tr><td style="height:7px;background:#f59e0b"></td></tr><tr><td style="padding:32px;background:#0a1020;color:#fff"><div style="color:#fbbf24;font-size:13px;font-weight:800;letter-spacing:.12em">HRTECHIFY · GROWWITHHR</div><h1 style="margin:10px 0 0;font-size:28px">Your Light and Dark reports</h1></td></tr><tr><td style="padding:34px;color:#334155;font-size:16px;line-height:1.7"><p style="margin-top:0">Hello ${escapeHtml(recipientName)},</p><p>Your personalised reports for <strong>${escapeHtml(companyName)}</strong> are included in this one email as two separate PDF attachments.</p><ul style="padding-left:22px">${items}</ul><p>Both reports contain the same assessment findings, sections and layout. Only the colour palette changes.</p><p style="font-size:13px;color:#64748b">This advisory is general guidance and does not replace legal or other professional advice.</p><p style="margin-bottom:0">Warm Wishes,<br><strong>Anurag Sinha</strong><br>Founder, HRTechify</p></td></tr></table></td></tr></table></body></html>`;
    return { subject, text, html };
}

function internalMessage(lead = {}, report = {}) {
    const companyName = cleanText(report.companyName || lead.companyName, "Not provided");
    const fields = {
        Name: cleanText(lead.name, "Not provided"),
        Email: cleanText(lead.email, "Not provided"),
        Company: companyName,
        Industry: cleanText(report.industry || lead.industry, "Not provided"),
        Employees: cleanText(report.employees || lead.employees, "Not provided"),
        "Delivery format": "One email with separate Light and Dark PDF attachments",
        Submitted: new Date().toISOString()
    };
    const text = ["A GrowWithHR advisory assessment was completed.", "", ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`)].join("\n");
    const rows = Object.entries(fields).map(([key, value]) => `<tr><th align="left" style="padding:8px">${escapeHtml(key)}</th><td style="padding:8px">${escapeHtml(value)}</td></tr>`).join("");
    return {
        subject: `New GrowWithHR advisory lead: ${companyName}`,
        text,
        html: `<!doctype html><html><body style="font-family:Arial,sans-serif"><h2>New GrowWithHR advisory assessment</h2><table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}</table></body></html>`
    };
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The email request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(Object.assign(new Error("The email request body is invalid."), { statusCode: 400 }));
            }
        });
        request.on("error", reject);
    });
}

function rateLimitKey(request) {
    return cleanText(request.headers["x-forwarded-for"]).split(",")[0].trim() || request.socket?.remoteAddress || "unknown";
}

function rateLimitAllowed(request) {
    const now = Date.now();
    const key = rateLimitKey(request);
    const recent = (requestWindows.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
    if (recent.length >= MAX_REQUESTS_PER_WINDOW) return false;
    recent.push(now);
    requestWindows.set(key, recent);
    return true;
}

function jsonResponse(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(payload));
}

async function sendMessage(gmailApi, message) {
    const result = await gmailApi.users.messages.send({
        userId: "me",
        requestBody: { raw: buildRawEmail(message) }
    });
    return result.data || {};
}

async function deliver(request, response) {
    try {
        if (!rateLimitAllowed(request)) {
            jsonResponse(response, 429, { error: "Too many email requests. Please try again later." });
            return;
        }
        const body = await readJsonBody(request);
        const action = cleanText(body.action, "capture");
        if (!["capture", "resend-customer"].includes(action)) {
            jsonResponse(response, 400, { error: "The requested email action is invalid." });
            return;
        }
        const lead = body.lead || {};
        const report = body.report || {};
        const recipient = cleanText(lead.email || report.recipientEmail).toLowerCase();
        if (!isValidEmail(recipient)) {
            jsonResponse(response, 400, { error: "A valid recipient email address is required." });
            return;
        }
        const pdfs = Array.isArray(body.pdfs) ? body.pdfs : [];
        if (pdfs.length !== 2) {
            jsonResponse(response, 400, { error: "Exactly two PDF attachments are required for Light and Dark delivery." });
            return;
        }
        const themes = pdfs.map((pdf) => cleanText(pdf.theme).toLowerCase());
        if (!(themes.includes("light") && themes.includes("dark"))) {
            jsonResponse(response, 400, { error: "The two attachments must contain one Light report and one Dark report." });
            return;
        }
        const attachments = pdfs.map(createPdfAttachment);
        const totalBytes = attachments.reduce((sum, attachment) => sum + attachment.content.length, 0);
        if (totalBytes > MAX_TOTAL_PDF_BYTES) {
            jsonResponse(response, 413, { error: "The two PDF attachments are too large to email together." });
            return;
        }
        const required = ["GMAIL_USER", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"];
        const missing = required.filter((name) => !cleanText(process.env[name]));
        if (missing.length) {
            jsonResponse(response, 503, { error: "Gmail API is not configured on the server.", missingVariables: missing });
            return;
        }
        const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
        if (!isValidEmail(sender)) {
            jsonResponse(response, 503, { error: "GMAIL_USER is not a valid email address." });
            return;
        }
        const oauth2Client = new google.auth.OAuth2(
            cleanText(process.env.GOOGLE_CLIENT_ID),
            cleanText(process.env.GOOGLE_CLIENT_SECRET)
        );
        oauth2Client.setCredentials({ refresh_token: cleanText(process.env.GOOGLE_REFRESH_TOKEN) });
        const gmailApi = google.gmail({ version: "v1", auth: oauth2Client });
        const customerEmail = customerMessage(lead, report, attachments.map((attachment) => attachment.filename));
        const customerResult = await sendMessage(gmailApi, {
            from: `"GrowWithHR" <${sender}>`,
            to: recipient,
            replyTo: cleanText(process.env.REPLY_TO_EMAIL, sender),
            subject: customerEmail.subject,
            text: customerEmail.text,
            html: customerEmail.html,
            attachments
        });
        let internalStatus = "not-configured";
        let internalMessageId = "";
        const internalRecipient = cleanText(process.env.INTERNAL_NOTIFICATION_EMAIL);
        if (action !== "resend-customer" && internalRecipient) {
            if (!isValidEmail(internalRecipient)) {
                internalStatus = "invalid-address";
            } else {
                try {
                    const notice = internalMessage(lead, report);
                    const result = await sendMessage(gmailApi, {
                        from: `"GrowWithHR" <${sender}>`,
                        to: internalRecipient,
                        replyTo: recipient,
                        subject: notice.subject,
                        text: notice.text,
                        html: notice.html,
                        attachments: []
                    });
                    internalStatus = "sent";
                    internalMessageId = result.id || "";
                } catch (error) {
                    internalStatus = "failed";
                    console.error("Internal dual-edition notification failed:", error?.response?.data || error);
                }
            }
        }
        jsonResponse(response, 200, {
            ok: true,
            mode: "gmail-api-dual-attachment",
            customerStatus: "sent",
            customerSent: true,
            customerMessageId: customerResult.id || "",
            attachmentCount: attachments.length,
            attachmentFilenames: attachments.map((attachment) => attachment.filename),
            internalStatus,
            internalSent: internalStatus === "sent",
            internalMessageId,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Dual-edition Gmail API delivery failed:", error?.response?.data || error);
        jsonResponse(response, Number(error.statusCode) || 502, {
            error: error?.response?.data?.error?.message || error.message || "The Light and Dark reports could not be sent."
        });
    }
}

function handleDualEditionDeliveryRequest(request, response) {
    const requestPath = cleanText(request.url).split("?")[0];
    const attachmentCount = cleanText(request.headers["x-growwithhr-attachment-count"]);
    if (request.method !== "POST" || requestPath !== "/api/send-advisory" || attachmentCount !== "2") return false;
    deliver(request, response);
    return true;
}

module.exports = { handleDualEditionDeliveryRequest };
