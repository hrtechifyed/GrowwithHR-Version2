import assert from "node:assert/strict";
import fs from "node:fs";
import { analyzeOrganizationStructure } from "../js/modules/organization/organization-structure-engine.mjs";
import { FRAMEWORK, SOURCES, RULE_SOURCE_MAP } from "../js/modules/organization/organization-source-registry.mjs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function input(overrides={}) {
  const organization={peopleManagerCount:10,reportingLevels:2,founderDirectReports:5,departments:["Sales","Product","Engineering","Finance","People"],managerRole:"manager-only",workComplexity:"routine",workStandardization:"high",teamIndependence:"high",coachingIntensity:"low",roleClarity:"clear",decisionRights:"clear",governanceCadence:"weekly",coordinationFriction:"low",founderDecisions:"",expansion:"none",confirmedAt:"2026-08-17T12:00:00.000Z",...(overrides.organization||{})};
  return {shared:{companyName:"Context Test Co",email:"founder@example.com",industry:"Technology",growthStage:"Growth",employees:100,expectedEmployees:105,...(overrides.shared||{})},workforce:{totalEmployees:100,expectedEmployees12Months:105,...(overrides.workforce||{})},geography:{operatingLocationCount:1,...(overrides.geography||{})},organization};
}

const low=analyzeOrganizationStructure(input());
const high=analyzeOrganizationStructure(input({organization:{managerRole:"hands-on-specialist",workComplexity:"complex",workStandardization:"low",teamIndependence:"low",coachingIntensity:"high"},geography:{operatingLocationCount:2}}));
const lowCap=low.findings.find(x=>x.id==="ORG-CAPACITY-001");
const highCap=high.findings.find(x=>x.id==="ORG-CAPACITY-001");
assert.equal(low.derivedMetrics.currentEmployeeToManagerRatio,10);
assert.equal(high.derivedMetrics.currentEmployeeToManagerRatio,10);
assert.equal(low.derivedMetrics.managementContextBand,"lower-support-load");
assert.equal(high.derivedMetrics.managementContextBand,"high-support-load");
assert.equal(lowCap.status,"stable");
assert.equal(highCap.status,"watch");
assert.match(highCap.ruleBasis,/work complexity/i);
assert.ok(highCap.factsUsed.includes("organization.coachingIntensity"));

const founder=analyzeOrganizationStructure(input({shared:{employees:40,expectedEmployees:42},workforce:{totalEmployees:40,expectedEmployees12Months:42},organization:{peopleManagerCount:5,founderDirectReports:5,founderDecisions:"Senior hiring, pricing exceptions, major budget spend, product roadmap and market partnerships"}}));
assert.equal(founder.findings.find(x=>x.id==="ORG-FOUNDER-001").status,"action");
assert.equal(founder.findings.find(x=>x.id==="ORG-DECISIONS-001").status,"action");
assert.ok(founder.derivedMetrics.founderDecisionCategories.length>=3);

const expansion=analyzeOrganizationStructure(input({shared:{employees:50,expectedEmployees:55},workforce:{totalEmployees:50,expectedEmployees12Months:55},geography:{operatingLocationCount:1},organization:{peopleManagerCount:10,expansion:"Open a new operating location and launch a new product line"}}));
assert.equal(expansion.findings.find(x=>x.id==="ORG-GROWTH-001").status,"watch");
assert.equal(expansion.findings.find(x=>x.id==="ORG-LOCATION-001").status,"watch");
assert.deepEqual(expansion.derivedMetrics.expansionSignals.sort(),["geography","offering"].sort());

const model=founder.reportModel;
assert.equal(model.schemaVersion,"1.0");
assert.equal(model.reportType,"organization-structure");
assert.ok(model.executiveSummary.length>30);
assert.ok(model.primaryConstraint?.id);
assert.ok(model.priorities.length>0);
assert.ok(model.sources.length>0);
assert.ok(model.ruleVersions["ORG-CAPACITY-001"]);
assert.match(model.confidenceMeaning,/not statistical/i);
assert.match(model.assumptions.join(" "),/not a forecast/i);

assert.equal(FRAMEWORK.version,"1.1");
assert.ok(FRAMEWORK.changeLog.length>=2 && FRAMEWORK.lastReviewed);
assert.equal(SOURCES["OPENSTAX-SPAN-CONTEXT"].access,"Free public source");
assert.match(SOURCES["OPENSTAX-SPAN-CONTEXT"].license,/CC BY 4\.0/i);
assert.ok(RULE_SOURCE_MAP["ORG-CAPACITY-001"].sourceIds.includes("OPENSTAX-SPAN-CONTEXT"));
for(const [id,rule] of Object.entries(RULE_SOURCE_MAP)){assert.ok(rule.version,`${id} needs version`);assert.ok(rule.lastReviewed,`${id} needs review date`);assert.ok(rule.reviewOwner,`${id} needs owner`);}

const assessment=read("organization-intelligence.html");
for(const id of ["managerRole","workComplexity","workStandardization","teamIndependence","coachingIntensity"]) assert.match(assessment,new RegExp(`id=["']${id}["']`));
assert.match(assessment,/redeemHandoff/);assert.match(assessment,/history\.replaceState/);assert.match(assessment,/organization\.founderDecisions/);assert.match(assessment,/organization\.expansion/);

const hub=read("intelligence-hub.html");
assert.match(hub,/createHandoff/);assert.match(hub,/organization-intelligence\.html\?handoff=/);assert.doesNotMatch(hub,/organization-intelligence\.html\?[^"'`]*(?:accessKey|recoveryCode)=/i);

const report=read("organization-structure-report.html");
assert.match(report,/downloadReport/);assert.match(report,/emailReport/);assert.match(report,/jspdf\/2\.5\.1/);
const runtime=read("js/organization-structure-report.mjs");
assert.match(runtime,/organization-structure-pdf\.mjs/);assert.match(runtime,/\/api\/organization-report\/activity/);assert.match(runtime,/\/api\/organization-report\/deliver/);assert.match(runtime,/GrowWithHR rule/);
const pdf=read("js/organization-structure-pdf.mjs");
assert.match(pdf,/HRTECHIFY · GROWWITHHR/);assert.match(pdf,/Framework & Evidence/);assert.match(pdf,/Public source/);assert.match(pdf,/not a forecast/i);

const handoff=read("server-workspace-handoff.js");
assert.match(handoff,/HANDOFF_TTL_MS = 5 \* 60 \* 1000/);assert.match(handoff,/crypto\.randomBytes\(32\)/);assert.match(handoff,/handoffs\.delete\(token\)/);assert.match(handoff,/Cache-Control.*no-store/);
const delivery=read("server-organization-report-delivery.js");
assert.match(delivery,/Your GrowWithHR Organization Structure Report/);assert.match(delivery,/Framework and sources/);assert.match(delivery,/structural findings are not included/i);assert.match(delivery,/Framework version/);assert.match(delivery,/downloaded/);

const methodology=read("organization-structure-methodology.html");
assert.match(methodology,/Version history/i);assert.match(methodology,/sourceRuleIds/);assert.match(methodology,/Rule register/i);assert.match(methodology,/CC BY 4\.0/);
const privacy=read("more-info.html");
assert.match(privacy,/Report download and delivery activity/);assert.match(privacy,/not intended to contain the structural findings/i);assert.match(privacy,/one-time opaque handoff token/i);

const homepage=read("index.html");
assert.match(homepage,/>Understand My Company</);assert.match(homepage,/>Explore Sample Reports</);assert.match(homepage,/<span class="buyer-card__label">Organization Structure<\/span>/);assert.match(homepage,/Where will our structure start constraining growth\?/);assert.doesNotMatch(homepage,/Organization Structure \(Available\)/);assert.doesNotMatch(homepage,/>Analyze My Company/);

const styles=read("styles.css"),typography=read("css/27-typography-refinement.css"),variables=read("css/01-variables.css");
assert.match(styles,/27-typography-refinement\.css/);assert.match(variables,/--type-display:clamp\(2\.35rem,3\.7vw,3\.5rem\)/);assert.match(variables,/--type-section:clamp\(1\.5rem,2vw,2rem\)/);assert.match(variables,/--type-body:1rem/);assert.match(typography,/#screen-overview > \.org-panel:first-child h2/);assert.match(typography,/font-size: clamp\(1\.625rem, 2vw, 2rem\)/);assert.match(typography,/\.intelligence-hub-page \.hero-actions[\s\S]*display: none !important/);

console.log("Organization Structure completion checks passed.");