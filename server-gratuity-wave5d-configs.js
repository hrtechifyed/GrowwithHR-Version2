"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"gratuity-source-readiness",featureId:"feature.legal.social-security.gratuity",ruleId:"rule.legal.social-security.gratuity.source-readiness",
 productRuleId:"gratuity-source-readiness-review",title:"Gratuity source-readiness review",
 queryTerms:["gratuity","Code on Social Security Chapter V","First Schedule","Social Security Central Rules","transition","specialist review"],
 fields:[
  T("fact.gratuity.declared-source-route","gratuityDeclaredSourceRoute","Declared source route",["central-scope-candidate","state-scope-candidate","mixed-scope-candidate","multi-state-review","unresolved","not-claimed","unknown","conflict"],"central-scope-candidate"),
  S("fact.gratuity.chapter-v-source","gratuityChapterVSourceStatus","Chapter V source status"),
  S("fact.gratuity.first-schedule-source","gratuityFirstScheduleSourceStatus","First Schedule source status"),
  S("fact.gratuity.central-rules-source","gratuityCentralRulesSourceStatus","Central Rules Chapter V source status"),
  S("fact.gratuity.commencement-transition","gratuityCommencementTransitionStatus","Commencement and transition source-set status"),
  S("fact.gratuity.legacy-transition","gratuityLegacyTransitionControl","Legacy gratuity-rule transition control"),
  S("fact.gratuity.establishment-classification","gratuityEstablishmentClassificationControl","Establishment-classification control"),
  S("fact.gratuity.workforce-category-source","gratuityWorkforceCategorySourceControl","Workforce-category source control"),
  S("fact.gratuity.authority-process-source","gratuityAuthorityProcessSourceControl","Authority and process source control"),
  S("fact.gratuity.specialist-escalation","gratuitySpecialistEscalationControl","Gratuity specialist-escalation control"),
  A("fact.gratuity.evidence.references","gratuityEvidenceReferences","Gratuity source references",["gratuity-source-readiness-register"],["gratuity-source-gap-register"])
 ],
 codes:["GRATUITY_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","GRATUITY_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","GRATUITY_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Chapter V, sections 53–58",purpose:"Gratuity chapter source-readiness and organisational-control mapping only"},
  {registrySourceId:"social-security-code-2020",reference:"First Schedule — Chapter V Gratuity applicability entry",purpose:"Applicability-source control only; no customer coverage determination"},
  {registrySourceId:"social-security-code-2020",reference:"Section 164 repeal and savings",purpose:"Transition-source control only"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Chapter V, Rules 31–34",purpose:"Central gratuity procedure and source-readiness control only"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rules preamble superseding Payment of Gratuity (Central) Rules, 1972 subject to savings",purpose:"Legacy transition and version control only"},
  {registrySourceId:"social-security-code-commencement-so-5319e-2025",reference:"S.O. 5319(E), dated 21 November 2025",purpose:"Commencement-source control only"},
  {registrySourceId:"social-security-code-corrigendum-so-5936e-2025",reference:"S.O. 5936(E), dated 19 December 2025",purpose:"Commencement corrigendum companion control"}
 ],
 limitations:["This review records organisation-level Gratuity source readiness, schedule mapping, transition controls and specialist escalation only; it does not decide whether Chapter V applies to a customer or individual.","It does not determine individual eligibility, continuous service, fixed-term status, last drawn wages, gratuity amount, nomination, forfeiture, insurance, claim, appeal, recovery or remedy.","Establishment and workforce-category controls are source-readiness statuses only. Retrieval and provider output cannot classify an establishment, count employees, infer service history or create entitlement facts.","No payroll, wage record, payslip, attendance, employee identity, nominee or heir data, claim, dispute, notice, order, medical or death information, or evidence body may be sent to the provider."]
}]);
module.exports=Object.freeze({CONFIGS});
