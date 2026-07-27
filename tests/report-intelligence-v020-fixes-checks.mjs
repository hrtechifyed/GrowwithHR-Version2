import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const fixes = fs.readFileSync("js/report-intelligence-v020-fixes.js", "utf8");
const questionUi = fs.readFileSync("js/report-context-question-ui-fixes.js", "utf8");
const bootstrap = fs.readFileSync("js/report-runtime-bootstrap.js", "utf8");

new vm.Script(fixes, { filename: "js/report-intelligence-v020-fixes.js" });
new vm.Script(questionUi, { filename: "js/report-context-question-ui-fixes.js" });
new vm.Script(bootstrap, { filename: "js/report-runtime-bootstrap.js" });

assert.match(fixes, /0\.20\.1-report-intelligence-fixes/);
assert.match(questionUi, /0\.20\.1-context-question-ui/);
assert.match(bootstrap, /report-intelligence-v020-fixes\.js/);
assert.match(bootstrap, /report-context-question-ui-fixes\.js/);
assert.match(bootstrap, /acceptanceReady/);
assert.match(bootstrap, /intelligenceReady/);

// One selected edition must generate one report; both remains an explicit option.
assert.match(fixes, /requested === "both"/);
assert.match(fixes, /\[\/dark\/\.test\(requested\) \? "dark" : "light"\]/);
assert.match(fixes, /selectedThemes: themes/);
assert.match(fixes, /dualThemeDelivery: themes\.length === 2/);

// Branding must be restored on cover, closing page and every footer.
assert.match(fixes, /assets\/hrtechify-logo\.png/);
assert.ok((fixes.match(/doc\.addImage\(logo/g) || []).length >= 2);
assert.match(fixes, /HRTechify · GrowWithHR/);
assert.match(fixes, /Page \$\{page\} of \$\{total\}/);

// Internal implementation language and empty status panels must not be emitted.
assert.doesNotMatch(fixes, /Snapshot: \$\{trace\.id\}/);
assert.doesNotMatch(fixes, /Dormant laws are compressed into one page/);
assert.doesNotMatch(fixes, /The roadmap sequences the same action IDs/);
assert.doesNotMatch(fixes, /Included: None/);
assert.match(fixes, /filter\(\(\[, group\]\) => group\.length > 0\)/);

// Questions and law rows must be contextual rather than universal.
assert.match(fixes, /contextFor/);
assert.match(fixes, /ownerOnly/);
assert.match(fixes, /manufacturingContext/);
assert.match(fixes, /contractContext/);
assert.match(fixes, /row\.id === "factories"/);
assert.match(fixes, /row\.id === "standing-orders"/);
assert.match(fixes, /row\.id === "contract-labour"/);
assert.match(fixes, /context\.employees >= 10/);
assert.match(fixes, /context\.employees >= 20/);
assert.match(fixes, /workforcePresence/);
assert.match(fixes, /manufacturingOperations/);
assert.match(fixes, /productionQuestionsVisible/);

// OPC transitions must not leave synthetic owner-only answers selected.
assert.match(questionUi, /value="not-sure"/);
assert.match(questionUi, /closest\("label"\)\?\.remove/);
assert.match(questionUi, /clearOwnerOnlyDefaults/);
assert.match(questionUi, /workerCategories/);
assert.match(questionUi, /manufacturingOperations/);
assert.match(questionUi, /event\.target\.value === "other-people"/);

// Raw A-number coverage statements are intentionally removed from the new report.
assert.doesNotMatch(fixes, /You answered \$\{confirmed\} of \$\{required\}/);
assert.match(fixes, /Only questions relevant to the organisation profile/);

console.log("v0.20 report intelligence fixes checks passed.");
