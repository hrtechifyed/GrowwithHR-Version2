"use strict";

const MODULE_VERSION="1.0.0";
const SOURCE_DEFINITIONS=Object.freeze({
 "social-security-code-2020":Object.freeze({id:"source.social-security.code-2020",title:"Code on Social Security, 2020",publisher:"Government of India",url:"https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa",sourceType:"legislation",fileName:"code-on-social-security-2020-official.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/01-code/code-on-social-security-2020-official.pdf"}),
 "social-security-central-rules-2026":Object.freeze({id:"source.social-security.central-rules-2026",title:"Social Security (Central) Rules, 2026 — G.S.R. 344(E)",publisher:"Government of India",url:"https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa",sourceType:"regulation",fileName:"social-security-central-rules-2026-official.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/03-rules/social-security-central-rules-2026-official.pdf"}),
 "employees-state-insurance-central-rules-1950":Object.freeze({id:"source.esi.central-rules-1950",title:"Employees' State Insurance (Central) Rules, 1950 — consolidated 26 April 2024",publisher:"Employees' State Insurance Corporation",url:"https://www.esic.gov.in/Publications/",sourceType:"regulation",fileName:"employees-state-insurance-central-rules-1950-consolidated-2024.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-esi/employees-state-insurance-central-rules-1950-consolidated-2024.pdf"}),
 "employees-state-insurance-general-regulations-1950":Object.freeze({id:"source.esi.general-regulations-1950",title:"Employees' State Insurance (General) Regulations, 1950 — consolidated 11 January 2024",publisher:"Employees' State Insurance Corporation",url:"https://www.esic.gov.in/Publications/",sourceType:"regulation",fileName:"employees-state-insurance-general-regulations-1950-consolidated-2024.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/04-esi/employees-state-insurance-general-regulations-1950-consolidated-2024.pdf"}),
 "social-security-code-commencement-so-5319e-2025":Object.freeze({id:"source.social-security.commencement-2025",title:"Code on Social Security commencement notification S.O. 5319(E), 2025",publisher:"Government of India",url:"https://www.labour.gov.in/",sourceType:"regulation",fileName:"social-security-code-commencement-so-5319e-2025.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-commencement-so-5319e-2025.pdf"}),
 "social-security-code-corrigendum-so-5936e-2025":Object.freeze({id:"source.social-security.corrigendum-2025",title:"Code on Social Security corrigendum S.O. 5936(E), 2025",publisher:"Government of India",url:"https://www.labour.gov.in/whats-new",sourceType:"regulation",fileName:"social-security-code-corrigendum-so-5936e-2025.pdf",drivePath:"GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-corrigendum-so-5936e-2025.pdf"})
});
const COMMON_LIMITATIONS=Object.freeze([
 "The Wave 4A catalogue remains needs-legal-review and cannot certify ESI coverage, employee insurance, payment, accident reporting or compliance.",
 "Only controlled organisation-level statuses, declared routes and evidence references are evaluated; customer evidence is not independently verified.",
 "Retrieval and language-model output cannot create facts, decide applicability, select a wage ceiling or contribution rate, calculate amounts, determine entitlement or alter the deterministic result.",
 "Names, contact details, Aadhaar, insurance numbers, employee wages, payroll rows, contribution histories, challans, returns, medical or family details, accident narratives, claim files and evidence bodies are prohibited.",
 "Area commencement, hazardous routes, current wage ceiling, saved-regulation treatment, portal procedures and State medical administration remain subject to qualified legal review."
]);
const COMMENCEMENT_SECTIONS=Object.freeze([
 {registrySourceId:"social-security-code-commencement-so-5319e-2025",reference:"S.O. 5319(E), dated 21 November 2025",purpose:"Commencement and transition context"},
 {registrySourceId:"social-security-code-corrigendum-so-5936e-2025",reference:"S.O. 5936(E), dated 19 December 2025",purpose:"Corrigendum and transition context"}
]);
const object=(v)=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const array=(v)=>Array.isArray(v)?v:[];
const text=(v)=>String(v??"").replace(/\s+/g," ").trim();
const clone=(v)=>JSON.parse(JSON.stringify(v));
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;Object.freeze(v);Object.values(v).forEach(deepFreeze);return v;}
function unique(v){return[...new Set(array(v).map(text).filter(Boolean))];}
function token(v){return text(v).toLowerCase().replace(/[_\s]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");}
function normalizeToken(v,allowed=[]){const n=token(v);if(!n)return null;return !allowed.length||allowed.includes(n)?n:"unknown";}
function normalizeStatus(v){const a={yes:"evidenced",true:"evidenced",implemented:"evidenced",present:"evidenced",complete:"evidenced",recorded:"evidenced",no:"not-evidenced",false:"not-evidenced",missing:"not-evidenced",absent:"not-evidenced",incomplete:"not-evidenced","not-recorded":"not-evidenced"};const c=a[token(v)]||token(v);return["evidenced","not-evidenced","unknown","not-applicable","conflict"].includes(c)?c:null;}
function normalizeArray(v){return unique(array(v).slice(0,40).map((i)=>typeof i==="string"?text(i).slice(0,120):text(object(i).reference||object(i).ref||object(i).id).slice(0,120)));}
function normalizeFeatureBody(config,value){const raw=object(object(value).answers),answers={};config.fields.forEach((f)=>{if(!Object.prototype.hasOwnProperty.call(raw,f.answerKey))return;const n=f.normalize==="array"?normalizeArray(raw[f.answerKey]):f.normalize==="status"?normalizeStatus(raw[f.answerKey]):normalizeToken(raw[f.answerKey],f.allowed||[]);if(n===null||n===undefined||(Array.isArray(n)&&!n.length))return;answers[f.answerKey]=n;});return deepFreeze({answers});}
function sourceRecord(registrySourceId){const s=SOURCE_DEFINITIONS[registrySourceId];if(!s)throw new Error(`Unknown Wave 4A source ${registrySourceId}.`);return{id:s.id,registrySourceId,title:s.title,publisher:s.publisher,url:s.url,jurisdiction:"India",sourceType:s.sourceType,documentType:"controlled-official-source",reviewedAt:"2026-08-06",reviewStatus:"needs-legal-review",fileName:s.fileName,drivePath:s.drivePath,official:true};}
function recommendation(id,title,action){return{id:`recommendation.legal.esi-wave4a.${id}`,title,action,timeline:"Before relying on this private-beta review as an ESI legal or operational conclusion",limitations:clone(COMMON_LIMITATIONS)};}
module.exports=Object.freeze({MODULE_VERSION,SOURCE_DEFINITIONS,COMMON_LIMITATIONS,COMMENCEMENT_SECTIONS,object,array,text,clone,deepFreeze,unique,normalizeFeatureBody,sourceRecord,recommendation});
