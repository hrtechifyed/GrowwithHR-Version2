'use client';

import { AnimatedText } from '../Animations/AnimatedText';
import { SceneTransition } from '../Animations/SceneTransition';
import { LeadCaptureForm } from '../Forms/LeadCaptureForm';
import { DataHandling } from '../Privacy/DataHandling';
import { PersonalizedReportGenerator, generatePersonalizedReport } from '../Reports/PersonalizedReportGenerator';
import { useSessionPersistence } from '../../../hooks/useSessionPersistence';
import { useAssessmentStore } from '../../../stores/assessmentStore';
import type { AnimatedBeat, CompanyAssessmentData } from '../../../types/uiTypes';

const introBeats: AnimatedBeat[] = [
  { id: 'context', eyebrow: 'Executive assessment', text: 'Before you plan the next hire, know which obligations may already be active.', durationMs: 2800 },
  { id: 'triggers', text: 'Headcount, entity type, location, funding stage, and expansion plans can all change your compliance path.', durationMs: 3400 },
  { id: 'promise', text: 'We will keep each screen short, explain sensitive questions, and generate a practical advisory from your answers.', durationMs: 3400 },
];

/**
 * End-to-end executive assessment wizard.
 * @returns Cinematic welcome, assessment fields, contact capture, and personalized report scenes.
 * @example <WizardForm />
 */
export function WizardForm() {
  const store = useAssessmentStore();
  const persistence = useSessionPersistence();
  const issueFor = (field: string) => store.issues.find((issue) => issue.field === field)?.message;

  const save = () => persistence.saveSession({ id: crypto.randomUUID(), currentStep: store.currentStep, companyData: store.companyData, leadData: store.leadData, report: store.report ?? undefined });
  const submitCompany = () => {
    if (!store.validateCompany()) return;
    const report = generatePersonalizedReport(store.companyData as CompanyAssessmentData);
    store.setReport(report);
    store.setStep('contact');
  };

  if (store.currentStep === 'welcome') return <SceneTransition sceneKey="welcome" title="Start Executive Assessment"><AnimatedText beats={introBeats} onComplete={() => store.setStep('company')} /><button type="button" onClick={() => store.setStep('company')}>Start now</button></SceneTransition>;
  if (store.currentStep === 'contact') return <SceneTransition sceneKey="contact" title="Send or save your advisory"><LeadCaptureForm onSuccess={() => store.setStep('report')} /></SceneTransition>;
  if (store.currentStep === 'report' && store.report) return <SceneTransition sceneKey="report" title="Your advisory"><PersonalizedReportGenerator data={store.companyData as CompanyAssessmentData} /></SceneTransition>;

  return (
    <SceneTransition sceneKey="company" title="Tell us enough to personalize the advisory">
      <form className="gwhr-wizard" aria-label="Executive company assessment" onSubmit={(e) => { e.preventDefault(); submitCompany(); }}>
        <style>{`.gwhr-wizard{display:grid;gap:1rem}.gwhr-wizard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.gwhr-wizard label{display:grid;gap:.35rem}.gwhr-wizard input,.gwhr-wizard select{min-height:44px;border:1px solid #c9d7ee;border-radius:14px;padding:.75rem 1rem;font:inherit}.gwhr-actions{display:flex;gap:.75rem;flex-wrap:wrap}.gwhr-actions button{min-height:48px;border:0;border-radius:999px;padding:.85rem 1.2rem;font-weight:700}.primary{background:#102033;color:white}.secondary{background:#eef5ff;color:#102033}.error{color:#b42318;font-size:.9rem}@media(max-width:720px){.gwhr-wizard-grid{grid-template-columns:1fr}}`}</style>
        <DataHandling compact />
        <div className="gwhr-wizard-grid">
          {(['companyName','state','entityType','industry','headcount','fundingStage','hiringPlans','expansionPlans','workModel'] as const).map((field) => <label key={field}>{field.replace(/([A-Z])/g, ' $1')}<input aria-invalid={Boolean(issueFor(field))} value={String(store.companyData[field] ?? '')} onChange={(e) => store.updateCompanyData({ [field]: e.target.value })} />{issueFor(field) ? <span className="error">{issueFor(field)}</span> : null}</label>)}
        </div>
        <div className="gwhr-actions"><button className="primary" type="submit">Generate personalized advisory</button><button className="secondary" type="button" onClick={save}>Save progress locally</button></div>
        {persistence.resumeLink ? <p role="status">Resume link: <code>{persistence.resumeLink}</code></p> : null}
        {persistence.status.message ? <p role="status">{persistence.status.message}</p> : null}
      </form>
    </SceneTransition>
  );
}
