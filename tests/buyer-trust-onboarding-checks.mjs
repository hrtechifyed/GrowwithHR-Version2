import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const home = read("index.html");
assert.match(home, /Grow your company without guessing/i);
assert.match(home, /what HR needs next/i);
assert.match(home, /Hiring quickly/);
assert.match(home, /Founder becoming a bottleneck/);
assert.match(home, /Compliance Needs/);
assert.match(home, /Organization Structure/);
assert.match(home, /Anurag Sinha/);
assert.match(home, /Founder, HRTechify/);
assert.match(home, /Security & Data/);
assert.match(home, /Open My Reports/);
assert.doesNotMatch(home, /Talent Intelligence \(Planned\)/);
assert.doesNotMatch(home, /Leadership Intelligence \(Planned\)/);

const positioning = read("js/product-positioning.js");
assert.match(positioning, /flagship: "Organization Structure & Growth"/);
assert.match(positioning, /secondary: "HR Compliance Readiness"/);
assert.match(positioning, /recurringLayer: "Change Intelligence"/);
assert.match(positioning, /\["Compliance Needs", "HR Compliance Readiness"\]/);
assert.match(positioning, /Organization Structure & Growth · Flagship/);

const hub = read("intelligence-hub.html");
assert.match(hub, /Understand your company/i);
assert.match(hub, /what changes as you grow/i);
assert.match(hub, /CHANGE INTELLIGENCE/i);
assert.match(hub, /first assessment creates the baseline/i);
assert.match(hub, /compares company facts and deterministic findings over time/i);
assert.match(hub, /illustrative comparison/i);
assert.match(hub, /pressures increased/i);
assert.match(hub, /new review trigger/i);
assert.match(hub, /<details class="hub-start-note">/);
assert.doesNotMatch(hub, /<details class="hub-start-note"[^>]*\bopen\b/);
assert.match(hub, /<summary>Before you start/);
assert.match(hub, /10–15 minutes/);
assert.match(hub, /Do not enter sensitive employee case data/i);
assert.ok(hub.indexOf('class="hub-engine-grid"') < hub.indexOf('<details class="hub-start-note">'), "Product cards must appear before the collapsed Before you start details element.");
assert.match(hub, /Best when:/);
assert.match(hub, /You’ll need:/);
assert.match(hub, /You receive:/);
assert.match(hub, /Organization Structure &amp; Growth/);
assert.match(hub, /HR Compliance Readiness/);
assert.match(hub, /Full report delivered by email/i);
assert.match(hub, /website shows a concise executive glimpse/i);
assert.match(hub, /REPORT GLIMPSE/i);
assert.match(hub, /Enough to understand the insight\. Not the full report\./i);
assert.match(hub, /complete PDF advisory is delivered to your work email/i);
assert.doesNotMatch(hub, /hub-sample-link/);
assert.doesNotMatch(hub, /href="sample-advisory-report\.html"/);
assert.doesNotMatch(hub, /href="organization-structure-report\.html\?sample=1"/);
assert.match(hub, /Return to your company baseline and see what changed/i);
assert.match(hub, /Recover Company Baseline/);
assert.doesNotMatch(hub, /Reuse your Company DNA/i);
assert.doesNotMatch(hub, /short-lived one-time token can transfer/i);
assert.match(hub, /Your data stays secure when reopening a saved company profile/i);
assert.match(hub, /Saved company information is kept for 6 months/i);
assert.match(hub, /href="security\.html#retention">Data policy<\/a>/);
assert.match(hub, /href="compliance-intelligence\.html"/);
assert.doesNotMatch(hub, /href="analyze-company\.html\?engine=compliance"/);
assert.match(hub, /id="organizationStructureLink"[^>]*href="organization-intelligence\.html"/);
assert.match(hub, /id="workspaceReportId"/);
assert.match(hub, /id="workspaceRecoveryCode"/);
assert.match(hub, />Recovery Code<input/);
assert.match(hub, /<button type="submit">Recover Company Baseline<\/button>/);
assert.match(hub, /GrowWithHRCompanyWorkspace\.recover/);
assert.match(hub, /my-reports\.html/);
assert.match(hub, /security\.html/);
assert.match(hub, /terms\.html/);
assert.doesNotMatch(hub, /Choose an analysis/i);

const security = read("security.html");
assert.match(security, /AES-256-GCM/);
assert.match(security, /not stored in plaintext/i);
assert.match(security, /GitHub Pages/);
assert.match(security, /Render/);
assert.match(security, /Supabase/);
assert.match(security, /Gmail API/);
assert.match(security, /not currently represented as SOC 2, ISO 27001/i);
assert.match(security, /one-time handoff token/i);
assert.match(security, /publishable key/i);
assert.match(security, /matching signed-in work email/i);
assert.match(security, /Bearer access token/i);
assert.match(security, /complete personalised reports are not exposed as public full-report web pages/i);
assert.match(security, /<article id="retention" class="legal-card">/);
assert.match(security, /kept for six months from the latest completed analysis/i);
assert.match(security, /approximately seven days before deletion/i);

const terms = read("terms.html");
assert.match(terms, /research-grade product/i);
assert.match(terms, /not legal certification/i);
assert.match(terms, /do not score individual employees|individual capability judgments/i);
assert.match(terms, /Source-backed recommendations/i);
assert.match(terms, /product of HRTechify/i);

const workspace = read("my-reports.html");
assert.match(workspace, /recovery-based customer workspace/i);
assert.match(workspace, /not a password account/i);
assert.match(workspace, /GrowWithHRCompanyWorkspace\.recover/);
assert.match(workspace, /reportIds/);
assert.match(workspace, /completedEngines/);
assert.match(workspace, /Delete reusable company data/);

const about = read("more-info.html");
assert.match(about, /founded by <strong>Anurag Sinha<\/strong>/);
assert.match(about, /Public codebase/);
assert.match(about, /Security & Data/);
assert.match(about, /Product Use Terms/);

const shell = read("js/site-shell.js");
assert.match(shell, /label: "Organization & Growth"/);
assert.match(shell, /label: "HR Compliance Readiness"/);
assert.match(shell, /label: "My Reports"/);
assert.match(shell, /label: "Sources & Methodology"/);
assert.match(shell, /label: "Sample Reports"/);
assert.match(shell, /label: "Security & Data"/);
assert.match(shell, /label: "Terms"/);
assert.match(shell, /"organization-intelligence\.html": "organization"/);
assert.match(shell, /"compliance-intelligence\.html": "compliance"/);
assert.match(shell, /"my-reports\.html": "reports"/);
assert.match(shell, /"official-resources\.html": "resources"/);
assert.match(shell, /bootstrapProductPositioning/);
assert.match(shell, /js\/product-positioning\.js/);

const customerAuth = read("js/customer-auth.js");
assert.match(customerAuth, /publishable key only/i);
assert.match(customerAuth, /requireMatchingSession/);
assert.match(customerAuth, /Authorization/);
assert.doesNotMatch(customerAuth, /SERVICE_ROLE/i);

const reportGate = read("server-customer-report-gate.js");
assert.match(reportGate, /SUPABASE_SERVICE_ROLE_KEY/);
assert.match(reportGate, /ensureRecipientOwnership/);
assert.match(reportGate, /complete report can only be emailed to the signed-in work email/i);
const customerReportGate = require("../server-customer-report-gate.js");
assert.deepEqual(
    customerReportGate.emailCandidates({
        lead: { email: "Buyer@Example.com" },
        report: { recipientEmail: "buyer@example.com", recipientEmails: ["BUYER@example.com"] }
    }),
    ["buyer@example.com"]
);
assert.doesNotThrow(() => customerReportGate.ensureRecipientOwnership({
    lead: { email: "buyer@example.com" },
    report: { recipientEmail: "BUYER@example.com" }
}, "buyer@example.com"));
assert.throws(() => customerReportGate.ensureRecipientOwnership({
    lead: { email: "other@example.com" }
}, "buyer@example.com"), /signed-in work email/i);

const styles = read("styles.css");
assert.match(styles, /css\/28-buyer-trust\.css/);
assert.ok(styles.indexOf("css/28-buyer-trust.css") < styles.indexOf("css/18-site-shell.css"), "Site shell must remain the final static stylesheet import.");

console.log("Buyer trust, onboarding, Change Intelligence, authenticated report access and customer workspace checks passed.");