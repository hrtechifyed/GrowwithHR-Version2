import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const HARDENING = require(path.join(ROOT, "data", "architecture", "m7-rag-ready-hardening.v1.json"));
const LEGAL_RULES = require(path.join(ROOT, "data", "assessment", "legal-applicability-rules.v1.json"));
const {
    createLegalExplanationService
} = require(path.join(ROOT, "server-legal-explanation.js"));
const {
    createM7ReadinessSnapshot,
    createM7OperationalMonitor
} = require(path.join(ROOT, "server-m7-operational-readiness.js"));

function gitBlobSha(content) {
    const bytes = Buffer.from(content, "utf8");
    return crypto
        .createHash("sha1")
        .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`, "utf8"), bytes]))
        .digest("hex");
}

function argumentValue(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : null;
}

async function verifyFrozenContracts() {
    const results = [];
    for (const contract of HARDENING.frozenContracts) {
        const target = path.resolve(ROOT, contract.path);
        assert(target.startsWith(`${ROOT}${path.sep}`), `Unsafe frozen contract path: ${contract.path}`);
        const content = await readFile(target, "utf8");
        const actual = gitBlobSha(content);
        assert.equal(actual, contract.baselineGitBlobSha, `Frozen contract drift: ${contract.contractId}`);
        results.push({
            contractId: contract.contractId,
            category: contract.category,
            path: contract.path,
            gitBlobSha: actual,
            matched: true
        });
    }
    return results;
}

async function evaluateDeterministicDecision() {
    const assuranceModule = await import(pathToFileURL(
        path.join(ROOT, "js", "assessment-v3", "legal-rule-assurance.js")
    ).href);
    const evaluatedAt = "2026-08-06T00:00:00.000Z";
    const assurance = assuranceModule.evaluateLegalRuleAssurance({
        answers: {
            employees: 10,
            primaryState: "Maharashtra",
            locations: 1
        },
        catalog: LEGAL_RULES,
        evaluatedAt
    });
    const decision = assurance.decisions.find((item) =>
        item.ruleId === "rule.legal.posh.internal-committee-threshold"
    );
    assert(decision, "The deterministic POSH decision was not produced.");
    assert.equal(decision.reasonCode, "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED");
    assert.equal(decision.status, "specialist-review");
    return JSON.parse(JSON.stringify(decision));
}

async function verifyRagDisableFallback(decision) {
    let providerCalls = 0;
    const service = createLegalExplanationService({
        config: {
            enabled: false,
            cacheTtlMs: 6 * 60 * 60 * 1000,
            failureBackoffMs: 60 * 1000,
            maxConcurrency: 1,
            maxQueue: 1
        },
        providerRunner: async () => {
            providerCalls += 1;
            throw new Error("Provider must not run during the M7 DR drill.");
        }
    });

    await assert.rejects(
        service.explain({
            answers: {
                employees: 10,
                primaryState: "Maharashtra",
                locations: 1
            }
        }),
        (error) => error.code === "legal-explanation-endpoint-disabled"
    );
    assert.equal(providerCalls, 0);
    assert.equal(decision.reasonCode, "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED");
    return {
        explanationEndpointDisabled: true,
        providerCalls,
        deterministicDecisionPreserved: true
    };
}

async function verifySourceLifecycle() {
    const lifecycle = await import(pathToFileURL(
        path.join(ROOT, "growwithhr-rag", "source-lifecycle.js")
    ).href);

    const current = lifecycle.assessSourceSetForHighCertainty([
        {
            registrySourceId: "test-current-source",
            title: "Current approved source",
            effectiveFrom: "2026-01-01",
            reviewedAt: "2026-08-01",
            reviewStatus: "approved"
        }
    ], { asOf: "2026-08-06" });
    assert.equal(current.highCertaintyPermitted, true);

    const unconfirmed = lifecycle.assessSourceSetForHighCertainty([
        {
            registrySourceId: "test-unconfirmed-source",
            title: "Date-unconfirmed source",
            reviewedAt: "2026-08-01",
            reviewStatus: "approved"
        }
    ], { asOf: "2026-08-06" });
    assert.equal(unconfirmed.highCertaintyPermitted, false);
    assert.equal(unconfirmed.requiredPresentationStatus, "specialist-review");

    return {
        currentSourcePermitted: true,
        dateUnconfirmedSourceBlocked: true,
        dateInferenceUsed: false
    };
}

async function main() {
    const startedAt = Date.now();
    const frozenContracts = await verifyFrozenContracts();
    const decision = await evaluateDeterministicDecision();
    const fallback = await verifyRagDisableFallback(decision);
    const sourceLifecycle = await verifySourceLifecycle();
    const monitor = createM7OperationalMonitor({ maximumSamples: 20 });
    monitor.record({ operation: "legal-rag-status", durationMs: 5, outcome: "success", code: "drill" });
    monitor.record({ operation: "legal-explanation", durationMs: 8, outcome: "failure", code: "disabled-by-drill" });
    const readiness = createM7ReadinessSnapshot({ monitor });

    assert.equal(readiness.releaseReady, false, "The drill must not fabricate the two-release exit evidence.");
    assert.equal(readiness.authorityBoundary.applicabilityAuthority, "deterministic-only");
    assert.equal(readiness.disasterRecovery.deterministicDecisionsIndependentOfRag, true);
    assert.equal(HARDENING.activationBoundary.remotePersistenceActivated, false);
    assert.equal(HARDENING.activationBoundary.newLegalProfilesActivated, false);

    const result = {
        drillVersion: "1.0.0",
        milestone: "M7",
        passed: true,
        simulated: true,
        productionRollbackPerformed: false,
        completedAt: new Date().toISOString(),
        durationMilliseconds: Date.now() - startedAt,
        frozenContractCount: frozenContracts.length,
        frozenContracts,
        deterministicDecision: {
            ruleId: decision.ruleId,
            status: decision.status,
            reasonCode: decision.reasonCode,
            availableWithoutRag: true
        },
        ragDisableFallback: fallback,
        sourceLifecycle,
        protectedContractsPreserved: true,
        remotePersistenceRequired: false,
        releaseExitSatisfied: false,
        limitations: [
            "This is an executable repository-level DR simulation, not a production traffic rollback.",
            "Production rollback evidence must be archived separately before the M7 release exit can be satisfied.",
            "The two-consecutive-release reliability gate remains pending."
        ]
    };

    const output = argumentValue("--output");
    if (output) {
        const resolved = path.resolve(process.cwd(), output);
        await writeFile(resolved, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    }
    console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
