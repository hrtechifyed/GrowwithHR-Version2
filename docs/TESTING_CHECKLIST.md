# GrowWithHR Testing Checklist

## Automated release checks

- `npm run version:check`
- `npm run validate:compliance`
- `npm test`
- `npm run test:release:e2e`

## Client-readiness checks

- Homepage navigation and capability carousel.
- Stable assessment first viewport, clean start, complete journey, review and save/resume.
- PDF generation and download.
- Backend `/api/health` without secret values.
- `/api/send-advisory` validation and throttling.
- Sample report wording and layout.
- Chromium, WebKit and mobile emulation.
- Physical mobile and real Safari manual pass.
- Console free of unexplained warnings/errors.
- Rotated deployment credentials and monitored notification/reply-to addresses.
