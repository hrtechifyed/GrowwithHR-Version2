import assert from "node:assert/strict";
import fs from "node:fs";

import {
    analyzeOrganizationStructure,
    normalizeOrganizationInput
} from "../js/modules/organization/organization-structure-engine.mjs";

function hasKeyDeep(value, key) {
    if (!value || typeof value !== "object") return false;
    if (Object.prototype.hasOwnProperty.call(value, key)) return true;
    return Object.values(value).some(item => hasKeyDeep(item, key));
}

function assertSourceTraceability(analysis) {
    assert.equal(analysis.sourceTransparency.publicSourcesVisible, true);
    assert.equal(analysis.sourceTransparency.ruleAndSourceSeparated, true);
    assert.equal(analysis.sourceTransparency.contextualSpanFactorsVisible, true);
    assert.ok(analysis.methodology?.name?.includes("Organization Structure Assessment Framework"));
    for (const item of analysis.findings) {
        assert.equal(typeof item.ruleBasis, "string", `${item.id} must expose its GrowWithHR rule basis.`);
        assert.ok(item.ruleBasis.length > 20, `${item.id} must explain the GrowWithHR rule.`);
        assert.ok(Array.isArray(item.sources) && item.sources.length > 0, `${item.id} must expose at least one public source.`);
        for (const source of item.sources) {
            assert.match(source.url, /^https:\/\//, `${item.id} source must be directly linkable.`);
            assert.ok(source.title && source.publisher && source.supports, `${item.id} source metadata must be complete.`);
            assert.match(source.access, /free public/i, `${item.id} source must be publicly accessible without a paid framework dependency.`);
            assert.ok(source.reviewedAt, `${item.id} source must record when GrowWithHR last reviewed it.`);
        }
    }
    assert.ok(Array.isArray(analysis.scenario.sources) && analysis.scenario.sources.length > 0);
    assert.match(analysis.scenario.ruleBasis, /scenario/i);
}

const stable = analyzeOrganizationStructure({
    shared: {
        companyName: "Stable Services",
        email: "stable@example.com",
        industry: "Professional Services",
        growthStage: "Growth",
        employees: 8,
        expectedEmployees: 10
    },
    workforce: {
        totalEmployees: 8,
        expectedEmployees12Months: 10
    },
    geography: {
        operatingLocationCount: 1
    },
    organization: {
        peopleManagerCount: 1,
        reportingLevels: 1,
        founderDirectReports: 3,
        departments: ["Sales", "Delivery", "Finance", "People"],
        taskComplexity: "mixed",
        delegationAbility: "mixed",
        managerInteraction: "mixed",
        teamExperience: "mixed",
        roleClarity: "clear",
        decisionRights: "clear",
        governanceCadence: "weekly",
        coordinationFriction: "low",
        expansionType: "none",
        confirmedAt: "2026-08-14T10:00:00.000Z"
    }
});

assert.equal(stable.module, "organization");
assert.equal(stable.authority, "deterministic-structural-prototype");
assert.equal(hasKeyDeep(stable, "score"), false, "Organization Structure must not expose an arbitrary maturity score.");
assert.equal(stable.boundaries.assessesIndividuals, false);
assert.equal(stable.boundaries.legalApplicabilityAuthority, false);
assert.equal(stable.boundaries.llmDecisionAuthority, false);
assert.equal(stable.derivedMetrics.currentEmployeeToManagerRatio, 8);
assert.equal(stable.derivedMetrics.expectedHeadcountGrowthPercent, 25);
assert.equal(stable.scenario.available, true);
assert.match(stable.scenario.disclaimer, /not a forecast/i);
assert.ok(stable.findings.every(item => Array.isArray(item.factsUsed)));
assert.ok(stable.findings.every(item => Array.isArray(item.missingFacts)));
assert.ok(stable.findings.every(item => ["stable", "watch", "action", "needs-information"].includes(item.status)));
assert.equal(stable.report.reportType, "organization-structure");
assert.ok(stable.report.executiveSummary);
assertSourceTraceability(stable);

const pressure = analyzeOrganizationStructure({
    shared: {
        companyName: "Scaling Company",
        email: "scale@example.com",
        industry: "Technology",
        employees: 60,
        expectedEmployees: 120
    },
    workforce: {
        totalEmployees: 60,
        expectedEmployees12Months: 120
    },
    geography: {
        operatingLocationCount: 5
    },
    organization: {
        peopleManagerCount: 3,
        reportingLevels: 0,
        founderDirectReports: 12,
        departments: ["Product", "Commercial"],
        taskComplexity: "complex",
        delegationAbility: "low",
        managerInteraction: "high",
        teamExperience: "developing",
        roleClarity: "unclear",
        decisionRights: "mixed",
        governanceCadence: "none",
        coordinationFriction: "high",
        founderDecisions: "senior hiring, pricing, major spend, compensation, customer exceptions",
        expansionType: "mixed",
        expansion: "New location and rapid hiring",
        confirmedAt: "2026-08-14T10:00:00.000Z"
    }
});

const pressureById = Object.fromEntries(
    pressure.findings.map(item => [item.id, item])
);

assert.equal(pressure.derivedMetrics.currentEmployeeToManagerRatio, 20);
assert.equal(pressure.derivedMetrics.projectedEmployeeToManagerRatioIfManagerCountUnchanged, 40);
assert.equal(pressureById["ORG-CAPACITY-001"].status, "action");
assert.equal(pressureById["ORG-FOUNDER-001"].status, "action");
assert.equal(pressureById["ORG-REPORTING-001"].status, "action");
assert.equal(pressureById["ORG-CLARITY-001"].status, "action");
assert.equal(pressureById["ORG-DECISIONS-001"].status, "watch");
assert.equal(pressureById["ORG-GOVERNANCE-001"].status, "action");
assert.equal(pressureById["ORG-COORDINATION-001"].status, "action");
assert.equal(pressureById["ORG-GROWTH-001"].status, "action");
assert.equal(pressureById["ORG-LOCATION-001"].status, "watch");
assert.ok(pressure.statusSummary.action >= 6);
assert.match(pressureById["ORG-CAPACITY-001"].ruleBasis, /prototype/i);
assert.ok(pressure.derivedMetrics.contextualSpanWatchTrigger < stable.derivedMetrics.contextualSpanWatchTrigger);
assertSourceTraceability(pressure);

const missing = analyzeOrganizationStructure({
    shared: {
        companyName: "Unknown Structure",
        email: "unknown@example.com",
        industry: "Other",
        employees: 18
    },
    workforce: {
        totalEmployees: 18
    },
    organization: {
        roleClarity: "dont-know",
        decisionRights: "dont-know",
        governanceCadence: "dont-know",
        coordinationFriction: "dont-know",
        taskComplexity: "dont-know",
        delegationAbility: "dont-know",
        managerInteraction: "dont-know",
        teamExperience: "dont-know",
        expansionType: "dont-know"
    }
});

assert.equal(missing.scenario.available, false);
assert.ok(missing.missingFacts.includes("organization.peopleManagerCount"));
assert.ok(missing.missingFacts.includes("organization.founderDirectReports"));
assert.ok(missing.missingFacts.includes("organization.roleClarity"));
assert.ok(missing.missingFacts.includes("organization.decisionRights"));
assert.ok(missing.missingFacts.includes("workforce.expectedEmployees12Months"));
assert.ok(missing.statusSummary["needs-information"] >= 5);
assertSourceTraceability(missing);

const normalized = normalizeOrganizationInput({
    shared: { employees: 20 },
    organization: {
        managerCount: "",
        departments: "Sales, Product, Finance",
        locations: 2,
        taskComplexity: "complex",
        expansionType: "new-location"
    }
});
assert.equal(normalized.peopleManagerCount, null);
assert.deepEqual(normalized.departments, ["Sales", "Product", "Finance"]);
assert.equal(normalized.operatingLocationCount, 2);
assert.equal(normalized.taskComplexity, "complex");
assert.equal(normalized.expansionType, "new-location");

assert.equal(
    Object.prototype.hasOwnProperty.call(
        stable.factRegistry["workforce.totalEmployees"],
        "value"
    ),
    false,
    "Fact registry must contain metadata only; fact values remain in the facts object."
);
assert.equal(stable.factRegistry["workforce.totalEmployees"].status, "confirmed");
assert.deepEqual(
    stable.factRegistry["organization.currentEmployeeToManagerRatio"].derivedFrom,
    ["workforce.totalEmployees", "organization.peopleManagerCount"]
);

const page = fs.readFileSync(
    new URL("../organization-intelligence.html", import.meta.url),
    "utf8"
);
assert.match(page, /analyzeOrganizationStructure/);
assert.match(page, /I don’t know/);
assert.match(page, /factRegistry/);
assert.match(page, /does not score people/i);
assert.match(page, /Source transparency/i);
assert.match(page, /organization-structure-methodology\.html/);
assert.match(page, /taskComplexity/);
assert.match(page, /founderDecisions/);
assert.match(page, /expansionType/);
assert.doesNotMatch(page, /Organization Score/i);

const reportPage = fs.readFileSync(
    new URL("../organization-structure-report.html", import.meta.url),
    "utf8"
);
assert.match(reportPage, /Executive Overview/);
assert.match(reportPage, /Detailed Findings/);
assert.match(reportPage, /12-Month Growth Scenario/);
assert.match(reportPage, /Methodology & Sources/);
assert.match(reportPage, /Download PDF/);
assert.match(reportPage, /Email Report/);

const reportRuntime = fs.readFileSync(
    new URL("../js/organization-structure-report.mjs", import.meta.url),
    "utf8"
);
assert.match(reportRuntime, /Basis & Sources/);
assert.match(reportRuntime, /GrowWithHR rule/);
assert.match(reportRuntime, /source\.url/);
assert.match(reportRuntime, /analysis\.report/);

const sourceRegistry = fs.readFileSync(
    new URL("../js/modules/organization/organization-source-registry.mjs", import.meta.url),
    "utf8"
);
assert.match(sourceRegistry, /Open Government Licence v3\.0/);
assert.match(sourceRegistry, /OPENSTAX-SPAN-CONTEXT/);
assert.match(sourceRegistry, /prototype/i);
assert.doesNotMatch(sourceRegistry, /industry benchmark/i);

const legacyEngine = fs.readFileSync(
    new URL("../js/modules/organization/engine.js", import.meta.url),
    "utf8"
);
assert.doesNotMatch(
    legacyEngine,
    /let\s+score\s*=\s*100|score\s*-=/,
    "Legacy subtractive maturity scoring must be retired."
);

const mapper = fs.readFileSync(
    new URL("../js/modules/organization/mapper.js", import.meta.url),
    "utf8"
);
assert.doesNotMatch(mapper, /overallScore|organizationScore/);

const report = fs.readFileSync(
    new URL("../js/modules/organization/report.js", import.meta.url),
    "utf8"
);
assert.doesNotMatch(report, /Excellent|Needs Attention|Critical/);

console.log("Organization Structure source-traceability checks passed.");