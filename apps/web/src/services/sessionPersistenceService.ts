import type { SessionSnapshot } from '../types/uiTypes';

/**
 * Client-memory-only session service.
 *
 * Data storage statement: this assessment does not persist answers anywhere. The
 * current answers live only in React/Zustand memory inside the open browser tab.
 * If the respondent refreshes, closes the tab, switches devices, clears the page,
 * or leaves midway, the assessment must be started fresh. No localStorage,
 * sessionStorage, cookies, backend API, CRM, dashboard, email service, or Google
 * Drive upload is used in this implementation.
 */
export class SessionPersistenceService {
  private inMemorySnapshot: SessionSnapshot | null = null;

  /**
   * Keeps a temporary snapshot in JavaScript memory for the current tab only.
   *
   * @param snapshot - Assessment state for the active browser tab.
   * @returns The normalized snapshot that exists only until reload/close.
   * @example const draft = service.holdInMemory({ id: crypto.randomUUID(), currentStep: 'company', companyData: {} });
   */
  holdInMemory(snapshot: Omit<SessionSnapshot, 'createdAt' | 'expiresAt'> & Partial<Pick<SessionSnapshot, 'createdAt' | 'expiresAt'>>): SessionSnapshot {
    const now = new Date();
    this.inMemorySnapshot = {
      ...snapshot,
      createdAt: snapshot.createdAt ?? now.toISOString(),
      expiresAt: snapshot.expiresAt ?? now.toISOString(),
    };
    return this.inMemorySnapshot;
  }

  /**
   * Returns the current in-memory snapshot for the active tab.
   *
   * @returns Current tab snapshot, or null after refresh/close/new device.
   * @example const draft = service.restoreCurrentTabOnly();
   */
  restoreCurrentTabOnly(): SessionSnapshot | null {
    return this.inMemorySnapshot;
  }

  /**
   * Clears the current tab's temporary in-memory snapshot.
   *
   * @returns void.
   * @example service.clearCurrentTab();
   */
  clearCurrentTab(): void {
    this.inMemorySnapshot = null;
  }

  /**
   * Explains why save-and-resume links are intentionally unavailable.
   *
   * @returns A user-facing explanation string.
   * @example const message = service.getNoStorageNotice();
   */
  getNoStorageNotice(): string {
    return 'We do not store assessment progress. If you leave or refresh this page, you will need to start fresh.';
  }

  /**
   * Disabled remote storage hook for future explicit consent-based integrations.
   *
   * @returns A rejected promise because remote storage is not enabled.
   * @example await service.remoteSave().catch((error) => showNotice(error.message));
   */
  async remoteSave(): Promise<never> {
    throw new Error('Remote storage is disabled. No data is sent to HRTechify, Google Drive, CRM, email, or an admin dashboard.');
  }
}

export const sessionPersistenceService = new SessionPersistenceService();
