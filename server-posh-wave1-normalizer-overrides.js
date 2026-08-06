"use strict";

/**
 * Narrow normalization overrides for POSH Wave 1 edge cases.
 * Missing per-location input remains unknown and must not be converted into a
 * reported control gap.
 */

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function uniqueTexts(value, maximumItems = 100, maximumLength = 120) {
    return [...new Set(array(value).slice(0, maximumItems)
        .map((item) => typeof item === "string"
            ? text(item).slice(0, maximumLength)
            : text(object(item).reference || object(item).ref || object(item).id).slice(0, maximumLength))
        .filter(Boolean))];
}

function normalizeStatus(value) {
    if (typeof value === "boolean") return value ? "implemented" : "missing";
    const normalized = text(value).toLowerCase();
    if (["implemented", "present", "complete", "documented", "yes"].includes(normalized)) return "implemented";
    if (["missing", "not-implemented", "not implemented", "absent", "no"].includes(normalized)) return "missing";
    if (["partial", "partially-implemented", "partially implemented"].includes(normalized)) return "partial";
    return normalized ? "unknown" : "";
}

function locationRecords(value) {
    return array(value).slice(0, 100).map((item) => {
        const source = object(item);
        const locationRef = text(source.locationRef || source.location || source.ref || source.id).slice(0, 120);
        const status = normalizeStatus(source.status ?? source.value ?? source.present);
        return locationRef && status ? { locationRef, status } : null;
    }).filter(Boolean);
}

function normalizePoshNoticeBody(value) {
    const answers = object(object(value).answers);
    const locations = uniqueTexts(answers.poshNoticeLocationsReviewed);
    const rawGroups = [
        answers.poshPenalConsequencesDisplayByLocation,
        answers.poshIcOrderDisplayByLocation,
        answers.poshMemberContactDisplayByLocation
    ];
    const supplied = locations.length > 0 && rawGroups.every((group) => Array.isArray(group) && group.length > 0);

    if (!supplied) {
        return deepFreeze({
            answers: {
                poshNoticeLocationCount: locations.length || null,
                poshNoticeCoverageComplete: null,
                poshNoticePenalConsequencesComplete: null,
                poshNoticeIcOrderComplete: null,
                poshNoticeMemberContactDisplayComplete: null
            }
        });
    }

    const expected = new Set(locations);
    const groups = rawGroups.map(locationRecords);
    const mappings = groups.map((group) => new Map(group.map((item) => [item.locationRef, item.status])));
    const coverageComplete = mappings.every((mapping) =>
        [...expected].every((locationRef) => mapping.has(locationRef))
    );
    const allImplemented = (index) => coverageComplete && [...expected].every((locationRef) =>
        mappings[index].get(locationRef) === "implemented"
    );

    return deepFreeze({
        answers: {
            poshNoticeLocationCount: locations.length,
            poshNoticeCoverageComplete: coverageComplete,
            poshNoticePenalConsequencesComplete: allImplemented(0),
            poshNoticeIcOrderComplete: allImplemented(1),
            poshNoticeMemberContactDisplayComplete: allImplemented(2)
        }
    });
}

module.exports = Object.freeze({
    normalizePoshNoticeBody
});
