'use client';

import type { ReactNode } from 'react';

export interface SceneTransitionProps { sceneKey: string; title?: string; children: ReactNode; }

/**
 * SceneTransition wraps each wizard scene with a soft "new world" entrance.
 * @param props - Stable scene key, optional title, and scene children.
 * @returns Responsive, keyboard-focusable scene container.
 * @example <SceneTransition sceneKey="contact" title="Send your advisory"><LeadCaptureForm /></SceneTransition>
 */
export function SceneTransition({ sceneKey, title, children }: SceneTransitionProps) {
  return (
    <section key={sceneKey} className="gwhr-scene" aria-labelledby={title ? `${sceneKey}-title` : undefined} tabIndex={-1}>
      <style>{`.gwhr-scene{width:min(100%,1120px);margin:0 auto;padding:clamp(1rem,3vw,2.5rem);animation:gwhrScene .55s cubic-bezier(.2,.8,.2,1) both}.gwhr-scene-card{border:1px solid rgba(148,163,184,.28);border-radius:32px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px);box-shadow:0 26px 90px rgba(15,23,42,.12);padding:clamp(1rem,3vw,2.5rem)}@keyframes gwhrScene{from{opacity:0;transform:translateY(24px) scale(.985)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.gwhr-scene{animation:none}}`}</style>
      <div className="gwhr-scene-card">
        {title ? <h2 id={`${sceneKey}-title`}>{title}</h2> : null}
        {children}
      </div>
    </section>
  );
}
