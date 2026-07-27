import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const files = [
  "tests/baseline-contract-checks.js",
  "tests/requirements-static-check.js"
];

for (const relativePath of files) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) continue;
  const source = fs.readFileSync(absolutePath, "utf8");
  const updated = source
    .replace(/The current release baseline must use version [^\"]+\./g, `The current release baseline must use version ${version}.`)
    .replace(/"0\.18\.0"/g, `"${version}"`)
    .replace(/GrowWithHR Public 0\.18\.0/g, `GrowWithHR Public ${version}`);
  if (updated !== source) fs.writeFileSync(absolutePath, updated, "utf8");
}
