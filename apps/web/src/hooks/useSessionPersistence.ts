'use client';

import { useCallback, useEffect, useState } from 'react';
import { sessionPersistenceService } from '../services/sessionPersistenceService';
import type { ComponentStatus, SessionSnapshot } from '../types/uiTypes';

/**
 * React hook wrapper around browser-only session persistence.
 * @returns session state, save/restore/clear actions, and status for UI messages.
 * @example const { saveSession, resumeLink } = useSessionPersistence();
 */
export function useSessionPersistence() {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [resumeLink, setResumeLink] = useState('');
  const [status, setStatus] = useState<ComponentStatus>({ state: 'idle' });

  useEffect(() => {
    const restored = sessionPersistenceService.restore();
    if (restored) setSession(restored);
  }, []);

  const saveSession = useCallback((snapshot: Parameters<typeof sessionPersistenceService.save>[0]) => {
    try {
      setStatus({ state: 'loading', message: 'Saving in this browser...' });
      const saved = sessionPersistenceService.save(snapshot);
      setSession(saved);
      setResumeLink(sessionPersistenceService.createResumeLink(saved.id));
      setStatus({ state: 'success', message: 'Progress saved locally. Copy the resume link if needed.' });
      return saved;
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Unable to save progress.' });
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    sessionPersistenceService.clear();
    setSession(null);
    setResumeLink('');
    setStatus({ state: 'idle' });
  }, []);

  return { session, resumeLink, status, saveSession, clearSession };
}
