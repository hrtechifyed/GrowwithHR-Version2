"use strict";

const {CONFIGS}=require("./server-shops-wave5b-configs.js");
const {SOURCE_DEFINITIONS,COMMON_LIMITATIONS,clone,deepFreeze,unique,normalizeFeatureBody,sourceRecord,recommendation}=require("./server-shops-wave5b-runtime.js");
const MODULE_VERSION="1.0.0";
const SHOPS_WAVE5B_CATALOG_ID="catalog.legal.shops-wave5b.v1";
const SHOPS_WAVE5B_CATALOG_PATH="growwithhr-rag/data/shops-wave5b-source-chunks.v1.json";
function requiredFact(field){return{factId:field.factId,sourceAssessmentField:field.answerKey,type:field.type,label:field.label,required:true};}
function condition(field){const operator=field.operator||"equals";const value=field.conditionValue!==undefined?field.conditionValue:field.complete;return operator==="exists"?{factId:field.factId,operator}:{factId:field.factId,operator,value};}
function scenarioAnswers(config,mode){const answers={};config.fields.forEach((field,index)=>{answers[field.answerKey]=clone(mode==="gap"&&index===1?field.gap:field.complete);});return answers;}
function buildRuleCatalog(config){const[matchedCode,gapCode,missingCode]=config.codes;const requiredFacts=config.fields.map(requiredFact);const requiredFactIds=config.fields.map((field)=>field.factId);const limitations=unique([...COMMON_LIMITATIONS,...config.limitations]);return deepFreeze({
 catalogVersion:"1.0.0-private-beta",title:`${config.title} deterministic catalogue`,updatedAt:"2026-08-06",jurisdiction:"India/Maharashtra",legalRuleCatalog:true,
 legalReviewStatus:"needs-legal-review",applicabilityAuthority:"deterministic-only",retrievalRole:"source-retrieval-only",llmRole:"explanation-only",advisoryOnly:true,privateBetaOnly:true,stableReportMutation:false,factMappingMode:"catalog-defined",outcomeModel:"source-readiness-and-control-review",
 sourceRegistry:{name:"GrowWithHR Maharashtra Shops source register",location:"GrowWithHR-RAG/00-project-control/Source Register.xlsx",reviewStatus:"needs-legal-review"},
 approval:{status:"draft",approvedBy:null,approvedAt:null},defaults:{ruleVersion:"1.0.0-private-beta",requiredFactMode:"all",evidence:{status:"not-verified",notes:"Organisation source-control assertions and references have not been independently verified.",verificationProcessId:null,verifiedAt:null},limitations},
 sources:config.registrySourceIds.map(sourceRecord),rules:[{
  id:config.ruleId,productRuleId:config.productRuleId,version:"1.0.0-private-beta",domain:"legal",title:config.title,
  description:"Reviews Maharashtra Shops and Establishments source readiness, draft-versus-final reconciliation and organisational escalation controls without deciding coverage, threshold, registration or working-condition duties.",jurisdiction:{country:"IN",level:"state",code:"IN-MH"},sourceRecordId:"SHOPS-WAVE5B-MAHARASHTRA-SOURCE-CONTROLS",legalReviewStatus:"needs-legal-review",
  requiredAssessmentFacts:requiredFacts,requiredFactMode:"all",requiredFactIds,missingInformationHandling:{defaultStatus:"more-information-needed",reasonCode:missingCode,neverInferMissingFacts:true,allowRetrievalToFillFacts:false,allowLlmToFillFacts:false},
  match:{mode:"all",conditions:config.fields.map(condition)},outcomes:{
   matched:{status:"specialist-review",reasonCode:matchedCode,reason:"The declared Maharashtra source-readiness, draft-reconciliation, classification-control, version and escalation controls are recorded. Customer-specific coverage and duties remain subject to qualified review.",recommendation:recommendation("verify","Verify the Maharashtra Shops source route","Confirm the exact current Act, Rules, final amendments and organisation classification with qualified Maharashtra counsel before selecting any threshold, registration route or working-condition duty.")},
   notMatched:{status:"specialist-review",reasonCode:gapCode,reason:"One or more Maharashtra Act, Rules, amendment-register, draft-reconciliation, classification, worker-count, service-route, version or escalation controls are missing, conflicted or unresolved.",recommendation:recommendation("remediate","Address Maharashtra Shops source-control gaps","Complete the missing controlled source identities and organisational controls, preserve draft status, retain references and obtain qualified review without sending filings, certificates or employee records.")},
   missing:{status:"more-information-needed",reasonCode:missingCode,reason:"The Maharashtra source-controls review cannot run because one or more required privacy-safe organisation facts are missing.",recommendation:recommendation("complete-input","Complete Maharashtra source-control inputs","Provide the missing State-scope, source, reconciliation, classification-control, worker-count-control, version, escalation and reference values without personal, payroll, filing or evidence content.")}
  },permittedResultStatuses:["specialist-review","more-information-needed","not-currently-applicable"],sourceIds:config.registrySourceIds.map((id)=>SOURCE_DEFINITIONS[id].id),officialSourceIds:clone(config.registrySourceIds),sourceSections:clone(config.sections),effectiveDateMetadata:{effectiveFrom:null,effectiveTo:null,sourceRegistryId:"maharashtra-shops-act-2017"},limitations,
  automatedBoundaryTestScenarios:[
   {scenarioId:"maharashtra-shops-source-controls-complete",description:"All required privacy-safe Maharashtra source-control facts are supplied in the expected state.",answers:scenarioAnswers(config,"complete"),expectedStatus:"specialist-review",expectedReasonCode:matchedCode},
   {scenarioId:"maharashtra-shops-source-controls-gap",description:"All required facts are supplied and at least one Maharashtra source control is reported as a gap.",answers:scenarioAnswers(config,"gap"),expectedStatus:"specialist-review",expectedReasonCode:gapCode},
   {scenarioId:"maharashtra-shops-source-controls-missing",description:"Required privacy-safe organisation facts are omitted.",answers:{},expectedStatus:"more-information-needed",expectedReasonCode:missingCode}
  ]
 }]
});}
const SHOPS_WAVE5B_PROFILE_DEFINITIONS=deepFreeze(CONFIGS.map((config)=>({featureId:config.featureId,ruleId:config.ruleId,productRuleId:config.productRuleId,queryTerms:clone(config.queryTerms),maxChunks:5})));
const SHOPS_WAVE5B_FEATURE_IDS=deepFreeze(CONFIGS.map((config)=>config.featureId));
function createShopsWave5bFeatureSpecifications(){const specifications={};CONFIGS.forEach((config)=>{specifications[config.featureId]=deepFreeze({featureId:config.featureId,lawFamilyId:"shops-establishments",normalizeBody:(value)=>normalizeFeatureBody(config,value),ruleCatalog:buildRuleCatalog(config),privateBetaMode:"statutory-catalogue"});});return deepFreeze(specifications);}
module.exports=Object.freeze({MODULE_VERSION,SHOPS_WAVE5B_CATALOG_ID,SHOPS_WAVE5B_CATALOG_PATH,SHOPS_WAVE5B_FEATURE_IDS,SHOPS_WAVE5B_PROFILE_DEFINITIONS,createShopsWave5bFeatureSpecifications});
