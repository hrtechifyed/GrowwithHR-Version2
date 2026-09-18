import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const studio = require("../js/decision-scenario-studio.js");

const current = { employees: 100, managers: 10, layers: 3, locations: 1, capabilityCoverage: 85 };
assert.deepEqual(studio.presetFromCurrent(current, studio.PRESETS.conservative), {
  employees: 115, managers: 11, layers: 3, locations: 1, capabilityCoverage: 80
});
assert.deepEqual(studio.presetFromCurrent(current, studio.PRESETS.growth), {
  employees: 140, managers: 13, layers: 4, locations: 2, capabilityCoverage: 75
});

const outcome = studio.compare({
  current,
  conservative: { employees: 115, managers: 11, layers: 3, locations: 1, capabilityCoverage: 80 },
  growth: { employees: 140, managers: 12, layers: 4, locations: 2, capabilityCoverage: 70 }
}, 1000000, "INR");

assert.equal(outcome.error, undefined);
assert.match(outcome.growth.structure, /Management capacity may tighten/);
assert.match(outcome.growth.workforce, /capability pressure/i);
assert.ok(outcome.growth.compliance.some((item) => /Operating-location change/i.test(item)));
assert.ok(outcome.growth.compliance.some((item) => /workforce-size change/i.test(item)));
assert.equal(outcome.current.peopleCost, 100000000);
assert.equal(outcome.growth.peopleCost, 140000000);
assert.equal(outcome.growth.costDelta, 40000000);

const html = fs.readFileSync(path.resolve("decision-scenario-studio.html"), "utf8");
assert.match(html, /Decision Scenario Studio/i);
assert.match(html, /data-field="employees"/);
assert.match(html, /data-field="capabilityCoverage"/);
assert.match(html, /does not forecast business outcomes/i);
assert.match(html, /not external benchmarks or forecasts/i);

const shell = fs.readFileSync(path.resolve("js/site-shell.js"), "utf8");
assert.match(shell, /Decision Scenario Studio/);
assert.match(shell, /decision-scenario-studio\.html/);

const hub = fs.readFileSync(path.resolve("intelligence-hub.html"), "utf8");
assert.match(hub, /Open Scenario Studio/);
assert.match(hub, /transparent, editable starting assumptions/i);

console.log("Decision Scenario Studio checks passed.");