"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"employee-compensation-source-readiness",featureId:"feature.legal.social-security.employee-compensation",ruleId:"rule.legal.social-security.employee-compensation.source-readiness",
 productRuleId:"employee-compensation-source-readiness-review",title:"Employee's Compensation source-readiness review",
 queryTerms:["employee compensation","Code on Social Security Chapter VII","First Schedule","Second Schedule","Third Schedule","Sixth Schedule","Social Security Central Rules","ESI overlap","specialist review"],
 fields:[
  T("fact.employee-compensation.declared-source-route","employeeCompensationDeclaredSourceRoute","Declared source route",["central-scope-candidate","state-scope-candidate","mixed-scope-candidate","multi-state-review","unresolved","not-claimed","unknown","conflict"],"central-scope-candidate"),
  S("fact.employee-compensation.chapter-vii-source","employeeCompensationChapterViiSourceStatus","Chapter VII source status"),
  S("fact.employee-compensation.applicability-schedule-set","employeeCompensationApplicabilityScheduleSetStatus","First and Second Schedule source-set status"),
  S("fact.employee-compensation.occupational-disease-schedule","employeeCompensationOccupationalDiseaseScheduleStatus","Third Schedule source status"),
  S("fact.employee-compensation.compensation-factor-schedule","employeeCompensationFactorScheduleStatus","Sixth Schedule source status"),
  S("fact.employee-compensation.central-rules-source","employeeCompensationCentralRulesSourceStatus","Central Rules Chapter XIII source status"),
  S("fact.employee-compensation.commencement-transition","employeeCompensationCommencementTransitionStatus","Commencement and transition source-set status"),
  S("fact.employee-compensation.legacy-transition","employeeCompensationLegacyTransitionControl","Legacy Employee's Compensation rules transition control"),
  S("fact.employee-compensation.esi-overlap-routing","employeeCompensationEsiOverlapRoutingControl","ESI-overlap source-routing control"),
  S("fact.employee-compensation.employer-process","employeeCompensationEmployerProcessControl","Employer reporting and employee-information control"),
  S("fact.employee-compensation.authority-process-source","employeeCompensationAuthorityProcessSourceControl","Competent-authority and process source control"),
  S("fact.employee-compensation.specialist-escalation","employeeCompensationSpecialistEscalationControl","Employee's Compensation specialist-escalation control"),
  A("fact.employee-compensation.evidence.references","employeeCompensationEvidenceReferences","Employee's Compensation source references",["employee-compensation-source-readiness-register"],["employee-compensation-source-gap-register"])
 ],
 codes:["EMPLOYEE_COMPENSATION_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","EMPLOYEE_COMPENSATION_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","EMPLOYEE_COMPENSATION_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Chapter VII, sections 73–99",purpose:"Employee's Compensation chapter source-readiness and organisational-control mapping only"},
  {registrySourceId:"social-security-code-2020",reference:"First Schedule Chapter VII entry, Second Schedule and section 2(26)",purpose:"Applicability and employee-class source controls only; no customer or worker coverage determination"},
  {registrySourceId:"social-security-code-2020",reference:"Third Schedule",purpose:"Occupational-disease source control only; no diagnosis, causation or entitlement determination"},
  {registrySourceId:"social-security-code-2020",reference:"Sixth Schedule and sections 76–80",purpose:"Compensation-factor source identity only; no individual arithmetic"},
  {registrySourceId:"social-security-code-2020",reference:"Section 164 repeal and savings",purpose:"Transition-source control only"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Chapter XIII, Rules 57–63",purpose:"Central procedure, reporting, venue and authority source-readiness control only"},
  {registrySourceId:"social-security-central-rules-2026",reference:"G.S.R. 344(E) preamble superseding Employee's Compensation Rules, 1924; Transfer of Money Rules, 1935; and Venue of Proceedings Rules, 1996 subject to savings",purpose:"Legacy transition and version control only"},
  {registrySourceId:"social-security-code-commencement-so-5319e-2025",reference:"S.O. 5319(E), dated 21 November 2025",purpose:"Commencement-source control only"},
  {registrySourceId:"social-security-code-corrigendum-so-5936e-2025",reference:"S.O. 5936(E), dated 19 December 2025",purpose:"Commencement corrigendum companion control"}
 ],
 limitations:["This review records organisation-level Employee's Compensation source readiness, schedule mapping, ESI-overlap routing, employer-process controls and specialist escalation only; it does not decide whether Chapter VII applies to a customer or individual.","It does not determine whether an accident or occupational disease arose out of or in the course of employment, diagnosis, causation, disablement, dependency, liability, monthly wages, compensation amount, interest, damages, claim, appeal, recovery or remedy.","Applicability, schedule, ESI-overlap and authority controls are source-readiness statuses only. Retrieval and provider output cannot classify a worker, decide ESI coverage, infer an injury or service fact, adjudicate a claim or perform compensation arithmetic.","No employee or dependant identity, age, sex, address, wage, payroll, attendance, service history, accident or injury narrative, medical or death information, claim, dispute, notice, order, bank data, payment amount or evidence body may be sent to the provider."]
}]);
module.exports=Object.freeze({CONFIGS});
