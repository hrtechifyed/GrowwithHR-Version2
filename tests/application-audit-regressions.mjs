import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { analyzeOrganizationStructure } from '../js/modules/organization/organization-structure-engine.mjs';
const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');

// Exercise stale-document rebuilds through the real delivery guard, including
// a slow installer and caller-only IDs on prepare, direct send and download.
let built = [];
class Service {
  resolveRecords(payload) { return { report: payload.report || {}, lead: {}, answers: {} }; }
  async send(payload) { return payload.pdf; }
  async download(payload) { return payload.pdf; }
}
const latestPdf = { reportStyleId: 'editorial-research-v1', informationPreservation: 'full-deterministic-finding-appendix', singleEdition: true };
const win = {
  GrowWithHRModules: { AdvisoryDelivery: { AdvisoryDeliveryService: Service, RESEND_ACTION: 'resend-customer', customerWasSent: () => true } },
  GrowWithHREditorialReportTemplate: { installed: true, styleId: latestPdf.reportStyleId },
  GrowWithHRReportBrandTemplate: { reportStyle: latestPdf.reportStyleId },
  GrowWithHRPDF: { __growwithhrVisualSectionedReportInstalled: true, async buildAdvisoryPdf(payload) { built.push(payload); return { ...latestPdf, ...payload }; } }
};
vm.runInNewContext(read('js/latest-report-delivery-guard-v1.js'), { window: win });
for (const method of ['preparePdf', 'send', 'download', 'resendCustomer']) {
  const service = new Service();
  const inputChanges = [{ field: 'employees', before: '20', after: '25' }];
  const result = await service[method]({ pdf: { reportId: 'GWHR-EXISTING', previousReportId: 'GWHR-PREVIOUS' }, report: { companyName: 'Audit Fixture', inputChanges } });
  assert.equal(built.at(-1).reportId, 'GWHR-EXISTING', `${method} keeps the existing identity`);
  assert.equal(built.at(-1).previousReportId, 'GWHR-PREVIOUS', `${method} keeps lineage`);
  assert.equal(built.at(-1).inputChanges, inputChanges, `${method} keeps the changed facts`);
  assert.equal((result.pdf || result).reportStyleId, latestPdf.reportStyleId);
}
win.GrowWithHRPDF.__growwithhrVisualSectionedReportInstalled = false;
let releaseInstaller;
win.GrowWithHRVisualSectionedReportReady = new Promise(resolve => { releaseInstaller = resolve; });
const before = built.length;
const pending = new Service().preparePdf({ reportId: 'GWHR-SLOW' });
await Promise.resolve();
assert.equal(built.length, before, 'The preceding renderer must not be used during installation');
win.GrowWithHRPDF.__growwithhrVisualSectionedReportInstalled = true;
releaseInstaller(true);
assert.equal((await pending).reportId, 'GWHR-SLOW');

// Missing and explicit zero are different facts in the actual editorial model.
const editorialWindow = { GrowWithHRVisualReportCore: {}, GrowWithHRVisualReportRenderers: { buildVariant() {} } };
const editorial = read('js/report-editorial-template-v1.js').replace('    function companyFacts(data) {', '    window.auditCompanyFacts = companyFacts;\n    function companyFacts(data) {');
vm.runInNewContext(editorial, { window: editorialWindow });
const unknown = Object.fromEntries(editorialWindow.auditCompanyFacts({}));
assert.equal(unknown.Workers, '—');
assert.equal(unknown.Contractors, '—');
const zero = Object.fromEntries(editorialWindow.auditCompanyFacts({ workers: 0, contractors: 0 }));
assert.equal(zero.Workers, '0');
assert.equal(zero.Contractors, '0');

// A confirmed compliance workspace is not a confirmed Organization baseline.
const reportSource = read('js/organization-structure-report.mjs').replace(/^import .*;\n/gm, '').split('function sourceLinks')[0];
const ctx = { analyzeOrganizationStructure, sessionStorage: { getItem: () => null } };
vm.createContext(ctx);
vm.runInContext(reportSource + '\nthis.auditChange = buildChangeIntelligence; this.auditSample = samplePayload;', ctx);
const sample = ctx.auditSample();
assert.equal(ctx.auditChange(sample).baselineAvailable, true);
const complianceOnly = { workforce: { totalEmployees: 50 }, compliance: { confirmedAt: '2026-09-01T00:00:00Z' } };
const firstOrg = ctx.auditChange({ ...sample, previousData: complianceOnly });
assert.equal(firstOrg.baselineAvailable, false);
assert.equal(firstOrg.findingChanges.length, 0);
assert.ok(firstOrg.factChanges.some(change => change.label === 'Employees'), 'Shared facts may still be compared');

// Keep changed facts (including a change to zero) on the generated report data.
const app = { answers: { workers: 0, contractors: 0 }, deliveryService: { prepareAndSend: async payload => ({ report: payload.report }) } };
const changeWindow = { executiveAssessment: app, addEventListener() {} };
vm.runInNewContext(read('js/compliance-change-intelligence.js'), {
  window: changeWindow,
  sessionStorage: { getItem: () => JSON.stringify({ reportId: 'GWHR-PRIOR', companyData: { compliance: { answers: { workers: 5, contractors: 2 } } } }) }
});
await app.deliveryService.prepareAndSend({ report: {} });
assert.equal(app.lastChangeReport.inputChanges.length, 2);
assert.equal(app.lastChangeReport.inputChanges[0].after, '0');
assert.equal(app.lastChangeReport.changeIntelligence.previousReportId, 'GWHR-PRIOR');
console.log('Application audit regressions passed: delayed PDF installer, identity/lineage, missing counts, baseline isolation and changed facts.');
