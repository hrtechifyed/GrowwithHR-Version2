/** GrowWithHR v0.21 Evidence and Persistence contract-only checks. */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = path.join(root, "schemas/v021-evidence-persistence-contracts.schema.json");
const fixturePath = path.join(root, "tests/fixtures/v021/valid-contract-package.json");
const packagePath = path.join(root, "package.json");

const [schemaSource, fixtureSource, packageSource] = await Promise.all([
    readFile(schemaPath, "utf8"),
    readFile(fixturePath, "utf8"),
    readFile(packagePath, "utf8")
]);

const schema = JSON.parse(schemaSource);
const fixture = JSON.parse(fixtureSource);
const packageJson = JSON.parse(packageSource);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function expectInvalid(candidate, label) {
    assert.equal(validate(candidate), false, `${label} should be rejected.`);
    assert.ok(validate.errors?.length, `${label} should report schema errors.`);
}

function assertSingleTenant(packageFixture) {
    const expected = packageFixture.tenantBoundary;
    for (const [name, contract] of Object.entries(packageFixture.contracts)) {
        assert.equal(contract.tenantId, expected.tenantId, `${name} tenant boundary changed.`);
        assert.equal(contract.organisationId, expected.organisationId, `${name} organisation boundary changed.`);
    }
}

assert.equal(packageJson.version, "0.20.0", "Contract foundation must not cut the v0.21 release.");
assert.equal(packageJson.scripts["test:m6-contracts"], "node tests/v021-evidence-persistence-contract-checks.mjs");
assert.equal(fixture.runtimeEnabled, false, "Contract foundation must keep runtime persistence disabled.");
assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
assertSingleTenant(fixture);

const unknownField = clone(fixture);
unknownField.contracts.organisationProfile.unapprovedField = true;
expectInvalid(unknownField, "Unknown profile field");

const evidenceContent = clone(fixture);
evidenceContent.contracts.evidenceMetadata.contentStored = true;
expectInvalid(evidenceContent, "Evidence content storage");

const unsafeMigration = clone(fixture);
unsafeMigration.contracts.migrationReceipt.sourcePreserved = false;
expectInvalid(unsafeMigration, "Destructive local migration");

const unencryptedBackup = clone(fixture);
unencryptedBackup.contracts.backupManifest.encrypted = false;
expectInvalid(unencryptedBackup, "Unencrypted backup");

const incompleteDeletion = clone(fixture);
delete incompleteDeletion.contracts.deletionReceipt.backupExpiryAt;
expectInvalid(incompleteDeletion, "Deletion without backup-expiry disclosure");

const withdrawnConsent = clone(fixture);
withdrawnConsent.contracts.consentRecord.status = "withdrawn";
expectInvalid(withdrawnConsent, "Consent withdrawal without timestamp");
withdrawnConsent.contracts.consentRecord.withdrawnAt = "2026-07-28T11:00:00.000Z";
assert.equal(validate(withdrawnConsent), true, JSON.stringify(validate.errors, null, 2));

const crossTenant = clone(fixture);
crossTenant.contracts.evidenceMetadata.tenantId = "tenant.other-999";
assert.throws(() => assertSingleTenant(crossTenant), /tenant boundary changed/);

assert.equal(schema.description.includes("does not enable runtime persistence"), true);
assert.equal(schema.$defs.evidenceMetadata.properties.contentStored.const, false);
assert.equal(schema.$defs.migrationReceipt.properties.sourcePreserved.const, true);

console.log("v0.21 evidence and persistence contract checks passed.");
