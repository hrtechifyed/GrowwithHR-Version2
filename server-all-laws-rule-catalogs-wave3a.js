"use strict";

const base = require("./server-all-laws-rule-catalogs.js");
const {
    createEpfWave3aFeatureSpecifications
} = require("./server-epf-wave3a-rule-catalogs.js");

const MODULE_VERSION = "1.0.0";

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function createRunnableAllLawsFeatureSpecifications() {
    return deepFreeze({
        ...base.createRunnableAllLawsFeatureSpecifications(),
        ...createEpfWave3aFeatureSpecifications()
    });
}

module.exports = Object.freeze({
    ...base,
    MODULE_VERSION,
    createRunnableAllLawsFeatureSpecifications
});
