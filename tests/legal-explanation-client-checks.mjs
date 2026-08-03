import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    LEGAL_EXPLANATION_PANEL_VERSION,
    LEGAL_EXPLANATION_ROUTE,
    LEGAL_EXPLANATION_RENDER_ENDPOINT,
    LEGAL_EXPLANATION_STYLESHEET,
    extractPoshExplanationAnswers,
    createPoshExplanationRequestPayload,
    resolveLegalExplanationEndpoint,
    validateLegalExplanationResponse
} from "../js/assessment-v3/legal-explanation-panel.js";

const ROOT =
    path.resolve(
        path.dirname(
            fileURLToPath(import.meta.url)
        ),
        ".."
    );

const CONTROLLER_PATH =
    path.join(
        ROOT,
        "js",
        "assessment-v3",
        "legal-explanation-panel.js"
    );

const BOOTSTRAP_PATH =
    path.join(
        ROOT,
        "js",
        "assessment-v3",
        "bootstrap.js"
    );

const CSS_PATH =
    path.join(
        ROOT,
        "css",
        "20-legal-explanation-panel.css"
    );

const PACKAGE_PATH =
    path.join(
        ROOT,
        "package.json"
    );

function savedState(overrides = {}) {
    return {
        version:
            "2.1.0",
        schemaVersion:
            1,
        answers: {
            companyName:
                "Private data must not be submitted",
            employees:
                "10",
            primaryState:
                "Maharashtra",
            locations:
                "1",
            priorities: [
                "policies-compliance"
            ],
            ...overrides
        },
        lead: {
            name:
                "Private Person",
            email:
                "private@example.com"
        }
    };
}

function validResponse() {
    return {
        endpointVersion:
            "0.1.0",
        lawId:
            "posh",
        legalReviewStatus:
            "needs-legal-review",
        applicabilityAuthority:
            "deterministic-only",
        providerRole:
            "explanation-only",
        usedForDecision:
            false,
        mayChangeDecision:
            false,
        decision: {
            status:
                "specialist-review",
            reasonCode:
                "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
            legalReviewStatus:
                "needs-legal-review"
        },
        retrieval: {
            retrievalStatus:
                "completed",
            decisionFingerprint:
                "c1ee3b36",
            retrievalFingerprint:
                "21fd9b70",
            citations: [{
                chunkId:
                    "posh-act-2013-section-4-001",
                sourceTitle:
                    "POSH Act, 2013",
                officialUrl:
                    "https://www.indiacode.nic.in/handle/123456789/2104?locale=en"
            }]
        },
        explanation: {
            explanationStatus:
                "completed",
            provider: {
                name:
                    "cloudflare-workers-ai",
                model:
                    "@cf/meta/llama-3.1-8b-instruct-fast",
                role:
                    "explanation-only"
            },
            usedForDecision:
                false,
            mayChangeDecision:
                false,
            legalAdvice:
                false,
            decisionFingerprint:
                "c1ee3b36",
            retrievalFingerprint:
                "21fd9b70",
            response: {
                contractVersion:
                    "1.0.0",
                decisionFingerprint:
                    "c1ee3b36",
                decisionStatus:
                    "specialist-review",
                reasonCode:
                    "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
                summary:
                    "The deterministic POSH result requires specialist review.",
                rationale: [{
                    statement:
                        "The approved Section 4 source supports review of the recorded threshold result.",
                    citationChunkIds: [
                        "posh-act-2013-section-4-001"
                    ]
                }],
                nextSteps: [
                    "Obtain legal review."
                ],
                limitations: [
                    "This explanation does not change the deterministic decision.",
                    "The rule and source interpretation remain subject to legal review.",
                    "Assessment answers and evidence have not been independently verified."
                ],
                legalReviewStatus:
                    "needs-legal-review",
                usedForDecision:
                    false,
                mayChangeDecision:
                    false,
                legalAdvice:
                    false
            }
        },
        delivery: {
            cacheStatus:
                "miss",
            providerRequestsForThisResponse:
                1
        }
    };
}

async function main() {
    const [
        source,
        bootstrap,
        css,
        packageJson
    ] =
        await Promise.all([
            readFile(
                CONTROLLER_PATH,
                "utf8"
            ),
            readFile(
                BOOTSTRAP_PATH,
                "utf8"
            ),
            readFile(
                CSS_PATH,
                "utf8"
            ),
            readFile(
                PACKAGE_PATH,
                "utf8"
            ).then(JSON.parse)
        ]);

    assert.equal(
        LEGAL_EXPLANATION_PANEL_VERSION,
        "1.0.0"
    );

    assert.equal(
        LEGAL_EXPLANATION_ROUTE,
        "/api/legal-explanation/posh"
    );

    assert.equal(
        LEGAL_EXPLANATION_RENDER_ENDPOINT,
        "https://growwithhr.onrender.com/api/legal-explanation/posh"
    );

    assert.equal(
        LEGAL_EXPLANATION_STYLESHEET,
        "css/20-legal-explanation-panel.css"
    );

    const extracted =
        extractPoshExplanationAnswers(
            savedState()
        );

    assert.deepEqual(
        extracted,
        {
            ready:
                true,
            answers: {
                employees:
                    10,
                primaryState:
                    "Maharashtra",
                locations:
                    1
            },
            missingFields: []
        }
    );

    const wrapped =
        extractPoshExplanationAnswers({
            data:
                savedState({
                    employees:
                        9,
                    primaryState:
                        "Karnataka",
                    locations:
                        2
                })
        });

    assert.equal(
        wrapped.ready,
        true
    );

    assert.deepEqual(
        wrapped.answers,
        {
            employees:
                9,
            primaryState:
                "Karnataka",
            locations:
                2
        }
    );

    const missing =
        extractPoshExplanationAnswers(
            savedState({
                employees:
                    "",
                primaryState:
                    "",
                locations:
                    "0"
            })
        );

    assert.equal(
        missing.ready,
        false
    );

    assert.deepEqual(
        missing.missingFields,
        [
            "employee count",
            "primary operating state",
            "operating location count"
        ]
    );

    const payload =
        createPoshExplanationRequestPayload(
            savedState()
        );

    assert.deepEqual(
        Object.keys(payload),
        [
            "answers"
        ]
    );

    assert.deepEqual(
        Object.keys(payload.answers),
        [
            "employees",
            "primaryState",
            "locations"
        ]
    );

    assert.equal(
        JSON.stringify(payload).includes(
            "Private data"
        ),
        false
    );

    assert.equal(
        JSON.stringify(payload).includes(
            "private@example.com"
        ),
        false
    );

    assert.throws(
        () =>
            createPoshExplanationRequestPayload(
                savedState({
                    primaryState:
                        ""
                })
            ),
        /primary operating state/i
    );

    assert.equal(
        resolveLegalExplanationEndpoint({
            location: {
                origin:
                    "https://hrtechifyed.github.io",
                pathname:
                    "/GrowwithHR-Version2/analyze-company-v3.html"
            }
        }),
        LEGAL_EXPLANATION_RENDER_ENDPOINT
    );

    assert.equal(
        resolveLegalExplanationEndpoint({
            location: {
                origin:
                    "http://127.0.0.1:4173",
                pathname:
                    "/analyze-company-v3.html"
            }
        }),
        LEGAL_EXPLANATION_ROUTE
    );

    assert.equal(
        resolveLegalExplanationEndpoint(
            {
                location: {
                    origin:
                        "http://127.0.0.1:4173",
                    pathname:
                        "/analyze-company-v3.html"
                },
                GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT:
                    "https://example.test/legal"
            }
        ),
        "https://example.test/legal"
    );

    assert.equal(
        validateLegalExplanationResponse(
            validResponse()
        ).decision.status,
        "specialist-review"
    );

    for (
        const mutation
        of [
            (value) => {
                value.usedForDecision =
                    true;
            },
            (value) => {
                value.mayChangeDecision =
                    true;
            },
            (value) => {
                value.applicabilityAuthority =
                    "llm";
            },
            (value) => {
                value.explanation.response.legalAdvice =
                    true;
            },
            (value) => {
                value.explanation.response.decisionStatus =
                    "not-currently-applicable";
            },
            (value) => {
                value.retrieval.retrievalStatus =
                    "pending";
            }
        ]
    ) {
        const changed =
            structuredClone(
                validResponse()
            );

        mutation(changed);

        assert.throws(
            () =>
                validateLegalExplanationResponse(
                    changed
                )
        );
    }

    assert.match(
        bootstrap,
        /import\s+"\.\/legal-explanation-panel\.js";/
    );

    assert.match(
        source,
        /credentials:\s*"omit"/
    );

    assert.match(
        source,
        /cache:\s*"no-store"/
    );

    assert.match(
        source,
        /automaticProviderCall:\s*false/
    );

    assert.match(
        source,
        /newStorageKeyIntroduced:\s*false/
    );

    assert.match(
        source,
        /stableReportMutation:\s*false/
    );

    assert.match(
        source,
        /stablePdfMutation:\s*false/
    );

    assert.match(
        source,
        /stableEmailMutation:\s*false/
    );

    for (
        const forbidden
        of [
            /localStorage\.setItem/,
            /localStorage\.removeItem/,
            /localStorage\.clear/,
            /GrowWithHRPDF/,
            /GrowWithHREmail/,
            /growwithhr-report/,
            /growwithhr-lead/,
            /createDeterministicLegalExplanation/,
            /evaluateLegalRuleAssurance/
        ]
    ) {
        assert.equal(
            forbidden.test(source),
            false,
            `Private-beta legal explanation client contains forbidden marker ${forbidden}.`
        );
    }

    assert.match(
        css,
        /body\.compliance-dna-page \.dna-legal-explanation/
    );

    assert.match(
        css,
        /@media \(prefers-reduced-motion: reduce\)/
    );

    assert.equal(
        packageJson.scripts[
            "test:legal-explanation-client"
        ],
        "node tests/legal-explanation-client-checks.mjs"
    );

    assert.match(
        packageJson.scripts["test:m2"],
        /test:legal-explanation-client/
    );

    console.log([
        "Private-beta POSH legal explanation client checks passed.",
        "Submitted assessment fields: employees, primaryState, locations",
        "Automatic provider calls: 0",
        "New storage keys: 0",
        "Stable report, PDF and email mutations: 0"
    ].join("\n"));
}

main().catch((error) => {
    console.error(
        error?.stack ||
        error?.message ||
        String(error)
    );
    process.exitCode =
        1;
});
