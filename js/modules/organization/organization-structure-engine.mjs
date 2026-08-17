import { FRAMEWORK, sourcesForRule } from "./organization-source-registry.mjs";

/**
 * GrowWithHR Organization Structure
 * Deterministic structural analysis only.
 *
 * Public sources support the underlying organization-design principle.
 * GrowWithHR remains responsible for the disclosed deterministic rule that
 * interprets company facts. No source is represented as prescribing a
 * GrowWithHR prototype threshold unless it actually does so.
 */

const STATUS = Object.freeze({
    STABLE: "stable",
    WATCH: "watch",
    ACTION: "action",
    NEEDS_INFORMATION: "needs-information"
});

const CONFIDENCE = Object.freeze({
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low"
});

const STATUS_RANK = Object.freeze({
    [STATUS.ACTION]: 0,
    [STATUS.WATCH]: 1,
    [STATUS.NEEDS_INFORMATION]: 2,
    [STATUS.STABLE]: 3
});

function text(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

function optionalNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

function positiveNumber(value) {
    const number = optionalNumber(value);
    return number !== null && number > 0 ? number : null;
}

function stringArray(value) {
    if (Array.isArray(value)) return value.map(item => text(item)).filter(Boolean);
    return text(value).split(",").map(item => item.trim()).filter(Boolean);
}

function choice(value, allowed) {
    const normalized = text(value).toLowerCase();
    return allowed.includes(normalized) ? normalized : "";
}

function normalizeOrganizationInput(input = {}) {
    const shared = input.shared && typeof input.shared === "object" ? input.shared : {};
    const workforce = input.workforce && typeof input.workforce === "object" ? input.workforce : {};
    const organization = input.organization && typeof input.organization === "object" ? input.organization : {};
    const geography = input.geography && typeof input.geography === "object" ? input.geography : {};

    const employees = positiveNumber(workforce.totalEmployees ?? shared.employees ?? input.employees);
    const expectedEmployees12Months = positiveNumber(
        workforce.expectedEmployees12Months ?? shared.expectedEmployees ?? input.expectedEmployees
    );
    const operatingLocationCount = positiveNumber(
        geography.operatingLocationCount ?? organization.locations ?? shared.locations ?? input.locations
    );

    return {
        companyName: text(shared.companyName ?? input.companyName),
        email: text(shared.email ?? input.email),
        industry: text(shared.industry ?? input.industry),
        growthStage: text(shared.growthStage ?? input.growthStage),
        employees,
        expectedEmployees12Months,
        peopleManagerCount: optionalNumber(
            organization.peopleManagerCount ?? organization.managerCount ?? input.managerCount
        ),
        reportingLevels: optionalNumber(organization.reportingLevels ?? input.reportingLevels),
        founderDirectReports: optionalNumber(organization.founderDirectReports ?? input.founderDirectReports),
        operatingLocationCount,
        departments: stringArray(organization.departments ?? input.departments),
        founderDecisions: text(organization.founderDecisions ?? input.founderDecisions),
        expansion: text(organization.expansion ?? input.expansion),
        managerRole: choice(
            organization.managerRole ?? input.managerRole,
            ["manager-only", "player-coach", "hands-on-specialist", "dont-know"]
        ),
        workComplexity: choice(
            organization.workComplexity ?? input.workComplexity,
            ["routine", "mixed", "complex", "dont-know"]
        ),
        workStandardization: choice(
            organization.workStandardization ?? input.workStandardization,
            ["high", "mixed", "low", "dont-know"]
        ),
        teamIndependence: choice(
            organization.teamIndependence ?? input.teamIndependence,
            ["high", "mixed", "low", "dont-know"]
        ),
        coachingIntensity: choice(
            organization.coachingIntensity ?? input.coachingIntensity,
            ["low", "medium", "high", "dont-know"]
        ),
        roleClarity: choice(
            organization.roleClarity ?? input.roleClarity,
            ["clear", "mixed", "unclear", "dont-know"]
        ),
        decisionRights: choice(
            organization.decisionRights ?? input.decisionRights,
            ["clear", "mixed", "unclear", "dont-know"]
        ),
        governanceCadence: choice(
            organization.governanceCadence ?? input.governanceCadence,
            ["weekly", "biweekly", "monthly", "ad-hoc", "none", "dont-know"]
        ),
        coordinationFriction: choice(
            organization.coordinationFriction ?? input.coordinationFriction,
            ["low", "some", "high", "dont-know"]
        ),
        confirmedAt: text(organization.confirmedAt ?? input.confirmedAt, new Date().toISOString())
    };
}

function keywordCategories(value, categoryPatterns) {
    const source = text(value).toLowerCase();
    if (!source || /^(none|no|n\/a|not applicable|nothing planned)[.! ]*$/.test(source)) return [];
    const categories = Object.entries(categoryPatterns)
        .filter(([, patterns]) => patterns.some(pattern => pattern.test(source)))
        .map(([category]) => category);
    return categories.length ? categories : ["other"];
}

function founderDecisionCategories(facts) {
    return keywordCategories(facts.founderDecisions, {
        people: [/hir(e|ing)/, /compensation/, /salary/, /pay /, /promotion/, /people/],
        commercial: [/pricing/, /price/, /customer/, /sales/, /contract/, /deal/],
        financial: [/spend/, /budget/, /investment/, /purchase/, /capex/, /financial/],
        operating: [/product/, /vendor/, /operation/, /delivery/, /roadmap/, /process/],
        strategic: [/strategy/, /market/, /partnership/, /acquisition/, /merger/, /business line/]
    });
}

function expansionSignals(facts) {
    return keywordCategories(facts.expansion, {
        geography: [/location/, /office/, /state/, /country/, /region/, /geograph/, /international/],
        workforce: [/hir(e|ing)/, /headcount/, /employee/, /workforce/, /team growth/],
        offering: [/product/, /service/, /business line/, /new line/, /market/],
        transaction: [/acquisition/, /acquire/, /merger/, /joint venture/]
    });
}

function managementContext(facts) {
    let points = 0;
    let knownFactors = 0;
    const factors = [];

    const add = (key, value, map, label) => {
        if (!value || value === "dont-know") return;
        knownFactors += 1;
        const amount = map[value] ?? 0;
        points += amount;
        factors.push({ key, value, label, pressure: amount });
    };

    add("organization.managerRole", facts.managerRole, {
        "manager-only": 0,
        "player-coach": 1,
        "hands-on-specialist": 2
    }, "manager role");
    add("organization.workComplexity", facts.workComplexity, {
        routine: 0,
        mixed: 1,
        complex: 2
    }, "work complexity");
    add("organization.workStandardization", facts.workStandardization, {
        high: 0,
        mixed: 1,
        low: 2
    }, "work standardization");
    add("organization.teamIndependence", facts.teamIndependence, {
        high: 0,
        mixed: 1,
        low: 2
    }, "team independence");
    add("organization.coachingIntensity", facts.coachingIntensity, {
        low: 0,
        medium: 1,
        high: 2
    }, "manager interaction/coaching intensity");

    if (facts.operatingLocationCount !== null) {
        const locationPressure = facts.operatingLocationCount >= 4 ? 2 : facts.operatingLocationCount >= 2 ? 1 : 0;
        points += locationPressure;
        factors.push({
            key: "geography.operatingLocationCount",
            value: facts.operatingLocationCount,
            label: "worker-location complexity",
            pressure: locationPressure
        });
    }

    const band = knownFactors < 3
        ? "insufficient-context"
        : points >= 7
            ? "high-support-load"
            : points >= 4
                ? "moderate-support-load"
                : "lower-support-load";

    return {
        knownFactors,
        points,
        band,
        factors
    };
}

function contextualSpanStatus(ratio, context) {
    if (ratio === null) return STATUS.NEEDS_INFORMATION;
    if (ratio <= 8) return STATUS.STABLE;
    if (ratio > 16) return STATUS.ACTION;
    if (context.knownFactors < 3) return STATUS.NEEDS_INFORMATION;

    if (context.band === "high-support-load") {
        return ratio > 10 ? STATUS.ACTION : ratio > 6 ? STATUS.WATCH : STATUS.STABLE;
    }
    if (context.band === "moderate-support-load") {
        return ratio > 13 ? STATUS.ACTION : ratio > 9 ? STATUS.WATCH : STATUS.STABLE;
    }
    return ratio > 16 ? STATUS.ACTION : ratio > 12 ? STATUS.WATCH : STATUS.STABLE;
}

function derivedMetrics(facts) {
    const managerCount = facts.peopleManagerCount;
    const currentSpan = facts.employees !== null && managerCount !== null && managerCount > 0
        ? facts.employees / managerCount
        : null;
    const growthPercent = facts.employees !== null && facts.expectedEmployees12Months !== null && facts.employees > 0
        ? ((facts.expectedEmployees12Months - facts.employees) / facts.employees) * 100
        : null;
    const projectedSpan = facts.expectedEmployees12Months !== null && managerCount !== null && managerCount > 0
        ? facts.expectedEmployees12Months / managerCount
        : null;
    const context = managementContext(facts);

    return {
        currentEmployeeToManagerRatio: currentSpan === null ? null : Number(currentSpan.toFixed(1)),
        expectedHeadcountGrowthPercent: growthPercent === null ? null : Number(growthPercent.toFixed(1)),
        projectedEmployeeToManagerRatioIfManagerCountUnchanged:
            projectedSpan === null ? null : Number(projectedSpan.toFixed(1)),
        departmentCount: facts.departments.length,
        operatingLocationCount: facts.operatingLocationCount,
        managementContextKnownFactors: context.knownFactors,
        managementContextPressurePoints: context.points,
        managementContextBand: context.band,
        managementContextFactors: context.factors,
        founderDecisionCategories: founderDecisionCategories(facts),
        expansionSignals: expansionSignals(facts)
    };
}

function factMetadata(facts, metrics) {
    const capturedAt = facts.confirmedAt;
    const metadata = {};
    const confirmed = (key, isPresent, confidence = CONFIDENCE.HIGH) => {
        metadata[key] = {
            status: isPresent ? "confirmed" : "missing",
            source: "organization-structure",
            capturedAt: isPresent ? capturedAt : null,
            lastConfirmedAt: isPresent ? capturedAt : null,
            usedBy: ["organization"],
            confidence: isPresent ? confidence : CONFIDENCE.LOW,
            sensitivity: "business",
            freshness: isPresent ? "current-session" : "unknown"
        };
    };
    const derived = (key, isPresent, sources) => {
        metadata[key] = {
            status: isPresent ? "derived" : "unavailable",
            source: "calculated",
            capturedAt: isPresent ? capturedAt : null,
            lastConfirmedAt: null,
            usedBy: ["organization"],
            confidence: isPresent ? CONFIDENCE.HIGH : CONFIDENCE.LOW,
            sensitivity: "business",
            freshness: isPresent ? "derived-from-current-session" : "unknown",
            derivedFrom: sources
        };
    };

    confirmed("company.displayName", Boolean(facts.companyName));
    confirmed("company.email", Boolean(facts.email));
    confirmed("industry.sector", Boolean(facts.industry));
    confirmed("business.growthStage", Boolean(facts.growthStage));
    confirmed("workforce.totalEmployees", facts.employees !== null);
    confirmed("workforce.expectedEmployees12Months", facts.expectedEmployees12Months !== null);
    confirmed("organization.peopleManagerCount", facts.peopleManagerCount !== null);
    confirmed("organization.reportingLevels", facts.reportingLevels !== null);
    confirmed("organization.founderDirectReports", facts.founderDirectReports !== null);
    confirmed("organization.departments", facts.departments.length > 0);
    confirmed("organization.managerRole", Boolean(facts.managerRole) && facts.managerRole !== "dont-know");
    confirmed("organization.workComplexity", Boolean(facts.workComplexity) && facts.workComplexity !== "dont-know");
    confirmed("organization.workStandardization", Boolean(facts.workStandardization) && facts.workStandardization !== "dont-know");
    confirmed("organization.teamIndependence", Boolean(facts.teamIndependence) && facts.teamIndependence !== "dont-know");
    confirmed("organization.coachingIntensity", Boolean(facts.coachingIntensity) && facts.coachingIntensity !== "dont-know");
    confirmed("organization.roleClarity", Boolean(facts.roleClarity) && facts.roleClarity !== "dont-know");
    confirmed("organization.decisionRights", Boolean(facts.decisionRights) && facts.decisionRights !== "dont-know");
    confirmed("organization.governanceCadence", Boolean(facts.governanceCadence) && facts.governanceCadence !== "dont-know");
    confirmed("organization.coordinationFriction", Boolean(facts.coordinationFriction) && facts.coordinationFriction !== "dont-know");
    confirmed("organization.founderDecisions", Boolean(facts.founderDecisions), CONFIDENCE.MEDIUM);
    confirmed("organization.expansion", Boolean(facts.expansion), CONFIDENCE.MEDIUM);
    confirmed("geography.operatingLocationCount", facts.operatingLocationCount !== null);

    derived("organization.currentEmployeeToManagerRatio", metrics.currentEmployeeToManagerRatio !== null, ["workforce.totalEmployees", "organization.peopleManagerCount"]);
    derived("workforce.expectedHeadcountGrowthPercent", metrics.expectedHeadcountGrowthPercent !== null, ["workforce.totalEmployees", "workforce.expectedEmployees12Months"]);
    derived("organization.projectedEmployeeToManagerRatioIfManagerCountUnchanged", metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged !== null, ["workforce.expectedEmployees12Months", "organization.peopleManagerCount"]);
    derived("organization.managementContextBand", metrics.managementContextKnownFactors >= 3, ["organization.managerRole", "organization.workComplexity", "organization.workStandardization", "organization.teamIndependence", "organization.coachingIntensity", "geography.operatingLocationCount"]);
    derived("organization.founderDecisionCategories", metrics.founderDecisionCategories.length > 0, ["organization.founderDecisions"]);
    derived("organization.expansionSignals", metrics.expansionSignals.length > 0, ["organization.expansion"]);

    return metadata;
}

function finding({ id, area, status, title, factsUsed, whyItMatters, action, growthTrigger, confidence = CONFIDENCE.HIGH, missingFacts = [], context = null }) {
    const evidence = sourcesForRule(id);
    return {
        id,
        ruleId: evidence.ruleId,
        ruleVersion: evidence.ruleVersion,
        area,
        status,
        title,
        factsUsed,
        whyItMatters,
        action,
        growthTrigger,
        confidence,
        confidenceMeaning: "Confidence reflects the completeness of supplied facts and deterministic rule path; it is not statistical confidence.",
        missingFacts,
        context,
        framework: FRAMEWORK,
        ruleBasis: evidence.ruleBasis,
        ruleLastReviewed: evidence.lastReviewed,
        ruleReviewOwner: evidence.reviewOwner,
        sources: evidence.sources
    };
}

function managementCapacity(facts, metrics) {
    if (facts.employees === null) {
        return finding({
            id: "ORG-CAPACITY-001", area: "management-capacity", status: STATUS.NEEDS_INFORMATION,
            title: "Management capacity needs more information", factsUsed: [],
            whyItMatters: "Headcount is needed to compare management capacity with the size and operating context of the organization.",
            action: "Confirm current employee headcount.",
            growthTrigger: "Reassess whenever headcount or manager count changes materially.",
            confidence: CONFIDENCE.LOW, missingFacts: ["workforce.totalEmployees"]
        });
    }
    if (facts.peopleManagerCount === null) {
        return finding({
            id: "ORG-CAPACITY-001", area: "management-capacity", status: STATUS.NEEDS_INFORMATION,
            title: "Management capacity needs more information", factsUsed: ["workforce.totalEmployees"],
            whyItMatters: "The number of people managers is needed to understand how much coordination and people-management capacity exists.",
            action: "Confirm how many people managers currently have direct team responsibility.",
            growthTrigger: "Reassess before the next significant hiring wave.",
            confidence: CONFIDENCE.LOW, missingFacts: ["organization.peopleManagerCount"]
        });
    }
    if (facts.peopleManagerCount === 0) {
        const status = facts.employees > 10 ? STATUS.ACTION : facts.employees > 5 ? STATUS.WATCH : STATUS.STABLE;
        return finding({
            id: "ORG-CAPACITY-001", area: "management-capacity", status,
            title: status === STATUS.STABLE ? "Founder-led management remains proportionate to current size" : "People-management capacity is concentrated",
            factsUsed: ["workforce.totalEmployees", "organization.peopleManagerCount"],
            whyItMatters: `The organization has ${facts.employees} employees and no recorded people managers. Coordination and people-management load can concentrate quickly as headcount rises.`,
            action: status === STATUS.STABLE ? "Keep manager ownership explicit and reassess before adding significant headcount." : "Define the next layer of people-management ownership before growth increases the coordination load.",
            growthTrigger: "Reassess when the organization adds another team or approaches the next hiring wave.",
            confidence: CONFIDENCE.HIGH
        });
    }

    const ratio = metrics.currentEmployeeToManagerRatio;
    const context = {
        band: metrics.managementContextBand,
        knownFactors: metrics.managementContextKnownFactors,
        factors: metrics.managementContextFactors
    };
    const status = contextualSpanStatus(ratio, {
        band: metrics.managementContextBand,
        knownFactors: metrics.managementContextKnownFactors
    });
    const contextFacts = metrics.managementContextFactors.map(item => item.key);
    const missingContext = [
        [facts.managerRole, "organization.managerRole"],
        [facts.workComplexity, "organization.workComplexity"],
        [facts.workStandardization, "organization.workStandardization"],
        [facts.teamIndependence, "organization.teamIndependence"],
        [facts.coachingIntensity, "organization.coachingIntensity"]
    ].filter(([value]) => !value || value === "dont-know").map(([, key]) => key);

    if (status === STATUS.NEEDS_INFORMATION) {
        return finding({
            id: "ORG-CAPACITY-001", area: "management-capacity", status,
            title: "Management span needs operating-context information",
            factsUsed: ["workforce.totalEmployees", "organization.peopleManagerCount", "organization.currentEmployeeToManagerRatio", ...contextFacts],
            whyItMatters: `The current employee-to-manager ratio is approximately ${ratio}:1. A ratio alone does not establish an appropriate span; the work, manager role, required interaction and team independence change how much management capacity is needed.`,
            action: "Complete at least three management-context questions so GrowWithHR can interpret the span contextually rather than apply one universal ratio.",
            growthTrigger: "Reassess when team work, manager responsibilities, location mix or headcount changes.",
            confidence: CONFIDENCE.LOW,
            missingFacts: missingContext,
            context
        });
    }

    const title = status === STATUS.ACTION
        ? "Management capacity is under contextual pressure"
        : status === STATUS.WATCH
            ? "Management span should be watched in this operating context"
            : "Current management span is workable in the supplied operating context";
    const contextLabel = metrics.managementContextBand.replaceAll("-", " ");
    return finding({
        id: "ORG-CAPACITY-001", area: "management-capacity", status, title,
        factsUsed: ["workforce.totalEmployees", "organization.peopleManagerCount", "organization.currentEmployeeToManagerRatio", ...contextFacts],
        whyItMatters: `The current employee-to-manager ratio is approximately ${ratio}:1 and the supplied management context is classified as ${contextLabel}. GrowWithHR considers the ratio together with work complexity, standardization, manager role, team independence, coaching intensity and location context; this is not a judgment of manager capability.`,
        action: status === STATUS.STABLE ? "Keep the contextual span factors visible and reassess when the work or operating model changes." : "Review team boundaries, manager time allocation, delegation, work standardization and required coaching before adding further coordination load.",
        growthTrigger: "Reassess after material hiring, a new function, a change in manager role, or a new operating location.",
        confidence: metrics.managementContextKnownFactors >= 4 ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM,
        context
    });
}

function founderSpan(facts, metrics) {
    if (facts.founderDirectReports === null) {
        return finding({
            id: "ORG-FOUNDER-001", area: "founder-dependency", status: STATUS.NEEDS_INFORMATION,
            title: "Founder coordination load needs more information",
            factsUsed: facts.founderDecisions ? ["organization.founderDecisions", "organization.founderDecisionCategories"] : [],
            whyItMatters: facts.founderDecisions
                ? "Important founder-dependent decisions were recorded, but direct-report count is still needed to understand how concentrated cross-company coordination is."
                : "Founder/CEO direct-report count and decision concentration help show how centralized cross-company coordination is.",
            action: "Confirm the number of direct reports to the founder/CEO.",
            growthTrigger: "Reassess before adding another function or leadership layer.",
            confidence: CONFIDENCE.LOW,
            missingFacts: ["organization.founderDirectReports"]
        });
    }

    const direct = facts.founderDirectReports;
    const decisionCount = metrics.founderDecisionCategories.length;
    let status = direct > 10 ? STATUS.ACTION : direct > 7 ? STATUS.WATCH : STATUS.STABLE;
    if (decisionCount >= 3) status = STATUS.ACTION;
    else if (decisionCount >= 1 && status === STATUS.STABLE) status = STATUS.WATCH;

    const factsUsed = ["organization.founderDirectReports"];
    if (facts.founderDecisions) factsUsed.push("organization.founderDecisions", "organization.founderDecisionCategories");
    return finding({
        id: "ORG-FOUNDER-001", area: "founder-dependency", status,
        title: status === STATUS.ACTION ? "Founder coordination and decision paths are highly concentrated" : status === STATUS.WATCH ? "Founder dependency is becoming a scaling watchpoint" : "Founder dependency is not an immediate structural trigger",
        factsUsed,
        whyItMatters: `${direct} founder/CEO direct reports are recorded${decisionCount ? `, and founder approval still appears in ${decisionCount} important decision categor${decisionCount === 1 ? "y" : "ies"}` : ""}. Direct-report load and decision concentration can combine to centralize escalation as complexity rises.`,
        action: status === STATUS.STABLE ? "Keep functional ownership explicit as new teams are added." : "Identify which recurring founder-dependent decisions can move to clearly accountable functional owners with defined boundaries and escalation criteria.",
        growthTrigger: "Reassess when another function, location, senior owner, or founder approval category is added.",
        confidence: facts.founderDecisions ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM,
        context: { founderDecisionCategories: metrics.founderDecisionCategories }
    });
}

function reportingArchitecture(facts) {
    if (facts.reportingLevels === null || facts.employees === null) {
        const missingFacts = [];
        if (facts.reportingLevels === null) missingFacts.push("organization.reportingLevels");
        if (facts.employees === null) missingFacts.push("workforce.totalEmployees");
        return finding({
            id: "ORG-REPORTING-001", area: "reporting-architecture", status: STATUS.NEEDS_INFORMATION,
            title: "Reporting architecture needs more information", factsUsed: [],
            whyItMatters: "Headcount and reporting layers are needed to assess whether formal hierarchy is proportionate to current size.",
            action: "Confirm current headcount and the number of reporting layers between an employee and the CEO.",
            growthTrigger: "Reassess whenever a new management layer is introduced.",
            confidence: CONFIDENCE.LOW, missingFacts
        });
    }
    const layers = facts.reportingLevels;
    let status = STATUS.STABLE;
    let title = "Reporting layers are not an immediate structural trigger";
    let action = "Keep reporting relationships and accountable owners documented.";
    if (layers === 0 && facts.employees > 40) {
        status = STATUS.ACTION; title = "Reporting hierarchy is under-defined for current scale";
        action = "Clarify reporting relationships and accountable functional ownership before further growth.";
    } else if (layers === 0 && facts.employees > 15) {
        status = STATUS.WATCH; title = "Flat reporting design is becoming a scaling watchpoint";
        action = "Document reporting relationships and define where a formal management layer will become necessary.";
    } else if (layers >= 5 && facts.employees < 100) {
        status = STATUS.WATCH; title = "Reporting design may be layered for current scale";
        action = "Review whether every layer carries a distinct decision or coordination purpose.";
    }
    return finding({
        id: "ORG-REPORTING-001", area: "reporting-architecture", status, title,
        factsUsed: ["workforce.totalEmployees", "organization.reportingLevels"],
        whyItMatters: `${facts.employees} employees and ${layers} recorded reporting layer${layers === 1 ? "" : "s"} provide a structural signal about how work and accountability flow.`,
        action, growthTrigger: "Reassess when headcount, team count, or reporting layers change.", confidence: CONFIDENCE.HIGH
    });
}

function functionalOwnership(facts) {
    const departments = facts.departments.length;
    if (!departments) {
        return finding({
            id: "ORG-OWNERSHIP-001", area: "functional-ownership",
            status: facts.employees !== null && facts.employees > 20 ? STATUS.ACTION : STATUS.NEEDS_INFORMATION,
            title: facts.employees !== null && facts.employees > 20 ? "Functional ownership needs to be made explicit" : "Functional ownership needs more information",
            factsUsed: facts.employees !== null ? ["workforce.totalEmployees"] : [],
            whyItMatters: "Named functions or responsibility domains make ownership boundaries visible and reduce ambiguity as work becomes more specialized.",
            action: "List the main functions and identify who owns each function's outcomes and recurring decisions.",
            growthTrigger: "Reassess whenever a new function or business line is introduced.",
            confidence: facts.employees !== null ? CONFIDENCE.MEDIUM : CONFIDENCE.LOW,
            missingFacts: ["organization.departments"]
        });
    }
    const status = facts.employees !== null && facts.employees > 30 && departments < 3 ? STATUS.WATCH : STATUS.STABLE;
    return finding({
        id: "ORG-OWNERSHIP-001", area: "functional-ownership", status,
        title: status === STATUS.WATCH ? "Functional ownership may be thin for current scale" : "Named functional ownership provides a usable structural base",
        factsUsed: ["organization.departments", ...(facts.employees !== null ? ["workforce.totalEmployees"] : [])],
        whyItMatters: `${departments} function${departments === 1 ? "" : "s"} or department${departments === 1 ? "" : "s"} were recorded. Clear ownership matters more than the number of labels, but sparse coverage can signal overloaded or implicit responsibility boundaries.`,
        action: status === STATUS.STABLE ? "Keep function ownership current as responsibilities change." : "Check whether all critical business outcomes have an explicit owner, even if the company keeps a lean formal structure.",
        growthTrigger: "Reassess when a new product, location, or specialist function is added.", confidence: CONFIDENCE.MEDIUM
    });
}

function qualitativeFinding({ id, area, value, factKey, labels, missingTitle, why, actions, trigger }) {
    if (!value || value === "dont-know") {
        return finding({
            id, area, status: STATUS.NEEDS_INFORMATION, title: missingTitle, factsUsed: [], whyItMatters: why,
            action: actions.missing, growthTrigger: trigger, confidence: CONFIDENCE.LOW, missingFacts: [factKey]
        });
    }
    const configured = labels[value];
    return finding({
        id, area, status: configured.status, title: configured.title, factsUsed: [factKey], whyItMatters: why,
        action: actions[value] || actions.default, growthTrigger: trigger, confidence: CONFIDENCE.MEDIUM
    });
}

function roleClarityFinding(facts) {
    return qualitativeFinding({
        id: "ORG-CLARITY-001", area: "role-clarity", value: facts.roleClarity,
        factKey: "organization.roleClarity", missingTitle: "Role clarity needs more information",
        why: "Clear role boundaries reduce duplicated work, gaps in ownership, and unnecessary escalation. This evaluates the structure, not individual performance.",
        labels: {
            clear: { status: STATUS.STABLE, title: "Role ownership is reported as clear" },
            mixed: { status: STATUS.WATCH, title: "Role clarity is inconsistent across the organization" },
            unclear: { status: STATUS.ACTION, title: "Role ownership needs structural clarification" }
        },
        actions: {
            clear: "Keep role outcomes and interfaces current as teams change.",
            mixed: "Clarify outcomes, decision boundaries, and handoffs for roles where ownership overlaps.",
            unclear: "Define role outcomes, accountable owners, and key handoffs before adding more complexity.",
            missing: "Confirm whether responsibilities are generally clear, mixed, or unclear."
        },
        trigger: "Reassess after reorganization, rapid hiring, or the creation of new roles."
    });
}

function decisionRightsFinding(facts, metrics) {
    if (!facts.decisionRights || facts.decisionRights === "dont-know") {
        return finding({
            id: "ORG-DECISIONS-001", area: "decision-rights", status: STATUS.NEEDS_INFORMATION,
            title: "Decision rights need more information",
            factsUsed: facts.founderDecisions ? ["organization.founderDecisions", "organization.founderDecisionCategories"] : [],
            whyItMatters: "Explicit decision rights help routine choices happen at the right level and reduce avoidable escalation.",
            action: "Confirm whether recurring decision ownership is generally clear, mixed, or unclear.",
            growthTrigger: "Reassess when new leaders, functions, or approval thresholds are introduced.",
            confidence: CONFIDENCE.LOW,
            missingFacts: ["organization.decisionRights"]
        });
    }

    const founderDecisionCount = metrics.founderDecisionCategories.length;
    let status = facts.decisionRights === "unclear" ? STATUS.ACTION : facts.decisionRights === "mixed" ? STATUS.WATCH : STATUS.STABLE;
    if (founderDecisionCount >= 3) status = STATUS.ACTION;
    else if (founderDecisionCount >= 1 && status === STATUS.STABLE) status = STATUS.WATCH;

    const title = status === STATUS.ACTION
        ? "Decision ownership is a structural bottleneck"
        : status === STATUS.WATCH
            ? "Decision ownership or founder escalation should be clarified"
            : "Decision ownership is reported as clear";
    const factsUsed = ["organization.decisionRights"];
    if (facts.founderDecisions) factsUsed.push("organization.founderDecisions", "organization.founderDecisionCategories");
    return finding({
        id: "ORG-DECISIONS-001", area: "decision-rights", status, title, factsUsed,
        whyItMatters: founderDecisionCount
            ? `The company reports decision ownership as ${facts.decisionRights}, while ${founderDecisionCount} important decision categor${founderDecisionCount === 1 ? "y still appears" : "ies still appear"} to require founder approval. That combination is a centralization signal.`
            : "Explicit decision rights help routine choices happen at the right level and reduce avoidable escalation.",
        action: status === STATUS.STABLE ? "Keep major recurring decisions mapped to accountable roles." : "Map recurring commercial, people, operating and spending decisions to a clear accountable owner, with explicit founder escalation criteria only where needed.",
        growthTrigger: "Reassess when new leaders, functions, approval thresholds, or founder-dependent decision categories are introduced.",
        confidence: facts.founderDecisions ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM,
        context: { founderDecisionCategories: metrics.founderDecisionCategories }
    });
}

function governanceFinding(facts) {
    const value = facts.governanceCadence;
    if (!value || value === "dont-know") {
        return finding({
            id: "ORG-GOVERNANCE-001", area: "governance-cadence", status: STATUS.NEEDS_INFORMATION,
            title: "Operating governance cadence needs more information", factsUsed: [],
            whyItMatters: "A predictable operating cadence helps teams resolve cross-functional issues and make recurring decisions without relying on ad hoc escalation.",
            action: "Confirm how often the main cross-functional operating review happens.",
            growthTrigger: "Reassess when operating complexity or the number of functions increases.",
            confidence: CONFIDENCE.LOW, missingFacts: ["organization.governanceCadence"]
        });
    }
    const status = value === "none" ? STATUS.ACTION : value === "ad-hoc" ? STATUS.WATCH : STATUS.STABLE;
    const title = status === STATUS.ACTION ? "No recurring operating governance cadence is recorded" : status === STATUS.WATCH ? "Operating governance is primarily ad hoc" : "A recurring operating governance cadence is in place";
    return finding({
        id: "ORG-GOVERNANCE-001", area: "governance-cadence", status, title,
        factsUsed: ["organization.governanceCadence"],
        whyItMatters: "A predictable operating cadence helps surface dependencies, ownership conflicts, and decisions before they become founder-level escalations.",
        action: status === STATUS.STABLE ? "Keep the cadence focused on decisions, dependencies, and accountability." : "Establish a recurring cross-functional operating review with clear decision and follow-up ownership.",
        growthTrigger: "Increase or redesign the cadence when the number of teams, locations, or interdependencies rises.", confidence: CONFIDENCE.MEDIUM
    });
}

function coordinationFinding(facts) {
    return qualitativeFinding({
        id: "ORG-COORDINATION-001", area: "coordination", value: facts.coordinationFriction,
        factKey: "organization.coordinationFriction", missingTitle: "Cross-functional coordination needs more information",
        why: "Repeated handoff friction is an operating-model signal that responsibilities, interfaces, or decision paths may not be keeping pace with growth.",
        labels: {
            low: { status: STATUS.STABLE, title: "Cross-functional coordination is reported as low-friction" },
            some: { status: STATUS.WATCH, title: "Cross-functional coordination has recurring friction" },
            high: { status: STATUS.ACTION, title: "Cross-functional coordination is a structural constraint" }
        },
        actions: {
            low: "Keep team interfaces explicit as new dependencies appear.",
            some: "Identify the recurring handoffs or decisions that create friction and clarify ownership at those interfaces.",
            high: "Redesign the highest-friction interfaces, decision paths, and recurring coordination forums before adding more complexity.",
            missing: "Confirm whether coordination friction is low, occasional, or high."
        },
        trigger: "Reassess after adding functions, locations, product lines, or major shared workflows."
    });
}

function growthReadiness(facts, metrics) {
    if (facts.employees === null || facts.expectedEmployees12Months === null) {
        const missingFacts = [];
        if (facts.employees === null) missingFacts.push("workforce.totalEmployees");
        if (facts.expectedEmployees12Months === null) missingFacts.push("workforce.expectedEmployees12Months");
        return finding({
            id: "ORG-GROWTH-001", area: "growth-readiness", status: STATUS.NEEDS_INFORMATION,
            title: "Growth-readiness scenario needs more information",
            factsUsed: facts.expansion ? ["organization.expansion", "organization.expansionSignals"] : [],
            whyItMatters: facts.expansion
                ? "A planned expansion was recorded, but a 12-month headcount assumption is still needed to test the current structure against workforce growth."
                : "A 12-month headcount assumption helps test whether the current structure is likely to face predictable capacity pressure.",
            action: "Confirm current headcount and a reasonable 12-month headcount assumption.",
            growthTrigger: "Reassess when the hiring or expansion plan changes materially.", confidence: CONFIDENCE.LOW, missingFacts
        });
    }

    const growth = metrics.expectedHeadcountGrowthPercent;
    const projectedSpan = metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged;
    const projectedSpanStatus = projectedSpan === null ? STATUS.STABLE : contextualSpanStatus(projectedSpan, {
        band: metrics.managementContextBand,
        knownFactors: metrics.managementContextKnownFactors
    });
    let status = STATUS.STABLE;
    let title = "Planned headcount does not create an immediate structural trigger";
    let action = "Keep structure and management capacity aligned with the hiring and expansion plan.";

    if (growth > 50 || projectedSpanStatus === STATUS.ACTION) {
        status = STATUS.ACTION;
        title = "The current structure needs a growth-readiness plan";
        action = "Sequence management capacity, role ownership, decision-right and governance changes before most of the planned growth lands.";
    } else if (growth > 30 || projectedSpanStatus === STATUS.WATCH || projectedSpanStatus === STATUS.NEEDS_INFORMATION) {
        status = STATUS.WATCH;
        title = "Planned growth creates a near-term structural watchpoint";
        action = "Set explicit triggers for when new ownership, manager capacity, or governance changes will be introduced.";
    }

    if (metrics.expansionSignals.length >= 2) {
        status = facts.coordinationFriction === "high" || facts.decisionRights === "unclear" ? STATUS.ACTION : status === STATUS.STABLE ? STATUS.WATCH : status;
        if (status === STATUS.ACTION) title = "Growth and expansion increase current structural pressure";
        else if (status === STATUS.WATCH) title = "Planned growth or expansion creates a structural watchpoint";
    } else if (metrics.expansionSignals.length === 1 && status === STATUS.STABLE) {
        status = STATUS.WATCH;
        title = "Planned expansion should be reflected in the operating model";
    }

    const factsUsed = ["workforce.totalEmployees", "workforce.expectedEmployees12Months", "workforce.expectedHeadcountGrowthPercent"];
    if (projectedSpan !== null) factsUsed.push("organization.peopleManagerCount", "organization.projectedEmployeeToManagerRatioIfManagerCountUnchanged", "organization.managementContextBand");
    if (facts.expansion) factsUsed.push("organization.expansion", "organization.expansionSignals");

    return finding({
        id: "ORG-GROWTH-001", area: "growth-readiness", status, title, factsUsed,
        whyItMatters: `The current input assumes headcount changes from ${facts.employees} to ${facts.expectedEmployees12Months} in 12 months (${growth >= 0 ? "+" : ""}${growth}%).${metrics.expansionSignals.length ? ` The expansion plan also contains ${metrics.expansionSignals.join(", ")} signal${metrics.expansionSignals.length === 1 ? "" : "s"}.` : ""} This is a scenario assumption, not a prediction.`,
        action,
        growthTrigger: "Reassess whenever the 12-month hiring plan, expansion plan or management structure changes materially.",
        confidence: projectedSpanStatus === STATUS.NEEDS_INFORMATION ? CONFIDENCE.MEDIUM : CONFIDENCE.HIGH,
        context: { expansionSignals: metrics.expansionSignals, projectedSpanStatus }
    });
}

function locationComplexity(facts, metrics) {
    if (facts.operatingLocationCount === null) {
        return finding({
            id: "ORG-LOCATION-001", area: "operating-model", status: STATUS.NEEDS_INFORMATION,
            title: "Operating-location complexity needs more information",
            factsUsed: facts.expansion ? ["organization.expansion", "organization.expansionSignals"] : [],
            whyItMatters: "Multiple current or planned operating locations can increase coordination, ownership, and governance requirements.",
            action: "Confirm the number of operating locations.", growthTrigger: "Reassess before opening another location.",
            confidence: CONFIDENCE.LOW, missingFacts: ["geography.operatingLocationCount"]
        });
    }
    const locations = facts.operatingLocationCount;
    const geographicExpansion = metrics.expansionSignals.includes("geography");
    const status = locations >= 4 && geographicExpansion ? STATUS.ACTION : locations >= 4 || geographicExpansion ? STATUS.WATCH : STATUS.STABLE;
    const factsUsed = ["geography.operatingLocationCount"];
    if (facts.expansion) factsUsed.push("organization.expansion", "organization.expansionSignals");
    return finding({
        id: "ORG-LOCATION-001", area: "operating-model", status,
        title: status === STATUS.ACTION ? "Multi-location growth needs explicit local-versus-central design" : status === STATUS.WATCH ? "Location footprint increases coordination complexity" : "Operating-location count is not an immediate structural trigger",
        factsUsed,
        whyItMatters: `${locations} operating location${locations === 1 ? "" : "s"} ${locations === 1 ? "is" : "are"} recorded${geographicExpansion ? ", with further geographic expansion indicated" : ""}. Location growth can create duplicated decisions and unclear local-versus-central ownership if the operating model is not explicit.`,
        action: status === STATUS.STABLE ? "Keep local-versus-central ownership clear as the footprint changes." : "Clarify which decisions are local, which are centralized, who owns cross-location outcomes, and how issues are escalated.",
        growthTrigger: "Reassess before adding another location or materially decentralizing operations.", confidence: CONFIDENCE.HIGH,
        context: { geographicExpansion }
    });
}

function scenarioFor(facts, metrics) {
    const available = facts.expectedEmployees12Months !== null && facts.peopleManagerCount !== null && facts.peopleManagerCount > 0;
    const evidence = sourcesForRule("ORG-SCENARIO-HEADCOUNT-001");
    const projectedRatio = metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged;
    const projectedStatus = available ? contextualSpanStatus(projectedRatio, {
        band: metrics.managementContextBand,
        knownFactors: metrics.managementContextKnownFactors
    }) : STATUS.NEEDS_INFORMATION;
    const assumptions = available ? [
        `Expected headcount: ${facts.expectedEmployees12Months}`,
        `People manager count remains: ${facts.peopleManagerCount}`,
        `Management-context band remains: ${metrics.managementContextBand}`,
        ...(facts.expansion ? [`Expansion assumption: ${facts.expansion}`] : [])
    ] : [];

    const interpretation = !available
        ? "Provide expected 12-month headcount and current manager count to run this structural scenario."
        : projectedStatus === STATUS.ACTION
            ? "Under the supplied assumptions, management capacity moves into a GrowWithHR structural action state for this operating context."
            : projectedStatus === STATUS.WATCH
                ? "Under the supplied assumptions, management capacity becomes a GrowWithHR structural watchpoint for this operating context."
                : projectedStatus === STATUS.NEEDS_INFORMATION
                    ? "The projected span can be calculated, but more management-context information is needed before GrowWithHR classifies the structural pressure."
                    : "Under the supplied assumptions, projected management span does not create a current GrowWithHR structural trigger for this operating context.";

    return {
        id: "ORG-SCENARIO-HEADCOUNT-001",
        ruleId: evidence.ruleId,
        ruleVersion: evidence.ruleVersion,
        name: "12-month headcount with current manager count unchanged",
        type: "conditional-scenario",
        available,
        assumptions,
        projectedEmployeeToManagerRatio: projectedRatio,
        projectedStatus,
        interpretation,
        disclaimer: "This scenario is a deterministic comparison of supplied facts and assumptions. It is not a forecast, prediction, or recommendation about any individual. GrowWithHR prototype guardrails are not published source benchmarks.",
        framework: FRAMEWORK,
        ruleBasis: evidence.ruleBasis,
        ruleLastReviewed: evidence.lastReviewed,
        sources: evidence.sources
    };
}

function statusSummary(findings) {
    const summary = { [STATUS.ACTION]: 0, [STATUS.WATCH]: 0, [STATUS.STABLE]: 0, [STATUS.NEEDS_INFORMATION]: 0 };
    for (const item of findings) {
        if (Object.prototype.hasOwnProperty.call(summary, item.status)) summary[item.status] += 1;
    }
    return summary;
}

function priorityFindings(findings, limit = 3) {
    return [...findings]
        .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
        .slice(0, limit);
}

function executiveSummary(findings, summary) {
    const primary = priorityFindings(findings, 1)[0];
    if (!primary) return "No structural finding is available yet.";
    if (summary[STATUS.ACTION] > 0) {
        return `Your structure has ${summary[STATUS.ACTION]} area${summary[STATUS.ACTION] === 1 ? "" : "s"} requiring action and ${summary[STATUS.WATCH]} watchpoint${summary[STATUS.WATCH] === 1 ? "" : "s"}. The clearest current constraint is ${primary.title.toLowerCase()}.`;
    }
    if (summary[STATUS.WATCH] > 0) {
        return `Your current structure is broadly workable, with ${summary[STATUS.WATCH]} scaling watchpoint${summary[STATUS.WATCH] === 1 ? "" : "s"}. The main area to monitor is ${primary.title.toLowerCase()}.`;
    }
    if (summary[STATUS.NEEDS_INFORMATION] > 0) {
        return `No immediate action trigger is visible from the confirmed facts, but ${summary[STATUS.NEEDS_INFORMATION]} area${summary[STATUS.NEEDS_INFORMATION] === 1 ? " needs" : "s need"} more information before GrowWithHR can classify the structure fully.`;
    }
    return "Your supplied structural facts do not create an immediate GrowWithHR action or watch trigger. Reassess when headcount, reporting lines, locations, work design or decision ownership change materially.";
}

function reportModel(facts, metrics, findings, scenario, missingFacts) {
    const summary = statusSummary(findings);
    const priorities = priorityFindings(findings, 3);
    const primary = priorities[0] || null;
    const uniqueSources = [];
    const seenSources = new Set();
    [...findings, scenario].forEach(item => {
        (item.sources || []).forEach(source => {
            if (seenSources.has(source.id)) return;
            seenSources.add(source.id);
            uniqueSources.push(source);
        });
    });

    return {
        schemaVersion: "1.0",
        reportType: "organization-structure",
        title: "GrowWithHR Organization Structure Report",
        generatedAt: new Date().toISOString(),
        framework: FRAMEWORK,
        company: {
            name: facts.companyName,
            email: facts.email,
            industry: facts.industry,
            growthStage: facts.growthStage
        },
        executiveSummary: executiveSummary(findings, summary),
        statusSummary: summary,
        primaryConstraint: primary ? {
            id: primary.id,
            title: primary.title,
            status: primary.status,
            whyItMatters: primary.whyItMatters,
            action: primary.action,
            ruleVersion: primary.ruleVersion,
            sourceIds: primary.sources.map(source => source.id)
        } : null,
        priorities: priorities.map(item => ({
            id: item.id,
            title: item.title,
            status: item.status,
            action: item.action,
            growthTrigger: item.growthTrigger,
            ruleVersion: item.ruleVersion,
            sourceIds: item.sources.map(source => source.id)
        })),
        metrics: {
            employees: facts.employees,
            peopleManagers: facts.peopleManagerCount,
            currentEmployeeToManagerRatio: metrics.currentEmployeeToManagerRatio,
            expectedEmployees12Months: facts.expectedEmployees12Months,
            expectedHeadcountGrowthPercent: metrics.expectedHeadcountGrowthPercent,
            projectedEmployeeToManagerRatioIfManagerCountUnchanged: metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged,
            managementContextBand: metrics.managementContextBand,
            founderDecisionCategories: metrics.founderDecisionCategories,
            expansionSignals: metrics.expansionSignals
        },
        findingIds: findings.map(item => item.id),
        scenario,
        missingFacts,
        assumptions: [
            "Company facts are treated as current as of the assessment submission time.",
            "The 12-month scenario uses the user's headcount and expansion assumptions and is not a forecast.",
            "Public sources support organization-design principles; GrowWithHR remains responsible for its disclosed deterministic interpretation."
        ],
        confidenceMeaning: "Finding confidence describes fact completeness and the deterministic rule path, not statistical certainty.",
        sources: uniqueSources,
        ruleVersions: Object.fromEntries(findings.map(item => [item.id, item.ruleVersion]))
    };
}

function analyzeOrganizationStructure(input = {}) {
    const facts = normalizeOrganizationInput(input);
    const metrics = derivedMetrics(facts);
    const findings = [
        managementCapacity(facts, metrics),
        founderSpan(facts, metrics),
        reportingArchitecture(facts),
        functionalOwnership(facts),
        roleClarityFinding(facts),
        decisionRightsFinding(facts, metrics),
        governanceFinding(facts),
        coordinationFinding(facts),
        growthReadiness(facts, metrics),
        locationComplexity(facts, metrics)
    ];
    const missingFacts = Array.from(new Set(findings.flatMap(item => item.missingFacts || [])));
    const scenario = scenarioFor(facts, metrics);
    const summary = statusSummary(findings);

    return {
        module: "organization",
        version: "1.2.0-contextual-structure",
        generatedAt: new Date().toISOString(),
        authority: "deterministic-structural-prototype",
        methodology: FRAMEWORK,
        sourceTransparency: {
            publicSourcesVisible: true,
            ruleAndSourceSeparated: true,
            numericPrototypeTriggersDisclosed: true,
            contextualManagementCapacity: true
        },
        facts,
        factRegistry: factMetadata(facts, metrics),
        derivedMetrics: metrics,
        findings,
        statusSummary: summary,
        missingFacts,
        scenario,
        reportModel: reportModel(facts, metrics, findings, scenario, missingFacts),
        boundaries: {
            assessesIndividuals: false,
            legalApplicabilityAuthority: false,
            compensationAssessment: false,
            talentAssessment: false,
            leadershipCapabilityAssessment: false,
            llmDecisionAuthority: false
        }
    };
}

export {
    STATUS,
    CONFIDENCE,
    normalizeOrganizationInput,
    derivedMetrics,
    analyzeOrganizationStructure,
    managementContext,
    contextualSpanStatus,
    founderDecisionCategories,
    expansionSignals
};
export default analyzeOrganizationStructure;
