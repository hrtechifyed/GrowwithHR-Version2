"use strict";

const base=require("./server-esi-wave4a-runtime.js");
const MODULE_VERSION="1.0.0";
const SOURCE_DEFINITIONS=Object.freeze({...base.SOURCE_DEFINITIONS,
 "social-security-esi-membership-continuation-so-2351e-2026":Object.freeze({id:"source.social-security.esi-membership-continuation-2026",title:"S.O. 2351(E) — ESI membership continuation during contribution period",publisher:"Government of India",url:"https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa",sourceType:"regulation",fileName:"social-security-esi-membership-continuation-so-2351e-2026.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-esi-membership-continuation-so-2351e-2026.pdf"})
});
const COMMON_LIMITATIONS=Object.freeze([
 "The Wave 4B catalogue remains needs-legal-review and cannot certify continuing or voluntary coverage, area commencement, a Chapter IV wage ceiling, contribution-period continuation or an applicable contribution rate.",
 "Only controlled organisation-level source, routing and escalation statuses plus evidence references are evaluated; customer evidence is not independently verified.",
 "Retrieval and language-model output cannot create facts, supply a missing notification, select a threshold or rate, calculate amounts, determine individual insurance or alter the deterministic result.",
 "Names, contact details, Aadhaar, insurance numbers, employee wages, payroll rows, contribution histories, challans, returns, medical or family details, accident or claim data and evidence bodies are prohibited.",
 "Exact area and establishment notifications, the current Chapter IV wage-ceiling notification, saved-regulation treatment, contribution-period definitions and rate exceptions remain subject to qualified legal review."
]);
const COMMENCEMENT_SECTIONS=base.COMMENCEMENT_SECTIONS;
function sourceRecord(registrySourceId){const s=SOURCE_DEFINITIONS[registrySourceId];if(!s)throw new Error(`Unknown Wave 4B source ${registrySourceId}.`);return{id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:"India",sourceType:s.sourceType,documentType:"controlled-official-source",reviewedAt:"2026-08-06",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true};}
function recommendation(id,title,action){return{id:`recommendation.legal.esi-wave4b.${id}`,title,action,timeline:"Before relying on this private-beta review as an ESI legal, coverage or contribution conclusion",limitations:base.clone(COMMON_LIMITATIONS)};}
module.exports=Object.freeze({...base,MODULE_VERSION,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,COMMENCEMENT_SECTIONS,sourceRecord,recommendation});
