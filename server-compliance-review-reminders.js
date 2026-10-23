"use strict";

/* Research-grade HR Compliance Readiness reassessment reminders.
 * This separate opt-in flow MUST NOT be confused with mandatory workspace
 * retention/deletion notices. Never infer a statutory filing deadline.
 */
const crypto = require("crypto");
const workspaceApi = require("./server-company-workspace-v2");
const ROUTES = new Set([
    "/api/company-workspace/review-reminders/status",
    "/api/company-workspace/review-reminders/enroll",
    "/api/company-workspace/review-reminders/manage",
    "/api/company-workspace/review-reminders/unsubscribe"
]);
const TABLE = "compliance_review_reminders";
const CONSENT_VERSION = "2026-10-23-v1";
const ONE_HOUR = 60 * 60 * 1000;
const MAX_ROWS = 30;
const idPattern = /^GWHR-\d{4}-\d{4}-[A-Z]{2,}\d{2,}$/;
const clean = value => String(value ?? "").trim();

const forbidden = (message, statusCode = 400) =>
    Object.assign(new Error(message), { statusCode });
const nowIso = () => new Date().toISOString();
const hash = value => crypto.createHash("sha256").update(clean(value)).digest("hex");

function monthsFrom(date, n) {
    return workspaceApi.addCalendarMonths(new Date(date), n).toISOString();
}
function validCadence(value) {
    if (!["monthly", "quarterly"].includes(value)) throw forbidden("Choose monthly or quarterly reminders.");
    return value;
}
function publicState(row) {
    if (!row) return { status: "off" };
    return {
        status: row.status,
        snapshotReportId: row.snapshot_report_id,
        cadence: row.cadence,
        nextReviewAt: row.next_review_at,
        confirmedAt: row.consented_at,
        lastSentAt: row.last_sent_at,
        emailEnabled: row.status === "active"
    };
}
async function getReminder(workspaceId) {
    const rows = await workspaceApi.supabase(`${TABLE}?workspace_id=eq.${encodeURIComponent(workspaceId)}&limit=1`, { method: "GET" });
    return rows?.[0] || null;
}
async function requireWorkspace(input) {
    const reportId = clean(input.reportId);
    if (!idPattern.test(reportId)) throw forbidden("A valid Report ID is required.");
    const workspace = await workspaceApi.findWorkspace(reportId);
    workspaceApi.verifyAccess(workspace, input.accessKey);
    if (Date.parse(workspace.expires_at) <= Date.now()) throw forbidden("The workspace has expired.", 410);
    return workspace;
}
async function status(input) {
    const workspace = await requireWorkspace(input);
    const row = await getReminder(workspace.id);
    if (row?.snapshot_report_id !== workspace.last_compliance_report_id) return { status: "off" };
    return publicState(row);
}

async function enroll(input) {
    const workspace = await requireWorkspace(input);
    const reportId = clean(input.reportId);
    const verifiedEmail = clean(workspace.email).toLowerCase();
    if (clean(input.email).toLowerCase() !== verifiedEmail || !verifiedEmail) {
        throw forbidden("Confirm the original work email associated with this workspace.", 403);
    }
    if (workspace.last_compliance_report_id !== reportId || workspace.current_report_id !== reportId ||
        !(workspace.completed_engines || []).includes("compliance")) {
        throw forbidden("Complete a new HR Compliance Readiness assessment before activating reminders.", 409);
    }
    if (input.confirm !== true) throw forbidden("Explicit confirmation is required; nothing has been scheduled.");
    const cadence = validCadence(input.cadence);
    const nextReviewAt = monthsFrom(new Date(), cadence === "monthly" ? 1 : 3);
    if (Date.parse(nextReviewAt) >= Date.parse(workspace.expires_at)) {
        throw forbidden("The next review would fall after your workspace expires. Complete a new assessment.", 409);
    }
    const existing = await getReminder(workspace.id);
    if (existing?.status === "active" && existing.snapshot_report_id === reportId && existing.cadence === cadence) {
        return publicState(existing); // repeated confirmations must not create duplicate schedules
    }
    const token = crypto.randomBytes(32).toString("base64url");
    const now = nowIso();
    const rows = await workspaceApi.supabase(`${TABLE}?on_conflict=workspace_id`, {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=representation",
        body: JSON.stringify({
            workspace_id: workspace.id,
            snapshot_report_id: reportId,
            cadence,
            status: "active",
            consent_version: CONSENT_VERSION,
            consented_at: now,
            next_review_at: nextReviewAt,
            unsubscribe_token_hash: hash(token),
            claimed_at: null,
            last_sent_at: null,
            revoked_at: null,
            updated_at: now
        })
    });
    // Never echo the unsubscribe token to the website or analytics.
    return publicState(rows?.[0]);
}

async function manage(input) {
    const workspace = await requireWorkspace(input);
    const action = clean(input.action);
    if (!["pause", "resume", "stop"].includes(action)) throw forbidden("Unsupported reminder action.");
    const row = await getReminder(workspace.id);
    if (!row) return { status: "off" };
    if (action === "resume" && row.snapshot_report_id !== workspace.last_compliance_report_id) {
        throw forbidden("A new compliance assessment needs a fresh reminder opt-in.", 409);
    }
    if (action === "resume" && row.status === "revoked") {
        throw forbidden("Reminders were turned off. Confirm a new opt-in from the completed assessment.", 409);
    }
    const nextStatus = action === "stop" ? "revoked" : action === "pause" ? "paused" : "active";
    const nextDate = action === "resume" ? monthsFrom(new Date(), row.cadence === "monthly" ? 1 : 3) : row.next_review_at;
    const now = nowIso();
    const rows = await workspaceApi.supabase(`${TABLE}?workspace_id=eq.${encodeURIComponent(workspace.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
            status: nextStatus,
            revoked_at: nextStatus === "revoked" ? now : null,
            unsubscribe_token_hash: nextStatus === "revoked" ? null : row.unsubscribe_token_hash,
            next_review_at: nextStatus === "revoked" ? null : nextDate,
            claimed_at: null,
            updated_at: now
        })
    });
    return publicState(rows?.[0]);
}

async function unsubscribe(input) {
    const token = clean(input.token);
    // Return a generic success for unknown tokens; do not reveal addresses.
    if (!/^[a-zA-Z0-9_-]{40,90}$/.test(token)) return { stopped: true };
    const rows = await workspaceApi.supabase(`${TABLE}?unsubscribe_token_hash=eq.${hash(token)}&limit=1`, { method: "GET" });
    const row = rows?.[0];
    if (!row) return { stopped: true };
    await workspaceApi.supabase(`${TABLE}?workspace_id=eq.${encodeURIComponent(row.workspace_id)}&unsubscribe_token_hash=eq.${hash(token)}`, {
        method: "PATCH",
        body: JSON.stringify({
            status: "revoked", revoked_at: nowIso(),
            next_review_at: null, unsubscribe_token_hash: null,
            claimed_at: null, updated_at: nowIso()
        })
    });
    return { stopped: true };
}

function reviewEmail(workspace, reminder, rawToken) {
    const homepage = "https://hrtechifyed.github.io/GrowwithHR-Version2/";
    const stopUrl = homepage + "reminder-preferences.html#token=" + rawToken;
    const label = reminder.cadence === "quarterly" ? "quarterly" : "monthly";
    return {
        subject: "GrowWithHR — Time to review your HR Compliance Readiness",
        text: [
            "Hello,",
            "",
            "You opted in to " + label + " HR Compliance Readiness review reminders.",
            "Your most recent opted-in assessment is ready for a fresh review.",
            "Please review the relevant company facts, missing information,",
            "workforce or location changes, and any areas that require verification.",
            "",
            "This is an assessment REVIEW reminder, not a statutory deadline notice.",
            "GrowWithHR's research-grade results identify possible applicability,",
            "not proof that an obligation is met or breached. Verify current",
            "requirements with official sources and qualified advisers.",
            "",
            "Open GrowWithHR: " + homepage,
            "Stop these reminders: " + stopUrl,
            "",
            "GrowWithHR by HRTechify"
        ].join("\n")
    };
}

async function runReviewReminders() {
    if (!workspaceApi.configured() || !process.env.GMAIL_USER) return { configured: false, sent: 0 };
    const now = nowIso();
    const rows = await workspaceApi.supabase(
        `${TABLE}?status=eq.active&next_review_at=lte.${encodeURIComponent(now)}&claimed_at=is.null&limit=${MAX_ROWS}`,
        { method: "GET" }
    );
    let sent = 0;
    for (const row of rows || []) {
        // The conditional claim avoids competing scheduler processes sending twice.
        const claimed = await workspaceApi.supabase(
            `${TABLE}?workspace_id=eq.${encodeURIComponent(row.workspace_id)}&status=eq.active&next_review_at=eq.${encodeURIComponent(row.next_review_at)}&claimed_at=is.null`,
            { method: "PATCH", body: JSON.stringify({ claimed_at: now }) }
        );
        if (!claimed?.length) continue;
        try {
            const result = await workspaceApi.supabase(`company_workspaces?id=eq.${encodeURIComponent(row.workspace_id)}&limit=1`, { method: "GET" });
            const workspace = result?.[0];
            if (!workspace || workspace.status !== "active" ||
                !workspace.email || Date.parse(workspace.expires_at) <= Date.now() ||
                workspace.last_compliance_report_id !== row.snapshot_report_id) {
                await workspaceApi.supabase(`${TABLE}?workspace_id=eq.${encodeURIComponent(row.workspace_id)}`, {
                    method: "PATCH", body: JSON.stringify({ status: "superseded", next_review_at: null, claimed_at: null, updated_at: nowIso() })
                });
                continue;
            }
            // Unsubscribe token is stored hashed. Mint and persist a rotated
            // token before sending; the raw token only appears in recipient email.
            const token = crypto.randomBytes(32).toString("base64url");
            const next = monthsFrom(new Date(), row.cadence === "monthly" ? 1 : 3);
            await workspaceApi.supabase(`${TABLE}?workspace_id=eq.${encodeURIComponent(row.workspace_id)}&status=eq.active&claimed_at=eq.${encodeURIComponent(now)}`, {
                method: "PATCH", body: JSON.stringify({ unsubscribe_token_hash: hash(token) })
            });
            const message = reviewEmail(workspace, row, token);
            const delivery = await workspaceApi.sendPlainEmail(workspace.email, message.subject, message.text);
            if (!delivery.sent) throw new Error("Reminder email provider unavailable");
            sent += 1;
            await workspaceApi.supabase(`${TABLE}?workspace_id=eq.${encodeURIComponent(row.workspace_id)}&status=eq.active&claimed_at=eq.${encodeURIComponent(now)}`, {
                method: "PATCH", body: JSON.stringify({
                    next_review_at: Date.parse(next) < Date.parse(workspace.expires_at) ? next : null,
                    status: Date.parse(next) < Date.parse(workspace.expires_at) ? "active" : "expired",
                    last_sent_at: nowIso(), claimed_at: null, updated_at: nowIso()
                })
            });
        } catch (_error) {
            // A claim remains held on failure; it is only recovered after 3h,
            // rather than instantly retrying a potentially already-sent email.
            console.error("GrowWithHR compliance review reminder processing failed.");
        }
    }
    // Recover abandoned claims from crashed workers, after a conservative delay.
    const cutoff = new Date(Date.now() - 3 * ONE_HOUR).toISOString();
    await workspaceApi.supabase(`${TABLE}?status=eq.active&claimed_at=lt.${encodeURIComponent(cutoff)}`, {
        method: "PATCH", body: JSON.stringify({ claimed_at: null })
    });
    return { configured: true, sent };
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        const chunks = []; let total = 0;
        request.on("data", chunk => {
            total += chunk.length;
            if (total > 8192) {
                reject(forbidden("The reminder request is too large.", 413));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
            catch (_error) { reject(forbidden("Invalid JSON.")); }
        });
        request.on("error", reject);
    });
}
function reply(response, statusCode, result) {
    response.statusCode = statusCode;
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(result));
}
async function dispatch(request, response, path) {
    try {
        if (request.method !== "POST") return reply(response, 405, { error: "Use POST." });
        const input = await readBody(request);
        const operation = path.split("/").pop();
        const result = operation === "status" ? await status(input)
            : operation === "enroll" ? await enroll(input)
            : operation === "manage" ? await manage(input)
            : await unsubscribe(input);
        reply(response, 200, { ok: true, ...result });
    } catch (error) {
        reply(response, Number(error.statusCode) || 503, { ok: false, error: clean(error.message) || "Reminders unavailable." });
    }
}
function handleReviewReminderRequest(request, response) {
    const path = clean(request.url).split("?")[0];
    if (!ROUTES.has(path)) return false;
    void dispatch(request, response, path);
    return true;
}
let started = false;
function startReviewReminderScheduler() {
    if (started) return;
    started = true;
    const run = () => runReviewReminders().catch(() => console.error("GrowWithHR review reminder scheduler failed."));
    setTimeout(run, 45000).unref?.();
    setInterval(run, ONE_HOUR).unref?.();
}
module.exports = { handleReviewReminderRequest, startReviewReminderScheduler, runReviewReminders, enroll, status, manage, unsubscribe, monthsFrom };
