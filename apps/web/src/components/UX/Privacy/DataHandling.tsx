/**
 * DataHandling gives respondents explicit storage, sharing, and lead visibility rules.
 * @returns A responsive transparency panel.
 * @example <DataHandling compact />
 */
export function DataHandling({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="gwhr-data" aria-label="How your information is handled">
      <style>{`.gwhr-data{display:grid;gap:1rem;border-radius:22px;background:#f8fbff;border:1px solid #dbe7ff;padding:1rem;color:#24364b}.gwhr-data-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.75rem}.gwhr-data-card{border-radius:18px;background:white;padding:1rem;box-shadow:0 8px 30px rgba(15,23,42,.06)}.gwhr-data strong{color:#102033}`}</style>
      <h3>How your data is stored and used</h3>
      <p><strong>Current build:</strong> everything lives client-side in your browser. HRTechify does not receive a dashboard, CRM export, or admin list from this assessment unless a future integration is explicitly enabled and disclosed.</p>
      {!compact && <p><strong>Optional future storage:</strong> if remote save is enabled later, the preferred destination is HRTechify's own Google Drive folder. That would require clear consent before any transfer.</p>}
      <div className="gwhr-data-grid">
        <div className="gwhr-data-card"><strong>Browser save</strong><br />Progress can be saved in localStorage for convenience and cleared by you at any time.</div>
        <div className="gwhr-data-card"><strong>Email link</strong><br />The current implementation creates a resume URL locally. It does not send email by itself.</div>
        <div className="gwhr-data-card"><strong>Privacy</strong><br />Your headcount, funding, hiring, and expansion details are never sold or shared from this client-side build.</div>
        <div className="gwhr-data-card"><strong>GDPR-style rights</strong><br />Access, correction, deletion, and withdrawal requests should be honored before any future remote storage launch.</div>
      </div>
    </aside>
  );
}
