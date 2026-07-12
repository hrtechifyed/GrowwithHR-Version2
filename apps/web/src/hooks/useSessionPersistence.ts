'use client';

import { useCallback, useState } from 'react';
import { sessionPersistenceService } from '../services/sessionPersistenceService';
import type { ComponentStatus, SessionSnapshot } from '../types/uiTypes';

/**
 * Hook for displaying the no-storage policy and holding only current-tab memory.
 *
 * @returns In-memory draft state, a no-storage notice, and clear/hold actions.
 * @example const { noStorageNotice } = useSessionPersistence();
 */
export function useSessionPersistence() {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [status, setStatus] = useState<ComponentStatus>({ state: 'idle' });
  const noStorageNotice = sessionPersistenceService.getNoStorageNotice();

  /**
   * Holds a draft only in JavaScript memory for the active tab.
   * @param snapshot - Current wizard state.
   * @returns Current-tab snapshot, never persisted to browser storage.
   * @example holdCurrentTabDraft({ id: crypto.randomUUID(), currentStep: 'company', companyData: {} });
   */
  const holdCurrentTabDraft = useCallback((snapshot: Parameters<typeof sessionPersistenceService.holdInMemory>[0]) => {
    const draft = sessionPersistenceService.holdInMemory(snapshot);
    setSession(draft);
    setStatus({ state: 'success', message: noStorageNotice });
    return draft;
  }, [noStorageNotice]);

  /**
   * Clears the active tab's temporary draft.
   * @returns void.
   * @example clearCurrentTabDraft();
   */
  const clearCurrentTabDraft = useCallback(() => {
    sessionPersistenceService.clearCurrentTab();
    setSession(null);
    setStatus({ state: 'idle' });
  }, []);

  return { session, status, noStorageNotice, holdCurrentTabDraft, clearCurrentTabDraft };
}
