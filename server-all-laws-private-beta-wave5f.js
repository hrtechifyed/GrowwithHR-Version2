"use strict";
const base=require("./server-all-laws-private-beta-wave5e.js");
const {OSHWC_WAVE5F_CATALOG_ID,OSHWC_WAVE5F_CATALOG_PATH,OSHWC_WAVE5F_FEATURE_IDS,OSHWC_WAVE5F_PROFILE_DEFINITIONS}=require("./server-oshwc-wave5f-rule-catalogs.js");
const MODULE_VERSION="1.0.0";
const object=(v)=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const array=(v)=>Array.isArray(v)?v:[];
const text=(v)=>String(v??"").trim();
const clone=(v)=>JSON.parse(JSON.stringify(v));
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.freeze(v);Object.values(v).forEach(deepFreeze);return v;}
function buildAllLawsPrivateBetaRegistry(options={}){
 const registry=clone(base.buildAllLawsPrivateBetaRegistry(options));
 const definitions=new Map(OSHWC_WAVE5F_PROFILE_DEFINITIONS.map((item)=>[item.featureId,item]));
 const featureIds=new Set(OSHWC_WAVE5F_FEATURE_IDS);
 registry.profiles=array(registry.profiles).map((profileValue)=>{const profile=object(profileValue),definition=definitions.get(text(profile.featureId));if(!definition)return profile;return{...profile,lawFamilyId:"oshwc",catalogId:OSHWC_WAVE5F_CATALOG_ID,ruleIds:[definition.ruleId],productRuleIds:[definition.productRuleId],queryTerms:clone(definition.queryTerms),maxChunks:definition.maxChunks,privateBetaMode:"statutory-catalogue",activationStatus:"active-private-beta",explanationEnabled:true,blockers:[]};});
 const fallback=array(registry.catalogs).find((catalog)=>text(object(catalog).catalogId)===base.FALLBACK_CATALOG_ID);if(!fallback)throw new Error("The all-laws governance fallback catalogue is required.");
 fallback.allowedFeatureIds=array(fallback.allowedFeatureIds).filter((id)=>!featureIds.has(text(id))).sort();
 registry.catalogs.push({catalogId:OSHWC_WAVE5F_CATALOG_ID,lawFamilyId:"oshwc",catalogPath:OSHWC_WAVE5F_CATALOG_PATH,format:"governed-legal-source-chunks-v1",runtimeStatus:"available-private-beta",legalReviewStatus:"needs-legal-review",catalogMode:"statutory",allowedFeatureIds:[...OSHWC_WAVE5F_FEATURE_IDS].sort()});
 registry.catalogs.sort((a,b)=>text(a.catalogId).localeCompare(text(b.catalogId)));
 registry.registryVersion="0.17.0";registry.updatedAt="2026-08-07";
 registry.limitations=[
  "Every registered profile is callable in private beta.",
  "Seven POSH, ten Maternity Benefit, twelve EPF/EPS/EDLI, fifteen ESI, one Appropriate Government, one Maharashtra Shops, one Code on Wages, one Gratuity, one Employee's Compensation and one OSHWC profile use feature-specific deterministic rules and governed catalogues.",
  "The remaining seven profiles use conservative governance-fallback rules until their law-specific sources and rules complete review.",
  "No profile is legally approved; substantive outcomes remain specialist-review or more-information-needed.",
  "Wave 5F reviews bounded Central/Maharashtra OSHWC source readiness, generic establishment controls and draft-versus-final State-rule reconciliation without deciding applicability, industry classification, worker thresholds, substantive working conditions, enforcement or remedies.",
  "A language model may explain a deterministic result but cannot create or change it."
 ];
 return deepFreeze(registry);
}
module.exports=Object.freeze({...base,MODULE_VERSION,buildAllLawsPrivateBetaRegistry});
