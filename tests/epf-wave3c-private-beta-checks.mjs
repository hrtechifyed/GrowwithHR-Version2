import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createEpfWave3cPayload,EPF_WAVE3C_FEATURE_IDS as BROWSER_FEATURE_IDS} from "../js/assessment-v3/epf-wave3c-explanation-api-client.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave3c.js"));
const loader=require(path.join(ROOT,"server-legal-rag-catalogs.js"));
const {createCompleteLegalModulesLoader}=require(path.join(ROOT,"server-legal-rag-modules.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const {EPF_WAVE3C_CATALOG_ID,EPF_WAVE3C_FEATURE_IDS}=require(path.join(ROOT,"server-epf-wave3c-rule-catalogs.js"));

const modules=await createCompleteLegalModulesLoader({retrievalMode:"lexical"})();
const ragRuntime=await import("../growwithhr-rag/legal-rag-runtime.js");
const registry=router.DEFAULT_PROFILE_REGISTRY;
const specifications=router.defaultFeatureSpecifications();
const validation=ragRuntime.validateLegalRagProfiles(registry);
assert.equal(validation.valid,true,JSON.stringify(validation.errors,null,2));
assert.equal(registry.profiles.length,57);
assert.equal(Object.keys(specifications).length,57);
assert.equal(registry.profiles.filter((p)=>p.catalogId===EPF_WAVE3C_CATALOG_ID).length,2);
assert.equal(registry.profiles.filter((p)=>p.catalogId===FALLBACK_CATALOG_ID).length,28);

const snapshot=loader.loadGovernedLegalCatalogs({profileRegistry:registry});
assert.equal(Object.keys(snapshot.catalogs).length,6);
assert.equal(snapshot.catalogs[EPF_WAVE3C_CATALOG_ID].sources.length,8);
assert.equal(snapshot.catalogs[EPF_WAVE3C_CATALOG_ID].chunks.length,9);
const status=router.statusPayload(registry,snapshot,"lexical");
assert.equal(status.profileCount,57);
assert.equal(status.substantiveProfileCount,29);
assert.equal(status.governanceFallbackProfileCount,28);

let scenarios=0;
for(const featureId of EPF_WAVE3C_FEATURE_IDS){
 const profile=registry.profiles.find((p)=>p.featureId===featureId),spec=specifications[featureId];
 assert.ok(profile);assert.ok(spec);assert.equal(profile.catalogId,EPF_WAVE3C_CATALOG_ID);
 const catalogValidation=modules.assurance.validateLegalRuleCatalog(spec.ruleCatalog);
 assert.equal(catalogValidation.valid,true,`${featureId}: ${JSON.stringify(catalogValidation.errors,null,2)}`);
 for(const scenario of spec.ruleCatalog.rules[0].automatedBoundaryTestScenarios){
  const normalized=spec.normalizeBody({answers:scenario.answers});
  const assurance=modules.assurance.evaluateLegalRuleAssurance({answers:normalized.answers,catalog:spec.ruleCatalog,evaluatedAt:"2026-08-06T13:30:00.000Z"});
  const decision=assurance.decisions[0];
  assert.equal(decision.status,scenario.expectedStatus,`${featureId}/${scenario.scenarioId}`);
  assert.equal(decision.reasonCode,scenario.expectedReasonCode,`${featureId}/${scenario.scenarioId}`);
  const routed=modules.ragRuntime.runLegalRagRetrieval({featureId,decision,registry,catalogs:snapshot.catalogs});
  assert.equal(routed.retrieval.retrievalStatus,"completed");
  assert.equal(routed.retrieval.usedForDecision,false);
  assert.equal(routed.retrieval.applicabilityAuthority,"none");
  assert.equal(routed.retrieval.retrievedChunks.length>0,true);
  assert.equal(routed.retrieval.retrievedChunks.every((chunk)=>decision.sourceRegistryIds.includes(chunk.registrySourceId)),true);
  const request=modules.contract.buildLegalExplanationRequest({decision,retrievalTrace:routed.retrieval,requestedAt:"2026-08-06T13:30:00.000Z"});
  const explanation=modules.contract.createDeterministicLegalExplanation({request});
  assert.equal(explanation.decisionStatus,decision.status);assert.equal(explanation.reasonCode,decision.reasonCode);
  scenarios+=1;
 }
}
assert.equal(scenarios,6);
assert.equal(BROWSER_FEATURE_IDS.length,2);

const payload=createEpfWave3cPayload("feature.legal.epf.international-worker-review",{answers:{
 epfIwPopulationReviewStatus:"evidenced",epfIwSsaRouteStatus:"evidenced",epfIwCertificateControlStatus:"evidenced",
 epfIwExpiryMonitoringControl:"evidenced",epfIwMembershipEscalationControl:"evidenced",
 epfIwEvidenceReferences:[{reference:"iw-route-control-register",body:"private certificate body"}],
 employeeName:"Private Person",passportNumber:"P123",nationality:"Private",certificateBody:"private certificate body",
 uan:"private-uan",wageAmount:100000,payrollRows:[{employee:"Private Person"}]
}});
assert.deepEqual(payload,{answers:{
 epfIwPopulationReviewStatus:"evidenced",epfIwSsaRouteStatus:"evidenced",epfIwCertificateControlStatus:"evidenced",
 epfIwExpiryMonitoringControl:"evidenced",epfIwMembershipEscalationControl:"evidenced",
 epfIwEvidenceReferences:["iw-route-control-register"]
}});
const payloadText=JSON.stringify(payload);
for(const prohibited of ["Private Person","P123","Private","private certificate body","private-uan","100000"])assert.equal(payloadText.includes(prohibited),false);

console.log(JSON.stringify({valid:true,profileCount:57,substantiveProfiles:29,substantiveWave3cProfiles:2,wave3cScenarios:scenarios,governanceFallbackProfiles:28,activeCatalogs:6,wave3cSources:8,wave3cChunks:9},null,2));
