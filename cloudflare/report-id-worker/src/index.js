import { DurableObject } from "cloudflare:workers";

const SERVICE_VERSION = "1.0.0";
const STORAGE_BACKEND = "cloudflare-durable-object";
const SEQUENCE_POLICY = "global-non-resetting-symmetric-alpha-numeric";
const REGISTRY_OBJECT_NAME = "growwithhr-global-report-id-registry";
const HASH_PATTERN = /^[a-f0-9]{64}$/;

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function jsonResponse(status, payload) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

function authorised(request, env) {
    const configured = cleanText(env.REPORT_ID_ALLOCATOR_SECRET);
    if (!configured) return false;
    return cleanText(request.headers.get("Authorization")) === `Bearer ${configured}`;
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
    const candidateLetters = cleanText(current.letters);
    const letters = /^[A-Z]+$/.test(candidateLetters) && candidateLetters.length === width
        ? candidateLetters
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

function reportIdFor(sequence, date = new Date()) {
    const parts = indiaDateParts(date);
    return `GWHR-${parts.year}-${parts.month}${parts.day}-${sequenceSuffix(sequence)}`;
}

function assertHash(value, field, { required = false } = {}) {
    const text = cleanText(value);
    if (!text && !required) return "";
    if (!HASH_PATTERN.test(text)) {
        throw new Error(`${field} must be a SHA-256 hex digest.`);
    }
    return text;
}

function sanitiseAllocationInput(input = {}) {
    const allowed = new Set(["requestKeyHash", "userHash", "companyHash", "assessmentHash"]);
    const extra = Object.keys(input || {}).filter((key) => !allowed.has(key));
    if (extra.length) {
        throw new Error(`Unsupported allocation fields: ${extra.join(", ")}.`);
    }
    return Object.freeze({
        requestKeyHash: assertHash(input.requestKeyHash, "requestKeyHash", { required: true }),
        userHash: assertHash(input.userHash, "userHash"),
        companyHash: assertHash(input.companyHash, "companyHash"),
        assessmentHash: assertHash(input.assessmentHash, "assessmentHash")
    });
}

export class ReportIdRegistry extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.ctx.storage.sql.exec(`
            CREATE TABLE IF NOT EXISTS sequence_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                width INTEGER NOT NULL,
                letters TEXT NOT NULL,
                number INTEGER NOT NULL,
                issued_count INTEGER NOT NULL
            );
            INSERT OR IGNORE INTO sequence_state (id, width, letters, number, issued_count)
            VALUES (1, 2, 'AA', 0, 0);
            CREATE TABLE IF NOT EXISTS report_registry (
                report_id TEXT PRIMARY KEY,
                request_key_hash TEXT NOT NULL UNIQUE,
                suffix TEXT NOT NULL,
                generated_at TEXT NOT NULL,
                sequence_width INTEGER NOT NULL,
                user_hash TEXT NOT NULL DEFAULT '',
                company_hash TEXT NOT NULL DEFAULT '',
                assessment_hash TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'issued'
            );
            CREATE INDEX IF NOT EXISTS report_registry_generated_at_idx
            ON report_registry (generated_at DESC);
        `);
    }

    async allocate(input = {}) {
        const safe = sanitiseAllocationInput(input);

        return this.ctx.storage.transactionSync(() => {
            const existing = this.ctx.storage.sql.exec(
                `SELECT report_id, suffix, generated_at, sequence_width, user_hash, company_hash, assessment_hash, status
                 FROM report_registry
                 WHERE request_key_hash = ?`,
                safe.requestKeyHash
            ).toArray()[0];

            if (existing) {
                return {
                    reportId: existing.report_id,
                    suffix: existing.suffix,
                    generatedAt: existing.generated_at,
                    sequenceWidth: Number(existing.sequence_width),
                    userHash: existing.user_hash,
                    companyHash: existing.company_hash,
                    assessmentHash: existing.assessment_hash,
                    status: existing.status,
                    replayed: true
                };
            }

            const current = this.ctx.storage.sql.exec(
                "SELECT width, letters, number, issued_count FROM sequence_state WHERE id = 1"
            ).one();
            const next = nextSequence(current);
            const now = new Date();
            const reportId = reportIdFor(next, now);
            const suffix = sequenceSuffix(next);
            const generatedAt = now.toISOString();

            this.ctx.storage.sql.exec(
                `INSERT INTO report_registry (
                    report_id, request_key_hash, suffix, generated_at, sequence_width,
                    user_hash, company_hash, assessment_hash, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'issued')`,
                reportId,
                safe.requestKeyHash,
                suffix,
                generatedAt,
                next.width,
                safe.userHash,
                safe.companyHash,
                safe.assessmentHash
            );

            this.ctx.storage.sql.exec(
                `UPDATE sequence_state
                 SET width = ?, letters = ?, number = ?, issued_count = issued_count + 1
                 WHERE id = 1`,
                next.width,
                next.letters,
                next.number
            );

            return {
                reportId,
                suffix,
                generatedAt,
                sequenceWidth: next.width,
                userHash: safe.userHash,
                companyHash: safe.companyHash,
                assessmentHash: safe.assessmentHash,
                status: "issued",
                replayed: false
            };
        });
    }

    async status() {
        const sequence = this.ctx.storage.sql.exec(
            "SELECT width, letters, number, issued_count FROM sequence_state WHERE id = 1"
        ).one();
        const last = this.ctx.storage.sql.exec(
            `SELECT report_id, suffix, generated_at
             FROM report_registry
             ORDER BY rowid DESC
             LIMIT 1`
        ).toArray()[0] || null;

        return {
            ok: true,
            serviceVersion: SERVICE_VERSION,
            storageBackend: STORAGE_BACKEND,
            durableStorageConfigured: true,
            sequencePolicy: SEQUENCE_POLICY,
            issuedCount: Number(sequence.issued_count || 0),
            lastReportId: last?.report_id || null,
            lastSuffix: last?.suffix || null,
            lastGeneratedAt: last?.generated_at || null
        };
    }
}

export default {
    async fetch(request, env) {
        if (!authorised(request, env)) {
            return jsonResponse(401, { error: "Unauthorized." });
        }

        const url = new URL(request.url);
        const stub = env.REPORT_ID_REGISTRY.getByName(REGISTRY_OBJECT_NAME);

        try {
            if (url.pathname === "/allocate" && request.method === "POST") {
                const payload = await request.json();
                const record = await stub.allocate(payload);
                return jsonResponse(record.replayed ? 200 : 201, {
                    ok: true,
                    ...record,
                    serviceVersion: SERVICE_VERSION,
                    storageBackend: STORAGE_BACKEND,
                    durableStorageConfigured: true,
                    sequencePolicy: SEQUENCE_POLICY
                });
            }

            if (url.pathname === "/status" && request.method === "GET") {
                return jsonResponse(200, await stub.status());
            }

            return jsonResponse(404, { error: "Not found." });
        } catch (error) {
            return jsonResponse(400, {
                error: cleanText(error?.message, "Report ID allocator request failed.")
            });
        }
    }
};
