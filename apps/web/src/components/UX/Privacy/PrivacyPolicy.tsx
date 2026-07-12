import { DataHandling } from './DataHandling';

/**
 * PrivacyPolicy is a plain-language trust page for sensitive executive questions.
 * @returns Full privacy, GDPR-style rights, retention, and no-sharing language.
 * @example <PrivacyPolicy />
 */
export function PrivacyPolicy() {
  return (
    <main className="gwhr-privacy">
      <style>{`.gwhr-privacy{max-width:980px;margin:auto;padding:clamp(1rem,4vw,3rem);line-height:1.65;color:#24364b;font-family:"Inter","Segoe UI",sans-serif}.gwhr-privacy h1,.gwhr-privacy h2{color:#102033}.gwhr-table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:18px}.gwhr-table th,.gwhr-table td{border:1px solid #dbe7ff;padding:.85rem;text-align:left}.gwhr-table th{background:#eef5ff}@media(max-width:640px){.gwhr-table{display:block;overflow-x:auto}}`}</style>
      <h1>Privacy and data handling for the Executive Assessment</h1>
      <p>We ask for business context so the advisory can be specific. In this client-side version, that information stays only in the open browser tab. If you leave, refresh, or close the tab, you must start fresh because we do not store progress anywhere.</p>
      <DataHandling />
      <h2>Retention rules</h2>
      <table className="gwhr-table"><thead><tr><th>Data</th><th>Where it lives now</th><th>Retention</th></tr></thead><tbody><tr><td>Assessment answers</td><td>Open browser tab memory only</td><td>Lost on refresh, close, navigation away, or device switch</td></tr><tr><td>Contact fields</td><td>Open browser tab memory only</td><td>Lost on refresh, close, navigation away, or device switch</td></tr><tr><td>Remote copies</td><td>Not enabled</td><td>Not applicable</td></tr></tbody></table>
      <h2>Commitments</h2>
      <ul><li>No selling or sharing of company details.</li><li>No hidden admin dashboard in this implementation.</li><li>No differentiation or authority framing; benchmarks are directional and rules-based.</li><li>GDPR-style rights should apply before any future remote storage is enabled.</li></ul>
    </main>
  );
}
