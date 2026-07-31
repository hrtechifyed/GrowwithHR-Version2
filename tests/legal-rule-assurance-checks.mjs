/**
 * GrowWithHR Legal Rule Assurance Checks
 *
 * Validates the provisional POSH legal-rule catalog and its deterministic
 * evaluation boundary without changing the stable report or delivery paths.
 */

import assert from "node:assert/strict";

import {
    mkdtemp,
    readFile,
    rm,
    writeFile
} from "node:fs/promises";

import {
    tmpdir
} from "node:os";

import path from "node:path";

import {
    fileURLToPath,
    pathToFileURL
} from "node:url";

const TEST_FILE =
    fileURLToPath(
        import.meta.url
    );

const TEST_DIRECTORY =
    path.dirname(
        TEST_FILE
    );

const PROJECT_ROOT =
    path.resolve(
        TEST_DIRECTORY,
        ".."
    );

const CONTRACT_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "traceability-contract.js"
    );

const FACT_MAPPER_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "fact-mapper.js"
    );

const EVALUATOR_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "recommendation-evaluator.js"
    );

const ASSURANCE_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "legal-rule-assurance.js"
    );

const CATALOG_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "assessment",
        "legal-applicability-rules.v1.json"
    );

const POSH_RECORD_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "knowledge-base",
        "laws",
        "central",
        "posh.json"
    );

const PDF_LAW_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "pdf-law-transparency-core.js"
    );

const RAG_README_PATH =
    path.join(
        PROJECT_ROOT,
        "growwithhr-rag",
        "README.md"
    );

const FIXED_DATE_TIME =
    "2026-07-31T00:00:00.000Z";

function clone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function rewriteImports(source) {
    return source
        .replaceAll(
            "\"./traceability-contract.js\"",
            "\"./traceability-contract.mjs\""
        )
        .replaceAll(
            "'./traceability-contract.js'",
            "'./traceability-contract.mjs'"
        )
        .replaceAll(
            "\"./fact-mapper.js\"",
            "\"./fact-mapper.mjs\""
        )
        .replaceAll(
            "'./fact-mapper.js'",
            "'./fact-mapper.mjs'"
        )
        .replaceAll(
            "\"./recommendation-evaluator.js\"",
            "\"./recommendation-evaluator.mjs\""
        )
        .replaceAll(
            "'./recommendation-evaluator.js'",
            "'./recommendation-evaluator.mjs'"
        );
}

function assertIssue(
    validation,
    expectedPath,
    message
) {
    assert.equal(
        validation.valid,
        false,
        message
    );

    assert(
        validation.errors.some(
            (issue) =>
                issue.path ===
                expectedPath
        ),
        [
            message,
            `Expected issue path: ${expectedPath}`,
            "Actual issues:",
            JSON.stringify(
                validation.errors,
                null,
                2
            )
        ].join("\n")
    );
}

async function loadAssuranceModule() {
    const temporaryDirectory =
        await mkdtemp(
            path.join(
                tmpdir(),
                "growwithhr-legal-assurance-"
            )
        );

    const [
        contractSource,
        factMapperSource,
        evaluatorSource,
        assuranceSource
    ] =
        await Promise.all([
            readFile(
                CONTRACT_PATH,
                "utf8"
            ),
            readFile(
                FACT_MAPPER_PATH,
                "utf8"
            ),
            readFile(
                EVALUATOR_PATH,
                "utf8"
            ),
            readFile(
                ASSURANCE_PATH,
                "utf8"
            )
        ]);

    const contractModulePath =
        path.join(
            temporaryDirectory,
            "traceability-contract.mjs"
        );

    const factMapperModulePath =
        path.join(
            temporaryDirectory,
            "fact-mapper.mjs"
        );

    const evaluatorModulePath =
        path.join(
            temporaryDirectory,
            "recommendation-evaluator.mjs"
        );

    const assuranceModulePath =
        path.join(
            temporaryDirectory,
            "legal-rule-assurance.mjs"
        );

    await Promise.all([
        writeFile(
            contractModulePath,
            contractSource,
            "utf8"
        ),
        writeFile(
            factMapperModulePath,
            rewriteImports(
                factMapperSource
            ),
            "utf8"
        ),
        writeFile(
            evaluatorModulePath,
            rewriteImports(
                evaluatorSource
            ),
            "utf8"
        ),
        writeFile(
            assuranceModulePath,
            rewriteImports(
                assuranceSource
            ),
            "utf8"
        )
    ]);

    const assurance =
        await import(
            pathToFileURL(
                assuranceModulePath
            ).href
        );

    return {
        temporaryDirectory,
        assuranceSource,
        assurance
    };
}

async function main() {
    const loaded =
        await loadAssuranceModule();

    try {
        const [
            catalog,
            poshRecord,
            pdfLawSource,
            ragReadme
        ] =
            await Promise.all([
                readFile(
                    CATALOG_PATH,
                    "utf8"
                ).then(JSON.parse),
                readFile(
                    POSH_RECORD_PATH,
                    "utf8"
                ).then(JSON.parse),
                readFile(
                    PDF_LAW_PATH,
                    "utf8"
                ),
                readFile(
                    RAG_README_PATH,
                    "utf8"
                )
            ]);

        const {
            assuranceSource,
            assurance
        } =
            loaded;

        assert.equal(
            assurance
                .LEGAL_RULE_ASSURANCE_VERSION,
            "0.1.0",
            "The provisional legal assurance version must remain explicit."
        );

        assert.equal(
            catalog.legalRuleCatalog,
            true,
            "The catalog must identify itself as a legal-rule catalog."
        );

        assert.equal(
            catalog.legalReviewStatus,
            "needs-legal-review",
            "The POSH catalog must remain needs-legal-review."
        );

        assert.equal(
            catalog.applicabilityAuthority,
            "deterministic-only"
        );

        assert.equal(
            catalog.retrievalRole,
            "source-retrieval-only"
        );

        assert.equal(
            catalog.llmRole,
            "explanation-only"
        );

        const catalogValidation =
            assurance
                .validateLegalRuleCatalog(
                    catalog
                );

        assert.deepEqual(
            catalogValidation,
            {
                valid:
                    true,
                errors:
                    Object.freeze([])
            },
            "The committed provisional legal catalog must pass validation."
        );

        assert.equal(
            catalog.rules.length,
            1,
            "The first legal-assurance increment must contain only the provisional POSH rule."
        );

        const rule =
            catalog.rules[0];

        assert.equal(
            rule.productRuleId,
            "posh"
        );

        assert.equal(
            rule.sourceRecordId,
            "CENTRAL-POSH"
        );

        assert.equal(
            rule.legalReviewStatus,
            "needs-legal-review"
        );

        assert.equal(
            poshRecord.id,
            rule.sourceRecordId,
            "The legal rule must resolve to the existing governed POSH law record."
        );

        assert.equal(
            poshRecord.governance.approvalStatus,
            "draft",
            "The governed POSH record must remain draft."
        );

        assert.deepEqual(
            rule.officialSourceIds,
            [
                "posh-act-2013",
                "posh-rules-2013",
                "posh-commencement-2013"
            ],
            "The catalog must use the three governed Source Register IDs."
        );

        assert.equal(
            rule.outcomes.matched.status,
            "specialist-review",
            "A needs-legal-review rule must not emit an approved applicability status."
        );

        assert.equal(
            rule.missingInformationHandling.neverInferMissingFacts,
            true
        );

        assert.equal(
            rule.missingInformationHandling.allowRetrievalToFillFacts,
            false
        );

        assert.equal(
            rule.missingInformationHandling.allowLlmToFillFacts,
            false
        );

        assert.equal(
            rule.automatedBoundaryTestScenarios.length >=
                6,
            true,
            "The POSH rule must include threshold and missing-information boundaries."
        );

        for (
            const scenario
            of rule.automatedBoundaryTestScenarios
        ) {
            const result =
                assurance
                    .evaluateLegalRuleAssurance({
                        answers:
                            scenario.answers,
                        catalog,
                        evaluatedAt:
                            FIXED_DATE_TIME
                    });

            assert.equal(
                result.decisions.length,
                1,
                `${scenario.scenarioId} must return one product-rule decision.`
            );

            const decision =
                result.decisions[0];

            assert.equal(
                decision.productRuleId,
                "posh",
                `${scenario.scenarioId} must preserve the product rule ID.`
            );

            assert.equal(
                decision.status,
                scenario.expectedStatus,
                `${scenario.scenarioId} returned an unexpected status.`
            );

            assert.equal(
                decision.reasonCode,
                scenario.expectedReasonCode,
                `${scenario.scenarioId} returned an unexpected reason code.`
            );

            assert.equal(
                decision.legalReviewStatus,
                "needs-legal-review"
            );

            assert.deepEqual(
                decision.sourceRegistryIds,
                rule.officialSourceIds,
                `${scenario.scenarioId} must retain the governed source registry IDs.`
            );

            assert.equal(
                result.applicabilityAuthority,
                "deterministic-only"
            );

            assert.equal(
                result.retrievalRole,
                "source-retrieval-only"
            );

            assert.equal(
                result.llmRole,
                "explanation-only"
            );

            assert.equal(
                Object.isFrozen(
                    result
                ),
                true,
                "The legal assurance result must be frozen."
            );

            assert.equal(
                Object.isFrozen(
                    result.decisions
                ),
                true,
                "The decision collection must be frozen."
            );

            assert.equal(
                Object.isFrozen(
                    result.traceability
                ),
                true,
                "The delegated traceability bundle must remain frozen."
            );
        }

        const deterministicScenario =
            rule.automatedBoundaryTestScenarios
                .find(
                    (scenario) =>
                        scenario.scenarioId ===
                        "posh-ic-at-threshold"
                );

        const firstResult =
            assurance
                .evaluateLegalRuleAssurance({
                    answers:
                        deterministicScenario.answers,
                    catalog,
                    evaluatedAt:
                        FIXED_DATE_TIME
                });

        const secondResult =
            assurance
                .evaluateLegalRuleAssurance({
                    answers:
                        clone(
                            deterministicScenario.answers
                        ),
                    catalog:
                        clone(
                            catalog
                        ),
                    evaluatedAt:
                        FIXED_DATE_TIME
                });

        assert.deepEqual(
            firstResult,
            secondResult,
            "Identical facts, catalog and timestamps must return identical legal decisions."
        );

        const retrievalMutation =
            clone(
                catalog
            );

        retrievalMutation
            .rules[0]
            .missingInformationHandling
            .allowRetrievalToFillFacts =
            true;

        assertIssue(
            assurance
                .validateLegalRuleCatalog(
                    retrievalMutation
                ),
            "/rules/0/missingInformationHandling/allowRetrievalToFillFacts",
            "Retrieval must never fill missing assessment facts."
        );

        const llmMutation =
            clone(
                catalog
            );

        llmMutation
            .rules[0]
            .missingInformationHandling
            .allowLlmToFillFacts =
            true;

        assertIssue(
            assurance
                .validateLegalRuleCatalog(
                    llmMutation
                ),
            "/rules/0/missingInformationHandling/allowLlmToFillFacts",
            "A language model must never fill missing assessment facts."
        );

        const approvalMutation =
            clone(
                catalog
            );

        approvalMutation
            .rules[0]
            .outcomes
            .matched
            .status =
            "applicable";

        approvalMutation
            .rules[0]
            .permittedResultStatuses
            .push(
                "applicable"
            );

        assertIssue(
            assurance
                .validateLegalRuleCatalog(
                    approvalMutation
                ),
            "/rules/0/outcomes/matched/status",
            "A needs-legal-review rule must not emit applicable."
        );

        const sourceMutation =
            clone(
                catalog
            );

        sourceMutation
            .rules[0]
            .officialSourceIds[0] =
            "unknown-source";

        assertIssue(
            assurance
                .validateLegalRuleCatalog(
                    sourceMutation
                ),
            "/rules/0/officialSourceIds/0",
            "Unknown Source Register IDs must be rejected."
        );

        const prohibitedRuntimePatterns = [
            /\bdocument\b/,
            /\bwindow\b/,
            /\blocalStorage\b/,
            /\bsessionStorage\b/,
            /\bXMLHttpRequest\b/,
            /\bfetch\s*\(/,
            /\bsetTimeout\s*\(/,
            /\bsetInterval\s*\(/,
            /\bDate\.now\s*\(/,
            /\bnew\s+Date\s*\(\s*\)/,
            /\bOpenAI\b/,
            /\bAnthropic\b/
        ];

        for (
            const pattern
            of prohibitedRuntimePatterns
        ) {
            assert.equal(
                pattern.test(
                    assuranceSource
                ),
                false,
                `Legal assurance must not contain prohibited runtime reference ${pattern}.`
            );
        }

        assert.equal(
            pdfLawSource.includes(
                'law("posh"'
            ),
            true,
            "The existing production POSH product rule must remain present and untouched."
        );

        assert.equal(
            ragReadme.includes(
                "must not"
            ),
            true,
            "The RAG research boundary must remain explicit."
        );

        console.log(
            "Legal rule assurance checks passed."
        );
    } finally {
        await rm(
            loaded.temporaryDirectory,
            {
                recursive:
                    true,
                force:
                    true
            }
        );
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
