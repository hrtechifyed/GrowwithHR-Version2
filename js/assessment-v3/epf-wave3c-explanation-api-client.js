/**
 * Privacy-safe browser client for two EPF Wave 3C specialist-control profiles.
 */
export const EPF_WAVE3C_CLIENT_VERSION="1.0.0";
export const EPF_WAVE3C_ROUTE_PREFIX="/api/legal-explanation/feature/";
export const EPF_WAVE3C_RENDER_ORIGIN="https://growwithhr.onrender.com";
export const EPF_WAVE3C_TIMEOUT_MS=30_000;
const GITHUB_PAGES_ORIGIN="https://hrtechifyed.github.io";
const GITHUB_PAGES_PROJECT_PATH="/GrowwithHR-Version2/";
const REQUIRED_LIMITATIONS=Object.freeze([
 "This explanation does not change the deterministic decision.",
 "The rule and source interpretation remain subject to legal review.",
 "Assessment answers and evidence have not been independently verified."
]);
const object=(v)=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const array=(v)=>Array.isArray(v)?v:[];
const text=(v)=>String(v??"").replace(/\s+/g," ").trim();
const hasOwn=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
function unwrap(v){const s=object(v),d=object(s.data);return Object.keys(d).length?d:s;}
function scalar(v,max=120){return text(v).slice(0,max);}
function references(v){return[...new Set(array(v).slice(0,40).map((item)=>typeof item==="string"?text(item).slice(0,120):text(object(item).reference||object(item).ref||object(item).id).slice(0,120)).filter(Boolean))];}
function copyRequired(answers,definitions){
 const output={},missingFields=[];
 definitions.forEach(([key,label,transform=scalar])=>{
  if(!hasOwn(answers,key)){missingFields.push(label);return;}
  const value=transform(answers[key]);
  if(value===null||value===undefined||value===""||(Array.isArray(value)&&!value.length)){missingFields.push(label);return;}
  output[key]=value;
 });
 return Object.freeze({ready:missingFields.length===0,answers:missingFields.length?null:Object.freeze(output),missingFields:Object.freeze(missingFields)});
}
const ADAPTERS=Object.freeze({
 "feature.legal.epf.exemption-review":Object.freeze({
  title:"EPF exemption governance and source-control review",
  fields:[
   ["epfExemptionRouteStatus","exemption applicability route status"],
   ["epfExemptionOrderReferenceStatus","official exemption-order reference status"],
   ["epfExemptionScopeReviewStatus","current exemption scope review status"],
   ["epfExemptionTrustGovernanceControl","trust-governance control"],
   ["epfExemptionReturnsInspectionControl","returns and inspection control"],
   ["epfExemptionEvidenceReferences","exemption evidence references",references]
  ]
 }),
 "feature.legal.epf.international-worker-review":Object.freeze({
  title:"EPF international-worker and SSA control review",
  fields:[
   ["epfIwPopulationReviewStatus","international-worker population review status"],
   ["epfIwSsaRouteStatus","SSA country and route classification status"],
   ["epfIwCertificateControlStatus","certificate-of-coverage control"],
   ["epfIwExpiryMonitoringControl","expiry-monitoring control"],
   ["epfIwMembershipEscalationControl","membership escalation control"],
   ["epfIwEvidenceReferences","international-worker evidence references",references]
  ]
 })
});
export const EPF_WAVE3C_FEATURE_IDS=Object.freeze(Object.keys(ADAPTERS));
export function extractEpfWave3cAnswers(featureId,savedRecord){
 const adapter=ADAPTERS[text(featureId)];
 if(!adapter)throw new Error("The requested EPF Wave 3C feature has no browser adapter.");
 return copyRequired(object(unwrap(savedRecord).answers),adapter.fields);
}
export function createEpfWave3cPayload(featureId,savedRecord){
 const extracted=extractEpfWave3cAnswers(featureId,savedRecord);
 if(!extracted.ready)throw new Error(`${ADAPTERS[featureId].title} requires ${extracted.missingFields.join(", ")}.`);
 return Object.freeze({answers:extracted.answers});
}
function isGitHubPages(runtime){const location=runtime?.location;return Boolean(location&&location.origin===GITHUB_PAGES_ORIGIN&&(location.pathname==="/GrowwithHR-Version2"||location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH)));}
export function resolveEpfWave3cEndpoint(featureId,runtime=globalThis,documentObject=runtime?.document){
 const normalized=text(featureId);
 if(!ADAPTERS[normalized])throw new Error("The requested EPF Wave 3C feature has no browser adapter.");
 const explicit=text(documentObject?.body?.dataset?.legalExplanationEndpoint||runtime?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT);
 const route=`${EPF_WAVE3C_ROUTE_PREFIX}${encodeURIComponent(normalized)}`;
 if(explicit)return explicit.endsWith("/")?`${explicit}${encodeURIComponent(normalized)}`:explicit;
 return isGitHubPages(runtime)?`${EPF_WAVE3C_RENDER_ORIGIN}${route}`:route;
}
function assertFalse(source,property){if(object(source)[property]!==false)throw new Error(`The legal explanation response violated ${property}.`);}
export function validateEpfWave3cResponse(value,expectedFeatureId){
 const response=object(value),featureId=text(expectedFeatureId),decision=object(response.decision),retrieval=object(response.retrieval),
  explanation=object(response.explanation),generated=object(explanation.response),citations=array(retrieval.citations),
  citationIds=new Set(citations.map((item)=>text(object(item).chunkId)).filter(Boolean));
 if(!ADAPTERS[featureId]||response.featureId!==featureId||response.lawFamilyId!=="epf-eps-edli"||
  response.legalReviewStatus!=="needs-legal-review"||response.applicabilityAuthority!=="deterministic-only"||
  response.providerRole!=="explanation-only")throw new Error("The EPF Wave 3C response did not preserve its authority boundaries.");
 assertFalse(response,"usedForDecision");assertFalse(response,"mayChangeDecision");
 if(!["specialist-review","more-information-needed"].includes(text(decision.status))||!text(decision.reasonCode)||
  decision.legalReviewStatus!=="needs-legal-review")throw new Error("The deterministic EPF Wave 3C decision is incomplete.");
 if(retrieval.retrievalStatus!=="completed"||!text(retrieval.decisionFingerprint)||!text(retrieval.retrievalFingerprint)||
  !citations.length||citationIds.size!==citations.length)throw new Error("The governed EPF Wave 3C retrieval trace is incomplete.");
 if(explanation.explanationStatus!=="completed"||explanation.decisionFingerprint!==retrieval.decisionFingerprint||
  explanation.retrievalFingerprint!==retrieval.retrievalFingerprint||generated.decisionStatus!==decision.status||
  generated.reasonCode!==decision.reasonCode||generated.decisionFingerprint!==retrieval.decisionFingerprint||
  !text(generated.summary)||!array(generated.rationale).length||!array(generated.nextSteps).length||
  !REQUIRED_LIMITATIONS.every((item)=>array(generated.limitations).includes(item)))throw new Error("The generated EPF Wave 3C explanation does not match the protected trace.");
 assertFalse(explanation,"usedForDecision");assertFalse(explanation,"mayChangeDecision");assertFalse(explanation,"legalAdvice");
 assertFalse(generated,"usedForDecision");assertFalse(generated,"mayChangeDecision");assertFalse(generated,"legalAdvice");
 array(generated.rationale).forEach((item)=>{const record=object(item),ids=array(record.citationChunkIds).map(text).filter(Boolean);if(!text(record.statement)||!ids.length||!ids.every((id)=>citationIds.has(id)))throw new Error("The generated EPF Wave 3C rationale contains an invalid citation.");});
 return response;
}
export async function requestEpfWave3cExplanation(input={}){
 const request=object(input),featureId=text(request.featureId),runtime=request.runtime||globalThis,fetchImpl=request.fetchImpl||runtime.fetch;
 if(typeof fetchImpl!=="function")throw new Error("Fetch is unavailable.");
 const endpoint=request.endpoint||resolveEpfWave3cEndpoint(featureId,runtime,request.documentObject);
 const payload=request.payload||createEpfWave3cPayload(featureId,request.savedRecord);
 const controller=new AbortController();
 const timeout=runtime.setTimeout(()=>controller.abort(),Number.isInteger(request.timeoutMs)?request.timeoutMs:EPF_WAVE3C_TIMEOUT_MS);
 try{
  const response=await fetchImpl(endpoint,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},credentials:"omit",cache:"no-store",body:JSON.stringify(payload),signal:controller.signal});
  const body=await response.json();
  if(!response.ok)throw new Error(text(object(body).error?.message)||"The EPF Wave 3C explanation request failed.");
  return validateEpfWave3cResponse(body,featureId);
 }finally{runtime.clearTimeout(timeout);}
}
export default Object.freeze({version:EPF_WAVE3C_CLIENT_VERSION,featureIds:EPF_WAVE3C_FEATURE_IDS,extractEpfWave3cAnswers,createEpfWave3cPayload,resolveEpfWave3cEndpoint,validateEpfWave3cResponse,requestEpfWave3cExplanation});
