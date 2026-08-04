import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(TEST_PATH), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

const [verification, sectionMap, catalog, registry] = await Promise.all([
  readJson("data/legal-source-governance/posh-rules-page-verification.v1.json"),
  readJson("data/legal-source-governance/posh-section-mapping.v1.json"),
  readJson("growwithhr-rag/data/posh-source-chunks.v1.json"),
  readJson("data/assessment/feature-coverage-registry.v1.json")
]);

assert.equal(verification.schemaVersion, 1);
assert.equal(verification.status, "official-pdf-pages-verified-drive-hash-pending");
assert.equal(verification.legalReviewStatus, "needs-legal-review");
assert.equal(verification.ragApprovalStatus, "not-approved");
assert.equal(verification.runtimeActivation, false);
assert.equal(verification.approvalBoundary.pageObservationComplete, true);
assert.equal(verification.approvalBoundary.exactDriveFileHashVerifiedInThisRecord, false);
assert.equal(verification.approvalBoundary.legalInterpretationApproved, false);
assert.equal(verification.approvalBoundary.approvedForRag, false);

const rulesSource = catalog.sources.find(
  (source) => source.registrySourceId === "posh-rules-2013"
);
assert.ok(rulesSource, "Missing governed POSH Rules source");
assert.equal(verification.source.registrySourceId, rulesSource.registrySourceId);
assert.equal(verification.source.expectedSha256, rulesSource.sha256);
assert.equal(verification.source.expectedByteLength, rulesSource.byteLength);
assert.equal(verification.source.expectedPageCount, rulesSource.pageCount);
assert.equal(verification.source.drivePath, rulesSource.drivePath);
assert.match(verification.source.officialDirectPdfUrl, /^https:\/\/www\.indiacode\.nic\.in\/ViewFileUploaded\?/);
assert.equal(rulesSource.pageCount, 6);

const expectedMappings = new Map([
  [
    "feature.legal.posh.internal-committee-composition-unit-review::Rule 3",
    { pdfPageStart: 4, pdfPageEnd: 4 }
  ],
  [
    "feature.legal.posh.complaint-mechanism-records-review::Rules 6-12",
    { pdfPageStart: 4, pdfPageEnd: 6 }
  ],
  [
    "feature.legal.posh.annual-reporting-review::Rule 14",
    { pdfPageStart: 6, pdfPageEnd: 6 }
  ]
]);

assert.equal(verification.pageMappings.length, expectedMappings.size);

const sectionMappingByKey = new Map(
  sectionMap.features.flatMap((feature) =>
    feature.sourceMappings.map((mapping) => [
      `${feature.featureId}::${mapping.reference}`,
      mapping
    ])
  )
);

const registryById = new Map(registry.features.map((feature) => [feature.id, feature]));

for (const pageMapping of verification.pageMappings) {
  const key = `${pageMapping.featureId}::${pageMapping.reference}`;
  const expected = expectedMappings.get(key);
  assert.ok(expected, `Unexpected page verification mapping: ${key}`);
  assert.equal(pageMapping.pdfPageStart, expected.pdfPageStart);
  assert.equal(pageMapping.pdfPageEnd, expected.pdfPageEnd);
  assert.equal(pageMapping.verificationStatus, "official-pdf-page-verified-drive-hash-pending");
  assert.ok(pageMapping.pdfPageStart >= 1);
  assert.ok(pageMapping.pdfPageEnd >= pageMapping.pdfPageStart);
  assert.ok(pageMapping.pdfPageEnd <= rulesSource.pageCount);
  assert.ok(pageMapping.observedTextStart);

  const draftMapping = sectionMappingByKey.get(key);
  assert.ok(draftMapping, `Missing draft section-map entry for ${key}`);
  assert.equal(draftMapping.registrySourceId, "posh-rules-2013");
  assert.equal(draftMapping.pdfPageStart, null);
  assert.equal(draftMapping.pdfPageEnd, null);
  assert.equal(draftMapping.pageVerificationStatus, "pending-exact-file-verification");

  const registryFeature = registryById.get(pageMapping.featureId);
  assert.ok(registryFeature, `Missing registry feature ${pageMapping.featureId}`);
  assert.equal(registryFeature.classification, "legal-assurance");
  assert.notEqual(registryFeature.readiness, "live-governed");
  assert.deepEqual(registryFeature.currentRuleRefs, []);
  assert.equal(registryFeature.explanation.route, null);
  assert.equal(registryFeature.explanation.uiSurface, null);
}

assert.ok(
  verification.approvalBoundary.prohibitedActions.some((item) => item.includes("Do not create governed chunks"))
);
assert.ok(
  verification.approvalBoundary.prohibitedActions.some((item) => item.includes("Do not activate"))
);

console.log(JSON.stringify({
  valid: true,
  registrySourceId: verification.source.registrySourceId,
  registeredPageCount: rulesSource.pageCount,
  observedPageMappingCount: verification.pageMappings.length,
  exactDriveFileHashVerifiedInThisRecord: verification.approvalBoundary.exactDriveFileHashVerifiedInThisRecord,
  runtimeActivation: verification.runtimeActivation,
  ragApprovalStatus: verification.ragApprovalStatus
}, null, 2));
