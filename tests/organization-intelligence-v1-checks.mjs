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

const stable = analyzeOrganizationStructure({
    shared: {
        companyName: "Stable Services",
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
        roleClarity: "clear",
        decisionRights: "clear",
        governanceCadence: "weekly",
        coordinationFriction: "low",
        confirmedAt: "2026-08-14T10:00:00.000Z"
    }
});

assert.equal(stable.module, "organization");
assert.equal(stable.authority, "deterministic-structural-prototype");
assert.equal(hasKeyDeep(stable, "score"), false, "Organization Intelligence must not expose an arbitrary maturity score.");
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

const pressure = analyzeOrganizationStructure({
    shared: {
        companyName: "Scaling Company",
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
        roleClarity: "unclear",
        decisionRights: "mixed",
        governanceCadence: "none",
        coordinationFriction: "high",
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

const missing = analyzeOrganizationStructure({
    shared: {
        companyName: "Unknown Structure",
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
        coordinationFriction: "dont-know"
    }
});

assert.equal(missing.scenario.available, false);
assert.ok(missing.missingFacts.includes("organization.peopleManagerCount"));
assert.ok(missing.missingFacts.includes("organization.founderDirectReports"));
assert.ok(missing.missingFacts.includes("organization.roleClarity"));
assert.ok(missing.missingFacts.includes("organization.decisionRights"));
assert.ok(missing.missingFacts.includes("workforce.expectedEmployees12Months"));
assert.ok(missing.statusSummary["needs-information"] >= 5);

const normalized = normalizeOrganizationInput({
    shared: { employees: 20 },
    organization: {
        managerCount: "",
        departments: "Sales, Product, Finance",
        locations: 2
    }
});
assert.equal(normalized.peopleManagerCount, null);
assert.deepEqual(normalized.departments, ["Sales", "Product", "Finance"]);
assert.equal(normalized.operatingLocationCount, 2);

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
assert.doesNotMatch(page, /Organization Score/i);

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

console.log("Organization Intelligence v1 structured checks passed.");
