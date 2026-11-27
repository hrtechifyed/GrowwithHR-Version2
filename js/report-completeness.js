/* Assessment completeness is not legal compliance, a score, or an assurance. */
(function(root){
"use strict";
const unknown=value=>value==null||(typeof value==="string"&&(!value.trim()||/^(unknown|dont-know|not-sure|not provided|i don.t know|unsure|not-known)$/i.test(value.trim())))||(Array.isArray(value)&&!value.length);
const unique=items=>[...new Set(items.filter(Boolean).map(String))];
const result=items=>({missing:unique(items),incomplete:unique(items).length>0});
function organization(data={}){
  const o=data.organization||{},s=data.shared||{},w=data.workforce||{};
  const pairs=[["Growth stage",s.growthStage],["Expected employees in 12 months",w.expectedEmployees12Months],["People managers",o.peopleManagerCount],["Reporting layers",o.reportingLevels],["Founder/CEO direct reports",o.founderDirectReports],["Functions or departments",o.departments],["Manager role",o.managerRole],["Work complexity",o.workComplexity],["Work standardization",o.workStandardization],["Team independence",o.teamIndependence],["Coaching intensity",o.coachingIntensity],["Role clarity",o.roleClarity],["Decision rights",o.decisionRights],["Operating review cadence",o.governanceCadence],["Coordination friction",o.coordinationFriction],["Founder approval decisions",o.founderDecisions],["Planned expansion",o.expansion]];
  const missing=pairs.filter(([,v])=>unknown(v)).map(([label])=>label);
  if(Array.isArray(o.departments)&&o.departments.length)for(const name of o.departments){const owner=(o.functionOwnership||[]).find(x=>x.name===name);if(!owner||unknown(owner.ownership))missing.push("Ownership: "+name);}
  return result(missing);
}
function compliance(payload){
  const api=root.GrowWithHRCompanyApplicability;
  if(typeof api?.assess!=="function")return result(["Applicability information could not be checked"]);
  try{
    const model=root.GrowWithHRPDF?.buildAdvisoryModel?.(payload)||{};
    const assessment=api.assess(payload,model);
    return result([...(assessment.missingFacts||[]).map(x=>x.question||x.field||x),...(assessment.findings||[]).filter(x=>(x.backendStatus||x.status)==="Needs information").map(x=>x.shortTitle||x.title||x.id)]);
  }catch(_){return result(["Applicability information could not be checked"]);}
}
function workforce(data={},analysis={}){
  const missing=[];
  for(const [group,keys] of Object.entries({company:["expectedEmployees","horizonMonths","locations"],strategy:["targetOutcome","businessImpact"],scenarios:["baseGrowthPct","highGrowthPct","workRedesignPct"],economics:["budgetCap","annualCostPerHire","trainingCostPerPerson","contractorMonthlyCost","automationInvestment"]}))for(const key of keys)if(unknown(data[group]?.[key]))missing.push(group+" / "+key.replace(/([a-z])([A-Z])/g,"$1 $2"));
  for(const finding of analysis.findings||[])for(const field of finding.missingFacts||[])missing.push((finding.capability||"Capability")+": "+field);
  return result(missing);
}
function message(status){return status?.incomplete?"Incomplete-input report: some information was not supplied or confirmed. Findings are limited to available facts; affected recommendations may be unavailable or provisional. Add the missing information and regenerate before relying on the report.":"";}
function confirmIncomplete(status){
  if(!status?.incomplete)return Promise.resolve(true);
  return new Promise(resolve=>{
    const dialog=document.createElement("dialog");dialog.className="gwh-completeness-dialog";dialog.setAttribute("aria-labelledby","gwhCompletenessTitle");
    const title=document.createElement("h2");title.id="gwhCompletenessTitle";title.textContent="Your report will be incomplete";
    const intro=document.createElement("p");intro.textContent=message(status);
    const list=document.createElement("ul");for(const item of status.missing){const li=document.createElement("li");li.textContent=item;list.append(li);}
    const actions=document.createElement("div");actions.className="gwh-completeness-actions";
    const back=document.createElement("button");back.type="button";back.textContent="Return to assessment";
    const proceed=document.createElement("button");proceed.type="button";proceed.textContent="Generate incomplete report";
    actions.append(back,proceed);dialog.append(title,intro,list,actions);document.body.append(dialog);
    let approved=false;dialog.addEventListener("close",()=>{dialog.remove();resolve(approved);},{once:true});
    back.addEventListener("click",()=>dialog.close());proceed.addEventListener("click",()=>{approved=true;dialog.close();});
    dialog.showModal();back.focus();
  });
}
root.GrowWithHRCompleteness=Object.freeze({organization,compliance,workforce,message,confirmIncomplete,unknown});
})(globalThis);
