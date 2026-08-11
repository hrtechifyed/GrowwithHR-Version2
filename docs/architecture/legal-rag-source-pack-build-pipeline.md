# Legal RAG source-pack build and exact-file pipeline

**Updated:** 11 August 2026  
**Purpose:** convert reviewed source identities and controlled official files into governed retrieval catalogues without allowing file acquisition, retrieval or AI to become legal authority

## 1. Pipeline principle

GrowWithHR separates source acquisition from legal interpretation and runtime activation.

```text
Source Register identity
  + exact official bytes where an exact file exists
  + portal/register classification where no stable PDF exists
  + draft/research classification
  + qualified section/source mapping
  + deterministic reason-code scope
  + curated source excerpts
  -> source-pack manifest
  -> validation
  -> exact-file verification
  -> deterministic catalogue compilation
  -> chunk fingerprints
  -> approval/publication gate
  -> governed runtime catalogue
```

The output catalogue is retrieval-only. It does not decide applicability.

## 2. Two fingerprints that must not be confused

### Curated source-identity fingerprint

The validated runtime may already contain a curated source-identity fingerprint that binds the source record used by the catalogue/tests.

### Exact official-file fingerprint

When the actual official PDF/file is controlled, the source team computes SHA-256 and byte length from the stored raw bytes and records the physical PDF page count.

**Do not silently replace one fingerprint type with the other.** A runtime source-manifest/catalogue migration requires its own reviewed change and regression.

## 3. Current exact-file state — 11 August 2026

The canonical Drive `Source Register.xlsx` now contains an `Exact File Reconciliation` sheet.

It currently records:

- 31 exact official PDFs matched to existing Source IDs;
- official-byte SHA-256 values;
- byte lengths;
- physical PDF page counts;
- controlled Drive identity/path information;
- one quarantined duplicate anomaly.

Repository audit bridge:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

The audit record intentionally states:

```text
runtimeMigrationApplied: false
legalReviewStatus: needs-legal-review
```

### Quarantined anomaly

A file labelled as another Maharashtra Shops 2018 Rules copy was found to be byte-identical to the Maharashtra Shops Act. It is quarantined and must not be selected as the controlled Rules source. The intended Rules candidate is recorded separately in the canonical Source Register.

## 4. Remaining portal/register identities

Not every governed source identity should be forced into a PDF model.

Current remaining later-wave portal/register identities include categories such as:

- Ministry labour jurisdiction/notification context;
- Maharashtra labour-service/RTS registers;
- Code on Wages notification register;
- Industrial Relations standing-orders authority notifications;
- DGT apprenticeship overview/designated-trade/optional-trade registers;
- Apprenticeship India portal material.

Each must be explicitly classified as one of:

1. exact file required;
2. official portal/register snapshot required;
3. guidance/context only;
4. research-only/non-runtime;
5. intentionally out of scope.

A web page must not receive a fabricated PDF hash/page count.

## 5. Draft and research source states

Exact bytes do not make a draft instrument operative.

The Maharashtra Shops 2025 draft amendment and the 2026 Maharashtra OSHWC/Industrial Relations draft rules remain draft/non-operative until an exact final instrument is published, acquired and approved.

Wave 5J research sources remain non-runtime until the specialist source/legal/safeguarding gates close.

Wave 5M research/source work is outside the current release because international employment is excluded under #141.

## 6. Builder components

Primary components:

- `growwithhr-rag/source-pack-builder.js` — reusable manifest validator, exact-file verifier, compiler and publication gate;
- `scripts/build-legal-rag-catalog.mjs` — command-line interface;
- `growwithhr-rag/manifests/` and `growwithhr-rag/manifests/candidates/` — governed/candidate manifest records;
- `growwithhr-rag/data/*source-chunks*.json` — compiled governed retrieval catalogues;
- `server-legal-rag-catalogs.js` — effective server catalogue loader;
- `tests/legal-source-pack-builder-checks.mjs` and family suites — architecture/runtime controls.

The builder does not download laws, automatically interpret raw PDFs or infer legal obligations.

## 7. Manifest contract

A publishable source-pack manifest should declare, as applicable:

1. catalogue identity/version and repository output path;
2. controlled source-pack root/path conventions;
3. Source Register IDs;
4. exact official-file path, expected SHA-256, byte length and registered physical page count where an exact file exists;
5. portal/register identity metadata where no exact file exists;
6. curated chunks with source ID, section/page reference, reason-code scope, retrieval terms and exact curated text;
7. chunk-content SHA-256;
8. data/content restrictions;
9. legal/source/section/RAG/test/security/runtime-activation approval state;
10. approver identity/date when a gate is actually approved.

The compiler/verifier must reject unsafe paths, duplicate identifiers, unknown sources, invalid page bounds, empty reason-code mappings, chunk fingerprint drift and unregistered controlled-file mismatches.

## 8. Exact-file verification

Where a manifest uses a controlled exact file, verification must be performed against the local/controlled source-pack export, not against web-rendered text.

The verifier should:

- resolve registered paths only inside the controlled source root;
- compute SHA-256 from raw bytes;
- check byte length;
- reject path escapes;
- detect unexpected/duplicate files according to the family policy;
- bind registered page metadata to the exact reviewed file.

The pipeline does not claim that a web page or OCR result is an exact-file fingerprint.

## 9. Existing commands

The maintained POSH manifest remains a concrete builder/verification example:

```bash
npm run build:legal-rag-catalog:posh
npm run verify:legal-rag-source-pack:posh -- --source-root /absolute/path/to/GrowWithHR-RAG
```

Generic manifest publication command:

```bash
node scripts/build-legal-rag-catalog.mjs \
  --manifest growwithhr-rag/manifests/<law-family>-source-pack.v1.json \
  --publish \
  --source-root /absolute/path/to/<controlled-source-pack>
```

The family Wave suites provide the effective runtime regression for later catalogues.

## 10. Publication/activation gate

Publication/runtime activation must fail unless the required evidence is present.

Depending on the family, the gate includes:

- exact source files verified where required;
- portal/register identities explicitly classified;
- qualified legal review;
- source/section mapping approval;
- assessment fact/privacy approval;
- deterministic rule approval;
- RAG/catalogue/chunk approval;
- test approval;
- security approval;
- runtime activation approval;
- approver identity/date.

An exact-file upload is not a substitute for these approvals.

## 11. Current release migration procedure

For the 11 August release candidate, perform the following controlled migration:

### A. Approve the reconciliation

Review the Drive Exact File Reconciliation sheet and repository reconciliation JSON. Confirm 31 mappings, quarantine state, classifications and fingerprint basis.

### B. Resolve remaining identity classifications

Update #143 with each remaining portal/register identity's required treatment. Do not force portal records into fabricated PDF metadata.

### C. Update source manifests/catalogue metadata

After source/legal/RAG approval, link the approved exact-file evidence into the relevant family source manifests/catalogue metadata while preserving stable Source IDs unless an explicit migration says otherwise.

### D. Preserve legal boundaries

Do not change deterministic reason codes, source scope, draft status or family boundaries unless those changes are separately approved.

All catalogues remain `needs-legal-review` until legal approval is recorded.

### E. Run complete regression

Run the family overlays, catalogue loader, legal-RAG runtime, browser/privacy, M7 and release regression. Confirm the effective invariant remains:

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21
}
```

Wave 5J and Wave 5M must remain non-substantive.

## 12. Wave 5J special source gate

Do not use this pipeline to activate Wave 5J until #139 and #140 close with authorised evidence.

Still required:

- exact Ministry SOP referenced as issued 14 May 2026;
- exact approved/notified 2026–31 Labour Welfare/bonded-labour rehabilitation operational material;
- qualified cross-framework legal mapping;
- safeguarding/privacy/security/State-UT approval.

Research confirmation or secondary descriptions are not a substitute for the exact controlled source files.

## 13. Wave 5M current boundary

Wave 5M is excluded from the current release. Do not create a two-country source pack, country-specific catalogue or cross-border data path during this release cycle.

If international employment is later deliberately brought back into scope, #141 must be reopened and a separate two-jurisdiction source-governance project commissioned.

## 14. Retrieval-adapter boundary

Catalogues produced by this pipeline remain provider-neutral.

Any lexical, vector or hybrid retriever must:

- retrieve only published/governed chunks;
- filter by deterministic Source Register IDs before ranking;
- preserve source/chunk fingerprints and citations;
- return no legal decision authority;
- never fill missing facts or expand scope.

## 15. Release record

The source pipeline is ready for release-candidate review when the exact-file reconciliation is complete and auditable. It is production-ready only after the applicable SOURCE-FILE, LEGAL and RAG decisions are approved under #142 and the resulting runtime migration passes the full release regression.