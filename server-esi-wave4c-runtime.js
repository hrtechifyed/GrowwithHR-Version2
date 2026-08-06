"use strict";

const base=require("./server-esi-wave4b-runtime.js");
const MODULE_VERSION="1.0.0";
const SOURCE_DEFINITIONS=Object.freeze({...base.SOURCE_DEFINITIONS,
 "social-security-esi-medical-practitioners-so-2352e-2026":Object.freeze({id:"source.social-security.esi-medical-practitioners-2026",title:"S.O. 2352(E) — ESI medical-practitioner authority",publisher:"Government of India",url:"https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa",sourceType:"regulation",fileName:"social-security-esi-medical-practitioners-so-2352e-2026.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-esi-medical-practitioners-so-2352e-2026.pdf"}),
 "other-beneficiaries-medical-facilities-scheme-2026":Object.freeze({id:"source.social-security.other-beneficiaries-medical-facilities-scheme-2026",title:"Other Beneficiaries Medical Facilities Scheme, 2026",publisher:"Government of India",url:"https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa",sourceType:"regulation",fileName:"other-beneficiaries-medical-facilities-scheme-2026.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-esi/other-beneficiaries-medical-facilities-scheme-2026.pdf"})
});
const COMMON_LIMITATIONS=Object.freeze([
 "The Wave 4C catalogue remains needs-legal-review and cannot decide a special ESI coverage route, individual benefit entitlement, medical treatment, certification sufficiency or State medical administration.",
 "Only controlled organisation-level route, process, source and escalation statuses plus evidence references are evaluated; customer evidence is not independently verified.",
 "Retrieval and language-model output cannot create facts, supply a missing notification, determine a claim, infer medical facts, select a provider or alter the deterministic result.",
 "Names, contact details, Aadhaar, insurance numbers, employee wages, payroll rows, contribution histories, diagnoses, certificates, prescriptions, treatment records, family details, accident narratives, claims and evidence bodies are prohibited.",
 "The hazardous-occupation notification, plantation opt-in instruments, State and Union Territory implementation sources, saved-regulation treatment and the other-beneficiaries user-charge instrument remain subject to qualified legal review."
]);
const COMMENCEMENT_SECTIONS=base.COMMENCEMENT_SECTIONS;
function sourceRecord(registrySourceId){const s=SOURCE_DEFINITIONS[registrySourceId];if(!s)throw new Error(`Unknown Wave 4C source ${registrySourceId}.`);return{id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:"India",sourceType:s.sourceType,documentType:"controlled-official-source",reviewedAt:"2026-08-06",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true};}
function recommendation(id,title,action){return{id:`recommendation.legal.esi-wave4c.${id}`,title,action,timeline:"Before relying on this private-beta review as an ESI coverage, benefit or medical-administration conclusion",limitations:base.clone(COMMON_LIMITATIONS)};}
module.exports=Object.freeze({...base,MODULE_VERSION,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,COMMENCEMENT_SECTIONS,sourceRecord,recommendation});
