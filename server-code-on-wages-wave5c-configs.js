"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"code-on-wages-source-readiness",featureId:"feature.legal.code-on-wages",ruleId:"rule.legal.code-on-wages.source-readiness",
 productRuleId:"code-on-wages-source-readiness-review",title:"Code on Wages source-readiness review",
 queryTerms:["Code on Wages","Central Rules","commencement notification","appropriate Government","rate source register","State wage instrument","specialist review"],
 fields:[
  T("fact.code-on-wages.declared-source-route","codeOnWagesDeclaredSourceRoute","Declared source route",["central-scope-candidate","state-scope-candidate","mixed-scope-candidate","multi-state-review","unresolved","not-claimed","unknown","conflict"],"central-scope-candidate"),
  S("fact.code-on-wages.code-source","codeOnWagesCodeSourceStatus","Code on Wages source status"),
  S("fact.code-on-wages.central-rules-source","codeOnWagesCentralRulesSourceStatus","Central Rules source status"),
  S("fact.code-on-wages.rules-corrigendum","codeOnWagesRulesCorrigendumStatus","Central Rules corrigendum status"),
  S("fact.code-on-wages.commencement-set","codeOnWagesCommencementSetStatus","Commencement and implementation source-set status"),
  S("fact.code-on-wages.effective-date-version","codeOnWagesEffectiveDateVersionControl","Effective-date and version control"),
  S("fact.code-on-wages.jurisdiction-routing","codeOnWagesJurisdictionRoutingControl","Appropriate-Government routing control"),
  S("fact.code-on-wages.rate-source-register","codeOnWagesRateSourceRegisterControl","Rate-source register control"),
  S("fact.code-on-wages.state-instrument-register","codeOnWagesStateInstrumentRegisterControl","State or Union Territory instrument register control"),
  S("fact.code-on-wages.specialist-escalation","codeOnWagesSpecialistEscalationControl","Code on Wages specialist-escalation control"),
  A("fact.code-on-wages.evidence.references","codeOnWagesEvidenceReferences","Code on Wages source references",["code-on-wages-source-readiness-register"],["code-on-wages-source-gap-register"])
 ],
 codes:["CODE_ON_WAGES_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","CODE_ON_WAGES_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","CODE_ON_WAGES_FACTS_MISSING"],
 registrySourceIds:["code-on-wages-2019","code-on-wages-central-rules-2026","code-on-wages-commencement-so-4604e-2020","code-on-wages-commencement-so-5322e-2025","code-on-wages-central-rules-corrigendum-2026","code-on-wages-central-notification-register-2026","ministry-labour-jurisdiction-2026"],
 sections:[
  {registrySourceId:"code-on-wages-2019",reference:"Code on Wages, 2019 — official source identity",purpose:"Code source-readiness and authority-boundary control only"},
  {registrySourceId:"code-on-wages-central-rules-2026",reference:"Code on Wages (Central) Rules, 2026 — official Central Rules source identity",purpose:"Central Rules source-readiness and version control only"},
  {registrySourceId:"code-on-wages-commencement-so-4604e-2020",reference:"S.O. 4604(E), dated 18 December 2020",purpose:"Commencement and transition register control only"},
  {registrySourceId:"code-on-wages-commencement-so-5322e-2025",reference:"S.O. 5322(E), dated 21 November 2025",purpose:"Principal commencement-source register control only"},
  {registrySourceId:"code-on-wages-central-rules-corrigendum-2026",reference:"July 2026 Central Rules corrigendum",purpose:"Rules correction and version-control companion source"},
  {registrySourceId:"code-on-wages-central-notification-register-2026",reference:"Ministry Code on Wages notification register",purpose:"Bounded implementation and rate-source routing only; no rate selection"},
  {registrySourceId:"ministry-labour-jurisdiction-2026",reference:"Ministry labour-jurisdiction overview",purpose:"Concurrent-list and Central/State routing context only"}
 ],
 limitations:["This review records organisation-level Code on Wages source readiness, versioning, jurisdiction routing and specialist escalation only; it does not select an individual's applicable minimum wage, wage rate, wage category, zone, scheduled employment or State instrument.","No payroll, bonus, deduction, overtime, wage-period, entitlement, arrears, damages or remedy arithmetic is performed.","A declared Central, State or mixed source route is an input control only and is not a determination of the legally appropriate Government.","Rate and State-instrument source registers are bounded source-readiness controls only. Retrieval and provider output cannot select a numeric rate, category, zone, scheduled employment, Government or instrument."]
}]);
module.exports=Object.freeze({CONFIGS});
