import { useEffect, useRef } from 'react';
import { isDayComplete } from '../utils/streakUtils';

// ── useConfetti ───────────────────────────────────────────────────────────
// Watches progress; fires a canvas confetti burst when a day goes from
// incomplete → complete. Uses canvas-confetti via CDN (loaded lazily).
//
// Usage: call useConfetti(progress) at the top of App.

let confettiLib = null;
async function getConfetti() {
  if (confettiLib) return confettiLib;
  // Dynamically load canvas-confetti from CDN
  await new Promise((res, rej) => {
    if (document.querySelector('#confetti-script')) { res(); return; }
    const s = document.createElement('script');
    s.id = 'confetti-script';
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  confettiLib = window.confetti;
  return confettiLib;
}

function fire(confetti) {
  // Two bursts from left and right edges
  confetti({ particleCount: 60, spread: 70, origin: { x: 0.2, y: 0.7 }, colors: ['#6ee7b7', '#34d399', '#fcd34d', '#fb923c'] });
  confetti({ particleCount: 60, spread: 70, origin: { x: 0.8, y: 0.7 }, colors: ['#6ee7b7', '#34d399', '#a78bfa', '#60a5fa'] });
}

export function useConfetti(progress) {
  // Track which days were complete on last render
  const prevComplete = useRef(new Set());

  useEffect(() => {
    const nowComplete = new Set();
    for (let d = 1; d <= 84; d++) {
      if (isDayComplete(d, progress)) nowComplete.add(d);
    }

    // Find newly completed days
    const newlyDone = [...nowComplete].filter(d => !prevComplete.current.has(d));

    if (newlyDone.length > 0) {
      getConfetti().then(fire).catch(() => {});
    }

    prevComplete.current = nowComplete;
  }, [progress]);
}
