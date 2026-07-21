/**
 * GrowWithHR Compliance DNA — M3 Compliance Story Model
 *
 * Pure transformation from the governed M2 traceability bundle to the
 * private-beta M3 executive story. No DOM, storage, network, report, PDF,
 * email or delivery side effects. No recommendation rules are evaluated here.
 */

export const COMPLIANCE_STORY_MODEL_VERSION = "1.0.0";
export const COMPLIANCE_STORY_SCHEMA_ID =
    "urn:growwithhr:schema:compliance-story:1.0.0";

export const SAFE_APPLICABILITY_STATUSES = Object.freeze([
    "applicable",
    "likely-applicable",
    "not-currently-applicable",
    "more-information-needed",
    "specialist-review"
]);

export const SAFE_EVIDENCE_STATUSES = Object.freeze([
    "not-requested",
    "not-provided",
    "provided",
    "not-verified",
    "verified"
]);

const STATUS_LABELS = Object.freeze({
    applicable: "Applicable",
    "likely-applicable": "Likely applicable",
    "not-currently-applicable": "Not currently applicable",
    "more-information-needed": "More information needed",
    "specialist-review": "Specialist review"
});

const EVIDENCE_LABELS = Object.freeze({
    "not-requested": "Not requested",
    "not-provided": "Not provided",
    provided: "Provided",
    "not-verified": "Not verified",
    verified: "Verified"
});

const DOMAIN_TITLES = Object.freeze({
    governance: "Governance and jurisdiction",
    workplace: "Workplace operations",
    workforce: "Workforce model",
    growth: "Growth and change",
    people: "People governance"
});

const STATUS_WEIGHT = Object.freeze({
    applicable: 500,
    "likely-applicable": 400,
    "specialist-review": 350,
    "more-information-needed": 300,
    "not-currently-applicable": 0
});

const SNAPSHOT_FACT_IDS = Object.freeze([
    "fact.company.name",
    "fact.company.industry",
    "fact.company.entity-type",
    "fact.workforce.total-reported-workforce",
    "fact.workforce.work-model",
    "fact.footprint.primary-state",
    "fact.footprint.location-count",
    "fact.growth.hiring-plan",
    "fact.people.people-function"
]);

const asObject = (value) =>
    value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};

const asArray = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value ?? "").trim();
const unique = (values) => [...new Set(asArray(values).map(clean).filter(Boolean))];
const clone = (value) => value === undefined
    ? null
    : JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
}

function humanize(identifier) {
    const final = clean(identifier).split(".").filter(Boolean).at(-1) || "";
    return final
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function requireBundle(value) {
    const bundle = asObject(value);
    const facts = asObject(bundle.facts);
    if (
        !clean(bundle.contractVersion) ||
        !Array.isArray(facts.confirmed) ||
        !Array.isArray(facts.derived) ||
        !Array.isArray(bundle.ruleEvaluations) ||
        !Array.isArray(bundle.recommendations) ||
        !Array.isArray(bundle.sources)
    ) {
        throw new TypeError(
            "M3 requires the complete governed M2 recommendation-traceability bundle."
        );
    }
    return bundle;
}

function requireGeneratedAt(bundle, options) {
    const candidate = clean(options.generatedAt || bundle.generatedAt);
    if (!candidate || !Number.isFinite(Date.parse(candidate))) {
        throw new TypeError("M3 requires a valid generatedAt date-time.");
    }
    return new Date(candidate).toISOString();
}

function createIndexes(bundle) {
    const facts = asObject(bundle.facts);
    return {
        facts: new Map(
            [...asArray(facts.confirmed), ...asArray(facts.derived)]
                .map((fact) => [fact.id, fact])
        ),
        sources: new Map(asArray(bundle.sources).map((source) => [source.id, source])),
        recommendations: new Map(
            asArray(bundle.recommendations)
                .map((recommendation) => [recommendation.ruleId, recommendation])
        )
    };
}

function normalizeFact(id, factIndex, kind = "missing") {
    const fact = factIndex.get(id);
    return fact
        ? {
            id: fact.id,
            kind: fact.kind,
            label: fact.label || humanize(fact.id),
            value: clone(fact.value)
        }
        : {
            id,
            kind,
            label: humanize(id) || id,
            value: null
        };
}

function normalizeSources(ids, sourceIndex) {
    return unique(ids)
        .map((id) => sourceIndex.get(id))
        .filter(Boolean)
        .map((source) => ({
            id: source.id,
            title: source.title,
            publisher: source.publisher,
            url: source.url,
            jurisdiction: source.jurisdiction,
            sourceType: source.sourceType,
            reviewedAt: source.reviewedAt,
            notes: source.notes || "",
            official: Boolean(source.official)
        }));
}

function implication(status) {
    const messages = {
        applicable:
            "The supplied facts make this review relevant now. Completion, coverage and compliance have not been verified.",
        "likely-applicable":
            "The supplied facts indicate likely relevance, but confirmation is required before relying on the result.",
        "specialist-review":
            "Professional interpretation is required before treating this item as applicable to the organisation.",
        "more-information-needed":
            "The advisory position cannot be completed until the identified information is supplied.",
        "not-currently-applicable":
            "The supplied facts do not currently trigger this rule. Reassess when the organisation or operating context changes."
    };
    return messages[status];
}

function fallbackAction(status) {
    if (status === "not-currently-applicable") {
        return "No current action was generated. Reassess when relevant facts change.";
    }
    if (status === "specialist-review") {
        return "Arrange specialist review before relying on this advisory item.";
    }
    if (status === "more-information-needed") {
        return "Supply the missing information before relying on this advisory item.";
    }
    return "Review this advisory item and confirm the next appropriate action.";
}

function fallbackTimeline(status) {
    const values = {
        "not-currently-applicable": "Reassess when facts change",
        "specialist-review": "Before acting on the advisory item",
        "more-information-needed": "Before completing the advisory review"
    };
    return values[status] || "During the next advisory review";
}

function timelineWeight(timeline) {
    const text = clean(timeline).toLowerCase();
    if (text.includes("immediate") || text.includes("urgent")) return 60;
    if (text.startsWith("before")) return 50;
    if (text.includes("30 day") || text.includes("one month")) return 40;
    if (text.includes("60 day") || text.includes("two month")) return 30;
    if (text.includes("90 day") || text.includes("three month")) return 20;
    return 10;
}

function buildObligation(evaluation, recommendation, indexes) {
    const status = clean(evaluation.status);
    if (!SAFE_APPLICABILITY_STATUSES.includes(status)) {
        throw new TypeError(`Unsupported M2 applicability status: ${status || "<empty>"}.`);
    }

    const evidenceStatus = clean(recommendation?.evidence?.status || "not-requested");
    if (!SAFE_EVIDENCE_STATUSES.includes(evidenceStatus)) {
        throw new TypeError(`Unsupported M2 evidence status: ${evidenceStatus || "<empty>"}.`);
    }

    const domain = clean(evaluation.ruleId).split(".")[1] || "other";
    const triggerIds = unique(
        recommendation?.triggeringFactIds || evaluation.triggeringFactIds
    );
    const missingIds = unique(
        recommendation?.missingFactIds || evaluation.missingFactIds
    );
    const sourceIds = unique(recommendation?.sourceIds || evaluation.sourceIds);

    return {
        id: evaluation.ruleId,
        ruleId: evaluation.ruleId,
        recommendationId: recommendation?.id || null,
        domain,
        domainTitle: DOMAIN_TITLES[domain] || humanize(domain) || "Other advisory items",
        title: clean(recommendation?.title || evaluation?.metadata?.title) ||
            humanize(evaluation.ruleId) || "Advisory item",
        status,
        statusLabel: STATUS_LABELS[status],
        evidenceStatus,
        evidenceStatusLabel: EVIDENCE_LABELS[evidenceStatus],
        rationale: clean(recommendation?.reason || evaluation.reason),
        nextAction: clean(recommendation?.action) || fallbackAction(status),
        timeline: clean(recommendation?.timeline) || fallbackTimeline(status),
        implications: implication(status),
        triggerFacts: triggerIds.map((id) => normalizeFact(id, indexes.facts)),
        missingInformation: missingIds.map(
            (id) => normalizeFact(id, indexes.facts, "missing")
        ),
        sourceIds,
        sources: normalizeSources(sourceIds, indexes.sources),
        limitations: unique(recommendation?.limitations)
    };
}

function buildCounts(obligations) {
    const counts = {
        applicable: 0,
        likelyApplicable: 0,
        notCurrentlyApplicable: 0,
        moreInformationNeeded: 0,
        specialistReview: 0,
        evidenceNotVerified: 0
    };
    const keys = {
        applicable: "applicable",
        "likely-applicable": "likelyApplicable",
        "not-currently-applicable": "notCurrentlyApplicable",
        "more-information-needed": "moreInformationNeeded",
        "specialist-review": "specialistReview"
    };
    obligations.forEach((item) => {
        counts[keys[item.status]] += 1;
        if (item.evidenceStatus !== "verified") counts.evidenceNotVerified += 1;
    });
    return counts;
}

function buildHeadline(counts) {
    if (counts.specialistReview) {
        return "Specialist review is required for part of the advisory.";
    }
    const priorities = counts.applicable + counts.likelyApplicable;
    if (priorities) {
        return `${priorities} current advisory ${priorities === 1 ? "priority" : "priorities"} identified from the supplied facts.`;
    }
    if (counts.moreInformationNeeded) {
        return "More information is needed to complete part of the advisory.";
    }
    return "No current action priorities were produced from the supplied facts.";
}

function buildPriorityIds(obligations) {
    return obligations
        .filter((item) => item.recommendationId && item.status !== "not-currently-applicable")
        .slice()
        .sort((left, right) => {
            const leftWeight = STATUS_WEIGHT[left.status] + timelineWeight(left.timeline);
            const rightWeight = STATUS_WEIGHT[right.status] + timelineWeight(right.timeline);
            return rightWeight - leftWeight || left.id.localeCompare(right.id);
        })
        .slice(0, 3)
        .map((item) => item.id);
}

function buildGroups(obligations) {
    const groups = new Map();
    obligations.forEach((item) => {
        if (!groups.has(item.domain)) {
            groups.set(item.domain, {
                id: `group.${item.domain}`,
                title: item.domainTitle,
                obligationIds: []
            });
        }
        groups.get(item.domain).obligationIds.push(item.id);
    });
    return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function buildComplianceStory(traceabilityBundle, options = {}) {
    const bundle = requireBundle(traceabilityBundle);
    const settings = asObject(options);
    const indexes = createIndexes(bundle);
    const obligations = asArray(bundle.ruleEvaluations).map(
        (evaluation) => buildObligation(
            evaluation,
            indexes.recommendations.get(evaluation.ruleId),
            indexes
        )
    );
    const counts = buildCounts(obligations);
    const topPriorityIds = buildPriorityIds(obligations);
    const missingIds = unique(
        obligations.flatMap((item) => item.missingInformation.map((fact) => fact.id))
    );

    const output = {
        schemaId: COMPLIANCE_STORY_SCHEMA_ID,
        modelVersion: COMPLIANCE_STORY_MODEL_VERSION,
        generatedAt: requireGeneratedAt(bundle, settings),
        sourceTraceabilityContractVersion: bundle.contractVersion,
        sourceCatalogVersion: clean(bundle.metadata?.catalogVersion) || null,
        privateBetaOnly: true,
        stableReportMutation: false,
        companySnapshot: SNAPSHOT_FACT_IDS
            .filter((id) => indexes.facts.has(id))
            .map((id) => normalizeFact(id, indexes.facts)),
        complianceDna: {
            headline: buildHeadline(counts),
            advisoryNotice:
                "This advisory summary is based on supplied facts and deterministic rules. It is not legal certification, verified compliance or evidence verification.",
            counts,
            topPriorityCount: topPriorityIds.length
        },
        topPriorityIds,
        obligations,
        obligationGroups: buildGroups(obligations),
        assumptions: missingIds.map((id) => {
            const fact = normalizeFact(id, indexes.facts, "missing");
            return {
                factId: id,
                label: fact.label,
                message: `${fact.label} was not supplied. Related output remains more information needed until this fact is confirmed.`
            };
        }),
        sources: normalizeSources(
            asArray(bundle.sources).map((source) => source.id),
            indexes.sources
        ),
        limitations: unique(bundle.limitations),
        metadata: {
            source: "m2-recommendation-traceability",
            advisoryOnly: true,
            protectedStateReadOnly: true,
            stableReportMutation: false,
            ...clone(asObject(settings.metadata))
        }
    };

    output.metadata.advisoryOnly = true;
    output.metadata.protectedStateReadOnly = true;
    output.metadata.stableReportMutation = false;
    return deepFreeze(output);
}

export default Object.freeze({
    version: COMPLIANCE_STORY_MODEL_VERSION,
    schemaId: COMPLIANCE_STORY_SCHEMA_ID,
    buildComplianceStory
});
