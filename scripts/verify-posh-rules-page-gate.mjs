import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");
const CATALOG_PATH = path.join(PROJECT_ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json");
const VERIFICATION_PATH = path.join(PROJECT_ROOT, "data", "legal-source-governance", "posh-rules-page-verification.v1.json");
const SECTION_MAP_PATH = path.join(PROJECT_ROOT, "data", "legal-source-governance", "posh-section-mapping.v1.json");

function normalizeRelativePath(value) {
  const normalized = String(value ?? "")
    .replaceAll("\\", "/")
    .replace(/^GrowWithHR-RAG\//, "")
    .replace(/^\/+/, "");

  if (!normalized || normalized.includes("../")) {
    throw new Error(`Unsafe or empty governed path: ${value}`);
  }

  return normalized;
}

async function sha256(filePath) {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function main() {
  const configuredRoot = process.argv[2] || process.env.GROWWITHHR_RAG_SOURCE_ROOT;
  if (!configuredRoot) {
    throw new Error("Provide the absolute GrowWithHR-RAG folder path as the first argument or GROWWITHHR_RAG_SOURCE_ROOT.");
  }

  const sourcePackRoot = path.resolve(configuredRoot);
  const [catalog, verification, sectionMap] = await Promise.all([
    readJson(CATALOG_PATH),
    readJson(VERIFICATION_PATH),
    readJson(SECTION_MAP_PATH)
  ]);

  if (verification.runtimeActivation !== false || verification.ragApprovalStatus !== "not-approved") {
    throw new Error("The page-verification record must remain non-runtime and not approved for RAG.");
  }

  const source = (catalog.sources || []).find(
    (candidate) => candidate.registrySourceId === verification.source.registrySourceId
  );
  if (!source) {
    throw new Error(`Unknown source ID: ${verification.source.registrySourceId}`);
  }

  for (const field of ["sha256", "byteLength", "pageCount", "drivePath"]) {
    const expectedKey = field === "sha256"
      ? "expectedSha256"
      : field === "byteLength"
        ? "expectedByteLength"
        : field === "pageCount"
          ? "expectedPageCount"
          : "drivePath";

    if (source[field] !== verification.source[expectedKey]) {
      throw new Error(`Verification metadata does not match the governed catalog for ${field}.`);
    }
  }

  const relativePath = normalizeRelativePath(source.drivePath);
  const sourceFilePath = path.resolve(sourcePackRoot, relativePath);
  if (!sourceFilePath.startsWith(`${sourcePackRoot}${path.sep}`)) {
    throw new Error(`Governed path escapes the source-pack root: ${source.drivePath}`);
  }

  const fileStat = await stat(sourceFilePath);
  if (!fileStat.isFile()) {
    throw new Error(`Governed POSH Rules source is not a file: ${source.drivePath}`);
  }
  if (fileStat.size !== source.byteLength) {
    throw new Error(`Byte-length mismatch for ${source.registrySourceId}: expected ${source.byteLength}, received ${fileStat.size}.`);
  }

  const digest = await sha256(sourceFilePath);
  if (digest !== source.sha256) {
    throw new Error(`SHA-256 mismatch for ${source.registrySourceId}: expected ${source.sha256}, received ${digest}.`);
  }

  const sectionMapByKey = new Map(
    sectionMap.features.flatMap((feature) =>
      feature.sourceMappings.map((mapping) => [
        `${feature.featureId}::${mapping.reference}`,
        mapping
      ])
    )
  );

  for (const pageMapping of verification.pageMappings) {
    if (!Number.isInteger(pageMapping.pdfPageStart) || !Number.isInteger(pageMapping.pdfPageEnd)) {
      throw new Error(`Invalid page range for ${pageMapping.reference}.`);
    }
    if (pageMapping.pdfPageStart < 1 || pageMapping.pdfPageEnd < pageMapping.pdfPageStart) {
      throw new Error(`Out-of-order page range for ${pageMapping.reference}.`);
    }
    if (pageMapping.pdfPageEnd > source.pageCount) {
      throw new Error(`Page range exceeds the registered PDF for ${pageMapping.reference}.`);
    }

    const sectionMapping = sectionMapByKey.get(`${pageMapping.featureId}::${pageMapping.reference}`);
    if (!sectionMapping) {
      throw new Error(`No draft section-map entry exists for ${pageMapping.featureId} ${pageMapping.reference}.`);
    }
    if (sectionMapping.pageVerificationStatus !== "pending-exact-file-verification") {
      throw new Error(`Section-map entry is no longer pending exact-file verification: ${pageMapping.reference}.`);
    }
  }

  console.log(JSON.stringify({
    valid: true,
    exactDriveFileVerified: true,
    registrySourceId: source.registrySourceId,
    drivePath: source.drivePath,
    sha256: digest,
    byteLength: fileStat.size,
    registeredPageCount: source.pageCount,
    verifiedPageMappings: verification.pageMappings.map(({ featureId, reference, pdfPageStart, pdfPageEnd }) => ({
      featureId,
      reference,
      pdfPageStart,
      pdfPageEnd
    })),
    nextGate: "qualified-legal-review-of-exact-file-page-mapping",
    runtimeActivation: false,
    ragApprovalStatus: verification.ragApprovalStatus
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
