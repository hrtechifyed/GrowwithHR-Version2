import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const home = read("index.html");
assert.match(home, /Grow your company without guessing/i);
assert.match(home, /Clear capabilities\. Clear boundaries\./);
assert.doesNotMatch(home, /Open My Reports|Recovery Code|recover previous saved company/i);
assert.doesNotMatch(home, /Talent Intelligence \(Planned\)/);
assert.doesNotMatch(home, /Leadership Intelligence \(Planned\)/);

const hub = read("intelligence-hub.html");
assert.match(hub, /One company view\.\s*<span>Multiple specialist analysis engines/i);
assert.match(hub, /Organization &amp; Growth/);
assert.match(hub, /HR Compliance Readiness/);
assert.match(hub, /Workforce &amp; Capability Planning/);
assert.match(hub, /COMPANY INTELLIGENCE ORCHESTRATOR/);
assert.match(hub, /The orchestrator coordinates\. Specialist engines decide\./i);
assert.match(hub, /Change Intelligence/i);
assert.match(hub, /GrowWithHRCompanyWorkspace\.recover/);
assert.match(hub, /GrowWithHRCompanyIntelligence/);
assert.match(hub, /workforce-capability-planning\.html/);
assert.match(hub, /workforce-capability-methodology\.html/);
assert.match(hub, /AI may assist with interpretation and mapping, but does not silently create company facts or act as the final decision authority/i);

const workforce = read("workforce-capability-planning.html");
assert.match(workforce, /Plan the <span>capabilities and workforce<\/span> your strategy actually needs/i);
assert.match(workforce, /CIPD strategic workforce-planning lens/i);
assert.match(workforce, /GrowWithHR capability-led cascade/i);
assert.match(workforce, /Scenario and work-redesign lens/i);
assert.match(workforce, /Build · Buy · Borrow · Bind · Bot · Move/);
assert.match(workforce, /Select at least two/i);
assert.match(workforce, /Implementation economics/i);
assert.match(workforce, /company’s planning cost, not only base salary/i);
assert.match(workforce, /I don’t know/);
assert.match(workforce, /does not score individual employees/i);
assert.match(workforce, /Compare planning frameworks/);
assert.match(workforce, /Create my implementation plan &amp; report/);

const methodology = read("workforce-capability-methodology.html");
assert.match(methodology, /CIPD/i);
assert.match(methodology, /ESCO/i);
assert.match(methodology, /O\*NET/i);
assert.match(methodology, /WCP-2026\.1/);
assert.match(methodology, /AI decision authority/i);
assert.match(methodology, /High/i);
assert.match(methodology, /Medium/i);
assert.match(methodology, /Low/i);

const resources = read("official-resources.html");
assert.match(resources, /Organization &amp; Growth/);
assert.match(resources, /HR Compliance Readiness/);
assert.match(resources, /Workforce &amp; Capability Planning/);
assert.match(resources, /workforce-capability-methodology\.html/);
assert.match(resources, /Facts used/i);
assert.match(resources, /Rule \/ framework/i);
assert.match(resources, /Uncertainty/i);

const security = read("security.html");
assert.match(security, /AES-256-GCM/);
assert.match(security, /not stored in plaintext/i);
assert.match(security, /not currently represented as SOC 2, ISO 27001/i);

const terms = read("terms.html");
assert.match(terms, /research-grade product/i);
assert.match(terms, /not legal certification/i);
assert.match(terms, /do not score individual employees|individual capability judgments/i);

const workspace = read("my-reports.html");
assert.match(workspace, /recovery-based customer workspace/i);
assert.match(workspace, /GrowWithHRCompanyWorkspace\.recover/);
assert.match(workspace, /completedEngines/);

const shell = read("js/site-shell.js");
assert.match(shell, /label: "Company Analysis Overview"/);
assert.match(shell, /label: "Organization & Growth"/);
assert.match(shell, /label: "HR Compliance Readiness"/);
assert.match(shell, /label: "Workforce & Capability Planning"/);
assert.match(shell, /label: "Change Intelligence"/);
assert.match(shell, /<span>Analyze<\/span>/);
assert.match(shell, /label: "My Reports"/);
assert.match(shell, /label: "Sources & Methodology"/);
assert.match(shell, /site-nav-analyze/);

const shellCss = read("css/18-site-shell.css");
assert.match(shellCss, /\.site-header-shell\s*\{[\s\S]*?position:\s*relative/,
  "Desktop site header must remain in normal document flow so it cannot cover scrolling page content.");
assert.doesNotMatch(shellCss, /\.site-header-shell\s*\{[\s\S]{0,220}?position:\s*fixed/,
  "The full desktop site header must not be fixed over page content.");

const approvedCss = read("css/31-approved-template.css");
assert.match(approvedCss, /site-nav-link\[href\$="my-reports\.html"\][\s\S]*display:none/i,
  "My Reports must not be advertised in the public navigation while recovery is not a public feature.");
assert.match(approvedCss, /intelligence-hub-page \.analysis-workspace[\s\S]*display:none/i,
  "The recovery workspace must stay hidden from the current public Analyze experience.");

console.log("Buyer trust, unified Analyze navigation and Workforce & Capability onboarding checks passed.");
