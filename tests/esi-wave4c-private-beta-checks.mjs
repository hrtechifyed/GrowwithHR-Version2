import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createEsiWave4cPayload,ESI_WAVE4C_FEATURE_IDS as BROWSER_FEATURE_IDS} from "../js/assessment-v3/esi-wave4c-explanation-api-client.js";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave4c.js"));
const loader=require(path.join(ROOT,"server-legal-rag-catalogs.js"));
const {createCompleteLegalModulesLoader}=require(path.join(ROOT,"server-legal-rag-modules.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const {ESI_WAVE4C_CATALOG_ID,ESI_WAVE4C_FEATURE_IDS}=require(path.join(ROOT,"server-esi-wave4c-rule-catalogs.js"));
const modules=await createCompleteLegalModulesLoader({retrievalMode:"lexical"})();
const ragRuntime=await import("../growwithhr-rag/legal-rag-runtime.js");
const registry=router.DEFAULT_PROFILE_REGISTRY;
const specifications=router.defaultFeatureSpecifications();
const validation=ragRuntime.validateLegalRagProfiles(registry);
assert.equal(validation.valid,true,JSON.stringify(validation.errors,null,2));
assert.equal(registry.profiles.length,57);
assert.equal(Object.keys(specifications).length,57);
assert.equal(registry.profiles.filter((p)=>p.catalogId===ESI_WAVE4C_CATALOG_ID).length,3);
assert.equal(registry.profiles.filter((p)=>p.catalogId===FALLBACK_CATALOG_ID).length,15);
const snapshot=loader.loadGovernedLegalCatalogs({profileRegistry:registry});
assert.equal(Object.keys(snapshot.catalogs).length,9);
assert.equal(snapshot.catalogs[ESI_WAVE4C_CATALOG_ID].sources.length,7);
assert.equal(snapshot.catalogs[ESI_WAVE4C_CATALOG_ID].chunks.length,10);
const status=router.statusPayload(registry,snapshot,"lexical");
assert.equal(status.profileCount,57);
assert.equal(status.substantiveProfileCount,42);
assert.equal(status.governanceFallbackProfileCount,15);
let scenarios=0;
for(const featureId of ESI_WAVE4C_FEATURE_IDS){
 const profile=registry.profiles.find((p)=>p.featureId===featureId),spec=specifications[featureId];
 assert.ok(profile);assert.ok(spec);assert.equal(profile.catalogId,ESI_WAVE4C_CATALOG_ID);
 const catalogValidation=modules.assurance.validateLegalRuleCatalog(spec.ruleCatalog);
 assert.equal(catalogValidation.valid,true,`${featureId}: ${JSON.stringify(catalogValidation.errors,null,2)}`);
 for(const scenario of spec.ruleCatalog.rules[0].automatedBoundaryTestScenarios){
  const normalized=spec.normalizeBody({answers:scenario.answers});
  const assurance=modules.assurance.evaluateLegalRuleAssurance({answers:normalized.answers,catalog:spec.ruleCatalog,evaluatedAt:"2026-08-06T16:30:00.000Z"});
  const decision=assurance.decisions[0];
  assert.equal(decision.status,scenario.expectedStatus,`${featureId}/${scenario.scenarioId}`);
  assert.equal(decision.reasonCode,scenario.expectedReasonCode,`${featureId}/${scenario.scenarioId}`);
  const routed=modules.ragRuntime.runLegalRagRetrieval({featureId,decision,registry,catalogs:snapshot.catalogs});
  assert.equal(routed.retrieval.retrievalStatus,"completed");
  assert.equal(routed.retrieval.usedForDecision,false);
  assert.equal(routed.retrieval.applicabilityAuthority,"none");
  assert.equal(routed.retrieval.retrievedChunks.length>0,true);
  assert.equal(routed.retrieval.retrievedChunks.every((chunk)=>decision.sourceRegistryIds.includes(chunk.registrySourceId)),true);
  const request=modules.contract.buildLegalExplanationRequest({decision,retrievalTrace:routed.retrieval,requestedAt:"2026-08-06T16:30:00.000Z"});
  const explanation=modules.contract.createDeterministicLegalExplanation({request});
  assert.equal(explanation.decisionStatus,decision.status);assert.equal(explanation.reasonCode,decision.reasonCode);
  scenarios+=1;
 }
}
assert.equal(scenarios,9);
assert.equal(BROWSER_FEATURE_IDS.length,3);
const payload=createEsiWave4cPayload("feature.legal.esi.medical-administration",{answers:{
 esiMedicalAdministrationDeclaredModel:"state-government-model",esiMedicalLocalImplementationSourceStatus:"evidenced",
 esiStateCorporationAgreementSourceStatus:"evidenced",esiMedicalPractitionerAuthoritySourceStatus:"evidenced",
 esiOtherBeneficiarySchemeSourceStatus:"evidenced",esiMedicalRecordsExclusionControl:"evidenced",
 esiStateMedicalSourceEscalationControl:"evidenced",esiMedicalAdministrationEvidenceReferences:[{reference:"esi-medical-administration-source-register",body:"private treatment record"}],
 employeeName:"Private Person",aadhaar:"1234",insuranceNumber:"IP-1",diagnosis:"private diagnosis",medicalCertificate:"private certificate",
 prescription:"private prescription",treatmentRecord:"private treatment record",familyDetails:"private family",claimBody:"private claim"
}});
assert.deepEqual(payload,{answers:{
 esiMedicalAdministrationDeclaredModel:"state-government-model",esiMedicalLocalImplementationSourceStatus:"evidenced",
 esiStateCorporationAgreementSourceStatus:"evidenced",esiMedicalPractitionerAuthoritySourceStatus:"evidenced",
 esiOtherBeneficiarySchemeSourceStatus:"evidenced",esiMedicalRecordsExclusionControl:"evidenced",
 esiStateMedicalSourceEscalationControl:"evidenced",esiMedicalAdministrationEvidenceReferences:["esi-medical-administration-source-register"]
}});
const payloadText=JSON.stringify(payload);
for(const prohibited of ["Private Person","1234","IP-1","private diagnosis","private certificate","private prescription","private treatment record","private family","private claim"])assert.equal(payloadText.includes(prohibited),false);
console.log(JSON.stringify({valid:true,profileCount:57,substantiveProfiles:42,substantiveEsiWave4cProfiles:3,wave4cScenarios:scenarios,governanceFallbackProfiles:15,activeCatalogs:9,esiWave4cSources:7,esiWave4cChunks:10},null,2));
