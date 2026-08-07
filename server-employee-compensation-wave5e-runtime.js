"use strict";

const base=require("./server-gratuity-wave5d-runtime.js");
const MODULE_VERSION="1.0.0";
const SOURCE_DEFINITIONS=base.SOURCE_DEFINITIONS;
const COMMON_LIMITATIONS=Object.freeze([
 "The Wave 5E catalogue remains needs-legal-review and cannot determine customer coverage, individual injury or occupational-disease compensability, causation, disablement, dependency, liability, wages, compensation amount, interest, damages, claim, appeal, recovery or remedy.",
 "Only organisation-level declared source route, Chapter VII, schedule-set, Central Rules, commencement, transition, ESI-overlap, employer-process, authority-process and specialist-escalation statuses plus controlled references are evaluated.",
 "Retrieval and provider output cannot create facts, classify a worker, decide ESI coverage, infer an injury, medical, wage or dependency fact, calculate compensation, adjudicate a claim or alter the deterministic result.",
 "Employee or dependant identities, age, sex, addresses, payroll, wage records, payslips, attendance, service histories, accident or injury narratives, medical or death information, claims, disputes, notices, orders, bank data, payment amounts and evidence bodies are prohibited.",
 "State or Union Territory instruments, customer-specific applicability, individual injury and entitlement matters and disputed claims remain subject to qualified legal, privacy and source-file review."
]);
function sourceRecord(registrySourceId){const s=SOURCE_DEFINITIONS[registrySourceId];if(!s)throw new Error(`Unknown Wave 5E source ${registrySourceId}.`);return{id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:"India",sourceType:s.sourceType,documentType:"controlled-official-source",reviewedAt:"2026-08-07",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true};}
function recommendation(id,title,action){return{id:`recommendation.legal.employee-compensation-wave5e.${id}`,title,action,timeline:"Before relying on this private-beta review as a coverage, injury, causation, liability, amount, claim, appeal, recovery or remedy conclusion",limitations:base.clone(COMMON_LIMITATIONS)};}
module.exports=Object.freeze({...base,MODULE_VERSION,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,sourceRecord,recommendation});
