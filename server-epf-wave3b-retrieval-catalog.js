"use strict";

const CATALOG = require("./growwithhr-rag/data/epf-wave3b-source-chunks.v1.json");
const { EPF_WAVE3B_CATALOG_ID } = require("./server-epf-wave3b-rule-catalogs.js");

const MODULE_VERSION = "1.0.0";
const ALL_REASON_CODES = Object.freeze([
    "EPF_WAGE_CEILING_SOURCE_RECORDED_REVIEW_REQUIRED",
    "EPF_WAGE_CEILING_SPECIALIST_REVIEW_REQUIRED",
    "EPF_WAGE_CEILING_FACTS_MISSING",
    "EPF_RATE_BASIS_EVIDENCED_VERIFICATION_RECOMMENDED",
    "EPF_RATE_BASIS_NOT_EVIDENCED_SPECIALIST_REVIEW",
    "EPF_RATE_BASIS_FACTS_MISSING",
    "EPS_MEMBERSHIP_ROUTING_REVIEW_REQUIRED",
    "EPS_ROUTING_SPECIALIST_REVIEW_REQUIRED",
    "EPS_ROUTING_FACTS_MISSING",
    "EPS_CONTROL_EVIDENCED_VERIFICATION_RECOMMENDED",
    "EPS_CONTROL_GAPS_SPECIALIST_REVIEW",
    "EPS_CONTROL_FACTS_MISSING",
    "EDLI_CONTROL_EVIDENCED_VERIFICATION_RECOMMENDED",
    "EDLI_RATE_SOURCE_SPECIALIST_REVIEW",
    "EDLI_CONTROL_FACTS_MISSING"
]);

const clone = (value) => JSON.parse(JSON.stringify(value));
function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function buildEpfWave3bRetrievalCatalog() {
    return deepFreeze(clone(CATALOG));
}

module.exports = Object.freeze({
    MODULE_VERSION,
    EPF_WAVE3B_CATALOG_ID,
    ALL_REASON_CODES,
    buildEpfWave3bRetrievalCatalog
});
