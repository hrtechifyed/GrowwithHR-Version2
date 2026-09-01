"use strict";

/* Server-side authentication gate for complete personalised report delivery.
 * The browser sends a Supabase access token; this module validates it against
 * the configured Supabase Auth project before delegating to the existing Gmail
 * delivery handlers. It also binds every requested recipient to the signed-in
 * work email so an authenticated caller cannot redirect another customer's PDF.
 */

const { PassThrough } = require("stream");

const DELIVERY_PATHS = new Set([
    "/api/send-advisory",
    "/api/send-advisory-v2",
    "/api/organization-report/deliver"
]);
const MAX_GATE_BODY_BYTES = 16 * 1024 * 1024;

function cleanText(value) {
    return String(value || "").trim();
}

function writeJson(response, statusCode, payload) {
    if (response.writableEnded) return;
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function bearerToken(request) {
    const authorization = cleanText(request.headers.authorization);
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return cleanText(match?.[1]);
}

async function verifyCustomer(request) {
    const token = bearerToken(request);
    if (!token) {
        throw Object.assign(new Error("Sign in is required before the complete report can be emailed."), { statusCode: 401 });
    }
    const supabaseUrl = cleanText(process.env.SUPABASE_URL).replace(/\/+$/, "");
    const serverKey = cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!supabaseUrl || !serverKey) {
        throw Object.assign(new Error("Customer authentication is not configured on the report server."), { statusCode: 503 });
    }
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: "GET",
        headers: {
            apikey: serverKey,
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        },
        cache: "no-store"
    });
    let body = {};
    try { body = await response.json(); } catch (_error) {}
    if (!response.ok || !body?.id || !cleanText(body.email)) {
        throw Object.assign(new Error("Your report-access session is invalid or expired. Sign in again."), { statusCode: 401 });
    }
    return { id: cleanText(body.id), email: cleanText(body.email).toLowerCase() };
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_GATE_BODY_BYTES) {
                reject(Object.assign(new Error("The authenticated report-delivery request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => resolve(Buffer.concat(chunks)));
        request.on("error", reject);
    });
}

function parseBody(rawBody) {
    try {
        return JSON.parse(rawBody.toString("utf8") || "{}");
    } catch (_error) {
        throw Object.assign(new Error("The report-delivery request contains invalid JSON."), { statusCode: 400 });
    }
}

function emailCandidates(body = {}) {
    const lead = body.lead || {};
    const report = body.report || {};
    const values = [
        lead.email,
        ...(Array.isArray(lead.emails) ? lead.emails : []),
        report.recipientEmail,
        ...(Array.isArray(report.recipientEmails) ? report.recipientEmails : [])
    ];
    const seen = new Set();
    return values
        .flatMap((value) => cleanText(value).split(/[;,]/))
        .map((value) => cleanText(value).toLowerCase())
        .filter(Boolean)
        .filter((email) => {
            if (seen.has(email)) return false;
            seen.add(email);
            return true;
        });
}

function ensureRecipientOwnership(body, customerEmail) {
    const authenticatedEmail = cleanText(customerEmail).toLowerCase();
    if (!authenticatedEmail) {
        throw Object.assign(new Error("The authenticated report-delivery email is unavailable."), { statusCode: 401 });
    }
    const recipients = emailCandidates(body);
    if (!recipients.length) {
        throw Object.assign(new Error("The signed-in work email is required as the report recipient."), { statusCode: 400 });
    }
    const mismatched = recipients.find((email) => email !== authenticatedEmail);
    if (mismatched) {
        throw Object.assign(new Error("The complete report can only be emailed to the signed-in work email."), { statusCode: 403 });
    }
    return recipients;
}

function replayRequest(originalRequest, rawBody, customer) {
    const replay = new PassThrough();
    replay.method = originalRequest.method;
    replay.url = originalRequest.url;
    replay.headers = { ...originalRequest.headers };
    replay.growwithhrCustomer = customer;
    replay.httpVersion = originalRequest.httpVersion;
    replay.httpVersionMajor = originalRequest.httpVersionMajor;
    replay.httpVersionMinor = originalRequest.httpVersionMinor;
    replay.end(rawBody);
    return replay;
}

function handleCustomerReportGate(request, response, handlers = {}) {
    const requestPath = cleanText(request.url).split("?")[0];
    if (!DELIVERY_PATHS.has(requestPath)) return false;
    if (request.method !== "POST") return false;

    verifyCustomer(request)
        .then(async (customer) => {
            const rawBody = await readBody(request);
            const body = parseBody(rawBody);
            ensureRecipientOwnership(body, customer.email);
            const authenticatedRequest = replayRequest(request, rawBody, customer);
            if (requestPath === "/api/organization-report/deliver") {
                if (typeof handlers.organization === "function") handlers.organization(authenticatedRequest, response);
                else writeJson(response, 503, { error: "Organization report delivery is unavailable." });
                return;
            }
            if (typeof handlers.compliance === "function") handlers.compliance(authenticatedRequest, response);
            else writeJson(response, 503, { error: "Compliance report delivery is unavailable." });
        })
        .catch((error) => {
            writeJson(response, Number(error.statusCode) || 401, { error: error.message || "Customer authentication failed." });
        });
    return true;
}

module.exports = {
    DELIVERY_PATHS,
    bearerToken,
    verifyCustomer,
    emailCandidates,
    ensureRecipientOwnership,
    handleCustomerReportGate
};