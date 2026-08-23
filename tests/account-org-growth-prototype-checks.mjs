import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required prototype file: ${file}`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

const auth = read("auth.html");
check(auth.includes("Continue with Google"), "Auth page must offer Google sign-in.");
check(auth.includes("Forgot password"), "Auth page must offer Forgot password.");
check(auth.includes("Create account"), "Auth page must offer account creation.");
check(auth.includes("View sample reports without signing in"), "Sample reports must remain accessible without sign-in.");

const reset = read("reset-password.html");
check(reset.includes("Reset your password"), "Password reset page is required.");

const migration = read("supabase/migrations/20260823_account_workspace_prototype.sql");
for (const table of ["profiles", "companies", "company_memberships", "assessments", "reports"]) {
  check(migration.includes(`public.${table}`), `Prototype migration must define ${table}.`);
}
check((migration.match(/enable row level security/g) || []).length >= 5, "All prototype account tables must enable Row Level Security.");
check(migration.includes("auth.uid() = user_id"), "Assessment/report policies must be scoped to the signed-in user.");
check(migration.includes("Non-production migration"), "Migration must remain explicitly marked non-production until reviewed.");

const hub = read("intelligence-hub.html");
check(hub.includes("real assessments require sign-in") || hub.includes("Sign-in required for real analysis"), "Analyze My Company must explain the sign-in requirement.");
check(hub.includes("organization-growth-beta.html"), "Organization card must point to the prototype workflow on this branch.");
check(hub.includes("organization-growth-report-beta.html?sample=1"), "Organization sample report must remain public.");
check(hub.includes("Legacy report recovery"), "Legacy Report ID recovery must remain available during migration.");

const wizard = read("organization-growth-beta.html");
check((wizard.match(/class="wizard-step/g) || []).length === 7, "Organization Structure & Growth prototype must have exactly seven guided steps.");
check(wizard.includes("15–20 minutes"), "The assessment must set a thoughtful time expectation before starting.");
check(wizard.includes("Your progress is saved automatically") || wizard.includes("auto-save"), "The workflow must explain auto-save/resume.");
check(wizard.includes("multipleRoleOwnership"), "The workflow must capture multiple-hat responsibility ownership.");
check(wizard.includes("headcountFlexibility"), "The workflow must capture headcount constraints.");
check(wizard.includes("revenueGrowth") && wizard.includes("productGrowth") && wizard.includes("geographyGrowth"), "The workflow must separate multiple growth vectors.");

const decisionEngine = read("js/modules/organization/organization-growth-options-engine.mjs");
check(decisionEngine.includes("Strengthen the Current Functional Structure"), "Decision engine must include a lower-change structural option.");
check(decisionEngine.includes("current structure has supported the company to this point"), "Decision copy must use positive evolutionary language.");
check(!decisionEngine.toLowerCase().includes("your structure is bad"), "Decision engine must never use the rejected negative structure wording.");
check(decisionEngine.includes("implementationPlans"), "Decision engine must create implementation plans per option.");
check(decisionEngine.includes("whatCouldChangeTheConclusion"), "Decision engine must expose what could change the recommendation.");
check(decisionEngine.includes("referencePoints"), "Decision engine must expose external reference points.");

const refs = read("js/modules/organization/organization-growth-reference-registry.mjs");
check(refs.includes("OpenStax"), "OpenStax reference must be governed in the prototype registry.");
check(refs.includes("BASE-100"), "BASE-100 reference must be governed in the prototype registry.");
check(refs.includes("GitLab"), "GitLab public company reference must be present as a reference point.");
check(refs.includes("not universal") || refs.includes("not a universal"), "Public company benchmarks must be described as reference points, not universal rules.");
check(refs.includes("Do not reproduce proprietary"), "Protected source material must have an explicit reuse boundary.");

const report = read("js/organization-growth-report-beta.mjs");
check(report.includes("sampleMode"), "New report must support a public sample mode.");
check(report.includes("data-select-option"), "Real reports must let management select a structural direction.");
check(report.includes("differs from the current GrowWithHR suggestion"), "User choice must remain distinct from GrowWithHR's suggested direction.");
check(report.includes("How GrowWithHR arrived here"), "Report must contain a transparent reasoning section.");

const authClient = read("js/auth-client.js");
check(authClient.includes("flowType: \"pkce\""), "Prototype auth should use PKCE for browser OAuth flows.");
check(authClient.includes("persistSession: true"), "Signed-in sessions should persist across return visits.");
check(authClient.includes("saveAssessmentDraft"), "Account-linked assessment persistence is required.");
check(authClient.includes("ensureCompany"), "Account model must include a company workspace.");
check(!authClient.includes("SUPABASE_SERVICE_ROLE_KEY"), "Browser auth client must never contain the Supabase service-role key.");

const shell = read("js/site-shell.js");
check(shell.includes("compliance-intelligence.html") && shell.includes("ACCOUNT_PROTECTED_FILES"), "Real Compliance analysis must be behind prototype sign-in policy.");
check(shell.includes("params.get(\"sample\") === \"1\""), "Sample-mode pages must bypass account protection.");
check(shell.includes("My GrowWithHR"), "Shared GrowWithHR navigation must expose account state.");

const complianceBridge = read("js/compliance-account-bridge.js");
check(complianceBridge.includes("saveAssessmentDraft"), "Compliance progress must sync into the account assessment store.");
check(complianceBridge.includes("Saved to My GrowWithHR"), "Compliance auto-save must surface account save state.");
check(complianceBridge.includes("linkCompletedReport"), "Completed Compliance reports must be linked to the account report store.");

const accountServer = read("server-account.js");
check(accountServer.includes("/auth/v1/user"), "Account deletion must verify the caller's Supabase user token first.");
check(accountServer.includes("SUPABASE_SERVICE_ROLE_KEY"), "Only the backend may use the service-role key for permanent auth-user deletion.");

if (failures.length) {
  console.error(`\n${failures.length} prototype contract check(s) failed:`);
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log("GrowWithHR account + Organization Structure & Growth prototype contract checks passed.");
