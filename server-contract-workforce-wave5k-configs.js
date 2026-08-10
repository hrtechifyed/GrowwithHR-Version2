"use strict";
const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});
const CONFIGS=Object.freeze([{
 key:"contract-workforce-cross-family-readiness",featureId:"feature.legal.contract-workforce",ruleId:"rule.legal.contract-workforce.cross-family-readiness",productRuleId:"contract-workforce-cross-family-readiness-review",title:"Contract workforce cross-family source-readiness review",
 queryTerms:["contract labour","contract workforce","principal employer","contractor licence","work order","welfare facilities","payment of wages","core activity","EPF contractor control","ESI contractor control","Shram Suvidha","specialist review"],
 fields:[
  T("fact.contract-workforce.declared-source-route","contractWorkforceDeclaredSourceRoute","Declared contract-workforce source route",["central-sphere-candidate","maharashtra-labour-candidate","mixed-scope-candidate","multi-state-review","unresolved","not-claimed","unknown","conflict"],"maharashtra-labour-candidate"),
  S("fact.contract-workforce.oshwc-code-source","contractWorkforceOshwcCodeSourceStatus","OSHWC Code source status"),
  S("fact.contract-workforce.central-rules-source","contractWorkforceCentralRulesSourceStatus","OSHWC Central Rules source status"),
  S("fact.contract-workforce.commencement-source","contractWorkforceCommencementSourceStatus","OSHWC commencement source status"),
  S("fact.contract-workforce.state-draft-final","contractWorkforceStateDraftFinalReconciliationControl","State draft-versus-final reconciliation control"),
  S("fact.contract-workforce.part-i-scope","contractWorkforcePartIScopeSourceControl","Chapter XI Part I scope-source control"),
  S("fact.contract-workforce.threshold-source","contractWorkforceThresholdSourceControl","Contract-labour threshold source control"),
  S("fact.contract-workforce.principal-employer-classification","contractWorkforcePrincipalEmployerClassificationControl","Principal-employer classification source control"),
  S("fact.contract-workforce.contractor-licensing","contractWorkforceContractorLicensingSourceControl","Contractor licensing source control"),
  S("fact.contract-workforce.work-order-intimation","contractWorkforceWorkOrderIntimationSourceControl","Work-order and portal-intimation source control"),
  S("fact.contract-workforce.welfare-responsibility","contractWorkforceWelfareResponsibilitySourceControl","Welfare-responsibility source control"),
  S("fact.contract-workforce.wage-responsibility","contractWorkforceWageResponsibilitySourceControl","Wage-responsibility source control"),
  S("fact.contract-workforce.core-activity","contractWorkforceCoreActivityClassificationSourceControl","Core-activity classification source control"),
  S("fact.contract-workforce.epf-dependency","contractWorkforceEpfContractorDependencyControl","Separate EPF contractor-control dependency"),
  S("fact.contract-workforce.esi-dependency","contractWorkforceEsiContractorDependencyControl","Separate ESI contractor-control dependency"),
  S("fact.contract-workforce.cross-family-reconciliation","contractWorkforceCrossFamilyReconciliationControl","OSHWC/EPF/ESI dependency reconciliation control"),
  S("fact.contract-workforce.authority-escalation","contractWorkforceAuthorityEscalationControl","Authority and escalation source control"),
  S("fact.contract-workforce.specialist-escalation","contractWorkforceSpecialistEscalationControl","Contract-workforce specialist-escalation control"),
  A("fact.contract-workforce.evidence.references","contractWorkforceEvidenceReferences","Controlled source references",["contract-workforce-cross-family-source-register"],["contract-workforce-cross-family-source-gap-register"])
 ],
 codes:["CONTRACT_WORKFORCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","CONTRACT_WORKFORCE_CONTROL_GAPS_SPECIALIST_REVIEW","CONTRACT_WORKFORCE_FACTS_MISSING"],
 registrySourceIds:["oshwc-code-2020","oshwc-central-rules-2026","oshwc-commencement-so-5321e-2025","maharashtra-oshwc-labour-draft-rules-2026","social-security-code-2020","employees-provident-funds-scheme-2026","social-security-central-rules-2026","employees-state-insurance-general-regulations-1950"],
 sections:[
  {registrySourceId:"oshwc-code-2020",reference:"Chapter XI Part I, sections 45–58",purpose:"Contract-labour scope, licensing, welfare, wage-responsibility and core-activity source readiness only"},
  {registrySourceId:"oshwc-central-rules-2026",reference:"G.S.R. 345(E), 8 May 2026; Rules 87–101",purpose:"Current Central contract-labour licensing, work-order, responsibility and authority source controls only"},
  {registrySourceId:"oshwc-commencement-so-5321e-2025",reference:"S.O. 5321(E), 21 November 2025",purpose:"OSHWC commencement and version context only"},
  {registrySourceId:"maharashtra-oshwc-labour-draft-rules-2026",reference:"Maharashtra OSHWC (Labour) draft Rules, 2026",purpose:"Draft State source identity only; final-State reconciliation required"},
  {registrySourceId:"social-security-code-2020",reference:"Section 17 and sections 29–31",purpose:"EPF and ESI contractor-dependency source context only; no cross-family substitution"},
  {registrySourceId:"employees-provident-funds-scheme-2026",reference:"Paragraphs 20 and 27",purpose:"Existing EPF contractor operational-control dependency only"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Current Social Security (Central) Rules, 2026",purpose:"Current social-security dependency reconciliation context only"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Regulations 26–40; saved-law candidate",purpose:"Existing ESI contractor/payment-process dependency context only"}
 ],
 limitations:["This review records organisation-level contract-workforce source readiness and cross-family dependency controls only.","It does not decide OSHWC Chapter XI Part I applicability, thresholds, principal-employer or contractor classification, licensing liability, work-order validity, welfare sufficiency, wage default, core-activity classification, prohibition, exemption, authority jurisdiction, enforcement, penalty or remedy.","EPF and ESI contractor controls remain separate deterministic legal-family reviews. An OSHWC result cannot establish EPF membership/contribution duties or ESI insurance/contribution duties, and EPF/ESI results cannot establish OSHWC contract-labour applicability.","The Maharashtra OSHWC Labour Rules, 2026 source remains draft-only. No draft text may be treated as final or operative until an exact final State instrument is independently controlled and approved.","Contractor or worker identities, contact/address data, PAN/GST/registration numbers, work-order or agreement bodies, worker rosters, UAN/IP numbers, payroll/wage rows, attendance, bank/payment data, invoices, licences/certificates, notices/orders, disputes, accident/medical information and evidence bodies are prohibited from provider payloads."]
}]);
module.exports=Object.freeze({CONFIGS});
