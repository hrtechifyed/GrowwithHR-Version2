"use strict";
const base=require("./server-all-laws-rule-catalogs-wave3c.js");
const {createEsiWave4aFeatureSpecifications}=require("./server-esi-wave4a-rule-catalogs.js");
const MODULE_VERSION="1.0.0";
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.freeze(v);Object.values(v).forEach(deepFreeze);return v;}
function createRunnableAllLawsFeatureSpecifications(){return deepFreeze({...base.createRunnableAllLawsFeatureSpecifications(),...createEsiWave4aFeatureSpecifications()});}
module.exports=Object.freeze({...base,MODULE_VERSION,createRunnableAllLawsFeatureSpecifications});
