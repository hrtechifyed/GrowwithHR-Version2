import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createEmployeeCompensationWave5ePayload,EMPLOYEE_COMPENSATION_WAVE5E_FEATURE_ID as BROWSER_FEATURE_ID} from "../js/assessment-v3/employee-compensation-wave5e-explanation-api-client.js";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const router=require(path.join(ROOT,"server-legal-explanation-router-wave5e.js"));
const loader=require(path.join(ROOT,"server-legal-rag-catalogs.js"));
const {createCompleteLegalModulesLoader}=require(path.join(ROOT,"server-legal-rag-modules.js"));
const {FALLBACK_CATALOG_ID}=require(path.join(ROOT,"server-all-laws-private-beta.js"));
const {EMPLOYEE_COMPENSATION_WAVE5E_CATALOG_ID,EMPLOYEE_COMPENSATION_WAVE5E_FEATURE_IDS}=require(path.join(ROOT,"server-employee-compensation-wave5e-rule-catalogs.js"));
const modules=await createCompleteLegalModulesLoader({retrievalMode:"lexical"})();
const ragRuntime=await import("../growwithhr-rag/legal-rag-runtime.js");
const registry=router.DEFAULT_PROFILE_REGISTRY;
const specifications=router.defaultFeatureSpecifications();
const validation=ragRuntime.validateLegalRagProfiles(registry);
assert.equal(validation.valid,true,JSON.stringify(validation.errors,null,2));
assert.equal(registry.profiles.length,57);
assert.equal(Object.keys(specifications).length,57);
assert.equal(registry.profiles.filter((p)=>p.catalogId===EMPLOYEE_COMPENSATION_WAVE5E_CATALOG_ID).length,1);
assert.equal(registry.profiles.filter((p)=>p.catalogId===FALLBACK_CATALOG_ID).length,8);
const snapshot=loader.loadGovernedLegalCatalogs({profileRegistry:registry});
assert.equal(Object.keys(snapshot.catalogs).length,15);
const catalog=snapshot.catalogs[EMPLOYEE_COMPENSATION_WAVE5E_CATALOG_ID];
assert.equal(catalog.sources.length,4);
assert.equal(catalog.chunks.length,9);
const expectedHashes={"social-security-code-2020":"53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967","social-security-central-rules-2026":"37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878","social-security-code-commencement-so-5319e-2025":"014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5","social-security-code-corrigendum-so-5936e-2025":"d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03"};
for(const [id,sha] of Object.entries(expectedHashes)){const source=catalog.sources.find((item)=>item.registrySourceId===id);assert.ok(source,id);assert.equal(source.sha256,sha,id);}
const status=router.statusPayload(registry,snapshot,"lexical");
assert.equal(status.profileCount,57);
assert.equal(status.substantiveProfileCount,49);
assert.equal(status.governanceFallbackProfileCount,8);
let scenarios=0;
for(const featureId of EMPLOYEE_COMPENSATION_WAVE5E_FEATURE_IDS){
 const profile=registry.profiles.find((p)=>p.featureId===featureId),spec=specifications[featureId];
 assert.ok(profile);assert.ok(spec);assert.equal(profile.catalogId,EMPLOYEE_COMPENSATION_WAVE5E_CATALOG_ID);
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
assert.equal(BROWSER_FEATURE_ID,"feature.legal.social-security.employee-compensation");
const payload=createEmployeeCompensationWave5ePayload({answers:{
 employeeCompensationDeclaredSourceRoute:"central-scope-candidate",employeeCompensationChapterViiSourceStatus:"evidenced",employeeCompensationApplicabilityScheduleSetStatus:"evidenced",employeeCompensationOccupationalDiseaseScheduleStatus:"evidenced",employeeCompensationFactorScheduleStatus:"evidenced",employeeCompensationCentralRulesSourceStatus:"evidenced",employeeCompensationCommencementTransitionStatus:"evidenced",employeeCompensationLegacyTransitionControl:"evidenced",employeeCompensationEsiOverlapRoutingControl:"evidenced",employeeCompensationEmployerProcessControl:"evidenced",employeeCompensationAuthorityProcessSourceControl:"evidenced",employeeCompensationSpecialistEscalationControl:"evidenced",employeeCompensationEvidenceReferences:[{reference:"employee-compensation-source-readiness-register",body:"private evidence body"}],
 employeeName:"Private Person",dependantName:"Private Dependant",age:42,sex:"private sex",address:"private address",payrollBody:"private payroll",wageRecord:"private wage record",attendance:"private attendance",serviceRecord:"private service",accidentNarrative:"private accident",injuryNarrative:"private injury",medicalBody:"private medical",deathRecord:"private death",claimBody:"private claim",disputeNarrative:"private dispute",noticeBody:"private notice",orderBody:"private order",bankAccount:"private bank",compensationAmount:50000
}});
assert.deepEqual(payload,{answers:{employeeCompensationDeclaredSourceRoute:"central-scope-candidate",employeeCompensationChapterViiSourceStatus:"evidenced",employeeCompensationApplicabilityScheduleSetStatus:"evidenced",employeeCompensationOccupationalDiseaseScheduleStatus:"evidenced",employeeCompensationFactorScheduleStatus:"evidenced",employeeCompensationCentralRulesSourceStatus:"evidenced",employeeCompensationCommencementTransitionStatus:"evidenced",employeeCompensationLegacyTransitionControl:"evidenced",employeeCompensationEsiOverlapRoutingControl:"evidenced",employeeCompensationEmployerProcessControl:"evidenced",employeeCompensationAuthorityProcessSourceControl:"evidenced",employeeCompensationSpecialistEscalationControl:"evidenced",employeeCompensationEvidenceReferences:["employee-compensation-source-readiness-register"]}});
const payloadText=JSON.stringify(payload);
for(const prohibited of ["Private Person","Private Dependant","42","private sex","private address","private payroll","private wage record","private attendance","private service","private accident","private injury","private medical","private death","private claim","private dispute","private notice","private order","private bank","50000","private evidence body"])assert.equal(payloadText.includes(prohibited),false);
const manifest=require(path.join(ROOT,"growwithhr-rag/manifests/candidates/employee-compensation-source-pack.candidate.v1.json"));
const factContract=require(path.join(ROOT,"data/assessment/employee-compensation-assessment-fact-contract.v1.json"));
const sectionMap=require(path.join(ROOT,"data/legal-source-governance/employee-compensation-section-mapping.v1.json"));
const reviewDecision=require(path.join(ROOT,"data/legal-source-governance/employee-compensation-legal-review-decision.v1.json"));
assert.equal(manifest.publication.legalReviewStatus,"needs-legal-review");
assert.equal(manifest.sources.length,4);
assert.equal(manifest.chunks,9);
assert.equal(factContract.providerPolicy.employeeDependantIdentitiesAllowed,false);
assert.equal(factContract.providerPolicy.accidentInjuryNarrativesAllowed,false);
assert.equal(factContract.providerPolicy.medicalDeathInformationAllowed,false);
assert.equal(sectionMap.features[0].approvalStatus,"not-approved");
assert.equal(reviewDecision.prohibitedOutcomes.includes("compensation-amount-calculated"),true);
assert.equal(reviewDecision.prohibitedOutcomes.includes("accident-compensable"),true);
assert.equal(reviewDecision.prohibitedOutcomes.includes("esi-coverage-determined"),true);
console.log(JSON.stringify({valid:true,profileCount:57,substantiveProfiles:49,substantiveEmployeeCompensationWave5eProfiles:1,wave5eScenarios:scenarios,governanceFallbackProfiles:8,activeCatalogs:15,employeeCompensationSources:4,employeeCompensationChunks:9},null,2));
