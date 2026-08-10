"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([
{
 key:"special-coverage-routes",featureId:"feature.legal.esi.seasonal-hazardous-plantation",ruleId:"rule.legal.esi.special-coverage-routes",
 productRuleId:"esi-special-coverage-route-control-review",title:"ESI seasonal, hazardous and plantation route control review",
 queryTerms:["ESI seasonal factory","hazardous occupation","plantation opt in","special coverage route","Chapter IV"],
 fields:[
  T("fact.esi.special.declared-route","esiSpecialCoverageDeclaredRoute","Declared special coverage route",["seasonal-factory-route","hazardous-occupation-route","plantation-opt-in-route","combined-route","not-claimed","unknown","conflict"],"seasonal-factory-route"),
  S("fact.esi.special.seasonal-classification-review","esiSeasonalClassificationReviewStatus","Seasonal-factory classification review status"),
  S("fact.esi.special.hazardous-notification-source","esiHazardousNotificationSourceStatus","Hazardous-occupation notification source status"),
  S("fact.esi.special.plantation-opt-in-source","esiPlantationOptInSourceStatus","Plantation opt-in source status"),
  S("fact.esi.special.escalation-control","esiSpecialRouteEscalationControl","Special-route escalation control"),
  A("fact.esi.special.evidence.references","esiSpecialRouteEvidenceReferences","Special-route evidence references",["esi-special-route-control-register"],["esi-special-route-gap-register"])
 ],
 codes:["ESI_SPECIAL_ROUTE_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_SPECIAL_ROUTE_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_SPECIAL_ROUTE_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Selected definitions and First Schedule Chapter IV special-route framework",purpose:"Seasonal, hazardous and plantation route framework"}
 ],
 limitations:["The route records declared classifications and source controls; it does not decide that a seasonal, hazardous or plantation route applies.","The exact hazardous-occupation notification and plantation opt-in instruments are not included in the controlled Wave 4C pack."]
},
{
 key:"benefit-process",featureId:"feature.legal.esi.benefit-process-control",ruleId:"rule.legal.esi.benefit-process-control",
 productRuleId:"esi-benefit-process-control-review",title:"ESI benefit-process support control review",
 queryTerms:["ESI sickness benefit","maternity benefit","disablement benefit","dependants benefit","funeral expense","medical certification"],
 fields:[
  S("fact.esi.benefit.sickness-support","esiSicknessBenefitSupportControl","Sickness-benefit support control"),
  S("fact.esi.benefit.maternity-support","esiMaternityBenefitSupportControl","Maternity-benefit support control"),
  S("fact.esi.benefit.disablement-support","esiDisablementBenefitSupportControl","Disablement-benefit support control"),
  S("fact.esi.benefit.dependants-support","esiDependantsBenefitSupportControl","Dependants-benefit support control"),
  S("fact.esi.benefit.funeral-support","esiFuneralExpenseSupportControl","Funeral-expense support control"),
  S("fact.esi.benefit.medical-certification-source","esiMedicalCertificationSourceControl","Medical-certification source control"),
  S("fact.esi.benefit.entitlement-escalation","esiIndividualEntitlementEscalationControl","Individual-entitlement escalation control"),
  A("fact.esi.benefit.evidence.references","esiBenefitProcessEvidenceReferences","Benefit-process control references",["esi-benefit-process-control-register"],["esi-benefit-process-gap-register"])
 ],
 codes:["ESI_BENEFIT_PROCESS_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_BENEFIT_PROCESS_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_BENEFIT_PROCESS_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 32 and related Chapter IV benefit provisions",purpose:"Central benefit-category and process framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rules 21–25",purpose:"Current central benefit qualification and process-source context"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Benefit and claim regulations, saved-law candidate",purpose:"Operational benefit-process context subject to transition review"}
 ],
 limitations:["The route reviews organisation support controls only and never accepts claims, medical certificates, diagnoses, family details, payment records or benefit evidence bodies.","It does not determine whether any person qualifies for sickness, maternity, disablement, dependants, funeral or medical benefit."]
},
{
 key:"medical-administration",featureId:"feature.legal.esi.medical-administration",ruleId:"rule.legal.esi.medical-administration",
 productRuleId:"esi-medical-administration-source-routing-review",title:"ESI medical-administration source routing review",
 queryTerms:["ESI medical administration","State Government","Corporation model","medical practitioner","local implementation source","medical facilities scheme"],
 fields:[
  T("fact.esi.medical.declared-model","esiMedicalAdministrationDeclaredModel","Declared medical-administration model",["state-government-model","corporation-model","mixed-model","society-model","unresolved","not-claimed","unknown","conflict"],"state-government-model"),
  S("fact.esi.medical.local-source","esiMedicalLocalImplementationSourceStatus","Local implementation source status"),
  S("fact.esi.medical.state-corporation-source","esiStateCorporationAgreementSourceStatus","State or Corporation arrangement source status"),
  S("fact.esi.medical.practitioner-authority-source","esiMedicalPractitionerAuthoritySourceStatus","Medical-practitioner authority source status"),
  S("fact.esi.medical.other-beneficiary-source","esiOtherBeneficiarySchemeSourceStatus","Other-beneficiary scheme source status"),
  S("fact.esi.medical.records-exclusion","esiMedicalRecordsExclusionControl","Medical-record exclusion control"),
  S("fact.esi.medical.state-escalation","esiStateMedicalSourceEscalationControl","State-source escalation control"),
  A("fact.esi.medical.evidence.references","esiMedicalAdministrationEvidenceReferences","Medical-administration source references",["esi-medical-administration-source-register"],["esi-medical-administration-gap-register"])
 ],
 codes:["ESI_MEDICAL_ADMINISTRATION_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_MEDICAL_ADMINISTRATION_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_MEDICAL_ADMINISTRATION_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-esi-medical-practitioners-so-2352e-2026","other-beneficiaries-medical-facilities-scheme-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Sections 39–40 and related Chapter IV medical-administration provisions",purpose:"Central State and Corporation medical-administration framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rules 25–26",purpose:"Current central medical-administration source context"},
  {registrySourceId:"social-security-esi-medical-practitioners-so-2352e-2026",reference:"S.O. 2352(E), dated 8 May 2026",purpose:"Controlled medical-practitioner authority source"},
  {registrySourceId:"other-beneficiaries-medical-facilities-scheme-2026",reference:"Other Beneficiaries Medical Facilities Scheme, 2026",purpose:"Bounded scheme-source context; user-charge instrument remains unresolved"}
 ],
 limitations:["State and Union Territory medical-administration rules, agreements, society instruments, facility allocation and local procedures are not onboarded.","The route does not select a provider, determine treatment, validate certification, process medical records or decide medical benefit entitlement."]
}
]);
module.exports=Object.freeze({CONFIGS});
