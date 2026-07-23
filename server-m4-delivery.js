"use strict";

const crypto = require("crypto");
const zlib = require("zlib");
const { google } = require("googleapis");

const ROUTE = "/api/send-advisory-v2";
const MAX_REQUEST_BYTES = 32 * 1024 * 1024;
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const GMAIL_SAFE_RAW_ATTACHMENT_BYTES = 18 * 1024 * 1024;
const MAX_REPORT_VARIANTS = 2;
const FOUNDER_NAME = "Anurag Sinha";
const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/in/anuragsinha1009/";

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

function recipientList(lead = {}, report = {}) {
    const supplied = [
        ...(Array.isArray(lead.emails) ? lead.emails : []),
        ...(Array.isArray(report.recipientEmails) ? report.recipientEmails : []),
        ...cleanText(lead.email || report.recipientEmail).split(/[;,]/)
    ];
    const seen = new Set();
    return supplied
        .map((value) => cleanText(value).toLowerCase())
        .filter(isValidEmail)
        .filter((email) => {
            if (seen.has(email)) return false;
            seen.add(email);
            return true;
        })
        .slice(0, 5);
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

function safeFilename(value, extension = ".pdf") {
    let filename = cleanText(value, `GrowWithHR-Advisory${extension}`)
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 120);
    if (!filename.toLowerCase().endsWith(extension)) filename += extension;
    return filename;
}

function reportTheme(value) {
    const theme = cleanText(value, "light").toLowerCase();
    return theme === "dark" ? "dark" : "light";
}

function decodePdf(pdf = {}) {
    const raw = cleanText(pdf.base64 || pdf.dataUri || pdf.data)
        .replace(/^data:application\/pdf;base64,/i, "")
        .replace(/\s/g, "");
    if (!raw || !/^[a-zA-Z0-9+/=]+$/.test(raw)) {
        throw new Error("A generated PDF attachment is missing or invalid.");
    }
    const content = Buffer.from(raw, "base64");
    if (!content.length || content.subarray(0, 5).toString("ascii") !== "%PDF-") {
        throw new Error("A generated attachment is not a valid PDF document.");
    }
    if (content.length > MAX_PDF_BYTES) {
        throw new Error("One generated PDF is larger than the supported delivery limit.");
    }
    const theme = reportTheme(pdf.theme);
    return {
        filename: safeFilename(pdf.filename || `GrowWithHR-Advisory-${theme}.pdf`),
        content,
        contentType: "application/pdf",
        theme
    };
}

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1) {
            value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
        }
        table[index] = value >>> 0;
    }
    return table;
})();

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time, day };
}

function createZip(entries) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const timestamp = dosDateTime();

    entries.forEach((entry) => {
        const name = Buffer.from(safeFilename(entry.filename), "utf8");
        const source = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
        const compressed = zlib.deflateRawSync(source, { level: 9 });
        const checksum = crc32(source);

        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0);
        local.writeUInt16LE(20, 4);
        local.writeUInt16LE(0x0800, 6);
        local.writeUInt16LE(8, 8);
        local.writeUInt16LE(timestamp.time, 10);
        local.writeUInt16LE(timestamp.day, 12);
        local.writeUInt32LE(checksum, 14);
        local.writeUInt32LE(compressed.length, 18);
        local.writeUInt32LE(source.length, 22);
        local.writeUInt16LE(name.length, 26);
        local.writeUInt16LE(0, 28);
        localParts.push(local, name, compressed);

        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0);
        central.writeUInt16LE(20, 4);
        central.writeUInt16LE(20, 6);
        central.writeUInt16LE(0x0800, 8);
        central.writeUInt16LE(8, 10);
        central.writeUInt16LE(timestamp.time, 12);
        central.writeUInt16LE(timestamp.day, 14);
        central.writeUInt32LE(checksum, 16);
        central.writeUInt32LE(compressed.length, 20);
        central.writeUInt32LE(source.length, 24);
        central.writeUInt16LE(name.length, 28);
        central.writeUInt16LE(0, 30);
        central.writeUInt16LE(0, 32);
        central.writeUInt16LE(0, 34);
        central.writeUInt16LE(0, 36);
        central.writeUInt32LE(0, 38);
        central.writeUInt32LE(offset, 42);
        centralParts.push(central, name);
        offset += local.length + name.length + compressed.length;
    });

    const centralDirectory = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(offset, 16);
    end.writeUInt16LE(0, 20);
    return Buffer.concat([...localParts, centralDirectory, end]);
}

function attachmentsForPdfs(pdfs, companyName) {
    const total = pdfs.reduce((sum, pdf) => sum + pdf.content.length, 0);
    if (total <= GMAIL_SAFE_RAW_ATTACHMENT_BYTES) {
        return { attachments: pdfs, bundledAsZip: false };
    }
    const zip = createZip(pdfs);
    if (zip.length > GMAIL_SAFE_RAW_ATTACHMENT_BYTES) {
        throw new Error("The combined report package remains too large for Gmail after ZIP compression.");
    }
    return {
        bundledAsZip: true,
        attachments: [{
            filename: safeFilename(`GrowWithHR-Advisory-${cleanText(companyName, "Organisation")}`, ".zip"),
            content: zip,
            contentType: "application/zip"
        }]
    };
}

function buildRawEmail({ from, to, bcc = [], replyTo, subject, text, html, attachments = [] }) {
    const mixedBoundary = `mixed_${crypto.randomUUID()}`;
    const alternativeBoundary = `alternative_${crypto.randomUUID()}`;
    const lines = [
        `From: ${safeHeaderValue(from)}`,
        `To: ${safeHeaderValue(to)}`,
        ...(bcc.length ? [`Bcc: ${safeHeaderValue(bcc.join(", "))}`] : []),
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
        const extension = attachment.contentType === "application/zip" ? ".zip" : ".pdf";
        const filename = safeFilename(attachment.filename, extension);
        lines.push(
            `--${mixedBoundary}`,
            `Content-Type: ${safeHeaderValue(attachment.contentType)}; name="${filename}"`,
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

function createCustomerEmail({ lead, report, themes, bundledAsZip }) {
    const recipientName = cleanText(lead.name, "there");
    const companyName = cleanText(report.companyName || lead.companyName, "your organisation");
    const versions = themes.length === 2 ? "light and dark versions" : `${themes[0]} version`;
    const attachmentSentence = bundledAsZip
        ? `The ${versions} are included together in one ZIP attachment.`
        : `The ${versions} are attached together to this email.`;
    const subject = `Your GrowWithHR Executive Advisory for ${companyName}`;
    const text = [
        `Hello ${recipientName},`,
        "",
        "Thank you for completing the GrowWithHR Executive Advisory assessment.",
        attachmentSentence,
        "",
        "Your report includes an executive summary, law-by-law threshold reasoning, evidence completeness, missing information, upcoming triggers and a practical implementation roadmap.",
        "",
        "This advisory supports leadership discussion and is not legal certification. Confirm current requirements with qualified advisers and official sources.",
        "",
        "Warm Wishes,",
        FOUNDER_NAME,
        "Founder, HRTechify",
        FOUNDER_LINKEDIN_URL
    ].join("\n");
    const html = `<!doctype html>
<html lang="en"><body style="margin:0;background:#07101f;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 14px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="background:#0a1830;padding:32px 38px;border-top:6px solid #f59e0b"><div style="color:#f59e0b;font-size:13px;font-weight:800;letter-spacing:.14em">HRTECHIFY</div><h1 style="margin:10px 0 0;color:#fff;font-size:29px">Your GrowWithHR Executive Advisory</h1><p style="color:#cbd5e1;line-height:1.6">Explainable people and compliance guidance for ${escapeHtml(companyName)}</p></td></tr>
<tr><td style="padding:36px 38px"><p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(recipientName)},</p><p style="font-size:16px;line-height:1.7;color:#334155">Thank you for completing the GrowWithHR Executive Advisory assessment. ${escapeHtml(attachmentSentence)}</p><div style="padding:18px 20px;background:#fff7ed;border:1px solid #fed7aa;border-left:5px solid #f59e0b;border-radius:12px;color:#334155;line-height:1.65">Your report includes an executive summary, law-by-law threshold reasoning, evidence completeness, missing information, upcoming triggers and a practical implementation roadmap.</div><p style="font-size:14px;line-height:1.7;color:#64748b">This advisory supports leadership discussion and is not legal certification. Confirm current requirements with qualified advisers and official sources.</p><p style="font-size:16px;line-height:1.65">Warm Wishes,<br><span>${escapeHtml(FOUNDER_NAME)}</span><br>Founder, HRTechify<br><a href="${FOUNDER_LINKEDIN_URL}">${FOUNDER_LINKEDIN_URL}</a></p></td></tr>
</table></td></tr></table></body></html>`;
    return { subject, text, html };
}

function createInternalEmail({ lead, report, themes, recipients, bundledAsZip }) {
    const companyName = cleanText(report.companyName || lead.companyName, "Not provided");
    const versionText = themes.length === 2 ? "both light and dark" : themes[0];
    const fields = {
        Name: cleanText(lead.name, "Not provided"),
        Recipients: recipients.join(", "),
        Company: companyName,
        "Report versions delivered": versionText,
        Packaging: bundledAsZip ? "ZIP attachment" : "PDF attachment(s)",
        Submitted: new Date().toISOString()
    };
    const text = [
        "A GrowWithHR Executive Advisory email was sent.",
        "",
        ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`)
    ].join("\n");
    const rows = Object.entries(fields)
        .map(([key, value]) => `<tr><th align="left" style="padding:8px">${escapeHtml(key)}</th><td style="padding:8px">${escapeHtml(value)}</td></tr>`)
        .join("");
    return {
        subject: `GrowWithHR report delivered: ${companyName} (${versionText})`,
        text,
        html: `<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;padding:24px;color:#1f2937"><h2>GrowWithHR report delivery</h2><table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-color:#d1d5db">${rows}</table></body></html>`
    };
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
    return result.data;
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(new Error("The report delivery request is too large."));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(new Error("The report delivery request contains invalid JSON."));
            }
        });
        request.on("error", reject);
    });
}

function writeJson(response, status, value) {
    if (response.writableEnded) return;
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(value));
}

async function processDelivery(request, response) {
    try {
        if (request.method === "OPTIONS") {
            response.statusCode = 204;
            response.end();
            return;
        }
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }
        const missing = missingEnvironmentVariables();
        if (missing.length) {
            writeJson(response, 503, { error: "Gmail API is not configured on the server.", missingVariables: missing });
            return;
        }
        const body = await readRequestBody(request);
        const action = cleanText(body.action, "capture");
        if (!["capture", "resend-customer"].includes(action)) {
            writeJson(response, 400, { error: "The requested email action is invalid." });
            return;
        }
        const lead = body.lead || {};
        const report = body.report || {};
        const recipients = recipientList(lead, report);
        if (!recipients.length) {
            writeJson(response, 400, { error: "At least one valid recipient email address is required." });
            return;
        }
        const sourcePdfs = Array.isArray(body.pdfs) ? body.pdfs : body.pdf ? [body.pdf] : [];
        if (!sourcePdfs.length || sourcePdfs.length > MAX_REPORT_VARIANTS) {
            writeJson(response, 400, { error: "One or two report PDF variants are required." });
            return;
        }
        const pdfs = sourcePdfs.map(decodePdf);
        const themes = [...new Set(pdfs.map((pdf) => pdf.theme))];
        const companyName = cleanText(report.companyName || lead.companyName, "Organisation");
        const packageResult = attachmentsForPdfs(pdfs, companyName);
        const sender = cleanText(process.env.GMAIL_USER).toLowerCase();
        if (!isValidEmail(sender)) {
            writeJson(response, 503, { error: "GMAIL_USER is not a valid email address." });
            return;
        }
        const gmail = gmailClient();
        const customerEmail = createCustomerEmail({
            lead,
            report,
            themes,
            bundledAsZip: packageResult.bundledAsZip
        });
        const customerResult = await sendMessage(gmail, {
            from: `"GrowWithHR" <${sender}>`,
            to: recipients[0],
            bcc: recipients.slice(1),
            replyTo: cleanText(process.env.REPLY_TO_EMAIL, sender),
            subject: customerEmail.subject,
            text: customerEmail.text,
            html: customerEmail.html,
            attachments: packageResult.attachments
        });

        let internalStatus = "not-configured";
        let internalMessageId = "";
        const internalRecipient = cleanText(process.env.INTERNAL_NOTIFICATION_EMAIL);
        if (internalRecipient) {
            if (!isValidEmail(internalRecipient)) {
                internalStatus = "invalid-address";
            } else {
                try {
                    const internalEmail = createInternalEmail({
                        lead,
                        report,
                        themes,
                        recipients,
                        bundledAsZip: packageResult.bundledAsZip
                    });
                    const internalResult = await sendMessage(gmail, {
                        from: `"GrowWithHR" <${sender}>`,
                        to: internalRecipient,
                        replyTo: recipients[0],
                        subject: internalEmail.subject,
                        text: internalEmail.text,
                        html: internalEmail.html,
                        attachments: []
                    });
                    internalStatus = "sent";
                    internalMessageId = internalResult.id || "";
                } catch (error) {
                    internalStatus = "failed";
                    console.error("M4 internal delivery notification failed:", error?.response?.data || error);
                }
            }
        }

        writeJson(response, 200, {
            ok: true,
            mode: "gmail-api-unified-m4",
            customerStatus: "sent",
            customerSent: true,
            customerMessageId: customerResult.id || "",
            recipientCount: recipients.length,
            reportThemes: themes,
            bundledAsZip: packageResult.bundledAsZip,
            attachmentFilenames: packageResult.attachments.map((attachment) => attachment.filename),
            internalStatus,
            internalSent: internalStatus === "sent",
            internalMessageId,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("M4 unified Gmail delivery failed:", error?.response?.data || error);
        writeJson(response, 502, {
            error: error?.response?.data?.error?.message || error.message || "The advisory email could not be sent."
        });
    }
}

function handleM4DeliveryRequest(request, response) {
    const path = cleanText(request.url).split("?")[0];
    if (path !== ROUTE) return false;
    processDelivery(request, response);
    return true;
}

module.exports = {
    ROUTE,
    handleM4DeliveryRequest,
    createZip,
    decodePdf,
    attachmentsForPdfs,
    createCustomerEmail,
    createInternalEmail,
    recipientList
};
