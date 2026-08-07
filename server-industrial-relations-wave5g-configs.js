"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([{
 key:"industrial-relations-standing-orders-readiness",featureId:"feature.legal.industrial-relations",ruleId:"rule.legal.industrial-relations.standing-orders-readiness",
 productRuleId:"industrial-relations-standing-orders-readiness-review",title:"Industrial Relations standing-orders source-readiness review",
 queryTerms:["Industrial Relations Code","standing orders","Model Standing Orders","Central Rules","section 104 transition","Maharashtra draft rules","certifying officer","appellate authority","specialist review"],
 fields:[
  T("fact.industrial-relations.declared-source-route","industrialRelationsDeclaredSourceRoute","Declared source route",["central-sphere-candidate","maharashtra-state-candidate","mixed-scope-candidate","multi-location-review","unresolved","not-claimed","unknown","conflict"],"maharashtra-state-candidate"),
  S("fact.industrial-relations.code-source","industrialRelationsCodeSourceStatus","Industrial Relations Code source status"),
  S("fact.industrial-relations.amendment-act-source","industrialRelationsAmendmentActSourceStatus","2026 amendment Act source status"),
  S("fact.industrial-relations.commencement-source","industrialRelationsCommencementSourceStatus","Code commencement source status"),
  S("fact.industrial-relations.central-rules-source","industrialRelationsCentralRulesSourceStatus","Industrial Relations Central Rules source status"),
  S("fact.industrial-relations.model-standing-orders-source","industrialRelationsModelStandingOrdersSourceStatus","Model Standing Orders 2026 source status"),
  S("fact.industrial-relations.maharashtra-draft-rules-source","industrialRelationsMaharashtraDraftRulesStatus","Maharashtra draft IR Rules source status"),
  S("fact.industrial-relations.draft-final-reconciliation","industrialRelationsDraftFinalReconciliationControl","Draft-versus-final Maharashtra rule reconciliation control"),
  S("fact.industrial-relations.standing-orders-threshold-source","industrialRelationsStandingOrdersThresholdSourceControl","Standing-orders threshold source control"),
  S("fact.industrial-relations.establishment-classification","industrialRelationsEstablishmentClassificationControl","Industrial-establishment classification control"),
  S("fact.industrial-relations.adoption-certification","industrialRelationsStandingOrdersAdoptionCertificationControl","Standing-orders adoption and certification source control"),
  S("fact.industrial-relations.authority-source","industrialRelationsStandingOrdersAuthoritySourceControl","Standing-orders certifying/appellate authority source control"),
  S("fact.industrial-relations.legacy-transition","industrialRelationsLegacyRepealSavingsTransitionControl","Legacy repeal and savings transition control"),
  S("fact.industrial-relations.authority-continuity","industrialRelationsTribunalAuthorityContinuityControl","Tribunal and statutory-authority continuity control"),
  S("fact.industrial-relations.specialist-escalation","industrialRelationsSpecialistEscalationControl","Industrial Relations specialist-escalation control"),
  A("fact.industrial-relations.evidence.references","industrialRelationsEvidenceReferences","Industrial Relations controlled source references",["industrial-relations-standing-orders-source-register"],["industrial-relations-standing-orders-source-gap-register"])
 ],
 codes:["INDUSTRIAL_RELATIONS_SOURCE_CONTROLS_RECORDED_SPECIALIST_REVIEW","INDUSTRIAL_RELATIONS_SOURCE_CONTROL_GAPS_SPECIALIST_REVIEW","INDUSTRIAL_RELATIONS_FACTS_MISSING"],
 registrySourceIds:["industrial-relations-code-2020","industrial-relations-central-rules-2026","industrial-relations-commencement-so-5320e-2025","industrial-relations-removal-difficulties-so-5683e-2025","industrial-relations-code-amendment-act-2026","industrial-relations-model-standing-orders-2026","maharashtra-industrial-relations-draft-rules-2026","industrial-relations-standing-orders-authority-notifications-2026"],
 sections:[
  {registrySourceId:"industrial-relations-code-2020",reference:"Chapter IV, sections 28–39 and section 104",purpose:"Standing-orders application, model-order, certification and transition source-readiness only"},
  {registrySourceId:"industrial-relations-central-rules-2026",reference:"G.S.R. 342(E), 8 May 2026; Chapter IV, Rules 10–18 and preamble supersession clause",purpose:"Central standing-orders procedure and legacy-rule transition source-readiness only"},
  {registrySourceId:"industrial-relations-commencement-so-5320e-2025",reference:"S.O. 5320(E), 21 November 2025",purpose:"Code commencement source control only"},
  {registrySourceId:"industrial-relations-removal-difficulties-so-5683e-2025",reference:"S.O. 5683(E), 8 December 2025",purpose:"Legacy tribunal and adjudicatory continuity source control only"},
  {registrySourceId:"industrial-relations-code-amendment-act-2026",reference:"Industrial Relations Code (Amendment) Act, 2026; section 2",purpose:"Section 104 repeal and statutory-authority continuity transition source control only"},
  {registrySourceId:"industrial-relations-model-standing-orders-2026",reference:"Model Standing Orders, 2026 — mine, manufacturing and service sectors",purpose:"Model standing-order source identity and sector-source readiness only; no sector selection"},
  {registrySourceId:"maharashtra-industrial-relations-draft-rules-2026",reference:"Maharashtra State draft rules for Code on IR, published 28 April 2026",purpose:"Draft Maharashtra State-rule source identity only; not final or operative"},
  {registrySourceId:"industrial-relations-standing-orders-authority-notifications-2026",reference:"Ministry IR notification register — certifying officer under section 2(g) and appellate authority under section 32",purpose:"Standing-orders authority source-readiness only"}
 ],
 limitations:["This review records organisation-level Industrial Relations transition and standing-orders source readiness for a bounded Central/Maharashtra candidate route only.","It does not decide whether Chapter IV applies, count workers, classify an industrial establishment, select a Model Standing Orders sector, adopt or certify standing orders, validate modifications, decide territorial authority or determine the legal effect of a customer document.","The Maharashtra 2026 Industrial Relations Rules in this pack are published draft rules. They cannot be treated as final or operative until an exact final State instrument is separately controlled and qualified review approves its use.","Strike, lock-out, notice-of-change, industrial-dispute, arbitration, lay-off, retrenchment, closure, unfair-labour-practice, penalty, prosecution, worker-level termination, disciplinary merits and remedy decisions remain outside this Wave 5G pack.","No employee or union-member identities, disciplinary allegations, termination or dismissal narratives, dispute or grievance bodies, strike/lock-out narratives, payroll, wages, attendance, standing-order text, notices, orders, pleadings, settlement bodies, evidence bodies or other worker-level case material may be sent to the provider."]
}]);
module.exports=Object.freeze({CONFIGS});
