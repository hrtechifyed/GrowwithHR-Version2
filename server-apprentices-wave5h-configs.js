"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"apprentices-classification-readiness",featureId:"feature.legal.apprentices",ruleId:"rule.legal.apprentices.classification-readiness",
 productRuleId:"apprentices-classification-readiness-review",title:"Apprentices source and classification readiness review",
 queryTerms:["Apprentices Act","Apprenticeship Rules","G.S.R. 610(E)","designated trade","optional trade","apprentice category","Apprenticeship Adviser","NAPS-2","apprenticeship portal","specialist review"],
 fields:[
  T("fact.apprentices.declared-source-route","apprenticesDeclaredSourceRoute","Declared apprenticeship source route",["central-trade-candidate","state-trade-candidate","graduate-technician-board-candidate","optional-trade-candidate","mixed-category-candidate","multi-state-review","unresolved","not-claimed","unknown","conflict"],"state-trade-candidate"),
  S("fact.apprentices.act-source","apprenticesActSourceStatus","Current Apprentices Act source status"),
  S("fact.apprentices.base-rules-source","apprenticesBaseRulesSourceStatus","Apprenticeship Rules, 1992 base-source status"),
  S("fact.apprentices.rules-2025-source","apprenticesRules2025AmendmentSourceStatus","Apprenticeship Amendment Rules, 2025 source status"),
  S("fact.apprentices.current-rules-portal-reconciliation","apprenticesCurrentRulesPortalReconciliationControl","Current Rules versus portal-summary reconciliation control"),
  S("fact.apprentices.trade-route-classification","apprenticesTradeRouteClassificationControl","Designated-versus-optional trade classification source control"),
  S("fact.apprentices.category-classification","apprenticesCategoryClassificationControl","Apprentice-category classification source control"),
  S("fact.apprentices.establishment-manpower-band","apprenticesEstablishmentManpowerBandSourceControl","Establishment manpower and engagement-band source control"),
  S("fact.apprentices.state-variation","apprenticesStateVariationSourceControl","State-variation source control"),
  S("fact.apprentices.designated-trades-register","apprenticesDesignatedTradesRegisterStatus","DGT designated-trades register status"),
  S("fact.apprentices.optional-trades-register","apprenticesOptionalTradesRegisterStatus","DGT optional-trades register status"),
  S("fact.apprentices.portal-naps-lifecycle","apprenticesPortalNapsLifecycleSourceControl","Apprenticeship portal and NAPS lifecycle source control"),
  S("fact.apprentices.authority-routing","apprenticesAuthorityRoutingSourceControl","Apprenticeship Adviser / Board authority-routing source control"),
  S("fact.apprentices.training-infrastructure","apprenticesTrainingInfrastructureSourceControl","Organisation training-infrastructure source control"),
  S("fact.apprentices.specialist-escalation","apprenticesSpecialistEscalationControl","Apprentices specialist-escalation control"),
  A("fact.apprentices.evidence.references","apprenticesEvidenceReferences","Apprentices controlled source references",["apprentices-classification-source-register"],["apprentices-classification-source-gap-register"])
 ],
 codes:["APPRENTICES_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","APPRENTICES_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","APPRENTICES_FACTS_MISSING"],
 registrySourceIds:["apprentices-act-1961-current-2026","apprenticeship-rules-1992-base","apprenticeship-amendment-rules-2025-gsr-610e","dgt-apprenticeship-training-overview-2026","dgt-designated-trades-register-2026","dgt-optional-trades-register-2026","naps2-guidelines-2023","apprenticeshipindia-portal-2026"],
 sections:[
  {registrySourceId:"apprentices-act-1961-current-2026",reference:"Sections 1–8, 18–19, 23–27 and 35; current India Code text as on 22 June 2026",purpose:"Application, definitions, designated/optional trade, apprentice-number and authority source-readiness only"},
  {registrySourceId:"apprenticeship-rules-1992-base",reference:"Rules 3, 5–7B, 11, 14 and relevant Schedules; DGT-hosted base Rules file",purpose:"Base rule structure only; later amendments require separate reconciliation"},
  {registrySourceId:"apprenticeship-amendment-rules-2025-gsr-610e",reference:"G.S.R. 610(E), published 11 September 2025; amendments to Rules 2, 3, 5, 6, 7, 7A, 7B, 11, 14 and Schedules",purpose:"Current amendment and Rule 7B/portal-contract source control only"},
  {registrySourceId:"dgt-apprenticeship-training-overview-2026",reference:"DGT Apprenticeship Training overview, reviewed 7 August 2026",purpose:"Designated/optional trade and apprentice-category overview only; portal summary is not current-law authority"},
  {registrySourceId:"dgt-designated-trades-register-2026",reference:"DGT List of Designated Trades, reviewed 7 August 2026",purpose:"Designated-trade register source only; no customer trade selection"},
  {registrySourceId:"dgt-optional-trades-register-2026",reference:"DGT Optional Trades syllabus register, reviewed 7 August 2026",purpose:"Optional-trade register source only; no course approval or role classification"},
  {registrySourceId:"naps2-guidelines-2023",reference:"NAPS-2 Guidelines, section 11 apprenticeship portal and scheme implementation",purpose:"Scheme and portal lifecycle context only; no scheme eligibility or DBT determination"},
  {registrySourceId:"apprenticeshipindia-portal-2026",reference:"Apprenticeship India portal source identity, reviewed 7 August 2026",purpose:"Portal lifecycle source identity only; not statutory applicability or classification authority"}
 ],
 limitations:["This review records organisation-level Apprentices Act/Rules, trade-register, portal, authority and classification-source readiness only.","It does not decide whether an establishment must engage apprentices, calculate worker strength or apprentice numbers, choose a statutory percentage band, resolve State amendments, classify a customer role as a designated or optional trade, classify an individual apprentice, or determine the competent authority.","The DGT base Rules file and overview material are not treated as a single current consolidated legal text. The September 2025 amendment and any later current-law changes must be reconciled separately; portal summary wording cannot override Gazette or current India Code material.","Individual eligibility, minimum age, educational or physical-fitness qualification, disability/reservation treatment, apprenticeship contract validity, training period, stipend, payment, examination, certification, termination, compensation, dispute, penalty, NAPS eligibility, reimbursement, DBT and remedy decisions remain specialist-only.","No apprentice identities, age/date of birth, sex/gender, caste/community, disability or medical data, educational records, Aadhaar, contact/address data, contract numbers or bodies, bank/stipend/payroll data, training dates, attendance, assessments, certificates, disputes, notices, orders, injury information or evidence bodies may be sent to the provider."]
}]);
module.exports=Object.freeze({CONFIGS});
