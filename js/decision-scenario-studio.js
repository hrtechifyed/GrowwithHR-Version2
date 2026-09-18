(function scenarioStudioBootstrap(window, document) {
  "use strict";

  const PRESETS = Object.freeze({
    conservative: Object.freeze({ employeeGrowth: 0.15, managerGrowth: 0.10, layerDelta: 0, locationDelta: 0, capabilityDelta: -5 }),
    growth: Object.freeze({ employeeGrowth: 0.40, managerGrowth: 0.25, layerDelta: 1, locationDelta: 1, capabilityDelta: -10 })
  });

  const FIELDS = Object.freeze(["employees","managers","layers","locations","capabilityCoverage"]);
  const SCENARIOS = Object.freeze(["current","conservative","growth"]);

  function number(value) {
    if (value === "" || value == null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function round(value, digits = 1) {
    const scale = 10 ** digits;
    return Math.round(value * scale) / scale;
  }
  function pct(value) { return `${round(value,1)}%`; }
  function money(value, currency) {
    if (value == null) return "Not estimated";
    try { return new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:0}).format(value); }
    catch (_) { return `${currency} ${Math.round(value).toLocaleString()}`; }
  }
  function cleanWorkspace() {
    try { return JSON.parse(sessionStorage.getItem("growwithhr.workspace") || "null"); }
    catch (_) { return null; }
  }
  function byPath(obj, paths) {
    for (const path of paths) {
      const value = path.split(".").reduce((acc,key)=>acc && acc[key] != null ? acc[key] : null,obj);
      if (value != null && value !== "") return value;
    }
    return null;
  }
  function currentFromWorkspace(workspace) {
    const data = workspace?.companyData || {};
    return {
      employees: number(byPath(data,["workforce.totalEmployees","shared.employees","company.currentEmployees"])),
      managers: number(byPath(data,["organization.peopleManagerCount","organization.managerCount"])),
      layers: number(byPath(data,["organization.reportingLevels"])),
      locations: number(byPath(data,["geography.operatingLocationCount","organization.locations"])),
      capabilityCoverage: null
    };
  }
  function presetFromCurrent(current, preset) {
    return {
      employees: Math.max(1, Math.round(current.employees * (1 + preset.employeeGrowth))),
      managers: Math.max(0, Math.round(current.managers * (1 + preset.managerGrowth))),
      layers: Math.max(0, Math.round(current.layers + preset.layerDelta)),
      locations: Math.max(1, Math.round(current.locations + preset.locationDelta)),
      capabilityCoverage: clamp(Math.round(current.capabilityCoverage + preset.capabilityDelta), 0, 100)
    };
  }
  function readScenarioFromValues(values, name) {
    const source = values[name] || {};
    return FIELDS.reduce((result, field) => {
      result[field] = number(source[field]);
      return result;
    }, {});
  }
  function validateScenario(scenario, name) {
    const missing = FIELDS.filter((field)=>scenario[field] == null);
    if (missing.length) return `${name} is missing: ${missing.join(", ")}.`;
    if (!["employees","managers","layers","locations"].every((field)=>Number.isInteger(scenario[field]))) return `${name} must use whole numbers for employees, people managers, reporting layers and operating locations.`;\n    if (scenario.employees < 1 || scenario.managers < 0 || scenario.layers < 0 || scenario.locations < 1) return `${name} must use at least 1 employee and location; people managers and reporting layers may be 0.`;
    if (scenario.capabilityCoverage < 0 || scenario.capabilityCoverage > 100) return `${name} capability coverage must be between 0 and 100.`;
    if (scenario.managers > scenario.employees) return `${name} cannot have more people managers than employees.`;
    return "";
  }

  function analyzeScenario(current, scenario, costPerEmployee, currency) {
    const employeeGrowth = ((scenario.employees - current.employees) / current.employees) * 100;
    const managerGrowth = current.managers === 0 ? (scenario.managers === 0 ? 0 : null) : ((scenario.managers - current.managers) / current.managers) * 100;
    const currentRatio = current.managers === 0 ? null : current.employees / current.managers;
    const scenarioRatio = scenario.managers === 0 ? null : scenario.employees / scenario.managers;
    const ratioChange = currentRatio == null || scenarioRatio == null ? null : ((scenarioRatio - currentRatio) / currentRatio) * 100;
    const capabilityDelta = scenario.capabilityCoverage - current.capabilityCoverage;

    let structure = "Structure variables remain broadly aligned with Current";
    const structureReasons = [];
    if (current.managers === 0 && scenario.managers === 0 && scenario.employees !== current.employees) {
      structure = "Workforce size changes without adding people-manager roles";
      structureReasons.push(`employees change by ${pct(employeeGrowth)} while people-manager count remains 0`);
    } else if (current.managers === 0 && scenario.managers > 0) {
      structure = "People-manager roles are introduced";
      structureReasons.push(`people-manager count changes from 0 to ${scenario.managers}`);
    } else if (managerGrowth != null && employeeGrowth > managerGrowth) {
      structure = "Manager capacity grows more slowly than workforce size";
      structureReasons.push(`employees change by ${pct(employeeGrowth)} while people managers change by ${pct(managerGrowth)}`);
    }
    if (scenario.layers > current.layers) {
      if (structure === "Structure variables remain broadly aligned with Current") structure = "Reporting hierarchy expands";
      structureReasons.push(`reporting layers increase from ${current.layers} to ${scenario.layers}`);
    } else if (scenario.layers < current.layers) {
      structureReasons.push(`reporting layers reduce from ${current.layers} to ${scenario.layers}`);
    }
    if (scenario.locations > current.locations) {
      if (structure === "Structure variables remain broadly aligned with Current") structure = "Operating footprint becomes more distributed";
      structureReasons.push(`operating locations increase from ${current.locations} to ${scenario.locations}`);
    } else if (scenario.locations < current.locations) {
      structureReasons.push(`operating locations reduce from ${current.locations} to ${scenario.locations}`);
    }
    if (ratioChange != null && ratioChange !== 0) structureReasons.push(`employees-per-manager changes by ${pct(ratioChange)} versus Current`);
    if (!structureReasons.length) structureReasons.push("manager count, reporting layers and operating locations match Current");

    let workforce = "Critical capability coverage is maintained at the Current estimate";
    if (capabilityDelta < 0) workforce = `Critical capability coverage declines by ${Math.abs(round(capabilityDelta,1))} percentage points versus Current`;
    else if (capabilityDelta > 0) workforce = `Critical capability coverage improves by ${round(capabilityDelta,1)} percentage points versus Current`;

    const compliance = [];
    if (scenario.locations !== current.locations) compliance.push("Operating-location change: refresh location-dependent HR Compliance Readiness.");
    if (scenario.employees !== current.employees) compliance.push("Headcount change: refresh any headcount-dependent HR Compliance Readiness checks.");
    if (!compliance.length) compliance.push("These five scenario variables do not introduce a new reassessment trigger; existing obligations still require normal review.");

    const peopleCost = costPerEmployee == null ? null : scenario.employees * costPerEmployee;
    const currentCost = costPerEmployee == null ? null : current.employees * costPerEmployee;
    const costDelta = peopleCost == null ? null : peopleCost - currentCost;

    const actions = [];
    if (current.managers === 0 && scenario.managers === 0 && scenario.employees !== current.employees) actions.push("Decide how leadership and people-management accountability will scale if headcount changes without people-manager roles.");
    else if (managerGrowth != null && employeeGrowth > managerGrowth) actions.push("Test management capacity because workforce size grows faster than the people-manager population.");
    if (scenario.layers !== current.layers) actions.push("Define the decision-rights and coordination rationale for the changed reporting-layer design.");
    if (scenario.locations !== current.locations) actions.push("Design cross-location governance and refresh location-dependent compliance readiness.");
    if (capabilityDelta < 0) actions.push("Choose a Build · Buy · Borrow · Bind · Bot · Move response for the projected capability-coverage decline.");
    if (!actions.length) actions.push("Validate the assumptions with business and HR owners before converting the scenario into a plan.");

    return {
      employeeGrowth, managerGrowth, currentRatio, scenarioRatio, ratioChange, capabilityDelta,
      structure, structureReasons, workforce, compliance,
      peopleCost, currentCost, costDelta, currency, actions
    };
  }

  function compare(values, costPerEmployee, currency) {
    const current = readScenarioFromValues(values,"current");
    const conservative = readScenarioFromValues(values,"conservative");
    const growth = readScenarioFromValues(values,"growth");
    for (const [label,scenario] of [["Current",current],["Conservative",conservative],["Growth",growth]]) {
      const error = validateScenario(scenario,label);
      if (error) return { error };
    }
    return {
      current: analyzeScenario(current,current,costPerEmployee,currency),
      conservative: analyzeScenario(current,conservative,costPerEmployee,currency),
      growth: analyzeScenario(current,growth,costPerEmployee,currency),
      facts: { current, conservative, growth }
    };
  }

  window.GrowWithHRScenarioStudio = Object.freeze({ PRESETS, presetFromCurrent, compare, analyzeScenario, validateScenario });
  if (typeof module !== "undefined" && module.exports) module.exports = window.GrowWithHRScenarioStudio;

  if (!document) return;
  const inputFor = (scenario,field)=>document.querySelector(`[data-scenario="${scenario}"][data-field="${field}"]`);
  const error = document.getElementById("scenarioError");
  const results = document.getElementById("scenarioResults");
  const summaryGrid = document.getElementById("scenarioSummaryGrid");
  const comparisonTable = document.getElementById("scenarioComparisonTable");
  const questions = document.getElementById("scenarioLeadershipQuestions");
  const notice = document.getElementById("scenarioReuseNotice");

  function setScenario(name, values) {
    FIELDS.forEach((field)=>{ const el=inputFor(name,field); if(el && values[field] != null) el.value=values[field]; });
  }
  function readScenario(name) {
    return FIELDS.reduce((obj,field)=>{ obj[field]=number(inputFor(name,field)?.value); return obj; },{});
  }
  function values() {
    return SCENARIOS.reduce((obj,name)=>{obj[name]=readScenario(name);return obj;},{});
  }
  function generatePresets() {
    const current=readScenario("current");
    const validation=validateScenario(current,"Current");
    if(validation){showError("Complete the five Current values before generating scenarios.");return false;}
    setScenario("conservative",presetFromCurrent(current,PRESETS.conservative));
    setScenario("growth",presetFromCurrent(current,PRESETS.growth));
    hideError(); return true;
  }
  function showError(message){error.textContent=message;error.hidden=false;}
  function hideError(){error.hidden=true;error.textContent="";}
  function managerRatioText(analysis) { return analysis.scenarioRatio == null ? "No people managers" : `${round(analysis.scenarioRatio,1)} employees per manager`; }
  function resultCard(label, facts, analysis) {
    const growthText=label==="Current"?"Baseline":`${pct(analysis.employeeGrowth)} employees vs Current`;
    return `<article class="scenario-summary-card"><div class="section-tag">${label.toUpperCase()}</div><h3>${growthText}</h3><dl>
      <div><dt>Structure</dt><dd class="scenario-state">${analysis.structure}</dd><dd>${analysis.structureReasons.join("; ")}.</dd></div>
      <div><dt>Workforce</dt><dd class="scenario-state">${analysis.workforce}</dd><dd>Critical capability coverage: ${facts.capabilityCoverage}%.</dd></div>
      <div><dt>Compliance review</dt><dd>${analysis.compliance.join(" ")}</dd></div>
      <div><dt>People cost</dt><dd class="scenario-state">${money(analysis.peopleCost,analysis.currency)}</dd><dd>${analysis.costDelta == null ? "No company cost assumption supplied." : `${analysis.costDelta >= 0 ? "+" : ""}${money(analysis.costDelta,analysis.currency)} vs Current`}</dd></div>
    </dl></article>`;
  }
  function render(outcome) {
    const names=[["Current","current"],["Conservative","conservative"],["Growth","growth"]];
    summaryGrid.innerHTML=names.map(([label,key])=>resultCard(label,outcome.facts[key],outcome[key])).join("");
    comparisonTable.innerHTML=`<div class="scenario-table-wrap"><table class="scenario-comparison"><thead><tr><th>Decision signal</th><th>Current</th><th>Conservative</th><th>Growth</th></tr></thead><tbody>
      <tr><td>Employees / managers</td>${names.map(([,key])=>`<td>${outcome.facts[key].employees} / ${outcome.facts[key].managers}<br><small>${managerRatioText(outcome[key])}</small></td>`).join("")}</tr>
      <tr><td>Layers / locations</td>${names.map(([,key])=>`<td>${outcome.facts[key].layers} layers · ${outcome.facts[key].locations} locations</td>`).join("")}</tr>
      <tr><td>Capability coverage</td>${names.map(([,key])=>`<td>${outcome.facts[key].capabilityCoverage}%<br><small>${outcome[key].workforce}</small></td>`).join("")}</tr>
      <tr><td>Leadership actions</td>${names.map(([,key])=>`<td>${outcome[key].actions.map((a)=>`• ${a}`).join("<br>")}</td>`).join("")}</tr>
    </tbody></table></div>`;
    const growth=outcome.growth, conservative=outcome.conservative;
    questions.innerHTML=[
      ["Management capacity", growth.managerGrowth == null ? "What people-management model is required as manager roles are introduced or redesigned?" : growth.managerGrowth < growth.employeeGrowth ? "What management capacity, role redesign or governance change is required if employee growth continues to outpace manager growth?" : "What would have to change for current management capacity to stop being sufficient?"],
      ["Critical capability", growth.capabilityDelta < 0 ? "Which capability gap is most likely to block the Growth scenario, and which Build · Buy · Borrow · Bind · Bot · Move response is feasible?" : "Which capability becomes strategically critical first as the Growth scenario scales?"],
      ["Operating footprint", outcome.facts.growth.locations > outcome.facts.current.locations ? "Which decisions, HR processes and compliance checks become location-dependent when the operating footprint expands?" : "What location or work-model change would materially alter this scenario?"],
      ["Scenario choice", `Which assumptions explain the difference between Conservative (${pct(conservative.employeeGrowth)}) and Growth (${pct(growth.employeeGrowth)}) headcount, and who owns validating them?`]
    ].map(([title,text])=>`<div class="scenario-question"><strong>${title}</strong>${text}</div>`).join("");
    results.hidden=false;
    results.scrollIntoView({behavior:"smooth",block:"start"});
  }

  document.getElementById("loadExample")?.addEventListener("click",()=>{
    const current={employees:120,managers:12,layers:3,locations:1,capabilityCoverage:85};
    setScenario("current",current);generatePresets();
    document.getElementById("annualPeopleCost").value="";
    notice.textContent="Fictional example loaded. Replace these values with your company assumptions before using the result for planning.";
  });
  document.getElementById("generatePresets")?.addEventListener("click",generatePresets);
  document.getElementById("compareScenarios")?.addEventListener("click",()=>{
    hideError();
    const cost=number(document.getElementById("annualPeopleCost")?.value);
    const currency=document.getElementById("scenarioCurrency")?.value || "INR";
    const outcome=compare(values(),cost,currency);
    if(outcome.error){showError(outcome.error);results.hidden=true;return;}
    render(outcome);
  });

  const workspace=cleanWorkspace();
  const workspaceCurrent=currentFromWorkspace(workspace);
  const reusable=FIELDS.filter((field)=>workspaceCurrent[field]!=null);
  if(reusable.length){
    setScenario("current",workspaceCurrent);
    notice.textContent=`Recovered baseline detected for ${workspace?.companyName || "your company"}. ${reusable.length} current scenario values were pre-filled from the saved Company Workspace. Confirm them and add critical capability coverage before generating scenarios.`;
  }
})(typeof window !== "undefined" ? window : globalThis, typeof document !== "undefined" ? document : null);