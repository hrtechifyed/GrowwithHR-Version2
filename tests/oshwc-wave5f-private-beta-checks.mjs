import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createOshwcWave5fPayload,OSHWC_WAVE5F_FEATURE_ID as BROWSER_FEATURE_ID} from "../js/assessment-v3/oshwc-wave5f-explanation-api-client.js";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave5f.js"));
const loader=require(path.join(ROOT,"server-legal-rag-catalogs.js"));
const {createCompleteLegalModulesLoader}=require(path.join(ROOT,"server-legal-rag-modules.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const {OSHWC_WAVE5F_CATALOG_ID,OSHWC_WAVE5F_FEATURE_IDS}=require(path.join(ROOT,"server-oshwc-wave5f-rule-catalogs.js"));
const modules=await createCompleteLegalModulesLoader({retrievalMode:"lexical"})();
const ragRuntime=await import("../growwithhr-rag/legal-rag-runtime.js");
const registry=router.DEFAULT_PROFILE_REGISTRY;
const specifications=router.defaultFeatureSpecifications();
const validation=ragRuntime.validateLegalRagProfiles(registry);
assert.equal(validation.valid,true,JSON.stringify(validation.errors,null,2));
assert.equal(registry.profiles.length,57);
assert.equal(Object.keys(specifications).length,57);
assert.equal(registry.profiles.filter((p)=>p.catalogId===OSHWC_WAVE5F_CATALOG_ID).length,1);
assert.equal(registry.profiles.filter((p)=>p.catalogId===FALLBACK_CATALOG_ID).length,7);
const snapshot=loader.loadGovernedLegalCatalogs({profileRegistry:registry});
assert.equal(Object.keys(snapshot.catalogs).length,16);
const catalog=snapshot.catalogs[OSHWC_WAVE5F_CATALOG_ID];
assert.equal(catalog.sources.length,5);
assert.equal(catalog.chunks.length,10);
const expectedHashes={"oshwc-code-2020":"a16e2e5e980224459cea500c0697275762adf4fa5f6464d424f91fbbf9603ca8","oshwc-central-rules-2026":"12c17f19e507809a30d65ae44ce592282d3933f05d89b7fb89fddacdcadfd2d4","oshwc-commencement-so-5321e-2025":"836979a68fce8df7276b9d295b9375ba7f770e41abbbccb75b0926d6503f9cb4","maharashtra-oshwc-labour-draft-rules-2026":"20764637f97dd80a0d8db21fcadfa121df8bb2e225cf721fb98688c93c29db4b","maharashtra-oshwc-factories-ports-draft-rules-2026":"8ef031cdcb90a08c1a799df527d9f57a4309ab706451fdebc518144a7ad8a7a9"};
for(const [id,sha] of Object.entries(expectedHashes)){const source=catalog.sources.find((item)=>item.registrySourceId===id);assert.ok(source,id);assert.equal(source.sha256,sha,id);assert.equal(source.fingerprintBasis,"curated-source-identity-v1",id);assert.equal(source.snapshotRole,"source-identity-only",id);}
for(const id of ["maharashtra-oshwc-labour-draft-rules-2026","maharashtra-oshwc-factories-ports-draft-rules-2026"]){const source=catalog.sources.find((item)=>item.registrySourceId===id);assert.equal(source.instrumentStatus,"draft",id);}
const status=router.statusPayload(registry,snapshot,"lexical");
assert.equal(status.profileCount,57);
assert.equal(status.substantiveProfileCount,50);
assert.equal(status.governanceFallbackProfileCount,7);
let scenarios=0;
for(const featureId of OSHWC_WAVE5F_FEATURE_IDS){
 const profile=registry.profiles.find((p)=>p.featureId===featureId),spec=specifications[featureId];
 assert.ok(profile);assert.ok(spec);assert.equal(profile.catalogId,OSHWC_WAVE5F_CATALOG_ID);
 const catalogValidation=modules.assurance.validateLegalRuleCatalog(spec.ruleCatalog);
 assert.equal(catalogValidation.valid,true,`${featureId}: ${JSON.stringify(catalogValidation.errors,null,2)}`);
 for(const scenario of spec.ruleCatalog.rules[0].automatedBoundaryTestScenarios){
  const normalized=spec.normalizeBody({answers:scenario.answers});
  const assurance=modules.assurance.evaluateLegalRuleAssurance({answers:normalized.answers,catalog:spec.ruleCatalog,evaluatedAt:"2026-08-07T00:00:00.000Z"});
  const decision=assurance.decisions[0];
  assert.equal(decision.status,scenario.expectedStatus,`${featureId}/${scenario.scenarioId}`);
  assert.equal(decision.reasonCode,scenario.expectedReasonCode,`${featureId}/${scenario.scenarioId}`);
  const routed=modules.ragRuntime.runLegalRagRetrieval({featureId,decision,registry,catalogs:snapshot.catalogs});
  assert.equal(routed.retrieval.retrievalStatus,"completed");
  assert.equal(routed.retrieval.usedForDecision,false);
  assert.equal(routed.retrieval.applicabilityAuthority,"none");
  assert.equal(routed.retrieval.retrievedChunks.length>0,true);
  assert.equal(routed.retrieval.retrievedChunks.every((chunk)=>decision.sourceRegistryIds.includes(chunk.registrySourceId)),true);
  const request=modules.contract.buildLegalExplanationRequest({decision,retrievalTrace:routed.retrieval,requestedAt:"2026-08-07T00:00:00.000Z"});
  const explanation=modules.contract.createDeterministicLegalExplanation({request});
  assert.equal(explanation.decisionStatus,decision.status);assert.equal(explanation.reasonCode,decision.reasonCode);
  scenarios+=1;
 }
}
assert.equal(scenarios,3);
assert.equal(BROWSER_FEATURE_ID,"feature.legal.oshwc");
const payload=createOshwcWave5fPayload({answers:{
 oshwcDeclaredSourceRoute:"maharashtra-general-labour-candidate",oshwcCodeSourceStatus:"evidenced",oshwcCentralRulesSourceStatus:"evidenced",oshwcCommencementSourceStatus:"evidenced",oshwcMaharashtraLabourDraftRulesStatus:"evidenced",oshwcMaharashtraFactoriesPortsDraftRulesStatus:"evidenced",oshwcDraftFinalReconciliationControl:"evidenced",oshwcEstablishmentScopeControl:"evidenced",oshwcRegistrationSourceControl:"evidenced",oshwcCoreSafetyHealthWelfareSourceControl:"evidenced",oshwcHoursLeaveRecordsSourceControl:"evidenced",oshwcAuthorityEnforcementSourceControl:"evidenced",oshwcDeferredSpecialCategoriesControl:"evidenced",oshwcSpecialistEscalationControl:"evidenced",oshwcEvidenceReferences:[{reference:"oshwc-source-readiness-register",body:"private evidence body"}],
 employeeName:"Private Person",employeeAge:42,employeeSex:"private sex",address:"private address",registrationNumber:"private registration",workSchedule:"private schedule",attendance:"private attendance",payrollBody:"private payroll",wageRecord:"private wage",appointmentLetter:"private appointment",medicalRecord:"private medical",accidentNarrative:"private accident",dangerousOccurrence:"private occurrence",licenceBody:"private licence",certificateBody:"private certificate",noticeBody:"private notice",orderBody:"private order",penaltyBody:"private penalty",disputeBody:"private dispute"
}});
assert.deepEqual(payload,{answers:{oshwcDeclaredSourceRoute:"maharashtra-general-labour-candidate",oshwcCodeSourceStatus:"evidenced",oshwcCentralRulesSourceStatus:"evidenced",oshwcCommencementSourceStatus:"evidenced",oshwcMaharashtraLabourDraftRulesStatus:"evidenced",oshwcMaharashtraFactoriesPortsDraftRulesStatus:"evidenced",oshwcDraftFinalReconciliationControl:"evidenced",oshwcEstablishmentScopeControl:"evidenced",oshwcRegistrationSourceControl:"evidenced",oshwcCoreSafetyHealthWelfareSourceControl:"evidenced",oshwcHoursLeaveRecordsSourceControl:"evidenced",oshwcAuthorityEnforcementSourceControl:"evidenced",oshwcDeferredSpecialCategoriesControl:"evidenced",oshwcSpecialistEscalationControl:"evidenced",oshwcEvidenceReferences:["oshwc-source-readiness-register"]}});
const payloadText=JSON.stringify(payload);
for(const prohibited of ["Private Person","42","private sex","private address","private registration","private schedule","private attendance","private payroll","private wage","private appointment","private medical","private accident","private occurrence","private licence","private certificate","private notice","private order","private penalty","private dispute","private evidence body"])assert.equal(payloadText.includes(prohibited),false);
const manifest=require(path.join(ROOT,"growwithhr-rag/manifests/candidates/oshwc-source-pack.candidate.v1.json"));
const factContract=require(path.join(ROOT,"data/assessment/oshwc-assessment-fact-contract.v1.json"));
const sectionMap=require(path.join(ROOT,"data/legal-source-governance/oshwc-section-mapping.v1.json"));
const reviewDecision=require(path.join(ROOT,"data/legal-source-governance/oshwc-legal-review-decision.v1.json"));
assert.equal(manifest.publication.legalReviewStatus,"needs-legal-review");
assert.equal(manifest.sources.length,5);
assert.equal(manifest.chunks,10);
assert.equal(factContract.providerPolicy.employeeIdentitiesAllowed,false);
assert.equal(factContract.providerPolicy.medicalHealthRecordsAllowed,false);
assert.equal(factContract.providerPolicy.accidentIncidentBodiesAllowed,false);
assert.equal(sectionMap.features[0].approvalStatus,"not-approved");
assert.equal(reviewDecision.prohibitedOutcomes.includes("draft-state-rule-treated-as-final"),true);
assert.equal(reviewDecision.prohibitedOutcomes.includes("oshwc-applies"),true);
assert.equal(reviewDecision.prohibitedOutcomes.includes("contract-workforce-route-determined"),true);
console.log(JSON.stringify({valid:true,profileCount:57,substantiveProfiles:50,substantiveOshwcWave5fProfiles:1,wave5fScenarios:scenarios,governanceFallbackProfiles:7,activeCatalogs:16,oshwcSources:5,oshwcChunks:10},null,2));
