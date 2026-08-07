"use strict";
const base=require("./server-all-laws-rule-catalogs-wave5b.js");
const {createCodeOnWagesWave5cFeatureSpecifications}=require("./server-code-on-wages-wave5c-rule-catalogs.js");
const MODULE_VERSION="1.0.0";
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.freeze(v);Object.values(v).forEach(deepFreeze);return v;}
function createRunnableAllLawsFeatureSpecifications(){return deepFreeze({...base.createRunnableAllLawsFeatureSpecifications(),...createCodeOnWagesWave5cFeatureSpecifications()});}
module.exports=Object.freeze({...base,MODULE_VERSION,createRunnableAllLawsFeatureSpecifications});
