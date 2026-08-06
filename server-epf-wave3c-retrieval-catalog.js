"use strict";

const CATALOG=require("./growwithhr-rag/data/epf-wave3c-source-chunks.v1.json");
const {EPF_WAVE3C_CATALOG_ID}=require("./server-epf-wave3c-rule-catalogs.js");
const MODULE_VERSION="1.0.0";
const ALL_REASON_CODES=Object.freeze([
 "EPF_EXEMPTION_CONTROLS_RECORDED_SPECIALIST_REVIEW","EPF_EXEMPTION_CONTROL_GAPS_SPECIALIST_REVIEW","EPF_EXEMPTION_FACTS_MISSING",
 "EPF_IW_CONTROLS_RECORDED_SPECIALIST_REVIEW","EPF_IW_CONTROL_GAPS_SPECIALIST_REVIEW","EPF_IW_FACTS_MISSING"
]);
const clone=(value)=>JSON.parse(JSON.stringify(value));
function deepFreeze(value){if(!value||typeof value!=="object"||Object.isFrozen(value))return value;Object.freeze(value);Object.values(value).forEach(deepFreeze);return value;}
function buildEpfWave3cRetrievalCatalog(){return deepFreeze(clone(CATALOG));}
module.exports=Object.freeze({MODULE_VERSION,EPF_WAVE3C_CATALOG_ID,ALL_REASON_CODES,buildEpfWave3cRetrievalCatalog});
