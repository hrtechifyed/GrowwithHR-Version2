import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave5l.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const research=require(path.join(ROOT,"data/legal-source-governance/multi-country-employment-scope-research.v1.json"));
const manifest=require(path.join(ROOT,"growwithhr-rag/manifests/candidates/multi-country-employment-source-pack.candidate.v1.json"));

const registry=router.DEFAULT_PROFILE_REGISTRY;
assert.equal(registry.profiles.length,57);
assert.equal(registry.catalogs.length,21);
assert.equal(registry.profiles.filter((profile)=>profile.catalogId===FALLBACK_CATALOG_ID).length,2);
assert.equal(registry.profiles.filter((profile)=>profile.catalogId!==FALLBACK_CATALOG_ID).length,55);

const featureId="feature.legal.multi-country-employment";
const profile=registry.profiles.find((item)=>item.featureId===featureId);
assert.ok(profile,"Multi-country Employment profile must remain registered.");
assert.equal(profile.catalogId,FALLBACK_CATALOG_ID);
assert.equal(profile.privateBetaMode,"governance-fallback");
assert.equal(profile.explanationEnabled,true);

assert.equal(research.featureId,featureId);
assert.equal(research.status,"outside-supported-jurisdiction-country-pair-and-data-approval-required");
assert.equal(research.classification,"outside-current-india-law-scope");
assert.equal(research.assessmentCapture,false);
assert.equal(research.runtimeActivation,false);
assert.equal(research.ragCatalogCreationAllowed,false);
assert.equal(research.browserSurfaceAllowed,false);
assert.equal(research.providerRouteAllowed,false);
assert.equal(research.countryPair.selected,false);
assert.equal(research.countryPair.countryA,null);
assert.equal(research.countryPair.countryB,null);
assert.equal(research.crossBorderDataApproval.required,true);
assert.equal(research.crossBorderDataApproval.status,"not-approved");
assert.equal(research.researchLeads.length,5);
assert.equal(research.requiredCountryPairResearchDomains.length>=10,true);

const blockerIds=new Set(research.hardBlockers.map((item)=>item.id));
for(const blocker of [
  "country-pair-selection",
  "specialist-jurisdictional-approval",
  "cross-border-data-approval",
  "immigration-work-authorisation-pack",
  "tax-treaty-payroll-pack",
  "social-security-ssa-pack",
  "employment-law-source-pack",
  "country-pair-source-fingerprints",
  "privacy-safe-fact-contract"
]) assert.equal(blockerIds.has(blocker),true,blocker);

const dpdp=research.researchLeads.find((item)=>item.id==="india-dpdp-act-2023");
assert.ok(dpdp);
assert.match(dpdp.notes,/must not treat section 16 as an operative transfer rule as of 10 August 2026/);
const ssa=research.researchLeads.find((item)=>item.id==="india-epfo-international-worker-ssa-current");
assert.ok(ssa);
assert.match(ssa.notes,/No SSA, certificate-of-coverage route, exclusion or contribution outcome may be selected/);
const immigration=research.researchLeads.find((item)=>item.id==="india-immigration-foreigners-act-2025");
assert.ok(immigration);
assert.match(immigration.notes,/does not select a visa\/work-authorisation route/);

const prohibited=research.prohibitedData.join(" ").toLowerCase();
for(const term of ["identity","passport","visa","tax identifiers","residency-day","uan","payroll","bank","medical","termination","precise employee location","evidence"])
  assert.equal(prohibited.includes(term),true,term);

assert.equal(research.futureProductBoundary.countryPairMustBeExplicit,true);
assert.equal(research.futureProductBoundary.organisationLevelRoutingOnly,true);
for(const key of [
  "personLevelMobilityCaseIntakeAllowed",
  "immigrationDecisionAllowed",
  "taxResidencyDecisionAllowed",
  "taxTreatyOrPermanentEstablishmentDecisionAllowed",
  "payrollOrWithholdingCalculationAllowed",
  "socialSecurityCoverageDecisionAllowed",
  "employmentLawApplicabilityDecisionAllowed",
  "crossBorderDataTransferApprovalByProductAllowed",
  "providerNarrativeAnalysisOfPersonLevelDataAllowed"
]) assert.equal(research.futureProductBoundary[key],false,key);

assert.equal(manifest.status,"outside-scope-country-pair-and-data-approval-required");
assert.equal(manifest.runtimeActivation,false);
assert.equal(manifest.assessmentCapture,false);
assert.equal(manifest.browserSurface,false);
assert.equal(manifest.providerRoute,false);
assert.equal(manifest.catalogPublication,false);
assert.equal(manifest.catalogPath,null);
assert.equal(manifest.chunks,0);
assert.equal(manifest.controlledSources,0);
assert.equal(manifest.researchLeadCount,5);
assert.equal(manifest.countryPairSelected,false);
assert.equal(manifest.crossBorderDataApproval,"not-approved");
assert.equal(manifest.runtimeInvariant.expectedCallableProfiles,57);
assert.equal(manifest.runtimeInvariant.expectedSubstantiveProfiles,55);
assert.equal(manifest.runtimeInvariant.expectedGovernanceFallbackProfiles,2);
assert.equal(manifest.runtimeInvariant.expectedActiveCatalogs,21);
assert.equal(manifest.runtimeInvariant.multiCountryEmploymentMustRemainGovernanceFallback,true);

for(const relativePath of [
  "data/assessment/multi-country-employment-assessment-fact-contract.v1.json",
  "growwithhr-rag/data/multi-country-employment-source-chunks.v1.json",
  "js/assessment-v3/multi-country-employment-wave5m-explanation-api-client.js",
  "js/assessment-v3/multi-country-employment-wave5m-explanation-panel.js",
  "server-multi-country-employment-wave5m-configs.js",
  "server-multi-country-employment-wave5m-runtime.js",
  "server-multi-country-employment-wave5m-rule-catalogs.js",
  "server-all-laws-private-beta-wave5m.js",
  "server-all-laws-rule-catalogs-wave5m.js",
  "server-legal-explanation-router-wave5m.js"
]) assert.equal(fs.existsSync(path.join(ROOT,relativePath)),false,`${relativePath} must not exist while Wave 5M is outside supported jurisdiction.`);

console.log(JSON.stringify({
  valid:true,
  profileCount:57,
  substantiveProfiles:55,
  governanceFallbackProfiles:2,
  activeCatalogs:21,
  multiCountryEmploymentMode:profile.privateBetaMode,
  countryPairSelected:research.countryPair.selected,
  controlledSources:manifest.controlledSources,
  researchLeads:research.researchLeads.length,
  activationBlockers:research.hardBlockers.length,
  assessmentCapture:research.assessmentCapture,
  runtimeActivation:research.runtimeActivation
},null,2));
