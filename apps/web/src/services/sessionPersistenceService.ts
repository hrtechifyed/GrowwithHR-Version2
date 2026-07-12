import type { SessionSnapshot } from '../types/uiTypes';

const STORAGE_KEY = 'growwithhr.executiveAssessment.session';
const SESSION_DAYS = 30;

/**
 * Browser-first persistence service.
 *
 * Data storage statement: assessment progress is stored only in the respondent's browser
 * localStorage by default. This repository intentionally does not send assessment data to
 * HRTechify, a CRM, or an admin dashboard. The `createResumeLink` method creates a URL
 * with an opaque session id only; a future Google Drive/HRTechify-folder integration must
 * replace `remoteSave` explicitly and disclose that behavior before activation.
 */
export class SessionPersistenceService {
  /**
   * Creates a session snapshot with a 30-day expiry.
   * @param snapshot - Assessment state to persist.
   * @returns The normalized snapshot that was saved.
   * @example const saved = service.save({ ...draft, id: crypto.randomUUID() });
   */
  save(snapshot: Omit<SessionSnapshot, 'createdAt' | 'expiresAt'> & Partial<Pick<SessionSnapshot, 'createdAt' | 'expiresAt'>>): SessionSnapshot {
    this.assertBrowser();
    const now = new Date();
    const normalized: SessionSnapshot = {
      ...snapshot,
      createdAt: snapshot.createdAt ?? now.toISOString(),
      expiresAt: snapshot.expiresAt ?? new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  /**
   * Restores a valid session from localStorage.
   * @returns The stored session, or null when missing, corrupt, expired, or server-side.
   * @example const restored = service.restore();
   */
  restore(): SessionSnapshot | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SessionSnapshot;
      if (!parsed.id || new Date(parsed.expiresAt).getTime() < Date.now()) {
        this.clear();
        return null;
      }
      return parsed;
    } catch {
      this.clear();
      return null;
    }
  }

  /**
   * Clears all local assessment progress from the browser.
   * @returns void.
   * @example service.clear();
   */
  clear(): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Builds a save-and-resume link for email copy/paste flows.
   * @param sessionId - Opaque local session id.
   * @returns URL containing a session query parameter.
   * @example const link = service.createResumeLink(saved.id);
   */
  createResumeLink(sessionId: string): string {
    this.assertBrowser();
    const url = new URL(window.location.href);
    url.searchParams.set('resume', sessionId);
    return url.toString();
  }

  /**
   * Optional future remote storage hook, currently disabled by design.
   * @returns A rejected promise explaining that no server/Google Drive storage is configured.
   * @example await service.remoteSave(snapshot).catch(console.warn);
   */
  async remoteSave(): Promise<never> {
    throw new Error('Remote storage is disabled. No data is sent to HRTechify or Google Drive in this client-side build.');
  }

  private assertBrowser(): void {
    if (typeof window === 'undefined') throw new Error('Session persistence is available only in the browser.');
  }
}

export const sessionPersistenceService = new SessionPersistenceService();
