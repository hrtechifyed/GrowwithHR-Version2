import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    OPERATIONAL_EXPLANATION_PANEL_VERSION,
    OPERATIONAL_EXPLANATION_ROUTE,
    OPERATIONAL_EXPLANATION_RENDER_ENDPOINT,
    OPERATIONAL_EXPLANATION_STYLESHEET,
    OPERATIONAL_FEATURES,
    extractOperationalExplanationAnswers,
    createOperationalExplanationRequestPayload,
    resolveOperationalExplanationEndpoint,
    validateOperationalExplanationEnvelope
} from "../js/assessment-v3/operational-explanation-panel.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTROLLER_PATH = path.join(ROOT, "js", "assessment-v3", "operational-explanation-panel.js");
const BOOTSTRAP_PATH = path.join(ROOT, "js", "assessment-v3", "bootstrap.js");
const BOOTSTRAP_CORE_PATH = path.join(ROOT, "js", "assessment-v3", "bootstrap-core.js");
const CSS_PATH = path.join(ROOT, "css", "21-operational-explanation-panel.css");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const E2E_SPEC = "tests/e2e/analyze-company-v3-operational-explanation.spec.ts";

function savedState(overrides = {}) {
    return {
        version: "2.1.0",
        schemaVersion: 1,
        answers: {
            companyName: "Private organisation name",
            employees: "12",
            locations: "3",
            workModel: "Remote",
            remoteBand: "51-75%",
            remoteExact: "60",
            hiringPlans: "Significant Growth",
            expansionPlans: ["new-locations"],
            peopleFunction: "Founder-led",
            priorities: ["policies-compliance"],
            primaryState: "Maharashtra",
            ...overrides
        },
        lead: {
            name: "Private Person",
            email: "private@example.com",
            phone: "+91-0000000000"
        }
    };
}

function validEnvelope(featureId = "feature.advisory.workforce-planning") {
    return {
        endpointVersion: "1.0.0",
        featureId,
        recommendationAuthority: "deterministic-operational",
        providerRole: "explanation-only",
        usedForRecommendation: false,
        mayChangeRecommendation: false,
        legalAdvice: false,
        recommendation: {
            featureId,
            ruleId: "rule.growth.rapid-change.workforce-planning",
            ruleVersion: "1.0.0",
            operationalStatus: "recommended",
            reasonCode: "WORKFORCE_PLANNING_RECOMMENDED",
            reason: "The organisation reported significant hiring growth.",
            title: "Create a workforce plan",
            action: "Document expected roles and ownership.",
            timeline: "Before major hiring begins",
            recommendationFingerprint: "d".repeat(64),
            sourceIds: ["source.labour-ministry.official-portal"],
            limitations: [],
            triggeringFactIds: ["fact.growth.rapid-growth"],
            missingFactIds: []
        },
        guidance: {
            sources: [{
                id: "source.labour-ministry.official-portal",
                title: "Ministry of Labour and Employment",
                publisher: "Government of India",
                url: "https://www.labour.gov.in/",
                sourceType: "official-portal",
                official: true
            }]
        },
        explanation: {
            contractVersion: "1.0.0",
            explanationStatus: "completed",
            provider: {
                name: "cloudflare-workers-ai",
                model: "@cf/meta/llama-3.1-8b-instruct-fast",
                role: "explanation-only"
            },
            usedForRecommendation: false,
            mayChangeRecommendation: false,
            legalAdvice: false,
            recommendationFingerprint: "d".repeat(64),
            response: {
                contractVersion: "1.0.0",
                recommendationFingerprint: "d".repeat(64),
                operationalStatus: "recommended",
                reasonCode: "WORKFORCE_PLANNING_RECOMMENDED",
                summary: "The deterministic recommendation suggests preparing a workforce plan.",
                rationale: [{
                    statement: "The reported growth context triggered the fixed recommendation.",
                    sourceIds: ["source.labour-ministry.official-portal"]
                }],
                nextSteps: ["Document expected roles and ownership."],
                limitations: [
                    "This explanation does not change the deterministic operational recommendation.",
                    "This output is general HR guidance and not legal advice.",
                    "Assessment answers and supporting evidence have not been independently verified."
                ],
                usedForRecommendation: false,
                mayChangeRecommendation: false,
                legalAdvice: false
            }
        },
        delivery: {
            cacheStatus: "miss",
            providerRequestsForThisResponse: 1
        }
    };
}

function changedEnvelope(change) {
    const value = structuredClone(validEnvelope());
    change(value);
    return value;
}

async function main() {
    const [source, bootstrap, bootstrapCore, css, packageJson] = await Promise.all([
        readFile(CONTROLLER_PATH, "utf8"),
        readFile(BOOTSTRAP_PATH, "utf8"),
        readFile(BOOTSTRAP_CORE_PATH, "utf8"),
        readFile(CSS_PATH, "utf8"),
        readFile(PACKAGE_PATH, "utf8").then(JSON.parse)
    ]);

    assert.equal(OPERATIONAL_EXPLANATION_PANEL_VERSION, "1.0.0");
    assert.equal(OPERATIONAL_EXPLANATION_ROUTE, "/api/operational-explanation");
    assert.equal(
        OPERATIONAL_EXPLANATION_RENDER_ENDPOINT,
        "https://growwithhr.onrender.com/api/operational-explanation"
    );
    assert.equal(OPERATIONAL_EXPLANATION_STYLESHEET, "css/21-operational-explanation-panel.css");
    assert.equal(OPERATIONAL_FEATURES.length, 6);
    assert.equal(new Set(OPERATIONAL_FEATURES.map((feature) => feature.id)).size, 6);

    const expectedPayloads = new Map([
        [
            "feature.advisory.employment-documentation",
            { employees: 12 }
        ],
        [
            "feature.advisory.multi-location-workplace",
            { locations: 3 }
        ],
        [
            "feature.advisory.distributed-workforce",
            { workModel: "Remote", remoteBand: "51-75%", remoteExact: 60 }
        ],
        [
            "feature.advisory.workforce-planning",
            { hiringPlans: "Significant Growth", expansionPlans: ["new-locations"] }
        ],
        [
            "feature.advisory.people-governance-ownership",
            { peopleFunction: "Founder-led" }
        ],
        [
            "feature.advisory.policies-compliance-priority",
            { priorities: ["policies-compliance"] }
        ]
    ]);

    for (const feature of OPERATIONAL_FEATURES) {
        const extracted = extractOperationalExplanationAnswers(savedState(), feature.id);
        assert.deepEqual(extracted.answers, expectedPayloads.get(feature.id));
        assert.deepEqual(extracted.missingFields, []);

        const payload = createOperationalExplanationRequestPayload(savedState(), feature.id);
        assert.deepEqual(Object.keys(payload), ["featureId", "answers"]);
        assert.equal(payload.featureId, feature.id);
        assert.deepEqual(payload.answers, expectedPayloads.get(feature.id));

        const serialized = JSON.stringify(payload);
        assert.doesNotMatch(serialized, /Private organisation name/);
        assert.doesNotMatch(serialized, /private@example\.com/);
        assert.doesNotMatch(serialized, /Private Person/);
        assert.doesNotMatch(serialized, /primaryState/);
    }

    const missing = extractOperationalExplanationAnswers(
        savedState({ hiringPlans: "", expansionPlans: [] }),
        "feature.advisory.workforce-planning"
    );
    assert.deepEqual(missing.answers, {});
    assert.deepEqual(missing.missingFields, ["hiring plan", "expansion plans"]);
    assert.deepEqual(
        createOperationalExplanationRequestPayload(
            savedState({ hiringPlans: "", expansionPlans: [] }),
            "feature.advisory.workforce-planning"
        ),
        {
            featureId: "feature.advisory.workforce-planning",
            answers: {}
        }
    );

    assert.throws(
        () => extractOperationalExplanationAnswers(savedState(), "feature.legal.social-security"),
        /Unsupported operational explanation feature/
    );

    assert.equal(
        resolveOperationalExplanationEndpoint({
            location: {
                origin: "https://hrtechifyed.github.io",
                pathname: "/GrowwithHR-Version2/analyze-company-v3.html"
            }
        }),
        OPERATIONAL_EXPLANATION_RENDER_ENDPOINT
    );
    assert.equal(
        resolveOperationalExplanationEndpoint({
            location: {
                origin: "http://localhost:3000",
                pathname: "/analyze-company-v3.html"
            }
        }),
        OPERATIONAL_EXPLANATION_ROUTE
    );
    assert.equal(
        resolveOperationalExplanationEndpoint(
            { location: { origin: "http://localhost", pathname: "/" } },
            { body: { dataset: { operationalExplanationEndpoint: "https://example.com/custom" } } }
        ),
        "https://example.com/custom"
    );

    const valid = validEnvelope();
    assert.equal(
        validateOperationalExplanationEnvelope(valid, valid.featureId),
        valid
    );

    assert.throws(
        () => validateOperationalExplanationEnvelope(
            changedEnvelope((value) => { value.recommendationAuthority = "provider"; })
        ),
        /authority boundaries/
    );
    assert.throws(
        () => validateOperationalExplanationEnvelope(
            changedEnvelope((value) => { value.recommendation.operationalStatus = "applicable"; })
        ),
        /deterministic operational recommendation/
    );
    assert.throws(
        () => validateOperationalExplanationEnvelope(
            changedEnvelope((value) => { value.guidance.sources[0].url = "http://example.com"; })
        ),
        /guidance references/
    );
    assert.throws(
        () => validateOperationalExplanationEnvelope(
            changedEnvelope((value) => { value.explanation.response.reasonCode = "CHANGED"; })
        ),
        /did not match/
    );
    assert.throws(
        () => validateOperationalExplanationEnvelope(
            changedEnvelope((value) => { value.explanation.response.rationale[0].sourceIds = ["unknown"]; })
        ),
        /did not match/
    );
    assert.throws(
        () => validateOperationalExplanationEnvelope(
            changedEnvelope((value) => { value.explanation.response.limitations.shift(); })
        ),
        /did not match/
    );

    assert.match(source, /automaticProviderCall:\s*false/);
    assert.match(source, /newStorageKeyIntroduced:\s*false/);
    assert.match(source, /stableReportMutation:\s*false/);
    assert.match(source, /stablePdfMutation:\s*false/);
    assert.match(source, /stableEmailMutation:\s*false/);
    assert.doesNotMatch(source, /\.setItem\s*\(/);
    assert.doesNotMatch(source, /\.removeItem\s*\(/);
    assert.doesNotMatch(source, /\.clear\s*\(/);
    assert.match(bootstrap, /operational-explanation-panel\.js/);
    assert.match(bootstrap, /bootstrap-core\.js/);
    assert.match(bootstrapCore, /legal-explanation-panel\.js/);
    assert.match(bootstrapCore, /m1-five-act-shell/);
    assert.match(css, /dna-operational-explanation__feature-grid/);
    assert.match(css, /prefers-reduced-motion/);

    assert.equal(
        packageJson.scripts["test:operational-explanation-client"],
        "node tests/operational-explanation-client-checks.mjs"
    );
    assert.match(packageJson.scripts["test:m2"], /test:operational-explanation-client/);
    assert.match(packageJson.scripts["test:release:e2e"], new RegExp(E2E_SPEC.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    console.log("Operational explanation client checks passed.");
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
