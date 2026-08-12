import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("cloudflare/report-id-worker/src/worker-entry.mjs", "utf8");
const config = JSON.parse(fs.readFileSync("wrangler.jsonc", "utf8").replace(/^\s*\/\/.*$/gm, ""));

[
    'url.pathname === "/health"',
    "secretConfigured",
    "durableObjectBindingConfigured",
    'return worker.fetch(request, env, ctx)'
].forEach((marker) => assert(source.includes(marker), `missing health entry marker: ${marker}`));

assert.equal(config.name, "growwithhr-version2");
assert.equal(config.main, "cloudflare/report-id-worker/src/worker-entry.mjs");
assert.deepEqual(config.secrets?.required, ["REPORT_ID_ALLOCATOR_SECRET"]);

console.log("Cloudflare Report ID health entry checks passed.");
