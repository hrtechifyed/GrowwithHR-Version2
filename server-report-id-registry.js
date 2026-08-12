"use strict";

const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const REPORT_ID_ROUTE = "/api/report-id";
const REPORT_ID_STATUS_ROUTE = "/api/report-id/status";
const MAX_REQUEST_BYTES = 64 * 1024;
const LOCK_RETRY_MS = 25;
const LOCK_MAX_ATTEMPTS = 240;
const STALE_LOCK_MS = 30 * 1000;
const DEFAULT_REGISTRY_FILE = path.join(__dirname, "data", "runtime", "report-id-registry.json");

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function registryFilePath() {
    return path.resolve(cleanText(process.env.REPORT_ID_REGISTRY_FILE, DEFAULT_REGISTRY_FILE));
}

function durableStorageConfigured() {
    return Boolean(cleanText(process.env.REPORT_ID_REGISTRY_FILE));
}

function hashIdentifier(value) {
    const text = cleanText(value);
    return text ? crypto.createHash("sha256").update(text).digest("hex") : "";
}

function indiaDateParts(date = new Date()) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    const parts = Object.fromEntries(
        formatter.formatToParts(date)
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value])
    );
    return { year: parts.year, month: parts.month, day: parts.day };
}

function incrementLetters(letters) {
    const chars = String(letters || "").split("");
    for (let index = chars.length - 1; index >= 0; index -= 1) {
        if (chars[index] !== "Z") {
            chars[index] = String.fromCharCode(chars[index].charCodeAt(0) + 1);
            return chars.join("");
        }
        chars[index] = "A";
    }
    return "";
}

function nextSequence(current = {}) {
    const width = Math.max(2, Number(current.width) || 2);
    const letters = /^[A-Z]+$/.test(cleanText(current.letters)) && cleanText(current.letters).length === width
        ? cleanText(current.letters)
        : "A".repeat(width);
    const number = Math.max(0, Number(current.number) || 0);
    const maxNumber = (10 ** width) - 1;

    if (number < maxNumber) {
        return { width, letters, number: number + 1 };
    }

    const advancedLetters = incrementLetters(letters);
    if (advancedLetters) {
        return { width, letters: advancedLetters, number: 1 };
    }

    const expandedWidth = width + 1;
    return { width: expandedWidth, letters: "A".repeat(expandedWidth), number: 1 };
}

function sequenceSuffix(sequence = {}) {
    const width = Math.max(2, Number(sequence.width) || 2);
    const letters = cleanText(sequence.letters, "A".repeat(width)).padStart(width, "A").slice(-width);
    const digits = String(Math.max(1, Number(sequence.number) || 1)).padStart(width, "0");
    return `${letters}${digits}`;
}

function reportIdFor(sequence, date = new Date()) {
    const parts = indiaDateParts(date);
    return `GWHR-${parts.year}-${parts.month}${parts.day}-${sequenceSuffix(sequence)}`;
}

function emptyRegistry() {
    return {
        schemaVersion: 1,
        sequencePolicy: "global-non-resetting-symmetric-alpha-numeric",
        lastSequence: { width: 2, letters: "AA", number: 0 },
        issuedCount: 0,
        records: [],
        requests: {}
    };
}

async function ensureRegistryDirectory(filePath) {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

async function readRegistry(filePath = registryFilePath()) {
    try {
        const parsed = JSON.parse(await fsp.readFile(filePath, "utf8"));
        return {
            ...emptyRegistry(),
            ...parsed,
            lastSequence: { ...emptyRegistry().lastSequence, ...(parsed.lastSequence || {}) },
            records: Array.isArray(parsed.records) ? parsed.records : [],
            requests: parsed.requests && typeof parsed.requests === "object" ? parsed.requests : {}
        };
    } catch (error) {
        if (error.code === "ENOENT") return emptyRegistry();
        throw error;
    }
}

async function writeRegistryAtomic(registry, filePath = registryFilePath()) {
    await ensureRegistryDirectory(filePath);
    const tempPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
    await fsp.writeFile(tempPath, `${JSON.stringify(registry, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await fsp.rename(tempPath, filePath);
}

async function sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireLock(filePath = registryFilePath()) {
    await ensureRegistryDirectory(filePath);
    const lockPath = `${filePath}.lock`;
    for (let attempt = 0; attempt < LOCK_MAX_ATTEMPTS; attempt += 1) {
        try {
            const handle = await fsp.open(lockPath, "wx", 0o600);
            await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
            return async () => {
                try { await handle.close(); } catch (_error) {}
                try { await fsp.unlink(lockPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
            };
        } catch (error) {
            if (error.code !== "EEXIST") throw error;
            try {
                const stats = await fsp.stat(lockPath);
                if (Date.now() - stats.mtimeMs > STALE_LOCK_MS) {
                    await fsp.unlink(lockPath);
                    continue;
                }
            } catch (statError) {
                if (statError.code !== "ENOENT") throw statError;
            }
            await sleep(LOCK_RETRY_MS);
        }
    }
    throw new Error("The report ID registry is busy. Please retry report generation.");
}

async function allocateReportId(input = {}, now = new Date()) {
    const filePath = registryFilePath();
    const release = await acquireLock(filePath);
    try {
        const registry = await readRegistry(filePath);
        const requestKey = cleanText(input.requestKey);
        if (!requestKey) throw new Error("A report allocation request key is required.");

        const existingReportId = cleanText(registry.requests[requestKey]);
        if (existingReportId) {
            const existing = registry.records.find((record) => record.reportId === existingReportId);
            if (existing) return { ...existing, replayed: true, durableStorageConfigured: durableStorageConfigured() };
        }

        const next = nextSequence(registry.lastSequence);
        const reportId = reportIdFor(next, now);
        if (registry.records.some((record) => record.reportId === reportId)) {
            throw new Error("The report ID registry detected a duplicate identifier and refused allocation.");
        }

        const generatedAt = now.toISOString();
        const record = {
            reportId,
            suffix: sequenceSuffix(next),
            generatedAt,
            sequenceWidth: next.width,
            userHash: hashIdentifier(input.userKey || input.email || input.userId),
            companyHash: hashIdentifier(input.companyKey || input.companyName || input.companyId),
            assessmentHash: hashIdentifier(input.assessmentId || input.assessmentKey),
            status: "issued"
        };

        registry.lastSequence = next;
        registry.issuedCount = Number(registry.issuedCount || 0) + 1;
        registry.records.push(record);
        registry.requests[requestKey] = reportId;
        await writeRegistryAtomic(registry, filePath);

        return { ...record, replayed: false, durableStorageConfigured: durableStorageConfigured() };
    } finally {
        await release();
    }
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The report ID request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(Object.assign(new Error("The report ID request contains invalid JSON."), { statusCode: 400 }));
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

async function handleAllocation(request, response) {
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
        const input = await readJsonBody(request);
        const record = await allocateReportId(input);
        writeJson(response, 201, {
            ok: true,
            reportId: record.reportId,
            suffix: record.suffix,
            generatedAt: record.generatedAt,
            replayed: record.replayed,
            durableStorageConfigured: record.durableStorageConfigured,
            persistenceRequirement: record.durableStorageConfigured
                ? "persistent-storage-configured"
                : "set-REPORT_ID_REGISTRY_FILE-to-a-persistent-disk-before-production"
        });
    } catch (error) {
        writeJson(response, Number(error.statusCode) || 503, {
            error: error.message || "A unique report ID could not be reserved."
        });
    }
}

async function handleStatus(_request, response) {
    try {
        const registry = await readRegistry();
        const last = registry.records[registry.records.length - 1] || null;
        writeJson(response, 200, {
            ok: true,
            issuedCount: Number(registry.issuedCount || 0),
            lastReportId: last?.reportId || null,
            lastSuffix: last?.suffix || null,
            sequencePolicy: registry.sequencePolicy,
            durableStorageConfigured: durableStorageConfigured()
        });
    } catch (error) {
        writeJson(response, 503, { error: error.message || "The report ID registry could not be read." });
    }
}

function handleReportIdRequest(request, response) {
    const requestPath = cleanText(request.url).split("?")[0];
    if (requestPath === REPORT_ID_ROUTE) {
        handleAllocation(request, response);
        return true;
    }
    if (requestPath === REPORT_ID_STATUS_ROUTE && request.method === "GET") {
        handleStatus(request, response);
        return true;
    }
    return false;
}

module.exports = {
    REPORT_ID_ROUTE,
    REPORT_ID_STATUS_ROUTE,
    handleReportIdRequest,
    allocateReportId,
    nextSequence,
    sequenceSuffix,
    reportIdFor,
    indiaDateParts,
    registryFilePath,
    durableStorageConfigured,
    emptyRegistry,
    readRegistry
};
