import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const registry = require("../server-report-id-registry.js");

const workerSource = fs.readFileSync("cloudflare/report-id-worker/src/index.js", "utf8");
const wranglerConfig = fs.readFileSync("cloudflare/report-id-worker/wrangler.jsonc", "utf8");

assert.equal(registry.CLOUDFLARE_STORAGE_BACKEND, "cloudflare-durable-object");
assert.equal(registry.SEQUENCE_POLICY, "global-non-resetting-symmetric-alpha-numeric");

assert.deepEqual(
    registry.nextSequence({ width: 2, letters: "ZZ", number: 99 }),
    { width: 3, letters: "AAA", number: 1 },
    "ZZ99 must expand to AAA001"
);
assert.equal(
    registry.sequenceSuffix(registry.nextSequence({ width: 2, letters: "ZZ", number: 99 })),
    "AAA001"
);
assert.deepEqual(
    registry.nextSequence({ width: 3, letters: "ZZZ", number: 999 }),
    { width: 4, letters: "AAAA", number: 1 },
    "ZZZ999 must expand to AAAA0001"
);
assert.equal(
    registry.sequenceSuffix(registry.nextSequence({ width: 3, letters: "ZZZ", number: 999 })),
    "AAAA0001"
);

assert.equal(registry.cloudflareAllocatorConfigFromEnvironment({}), null);
assert.throws(
    () => registry.cloudflareAllocatorConfigFromEnvironment({ REPORT_ID_ALLOCATOR_URL: "https://example.workers.dev" }),
    /partially configured/
);
assert.throws(
    () => registry.cloudflareAllocatorConfigFromEnvironment({ REPORT_ID_ALLOCATOR_SECRET: "secret" }),
    /partially configured/
);
assert.throws(
    () => registry.cloudflareAllocatorConfigFromEnvironment({
        REPORT_ID_ALLOCATOR_URL: "http://example.workers.dev",
        REPORT_ID_ALLOCATOR_SECRET: "secret"
    }),
    /must use HTTPS/
);

const protectedPayload = registry.cloudflareAllocationPayload({
    requestKey: "request-123",
    email: "founder@example.com",
    companyName: "Example Private Limited",
    assessmentId: "assessment-123"
});
assert.deepEqual(Object.keys(protectedPayload).sort(), ["assessmentHash", "companyHash", "requestKeyHash", "userHash"]);
Object.values(protectedPayload).forEach((value) => assert.match(value, /^[a-f0-9]{64}$/));
assert(!JSON.stringify(protectedPayload).includes("founder@example.com"));
assert(!JSON.stringify(protectedPayload).includes("Example Private Limited"));
assert(!JSON.stringify(protectedPayload).includes("assessment-123"));

const originalFetch = globalThis.fetch;
const originalEnvironment = {
    REPORT_ID_ALLOCATOR_URL: process.env.REPORT_ID_ALLOCATOR_URL,
    REPORT_ID_ALLOCATOR_SECRET: process.env.REPORT_ID_ALLOCATOR_SECRET,
    REPORT_ID_REGISTRY_FILE: process.env.REPORT_ID_REGISTRY_FILE
};

try {
    process.env.REPORT_ID_ALLOCATOR_URL = "https://growwithhr-report-id.example.workers.dev";
    process.env.REPORT_ID_ALLOCATOR_SECRET = "test-secret";
    delete process.env.REPORT_ID_REGISTRY_FILE;

    let captured = null;
    globalThis.fetch = async (url, options) => {
        captured = { url, options };
        return new Response(JSON.stringify({
            ok: true,
            reportId: "GWHR-2026-0812-AA01",
            suffix: "AA01",
            generatedAt: "2026-08-12T07:00:00.000Z",
            replayed: false,
            storageBackend: "cloudflare-durable-object",
            durableStorageConfigured: true,
            sequencePolicy: "global-non-resetting-symmetric-alpha-numeric"
        }), { status: 201, headers: { "Content-Type": "application/json" } });
    };

    const allocated = await registry.allocateReportId({
        requestKey: "browser-request-1",
        email: "founder@example.com",
        companyName: "Example Private Limited",
        assessmentId: "assessment-1"
    });

    assert.equal(allocated.reportId, "GWHR-2026-0812-AA01");
    assert.equal(allocated.storageBackend, "cloudflare-durable-object");
    assert.equal(allocated.durableStorageConfigured, true);
    assert.equal(captured.url, "https://growwithhr-report-id.example.workers.dev/allocate");
    assert.equal(captured.options.headers.Authorization, "Bearer test-secret");
    const outbound = JSON.parse(captured.options.body);
    assert.deepEqual(Object.keys(outbound).sort(), ["assessmentHash", "companyHash", "requestKeyHash", "userHash"]);
    assert(!captured.options.body.includes("founder@example.com"));
    assert(!captured.options.body.includes("Example Private Limited"));

    globalThis.fetch = async () => {
        throw new TypeError("network unavailable");
    };
    await assert.rejects(
        () => registry.allocateReportId({ requestKey: "browser-request-2" }),
        /network unavailable/,
        "configured Cloudflare allocation must fail closed rather than falling back to the local filesystem"
    );

    globalThis.fetch = async () => new Response(JSON.stringify({
        ok: true,
        storageBackend: "filesystem-ephemeral",
        durableStorageConfigured: false
    }), { status: 200, headers: { "Content-Type": "application/json" } });
    await assert.rejects(
        () => registry.fetchCloudflareAllocator("/status", { method: "GET" }),
        /did not confirm durable storage/
    );
} finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnvironment)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
}

[
    'import { DurableObject } from "cloudflare:workers"',
    "extends DurableObject",
    "transactionSync",
    "report_id TEXT PRIMARY KEY",
    "request_key_hash TEXT NOT NULL UNIQUE",
    'getByName(REGISTRY_OBJECT_NAME)',
    'storageBackend: STORAGE_BACKEND',
    'durableStorageConfigured: true',
    'new Set(["requestKeyHash", "userHash", "companyHash", "assessmentHash"])'
].forEach((marker) => assert(workerSource.includes(marker), `missing Durable Object worker marker: ${marker}`));

const parsedWrangler = JSON.parse(wranglerConfig.replace(/^\s*\/\/.*$/gm, ""));
assert.equal(parsedWrangler.name, "growwithhr-report-id");
assert.equal(parsedWrangler.durable_objects.bindings[0].name, "REPORT_ID_REGISTRY");
assert.equal(parsedWrangler.durable_objects.bindings[0].class_name, "ReportIdRegistry");
assert.equal(parsedWrangler.exports.ReportIdRegistry.type, "durable-object");
assert.equal(parsedWrangler.exports.ReportIdRegistry.storage, "sqlite");

console.log("Cloudflare Durable Object Report ID integration checks passed.");
