"use strict";

/* Server-side authentication gate for complete personalised report delivery.
 * The browser sends a Supabase access token; this module validates it against
 * the configured Supabase Auth project before delegating to the existing Gmail
 * delivery handlers. It never handles PDF bytes itself.
 */

const DELIVERY_PATHS = new Set([
    "/api/send-advisory",
    "/api/send-advisory-v2",
    "/api/organization-report/deliver"
]);

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

function handleCustomerReportGate(request, response, handlers = {}) {
    const requestPath = cleanText(request.url).split("?")[0];
    if (!DELIVERY_PATHS.has(requestPath)) return false;
    if (request.method !== "POST") return false;

    verifyCustomer(request)
        .then((customer) => {
            request.growwithhrCustomer = customer;
            if (requestPath === "/api/organization-report/deliver") {
                if (typeof handlers.organization === "function") handlers.organization(request, response);
                else writeJson(response, 503, { error: "Organization report delivery is unavailable." });
                return;
            }
            if (typeof handlers.compliance === "function") handlers.compliance(request, response);
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
    handleCustomerReportGate
};