import assert from "node:assert/strict";
import {
    SOURCE_LIFECYCLE_VERSION,
    SOURCE_LIFECYCLE_STATUSES,
    normalizeSourceLifecycle,
    normalizeSourceSet,
    assessSourceSetForHighCertainty,
    sourceCoverageSummary
} from "../growwithhr-rag/source-lifecycle.js";

assert.equal(SOURCE_LIFECYCLE_VERSION, "1.0.0");
assert.deepEqual(SOURCE_LIFECYCLE_STATUSES, [
    "current",
    "not-yet-effective",
    "superseded",
    "effective-date-unconfirmed",
    "review-required"
]);

const current = normalizeSourceLifecycle({
    registrySourceId: "source-current",
    title: "Current source",
    effectiveFrom: "2026-01-01",
    reviewedAt: "2026-08-01",
    reviewStatus: "approved"
}, { asOf: "2026-08-06" });
assert.equal(current.lifecycleStatus, "current");
assert.equal(current.dateInferenceUsed, false);

const future = normalizeSourceLifecycle({
    registrySourceId: "source-future",
    title: "Future source",
    effectiveFrom: "2026-09-01",
    reviewedAt: "2026-08-01",
    reviewStatus: "approved"
}, { asOf: "2026-08-06" });
assert.equal(future.lifecycleStatus, "not-yet-effective");

const superseded = normalizeSourceLifecycle({
    registrySourceId: "source-old",
    title: "Old source",
    effectiveFrom: "2025-01-01",
    effectiveTo: "2026-07-31",
    reviewedAt: "2026-07-01",
    reviewStatus: "approved",
    supersededBy: "source-new"
}, { asOf: "2026-08-06" });
assert.equal(superseded.lifecycleStatus, "superseded");
assert.equal(superseded.supersededBy, "source-new");

const unconfirmed = normalizeSourceLifecycle({
    registrySourceId: "source-unconfirmed",
    title: "Reviewed source without explicit effective date",
    reviewedAt: "2026-08-01",
    reviewStatus: "approved"
}, { asOf: "2026-08-06" });
assert.equal(unconfirmed.lifecycleStatus, "effective-date-unconfirmed");
assert.equal(unconfirmed.effectiveFrom, null);
assert.equal(unconfirmed.dateInferenceUsed, false);

const pendingReview = normalizeSourceLifecycle({
    registrySourceId: "source-review",
    title: "Source awaiting legal review",
    effectiveFrom: "2026-01-01",
    reviewedAt: "2026-08-01",
    reviewStatus: "needs-legal-review"
}, { asOf: "2026-08-06" });
assert.equal(pendingReview.lifecycleStatus, "review-required");

const invalid = normalizeSourceLifecycle({
    registrySourceId: "source-invalid",
    title: "Invalid date source",
    effectiveFrom: "2026-02-31",
    reviewStatus: "approved"
}, { asOf: "2026-08-06" });
assert.equal(invalid.lifecycleStatus, "review-required");
assert(invalid.issues.includes("invalid-effective-from"));

const set = normalizeSourceSet([
    { registrySourceId: "duplicate", effectiveFrom: "2026-01-01", reviewStatus: "approved" },
    { registrySourceId: "duplicate", effectiveFrom: "2026-01-01", reviewStatus: "approved" }
], { asOf: "2026-08-06" });
assert.deepEqual(set.duplicateSourceIds, ["duplicate"]);

const permitted = assessSourceSetForHighCertainty([
    { registrySourceId: "a", effectiveFrom: "2026-01-01", reviewStatus: "approved" },
    { registrySourceId: "b", effectiveFrom: "2026-02-01", reviewStatus: "approved-with-conditions" }
], { asOf: "2026-08-06" });
assert.equal(permitted.highCertaintyPermitted, true);
assert.equal(permitted.invalidateHighCertaintyOutput, false);
assert.equal(permitted.usedForDecision, false);
assert.equal(permitted.applicabilityAuthority, "none");

const blocked = assessSourceSetForHighCertainty([
    { registrySourceId: "a", effectiveFrom: "2026-01-01", reviewStatus: "approved" },
    { registrySourceId: "b", reviewedAt: "2026-08-01", reviewStatus: "approved" }
], { asOf: "2026-08-06" });
assert.equal(blocked.highCertaintyPermitted, false);
assert.equal(blocked.invalidateHighCertaintyOutput, true);
assert.equal(blocked.requiredPresentationStatus, "specialist-review");
assert.equal(blocked.blockingSources[0].lifecycleStatus, "effective-date-unconfirmed");

const coverage = sourceCoverageSummary([
    { registrySourceId: "a", effectiveFrom: "2026-01-01", reviewStatus: "approved" },
    { registrySourceId: "b", reviewedAt: "2026-08-01", reviewStatus: "approved" }
], { asOf: "2026-08-06" });
assert.equal(coverage.sourceCount, 2);
assert.equal(coverage.counts.current, 1);
assert.equal(coverage.counts["effective-date-unconfirmed"], 1);
assert.equal(coverage.currentCoverageRatio, 0.5);
assert.equal(coverage.dateInferenceUsed, false);

console.log(JSON.stringify({
    valid: true,
    version: SOURCE_LIFECYCLE_VERSION,
    statuses: SOURCE_LIFECYCLE_STATUSES.length,
    highCertaintyBlockedWhenDateUnconfirmed: true,
    dateInferenceUsed: false
}, null, 2));
