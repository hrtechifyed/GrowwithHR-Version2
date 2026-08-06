"use strict";

const { CONFIGS } = require("./server-epf-wave3b-configs.js");
const {
  SOURCE_DEFINITIONS,COMMON_LIMITATIONS,COMMENCEMENT_SECTIONS,clone,deepFreeze,unique,
  normalizeFeatureBody,sourceRecord,recommendation
} = require("./server-epf-wave3b-runtime.js");

const MODULE_VERSION="1.0.0";
const EPF_WAVE3B_CATALOG_ID="catalog.legal.epf-wave3b.v1";
const EPF_WAVE3B_CATALOG_PATH="growwithhr-rag/data/epf-wave3b-source-chunks.v1.json";

function requiredFact(field){
  return{factId:field.factId,sourceAssessmentField:field.answerKey,type:field.type,label:field.label,required:true};
}
function condition(field){
  const operator=field.operator||"equals";
  const value=field.conditionValue!==undefined?field.conditionValue:field.complete;
  return operator==="exists"?{factId:field.factId,operator}:{factId:field.factId,operator,value};
}
function scenarioAnswers(config,mode){
  const answers={};
  config.fields.forEach((field,index)=>{
    answers[field.answerKey]=clone(mode==="gap"&&index===Math.min(1,config.fields.length-1)?field.gap:field.complete);
  });
  return answers;
}
function buildRuleCatalog(config){
  const[matchedCode,gapCode,missingCode]=config.codes;
  const requiredFacts=config.fields.map(requiredFact);
  const requiredFactIds=config.fields.map((field)=>field.factId);
  const limitations=unique([...COMMON_LIMITATIONS,...config.limitations]);
  const sections=[...config.sections,...COMMENCEMENT_SECTIONS];
  return deepFreeze({
    catalogVersion:"1.0.0-private-beta",title:`${config.title} deterministic catalogue`,
    updatedAt:"2026-08-06",jurisdiction:"India",legalRuleCatalog:true,
    legalReviewStatus:"needs-legal-review",applicabilityAuthority:"deterministic-only",
    retrievalRole:"source-retrieval-only",llmRole:"explanation-only",advisoryOnly:true,
    privateBetaOnly:true,stableReportMutation:false,factMappingMode:"catalog-defined",outcomeModel:"control-review",
    sourceRegistry:{name:"GrowWithHR controlled Social Security, EPF, EPS and EDLI source register",
      location:"GrowWithHR-RAG/00-project-control/Source Register.xlsx",reviewStatus:"needs-legal-review"},
    approval:{status:"draft",approvedBy:null,approvedAt:null},
    defaults:{ruleVersion:"1.0.0-private-beta",requiredFactMode:"all",
      evidence:{status:"not-verified",notes:"Organisation facts, source-branch assertions and evidence have not been independently verified.",
        verificationProcessId:null,verifiedAt:null},limitations},
    sources:config.registrySourceIds.map(sourceRecord),
    rules:[{
      id:config.ruleId,productRuleId:config.productRuleId,version:"1.0.0-private-beta",domain:"legal",title:config.title,
      description:"Reviews declared organisation-level source, routing and process controls without contribution arithmetic, individual membership decisions or benefit determinations.",
      jurisdiction:{country:"IN",level:"central",code:"IN"},
      sourceRecordId:`EPF-WAVE3B-${config.key.toUpperCase()}`,legalReviewStatus:"needs-legal-review",
      requiredAssessmentFacts:requiredFacts,requiredFactMode:"all",requiredFactIds,
      missingInformationHandling:{defaultStatus:"more-information-needed",reasonCode:missingCode,neverInferMissingFacts:true,
        allowRetrievalToFillFacts:false,allowLlmToFillFacts:false},
      match:{mode:"all",conditions:config.fields.map(condition)},
      outcomes:{
        matched:{status:"specialist-review",reasonCode:matchedCode,
          reason:`${config.title} has the declared controlled facts recorded. Source sufficiency, legal routing, evidence quality and transition treatment remain subject to specialist review.`,
          recommendation:recommendation(`${config.key}.verify`,`Verify ${config.title.toLowerCase()}`,
            "Review the declared source, routing and process controls against the controlled sections and unresolved notification gaps before relying on the result.")},
        notMatched:{status:"specialist-review",reasonCode:gapCode,
          reason:`${config.title} contains one or more declared source gaps, conflicts or unresolved routing controls that require remediation and specialist review.`,
          recommendation:recommendation(`${config.key}.remediate`,`Address ${config.title.toLowerCase()} gaps`,
            "Resolve the reported source or routing gaps, retain evidence references and obtain qualified confirmation for unresolved legal branches.")},
        missing:{status:"more-information-needed",reasonCode:missingCode,
          reason:`${config.title} cannot run because one or more required controlled organisation facts are missing.`,
          recommendation:recommendation(`${config.key}.complete-input`,`Complete ${config.title.toLowerCase()} inputs`,
            "Provide the missing controlled statuses, bands or evidence references without including employee-level, payroll, claim or family data.")}
      },
      permittedResultStatuses:["specialist-review","more-information-needed","not-currently-applicable"],
      sourceIds:config.registrySourceIds.map((id)=>SOURCE_DEFINITIONS[id].id),
      officialSourceIds:clone(config.registrySourceIds),sourceSections:sections,
      effectiveDateMetadata:{effectiveFrom:"2025-11-21",effectiveTo:null,
        sourceRegistryId:"social-security-code-commencement-so-5319e-2025"},
      limitations,
      automatedBoundaryTestScenarios:[
        {scenarioId:`${config.key}-complete`,description:"All required controlled source and routing facts are supplied in the expected state.",
          answers:scenarioAnswers(config,"complete"),expectedStatus:"specialist-review",expectedReasonCode:matchedCode},
        {scenarioId:`${config.key}-gap`,description:"All required facts are supplied and at least one source or routing control is reported as a gap.",
          answers:scenarioAnswers(config,"gap"),expectedStatus:"specialist-review",expectedReasonCode:gapCode},
        {scenarioId:`${config.key}-missing`,description:"Required controlled organisation facts are omitted.",answers:{},
          expectedStatus:"more-information-needed",expectedReasonCode:missingCode}
      ]
    }]
  });
}
const EPF_WAVE3B_PROFILE_DEFINITIONS=deepFreeze(CONFIGS.map((config)=>({
  featureId:config.featureId,ruleId:config.ruleId,productRuleId:config.productRuleId,
  queryTerms:clone(config.queryTerms),maxChunks:4
})));
const EPF_WAVE3B_FEATURE_IDS=deepFreeze(CONFIGS.map((config)=>config.featureId));
function createEpfWave3bFeatureSpecifications(){
  const specifications={};
  CONFIGS.forEach((config)=>{
    specifications[config.featureId]=deepFreeze({
      featureId:config.featureId,lawFamilyId:"epf-eps-edli",
      normalizeBody:(value)=>normalizeFeatureBody(config,value),
      ruleCatalog:buildRuleCatalog(config),privateBetaMode:"statutory-catalogue"
    });
  });
  return deepFreeze(specifications);
}
module.exports=Object.freeze({
  MODULE_VERSION,EPF_WAVE3B_CATALOG_ID,EPF_WAVE3B_CATALOG_PATH,
  EPF_WAVE3B_FEATURE_IDS,EPF_WAVE3B_PROFILE_DEFINITIONS,createEpfWave3bFeatureSpecifications
});
