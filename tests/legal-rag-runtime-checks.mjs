import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = (...parts) => path.join(ROOT, ...parts);

const paths = {
  runtime: project("growwithhr-rag", "legal-rag-runtime.js"),
  retrieval: project("growwithhr-rag", "legal-source-retrieval.js"),
  profiles: project("growwithhr-rag", "data", "legal-rag-profiles.v1.json"),
  poshCatalog: project("growwithhr-rag", "data", "posh-source-chunks.v1.json"),
  featureRegistry: project("data", "assessment", "feature-coverage-registry.v1.json"),
  legalRules: project("data", "assessment", "legal-applicability-rules.v1.json"),
  package: project("package.json")
};

async function loadModules() {
  const directory = await mkdtemp(path.join(tmpdir(), "growwithhr-legal-rag-runtime-"));
  const [retrievalSource, runtimeSource] = await Promise.all([
    readFile(paths.retrieval, "utf8"),
    readFile(paths.runtime, "utf8")
  ]);
  await writeFile(path.join(directory, "legal-source-retrieval.mjs"), retrievalSource, "utf8");
  await writeFile(
    path.join(directory, "legal-rag-runtime.mjs"),
    runtimeSource.replace("./legal-source-retrieval.js", "./legal-source-retrieval.mjs"),
    "utf8"
  );
  return {
    directory,
    runtimeSource,
    retrieval: await import(pathToFileURL(path.join(directory, "legal-source-retrieval.mjs")).href),
    runtime: await import(pathToFileURL(path.join(directory, "legal-rag-runtime.mjs")).href)
  };
}

function issueCode(result, code) {
  assert.equal(result.valid, false);
  assert(result.errors.some((item) => item.code === code), JSON.stringify(result.errors, null, 2));
}

function thresholdDecision() {
  return {
    productRuleId: "posh",
    ruleId: "rule.legal.posh.internal-committee-threshold",
    ruleVersion: "0.1.0",
    status: "specialist-review",
    reasonCode: "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
    sourceRegistryIds: ["posh-act-2013", "posh-rules-2013", "posh-commencement-2013"],
    requiredFactIds: [
      "fact.workforce.employee-count",
      "fact.footprint.primary-state",
      "fact.footprint.location-count"
    ],
    triggeringFactIds: [
      "fact.workforce.employee-count",
      "fact.footprint.primary-state",
      "fact.footprint.location-count"
    ],
    missingFactIds: []
  };
}

const [profiles, poshCatalog, featureRegistry, legalRules, packageJson] = await Promise.all([
  readFile(paths.profiles, "utf8").then(JSON.parse),
  readFile(paths.poshCatalog, "utf8").then(JSON.parse),
  readFile(paths.featureRegistry, "utf8").then(JSON.parse),
  readFile(paths.legalRules, "utf8").then(JSON.parse),
  readFile(paths.package, "utf8").then(JSON.parse)
]);
const loaded = await loadModules();

try {
  const validation = loaded.runtime.validateLegalRagProfiles(profiles);
  assert.equal(validation.valid, true, JSON.stringify(validation.errors, null, 2));
  assert.equal(profiles.runtimeRole, "post-decision-rag-routing-only");
  assert.equal(profiles.applicabilityAuthority, "none");
  assert.equal(profiles.llmRole, "explanation-only");

  const legalFeatureIds = new Set(
    featureRegistry.features
      .filter((feature) => feature.classification === "legal-assurance")
      .map((feature) => feature.id)
  );
  const profileFeatureIds = new Set(profiles.profiles.map((profile) => profile.featureId));
  assert.equal(legalFeatureIds.size, 18);
  assert.equal(profiles.profiles.length, 18);
  assert.deepEqual(profileFeatureIds, legalFeatureIds);

  const activeProfiles = profiles.profiles.filter((profile) => profile.activationStatus === "active-private-beta");
  assert.equal(activeProfiles.length, 1);
  assert.equal(activeProfiles[0].featureId, "feature.legal.posh.internal-committee-threshold");
  assert.equal(activeProfiles[0].catalogId, "catalog.legal.posh.v1");
  assert.equal(profiles.catalogs.length, 1);
  assert.equal(profiles.catalogs[0].catalogPath, "growwithhr-rag/data/posh-source-chunks.v1.json");

  const currentLegalRuleIds = new Set(legalRules.rules.map((rule) => rule.id));
  assert(currentLegalRuleIds.has(activeProfiles[0].ruleIds[0]));
  assert(profiles.profiles
    .filter((profile) => profile.activationStatus !== "active-private-beta")
    .every((profile) => profile.explanationEnabled === false && profile.blockers.length > 0));

  const decision = thresholdDecision();
  const before = JSON.stringify(decision);
  const catalogs = { "catalog.legal.posh.v1": poshCatalog };
  const result = loaded.runtime.runLegalRagRetrieval({ decision, registry: profiles, catalogs });

  assert.equal(result.runtimeRole, "post-decision-rag-routing-only");
  assert.equal(result.applicabilityAuthority, "none");
  assert.equal(result.usedForDecision, false);
  assert.equal(result.llmUsed, false);
  assert.equal(result.profile.featureId, "feature.legal.posh.internal-committee-threshold");
  assert.equal(result.profile.compatibilityRoutes[0], "/api/legal-explanation/posh");
  assert.equal(result.retrieval.retrievalStatus, "completed");
  assert.equal(result.retrieval.decisionReference.reasonCode, decision.reasonCode);
  assert(result.retrieval.retrievedChunks.some((chunk) => chunk.chunkId === "posh-act-2013-section-4-001"));
  assert.equal(JSON.stringify(decision), before, "The shared RAG runtime mutated the deterministic decision.");

  const direct = loaded.retrieval.retrieveLegalDecisionSources({
    decision,
    catalog: poshCatalog,
    queryTerms: activeProfiles[0].queryTerms,
    maxChunks: activeProfiles[0].maxChunks
  });
  assert.deepEqual(
    result.retrieval.retrievedChunks.map((chunk) => chunk.chunkId),
    direct.retrievedChunks.map((chunk) => chunk.chunkId),
    "The shared resolver must preserve the existing POSH retrieval result."
  );

  const disabled = loaded.runtime.runLegalRagRetrieval({
    decision,
    registry: profiles,
    catalogs,
    enabled: false
  });
  assert.equal(disabled.retrieval.retrievalStatus, "disabled");
  assert.equal(disabled.retrieval.retrievedChunks.length, 0);

  const capped = loaded.runtime.runLegalRagRetrieval({
    decision,
    registry: profiles,
    catalogs,
    maxChunks: 1,
    queryTerms: ["employer duties"]
  });
  assert.equal(capped.retrieval.retrievedChunks.length, 1);

  const blockedDecision = {
    ...decision,
    productRuleId: "posh-policy",
    ruleId: "rule.legal.posh.policy-review",
    reasonCode: "POSH_POLICY_REVIEW_REQUIRED"
  };
  issueCode(loaded.runtime.runLegalRagRetrievalSafely({
    decision: blockedDecision,
    featureId: "feature.legal.posh.policy-review",
    registry: profiles,
    catalogs
  }), "legal-rag-profile-blocked");

  issueCode(loaded.runtime.runLegalRagRetrievalSafely({
    decision: { ...decision, ruleId: "rule.legal.unknown", productRuleId: "unknown" },
    registry: profiles,
    catalogs
  }), "legal-rag-profile-not-found");

  issueCode(loaded.runtime.runLegalRagRetrievalSafely({
    decision,
    featureId: "feature.legal.posh.policy-review",
    registry: profiles,
    catalogs
  }), "legal-rag-profile-mismatch");

  issueCode(loaded.runtime.runLegalRagRetrievalSafely({
    decision,
    registry: profiles,
    catalogs: {}
  }), "legal-rag-catalog-not-injected");

  const invalid = JSON.parse(JSON.stringify(profiles));
  invalid.profiles[0].activationStatus = "blocked-awaiting-approval";
  invalid.profiles[0].explanationEnabled = false;
  invalid.profiles[0].blockers = ["test blocker"];
  assert.equal(loaded.runtime.validateLegalRagProfiles(invalid).valid, true);
  issueCode(loaded.runtime.runLegalRagRetrievalSafely({
    decision,
    registry: invalid,
    catalogs
  }), "legal-rag-profile-blocked");

  assert(Object.isFrozen(result));
  assert(Object.isFrozen(result.profile));
  assert(Object.isFrozen(result.retrieval));
  for (const forbidden of [
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /localStorage/,
    /sessionStorage/,
    /readFile/,
    /node:fs/,
    /chromadb/i,
    /embedding/i,
    /openai/i,
    /anthropic/i
  ]) {
    assert.equal(forbidden.test(loaded.runtimeSource), false, `Forbidden shared runtime marker: ${forbidden}`);
  }

  assert.equal(packageJson.scripts["test:legal-rag-runtime"], "node tests/legal-rag-runtime-checks.mjs");
  assert.match(packageJson.scripts["test:m2"], /test:legal-rag-runtime/);

  console.log(JSON.stringify({
    valid: true,
    legalProfiles: profiles.profiles.length,
    activeProfiles: activeProfiles.length,
    catalogCount: profiles.catalogs.length,
    retrievedChunks: result.retrieval.retrievedChunks.length,
    decisionFingerprint: result.retrieval.decisionFingerprint
  }, null, 2));
} finally {
  await rm(loaded.directory, { recursive: true, force: true });
}
