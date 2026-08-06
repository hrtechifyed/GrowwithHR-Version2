"use strict";

const base=require("./server-epf-wave3b-runtime.js");
const SOURCE_DEFINITIONS=Object.freeze({
  ...base.SOURCE_DEFINITIONS,
  "epfo-exemption-manual-2023":Object.freeze({
    id:"source.epfo.exemption-manual-2023",title:"EPFO Exemption Manual and SOP set, 2023",
    publisher:"Employees' Provident Fund Organisation",url:"https://www.epfindia.gov.in/site_en/Exempted_Return.php",
    sourceType:"regulator-guidance",fileName:"epfo-exemption-manual-2023.source-identity.json",
    drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-guidance/epfo-exemption-manual-2023.source-identity.json"
  }),
  "epfo-exemption-management-sop-2023":Object.freeze({
    id:"source.epfo.exemption-management-sop-2023",title:"EPFO SOP for Management and Regulation of EPF Exemption, 2023",
    publisher:"Employees' Provident Fund Organisation",url:"https://www.epfindia.gov.in/site_en/Exempted_Return.php",
    sourceType:"regulator-guidance",fileName:"epfo-exemption-management-regulation-sop-2023.source-identity.json",
    drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-guidance/epfo-exemption-management-regulation-sop-2023.source-identity.json"
  }),
  "epfo-international-workers-faq-2026":Object.freeze({
    id:"source.epfo.international-workers-faq-2026",title:"EPFO International Workers FAQ snapshot, 2026",
    publisher:"Employees' Provident Fund Organisation",url:"https://www.epfindia.gov.in/site_en/FAQ.php",
    sourceType:"regulator-guidance",fileName:"epfo-international-workers-faq-2026.source-identity.json",
    drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-guidance/epfo-international-workers-faq-2026.source-identity.json"
  }),
  "epfo-operating-ssa-register-2026":Object.freeze({
    id:"source.epfo.operating-ssa-register-2026",title:"EPFO Operating Social Security Agreements register, 2026",
    publisher:"Employees' Provident Fund Organisation",url:"https://www.epfindia.gov.in/site_en/Operating_SSA.php",
    sourceType:"official-portal",fileName:"epfo-operating-ssa-register-2026.source-identity.json",
    drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-guidance/epfo-operating-ssa-register-2026.source-identity.json"
  })
});
const COMMON_LIMITATIONS=Object.freeze([
  "The catalogue remains needs-legal-review and cannot certify an EPF exemption or decide an individual's international-worker, excluded-employee, EPF or EPS status.",
  "Only organisation-level control statuses and evidence references are evaluated; exemption-order bodies, trust records, country-specific certificates and employee records are not verified.",
  "Retrieval and language-model output cannot create facts, determine an exemption or SSA route, change membership, or alter the deterministic result.",
  "Names, UANs, passport or nationality documents, employee wage amounts, payroll rows, contribution histories, certificate bodies, claims, family details and evidence bodies are prohibited.",
  "Country-specific SSA instruments, administrative arrangements, certificate validity and exemption orders remain subject to qualified legal review.",
  "EPFO web records identify controlled source locations only; they do not represent archived full pages or linked-document verification."
]);
function sourceRecord(registrySourceId){
  const s=SOURCE_DEFINITIONS[registrySourceId];
  if(!s)throw new Error(`Unknown Wave 3C source ${registrySourceId}.`);
  return{
    id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:"India",
    sourceType:s.sourceType,documentType:["regulator-guidance","government-guidance","official-portal"].includes(s.sourceType)?"controlled-official-guidance":"controlled-official-source",
    reviewedAt:"2026-08-06",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true
  };
}
function recommendation(id,title,action){
  return{id:`recommendation.legal.epf-wave3c.${id}`,title,action,
    timeline:"Before relying on this private-beta review as an exemption or international-worker legal conclusion",
    limitations:base.clone(COMMON_LIMITATIONS)};
}
module.exports=Object.freeze({...base,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,sourceRecord,recommendation});
