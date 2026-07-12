'use client';

import { create } from 'zustand';
import type { CompanyAssessmentData, LeadCaptureData, PersonalizedReport, ValidationIssue, WizardStepId } from '../types/uiTypes';

interface AssessmentState {
  currentStep: WizardStepId;
  companyData: Partial<CompanyAssessmentData>;
  leadData: Partial<LeadCaptureData>;
  report: PersonalizedReport | null;
  issues: ValidationIssue[];
  setStep: (step: WizardStepId) => void;
  updateCompanyData: (data: Partial<CompanyAssessmentData>) => void;
  updateLeadData: (data: Partial<LeadCaptureData>) => void;
  setReport: (report: PersonalizedReport) => void;
  validateCompany: () => boolean;
  validateLead: () => boolean;
  reset: () => void;
}

const requiredCompanyFields: Array<keyof CompanyAssessmentData> = ['companyName', 'state', 'entityType', 'industry', 'headcount'];
const requiredLeadFields: Array<keyof LeadCaptureData> = ['firstName', 'lastName', 'email', 'company', 'title'];

/**
 * Zustand store for the assessment wizard.
 * @example const companyName = useAssessmentStore((s) => s.companyData.companyName);
 */
export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  currentStep: 'welcome',
  companyData: {},
  leadData: {},
  report: null,
  issues: [],
  setStep: (step) => set({ currentStep: step }),
  updateCompanyData: (data) => set((state) => ({ companyData: { ...state.companyData, ...data } })),
  updateLeadData: (data) => set((state) => ({ leadData: { ...state.leadData, ...data } })),
  setReport: (report) => set({ report }),
  validateCompany: () => {
    const issues = requiredCompanyFields
      .filter((field) => !String(get().companyData[field] ?? '').trim())
      .map((field) => ({ field, message: 'This field is required to personalize your advisory.' }));
    set({ issues });
    return issues.length === 0;
  },
  validateLead: () => {
    const lead = get().leadData;
    const issues = requiredLeadFields
      .filter((field) => !String(lead[field] ?? '').trim())
      .map((field) => ({ field, message: 'This field is required to send your advisory.' }));
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) issues.push({ field: 'email', message: 'Enter a valid business email.' });
    if (!lead.consentToEmail) issues.push({ field: 'consentToEmail', message: 'Please confirm consent before email delivery.' });
    set({ issues });
    return issues.length === 0;
  },
  reset: () => set({ currentStep: 'welcome', companyData: {}, leadData: {}, report: null, issues: [] }),
}));
