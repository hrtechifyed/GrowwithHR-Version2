"use strict";

const base=require("./server-code-on-wages-wave5c-runtime.js");
const MODULE_VERSION="1.0.0";
const SOURCE_DEFINITIONS=base.SOURCE_DEFINITIONS;
const COMMON_LIMITATIONS=Object.freeze([
 "The Wave 5D catalogue remains needs-legal-review and cannot determine customer coverage, individual gratuity eligibility, service, wages, amount, nomination, forfeiture, insurance, claim, appeal, recovery or remedy.",
 "Only organisation-level declared source route, Chapter V, First Schedule, Central Rules, commencement, transition, classification-control, workforce-category-source, authority-process-source and specialist-escalation statuses plus controlled references are evaluated.",
 "Retrieval and provider output cannot create facts, classify an establishment, count employees, infer a worker category or service history, calculate gratuity or alter the deterministic result.",
 "Employee identities, nominee or heir data, payroll, wage records, payslips, attendance, service records, claims, disputes, notices, orders, medical or death information and evidence bodies are prohibited.",
 "State or Union Territory instruments, customer-specific applicability, individual entitlement and disputed claims remain subject to qualified legal, privacy and source-file review."
]);
function sourceRecord(registrySourceId){const s=SOURCE_DEFINITIONS[registrySourceId];if(!s)throw new Error(`Unknown Wave 5D source ${registrySourceId}.`);return{id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:"India",sourceType:s.sourceType,documentType:"controlled-official-source",reviewedAt:"2026-08-07",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true};}
function recommendation(id,title,action){return{id:`recommendation.legal.gratuity-wave5d.${id}`,title,action,timeline:"Before relying on this private-beta review as a coverage, eligibility, amount, claim, appeal, recovery or remedy conclusion",limitations:base.clone(COMMON_LIMITATIONS)};}
module.exports=Object.freeze({...base,MODULE_VERSION,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,sourceRecord,recommendation});
