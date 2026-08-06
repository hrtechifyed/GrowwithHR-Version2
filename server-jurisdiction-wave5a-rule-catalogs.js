"use strict";

const {CONFIGS}=require("./server-jurisdiction-wave5a-configs.js");
const {SOURCE_DEFINITIONS,COMMON_LIMITATIONS,clone,deepFreeze,unique,normalizeFeatureBody,sourceRecord,recommendation}=require("./server-jurisdiction-wave5a-runtime.js");
const MODULE_VERSION="1.0.0";
const JURISDICTION_WAVE5A_CATALOG_ID="catalog.legal.jurisdiction-wave5a.v1";
const JURISDICTION_WAVE5A_CATALOG_PATH="growwithhr-rag/data/jurisdiction-wave5a-source-chunks.v1.json";
function requiredFact(field){return{factId:field.factId,sourceAssessmentField:field.answerKey,type:field.type,label:field.label,required:true};}
function condition(field){const operator=field.operator||"equals";const value=field.conditionValue!==undefined?field.conditionValue:field.complete;return operator==="exists"?{factId:field.factId,operator}:{factId:field.factId,operator,value};}
function scenarioAnswers(config,mode){const answers={};config.fields.forEach((field,index)=>{answers[field.answerKey]=clone(mode==="gap"&&index===1?field.gap:field.complete);});return answers;}
function buildRuleCatalog(config){const[matchedCode,gapCode,missingCode]=config.codes;const requiredFacts=config.fields.map(requiredFact);const requiredFactIds=config.fields.map((field)=>field.factId);const limitations=unique([...COMMON_LIMITATIONS,...config.limitations]);return deepFreeze({
 catalogVersion:"1.0.0-private-beta",title:`${config.title} deterministic catalogue`,updatedAt:"2026-08-06",jurisdiction:"India",legalRuleCatalog:true,
 legalReviewStatus:"needs-legal-review",applicabilityAuthority:"deterministic-only",retrievalRole:"source-retrieval-only",llmRole:"explanation-only",advisoryOnly:true,privateBetaOnly:true,stableReportMutation:false,factMappingMode:"catalog-defined",outcomeModel:"source-readiness-and-routing-review",
 sourceRegistry:{name:"GrowWithHR controlled labour-code jurisdiction source register",location:"GrowWithHR-RAG/00-project-control/Source Register.xlsx",reviewStatus:"needs-legal-review"},
 approval:{status:"draft",approvedBy:null,approvedAt:null},defaults:{ruleVersion:"1.0.0-private-beta",requiredFactMode:"all",evidence:{status:"not-verified",notes:"Organisation route, source and escalation assertions plus evidence references have not been independently verified.",verificationProcessId:null,verifiedAt:null},limitations},
 sources:config.registrySourceIds.map(sourceRecord),rules:[{
  id:config.ruleId,productRuleId:config.productRuleId,version:"1.0.0-private-beta",domain:"legal",title:config.title,
  description:"Reviews cross-code Central and State source readiness and jurisdiction-escalation controls without choosing the appropriate Government or applicable law.",jurisdiction:{country:"IN",level:"mixed",code:"IN"},sourceRecordId:"JURISDICTION-WAVE5A-APPROPRIATE-GOVERNMENT",legalReviewStatus:"needs-legal-review",
  requiredAssessmentFacts:requiredFacts,requiredFactMode:"all",requiredFactIds,missingInformationHandling:{defaultStatus:"more-information-needed",reasonCode:missingCode,neverInferMissingFacts:true,allowRetrievalToFillFacts:false,allowLlmToFillFacts:false},
  match:{mode:"all",conditions:config.fields.map(condition)},outcomes:{
   matched:{status:"specialist-review",reasonCode:matchedCode,reason:"The declared cross-code source-readiness and escalation controls are recorded. The legally appropriate Government, applicable source set and effective-date treatment remain subject to specialist review.",recommendation:recommendation("appropriate-government.verify","Verify the Appropriate Government source route","Review the declared route against each relevant Code definition, current Central materials and the exact State or Union Territory source set before selecting any jurisdiction.")},
   notMatched:{status:"specialist-review",reasonCode:gapCode,reason:"One or more cross-code definition, Central rules, State source, classification, version or escalation controls are missing, conflicted or unresolved.",recommendation:recommendation("appropriate-government.remediate","Address jurisdiction source-routing gaps","Complete the missing controlled source sets and classification controls, retain references and obtain qualified confirmation without submitting customer documents or dispute narratives.")},
   missing:{status:"more-information-needed",reasonCode:missingCode,reason:"The source-routing review cannot run because one or more required controlled organisation facts are missing.",recommendation:recommendation("appropriate-government.complete-input","Complete jurisdiction source-routing inputs","Provide the missing controlled route, source, classification, version, escalation and reference values without names, addresses, disputes, notices, orders or evidence bodies.")}
  },permittedResultStatuses:["specialist-review","more-information-needed","not-currently-applicable"],sourceIds:config.registrySourceIds.map((id)=>SOURCE_DEFINITIONS[id].id),officialSourceIds:clone(config.registrySourceIds),sourceSections:clone(config.sections),effectiveDateMetadata:{effectiveFrom:null,effectiveTo:null,sourceRegistryId:"ministry-labour-jurisdiction-2026"},limitations,
  automatedBoundaryTestScenarios:[
   {scenarioId:"appropriate-government-routing-complete",description:"All required controlled source-readiness and escalation facts are supplied in the expected state.",answers:scenarioAnswers(config,"complete"),expectedStatus:"specialist-review",expectedReasonCode:matchedCode},
   {scenarioId:"appropriate-government-routing-gap",description:"All required facts are supplied and at least one cross-code source control is reported as a gap.",answers:scenarioAnswers(config,"gap"),expectedStatus:"specialist-review",expectedReasonCode:gapCode},
   {scenarioId:"appropriate-government-routing-missing",description:"Required controlled organisation facts are omitted.",answers:{},expectedStatus:"more-information-needed",expectedReasonCode:missingCode}
  ]
 }]
});}
const JURISDICTION_WAVE5A_PROFILE_DEFINITIONS=deepFreeze(CONFIGS.map((config)=>({featureId:config.featureId,ruleId:config.ruleId,productRuleId:config.productRuleId,queryTerms:clone(config.queryTerms),maxChunks:5})));
const JURISDICTION_WAVE5A_FEATURE_IDS=deepFreeze(CONFIGS.map((config)=>config.featureId));
function createJurisdictionWave5aFeatureSpecifications(){const specifications={};CONFIGS.forEach((config)=>{specifications[config.featureId]=deepFreeze({featureId:config.featureId,lawFamilyId:"appropriate-government",normalizeBody:(value)=>normalizeFeatureBody(config,value),ruleCatalog:buildRuleCatalog(config),privateBetaMode:"statutory-catalogue"});});return deepFreeze(specifications);}
module.exports=Object.freeze({MODULE_VERSION,JURISDICTION_WAVE5A_CATALOG_ID,JURISDICTION_WAVE5A_CATALOG_PATH,JURISDICTION_WAVE5A_FEATURE_IDS,JURISDICTION_WAVE5A_PROFILE_DEFINITIONS,createJurisdictionWave5aFeatureSpecifications});
