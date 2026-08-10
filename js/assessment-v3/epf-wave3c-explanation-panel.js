/**
 * GrowWithHR Compliance DNA — EPF Wave 3C specialist-control panel.
 * Explicit-submit and in-memory only.
 */
import {EPF_WAVE3C_FEATURE_IDS,createEpfWave3cPayload,requestEpfWave3cExplanation} from "./epf-wave3c-explanation-api-client.js";
export const EPF_WAVE3C_PANEL_VERSION="1.0.0";
const STATUS_OPTIONS=Object.freeze(["evidenced","not-evidenced","unknown","not-applicable","conflict"]);
const FEATURES=Object.freeze({
 "feature.legal.epf.exemption-review":Object.freeze({
  label:"Exemption governance",
  description:"Review exemption source, order-reference, trust, returns and inspection controls. Do not enter an order body, establishment name or trust records.",
  fields:[
   ["epfExemptionRouteStatus","Exemption applicability route recorded"],
   ["epfExemptionOrderReferenceStatus","Official exemption-order reference recorded"],
   ["epfExemptionScopeReviewStatus","Current exemption scope reviewed"],
   ["epfExemptionTrustGovernanceControl","Trust-governance control"],
   ["epfExemptionReturnsInspectionControl","Returns and inspection control"],
   ["epfExemptionEvidenceReferences","Exemption evidence references","csv","exemption-control-register"]
  ]
 }),
 "feature.legal.epf.international-worker-review":Object.freeze({
  label:"International-worker and SSA controls",
  description:"Review workforce, SSA, certificate and expiry-monitoring controls without names, passports, nationality documents or certificate bodies.",
  fields:[
   ["epfIwPopulationReviewStatus","International-worker population review status"],
   ["epfIwSsaRouteStatus","SSA country and route classification status"],
   ["epfIwCertificateControlStatus","Certificate-of-coverage control"],
   ["epfIwExpiryMonitoringControl","Detachment and certificate expiry-monitoring control"],
   ["epfIwMembershipEscalationControl","EPF and EPS membership escalation control"],
   ["epfIwEvidenceReferences","International-worker evidence references","csv","iw-route-control-register"]
  ]
 })
});
const object=(v)=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const array=(v)=>Array.isArray(v)?v:[];
const text=(v)=>String(v??"").trim();
function el(d,tag,o={}){const n=d.createElement(tag);if(o.id)n.id=o.id;if(o.className)n.className=o.className;if(o.text!==undefined)n.textContent=String(o.text);if(o.type)n.type=o.type;return n;}
function field(d,[key,label,type="select",placeholder=""]){
 const wrap=el(d,"label",{className:"dna-posh-wave1__field"});
 wrap.append(el(d,"span",{className:"dna-posh-wave1__field-label",text:label}));
 let control;
 if(type==="csv"){control=el(d,"input",{className:"dna-posh-wave1__control"});control.type="text";control.placeholder=placeholder;}
 else{control=el(d,"select",{className:"dna-posh-wave1__control"});const empty=el(d,"option",{text:"Select…"});empty.value="";control.append(empty);STATUS_OPTIONS.forEach((value)=>{const option=el(d,"option",{text:value});option.value=value;control.append(option);});}
 control.name=key;control.dataset.fieldType=type;control.required=true;wrap.append(control);return wrap;
}
function collect(form){const answers={};form.querySelectorAll("[name]").forEach((control)=>{const raw=text(control.value);if(!raw)throw new Error(`${control.name} is required.`);answers[control.name]=control.dataset.fieldType==="csv"?raw.split(",").map(text).filter(Boolean):raw;});return answers;}
function label(v){return text(v).split("-").filter(Boolean).map((p)=>p.charAt(0).toUpperCase()+p.slice(1)).join(" ");}
function list(d,mount,values){mount.replaceChildren();const ul=el(d,"ul",{className:"dna-legal-explanation__list"});array(values).forEach((value)=>{const li=el(d,"li",{text:typeof value==="string"?value:text(object(value).statement||object(value).title)});if(li.textContent)ul.append(li);});mount.append(ul);}
function render(d,e,response){
 const decision=object(response.decision),generated=object(object(response.explanation).response),citations=array(object(response.retrieval).citations);
 e.result.hidden=false;e.badge.textContent=label(decision.status);e.summary.textContent=text(generated.summary);
 list(d,e.rationale,generated.rationale);list(d,e.nextSteps,generated.nextSteps);
 e.citations.replaceChildren();const ul=el(d,"ul",{className:"dna-legal-explanation__list"});
 citations.forEach((value)=>{const c=object(value),li=el(d,"li"),title=text(c.sourceTitle||c.title||c.registrySourceId),section=text(c.sectionReference||c.reference);li.textContent=section?`${title} — ${section}`:title;ul.append(li);});e.citations.append(ul);
 e.metadata.textContent=`Reason code: ${text(decision.reasonCode)} · Rule: ${text(decision.ruleId)} · Legal review: needs-legal-review`;
}
function markup(d){
 const root=el(d,"section",{id:"dnaEpfWave3c",className:"dna-legal-explanation dna-posh-wave1 dna-epf-wave3c"});root.setAttribute("aria-labelledby","dnaEpfWave3cTitle");
 const header=el(d,"header",{className:"dna-legal-explanation__header"}),heading=el(d,"div",{className:"dna-legal-explanation__heading"});
 heading.append(el(d,"p",{className:"dna-legal-explanation__eyebrow",text:"EPF Wave 3C · substantive private beta"}),el(d,"h2",{id:"dnaEpfWave3cTitle",className:"dna-legal-explanation__title",text:"Review exemption and international-worker controls"}),el(d,"p",{className:"dna-legal-explanation__description",text:"Enter organisation-level control statuses and evidence references. Deterministic rules produce the fixed result before governed retrieval and explanation."}));header.append(heading);root.append(header);
 root.append(el(d,"p",{className:"dna-private-note",text:"Inputs remain in memory and are sent only after Generate review. Nothing is saved. Do not enter names, UANs, passport or nationality documents, wage amounts, payroll rows, contribution histories, exemption-order bodies, certificate bodies, trust member records, claims or evidence bodies."}));
 const selectorLabel=el(d,"label",{className:"dna-posh-wave1__selector"});selectorLabel.append(el(d,"span",{className:"dna-posh-wave1__field-label",text:"Select a specialist-control review"}));
 const selector=el(d,"select",{id:"dnaEpfWave3cFeature",className:"dna-posh-wave1__control"});
 EPF_WAVE3C_FEATURE_IDS.forEach((id)=>{const option=el(d,"option",{text:FEATURES[id].label});option.value=id;selector.append(option);});selectorLabel.append(selector);root.append(selectorLabel);
 const description=el(d,"p",{id:"dnaEpfWave3cDescription",className:"dna-legal-explanation__status"}),form=el(d,"form",{id:"dnaEpfWave3cForm",className:"dna-posh-wave1__form"}),fields=el(d,"div",{id:"dnaEpfWave3cFields",className:"dna-posh-wave1__fields"}),actions=el(d,"div",{className:"dna-posh-wave1__actions"});
 const button=el(d,"button",{id:"dnaEpfWave3cButton",className:"dna-primary-button dna-legal-explanation__button",text:"Generate specialist-control review",type:"submit"}),status=el(d,"p",{id:"dnaEpfWave3cStatus",className:"dna-legal-explanation__status",text:"No request has been made."});status.setAttribute("role","status");actions.append(button,status);form.append(fields,actions);root.append(description,form);
 const error=el(d,"p",{id:"dnaEpfWave3cError",className:"dna-legal-explanation__notice dna-legal-explanation__notice--error"});error.hidden=true;root.append(error);
 const result=el(d,"div",{id:"dnaEpfWave3cResult",className:"dna-legal-explanation__content"});result.hidden=true;
 const card=el(d,"article",{className:"dna-legal-explanation__summary-card"}),cardHeader=el(d,"header",{className:"dna-legal-explanation__summary-header"});
 cardHeader.append(el(d,"h3",{text:"Deterministic result explained"}),el(d,"span",{id:"dnaEpfWave3cBadge",className:"dna-legal-explanation__decision-badge",text:"Waiting"}));card.append(cardHeader,el(d,"p",{id:"dnaEpfWave3cSummary",className:"dna-legal-explanation__summary"}));
 const grid=el(d,"div",{className:"dna-legal-explanation__detail-grid"});[["Why this result appears","dnaEpfWave3cRationale"],["Next steps","dnaEpfWave3cNextSteps"],["Governed citations","dnaEpfWave3cCitations"]].forEach(([title,id])=>{const section=el(d,"section",{className:"dna-legal-explanation__detail"});section.append(el(d,"h3",{text:title}),el(d,"div",{id}));grid.append(section);});
 result.append(card,grid,el(d,"p",{id:"dnaEpfWave3cMetadata",className:"dna-legal-explanation__metadata"}));root.append(result);
 return{root,selector,description,form,fields,button,status,error,result};
}
export function createEpfWave3cPanel(options={}){
 const runtime=options.runtime||globalThis,documentObject=options.documentObject||runtime.document,shell=documentObject?.getElementById("dnaShell");
 if(!shell)throw new Error("GrowWithHR EPF Wave 3C panel requires #dnaShell.");
 const e=markup(documentObject),wave3b=documentObject.getElementById("dnaEpfWave3b");
 if(wave3b?.parentNode===shell)wave3b.insertAdjacentElement("afterend",e.root);else shell.append(e.root);
 Object.assign(e,{badge:documentObject.getElementById("dnaEpfWave3cBadge"),summary:documentObject.getElementById("dnaEpfWave3cSummary"),rationale:documentObject.getElementById("dnaEpfWave3cRationale"),nextSteps:documentObject.getElementById("dnaEpfWave3cNextSteps"),citations:documentObject.getElementById("dnaEpfWave3cCitations"),metadata:documentObject.getElementById("dnaEpfWave3cMetadata")});
 const state={phase:"idle",requestCount:0,result:null,destroyed:false};
 function renderFields(){const def=FEATURES[e.selector.value];e.description.textContent=def.description;e.fields.replaceChildren(...def.fields.map((item)=>field(documentObject,item)));e.result.hidden=true;e.error.hidden=true;e.status.textContent="No request has been made.";state.phase="ready";}
 async function submit(event){
  event.preventDefault();if(state.destroyed||state.phase==="loading")return;e.error.hidden=true;e.result.hidden=true;
  let payload;try{payload=createEpfWave3cPayload(e.selector.value,{answers:collect(e.form)});}catch(error){e.error.textContent=text(error?.message)||"Complete every controlled field.";e.error.hidden=false;state.phase="error";return;}
  state.phase="loading";state.requestCount+=1;e.button.disabled=true;e.status.textContent="Recomputing the deterministic review and retrieving governed source context…";
  try{const response=await requestEpfWave3cExplanation({featureId:e.selector.value,payload,runtime,fetchImpl:options.fetchImpl,endpoint:options.endpoint});state.result=response;state.phase="complete";render(documentObject,e,response);e.status.textContent="Specialist-control review completed. The result remains needs-legal-review.";}
  catch(error){state.phase="error";e.error.textContent=text(error?.message)||"The specialist-control review could not be prepared.";e.error.hidden=false;e.status.textContent="The review did not complete. No input was saved.";}
  finally{e.button.disabled=false;}
 }
 e.selector.addEventListener("change",renderFields);e.form.addEventListener("submit",submit);renderFields();
 return Object.freeze({version:EPF_WAVE3C_PANEL_VERSION,featureIds:EPF_WAVE3C_FEATURE_IDS,getState:()=>Object.freeze({phase:state.phase,requestCount:state.requestCount,selectedFeatureId:e.selector.value,hasResult:Boolean(state.result),automaticRequest:false,browserStorageWrites:0,stableReportMutation:false,stablePdfMutation:false,stableEmailMutation:false}),destroy(){if(state.destroyed)return;state.destroyed=true;e.selector.removeEventListener("change",renderFields);e.form.removeEventListener("submit",submit);e.root.remove();}});
}
function start(){const d=globalThis.document;if(!d?.getElementById("dnaShell")||d.getElementById("dnaEpfWave3c"))return;try{globalThis.window.GrowWithHREpfWave3cPanel=createEpfWave3cPanel();}catch(error){console.error("GrowWithHR EPF Wave 3C panel could not start.",error);}}
if(typeof globalThis.document!=="undefined"){if(globalThis.document.readyState==="loading")globalThis.document.addEventListener("DOMContentLoaded",start,{once:true});else start();}
export default Object.freeze({version:EPF_WAVE3C_PANEL_VERSION,featureIds:EPF_WAVE3C_FEATURE_IDS,createEpfWave3cPanel});
