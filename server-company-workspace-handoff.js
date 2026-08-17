"use strict";

const crypto = require("crypto");
const { recoverWorkspace } = require("./server-company-workspace");

const CREATE_PATH = "/api/company-workspace/handoff/create";
const CONSUME_PATH = "/api/company-workspace/handoff/consume";
const MAX_REQUEST_BYTES = 32 * 1024;
const HANDOFF_TTL_MS = 2 * 60 * 1000;
const MAX_HANDOFFS = 200;
const handoffs = new Map();

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function writeJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The handoff request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(Object.assign(new Error("The handoff request contains invalid JSON."), { statusCode: 400 }));
            }
        });
        request.on("error", reject);
    });
}

function pruneExpired() {
    const now = Date.now();
    for (const [token, item] of handoffs.entries()) {
        if (item.expiresAt <= now) handoffs.delete(token);
    }
    while (handoffs.size > MAX_HANDOFFS) {
        const firstKey = handoffs.keys().next().value;
        if (!firstKey) break;
        handoffs.delete(firstKey);
    }
}

async function createHandoff(input = {}) {
    pruneExpired();
    const reportId = cleanText(input.reportId);
    const accessKey = cleanText(input.accessKey);
    if (!reportId || !accessKey) {
        throw Object.assign(new Error("A Report ID and Workspace Recovery Code are required for a secure handoff."), { statusCode: 400 });
    }

    const workspace = await recoverWorkspace({ reportId, accessKey });
    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = Date.now() + HANDOFF_TTL_MS;
    handoffs.set(token, {
        workspace,
        accessKey,
        expiresAt
    });
    pruneExpired();

    return {
        token,
        expiresAt: new Date(expiresAt).toISOString()
    };
}

function consumeHandoff(input = {}) {
    pruneExpired();
    const token = cleanText(input.token);
    if (!token) {
        throw Object.assign(new Error("A valid handoff token is required."), { statusCode: 400 });
    }
    const item = handoffs.get(token);
    handoffs.delete(token);
    if (!item || item.expiresAt <= Date.now()) {
        throw Object.assign(new Error("This Company DNA handoff has expired or was already used."), { statusCode: 410 });
    }
    return {
        workspace: item.workspace,
        accessKey: item.accessKey
    };
}

async function dispatch(request, response, pathname) {
    try {
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }
        const input = await readJsonBody(request);
        if (pathname === CREATE_PATH) {
            writeJson(response, 201, { ok: true, ...(await createHandoff(input)) });
            return;
        }
        if (pathname === CONSUME_PATH) {
            writeJson(response, 200, { ok: true, ...consumeHandoff(input) });
        }
    } catch (error) {
        writeJson(response, Number(error.statusCode) || 503, {
            ok: false,
            error: cleanText(error.message, "Company DNA handoff failed.")
        });
    }
}

function handleCompanyWorkspaceHandoffRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (pathname !== CREATE_PATH && pathname !== CONSUME_PATH) return false;
    dispatch(request, response, pathname);
    return true;
}

module.exports = {
    handleCompanyWorkspaceHandoffRequest,
    createHandoff,
    consumeHandoff,
    HANDOFF_TTL_MS
};