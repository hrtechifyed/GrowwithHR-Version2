import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "0.20.2";
const RELEASE_DATE = "2026-08-06";

const file = (...parts) => path.join(ROOT, ...parts);
const read = (relativePath) => fs.readFileSync(file(relativePath), "utf8");
const write = (relativePath, content) => {
  const target = file(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.endsWith("\n") ? content : `${content}\n`, "utf8");
};

function replaceRequired(relativePath, search, replacement) {
  const source = read(relativePath);
  if (!source.includes(search)) throw new Error(`Required marker not found in ${relativePath}`);
  write(relativePath, source.replace(search, replacement));
}

function insertBeforeOnce(relativePath, marker, idMarker, insertion) {
  const source = read(relativePath);
  if (source.includes(idMarker)) return;
  if (!source.includes(marker)) throw new Error(`Insertion marker not found in ${relativePath}`);
  write(relativePath, source.replace(marker, `${insertion}\n\n${marker}`));
}

function appendOnce(relativePath, marker, section) {
  const source = read(relativePath);
  if (source.includes(marker)) return;
  write(relativePath, `${source.trimEnd()}\n\n${section.trim()}\n`);
}

const packagePath = "package.json";
const packageJson = JSON.parse(read(packagePath));
packageJson.version = VERSION;
packageJson.scripts["verify:all-laws-rag"] = "npm run test:all-laws-runnable-private-beta && npm run report:all-laws-rag-readiness";
write(packagePath, JSON.stringify(packageJson, null, 2));

replaceRequired(
  "index.html",
  "AI-powered company advisory platform",
  "Decision-first HR compliance and advisory platform"
);
replaceRequired(
  "index.html",
  "Our intelligence engine evaluates compliance, governance and growth readiness.",
  "Deterministic rules evaluate compliance and governance before governed sources and AI explanation are used."
);

const homepageSection = [
  '<section id="compliance-engine" class="compliance-engine-section compact-section" aria-labelledby="compliance-engine-title">',
  '  <div class="container">',
  '    <div class="section-heading compliance-engine-heading">',
  '      <div class="section-tag">HOW GROWWITHHR WORKS</div>',
  '      <h2 id="compliance-engine-title">How GrowWithHR reaches a compliance answer</h2>',
  '      <p class="compliance-engine-intro">GrowWithHR separates the legal decision from source retrieval and AI explanation, so every result can show what was known, which rule ran and why the next action was recommended.</p>',
  '    </div>',
  '',
  '    <div class="compliance-engine-flow" data-testid="compliance-engine-flow">',
  '      <article class="engine-step">',
  '        <span class="engine-step-number">01</span>',
  '        <h3>Capture explicit facts</h3>',
  '        <p>The assessment records confirmed information, derived context and missing facts without letting AI invent answers.</p>',
  '      </article>',
  '      <article class="engine-step">',
  '        <span class="engine-step-number">02</span>',
  '        <h3>Apply deterministic rules</h3>',
  '        <p>Versioned rules create an immutable status, reason code and decision trace before retrieval begins.</p>',
  '      </article>',
  '      <article class="engine-step">',
  '        <span class="engine-step-number">03</span>',
  '        <h3>Retrieve governed sources</h3>',
  '        <p>RAG can retrieve only the controlled sources and chunks permitted by that completed decision.</p>',
  '      </article>',
  '      <article class="engine-step">',
  '        <span class="engine-step-number">04</span>',
  '        <h3>Explain and move to action</h3>',
  '        <p>The model explains the fixed result with citations, limitations and practical next steps. It cannot change the decision.</p>',
  '      </article>',
  '    </div>',
  '',
  '    <div class="compliance-engine-difference">',
  '      <div>',
  '        <div class="section-tag">WHAT MAKES IT DIFFERENT</div>',
  '        <h3>Decision provenance, not an AI opinion</h3>',
  '        <p>Many systems surface alerts or generate an answer. GrowWithHR is designed to preserve the facts, rule version, reason code, source identity and decision fingerprint behind the recommendation.</p>',
  '      </div>',
  '      <ul class="difference-list">',
  '        <li><strong>Deterministic rules decide.</strong> AI is never the applicability authority.</li>',
  '        <li><strong>Sources are controlled.</strong> Retrieval is restricted by source IDs, reason codes and fingerprints.</li>',
  '        <li><strong>Uncertainty stays visible.</strong> Missing information and specialist review are valid outcomes.</li>',
  '        <li><strong>The engine fails safely.</strong> Core decisions remain available when RAG or the provider is disabled.</li>',
  '      </ul>',
  '    </div>',
  '',
  '    <p class="compliance-engine-note">Private-beta explanations support review and action planning; they are not legal certification. POSH Internal Committee threshold currently uses a statutory catalogue. Other legal profiles use conservative governance fallback until their controlled law-specific source packs and rules are approved.</p>',
  '  </div>',
  '</section>'
].join("\n");
insertBeforeOnce(
  "index.html",
  '<section id="capabilities"',
  'id="compliance-engine"',
  homepageSection
);

const cssImport = '@import url("css/23-compliance-engine.css");';
if (!read("styles.css").includes(cssImport)) {
  write("styles.css", `${read("styles.css").trimEnd()}\n${cssImport}\n`);
}

write("css/23-compliance-engine.css", [
  "/* GrowWithHR compliance-engine explanation section. */",
  "body.home-page .compliance-engine-section {",
  "  position: relative;",
  "  overflow: hidden;",
  "  background: linear-gradient(180deg, rgba(10, 16, 32, .35), rgba(5, 7, 11, .92));",
  "}",
  "body.home-page .compliance-engine-heading { max-width: 920px; }",
  "body.home-page .compliance-engine-intro {",
  "  max-width: 820px;",
  "  margin: 18px auto 0;",
  "  color: var(--text-secondary);",
  "  font-size: clamp(1rem, .96rem + .2vw, 1.15rem);",
  "  line-height: 1.75;",
  "}",
  "body.home-page .compliance-engine-flow {",
  "  display: grid;",
  "  grid-template-columns: repeat(4, minmax(0, 1fr));",
  "  gap: var(--home-gap);",
  "  margin-top: clamp(38px, 5vw, 60px);",
  "}",
  "body.home-page .engine-step,",
  "body.home-page .compliance-engine-difference {",
  "  border: 1px solid var(--glass-border);",
  "  border-radius: var(--radius-lg);",
  "  background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018));",
  "  box-shadow: var(--shadow-md);",
  "}",
  "body.home-page .engine-step {",
  "  min-height: 280px;",
  "  padding: clamp(22px, 2.5vw, 32px);",
  "}",
  "body.home-page .engine-step-number {",
  "  display: inline-grid;",
  "  place-items: center;",
  "  width: 48px;",
  "  height: 48px;",
  "  margin-bottom: 26px;",
  "  border-radius: 50%;",
  "  background: var(--gradient-brand);",
  "  color: var(--text-dark);",
  "  font-weight: 800;",
  "}",
  "body.home-page .engine-step h3,",
  "body.home-page .compliance-engine-difference h3 {",
  "  margin: 0 0 14px;",
  "  color: var(--text-primary);",
  "}",
  "body.home-page .engine-step p,",
  "body.home-page .compliance-engine-difference p,",
  "body.home-page .difference-list,",
  "body.home-page .compliance-engine-note {",
  "  color: var(--text-secondary);",
  "  line-height: 1.7;",
  "}",
  "body.home-page .compliance-engine-difference {",
  "  display: grid;",
  "  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);",
  "  gap: clamp(28px, 5vw, 64px);",
  "  align-items: start;",
  "  margin-top: var(--home-gap);",
  "  padding: clamp(28px, 4vw, 52px);",
  "}",
  "body.home-page .difference-list {",
  "  display: grid;",
  "  gap: 14px;",
  "  margin: 0;",
  "  padding-left: 22px;",
  "}",
  "body.home-page .difference-list strong { color: var(--text-primary); }",
  "body.home-page .compliance-engine-note {",
  "  max-width: 980px;",
  "  margin: 24px auto 0;",
  "  padding: 16px 20px;",
  "  border-left: 3px solid var(--brand-orange);",
  "  background: rgba(255, 122, 0, .07);",
  "  font-size: .94rem;",
  "}",
  "@media (max-width: 1023px) {",
  "  body.home-page .compliance-engine-flow { grid-template-columns: repeat(2, minmax(0, 1fr)); }",
  "}",
  "@media (max-width: 767px) {",
  "  body.home-page .compliance-engine-flow,",
  "  body.home-page .compliance-engine-difference { grid-template-columns: minmax(0, 1fr); }",
  "  body.home-page .engine-step { min-height: 0; }",
  "}"
].join("\n"));

appendOnce(
  "tests/e2e/homepage-client-readiness.spec.ts",
  'test("homepage explains the compliance-engine authority boundary"',
  [
    '',
    'test("homepage explains the compliance-engine authority boundary", async ({ page }) => {',
    '  await page.goto("/index.html", { waitUntil: "networkidle" });',
    '  await expect(page.getByRole("heading", { name: "How GrowWithHR reaches a compliance answer" })).toBeVisible();',
    '  await expect(page.locator("[data-testid=\\"compliance-engine-flow\\"] .engine-step")).toHaveCount(4);',
    '  await expect(page.getByText("Deterministic rules decide.", { exact: false })).toBeVisible();',
    '  await expect(page.getByText("AI is never the applicability authority.", { exact: false })).toBeVisible();',
    '});'
  ].join("\n")
);

write("README.md", [
  "# GrowWithHR",
  "",
  "GrowWithHR is a deterministic, traceable HR compliance advisory engine for founders, business leaders and People teams. It records explicit company facts, applies versioned rules, retrieves governed source material after the decision and uses AI only to explain the fixed result.",
  "",
  "## Current release",
  "",
  `- Application version: \`${VERSION}\``,
  "- Release: Governed Legal RAG Private Beta",
  "- Public assessment: `/analyze-company.html`",
  "- Private-beta Compliance DNA route: `/analyze-company-v3.html`",
  "- Private-beta feature flag: `complianceDnaV3: false`",
  "- Shared legal explanation route: `POST /api/legal-explanation/feature/:featureId`",
  "- Legal RAG status route: `GET /api/legal-rag/status`",
  "",
  "## Compliance-engine authority boundary",
  "",
  "```text",
  "Assessment answers",
  "→ deterministic fact mapping",
  "→ deterministic legal rule",
  "→ immutable decision and reason code",
  "→ governed source retrieval",
  "→ explanation-only provider",
  "→ strict response validation",
  "```",
  "",
  "Deterministic rules decide. RAG retrieves governed material. The hosted model explains only. Retrieval and provider output cannot create assessment facts, change applicability, expand the source scope or certify compliance.",
  "",
  "## Legal RAG coverage",
  "",
  "The private-beta registry contains 57 runnable feature profiles: one POSH Internal Committee threshold profile with a statutory catalogue and 56 conservative governance-fallback profiles across the other registered legal features. Fallback profiles return only `more-information-needed` or `specialist-review` until controlled law-specific rules and source packs replace them.",
  "",
  "## What makes GrowWithHR different",
  "",
  "- It creates a reproducible decision record rather than an untraceable AI answer.",
  "- It preserves triggering facts, missing facts, rule version, reason code, source IDs and fingerprints.",
  "- It treats uncertainty and specialist escalation as valid outcomes.",
  "- It continues to provide deterministic results when RAG, the hosted provider or remote persistence is unavailable.",
  "- It connects decisions to the Compliance Story, priorities, obligations, tasks, owners and evidence placeholders.",
  "",
  "See `docs/architecture/compliance-engine-differentiation.md` for the detailed architecture and `docs/testing/all-laws-rag-validation.md` for the all-laws validation procedure.",
  "",
  "## Production stack",
  "",
  "The deployed product is the root-level HTML, CSS and JavaScript application. `server.js` supplies the optional Gmail delivery API and legal explanation routes; `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript layer and is not part of the deployed build.",
  "",
  "## Data and persistence boundary",
  "",
  "Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.",
  "",
  "## Local validation",
  "",
  "```bash",
  "npm install",
  "npm run verify:all-laws-rag",
  "npm run test:release",
  "npm run test:release:e2e",
  "npm start",
  "```",
  "",
  "## Product boundary",
  "",
  "GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice."
].join("\n"));

replaceRequired(
  "ROADMAP.md",
  "Current application version: `0.20.0`",
  `Current application version: \`${VERSION}\``
);
insertBeforeOnce(
  "ROADMAP.md",
  "## Approval-gated milestone foundation",
  "### v0.20.2 — Governed Legal RAG Private Beta",
  [
    "## Current product release",
    "",
    `### v${VERSION} — Governed Legal RAG Private Beta`,
    "",
    "Released 6 August 2026. This release adds the shared all-laws private-beta runtime, a public explanation of the compliance-engine authority boundary and maintained validation for all registered legal RAG profiles.",
    "",
    "- 57 active private-beta profiles and zero runtime-blocked profiles;",
    "- one POSH statutory catalogue profile;",
    "- 56 conservative governance-fallback profiles;",
    "- shared feature and status endpoints;",
    "- homepage architecture and differentiation section;",
    "- repeatable all-laws validation command and documentation.",
    "",
    "This release does not activate M6 persistence and does not claim completion of the M7 v0.22.0 reliability exit. Law-specific statutory corpus replacement remains a controlled follow-on programme."
  ].join("\n")
);

appendOnce(
  "docs/ARCHITECTURE.md",
  "## Compliance decision and governed RAG architecture",
  [
    "## Compliance decision and governed RAG architecture",
    "",
    "The compliance engine now uses one authority boundary across legal features:",
    "",
    "```text",
    "assessment answers",
    "→ deterministic fact mapper",
    "→ deterministic rule evaluator",
    "→ immutable decision",
    "→ legal RAG profile resolver",
    "→ governed catalogue retrieval",
    "→ explanation-only provider",
    "→ strict response validation",
    "```",
    "",
    "The deterministic decision owns applicability, status and reason-code selection. Retrieval has `applicabilityAuthority: none` and `usedForDecision: false`. Provider output must preserve the decision fingerprint, status, reason code and supplied citation scope.",
    "",
    "The v0.20.2 private-beta registry exposes 57 active profiles. POSH Internal Committee threshold uses its governed statutory catalogue; 56 other profiles use conservative governance-readiness retrieval and cannot make positive or negative applicability conclusions until feature-specific source packs and rules are approved.",
    "",
    "Operational endpoints:",
    "",
    "```text",
    "POST /api/legal-explanation/feature/:featureId",
    "GET  /api/legal-rag/status",
    "GET  /api/m7/readiness",
    "```",
    "",
    "See `docs/architecture/compliance-engine-differentiation.md` and `docs/testing/all-laws-rag-validation.md`."
  ].join("\n")
);

replaceRequired(
  "docs/architecture/legal-rag-platform-architecture.md",
  "**Status:** Architecture foundation; only the existing POSH threshold profile is active",
  "**Status:** Shared private-beta runtime released in v0.20.2; 57 profiles are runnable, with one statutory catalogue and 56 conservative governance fallbacks"
);
appendOnce(
  "docs/architecture/legal-rag-platform-architecture.md",
  "## 9. Runtime update — v0.20.2",
  [
    "## 9. Runtime update — v0.20.2",
    "",
    "The shared architecture is now executable for every registered legal profile through `POST /api/legal-explanation/feature/:featureId`.",
    "",
    "- 57 profiles are active in private beta;",
    "- POSH Internal Committee threshold retains the statutory catalogue path;",
    "- 56 profiles use a governance-fallback catalogue while law-specific corpora are onboarded;",
    "- fallback outcomes are restricted to `more-information-needed` and `specialist-review`;",
    "- `GET /api/legal-rag/status` reports profile, catalogue and limitation metadata;",
    "- the authority boundary remains deterministic-only for applicability.",
    "",
    "Runtime availability is not equivalent to statutory-corpus completeness. Each fallback profile must still complete source fingerprinting, page and section review, fact and privacy approval, deterministic rule approval, chunk curation and release approval before it can issue a substantive applicability outcome."
  ].join("\n")
);

replaceRequired(
  "docs/architecture/all-laws-runnable-private-beta-rag.md",
  "Status: implemented on a stacked review branch",
  `Status: released in GrowWithHR v${VERSION} private beta`
);
appendOnce(
  "docs/architecture/all-laws-runnable-private-beta-rag.md",
  "## Human-verifiable acceptance test",
  [
    "## Human-verifiable acceptance test",
    "",
    "Run:",
    "",
    "```bash",
    "npm run verify:all-laws-rag",
    "```",
    "",
    "The run is accepted only when the output reports `valid: true`, `profileCount: 57`, `activeProfileCount: 57`, `blockedProfileCount: 0`, `statutoryProfiles: 1` and `governanceFallbackProfiles: 56`. The maintained test evaluates every profile, completes retrieval, confirms that retrieval was not used for the decision and builds a contract-valid explanation that cannot change the deterministic result."
  ].join("\n")
);

appendOnce(
  "docs/architecture/complete-feature-coverage-inventory.md",
  "## 2026-08-06 runtime addendum",
  [
    "## 2026-08-06 runtime addendum",
    "",
    "The earlier inventory described the pre-onboarding state. GrowWithHR v0.20.2 adds a shared private-beta runtime for all 57 registered legal feature profiles.",
    "",
    "| Runtime category | Profiles | Current authority |",
    "|---|---:|---|",
    "| POSH Internal Committee threshold | 1 | Deterministic statutory rule plus governed statutory chunks |",
    "| Other registered legal features | 56 | Deterministic escalation-only rule plus governance-readiness retrieval |",
    "| Runtime-blocked profiles | 0 | Not applicable |",
    "",
    "This changes runtime coverage, not statutory assurance depth. The 56 fallback profiles remain unable to emit positive or negative applicability conclusions and require controlled law-specific source packs, facts, rules and approvals before being reclassified as substantive governed legal assurance."
  ].join("\n")
);

const changelog = read("CHANGELOG.md");
if (!changelog.includes(`## [v${VERSION}]`)) {
  const unreleased = "## [Unreleased]\n\nNo unreleased product changes are currently recorded.\n\n---";
  const releaseEntry = [
    "## [Unreleased]",
    "",
    "No unreleased product changes are currently recorded.",
    "",
    "---",
    "",
    `## [v${VERSION}] - Governed Legal RAG Private Beta`,
    "",
    `**Release Date:** ${RELEASE_DATE}`,
    "",
    "### Added",
    "",
    "- Added a shared legal explanation route for all 57 registered private-beta legal profiles.",
    "- Added one statutory POSH profile and 56 conservative governance-fallback profiles with zero runtime-blocked profiles.",
    "- Added a legal RAG status endpoint with explicit catalogue modes and limitations.",
    "- Added a homepage section explaining the decision-first compliance architecture and differentiation.",
    "- Added maintained all-laws runtime, retrieval and explanation validation plus a human-readable validation guide.",
    "",
    "### Safety and compatibility",
    "",
    "- Deterministic rules remain the sole applicability authority.",
    "- Fallback profiles return only `more-information-needed` or `specialist-review`.",
    "- Provider output cannot change status, reason code, decision fingerprint or citation scope.",
    "- M6 remote persistence remains disabled.",
    "- The release does not claim completion of the M7 v0.22.0 reliability exit.",
    "",
    "---"
  ].join("\n");
  if (!changelog.includes(unreleased)) throw new Error("CHANGELOG Unreleased marker not found");
  write("CHANGELOG.md", changelog.replace(unreleased, releaseEntry));
}

write("docs/architecture/compliance-engine-differentiation.md", [
  "# GrowWithHR compliance engine and differentiation",
  "",
  `**Release:** v${VERSION}  `,
  `**Date:** ${RELEASE_DATE}  `,
  "**Authority boundary:** Deterministic rules decide. RAG retrieves governed sources. The model explains only.",
  "",
  "## Architecture",
  "",
  "```text",
  "Assessment answers",
  "→ confirmed, derived and missing facts",
  "→ versioned deterministic rule",
  "→ immutable status, reason code and decision fingerprint",
  "→ feature-profile resolution",
  "→ governed lexical or hybrid retrieval",
  "→ provider-neutral explanation request",
  "→ strict explanation validation",
  "→ Compliance Story, priorities and workspace actions",
  "```",
  "",
  "The model is a replaceable presentation component. It has no authority to infer a fact, decide applicability, select a reason code, expand source scope or certify compliance.",
  "",
  "## Differentiation",
  "",
  "GrowWithHR is positioned as a compliance assurance and decision-provenance engine rather than a generic legal chatbot or a payroll-led compliance-alert product.",
  "",
  "| Common platform pattern | GrowWithHR design |",
  "|---|---|",
  "| Alert or generated answer | Reproducible decision with rule version and reason code |",
  "| AI interprets the user's situation | Deterministic rules decide before AI is called |",
  "| Knowledge-base links | Controlled files, source IDs, sections, dates and fingerprints |",
  "| Binary compliant/non-compliant display | Explicit missing-information, uncertainty and specialist-review states |",
  "| AI or retrieval outage blocks the feature | Deterministic result remains available without RAG or provider execution |",
  "| Compliance insight ends at an alert | Decision flows into priorities, obligations, tasks, owners and evidence placeholders |",
  "",
  "## Current coverage boundary",
  "",
  "The runtime includes 57 active private-beta feature profiles. POSH Internal Committee threshold has the substantive statutory path. The remaining profiles are executable but conservative; they retrieve governance-readiness context and escalate rather than inventing thresholds, exemptions, dates or jurisdiction-specific conclusions.",
  "",
  "The defensible claim is not that GrowWithHR already has deeper statutory coverage than every incumbent. The differentiator is that every substantive conclusion is intended to be traceable to explicit facts, a versioned deterministic rule and controlled source material."
].join("\n"));

write("docs/testing/all-laws-rag-validation.md", [
  "# Validate RAG across all registered legal profiles",
  "",
  `**Release:** v${VERSION}  `,
  "**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the applicability decision.",
  "",
  "## One-command acceptance test",
  "",
  "```bash",
  "npm install",
  "npm run verify:all-laws-rag",
  "```",
  "",
  "The command runs the maintained 57-profile runtime test and then prints the onboarding-readiness snapshot.",
  "",
  "## Required pass indicators",
  "",
  "```json",
  "{",
  "  \"valid\": true,",
  "  \"profileCount\": 57,",
  "  \"activeProfileCount\": 57,",
  "  \"blockedProfileCount\": 0,",
  "  \"statutoryProfiles\": 1,",
  "  \"governanceFallbackProfiles\": 56,",
  "  \"fallbackSources\": 17,",
  "  \"fallbackChunks\": 17",
  "}",
  "```",
  "",
  "The test fails when any profile is missing, blocked, has an invalid deterministic catalogue, cannot complete retrieval, retrieves outside its permitted scope, mutates the decision or cannot build a contract-valid explanation.",
  "",
  "## Representative behavior checks",
  "",
  "For a fallback profile such as Maternity Benefit establishment coverage:",
  "",
  "- no employee-count input must produce `more-information-needed`;",
  "- a non-negative employee count must produce `specialist-review`;",
  "- retrieval must report `retrievalStatus: completed`;",
  "- retrieval must report `usedForDecision: false` and `applicabilityAuthority: none`;",
  "- the explanation must preserve the decision status and reason code.",
  "",
  "For POSH Internal Committee threshold, the test must retrieve statutory chunks whose source IDs were already permitted by the deterministic decision.",
  "",
  "## Runtime status check",
  "",
  "After starting the server, inspect:",
  "",
  "```text",
  "GET /api/legal-rag/status",
  "```",
  "",
  "The response should report `platformStatus: all-laws-runnable-private-beta`, 57 active profiles, zero blocked profiles and two catalogue modes: statutory and governance fallback.",
  "",
  "A green test proves that the shared RAG pipeline works for every registered profile. It does not prove that all 56 fallback profiles have completed statutory corpus onboarding or legal approval."
].join("\n"));

write(`docs/releases/v${VERSION}-governed-legal-rag-private-beta.md`, [
  `# GrowWithHR v${VERSION} — Governed Legal RAG Private Beta`,
  "",
  `**Release date:** ${RELEASE_DATE}  `,
  "**Public route:** `/analyze-company.html`  ",
  "**Private-beta route:** `/analyze-company-v3.html`",
  "",
  "## Release scope",
  "",
  "- Shared legal explanation routing for all 57 registered legal profiles.",
  "- One POSH statutory profile and 56 conservative governance-fallback profiles.",
  "- Zero runtime-blocked profiles.",
  "- Public homepage explanation of how the compliance engine works and why it differs from AI-first compliance products.",
  "- Maintained all-laws acceptance test and operator-facing validation guide.",
  "- M7 contract, lifecycle, monitoring, security and disaster-recovery controls remain active.",
  "",
  "## Release boundary",
  "",
  "This is a private-beta feature release on the v0.20 line. It does not activate M6 durable persistence, does not make Compliance DNA v3 public, does not claim that all law-specific statutory corpora are complete and does not satisfy the separate v0.22.0 M7 reliability exit requiring two qualified production releases.",
  "",
  "## Validation",
  "",
  "```bash",
  "npm run verify:all-laws-rag",
  "npm run test:complete-legal-rag-platform",
  "npm run test:m7",
  "npm run test:release",
  "npm run test:release:e2e",
  "```",
  "",
  "## Rollback",
  "",
  "Revert the release merge or deploy the previous v0.20.0-compatible build. Set `LEGAL_EXPLANATION_ENDPOINT_ENABLED=false` to disable provider execution while preserving deterministic decisions and the stable public assessment."
].join("\n"));

execFileSync(process.execPath, [file("scripts", "sync-version.mjs")], {
  cwd: ROOT,
  stdio: "inherit"
});

for (const relativePath of [
  "scripts/apply-v0202-release.mjs",
  ".github/workflows/apply-v0202-release.yml"
]) {
  fs.rmSync(file(relativePath), { force: true });
}

console.log(`Prepared GrowWithHR v${VERSION} release changes.`);
