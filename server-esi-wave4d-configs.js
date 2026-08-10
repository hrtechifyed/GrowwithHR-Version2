"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([
{
 key:"exemption-governance",featureId:"feature.legal.esi.exemption",ruleId:"rule.legal.esi.exemption-governance",
 productRuleId:"esi-exemption-governance-control-review",title:"ESI exemption governance and source-control review",
 queryTerms:["ESI exemption","exemption notification","similar or superior benefits","three year compliance","section 143","specialist review"],
 fields:[
  T("fact.esi.exemption.declared-route","esiExemptionDeclaredRoute","Declared exemption route",["exemption-claimed","renewal-review","withdrawal-review","not-claimed","unknown","conflict"],"exemption-claimed"),
  S("fact.esi.exemption.notification-source","esiExemptionNotificationSourceStatus","Establishment-specific notification source status"),
  S("fact.esi.exemption.compliance-history-control","esiExemptionComplianceHistoryControl","Required compliance-history control"),
  S("fact.esi.exemption.benefit-comparison-control","esiExemptionBenefitComparisonControl","Similar or superior benefit-comparison control"),
  S("fact.esi.exemption.version-expiry-control","esiExemptionVersionExpiryControl","Notification version and expiry control"),
  S("fact.esi.exemption.specialist-escalation","esiExemptionSpecialistEscalationControl","Exemption specialist-escalation control"),
  A("fact.esi.exemption.evidence.references","esiExemptionEvidenceReferences","Exemption governance references",["esi-exemption-governance-register"],["esi-exemption-governance-gap-register"])
 ],
 codes:["ESI_EXEMPTION_GOVERNANCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_EXEMPTION_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_EXEMPTION_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Sections 46 and 143",purpose:"Central ESI exemption framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rules 65–67",purpose:"Current central exemption procedure context"}
 ],
 limitations:["The route records exemption governance and source controls only; it does not grant, validate, renew, withdraw or interpret an establishment-specific exemption.","Customer-specific notifications, benefit-comparison evidence, compliance history and employee-facing consequences remain unverified specialist-review dependencies."]
},
{
 key:"enforcement-authority",featureId:"feature.legal.esi.enforcement-authority",ruleId:"rule.legal.esi.enforcement-authority",
 productRuleId:"esi-enforcement-authority-routing-review",title:"ESI enforcement-authority source routing review",
 queryTerms:["ESI authorised officer","recovery officer","order authentication","inspector cum facilitator","enforcement authority","jurisdiction"],
 fields:[
  T("fact.esi.enforcement.declared-context","esiEnforcementDeclaredContext","Declared enforcement context",["inspection-context","inquiry-context","recovery-context","order-authentication-context","multi-authority-context","no-current-context","unknown","conflict"],"inspection-context"),
  S("fact.esi.enforcement.authorised-officer-source","esiAuthorisedOfficerSourceStatus","Authorised-officer source status"),
  S("fact.esi.enforcement.inspector-source","esiInspectorFacilitatorSourceStatus","Inspector-cum-facilitator source status"),
  S("fact.esi.enforcement.recovery-source","esiRecoveryOfficerSourceStatus","Recovery-officer source status"),
  S("fact.esi.enforcement.authentication-source","esiOrderAuthenticationSourceStatus","Order-authentication source status"),
  S("fact.esi.enforcement.jurisdiction-escalation","esiEnforcementJurisdictionEscalationControl","Jurisdiction-escalation control"),
  S("fact.esi.enforcement.document-exclusion","esiEnforcementDocumentExclusionControl","Enforcement-document exclusion control"),
  A("fact.esi.enforcement.evidence.references","esiEnforcementAuthorityEvidenceReferences","Enforcement-authority source references",["esi-enforcement-authority-source-register"],["esi-enforcement-authority-gap-register"])
 ],
 codes:["ESI_ENFORCEMENT_AUTHORITY_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_ENFORCEMENT_AUTHORITY_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_ENFORCEMENT_AUTHORITY_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-esi-authorised-officers-so-2350e-2026","social-security-esi-recovery-officers-so-2353e-2026","social-security-esi-orders-authentication-so-2354e-2026","social-security-esi-inspector-cum-facilitators-so-2356e-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-esi-authorised-officers-so-2350e-2026",reference:"S.O. 2350(E), dated 8 May 2026",purpose:"Controlled authorised-officer source"},
  {registrySourceId:"social-security-esi-recovery-officers-so-2353e-2026",reference:"S.O. 2353(E), dated 8 May 2026",purpose:"Controlled recovery-officer source"},
  {registrySourceId:"social-security-esi-orders-authentication-so-2354e-2026",reference:"S.O. 2354(E), dated 8 May 2026",purpose:"Controlled order-authentication source"},
  {registrySourceId:"social-security-esi-inspector-cum-facilitators-so-2356e-2026",reference:"S.O. 2356(E), dated 8 May 2026",purpose:"Controlled inspector-cum-facilitator source"}
 ],
 limitations:["The route records authority-source and escalation controls only; it does not determine liability, default, recoverability, limitation, penalty, prosecution, jurisdiction or the validity of a notice or order.","Customer documents, signatures, service records, inspection findings, recovery amounts and dispute narratives are prohibited and remain outside the product."]
}
]);
module.exports=Object.freeze({CONFIGS});
