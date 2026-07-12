import type { CompanyAssessmentData, PersonalizedReport, RiskLevel } from '../../../types/uiTypes';

/**
 * Builds a deterministic, rules-based advisory report from assessment answers.
 * @param data - Completed company assessment inputs.
 * @returns Personalized report with risk, maturity, benchmarks, and actions.
 * @example const report = generatePersonalizedReport({ companyName:'Acme', state:'Maharashtra', entityType:'Pvt Ltd', industry:'IT', headcount:'50-99' });
 */
export function generatePersonalizedReport(data: CompanyAssessmentData): PersonalizedReport {
  const headcountNumber = Number(data.headcount.match(/\d+/)?.[0] ?? 0);
  const expansionRisk = data.expansionPlans && data.expansionPlans !== 'No immediate expansion' ? 15 : 0;
  const hiringRisk = data.hiringPlans && data.hiringPlans !== 'Stable' ? 10 : 0;
  const score = Math.min(100, 35 + (headcountNumber > 50 ? 25 : 10) + expansionRisk + hiringRisk);
  const riskLevel: RiskLevel = score >= 85 ? 'critical' : score >= 70 ? 'high' : score >= 50 ? 'moderate' : 'low';
  return {
    id: `report-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    title: `${data.companyName}'s Executive People & Compliance Advisory`,
    summary: `As a ${data.entityType} in ${data.industry} operating from ${data.state}, ${data.companyName} should prioritize obligations connected to headcount, hiring velocity, and expansion readiness.`,
    riskLevel,
    maturityScore: Math.max(10, 100 - score),
    archetype: score >= 85 ? 'Control Tower' : score >= 70 ? 'Scaling Operator' : score >= 50 ? 'Foundation Builder' : 'Market Ready',
    benchmarks: [
      { label: 'Compliance readiness', value: `${Math.max(10, 100 - score)}/100`, description: 'Directional maturity score based on your answers, not an external authority rating.' },
      { label: 'Peer-stage signal', value: riskLevel, description: 'Rules-based benchmark for similar-stage companies with comparable headcount and expansion plans.' },
    ],
    actionItems: ['Confirm state-level labour registrations and renewal calendars.', 'Map sensitive hiring and expansion plans to compliance triggers.', 'Assign an owner for monthly evidence collection and leadership reporting.'],
    cfoView: 'Budget for preventive compliance work before expansion or rapid hiring creates avoidable penalties and remediation costs.',
    hrView: 'Translate obligations into employee-facing processes, onboarding checklists, policies, and manager-ready operating rhythms.',
    privacyNote: 'This report is generated in the open browser tab only. No assessment answers are stored, saved to localStorage, sent to HRTechify, uploaded to Google Drive, or exported to a CRM/admin dashboard.',
  };
}

/**
 * Renders the personalized advisory report without changing existing chart/dashboard assets.
 * @param props - Company data used for report generation.
 * @returns Responsive report section.
 * @example <PersonalizedReportGenerator data={companyData} />
 */
export function PersonalizedReportGenerator({ data }: { data: CompanyAssessmentData }) {
  const report = generatePersonalizedReport(data);
  return <section className="gwhr-report" aria-label="Personalized executive advisory report"><style>{`.gwhr-report{display:grid;gap:1rem;font-family:"Inter","Segoe UI",sans-serif}.gwhr-report-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.gwhr-report-card{border-radius:20px;background:white;border:1px solid #dbe7ff;padding:1rem;box-shadow:0 10px 34px rgba(15,23,42,.08)}.gwhr-risk{text-transform:uppercase;font-weight:800;color:#b54708}`}</style><h2>{report.title}</h2><p>{report.summary}</p><div className="gwhr-report-grid"><div className="gwhr-report-card"><span className="gwhr-risk">{report.riskLevel}</span><br />Risk level</div><div className="gwhr-report-card">{report.maturityScore}/100<br />Maturity score</div><div className="gwhr-report-card">{report.archetype}<br />Operating archetype</div></div><h3>Priority actions</h3><ol>{report.actionItems.map((item) => <li key={item}>{item}</li>)}</ol><div className="gwhr-report-grid"><div className="gwhr-report-card"><strong>CFO view</strong><p>{report.cfoView}</p></div><div className="gwhr-report-card"><strong>HR view</strong><p>{report.hrView}</p></div></div><p>{report.privacyNote}</p></section>;
}
