"use strict";

const crypto = require("crypto");
const { google } = require("googleapis");

const DELIVERY_ROUTE = "/api/organization-report/deliver";
const ACTIVITY_ROUTE = "/api/organization-report/activity";
const ROUTES = new Set([DELIVERY_ROUTE, ACTIVITY_ROUTE]);
const MAX_REQUEST_BYTES = 16 * 1024 * 1024;
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const FOUNDER_NAME = "Anurag Sinha";
const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/in/anuragsinha1009/";

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function isValidEmail(value) {
    return /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(cleanText(value));
}

function safeHeaderValue(value) {
    return cleanText(value).replace(/[\r\n]+/g, " ");
}

function escapeHtml(value) {
    return cleanText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

function safeFilename(value) {
    let filename = cleanText(value, "GrowWithHR-Organization-Structure-Report.pdf")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 160);
    if (!filename.toLowerCase().endsWith(".pdf")) filename += ".pdf";
    return filename;
}

function decodePdf(pdf = {}) {
    const raw = cleanText(pdf.base64 || pdf.dataUri || pdf.data)
        .replace(/^data:application\/pdf;base64,/i, "")
        .replace(/\s/g, "");
    if (!raw || !/^[a-zA-Z0-9+/=]+$/.test(raw)) {
        throw Object.assign(new Error("The Organization Structure PDF is missing or invalid."), { statusCode: 400 });
    }
    const content = Buffer.from(raw, "base64");
    if (!content.length || content.subarray(0, 5).toString("ascii") !== "%PDF-") {
        throw Object.assign(new Error("The generated Organization Structure attachment is not a valid PDF."), { statusCode: 400 });
    }
    if (content.length > MAX_PDF_BYTES) {
        throw Object.assign(new Error("The generated Organization Structure report is larger than the supported delivery limit."), { statusCode: 413 });
    }
    return { filename: safeFilename(pdf.filename), content, contentType: "application/pdf" };
}

function buildRawEmail({ from, to, replyTo, subject, text, html, attachment = null }) {
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
    if (attachment) {
        const filename = safeFilename(attachment.filename);
        lines.push(
            `--${mixedBoundary}`,
            `Content-Type: application/pdf; name="${filename}"`,
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

function requiredEnvironmentVariables() {
    return ["GMAIL_USER", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"];
}

function missingEnvironmentVariables() {
    return requiredEnvironmentVariables().filter((name) => !cleanText(process.env[name]));
}

function gmailClient() {
    const oauth2Client = new google.auth.OAuth2(
        cleanText(process.env.GOOGLE_CLIENT_ID),
        cleanText(process.env.GOOGLE_CLIENT_SECRET)
    );
    oauth2Client.setCredentials({ refresh_token: cleanText(process.env.GOOGLE_REFRESH_TOKEN) });
    return google.gmail({ version: "v1", auth: oauth2Client });
}

async function sendMessage(gmail, message) {
    const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: buildRawEmail(message) }
    });
    return result.data || {};
}

function customerMessage(lead = {}, report = {}, filename = "") {
    const recipientName = cleanText(lead.name, "there");
    const companyName = cleanText(report.companyName || lead.companyName, "your organisation");
    const frameworkName = cleanText(report.frameworkName, "GrowWithHR Organization Structure Assessment Framework");
    const frameworkVersion = cleanText(report.frameworkVersion, "1.1");
    const methodologyUrl = cleanText(
        report.methodologyUrl,
        "https://hrtechifyed.github.io/GrowwithHR-Version2/organization-structure-methodology.html"
    );
    const reportId = cleanText(report.reportId, "Local analysis");
    const subject = `Your GrowWithHR Organization Structure Report for ${companyName}`;
    const text = [
        `Hello ${recipientName},`,
        "",
        `Your GrowWithHR Organization Structure Report for ${companyName} is attached as ${filename}.`,
        "",
        "The report explains the structural findings from the facts you supplied, the GrowWithHR rule used for each finding, and the exact free/public source supporting the underlying organization-design principle.",
        "",
        `Framework used: ${frameworkName} v${frameworkVersion}`,
        `Framework and sources: ${methodologyUrl}`,
        `Report ID: ${reportId}`,
        "",
        "The 12-month section is a deterministic planning scenario based on your assumptions. It is not a forecast. Organization Structure evaluates operating patterns and structure; it does not score people or assess individual capability.",
        "",
        "Warm Wishes,",
        FOUNDER_NAME,
        "Founder, HRTechify",
        FOUNDER_LINKEDIN_URL
    ].join("\n");

    const html = `<!doctype html><html lang="en"><body style="margin:0;background:#05070B;font-family:Inter,Segoe UI,Arial,sans-serif;color:#223347"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border-collapse:separate;border-spacing:0;border-radius:18px;overflow:hidden"><tr><td style="height:7px;background:linear-gradient(90deg,#FFB000,#FF7A00,#FF4D00)"></td></tr><tr><td style="padding:32px 38px;background:#0A1020"><div style="color:#FFB000;font-size:12px;font-weight:800;letter-spacing:.14em">HRTECHIFY · GROWWITHHR</div><h1 style="margin:10px 0 0;color:#fff;font-size:28px;line-height:1.25">Your Organization Structure Report</h1><p style="margin:12px 0 0;color:#CBD5E1;font-size:15px;line-height:1.6">Structural guidance, transparent rules and public source links for ${escapeHtml(companyName)}</p></td></tr><tr><td style="padding:34px 38px 38px"><p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(recipientName)},</p><p style="font-size:16px;line-height:1.7;color:#334155">Your GrowWithHR Organization Structure Report for <strong>${escapeHtml(companyName)}</strong> is attached as one PDF.</p><div style="padding:18px 20px;background:#FFF7ED;border-left:4px solid #FF7A00;color:#334155;line-height:1.65"><strong>What makes the recommendations traceable</strong><br>Each finding shows the company facts used, the GrowWithHR rule that interpreted those facts, and the free/public source supporting the underlying organization-design principle.</div><h2 style="margin:28px 0 10px;color:#0A1020;font-size:21px">Framework used</h2><p style="font-size:15px;line-height:1.7;color:#334155"><strong>${escapeHtml(frameworkName)} v${escapeHtml(frameworkVersion)}</strong><br><a href="${escapeHtml(methodologyUrl)}" style="color:#B45309">View the framework and source library</a><br>Report ID: ${escapeHtml(reportId)}</p><p style="font-size:14px;line-height:1.7;color:#64748B">The 12-month section is a deterministic scenario based on the assumptions supplied; it is not a forecast. This product evaluates organization structure and operating patterns, not individual employee or manager capability.</p><p style="font-size:16px;line-height:1.65">Warm Wishes,<br>${escapeHtml(FOUNDER_NAME)}<br>Founder, HRTechify<br><a href="${FOUNDER_LINKEDIN_URL}">${FOUNDER_LINKEDIN_URL}</a></p></td></tr></table></td></tr></table></body></html>`;
    return { subject, text, html };
}

function activityFields(event = {}) {
    return {
        "Report type": "Organization Structure Report",
        Event: cleanText(event.event, "unknown"),
        Company: cleanText(event.companyName, "Not provided"),
        User: cleanText(event.email, "Not provided"),
        "Report ID": cleanText(event.reportId, "Local analysis"),
        File: cleanText(event.filename, "Not provided"),
        Framework: cleanText(event.framework, "GrowWithHR Organization Structure Assessment Framework"),
        "Framework version": cleanText(event.frameworkVersion, "1.1"),
        "Occurred at": cleanText(event.occurredAt, new Date().toISOString())
    };
}

function internalActivityMessage(event = {}) {
    const fields = activityFields(event);
    const companyName = fields.Company;
    const eventName = fields.Event;
    const rows = Object.entries(fields)
        .map(([key, value]) => `<tr><th align="left" style="padding:8px">${escapeHtml(key)}</th><td style="padding:8px">${escapeHtml(value)}</td></tr>`)
        .join("");
    return {
        subject: `GrowWithHR Organization report ${eventName}: ${companyName}`,
        text: ["GrowWithHR Organization Structure report activity.", "", ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`)].join("\n"),
        html: `<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px;color:#1f2937"><h2>GrowWithHR Organization Structure report activity</h2><p>Operational metadata only; structural findings are not included in this notification.</p><table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-color:#d1d5db">${rows}</table></body></html>`
    };
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The Organization Structure report request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(Object.assign(new Error("The Organization Structure report request contains invalid JSON."), { statusCode: 400 }));
            }
        });
        request.on("error", reject);
    });
}

function writeJson(response, statusCode, payload) {
    if (response.writableEnded) return;
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

async function sendInternalActivity(gmail, sender, event) {
    const internalRecipient = cleanText(process.env.INTERNAL_NOTIFICATION_EMAIL);
    if (!internalRecipient) return { status: "not-configured", sent: false };
    if (!isValidEmail(internalRecipient)) return { status: "invalid-address", sent: false };
    const message = internalActivityMessage(event);
    try {
        const result = await sendMessage(gmail, {
            from: `"GrowWithHR" <${sender}>`,
            to: internalRecipient,
            subject: message.subject,
            text: message.text,
            html: message.html
        });
        return { status: "sent", sent: true, messageId: result.id || "" };
    } catch (error) {
        console.error("Organization Structure internal activity notification failed:", error?.response?.data || error);
        return { status: "failed", sent: false };
    }
}

async function processDelivery(request, response) {
    try {
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }
        const missing = missingEnvironmentVariables();
        if (missing.length) {
            writeJson(response, 503, { error: "Gmail API is not configured on the server.", missingVariables: missing });
            return;
        }
        const body = await readJsonBody(request);
        const lead = body.lead || {};
        const report = body.report || {};
        const recipient = cleanText(lead.email || report.recipientEmail).toLowerCase();
        if (!isValidEmail(recipient)) {
            writeJson(response, 400, { error: "A valid recipient email address is required." });
            return;
        }
        const attachment = decodePdf(body.pdf || {});
        const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
        if (!isValidEmail(sender)) {
            writeJson(response, 503, { error: "GMAIL_USER is not a valid email address." });
            return;
        }
        const gmail = gmailClient();
        const customer = customerMessage(lead, report, attachment.filename);
        const customerResult = await sendMessage(gmail, {
            from: `"GrowWithHR" <${sender}>`,
            to: recipient,
            replyTo: cleanText(process.env.REPLY_TO_EMAIL, sender),
            subject: customer.subject,
            text: customer.text,
            html: customer.html,
            attachment
        });
        const internal = await sendInternalActivity(gmail, sender, {
            event: "emailed",
            companyName: report.companyName || lead.companyName,
            email: recipient,
            reportId: report.reportId,
            filename: attachment.filename,
            framework: report.frameworkName,
            frameworkVersion: report.frameworkVersion,
            occurredAt: new Date().toISOString()
        });
        writeJson(response, 200, {
            ok: true,
            customerSent: true,
            customerMessageId: customerResult.id || "",
            internalStatus: internal.status,
            internalSent: internal.sent,
            attachmentFilename: attachment.filename,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Organization Structure report delivery failed:", error?.response?.data || error);
        writeJson(response, Number(error.statusCode) || 502, {
            error: error?.response?.data?.error?.message || error.message || "The Organization Structure report email could not be sent."
        });
    }
}

async function processActivity(request, response) {
    try {
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }
        const body = await readJsonBody(request);
        const event = body.event || {};
        const allowedEvents = new Set(["downloaded", "generated", "viewed"]);
        if (!allowedEvents.has(cleanText(event.event))) {
            writeJson(response, 400, { error: "Unsupported Organization Structure report activity." });
            return;
        }
        const missing = missingEnvironmentVariables();
        if (missing.length) {
            writeJson(response, 202, { ok: true, internalStatus: "gmail-not-configured" });
            return;
        }
        const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
        if (!isValidEmail(sender)) {
            writeJson(response, 202, { ok: true, internalStatus: "invalid-sender" });
            return;
        }
        const internal = await sendInternalActivity(gmailClient(), sender, event);
        writeJson(response, 200, { ok: true, internalStatus: internal.status, internalSent: internal.sent });
    } catch (error) {
        console.error("Organization Structure report activity failed:", error);
        writeJson(response, 202, { ok: true, internalStatus: "failed" });
    }
}

function handleOrganizationReportRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (!ROUTES.has(pathname)) return false;
    if (pathname === DELIVERY_ROUTE) processDelivery(request, response);
    else processActivity(request, response);
    return true;
}

module.exports = {
    ROUTES,
    DELIVERY_ROUTE,
    ACTIVITY_ROUTE,
    handleOrganizationReportRequest,
    customerMessage,
    internalActivityMessage,
    decodePdf,
    safeFilename
};
