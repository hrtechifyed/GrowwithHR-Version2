import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

import {
    analyzeOrganizationStructure,
    contextualSpanThresholds
} from "../js/modules/organization/organization-structure-engine.mjs";
import {
    FRAMEWORK,
    SOURCES,
    RULE_SOURCE_MAP,
    ruleIdsForSource
} from "../js/modules/organization/organization-source-registry.mjs";

const require = createRequire(import.meta.url);
const deliveryServer = require("../server-organization-report-delivery.js");
const reportEventServer = require("../server-report-event.js");

function read(path) {
    return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

assert.equal(FRAMEWORK.access, "Free public methodology");
assert.match(FRAMEWORK.publicMethodologyUrl, /^https:\/\//);
assert.ok(Array.isArray(FRAMEWORK.versionHistory) && FRAMEWORK.versionHistory.length >= 2);
assert.ok(FRAMEWORK.reviewedAt);
assert.ok(SOURCES["OPENSTAX-SPAN-CONTEXT"]);
assert.match(SOURCES["OPENSTAX-SPAN-CONTEXT"].access, /free public/i);
assert.match(SOURCES["OPENSTAX-SPAN-CONTEXT"].supports, /task complexity/i);
assert.ok(ruleIdsForSource("OPENSTAX-SPAN-CONTEXT").includes("ORG-CAPACITY-001"));
assert.ok(RULE_SOURCE_MAP["ORG-FOUNDER-001"].sourceIds.length > 0);

const neutralThresholds = contextualSpanThresholds({
    taskComplexity: "mixed",
    delegationAbility: "mixed",
    managerInteraction: "mixed",
    teamExperience: "mixed",
    operatingLocationCount: 1
});
const intensiveThresholds = contextualSpanThresholds({
    taskComplexity: "complex",
    delegationAbility: "low",
    managerInteraction: "high",
    teamExperience: "developing",
    operatingLocationCount: 5
});
const autonomousThresholds = contextualSpanThresholds({
    taskComplexity: "standardized",
    delegationAbility: "high",
    managerInteraction: "low",
    teamExperience: "experienced",
    operatingLocationCount: 1
});
assert.ok(intensiveThresholds.watch < neutralThresholds.watch, "High-management-intensity context must narrow the GrowWithHR review range.");
assert.ok(autonomousThresholds.watch > neutralThresholds.watch, "More autonomous/standardized context must widen the GrowWithHR review range.");

function baseOrganization(overrides = {}) {
    return {
        shared: {
            companyName: "Context Test Co",
            email: "founder@example.com",
            industry: "Technology",
            growthStage: "Scaling",
            employees: 48,
            expectedEmployees: 60
        },
        workforce: { totalEmployees: 48, expectedEmployees12Months: 60 },
        geography: { operatingLocationCount: 1 },
        organization: {
            peopleManagerCount: 5,
            reportingLevels: 2,
            founderDirectReports: 5,
            departments: ["Sales", "Product", "Engineering", "Finance", "People"],
            taskComplexity: "mixed",
            delegationAbility: "mixed",
            managerInteraction: "mixed",
            teamExperience: "mixed",
            roleClarity: "clear",
            decisionRights: "clear",
            governanceCadence: "weekly",
            coordinationFriction: "low",
            founderDecisions: "",
            expansionType: "none",
            expansion: "",
            confirmedAt: "2026-08-17T12:00:00.000Z",
            ...overrides
        }
    };
}

const neutral = analyzeOrganizationStructure(baseOrganization());
const intensive = analyzeOrganizationStructure(baseOrganization({
    taskComplexity: "complex",
    delegationAbility: "low",
    managerInteraction: "high",
    teamExperience: "developing"
}));
assert.notEqual(
    neutral.derivedMetrics.contextualSpanWatchTrigger,
    intensive.derivedMetrics.contextualSpanWatchTrigger,
    "Context answers must materially alter the GrowWithHR management-capacity threshold."
);
assert.match(intensive.findings.find((item) => item.id === "ORG-CAPACITY-001").whyItMatters, /contextual watch trigger/i);

const founderLight = analyzeOrganizationStructure(baseOrganization({ founderDirectReports: 4, founderDecisions: "" }));
const founderHeavy = analyzeOrganizationStructure(baseOrganization({
    founderDirectReports: 4,
    founderDecisions: "senior hiring, pricing exceptions, major spend, compensation exceptions, strategic customer commitments"
}));
assert.equal(founderLight.findings.find((item) => item.id === "ORG-FOUNDER-001").status, "stable");
assert.equal(founderHeavy.findings.find((item) => item.id === "ORG-FOUNDER-001").status, "action");
assert.ok(founderHeavy.findings.find((item) => item.id === "ORG-FOUNDER-001").factsUsed.includes("organization.founderDecisions"));

const noExpansion = analyzeOrganizationStructure(baseOrganization({
    expansionType: "none",
    expansion: "",
    peopleManagerCount: 8,
    taskComplexity: "standardized",
    delegationAbility: "high",
    managerInteraction: "low",
    teamExperience: "experienced"
}));
const locationExpansion = analyzeOrganizationStructure(baseOrganization({
    expectedEmployees12Months: null,
    expansionType: "new-location",
    expansion: "Opening a second customer operations location",
    peopleManagerCount: 8
}));
assert.equal(noExpansion.findings.find((item) => item.id === "ORG-GROWTH-001").status, "stable");
assert.equal(locationExpansion.findings.find((item) => item.id === "ORG-GROWTH-001").status, "watch");
assert.ok(locationExpansion.findings.find((item) => item.id === "ORG-GROWTH-001").factsUsed.includes("organization.expansionType"));

assert.equal(neutral.report.schemaVersion, "1.0.0");
assert.equal(neutral.report.reportType, "organization-structure");
assert.equal(neutral.report.frameworkVersion, FRAMEWORK.version);
assert.ok(neutral.report.executiveSummary);
assert.ok(neutral.report.primaryConstraintId);
assert.ok(Array.isArray(neutral.report.priorityFindingIds));
assert.equal(neutral.report.scenarioId, neutral.scenario.id);

const indexHtml = read("index.html");
assert.match(indexHtml, />Understand My Company</);
assert.match(indexHtml, />Explore Sample Reports</);
assert.match(indexHtml, /Organization Structure \(Available\)/);
assert.doesNotMatch(indexHtml, />Analyze My Company</);
assert.doesNotMatch(indexHtml, />View Sample Advisory</);

const hubHtml = read("intelligence-hub.html");
assert.match(hubHtml, /createHandoff/);
assert.match(hubHtml, /handoff=\$\{encodeURIComponent\(handoff\.token\)\}/);
assert.doesNotMatch(hubHtml, /recoveryCode=.*organization-intelligence/i);

const organizationHtml = read("organization-intelligence.html");
for (const id of ["taskComplexity", "delegationAbility", "managerInteraction", "teamExperience", "expansionType", "founderDecisions"]) {
    assert.match(organizationHtml, new RegExp(`id=\\"${id}\\"`));
}
assert.match(organizationHtml, /consumeHandoff/);
assert.match(organizationHtml, /history\.replaceState\(null, \"\", \"organization-intelligence\.html\"\)/);
assert.match(organizationHtml, /OpenStax/i);

const workspaceClient = read("js/company-workspace-client.js");
assert.match(workspaceClient, /company-workspace\/handoff\/create/);
assert.match(workspaceClient, /company-workspace\/handoff\/consume/);
const handoffServer = read("server-company-workspace-handoff.js");
assert.match(handoffServer, /HANDOFF_TTL_MS = 2 \* 60 \* 1000/);
assert.match(handoffServer, /handoffs\.delete\(token\)/);
assert.match(handoffServer, /randomBytes\(24\)/);

const reportHtml = read("organization-structure-report.html");
assert.match(reportHtml, /jspdf\/2\.5\.1/);
assert.match(reportHtml, /id="downloadReport"/);
assert.match(reportHtml, /id="emailReport"/);
assert.match(reportHtml, /id="deliveryStatus"/);
const reportRuntime = read("js/organization-structure-report.mjs");
assert.match(reportRuntime, /analysis\.report/);
assert.match(reportRuntime, /downloadOrganizationStructurePdf/);
assert.match(reportRuntime, /emailOrganizationStructureReport/);
assert.match(reportRuntime, /report-viewed/);
assert.match(reportRuntime, /Source reviewed by GrowWithHR/);
const deliveryClient = read("js/organization-structure-delivery.mjs");
assert.match(deliveryClient, /api\/send-organization-report/);
assert.match(deliveryClient, /api\/report-event/);
assert.match(deliveryClient, /report-downloaded/);
assert.match(deliveryClient, /Framework & Evidence/);
assert.match(deliveryClient, /textWithLink/);

const methodologyHtml = read("organization-structure-methodology.html");
assert.match(methodologyHtml, /id="spanContext"/);
assert.match(methodologyHtml, /ruleIdsForSource/);
assert.match(methodologyHtml, /versionHistory/);
assert.match(methodologyHtml, /OpenStax span-of-control source/i);

const styles = read("styles.css");
assert.match(styles, /26-brand-unification\.css/);
const brandCss = read("css/26-brand-unification.css");
assert.match(brandCss, /hub-engine-card__action/);
assert.match(brandCss, /var\(--gradient-brand\)/);
assert.match(brandCss, /Semantic status colours remain distinct/i);

const serverEntry = read("server-entry.js");
assert.match(serverEntry, /handleCompanyWorkspaceHandoffRequest/);
assert.match(serverEntry, /handleOrganizationReportDeliveryRequest/);
assert.match(serverEntry, /handleReportEventRequest/);

const customer = deliveryServer.customerEmail({
    recipientName: "Asha",
    companyName: "Acme",
    reportId: "GWHR-2026-0817-AA01",
    frameworkName: FRAMEWORK.name,
    frameworkVersion: FRAMEWORK.version,
    methodologyUrl: FRAMEWORK.publicMethodologyUrl
});
assert.match(customer.subject, /Organization Structure Report for Acme/);
assert.match(customer.text, /Framework used:/);
assert.match(customer.text, /Methodology and public sources:/);
assert.match(customer.text, /public source evidence/i);
const internal = deliveryServer.internalEmail({
    recipient: "asha@example.com",
    companyName: "Acme",
    reportId: "GWHR-2026-0817-AA01",
    filename: "GrowWithHR-Organization-Structure-Acme.pdf",
    frameworkName: FRAMEWORK.name,
    frameworkVersion: FRAMEWORK.version
});
assert.match(internal.text, /Report type: Organization Structure Report/);
assert.match(internal.text, /Event: emailed/);

assert.ok(reportEventServer.ALLOWED_EVENTS.has("report-downloaded"));
const reportEventSource = read("server-report-event.js");
assert.match(reportEventSource, /Only report-delivery metadata is included/);
assert.doesNotMatch(reportEventSource, /findings\s*:/);

const privacy = read("more-info.html");
assert.match(privacy, /short-lived, one-time handoff token/i);
assert.match(privacy, /Report activity metadata/);
assert.match(privacy, /does not.*copy.*Organization Structure findings/is);

console.log("Organization Structure rollout completion checks passed.");
