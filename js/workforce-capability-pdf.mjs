const PAGE = Object.freeze({ width: 210, height: 297, left: 18, right: 18, top: 21, bottom: 18 });
const CONTENT = PAGE.width - PAGE.left - PAGE.right;
const COLOURS = Object.freeze({
  paper: [246, 242, 232], ink: [35, 31, 27], muted: [105, 96, 84], rule: [205, 196, 179],
  gold: [194, 125, 31], navy: [20, 31, 51], red: [156, 62, 44], green: [50, 108, 76], blue: [53, 89, 138], white: [255,255,255]
});
const LOGO = "assets/hrtechify-logo.png";
let logoPromise = null;

function clean(value, fallback = "") { return String(value ?? "").replace(/\s+/g, " ").trim() || fallback; }
function list(value) { return Array.isArray(value) ? value : []; }
function jsPDFConstructor() { return window.jspdf?.jsPDF || window.jsPDF || null; }
function formatDate(value) {
  const date = new Date(value || Date.now());
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(Number.isFinite(date.getTime()) ? date : new Date());
}
function companySlug(value) { return clean(value, "Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 52) || "Organisation"; }
function assetUrl(path) { try { return new URL(path, window.location.href).href; } catch (_error) { return path; } }
async function logoData() {
  if (logoPromise) return logoPromise;
  logoPromise = (async () => {
    try {
      const response = await fetch(assetUrl(LOGO), { cache: "force-cache" });
      if (!response.ok) return "";
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader(); reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : ""); reader.onerror = () => resolve(""); reader.readAsDataURL(blob);
      });
    } catch (_error) { return ""; }
  })();
  return logoPromise;
}

function createCanvas(doc, logo) {
  const state = { page: 0, y: PAGE.top };
  function background() { doc.setFillColor(...COLOURS.paper); doc.rect(0,0,PAGE.width,PAGE.height,"F"); }
  function chrome(title = "Workforce & Capability Planning") {
    background();
    doc.setDrawColor(...COLOURS.rule); doc.line(PAGE.left, 15, PAGE.width - PAGE.right, 15);
    if (logo) { try { doc.addImage(logo, "PNG", PAGE.left, 4, 20, 8, undefined, "FAST"); } catch (_error) {} }
    doc.setFont("helvetica","bold"); doc.setFontSize(7.2); doc.setTextColor(...COLOURS.muted); doc.text(clean(title).toUpperCase(), PAGE.width - PAGE.right, 9, { align: "right", maxWidth: 100 });
    doc.setDrawColor(...COLOURS.rule); doc.line(PAGE.left, PAGE.height - 12, PAGE.width - PAGE.right, PAGE.height - 12);
    doc.setFont("courier","normal"); doc.setFontSize(6.5); doc.setTextColor(...COLOURS.muted); doc.text("GrowWithHR by HRTechify", PAGE.left, PAGE.height - 7); doc.text(`Page ${state.page}`, PAGE.width - PAGE.right, PAGE.height - 7, { align: "right" });
  }
  function next(title) { if (state.page > 0) doc.addPage(); state.page += 1; state.y = PAGE.top; chrome(title); }
  function ensure(height, title) { if (state.y + height > PAGE.height - PAGE.bottom - 9) next(title); }
  function rule(after = 6) { ensure(4 + after, "Workforce & Capability Planning"); doc.setDrawColor(...COLOURS.rule); doc.line(PAGE.left, state.y, PAGE.width - PAGE.right, state.y); state.y += after; }
  function mono(text, options = {}) { const size=options.size||6.8; const width=options.width||CONTENT; doc.setFont("courier", options.bold?"bold":"normal"); doc.setFontSize(size); const lines=doc.splitTextToSize(clean(text), width); ensure(lines.length*3.4+(options.after??2), options.pageTitle); doc.setTextColor(...(options.colour||COLOURS.muted)); doc.text(lines, options.x||PAGE.left, state.y, { lineHeightFactor:1.12 }); state.y += lines.length*3.4+(options.after??2); }
  function text(textValue, options = {}) { const size=options.size||8.5; const width=options.width||CONTENT; doc.setFont("helvetica", options.bold?"bold":"normal"); doc.setFontSize(size); const lines=doc.splitTextToSize(clean(textValue), width); ensure(lines.length*4.2+(options.after??3), options.pageTitle); doc.setTextColor(...(options.colour||COLOURS.ink)); doc.text(lines, options.x||PAGE.left, state.y, { lineHeightFactor:1.18 }); state.y += lines.length*4.2+(options.after??3); }
  function serif(textValue, options = {}) { const size=options.size||15; const width=options.width||CONTENT; doc.setFont("times", options.bold?"bold":"normal"); doc.setFontSize(size); const lines=doc.splitTextToSize(clean(textValue), width); ensure(lines.length*(size*.42)+(options.after??4), options.pageTitle); doc.setTextColor(...(options.colour||COLOURS.ink)); doc.text(lines, options.x||PAGE.left, state.y, { lineHeightFactor:1.08 }); state.y += lines.length*(size*.42)+(options.after??4); }
  function heading(number, title, intro = "") { mono(number, { bold:true, colour:COLOURS.gold, after:2 }); serif(title, { size:17, bold:true, after: intro?2:6 }); if (intro) text(intro, { colour:COLOURS.muted, after:7 }); }
  function label(textValue, options={}) { mono(clean(textValue).toUpperCase(), { bold:true, size:6.6, colour:options.colour||COLOURS.muted, after:1.5 }); }
  function bullet(value, options={}) { const size=options.size||8.2; const width=CONTENT-8; doc.setFont("helvetica","normal"); doc.setFontSize(size); const lines=doc.splitTextToSize(clean(value),width); ensure(lines.length*4+2, options.pageTitle); doc.setFillColor(...(options.dotColour||COLOURS.gold)); doc.circle(PAGE.left+1.5,state.y-1.4,0.8,"F"); doc.setTextColor(...(options.colour||COLOURS.ink)); doc.text(lines,PAGE.left+6,state.y,{lineHeightFactor:1.16}); state.y+=lines.length*4+2; }
  function card(title, body, options={}) { const inner=CONTENT-14; doc.setFontSize(8.1); const lines=doc.splitTextToSize(clean(body),inner); const h=15+lines.length*4.1+5; ensure(h+4, options.pageTitle); doc.setFillColor(...(options.fill||[238,233,222])); doc.setDrawColor(...COLOURS.rule); doc.roundedRect(PAGE.left,state.y-4,CONTENT,h,3,3,"FD"); doc.setFont("helvetica","bold"); doc.setFontSize(9.2); doc.setTextColor(...(options.titleColour||COLOURS.ink)); doc.text(clean(title),PAGE.left+7,state.y+3,{maxWidth:inner}); doc.setFont("helvetica","normal"); doc.setFontSize(8.1); doc.setTextColor(...COLOURS.ink); doc.text(lines,PAGE.left+7,state.y+10,{lineHeightFactor:1.15,maxWidth:inner}); state.y+=h+4; }
  function link(labelText,url) { const target=clean(url); if (!target) return; ensure(7,"Sources & Methodology"); doc.setFont("helvetica","bold"); doc.setFontSize(7.6); doc.setTextColor(...COLOURS.blue); doc.text(clean(labelText),PAGE.left,state.y); if (/^https?:\/\//.test(target)) { try { doc.link(PAGE.left,state.y-4,CONTENT,6,{url:target}); } catch(_error){} } state.y+=6; }
  return { state, next, ensure, rule, mono, text, serif, heading, label, bullet, card, link, background };
}

function statusColour(status) {
  if (["confirmed-gap","capacity-gap","likely-gap"].includes(status)) return COLOURS.red;
  if (status === "adequate") return COLOURS.green;
  if (status === "information-needed") return COLOURS.blue;
  return COLOURS.gold;
}

function renderCover(doc, canvas, payload) {
  canvas.state.page = 1;
  doc.setFillColor(...COLOURS.paper); doc.rect(0,0,PAGE.width,PAGE.height,"F");
  doc.setFillColor(...COLOURS.navy); doc.rect(0,0,PAGE.width,17,"F");
  doc.setFillColor(...COLOURS.gold); doc.rect(0,17,PAGE.width,1.2,"F");
  const plan=payload.plan; const data=payload.data;
  canvas.state.y=38;
  canvas.mono("GROWWITHHR · WORKFORCE & CAPABILITY PLANNING",{bold:true,colour:COLOURS.gold,after:6});
  canvas.serif("Build the capability. Shape the workforce.",{size:27,bold:true,width:160,after:7});
  canvas.text(plan.overallPosition?.headline || "Workforce and capability plan",{size:10.5,width:155,colour:COLOURS.muted,after:12});
  canvas.card("Planning approach", `${clean(plan.selectedApproachLabel,"Hybrid plan")} · Rule set ${clean(plan.rulesetVersion,"WCP-2026.1")} · AI decision authority: No`, { fill:[239,232,216] });
  canvas.state.y += 4;
  const identity=[
    ["Company",data.company?.name],["Report ID",payload.reportId],["Generated",formatDate(payload.generatedAt||plan.generatedAt)],
    ["Planning horizon",data.company?.horizonMonths?`${data.company.horizonMonths} months`:"Not supplied"],["Engine","Workforce & Capability Planning v1.0.0"]
  ];
  identity.forEach(([label,value])=>{canvas.label(label);canvas.text(clean(value,"Not supplied"),{size:8.6,after:4});});
  canvas.state.y=Math.max(canvas.state.y,238);
  canvas.rule(6);
  canvas.text("Research-grade workforce and capability planning output. Scenario values and implementation timing are planning assumptions, not forecasts. Cost estimates are only produced from company-supplied cost inputs in this ruleset.",{size:7.4,colour:COLOURS.muted,after:2});
}

function renderExecutive(canvas,payload) {
  const plan=payload.plan; const data=payload.data; const findings=list(plan.findings);
  canvas.next("Executive Summary"); canvas.heading("01","Executive summary","The executive answer first: strategy, major gaps and the implementation direction selected by the user.");
  canvas.serif(plan.overallPosition?.headline||"Planning position",{size:18,bold:true,after:7});
  canvas.label("Business objective"); canvas.text(data.strategy?.objective||"Not supplied",{after:6});
  const critical=findings.filter(item=>["confirmed-gap","capacity-gap","likely-gap","capacity-pressure","fragile-coverage"].includes(item.status));
  canvas.label("Highest-priority findings");
  (critical.length?critical.slice(0,5):findings.slice(0,3)).forEach(item=>canvas.bullet(`${item.capability}: ${item.label} — ${item.reason}`,{dotColour:statusColour(item.status)}));
  canvas.rule(7); canvas.label("Robust action families"); canvas.text(list(plan.robustActions).join(" · ")||"No intervention family selected yet",{bold:true,after:5});
  canvas.card("Decision boundary", plan.implementationBoundary || "GrowWithHR does not invent role quantities, salaries or universal workforce benchmarks.");
}

function renderBaseline(canvas,payload) {
  const plan=payload.plan; const data=payload.data;
  canvas.next("Current Workforce Baseline"); canvas.heading("02","Current workforce baseline","The company information used to anchor workforce supply, capability coverage and plan completeness.");
  [["Current employees",data.company?.currentEmployees],["Expected employees",data.company?.expectedEmployees],["Locations",data.company?.locations],["Industry",data.company?.industry]].forEach(([label,value])=>{canvas.label(label);canvas.text(clean(value,"Not supplied"),{after:4});});
  canvas.rule(6); canvas.serif("Seven Rights coverage",{size:13,bold:true,after:4});
  list(plan.sevenRights).forEach(item=>canvas.bullet(`${item.right}: ${item.status === "covered" ? "Covered" : "Information needed"} — ${item.reason}`,{dotColour:item.status==="covered"?COLOURS.green:COLOURS.blue}));
}

function renderCapabilityDemand(canvas,payload) {
  const plan=payload.plan; const data=payload.data;
  canvas.next("Future Capability Demand"); canvas.heading("03","Future capability demand","Strategy is translated into business capabilities before workforce actions are considered.");
  canvas.label("Strategy"); canvas.text(data.strategy?.objective||"Not supplied",{after:6});
  list(plan.capabilities).forEach((capability,index)=>{
    if(index>0)canvas.rule(5); canvas.label(`${capability.importance} capability`,{colour:capability.importance==="critical"?COLOURS.red:COLOURS.gold}); canvas.serif(capability.name,{size:13,bold:true,after:2});
    canvas.text(`Current coverage: ${capability.currentCoverage} · Capacity: ${capability.capacityStatus} · Concentration: ${capability.concentrationRisk}`,{size:8,colour:COLOURS.muted,after:3});
    if(capability.rolesAffected)canvas.text(`Roles / workforce segments: ${capability.rolesAffected}`,{size:8.1,after:3});
  });
}

function renderFrameworks(canvas,payload) {
  const plan=payload.plan;
  canvas.next("Framework Comparison"); canvas.heading("04","Framework comparison","The same problem is shown through the selected planning lenses before the final implementation approach is chosen.");
  list(plan.frameworkComparisons).forEach((item,index)=>{
    if(index>0)canvas.rule(6); canvas.label(item.framework?.lens||"Framework"); canvas.serif(item.framework?.name||item.id,{size:13,bold:true,after:2}); canvas.text(item.headline,{bold:true,after:2}); canvas.text(item.interpretation,{colour:COLOURS.muted,after:3}); canvas.text(`Decision emphasis: ${item.decisionEmphasis}`,{size:7.8,after:3}); if(item.framework?.sourceUrl?.startsWith("http"))canvas.link("Framework source ↗",item.framework.sourceUrl);
  });
  canvas.card("Selected implementation lens", `${plan.selectedApproachLabel}. The comparison is retained in the report so the choice remains auditable.`);
}

function renderGaps(canvas,payload) {
  const findings=list(payload.plan.findings);
  canvas.next("Gap Analysis"); canvas.heading("05","Gap analysis","No hidden score: each finding retains its facts, rule ID, confidence, missing information and what could change the conclusion.");
  findings.forEach((item,index)=>{
    if(index>0)canvas.rule(5); canvas.label(`${item.label} · ${item.confidence} confidence`,{colour:statusColour(item.status)}); canvas.serif(item.capability,{size:13,bold:true,after:2}); canvas.text(item.reason,{after:3});
    canvas.label("Facts used"); list(item.factsUsed).forEach(fact=>canvas.bullet(fact));
    canvas.mono(`Rule: ${list(item.ruleIds).join(" · ")}`,{bold:true,colour:COLOURS.gold,after:3});
    if(list(item.missingFacts).length){canvas.label("Information that would increase confidence");list(item.missingFacts).forEach(fact=>canvas.bullet(fact,{dotColour:COLOURS.blue}));}
    canvas.label("What would change this result");canvas.text(item.whatWouldChangeThis,{size:8,colour:COLOURS.muted,after:3});
  });
}

function renderOptions(canvas,payload) {
  canvas.next("Implementation Options"); canvas.heading("06","Build · Buy · Borrow · Bind · Bot · Move","Implementation routes are shown with visible rationale, indicative timing and only company-supplied cost values where available.");
  list(payload.plan.findings).forEach((finding,index)=>{
    if(index>0)canvas.rule(5); canvas.serif(finding.capability,{size:12.5,bold:true,after:3});
    list(finding.interventions).forEach(option=>{canvas.label(`${option.label} · ${option.time}`);canvas.text(option.why,{size:8.1,after:1});canvas.text(`Cost: ${option.cost?.display||"Not estimated"} · Basis: ${option.cost?.basis||"No cost basis supplied"}`,{size:7.5,colour:COLOURS.muted,after:3});});
  });
}

function renderEconomics(canvas,payload) {
  const e=payload.plan.economics||{};
  canvas.next("Implementation Economics"); canvas.heading("07","Implementation economics","Time, money and dependencies are part of the workforce decision rather than an afterthought.");
  [["Currency",e.currency],["Budget cap",e.budgetCap],["Annual cost per external hire",e.annualCostPerHire],["Training / development cost per person",e.trainingCostPerPerson],["Contractor / partner monthly cost",e.contractorMonthlyCost],["Automation planning envelope",e.automationInvestment]].forEach(([label,value])=>{canvas.label(label);canvas.text(value===null||value===undefined?"Not estimated / not supplied":`${e.currency||""} ${Number(value).toLocaleString("en-IN")}`,{after:4});});
  canvas.card("Cost-quality rule","Current rules only calculate cost from company-supplied fields. Missing cost inputs remain Not estimated. GrowWithHR does not silently insert salary, productivity or hiring-cost benchmarks.");
  canvas.card("Timing rule","Build / Buy / Borrow / Bind / Bot / Move timing windows are indicative planning assumptions. Validate against the company’s actual hiring, learning, procurement and technology lead times before commitment.");
}

function renderScenarios(canvas,payload) {
  const s=payload.plan.scenarios||{};
  canvas.next("Scenario Comparison"); canvas.heading("08","Scenario comparison","Multiple scenarios prevent one workforce forecast from being presented as certain.");
  [["Current employees",s.currentEmployees],["Base workforce demand",s.baseDemand],["Higher-growth workforce demand",s.higherGrowthDemand],["Work-redesign capacity equivalent",s.redesignedWorkEquivalent]].forEach(([label,value])=>{canvas.label(label);canvas.text(value===null||value===undefined?"Not available":Number(value).toLocaleString("en-IN"),{size:11,bold:true,after:5});});
  canvas.text(s.disclaimer||"Scenario values are planning assumptions, not forecasts.",{size:8,colour:COLOURS.muted,after:5});
  canvas.card("Interpretation","Use differences across scenarios to separate robust actions from actions that are justified only under one growth or work-redesign assumption.");
}

function renderRoadmap(canvas,payload) {
  canvas.next("12–36 Month Roadmap"); canvas.heading("09","12–36 month roadmap","The selected approach is translated into an implementation sequence rather than ending at diagnosis.");
  list(payload.plan.roadmap).forEach((period,index)=>{if(index>0)canvas.rule(6);canvas.serif(period.horizon,{size:13,bold:true,after:3});(list(period.actions).length?period.actions:["No action generated for this period."]).forEach(action=>canvas.bullet(action));});
}

function renderWhy(canvas,payload) {
  const plan=payload.plan;
  canvas.next("Why GrowWithHR Reached This Result"); canvas.heading("10","Why GrowWithHR reached these conclusions","The user can inspect what was supplied, what was derived, which rule fired and where uncertainty remains.");
  canvas.card("Decision authority",`AI decision authority: No. ${clean(plan.methodology?.applicabilityAuthority,"Deterministic GrowWithHR rules using user-confirmed company facts.")}`);
  canvas.label("Rule set");canvas.mono(plan.rulesetVersion||"WCP-2026.1",{bold:true,colour:COLOURS.gold,after:4});
  canvas.label("Audit trail");list(plan.auditTrail).forEach(item=>canvas.bullet(`${item.ruleId} → ${item.capability}`));
  canvas.rule(6);canvas.label("Planning assumptions");canvas.bullet("Scenario values are assumptions, not forecasts.");canvas.bullet("Implementation timing is indicative until validated against company lead times.");canvas.bullet("Costs are only shown where the company supplied a cost input.");
}

function renderSources(canvas,payload) {
  const methodology=payload.plan.methodology||{};
  canvas.next("Sources & Methodology"); canvas.heading("11","Sources & methodology","External frameworks provide structure and reference vocabulary. GrowWithHR’s visible rules interpret the user-confirmed company facts.");
  list(methodology.frameworks).forEach(item=>{canvas.serif(item.name,{size:12.5,bold:true,after:2});canvas.text(item.purpose,{size:8.1,colour:COLOURS.muted,after:2});if(item.sourceUrl?.startsWith("http"))canvas.link("Source ↗",item.sourceUrl);canvas.rule(4);});
  list(methodology.referenceTaxonomies).forEach(item=>{canvas.serif(`${item.name} · ${item.referenceVersion||"reference"}`,{size:11.5,bold:true,after:2});canvas.text(item.purpose,{size:8,colour:COLOURS.muted,after:2});if(item.sourceUrl?.startsWith("http"))canvas.link("Reference ↗",item.sourceUrl);canvas.rule(4);});
  canvas.card("Methodology boundary",methodology.note||"External frameworks and taxonomies do not silently create company facts or decide a capability gap.");
  canvas.mono(`Engine: ${clean(payload.plan.engineVersion,"1.0.0")} · Rule set: ${clean(payload.plan.rulesetVersion,"WCP-2026.1")} · Report ID: ${clean(payload.reportId,"Local analysis")}`,{bold:true,colour:COLOURS.gold,after:3});
}

function serialise(doc,payload) {
  const dataUri=doc.output("datauristring"); const buffer=doc.output("arraybuffer");
  return { document:doc, filename:`GrowWithHR-Workforce-Capability-Plan-${companySlug(payload.data?.company?.name)}-${clean(payload.reportId,"REPORT")}.pdf`, dataUri, base64:dataUri.includes(",")?dataUri.split(",")[1]:dataUri, sizeBytes:Number(buffer?.byteLength||0), pageCount:Number(doc.getNumberOfPages?.()||0), reportId:clean(payload.reportId), engineVersion:clean(payload.plan?.engineVersion,"1.0.0"), rulesetVersion:clean(payload.plan?.rulesetVersion,"WCP-2026.1"), reportStyleId:"editorial-research-v1", singleEdition:true, informationPreservation:"full-workforce-capability-plan" };
}

export async function generateWorkforceCapabilityPdf(payload={}, options={}) {
  const JsPDF=jsPDFConstructor(); if(!JsPDF)throw new Error("PDF generation is unavailable in this browser.");
  const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true,putOnlyUsedFonts:true});
  const logo=await logoData(); const canvas=createCanvas(doc,logo);
  renderCover(doc,canvas,payload); renderExecutive(canvas,payload); renderBaseline(canvas,payload); renderCapabilityDemand(canvas,payload); renderFrameworks(canvas,payload); renderGaps(canvas,payload); renderOptions(canvas,payload); renderEconomics(canvas,payload); renderScenarios(canvas,payload); renderRoadmap(canvas,payload); renderWhy(canvas,payload); renderSources(canvas,payload);
  const result=serialise(doc,payload);
  if(options.mode==="download") doc.save(result.filename);
  return result;
}
