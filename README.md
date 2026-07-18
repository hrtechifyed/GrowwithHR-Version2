# GrowWithHR v0.15.0-beta

**GrowWithHR** is an executive HR intelligence and advisory prototype developed under the HRTechify brand.

It helps founders, business leaders and HR professionals explore company context, statutory compliance, people-governance priorities and growth readiness through structured assessments and explainable recommendations.

The repository contains:

- The deployed static HTML, CSS and JavaScript experience.
- A Node.js and Express backend for secure advisory email delivery.
- PDF advisory report generation.
- Gmail API integration using Google OAuth 2.0.
- An experimental React/Next.js-ready assessment UX layer under `apps/web/src`.

---

## Executive Advisory Experience

The current GrowWithHR experience guides users through an executive-style company assessment covering business context, workforce structure, operating footprint and growth plans.

The experience includes:

- A branded executive advisory introduction.
- A guided multi-stage assessment.
- Company and workforce context questions.
- Compliance and growth-readiness analysis.
- A review step before report generation.
- A personalised advisory PDF.
- Secure report delivery by email.
- Internal lead notification for completed assessments.
- Responsive layouts for desktop, laptop, tablet and mobile devices.

The experience uses deterministic, rules-based recommendations rather than presenting generated output as legal or professional advice.

---

## Advisory Email Delivery

GrowWithHR now includes backend email delivery through the Gmail API.

When a user completes the assessment:

1. The advisory report is generated as a PDF in the browser.
2. The report and required recipient information are sent to the GrowWithHR backend over HTTPS.
3. The backend validates the request and PDF attachment.
4. The customer receives a branded HTML email with the PDF attached.
5. A plain-text email version is included for compatibility.
6. An internal assessment notification may also be sent to the configured HRTechify email address.

The email template includes:

- A personalised greeting.
- The recipient’s company name.
- A summary of what the report contains.
- A PDF attachment notice.
- A reply-to contact option.
- HRTechify branding.
- A compact centred HRTechify logo bar.
- The tagline:

  **People • Technology • Growth**

Email delivery uses Google OAuth 2.0 and the Gmail API over HTTPS. SMTP and Gmail App Password delivery are no longer used.

---

## Current Data and Privacy Approach

The current implementation does not use a dedicated assessment database.

Assessment information is primarily handled in the browser while the user completes the experience. The assessment interface may retain limited progress in the same browser to support resume behaviour.

When the user requests delivery of the advisory report, the information required to prepare and send the email is transmitted to the GrowWithHR backend.

The backend:

- Processes the request for email delivery.
- Validates the recipient address and PDF.
- Does not intentionally save assessment answers to a GrowWithHR database.
- Sends the report through the Gmail API.
- May write non-sensitive delivery status information to application logs.

The sent email and PDF attachment are retained in Gmail according to the configuration and retention settings of the connected Gmail account.

GrowWithHR currently does not provide:

- User accounts.
- Cloud-based saved assessments.
- Cross-device resume links.
- A persistent report database.
- A customer portal.
- Automated deletion controls for sent Gmail messages.

Any future database, CRM, analytics, Google Drive or customer-account integration must be introduced deliberately with updated privacy notices and appropriate user consent.

---

## Key Features

- Company DNA assessment concept.
- Executive Intelligence Core.
- Compliance and growth-readiness framing.
- Official source mapping.
- Guided executive assessment flow.
- Browser-based progress and review experience.
- Contact and report-delivery form.
- Rules-based personalised advisory generator.
- PDF report generation.
- Gmail API email delivery.
- Customer report attachment.
- Internal lead notifications.
- Plain-text and HTML email versions.
- Email request rate limiting.
- Backend health-check endpoint.
- Responsive HRTechify-branded interface.
- Shared header and footer across public pages.
- Accessibility and reduced-motion considerations.

---

## Assessment Framework

The assessment is organised around company context that may affect people, compliance and growth-readiness decisions.

### 1. Company profile

- Organisation name.
- Industry.
- Business stage.
- Entity and operating context.

### 2. Workforce context

- Current employee population.
- Workforce structure.
- Working model.
- People-management readiness.

### 3. Operating footprint

- State or regional presence.
- Office, remote or hybrid arrangements.
- Expansion context.
- Potential compliance complexity.

### 4. Growth plans

- Hiring plans.
- Funding or expansion signals.
- Leadership priorities.
- People and compliance readiness.

The advisory engine uses these inputs to produce structured outputs such as:

- Priority areas.
- Compliance observations.
- Maturity indicators.
- Leadership considerations.
- Recommended next steps.

---

## Current Technology Stack

### Frontend

- HTML5.
- CSS3.
- JavaScript.
- Static JSON data.
- Responsive component styling.
- Browser-side PDF generation.

### Backend

- Node.js.
- Express.
- Gmail API.
- Google OAuth 2.0.
- `googleapis`.
- `express-rate-limit`.
- Environment-variable configuration.

### Deployment

- GitHub repository.
- Render web service.
- HTTPS API communication.
- Render environment variables for private OAuth credentials.

### Experimental UX layer

- React/Next.js-ready TypeScript components.
- Zustand state management.
- Component-scoped responsive CSS.
- Jest and Testing Library examples.

---

## Important Application Files

```text
/
├── server.js
├── package.json
├── analyze-company.html
├── assessment.html
├── advisory-dashboard.html
├── sample-advisory-report.html
├── official-resources.html
├── more-info.html
│
├── js/
│   ├── executive-assessment.js
│   ├── gmail-service.js
│   ├── pdf.js
│   ├── site-shell.js
│   └── config/
│       └── app-config.js
│
├── css/
│   ├── 17-advisory-briefing.css
│   └── 18-site-shell.css
│
├── assets/
│   └── hrtechify-logo.png
│
└── apps/
    └── web/
        └── src/
