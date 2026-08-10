import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave5i.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const research=require(path.join(ROOT,"data/legal-source-governance/bonded-forced-labour-specialist-research.v1.json"));
const manifest=require(path.join(ROOT,"growwithhr-rag/manifests/candidates/bonded-forced-labour-source-pack.candidate.v1.json"));

const registry=router.DEFAULT_PROFILE_REGISTRY;
assert.equal(registry.profiles.length,57);
assert.equal(registry.catalogs.length,19);
assert.equal(registry.profiles.filter((profile)=>profile.catalogId===FALLBACK_CATALOG_ID).length,4);
assert.equal(registry.profiles.filter((profile)=>profile.catalogId!==FALLBACK_CATALOG_ID).length,53);

const featureId="feature.legal.bonded-forced-labour";
const profile=registry.profiles.find((item)=>item.featureId===featureId);
assert.ok(profile,"Bonded/forced-labour profile must remain registered.");
assert.equal(profile.catalogId,FALLBACK_CATALOG_ID);
assert.equal(profile.privateBetaMode,"governance-fallback");

assert.equal(research.featureId,featureId);
assert.equal(research.status,"research-inventory-prepared-runtime-blocked");
assert.equal(research.assessmentCapture,false);
assert.equal(research.runtimeActivation,false);
assert.equal(research.ragCatalogCreationAllowed,false);
assert.equal(research.browserSurfaceAllowed,false);
assert.equal(research.futureAssessmentBoundary.captureAllowed,false);
assert.equal(research.futureAssessmentBoundary.indicatorTaxonomyCaptureAllowed,false);
assert.equal(research.futureAssessmentBoundary.caseIntakeAllowed,false);
assert.equal(research.futureAssessmentBoundary.riskScoringAllowed,false);
assert.equal(research.futureAssessmentBoundary.automatedClassificationAllowed,false);
assert.equal(research.futureAssessmentBoundary.providerNarrativeAnalysisAllowed,false);
assert.equal(research.sourceInventory.length,9);

const blockerIds=new Set(research.hardBlockers.map((item)=>item.id));
for(const blocker of [
  "exact-2026-ministry-sop",
  "labour-welfare-scheme-2026-31-operational-plan",
  "qualified-cross-framework-legal-mapping",
  "safeguarding-human-escalation-design",
  "privacy-access-retention-design",
  "state-operational-variation-review"
]) assert.equal(blockerIds.has(blocker),true,blocker);

const sop=research.sourceInventory.find((source)=>source.sourceId==="ministry-bonded-labour-sop-2026");
assert.ok(sop);
assert.equal(sop.status,"exact-official-ministry-file-pending");
assert.equal(sop.officialUrl,null);
const scheme=research.sourceInventory.find((source)=>source.sourceId==="bonded-labour-rehabilitation-scheme-2021");
assert.ok(scheme);
assert.equal(scheme.status,"historical-current-transition-basis-not-standalone-2026-31-authority");

const prohibitedText=research.prohibitedData.join(" ").toLowerCase();
for(const term of ["identity","aadhaar","debt","confinement","violence","trafficking","fir","witness","rehabilitation application","evidence"])
  assert.equal(prohibitedText.includes(term),true,term);

assert.equal(manifest.status,"research-only-blocked");
assert.equal(manifest.runtimeActivation,false);
assert.equal(manifest.assessmentCapture,false);
assert.equal(manifest.browserSurface,false);
assert.equal(manifest.catalogPublication,false);
assert.equal(manifest.catalogPath,null);
assert.equal(manifest.chunks,0);
assert.equal(manifest.sources.count,9);
assert.equal(manifest.runtimeInvariant.expectedCallableProfiles,57);
assert.equal(manifest.runtimeInvariant.expectedSubstantiveProfiles,53);
assert.equal(manifest.runtimeInvariant.expectedGovernanceFallbackProfiles,4);
assert.equal(manifest.runtimeInvariant.expectedActiveCatalogs,19);
assert.equal(manifest.runtimeInvariant.bondedForcedLabourMustRemainGovernanceFallback,true);

for(const relativePath of [
  "data/assessment/bonded-forced-labour-assessment-fact-contract.v1.json",
  "growwithhr-rag/data/bonded-forced-labour-source-chunks.v1.json",
  "js/assessment-v3/bonded-forced-labour-wave5j-explanation-api-client.js",
  "js/assessment-v3/bonded-forced-labour-wave5j-explanation-panel.js",
  "server-bonded-forced-labour-wave5j-configs.js",
  "server-bonded-forced-labour-wave5j-rule-catalogs.js",
  "server-legal-explanation-router-wave5j.js"
]) assert.equal(fs.existsSync(path.join(ROOT,relativePath)),false,`${relativePath} must not exist in research-only Wave 5J.`);

console.log(JSON.stringify({
  valid:true,
  profileCount:57,
  substantiveProfiles:53,
  governanceFallbackProfiles:4,
  activeCatalogs:19,
  bondedForcedLabourMode:profile.privateBetaMode,
  researchSources:research.sourceInventory.length,
  activationBlockers:research.hardBlockers.length,
  assessmentCapture:research.assessmentCapture,
  runtimeActivation:research.runtimeActivation
},null,2));
