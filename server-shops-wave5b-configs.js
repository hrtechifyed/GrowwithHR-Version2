"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"maharashtra-shops-source-controls",featureId:"feature.legal.state.shops-establishments",ruleId:"rule.legal.state.shops-establishments.maharashtra-source-controls",
 productRuleId:"maharashtra-shops-source-controls-review",title:"Maharashtra Shops and Establishments source-controls review",
 queryTerms:["Maharashtra Shops and Establishments","2017 Act","2018 Rules","draft amendment","registration source","specialist review"],
 fields:[
  T("fact.shops.maharashtra.declared-state-scope","shopsDeclaredStateScope","Declared State source scope",["maharashtra-only","multi-state-review","outside-maharashtra","unresolved","not-claimed","unknown","conflict"],"maharashtra-only"),
  S("fact.shops.maharashtra.act-source","shopsMaharashtraActSourceStatus","2017 Act source status"),
  S("fact.shops.maharashtra.rules-source","shopsMaharashtraRulesSourceStatus","2018 Rules source status"),
  S("fact.shops.maharashtra.amendment-register","shopsMaharashtraAmendmentRegisterStatus","Amendment and notification register status"),
  S("fact.shops.maharashtra.draft-final-reconciliation","shopsMaharashtraDraftFinalReconciliationControl","Draft-versus-final reconciliation control"),
  S("fact.shops.maharashtra.establishment-classification","shopsMaharashtraEstablishmentClassificationControl","Establishment-classification control"),
  S("fact.shops.maharashtra.worker-count-band","shopsMaharashtraWorkerCountBandControl","Worker-count band control"),
  S("fact.shops.maharashtra.registration-route","shopsMaharashtraRegistrationRouteSourceControl","Registration or intimation source control"),
  S("fact.shops.maharashtra.working-conditions-source","shopsMaharashtraWorkingConditionsSourceControl","Working-conditions source control"),
  S("fact.shops.maharashtra.effective-date-version","shopsMaharashtraEffectiveDateVersionControl","Effective-date and version control"),
  S("fact.shops.maharashtra.specialist-escalation","shopsMaharashtraSpecialistEscalationControl","Maharashtra specialist-escalation control"),
  A("fact.shops.maharashtra.evidence.references","shopsMaharashtraEvidenceReferences","Maharashtra source references",["maharashtra-shops-source-control-register"],["maharashtra-shops-source-gap-register"])
 ],
 codes:["MAHARASHTRA_SHOPS_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","MAHARASHTRA_SHOPS_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","MAHARASHTRA_SHOPS_FACTS_MISSING"],
 registrySourceIds:["maharashtra-shops-act-2017","maharashtra-shops-rules-2018","maharashtra-shops-draft-amendment-2025","maharashtra-labour-services-2026","maharashtra-labour-rts-services-2026"],
 sections:[
  {registrySourceId:"maharashtra-shops-act-2017",reference:"Maharashtra Shops and Establishments Act, 2017 — official source identity",purpose:"State Act source-readiness control only"},
  {registrySourceId:"maharashtra-shops-rules-2018",reference:"Maharashtra Shops and Establishments Rules, 2018 — official source identity",purpose:"State Rules source-readiness control only"},
  {registrySourceId:"maharashtra-shops-draft-amendment-2025",reference:"Draft notification dated 12 November 2025",purpose:"Draft-versus-final reconciliation; never treated as operative law"},
  {registrySourceId:"maharashtra-labour-services-2026",reference:"Maharashtra Labour Department services listing",purpose:"Registration-service source route only"},
  {registrySourceId:"maharashtra-labour-rts-services-2026",reference:"Maharashtra Labour RTS services listing",purpose:"Operational portal context only"}
 ],
 limitations:["This review is limited to Maharashtra source readiness and organisational controls; it does not decide Act coverage, establishment classification, worker-count threshold, registration, intimation, working hours, leave, welfare, safety, records, penalties or enforcement.","The November 2025 amendment source is a draft notification. Proposed changes cannot be treated as final or operative without a separately controlled final instrument and qualified review.","Multi-state, Union Territory and outside-Maharashtra routes remain separate governed source-pack dependencies."]
}]);
module.exports=Object.freeze({CONFIGS});
