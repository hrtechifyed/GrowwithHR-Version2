/**
 * DataHandling gives respondents explicit no-storage, no-sharing, and no-resume rules.
 * @returns A responsive transparency panel using the advisory dashboard font stack.
 * @example <DataHandling compact />
 */
export function DataHandling({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="gwhr-data" aria-label="How your information is handled">
      <style>{`.gwhr-data{display:grid;gap:1rem;border-radius:22px;background:#f8fbff;border:1px solid #dbe7ff;padding:1rem;color:#24364b;font-family:"Inter","Segoe UI",sans-serif}.gwhr-data-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.75rem}.gwhr-data-card{border-radius:18px;background:white;padding:1rem;box-shadow:0 8px 30px rgba(15,23,42,.06)}.gwhr-data strong{color:#102033}`}</style>
      <h3>How your data is handled</h3>
      <p><strong>No storage:</strong> your answers live only in this open browser tab while you complete the assessment. We do not save them in localStorage, sessionStorage, cookies, a server, CRM, admin dashboard, email tool, or Google Drive.</p>
      <p><strong>Important:</strong> if you leave midway, refresh, close the tab, or switch devices, you will need to start fresh because we intentionally do not store progress.</p>
      {!compact && <p><strong>Future integrations:</strong> if HRTechify later chooses Google Drive or any other storage location, the site must ask for explicit consent and describe exactly where the data goes before anything is sent.</p>}
      <div className="gwhr-data-grid">
        <div className="gwhr-data-card"><strong>Current tab only</strong><br />Information is held in React state for the active page session only.</div>
        <div className="gwhr-data-card"><strong>No resume link</strong><br />Save-and-resume is disabled because it would require storing an identifier or answers.</div>
        <div className="gwhr-data-card"><strong>No sharing</strong><br />Your headcount, funding, hiring, and expansion details are not sold, shared, exported, or monitored.</div>
        <div className="gwhr-data-card"><strong>Privacy-first</strong><br />There is no hidden HRTechify admin side in this client-side implementation.</div>
      </div>
    </aside>
  );
}
