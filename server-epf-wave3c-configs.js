"use strict";

const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced")=>({
  factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator:"equals"
});
const A=(factId,answerKey,label,complete,gap)=>({
  factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"
});

const CONFIGS=Object.freeze([
{
 key:"exemption",featureId:"feature.legal.epf.exemption-review",ruleId:"rule.legal.epf.exemption-review",
 productRuleId:"epf-exemption-governance-review",title:"EPF exemption governance and source-control review",
 queryTerms:["epf exemption","exempted establishment","exemption order","trust governance","inspection","returns","surrender","cancellation"],
 fields:[
  S("fact.epf.exemption.route-recorded","epfExemptionRouteStatus","Exemption applicability route recorded"),
  S("fact.epf.exemption.order-reference","epfExemptionOrderReferenceStatus","Official exemption-order reference recorded"),
  S("fact.epf.exemption.scope-current","epfExemptionScopeReviewStatus","Current exemption scope reviewed"),
  S("fact.epf.exemption.trust-governance","epfExemptionTrustGovernanceControl","Trust-governance control"),
  S("fact.epf.exemption.returns-inspection","epfExemptionReturnsInspectionControl","Returns and inspection control"),
  A("fact.epf.exemption.evidence.references","epfExemptionEvidenceReferences","Exemption evidence references",["exemption-control-register"],["exemption-gap-register"])
 ],
 codes:["EPF_EXEMPTION_CONTROLS_RECORDED_SPECIALIST_REVIEW","EPF_EXEMPTION_CONTROL_GAPS_SPECIALIST_REVIEW","EPF_EXEMPTION_FACTS_MISSING"],
 registrySourceIds:[
  "social-security-code-2020","employees-provident-funds-scheme-2026",
  "epfo-exemption-manual-2023","epfo-exemption-management-sop-2023",
  "social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"
 ],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Exemption and savings framework",purpose:"Central statutory exemption and transition context"},
  {registrySourceId:"employees-provident-funds-scheme-2026",reference:"Exemption, trust and continuing-membership provisions",purpose:"Scheme-level exemption control context"},
  {registrySourceId:"epfo-exemption-manual-2023",reference:"EPFO Exemption Manual and grant, surrender and cancellation SOP set",purpose:"Official operational governance context"},
  {registrySourceId:"epfo-exemption-management-sop-2023",reference:"Management and Regulation of EPF Exemption SOP, 29 November 2023",purpose:"Trust, returns, inspection and monitoring context"}
 ],
 limitations:[
  "The route reviews whether exemption governance and source controls are recorded; it does not determine that an establishment is exempt.",
  "An exemption order number may be retained only as a controlled evidence reference; the order body, trust member data and investment records are prohibited."
 ]
},
{
 key:"international-worker",featureId:"feature.legal.epf.international-worker-review",ruleId:"rule.legal.epf.international-worker-review",
 productRuleId:"epf-international-worker-ssa-control-review",title:"EPF international-worker and SSA control review",
 queryTerms:["international worker","social security agreement","SSA","certificate of coverage","detachment","excluded employee","expiry monitoring"],
 fields:[
  S("fact.epf.iw.population-review","epfIwPopulationReviewStatus","International-worker population review status"),
  S("fact.epf.iw.ssa-route","epfIwSsaRouteStatus","SSA country and route classification status"),
  S("fact.epf.iw.coc-control","epfIwCertificateControlStatus","Certificate-of-coverage control"),
  S("fact.epf.iw.expiry-monitoring","epfIwExpiryMonitoringControl","Detachment and certificate expiry-monitoring control"),
  S("fact.epf.iw.membership-escalation","epfIwMembershipEscalationControl","EPF and EPS membership escalation control"),
  A("fact.epf.iw.evidence.references","epfIwEvidenceReferences","International-worker evidence references",["iw-route-control-register"],["iw-gap-register"])
 ],
 codes:["EPF_IW_CONTROLS_RECORDED_SPECIALIST_REVIEW","EPF_IW_CONTROL_GAPS_SPECIALIST_REVIEW","EPF_IW_FACTS_MISSING"],
 registrySourceIds:[
  "employees-provident-funds-scheme-2026","epfo-international-workers-faq-2026",
  "epfo-operating-ssa-register-2026","social-security-code-2020",
  "social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"
 ],
 sections:[
  {registrySourceId:"employees-provident-funds-scheme-2026",reference:"International-worker, excluded-employee and membership provisions",purpose:"Scheme definitions and membership-routing context"},
  {registrySourceId:"epfo-international-workers-faq-2026",reference:"EPFO FAQ items 283–290",purpose:"Official international-worker, detachment, certificate and SSA guidance context"},
  {registrySourceId:"epfo-operating-ssa-register-2026",reference:"EPFO operating SSA country pages and linked agreement register",purpose:"Country-specific agreement and certificate-of-coverage source routing"}
 ],
 limitations:[
  "The route processes organisation control statuses and evidence references only; it does not determine an individual's international-worker or excluded-employee status.",
  "A country-specific SSA, administrative arrangement and current certificate-of-coverage record require qualified review outside the product."
 ]
}
]);

module.exports=Object.freeze({CONFIGS});
