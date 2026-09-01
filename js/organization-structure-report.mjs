import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";
import { generateOrganizationStructurePdf } from "./organization-structure-pdf.mjs";

const REPORT_KEY = "growwithhr.organization.report";
const PREVIOUS_SNAPSHOT_KEY = "growwithhr.workspace.previous";
const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const RENDER_BASE = "https://growwithhr.onrender.com";
const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
const esc = (value) => clean(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const list = (value) => Array.isArray(value) ? value : [];

function apiBase(){ return location.origin === GITHUB_PAGES_ORIGIN ? RENDER_BASE : ""; }
function statusLabel(status){ return ({action:"Action",watch:"Watch",stable:"Stable","needs-information":"Needs information"})[status] || clean(status,"Unknown"); }
function statusRank(status){ return ({stable:0,watch:1,action:2})[status] ?? null; }
function readJson(key){ try{return JSON.parse(sessionStorage.getItem(key)||"null");}catch(_error){return null;} }

function samplePayload(){
    const previousData={shared:{companyName:"Northstar Labs Private Limited",email:"sample@example.com",industry:"Technology",growthStage:"Scaling",employees:82,expectedEmployees:108},workforce:{totalEmployees:82,expectedEmployees12Months:108},geography:{operatingLocationCount:1},organization:{peopleManagerCount:11,reportingLevels:2,founderDirectReports:7,locations:1,departments:["Sales","Product","Engineering","Finance","People"],managerRole:"player-coach",workComplexity:"complex",workStandardization:"mixed",teamIndependence:"mixed",coachingIntensity:"high",roleClarity:"mixed",decisionRights:"mixed",governanceCadence:"monthly",coordinationFriction:"some",founderDecisions:"Senior hiring, pricing exceptions and major spend",expansion:"Open a second operating location",confirmedAt:"2026-05-01T00:00:00.000Z"}};
    const data={shared:{companyName:"Northstar Labs Private Limited",email:"sample@example.com",industry:"Technology",growthStage:"Scaling",employees:108,expectedEmployees:135},workforce:{totalEmployees:108,expectedEmployees12Months:135},geography:{operatingLocationCount:2},organization:{peopleManagerCount:12,reportingLevels:3,founderDirectReports:10,locations:2,departments:["Sales","Product","Engineering","Finance","People","Customer Success"],managerRole:"player-coach",workComplexity:"complex",workStandardization:"mixed",teamIndependence:"mixed",coachingIntensity:"high",roleClarity:"mixed",decisionRights:"unclear",governanceCadence:"ad-hoc",coordinationFriction:"high",founderDecisions:"Senior hiring, pricing exceptions, major spend and selected customer commitments",expansion:"Scale to 135 employees and add another operating location",confirmedAt:"2026-09-01T00:00:00.000Z"}};
    const analysis=analyzeOrganizationStructure(data);
    return {sample:true,data,analysis,reportModel:analysis.reportModel,reportId:"GWHR-SAMPLE-ORG-20260901",previousData};
}

function currentPayload(){
    const params=new URLSearchParams(location.search);
    if(params.get("sample")==="1")return samplePayload();
    const payload=readJson(REPORT_KEY);
    return payload && payload.analysis ? payload : null;
}

function factValue(data,path){return path.split(".").reduce((value,key)=>value?.[key],data);}
const FACTS=[
    ["Employees","workforce.totalEmployees"],
    ["People managers","organization.peopleManagerCount"],
    ["Founder direct reports","organization.founderDirectReports"],
    ["Operating locations","geography.operatingLocationCount"],
    ["Reporting layers","organization.reportingLevels"],
    ["Role clarity","organization.roleClarity"],
    ["Decision ownership","organization.decisionRights"],
    ["Operating review cadence","organization.governanceCadence"],
    ["Coordination friction","organization.coordinationFriction"],
    ["12-month headcount","workforce.expectedEmployees12Months"]
];

function buildChangeIntelligence(payload){
    const previousData=payload.previousData || readJson(PREVIOUS_SNAPSHOT_KEY)?.companyData;
    if(!previousData)return {baselineAvailable:false,changes:[],factChanges:[],findingChanges:[],summary:{increased:0,improved:0,newPriority:0,informationGap:0}};
    let previousAnalysis=null;try{previousAnalysis=analyzeOrganizationStructure(previousData);}catch(_error){}
    const factChanges=FACTS.map(([label,path])=>({label,field:path,before:factValue(previousData,path),after:factValue(payload.data,path)})).filter((item)=>clean(item.before)!==""&&clean(item.after)!==""&&String(item.before)!==String(item.after));
    const beforeById=new Map(list(previousAnalysis?.findings).map((item)=>[item.id,item]));
    const findingChanges=list(payload.analysis?.findings).map((after)=>{const before=beforeById.get(after.id);if(!before||before.status===after.status)return null;let direction="changed";const beforeRank=statusRank(before.status),afterRank=statusRank(after.status);if(after.status==="needs-information"&&before.status!=="needs-information")direction="information-gap";else if(before.status==="needs-information"&&after.status!=="needs-information")direction="information-resolved";else if(beforeRank!==null&&afterRank!==null&&afterRank>beforeRank)direction="increased";else if(beforeRank!==null&&afterRank!==null&&afterRank<beforeRank)direction="improved";return{id:after.id,title:after.title,beforeStatus:before.status,afterStatus:after.status,direction};}).filter(Boolean);
    const summary={increased:findingChanges.filter((item)=>item.direction==="increased").length,improved:findingChanges.filter((item)=>item.direction==="improved").length,newPriority:findingChanges.filter((item)=>item.beforeStatus==="stable"&&["watch","action"].includes(item.afterStatus)).length,informationGap:findingChanges.filter((item)=>item.direction==="information-gap").length};
    return {baselineAvailable:true,previousReportId:payload.previousReportId||readJson(PREVIOUS_SNAPSHOT_KEY)?.reportId||"Previous confirmed baseline",factChanges,changes:factChanges,findingChanges,summary};
}

function sourceLinks(item){return list(item.sources).map((source)=>`<a class="org-source-link" href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)} · ${esc(source.publisher)}</a>`).join("");}
function findingCard(item){return `<article class="org-finding-card"><div class="org-finding-top"><span class="org-status is-${esc(item.status)}">${esc(statusLabel(item.status))}</span><span class="org-confidence">${esc(clean(item.confidence,"Context confidence"))}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.whyItMatters)}</p><div class="org-action-box"><strong>What to do next</strong><p>${esc(item.action)}</p></div><details><summary>Why GrowWithHR is saying this</summary><p><strong>Facts used:</strong> ${esc(list(item.factsUsed).join(", ")||"No confirmed facts available")}</p>${list(item.missingFacts).length?`<p><strong>Missing:</strong> ${esc(item.missingFacts.join(", "))}</p>`:""}<p><strong>GrowWithHR rule:</strong> ${esc(item.ruleId||item.id)} v${esc(item.ruleVersion||"1.1")}</p><p>${esc(item.ruleBasis)}</p>${sourceLinks(item)}</details></article>`;}

function renderSampleFull(payload){
    const model=payload.reportModel||{};const metrics=model.metrics||{};const change=payload.changeIntelligence;
    document.getElementById("reportSubtitle").textContent=`Illustrative full sample for ${payload.data.shared.companyName}. Fictional company data.`;
    document.getElementById("screen-overview").innerHTML=`<section class="org-panel"><span class="org-eyebrow">ILLUSTRATIVE SAMPLE · FICTIONAL COMPANY DATA</span><h2>${esc(model.executiveSummary)}</h2><div class="org-metric-grid"><div><strong>${esc(metrics.employees??108)}</strong><span>Employees</span></div><div><strong>${esc(metrics.peopleManagers??12)}</strong><span>People managers</span></div><div><strong>${esc(metrics.currentEmployeeToManagerRatio??"—")}</strong><span>Employees per manager</span></div><div><strong>${esc(metrics.expectedEmployees12Months??135)}</strong><span>12-month headcount</span></div></div></section>${change.baselineAvailable?`<section class="org-panel"><span class="org-eyebrow">CHANGE INTELLIGENCE</span><h2>What changed since the previous baseline</h2><div class="org-metric-grid"><div><strong>${change.factChanges.length}</strong><span>Company facts changed</span></div><div><strong>${change.summary.increased}</strong><span>Pressures increased</span></div><div><strong>${change.summary.improved}</strong><span>Areas improved</span></div><div><strong>${change.summary.newPriority}</strong><span>New structural priorities</span></div></div>${change.factChanges.slice(0,6).map((item)=>`<p><strong>${esc(item.label)}:</strong> ${esc(item.before)} → ${esc(item.after)}</p>`).join("")}</section>`:""}<section class="org-panel"><h2>Primary constraint</h2>${model.primaryConstraint?findingCard(model.primaryConstraint):"<p>No primary constraint identified.</p>"}</section><section class="org-panel"><h2>Top priorities</h2>${list(model.priorities).map((item,index)=>`<div class="org-action-box"><strong>${index+1}. ${esc(item.title)}</strong><p>${esc(item.action)}</p></div>`).join("")}</section>`;
    document.getElementById("screen-findings").innerHTML=`<section class="org-panel"><span class="org-eyebrow">DETAILED FINDINGS</span><h2>Evidence-backed structural findings</h2>${list(payload.analysis.findings).map(findingCard).join("")}</section>`;
    const scenario=payload.analysis.scenario||{};document.getElementById("screen-scenario").innerHTML=`<section class="org-panel"><span class="org-eyebrow">12-MONTH SCENARIO</span><h2>${esc(scenario.interpretation||"Scenario prepared from the supplied assumptions.")}</h2><p>${esc(scenario.disclaimer||"This is a deterministic planning scenario, not a forecast.")}</p><div class="org-action-box"><strong>Projected status: ${esc(statusLabel(scenario.projectedStatus))}</strong><p>Projected employees per manager: ${esc(scenario.projectedEmployeeToManagerRatio??"Not available")}</p></div>${sourceLinks(scenario)}</section>`;
}

function renderPersonalizedGlimpse(payload){
    const model=payload.reportModel||{};const metrics=model.metrics||{};const change=payload.changeIntelligence;
    document.getElementById("reportSubtitle").textContent=`Executive glimpse for ${payload.data?.shared?.companyName||"your organisation"}. The complete report is email-only after sign-in.`;
    document.querySelector(".org-stepper").hidden=true;document.getElementById("screen-findings").hidden=true;document.getElementById("screen-scenario").hidden=true;
    document.getElementById("screen-overview").innerHTML=`<section class="gwh-report-glimpse"><div class="gwh-report-glimpse__head"><div><span class="gwh-report-glimpse__label">YOUR REPORT GLIMPSE</span><h3>${esc(payload.data?.shared?.companyName||"Your organisation")} · Organization Structure & Growth</h3><p>${esc(model.executiveSummary||"Your structural analysis is complete.")}</p></div><span class="gwh-report-glimpse__lock">Full detail email-only</span></div><div class="gwh-report-glimpse__stats"><div class="gwh-report-stat"><strong>${esc(metrics.employees??"—")}</strong><span>Employees</span></div><div class="gwh-report-stat"><strong>${esc(metrics.peopleManagers??"—")}</strong><span>People managers</span></div><div class="gwh-report-stat"><strong>${esc(model.statusSummary?.action??0)}</strong><span>Action findings</span></div><div class="gwh-report-stat"><strong>${esc(change.factChanges.length)}</strong><span>Facts changed since baseline</span></div></div><ul class="gwh-report-glimpse__priorities">${list(model.priorities).slice(0,3).map((item,index)=>`<li><strong>${index+1}. ${esc(item.title)}</strong><br>${esc(item.action)}</li>`).join("")}</ul><p class="gwh-report-glimpse__footer">The complete emailed PDF includes all findings, facts used, missing information, GrowWithHR rules, public sources, Change Intelligence detail and the 12-month scenario.</p></section><div id="orgCustomerAuthMount"></div><div class="gwh-full-report-access"><button id="orgEmailFullReport" class="gwh-full-report-button" type="button" disabled>Email my complete report</button><p id="orgAuthDeliveryStatus">Sign in or create an account using the assessment work email to enable secure delivery.</p></div>`;
}

async function activityEvent(payload,eventName,filename=""){try{fetch(`${apiBase()}/api/organization-report/activity`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:eventName,companyName:payload.data?.shared?.companyName,email:payload.data?.shared?.email,reportId:payload.reportId,filename,framework:payload.reportModel?.framework?.name,frameworkVersion:payload.reportModel?.framework?.version,occurredAt:new Date().toISOString()})});}catch(_error){}}

async function downloadPdf(payload){const result=await generateOrganizationStructurePdf({...payload,changeIntelligence:payload.changeIntelligence},{mode:"download"});activityEvent(payload,"downloaded",result.filename);return result;}

async function emailPdf(payload){
    await import("./customer-auth.js");await Promise.resolve(window.GrowWithHRCustomerAuthReady).catch(()=>{});const auth=window.GrowWithHRCustomerAuth;const expectedEmail=clean(payload.data?.shared?.email).toLowerCase();const session=await auth.requireMatchingSession(expectedEmail);const pdf=await generateOrganizationStructurePdf({...payload,changeIntelligence:payload.changeIntelligence},{mode:"base64"});const methodologyUrl=new URL(payload.reportModel?.framework?.methodologyUrl||"organization-structure-methodology.html",location.href).href;const response=await auth.authorizedFetch(`${apiBase()}/api/organization-report/deliver`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lead:{name:clean(payload.data?.shared?.companyName,"Customer"),email:session.user.email,companyName:payload.data?.shared?.companyName},report:{companyName:payload.data?.shared?.companyName,recipientEmail:session.user.email,reportId:payload.reportId,frameworkName:payload.reportModel?.framework?.name,frameworkVersion:payload.reportModel?.framework?.version,methodologyUrl},pdf})},expectedEmail);let body={};try{body=await response.json();}catch(_error){}if(!response.ok||body.customerSent!==true)throw new Error(body.error||"The complete report email could not be sent.");activityEvent(payload,"emailed",pdf.filename);return body;
}

function bindSampleNavigation(payload){const steps=[...document.querySelectorAll("[data-step]")],screens=[...document.querySelectorAll("[data-screen]")];steps.forEach((button)=>button.addEventListener("click",()=>{steps.forEach((item)=>item.classList.toggle("is-active",item===button));screens.forEach((screen)=>{screen.hidden=screen.dataset.screen!==button.dataset.step;});}));document.getElementById("printReport").addEventListener("click",()=>window.print());document.getElementById("downloadReport").textContent="Download Sample PDF";document.getElementById("downloadReport").addEventListener("click",()=>downloadPdf(payload));document.getElementById("emailReport").hidden=true;}

async function bindPersonalizedAccess(payload){document.getElementById("printReport").hidden=true;document.getElementById("downloadReport").hidden=true;document.getElementById("emailReport").hidden=true;await import("./customer-auth.js");await Promise.resolve(window.GrowWithHRCustomerAuthReady).catch(()=>{});const button=document.getElementById("orgEmailFullReport"),status=document.getElementById("orgAuthDeliveryStatus"),expectedEmail=clean(payload.data?.shared?.email).toLowerCase();window.GrowWithHRCustomerAuth.mountGate(document.getElementById("orgCustomerAuthMount"),{expectedEmail,title:"Sign in or create an account for the complete PDF",onAuthenticated(session){button.disabled=false;status.textContent=`Signed in as ${session.user.email}. The complete report will be sent by email and will not be opened as a full website report.`;},onSignedOut(){button.disabled=true;status.textContent="Sign in or create an account using the assessment work email to enable secure delivery.";}});button.addEventListener("click",async()=>{button.disabled=true;button.textContent="Emailing complete report…";try{await emailPdf(payload);status.innerHTML=`<span class="gwh-delivery-success">Complete Organization Structure & Growth PDF sent to <strong>${esc(expectedEmail)}</strong>.</span>`;button.textContent="Email complete report again";}catch(error){status.textContent=error.message||"The report could not be emailed.";button.textContent="Email my complete report";}finally{button.disabled=false;}});}

const payload=currentPayload();
if(!payload){document.getElementById("screen-overview").innerHTML="<section class='org-panel'><h2>No report found</h2><p>Run the Organization Structure & Growth assessment first.</p><a class='org-primary' href='organization-intelligence.html'>Start assessment</a></section>";}else{
    payload.changeIntelligence=buildChangeIntelligence(payload);if(payload.reportModel)payload.reportModel.changeIntelligence=payload.changeIntelligence;
    if(payload.sample){renderSampleFull(payload);bindSampleNavigation(payload);}else{renderPersonalizedGlimpse(payload);bindPersonalizedAccess(payload);}
}

window.GrowWithHROrganizationReport=Object.freeze({version:"2.0.0-glimpse-auth",reportModel:(payload)=>payload?.reportModel||{},downloadPdf,emailPdf,buildChangeIntelligence});