# GrowWithHR v0.11.0-beta

Codename: Executive Assessment UX Layer

---

## Overview

This release updates the documentation and codebase direction around a new modular executive assessment UX layer. The new layer introduces animated scenes, a wizard-style flow, explicit privacy notices, current-tab state management, and a deterministic personalized report generator.

The most important product decision in this release is that the current assessment does **not** store user data anywhere.

---

## Highlights

### Animated Executive Assessment Intro

The new assessment starts with short, sequential text beats rather than a static paragraph. The user sees a guided executive introduction before moving into the assessment form.

### Wizard-Style Assessment Flow

The new `WizardForm` component separates the flow into scenes:

1. Welcome and animated introduction.
2. Company context questions.
3. Contact capture for the open tab only.
4. Personalized advisory report.

### No-Storage Data Policy

The current build uses open-tab memory only.

- No localStorage.
- No sessionStorage.
- No cookies.
- No backend database.
- No Google Drive upload.
- No CRM export.
- No HRTechify admin dashboard.
- No email delivery.
- No cross-device resume link.

If a user leaves midway, refreshes, closes the tab, or switches devices, they must start fresh.

### Personalized Report Generator

The report generator creates a rules-based advisory using the user's company context. It includes:

- Company-specific summary.
- Risk level.
- Maturity score.
- Operating archetype.
- Directional benchmark language.
- CFO and HR viewpoints.
- Priority actions.

### Privacy and Trust Signaling

Privacy notices now appear directly near sensitive assessment areas and in a dedicated privacy component. The copy clearly explains what is and is not stored.

### Visual Consistency

The new UX components use the same font family as the advisory dashboard: `Inter`, `Segoe UI`, `sans-serif`.

---

## Current Beta Scope

Included:

- Static landing and advisory pages from the existing prototype.
- New React/TypeScript assessment UX components.
- Current-tab-only state management.
- No-storage privacy messaging.
- Rules-based personalized report generation.
- Unit-test examples for key UX behavior.

Not included:

- Production backend.
- Persistent user accounts.
- Saved reports.
- Save-and-resume.
- Admin dashboards.
- CRM/email/Google Drive integrations.

---

## Next Release Focus

The next release should focus on integration quality:

- Wire the React UX layer into a runnable application shell.
- Add a confirmed test/build toolchain with lockfile.
- Replace static examples with live routes.
- Decide whether future storage is required and document consent requirements before implementation.
