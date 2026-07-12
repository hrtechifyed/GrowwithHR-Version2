import { WizardForm } from '../Assessment/WizardForm';
import { PrivacyPolicy } from '../Privacy/PrivacyPolicy';

/**
 * Integration example for a Next.js page or route segment.
 * @returns Complete assessment plus accessible privacy information.
 * @example export default function Page(){ return <ExecutiveAssessmentIntegration />; }
 */
export function ExecutiveAssessmentIntegration() {
  return <><WizardForm /><PrivacyPolicy /></>;
}
