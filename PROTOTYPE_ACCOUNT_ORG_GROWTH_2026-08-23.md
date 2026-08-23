# GrowWithHR Account + Organization Structure & Growth Prototype

**Status:** Working prototype / development branch only  
**Date:** 23 August 2026  
**Branch:** `prototype/account-org-growth-workflow-v1`  
**Protected recovery baseline:** `baseline/2026-08-23-pre-account-org-growth-upgrade`  
**Baseline commit:** `a84f17a9d800efa8171c01e3e46013b12499b5da`

> This work is intentionally **not** represented as a production-ready or final product release. The existing `main` branch and the protected recovery baselines remain separate. Authentication configuration, database migration, OAuth redirect configuration, security review, staging tests and product acceptance are required before any merge/release decision.

---

## 1. Product direction implemented in this prototype

The account model moves GrowWithHR from a primarily report/recovery-code experience toward:

```text
USER ACCOUNT
   ↓
COMPANY WORKSPACE
   ↓
ASSESSMENTS
   ├─ Compliance Engine
   └─ Organization Structure & Growth Engine
   ↓
AUTO-SAVED DRAFTS
   ↓
REPORTS
   ↓
REASSESS / CONTINUE
```

The previous Report ID + Recovery Code model remains available in the prototype as a **legacy transition path**. It has not been deleted.

### Access policy being prototyped

**Public without an account:**
- Home and marketing/product information
- Sources / methodology
- About / Terms / Privacy / Security information
- Sample reports

**Account required for real company work:**
- Real Compliance assessment
- Real Organization Structure & Growth assessment
- Account-linked autosave
- Resume later
- Account-linked reports
- My GrowWithHR workspace

---

## 2. Authentication prototype

### Implemented interfaces

- Create account with email + password
- Sign in with email + password
- Continue with Google through Supabase OAuth
- Forgot password
- Reset password
- Change password while signed in
- Sign out
- Sign out all sessions
- Permanent account deletion endpoint (prototype; requires staging verification)

### Frontend files

- `auth.html`
- `reset-password.html`
- `account-settings.html`
- `js/auth-client.js`
- `js/auth-page.js`
- `js/reset-password-page.js`
- `js/account-settings.js`
- `js/auth-guard.js`

### Backend files

- `server-auth-config.js`
- `server-account.js`
- `server-entry.js` wiring

The browser receives only the Supabase **anon/public key**. The Supabase service-role key remains server-side.

---

## 3. Supabase prototype data model

Migration:

`supabase/migrations/20260823_account_workspace_prototype.sql`

It introduces prototype tables for:

- `profiles`
- `companies`
- `company_memberships`
- `assessments`
- `reports`

Row Level Security is enabled. Assessment/report policies scope access to `auth.uid() = user_id`. Company access is scoped to the owner in this prototype.

### Important

This migration is **not to be applied to the production database without review**. Apply it first to a development/staging Supabase project and verify all Row Level Security paths using two independent test users.

---

## 4. My GrowWithHR

Prototype page:

`my-growwithhr.html`

It currently provides:

- My Company workspace
- In-progress / completed assessments
- Continue Assessment links
- Account-linked reports
- Account & Security link
- Sign out

The Organization Structure & Growth workflow creates/updates a company workspace once a company name is supplied. The Compliance bridge also attempts to link the assessment to a company workspace when its existing assessment state contains company name information.

---

## 5. Organization Structure & Growth Engine prototype

New guided prototype:

`organization-growth-beta.html`

The existing legacy `organization-intelligence.html` remains in the repository and has not been rewritten as the prototype.

### Pre-assessment experience

Before users enter business information, the page explains:

- this is a thoughtful organization exercise, not a quick org-chart quiz;
- approximately 15–20 minutes is a reasonable first-session expectation;
- the exercise considers both business goals and the people/organization needed to deliver them;
- users can stop and return later;
- progress auto-saves;
- sign-in is required for real company assessments;
- sample reports remain public.

### Seven guided sections

1. **Your Company**
2. **Where You Are Going**
3. **Your Constraints**
4. **Responsibility Concentration**
5. **Management & Structure**
6. **How Work & Decisions Happen**
7. **Review**

### Growth is separated into dimensions

The prototype captures growth through multiple possible vectors rather than assuming headcount growth equals company complexity:

- revenue
- profitability
- employees
- customers
- products / services
- geography
- business lines
- acquisitions

### Constraints are first-class inputs

Examples:

- no additional headcount
- limited additional headcount
- leadership budget constraints
- preference to avoid new layers
- founder involvement preference
- internal talent availability

### Multiple-hat roles

The prototype deliberately does **not** treat one person owning several responsibilities as automatically wrong.

It asks whether the combination is:

- working well;
- starting to feel stretched; or
- already creating bottlenecks.

This allows a combined Product + Engineering role, for example, to be interpreted differently in a small, simple business versus a company with multiple products and fast-growing complexity.

---

## 6. Organization decision engine

Prototype decision layer:

`js/modules/organization/organization-growth-options-engine.mjs`

It is layered on top of the existing deterministic Organization Structure engine instead of replacing it.

### Conceptual workflow

```text
CURRENT COMPANY FACTS
        ↓
EXPECTED GROWTH VECTORS
        ↓
REAL CONSTRAINTS
        ↓
EXISTING DETERMINISTIC STRUCTURE FINDINGS
        ↓
STRUCTURAL PRESSURE MAP
        ↓
CORE ORGANIZATION QUESTION
        ↓
MULTIPLE VIABLE STRUCTURE OPTIONS
        ↓
TRADE-OFF COMPARISON
        ↓
GROWWITHHR SUGGESTED DIRECTION
        ↓
MANAGEMENT CHOICE
        ↓
IMPLEMENTATION PLAN FOR THE CHOSEN DIRECTION
        ↓
FUTURE REVIEW TRIGGERS
```

### Positive developmental language

The prototype uses:

> “Your current structure has supported the company to this point. Based on the growth and constraints you described, some parts may come under increasing pressure and may need to evolve.”

It deliberately avoids judgmental wording such as “your structure is bad.”

### Multiple structural choices

Depending on product/geographic complexity and constraints, examples can include:

- Strengthen the Current Functional Structure
- Functional Structure + Cross-Functional Product Pods
- Functional Structure + Regional Ownership
- Selective Leadership Separation
- Product Divisions + Shared Services
- Regional Divisions + Shared Functions
- Hybrid Divisions + Shared Services

A user with no additional headcount should not simply receive “hire another executive” as the default recommendation. The scoring changes based on stated constraints.

---

## 7. Reference-point governance

Registry:

`js/modules/organization/organization-growth-reference-registry.mjs`

Prototype reference set includes:

- OpenStax organization-design material
- OpenStax span/context material
- BASE-100
- GitLab public organizational handbook as a **company-specific reference point**
- Team Topologies public concepts as conceptual references
- Greiner growth model as a conceptual reference

### Important source boundary

The engine must not say:

> “The source says your company should use this structure.”

The intended distinction is:

```text
SOURCE / FRAMEWORK
supports a principle or public reference point

+ USER'S COMPANY FACTS

+ GROWWITHHR'S DISCLOSED INTERPRETATION

= STRUCTURAL OPTIONS / SUGGESTED DIRECTION
```

GitLab span guidance, for example, is a public company reference, not a universal industry benchmark.

Protected or non-open-license material must be referenced conceptually and not reproduced.

---

## 8. New prototype report

Public sample:

`organization-growth-report-beta.html?sample=1`

Real signed-in report:

`organization-growth-report-beta.html?report=<account-report-id>`

Sections currently include:

- Executive view
- Growth and structural-pressure map
- Core organization question
- External reference points
- Multiple structural options
- Pros / trade-offs / what each option does not solve
- Side-by-side comparison
- GrowWithHR suggested direction
- User-selected direction
- Implementation path for the **user-selected** direction
- What not to change yet
- Future review triggers
- Confidence
- What could change the conclusion
- How GrowWithHR arrived at the options

The user's selection is stored separately from GrowWithHR's suggested direction so the product does not pretend management has accepted the system's recommendation.

---

## 9. Autosave and resume

### Organization Structure & Growth prototype

- Local device draft is retained as a resilience layer.
- Signed-in changes are debounced and written to the account `assessments` table.
- `Save & Exit` performs an explicit save before leaving.
- My GrowWithHR can resume by assessment ID.
- Server/account data is intended to enable cross-device resume once the staging Supabase configuration is applied.

### Compliance bridge

Files:

- `js/compliance-account-bridge.js`
- `js/compliance-report-account-bridge.js`

The existing Compliance engine was **not rewritten**. The prototype bridge wraps its existing browser autosave model and syncs its state to the new account assessment/report store.

The legacy report renderer can restore an account-linked Compliance report into its existing browser report key, preserving the current report format during the prototype.

---

## 10. Sample report policy

Sample reports are deliberately kept public.

Current prototype routes include:

- `sample-advisory-report.html`
- `organization-growth-report-beta.html?sample=1`

The shared account guard explicitly bypasses protection for supported `?sample=1` report views.

---

## 11. Legacy migration path

The older Report ID + Recovery Code experience has not been removed.

`intelligence-hub.html` now places it behind a **Legacy report recovery** disclosure while making My GrowWithHR the prototype primary return path.

Before production migration, decide:

1. how long recovery-code reports remain supported;
2. whether users can import a legacy report into an account;
3. whether the older encrypted Company Workspace and the new account company workspace should be reconciled or remain separate;
4. how retention rules apply to migrated data.

---

## 12. Environment/setup required before the prototype can be exercised end-to-end

### Render / backend

Add to the prototype/staging environment:

```text
SUPABASE_URL=<staging project URL>
SUPABASE_SERVICE_ROLE_KEY=<staging server-only key>
SUPABASE_ANON_KEY=<staging public anon key>
```

Never place `SUPABASE_SERVICE_ROLE_KEY` in HTML or browser JavaScript.

### Supabase

1. Create/use a **staging** Supabase project.
2. Apply `20260823_account_workspace_prototype.sql` only after reviewing it.
3. Enable email/password authentication.
4. Configure email verification behavior.
5. Enable Google as an Auth provider.
6. Add authorized redirect URLs for the prototype host(s), including:
   - `auth.html`
   - `reset-password.html`
7. Verify PKCE redirects in the real browser environment.
8. Test RLS with User A and User B before entering any real business information.

### Google OAuth

Google OAuth client configuration must match the Supabase provider settings and the approved redirect URI supplied by Supabase. Do not guess or hard-code an unverified callback URI.

---

## 13. Security gates before any production merge

Required minimum review:

- [ ] Supabase email/password sign-up works in staging
- [ ] Email verification works
- [ ] Google OAuth works
- [ ] Forgot/reset password works
- [ ] Session persistence works
- [ ] Sign out works
- [ ] Sign out all sessions works
- [ ] User A cannot read/update/delete User B's profile
- [ ] User A cannot read/update/delete User B's company
- [ ] User A cannot read/update/delete User B's assessment
- [ ] User A cannot read/update/delete User B's report
- [ ] Account deletion verifies the caller before admin deletion
- [ ] Service-role key never reaches browser source/network response
- [ ] CORS behavior is reviewed
- [ ] OAuth redirect allowlist is exact
- [ ] Account-linked autosave failure falls back safely
- [ ] Browser-local draft contents are reviewed for sensitivity
- [ ] Retention/deletion language is updated before release
- [ ] Privacy and Terms are updated before release
- [ ] Production Supabase RLS policies are independently reviewed

---

## 14. Prototype contract tests

Test file:

`tests/account-org-growth-prototype-checks.mjs`

Workflow:

`.github/workflows/account-org-growth-prototype.yml`

The checks cover key product and security contracts, including:

- auth options exist;
- sample reports remain public;
- RLS is enabled in the prototype migration;
- seven guided Organization Structure & Growth steps exist;
- growth vectors and constraints are present;
- negative “your structure is bad” language is absent;
- option / implementation / trust features exist;
- service-role key is absent from browser auth code;
- Compliance is bridged into account persistence;
- account deletion verifies the signed-in user first.

These are contract checks, not a penetration test or full end-to-end browser/security test.

---

## 15. What has deliberately NOT been treated as final

- No merge to `main` has been performed.
- The protected 23 August recovery baseline has not been moved.
- The older 21 August baseline has not been moved.
- The prototype Supabase migration has not been applied by this code change.
- Google OAuth has not been claimed to work until the real Supabase/Google provider configuration is completed and tested.
- The prototype source registry has not been treated as a final legal/licensing review.
- The current production Security/Privacy/Terms text has not been silently rewritten as if this architecture were already live.
- The existing Organization Structure report remains available; the new decision report is a parallel prototype.
- The existing Compliance engine/report are wrapped through a compatibility bridge rather than being rewritten.

---

## 16. Recommended next validation sequence

1. Run prototype contract workflow.
2. Review branch diff against `a84f17a9...`.
3. Deploy backend branch to an isolated staging Render service (or equivalent staging environment).
4. Apply migration to staging Supabase only.
5. Configure email/password + Google Auth redirects.
6. Create two staging users.
7. Test account isolation and password flows.
8. Test Organization Structure & Growth autosave across devices.
9. Complete the public sample without sign-in.
10. Test real Organization Structure & Growth report selection and implementation plan.
11. Test Compliance autosave/report bridge under an account.
12. Review mobile/desktop experience.
13. Review source/licensing statements.
14. Review security/privacy/retention wording.
15. Only after acceptance decide what, if anything, should move from prototype into `main`.
