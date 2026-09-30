import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { customerMessage, decodePdf } = require("../server-organization-report-delivery.js");

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
        functionOwnership: [
            { name: "Sales", ownership: "clear-owner" },
            { name: "Product", ownership: "clear-owner" },
            { name: "Engineering", ownership: "clear-owner" },
            { name: "Finance", ownership: "clear-owner" },
            { name: "People", ownership: "clear-owner" }
        ],
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

const ownershipPressure = analyzeOrganizationStructure(baseInput({
    organization: {
        functionOwnership: [
            { name: "Sales", ownership: "clear-owner" },
            { name: "Product", ownership: "shared" },
            { name: "Engineering", ownership: "clear-owner" },
            { name: "Finance", ownership: "unclear" },
            { name: "People", ownership: "unclear" }
        ]
    }
}));
const ownershipFinding = ownershipPressure.findings.find((item) => item.id === "ORG-OWNERSHIP-001");
assert.equal(ownershipFinding.status, "action", "Multiple unclear/shared functional ownership signals should become an action finding.");
assert.ok(ownershipFinding.factsUsed.includes("organization.functionOwnership"));
assert.equal(ownershipPressure.derivedMetrics.functionOwnershipCounts.unclear, 2);
assert.equal(ownershipPressure.reportModel.functionalOwnershipMap.length, 5);
assert.equal(ownershipPressure.reportModel.functionalOwnershipMap.find((item) => item.name === "Finance")?.status, "action");
assert.equal(ownershipPressure.reportModel.bottleneckMap.length, 6);
assert.equal(ownershipPressure.reportModel.bottleneckMap.find((item) => item.id === "ownership")?.status, "action");
assert.equal(ownershipPressure.reportModel.primaryBottleneck?.status, "action");
assert.match(ownershipPressure.reportModel.bottleneckMap.find((item) => item.id === "ownership")?.whatToReview || "", /accountable owners/i);

const ownershipMissing = analyzeOrganizationStructure(baseInput({
    organization: { functionOwnership: [] }
}));
assert.equal(
    ownershipMissing.findings.find((item) => item.id === "ORG-OWNERSHIP-001")?.status,
    "needs-information",
    "Named functions without ownership mapping should remain an information gap rather than being scored negatively."
);

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

assert.equal(FRAMEWORK.version, "1.2");
assert.ok(Array.isArray(FRAMEWORK.changeLog) && FRAMEWORK.changeLog.length >= 2);
assert.ok(FRAMEWORK.lastReviewed);
assert.equal(SOURCES["OPENSTAX-SPAN-CONTEXT"].access, "Free public source");
assert.match(SOURCES["OPENSTAX-SPAN-CONTEXT"].license, /CC BY-NC-SA 4\.0/i);
assert.match(SOURCES["OPENSTAX-ORG-DESIGN"].license, /CC BY-NC-SA 4\.0/i);
assert.match(SOURCES["OPENSTAX-ORG-DESIGN"].scopeNote || "", /commercial reuse/i);
assert.match(SOURCES["GOVS003-ORG-DESIGN"].scopeNote || "", /UK government/i);
assert.match(SOURCES["CIPD-ORG-DESIGN"].scopeNote || "", /Professional-body/i);
for (const source of Object.values(SOURCES)) {
    assert.equal(source.lastReviewed, "2026-10-01", `${source.id} research review date should be current.`);
}
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
assert.match(assessmentPage, /list=["']orgIndustryOptions["']/);
assert.match(assessmentPage, /<datalist id=["']orgIndustryOptions["']/);
assert.match(assessmentPage, /executive-assessment\/industry-catalog\.js/);
assert.match(assessmentPage, /setupIndustrySuggestions/);
assert.match(assessmentPage, /Start with five basics/);
for (const requiredField of ["companyName", "email", "industry", "employees", "locations"]) {
    assert.match(
        assessmentPage,
        new RegExp(`<[^>]+id=["']${requiredField}["'][^>]*required`),
        `${requiredField} should remain required.`
    );
}
for (const optionalField of ["managerCount", "reportingLevels", "founderDirectReports", "expectedEmployees", "departments"]) {
    assert.doesNotMatch(
        assessmentPage,
        new RegExp(`<[^>]+id=["']${optionalField}["'][^>]*required`),
        `${optionalField} should remain optional.`
    );
}
assert.match(assessmentPage, /org-field-status is-required/);
assert.match(assessmentPage, /org-field-status is-optional/);
assert.match(assessmentPage, /id=["']functionOwnershipRows["']/);
assert.match(assessmentPage, /data-function-ownership/);
assert.match(assessmentPage, /collectFunctionOwnership/);
assert.match(assessmentPage, /Clear accountable owner/);
assert.match(assessmentPage, /Shared or overlapping ownership/);
assert.match(assessmentPage, /Founder \/ CEO owns directly/);
assert.match(assessmentPage, /No clear accountable owner/);

const hub = fs.readFileSync(new URL("../intelligence-hub.html", import.meta.url), "utf8");
assert.match(hub, /createHandoff/);
assert.match(hub, /secureAnalysisHandoff/);
assert.match(hub, /organization-intelligence\.html/);
assert.match(hub, /\?handoff=\$\{encodeURIComponent\(token\)\}/);
assert.doesNotMatch(hub, /organization-intelligence\.html\?[^"'`]*(?:accessKey|recoveryCode)=/i);
assert.doesNotMatch(hub, /Choose an analysis/i, "Company Insights must not show a redundant Choose an analysis CTA.");

const reportPage = fs.readFileSync(new URL("../organization-structure-report.html", import.meta.url), "utf8");
assert.match(reportPage, /downloadReport/);
assert.match(reportPage, /emailReport/);
assert.match(reportPage, /jspdf\/2\.5\.1/);
assert.match(reportPage, /Organization Structure &amp; Growth Report \| GrowWithHR/);

const reportRuntime = fs.readFileSync(new URL("../js/organization-structure-report.mjs", import.meta.url), "utf8");
assert.match(reportRuntime, /organization-structure-pdf\.mjs/);
assert.match(reportRuntime, /\/api\/organization-report\/activity/);
assert.match(reportRuntime, /\/api\/organization-report\/deliver/);
assert.match(reportRuntime, /"downloaded"/);
assert.match(reportRuntime, /payload\.reportModel/);
assert.match(reportRuntime, /buildChangeIntelligence/);
assert.match(reportRuntime, /GrowWithHR rule/);
assert.match(reportRuntime, /ORGANIZATION BOTTLENECK MAP/);
assert.match(reportRuntime, /FUNCTIONAL OWNERSHIP/);
assert.match(reportRuntime, /bottleneckMapHtml/);
assert.match(reportRuntime, /ownershipMapHtml/);
assert.doesNotMatch(reportRuntime, /lead:\{name:clean\(payload\.data\?\.shared\?\.companyName/);

const pdfRuntime = fs.readFileSync(new URL("../js/organization-structure-pdf.mjs", import.meta.url), "utf8");
assert.match(pdfRuntime, /HRTECHIFY · GROWWITHHR/);
assert.match(pdfRuntime, /Framework & Evidence/);
assert.match(pdfRuntime, /Public source/);
assert.match(pdfRuntime, /not a forecast/i);
assert.match(pdfRuntime, /ruleVersion/);
assert.match(pdfRuntime, /Organization bottleneck map/);
assert.match(pdfRuntime, /Functional ownership/);
assert.match(pdfRuntime, /cleanText\(f\.version,"1\.2"\)/);

const handoffServer = fs.readFileSync(new URL("../server-workspace-handoff.js", import.meta.url), "utf8");
assert.match(handoffServer, /HANDOFF_TTL_MS = 5 \* 60 \* 1000/);
assert.match(handoffServer, /crypto\.randomBytes\(32\)/);
assert.match(handoffServer, /handoffs\.delete\(token\)/, "Handoff token must be deleted during redemption.");
assert.match(handoffServer, /Cache-Control.*no-store/);

const deliveryServer = fs.readFileSync(new URL("../server-organization-report-delivery.js", import.meta.url), "utf8");
assert.match(deliveryServer, /Your GrowWithHR Organization Structure & Growth Report/);
assert.match(deliveryServer, /request\.growwithhrCustomer/);
assert.match(deliveryServer, /authenticated work email/);
assert.match(deliveryServer, /frameworkVersion, "1\.2"/);
assert.match(deliveryServer, /Framework and sources/);
assert.match(deliveryServer, /Structural findings are not included|structural findings are not included/i);
assert.match(deliveryServer, /Report type/);
assert.match(deliveryServer, /Framework version/);
assert.match(deliveryServer, /downloaded/);

const serverEntry = fs.readFileSync(new URL("../server-entry.js", import.meta.url), "utf8");
assert.match(serverEntry, /handleWorkspaceHandoffRequest/);
assert.match(serverEntry, /handleOrganizationReportRequest/);

const serverRuntime = fs.readFileSync(new URL("../server.js", import.meta.url), "utf8");
assert.match(serverRuntime, /\/api\/email-status/);
assert.match(serverRuntime, /oauth2Client\.getAccessToken/);
assert.match(serverRuntime, /oauth2Client\.getTokenInfo/);
assert.match(serverRuntime, /gmail\.send/);
assert.match(serverRuntime, /sendScopeAvailable/);

const smokeWorkflow = fs.readFileSync(new URL("../.github/workflows/live-release-smoke.yml", import.meta.url), "utf8");
assert.match(smokeWorkflow, /Validate live Gmail API connectivity/);
assert.match(smokeWorkflow, /organization-structure-report\.html\?sample=1/);
assert.match(smokeWorkflow, /oauthConnected == true/);
assert.match(smokeWorkflow, /sendScopeAvailable == true/);

const methodology = fs.readFileSync(new URL("../organization-structure-methodology.html", import.meta.url), "utf8");
assert.match(methodology, /Version history/i);
assert.match(methodology, /sourceRuleIds/);
assert.match(methodology, /Rule register/i);
assert.match(methodology, /CC BY-NC-SA 4\.0/);
assert.match(methodology, /Research scope/);

const privacy = fs.readFileSync(new URL("../more-info.html", import.meta.url), "utf8");
assert.match(privacy, /Report download and delivery activity/);
assert.match(privacy, /not intended to contain the structural findings/i);
assert.doesNotMatch(privacy, /Workspace Recovery Code|one-time opaque handoff token/i);

const homepage = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(homepage, />Analyze Organization &amp; Growth/);
assert.match(homepage, />View a Sample Report/);
assert.match(homepage, /Organization Structure &amp; Growth · Flagship/);
assert.match(homepage, /Where could our organization constrain growth\?/);
assert.match(homepage, /No arbitrary scores/i);
assert.match(homepage, /data-testid="home-report-preview"/);
assert.match(homepage, /Decision Scenario Studio/);
assert.doesNotMatch(homepage, /Organization Structure \(Available\)/);
assert.doesNotMatch(homepage, />Analyze My Company</);
assert.doesNotMatch(homepage, />View Sample Advisory</);

const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const typography = fs.readFileSync(new URL("../css/27-typography-refinement.css", import.meta.url), "utf8");
const variables = fs.readFileSync(new URL("../css/01-variables.css", import.meta.url), "utf8");
assert.match(styles, /27-typography-refinement\.css/);
assert.match(variables, /--type-display:clamp\(2\.35rem,3\.7vw,3\.5rem\)/);
assert.match(variables, /--type-section:clamp\(1\.5rem,2vw,2rem\)/);
assert.match(variables, /--type-body:1rem/);
assert.match(typography, /#screen-overview > \.org-panel:first-child h2/);
assert.match(typography, /font-size: clamp\(1\.625rem, 2vw, 2rem\)/);
assert.match(typography, /\.intelligence-hub-page \.hero-actions[\s\S]*display: none !important/);

const defaultEmail = customerMessage(
    { companyName: "Pilot Co" },
    { companyName: "Pilot Co", reportId: "GWHR-2026-0001-AA01" },
    "GrowWithHR-Organization-Growth-Pilot-Co.pdf"
);
assert.match(defaultEmail.subject, /Organization Structure & Growth Report/);
assert.match(defaultEmail.text, /^Hello there,/);
assert.match(defaultEmail.text, /Framework used: GrowWithHR Organization Structure Assessment Framework v1\.2/);
assert.match(defaultEmail.html, /Organization Structure Report|Organization Structure & Growth Report/);
const decodedPdf = decodePdf({
    filename: "pilot-report.pdf",
    base64: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF", "utf8").toString("base64")
});
assert.equal(decodedPdf.filename, "pilot-report.pdf");
assert.equal(decodedPdf.contentType, "application/pdf");
assert.ok(decodedPdf.content.length > 5);

console.log("Organization Structure completion checks passed.");
