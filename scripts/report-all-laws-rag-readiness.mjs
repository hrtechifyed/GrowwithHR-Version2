import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const {
    buildAllLawsReadinessSnapshot,
    buildCandidateManifestBlueprint
} = require("../growwithhr-rag/all-laws-onboarding.js");

function option(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : null;
}

const snapshot = buildAllLawsReadinessSnapshot();
const familyId = option("--family");
const outputPath = option("--output");
const payload = familyId
    ? {
        readiness: snapshot,
        candidateManifest: buildCandidateManifestBlueprint(familyId)
    }
    : snapshot;
const serialized = `${JSON.stringify(payload, null, 2)}\n`;

if (outputPath) {
    const resolved = path.resolve(process.cwd(), outputPath);
    await writeFile(resolved, serialized, "utf8");
    console.log(`All-laws RAG readiness written to ${resolved}`);
} else {
    process.stdout.write(serialized);
}
