"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"oshwc-source-readiness",featureId:"feature.legal.oshwc",ruleId:"rule.legal.oshwc.source-readiness",
 productRuleId:"oshwc-source-readiness-review",title:"OSHWC source-readiness review",
 queryTerms:["occupational safety health working conditions","OSHWC","Central Rules","Maharashtra draft rules","registration","safety health welfare","working conditions","specialist review"],
 fields:[
  T("fact.oshwc.declared-source-route","oshwcDeclaredSourceRoute","Declared source route",["central-sphere-candidate","maharashtra-general-labour-candidate","maharashtra-factory-other-port-candidate","mixed-scope-candidate","multi-location-review","unresolved","not-claimed","unknown","conflict"],"maharashtra-general-labour-candidate"),
  S("fact.oshwc.code-source","oshwcCodeSourceStatus","OSHWC Code source status"),
  S("fact.oshwc.central-rules-source","oshwcCentralRulesSourceStatus","Central Rules source status"),
  S("fact.oshwc.commencement-source","oshwcCommencementSourceStatus","Commencement source status"),
  S("fact.oshwc.maharashtra-labour-draft","oshwcMaharashtraLabourDraftRulesStatus","Maharashtra Labour draft-rules source status"),
  S("fact.oshwc.maharashtra-factories-ports-draft","oshwcMaharashtraFactoriesPortsDraftRulesStatus","Maharashtra Factories and Other Ports draft-rules source status"),
  S("fact.oshwc.draft-final-reconciliation","oshwcDraftFinalReconciliationControl","Draft-versus-final State-rule reconciliation control"),
  S("fact.oshwc.establishment-scope","oshwcEstablishmentScopeControl","Establishment-scope classification control"),
  S("fact.oshwc.registration-source","oshwcRegistrationSourceControl","Registration source control"),
  S("fact.oshwc.core-safety-health-welfare","oshwcCoreSafetyHealthWelfareSourceControl","Core safety, health and welfare source control"),
  S("fact.oshwc.hours-leave-records","oshwcHoursLeaveRecordsSourceControl","Hours, leave and records source control"),
  S("fact.oshwc.authority-enforcement","oshwcAuthorityEnforcementSourceControl","Authority and enforcement source control"),
  S("fact.oshwc.deferred-special-categories","oshwcDeferredSpecialCategoriesControl","Deferred special-category boundary control"),
  S("fact.oshwc.specialist-escalation","oshwcSpecialistEscalationControl","OSHWC specialist-escalation control"),
  A("fact.oshwc.evidence.references","oshwcEvidenceReferences","OSHWC controlled source references",["oshwc-source-readiness-register"],["oshwc-source-gap-register"])
 ],
 codes:["OSHWC_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","OSHWC_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","OSHWC_FACTS_MISSING"],
 registrySourceIds:["oshwc-code-2020","oshwc-central-rules-2026","oshwc-commencement-so-5321e-2025","maharashtra-oshwc-labour-draft-rules-2026","maharashtra-oshwc-factories-ports-draft-rules-2026"],
 sections:[
  {registrySourceId:"oshwc-code-2020",reference:"Sections 1–15 and Chapters IV–X",purpose:"Generic establishment application, registration, employer-duty and core working-condition source-readiness only"},
  {registrySourceId:"oshwc-central-rules-2026",reference:"G.S.R. 345(E), dated 8 May 2026; Rules 1 onward",purpose:"Central registration, employer-control, safety-health-welfare, hours-records and authority source-readiness only"},
  {registrySourceId:"oshwc-commencement-so-5321e-2025",reference:"S.O. 5321(E), dated 21 November 2025",purpose:"Code commencement and version-control source only"},
  {registrySourceId:"maharashtra-oshwc-labour-draft-rules-2026",reference:"Maharashtra Gazette Extraordinary No. 49, dated 30 April 2026",purpose:"Draft State Labour-rule source identity only; not final or operative authority"},
  {registrySourceId:"maharashtra-oshwc-factories-ports-draft-rules-2026",reference:"Maharashtra Gazette Extraordinary No. 50, dated 5 May 2026",purpose:"Draft State Factories and Other Ports rule source identity only; not final or operative authority"}
 ],
 limitations:["This review records organisation-level OSHWC source readiness for a bounded Central/Maharashtra candidate route, generic establishment controls, draft-versus-final reconciliation and specialist escalation only.","The two Maharashtra 2026 rule sets in this pack are published drafts. Neither may be treated as final, operative or sufficient to decide customer obligations unless an exact final State instrument is separately controlled and qualified review approves its use.","The review does not decide Code applicability, worker-count thresholds, establishment classification, factory/mine/port/plantation/building-work status, registration or licence liability, safety-standard sufficiency, working hours, overtime, leave, women-night-work conditions, accident-reporting sufficiency, inspection, penalty, prosecution or remedy.","Contract labour, inter-State migrant worker and other special-category determinations under Chapter XI are deferred to later bounded packs; EPF/ESI dependencies remain separate deterministic source-routing questions.","No names, contact details, addresses, registration numbers, employee identities, age or sex data, work schedules, attendance, payroll, wages, appointment letters, medical or health records, accident or dangerous-occurrence narratives, licences, certificates, notices, orders, penalties, disputes or evidence bodies may be sent to the provider."]
}]);
module.exports=Object.freeze({CONFIGS});
