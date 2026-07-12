/**
 * GrowWithHR Premium UX Type System
 *
 * Folder map implemented for the executive assessment experience:
 * - apps/web/src/components/UX/Animations/AnimatedText.tsx
 * - apps/web/src/components/UX/Animations/SceneTransition.tsx
 * - apps/web/src/components/UX/Assessment/WizardForm.tsx
 * - apps/web/src/components/UX/Forms/LeadCaptureForm.tsx
 * - apps/web/src/components/UX/Privacy/PrivacyPolicy.tsx
 * - apps/web/src/components/UX/Privacy/DataHandling.tsx
 * - apps/web/src/components/UX/Reports/PersonalizedReportGenerator.tsx
 * - apps/web/src/hooks/useAnimatedText.ts
 * - apps/web/src/hooks/useSessionPersistence.ts
 * - apps/web/src/stores/assessmentStore.ts
 * - apps/web/src/services/sessionPersistenceService.ts
 * - apps/web/src/types/uiTypes.ts
 */

export type DeviceSize = 'mobile' | 'tablet' | 'desktop';
export type WizardStepId = 'welcome' | 'company' | 'sensitive' | 'contact' | 'report';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type MaturityArchetype = 'Foundation Builder' | 'Scaling Operator' | 'Control Tower' | 'Market Ready';

export interface AnimatedBeat {
  id: string;
  text: string;
  eyebrow?: string;
  durationMs?: number;
}

export interface CompanyAssessmentData {
  companyName: string;
  state: string;
  entityType: string;
  industry: string;
  headcount: string;
  fundingStage?: string;
  hiringPlans?: string;
  expansionPlans?: string;
  workModel?: string;
}

export interface LeadCaptureData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  consentToEmail: boolean;
}

export interface ValidationIssue {
  field: keyof CompanyAssessmentData | keyof LeadCaptureData | string;
  message: string;
}

export interface SessionSnapshot {
  id: string;
  createdAt: string;
  expiresAt: string;
  currentStep: WizardStepId;
  companyData: Partial<CompanyAssessmentData>;
  leadData?: Partial<LeadCaptureData>;
  report?: PersonalizedReport;
}

export interface BenchmarkInsight {
  label: string;
  value: string;
  description: string;
}

export interface PersonalizedReport {
  id: string;
  generatedAt: string;
  title: string;
  summary: string;
  riskLevel: RiskLevel;
  maturityScore: number;
  archetype: MaturityArchetype;
  benchmarks: BenchmarkInsight[];
  actionItems: string[];
  cfoView: string;
  hrView: string;
  privacyNote: string;
}

export interface ComponentStatus {
  state: LoadingState;
  message?: string;
}
