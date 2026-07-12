import { generatePersonalizedReport } from '../Reports/PersonalizedReportGenerator';

describe('generatePersonalizedReport', () => {
  it('returns a company-specific advisory', () => {
    const report = generatePersonalizedReport({ companyName: 'Acme', state: 'Maharashtra', entityType: 'Pvt Ltd', industry: 'IT Services', headcount: '50-99' });
    expect(report.title).toContain('Acme');
    expect(report.actionItems.length).toBeGreaterThan(0);
  });
});
