import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const migration = read("supabase/migrations/20260823_account_workspace_prototype.sql");
const authClient = read("js/auth-client.js");
const dashboard = read("js/my-growwithhr.js");
const dashboardHtml = read("my-growwithhr.html");
const service = read("server-account-report-service.js");
const serverEntry = read("server-entry.js");
const accountReport = read("js/account-report.js");

assert.match(migration, /account_legacy_recovery/);
assert.match(migration, /recovery_report_id text not null unique/);
assert.match(migration, /legacy_report_id text unique/);
assert.match(migration, /email_count integer not null default 0/);
assert.match(migration, /no browser\/client policy for account_legacy_recovery/i);

assert.match(service, /account-first-report:/);
assert.match(service, /account-report:/);
assert.match(service, /createWorkspace/);
assert.match(service, /completeAnalysis/);
assert.match(service, /sendRecoveryCredentialsEmail/);
assert.match(service, /emailAccountReport/);
assert.match(service, /Sign in with the GrowWithHR account that generated the report/);
assert.match(serverEntry, /handleAccountReportServiceRequest/);

assert.match(authClient, /ensureLegacyRecoveryForReport/);
assert.match(authClient, /getLegacyRecoveryCredentials/);
assert.match(authClient, /emailReportAgain/);
assert.match(authClient, /legacy_report_id,last_emailed_at,email_count/);

assert.match(dashboard, /Oldest report is processed first/);
assert.match(dashboard, /data-email-report/);
assert.match(dashboardHtml, /Legacy recovery fallback/);
assert.match(dashboardHtml, /Open Legacy Report Recovery/);
assert.match(dashboardHtml, /All reports from this account/);

assert.match(accountReport, /growwithhr-report/);
assert.match(accountReport, /executive-advisory-report\.html\?accountRestored=1/);
assert.match(accountReport, /organization-growth-report-beta\.html\?report=/);

console.log("Account report recovery prototype contract checks passed.");
