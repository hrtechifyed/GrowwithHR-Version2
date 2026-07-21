/** GrowWithHR M3 Compliance Story contract checks. */

import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
    model: path.join(root, "js/assessment-v3/compliance-story-model.js"),
    presentation: path.join(root, "js/assessment-v3/compliance-story-presentation.js"),
    schema: path.join(root, "data/schema/compliance-story.schema.v1.json"),
    css: path.join(root, "css/20-compliance-story.css"),
    loader: path.join(root, "js/build-marker.js")
};
const timestamp = "2026-07-21T10:00:00.000Z";
const source = {
    id: "source.labour-ministry.official-portal",
    title: "Ministry of Labour and Employment",
    publisher: "Government of India",
    url: "https://www.labour.gov.in/",
    jurisdiction: "India",
    sourceType: "official-portal",
    reviewedAt: "2026-07-21",
    notes: "Official source supplied for further review only.",
    official: true
};

const fact = (id, label, value, kind = "confirmed") => kind === "derived"
    ? {
        id, kind, label, value,
        derivedFrom: ["fact.workforce.employee-count"],
        derivationRuleId: "rule.workforce.total-reported-workforce.calculate",
        metadata: {}
    }
    : {
        id, kind, label, value,
        answerKey: id.split(".").at(-1),
        recordedAt: timestamp,
        metadata: {}
    };

const evaluation = (ruleId, status, trigger = [], missing = [], title = "Advisory review") => ({
    ruleId,
    ruleVersion: "1.0.0",
    status,
    reason: `Safe ${status} advisory result.`,
    requiredFactIds: [trigger[0] || missing[0] || "fact.company.name"],
    triggeringFactIds: trigger,
    missingFactIds: missing,
    sourceIds: [source.id],
    evaluatedAt: timestamp,
    metadata: { title }
});

const recommendation = (id, ruleId, status, trigger = [], missing = [], timeline = "Within 60 days") => ({
    id,
    ruleId,
    applicabilityStatus: status,
    title: "Review this advisory item",
    reason: "The supplied facts make this advisory review relevant.",
    action: "Review the item and confirm the appropriate next action.",
    timeline,
    triggeringFactIds: trigger,
    missingFactIds: missing,
    evidence: {
        status: "not-requested",
        notes: "Evidence is not verified by the current assessment.",
        verificationProcessId: null,
        verifiedAt: null
    },
    sourceIds: [source.id],
    limitations: ["This advisory result is not legal certification."],
    metadata: {}
});

function createBundle() {
    const evaluations = [
        evaluation(
            "rule.governance.primary-state.review",
            "applicable",
            ["fact.footprint.primary-state"],
            [],
            "Primary operating state review"
        ),
        evaluation(
            "rule.workplace.multi-location.review",
            "likely-applicable",
            ["fact.footprint.location-count"],
            [],
            "Multi-location review"
        ),
        evaluation(
            "rule.workforce.distributed-workforce.review",
            "more-information-needed",
            [],
            ["fact.workforce.remote-workforce-band"],
            "Distributed workforce review"
        ),
        evaluation(
            "rule.people.ownership.formal-function-review",
            "specialist-review",
            ["fact.people.people-function"],
            [],
            "People-governance review"
        ),
        evaluation(
            "rule.growth.rapid-change.workforce-planning",
            "not-currently-applicable",
            ["fact.growth.hiring-plan"],
            [],
            "Growth planning review"
        )
    ];

    return {
        contractVersion: "1.0.0",
        generatedAt: timestamp,
        facts: {
            confirmed: [
                fact("fact.company.name", "Organisation name", "Example Private Limited"),
                fact("fact.company.industry", "Industry", "Technology"),
                fact("fact.company.entity-type", "Legal entity type", "Private Limited"),
                fact("fact.workforce.employee-count", "Employee count", 32),
                fact("fact.workforce.work-model", "Working model", "Hybrid"),
                fact("fact.footprint.primary-state", "Primary operating state", "Maharashtra"),
                fact("fact.footprint.location-count", "Location count", 3),
                fact("fact.growth.hiring-plan", "Hiring plan", "Significant Growth"),
                fact("fact.people.people-function", "People function", "Founder Led")
            ],
            derived: [
                fact("fact.workforce.total-reported-workforce", "Total workforce", 32, "derived")
            ]
        },
        ruleEvaluations: evaluations,
        recommendations: [
            recommendation(
                "recommendation.governance.review-state-specific-requirements",
                evaluations[0].ruleId,
                evaluations[0].status,
                evaluations[0].triggeringFactIds,
                [],
                "Before relying on state-specific guidance"
            ),
            recommendation(
                "recommendation.workplace.review-multi-location-practices",
                evaluations[1].ruleId,
                evaluations[1].status,
                evaluations[1].triggeringFactIds,
                [],
                "Within 30 days"
            ),
            recommendation(
                "recommendation.workforce.confirm-working-model",
                evaluations[2].ruleId,
                evaluations[2].status,
                [],
                evaluations[2].missingFactIds,
                "Before distributed-work review"
            ),
            recommendation(
                "recommendation.people.obtain-specialist-review",
                evaluations[3].ruleId,
                evaluations[3].status,
                evaluations[3].triggeringFactIds,
                [],
                "Before acting on the advisory item"
            )
        ],
        sources: [source],
        limitations: [
            "This advisory result is not legal certification.",
            "Assessment answers have not been independently verified."
        ],
        metadata: { catalogVersion: "1.0.0" }
    };
}

async function importModel() {
    const directory = await mkdtemp(path.join(tmpdir(), "growwithhr-m3-"));
    await writeFile(path.join(directory, "package.json"), '{"type":"module"}', "utf8");
    const target = path.join(directory, "compliance-story-model.js");
    await copyFile(paths.model, target);
    return { directory, module: await import(pathToFileURL(target).href) };
}

const [modelSource, presentationSource, schemaSource, cssSource, loaderSource] =
    await Promise.all([
        readFile(paths.model, "utf8"),
        readFile(paths.presentation, "utf8"),
        readFile(paths.schema, "utf8"),
        readFile(paths.css, "utf8"),
        readFile(paths.loader, "utf8")
    ]);

for (const pattern of [
    /\bdocument\b/,
    /\bwindow\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\.setItem\s*\(/,
    /growwithhr-report/,
    /api\/send-advisory/
]) {
    assert.equal(pattern.test(modelSource), false, `Pure model boundary failed: ${pattern}`);
}

for (const pattern of [
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\.setItem\s*\(/,
    /\.removeItem\s*\(/,
    /growwithhr-advisory-briefing-v2/,
    /growwithhr-report/,
    /api\/send-advisory/
]) {
    assert.equal(pattern.test(presentationSource), false, `Presentation boundary failed: ${pattern}`);
}

const loaded = await importModel();
try {
    const api = loaded.module;
    const bundle = createBundle();
    const snapshot = JSON.parse(JSON.stringify(bundle));
    const story = api.buildComplianceStory(bundle, { metadata: { scenario: "contract" } });

    assert.deepEqual(bundle, snapshot, "M3 must not mutate M2 output.");
    assert.equal(story.modelVersion, "1.0.0");
    assert.equal(story.privateBetaOnly, true);
    assert.equal(story.stableReportMutation, false);
    assert.equal(story.metadata.protectedStateReadOnly, true);
    assert.equal(story.obligations.length, bundle.ruleEvaluations.length);
    assert.deepEqual(story.topPriorityIds, [
        "rule.governance.primary-state.review",
        "rule.workplace.multi-location.review",
        "rule.people.ownership.formal-function-review"
    ]);
    assert.deepEqual(story.complianceDna.counts, {
        applicable: 1,
        likelyApplicable: 1,
        notCurrentlyApplicable: 1,
        moreInformationNeeded: 1,
        specialistReview: 1,
        evidenceNotVerified: 5
    });
    assert.equal(story.assumptions[0].factId, "fact.workforce.remote-workforce-band");
    assert.equal(Object.isFrozen(story), true);
    assert.deepEqual(
        story.obligationGroups.flatMap((group) => group.obligationIds).sort(),
        story.obligations.map((item) => item.id).sort()
    );
    assert.deepEqual(
        api.buildComplianceStory(JSON.parse(JSON.stringify(bundle)), { metadata: { scenario: "contract" } }),
        story,
        "Identical governed input must produce identical output."
    );

    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(JSON.parse(schemaSource));
    assert.equal(validate(story), true, JSON.stringify(validate.errors, null, 2));

    assert(presentationSource.includes('"css/20-compliance-story.css"'));
    assert(presentationSource.includes("dnaComplianceStoryPriorityList"));
    assert(presentationSource.includes("dnaComplianceStoryGroupList"));
    assert(loaderSource.includes('document.getElementById("dnaTraceability")'));
    assert(loaderSource.includes('import("./assessment-v3/compliance-story-presentation.js")'));
    assert(cssSource.includes(".dna-compliance-story"));
    assert(cssSource.includes(":focus-visible"));
    assert(/@media\s*\(/.test(cssSource));
    assert(cssSource.includes("prefers-reduced-motion"));

    console.log("M3 Compliance Story contract checks passed.");
} finally {
    await rm(loaded.directory, { recursive: true, force: true });
}
