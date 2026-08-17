import { FRAMEWORK, sourcesForRule } from "./organization-source-registry.mjs";

/**
 * GrowWithHR Organization Structure
 * Deterministic structural analysis only.
 *
 * Public sources support organization-design principles. GrowWithHR owns and
 * discloses the deterministic rules that translate supplied facts into a
 * structural status. Numeric triggers are prototype rules, not universal
 * external benchmarks.
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
    if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
    return text(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function decisionCategoryArray(value) {
    return text(value)
        .split(/[;,\n|]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, index, items) => items.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
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
        expansionType: choice(
            organization.expansionType ?? input.expansionType,
            ["none", "hiring", "new-location", "new-business-line", "acquisition", "mixed", "dont-know"]
        ),
        taskComplexity: choice(
            organization.taskComplexity ?? input.taskComplexity,
            ["standardized", "mixed", "complex", "dont-know"]
        ),
        delegationAbility: choice(
            organization.delegationAbility ?? input.delegationAbility,
            ["high", "mixed", "low", "dont-know"]
        ),
        managerInteraction: choice(
            organization.managerInteraction ?? input.managerInteraction,
            ["low", "mixed", "high", "dont-know"]
        ),
        teamExperience: choice(
            organization.teamExperience ?? input.teamExperience,
            ["experienced", "mixed", "developing", "dont-know"]
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

function contextualSpanThresholds(facts) {
    let watch = 8;
    let action = 12;
    const reasons = [];
    const suppliedFactors = [];

    const apply = (factor, watchDelta, actionDelta, reason) => {
        watch += watchDelta;
        action += actionDelta;
        suppliedFactors.push(factor);
        reasons.push(reason);
    };

    if (facts.taskComplexity === "complex") apply("task-complexity", -1, -2, "complex work narrows the contextual review range");
    if (facts.taskComplexity === "standardized") apply("task-complexity", 1, 1, "more standardized work widens the contextual review range");
    if (facts.taskComplexity === "mixed") suppliedFactors.push("task-complexity");

    if (facts.delegationAbility === "low") apply("delegation", -1, -1, "limited delegation narrows the contextual review range");
    if (facts.delegationAbility === "high") apply("delegation", 1, 1, "strong delegation widens the contextual review range");
    if (facts.delegationAbility === "mixed") suppliedFactors.push("delegation");

    if (facts.managerInteraction === "high") apply("manager-interaction", -1, -2, "high interaction and feedback requirements narrow the contextual review range");
    if (facts.managerInteraction === "low") apply("manager-interaction", 1, 1, "lower routine interaction requirements widen the contextual review range");
    if (facts.managerInteraction === "mixed") suppliedFactors.push("manager-interaction");

    if (facts.teamExperience === "developing") apply("team-experience", -1, -1, "a developing team narrows the contextual review range");
    if (facts.teamExperience === "experienced") apply("team-experience", 1, 1, "an experienced team widens the contextual review range");
    if (facts.teamExperience === "mixed") suppliedFactors.push("team-experience");

    if (facts.operatingLocationCount !== null) {
        suppliedFactors.push("worker-location");
        if (facts.operatingLocationCount >= 4) {
            watch -= 1;
            action -= 1;
            reasons.push("multiple operating locations narrow the contextual review range");
        }
    }

    watch = Math.max(5, Math.min(12, Math.round(watch)));
    action = Math.max(watch + 2, Math.min(16, Math.round(action)));

    return {
        watch,
        action,
        suppliedFactors: Array.from(new Set(suppliedFactors)),
        completeness: Number((Array.from(new Set(suppliedFactors)).length / 5).toFixed(2)),
        reasons
    };
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
    const thresholds = contextualSpanThresholds(facts);

    return {
        currentEmployeeToManagerRatio: currentSpan === null ? null : Number(currentSpan.toFixed(1)),
        expectedHeadcountGrowthPercent: growthPercent === null ? null : Number(growthPercent.toFixed(1)),
        projectedEmployeeToManagerRatioIfManagerCountUnchanged:
            projectedSpan === null ? null : Number(projectedSpan.toFixed(1)),
        departmentCount: facts.departments.length,
        operatingLocationCount: facts.operatingLocationCount,
        founderDecisionCategoryCount: decisionCategoryArray(facts.founderDecisions).length,
        contextualSpanWatchTrigger: thresholds.watch,
        contextualSpanActionTrigger: thresholds.action,
        spanContextCompleteness: thresholds.completeness,
        spanContextFactors: thresholds.suppliedFactors,
        spanContextReasons: thresholds.reasons
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
    confirmed("industry.sector", Boolean(facts.industry));
    confirmed("business.growthStage", Boolean(facts.growthStage));
    confirmed("workforce.totalEmployees", facts.employees !== null);
    confirmed("workforce.expectedEmployees12Months", facts.expectedEmployees12Months !== null);
    confirmed("organization.peopleManagerCount", facts.peopleManagerCount !== null);
    confirmed("organization.reportingLevels", facts.reportingLevels !== null);
    confirmed("organization.founderDirectReports", facts.founderDirectReports !== null);
    confirmed("organization.departments", facts.departments.length > 0);
    confirmed("organization.roleClarity", Boolean(facts.roleClarity) && facts.roleClarity !== "dont-know");
    confirmed("organization.decisionRights", Boolean(facts.decisionRights) && facts.decisionRights !== "dont-know");
    confirmed("organization.governanceCadence", Boolean(facts.governanceCadence) && facts.governanceCadence !== "dont-know");
    confirmed("organization.coordinationFriction", Boolean(facts.coordinationFriction) && facts.coordinationFriction !== "dont-know");
    confirmed("organization.founderDecisions", Boolean(facts.founderDecisions), CONFIDENCE.MEDIUM);
    confirmed("organization.expansion", Boolean(facts.expansion), CONFIDENCE.MEDIUM);
    confirmed("organization.expansionType", Boolean(facts.expansionType) && facts.expansionType !== "dont-know", CONFIDENCE.MEDIUM);
    confirmed("organization.taskComplexity", Boolean(facts.taskComplexity) && facts.taskComplexity !== "dont-know", CONFIDENCE.MEDIUM);
    confirmed("organization.delegationAbility", Boolean(facts.delegationAbility) && facts.delegationAbility !== "dont-know", CONFIDENCE.MEDIUM);
    confirmed("organization.managerInteraction", Boolean(facts.managerInteraction) && facts.managerInteraction !== "dont-know", CONFIDENCE.MEDIUM);
    confirmed("organization.teamExperience", Boolean(facts.teamExperience) && facts.teamExperience !== "dont-know", CONFIDENCE.MEDIUM);
    confirmed("geography.operatingLocationCount", facts.operatingLocationCount !== null);

    derived("organization.currentEmployeeToManagerRatio", metrics.currentEmployeeToManagerRatio !== null, ["workforce.totalEmployees", "organization.peopleManagerCount"]);
    derived("workforce.expectedHeadcountGrowthPercent", metrics.expectedHeadcountGrowthPercent !== null, ["workforce.totalEmployees", "workforce.expectedEmployees12Months"]);
    derived("organization.projectedEmployeeToManagerRatioIfManagerCountUnchanged", metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged !== null, ["workforce.expectedEmployees12Months", "organization.peopleManagerCount"]);
    derived("organization.contextualSpanTriggers", true, ["organization.taskComplexity", "organization.delegationAbility", "organization.managerInteraction", "organization.teamExperience", "geography.operatingLocationCount"]);
    derived("organization.founderDecisionCategoryCount", Boolean(facts.founderDecisions), ["organization.founderDecisions"]);

    return metadata;
}

function finding({ id, area, status, title, factsUsed, whyItMatters, action, growthTrigger, confidence = CONFIDENCE.HIGH, missingFacts = [], assumptions = [] }) {
    const evidence = sourcesForRule(id);
    return {
        id,
        area,
        status,
        title,
        factsUsed,
        whyItMatters,
        action,
        growthTrigger,
        confidence,
        missingFacts,
        assumptions,
        framework: FRAMEWORK,
        ruleBasis: evidence.ruleBasis,
        sources: evidence.sources
    };
}

function statusMax(...statuses) {
    const order = { [STATUS.STABLE]: 0, [STATUS.NEEDS_INFORMATION]: 1, [STATUS.WATCH]: 2, [STATUS.ACTION]: 3 };
    return statuses.filter(Boolean).sort((a, b) => order[b] - order[a])[0] || STATUS.STABLE;
}

function managementCapacity(facts, metrics) {
    if (facts.employees === null) {
        return finding({
            id: "ORG-CAPACITY-001", area: "management-capacity", status: STATUS.NEEDS_INFORMATION,
            title: "Management capacity needs more information", factsUsed: [],
            whyItMatters: "Headcount is needed to compare management capacity with the size of the organization.",
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
    const status = ratio > metrics.contextualSpanActionTrigger
        ? STATUS.ACTION
        : ratio > metrics.contextualSpanWatchTrigger
            ? STATUS.WATCH
            : STATUS.STABLE;
    const contextFacts = [
        [facts.taskComplexity, "organization.taskComplexity"],
        [facts.delegationAbility, "organization.delegationAbility"],
        [facts.managerInteraction, "organization.managerInteraction"],
        [facts.teamExperience, "organization.teamExperience"]
    ].filter(([value]) => value && value !== "dont-know").map(([, key]) => key);
    const contextText = metrics.spanContextReasons.length
        ? ` Context adjustments: ${metrics.spanContextReasons.join("; ")}.`
        : " No contextual adjustment was applied because the supplied factors were neutral or unknown.";

    return finding({
        id: "ORG-CAPACITY-001", area: "management-capacity", status,
        title: status === STATUS.ACTION ? "Management span may constrain capacity" : status === STATUS.WATCH ? "Management span should be watched as the company grows" : "Current management span is within the current contextual review range",
        factsUsed: ["workforce.totalEmployees", "organization.peopleManagerCount", "organization.currentEmployeeToManagerRatio", ...contextFacts, ...(facts.operatingLocationCount !== null ? ["geography.operatingLocationCount"] : [])],
        whyItMatters: `The current employee-to-manager ratio is approximately ${ratio}:1. GrowWithHR's current contextual watch trigger is ${metrics.contextualSpanWatchTrigger}:1 and action trigger is ${metrics.contextualSpanActionTrigger}:1.${contextText} These are disclosed prototype triggers, not judgments of manager capability or published universal benchmarks.`,
        action: status === STATUS.STABLE ? "Keep spans visible and reassess when work complexity, team experience, delegation or operating footprint changes." : "Review team boundaries, delegation, manager interaction load and where day-to-day ownership should sit before increasing complexity.",
        growthTrigger: "Reassess after material hiring, a new function, a change in team experience, or a new operating location.",
        confidence: metrics.spanContextCompleteness >= 0.6 ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM,
        assumptions: ["GrowWithHR contextual span thresholds are prototype rules and are not external benchmarks."]
    });
}

function founderSpan(facts, metrics) {
    const hasDirect = facts.founderDirectReports !== null;
    const decisionCount = metrics.founderDecisionCategoryCount;
    const hasDecisionDetail = decisionCount > 0;
    if (!hasDirect && !hasDecisionDetail) {
        return finding({
            id: "ORG-FOUNDER-001", area: "founder-dependency", status: STATUS.NEEDS_INFORMATION,
            title: "Founder coordination load needs more information", factsUsed: [],
            whyItMatters: "Founder/CEO direct reports and recurring founder-dependent decisions help show how concentrated cross-company coordination is.",
            action: "Confirm founder/CEO direct reports and list important recurring decisions that still require founder/CEO approval.",
            growthTrigger: "Reassess before adding another function, location or leadership layer.",
            confidence: CONFIDENCE.LOW, missingFacts: ["organization.founderDirectReports", "organization.founderDecisions"]
        });
    }

    const directStatus = hasDirect
        ? facts.founderDirectReports > 10 ? STATUS.ACTION : facts.founderDirectReports > 7 ? STATUS.WATCH : STATUS.STABLE
        : null;
    const decisionStatus = hasDecisionDetail
        ? decisionCount >= 5 ? STATUS.ACTION : decisionCount >= 3 ? STATUS.WATCH : STATUS.STABLE
        : null;
    const status = statusMax(directStatus, decisionStatus);
    const factsUsed = [
        ...(hasDirect ? ["organization.founderDirectReports"] : []),
        ...(hasDecisionDetail ? ["organization.founderDecisions", "organization.founderDecisionCategoryCount"] : [])
    ];
    const directText = hasDirect ? `${facts.founderDirectReports} direct reports` : "direct-report count not supplied";
    const decisionText = hasDecisionDetail ? `${decisionCount} founder-dependent decision categor${decisionCount === 1 ? "y" : "ies"} recorded` : "no founder-dependent decision categories recorded";

    return finding({
        id: "ORG-FOUNDER-001", area: "founder-dependency", status,
        title: status === STATUS.ACTION ? "Founder coordination and decision dependency are highly concentrated" : status === STATUS.WATCH ? "Founder dependency is becoming a scaling watchpoint" : "Founder dependency is not an immediate structural trigger",
        factsUsed,
        whyItMatters: `GrowWithHR sees ${directText} and ${decisionText}. Concentrated reporting and recurring approvals can centralize coordination and slow routine decisions as complexity rises.`,
        action: status === STATUS.STABLE ? "Keep functional ownership and delegated decision boundaries explicit as new teams are added." : "Identify which recurring approvals and functional outcomes can move to clearly accountable owners without routine founder escalation.",
        growthTrigger: "Reassess when another function, location, senior owner or recurring approval category is added.",
        confidence: hasDirect && hasDecisionDetail ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM,
        assumptions: ["Founder direct-report and decision-category counts are GrowWithHR prototype concentration signals, not published limits."]
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
        action = "Document reporting relationships and define the conditions that would justify a formal management layer.";
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
            whyItMatters: "Named functions or equivalent ownership boundaries make responsibility visible and reduce ambiguity as work becomes more specialized.",
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
            title: "Decision rights need more information", factsUsed: metrics.founderDecisionCategoryCount ? ["organization.founderDecisions"] : [],
            whyItMatters: "Explicit decision rights help routine choices happen at the right level and reduce avoidable escalation.",
            action: "Confirm whether recurring decision ownership is generally clear, mixed, or unclear.",
            growthTrigger: "Reassess when new leaders, functions, or approval thresholds are introduced.",
            confidence: CONFIDENCE.LOW, missingFacts: ["organization.decisionRights"]
        });
    }
    let status = facts.decisionRights === "unclear" ? STATUS.ACTION : facts.decisionRights === "mixed" ? STATUS.WATCH : STATUS.STABLE;
    if (facts.decisionRights === "clear" && metrics.founderDecisionCategoryCount >= 3) status = STATUS.WATCH;
    const title = status === STATUS.ACTION
        ? "Decision ownership is a structural bottleneck"
        : status === STATUS.WATCH
            ? "Decision ownership has a scaling watchpoint"
            : "Decision ownership is reported as clear";
    const action = status === STATUS.STABLE
        ? "Keep major recurring decisions mapped to accountable roles."
        : "Map recurring commercial, people, operating and spending decisions to a clear accountable owner, including the founder-dependent decisions already listed.";
    return finding({
        id: "ORG-DECISIONS-001", area: "decision-rights", status, title,
        factsUsed: ["organization.decisionRights", ...(metrics.founderDecisionCategoryCount ? ["organization.founderDecisions"] : [])],
        whyItMatters: metrics.founderDecisionCategoryCount >= 3 && facts.decisionRights === "clear"
            ? `Decision ownership was reported as clear, but ${metrics.founderDecisionCategoryCount} important decision categories were also listed as founder-dependent. GrowWithHR treats that inconsistency as a watchpoint.`
            : "Explicit decision rights help routine choices happen at the right level and reduce avoidable escalation.",
        action, growthTrigger: "Reassess when new leaders, functions, or approval thresholds are introduced.", confidence: CONFIDENCE.MEDIUM
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
    const expansionSignal = facts.expansionType && !["none", "dont-know"].includes(facts.expansionType);
    if (facts.employees === null || (facts.expectedEmployees12Months === null && !expansionSignal)) {
        const missingFacts = [];
        if (facts.employees === null) missingFacts.push("workforce.totalEmployees");
        if (facts.expectedEmployees12Months === null) missingFacts.push("workforce.expectedEmployees12Months");
        if (!facts.expansionType || facts.expansionType === "dont-know") missingFacts.push("organization.expansionType");
        return finding({
            id: "ORG-GROWTH-001", area: "growth-readiness", status: STATUS.NEEDS_INFORMATION,
            title: "Growth-readiness scenario needs more information", factsUsed: [],
            whyItMatters: "A 12-month headcount assumption or a defined expansion plan helps test whether the current structure may face predictable capacity pressure.",
            action: "Confirm current headcount and either a reasonable 12-month headcount assumption or the primary expansion type.",
            growthTrigger: "Reassess when the hiring or expansion plan changes materially.", confidence: CONFIDENCE.LOW, missingFacts
        });
    }

    const growth = metrics.expectedHeadcountGrowthPercent;
    const projectedSpan = metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged;
    let status = expansionSignal ? STATUS.WATCH : STATUS.STABLE;
    let title = expansionSignal ? "Planned expansion creates a structural watchpoint" : "Planned headcount does not create an immediate structural trigger";
    let action = expansionSignal
        ? "Define ownership, management capacity and governance triggers before the planned expansion adds operating complexity."
        : "Keep structure and management capacity aligned with the hiring plan.";

    if (
        (growth !== null && growth > 50) ||
        (projectedSpan !== null && projectedSpan > metrics.contextualSpanActionTrigger)
    ) {
        status = STATUS.ACTION;
        title = "The current structure needs a growth-readiness plan";
        action = "Sequence management capacity, role ownership, decision-right and governance changes before most of the planned growth lands.";
    } else if (
        (growth !== null && growth > 30) ||
        (projectedSpan !== null && projectedSpan > metrics.contextualSpanWatchTrigger)
    ) {
        status = statusMax(status, STATUS.WATCH);
        title = "Planned growth creates a near-term structural watchpoint";
        action = "Set explicit triggers for when new ownership, manager capacity or governance changes will be introduced.";
    }

    const growthText = facts.expectedEmployees12Months !== null && growth !== null
        ? `The current input assumes headcount changes from ${facts.employees} to ${facts.expectedEmployees12Months} in 12 months (${growth >= 0 ? "+" : ""}${growth}%).`
        : "No numeric 12-month headcount assumption was supplied.";
    const expansionText = expansionSignal
        ? ` The declared expansion type is ${facts.expansionType.replace(/-/g, " ")}${facts.expansion ? ` (${facts.expansion})` : ""}.`
        : "";

    return finding({
        id: "ORG-GROWTH-001", area: "growth-readiness", status, title,
        factsUsed: [
            "workforce.totalEmployees",
            ...(facts.expectedEmployees12Months !== null ? ["workforce.expectedEmployees12Months", "workforce.expectedHeadcountGrowthPercent"] : []),
            ...(facts.expansionType ? ["organization.expansionType"] : []),
            ...(facts.expansion ? ["organization.expansion"] : []),
            ...(projectedSpan !== null ? ["organization.peopleManagerCount", "organization.projectedEmployeeToManagerRatioIfManagerCountUnchanged"] : [])
        ],
        whyItMatters: `${growthText}${expansionText} This is a planning scenario, not a prediction.`,
        action, growthTrigger: "Reassess whenever the 12-month hiring plan, expansion plan or management structure changes materially.", confidence: CONFIDENCE.HIGH,
        assumptions: ["Expansion type is user-supplied and is treated as a structural complexity signal, not a forecast of business outcomes."]
    });
}

function locationComplexity(facts) {
    if (facts.operatingLocationCount === null) {
        return finding({
            id: "ORG-LOCATION-001", area: "operating-model", status: STATUS.NEEDS_INFORMATION,
            title: "Operating-location complexity needs more information", factsUsed: [],
            whyItMatters: "Multiple operating locations usually increase coordination, ownership, and governance requirements.",
            action: "Confirm the number of operating locations.", growthTrigger: "Reassess before opening another location.",
            confidence: CONFIDENCE.LOW, missingFacts: ["geography.operatingLocationCount"]
        });
    }
    const locations = facts.operatingLocationCount;
    const status = locations >= 4 ? STATUS.WATCH : STATUS.STABLE;
    return finding({
        id: "ORG-LOCATION-001", area: "operating-model", status,
        title: status === STATUS.WATCH ? "Multi-location operations increase coordination complexity" : "Operating-location count is not an immediate structural trigger",
        factsUsed: ["geography.operatingLocationCount"],
        whyItMatters: `${locations} operating location${locations === 1 ? "" : "s"} were recorded. Location growth can create duplicated decisions and unclear local-versus-central ownership if the operating model is not explicit.`,
        action: status === STATUS.STABLE ? "Keep local-versus-central ownership clear as the footprint changes." : "Clarify which decisions are local, which are centralized, and how cross-location issues are escalated.",
        growthTrigger: "Reassess before adding another location or materially decentralizing operations.", confidence: CONFIDENCE.HIGH
    });
}

function scenarioFor(facts, metrics) {
    const available = facts.expectedEmployees12Months !== null && facts.peopleManagerCount !== null && facts.peopleManagerCount > 0;
    const evidence = sourcesForRule("ORG-SCENARIO-HEADCOUNT-001");
    const projected = metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged;
    return {
        id: "ORG-SCENARIO-HEADCOUNT-001",
        name: "12-month headcount with current manager count unchanged",
        type: "conditional-scenario",
        available,
        assumptions: available ? [
            `Expected headcount: ${facts.expectedEmployees12Months}`,
            `People manager count remains: ${facts.peopleManagerCount}`,
            `GrowWithHR contextual watch/action triggers remain ${metrics.contextualSpanWatchTrigger}:1 / ${metrics.contextualSpanActionTrigger}:1 unless the structural context changes.`
        ] : [],
        projectedEmployeeToManagerRatio: projected,
        contextualWatchTrigger: metrics.contextualSpanWatchTrigger,
        contextualActionTrigger: metrics.contextualSpanActionTrigger,
        interpretation: !available
            ? "Provide expected 12-month headcount and current manager count to run this structural scenario."
            : projected > metrics.contextualSpanActionTrigger
                ? "Under this assumption, management span becomes a GrowWithHR structural action trigger."
                : projected > metrics.contextualSpanWatchTrigger
                    ? "Under this assumption, management span becomes a GrowWithHR structural watchpoint."
                    : "Under this assumption, management span does not trigger the current GrowWithHR contextual prototype thresholds.",
        disclaimer: "This scenario is a deterministic comparison of supplied facts. It is not a forecast, prediction, or recommendation about any individual. Numeric triggers and contextual adjustments are GrowWithHR prototype rules, not published source benchmarks.",
        framework: FRAMEWORK,
        ruleBasis: evidence.ruleBasis,
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

function buildReportContract(facts, metrics, findings, summary, scenario) {
    const ordered = [...findings].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
    const primary = ordered[0] || null;
    const priorities = ordered.filter((item) => item.status !== STATUS.STABLE).slice(0, 3);
    const finalPriorities = priorities.length ? priorities : ordered.slice(0, 3);
    const actionCount = summary[STATUS.ACTION] || 0;
    const watchCount = summary[STATUS.WATCH] || 0;
    const needsInfoCount = summary[STATUS.NEEDS_INFORMATION] || 0;
    const executiveSummary = primary
        ? actionCount > 0
            ? `Your structure has ${actionCount} area${actionCount === 1 ? "" : "s"} requiring action and ${watchCount} watchpoint${watchCount === 1 ? "" : "s"}. The clearest current constraint is ${primary.title.toLowerCase()}.`
            : watchCount > 0
                ? `Your current structure is broadly workable, with ${watchCount} scaling watchpoint${watchCount === 1 ? "" : "s"}. The main area to monitor is ${primary.title.toLowerCase()}.`
                : needsInfoCount > 0
                    ? `No immediate action trigger was identified, but ${needsInfoCount} area${needsInfoCount === 1 ? "" : "s"} need more information before GrowWithHR can complete the structural view.`
                    : "Your supplied structural facts do not create an immediate GrowWithHR action or watch trigger. Reassess when headcount, reporting lines, locations or decision ownership change materially."
        : "No structural finding is available yet.";

    return Object.freeze({
        schemaVersion: "1.0.0",
        reportType: "organization-structure",
        frameworkId: FRAMEWORK.id,
        frameworkVersion: FRAMEWORK.version,
        companyName: facts.companyName,
        executiveSummary,
        statusSummary: summary,
        primaryConstraintId: primary?.id || "",
        priorityFindingIds: finalPriorities.map((item) => item.id),
        metrics: {
            employees: facts.employees,
            peopleManagers: facts.peopleManagerCount,
            currentEmployeeToManagerRatio: metrics.currentEmployeeToManagerRatio,
            plannedHeadcount12Months: facts.expectedEmployees12Months,
            contextualSpanWatchTrigger: metrics.contextualSpanWatchTrigger,
            contextualSpanActionTrigger: metrics.contextualSpanActionTrigger
        },
        findingIds: findings.map((item) => item.id),
        scenarioId: scenario.id,
        assumptions: scenario.assumptions || []
    });
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
        locationComplexity(facts)
    ];
    const missingFacts = Array.from(new Set(findings.flatMap((item) => item.missingFacts || [])));
    const summary = statusSummary(findings);
    const scenario = scenarioFor(facts, metrics);
    const reportContract = buildReportContract(facts, metrics, findings, summary, scenario);

    return {
        module: "organization",
        version: "1.2.0-contextual-source-traceability",
        generatedAt: new Date().toISOString(),
        authority: "deterministic-structural-prototype",
        methodology: FRAMEWORK,
        sourceTransparency: {
            publicSourcesVisible: true,
            ruleAndSourceSeparated: true,
            numericPrototypeTriggersDisclosed: true,
            contextualSpanFactorsVisible: true
        },
        facts,
        factRegistry: factMetadata(facts, metrics),
        derivedMetrics: metrics,
        findings,
        statusSummary: summary,
        missingFacts,
        scenario,
        report: reportContract,
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
    contextualSpanThresholds,
    derivedMetrics,
    analyzeOrganizationStructure
};
export default analyzeOrganizationStructure;
