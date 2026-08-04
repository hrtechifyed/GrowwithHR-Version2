# Legal RAG source-pack build pipeline

## Purpose

This pipeline turns a reviewed, curated legal source-pack manifest into the governed chunk-catalogue format consumed by the shared legal RAG runtime.

It does not download laws, extract text automatically, infer section boundaries, interpret legal duties, determine applicability, or approve a feature. Those decisions remain external governance and qualified-review activities.

## Architecture

```text
controlled official PDFs
  + Source Register identities and hashes
  + approved section mappings
  + curated official-source excerpts
  + deterministic reason-code mappings
  -> source-pack manifest
  -> manifest validation
  -> exact-file SHA-256 and byte-length verification
  -> unregistered-PDF rejection
  -> deterministic catalogue compilation
  -> chunk SHA-256 fingerprints
  -> publication approval gate
  -> governed retrieval catalogue
```

The output catalogue is retrieval-only. Deterministic legal rules remain the only applicability authority.

## Files

- `growwithhr-rag/source-pack-builder.js` — reusable validator, compiler, verifier and publication gate.
- `scripts/build-legal-rag-catalog.mjs` — command-line interface.
- `growwithhr-rag/manifests/posh-source-pack.v1.json` — the first governed manifest.
- `growwithhr-rag/data/posh-source-chunks.v1.json` — current compiled POSH catalogue.
- `tests/legal-source-pack-builder-checks.mjs` — architecture and safety contracts.

## Manifest contract

A source-pack manifest declares:

1. Catalogue metadata and the repository output path.
2. The controlled source-pack root and active official-source folder.
3. Source Register IDs, official URLs, controlled paths, expected SHA-256 values, byte lengths and registered page counts.
4. Curated chunks with source ID, section reference, page range, deterministic reason codes, governed retrieval terms and exact curated text.
5. An expected SHA-256 for every curated chunk.
6. Content-policy restrictions excluding raw assessment answers, personal data, complaint case content and evidence bodies.
7. Publication state, legal-review status, RAG approval, source approval, section-mapping approval and runtime-activation approval.

The compiler rejects duplicate identifiers, unknown sources, unsafe paths, out-of-range pages, empty reason-code mappings and curated-text fingerprint drift.

## Commands

### Compile and compare without Drive access

```bash
npm run build:legal-rag-catalog:posh
```

This validates the manifest, compiles the catalogue in memory and confirms that it exactly reproduces the checked-in catalogue. It does not read the controlled PDFs and does not publish changes.

### Verify the controlled source pack

```bash
npm run verify:legal-rag-source-pack:posh -- --source-root /absolute/path/to/GrowWithHR-RAG
```

The verifier:

- resolves every registered controlled path inside the supplied root;
- checks exact byte length;
- computes and checks SHA-256;
- rejects registered-path escapes;
- rejects any additional PDF in the active official folder;
- returns a verification fingerprint for the approved set of exact source files.

The registered page count is used to validate curated chunk bounds. The pipeline does not claim that it independently parses or interprets PDF pagination; exact-file hashes bind the registered pagination metadata to the controlled file reviewed by humans.

### Publish

```bash
node scripts/build-legal-rag-catalog.mjs \
  --manifest growwithhr-rag/manifests/<law-family>-source-pack.v1.json \
  --publish \
  --source-root /absolute/path/to/<controlled-source-pack>
```

Publication fails unless all of the following are present:

- a successful exact-file verification result;
- `status: approved-for-publication`;
- qualified legal review marked `approved` or `approved-with-conditions`;
- RAG approval;
- source-file approval;
- section-mapping approval;
- runtime-activation approval;
- approver identity and approval date.

The current POSH manifest intentionally fails this publication gate because it remains `needs-legal-review`, `not-approved`, and blocked from runtime activation.

## Onboarding another law family

For each new feature family:

1. Create or update the controlled Source Register.
2. Verify official source files and record exact hashes, byte lengths and page counts.
3. Complete section mapping and legal review.
4. Curate the minimum official-source excerpts needed to explain existing deterministic reason codes.
5. Create a manifest under `growwithhr-rag/manifests/`.
6. Add a compile-and-compare test.
7. Verify the controlled source folder.
8. Obtain explicit legal, RAG and runtime approvals.
9. Publish the catalogue.
10. Point the existing legal RAG profile to the published catalogue and activate it in a separate reviewed change.

## Retrieval-adapter boundary

This pipeline produces provider-neutral governed catalogues. The next architecture layer may add lexical, vector or hybrid retrieval adapters, but every adapter must:

- use only published catalogue chunks;
- filter by the deterministic decision's Source Register IDs before ranking;
- preserve exact chunk and source fingerprints;
- return the same citation contract;
- remain unable to fill missing facts or alter applicability.
