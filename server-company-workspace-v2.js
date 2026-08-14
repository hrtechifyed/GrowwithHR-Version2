"use strict";

const crypto = require("crypto");
const { google } = require("googleapis");

const ROUTES = new Set([
    "/api/company-workspace/create",
    "/api/company-workspace/recover",
    "/api/company-workspace/complete",
    "/api/company-workspace/delete",
    "/api/company-workspace/retention/run"
]);

const REPORT_ID_PATTERN = /^GWHR-\d{4}-\d{4}-[A-Z]{2,}\d{2,}$/;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_REQUEST_BYTES = 1024 * 1024;
const RETENTION_INTERVAL_MS = 60 * 60 * 1000;
const MAX_SWEEP_ROWS = 100;

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function mergeCompanyData(existing, incoming) {
    const left = asObject(existing);
    const right = asObject(incoming);
    const output = { ...left };

    for (const [key, value] of Object.entries(right)) {
        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            left[key] &&
            typeof left[key] === "object" &&
            !Array.isArray(left[key])
        ) {
            output[key] = mergeCompanyData(left[key], value);
        } else {
            output[key] = value;
        }
    }

    return output;
}

function assertReportId(value) {
    const reportId = cleanText(value);
    if (!REPORT_ID_PATTERN.test(reportId)) {
        throw Object.assign(new Error("A valid GrowWithHR Report ID is required."), { statusCode: 400 });
    }
    return reportId;
}

function assertEmail(value) {
    const email = cleanText(value).toLowerCase();
    if (!/^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(email)) {
        throw Object.assign(new Error("A valid email address is required."), { statusCode: 400 });
    }
    return email;
}

function encryptionSecret() {
    return cleanText(
        process.env.WORKSPACE_ENCRYPTION_SECRET ||
        process.env.REPORT_ID_ALLOCATOR_SECRET
    );
}

function configured() {
    return Boolean(
        cleanText(process.env.SUPABASE_URL) &&
        cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
        encryptionSecret()
    );
}

function encryptionKey() {
    const secret = encryptionSecret();
    if (!secret) {
        throw Object.assign(new Error("Company Workspace encryption is not configured."), { statusCode: 503 });
    }
    return crypto
        .createHash("sha256")
        .update(`growwithhr-company-workspace:${secret}`)
        .digest();
}

function encryptJson(value) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
    const plaintext = Buffer.from(JSON.stringify(value ?? {}), "utf8");
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [
        "v1",
        iv.toString("base64url"),
        tag.toString("base64url"),
        ciphertext.toString("base64url")
    ].join(".");
}

function decryptJson(value) {
    const [version, ivText, tagText, ciphertextText] = cleanText(value).split(".");
    if (version !== "v1" || !ivText || !tagText || !ciphertextText) {
        throw new Error("Stored Company Workspace data is invalid.");
    }

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        encryptionKey(),
        Buffer.from(ivText, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertextText, "base64url")),
        decipher.final()
    ]);
    return JSON.parse(plaintext.toString("utf8"));
}

function generateAccessKey() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.randomBytes(20);
    let raw = "";
    for (const byte of bytes) raw += alphabet[byte % alphabet.length];
    return raw.match(/.{1,4}/g).join("-");
}

function hashAccessKey(accessKey) {
    const normalized = cleanText(accessKey).toUpperCase();
    return crypto
        .createHash("sha256")
        .update(`growwithhr-access:${normalized}`)
        .digest("hex");
}

function safeEqualHex(left, right) {
    const a = Buffer.from(cleanText(left), "hex");
    const b = Buffer.from(cleanText(right), "hex");
    return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function safeEqualText(left, right) {
    const a = Buffer.from(cleanText(left), "utf8");
    const b = Buffer.from(cleanText(right), "utf8");
    return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function addCalendarMonths(value, months) {
    const source = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (!Number.isFinite(source.getTime())) throw new Error("A valid date is required.");

    const monthIndex = source.getUTCMonth() + Number(months || 0);
    const targetYear = source.getUTCFullYear() + Math.floor(monthIndex / 12);
    const targetMonth = ((monthIndex % 12) + 12) % 12;
    const targetLastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    const targetDay = Math.min(source.getUTCDate(), targetLastDay);

    return new Date(Date.UTC(
        targetYear,
        targetMonth,
        targetDay,
        source.getUTCHours(),
        source.getUTCMinutes(),
        source.getUTCSeconds(),
        source.getUTCMilliseconds()
    ));
}

function retentionDates(now = new Date()) {
    const source = now instanceof Date ? now : new Date(now);
    const expiresAt = addCalendarMonths(source, 6);
    const reminderDueAt = new Date(expiresAt.getTime() - SEVEN_DAYS_MS);
    return {
        expiresAt: expiresAt.toISOString(),
        reminderDueAt: reminderDueAt.toISOString()
    };
}

function supabaseAuthHeaders(keyValue) {
    const key = cleanText(keyValue);
    const headers = { apikey: key };
    if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) {
        headers.Authorization = `Bearer ${key}`;
    }
    return headers;
}

async function supabase(path, options = {}) {
    if (!configured()) {
        throw Object.assign(new Error("Company Workspace database is not configured."), { statusCode: 503 });
    }

    const base = cleanText(process.env.SUPABASE_URL).replace(/\/+$/, "");
    const key = cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const response = await fetch(`${base}/rest/v1/${path}`, {
        ...options,
        headers: {
            ...supabaseAuthHeaders(key),
            "Content-Type": "application/json",
            Prefer: options.prefer || "return=representation",
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let payload = null;
    try {
        payload = text ? JSON.parse(text) : null;
    } catch (_error) {
        payload = text;
    }

    if (!response.ok) {
        const message = cleanText(
            payload?.message || payload?.error || payload,
            "Company Workspace database request failed."
        );
        throw Object.assign(new Error(message), {
            statusCode: response.status >= 500 ? 503 : 400
        });
    }

    return payload;
}

async function findWorkspace(reportId) {
    const rows = await supabase(
        `company_workspaces?report_ids=cs.{${encodeURIComponent(reportId)}}&limit=1`,
        { method: "GET" }
    );
    return Array.isArray(rows) ? rows[0] || null : null;
}

function verifyAccess(workspace, accessKey) {
    if (!workspace || workspace.status !== "active") {
        throw Object.assign(new Error("This GrowWithHR workspace is unavailable or has expired."), { statusCode: 404 });
    }
    if (!safeEqualHex(workspace.access_key_hash, hashAccessKey(accessKey))) {
        throw Object.assign(new Error("The Report ID or Workspace Recovery Code is incorrect."), { statusCode: 401 });
    }
}

function workspaceResponse(workspace, companyData = null) {
    return {
        reportId: workspace.current_report_id,
        reportIds: workspace.report_ids || [],
        companyName: workspace.company_name || "",
        email: workspace.email || "",
        completedEngines: workspace.completed_engines || [],
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
        lastAnalysisCompletedAt: workspace.last_analysis_completed_at,
        expiresAt: workspace.expires_at,
        reminderDueAt: workspace.reminder_due_at,
        companyData
    };
}

async function createWorkspace(input = {}) {
    const reportId = assertReportId(input.reportId);
    const email = assertEmail(input.email);
    const existing = await findWorkspace(reportId);
    if (existing) {
        throw Object.assign(new Error("A Company Workspace already exists for this Report ID."), { statusCode: 409 });
    }

    const accessKey = generateAccessKey();
    const now = new Date();
    const retention = retentionDates(now);
    const completedEngine = cleanText(input.completedEngine, "compliance");
    const rows = await supabase("company_workspaces", {
        method: "POST",
        body: JSON.stringify({
            current_report_id: reportId,
            report_ids: [reportId],
            access_key_hash: hashAccessKey(accessKey),
            email,
            company_name: cleanText(input.companyName),
            encrypted_company_data: encryptJson(input.companyData || {}),
            completed_engines: completedEngine ? [completedEngine] : [],
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            last_analysis_completed_at: now.toISOString(),
            expires_at: retention.expiresAt,
            reminder_due_at: retention.reminderDueAt,
            status: "active"
        })
    });

    const workspace = rows?.[0];
    return { ...workspaceResponse(workspace), accessKey };
}

async function recoverWorkspace(input = {}) {
    const reportId = assertReportId(input.reportId);
    const workspace = await findWorkspace(reportId);
    verifyAccess(workspace, input.accessKey);

    if (new Date(workspace.expires_at).getTime() <= Date.now()) {
        throw Object.assign(
            new Error("This GrowWithHR workspace has expired. For privacy, its reusable company data can no longer be recovered."),
            { statusCode: 410 }
        );
    }

    return workspaceResponse(workspace, decryptJson(workspace.encrypted_company_data));
}

async function completeAnalysis(input = {}) {
    const reportId = assertReportId(input.reportId);
    const newReportId = assertReportId(input.newReportId || input.reportId);
    const workspace = await findWorkspace(reportId);
    verifyAccess(workspace, input.accessKey);

    const now = new Date();
    const retention = retentionDates(now);
    const completedEngine = cleanText(input.completedEngine);
    const reportIds = Array.from(new Set([...(workspace.report_ids || []), newReportId]));
    const engines = Array.from(new Set([
        ...(workspace.completed_engines || []),
        ...(completedEngine ? [completedEngine] : [])
    ]));
    const existingData = decryptJson(workspace.encrypted_company_data);
    const mergedData = mergeCompanyData(existingData, input.companyData || {});

    const rows = await supabase(`company_workspaces?id=eq.${encodeURIComponent(workspace.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
            current_report_id: newReportId,
            report_ids: reportIds,
            encrypted_company_data: encryptJson(mergedData),
            completed_engines: engines,
            company_name: cleanText(input.companyName, workspace.company_name),
            updated_at: now.toISOString(),
            last_analysis_completed_at: now.toISOString(),
            expires_at: retention.expiresAt,
            reminder_due_at: retention.reminderDueAt,
            reminder_sent_at: null
        })
    });

    return workspaceResponse(rows?.[0], mergedData);
}

function gmailConfigured() {
    return ["GMAIL_USER", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"]
        .every((name) => cleanText(process.env[name]));
}

function gmailClient() {
    const oauth2Client = new google.auth.OAuth2(
        cleanText(process.env.GOOGLE_CLIENT_ID),
        cleanText(process.env.GOOGLE_CLIENT_SECRET)
    );
    oauth2Client.setCredentials({ refresh_token: cleanText(process.env.GOOGLE_REFRESH_TOKEN) });
    return google.gmail({ version: "v1", auth: oauth2Client });
}

function encodeBase64Url(value) {
    return Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

async function sendPlainEmail(to, subject, body) {
    if (!gmailConfigured() || !to) {
        return { sent: false, reason: "gmail-not-configured" };
    }

    const from = cleanText(process.env.GMAIL_USER);
    const raw = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(body, "utf8").toString("base64")
    ].join("\r\n");

    const result = await gmailClient().users.messages.send({
        userId: "me",
        requestBody: { raw: encodeBase64Url(raw) }
    });
    return { sent: true, messageId: result.data?.id || "" };
}

function reminderEmail(workspace) {
    const deletionDate = new Date(workspace.expires_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata"
    });

    return {
        subject: "Your GrowWithHR company data will be deleted in 7 days",
        body: [
            "Hello,",
            "",
            `The reusable company information associated with your GrowWithHR workspace is scheduled for automatic deletion on ${deletionDate}.`,
            "",
            `Report ID: ${workspace.current_report_id}`,
            "",
            "GrowWithHR stores this information in its database temporarily so you can return and use another intelligence analysis without entering the same company information again.",
            "",
            "After the scheduled deletion date, the reusable company information cannot be recovered.",
            "",
            "No action is required if you are comfortable with the scheduled deletion.",
            "",
            "Warm Wishes,",
            "Anurag Sinha",
            "Founder, HRTechify"
        ].join("\n")
    };
}

function deletionEmail(workspace, deletedAt) {
    const deletionDate = new Date(deletedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata"
    });

    return {
        subject: "Your GrowWithHR company data has been deleted",
        body: [
            "Hello,",
            "",
            `This confirms that the reusable company information associated with your GrowWithHR workspace was deleted on ${deletionDate} under GrowWithHR's six-month data-retention policy.`,
            "",
            `Report ID: ${workspace.current_report_id}`,
            "",
            "Your previously downloaded GrowWithHR report remains yours to retain. GrowWithHR can no longer restore the reusable company information that was stored to support continued intelligence analyses.",
            "",
            "If you use GrowWithHR again after deletion, start a new analysis and provide current company information.",
            "",
            "Warm Wishes,",
            "Anurag Sinha",
            "Founder, HRTechify"
        ].join("\n")
    };
}

async function markDeletionNotification(workspace, sentAt) {
    await supabase(`company_workspaces?id=eq.${encodeURIComponent(workspace.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
            deletion_confirmation_sent_at: sentAt,
            email: "",
            updated_at: sentAt
        })
    });
}

async function sendDeletionConfirmation(workspace, deletedAt) {
    if (!cleanText(workspace.email)) return { sent: false, reason: "no-email" };
    const message = deletionEmail(workspace, deletedAt);
    const notification = await sendPlainEmail(workspace.email, message.subject, message.body);
    if (notification.sent) {
        await markDeletionNotification(workspace, new Date().toISOString());
    }
    return notification;
}

async function deleteWorkspaceData(workspace, { reason = "expiry" } = {}) {
    const deletedAt = new Date().toISOString();
    await supabase(`company_workspaces?id=eq.${encodeURIComponent(workspace.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
            encrypted_company_data: encryptJson({}),
            access_key_hash: "",
            completed_engines: [],
            company_name: "",
            deletion_started_at: workspace.deletion_started_at || deletedAt,
            deletion_completed_at: deletedAt,
            status: "deleted",
            updated_at: deletedAt
        })
    });

    let notification = { sent: false };
    try {
        notification = await sendDeletionConfirmation(workspace, deletedAt);
    } catch (error) {
        console.error("GrowWithHR deletion confirmation email failed.", error);
    }

    return {
        reason,
        deletedAt,
        notificationSent: Boolean(notification.sent)
    };
}

async function eraseWorkspace(input = {}) {
    const reportId = assertReportId(input.reportId);
    const workspace = await findWorkspace(reportId);
    verifyAccess(workspace, input.accessKey);
    const result = await deleteWorkspaceData(workspace, { reason: "user-request" });
    return { deleted: true, reportId, ...result };
}

async function retryDeletionConfirmations() {
    const rows = await supabase(
        `company_workspaces?status=eq.deleted&deletion_confirmation_sent_at=is.null&limit=${MAX_SWEEP_ROWS}`,
        { method: "GET" }
    );

    let sent = 0;
    for (const workspace of rows || []) {
        if (!cleanText(workspace.email)) continue;
        try {
            const result = await sendDeletionConfirmation(
                workspace,
                workspace.deletion_completed_at || new Date().toISOString()
            );
            if (result.sent) sent += 1;
        } catch (error) {
            console.error("GrowWithHR deletion confirmation retry failed.", error);
        }
    }
    return sent;
}

async function runRetentionSweep() {
    if (!configured()) {
        return {
            configured: false,
            reminders: 0,
            deletions: 0,
            confirmationRetries: 0
        };
    }

    const now = new Date().toISOString();
    const reminderRows = await supabase(
        `company_workspaces?status=eq.active&reminder_sent_at=is.null&reminder_due_at=lte.${encodeURIComponent(now)}&expires_at=gt.${encodeURIComponent(now)}&limit=${MAX_SWEEP_ROWS}`,
        { method: "GET" }
    );

    let reminders = 0;
    for (const workspace of reminderRows || []) {
        const message = reminderEmail(workspace);
        try {
            const result = await sendPlainEmail(workspace.email, message.subject, message.body);
            if (result.sent) {
                reminders += 1;
                await supabase(`company_workspaces?id=eq.${encodeURIComponent(workspace.id)}`, {
                    method: "PATCH",
                    body: JSON.stringify({ reminder_sent_at: new Date().toISOString() })
                });
            }
        } catch (error) {
            console.error("GrowWithHR retention reminder failed.", error);
        }
    }

    const expiredRows = await supabase(
        `company_workspaces?status=eq.active&expires_at=lte.${encodeURIComponent(now)}&limit=${MAX_SWEEP_ROWS}`,
        { method: "GET" }
    );

    let deletions = 0;
    for (const workspace of expiredRows || []) {
        try {
            await deleteWorkspaceData(workspace);
            deletions += 1;
        } catch (error) {
            console.error("GrowWithHR workspace deletion failed.", error);
        }
    }

    const confirmationRetries = await retryDeletionConfirmations();
    return {
        configured: true,
        reminders,
        deletions,
        confirmationRetries
    };
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The Company Workspace request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(Object.assign(new Error("The Company Workspace request contains invalid JSON."), { statusCode: 400 }));
            }
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

async function dispatch(request, response, pathname) {
    try {
        if (request.method !== "POST") {
            writeJson(response, 405, { error: "Method not allowed." });
            return;
        }

        const input = await readJsonBody(request);
        if (pathname === "/api/company-workspace/create") {
            writeJson(response, 201, { ok: true, workspace: await createWorkspace(input) });
            return;
        }
        if (pathname === "/api/company-workspace/recover") {
            writeJson(response, 200, { ok: true, workspace: await recoverWorkspace(input) });
            return;
        }
        if (pathname === "/api/company-workspace/complete") {
            writeJson(response, 200, { ok: true, workspace: await completeAnalysis(input) });
            return;
        }
        if (pathname === "/api/company-workspace/delete") {
            writeJson(response, 200, { ok: true, ...(await eraseWorkspace(input)) });
            return;
        }
        if (pathname === "/api/company-workspace/retention/run") {
            const supplied = cleanText(request.headers["x-retention-secret"] || input.secret);
            const expected = cleanText(process.env.WORKSPACE_RETENTION_SECRET);
            if (!expected || !safeEqualText(supplied, expected)) {
                writeJson(response, 401, { error: "Unauthorized." });
                return;
            }
            writeJson(response, 200, { ok: true, ...(await runRetentionSweep()) });
        }
    } catch (error) {
        writeJson(response, Number(error.statusCode) || 503, {
            error: cleanText(error.message, "Company Workspace request failed.")
        });
    }
}

function handleCompanyWorkspaceRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (!ROUTES.has(pathname)) return false;
    dispatch(request, response, pathname);
    return true;
}

let schedulerStarted = false;
function startCompanyWorkspaceRetentionScheduler() {
    if (schedulerStarted) return;
    schedulerStarted = true;
    const run = () => runRetentionSweep()
        .catch((error) => console.error("GrowWithHR retention scheduler failed.", error));
    setTimeout(run, 15000).unref?.();
    setInterval(run, RETENTION_INTERVAL_MS).unref?.();
}

module.exports = {
    handleCompanyWorkspaceRequest,
    startCompanyWorkspaceRetentionScheduler,
    runRetentionSweep,
    createWorkspace,
    recoverWorkspace,
    completeAnalysis,
    eraseWorkspace,
    retentionDates,
    addCalendarMonths,
    generateAccessKey,
    hashAccessKey,
    mergeCompanyData,
    supabaseAuthHeaders
};
