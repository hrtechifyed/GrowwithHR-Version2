'use client';

import { useState } from 'react';
import { useAssessmentStore } from '../../../stores/assessmentStore';
import type { LeadCaptureData } from '../../../types/uiTypes';
import { DataHandling } from '../Privacy/DataHandling';

export interface LeadCaptureFormProps { onSuccess?: (lead: LeadCaptureData) => void; }

/**
 * Contact-capture form for sending or following up on the advisory.
 * @param props - Success callback invoked after validation.
 * @returns Accessible form with validation, privacy copy, loading and success states.
 * @example <LeadCaptureForm onSuccess={(lead) => console.log(lead.email)} />
 */
export function LeadCaptureForm({ onSuccess }: LeadCaptureFormProps) {
  const { leadData, updateLeadData, validateLead, issues } = useAssessmentStore();
  const [isSubmitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const issueFor = (field: string) => issues.find((issue) => issue.field === field)?.message;

  const submit = async () => {
    if (!validateLead()) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setSubmitting(false);
    setSent(true);
    onSuccess?.(leadData as LeadCaptureData);
  };

  return (
    <form className="gwhr-lead" aria-label="Contact details for advisory delivery" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <style>{`.gwhr-lead{display:grid;gap:1rem}.gwhr-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.gwhr-field{display:grid;gap:.35rem}.gwhr-field input{min-height:44px;border:1px solid #c9d7ee;border-radius:14px;padding:.75rem 1rem;font:inherit}.gwhr-error{color:#b42318;font-size:.9rem}.gwhr-submit{min-height:48px;border:0;border-radius:999px;background:#102033;color:white;padding:.85rem 1.2rem;font-weight:700}.gwhr-success{border-radius:16px;background:#ecfdf3;color:#067647;padding:1rem}@media(max-width:720px){.gwhr-fields{grid-template-columns:1fr}}`}</style>
      <p>Where should we send your advisory? These fields are stored in this browser in the current build; no CRM or admin dashboard receives them.</p>
      <div className="gwhr-fields">
        {(['firstName','lastName','email','company','title'] as const).map((field) => <label className="gwhr-field" key={field}>{field.replace(/([A-Z])/g, ' $1')}<input aria-invalid={Boolean(issueFor(field))} aria-describedby={`${field}-error`} value={String(leadData[field] ?? '')} onChange={(e) => updateLeadData({ [field]: e.target.value })} />{issueFor(field) ? <span id={`${field}-error`} className="gwhr-error">{issueFor(field)}</span> : null}</label>)}
      </div>
      <label><input type="checkbox" checked={Boolean(leadData.consentToEmail)} onChange={(e) => updateLeadData({ consentToEmail: e.target.checked })} /> I consent to use these details to send my advisory. I understand no remote delivery is configured in this client-side build.</label>
      {issueFor('consentToEmail') ? <span className="gwhr-error">{issueFor('consentToEmail')}</span> : null}
      <DataHandling compact />
      <button className="gwhr-submit" disabled={isSubmitting} type="submit">{isSubmitting ? 'Preparing...' : 'Capture contact details'}</button>
      {sent ? <div className="gwhr-success" role="status">Contact details captured locally. Connect an approved email/Google Drive workflow before remote delivery.</div> : null}
    </form>
  );
}
