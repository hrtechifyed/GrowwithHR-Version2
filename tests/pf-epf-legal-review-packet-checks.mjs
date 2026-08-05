import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (p) => JSON.parse(await readFile(path.join(ROOT, p), "utf8"));
const readText = async (p) => readFile(path.join(ROOT, p), "utf8");

const mapping = await readJson("data/legal-source-governance/pf-epf-section-mapping.v1.json");
const contract = await readJson("data/assessment/pf-epf-assessment-fact-contract.v1.json");
const decision = await readJson("data/legal-source-governance/pf-epf-legal-review-decision.v1.json");
const packet = await readText("docs/legal-source-governance/review-packets/pf-epf-legal-review-and-rag-approval-packet.md");
const pkg = await readJson("package.json");

for (const record of [mapping, contract, decision]) {
  assert.equal(record.schemaVersion, 1);
  assert.equal(record.legalReviewStatus, "needs-legal-review");
  assert.equal(record.privacyReviewStatus, "needs-privacy-review");
  assert.equal(record.ragApprovalStatus, "not-approved");
  assert.equal(record.runtimeActivation, false);
}
assert.equal(mapping.status, "draft-section-map");
assert.equal(mapping.assessmentCapture, false);
assert.equal(contract.status, "draft-fact-contract");
assert.equal(contract.assessmentCapture, false);
assert.equal(contract.runtimeMapping, false);
assert.equal(contract.ruleActivation, false);
assert.equal(decision.status, "awaiting-qualified-legal-review");
assert.equal(decision.submissionStatus, "draft-not-submitted");
assert.equal(decision.assessmentCapture, false);
assert.equal(decision.legalAdvice, false);
assert.equal(decision.repositoryCompanionOnly, true);
assert.equal(decision.finalOutcome.overallOutcome, null);
assert.equal(decision.finalOutcome.releaseApproval, null);

const expectedSources = new Map([
["social-security-code-2020",["53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967",1020695,113]],
["social-security-central-rules-2026",["37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878",3856046,259]],
["social-security-code-commencement-so-5319e-2025",["014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5",408295,2]],
["social-security-code-corrigendum-so-5936e-2025",["d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03",560515,2]],
["employees-provident-funds-scheme-2026",["4e062db5bf5d8b904ae1c0d4af10950dc01de7df8360398dfe197d6d06aef489",2510370,129]],
["employees-pension-scheme-2026",["6bd9d6fb82a1e0e6efcc6dff3901485aaf101dd621a68b8592409585e18a6592",1324116,83]],
["employees-deposit-linked-insurance-scheme-2026",["a4a61bcf182dcaab026ad49ab50044d088f91930b9967494ac559054daecc957",1022320,22]],
["social-security-wage-ceiling-so-2702e-2026",["62dbc6c22949eed3ccd0cde11488312c4db4480623078254a558770d14cb3893",946569,2]]
]);
assert.equal(mapping.sources.length, 8);
assert.equal(decision.sourceBaseline.length, 8);
for (const [id,hash,bytes,pages] of mapping.sources) {
  assert.deepEqual([hash,bytes,pages], expectedSources.get(id));
}
for (const [id,hash,bytes,pages,legal,rag] of decision.sourceBaseline) {
  assert.deepEqual([hash,bytes,pages], expectedSources.get(id));
  assert.equal(legal, null); assert.equal(rag, null);
}

const featureIds = new Set([
"feature.legal.epf.establishment-coverage","feature.legal.epf.member-inclusion",
"feature.legal.epf.wage-ceiling","feature.legal.epf.contribution-rate-source",
"feature.legal.epf.monthly-contribution-control","feature.legal.epf.contractor-control",
"feature.legal.epf.exemption-review","feature.legal.epf.international-worker-review",
"feature.legal.eps.membership-routing","feature.legal.eps.pension-control",
"feature.legal.edli.coverage-control","feature.legal.epf.records-returns"
]);
assert.equal(mapping.features.length, 12);
assert.deepEqual(new Set(mapping.features.map(x=>x.featureId)), featureIds);
assert.equal(contract.featureFactGroups.length, 12);
assert.equal(decision.featureDecisions.length, 12);
assert.equal(contract.factCount, 60);
assert.equal(contract.factIds.length, 60);
assert.equal(new Set(contract.factIds).size, 60);

const groups = new Map(contract.featureFactGroups.map(x=>[x.featureId,x.factIds]));
for (const feature of mapping.features) {
  assert.equal(feature.factGroupRef, feature.featureId);
  assert.ok(groups.get(feature.featureId).length > 0);
  assert.match(feature.proposedRuleId,/^rule\.legal\.(?:epf|eps|edli)\./);
  assert.equal(feature.approvalStatus,"not-approved");
  assert.ok(feature.proposedReasonCodes.length > 0);
  for (const [sourceId,,start,end] of feature.sourceMappings) {
    const source = expectedSources.get(sourceId);
    assert.ok(source); assert.ok(start >= 1 && end >= start && end <= source[2]);
  }
  assert.ok(packet.includes(feature.featureId));
  assert.ok(packet.includes(feature.proposedRuleId));
}
for (const group of contract.featureFactGroups) {
  assert.ok(featureIds.has(group.featureId));
  for (const id of group.factIds) assert.ok(contract.factIds.includes(id));
}
for (const value of Object.values(contract.providerPolicy)) assert.equal(value,false);
for (const x of decision.globalDecisions) {
  assert.equal(x.decision,null); assert.deepEqual(x.conditions,[]);
  assert.equal(x.reviewer,null); assert.equal(x.reviewDate,null);
}
for (const x of decision.featureDecisions) {
  assert.equal(x.decision,null); assert.deepEqual(x.approvedStatuses,[]);
  assert.deepEqual(x.approvedReasonCodes,[]); assert.deepEqual(x.approvedSourceScopes,[]);
  assert.equal(x.customerWordingApproved,false); assert.equal(x.privacyBoundaryApproved,false);
}
for (const text of [
"A blank decision is not approval.",
"No production deterministic rule or RAG chunk is created by this packet.",
"S.O. 320(E), dated 9 April 1997, was not obtained",
"10% or 12% contribution rate requires qualified legal review",
"current EDLI contribution-rate authority requires confirmation",
"Transition and savings treatment requires legal review"
]) assert.ok(packet.includes(text));
for (const [id,[hash]] of expectedSources) {
  assert.ok(packet.includes(id)); assert.ok(packet.includes(hash));
}
assert.equal(pkg.scripts["test:pf-epf-legal-review-packet"],"node tests/pf-epf-legal-review-packet-checks.mjs");
assert.match(pkg.scripts["test:m2"],/npm run test:pf-epf-legal-review-packet/);

console.log(JSON.stringify({valid:true,sourceCount:8,featureCount:12,factCount:60,
pendingGlobalDecisions:decision.globalDecisions.length,pendingFeatureDecisions:decision.featureDecisions.length,
assessmentCapture:contract.assessmentCapture,runtimeActivation:decision.runtimeActivation},null,2));
