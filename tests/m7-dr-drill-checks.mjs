import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = await mkdtemp(path.join(tmpdir(), "growwithhr-m7-drill-"));
const output = path.join(directory, "m7-dr-drill.json");

try {
    const result = await execFileAsync(
        process.execPath,
        ["scripts/run-m7-dr-drill.mjs", "--output", output],
        {
            cwd: ROOT,
            env: {
                ...process.env,
                LEGAL_EXPLANATION_ENDPOINT_ENABLED: "false"
            },
            maxBuffer: 2 * 1024 * 1024
        }
    );
    assert.equal(result.stderr, "");
    const drill = JSON.parse(await readFile(output, "utf8"));
    assert.equal(drill.passed, true);
    assert.equal(drill.simulated, true);
    assert.equal(drill.productionRollbackPerformed, false);
    assert.equal(drill.frozenContractCount, 7);
    assert(drill.frozenContracts.every((item) => item.matched === true));
    assert.equal(drill.deterministicDecision.availableWithoutRag, true);
    assert.equal(drill.deterministicDecision.status, "specialist-review");
    assert.equal(drill.ragDisableFallback.explanationEndpointDisabled, true);
    assert.equal(drill.ragDisableFallback.providerCalls, 0);
    assert.equal(drill.ragDisableFallback.deterministicDecisionPreserved, true);
    assert.equal(drill.sourceLifecycle.currentSourcePermitted, true);
    assert.equal(drill.sourceLifecycle.dateUnconfirmedSourceBlocked, true);
    assert.equal(drill.sourceLifecycle.dateInferenceUsed, false);
    assert.equal(drill.protectedContractsPreserved, true);
    assert.equal(drill.remotePersistenceRequired, false);
    assert.equal(drill.releaseExitSatisfied, false);
    assert(drill.limitations.some((item) => /not a production traffic rollback/i.test(item)));
    assert.match(result.stdout, /"passed": true/);

    console.log(JSON.stringify({
        valid: true,
        drillPassed: drill.passed,
        frozenContractCount: drill.frozenContractCount,
        deterministicDecisionAvailableWithoutRag: drill.deterministicDecision.availableWithoutRag,
        productionRollbackPerformed: drill.productionRollbackPerformed,
        releaseExitSatisfied: drill.releaseExitSatisfied
    }, null, 2));
} finally {
    await rm(directory, { recursive: true, force: true });
}
