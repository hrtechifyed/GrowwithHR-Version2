# GrowWithHR Architecture

> Last Updated: July 2026

---

## Overview

GrowWithHR currently combines two layers:

1. The original static HTML/CSS/JavaScript prototype.
2. A new React/Next.js-ready TypeScript UX layer under `apps/web/src`.

The new UX layer is intended to improve separation of concerns, accessibility, privacy messaging, and future maintainability without changing the current no-storage product policy.

---

## Current Data Architecture

The current assessment is **client-side only and no-storage**.

```text
Open Browser Tab
    │
    ▼
React/Zustand in-memory state
    │
    ├── Assessment inputs
    ├── Contact fields
    └── Generated report

No persistence layer is connected.
```

Data is not written to:

- localStorage.
- sessionStorage.
- Cookies.
- Backend APIs.
- Databases.
- Google Drive.
- CRM systems.
- Email systems.
- HRTechify admin dashboards.

If the user refreshes, closes the tab, navigates away, or switches devices, the assessment starts fresh.

---

## High-Level UX Flow

```text
Start Executive Assessment
        │
        ▼
Animated intro beats
        │
        ▼
Company context wizard
        │
        ▼
Current-tab-only contact capture
        │
        ▼
Rules-based personalized advisory report
```

---

## Core Frontend Layers

### 1. Static Prototype Layer

Location: repository root HTML/CSS/JS files.

Responsibilities:

- Existing landing pages.
- Existing advisory dashboard page.
- Existing static assets and JSON data.
- Current visual identity and glassmorphism system.

### 2. New UX Component Layer

Location: `apps/web/src/components/UX`.

Responsibilities:

- Animated executive intro.
- Scene transitions.
- Wizard-style assessment.
- Contact capture.
- Privacy and data-handling UI.
- Personalized report rendering.

### 3. State Layer

Location: `apps/web/src/stores/assessmentStore.ts`.

Responsibilities:

- Holds assessment answers in current-tab memory.
- Holds contact fields in current-tab memory.
- Holds generated report data in current-tab memory.
- Validates required fields.

### 4. Service Layer

Location: `apps/web/src/services/sessionPersistenceService.ts`.

Responsibilities:

- Documents and enforces no persistent storage.
- Allows temporary current-tab memory snapshots only.
- Rejects remote storage attempts.

### 5. Type Layer

Location: `apps/web/src/types/uiTypes.ts`.

Responsibilities:

- Defines assessment input types.
- Defines contact data types.
- Defines report output types.
- Defines UI state types.

---

## Design System Alignment

The new UX layer uses the advisory dashboard typography stack:

```css
font-family: "Inter", "Segoe UI", sans-serif;
```

Components also preserve the premium, glass-like visual direction through rounded cards, soft shadows, calm colors, and responsive layouts.

---

## Future Architecture Considerations

Any future persistence feature must be designed as a separate, consent-based architecture decision. This includes:

- Save-and-resume.
- Email delivery.
- Google Drive storage.
- CRM export.
- Admin dashboard.
- User accounts.
- Saved reports.

Until those features are explicitly implemented and documented, the architecture remains open-tab memory only.
