/**
 * GrowWithHR Feature Coverage Registry v1 Checks
 *
 * Validates the descriptive feature registry, cross-references existing
 * governed and legacy rule identifiers, and confirms that the registry is not
 * loaded by runtime decision, retrieval, report, PDF, email, or UI code.
 */

import assert from "node:assert/strict";

import {
    access,
    readFile,
    readdir
} from "node:fs/promises";

import path from "node:path";

import {
    fileURLToPath
} from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const TEST_FILE =
    fileURLToPath(
        import.meta.url
    );

const PROJECT_ROOT =
    path.resolve(
        path.dirname(
            TEST_FILE
        ),
        ".."
    );

const REGISTRY_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "assessment",
        "feature-coverage-registry.v1.json"
    );

const SCHEMA_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "schema",
        "feature-coverage-registry.schema.v1.json"
    );

const LEGAL_RULE_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "assessment",
        "legal-applicability-rules.v1.json"
    );

const RECOMMENDATION_RULE_PATH =
    path.join(
        PROJECT_ROOT,
        "data",
        "assessment",
        "recommendation-rules.v1.json"
    );

const FACT_MAPPER_PATH =
    path.join(
        PROJECT_ROOT,
        "js",
        "assessment-v3",
        "fact-mapper.js"
    );

const LAW_DIRECTORY =
    path.join(
        PROJECT_ROOT,
        "data",
        "knowledge-base",
        "laws"
    );

const LEGACY_RULE_PATHS =
    [
        "hiring",
        "policy",
        "talent",
        "rewards",
        "learning",
        "culture"
    ].map(
        (moduleName) =>
            path.join(
                PROJECT_ROOT,
                "js",
                "modules",
                moduleName,
                "rules.js"
            )
    );

const RUNTIME_PATHS =
    [
        path.join(
            PROJECT_ROOT,
            "app.js"
        ),
        path.join(
            PROJECT_ROOT,
            "server-legal-explanation.js"
        ),
        path.join(
            PROJECT_ROOT,
            "js",
            "assessment-v3",
            "bootstrap.js"
        )
    ];

const PACKAGE_PATH =
    path.join(
        PROJECT_ROOT,
        "package.json"
    );

const EXPECTED_FEATURE_IDS =
    Object.freeze([
        "feature.legal.posh.internal-committee-threshold",
        "feature.legal.posh.policy-review",
        "feature.legal.posh.awareness-training-review",
        "feature.legal.posh.notice-display-review",
        "feature.legal.posh.complaint-mechanism-records-review",
        "feature.legal.posh.internal-committee-composition-unit-review",
        "feature.legal.posh.annual-reporting-review",
        "feature.legal.jurisdiction.appropriate-government",
        "feature.legal.state.shops-establishments",
        "feature.legal.code-on-wages",
        "feature.legal.social-security",
        "feature.legal.oshwc",
        "feature.legal.industrial-relations",
        "feature.legal.apprentices",
        "feature.legal.child-adolescent-labour",
        "feature.legal.bonded-forced-labour",
        "feature.legal.contract-workforce",
        "feature.legal.multi-country-employment",
        "feature.advisory.employment-documentation",
        "feature.advisory.multi-location-workplace",
        "feature.advisory.distributed-workforce",
        "feature.advisory.workforce-planning",
        "feature.advisory.people-governance-ownership",
        "feature.advisory.policies-compliance-priority",
        "feature.legacy.hiring-readiness",
        "feature.legacy.policy-readiness",
        "feature.legacy.talent-readiness",
        "feature.legacy.rewards-readiness",
        "feature.legacy.learning-readiness",
        "feature.legacy.culture-readiness"
    ]);

const EXPECTED_GOVERNED_RULE_IDS =
    Object.freeze([
        "rule.legal.posh.internal-committee-threshold",
        "rule.governance.primary-state.review",
        "rule.governance.employment-documentation.review",
        "rule.workplace.multi-location.review",
        "rule.workforce.distributed-workforce.review",
        "rule.growth.rapid-change.workforce-planning",
        "rule.people.ownership.formal-function-review",
        "rule.people.priority.policies-compliance"
    ]);

const EXPECTED_LEGACY_RULE_IDS =
    Object.freeze([
        ...Array.from(
            { length: 7 },
            (_, index) =>
                `HIR-${String(index + 1).padStart(3, "0")}`
        ),
        ...Array.from(
            { length: 7 },
            (_, index) =>
                `POL-${String(index + 1).padStart(3, "0")}`
        ),
        ...Array.from(
            { length: 7 },
            (_, index) =>
                `TAL-${String(index + 1).padStart(3, "0")}`
        ),
        ...Array.from(
            { length: 7 },
            (_, index) =>
                `REW-${String(index + 1).padStart(3, "0")}`
        ),
        ...Array.from(
            { length: 7 },
            (_, index) =>
                `LRN-${String(index + 1).padStart(3, "0")}`
        ),
        ...Array.from(
            { length: 7 },
            (_, index) =>
                `CUL-${String(index + 1).padStart(3, "0")}`
        )
    ]);

const PROHIBITED_REGISTRY_KEYS =
    new Set([
        "answers",
        "conditions",
        "decision",
        "evaluate",
        "match",
        "model",
        "operator",
        "outcomes",
        "prompt",
        "providerRequest",
        "request"
    ]);

async function readJson(filePath) {
    return JSON.parse(
        await readFile(
            filePath,
            "utf8"
        )
    );
}

async function findJsonFiles(directory) {
    const entries =
        await readdir(
            directory,
            {
                withFileTypes:
                    true
            }
        );

    const files = [];

    for (
        const entry
        of entries
    ) {
        const entryPath =
            path.join(
                directory,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {
            files.push(
                ...await findJsonFiles(
                    entryPath
                )
            );

            continue;
        }

        if (
            entry.isFile() &&
            entry.name.endsWith(
                ".json"
            )
        ) {
            files.push(
                entryPath
            );
        }
    }

    return files;
}

function collectObjectKeys(
    value,
    keys = new Set()
) {
    if (
        !value ||
        typeof value !==
            "object"
    ) {
        return keys;
    }

    if (
        Array.isArray(
            value
        )
    ) {
        value.forEach(
            (item) =>
                collectObjectKeys(
                    item,
                    keys
                )
        );

        return keys;
    }

    for (
        const [
            key,
            child
        ]
        of Object.entries(
            value
        )
    ) {
        keys.add(
            key
        );

        collectObjectKeys(
            child,
            keys
        );
    }

    return keys;
}

function assertSetEqual(
    actual,
    expected,
    message
) {
    assert.deepEqual(
        [
            ...actual
        ].sort(),
        [
            ...expected
        ].sort(),
        message
    );
}

async function main() {
    const [
        registrySource,
        registry,
        schema,
        legalCatalog,
        recommendationCatalog,
        factMapperSource,
        legacySources,
        runtimeSources,
        packageJson
    ] =
        await Promise.all([
            readFile(
                REGISTRY_PATH,
                "utf8"
            ),
            readJson(
                REGISTRY_PATH
            ),
            readJson(
                SCHEMA_PATH
            ),
            readJson(
                LEGAL_RULE_PATH
            ),
            readJson(
                RECOMMENDATION_RULE_PATH
            ),
            readFile(
                FACT_MAPPER_PATH,
                "utf8"
            ),
            Promise.all(
                LEGACY_RULE_PATHS.map(
                    (filePath) =>
                        readFile(
                            filePath,
                            "utf8"
                        )
                )
            ),
            Promise.all(
                RUNTIME_PATHS.map(
                    (filePath) =>
                        readFile(
                            filePath,
                            "utf8"
                        )
                )
            ),
            readJson(
                PACKAGE_PATH
            )
        ]);

    const ajv =
        new Ajv2020({
            allErrors:
                true,
            strict:
                false
        });

    addFormats(
        ajv
    );

    const validate =
        ajv.compile(
            schema
        );

    assert.equal(
        validate(
            registry
        ),
        true,
        [
            "The committed feature coverage registry must satisfy its schema.",
            JSON.stringify(
                validate.errors,
                null,
                2
            )
        ].join(
            "\n"
        )
    );

    assert.equal(
        registry.schemaVersion,
        1
    );

    assert.equal(
        registry.registryVersion,
        "1.0.0"
    );

    assert.equal(
        registry.legalReviewStatus,
        "needs-legal-review"
    );

    assert.equal(
        registry.features.length,
        30,
        "Registry v1 must cover the 30 approved feature families."
    );

    const featureIds =
        registry.features.map(
            (feature) =>
                feature.id
        );

    assert.equal(
        new Set(
            featureIds
        ).size,
        featureIds.length,
        "Feature identifiers must be unique."
    );

    assertSetEqual(
        new Set(
            featureIds
        ),
        new Set(
            EXPECTED_FEATURE_IDS
        ),
        "Registry v1 must preserve the complete approved feature-family inventory."
    );

    const factIds =
        new Set(
            [
                ...factMapperSource.matchAll(
                    /"(fact\.[a-z0-9.-]+)"/g
                )
            ].map(
                (match) =>
                    match[1]
            )
        );

    const governedRuleIds =
        new Set([
            ...legalCatalog.rules.map(
                (rule) =>
                    rule.id
            ),
            ...recommendationCatalog.rules.map(
                (rule) =>
                    rule.id
            )
        ]);

    const legacyRuleIds =
        new Set(
            legacySources.flatMap(
                (source) =>
                    [
                        ...source.matchAll(
                            /\b(?:HIR|POL|TAL|REW|LRN|CUL)-\d{3}\b/g
                        )
                    ].map(
                        (match) =>
                            match[0]
                    )
            )
        );

    assertSetEqual(
        legacyRuleIds,
        new Set(
            EXPECTED_LEGACY_RULE_IDS
        ),
        "All 42 legacy readiness checks must still exist in their module repositories."
    );

    const knownRuleIds =
        new Set([
            ...governedRuleIds,
            ...legacyRuleIds
        ]);

    const lawFiles =
        await findJsonFiles(
            LAW_DIRECTORY
        );

    const lawRecords =
        await Promise.all(
            lawFiles.map(
                readJson
            )
        );

    const lawRecordIds =
        new Set(
            lawRecords.map(
                (record) =>
                    record.id
            )
        );

    const registeredSourceIds =
        new Set(
            legalCatalog.sources
                .map(
                    (source) =>
                        source.registrySourceId
                )
                .filter(
                    Boolean
                )
        );

    const representedRuleIds =
        new Set();

    for (
        const feature
        of registry.features
    ) {
        for (
            const ruleId
            of feature.currentRuleRefs
        ) {
            assert.equal(
                knownRuleIds.has(
                    ruleId
                ),
                true,
                `${feature.id} references unknown rule ${ruleId}.`
            );

            representedRuleIds.add(
                ruleId
            );
        }

        for (
            const factId
            of feature.assessmentFacts.available
        ) {
            assert.equal(
                factIds.has(
                    factId
                ),
                true,
                `${feature.id} references unknown assessment fact ${factId}.`
            );
        }

        for (
            const recordSelector
            of feature.knowledgeBaseRecords
        ) {
            if (
                recordSelector.endsWith(
                    "*"
                )
            ) {
                const prefix =
                    recordSelector.slice(
                        0,
                        -1
                    );

                assert.equal(
                    [
                        ...lawRecordIds
                    ].some(
                        (recordId) =>
                            recordId.startsWith(
                                prefix
                            )
                    ),
                    true,
                    `${feature.id} uses an empty knowledge-record selector ${recordSelector}.`
                );

                continue;
            }

            assert.equal(
                lawRecordIds.has(
                    recordSelector
                ),
                true,
                `${feature.id} references unknown knowledge record ${recordSelector}.`
            );
        }

        for (
            const sourceId
            of feature.sourcePack.registrySourceIds
        ) {
            assert.equal(
                registeredSourceIds.has(
                    sourceId
                ),
                true,
                `${feature.id} references unknown governed source ${sourceId}.`
            );
        }

        if (
            feature.sourcePack.chunkCatalog
        ) {
            await access(
                path.join(
                    PROJECT_ROOT,
                    feature.sourcePack.chunkCatalog
                )
            );
        }

        assert.deepEqual(
            feature.delivery,
            {
                stableReportMutation:
                    false,
                stablePdfMutation:
                    false,
                stableEmailMutation:
                    false
            },
            `${feature.id} must not change stable delivery contracts.`
        );

        if (
            feature.classification ===
                "legal-assurance"
        ) {
            assert.equal(
                feature.legalReviewStatus,
                "needs-legal-review"
            );

            assert.notEqual(
                feature.sourcePack.status,
                "not-required"
            );
        } else {
            assert.equal(
                feature.legalReviewStatus,
                "not-applicable"
            );

            assert.equal(
                feature.sourcePack.status,
                "not-required"
            );
        }

        if (
            feature.explanation.status ===
                "live"
        ) {
            assert.equal(
                typeof feature.explanation.route,
                "string"
            );

            assert.equal(
                typeof feature.explanation.uiSurface,
                "string"
            );
        } else {
            assert.equal(
                feature.explanation.route,
                null
            );

            assert.equal(
                feature.explanation.uiSurface,
                null
            );
        }
    }

    for (
        const ruleId
        of EXPECTED_GOVERNED_RULE_IDS
    ) {
        assert.equal(
            representedRuleIds.has(
                ruleId
            ),
            true,
            `The governed rule ${ruleId} must be represented in the registry.`
        );
    }

    for (
        const ruleId
        of EXPECTED_LEGACY_RULE_IDS
    ) {
        assert.equal(
            representedRuleIds.has(
                ruleId
            ),
            true,
            `The legacy rule ${ruleId} must be represented in the registry.`
        );
    }

    const liveGoverned =
        registry.features.filter(
            (feature) =>
                feature.readiness ===
                    "live-governed"
        );

    assert.deepEqual(
        liveGoverned.map(
            (feature) =>
                feature.id
        ),
        [
            "feature.legal.posh.internal-committee-threshold"
        ],
        "Only the current provisional POSH threshold may be marked live-governed."
    );

    const liveExplanations =
        registry.features.filter(
            (feature) =>
                feature.explanation.status ===
                    "live"
        );

    assert.equal(
        liveExplanations.length,
        1
    );

    assert.equal(
        liveExplanations[0]
            .explanation
            .route,
        "/api/legal-explanation/posh"
    );

    assert.equal(
        liveExplanations[0]
            .explanation
            .uiSurface,
        "analyze-company-v3.html"
    );

    const classificationCounts =
        registry.features.reduce(
            (
                counts,
                feature
            ) => {
                counts[
                    feature.classification
                ] =
                    (
                        counts[
                            feature.classification
                        ] ||
                        0
                    ) +
                        1;

                return counts;
            },
            {}
        );

    assert.deepEqual(
        classificationCounts,
        {
            "legal-assurance":
                18,
            "operational-advisory":
                6,
            "legacy-readiness":
                6
        }
    );

    const registryKeys =
        collectObjectKeys(
            registry
        );

    for (
        const prohibitedKey
        of PROHIBITED_REGISTRY_KEYS
    ) {
        assert.equal(
            registryKeys.has(
                prohibitedKey
            ),
            false,
            `The descriptive registry must not contain runtime decision key "${prohibitedKey}".`
        );
    }

    assert.equal(
        registrySource.includes(
            "applicabilityAuthority"
        ),
        false,
        "The registry must describe coverage rather than duplicate the legal evaluator contract."
    );

    for (
        const runtimeSource
        of runtimeSources
    ) {
        assert.equal(
            runtimeSource.includes(
                "feature-coverage-registry.v1.json"
            ),
            false,
            "The registry must not be loaded by current runtime or UI decision paths."
        );
    }

    assert.equal(
        packageJson.scripts[
            "test:feature-coverage-registry"
        ],
        "node tests/feature-coverage-registry-checks.mjs"
    );

    assert.equal(
        packageJson.scripts[
            "test:m2"
        ].includes(
            "npm run test:feature-coverage-registry"
        ),
        true,
        "The registry contract must run inside the normal M2 architecture suite."
    );

    console.log(
        [
            "Feature coverage registry checks passed.",
            `Features: ${registry.features.length}`,
            `Law records available: ${lawRecordIds.size}`,
            `Governed rules represented: ${EXPECTED_GOVERNED_RULE_IDS.length}`,
            `Legacy checks represented: ${EXPECTED_LEGACY_RULE_IDS.length}`
        ].join(
            "\n"
        )
    );
}

main().catch(
    (error) => {
        console.error(
            error
        );

        process.exitCode =
            1;
    }
);
