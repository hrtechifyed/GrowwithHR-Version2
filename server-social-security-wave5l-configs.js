"use strict";
const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});
const CONFIGS=Object.freeze([{
 key:"social-security-family-routing",featureId:"feature.legal.social-security",ruleId:"rule.legal.social-security.family-routing",productRuleId:"social-security-family-routing-review",title:"Generic Social Security family-routing review",
 queryTerms:["Code on Social Security","First Schedule","Chapter III","Chapter IV","Chapter V","Chapter VI","Chapter VII","building and other construction workers","unorganised workers","gig workers","platform workers","family routing","specialist review"],
 fields:[
  T("fact.social-security.declared-family-route","socialSecurityDeclaredFamilyRoute","Declared social-security family route",["epf-eps-edli-family","esi-family","gratuity-family","maternity-benefit-family","employee-compensation-family","bocw-social-security-family","unorganised-worker-family","gig-platform-worker-family","mixed-family-review","unresolved","not-claimed","unknown","conflict"],"epf-eps-edli-family"),
  S("fact.social-security.code-source","socialSecurityCodeSourceStatus","Code on Social Security source status"),
  S("fact.social-security.central-rules-source","socialSecurityCentralRulesSourceStatus","Social Security Central Rules source status"),
  S("fact.social-security.commencement-source","socialSecurityCommencementSourceStatus","Code commencement source status"),
  S("fact.social-security.corrigendum-source","socialSecurityCorrigendumSourceStatus","Commencement corrigendum source status"),
  S("fact.social-security.first-schedule-routing","socialSecurityFirstScheduleRoutingControl","First Schedule routing-source control"),
  S("fact.social-security.chapter-routing","socialSecurityChapterRoutingControl","Chapter and source-family routing control"),
  S("fact.social-security.epf-eps-edli-handoff","socialSecurityEpfEpsEdliHandoffControl","EPF/EPS/EDLI dedicated-family handoff control"),
  S("fact.social-security.esi-handoff","socialSecurityEsiHandoffControl","ESI dedicated-family handoff control"),
  S("fact.social-security.gratuity-handoff","socialSecurityGratuityHandoffControl","Gratuity dedicated-family handoff control"),
  S("fact.social-security.maternity-handoff","socialSecurityMaternityHandoffControl","Maternity Benefit dedicated-family handoff control"),
  S("fact.social-security.employee-compensation-handoff","socialSecurityEmployeeCompensationHandoffControl","Employee's Compensation dedicated-family handoff control"),
  S("fact.social-security.bocw-handoff","socialSecurityBocwHandoffControl","BOCW Chapter VIII specialist-handoff control"),
  S("fact.social-security.unorganised-worker-handoff","socialSecurityUnorganisedWorkerHandoffControl","Unorganised-worker Chapter IX specialist-handoff control"),
  S("fact.social-security.gig-platform-handoff","socialSecurityGigPlatformHandoffControl","Gig/platform-worker Chapter IX specialist-handoff control"),
  S("fact.social-security.cross-family-reconciliation","socialSecurityCrossFamilyReconciliationControl","Cross-family non-substitution and reconciliation control"),
  S("fact.social-security.state-variation","socialSecurityStateVariationControl","State/UT variation and implementation-source control"),
  S("fact.social-security.specialist-escalation","socialSecuritySpecialistEscalationControl","Generic Social Security specialist-escalation control"),
  A("fact.social-security.evidence.references","socialSecurityEvidenceReferences","Controlled source references",["social-security-family-routing-source-register"],["social-security-family-routing-source-gap-register"])
 ],
 codes:["SOCIAL_SECURITY_FAMILY_ROUTING_CONTROLS_RECORDED_SPECIALIST_REVIEW","SOCIAL_SECURITY_FAMILY_ROUTING_GAPS_SPECIALIST_REVIEW","SOCIAL_SECURITY_FAMILY_ROUTING_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 1(4) and First Schedule",purpose:"Generic chapter/source-family routing boundary only; not an applicability conclusion"},
  {registrySourceId:"social-security-code-2020",reference:"Chapters III–VII",purpose:"Dedicated EPF/EPS/EDLI, ESI, Gratuity, Maternity Benefit and Employee's Compensation family handoff context only"},
  {registrySourceId:"social-security-code-2020",reference:"Chapters VIII–IX",purpose:"BOCW and unorganised/gig/platform-worker specialist routing only; no active substantive family in Wave 5L"},
  {registrySourceId:"social-security-code-2020",reference:"Sections 153–164",purpose:"Transition, rule-making, schedule, repeal-and-savings and non-substitution context only"},
  {registrySourceId:"social-security-central-rules-2026",reference:"G.S.R. 344(E), 8 May 2026",purpose:"Current Central procedural and chapter-specific source reconciliation only"},
  {registrySourceId:"social-security-code-commencement-so-5319e-2025",reference:"S.O. 5319(E), 21 November 2025",purpose:"Code commencement and effective-date context only"},
  {registrySourceId:"social-security-code-corrigendum-so-5936e-2025",reference:"S.O. 5936(E), 19 December 2025",purpose:"Companion commencement corrigendum and version context only"}
 ],
 limitations:["This review records an organisation-level Social Security chapter/source-family route and dedicated-family handoff readiness only; it does not determine that a Code chapter or scheme applies.","Dedicated EPF/EPS/EDLI, ESI, Gratuity, Maternity Benefit and Employee's Compensation deterministic reviews remain authoritative for their own bounded product outcomes. The generic Social Security result cannot replace, combine, override or infer those results.","BOCW Chapter VIII and unorganised/gig/platform-worker Chapter IX routes remain specialist-review only because Wave 5L does not create a substantive product family for those chapters.","The review does not decide establishment, employee, worker, contractor, gig/platform, aggregator or beneficiary classification; coverage; registration; contribution; wage ceiling; rate; benefit; entitlement; cess; claim; exemption; enforcement; penalty; dispute or remedy.","State/UT implementation, saved-law treatment and customer-specific transition remain qualified-review dependencies.","Employee/member/worker identities, contact/address data, UAN/ESI numbers, payroll/wages/contribution rows, attendance, medical/injury/death data, nominee/dependant data, claims, benefit amounts, bank/payment details, notices/orders/disputes and evidence bodies are prohibited from provider payloads."]
}]);
module.exports=Object.freeze({CONFIGS});
