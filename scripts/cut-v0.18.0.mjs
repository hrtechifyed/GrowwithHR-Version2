import fs from "node:fs";

const target = "0.18.0";
const previous = "0.16.0-beta";

function read(path) {
    return fs.readFileSync(path, "utf8");
}

function write(path, content) {
    fs.writeFileSync(path, content, "utf8");
}

function replaceOnce(path, oldValue, newValue) {
    const source = read(path);
    const count = source.split(oldValue).length - 1;
    if (count !== 1) {
        throw new Error(
            `Expected one occurrence in ${path}, found ${count}: ${oldValue}`
        );
    }
    write(path, source.replace(oldValue, newValue));
}

const packageJson = JSON.parse(read("package.json"));
if (packageJson.version !== previous) {
    throw new Error(
        `Expected package version ${previous}, found ${packageJson.version}.`
    );
}
packageJson.version = target;
write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);

replaceOnce(
    "tests/baseline-contract-checks.js",
    '    "0.16.0-beta",\n    "The current release baseline must use version 0.16.0-beta."',
    '    "0.18.0",\n    "The current release baseline must use version 0.18.0."'
);
replaceOnce(
    "tests/requirements-static-check.js",
    '            "GrowWithHR Public 0.16.0-beta",',
    '            "GrowWithHR Public 0.18.0",'
);

const roadmapPath = "ROADMAP.md";
const roadmap = read(roadmapPath);
const startMarker = "## M3 — Compliance advisory presentation";
const endMarker = "\n---\n\n## M4 — Compliance action planning";
const start = roadmap.indexOf(startMarker);
const end = roadmap.indexOf(endMarker, start);
if (start === -1 || end === -1) {
    throw new Error("The governed M3 roadmap section was not found.");
}
const completedSection = `## M3 — Compliance advisory presentation

**Status:** Complete and validated

**Release:** \`v0.18.0\`

### Exit result

M3 converts the governed M2 recommendation-traceability bundle into one executive-facing private-beta Compliance Story without reconstructing recommendation rules in HTML, CSS, page controllers, report templates or PDF templates.

The completed release includes:

- a versioned Compliance Story schema and pure model;
- a company snapshot derived from confirmed and derived facts;
- separate safe applicability and evidence-status counts;
- no more than three deterministically ranked priorities;
- every governed rule outcome grouped by advisory domain;
- rationale, trigger facts, missing information, next actions, timelines and implications;
- structured source references, limitations and assumptions;
- loading, empty and safe error states;
- responsive, keyboard and reduced-motion presentation safeguards;
- maintained contract, regression and Playwright coverage.

The stable route remains \`/analyze-company.html\`.

The private-beta route remains \`/analyze-company-v3.html\` and \`complianceDnaV3\` remains disabled by default.

M3 does not mutate protected browser state, the stable report, PDF, email or delivery contracts. Stable report/PDF integration remains a separately approved migration.

### Acceptance result

The version cut is committed only after version consistency, compliance validation, the complete maintained regression suite and stable/M1/M2/M3 browser coverage pass on the release branch.
`;
write(roadmapPath, roadmap.slice(0, start) + completedSection + roadmap.slice(end));

const changelogPath = "CHANGELOG.md";
const changelog = read(changelogPath);
const changelogMarker = "\n---\n\n## [v0.15.0-beta]";
if (!changelog.includes(changelogMarker)) {
    throw new Error("The changelog insertion marker was not found.");
}
const releaseBlock = `
---

## [v0.18.0] - Compliance Story and Safe Health Model

**Release Date:** 2026-07-21

### Added

- Added the versioned M3 Compliance Story model and JSON Schema \`1.0.0\`.
- Added a private-beta executive story with a company snapshot, safe-status counts, top three priorities, grouped findings, assumptions, implications and structured sources.
- Added isolated M3 presentation styles with responsive, keyboard-focus and reduced-motion safeguards.
- Added M3 contract tests and Playwright coverage for ready, empty, error and mobile states.
- Added the M3 release manifest and rollback record.

### Safety and compatibility

- Kept \`/analyze-company.html\` as the stable production route.
- Kept \`/analyze-company-v3.html\` private and \`complianceDnaV3\` disabled by default.
- Preserved protected browser-storage, report, PDF, email and delivery contracts.
- Preserved deterministic M2 applicability decisions and separated applicability from evidence status.
- Added no cloud persistence, account requirement or storage migration.

### Validation

- GrowWithHR CI passed.
- Compliance Data Validation passed.
- Executive Assessment Tests passed, including M3 browser coverage.
- The complete maintained regression suite passed before the version-cut commit.
`;
write(
    changelogPath,
    changelog.replace(
        changelogMarker,
        `${releaseBlock}\n---\n\n## [v0.15.0-beta]`
    )
);

const manifestPath = "docs/releases/v0.18.0-m3-compliance-story.md";
replaceOnce(
    manifestPath,
    "- Target version: `0.18.0`\n",
    "- Target version: `0.18.0`\n- Release status: Complete and validated\n"
);

console.log("Prepared GrowWithHR v0.18.0 release metadata.");
