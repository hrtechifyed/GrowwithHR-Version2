import {expect,test,type Page,type Request} from "@playwright/test";
const ROUTE="/analyze-company-v3.html";
const FEATURE_ID="feature.legal.epf.international-worker-review";
type StorageWrite={method:"setItem"|"removeItem"|"clear";key:string|null};
type WaveWindow=Window&typeof globalThis&{GrowWithHREpfWave3cPanel?:{getState:()=>Record<string,unknown>};__wave3cWrites?:StorageWrite[]};
function responsePayload(){
 const chunkId="epfo-international-worker-faq-wave3c-001";
 return{endpointVersion:"1.0.0",featureId:FEATURE_ID,lawFamilyId:"epf-eps-edli",legalReviewStatus:"needs-legal-review",
  applicabilityAuthority:"deterministic-only",providerRole:"explanation-only",usedForDecision:false,mayChangeDecision:false,
  decision:{productRuleId:"epf-international-worker-ssa-control-review",ruleId:"rule.legal.epf.international-worker-review",
   ruleVersion:"1.0.0-private-beta",sourceRecordId:"EPF-WAVE3C-INTERNATIONAL-WORKER",status:"specialist-review",
   reasonCode:"EPF_IW_CONTROLS_RECORDED_SPECIALIST_REVIEW",reason:"The controlled organisation-level controls are recorded.",
   sourceRegistryIds:["epfo-international-workers-faq-2026"],sourceSections:[],legalReviewStatus:"needs-legal-review",limitations:["This does not decide an individual status."]},
  retrieval:{retrievalStatus:"completed",decisionFingerprint:"wave3c-decision",retrievalFingerprint:"wave3c-retrieval",
   citations:[{chunkId,registrySourceId:"epfo-international-workers-faq-2026",sourceTitle:"EPFO International Workers FAQ snapshot, 2026",sectionReference:"FAQ items 283–290",officialUrl:"https://www.epfindia.gov.in/site_en/FAQ.php",contentSha256:"abc"}]},
  explanation:{contractVersion:"1.0.0",explanationStatus:"completed",provider:{name:"deterministic-test-provider",model:"test-model",role:"explanation-only"},
   usedForDecision:false,mayChangeDecision:false,legalAdvice:false,decisionFingerprint:"wave3c-decision",retrievalFingerprint:"wave3c-retrieval",
   response:{contractVersion:"1.0.0",decisionFingerprint:"wave3c-decision",decisionStatus:"specialist-review",
    reasonCode:"EPF_IW_CONTROLS_RECORDED_SPECIALIST_REVIEW",summary:"The international-worker control route requires qualified review before reliance.",
    rationale:[{citationChunkIds:[chunkId],statement:"The governed EPFO FAQ provides context for the fixed review result."}],
    nextSteps:["Verify country-specific SSA and certificate controls without sending employee records."],
    limitations:["This explanation does not change the deterministic decision.","The rule and source interpretation remain subject to legal review.","Assessment answers and evidence have not been independently verified."],
    legalReviewStatus:"needs-legal-review",usedForDecision:false,mayChangeDecision:false,legalAdvice:false}}
 };
}
async function trackStorage(page:Page){await page.addInitScript(()=>{const writes:StorageWrite[]=[];(window as WaveWindow).__wave3cWrites=writes;const set=Storage.prototype.setItem,remove=Storage.prototype.removeItem,clear=Storage.prototype.clear;Storage.prototype.setItem=function(k,v){writes.push({method:"setItem",key:String(k)});return set.call(this,k,v)};Storage.prototype.removeItem=function(k){writes.push({method:"removeItem",key:String(k)});return remove.call(this,k)};Storage.prototype.clear=function(){writes.push({method:"clear",key:null});return clear.call(this)}});}
function requestJson(request:Request){const data=request.postData();return data?JSON.parse(data):null;}
test.describe("Compliance DNA EPF Wave 3C",()=>{
 test("exposes two reviews, sends an allow-listed payload and persists nothing",async({page})=>{
  await trackStorage(page);let requestCount=0,submittedPayload:unknown=null;
  await page.route("**/api/legal-explanation/feature/**",async(route)=>{requestCount+=1;submittedPayload=requestJson(route.request());await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(responsePayload())});});
  await page.goto(ROUTE,{waitUntil:"domcontentloaded"});
  await expect(page.locator("#dnaEpfWave3c")).toBeVisible();
  await expect(page.locator("#dnaEpfWave3cFeature option")).toHaveCount(2);
  expect(requestCount).toBe(0);
  await page.locator("#dnaEpfWave3cFeature").selectOption(FEATURE_ID);
  for(const name of ["epfIwPopulationReviewStatus","epfIwSsaRouteStatus","epfIwCertificateControlStatus","epfIwExpiryMonitoringControl","epfIwMembershipEscalationControl"])await page.locator(`[name="${name}"]`).selectOption("evidenced");
  await page.locator('[name="epfIwEvidenceReferences"]').fill("iw-route-control-register");
  await page.getByRole("button",{name:"Generate specialist-control review",exact:true}).click();
  await expect(page.locator("#dnaEpfWave3cResult")).toBeVisible();
  await expect(page.locator("#dnaEpfWave3cBadge")).toHaveText("Specialist Review");
  await expect(page.locator("#dnaEpfWave3cSummary")).toContainText("qualified review");
  await expect(page.locator("#dnaEpfWave3cCitations")).toContainText("FAQ items 283–290");
  expect(requestCount).toBe(1);
  expect(submittedPayload).toEqual({answers:{
   epfIwPopulationReviewStatus:"evidenced",epfIwSsaRouteStatus:"evidenced",epfIwCertificateControlStatus:"evidenced",
   epfIwExpiryMonitoringControl:"evidenced",epfIwMembershipEscalationControl:"evidenced",epfIwEvidenceReferences:["iw-route-control-register"]
  }});
  const state=await page.evaluate(()=>(window as WaveWindow).GrowWithHREpfWave3cPanel?.getState()||null);
  expect(state).toMatchObject({phase:"complete",requestCount:1,selectedFeatureId:FEATURE_ID,hasResult:true,automaticRequest:false,browserStorageWrites:0,stableReportMutation:false,stablePdfMutation:false,stableEmailMutation:false});
  const writes=await page.evaluate(()=>(window as WaveWindow).__wave3cWrites||[]);
  expect(writes).toEqual([]);
 });
});
