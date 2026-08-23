"use strict";

const crypto = require("crypto");
const { google } = require("googleapis");
const { allocateReportId } = require("./server-report-id-registry");
const { createWorkspace, completeAnalysis } = require("./server-company-workspace-v2");

const ROUTES = new Set([
    "/api/account/legacy-recovery",
    "/api/account/report/legacy-ensure",
    "/api/account/report/email"
]);
const MAX_REQUEST_BYTES = 256 * 1024;
const DEFAULT_PUBLIC_APP_URL = "https://hrtechifyed.github.io/GrowwithHR-Version2";

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function writeJson(response, statusCode, payload) {
    if (response.writableEnded) return;
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function configured() {
    return Boolean(
        cleanText(process.env.SUPABASE_URL) &&
        cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
        cleanText(process.env.SUPABASE_ANON_KEY)
    );
}

function supabaseBase() {
    return cleanText(process.env.SUPABASE_URL).replace(/\/+$/, "");
}

function serviceHeaders() {
    const key = cleanText(process.env.SUPABASE_SERVICE_ROLE_KEY);
    return {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
    };
}

async function serviceRest(path, options = {}) {
    if (!configured()) {
        throw Object.assign(new Error("GrowWithHR account reporting is not configured."), { statusCode: 503 });
    }
    const response = await fetch(`${supabaseBase()}/rest/v1/${path}`, {
        ...options,
        headers: {
            ...serviceHeaders(),
            Prefer: options.prefer || "return=representation",
            ...(options.headers || {})
        }
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; }
    catch (_error) { payload = text; }
    if (!response.ok) {
        throw Object.assign(new Error(cleanText(payload?.message || payload?.error || payload, "Account report database request failed.")), {
            statusCode: response.status >= 500 ? 503 : response.status
        });
    }
    return payload;
}

function bearerToken(request) {
    const header = cleanText(request.headers.authorization);
    const match = /^Bearer\s+(.+)$/i.exec(header);
    return match ? cleanText(match[1]) : "";
}

async function authenticatedUser(request) {
    const token = bearerToken(request);
    if (!token) throw Object.assign(new Error("Sign in is required."), { statusCode: 401 });
    if (!configured()) throw Object.assign(new Error("GrowWithHR account authentication is not configured."), { statusCode: 503 });

    const response = await fetch(`${supabaseBase()}/auth/v1/user`, {
        headers: {
            apikey: cleanText(process.env.SUPABASE_ANON_KEY),
            Authorization: `Bearer ${token}`
        }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.id) {
        throw Object.assign(new Error("Your GrowWithHR sign-in session is no longer valid."), { statusCode: 401 });
    }
    return body;
}

function recoveryEncryptionSecret() {
    return cleanText(process.env.WORKSPACE_ENCRYPTION_SECRET || process.env.REPORT_ID_ALLOCATOR_SECRET);
}

function recoveryEncryptionKey() {
    const secret = recoveryEncryptionSecret();
    if (!secret) throw Object.assign(new Error("Legacy recovery encryption is not configured."), { statusCode: 503 });
    return crypto.createHash("sha256").update(`growwithhr-account-recovery:${secret}`).digest();
}

function encryptRecoveryCode(value) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", recoveryEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(cleanText(value), "utf8"), cipher.final()]);
    return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

function decryptRecoveryCode(value) {
    const [version, ivText, tagText, encryptedText] = cleanText(value).split(".");
    if (version !== "v1" || !ivText || !tagText || !encryptedText) throw new Error("Stored legacy recovery credentials are invalid.");
    const decipher = crypto.createDecipheriv("aes-256-gcm", recoveryEncryptionKey(), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
}

async function accountReport(userId, reportId) {
    const id = cleanText(reportId);
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw Object.assign(new Error("A valid account report is required."), { statusCode: 400 });
    const rows = await serviceRest(`reports?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`, { method: "GET" });
    const report = Array.isArray(rows) ? rows[0] || null : null;
    if (!report) throw Object.assign(new Error("That report was not found in your GrowWithHR account."), { statusCode: 404 });
    return report;
}

async function recoveryRecord(userId) {
    const rows = await serviceRest(`account_legacy_recovery?user_id=eq.${encodeURIComponent(userId)}&limit=1`, { method: "GET" });
    return Array.isArray(rows) ? rows[0] || null : null;
}

function companyContext(report, user) {
    const payload = asObject(report.payload);
    const answers = asObject(payload.answers);
    const legacyAssessment = asObject(payload.legacyAssessment);
    const legacyAnswers = asObject(legacyAssessment.answers);
    const companyName = cleanText(
        answers.companyName ||
        legacyAnswers.companyName ||
        payload.companyName ||
        report.title?.split("·")?.[0],
        "Your company"
    );
    const industry = cleanText(answers.industry || legacyAnswers.industry);
    const employees = answers.employees ?? legacyAnswers.employees ?? legacyAnswers.totalEmployees ?? null;
    return {
        companyName,
        companyData: {
            shared: {
                companyName,
                email: cleanText(user.email).toLowerCase(),
                industry,
                employees
            },
            accountLink: {
                reportUuid: report.id,
                engine: report.engine,
                title: report.title
            }
        }
    };
}

function publicAppUrl() {
    return cleanText(process.env.GROWWITHHR_PUBLIC_APP_URL, DEFAULT_PUBLIC_APP_URL).replace(/\/+$/, "");
}

function reportUrl(report) {
    return `${publicAppUrl()}/account-report.html?report=${encodeURIComponent(report.id)}`;
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
    return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeHeader(value) {
    return cleanText(value).replace(/[\r\n]+/g, " ");
}

function htmlEscape(value) {
    return cleanText(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function sendHtmlEmail({ to, subject, text, html }) {
    if (!gmailConfigured()) return { sent: false, reason: "gmail-not-configured" };
    const from = cleanText(process.env.GMAIL_USER).toLowerCase();
    const replyTo = cleanText(process.env.REPLY_TO_EMAIL, from);
    const boundary = `alternative_${crypto.randomUUID()}`;
    const raw = [
        `From: \"GrowWithHR\" <${safeHeader(from)}>`,
        `To: ${safeHeader(to)}`,
        `Reply-To: ${safeHeader(replyTo)}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary=\"${boundary}\"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(text, "utf8").toString("base64"),
        "",
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(html, "utf8").toString("base64"),
        "",
        `--${boundary}--`,
        ""
    ].join("\r\n");
    const result = await gmailClient().users.messages.send({ userId: "me", requestBody: { raw: encodeBase64Url(raw) } });
    return { sent: true, messageId: result.data?.id || "" };
}

async function sendRecoveryCredentialsEmail(user, report, legacyReportId, recoveryCode) {
    const to = cleanText(user.email).toLowerCase();
    if (!to) return { sent: false, reason: "no-email" };
    const subject = "Your GrowWithHR legacy recovery credentials";
    const text = [
        "Hello,",
        "",
        "Your first GrowWithHR report has created a permanent legacy recovery fallback for this account.",
        "",
        `First report: ${report.title}`,
        `Report ID: ${legacyReportId}`,
        `Recovery Code: ${recoveryCode}`,
        "",
        "Keep these credentials securely. Future GrowWithHR reports generated from this account are linked into the same legacy recovery workspace, while each report may receive its own Report ID.",
        "",
        "You normally do not need these credentials when you can sign in. They are retained as a fallback recovery route.",
        "",
        "Warm Wishes,",
        "Anurag Sinha",
        "Founder, HRTechify"
    ].join("\n");
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#172033;line-height:1.6"><h2>GrowWithHR legacy recovery</h2><p>Your first GrowWithHR report has created a legacy fallback for your account.</p><p><strong>First report:</strong> ${htmlEscape(report.title)}<br><strong>Report ID:</strong> ${htmlEscape(legacyReportId)}<br><strong>Recovery Code:</strong> ${htmlEscape(recoveryCode)}</p><p>Keep these credentials securely. Future reports generated from this account are linked into the same legacy recovery workspace. When you can sign in, use <strong>My GrowWithHR</strong> instead.</p><p>Warm Wishes,<br>Anurag Sinha<br>Founder, HRTechify</p></body></html>`;
    return sendHtmlEmail({ to, subject, text, html });
}

async function patchReport(reportId, patch) {
    const rows = await serviceRest(`reports?id=eq.${encodeURIComponent(reportId)}`, {
        method: "PATCH",
        body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
    });
    return rows?.[0] || null;
}

async function createRecoveryRecord(user, report) {
    const context = companyContext(report, user);
    const allocation = await allocateReportId({
        requestKey: `account-first-report:${user.id}:${report.id}`,
        userKey: user.id,
        companyName: context.companyName,
        assessmentId: report.assessment_id || report.id
    });
    const workspace = await createWorkspace({
        reportId: allocation.reportId,
        email: user.email,
        companyName: context.companyName,
        companyData: context.companyData,
        completedEngine: report.engine
    });
    const now = new Date().toISOString();
    const inserted = await serviceRest("account_legacy_recovery", {
        method: "POST",
        body: JSON.stringify({
            user_id: user.id,
            first_report_id: report.id,
            recovery_report_id: allocation.reportId,
            current_report_id: allocation.reportId,
            encrypted_recovery_code: encryptRecoveryCode(workspace.accessKey),
            created_at: now,
            updated_at: now
        })
    });
    await patchReport(report.id, { legacy_report_id: allocation.reportId });
    const row = inserted?.[0];
    let credentialEmail = { sent: false, reason: "not-attempted" };
    try {
        credentialEmail = await sendRecoveryCredentialsEmail(user, report, allocation.reportId, workspace.accessKey);
        if (credentialEmail.sent) {
            const sentAt = new Date().toISOString();
            await serviceRest(`account_legacy_recovery?user_id=eq.${encodeURIComponent(user.id)}`, {
                method: "PATCH",
                body: JSON.stringify({ credentials_emailed_at: sentAt, updated_at: sentAt })
            });
            row.credentials_emailed_at = sentAt;
        }
    } catch (error) {
        console.error("GrowWithHR legacy recovery credential email failed.", error);
    }
    return { row, recoveryCode: workspace.accessKey, credentialEmail };
}

async function linkReportToExistingRecovery(user, report, recovery) {
    if (cleanText(report.legacy_report_id)) {
        return { row: recovery, recoveryCode: decryptRecoveryCode(recovery.encrypted_recovery_code), linkedReportId: report.legacy_report_id };
    }
    const recoveryCode = decryptRecoveryCode(recovery.encrypted_recovery_code);
    const context = companyContext(report, user);
    const allocation = await allocateReportId({
        requestKey: `account-report:${user.id}:${report.id}`,
        userKey: user.id,
        companyName: context.companyName,
        assessmentId: report.assessment_id || report.id,
        previousReportId: recovery.current_report_id
    });
    await completeAnalysis({
        reportId: recovery.current_report_id,
        newReportId: allocation.reportId,
        accessKey: recoveryCode,
        completedEngine: report.engine,
        companyName: context.companyName,
        companyData: context.companyData
    });
    const now = new Date().toISOString();
    const rows = await serviceRest(`account_legacy_recovery?user_id=eq.${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ current_report_id: allocation.reportId, updated_at: now })
    });
    await patchReport(report.id, { legacy_report_id: allocation.reportId });
    return { row: rows?.[0] || { ...recovery, current_report_id: allocation.reportId }, recoveryCode, linkedReportId: allocation.reportId };
}

async function ensureLegacyRecovery(user, reportId) {
    const report = await accountReport(user.id, reportId);
    let recovery = await recoveryRecord(user.id);
    if (!recovery) {
        const created = await createRecoveryRecord(user, report);
        return {
            created: true,
            firstReportId: report.id,
            recoveryReportId: created.row.recovery_report_id,
            currentReportId: created.row.current_report_id,
            recoveryCode: created.recoveryCode,
            reportLegacyId: created.row.recovery_report_id,
            credentialsEmailedAt: created.row.credentials_emailed_at || null
        };
    }
    const linked = await linkReportToExistingRecovery(user, report, recovery);
    return {
        created: false,
        firstReportId: recovery.first_report_id,
        recoveryReportId: recovery.recovery_report_id,
        currentReportId: linked.row.current_report_id || recovery.current_report_id,
        recoveryCode: linked.recoveryCode,
        reportLegacyId: linked.linkedReportId || report.legacy_report_id,
        credentialsEmailedAt: recovery.credentials_emailed_at || null
    };
}

async function getLegacyRecovery(user) {
    let recovery = await recoveryRecord(user.id);
    if (!recovery) {
        const reports = await serviceRest(`reports?user_id=eq.${encodeURIComponent(user.id)}&order=created_at.asc&limit=1`, { method: "GET" });
        const first = Array.isArray(reports) ? reports[0] || null : null;
        if (!first) return null;
        return ensureLegacyRecovery(user, first.id);
    }
    return {
        created: false,
        firstReportId: recovery.first_report_id,
        recoveryReportId: recovery.recovery_report_id,
        currentReportId: recovery.current_report_id,
        recoveryCode: decryptRecoveryCode(recovery.encrypted_recovery_code),
        credentialsEmailedAt: recovery.credentials_emailed_at || null
    };
}

async function emailAccountReport(user, reportId) {
    const report = await accountReport(user.id, reportId);
    const legacy = await ensureLegacyRecovery(user, report.id);
    const to = cleanText(user.email).toLowerCase();
    if (!to) throw Object.assign(new Error("Your signed-in account does not have an email address."), { statusCode: 400 });
    const url = reportUrl(report);
    const subject = `Your GrowWithHR report: ${report.title}`;
    const text = [
        "Hello,",
        "",
        `You asked GrowWithHR to email this report again: ${report.title}.`,
        "",
        `Open your report securely: ${url}`,
        "",
        "Sign in with the GrowWithHR account that generated the report. The report itself is not exposed through a public link.",
        "",
        `Legacy Report ID: ${legacy.reportLegacyId || legacy.recoveryReportId}`,
        "",
        "Warm Wishes,",
        "Anurag Sinha",
        "Founder, HRTechify"
    ].join("\n");
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#172033;line-height:1.6"><h2>Your GrowWithHR report</h2><p>You asked GrowWithHR to email this report again:</p><p><strong>${htmlEscape(report.title)}</strong></p><p><a href="${htmlEscape(url)}" style="display:inline-block;padding:12px 18px;background:#1769e0;color:#fff;text-decoration:none;border-radius:8px">Open report securely</a></p><p>Sign in with the GrowWithHR account that generated the report. The report is not exposed through a public link.</p><p><strong>Legacy Report ID:</strong> ${htmlEscape(legacy.reportLegacyId || legacy.recoveryReportId)}</p><p>Warm Wishes,<br>Anurag Sinha<br>Founder, HRTechify</p></body></html>`;
    const delivery = await sendHtmlEmail({ to, subject, text, html });
    if (!delivery.sent) throw Object.assign(new Error("Report email delivery is not configured on the server yet."), { statusCode: 503 });
    const sentAt = new Date().toISOString();
    const count = Math.max(0, Number(report.email_count) || 0) + 1;
    await patchReport(report.id, { last_emailed_at: sentAt, email_count: count });
    return { sent: true, sentAt, email: to, emailCount: count, reportId: report.id, legacyReportId: legacy.reportLegacyId || legacy.recoveryReportId };
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_REQUEST_BYTES) {
                reject(Object.assign(new Error("The account report request is too large."), { statusCode: 413 }));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on("end", () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
            catch (_error) { reject(Object.assign(new Error("The account report request contains invalid JSON."), { statusCode: 400 })); }
        });
        request.on("error", reject);
    });
}

async function dispatch(request, response, pathname) {
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
        const user = await authenticatedUser(request);
        const input = await readJsonBody(request);
        if (pathname === "/api/account/legacy-recovery") {
            writeJson(response, 200, { ok: true, recovery: await getLegacyRecovery(user) });
            return;
        }
        if (pathname === "/api/account/report/legacy-ensure") {
            writeJson(response, 200, { ok: true, recovery: await ensureLegacyRecovery(user, input.reportId) });
            return;
        }
        if (pathname === "/api/account/report/email") {
            writeJson(response, 200, { ok: true, delivery: await emailAccountReport(user, input.reportId) });
        }
    } catch (error) {
        console.error("GrowWithHR account report service failed.", error);
        writeJson(response, Number(error.statusCode) || 503, { error: cleanText(error.message, "Account report request failed.") });
    }
}

function handleAccountReportServiceRequest(request, response) {
    const pathname = cleanText(request.url).split("?")[0];
    if (!ROUTES.has(pathname)) return false;
    dispatch(request, response, pathname);
    return true;
}

module.exports = {
    ROUTES,
    handleAccountReportServiceRequest,
    authenticatedUser,
    ensureLegacyRecovery,
    getLegacyRecovery,
    emailAccountReport,
    encryptRecoveryCode,
    decryptRecoveryCode
};
