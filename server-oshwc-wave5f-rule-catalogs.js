"use strict";

const {CONFIGS}=require("./server-oshwc-wave5f-configs.js");
const {SOURCE_DEFINITIONS,COMMON_LIMITATIONS,clone,deepFreeze,unique,normalizeFeatureBody,sourceRecord,recommendation}=require("./server-oshwc-wave5f-runtime.js");
const MODULE_VERSION="1.0.0";
const OSHWC_WAVE5F_CATALOG_ID="catalog.legal.oshwc-wave5f.v1";
const OSHWC_WAVE5F_CATALOG_PATH="growwithhr-rag/data/oshwc-wave5f-source-chunks.v1.json";
function requiredFact(field){return{factId:field.factId,sourceAssessmentField:field.answerKey,type:field.type,label:field.label,required:true};}
function condition(field){const operator=field.operator||"equals";const value=field.conditionValue!==undefined?field.conditionValue:field.complete;return operator==="exists"?{factId:field.factId,operator}:{factId:field.factId,operator,value};}
function scenarioAnswers(config,mode){const answers={};config.fields.forEach((field,index)=>{answers[field.answerKey]=clone(mode==="gap"&&index===1?field.gap:field.complete);});return answers;}
function buildRuleCatalog(config){const[matchedCode,gapCode,missingCode]=config.codes;const requiredFacts=config.fields.map(requiredFact);const requiredFactIds=config.fields.map((field)=>field.factId);const limitations=unique([...COMMON_LIMITATIONS,...config.limitations]);return deepFreeze({
 catalogVersion:"1.0.0-private-beta",title:`${config.title} deterministic catalogue`,updatedAt:"2026-08-07",jurisdiction:"India / Maharashtra source routing",legalRuleCatalog:true,
 legalReviewStatus:"needs-legal-review",applicabilityAuthority:"deterministic-only",retrievalRole:"source-retrieval-only",llmRole:"explanation-only",advisoryOnly:true,privateBetaOnly:true,stableReportMutation:false,factMappingMode:"catalog-defined",outcomeModel:"source-readiness-and-control-review",
 sourceRegistry:{name:"GrowWithHR OSHWC source register",location:"GrowWithHR-RAG/00-project-control/Source Register.xlsx",reviewStatus:"needs-legal-review"},
 approval:{status:"draft",approvedBy:null,approvedAt:null},defaults:{ruleVersion:"1.0.0-private-beta",requiredFactMode:"all",evidence:{status:"not-verified",notes:"Organisation source-control assertions and references have not been independently verified.",verificationProcessId:null,verifiedAt:null},limitations},
 sources:config.registrySourceIds.map(sourceRecord),rules:[{
  id:config.ruleId,productRuleId:config.productRuleId,version:"1.0.0-private-beta",domain:"legal",title:config.title,
  description:"Reviews bounded Central/Maharashtra OSHWC source readiness, generic establishment controls, draft-versus-final State-rule reconciliation and specialist escalation without deciding applicability, establishment classification, worker thresholds, industry-special duties or enforcement outcomes.",jurisdiction:{country:"IN",level:"central-maharashtra-source-routing"},sourceRecordId:"OSHWC-WAVE5F-SOURCE-READINESS",legalReviewStatus:"needs-legal-review",
  requiredAssessmentFacts:requiredFacts,requiredFactMode:"all",requiredFactIds,missingInformationHandling:{defaultStatus:"more-information-needed",reasonCode:missingCode,neverInferMissingFacts:true,allowRetrievalToFillFacts:false,allowLlmToFillFacts:false},
  match:{mode:"all",conditions:config.fields.map(condition)},outcomes:{
   matched:{status:"specialist-review",reasonCode:matchedCode,reason:"The declared OSHWC Code, Central Rules, commencement, Maharashtra draft-source, draft-final reconciliation and generic establishment controls are recorded. Applicability, establishment classification, final State rules and any substantive working-condition or enforcement conclusion remain subject to qualified review.",recommendation:recommendation("verify","Verify the bounded OSHWC source route","Confirm the exact current Code, Central Rules, commencement notification and any final Maharashtra rule instruments with qualified counsel before making applicability, classification, registration, safety-standard, working-condition or enforcement conclusions.")},
   notMatched:{status:"specialist-review",reasonCode:gapCode,reason:"One or more OSHWC source, draft-final reconciliation, establishment-scope, registration, core working-condition, authority or escalation controls are missing, conflicted or unresolved.",recommendation:recommendation("remediate","Address OSHWC source-control gaps","Complete the bounded Central/Maharashtra source register and generic organisation controls without sending employee, medical, accident, payroll, licence, notice, order or evidence content.")},
   missing:{status:"more-information-needed",reasonCode:missingCode,reason:"The OSHWC source-readiness review cannot run because one or more required privacy-safe organisation facts are missing.",recommendation:recommendation("complete-input","Complete OSHWC source-readiness inputs","Provide the missing source-route, source-status, draft-final, establishment-control, authority, escalation and reference values without individual, medical, accident or payroll data.")}
  },permittedResultStatuses:["specialist-review","more-information-needed","not-currently-applicable"],sourceIds:config.registrySourceIds.map((id)=>SOURCE_DEFINITIONS[id].id),officialSourceIds:clone(config.registrySourceIds),sourceSections:clone(config.sections),
  // Schema anchor only: private-beta source-review baseline, not a statutory commencement, applicability, State-rule finality or compliance determination.
  effectiveDateMetadata:{effectiveFrom:"2026-08-07",effectiveTo:null,sourceRegistryId:"oshwc-code-2020"},limitations,
  automatedBoundaryTestScenarios:[
   {scenarioId:"oshwc-source-readiness-complete",description:"All required privacy-safe OSHWC source-readiness controls are supplied in the expected state.",answers:scenarioAnswers(config,"complete"),expectedStatus:"specialist-review",expectedReasonCode:matchedCode},
   {scenarioId:"oshwc-source-readiness-gap",description:"All required facts are supplied and at least one OSHWC source control is reported as a gap.",answers:scenarioAnswers(config,"gap"),expectedStatus:"specialist-review",expectedReasonCode:gapCode},
   {scenarioId:"oshwc-source-readiness-missing",description:"Required privacy-safe organisation facts are omitted.",answers:{},expectedStatus:"more-information-needed",expectedReasonCode:missingCode}
  ]
 }]
});}
const OSHWC_WAVE5F_PROFILE_DEFINITIONS=deepFreeze(CONFIGS.map((config)=>({featureId:config.featureId,ruleId:config.ruleId,productRuleId:config.productRuleId,queryTerms:clone(config.queryTerms),maxChunks:6})));
const OSHWC_WAVE5F_FEATURE_IDS=deepFreeze(CONFIGS.map((config)=>config.featureId));
function createOshwcWave5fFeatureSpecifications(){const specifications={};CONFIGS.forEach((config)=>{specifications[config.featureId]=deepFreeze({featureId:config.featureId,lawFamilyId:"oshwc",normalizeBody:(value)=>normalizeFeatureBody(config,value),ruleCatalog:buildRuleCatalog(config),privateBetaMode:"statutory-catalogue"});});return deepFreeze(specifications);}
module.exports=Object.freeze({MODULE_VERSION,OSHWC_WAVE5F_CATALOG_ID,OSHWC_WAVE5F_CATALOG_PATH,OSHWC_WAVE5F_FEATURE_IDS,OSHWC_WAVE5F_PROFILE_DEFINITIONS,createOshwcWave5fFeatureSpecifications});
