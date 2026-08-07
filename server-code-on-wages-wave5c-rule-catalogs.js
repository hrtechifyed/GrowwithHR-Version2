"use strict";

const {CONFIGS}=require("./server-code-on-wages-wave5c-configs.js");
const {SOURCE_DEFINITIONS,COMMON_LIMITATIONS,clone,deepFreeze,unique,normalizeFeatureBody,sourceRecord,recommendation}=require("./server-code-on-wages-wave5c-runtime.js");
const MODULE_VERSION="1.0.0";
const CODE_ON_WAGES_WAVE5C_CATALOG_ID="catalog.legal.code-on-wages-wave5c.v1";
const CODE_ON_WAGES_WAVE5C_CATALOG_PATH="growwithhr-rag/data/code-on-wages-wave5c-source-chunks.v1.json";
function requiredFact(field){return{factId:field.factId,sourceAssessmentField:field.answerKey,type:field.type,label:field.label,required:true};}
function condition(field){const operator=field.operator||"equals";const value=field.conditionValue!==undefined?field.conditionValue:field.complete;return operator==="exists"?{factId:field.factId,operator}:{factId:field.factId,operator,value};}
function scenarioAnswers(config,mode){const answers={};config.fields.forEach((field,index)=>{answers[field.answerKey]=clone(mode==="gap"&&index===1?field.gap:field.complete);});return answers;}
function buildRuleCatalog(config){const[matchedCode,gapCode,missingCode]=config.codes;const requiredFacts=config.fields.map(requiredFact);const requiredFactIds=config.fields.map((field)=>field.factId);const limitations=unique([...COMMON_LIMITATIONS,...config.limitations]);return deepFreeze({
 catalogVersion:"1.0.0-private-beta",title:`${config.title} deterministic catalogue`,updatedAt:"2026-08-07",jurisdiction:"India",legalRuleCatalog:true,
 legalReviewStatus:"needs-legal-review",applicabilityAuthority:"deterministic-only",retrievalRole:"source-retrieval-only",llmRole:"explanation-only",advisoryOnly:true,privateBetaOnly:true,stableReportMutation:false,factMappingMode:"catalog-defined",outcomeModel:"source-readiness-and-control-review",
 sourceRegistry:{name:"GrowWithHR Code on Wages source register",location:"GrowWithHR-RAG/00-project-control/Source Register.xlsx",reviewStatus:"needs-legal-review"},
 approval:{status:"draft",approvedBy:null,approvedAt:null},defaults:{ruleVersion:"1.0.0-private-beta",requiredFactMode:"all",evidence:{status:"not-verified",notes:"Organisation source-control assertions and references have not been independently verified.",verificationProcessId:null,verifiedAt:null},limitations},
 sources:config.registrySourceIds.map(sourceRecord),rules:[{
  id:config.ruleId,productRuleId:config.productRuleId,version:"1.0.0-private-beta",domain:"legal",title:config.title,
  description:"Reviews organisation-level Code on Wages source readiness, commencement and version controls, jurisdiction routing, bounded rate-source registers and specialist escalation without selecting wages, categories, zones, State instruments or individual entitlements.",jurisdiction:{country:"IN",level:"national-source-routing"},sourceRecordId:"CODE-ON-WAGES-WAVE5C-SOURCE-READINESS",legalReviewStatus:"needs-legal-review",
  requiredAssessmentFacts:requiredFacts,requiredFactMode:"all",requiredFactIds,missingInformationHandling:{defaultStatus:"more-information-needed",reasonCode:missingCode,neverInferMissingFacts:true,allowRetrievalToFillFacts:false,allowLlmToFillFacts:false},
  match:{mode:"all",conditions:config.fields.map(condition)},outcomes:{
   matched:{status:"specialist-review",reasonCode:matchedCode,reason:"The declared Code on Wages source, commencement, version, jurisdiction-routing, rate-register, State-instrument and escalation controls are recorded. Any applicable Government, rate, category, zone, scheduled employment, payroll treatment or entitlement remains subject to qualified review.",recommendation:recommendation("verify","Verify the Code on Wages source route","Confirm exact current Code, Rules, corrigenda, commencement instruments and the bounded Central or State source set with qualified counsel before selecting any Government, rate, category, zone, scheduled employment or payroll treatment.")},
   notMatched:{status:"specialist-review",reasonCode:gapCode,reason:"One or more Code on Wages source, commencement, version, jurisdiction-routing, rate-register, State-instrument or escalation controls are missing, conflicted or unresolved.",recommendation:recommendation("remediate","Address Code on Wages source-control gaps","Complete the controlled source identities, commencement and version register, jurisdiction route, bounded rate-source register, State-instrument register and specialist escalation without sending payroll, wage records or employee evidence.")},
   missing:{status:"more-information-needed",reasonCode:missingCode,reason:"The Code on Wages source-readiness review cannot run because one or more required privacy-safe organisation facts are missing.",recommendation:recommendation("complete-input","Complete Code on Wages source-readiness inputs","Provide the missing source-route, source-status, commencement, version, routing, register, escalation and reference values without employee identities, payroll, wage records, disputes, claims, notices, orders or evidence bodies.")}
  },permittedResultStatuses:["specialist-review","more-information-needed","not-currently-applicable"],sourceIds:config.registrySourceIds.map((id)=>SOURCE_DEFINITIONS[id].id),officialSourceIds:clone(config.registrySourceIds),sourceSections:clone(config.sections),
  // Schema anchor only: private-beta source-review baseline, not a statutory commencement, operative date, wage-rate date or legal effective-date determination.
  effectiveDateMetadata:{effectiveFrom:"2026-08-07",effectiveTo:null,sourceRegistryId:"code-on-wages-2019"},limitations,
  automatedBoundaryTestScenarios:[
   {scenarioId:"code-on-wages-source-readiness-complete",description:"All required privacy-safe Code on Wages source-readiness controls are supplied in the expected state.",answers:scenarioAnswers(config,"complete"),expectedStatus:"specialist-review",expectedReasonCode:matchedCode},
   {scenarioId:"code-on-wages-source-readiness-gap",description:"All required facts are supplied and at least one Code on Wages source control is reported as a gap.",answers:scenarioAnswers(config,"gap"),expectedStatus:"specialist-review",expectedReasonCode:gapCode},
   {scenarioId:"code-on-wages-source-readiness-missing",description:"Required privacy-safe organisation facts are omitted.",answers:{},expectedStatus:"more-information-needed",expectedReasonCode:missingCode}
  ]
 }]
});}
const CODE_ON_WAGES_WAVE5C_PROFILE_DEFINITIONS=deepFreeze(CONFIGS.map((config)=>({featureId:config.featureId,ruleId:config.ruleId,productRuleId:config.productRuleId,queryTerms:clone(config.queryTerms),maxChunks:6})));
const CODE_ON_WAGES_WAVE5C_FEATURE_IDS=deepFreeze(CONFIGS.map((config)=>config.featureId));
function createCodeOnWagesWave5cFeatureSpecifications(){const specifications={};CONFIGS.forEach((config)=>{specifications[config.featureId]=deepFreeze({featureId:config.featureId,lawFamilyId:"code-on-wages",normalizeBody:(value)=>normalizeFeatureBody(config,value),ruleCatalog:buildRuleCatalog(config),privateBetaMode:"statutory-catalogue"});});return deepFreeze(specifications);}
module.exports=Object.freeze({MODULE_VERSION,CODE_ON_WAGES_WAVE5C_CATALOG_ID,CODE_ON_WAGES_WAVE5C_CATALOG_PATH,CODE_ON_WAGES_WAVE5C_FEATURE_IDS,CODE_ON_WAGES_WAVE5C_PROFILE_DEFINITIONS,createCodeOnWagesWave5cFeatureSpecifications});
