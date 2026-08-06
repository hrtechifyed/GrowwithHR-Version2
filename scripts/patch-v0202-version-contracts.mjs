import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function patch(relativePath, search, replacement) {
  const target = path.join(ROOT, relativePath);
  const source = fs.readFileSync(target, "utf8");
  if (!source.includes(search)) throw new Error(`Expected version contract not found in ${relativePath}`);
  fs.writeFileSync(target, source.replace(search, replacement), "utf8");
}

patch(
  "tests/baseline-contract-checks.js",
  `assert.strictEqual(\n    packageJson.version,\n    "0.20.0",\n    "The current release baseline must use version 0.20.0."\n);`,
  `assert.match(\n    packageJson.version,\n    /^0\\.20\\.\\d+(?:-[0-9A-Za-z.-]+)?$/,\n    "The current public release baseline must remain on the approved v0.20 line."\n);`
);

patch(
  "tests/requirements-static-check.js",
  `assert.strictEqual(packageJson.version, "0.20.0", "Static requirements must use the current v0.20.0 release.");`,
  `assert.match(packageJson.version, /^0\\.20\\.\\d+(?:-[0-9A-Za-z.-]+)?$/, "Static requirements must use an approved v0.20 release.");`
);

patch(
  "tests/v021-evidence-persistence-contract-checks.mjs",
  `assert.equal(packageJson.version, "0.20.0", "Contract foundation must not cut the v0.21 release.");`,
  `assert.notEqual(packageJson.version, "0.21.0", "Contract foundation must not cut the approval-gated v0.21 release.");\nassert.match(packageJson.version, /^0\\.20\\.\\d+(?:-[0-9A-Za-z.-]+)?$/, "M6 must remain contract-only while the product stays on the v0.20 release line.");`
);

for (const relativePath of [
  "scripts/patch-v0202-version-contracts.mjs",
  ".github/workflows/patch-v0202-version-contracts.yml"
]) {
  fs.rmSync(path.join(ROOT, relativePath), { force: true });
}

console.log("Updated version contracts for the v0.20.2 release.");
