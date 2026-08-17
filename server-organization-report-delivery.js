"use strict";

const crypto = require("crypto");
const { google } = require("googleapis");

const ROUTE = "/api/send-organization-report";
const MAX_REQUEST_BYTES = 12 * 1024 * 1024;
const MAX_PDF_BYTES = 8 * 1024 * 1024;
const FOUNDER_NAME = "Anurag Sinha";
const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/in/anuragsinha1009/";
const DEFAULT_METHODOLOGY_URL = "https://hrtechifyed.github.io/GrowwithHR-Version2/organization-structure-methodology.html";

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function escapeHtml(value) {
    return cleanText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isValidEmail(value) {
    return /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(cleanText(value));
}

function safeHeaderValue(value) {
    return cleanText(value).replace(/[\r\n]+/g, " ");
}

function encodeMimeHeader(value) {
    return `=?UTF-8?B?${Buffer.from(safeHeaderValue(value), "utf8").toString("base64")}?=`;
}

function encodeBase64Url(value) {
    return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function wrapBase64(value) {
    return String(value).match(/.{1,76}/g)?.join("\r\n") || "";
}

function safeFilename(value) {
    let filename = cleanText(value, "GrowWithHR-Organization-Structure-Report.pdf")
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
    if (!rawBase64 || !/^[a-zA-Z0-9+/=]+$/.test(rawBase64)) {
        throw Object.assign(new Error("A valid Organization Structure PDF is required."), { statusCode: 400 });
    }
    const content = Buffer.from(rawBase64, "base64");
    if (!content.length || content.length > MAX_PDF_BYTES || content.subarray(0, 5).toString("ascii") !== "%PDF-") {
        throw Object.assign(new Error("The Organization Structure PDF is invalid or too large."), { statusCode: 400 });
    }
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
    for (const attachment of attachments) {
        const filename = safeFilename(attachment.filename);
        lines.push(
            `--${mixedBoundary}`,
            `Content-Type: ${attachment.contentType}; name="${filename}"`,
            `Content-Disposition: attachment; filename="${filename}"`,
            "Content-Transfer-Encoding: base64",
            "",
            wrapBase64(attachment.content.toString("base64")),
            ""
        );
    }
    lines.push(`--${mixedBoundary}--`, "");
    return encodeBase64Url(lines.join("\r\n"));
}

function customerEmail({ recipientName, companyName, reportId, frameworkName, frameworkVersion, methodologyUrl }) {
    const subject = `Your GrowWithHR Organization Structure Report for ${companyName}`;
    const frameworkLabel = `${frameworkName} v${frameworkVersion}`;
    const text = [
        `Hello ${recipientName || "there"},`,
        "",
        `Your GrowWithHR Organization Structure Report for ${companyName} is attached as a PDF.`,
        reportId ? `Report ID: ${reportId}` : "",
        "",
        "The report includes:",
        "• Executive Overview — the main structural constraint and immediate priorities",
        "• Detailed Findings — what triggered each result, what to do next, and the source supporting the organization-design principle",
        "• 12-Month Growth Scenario — how the current structure may behave if planned headcount changes while manager count stays unchanged",
        "",
        `Framework used: ${frameworkLabel}`,
        `Methodology and public sources: ${methodologyUrl}`,
        "",
        "GrowWithHR separates public source evidence from its own deterministic rule. Public sources support the principle; GrowWithHR is responsible for any disclosed prototype threshold or interpretation.",
        "",
        "The report evaluates organizational structure and operating patterns. It does not assess individual capability, recommend dismissals, determine compensation, or provide legal advice.",
        "",
        "Warm Wishes,",
        FOUNDER_NAME,
        "Founder, HRTechify",
        FOUNDER_LINKEDIN_URL
    ].filter(Boolean).join("\n");

    const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#05070B;font-family:Inter,'Segoe UI',Arial,sans-serif;color:#0F172A"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#05070B"><tr><td align="center" style="padding:36px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="height:7px;background:linear-gradient(90deg,#FFB000,#FF7A00 55%,#FF4D00)"></td></tr><tr><td style="padding:32px 38px;background:#0A1020"><p style="margin:0 0 10px;color:#FFB000;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase">HRTechify · GrowWithHR</p><h1 style="margin:0;color:#fff;font-size:30px;line-height:1.25">Your Organization Structure Report</h1><p style="margin:12px 0 0;color:#CBD5E1;line-height:1.6">Structural guidance for ${escapeHtml(companyName)}</p></td></tr><tr><td style="padding:36px 38px"><p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(recipientName || "there")},</p><p style="font-size:16px;line-height:1.7;color:#334155">Your personalised <strong>GrowWithHR Organization Structure Report</strong> is attached as a PDF.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;background:#FFF7ED;border:1px solid #FED7AA;border-left:5px solid #FF7A00;border-radius:12px"><tr><td style="padding:18px 20px"><strong style="color:#9A3412">PDF attached</strong><p style="margin:5px 0 0;color:#431407">${escapeHtml(companyName)}${reportId ? ` · ${escapeHtml(reportId)}` : ""}</p></td></tr></table><h2 style="color:#0A1020">What you will find inside</h2><ul style="color:#334155;line-height:1.75"><li>Executive Overview with the primary structural constraint and priorities</li><li>Detailed Findings with facts used, GrowWithHR rule basis and direct public source links</li><li>12-Month Growth Scenario based on the assumptions you supplied</li></ul><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0;background:#0A1020;border-radius:12px"><tr><td style="padding:20px 22px"><p style="margin:0 0 6px;color:#FFB000;font-weight:800">FRAMEWORK USED</p><p style="margin:0 0 10px;color:#fff">${escapeHtml(frameworkLabel)}</p><a href="${escapeHtml(methodologyUrl)}" style="color:#FFB000">View the free methodology and public sources</a></td></tr></table><p style="font-size:14px;line-height:1.7;color:#64748B">GrowWithHR separates public source evidence from its own deterministic rule. Public sources support the principle; GrowWithHR is responsible for disclosed prototype thresholds and interpretations. This report evaluates structure, not individual capability, and is not legal advice.</p><p style="font-size:16px;line-height:1.7;color:#334155">Warm Wishes,<br><strong>${escapeHtml(FOUNDER_NAME)}</strong><br>Founder, HRTechify<br><a href="${FOUNDER_LINKEDIN_URL}">${FOUNDER_LINKEDIN_URL}</a></p></td></tr></table></td></tr></table></body></html>`;
    return { subject, text, html };
}

function internalEmail({ recipient, companyName, reportId, filename, frameworkName, frameworkVersion }) {
    const subject = `GrowWithHR Organization Structure report delivered: ${companyName}`;
    const text = [
        "A GrowWithHR Organization Structure Report was emailed to a user.",
        "",
        `Company: ${companyName}`,
        `Recipient: ${recipient}`,
        `Report ID: ${reportId || "Local analysis"}`,
        "Report type: Organization Structure Report",
        `Attachment: ${filename}`,
        `Framework: ${frameworkName} v${frameworkVersion}`,
        `Event: emailed`,
        `Time: ${new Date().toISOString()}`
    ].join("\n");
    return { subject, text, html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>` };
}

function gmailConfigured() {
    return ["GMAIL_USER", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"].every((name) => cleanText(process.env[name]));
}

function gmailClient() {
    const oauth2Client = new google.auth.OAuth2(cleanText(process.env.GOOGLE_CLIENT_ID), cleanText(process.env.GOOGLE_CLIENT_SECRET));
    oauth2Client.setCredentials({ refresh_token: cleanText(process.env.GOOGLE_REFRESH_TOKEN) });
    return google.gmail({ version: "v1", auth: oauth2Client });
}

async function sendMessage(message) {
    const result = await gmailClient().users.messages.send({ userId: "me", requestBody: { raw: buildRawEmail(message) } });
    return result.data || {};
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The Organization Structure delivery request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
            catch (_error) { reject(Object.assign(new Error("The delivery request contains invalid JSON."), { statusCode: 400 })); }
        });
        request.on("error", reject);
    });
}

function writeJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

async function dispatch(request, response) {
    try {
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }
        if (!gmailConfigured()) {
            writeJson(response, 503, { error: "Gmail API is not configured on the server." });
            return;
        }
        const input = await readJsonBody(request);
        const recipient = cleanText(input.recipientEmail).toLowerCase();
        if (!isValidEmail(recipient)) throw Object.assign(new Error("A valid recipient email address is required."), { statusCode: 400 });
        const companyName = cleanText(input.companyName, "your organisation");
        const reportId = cleanText(input.reportId);
        const frameworkName = cleanText(input.frameworkName, "GrowWithHR Organization Structure Assessment Framework");
        const frameworkVersion = cleanText(input.frameworkVersion, "1.1.0");
        const methodologyUrl = cleanText(input.methodologyUrl, DEFAULT_METHODOLOGY_URL);
        const attachment = createPdfAttachment(input.pdf || {});
        const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
        if (!isValidEmail(sender)) throw Object.assign(new Error("GMAIL_USER is not a valid email address."), { statusCode: 503 });

        const message = customerEmail({
            recipientName: cleanText(input.recipientName),
            companyName,
            reportId,
            frameworkName,
            frameworkVersion,
            methodologyUrl
        });
        const customerResult = await sendMessage({
            from: `"GrowWithHR" <${sender}>`,
            to: recipient,
            replyTo: cleanText(process.env.REPLY_TO_EMAIL, sender),
            subject: message.subject,
            text: message.text,
            html: message.html,
            attachments: [attachment]
        });

        let internalStatus = "not-configured";
        const internalRecipient = cleanText(process.env.INTERNAL_NOTIFICATION_EMAIL);
        if (internalRecipient && isValidEmail(internalRecipient)) {
            const internal = internalEmail({ recipient, companyName, reportId, filename: attachment.filename, frameworkName, frameworkVersion });
            try {
                await sendMessage({
                    from: `"GrowWithHR" <${sender}>`,
                    to: internalRecipient,
                    replyTo: recipient,
                    subject: internal.subject,
                    text: internal.text,
                    html: internal.html
                });
                internalStatus = "sent";
            } catch (error) {
                internalStatus = "failed";
                console.error("Organization Structure internal delivery notification failed.", error);
            }
        }

        writeJson(response, 200, {
            ok: true,
            customerSent: true,
            customerMessageId: customerResult.id || "",
            internalStatus,
            attachmentFilename: attachment.filename,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        writeJson(response, Number(error.statusCode) || 502, {
            ok: false,
            error: cleanText(error.message, "The Organization Structure report could not be emailed.")
        });
    }
}

function handleOrganizationReportDeliveryRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (pathname !== ROUTE) return false;
    dispatch(request, response);
    return true;
}

module.exports = {
    handleOrganizationReportDeliveryRequest,
    customerEmail,
    internalEmail,
    createPdfAttachment
};