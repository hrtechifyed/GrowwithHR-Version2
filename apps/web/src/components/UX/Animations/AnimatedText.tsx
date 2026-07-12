'use client';

import type { KeyboardEvent } from 'react';
import { useAnimatedText } from '../../../hooks/useAnimatedText';
import type { AnimatedBeat } from '../../../types/uiTypes';

export interface AnimatedTextProps {
  beats: AnimatedBeat[];
  onComplete?: () => void;
  className?: string;
  reducedMotion?: boolean;
}

/**
 * AnimatedText reveals executive copy one short beat at a time.
 * @param props - Beat content and completion callback.
 * @returns Accessible animated text region with pause/skip controls.
 * @example <AnimatedText beats={[{ id: 'one', text: 'Welcome.' }]} onComplete={next} />
 */
export function AnimatedText({ beats, onComplete, className = '', reducedMotion = false }: AnimatedTextProps) {
  const sequence = useAnimatedText({ beats, onComplete, reducedMotion });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') sequence.next();
    if (event.key === 'ArrowLeft') sequence.previous();
    if (event.key === ' ') sequence.isPlaying ? sequence.pause() : sequence.play();
  };

  if (!beats.length) return <p role="status">Preparing your executive assessment introduction...</p>;

  return (
    <section
      className={`gwhr-animated-text ${className}`}
      aria-label="Executive assessment introduction"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <style>{`.gwhr-animated-text{display:grid;gap:1rem;font-family:"Inter","Segoe UI",sans-serif;min-height:14rem;padding:clamp(1rem,4vw,3rem);border-radius:28px;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(232,244,255,.78));box-shadow:0 24px 80px rgba(15,23,42,.14)}.gwhr-beat{animation:gwhrReveal .7s ease both;font-size:clamp(1.45rem,4vw,3.75rem);line-height:1.08;color:#102033}.gwhr-eyebrow{letter-spacing:.14em;text-transform:uppercase;color:#4263eb;font-weight:700}.gwhr-controls{display:flex;gap:.75rem;flex-wrap:wrap}.gwhr-controls button{min-height:44px;border:0;border-radius:999px;padding:.7rem 1rem;background:#102033;color:white}.gwhr-progress{height:8px;border-radius:999px;background:#dbe7ff;overflow:hidden}.gwhr-progress span{display:block;height:100%;background:#4263eb;transition:width .35s ease}@keyframes gwhrReveal{from{opacity:0;transform:translateY(18px) scale(.98);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}@media (prefers-reduced-motion:reduce){.gwhr-beat{animation:none}.gwhr-progress span{transition:none}}`}</style>
      {sequence.activeBeat?.eyebrow ? <span className="gwhr-eyebrow">{sequence.activeBeat.eyebrow}</span> : null}
      <p key={sequence.activeBeat?.id} className="gwhr-beat">{sequence.activeBeat?.text}</p>
      <div className="gwhr-progress" aria-label={`Progress ${Math.round(sequence.progressPercent)} percent`}><span style={{ width: `${sequence.progressPercent}%` }} /></div>
      <div className="gwhr-controls" aria-label="Animation controls">
        <button type="button" onClick={sequence.isPlaying ? sequence.pause : sequence.play}>{sequence.isPlaying ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={sequence.next}>Skip beat</button>
        <button type="button" onClick={onComplete}>Skip intro</button>
      </div>
    </section>
  );
}
