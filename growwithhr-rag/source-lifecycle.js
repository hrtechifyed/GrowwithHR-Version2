/**
 * GrowWithHR M7 governed source lifecycle normalization.
 *
 * This module normalizes explicit source metadata only. It does not infer an
 * effective date from a title, publication date, review date or document text,
 * and it never decides legal applicability.
 */

export const SOURCE_LIFECYCLE_VERSION = "1.0.0";

export const SOURCE_LIFECYCLE_STATUSES = Object.freeze([
    "current",
    "not-yet-effective",
    "superseded",
    "effective-date-unconfirmed",
    "review-required"
]);

const APPROVED_REVIEW_STATUSES = new Set([
    "approved",
    "approved-with-conditions",
    "approved-for-publication"
]);

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();
const unique = (values) => [...new Set(array(values).map(text).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function dateOnly(value) {
    const normalized = text(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
    const parsed = new Date(`${normalized}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized
        ? null
        : normalized;
}

function sourceId(source) {
    return text(source.registrySourceId || source.id || source.sourceId);
}

function explicitLifecycleStatus(source) {
    const requested = text(source.lifecycleStatus);
    return SOURCE_LIFECYCLE_STATUSES.includes(requested) ? requested : null;
}

function reviewStatus(source) {
    return text(
        source.ragApprovalStatus ||
        source.legalReviewStatus ||
        source.reviewStatus ||
        source.approvalStatus
    );
}

function compareDate(left, right) {
    return left === right ? 0 : left < right ? -1 : 1;
}

/**
 * Normalize one source using only explicit lifecycle fields.
 * reviewedAt is retained as provenance but never substituted for effectiveFrom.
 */
export function normalizeSourceLifecycle(value, options = {}) {
    const source = object(value);
    const asOf = dateOnly(options.asOf) || new Date().toISOString().slice(0, 10);
    const effectiveFrom = dateOnly(source.effectiveFrom);
    const effectiveTo = dateOnly(source.effectiveTo);
    const reviewedAt = dateOnly(source.reviewedAt);
    const supersededBy = text(source.supersededBy || source.supersededBySourceId) || null;
    const explicitStatus = explicitLifecycleStatus(source);
    const approval = reviewStatus(source);
    const issues = [];

    if (source.effectiveFrom && !effectiveFrom) issues.push("invalid-effective-from");
    if (source.effectiveTo && !effectiveTo) issues.push("invalid-effective-to");
    if (source.reviewedAt && !reviewedAt) issues.push("invalid-reviewed-at");
    if (effectiveFrom && effectiveTo && compareDate(effectiveTo, effectiveFrom) < 0) {
        issues.push("effective-range-invalid");
    }

    let status = explicitStatus;
    if (!status) {
        if (supersededBy || (effectiveTo && compareDate(effectiveTo, asOf) < 0)) {
            status = "superseded";
        } else if (effectiveFrom && compareDate(effectiveFrom, asOf) > 0) {
            status = "not-yet-effective";
        } else if (!effectiveFrom) {
            status = "effective-date-unconfirmed";
        } else if (!APPROVED_REVIEW_STATUSES.has(approval)) {
            status = "review-required";
        } else {
            status = "current";
        }
    }

    if (issues.length) status = "review-required";

    return deepFreeze({
        sourceId: sourceId(source),
        title: text(source.title),
        effectiveFrom,
        effectiveTo,
        reviewedAt,
        supersededBy,
        reviewStatus: approval || null,
        lifecycleStatus: status,
        dateInferenceUsed: false,
        issues: Object.freeze(issues),
        original: deepFreeze(clone(source))
    });
}

export function normalizeSourceSet(values, options = {}) {
    const normalized = array(values).map((source) => normalizeSourceLifecycle(source, options));
    const seen = new Set();
    const duplicates = [];

    normalized.forEach((source) => {
        if (!source.sourceId) return;
        if (seen.has(source.sourceId)) duplicates.push(source.sourceId);
        seen.add(source.sourceId);
    });

    return deepFreeze({
        version: SOURCE_LIFECYCLE_VERSION,
        asOf: dateOnly(options.asOf) || new Date().toISOString().slice(0, 10),
        sources: normalized,
        duplicateSourceIds: Object.freeze(unique(duplicates)),
        dateInferenceUsed: false
    });
}

/**
 * Gate high-certainty presentation only. This function does not modify or
 * replace the deterministic legal decision.
 */
export function assessSourceSetForHighCertainty(values, options = {}) {
    const set = normalizeSourceSet(values, options);
    const blocking = set.sources.filter((source) => source.lifecycleStatus !== "current");
    const unresolvedIdentifiers = set.sources.filter((source) => !source.sourceId);
    const permitted = blocking.length === 0 &&
        unresolvedIdentifiers.length === 0 &&
        set.duplicateSourceIds.length === 0 &&
        set.sources.length > 0;

    return deepFreeze({
        version: SOURCE_LIFECYCLE_VERSION,
        applicabilityAuthority: "none",
        usedForDecision: false,
        highCertaintyPermitted: permitted,
        invalidateHighCertaintyOutput: !permitted,
        requiredPresentationStatus: permitted ? null : "specialist-review",
        blockingSources: Object.freeze(blocking.map((source) => ({
            sourceId: source.sourceId,
            lifecycleStatus: source.lifecycleStatus,
            issues: source.issues
        }))),
        duplicateSourceIds: set.duplicateSourceIds,
        unresolvedSourceCount: unresolvedIdentifiers.length,
        normalizedSources: set.sources,
        limitations: Object.freeze([
            "This gate does not determine legal applicability.",
            "A publication or review date is not inferred to be an effective date.",
            "Changed, superseded or date-unconfirmed sources block high-certainty presentation until reviewed."
        ])
    });
}

export function sourceCoverageSummary(values, options = {}) {
    const set = normalizeSourceSet(values, options);
    const counts = Object.fromEntries(SOURCE_LIFECYCLE_STATUSES.map((status) => [status, 0]));
    set.sources.forEach((source) => { counts[source.lifecycleStatus] += 1; });
    return deepFreeze({
        version: SOURCE_LIFECYCLE_VERSION,
        sourceCount: set.sources.length,
        counts: deepFreeze(counts),
        duplicateSourceIds: set.duplicateSourceIds,
        currentCoverageRatio: set.sources.length
            ? counts.current / set.sources.length
            : 0,
        dateInferenceUsed: false
    });
}

export default Object.freeze({
    version: SOURCE_LIFECYCLE_VERSION,
    statuses: SOURCE_LIFECYCLE_STATUSES,
    normalizeSourceLifecycle,
    normalizeSourceSet,
    assessSourceSetForHighCertainty,
    sourceCoverageSummary
});
