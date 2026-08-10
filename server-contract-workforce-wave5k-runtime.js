"use strict";
const base=require("./server-child-adolescent-labour-wave5i-runtime.js");
const MODULE_VERSION="1.0.0";
const SOURCE_DEFINITIONS=base.SOURCE_DEFINITIONS;
const COMMON_LIMITATIONS=Object.freeze([
 "The Wave 5K catalogue remains needs-legal-review and cannot determine OSHWC contract-labour applicability, thresholds, principal-employer/contractor classification, licensing, work-order validity, welfare sufficiency, wage default, core-activity status, prohibition, exemption, authority jurisdiction, enforcement or remedy.",
 "Only organisation-level source route/status, Chapter XI Part I source controls, threshold/classification-source controls, licensing/work-order/responsibility controls, separate EPF/ESI dependency statuses, cross-family reconciliation, authority/escalation and controlled references are evaluated.",
 "EPF and ESI remain separate deterministic legal-family reviews. Retrieval/provider output cannot use an OSHWC result as an EPF/ESI conclusion or use EPF/ESI results to establish OSHWC applicability.",
 "The Maharashtra OSHWC Labour Rules, 2026 source remains draft-only. Retrieval/provider output cannot treat it as final, infer a later final instrument or alter the deterministic result.",
 "Contractor/worker identities, contact/address data, registration identifiers, contract/work-order bodies, rosters, UAN/IP numbers, payroll/wage rows, attendance, bank/payment data, invoices, licences/certificates, notices/orders, disputes, accident/medical information and evidence bodies are prohibited."
]);
function sourceRecord(registrySourceId){const s=SOURCE_DEFINITIONS[registrySourceId];if(!s)throw new Error(`Unknown Wave 5K source ${registrySourceId}.`);return{id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:registrySourceId.startsWith("maharashtra-")?"India - Maharashtra":"India",sourceType:s.sourceType,documentType:s.documentType||"controlled-official-source",reviewedAt:"2026-08-10",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true};}
function recommendation(id,title,action){return{id:`recommendation.legal.contract-workforce-wave5k.${id}`,title,action,timeline:"Before relying on this private-beta review as an OSHWC contract-labour, EPF contractor, ESI contractor, licensing, wage, core-activity, enforcement or remedy conclusion",limitations:base.clone(COMMON_LIMITATIONS)};}
module.exports=Object.freeze({...base,MODULE_VERSION,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,sourceRecord,recommendation});
