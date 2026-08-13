import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const workspace = require("../server-company-workspace.js");

const start = new Date("2026-08-13T12:00:00.000Z");
const dates = workspace.retentionDates(start);
assert.ok(new Date(dates.expiresAt) > start, "expiry must be after creation");
assert.equal(
  new Date(dates.expiresAt).getTime() - new Date(dates.reminderDueAt).getTime(),
  7 * 24 * 60 * 60 * 1000,
  "reminder must be exactly seven days before scheduled deletion"
);

const code = workspace.generateAccessKey();
assert.match(code, /^[A-Z2-9]{4}(?:-[A-Z2-9]{4}){4}$/, "recovery code must use five readable four-character groups");
assert.equal(workspace.hashAccessKey(code), workspace.hashAccessKey(code.toLowerCase()), "recovery-code verification must be case-insensitive");
assert.notEqual(workspace.hashAccessKey(code), code, "raw recovery codes must never be stored as their own verifier");

const migration = fs.readFileSync(new URL("../supabase/migrations/20260813_company_workspaces.sql", import.meta.url), "utf8");
assert.match(migration, /enable row level security/i, "workspace table must have RLS enabled");
assert.match(migration, /reminder_due_at/i, "schema must persist reminder timing");
assert.match(migration, /deletion_confirmation_sent_at/i, "schema must persist deletion-confirmation state");

const hub = fs.readFileSync(new URL("../intelligence-hub.html", import.meta.url), "utf8");
assert.match(hub, /Compliance Intelligence/);
assert.match(hub, /Organization Intelligence/);
assert.match(hub, /six months/i);
assert.match(hub, /seven days/i);

const shell = fs.readFileSync(new URL("../js/site-shell.js", import.meta.url), "utf8");
assert.match(shell, /href:\s*"intelligence-hub\.html"/);
assert.match(shell, /analyze-company\.html/);
assert.match(shell, /engine/);

console.log("Company Workspace retention checks passed.");
