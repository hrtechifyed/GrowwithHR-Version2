import fs from "node:fs";

const originalReadFileSync = fs.readFileSync;

fs.readFileSync = function readLawTransparencyCore(path, ...args) {
    const normalized = String(path).replace(/\\/g, "/");
    if (normalized.endsWith("js/pdf-law-transparency.js")) {
        return originalReadFileSync.call(
            fs,
            normalized.replace(
                /js\/pdf-law-transparency\.js$/,
                "js/pdf-law-transparency-core.js"
            ),
            ...args
        );
    }
    return originalReadFileSync.call(fs, path, ...args);
};

try {
    await import("./m4-report-integration-checks-core.mjs");
} finally {
    fs.readFileSync = originalReadFileSync;
}
