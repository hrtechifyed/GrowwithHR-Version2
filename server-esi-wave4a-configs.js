"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([
{
 key:"establishment-coverage",featureId:"feature.legal.esi.establishment-coverage",ruleId:"rule.legal.esi.establishment-coverage",
 productRuleId:"esi-establishment-source-control-review",title:"ESI establishment source and registration control review",
 queryTerms:["ESI establishment coverage","registration","branches","area notification","prior coverage","Chapter IV"],
 fields:[
  S("fact.esi.establishment.coverage-source-status","esiCoverageSourceStatus","Chapter IV coverage-source status"),
  T("fact.esi.establishment.declared-coverage-route","esiDeclaredCoverageRoute","Declared coverage route",["standard-route","prior-coverage-route","voluntary-route","special-route","unknown","conflict"],"standard-route"),
  S("fact.esi.establishment.all-branches-included","esiAllBranchesIncludedControl","All-branches inclusion control"),
  S("fact.esi.establishment.registration-status","esiRegistrationControl","Establishment registration control"),
  S("fact.esi.establishment.area-source-review-status","esiAreaSourceReviewStatus","Area and benefit-commencement source review status"),
  A("fact.esi.establishment.evidence.references","esiEstablishmentEvidenceReferences","Establishment-control evidence references",["esi-registration-control-register"],["esi-establishment-gap-register"])
 ],
 codes:["ESI_ESTABLISHMENT_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_ESTABLISHMENT_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_ESTABLISHMENT_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","employees-state-insurance-central-rules-1950","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 1, selected section 2 definitions and First Schedule Chapter IV",purpose:"Central establishment and coverage-route framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rules 1–5",purpose:"Current central registration and voluntary-route context"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Registration provisions, saved-law candidate",purpose:"Operational registration context subject to saved-law review"}
 ],
 limitations:["The route records a declared coverage route and controls; it does not decide that Chapter IV applies.","Exact area, establishment, hazardous-occupation and current threshold notifications are not in this Wave 4A pack."]
},
{
 key:"employee-insurance",featureId:"feature.legal.esi.employee-insurance",ruleId:"rule.legal.esi.employee-insurance",
 productRuleId:"esi-employee-insurance-process-control-review",title:"ESI employee-insurance process control review",
 queryTerms:["ESI employee insurance","registration","declaration update","identity handling","family data minimisation"],
 fields:[
  S("fact.esi.control.population-inclusion","esiPopulationInclusionControl","Population-inclusion review control"),
  S("fact.esi.control.pre-employment-registration","esiPreEmploymentRegistrationControl","Pre-employment registration control"),
  S("fact.esi.control.declaration-update-within-30-days","esiDeclarationUpdateControl","Declaration-update control"),
  S("fact.esi.control.prior-insurance-number-handling","esiPriorInsuranceNumberControl","Prior insurance-number handling control"),
  S("fact.esi.control.employee-family-data-minimisation","esiFamilyDataMinimisationControl","Employee and family data-minimisation control"),
  A("fact.esi.employee-insurance.evidence.references","esiEmployeeInsuranceEvidenceReferences","Employee-insurance control references",["esi-insurance-process-register"],["esi-insurance-gap-register"])
 ],
 codes:["ESI_EMPLOYEE_INSURANCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_EMPLOYEE_INSURANCE_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_EMPLOYEE_INSURANCE_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 28 and Chapter IV insurance framework",purpose:"Employee-insurance framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rule 18",purpose:"Current central employee-registration context"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Regulations 10-B to 17-B, saved-law candidate",purpose:"Operational registration context subject to saved-law review"}
 ],
 limitations:["The route processes organisation-level controls only and never accepts Aadhaar, insurance numbers, employee identities or family details.","It does not decide whether any individual is an insured employee or entitled to benefits."]
},
{
 key:"contractor-control",featureId:"feature.legal.esi.contractor-control",ruleId:"rule.legal.esi.contractor-control",
 productRuleId:"esi-contractor-control-review",title:"ESI contractor and principal-employer control review",
 queryTerms:["ESI contractor control","immediate employer","principal employer","employee register","reconciliation","remittance"],
 fields:[
  S("fact.esi.contribution.contractor-register-control","esiContractorRegisterControl","Contractor employee-register control"),
  S("fact.esi.contribution.principal-employer-reconciliation-control","esiPrincipalEmployerReconciliationControl","Principal-employer reconciliation control"),
  S("fact.esi.control.worker-classification-escalation","esiWorkerClassificationEscalationControl","Worker-classification escalation control"),
  S("fact.esi.contribution.contractor-remittance-reference-control","esiContractorRemittanceReferenceControl","Contractor remittance-reference control"),
  A("fact.esi.contractor.evidence.references","esiContractorEvidenceReferences","Contractor-control evidence references",["esi-contractor-control-register"],["esi-contractor-gap-register"])
 ],
 codes:["ESI_CONTRACTOR_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_CONTRACTOR_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_CONTRACTOR_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 31 and Chapter IV principal-employer framework",purpose:"Principal and immediate-employer control framework"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Regulations 26–40, saved-law candidate",purpose:"Contractor register, contribution and reconciliation context subject to saved-law review"}
 ],
 limitations:["The route accepts control statuses and references, not contractor payroll, employee rosters, wage data or contribution histories.","Worker classification and liability disputes remain specialist-review only."]
},
{
 key:"monthly-payment",featureId:"feature.legal.esi.monthly-payment-control",ruleId:"rule.legal.esi.monthly-payment-control",
 productRuleId:"esi-monthly-payment-process-control-review",title:"ESI monthly payment and return-process control review",
 queryTerms:["ESI monthly contribution","remittance","return filing","employer share","employee deduction","late payment"],
 fields:[
  S("fact.esi.contribution.employer-share-control","esiEmployerShareControl","Employer-share control"),
  S("fact.esi.contribution.employee-share-control","esiEmployeeShareControl","Employee-share control"),
  S("fact.esi.contribution.no-employer-share-deduction-control","esiNoEmployerShareDeductionControl","No employer-share deduction control"),
  S("fact.esi.contribution.relevant-wage-period-deduction-control","esiWagePeriodDeductionControl","Relevant wage-period deduction control"),
  S("fact.esi.contribution.remittance-control","esiRemittanceControl","Monthly remittance control"),
  S("fact.esi.contribution.return-filing-control","esiReturnFilingControl","Return-filing control"),
  S("fact.esi.contribution.late-payment-escalation-control","esiLatePaymentEscalationControl","Late-payment escalation control"),
  A("fact.esi.payment.evidence.references","esiPaymentEvidenceReferences","Payment-control evidence references",["esi-payment-control-register"],["esi-payment-gap-register"])
 ],
 codes:["ESI_PAYMENT_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_PAYMENT_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_PAYMENT_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","employees-state-insurance-central-rules-1950","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Sections 29–31",purpose:"Contribution responsibility and payment framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rule 19",purpose:"Current ordinary contribution-rate source context; no arithmetic in this route"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Regulations 26–40, saved-law candidate",purpose:"Operational payment and return context subject to saved-law review"}
 ],
 limitations:["The route does not accept wage amounts, challans, returns, payroll rows or contribution histories and performs no contribution arithmetic.","Due dates, return formats, saved-regulation treatment and portal procedures require qualified verification."]
},
{
 key:"accident-reporting",featureId:"feature.legal.esi.accident-reporting-control",ruleId:"rule.legal.esi.accident-reporting-control",
 productRuleId:"esi-accident-reporting-control-review",title:"ESI accident-register and reporting control review",
 queryTerms:["ESI accident reporting","accident book","serious accident","non-serious accident","employment injury","reporting control"],
 fields:[
  S("fact.esi.control.employee-register-maintained","esiEmployeeRegisterControl","Employee-register control"),
  S("fact.esi.control.accident-book-maintained","esiAccidentBookControl","Accident-book control"),
  S("fact.esi.control.serious-accident-escalation","esiSeriousAccidentEscalationControl","Serious-accident escalation control"),
  S("fact.esi.control.non-serious-accident-reporting","esiNonSeriousAccidentReportingControl","Non-serious accident-reporting control"),
  S("fact.esi.control.accident-narrative-exclusion","esiAccidentNarrativeExclusionControl","Accident-narrative exclusion control"),
  A("fact.esi.accident.evidence.references","esiAccidentEvidenceReferences","Accident-control evidence references",["esi-accident-control-register"],["esi-accident-gap-register"])
 ],
 codes:["ESI_ACCIDENT_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_ACCIDENT_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_ACCIDENT_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Sections 34–38",purpose:"Employment-injury and accident-reporting framework"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Regulations 65–76-A, saved-law candidate",purpose:"Accident-book and reporting context subject to saved-law review"}
 ],
 limitations:["The route processes control statuses and evidence references only; accident narratives, identities, witness details, injuries, diagnoses and investigation files are prohibited.","It does not determine employment causation, injury classification, benefit entitlement or report sufficiency."]
}
]);
module.exports=Object.freeze({CONFIGS});
