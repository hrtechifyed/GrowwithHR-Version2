import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");

const hub = read("intelligence-hub.html");
const orgEntry = read("js/organization-growth-beta.mjs");
const orgFlow = read("js/organization-growth-zero-cost.mjs");
const reportEntry = read("js/organization-growth-report-beta.mjs");
const reportFlow = read("js/organization-growth-report-zero-cost.mjs");
const vault = read("js/zero-cost-report-vault.mjs");
const myReports = read("my-reports.html");
const myReportsJs = read("js/my-reports-zero-cost.mjs");
const authGuard = read("js/auth-guard.js");
const complianceBridge = read("js/compliance-account-bridge.js");
const complianceReport = read("executive-advisory-report.html");
const complianceRecovery = read("compliance-report-recover.html");
const migration = read("supabase/migrations/20260823_zero_cost_report_vault_prototype.sql");
const edge = read("supabase/functions/growwithhr-prototype-report-vault/index.ts");
const supabaseConfig = read("supabase/config.toml");

assert.match(hub, /No account is required/i);
assert.doesNotMatch(hub, /href="auth\.html/);
assert.match(hub, /Report ID \+ Recovery Code/i);

assert.match(orgEntry, /organization-growth-zero-cost\.mjs/);
assert.doesNotMatch(orgFlow, /auth-client/);
assert.match(orgFlow, /auto-save/i);
assert.match(orgFlow, /saveReport/);
assert.match(orgFlow, /zero-cost-draft/);

assert.match(reportEntry, /organization-growth-report-zero-cost\.mjs/);
assert.doesNotMatch(reportFlow, /auth-client/);
assert.match(reportFlow, /Keep these recovery details/);
assert.match(reportFlow, /updateReport/);
assert.match(reportFlow, /The final organization decision remains yours/);

assert.match(vault, /PBKDF2/);
assert.match(vault, /AES-GCM/);
assert.match(vault, /180000/);
assert.match(vault, /growwithhr-prototype-report-vault/);
assert.match(vault, /recoverWorkspace/);
assert.match(vault, /listLocalReports/);

assert.match(myReports, /Recover report history/);
assert.match(myReports, /Reports on this browser/);
assert.match(myReportsJs, /recoverWorkspace/);
assert.match(myReportsJs, /organization-growth-report-beta\.html/);
assert.match(myReportsJs, /compliance-report-recover\.html/);

assert.doesNotMatch(authGuard, /location\.replace/);
assert.doesNotMatch(complianceBridge, /auth-client/);
assert.match(complianceReport, /compliance-zero-cost-report-bridge\.mjs/);
assert.match(complianceRecovery, /Report ID and Recovery Code/i);

assert.match(migration, /prototype_report_workspaces/);
assert.match(migration, /prototype_saved_reports/);
assert.match(migration, /enable row level security/i);
assert.match(migration, /revoke all on function public\.prototype_allocate_report_id\(\) from public/i);
assert.match(edge, /verifyWorkspace/);
assert.match(edge, /recovery_hash/);
assert.match(edge, /action === "update"/);
assert.match(edge, /origin === "https:\/\/hrtechifyed\.github\.io"/);
assert.match(supabaseConfig, /verify_jwt = false/);

console.log("Zero-cost GrowWithHR prototype contract checks passed.");
