"use strict";
const base=require("./server-all-laws-private-beta-wave4c.js");
const {ESI_WAVE4D_CATALOG_ID,ESI_WAVE4D_CATALOG_PATH,ESI_WAVE4D_FEATURE_IDS,ESI_WAVE4D_PROFILE_DEFINITIONS}=require("./server-esi-wave4d-rule-catalogs.js");
const MODULE_VERSION="1.0.0";
const object=(v)=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const array=(v)=>Array.isArray(v)?v:[];
const text=(v)=>String(v??"").trim();
const clone=(v)=>JSON.parse(JSON.stringify(v));
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.freeze(v);Object.values(v).forEach(deepFreeze);return v;}
function buildAllLawsPrivateBetaRegistry(options={}){
 const registry=clone(base.buildAllLawsPrivateBetaRegistry(options));
 const definitions=new Map(ESI_WAVE4D_PROFILE_DEFINITIONS.map((item)=>[item.featureId,item]));
 const featureIds=new Set(ESI_WAVE4D_FEATURE_IDS);
 registry.profiles=array(registry.profiles).map((profileValue)=>{const profile=object(profileValue),definition=definitions.get(text(profile.featureId));if(!definition)return profile;return{...profile,lawFamilyId:"esi",catalogId:ESI_WAVE4D_CATALOG_ID,ruleIds:[definition.ruleId],productRuleIds:[definition.productRuleId],queryTerms:clone(definition.queryTerms),maxChunks:definition.maxChunks,privateBetaMode:"statutory-catalogue",activationStatus:"active-private-beta",explanationEnabled:true,blockers:[]};});
 const fallback=array(registry.catalogs).find((catalog)=>text(object(catalog).catalogId)===base.FALLBACK_CATALOG_ID);if(!fallback)throw new Error("The all-laws governance fallback catalogue is required.");
 fallback.allowedFeatureIds=array(fallback.allowedFeatureIds).filter((id)=>!featureIds.has(text(id))).sort();
 registry.catalogs.push({catalogId:ESI_WAVE4D_CATALOG_ID,lawFamilyId:"esi",catalogPath:ESI_WAVE4D_CATALOG_PATH,format:"governed-legal-source-chunks-v1",runtimeStatus:"available-private-beta",legalReviewStatus:"needs-legal-review",catalogMode:"statutory",allowedFeatureIds:[...ESI_WAVE4D_FEATURE_IDS].sort()});
 registry.catalogs.sort((a,b)=>text(a.catalogId).localeCompare(text(b.catalogId)));
 registry.registryVersion="0.11.0";registry.updatedAt="2026-08-06";
 registry.limitations=[
  "Every registered profile is callable in private beta.",
  "Seven POSH, ten Maternity Benefit, twelve EPF/EPS/EDLI and fifteen ESI Wave 4A–4D profiles use feature-specific deterministic rules and governed catalogues.",
  "The remaining profiles use conservative governance-fallback rules until their law-specific sources and rules complete review.",
  "No profile is legally approved; substantive outcomes remain specialist-review or more-information-needed.",
  "Wave 4D reviews exemption-governance and enforcement-authority source controls without exemption approval, document authentication, liability, recovery, penalty, prosecution or jurisdiction decisions.",
  "A language model may explain a deterministic result but cannot create or change it."
 ];
 return deepFreeze(registry);
}
module.exports=Object.freeze({...base,MODULE_VERSION,buildAllLawsPrivateBetaRegistry});
