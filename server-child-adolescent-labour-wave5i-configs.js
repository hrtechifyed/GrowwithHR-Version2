"use strict";
const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});
const CONFIGS=Object.freeze([{
 key:"child-adolescent-labour-safeguarding-readiness",featureId:"feature.legal.child-adolescent-labour",ruleId:"rule.legal.child-adolescent-labour.safeguarding-readiness",productRuleId:"child-adolescent-labour-safeguarding-readiness-review",title:"Child and Adolescent Labour safeguarding and source-readiness review",
 queryTerms:["Child and Adolescent Labour Act","Child Labour Rules 1988","G.S.R. 543(E)","S.O. 2823(E)","S.O. 2827(E)","hazardous schedule","family enterprise","child artist","District Magistrate","safeguarding","specialist review"],
 fields:[
  T("fact.child-adolescent-labour.declared-safeguarding-route","childAdolescentDeclaredSafeguardingRoute","Declared safeguarding source route",["child-prohibition-source-review","adolescent-hazardous-source-review","family-enterprise-exception-source-review","artist-participation-exception-source-review","mixed-safeguarding-review","no-minor-engagement-claimed","multi-state-review","unresolved","not-claimed","unknown","conflict"],"mixed-safeguarding-review"),
  S("fact.child-adolescent-labour.act-source","childAdolescentActSourceStatus","Current Act source status"),
  S("fact.child-adolescent-labour.principal-rules-source","childAdolescentPrincipalRulesSourceStatus","1988 principal Rules source status"),
  S("fact.child-adolescent-labour.rules-2017-source","childAdolescentRules2017SourceStatus","2017 Amendment Rules source status"),
  S("fact.child-adolescent-labour.commencement-source","childAdolescentAmendmentCommencementSourceStatus","2016 amendment commencement source status"),
  S("fact.child-adolescent-labour.hazardous-schedule-source","childAdolescentHazardousScheduleSourceStatus","Current hazardous Schedule source status"),
  S("fact.child-adolescent-labour.current-source-reconciliation","childAdolescentCurrentSourceReconciliationControl","Current Act/Rules/Schedule reconciliation control"),
  S("fact.child-adolescent-labour.age-band-source","childAdolescentAgeBandSourceControl","Privacy-safe age-band source control"),
  S("fact.child-adolescent-labour.work-type-hazard-classification","childAdolescentWorkTypeHazardClassificationControl","Work-type and hazardous-classification source control"),
  S("fact.child-adolescent-labour.family-enterprise-exception","childAdolescentFamilyEnterpriseExceptionSourceControl","Family-enterprise exception source control"),
  S("fact.child-adolescent-labour.artist-exception","childAdolescentArtistExceptionSourceControl","Artist-participation exception source control"),
  S("fact.child-adolescent-labour.education-protection","childAdolescentEducationProtectionSourceControl","Education-protection source control"),
  S("fact.child-adolescent-labour.register-notice","childAdolescentRegisterNoticeSourceControl","Register and notice source control"),
  S("fact.child-adolescent-labour.district-authority","childAdolescentDistrictAuthorityEscalationControl","District authority escalation source control"),
  S("fact.child-adolescent-labour.immediate-safeguarding","childAdolescentImmediateSafeguardingEscalationControl","Immediate human safeguarding escalation control"),
  S("fact.child-adolescent-labour.state-variation","childAdolescentStateVariationSourceControl","State-variation source control"),
  A("fact.child-adolescent-labour.evidence.references","childAdolescentEvidenceReferences","Controlled source references",["child-adolescent-safeguarding-source-register"],["child-adolescent-safeguarding-source-gap-register"])
 ],
 codes:["CHILD_ADOLESCENT_LABOUR_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","CHILD_ADOLESCENT_LABOUR_SAFEGUARDING_GAPS_SPECIALIST_REVIEW","CHILD_ADOLESCENT_LABOUR_FACTS_MISSING"],
 registrySourceIds:["child-adolescent-labour-act-1986-current-2026","child-labour-rules-1988-principal","child-adolescent-labour-amendment-rules-2017-gsr-543e","child-labour-amendment-commencement-so-2823e-2016","child-adolescent-labour-schedule-so-2827e-2017"],
 sections:[
  {registrySourceId:"child-adolescent-labour-act-1986-current-2026",reference:"Sections 2–4, 10–12, 14–17B and Schedule",purpose:"Central prohibition, hazardous-work, records and authority source readiness only"},
  {registrySourceId:"child-labour-rules-1988-principal",reference:"Child Labour (Prohibition and Regulation) Rules, 1988 principal Rules",purpose:"Principal Rules structure only; later amendments require reconciliation"},
  {registrySourceId:"child-adolescent-labour-amendment-rules-2017-gsr-543e",reference:"G.S.R. 543(E), 2 June 2017; Rules 2A–2C and 17A–17E",purpose:"Exception safeguards, complaint/authority and monitoring source controls only"},
  {registrySourceId:"child-labour-amendment-commencement-so-2823e-2016",reference:"S.O. 2823(E), 1 September 2016",purpose:"2016 amendment commencement source context only"},
  {registrySourceId:"child-adolescent-labour-schedule-so-2827e-2017",reference:"S.O. 2827(E), 30 August 2017",purpose:"Hazardous occupation/process Schedule source routing only; no customer classification"}
 ],
 limitations:["This review records organisation-level Child and Adolescent Labour source, exception-source, hazardous-classification-source and safeguarding-escalation readiness only.","It does not determine whether any person is a child or adolescent, collect exact age or date of birth, decide whether work or employment exists, classify an occupation/process as hazardous, or decide whether a family-enterprise or artist exception applies.","It does not decide schooling impact, age disputes, register or notice compliance, offences, rescue or complaint requirements, District Magistrate or inspector jurisdiction, liability, penalty, prosecution, compounding, rehabilitation, fund/payment or remedy.","State and Union Territory rules, notifications and enforcement routes remain specialist-only until separately controlled and approved.","Child/adolescent identities, exact age/date of birth, parent/guardian/family identities, school/education records, medical/disability data, caste/community/religion, addresses/contact data, photographs/video, precise child-linked worksites, payroll/payment data, schedules/attendance, allegations, abuse/trafficking/exploitation narratives, rescue/complaint/case/notice/order content, victim/witness data, police/CWC/DM case facts and evidence bodies are prohibited from retrieval/provider payloads."]
}]);
module.exports=Object.freeze({CONFIGS});
