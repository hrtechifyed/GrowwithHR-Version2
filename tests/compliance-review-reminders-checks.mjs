import assert from "node:assert/strict";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const workspaceApi = require("../server-company-workspace-v2.js");
const reminders = require("../server-compliance-review-reminders.js");
const REPORT_ID = "GWHR-2026-1010-AB12";
const WORKSPACE_ID = "6aa469e6-7dd4-4be7-b8bf-96364b4bd5b9";
const workspace = {
  id: WORKSPACE_ID,
  status: "active",
  current_report_id: REPORT_ID,
  last_compliance_report_id: REPORT_ID,
  completed_engines: ["compliance"],
  email: "founder@example.org",
  expires_at: "2027-04-23T12:00:00.000Z"
};
let record = null;
const mail = [];
process.env.SUPABASE_URL = "https://zyypqpzloeczvkyfdznm.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key-only";
process.env.GMAIL_USER = "test-sender@example.org";
process.env.WORKSPACE_ENCRYPTION_SECRET = "test-only-strong-32-byte-workspace-encryption-secret";
const originalFetch = globalThis.fetch;
globalThis.fetch = async url => {
  assert.match(String(url), /\/auth\/v1\/user$/);
  return {
    ok: true,
    async json() { return { email: workspace.email, email_confirmed_at: new Date().toISOString() }; }
  };
};
const original = Object.fromEntries(
  ["findWorkspace", "verifyAccess", "supabase", "sendPlainEmail", "configured"].map(name => [name, workspaceApi[name]])
);
workspaceApi.findWorkspace = async () => workspace;
workspaceApi.verifyAccess = (candidate, key) => {
  assert.equal(candidate, workspace);
  assert.equal(key, "only-the-recovery-code");
};
workspaceApi.configured = () => true;
workspaceApi.sendPlainEmail = async (to, subject, text) => {
  mail.push({ to, subject, text });
  return { sent: true };
};
workspaceApi.supabase = async (path, options = {}) => {
  const body = options.body ? JSON.parse(options.body) : null;
  if (path.startsWith("company_workspaces?id=eq.")) return [workspace];
  if (path.includes("on_conflict=workspace_id")) {
    record = { ...(record || {}), ...body };
    return [record];
  }
  if (path.startsWith("compliance_review_reminders?unsubscribe_token_hash=eq.")) {
    return record?.unsubscribe_token_hash === path.split("unsubscribe_token_hash=eq.")[1]?.split("&")[0] ? [record] : [];
  }
  if (!path.startsWith("compliance_review_reminders?")) {
    throw new Error("Unexpected DB path " + path);
  }
  if (path.includes("status=eq.active&next_review_at=lte.")) {
    return record?.status === "active" && record.next_review_at &&
        Date.parse(record.next_review_at) <= Date.now() && !record.claimed_at ? [record] : [];
  }
  if (path.includes("claimed_at=lt.")) return [];
  if (options.method === "GET") return record ? [record] : [];
  if (options.method === "PATCH") {
    if (!record) return [];
    if (path.includes("status=eq.active") && record.status !== "active") return [];
    if (path.includes("claimed_at=is.null") && record.claimed_at) return [];
    if (path.includes("unsubscribe_token_hash=eq.") &&
        !path.includes(record.unsubscribe_token_hash || "!missing")) return [];
    record = { ...record, ...body };
    return [record];
  }
  throw new Error("Unexpected DB operation " + path + " " + options.method);
};
const keys = { reportId: REPORT_ID, accessKey: "only-the-recovery-code" };
const loggedIn = { headers: { authorization: "Bearer confirmed-user-jwt" } };

try {
  assert.deepEqual(await reminders.status(keys), { status: "off" });
  await assert.rejects(reminders.enroll({ ...keys, email: workspace.email, cadence: "monthly", confirm: true }), /Sign in/);
  assert.equal(record, null, "Unauthenticated users must never be enrolled.");

  await assert.rejects(reminders.enroll({ ...keys, email: workspace.email, cadence: "monthly", confirm: false }, loggedIn), /Explicit confirmation/);
  assert.equal(record, null, "Clicking Yes without Start reminders must create no consent record.");

  await assert.rejects(reminders.enroll({ ...keys, email: "stranger@example.org", cadence: "monthly", confirm: true }, loggedIn), /Confirm the original work email/);
  assert.equal(record, null);
  const enabled = await reminders.enroll({ ...keys, email: workspace.email, cadence: "monthly", confirm: true }, loggedIn);
  assert.equal(enabled.status, "active");
  assert.equal(enabled.cadence, "monthly");
  assert.equal(record.consent_version, "2026-10-23-v1");
  assert.equal(mail.length, 0, "Enrolling should not send an unrequested transactional email.");
  assert.ok(record.next_review_at);
  const same = await reminders.enroll({ ...keys, email: workspace.email, cadence: "monthly", confirm: true }, loggedIn);
  assert.equal(same.nextReviewAt, enabled.nextReviewAt, "Repeated clicks must not duplicate a schedule.");

  const paused = await reminders.manage({ ...keys, action: "pause" }, loggedIn);
  assert.equal(paused.status, "paused");
  assert.equal(mail.length, 0);
  const resumed = await reminders.manage({ ...keys, action: "resume" }, loggedIn);
  assert.equal(resumed.status, "active");

  record.next_review_at = new Date(Date.now() - 60_000).toISOString();
  const dispatched = await reminders.runReviewReminders();
  assert.equal(dispatched.sent, 1);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].to, workspace.email);
  assert.match(mail[0].subject, /review your HR Compliance Readiness/i);
  assert.match(mail[0].text, /not a statutory deadline notice/i);
  assert.doesNotMatch(mail[0].text, /penalty imminent/i);

  const sentAgain = await reminders.runReviewReminders();
  assert.equal(sentAgain.sent, 0, "Already-sent periods must not produce duplicates.");
  const match = mail[0].text.match(/#token=([a-zA-Z0-9_-]+)/);
  assert.ok(match, "Reminder must contain a self-service unsubscribe link.");
  assert.equal(record.unsubscribe_token_hash, crypto.createHash("sha256").update(match[1]).digest("hex"));
  assert.ok(!JSON.stringify(record).includes(match[1]), "Raw token must not persist in the DB record.");
  assert.equal((await reminders.unsubscribe({ token: match[1] })).stopped, true);
  assert.equal(record.status, "revoked");
  assert.equal(record.unsubscribe_token_hash, null);
  assert.equal((await reminders.runReviewReminders()).sent, 0);
  await assert.rejects(reminders.manage({ ...keys, action: "resume" }, loggedIn), /fresh reminder opt-in|new opt-in/i);

  const server = fs.readFileSync(new URL("../server-entry.js", import.meta.url), "utf8");
  const continuity = fs.readFileSync(new URL("../js/company-workspace-continuity.js", import.meta.url), "utf8");
  const prompt = fs.readFileSync(new URL("../js/compliance-review-prompt.js", import.meta.url), "utf8");
  const privacy = fs.readFileSync(new URL("../more-info.html", import.meta.url), "utf8");
  assert.match(server, /handleReviewReminderRequest/);
  assert.match(server, /startReviewReminderScheduler/);
  assert.match(continuity, /compliance-review-prompt\.js/);
  assert.match(prompt, /No, thanks/);
  assert.match(prompt, /Yes, set up reminders/);
  assert.match(prompt, /Start reminders/);
  assert.match(prompt, /requireMatchingSession/);
  assert.match(prompt, /confirm: true/);
  assert.match(privacy, /The default is <strong>no reminders<\/strong>/);
  for (const file of ["server-compliance-review-reminders.js", "js/company-workspace-continuity.js", "js/company-workspace-client.js", "js/reminder-preferences.js"]) {
    execFileSync(process.execPath, ["--check", file]);
  }
  console.log("Consent-first compliance review reminder checks passed.");
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(workspaceApi, original);
}
