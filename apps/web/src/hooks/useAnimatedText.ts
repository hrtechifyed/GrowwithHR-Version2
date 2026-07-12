'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnimatedBeat } from '../types/uiTypes';

export interface UseAnimatedTextOptions {
  beats: AnimatedBeat[];
  defaultDurationMs?: number;
  autoStart?: boolean;
  loop?: boolean;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

export interface UseAnimatedTextReturn {
  activeBeat: AnimatedBeat | null;
  activeIndex: number;
  isPlaying: boolean;
  isComplete: boolean;
  progressPercent: number;
  play: () => void;
  pause: () => void;
  restart: () => void;
  next: () => void;
  previous: () => void;
}

/**
 * Controls sequential text beats for the cinematic assessment entrance.
 *
 * @param options - Beat list and timing behavior.
 * @returns Playback state and imperative controls for accessible buttons/keyboard shortcuts.
 *
 * @example
 * const sequence = useAnimatedText({ beats, onComplete: () => setStep('company') });
 * return <p>{sequence.activeBeat?.text}</p>;
 */
export function useAnimatedText(options: UseAnimatedTextOptions): UseAnimatedTextReturn {
  const {
    beats,
    defaultDurationMs = 3200,
    autoStart = true,
    loop = false,
    reducedMotion = false,
    onComplete,
  } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const safeBeats = useMemo(() => beats.filter((beat) => beat.text.trim().length > 0), [beats]);
  const activeBeat = safeBeats[activeIndex] ?? null;
  const progressPercent = safeBeats.length ? ((activeIndex + 1) / safeBeats.length) * 100 : 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const next = useCallback(() => {
    setActiveIndex((index) => {
      const nextIndex = index + 1;
      if (nextIndex < safeBeats.length) return nextIndex;
      if (loop && safeBeats.length > 0) return 0;
      setIsPlaying(false);
      setIsComplete(true);
      onCompleteRef.current?.();
      return index;
    });
  }, [loop, safeBeats.length]);

  useEffect(() => {
    clearTimer();
    if (!isPlaying || isComplete || !activeBeat) return;
    const delay = reducedMotion ? 250 : activeBeat.durationMs ?? defaultDurationMs;
    timerRef.current = setTimeout(next, delay);
    return clearTimer;
  }, [activeBeat, clearTimer, defaultDurationMs, isComplete, isPlaying, next, reducedMotion]);

  const play = useCallback(() => {
    if (!safeBeats.length) return;
    setIsComplete(false);
    setIsPlaying(true);
  }, [safeBeats.length]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    setActiveIndex(0);
    setIsComplete(false);
    setIsPlaying(true);
  }, [clearTimer]);

  const previous = useCallback(() => {
    setActiveIndex((index) => Math.max(0, index - 1));
    setIsComplete(false);
  }, []);

  return { activeBeat, activeIndex, isPlaying, isComplete, progressPercent, play, pause, restart, next, previous };
}
