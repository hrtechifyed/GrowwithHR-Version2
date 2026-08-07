"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"appropriate-government-routing",featureId:"feature.legal.jurisdiction.appropriate-government",ruleId:"rule.legal.jurisdiction.appropriate-government-source-routing",
 productRuleId:"appropriate-government-source-routing-review",title:"Appropriate Government source-routing review",
 queryTerms:["appropriate Government","Central Government","State Government","labour jurisdiction","cross-code source routing","specialist review"],
 fields:[
  T("fact.jurisdiction.declared-route","appropriateGovernmentDeclaredRoute","Declared jurisdiction route",["central-scope-candidate","state-scope-candidate","mixed-scope-candidate","multi-state-review","unresolved","not-claimed","unknown","conflict"],"central-scope-candidate"),
  S("fact.jurisdiction.cross-code-definition-source","appropriateGovernmentCrossCodeDefinitionSourceStatus","Cross-code definition source status"),
  S("fact.jurisdiction.central-rules-source-set","appropriateGovernmentCentralRulesSourceSetStatus","Central rules source-set status"),
  S("fact.jurisdiction.state-ut-source-set","appropriateGovernmentStateUtSourceSetStatus","State or Union Territory source-set status"),
  S("fact.jurisdiction.establishment-activity-classification","appropriateGovernmentEstablishmentActivityClassificationControl","Establishment and activity classification control"),
  S("fact.jurisdiction.multi-location-routing","appropriateGovernmentMultiLocationRoutingControl","Multi-location routing control"),
  S("fact.jurisdiction.effective-date-version-control","appropriateGovernmentEffectiveDateVersionControl","Effective-date and version control"),
  S("fact.jurisdiction.specialist-escalation","appropriateGovernmentSpecialistEscalationControl","Jurisdiction specialist-escalation control"),
  A("fact.jurisdiction.evidence.references","appropriateGovernmentEvidenceReferences","Jurisdiction source references",["appropriate-government-source-routing-register"],["appropriate-government-source-routing-gap-register"])
 ],
 codes:["APPROPRIATE_GOVERNMENT_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","APPROPRIATE_GOVERNMENT_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","APPROPRIATE_GOVERNMENT_FACTS_MISSING"],
 registrySourceIds:["code-on-wages-2019","industrial-relations-code-2020","social-security-code-2020","oshwc-code-2020","code-on-wages-central-rules-2026","industrial-relations-central-rules-2026","social-security-central-rules-2026","oshwc-central-rules-2026","ministry-labour-jurisdiction-2026"],
 sections:[
  {registrySourceId:"code-on-wages-2019",reference:"Section 2 appropriate Government definition and section 67 rule-making framework",purpose:"Code on Wages jurisdiction-source route"},
  {registrySourceId:"industrial-relations-code-2020",reference:"Section 2 appropriate Government definition and section 99 rule-making framework",purpose:"Industrial Relations jurisdiction-source route"},
  {registrySourceId:"social-security-code-2020",reference:"Section 2 appropriate Government definition and chapter-specific rule-making framework",purpose:"Social Security jurisdiction-source route"},
  {registrySourceId:"oshwc-code-2020",reference:"Section 2 appropriate Government definition and sections 133–135 rule-making framework",purpose:"OSHWC jurisdiction-source route"},
  {registrySourceId:"ministry-labour-jurisdiction-2026",reference:"Constitutional labour-jurisdiction overview",purpose:"Concurrent-list and Central/State source-routing context only"}
 ],
 limitations:["The route records declared source readiness and escalation controls only; it does not choose the legally appropriate Government for an establishment, activity, worker group, dispute or transaction.","Exact State and Union Territory Acts, rules, notifications, delegations, amendments and customer-specific establishment classifications remain qualified specialist-review dependencies."]
}]);
module.exports=Object.freeze({CONFIGS});
