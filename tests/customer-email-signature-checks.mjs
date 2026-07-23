import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const serverSource = fs.readFileSync("server.js", "utf8");

new vm.Script(serverSource, { filename: "server.js" });

assert(serverSource.includes('const FOUNDER_NAME = "Anurag Sinha";'));
assert(serverSource.includes('"https://www.linkedin.com/in/anuragsinha1009/"'));
assert(!serverSource.includes('"ANURAG SINHA"'));
assert(!serverSource.includes("Warm regards,"));

assert.match(
    serverSource,
    /"Warm Wishes,",\s*FOUNDER_NAME,\s*"Founder, HRTechify",\s*FOUNDER_LINKEDIN_URL\s*\]\s*\.join\("\\n"\)/,
    "The plain-text customer email must end with the approved four-line signature."
);

assert(serverSource.includes('data-email-signature="founder"'));
assert(serverSource.includes("font-family:${SIGNATURE_FONT_STACK};"));
assert(serverSource.includes("font-size:${SIGNATURE_FONT_SIZE};"));
assert(serverSource.includes("font-weight:800;"));
assert(serverSource.includes('href="${FOUNDER_LINKEDIN_URL}"'));
assert(serverSource.includes(">${FOUNDER_LINKEDIN_URL}</a>"));
assert(serverSource.includes("font:inherit;"));

console.log("Customer email signature checks passed.");
