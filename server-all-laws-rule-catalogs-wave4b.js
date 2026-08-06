"use strict";
const base=require("./server-all-laws-rule-catalogs-wave4a.js");
const {createEsiWave4bFeatureSpecifications}=require("./server-esi-wave4b-rule-catalogs.js");
const MODULE_VERSION="1.0.0";
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.freeze(v);Object.values(v).forEach(deepFreeze);return v;}
function createRunnableAllLawsFeatureSpecifications(){return deepFreeze({...base.createRunnableAllLawsFeatureSpecifications(),...createEsiWave4bFeatureSpecifications()});}
module.exports=Object.freeze({...base,MODULE_VERSION,createRunnableAllLawsFeatureSpecifications});
