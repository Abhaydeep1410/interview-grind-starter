import { DAYS_MAP } from '../data';

// ── Streak helpers ────────────────────────────────────────────────────────
// A "completed day" = every task in that day is marked done.
// Days are numbered 1-84, anchored to the campaign start date.

const CAMPAIGN_START = new Date('2026-05-10T00:00:00+05:30');

/** Return the campaign day number (1-84) for a given Date. */
export function dateToDayNumber(date) {
  const diff = Math.floor((date - CAMPAIGN_START) / 86400000) + 1;
  return Math.max(1, Math.min(84, diff));
}

/** Returns true if all tasks for `day` are completed in `progress`. */
export function isDayComplete(day, progress) {
  const tasks = DAYS_MAP[day] || [];
  if (tasks.length === 0) return false;
  const dayProg = progress[day] || [];
  return tasks.every((_, i) => !!dayProg[i]);
}

/**
 * Calculate current streak and longest streak from progress.
 * Streak = consecutive completed days ending on today (or yesterday if
 * today isn't done yet — so the streak doesn't reset mid-day).
 */
export function calcStreaks(progress) {
  const todayDay = dateToDayNumber(new Date());

  // Current streak: walk backwards from today
  let current = 0;
  for (let d = todayDay; d >= 1; d--) {
    if (isDayComplete(d, progress)) {
      current++;
    } else {
      // Allow today to be incomplete without breaking streak
      if (d === todayDay) continue;
      break;
    }
  }

  // Longest streak: sliding window over all days so far
  let longest = 0, run = 0;
  for (let d = 1; d <= todayDay; d++) {
    if (isDayComplete(d, progress)) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  return { current, longest };
}
