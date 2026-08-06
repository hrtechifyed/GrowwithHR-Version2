"use strict";

/**
 * Bridges the CommonJS server to the complete ESM legal RAG engine.
 */

const path = require("path");
const { pathToFileURL } = require("url");

const cleanText = (value) => String(value ?? "").trim();

function moduleUrl(...segments) {
    return pathToFileURL(path.join(__dirname, ...segments)).href;
}

function createCompleteLegalModulesLoader(options = {}) {
    const retrievalMode = cleanText(options.retrievalMode || "lexical").toLowerCase();
    let promise = null;

    return function loadCompleteLegalModules() {
        if (!promise) {
            promise = Promise.all([
                import(moduleUrl("js", "assessment-v3", "legal-rule-assurance-catalog-facts.js")),
                import(moduleUrl("growwithhr-rag", "legal-rag-engine.js")),
                import(moduleUrl("growwithhr-rag", "legal-explanation-contract.js"))
            ]).then(([assurance, engine, contract]) => Object.freeze({
                assurance,
                ragRuntime: Object.freeze({
                    runLegalRagRetrieval(input = {}) {
                        return engine.runLegalRagEngine({
                            ...input,
                            adapterMode: retrievalMode
                        });
                    }
                }),
                ragEngine: engine,
                contract
            }));
        }
        return promise;
    };
}

module.exports = Object.freeze({
    createCompleteLegalModulesLoader
});
