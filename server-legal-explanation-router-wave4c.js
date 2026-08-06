"use strict";
const base=require("./server-legal-explanation-router-wave4b.js");
const {buildAllLawsPrivateBetaRegistry}=require("./server-all-laws-private-beta-wave4c.js");
const {createRunnableAllLawsFeatureSpecifications}=require("./server-all-laws-rule-catalogs-wave4c.js");
const {loadGovernedLegalCatalogs}=require("./server-legal-rag-catalogs.js");
const SHARED_ROUTER_VERSION="1.9.0";
const DEFAULT_PROFILE_REGISTRY=buildAllLawsPrivateBetaRegistry();
const DEFAULT_FEATURE_SPECIFICATIONS=Object.freeze({...base.defaultFeatureSpecifications(),...createRunnableAllLawsFeatureSpecifications()});
const text=(v)=>String(v??"").trim();
function defaultFeatureSpecifications(){return DEFAULT_FEATURE_SPECIFICATIONS;}
function statusPayload(registry,catalogSnapshot,retrievalMode){return Object.freeze({...base.statusPayload(registry,catalogSnapshot,retrievalMode),routerVersion:SHARED_ROUTER_VERSION,limitations:[
 "Seven POSH, ten Maternity Benefit, twelve EPF/EPS/EDLI and thirteen ESI Wave 4A–4C profiles use feature-specific deterministic rules and governed catalogues.",
 "Waves 1–4C remain needs-legal-review and emit specialist-review or more-information-needed, not legal certification, special-route classification, claim decisions, medical advice or individual entitlement decisions.",
 "Fifteen remaining profiles are runnable through conservative governance-fallback catalogues.",
 "Wave 4C processes organisation-level route, benefit-support, source and escalation controls plus evidence references only.",
 "Retrieval and provider output cannot supply missing notifications or State sources, create facts, process medical data, decide claims, select treatment or alter deterministic outcomes."
 ]});}
function writeStatus(response,payload){response.statusCode=200;response.setHeader("Content-Type","application/json; charset=utf-8");response.setHeader("Cache-Control","no-store");response.end(JSON.stringify(payload));}
function createSharedLegalExplanationRequestHandler(options={}){const profileRegistry=options.profileRegistry||DEFAULT_PROFILE_REGISTRY;const featureSpecifications=options.featureSpecifications||DEFAULT_FEATURE_SPECIFICATIONS;const catalogSnapshot=options.catalogSnapshot||loadGovernedLegalCatalogs({profileRegistry});const delegated=base.createSharedLegalExplanationRequestHandler({...options,profileRegistry,featureSpecifications,catalogSnapshot,catalogs:options.catalogs||catalogSnapshot.catalogs});const retrievalMode=text(options.retrievalMode||process.env.LEGAL_RAG_RETRIEVAL_MODE||"lexical").toLowerCase();return function handleWave4cLegalExplanationRequest(request,response){const requestPath=text(request.url).split("?")[0];if(requestPath===base.STATUS_ROUTE&&request.method==="GET"){writeStatus(response,statusPayload(profileRegistry,catalogSnapshot,retrievalMode));return true;}return delegated(request,response);};}
let defaultHandler=null;
function handleSharedLegalExplanationRequest(request,response){if(!defaultHandler)defaultHandler=createSharedLegalExplanationRequestHandler();return defaultHandler(request,response);}
module.exports=Object.freeze({...base,SHARED_ROUTER_VERSION,DEFAULT_PROFILE_REGISTRY,defaultFeatureSpecifications,statusPayload,createSharedLegalExplanationRequestHandler,handleSharedLegalExplanationRequest});
