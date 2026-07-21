import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);

const packagePath = path.join(
    rootDirectory,
    "package.json"
);

const packageJson = JSON.parse(
    fs.readFileSync(packagePath, "utf8")
);

const version = String(
    packageJson.version || ""
).trim();

const checkOnly = process.argv.includes("--check");

const changedFiles = [];
const mismatchedFiles = [];

if (
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)
) {
    throw new Error(
        `Invalid package.json version: ${
            version || "<empty>"
        }`
    );
}

function processFile(relativePath, transform) {
    const absolutePath = path.join(
        rootDirectory,
        relativePath
    );

    if (!fs.existsSync(absolutePath)) {
        throw new Error(
            `Required file was not found: ${relativePath}`
        );
    }

    const originalContent = fs.readFileSync(
        absolutePath,
        "utf8"
    );

    const updatedContent = transform(
        originalContent,
        relativePath
    );

    if (originalContent === updatedContent) {
        return;
    }

    if (checkOnly) {
        mismatchedFiles.push(relativePath);
        return;
    }

    fs.writeFileSync(
        absolutePath,
        updatedContent,
        "utf8"
    );

    changedFiles.push(relativePath);
}

/**
 * Keep the application configuration aligned with package.json.
 */
processFile(
    "js/config/app-config.js",
    (source, relativePath) => {
        const pattern = /version:\s*"[^"]+"/;

        if (!pattern.test(source)) {
            throw new Error(
                `Version property was not found in ${relativePath}`
            );
        }

        return source.replace(
            pattern,
            `version: "${version}"`
        );
    }
);

/**
 * Find HTML files throughout the repository.
 */
const htmlFiles = [];

function collectHtmlFiles(directory) {
    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        if (
            [
                ".git",
                "node_modules",
                "playwright-report",
                "test-results"
            ].includes(entry.name)
        ) {
            continue;
        }

        const absolutePath = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {
            collectHtmlFiles(absolutePath);
            continue;
        }

        if (
            entry.isFile() &&
            entry.name.endsWith(".html")
        ) {
            htmlFiles.push(
                path.relative(
                    rootDirectory,
                    absolutePath
                )
            );
        }
    }
}

collectHtmlFiles(rootDirectory);

/** Keep embedded applicationVersion fields aligned with package.json. */
for (const relativePath of htmlFiles) {
    processFile(relativePath, (source) => {
        if (!source.includes('"applicationVersion"')) return source;
        return source.replace(/"applicationVersion"\s*:\s*"[^"]+"/g, `"applicationVersion": "${version}"`);
    });
}

/**
 * Keep every visible product-version footer aligned.
 */
for (const relativePath of htmlFiles) {
    processFile(
        relativePath,
        (source, filePath) => {
            const hasProductVersion =
                source.includes('id="productVersion"') ||
                source.includes("id='productVersion'");

            if (!hasProductVersion) {
                return source;
            }

            const pattern =
                /(id=["']productVersion["'][^>]*>\s*GrowWithHR\s+Public\s+)[^<\s]+/g;

            if (!pattern.test(source)) {
                throw new Error(
                    `The productVersion element in ${filePath} does not use the expected format.`
                );
            }

            pattern.lastIndex = 0;

            return source.replace(
                pattern,
                `$1${version}`
            );
        }
    );
}

if (checkOnly && mismatchedFiles.length > 0) {
    console.error(
        `Version metadata does not match package.json (${version}):`
    );

    for (const file of mismatchedFiles) {
        console.error(`- ${file}`);
    }

    process.exitCode = 1;
} else if (checkOnly) {
    console.log(
        `Version metadata is consistent: ${version}`
    );
} else if (changedFiles.length === 0) {
    console.log(
        `Version metadata was already consistent: ${version}`
    );
} else {
    console.log(
        `Synchronized ${changedFiles.length} file(s) to ${version}:`
    );

    for (const file of changedFiles) {
        console.log(`- ${file}`);
    }
}
