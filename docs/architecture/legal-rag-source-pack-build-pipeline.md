# Legal RAG source-pack build, research-provenance and exact-file pipeline

**Updated:** 11 August 2026  
**Release baseline:** v0.20.3-prototype.1  
**Purpose:** convert controlled research/source identities into governed retrieval catalogues without allowing source acquisition, retrieval or AI to become legal authority

## 1. Pipeline principle

GrowWithHR separates research provenance, source-file assurance, legal interpretation and runtime activation.

For the current research-grade prototype, **structured secondary research with controlled provenance is an accepted source basis**. Exact official-file verification remains supplementary assurance and a future production-hardening control unless a particular catalogue explicitly requires an exact file.

```text
Source Register identity
  + controlled secondary-research provenance
  + exact-file evidence where available/required
  + portal/register classification where no stable PDF exists
  + draft/guidance/research classification
  + deterministic reason-code scope
  + curated source excerpts
  -> source-pack manifest
  -> validation
  -> exact-file verification when configured
  -> deterministic catalogue compilation
  -> chunk fingerprints
  -> prototype publication gate
  -> governed runtime catalogue
```

The output catalogue is retrieval-only. It does not decide applicability.

## 2. Source evidence types that must not be confused

### Runtime source-identity fingerprint

The validated runtime contains stable source identities/fingerprints that bind the source records used by the catalogue and tests.

### Secondary-research provenance

For the current prototype, controlled secondary research may support the source identity and curated catalogue content. It must be labelled as research provenance and must not be described as an exact official-file fingerprint or counsel approval.

### Exact-file fingerprint

When actual file bytes are controlled, SHA-256 and byte length may be calculated from those stored bytes and the physical PDF page count recorded.

**Do not silently replace one evidence type with another.** Any future runtime migration from validated source identities to exact-file fingerprints requires a separately reviewed change and regression.

## 3. Supplementary exact-file state — 11 August 2026

The canonical Drive `Source Register.xlsx` contains an `Exact File Reconciliation` sheet recording:

- 31 acquired files matched to existing Source IDs;
- file-byte SHA-256 values;
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

For `v0.20.3-prototype.1`, this exact-file evidence is **supplementary and non-blocking**. No runtime migration to these file hashes is required before prototype release.

### Quarantined anomaly

A file labelled as another Maharashtra Shops 2018 Rules copy was found to be byte-identical to the Maharashtra Shops Act. It is quarantined and must not be selected as the Rules source. The intended Rules candidate is recorded separately in the Source Register.

## 4. Portal/register and research identities

Not every governed source identity should be forced into a PDF model.

A source identity may be explicitly classified as:

1. exact controlled file;
2. official portal/register snapshot;
3. guidance/context;
4. structured secondary research;
5. research-only/non-runtime;
6. intentionally out of scope.

A web page must not receive a fabricated PDF hash/page count. Secondary research must not be labelled official or counsel-approved.

## 5. Draft and research source states

Exact bytes do not make a draft instrument operative, and secondary research does not promote an uncertain instrument to final law.

Material classified as draft remains draft/non-operative until its status is deliberately changed with evidence. Retrieval must not upgrade draft/research material into operative law.

Wave 5J remains non-runtime and safeguarding-first. Wave 5M source work remains outside this release because international employment is excluded under #141.

## 6. Builder components

Primary components:

- `growwithhr-rag/source-pack-builder.js` — reusable manifest validator, exact-file verifier where configured, compiler and publication gate;
- `scripts/build-legal-rag-catalog.mjs` — command-line interface;
- `growwithhr-rag/manifests/` and `growwithhr-rag/manifests/candidates/` — governed/candidate manifest records;
- `growwithhr-rag/data/*source-chunks*.json` — compiled governed retrieval catalogues;
- `server-legal-rag-catalogs.js` — effective server catalogue loader;
- `tests/legal-source-pack-builder-checks.mjs` and family suites — architecture/runtime controls.

The builder does not download laws, automatically interpret raw PDFs or infer legal obligations.

## 7. Manifest contract

A prototype source-pack manifest should declare, as applicable:

1. catalogue identity/version and repository output path;
2. Source Register IDs;
3. source authority/provenance classification;
4. controlled research/source references;
5. exact-file path/hash/byte length/page count only where exact-file verification is configured;
6. portal/register identity metadata where no exact file exists;
7. curated chunks with source ID, section/page/reference, reason-code scope, retrieval terms and curated text;
8. chunk-content SHA-256;
9. data/content restrictions;
10. legal-review/prototype limitation state;
11. any future production approval metadata only when such approval actually exists.

The compiler/verifier must reject unsafe paths, duplicate identifiers, unknown sources, invalid configured page bounds, empty reason-code mappings, chunk fingerprint drift and registered controlled-file mismatches.

## 8. Exact-file verification

Where a manifest explicitly uses a controlled exact file, verification must be performed against the controlled source-pack export, not against web-rendered text.

The verifier should:

- resolve registered paths only inside the controlled source root;
- compute SHA-256 from raw bytes;
- check byte length;
- reject path escapes;
- detect unexpected/duplicate files according to the family policy;
- bind registered page metadata to the reviewed file.

The pipeline does not claim that a web page, OCR result or secondary-research note is an exact-file fingerprint.

## 9. Existing commands

The maintained POSH manifest remains a concrete builder/verification example:

```bash
npm run build:legal-rag-catalog:posh
npm run verify:legal-rag-source-pack:posh -- --source-root /absolute/path/to/GrowWithHR-RAG
```

Generic publication command where the manifest requires a controlled source root:

```bash
node scripts/build-legal-rag-catalog.mjs \
  --manifest growwithhr-rag/manifests/<law-family>-source-pack.v1.json \
  --publish \
  --source-root /absolute/path/to/<controlled-source-pack>
```

The family Wave suites provide the effective runtime regression for later catalogues.

## 10. Prototype publication gate

Prototype publication must fail unless the required **prototype** evidence is present:

- source/provenance classifications are explicit;
- secondary-research material is not misrepresented as official/counsel approved;
- exact files verify where the specific manifest requires them;
- draft/research classifications are preserved;
- active legal catalogues remain `needs-legal-review`;
- deterministic reason-code/source scope is valid;
- RAG/catalogue/chunk tests pass;
- privacy/security/fail-closed runtime boundaries pass;
- Wave 5J and Wave 5M remain non-substantive.

Formal qualified legal/source/security approvals are **future production-hardening controls**, not prerequisites for the clearly labelled research prototype.

## 11. Current prototype release procedure

For `v0.20.3-prototype.1`:

### A. Preserve the research basis

Keep structured secondary research and its provenance auditable in the Source Register/catalogue records. Do not claim counsel or official-file verification where it does not exist.

### B. Retain supplementary exact-file evidence

Keep the 31-file reconciliation as audit evidence. Do not silently replace validated runtime identity fingerprints with those file hashes.

### C. Preserve legal boundaries

Do not change deterministic reason codes, source scope, draft status or family boundaries merely to publish the prototype. All catalogues remain `needs-legal-review`.

### D. Run complete regression

Run the family overlays, catalogue loader, Legal RAG runtime, browser/privacy, M7 and release regression. Confirm:

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21
}
```

Wave 5J and Wave 5M must remain non-substantive.

### E. Publish as prerelease

Tag only the exact validated SHA and publish as `v0.20.3-prototype.1` with GitHub **Pre-release** enabled and no production/legal-certification claim.

## 12. Wave 5J special boundary

Do not use this pipeline to activate Wave 5J in the prototype. #139/#140 remain a future activation/hardening programme.

Live coercion, trafficking, confinement, violence, retaliation, rescue or similar safeguarding concerns must remain human-only and outside normal RAG/provider handling.

## 13. Wave 5M current boundary

Wave 5M is excluded from the current release. Do not create a two-country source pack, country-specific catalogue or cross-border data path during this release cycle.

If international employment is later deliberately brought back into scope, #141 must be reopened and a separate two-jurisdiction programme commissioned.

## 14. Retrieval-adapter boundary

Catalogues produced by this pipeline remain provider-neutral.

Any lexical, vector or hybrid retriever must:

- retrieve only governed chunks;
- filter by deterministic Source Register IDs before ranking;
- preserve source/chunk fingerprints and citations;
- return no legal decision authority;
- never fill missing facts or expand scope.

## 15. Production-hardening path

Issue #143 tracks future exact official-source assurance and portal/register classification. Issue #142 tracks future production-grade Legal/Privacy/RAG/Source/Security/Release certification.

Those programmes may later require exact-file migration, qualified source/section mapping and authorised approvals before the product is represented as production-grade legal/compliance certification. They do **not** block the explicitly labelled research-grade prototype.