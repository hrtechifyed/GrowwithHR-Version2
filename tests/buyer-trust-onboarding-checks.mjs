import assert from "node:assert/strict";
import fs from "node:fs";

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

const hub = read("intelligence-hub.html");
assert.match(hub, /Built from real HR compliance frameworks — sample reports available before you commit\./i);
assert.match(hub, /<details class="hub-start-note">/);
assert.doesNotMatch(hub, /<details class="hub-start-note"[^>]*\bopen\b/);
assert.match(hub, /<summary>Before you start/);
assert.match(hub, /10–15 minutes/);
assert.match(hub, /Do not enter sensitive employee case data/i);
assert.ok(hub.indexOf('class="hub-engine-grid"') < hub.indexOf('<details class="hub-start-note">'), "Product cards must appear before the collapsed Before you start details element.");
assert.match(hub, /Best when:/);
assert.match(hub, /You’ll need:/);
assert.match(hub, /You receive:/);
assert.match(hub, /Applicability summary/);
assert.match(hub, /Source-referenced findings/);
assert.match(hub, /Flagged next actions/);
assert.match(hub, /Reuse your saved company profile/i);
assert.match(hub, /Recover a previous saved report here/i);
assert.doesNotMatch(hub, /Reuse your Company DNA/i);
assert.doesNotMatch(hub, /short-lived one-time token can transfer/i);
assert.match(hub, /Your data stays secure when reopening a saved report/i);
assert.match(hub, /Saved reports are kept for 6 months/i);
assert.match(hub, /href="security\.html#retention">Data policy<\/a>/);
assert.match(hub, /class="hub-sample-link" href="sample-advisory-report\.html"/);
assert.match(hub, /class="hub-sample-link" href="organization-structure-report\.html\?sample=1"/);
assert.match(hub, /href="analyze-company\.html\?engine=compliance"/);
assert.match(hub, /id="organizationStructureLink"[^>]*href="organization-intelligence\.html"/);
assert.match(hub, /id="workspaceReportId"/);
assert.match(hub, /id="workspaceRecoveryCode"/);
assert.match(hub, />Recovery Code<input/);
assert.match(hub, /<button type="submit">Recover Workspace<\/button>/);
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
assert.match(shell, /label: "My Reports"/);
assert.match(shell, /label: "Security & Data"/);
assert.match(shell, /label: "Terms"/);
assert.match(shell, /"my-reports\.html": "more"/);
assert.match(shell, /"security\.html": "more"/);
assert.match(shell, /"terms\.html": "more"/);

const styles = read("styles.css");
assert.match(styles, /css\/28-buyer-trust\.css/);
assert.ok(styles.indexOf("css/28-buyer-trust.css") < styles.indexOf("css/18-site-shell.css"), "Site shell must remain the final static stylesheet import.");

console.log("Buyer trust, onboarding and customer workspace checks passed.");