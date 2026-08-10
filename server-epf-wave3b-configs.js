"use strict";

const T=(factId,answerKey,label,allowed,complete,gap="unknown",operator="not-equals",conditionValue="unknown")=>({factId,answerKey,type:"controlled-text",label,normalize:"token",allowed,complete,gap,operator,conditionValue});
const S=(factId,answerKey,label,complete="evidenced",gap="not-evidenced",operator="equals",conditionValue=undefined)=>({factId,answerKey,type:"control-status",label,normalize:"status",complete,gap,operator,...(conditionValue===undefined?{}:{conditionValue})});
const A=(factId,answerKey,label,complete,gap)=>({factId,answerKey,type:"evidence-reference-array",label,normalize:"array",complete,gap,operator:"exists"});

const CONFIGS=Object.freeze([
{
 key:"wage-ceiling",featureId:"feature.legal.epf.wage-ceiling",ruleId:"rule.legal.epf.wage-ceiling",
 productRuleId:"epf-wage-ceiling-source-review",title:"EPF wage-ceiling source and routing review",
 queryTerms:["epf wage ceiling","notified ceiling","prior member","higher wage","paragraph 18","S.O. 2702(E)"],
 fields:[
  S("fact.epf.wages.ceiling-source-status","epfWageCeilingSourceStatus","Notified wage-ceiling source status"),
  T("fact.epf.wages.statutory-wage-band","epfStatutoryWageBand","Statutory wage band",["at-or-below-notified-ceiling","above-notified-ceiling","unknown","conflict"],"at-or-below-notified-ceiling"),
  T("fact.epf.membership.prior-member-status","epfPriorMemberStatus","Prior-member status",["prior-member","not-prior-member","unknown","conflict"],"not-prior-member"),
  S("fact.epf.higher-wage-contribution-status","epfHigherWageContributionStatus","Higher-wage contribution review status","not-applicable","unknown","not-equals","unknown")
 ],
 codes:["EPF_WAGE_CEILING_SOURCE_RECORDED_REVIEW_REQUIRED","EPF_WAGE_CEILING_SPECIALIST_REVIEW_REQUIRED","EPF_WAGE_CEILING_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","social-security-wage-ceiling-so-2702e-2026","employees-provident-funds-scheme-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 2(89)",purpose:"Wage-ceiling definition context"},
  {registrySourceId:"social-security-wage-ceiling-so-2702e-2026",reference:"S.O. 2702(E), 2026",purpose:"Controlled notified wage-ceiling source"},
  {registrySourceId:"employees-provident-funds-scheme-2026",reference:"Paragraph 18",purpose:"Contribution and wage-ceiling routing context"}
 ],
 limitations:["The route accepts only a controlled wage band and never an employee wage amount.","The route does not decide excluded-employee, prior-member or higher-wage treatment."]
},
{
 key:"rate-source",featureId:"feature.legal.epf.contribution-rate-source",ruleId:"rule.legal.epf.contribution-rate-source",
 productRuleId:"epf-contribution-rate-source-verification",title:"EPF contribution-rate source verification review",
 queryTerms:["epf contribution rate source","ten percent","twelve percent","official basis","paragraph 18","S.O. 320(E)","transition"],
 fields:[
  T("fact.epf.rate.declared-branch","epfDeclaredRateBranch","Declared contribution-rate branch",["ten-percent-branch","twelve-percent-branch","other","unknown","conflict"],"twelve-percent-branch"),
  S("fact.epf.rate.official-basis-recorded","epfOfficialRateBasisStatus","Official rate basis recorded"),
  S("fact.epf.rate.basis-source-reference","epfRateSourceReferenceStatus","Official rate-source reference recorded"),
  S("fact.epf.higher-wage-contribution-status","epfRateHigherWageStatus","Higher-wage contribution review status","not-applicable","unknown","not-equals","unknown"),
  S("fact.epf.transition.review-status","epfRateTransitionReviewStatus","Transition and savings review status")
 ],
 codes:["EPF_RATE_BASIS_EVIDENCED_VERIFICATION_RECOMMENDED","EPF_RATE_BASIS_NOT_EVIDENCED_SPECIALIST_REVIEW","EPF_RATE_BASIS_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","employees-provident-funds-scheme-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 16 and Chapter III contribution framework",purpose:"Contribution-rate framework"},
  {registrySourceId:"employees-provident-funds-scheme-2026",reference:"Paragraph 18",purpose:"Controlled scheme rate-branch context"}
 ],
 limitations:["A declared ten-percent or twelve-percent branch is an input for verification and is not selected or approved by the product.","The exact official S.O. 320(E) file is not in the approved source pack, so qualified legal verification remains mandatory."]
},
{
 key:"eps-membership",featureId:"feature.legal.eps.membership-routing",ruleId:"rule.legal.eps.membership-routing",
 productRuleId:"eps-membership-routing-review",title:"EPS membership-routing review",
 queryTerms:["eps membership","pension scheme routing","prior member","wage band","higher wage","employer diversion"],
 fields:[
  T("fact.eps.membership.status","epsMembershipRoutingStatus","EPS membership-routing status",["routed","not-routed","unknown","conflict"],"routed","not-routed","equals","routed"),
  T("fact.epf.membership.prior-member-status","epsPriorMemberStatus","Prior-member status",["prior-member","not-prior-member","unknown","conflict"],"prior-member"),
  T("fact.epf.wages.statutory-wage-band","epsStatutoryWageBand","Statutory wage band",["at-or-below-notified-ceiling","above-notified-ceiling","unknown","conflict"],"at-or-below-notified-ceiling"),
  S("fact.eps.higher-wage-case-present","epsHigherWageCaseStatus","Higher-wage case review status","not-applicable","unknown","not-equals","unknown"),
  S("fact.eps.control.employer-diversion","epsEmployerDiversionControl","Employer-diversion control")
 ],
 codes:["EPS_MEMBERSHIP_ROUTING_REVIEW_REQUIRED","EPS_ROUTING_SPECIALIST_REVIEW_REQUIRED","EPS_ROUTING_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","employees-pension-scheme-2026","social-security-wage-ceiling-so-2702e-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 16(1)(b)",purpose:"Pension-scheme contribution framework"},
  {registrySourceId:"employees-pension-scheme-2026",reference:"Paragraphs 1–8",purpose:"EPS membership and routing context"},
  {registrySourceId:"social-security-wage-ceiling-so-2702e-2026",reference:"S.O. 2702(E), 2026",purpose:"Controlled wage-ceiling context"}
 ],
 limitations:["The route reviews controlled routing facts and does not determine an individual's EPS membership.","Higher-wage cases and transition treatment remain specialist-review only."]
},
{
 key:"eps-control",featureId:"feature.legal.eps.pension-control",ruleId:"rule.legal.eps.pension-control",
 productRuleId:"eps-pension-process-control-review",title:"EPS pension-process control review",
 queryTerms:["eps pension control","employer diversion","records","claims","higher wage","scheme paragraph"],
 fields:[
  S("fact.eps.membership.routing-control","epsMembershipRoutingControl","EPS membership-routing control"),
  S("fact.eps.control.employer-diversion","epsPensionEmployerDiversionControl","Employer-diversion control"),
  S("fact.eps.records-control","epsRecordsControl","EPS records control"),
  S("fact.eps.claim-control","epsClaimControl","EPS claim-process control"),
  S("fact.eps.higher-wage-case-escalation","epsHigherWageEscalationControl","Higher-wage case escalation control"),
  A("fact.eps.evidence.references","epsEvidenceReferences","EPS evidence references",["eps-control-register"],["eps-gap-register"])
 ],
 codes:["EPS_CONTROL_EVIDENCED_VERIFICATION_RECOMMENDED","EPS_CONTROL_GAPS_SPECIALIST_REVIEW","EPS_CONTROL_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","employees-pension-scheme-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 16(1)(b)",purpose:"Pension-scheme framework"},
  {registrySourceId:"employees-pension-scheme-2026",reference:"Paragraphs 9–29",purpose:"Pension contribution, records and claims control context"}
 ],
 limitations:["Only control statuses and evidence references are accepted; completed claims and pension records are prohibited.","The route does not determine pension eligibility, amount or claim outcome."]
},
{
 key:"edli-control",featureId:"feature.legal.edli.coverage-control",ruleId:"rule.legal.edli.coverage-control",
 productRuleId:"edli-coverage-process-control-review",title:"EDLI coverage and process-control review",
 queryTerms:["edli coverage","deposit linked insurance","rate source","contribution control","claim control","transition"],
 fields:[
  S("fact.edli.membership-control","edliMembershipControl","EDLI membership control"),
  S("fact.edli.rate-source-present","edliRateSourceStatus","Current EDLI rate source status"),
  S("fact.edli.contribution-control","edliContributionControl","EDLI contribution-process control"),
  S("fact.edli.claim-control","edliClaimControl","EDLI claim-process control"),
  S("fact.edli.transition-review-status","edliTransitionReviewStatus","EDLI transition and savings review status"),
  A("fact.edli.evidence.references","edliEvidenceReferences","EDLI evidence references",["edli-control-register"],["edli-gap-register"])
 ],
 codes:["EDLI_CONTROL_EVIDENCED_VERIFICATION_RECOMMENDED","EDLI_RATE_SOURCE_SPECIALIST_REVIEW","EDLI_CONTROL_FACTS_MISSING"],
 registrySourceIds:["social-security-code-2020","employees-deposit-linked-insurance-scheme-2026","social-security-code-commencement-so-5319e-2025","social-security-code-corrigendum-so-5936e-2025"],
 sections:[
  {registrySourceId:"social-security-code-2020",reference:"Section 16(1)(c)",purpose:"Deposit-linked insurance framework"},
  {registrySourceId:"employees-deposit-linked-insurance-scheme-2026",reference:"Paragraphs 1–25",purpose:"EDLI membership, contribution and claim-control context"}
 ],
 limitations:["The current EDLI rate authority remains unconfirmed and must be verified by qualified legal review.","The route does not calculate an EDLI contribution or decide a claim or benefit."]
}
]);

module.exports=Object.freeze({CONFIGS});
