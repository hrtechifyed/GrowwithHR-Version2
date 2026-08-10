import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createJurisdictionWave5aPayload,JURISDICTION_WAVE5A_FEATURE_ID as BROWSER_FEATURE_ID} from "../js/assessment-v3/jurisdiction-wave5a-explanation-api-client.js";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave5a.js"));
const loader=require(path.join(ROOT,"server-legal-rag-catalogs.js"));
const {createCompleteLegalModulesLoader}=require(path.join(ROOT,"server-legal-rag-modules.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const {JURISDICTION_WAVE5A_CATALOG_ID,JURISDICTION_WAVE5A_FEATURE_IDS}=require(path.join(ROOT,"server-jurisdiction-wave5a-rule-catalogs.js"));
const modules=await createCompleteLegalModulesLoader({retrievalMode:"lexical"})();
const ragRuntime=await import("../growwithhr-rag/legal-rag-runtime.js");
const registry=router.DEFAULT_PROFILE_REGISTRY;
const specifications=router.defaultFeatureSpecifications();
const validation=ragRuntime.validateLegalRagProfiles(registry);
assert.equal(validation.valid,true,JSON.stringify(validation.errors,null,2));
assert.equal(registry.profiles.length,57);
assert.equal(Object.keys(specifications).length,57);
assert.equal(registry.profiles.filter((p)=>p.catalogId===JURISDICTION_WAVE5A_CATALOG_ID).length,1);
assert.equal(registry.profiles.filter((p)=>p.catalogId===FALLBACK_CATALOG_ID).length,12);
const snapshot=loader.loadGovernedLegalCatalogs({profileRegistry:registry});
assert.equal(Object.keys(snapshot.catalogs).length,11);
assert.equal(snapshot.catalogs[JURISDICTION_WAVE5A_CATALOG_ID].sources.length,9);
assert.equal(snapshot.catalogs[JURISDICTION_WAVE5A_CATALOG_ID].chunks.length,10);
const status=router.statusPayload(registry,snapshot,"lexical");
assert.equal(status.profileCount,57);
assert.equal(status.substantiveProfileCount,45);
assert.equal(status.governanceFallbackProfileCount,12);
let scenarios=0;
for(const featureId of JURISDICTION_WAVE5A_FEATURE_IDS){
 const profile=registry.profiles.find((p)=>p.featureId===featureId),spec=specifications[featureId];
 assert.ok(profile);assert.ok(spec);assert.equal(profile.catalogId,JURISDICTION_WAVE5A_CATALOG_ID);
 const catalogValidation=modules.assurance.validateLegalRuleCatalog(spec.ruleCatalog);
 assert.equal(catalogValidation.valid,true,`${featureId}: ${JSON.stringify(catalogValidation.errors,null,2)}`);
 for(const scenario of spec.ruleCatalog.rules[0].automatedBoundaryTestScenarios){
  const normalized=spec.normalizeBody({answers:scenario.answers});
  const assurance=modules.assurance.evaluateLegalRuleAssurance({answers:normalized.answers,catalog:spec.ruleCatalog,evaluatedAt:"2026-08-06T18:00:00.000Z"});
  const decision=assurance.decisions[0];
  assert.equal(decision.status,scenario.expectedStatus,`${featureId}/${scenario.scenarioId}`);
  assert.equal(decision.reasonCode,scenario.expectedReasonCode,`${featureId}/${scenario.scenarioId}`);
  const routed=modules.ragRuntime.runLegalRagRetrieval({featureId,decision,registry,catalogs:snapshot.catalogs});
  assert.equal(routed.retrieval.retrievalStatus,"completed");
  assert.equal(routed.retrieval.usedForDecision,false);
  assert.equal(routed.retrieval.applicabilityAuthority,"none");
  assert.equal(routed.retrieval.retrievedChunks.length>0,true);
  assert.equal(routed.retrieval.retrievedChunks.every((chunk)=>decision.sourceRegistryIds.includes(chunk.registrySourceId)),true);
  const request=modules.contract.buildLegalExplanationRequest({decision,retrievalTrace:routed.retrieval,requestedAt:"2026-08-06T18:00:00.000Z"});
  const explanation=modules.contract.createDeterministicLegalExplanation({request});
  assert.equal(explanation.decisionStatus,decision.status);assert.equal(explanation.reasonCode,decision.reasonCode);
  scenarios+=1;
 }
}
assert.equal(scenarios,3);
assert.equal(BROWSER_FEATURE_ID,"feature.legal.jurisdiction.appropriate-government");
const payload=createJurisdictionWave5aPayload({answers:{
 appropriateGovernmentDeclaredRoute:"central-scope-candidate",appropriateGovernmentCrossCodeDefinitionSourceStatus:"evidenced",appropriateGovernmentCentralRulesSourceSetStatus:"evidenced",appropriateGovernmentStateUtSourceSetStatus:"evidenced",appropriateGovernmentEstablishmentActivityClassificationControl:"evidenced",appropriateGovernmentMultiLocationRoutingControl:"evidenced",appropriateGovernmentEffectiveDateVersionControl:"evidenced",appropriateGovernmentSpecialistEscalationControl:"evidenced",appropriateGovernmentEvidenceReferences:[{reference:"appropriate-government-source-routing-register",body:"private legal submission"}],
 companyName:"Private Company",address:"private address",registrationNumber:"REG-1",employeeName:"Private Person",wage:50000,disputeNarrative:"private dispute",noticeBody:"private notice",orderBody:"private order",contractBody:"private contract"
}});
assert.deepEqual(payload,{answers:{appropriateGovernmentDeclaredRoute:"central-scope-candidate",appropriateGovernmentCrossCodeDefinitionSourceStatus:"evidenced",appropriateGovernmentCentralRulesSourceSetStatus:"evidenced",appropriateGovernmentStateUtSourceSetStatus:"evidenced",appropriateGovernmentEstablishmentActivityClassificationControl:"evidenced",appropriateGovernmentMultiLocationRoutingControl:"evidenced",appropriateGovernmentEffectiveDateVersionControl:"evidenced",appropriateGovernmentSpecialistEscalationControl:"evidenced",appropriateGovernmentEvidenceReferences:["appropriate-government-source-routing-register"]}});
const payloadText=JSON.stringify(payload);
for(const prohibited of ["Private Company","private address","REG-1","Private Person","50000","private dispute","private notice","private order","private contract","private legal submission"])assert.equal(payloadText.includes(prohibited),false);
const manifest=require(path.join(ROOT,"growwithhr-rag/manifests/candidates/appropriate-government-source-pack.candidate.v1.json"));
const factContract=require(path.join(ROOT,"data/assessment/appropriate-government-assessment-fact-contract.v1.json"));
const sectionMap=require(path.join(ROOT,"data/legal-source-governance/appropriate-government-section-mapping.v1.json"));
assert.equal(manifest.publication.legalReviewStatus,"needs-legal-review");
assert.equal(factContract.providerPolicy.addressesAllowed,false);
assert.equal(sectionMap.features[0].approvalStatus,"not-approved");
console.log(JSON.stringify({valid:true,profileCount:57,substantiveProfiles:45,substantiveJurisdictionWave5aProfiles:1,wave5aScenarios:scenarios,governanceFallbackProfiles:12,activeCatalogs:11,jurisdictionWave5aSources:9,jurisdictionWave5aChunks:10},null,2));
