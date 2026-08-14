import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const workspace = require("../server-company-workspace-v2.js");

const august = new Date("2026-08-13T12:00:00.000Z");
const augustRetention = workspace.retentionDates(august);
assert.equal(
  augustRetention.expiresAt,
  "2027-02-13T12:00:00.000Z",
  "six-month retention must use calendar months"
);
assert.equal(
  new Date(augustRetention.expiresAt).getTime() - new Date(augustRetention.reminderDueAt).getTime(),
  7 * 24 * 60 * 60 * 1000,
  "reminder must be exactly seven days before deletion"
);

const monthEnd = workspace.retentionDates(new Date("2026-08-31T08:00:00.000Z"));
assert.equal(
  monthEnd.expiresAt,
  "2027-02-28T08:00:00.000Z",
  "calendar-month retention must clamp safely at shorter month ends"
);

const merged = workspace.mergeCompanyData(
  {
    shared: { companyName: "Acme", employees: 50 },
    compliance: { answers: { primaryState: "Karnataka", entity: "Private Limited" } }
  },
  {
    shared: { employees: 55, growthStage: "Scaling" },
    organization: { managerCount: 6 }
  }
);
assert.equal(merged.shared.companyName, "Acme");
assert.equal(merged.shared.employees, 55);
assert.equal(merged.shared.growthStage, "Scaling");
assert.equal(merged.compliance.answers.primaryState, "Karnataka");
assert.equal(merged.organization.managerCount, 6);

const modernHeaders = workspace.supabaseAuthHeaders("sb_secret_example_only");
assert.equal(modernHeaders.apikey, "sb_secret_example_only");
assert.equal("Authorization" in modernHeaders, false, "modern Supabase secret keys must not be treated as JWT Bearer tokens");

const legacyHeaders = workspace.supabaseAuthHeaders("legacy-jwt-like-value");
assert.equal(legacyHeaders.Authorization, "Bearer legacy-jwt-like-value");

const recoveryCode = workspace.generateAccessKey();
assert.match(recoveryCode, /^[A-Z2-9]{4}(?:-[A-Z2-9]{4}){4}$/);
assert.notEqual(workspace.hashAccessKey(recoveryCode), recoveryCode);
assert.equal(workspace.hashAccessKey(recoveryCode), workspace.hashAccessKey(recoveryCode.toLowerCase()));

const serverFacade = fs.readFileSync(new URL("../server-company-workspace.js", import.meta.url), "utf8");
assert.match(serverFacade, /server-company-workspace-v2/);

const continuity = fs.readFileSync(new URL("../js/company-workspace-continuity.js", import.meta.url), "utf8");
assert.match(continuity, /completedEngine:\s*"compliance"/);
assert.match(continuity, /previousReportId/);
assert.match(continuity, /Workspace Recovery Code/);
assert.match(continuity, /six months/i);
assert.match(continuity, /seven days/i);

const bootstrap = fs.readFileSync(new URL("../js/report-runtime-bootstrap.js", import.meta.url), "utf8");
assert.match(bootstrap, /company-workspace-client\.js/);
assert.match(bootstrap, /company-workspace-continuity\.js/);

const organization = fs.readFileSync(new URL("../organization-intelligence.html", import.meta.url), "utf8");
assert.match(organization, /workspace\.companyData\|\|data/);

const hub = fs.readFileSync(new URL("../intelligence-hub.html", import.meta.url), "utf8");
assert.match(hub, /Delete my reusable company data now/);
assert.match(hub, /GrowWithHRCompanyWorkspace\.erase/);
assert.match(hub, /Read the privacy information/);

const privacy = fs.readFileSync(new URL("../more-info.html", import.meta.url), "utf8");
assert.match(privacy, /six months from your latest completed intelligence analysis/i);
assert.match(privacy, /seven days before the scheduled deletion date/i);
assert.doesNotMatch(privacy, /does not currently maintain a dedicated assessment database/i);

const rootWrangler = fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
assert.match(rootWrangler, /entry-v2\.mjs/);
assert.match(rootWrangler, /"0 \* \* \* \*"/);

const cronEntry = fs.readFileSync(new URL("../cloudflare/report-id-worker/src/entry-v2.mjs", import.meta.url), "utf8");
assert.match(cronEntry, /WORKSPACE_RETENTION_SECRET/);
assert.match(cronEntry, /\/api\/company-workspace\/retention\/run/);
assert.doesNotMatch(cronEntry, /companyData|encrypted_company_data|access_key_hash/);

console.log("Company Workspace continuity hardening checks passed.");
