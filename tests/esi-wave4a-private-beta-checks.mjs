import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createEsiWave4aPayload,ESI_WAVE4A_FEATURE_IDS as BROWSER_FEATURE_IDS} from "../js/assessment-v3/esi-wave4a-explanation-api-client.js";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave4a.js"));
const loader=require(path.join(ROOT,"server-legal-rag-catalogs.js"));
const {createCompleteLegalModulesLoader}=require(path.join(ROOT,"server-legal-rag-modules.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const {ESI_WAVE4A_CATALOG_ID,ESI_WAVE4A_FEATURE_IDS}=require(path.join(ROOT,"server-esi-wave4a-rule-catalogs.js"));
const modules=await createCompleteLegalModulesLoader({retrievalMode:"lexical"})();
const ragRuntime=await import("../growwithhr-rag/legal-rag-runtime.js");
const registry=router.DEFAULT_PROFILE_REGISTRY;
const specifications=router.defaultFeatureSpecifications();
const validation=ragRuntime.validateLegalRagProfiles(registry);
assert.equal(validation.valid,true,JSON.stringify(validation.errors,null,2));
assert.equal(registry.profiles.length,57);
assert.equal(Object.keys(specifications).length,57);
assert.equal(registry.profiles.filter((p)=>p.catalogId===ESI_WAVE4A_CATALOG_ID).length,5);
assert.equal(registry.profiles.filter((p)=>p.catalogId===FALLBACK_CATALOG_ID).length,23);
const snapshot=loader.loadGovernedLegalCatalogs({profileRegistry:registry});
assert.equal(Object.keys(snapshot.catalogs).length,7);
assert.equal(snapshot.catalogs[ESI_WAVE4A_CATALOG_ID].sources.length,6);
assert.equal(snapshot.catalogs[ESI_WAVE4A_CATALOG_ID].chunks.length,11);
const status=router.statusPayload(registry,snapshot,"lexical");
assert.equal(status.profileCount,57);
assert.equal(status.substantiveProfileCount,34);
assert.equal(status.governanceFallbackProfileCount,23);
let scenarios=0;
for(const featureId of ESI_WAVE4A_FEATURE_IDS){
 const profile=registry.profiles.find((p)=>p.featureId===featureId),spec=specifications[featureId];
 assert.ok(profile);assert.ok(spec);assert.equal(profile.catalogId,ESI_WAVE4A_CATALOG_ID);
 const catalogValidation=modules.assurance.validateLegalRuleCatalog(spec.ruleCatalog);
 assert.equal(catalogValidation.valid,true,`${featureId}: ${JSON.stringify(catalogValidation.errors,null,2)}`);
 for(const scenario of spec.ruleCatalog.rules[0].automatedBoundaryTestScenarios){
  const normalized=spec.normalizeBody({answers:scenario.answers});
  const assurance=modules.assurance.evaluateLegalRuleAssurance({answers:normalized.answers,catalog:spec.ruleCatalog,evaluatedAt:"2026-08-06T14:50:00.000Z"});
  const decision=assurance.decisions[0];
  assert.equal(decision.status,scenario.expectedStatus,`${featureId}/${scenario.scenarioId}`);
  assert.equal(decision.reasonCode,scenario.expectedReasonCode,`${featureId}/${scenario.scenarioId}`);
  const routed=modules.ragRuntime.runLegalRagRetrieval({featureId,decision,registry,catalogs:snapshot.catalogs});
  assert.equal(routed.retrieval.retrievalStatus,"completed");
  assert.equal(routed.retrieval.usedForDecision,false);
  assert.equal(routed.retrieval.applicabilityAuthority,"none");
  assert.equal(routed.retrieval.retrievedChunks.length>0,true);
  assert.equal(routed.retrieval.retrievedChunks.every((chunk)=>decision.sourceRegistryIds.includes(chunk.registrySourceId)),true);
  const request=modules.contract.buildLegalExplanationRequest({decision,retrievalTrace:routed.retrieval,requestedAt:"2026-08-06T14:50:00.000Z"});
  const explanation=modules.contract.createDeterministicLegalExplanation({request});
  assert.equal(explanation.decisionStatus,decision.status);assert.equal(explanation.reasonCode,decision.reasonCode);
  scenarios+=1;
 }
}
assert.equal(scenarios,15);
assert.equal(BROWSER_FEATURE_IDS.length,5);
const payload=createEsiWave4aPayload("feature.legal.esi.accident-reporting-control",{answers:{
 esiEmployeeRegisterControl:"evidenced",esiAccidentBookControl:"evidenced",esiSeriousAccidentEscalationControl:"evidenced",
 esiNonSeriousAccidentReportingControl:"evidenced",esiAccidentNarrativeExclusionControl:"evidenced",
 esiAccidentEvidenceReferences:[{reference:"esi-accident-control-register",body:"private accident narrative"}],
 employeeName:"Private Person",aadhaar:"1234",insuranceNumber:"IP-1",employeeWage:50000,payrollRows:[{employee:"Private Person"}],
 accidentNarrative:"private accident narrative",diagnosis:"private diagnosis",claimBody:"private claim"
}});
assert.deepEqual(payload,{answers:{
 esiEmployeeRegisterControl:"evidenced",esiAccidentBookControl:"evidenced",esiSeriousAccidentEscalationControl:"evidenced",
 esiNonSeriousAccidentReportingControl:"evidenced",esiAccidentNarrativeExclusionControl:"evidenced",esiAccidentEvidenceReferences:["esi-accident-control-register"]
}});
const payloadText=JSON.stringify(payload);
for(const prohibited of ["Private Person","1234","IP-1","50000","private accident narrative","private diagnosis","private claim"])assert.equal(payloadText.includes(prohibited),false);
console.log(JSON.stringify({valid:true,profileCount:57,substantiveProfiles:34,substantiveEsiWave4aProfiles:5,wave4aScenarios:scenarios,governanceFallbackProfiles:23,activeCatalogs:7,esiWave4aSources:6,esiWave4aChunks:11},null,2));
