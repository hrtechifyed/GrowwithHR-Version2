import { analyzeWorkforceCapability, finalizeWorkforcePlan } from "./modules/workforce/workforce-capability-engine.mjs";
import { generateWorkforceCapabilityPdf } from "./workforce-capability-pdf.mjs";

const REPORT_KEY = "growwithhr.workforce-capability.report";
const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const RENDER_BASE = "https://growwithhr.onrender.com";
const content = document.getElementById("wcpReportContent");
const subtitle = document.getElementById("wcpReportSubtitle");
const printButton = document.getElementById("wcpPrintReport");
const downloadButton = document.getElementById("wcpDownloadReport");
const deliveryStatus = document.getElementById("wcpReportDeliveryStatus");

function clean(value, fallback = "") { return String(value ?? "").replace(/\s+/g, " ").trim() || fallback; }
function esc(value) { return clean(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function list(value) { return Array.isArray(value) ? value : []; }
function apiBase() { return location.origin === GITHUB_PAGES_ORIGIN ? RENDER_BASE : ""; }
function readPayload() { try { return JSON.parse(sessionStorage.getItem(REPORT_KEY) || "null"); } catch (_error) { return null; } }

function samplePayload() {
  const data = {
    company: { name:"Northstar Cloud Systems", email:"sample@example.com", industry:"B2B Technology", currentEmployees:420, expectedEmployees:560, horizonMonths:18, locations:"India · UK · Remote" },
    strategy: { objective:"Grow enterprise revenue from 18% to 40% within 18 months while maintaining implementation quality.", targetOutcome:"40% enterprise revenue", businessImpact:"critical" },
    frameworks:["cipd","capability","scenario"],
    capabilities:[
      {name:"Enterprise solution selling",importance:"critical",currentCoverage:"partial",capacityStatus:"constrained",concentrationRisk:"medium",internalAdjacency:"yes",temporaryNeed:"no",workRedesignPotential:"low",rolesAffected:"Enterprise account executives; solution consultants"},
      {name:"Enterprise implementation & customer success",importance:"critical",currentCoverage:"low",capacityStatus:"insufficient",concentrationRisk:"high",internalAdjacency:"yes",temporaryNeed:"no",workRedesignPotential:"medium",rolesAffected:"Implementation consultants; customer success managers"},
      {name:"Revenue operations analytics",importance:"important",currentCoverage:"adequate",capacityStatus:"adequate",concentrationRisk:"single-point",internalAdjacency:"yes",temporaryNeed:"no",workRedesignPotential:"high",rolesAffected:"Revenue operations; sales operations"}
    ],
    scenarios:{baseGrowthPct:33,highGrowthPct:45,workRedesignPct:12},
    economics:{currency:"INR",budgetCap:18000000,annualCostPerHire:2400000,trainingCostPerPerson:180000,contractorMonthlyCost:350000,automationInvestment:4500000}
  };
  const analysis=analyzeWorkforceCapability(data); const plan=finalizeWorkforcePlan(analysis,"hybrid");
  return {sample:true,data,analysis,plan,reportId:"GWHR-SAMPLE-WCP-20260906",generatedAt:"2026-09-06T00:00:00.000Z"};
}

function currentPayload() {
  if (new URLSearchParams(location.search).get("sample") === "1") return samplePayload();
  const payload=readPayload(); return payload?.plan ? payload : null;
}

function findingMarkup(item) {
  return `<article class="wcp-result-card"><div class="wcp-result-card__top"><span class="wcp-status">${esc(item.label)}</span><span class="wcp-confidence">${esc(item.confidence)} confidence</span></div><h3>${esc(item.capability)}</h3><p>${esc(item.reason)}</p><p><strong>Options:</strong> ${esc(list(item.interventions).slice(0,3).map(option=>option.label).join(" · "))}</p><details><summary>Why this result?</summary><p><strong>Facts used:</strong> ${esc(list(item.factsUsed).join("; "))}</p><p><strong>Rule:</strong> ${esc(list(item.ruleIds).join(" · "))}</p>${list(item.missingFacts).length?`<p><strong>Missing information:</strong> ${esc(item.missingFacts.join(", "))}</p>`:""}<p><strong>What could change this:</strong> ${esc(item.whatWouldChangeThis)}</p></details></article>`;
}

function frameworkMarkup(item) {
  return `<article class="wcp-framework-card"><div class="wcp-eyebrow">${esc(item.framework?.lens)}</div><h3>${esc(item.framework?.name)}</h3><p><strong>${esc(item.headline)}</strong></p><p>${esc(item.interpretation)}</p></article>`;
}

function renderFullSample(payload) {
  const plan=payload.plan;
  subtitle.textContent=`Complete fictional sample for ${payload.data.company.name}. Example data only.`;
  content.innerHTML=`
    <section class="wcp-panel"><div class="wcp-eyebrow">EXECUTIVE SUMMARY · FICTIONAL SAMPLE</div><h2>${esc(plan.overallPosition.headline)}</h2><p><strong>Strategy:</strong> ${esc(payload.data.strategy.objective)}</p><div class="wcp-metric-grid"><div><strong>${esc(payload.data.company.currentEmployees)}</strong><span>Current employees</span></div><div><strong>${esc(payload.data.company.expectedEmployees)}</strong><span>Planning horizon employees</span></div><div><strong>${esc(plan.findings.filter(item=>item.status.includes("gap")).length)}</strong><span>Gap findings</span></div><div><strong>${esc(plan.selectedApproachLabel)}</strong><span>Selected approach</span></div></div></section>
    <section class="wcp-panel"><div class="wcp-eyebrow">FRAMEWORK COMPARISON</div><h2>Three lenses retained in the decision record</h2><div class="wcp-framework-comparison">${plan.frameworkComparisons.map(frameworkMarkup).join("")}</div></section>
    <section class="wcp-panel"><div class="wcp-eyebrow">GAP ANALYSIS</div><h2>Capability and workforce findings</h2><div class="wcp-findings-grid">${plan.findings.map(findingMarkup).join("")}</div></section>
    <section class="wcp-panel"><div class="wcp-eyebrow">IMPLEMENTATION ROADMAP</div><h2>12–36 month plan</h2>${plan.roadmap.map(period=>`<div class="wcp-result-card" style="margin-top:10px"><h3>${esc(period.horizon)}</h3><ul>${list(period.actions).map(action=>`<li>${esc(action)}</li>`).join("")}</ul></div>`).join("")}</section>`;
  printButton.hidden=false; downloadButton.hidden=false; downloadButton.textContent="Download Sample PDF";
  printButton.addEventListener("click",()=>window.print());
  downloadButton.addEventListener("click",()=>generateWorkforceCapabilityPdf(payload,{mode:"download"}));
}

function renderPersonalizedGlimpse(payload) {
  const plan=payload.plan; const gapCount=plan.findings.filter(item=>["confirmed-gap","likely-gap","capacity-gap"].includes(item.status)).length;
  subtitle.textContent=`Executive glimpse for ${payload.data.company.name}. The complete report is email-only after sign-in.`;
  printButton.hidden=true; downloadButton.hidden=true;
  content.innerHTML=`<section class="wcp-glimpse"><div class="wcp-glimpse__head"><div><div class="wcp-eyebrow">YOUR REPORT GLIMPSE</div><h2>${esc(payload.data.company.name)} · Workforce &amp; Capability Planning</h2><p>${esc(plan.overallPosition.headline)}</p></div><span class="wcp-glimpse__lock">Full detail email-only</span></div><div class="wcp-metric-grid"><div><strong>${esc(payload.data.company.currentEmployees??"—")}</strong><span>Current employees</span></div><div><strong>${esc(plan.capabilities.length)}</strong><span>Capabilities assessed</span></div><div><strong>${esc(gapCount)}</strong><span>Material gap findings</span></div><div><strong>${esc(plan.selectedApproachLabel)}</strong><span>Planning approach</span></div></div><ul class="wcp-priority-list">${plan.findings.slice(0,3).map((item,index)=>`<li><strong>${index+1}. ${esc(item.capability)} — ${esc(item.label)}</strong><br>${esc(item.reason)}</li>`).join("")}</ul><p class="wcp-delivery-status">The complete PDF includes framework comparison, all gaps, Build / Buy / Borrow / Bind / Bot / Move options, implementation economics, scenarios, 12–36 month roadmap, facts used, rule IDs, confidence, assumptions and sources.</p><div id="wcpCustomerAuthMount" class="wcp-auth-mount"></div><div class="wcp-full-report-access"><button id="wcpEmailFullReport" class="wcp-primary" type="button" disabled>Email my complete report</button><p id="wcpAuthDeliveryStatus" class="wcp-delivery-status">Sign in or create an account using the assessment work email to enable secure delivery.</p></div></section>`;
}

async function activityEvent(payload,eventName,filename="") {
  try { fetch(`${apiBase()}/api/workforce-capability-report/activity`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:eventName,companyName:payload.data?.company?.name,email:payload.data?.company?.email,reportId:payload.reportId,filename,rulesetVersion:payload.plan?.rulesetVersion,occurredAt:new Date().toISOString()})}); } catch(_error){}
}

async function emailPdf(payload) {
  await import("./customer-auth.js");
  await Promise.resolve(window.GrowWithHRCustomerAuthReady).catch(()=>{});
  const auth=window.GrowWithHRCustomerAuth;
  const expectedEmail=clean(payload.data?.company?.email).toLowerCase();
  const session=await auth.requireMatchingSession(expectedEmail);
  const pdf=await generateWorkforceCapabilityPdf(payload,{mode:"base64"});
  const methodologyUrl=new URL("workforce-capability-methodology.html",location.href).href;
  const response=await auth.authorizedFetch(`${apiBase()}/api/workforce-capability-report/deliver`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lead:{name:clean(payload.data?.company?.name,"Customer"),email:session.user.email,companyName:payload.data?.company?.name},report:{companyName:payload.data?.company?.name,recipientEmail:session.user.email,reportId:payload.reportId,engineVersion:payload.plan?.engineVersion,rulesetVersion:payload.plan?.rulesetVersion,selectedApproach:payload.plan?.selectedApproachLabel,methodologyUrl},pdf})},expectedEmail);
  let body={}; try{body=await response.json();}catch(_error){}
  if(!response.ok||body.customerSent!==true)throw new Error(body.error||"The complete Workforce & Capability report email could not be sent.");
  activityEvent(payload,"emailed",pdf.filename); return body;
}

async function bindPersonalizedAccess(payload) {
  await import("./customer-auth.js");
  await Promise.resolve(window.GrowWithHRCustomerAuthReady).catch(()=>{});
  const button=document.getElementById("wcpEmailFullReport"); const status=document.getElementById("wcpAuthDeliveryStatus"); const expectedEmail=clean(payload.data?.company?.email).toLowerCase();
  window.GrowWithHRCustomerAuth.mountGate(document.getElementById("wcpCustomerAuthMount"),{
    expectedEmail,
    title:"Sign in or create an account for the complete PDF",
    onAuthenticated(session){button.disabled=false;status.textContent=`Signed in as ${session.user.email}. The complete report will be sent only to this work email.`;},
    onSignedOut(){button.disabled=true;status.textContent="Sign in or create an account using the assessment work email to enable secure delivery.";}
  });
  button.addEventListener("click",async()=>{
    button.disabled=true; status.textContent="Generating the complete Workforce & Capability report and sending it securely…";
    try{await emailPdf(payload);status.textContent=`Complete report sent to ${expectedEmail}.`;button.textContent="Report sent";}
    catch(error){status.textContent=error.message||"The report could not be sent yet.";button.disabled=false;}
  });
}

const payload=currentPayload();
if(!payload){subtitle.textContent="No Workforce & Capability report was found in this browser.";content.innerHTML='<section class="wcp-panel"><h2>Start a new analysis</h2><p>Complete Workforce & Capability Planning before opening this report.</p><a class="wcp-primary" href="workforce-capability-planning.html">Start planning →</a></section>';printButton.hidden=true;downloadButton.hidden=true;}
else if(payload.sample){renderFullSample(payload);}
else{renderPersonalizedGlimpse(payload);await bindPersonalizedAccess(payload);}
