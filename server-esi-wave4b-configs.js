"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([
{
 key:"continuing-voluntary-coverage",featureId:"feature.legal.esi.continuing-voluntary-coverage",ruleId:"rule.legal.esi.continuing-voluntary-coverage",
 productRuleId:"esi-continuing-voluntary-coverage-routing-review",title:"ESI continuing and voluntary coverage routing review",
 queryTerms:["ESI continuing coverage","voluntary coverage","prior coverage","employee agreement","Chapter IV routing"],
 fields:[
  T("fact.esi.coverage.declared-route","esiContinuingVoluntaryDeclaredRoute","Declared continuing or voluntary route",["continuing-route","voluntary-route","combined-route","not-claimed","unknown","conflict"],"continuing-route"),
  S("fact.esi.coverage.prior-history-review","esiPriorCoverageHistoryReviewStatus","Prior-coverage history review status"),
  S("fact.esi.coverage.voluntary-application-source","esiVoluntaryApplicationSourceStatus","Voluntary-application source status"),
  S("fact.esi.coverage.employee-agreement-control","esiVoluntaryEmployeeAgreementControl","Required employee-agreement control"),
  S("fact.esi.coverage.current-source-scope","esiContinuingCoverageCurrentSourceStatus","Current source-scope review status"),
  A("fact.esi.coverage.evidence.references","esiContinuingVoluntaryEvidenceReferences","Continuing or voluntary coverage references",["esi-continuing-coverage-control-register"],["esi-continuing-coverage-gap-register"])
 ],
 codes:["ESI_CONTINUING_VOLUNTARY_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_CONTINUING_VOLUNTARY_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_CONTINUING_VOLUNTARY_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Sections 1(7)–1(8) and Chapter IV coverage-continuation framework",purpose:"Continuing and voluntary route framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rules 1–5, including voluntary application context",purpose:"Current central procedural source context"}
 ],
 limitations:["The route records a declared route and source controls; it does not decide that continuing or voluntary coverage applies.","Employee agreements, prior coverage history and customer evidence remain unverified references only."]
},
{
 key:"area-benefit-commencement",featureId:"feature.legal.esi.area-benefit-commencement",ruleId:"rule.legal.esi.area-benefit-commencement",
 productRuleId:"esi-area-benefit-commencement-source-review",title:"ESI area and benefit-commencement source review",
 queryTerms:["ESI area notification","benefit commencement","contribution start","operating area","Chapter IV"],
 fields:[
  T("fact.esi.area.operating-scope","esiOperatingAreaScope","Declared operating-area scope",["single-state","multi-state","union-territory","mixed-scope","unknown","conflict"],"single-state"),
  S("fact.esi.area.notification-source","esiAreaNotificationSourceStatus","Area-notification source status"),
  S("fact.esi.area.benefit-source","esiBenefitAvailabilitySourceStatus","Benefit-availability source status"),
  S("fact.esi.area.contribution-start-source","esiContributionStartSourceStatus","Contribution-start source status"),
  S("fact.esi.area.location-escalation","esiLocationScopeEscalationControl","Location-scope escalation control"),
  A("fact.esi.area.evidence.references","esiAreaCommencementEvidenceReferences","Area and commencement references",["esi-area-source-register"],["esi-area-source-gap-register"])
 ],
 codes:["ESI_AREA_COMMENCEMENT_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_AREA_COMMENCEMENT_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_AREA_COMMENCEMENT_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"First Schedule Chapter IV benefit and contribution commencement framework",purpose:"Central area and commencement framework"}
 ],
 limitations:["The controlled pack does not contain the complete State, Union Territory, area or establishment notification set.","The route cannot infer territorial coverage, benefit availability or a contribution-start date from an address or general commencement source."]
},
{
 key:"wage-ceiling",featureId:"feature.legal.esi.wage-ceiling",ruleId:"rule.legal.esi.wage-ceiling",
 productRuleId:"esi-chapter-iv-wage-ceiling-source-review",title:"ESI Chapter IV wage-ceiling source review",
 queryTerms:["ESI wage ceiling","Chapter IV","section 2(89)","wage classification","threshold source"],
 fields:[
  S("fact.esi.ceiling.chapter-iv-source","esiChapterIvWageCeilingSourceStatus","Chapter IV wage-ceiling source status"),
  S("fact.esi.ceiling.wage-definition-review","esiWageDefinitionReviewStatus","Statutory wage-definition review status"),
  S("fact.esi.ceiling.classification-control","esiWageClassificationControl","Wage-classification control"),
  S("fact.esi.ceiling.overtime-treatment-review","esiOvertimeTreatmentReviewStatus","Overtime-treatment review status"),
  S("fact.esi.ceiling.version-control","esiWageCeilingVersionControl","Threshold source-version control"),
  A("fact.esi.ceiling.evidence.references","esiWageCeilingEvidenceReferences","Wage-ceiling source references",["esi-chapter-iv-ceiling-source-register"],["esi-chapter-iv-ceiling-gap-register"])
 ],
 codes:["ESI_WAGE_CEILING_SOURCE_RECORDED_SPECIALIST_REVIEW","ESI_WAGE_CEILING_SOURCE_GAPS_SPECIALIST_REVIEW","ESI_WAGE_CEILING_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-esi-membership-continuation-so-2351e-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Clause (89) of section 2 and Chapter IV employee definition context",purpose:"Wage-ceiling source and wage-definition framework"},
  {registrySourceId:"social-security-esi-membership-continuation-so-2351e-2026",reference:"S.O. 2351(E), dated 8 May 2026",purpose:"Confirms dependence on a separately notified Chapter IV wage ceiling; does not supply the ceiling"}
 ],
 limitations:["The exact current Chapter IV wage-ceiling notification is not included in the controlled pack and no amount may be inferred or hard-coded.","The route accepts source-control statuses and references only; employee wages and payroll data are prohibited."]
},
{
 key:"ceiling-continuation",featureId:"feature.legal.esi.ceiling-continuation",ruleId:"rule.legal.esi.ceiling-continuation",
 productRuleId:"esi-ceiling-continuation-routing-review",title:"ESI contribution-period ceiling-continuation routing review",
 queryTerms:["ESI contribution period","crossed wage ceiling","membership continuation","S.O. 2351(E)","saved regulations"],
 fields:[
  S("fact.esi.continuation.period-source","esiContributionPeriodSourceStatus","Contribution-period source status"),
  S("fact.esi.continuation.crossing-timing-control","esiCeilingCrossingTimingControl","Ceiling-crossing timing control"),
  S("fact.esi.continuation.routing-control","esiCeilingContinuationRoutingControl","Continuation-routing control"),
  S("fact.esi.continuation.current-ceiling-link","esiCurrentCeilingSourceLinkControl","Current ceiling-source link control"),
  S("fact.esi.continuation.saved-period-review","esiSavedPeriodDefinitionReviewStatus","Saved period-definition review status"),
  A("fact.esi.continuation.evidence.references","esiCeilingContinuationEvidenceReferences","Ceiling-continuation references",["esi-ceiling-continuation-control-register"],["esi-ceiling-continuation-gap-register"])
 ],
 codes:["ESI_CEILING_CONTINUATION_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_CEILING_CONTINUATION_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_CEILING_CONTINUATION_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-esi-membership-continuation-so-2351e-2026","employees-state-insurance-general-regulations-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"First proviso to clause (26) of section 2",purpose:"Statutory continuation framework"},
  {registrySourceId:"social-security-esi-membership-continuation-so-2351e-2026",reference:"S.O. 2351(E), dated 8 May 2026",purpose:"Continuation after crossing a separately notified Chapter IV ceiling"},
  {registrySourceId:"employees-state-insurance-general-regulations-1950",reference:"Contribution-period definitions, saved-law candidate",purpose:"Period context subject to saved-law review"}
 ],
 limitations:["The route does not decide an individual's continued insured status or accept employee wages, dates or insurance numbers.","Current contribution-period treatment and the underlying Chapter IV ceiling source remain qualified-review dependencies."]
},
{
 key:"contribution-rate",featureId:"feature.legal.esi.contribution-rate",ruleId:"rule.legal.esi.contribution-rate",
 productRuleId:"esi-contribution-rate-source-verification-review",title:"ESI contribution-rate source verification review",
 queryTerms:["ESI contribution rate","Rule 19","employer rate source","employee rate source","effective date"],
 fields:[
  S("fact.esi.rate.ordinary-source","esiOrdinaryRateSourceStatus","Ordinary contribution-rate source status"),
  S("fact.esi.rate.employer-source-control","esiEmployerRateSourceControl","Employer-rate source control"),
  S("fact.esi.rate.employee-source-control","esiEmployeeRateSourceControl","Employee-rate source control"),
  S("fact.esi.rate.effective-date-control","esiRateEffectiveDateControl","Rate effective-date control"),
  S("fact.esi.rate.exception-escalation","esiRateExceptionEscalationControl","Rate-exception escalation control"),
  A("fact.esi.rate.evidence.references","esiContributionRateEvidenceReferences","Contribution-rate source references",["esi-rate-source-control-register"],["esi-rate-source-gap-register"])
 ],
 codes:["ESI_RATE_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","ESI_RATE_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","ESI_RATE_SOURCE_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-central-rules-2026","employees-state-insurance-central-rules-1950","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Sections 29–31",purpose:"Contribution responsibility framework"},
  {registrySourceId:"social-security-central-rules-2026",reference:"Rule 19",purpose:"Current ordinary contribution-rate source context"},
  {registrySourceId:"employees-state-insurance-central-rules-1950",reference:"Former Rules 51–52, historical only",purpose:"Historical comparison context; not prospective authority"}
 ],
 limitations:["The route verifies source controls only and does not accept percentages, wages or contribution amounts.","Applicability, exceptions, effective-date treatment and calculations remain outside the product and require qualified review."]
}
]);
module.exports=Object.freeze({CONFIGS});
