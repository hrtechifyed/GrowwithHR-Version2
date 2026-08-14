/**
 * GrowWithHR Organization Intelligence v1
 *
 * Deterministic structural analysis only. This module does not assess
 * individuals, legal applicability, compensation, leadership capability,
 * or talent capability.
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

    return {
        currentEmployeeToManagerRatio: currentSpan === null ? null : Number(currentSpan.toFixed(1)),
        expectedHeadcountGrowthPercent: growthPercent === null ? null : Number(growthPercent.toFixed(1)),
        projectedEmployeeToManagerRatioIfManagerCountUnchanged:
            projectedSpan === null ? null : Number(projectedSpan.toFixed(1)),
        departmentCount: facts.departments.length,
        operatingLocationCount: facts.operatingLocationCount
    };
}

function factMetadata(facts, metrics) {
    const capturedAt = facts.confirmedAt;
    const metadata = {};
    const confirmed = (key, isPresent, confidence = CONFIDENCE.HIGH) => {
        metadata[key] = {
            status: isPresent ? "confirmed" : "missing",
            source: "organization-intelligence",
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
    confirmed("geography.operatingLocationCount", facts.operatingLocationCount !== null);

    derived(
        "organization.currentEmployeeToManagerRatio",
        metrics.currentEmployeeToManagerRatio !== null,
        ["workforce.totalEmployees", "organization.peopleManagerCount"]
    );
    derived(
        "workforce.expectedHeadcountGrowthPercent",
        metrics.expectedHeadcountGrowthPercent !== null,
        ["workforce.totalEmployees", "workforce.expectedEmployees12Months"]
    );
    derived(
        "organization.projectedEmployeeToManagerRatioIfManagerCountUnchanged",
        metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged !== null,
        ["workforce.expectedEmployees12Months", "organization.peopleManagerCount"]
    );

    return metadata;
}

function finding({ id, area, status, title, factsUsed, whyItMatters, action, growthTrigger, confidence = CONFIDENCE.HIGH, missingFacts = [] }) {
    return { id, area, status, title, factsUsed, whyItMatters, action, growthTrigger, confidence, missingFacts };
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
            action: status === STATUS.STABLE
                ? "Keep manager ownership explicit and reassess before adding significant headcount."
                : "Define the next layer of people-management ownership before growth increases the coordination load.",
            growthTrigger: "Reassess when the organization adds another team or approaches the next hiring wave.",
            confidence: CONFIDENCE.HIGH
        });
    }
    const ratio = metrics.currentEmployeeToManagerRatio;
    const status = ratio > 12 ? STATUS.ACTION : ratio > 8 ? STATUS.WATCH : STATUS.STABLE;
    return finding({
        id: "ORG-CAPACITY-001", area: "management-capacity", status,
        title: status === STATUS.ACTION ? "Management span may constrain capacity" : status === STATUS.WATCH ? "Management span should be watched as the company grows" : "Current management span is structurally manageable",
        factsUsed: ["workforce.totalEmployees", "organization.peopleManagerCount", "organization.currentEmployeeToManagerRatio"],
        whyItMatters: `The current employee-to-manager ratio is approximately ${ratio}:1. This is a structural capacity signal, not a judgment of any manager's capability.`,
        action: status === STATUS.STABLE ? "Keep spans visible and reassess when teams or operating complexity change." : "Review team boundaries, manager capacity, and where day-to-day ownership should sit.",
        growthTrigger: "Reassess after material hiring, a new function, or a new operating location.",
        confidence: CONFIDENCE.HIGH
    });
}

function founderSpan(facts) {
    if (facts.founderDirectReports === null) {
        return finding({
            id: "ORG-FOUNDER-001", area: "founder-dependency", status: STATUS.NEEDS_INFORMATION,
            title: "Founder coordination load needs more information", factsUsed: [],
            whyItMatters: "Founder/CEO direct-report count helps show how concentrated cross-company coordination is.",
            action: "Confirm the number of direct reports to the founder/CEO.",
            growthTrigger: "Reassess before adding another function or leadership layer.",
            confidence: CONFIDENCE.LOW, missingFacts: ["organization.founderDirectReports"]
        });
    }
    const direct = facts.founderDirectReports;
    const status = direct > 10 ? STATUS.ACTION : direct > 7 ? STATUS.WATCH : STATUS.STABLE;
    return finding({
        id: "ORG-FOUNDER-001", area: "founder-dependency", status,
        title: status === STATUS.ACTION ? "Founder coordination path is highly concentrated" : status === STATUS.WATCH ? "Founder direct-report load is becoming a scaling watchpoint" : "Founder direct-report load is not an immediate structural trigger",
        factsUsed: ["organization.founderDirectReports"],
        whyItMatters: `The founder/CEO has ${direct} recorded direct reports. A larger direct-report span can centralize coordination and slow decisions as the organization becomes more complex.`,
        action: status === STATUS.STABLE ? "Keep functional ownership explicit as new teams are added." : "Review which functional owners can hold clear end-to-end accountability without routine founder escalation.",
        growthTrigger: "Reassess when another function, location, or senior owner is added.",
        confidence: CONFIDENCE.HIGH
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
            whyItMatters: "Named functions or departments make responsibility boundaries visible and reduce ambiguity as work becomes more specialized.",
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

function decisionRightsFinding(facts) {
    return qualitativeFinding({
        id: "ORG-DECISIONS-001", area: "decision-rights", value: facts.decisionRights,
        factKey: "organization.decisionRights", missingTitle: "Decision rights need more information",
        why: "Explicit decision rights help routine choices happen at the right level and reduce avoidable escalation.",
        labels: {
            clear: { status: STATUS.STABLE, title: "Decision ownership is reported as clear" },
            mixed: { status: STATUS.WATCH, title: "Decision ownership is inconsistent" },
            unclear: { status: STATUS.ACTION, title: "Decision ownership is a structural bottleneck" }
        },
        actions: {
            clear: "Keep major recurring decisions mapped to accountable roles.",
            mixed: "Identify the recurring decisions that still bounce between roles and assign a clear owner.",
            unclear: "Create a simple decision-rights map for recurring commercial, people, operating, and spending decisions.",
            missing: "Confirm whether recurring decision ownership is generally clear, mixed, or unclear."
        },
        trigger: "Reassess when new leaders, functions, or approval thresholds are introduced."
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
        growthTrigger: "Increase the cadence when the number of teams, locations, or interdependencies rises.", confidence: CONFIDENCE.MEDIUM
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
            title: "Growth-readiness scenario needs more information", factsUsed: [],
            whyItMatters: "A 12-month headcount assumption helps test whether the current structure is likely to face predictable capacity pressure.",
            action: "Confirm current headcount and a reasonable 12-month headcount assumption.",
            growthTrigger: "Reassess when the hiring plan changes materially.", confidence: CONFIDENCE.LOW, missingFacts
        });
    }
    const growth = metrics.expectedHeadcountGrowthPercent;
    const projectedSpan = metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged;
    let status = STATUS.STABLE;
    let title = "Planned headcount does not create an immediate structural trigger";
    let action = "Keep structure and management capacity aligned with the hiring plan.";
    if (growth > 50 || (projectedSpan !== null && projectedSpan > 12)) {
        status = STATUS.ACTION; title = "The current structure needs a growth-readiness plan";
        action = "Sequence management capacity, role ownership, and decision-right changes before most of the planned hiring lands.";
    } else if (growth > 30 || (projectedSpan !== null && projectedSpan > 8)) {
        status = STATUS.WATCH; title = "Planned growth creates a near-term structural watchpoint";
        action = "Set explicit triggers for when new ownership, manager capacity, or governance changes will be introduced.";
    }
    return finding({
        id: "ORG-GROWTH-001", area: "growth-readiness", status, title,
        factsUsed: [
            "workforce.totalEmployees", "workforce.expectedEmployees12Months", "workforce.expectedHeadcountGrowthPercent",
            ...(projectedSpan !== null ? ["organization.peopleManagerCount", "organization.projectedEmployeeToManagerRatioIfManagerCountUnchanged"] : [])
        ],
        whyItMatters: `The current input assumes headcount changes from ${facts.employees} to ${facts.expectedEmployees12Months} in 12 months (${growth >= 0 ? "+" : ""}${growth}%). This is a scenario assumption, not a prediction.`,
        action, growthTrigger: "Reassess whenever the 12-month hiring plan or management structure changes materially.", confidence: CONFIDENCE.HIGH
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
    return {
        id: "ORG-SCENARIO-HEADCOUNT-001",
        name: "12-month headcount with current manager count unchanged",
        type: "conditional-scenario",
        available,
        assumptions: available ? [`Expected headcount: ${facts.expectedEmployees12Months}`, `People manager count remains: ${facts.peopleManagerCount}`] : [],
        projectedEmployeeToManagerRatio: metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged,
        interpretation: !available
            ? "Provide expected 12-month headcount and current manager count to run this structural scenario."
            : metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged > 12
                ? "Under this assumption, management span becomes a structural action trigger."
                : metrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged > 8
                    ? "Under this assumption, management span becomes a structural watchpoint."
                    : "Under this assumption, management span does not trigger the current prototype thresholds.",
        disclaimer: "This scenario is a deterministic comparison of supplied facts. It is not a forecast, prediction, or recommendation about any individual."
    };
}

function statusSummary(findings) {
    const summary = { [STATUS.ACTION]: 0, [STATUS.WATCH]: 0, [STATUS.STABLE]: 0, [STATUS.NEEDS_INFORMATION]: 0 };
    for (const item of findings) {
        if (Object.prototype.hasOwnProperty.call(summary, item.status)) summary[item.status] += 1;
    }
    return summary;
}

function analyzeOrganizationStructure(input = {}) {
    const facts = normalizeOrganizationInput(input);
    const metrics = derivedMetrics(facts);
    const findings = [
        managementCapacity(facts, metrics), founderSpan(facts), reportingArchitecture(facts), functionalOwnership(facts),
        roleClarityFinding(facts), decisionRightsFinding(facts), governanceFinding(facts), coordinationFinding(facts),
        growthReadiness(facts, metrics), locationComplexity(facts)
    ];
    const missingFacts = Array.from(new Set(findings.flatMap(item => item.missingFacts || [])));

    return {
        module: "organization",
        version: "1.0.0-structured",
        generatedAt: new Date().toISOString(),
        authority: "deterministic-structural-prototype",
        facts,
        factRegistry: factMetadata(facts, metrics),
        derivedMetrics: metrics,
        findings,
        statusSummary: statusSummary(findings),
        missingFacts,
        scenario: scenarioFor(facts, metrics),
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

export { STATUS, CONFIDENCE, normalizeOrganizationInput, derivedMetrics, analyzeOrganizationStructure };
export default analyzeOrganizationStructure;
