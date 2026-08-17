"use strict";

const { google } = require("googleapis");

const ROUTE = "/api/report-event";
const MAX_REQUEST_BYTES = 32 * 1024;
const ALLOWED_EVENTS = new Set(["report-generated", "report-viewed", "report-downloaded", "report-emailed"]);
const ALLOWED_REPORT_TYPES = new Set(["organization-structure", "compliance"]);

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

function encodeBase64Url(value) {
    return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function gmailConfigured() {
    return ["GMAIL_USER", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"].every((name) => cleanText(process.env[name]));
}

function gmailClient() {
    const oauth2Client = new google.auth.OAuth2(cleanText(process.env.GOOGLE_CLIENT_ID), cleanText(process.env.GOOGLE_CLIENT_SECRET));
    oauth2Client.setCredentials({ refresh_token: cleanText(process.env.GOOGLE_REFRESH_TOKEN) });
    return google.gmail({ version: "v1", auth: oauth2Client });
}

async function sendInternalNotification(event) {
    const recipient = cleanText(process.env.INTERNAL_NOTIFICATION_EMAIL);
    const sender = cleanText(process.env.GMAIL_USER);
    if (!recipient || !isValidEmail(recipient) || !gmailConfigured() || !isValidEmail(sender)) {
        return { sent: false, reason: "internal-notification-not-configured" };
    }

    const companyName = cleanText(event.companyName, "Unknown company");
    const reportTypeLabel = event.reportType === "organization-structure" ? "Organization Structure Report" : "Compliance Report";
    const eventLabel = event.eventType.replace(/^report-/, "");
    const fields = [
        ["Company", companyName],
        ["User", cleanText(event.userEmail, "Not provided")],
        ["Report ID", cleanText(event.reportId, "Local analysis")],
        ["Report", reportTypeLabel],
        ["File", cleanText(event.filename, "Not applicable")],
        ["Framework", cleanText(event.framework, "Not provided")],
        ["Event", eventLabel],
        ["Time", new Date().toISOString()]
    ];
    const subject = `GrowWithHR report ${eventLabel}: ${companyName}`;
    const text = ["GrowWithHR report activity", "", ...fields.map(([key, value]) => `${key}: ${value}`)].join("\n");
    const rows = fields.map(([key, value]) => `<tr><th align="left" style="padding:7px 10px">${escapeHtml(key)}</th><td style="padding:7px 10px">${escapeHtml(value)}</td></tr>`).join("");
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1f2937"><h2>GrowWithHR report activity</h2><table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-color:#d1d5db">${rows}</table><p style="color:#6b7280;font-size:12px">Only report-delivery metadata is included. Structural findings are not copied into this notification.</p></body></html>`;
    const raw = [
        `From: "GrowWithHR" <${sender}>`,
        `To: ${recipient}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        'Content-Type: multipart/alternative; boundary="gwhrevent"',
        "",
        "--gwhrevent",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(text, "utf8").toString("base64"),
        "",
        "--gwhrevent",
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(html, "utf8").toString("base64"),
        "",
        "--gwhrevent--"
    ].join("\r\n");
    const result = await gmailClient().users.messages.send({
        userId: "me",
        requestBody: { raw: encodeBase64Url(raw) }
    });
    return { sent: true, messageId: result.data?.id || "" };
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The report event is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
            catch (_error) { reject(Object.assign(new Error("The report event contains invalid JSON."), { statusCode: 400 })); }
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
        const input = await readJsonBody(request);
        const eventType = cleanText(input.eventType);
        const reportType = cleanText(input.reportType);
        if (!ALLOWED_EVENTS.has(eventType) || !ALLOWED_REPORT_TYPES.has(reportType)) {
            writeJson(response, 400, { error: "Unsupported report event." });
            return;
        }
        const event = {
            eventType,
            reportType,
            reportId: cleanText(input.reportId).slice(0, 80),
            companyName: cleanText(input.companyName).slice(0, 160),
            userEmail: cleanText(input.userEmail).slice(0, 180),
            filename: cleanText(input.filename).slice(0, 180),
            framework: cleanText(input.framework).slice(0, 220)
        };
        console.log("GrowWithHR report event", { ...event, userEmail: event.userEmail ? "provided" : "not-provided" });
        let notification = { sent: false, reason: "not-attempted" };
        try {
            notification = await sendInternalNotification(event);
        } catch (error) {
            notification = { sent: false, reason: "notification-failed" };
            console.error("GrowWithHR report event notification failed.", error);
        }
        writeJson(response, 202, { ok: true, accepted: true, notification });
    } catch (error) {
        writeJson(response, Number(error.statusCode) || 400, { ok: false, error: cleanText(error.message, "Report event failed.") });
    }
}

function handleReportEventRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (pathname !== ROUTE) return false;
    dispatch(request, response);
    return true;
}

module.exports = {
    handleReportEventRequest,
    sendInternalNotification,
    ALLOWED_EVENTS
};