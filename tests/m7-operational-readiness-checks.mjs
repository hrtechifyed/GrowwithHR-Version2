import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const readiness = require(path.join(ROOT, "server-m7-operational-readiness.js"));

const monitor = readiness.createM7OperationalMonitor({ maximumSamples: 10 });
monitor.record({ operation: "legal-rag-status", durationMs: 10, outcome: "success", code: "ok" });
monitor.record({ operation: "legal-rag-status", durationMs: 20, outcome: "success", code: "ok" });
monitor.record({ operation: "legal-explanation", durationMs: 40, outcome: "failure", code: "provider-disabled" });

const monitored = monitor.snapshot();
assert.equal(monitored.sensitivePayloadLogging, false);
assert.equal(monitored.operations["legal-rag-status"].requests, 2);
assert.equal(monitored.operations["legal-rag-status"].successRate, 1);
assert.equal(monitored.operations["legal-rag-status"].p95Milliseconds, 20);
assert.equal(monitored.operations["legal-explanation"].failures, 1);
assert.throws(
    () => monitor.record({ operation: "unknown", durationMs: 1, outcome: "success" }),
    /Unsupported M7 monitored operation/
);
assert.throws(
    () => monitor.record({ operation: "m7-readiness", durationMs: -1, outcome: "success" }),
    /finite non-negative/
);

const profileRegistry = {
    profiles: [
        { activationStatus: "active-private-beta" },
        { activationStatus: "blocked-no-catalog" }
    ]
};
const catalogSnapshot = {
    metadata: [
        { sourceCount: 3, chunkCount: 6 }
    ],
    activeCatalogIds: ["catalog.legal.posh.v1"]
};
const snapshot = readiness.createM7ReadinessSnapshot({ monitor, profileRegistry, catalogSnapshot });
assert.equal(snapshot.milestone, "M7");
assert.equal(snapshot.targetRelease, "0.22.0");
assert.equal(snapshot.implementationStatus, "implemented-awaiting-release-evidence");
assert.equal(snapshot.releaseReady, false);
assert.equal(snapshot.releaseExitStatus, "pending-production-evidence");
assert.equal(snapshot.authorityBoundary.applicabilityAuthority, "deterministic-only");
assert.equal(snapshot.sourceGovernance.dateInferenceAllowed, false);
assert.equal(snapshot.sourceGovernance.catalogueCoverage.sources, 3);
assert.equal(snapshot.sourceGovernance.catalogueCoverage.chunks, 6);
assert.equal(snapshot.ragPlatform.active, 1);
assert.equal(snapshot.ragPlatform.blocked, 1);
assert.equal(snapshot.security.credentialsExposed, false);
assert.equal(snapshot.security.sensitivePayloadLogging, false);
assert.equal(snapshot.disasterRecovery.deterministicDecisionsIndependentOfRag, true);
assert.equal(snapshot.activationBoundary.newLegalProfilesActivated, false);
assert.equal(snapshot.activationBoundary.remotePersistenceActivated, false);

const handler = readiness.createM7ReadinessRequestHandler({ monitor, profileRegistry, catalogSnapshot });
const server = http.createServer((request, response) => {
    if (handler(request, response)) return;
    response.statusCode = 404;
    response.end("Not found");
});
await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
});

try {
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const result = await fetch(`${baseUrl}${readiness.M7_READINESS_ROUTE}`);
    assert.equal(result.status, 200);
    assert.equal(result.headers.get("cache-control"), "no-store");
    assert.equal(result.headers.get("x-content-type-options"), "nosniff");
    const body = await result.json();
    assert.equal(body.releaseReady, false);
    assert.equal(body.authorityBoundary.providerRole, "explanation-only");
    const serialized = JSON.stringify(body).toLowerCase();
    for (const forbidden of ["api_token", "authorization", "assessmentanswers", "rawanswers", "evidencecontent"]) {
        assert.equal(serialized.includes(forbidden), false, `Readiness output exposed ${forbidden}.`);
    }

    const wrongMethod = await fetch(`${baseUrl}${readiness.M7_READINESS_ROUTE}`, { method: "POST" });
    assert.equal(wrongMethod.status, 405);

    const other = await fetch(`${baseUrl}/api/not-m7`);
    assert.equal(other.status, 404);
} finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

assert(monitor.snapshot().operations["m7-readiness"].requests >= 2);

console.log(JSON.stringify({
    valid: true,
    readinessRoute: readiness.M7_READINESS_ROUTE,
    releaseReady: false,
    monitoredOperations: Object.keys(monitored.operations).length,
    sensitivePayloadLogging: false
}, null, 2));
