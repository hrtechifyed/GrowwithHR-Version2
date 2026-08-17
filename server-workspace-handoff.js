"use strict";

const crypto = require("crypto");
const { recoverWorkspace } = require("./server-company-workspace-v2");

const ROUTES = new Set([
    "/api/company-workspace/handoff/create",
    "/api/company-workspace/handoff/redeem"
]);
const HANDOFF_TTL_MS = 5 * 60 * 1000;
const MAX_REQUEST_BYTES = 64 * 1024;
const handoffs = new Map();

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The workspace handoff request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(Object.assign(new Error("The workspace handoff request contains invalid JSON."), { statusCode: 400 }));
            }
        });
        request.on("error", reject);
    });
}

function writeJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("Pragma", "no-cache");
    response.end(JSON.stringify(payload));
}

function purgeExpired() {
    const now = Date.now();
    for (const [token, handoff] of handoffs.entries()) {
        if (!handoff || handoff.expiresAt <= now) handoffs.delete(token);
    }
}

async function createHandoff(input = {}) {
    const reportId = cleanText(input.reportId);
    const accessKey = cleanText(input.accessKey);
    if (!reportId || !accessKey) {
        throw Object.assign(new Error("A recovered GrowWithHR workspace is required for handoff."), { statusCode: 400 });
    }

    const workspace = await recoverWorkspace({ reportId, accessKey });
    const token = crypto.randomBytes(32).toString("base64url");
    const createdAt = Date.now();
    handoffs.set(token, {
        createdAt,
        expiresAt: createdAt + HANDOFF_TTL_MS,
        target: cleanText(input.target, "organization-structure"),
        workspace,
        accessKey
    });

    return {
        token,
        expiresInSeconds: Math.floor(HANDOFF_TTL_MS / 1000)
    };
}

function redeemHandoff(input = {}) {
    purgeExpired();
    const token = cleanText(input.token);
    if (!token) {
        throw Object.assign(new Error("A workspace handoff token is required."), { statusCode: 400 });
    }
    const handoff = handoffs.get(token);
    if (!handoff) {
        throw Object.assign(new Error("This workspace handoff is invalid, expired, or has already been used."), { statusCode: 410 });
    }
    handoffs.delete(token);
    return {
        target: handoff.target,
        workspace: handoff.workspace,
        accessKey: handoff.accessKey
    };
}

async function dispatch(request, response, pathname) {
    try {
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }
        const input = await readJsonBody(request);
        if (pathname.endsWith("/create")) {
            writeJson(response, 201, { ok: true, handoff: await createHandoff(input) });
            return;
        }
        writeJson(response, 200, { ok: true, handoff: redeemHandoff(input) });
    } catch (error) {
        writeJson(response, Number(error.statusCode) || 503, {
            error: cleanText(error.message, "GrowWithHR could not complete the workspace handoff.")
        });
    }
}

function handleWorkspaceHandoffRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (!ROUTES.has(pathname)) return false;
    dispatch(request, response, pathname);
    return true;
}

const cleanupTimer = setInterval(purgeExpired, 60 * 1000);
cleanupTimer.unref?.();

module.exports = {
    ROUTES,
    HANDOFF_TTL_MS,
    handleWorkspaceHandoffRequest,
    createHandoff,
    redeemHandoff,
    purgeExpired
};
