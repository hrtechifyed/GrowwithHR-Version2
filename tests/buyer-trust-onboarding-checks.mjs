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
assert.match(hub, /Before you start/i);
assert.match(hub, /10–15 minutes/);
assert.match(hub, /Do not enter sensitive employee case data/i);
assert.match(hub, /Best when:/);
assert.match(hub, /You’ll need:/);
assert.match(hub, /You receive:/);
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

const terms = read("terms.html");
assert.match(terms, /research-grade product/i);
assert.match(terms, /not legal certification/i);
assert.match(terms, /does not score individual employee capability/i);
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
