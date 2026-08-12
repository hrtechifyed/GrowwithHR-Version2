# Founder report and report-ID registry

## Purpose

GrowWithHR exposes one founder-facing report format across the website, PDF download and email delivery.

The report is an applicability and growth report. It is not a compliance score, compliance audit, legal opinion or certification that obligations have or have not been completed.

## Single report format

The supported report format is:

- clean white HRTechify presentation;
- one standard PDF only;
- no Light / Dark / Both selector;
- no scorecards or compliance percentages;
- no evidence-upload controls;
- front cover with the HRTechify logo centred;
- end page mirroring the cover with `END OF REPORT`;
- company facts before conclusions;
- deterministic result shown separately from the governed Legal RAG explanation;
- explicit missing-information and growth-reassessment sections.

Both `/api/send-advisory` and `/api/send-advisory-v2` are intercepted by the single-report delivery handler and reject requests containing more than one PDF or a dark report variant.

## Founder-facing result language

The report uses these states:

- `Relevant now` — the deterministic result is currently `Applicable` based on supplied company facts.
- `Review needed` — the deterministic result is `Review required` and needs a legal/jurisdiction confirmation before a stronger conclusion.
- `More information required` — one or more required company facts are missing.
- `Watch as you grow` — the area is not currently triggered but should be reassessed after a relevant company change.

These states describe applicability. They do not describe whether the organisation has already implemented an obligation.

## Report ID format

Every generated PDF must reserve a server-issued report ID before PDF rendering begins.

Format:

```text
GWHR-{YYYY}-{MMDD}-{SEQUENCE}
```

The sequence is global and never resets when the date changes.

Initial range:

```text
AA01 ... AA99
AB01 ... AB99
...
ZZ01 ... ZZ99
```

After `ZZ99`, the sequence expands symmetrically:

```text
ZZ99 -> AAA001
...
ZZZ999 -> AAAA0001
```

The same rule continues by adding one letter and one digit whenever the current namespace is exhausted.

Example:

```text
GWHR-2027-0412-ZZ99
GWHR-2027-0412-AAA001
GWHR-2027-0413-AAA002
```

The date is the report-generation date in `Asia/Kolkata`. It is not part of the uniqueness counter.

## Registry guarantees

`server-report-id-registry.js`:

- allocates the next global sequence;
- persists every issued report ID;
- never deliberately recycles an issued ID;
- stores only SHA-256 hashes of user/company/assessment identifiers in the registry;
- uses an idempotency request key so a retried allocation request can return the same reservation;
- uses a filesystem lock plus atomic rename to protect concurrent allocations on a shared filesystem;
- refuses allocation if it detects a duplicate ID.

A report is rendered only after the browser receives a reserved ID from `/api/report-id`.

## Production persistence requirement

The registry must be stored on persistent server storage. Configure:

```text
REPORT_ID_REGISTRY_FILE=/var/data/growwithhr/report-id-registry.json
```

The exact path may differ by deployment, but it must point to a persistent disk/volume that survives process restarts and deployments.

If `REPORT_ID_REGISTRY_FILE` is not configured, the server falls back to:

```text
data/runtime/report-id-registry.json
```

That fallback is suitable for local/prototype runtime testing but **does not provide a cross-deployment uniqueness guarantee on an ephemeral filesystem**.

The server returns `durableStorageConfigured` in `/api/report-id` and `/api/report-id/status` responses so deployment smoke tests can confirm the durable registry is configured.

## Report identity lifecycle

1. The browser requests an ID from `POST /api/report-id`.
2. The server acquires the registry lock.
3. The next sequence is reserved and persisted.
4. The server returns the report ID and generated timestamp.
5. The PDF is rendered with that ID in the report body/footer and filename.
6. The same generated PDF is used for download/email delivery.

If a report is regenerated, it receives a new report ID. An issued ID is not returned to the pool for another user/report.

## Report trust boundaries

The report retains the research-prototype governance posture:

- `sourceAuthority: secondary-research`
- `verificationStatus: prototype-researched`
- `legalReviewStatus: needs-legal-review`
- `usedForDecision: false`
- `applicabilityAuthority: none`

The deterministic compliance engine produces applicability. Legal RAG provides governed explanation and source context after the decision.

## Scope boundary

The current founder report does not claim to assess:

- whether each applicable requirement has already been completed;
- whether implementation/evidence is legally sufficient;
- payroll contribution arithmetic;
- individual claims, disputes or entitlements;
- live safeguarding investigations;
- international / multi-country employment (Wave 5M);
- legal advice or compliance certification.
