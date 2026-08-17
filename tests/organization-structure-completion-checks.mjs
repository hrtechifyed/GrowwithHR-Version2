import assert from "node:assert/strict";
import fs from "node:fs";

import {
    analyzeOrganizationStructure
} from "../js/modules/organization/organization-structure-engine.mjs";
import {
    FRAMEWORK,
    SOURCES,
    RULE_SOURCE_MAP
} from "../js/modules/organization/organization-source-registry.mjs";

function baseInput(overrides = {}) {
    const organization = {
        peopleManagerCount: 10,
        reportingLevels: 2,
        founderDirectReports: 5,
        departments: ["Sales", "Product", "Engineering", "Finance", "People"],
        managerRole: "manager-only",
        workComplexity: "routine",
        workStandardization: "high",
        teamIndependence: "high",
        coachingIntensity: "low",
        roleClarity: "clear",
        decisionRights: "clear",
        governanceCadence: "weekly",
        coordinationFriction: "low",
        founderDecisions: "",
        expansion: "none",
        confirmedAt: "2026-08-17T12:00:00.000Z",
        ...(overrides.organization || {})
    };
    return {
        shared: {
            companyName: "Context Test Co",
            email: "founder@example.com",
            industry: "Technology",
            growthStage: "Growth",
            employees: 100,
            expectedEmployees: 105,
            ...(overrides.shared || {})
        },
        workforce: {
            totalEmployees: 100,
            expectedEmployees12Months: 105,
            ...(overrides.workforce || {})
        },
        geography: {
            operatingLocationCount: 1,
            ...(overrides.geography || {})
        },
        organization
    };
}

const lowerSupport = analyzeOrganizationStructure(baseInput());
const highSupport = analyzeOrganizationStructure(baseInput({
    organization: {
        managerRole: "hands-on-specialist",
        workComplexity: "complex",
        workStandardization: "low",
        teamIndependence: "low",
        coachingIntensity: "high"
    },
    geography: { operatingLocationCount: 2 }
}));

const lowerCapacity = lowerSupport.findings.find((item) => item.id === "ORG-CAPACITY-001");
const highCapacity = highSupport.findings.find((item) => item.id === "ORG-CAPACITY-001");
assert.equal(lowerSupport.derivedMetrics.currentEmployeeToManagerRatio, 10);
assert.equal(highSupport.derivedMetrics.currentEmployeeToManagerRatio, 10);
assert.equal(lowerSupport.derivedMetrics.managementContextBand, "lower-support-load");
assert.equal(highSupport.derivedMetrics.managementContextBand, "high-support-load");
assert.equal(lowerCapacity.status, "stable", "Same ratio should be workable in a lower-support-load context.");
assert.equal(highCapacity.status, "watch", "Same ratio should become a watchpoint in a higher-support-load context.");
assert.match(highCapacity.ruleBasis, /work complexity/i);
assert.ok(highCapacity.factsUsed.includes("organization.coachingIntensity"));

const founderLight = analyzeOrganizationStructure(baseInput({
    shared: { employees: 40, expectedEmployees: 42 },
    workforce: { totalEmployees: 40, expectedEmployees12Months: 42 },
    organization: {
        peopleManagerCount: 5,
        founderDirectReports: 5,
        founderDecisions: ""
    }
}));
const founderHeavy = analyzeOrganizationStructure(baseInput({
    shared: { employees: 40, expectedEmployees: 42 },
    workforce: { totalEmployees: 40, expectedEmployees12Months: 42 },
    organization: {
        peopleManagerCount: 5,
        founderDirectReports: 5,
        founderDecisions: "Senior hiring, pricing exceptions, major budget spend, product roadmap and market partnerships"
    }
}));
const founderLightFinding = founderLight.findings.find((item) => item.id === "ORG-FOUNDER-001");
const founderHeavyFinding = founderHeavy.findings.find((item) => item.id === "ORG-FOUNDER-001");
const decisionHeavyFinding = founderHeavy.findings.find((item) => item.id === "ORG-DECISIONS-001");
assert.equal(founderLightFinding.status, "stable");
assert.equal(founderHeavyFinding.status, "action", "Founder-dependent decision categories must materially affect the founder finding.");
assert.equal(decisionHeavyFinding.status, "action", "Founder-dependent decision categories must also affect decision-rights status.");
assert.ok(founderHeavy.derivedMetrics.founderDecisionCategories.length >= 3);
assert.ok(founderHeavyFinding.factsUsed.includes("organization.founderDecisions"));

const noExpansion = analyzeOrganizationStructure(baseInput({
    shared: { employees: 50, expectedEmployees: 55 },
    workforce: { totalEmployees: 50, expectedEmployees12Months: 55 },
    organization: { peopleManagerCount: 10, expansion: "none" }
}));
const expansion = analyzeOrganizationStructure(baseInput({
    shared: { employees: 50, expectedEmployees: 55 },
    workforce: { totalEmployees: 50, expectedEmployees12Months: 55 },
    geography: { operatingLocationCount: 1 },
    organization: { peopleManagerCount: 10, expansion: "Open a new operating location and launch a new product line" }
}));
const noExpansionGrowth = noExpansion.findings.find((item) => item.id === "ORG-GROWTH-001");
const expansionGrowth = expansion.findings.find((item) => item.id === "ORG-GROWTH-001");
const expansionLocation = expansion.findings.find((item) => item.id === "ORG-LOCATION-001");
assert.equal(noExpansionGrowth.status, "stable");
assert.equal(expansionGrowth.status, "watch", "Expansion plan must materially affect Growth Readiness.");
assert.equal(expansionLocation.status, "watch", "Geographic expansion must materially affect Location Complexity.");
assert.deepEqual(expansion.derivedMetrics.expansionSignals.sort(), ["geography", "offering"].sort());
assert.ok(expansionGrowth.factsUsed.includes("organization.expansion"));

const model = founderHeavy.reportModel;
assert.equal(model.schemaVersion, "1.0");
assert.equal(model.reportType, "organization-structure");
assert.equal(typeof model.executiveSummary, "string");
assert.ok(model.executiveSummary.length > 30);
assert.ok(model.primaryConstraint?.id);
assert.ok(Array.isArray(model.priorities) && model.priorities.length > 0);
assert.ok(Array.isArray(model.sources) && model.sources.length > 0);
assert.ok(model.ruleVersions["ORG-CAPACITY-001"]);
assert.match(model.confidenceMeaning, /not statistical/i);
assert.match(model.assumptions.join(" "), /not a forecast/i);

assert.equal(FRAMEWORK.version, "1.1");
assert.ok(Array.isArray(FRAMEWORK.changeLog) && FRAMEWORK.changeLog.length >= 2);
assert.ok(FRAMEWORK.lastReviewed);
assert.equal(SOURCES["OPENSTAX-SPAN-CONTEXT"].access, "Free public source");
assert.match(SOURCES["OPENSTAX-SPAN-CONTEXT"].license, /CC BY 4\.0/i);
assert.match(SOURCES["OPENSTAX-SPAN-CONTEXT"].supports, /task complexity/i);
assert.ok(RULE_SOURCE_MAP["ORG-CAPACITY-001"].sourceIds.includes("OPENSTAX-SPAN-CONTEXT"));
for (const [ruleId, rule] of Object.entries(RULE_SOURCE_MAP)) {
    assert.ok(rule.version, `${ruleId} needs a version.`);
    assert.ok(rule.lastReviewed, `${ruleId} needs a last-reviewed date.`);
    assert.ok(rule.reviewOwner, `${ruleId} needs a review owner.`);
}

const assessmentPage = fs.readFileSync(new URL("../organization-intelligence.html", import.meta.url), "utf8");
for (const fieldId of ["managerRole", "workComplexity", "workStandardization", "teamIndependence", "coachingIntensity"]) {
    assert.match(assessmentPage, new RegExp(`id=["']${fieldId}["']`), `Assessment must collect ${fieldId}.`);
}
assert.match(assessmentPage, /redeemHandoff/);
assert.match(assessmentPage, /history\.replaceState/);
assert.match(assessmentPage, /Recovery Code was not placed in the URL/);
assert.match(assessmentPage, /organization\.founderDecisions/);
assert.match(assessmentPage, /organization\.expansion/);

const hub = fs.readFileSync(new URL("../intelligence-hub.html", import.meta.url), "utf8");
assert.match(hub, /createHandoff/);
assert.match(hub, /organization-intelligence\.html\?handoff=/);
assert.doesNotMatch(hub, /organization-intelligence\.html\?[^"'`]*(?:accessKey|recoveryCode)=/i);

const reportPage = fs.readFileSync(new URL("../organization-structure-report.html", import.meta.url), "utf8");
assert.match(reportPage, /downloadReport/);
assert.match(reportPage, /emailReport/);
assert.match(reportPage, /jspdf\/2\.5\.1/);

const reportRuntime = fs.readFileSync(new URL("../js/organization-structure-report.mjs", import.meta.url), "utf8");
assert.match(reportRuntime, /organization-structure-pdf\.mjs/);
assert.match(reportRuntime, /\/api\/organization-report\/activity/);
assert.match(reportRuntime, /\/api\/organization-report\/deliver/);
assert.match(reportRuntime, /"downloaded"/);
assert.match(reportRuntime, /reportModel\(payload\)/);
assert.match(reportRuntime, /GrowWithHR rule/);

const pdfRuntime = fs.readFileSync(new URL("../js/organization-structure-pdf.mjs", import.meta.url), "utf8");
assert.match(pdfRuntime, /HRTECHIFY · GROWWITHHR/);
assert.match(pdfRuntime, /Framework & Evidence/);
assert.match(pdfRuntime, /Public source/);
assert.match(pdfRuntime, /not a forecast/i);
assert.match(pdfRuntime, /ruleVersion/);

const handoffServer = fs.readFileSync(new URL("../server-workspace-handoff.js", import.meta.url), "utf8");
assert.match(handoffServer, /HANDOFF_TTL_MS = 5 \* 60 \* 1000/);
assert.match(handoffServer, /crypto\.randomBytes\(32\)/);
assert.match(handoffServer, /handoffs\.delete\(token\)/, "Handoff token must be deleted during redemption.");
assert.match(handoffServer, /Cache-Control.*no-store/);

const deliveryServer = fs.readFileSync(new URL("../server-organization-report-delivery.js", import.meta.url), "utf8");
assert.match(deliveryServer, /Your GrowWithHR Organization Structure Report/);
assert.match(deliveryServer, /Framework and sources/);
assert.match(deliveryServer, /Structural findings are not included|structural findings are not included/i);
assert.match(deliveryServer, /Report type/);
assert.match(deliveryServer, /Framework version/);
assert.match(deliveryServer, /downloaded/);

const serverEntry = fs.readFileSync(new URL("../server-entry.js", import.meta.url), "utf8");
assert.match(serverEntry, /handleWorkspaceHandoffRequest/);
assert.match(serverEntry, /handleOrganizationReportRequest/);

const methodology = fs.readFileSync(new URL("../organization-structure-methodology.html", import.meta.url), "utf8");
assert.match(methodology, /Version history/i);
assert.match(methodology, /sourceRuleIds/);
assert.match(methodology, /Rule register/i);
assert.match(methodology, /CC BY 4\.0/);

const privacy = fs.readFileSync(new URL("../more-info.html", import.meta.url), "utf8");
assert.match(privacy, /Report download and delivery activity/);
assert.match(privacy, /not intended to contain the structural findings/i);
assert.match(privacy, /one-time opaque handoff token/i);

const homepage = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(homepage, />Understand My Company</);
assert.match(homepage, />Explore Sample Reports</);
assert.match(homepage, /Organization Structure \(Available\)/);
assert.doesNotMatch(homepage, />Analyze My Company</);
assert.doesNotMatch(homepage, />View Sample Advisory</);

console.log("Organization Structure completion checks passed.");
