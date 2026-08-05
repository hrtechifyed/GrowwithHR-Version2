import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const router = require(path.join(ROOT, "server-legal-explanation-router.js"));
const profiles = require(path.join(ROOT, "growwithhr-rag", "data", "legal-rag-profiles.v1.json"));
const catalog = require(path.join(ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json"));

async function listen(handler) {
    const server = http.createServer((request, response) => {
        if (handler(request, response)) return;
        response.statusCode = 404;
        response.end("Not found");
    });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
    };
}

async function close(server) {
    await new Promise((resolve, reject) =>
        server.close((error) => error ? reject(error) : resolve())
    );
}

const activeFeature = "feature.legal.posh.internal-committee-threshold";
const blockedFeature = "feature.legal.posh.policy-review";
const serviceCalls = [];
let serviceCreations = 0;
const handler = router.createSharedLegalExplanationRequestHandler({
    profileRegistry: profiles,
    catalogSnapshot: {
        metadata: [{
            catalogId: "catalog.legal.posh.v1",
            lawFamilyId: "posh",
            sourceCount: catalog.sources.length,
            chunkCount: catalog.chunks.length,
            fileSha256: "a".repeat(64)
        }],
        catalogs: {
            "catalog.legal.posh.v1": catalog
        }
    },
    retrievalMode: "hybrid",
    createService(featureId) {
        serviceCreations += 1;
        return {
            async explain(body) {
                serviceCalls.push({ featureId, body });
                return {
                    featureId,
                    legalReviewStatus: "needs-legal-review",
                    applicabilityAuthority: "deterministic-only",
                    providerRole: "explanation-only",
                    usedForDecision: false,
                    mayChangeDecision: false,
                    delivery: { cacheStatus: "miss" }
                };
            }
        };
    }
});

const hosted = await listen(handler);
try {
    const statusResponse = await fetch(`${hosted.baseUrl}${router.STATUS_ROUTE}`);
    assert.equal(statusResponse.status, 200);
    const status = await statusResponse.json();
    assert.equal(status.retrievalMode, "hybrid");
    assert.equal(status.profileCount, 18);
    assert.equal(status.activeProfiles.length, 1);
    assert.equal(status.activeProfiles[0].featureId, activeFeature);
    assert.equal(status.blockedProfileCount, 17);
    assert.equal(status.catalogs.length, 1);

    const activeRoute = `${router.SHARED_ROUTE_PREFIX}${encodeURIComponent(activeFeature)}`;
    const body = {
        answers: {
            employees: 10,
            primaryState: "Maharashtra",
            locations: 1
        }
    };
    const activeResponse = await fetch(`${hosted.baseUrl}${activeRoute}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    assert.equal(activeResponse.status, 200);
    const activePayload = await activeResponse.json();
    assert.equal(activePayload.featureId, activeFeature);
    assert.equal(serviceCreations, 1);
    assert.deepEqual(serviceCalls[0].body, body);

    const activeAgain = await fetch(`${hosted.baseUrl}${activeRoute}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    assert.equal(activeAgain.status, 200);
    assert.equal(serviceCreations, 1, "The shared router must reuse one service per feature.");

    const blockedRoute = `${router.SHARED_ROUTE_PREFIX}${encodeURIComponent(blockedFeature)}`;
    const blockedResponse = await fetch(`${hosted.baseUrl}${blockedRoute}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    assert.equal(blockedResponse.status, 409);
    const blockedPayload = await blockedResponse.json();
    assert.equal(blockedPayload.error.code, "legal-rag-profile-blocked");
    assert.equal(serviceCreations, 1, "Blocked profiles must fail before service or provider creation.");

    const unknownResponse = await fetch(
        `${hosted.baseUrl}${router.SHARED_ROUTE_PREFIX}${encodeURIComponent("feature.legal.unknown")}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }
    );
    assert.equal(unknownResponse.status, 404);

    const wrongMethod = await fetch(`${hosted.baseUrl}${activeRoute}`);
    assert.equal(wrongMethod.status, 405);

    const wrongType = await fetch(`${hosted.baseUrl}${activeRoute}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(body)
    });
    assert.equal(wrongType.status, 415);

    const other = await fetch(`${hosted.baseUrl}/api/not-rag`);
    assert.equal(other.status, 404);
} finally {
    await close(hosted.server);
}

console.log(JSON.stringify({
    valid: true,
    sharedRoutePrefix: router.SHARED_ROUTE_PREFIX,
    statusRoute: router.STATUS_ROUTE,
    activeFeatures: 1,
    blockedProviderCalls: 0,
    serviceInstances: serviceCreations
}, null, 2));
