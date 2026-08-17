import { DAYS_MAP } from '../data';
import { DEVOPS_DAYS_MAP } from '../devopsData';

// ── Streak helpers ────────────────────────────────────────────────────────
// A "completed day" = every task in that day is marked done.
// Days are numbered 1-84 (interview) or 1-50 (devops), anchored to the
// same campaign start date.

const CAMPAIGN_START = new Date('2026-05-10T00:00:00+05:30');

const TRACK_MAX_DAYS = { interview: 84, devops: 50 };

function getDaysMapForTrack(track) {
  return track === 'devops' ? DEVOPS_DAYS_MAP : DAYS_MAP;
}

/** Return the campaign day number for a given Date, clamped to the track's length. */
export function dateToDayNumber(date, track = 'interview') {
  const maxDays = TRACK_MAX_DAYS[track] || 84;
  const diff = Math.floor((date - CAMPAIGN_START) / 86400000) + 1;
  return Math.max(1, Math.min(maxDays, diff));
}

/** Returns true if all tasks for `day` are completed in `progress`. */
export function isDayComplete(day, progress, track = 'interview') {
  const daysMap = getDaysMapForTrack(track);
  const tasks = daysMap[day] || [];
  if (tasks.length === 0) return false;
  const dayProg = progress[day] || [];
  return tasks.every((_, i) => !!dayProg[i]);
}

/**
 * Calculate current streak and longest streak from progress.
 * Streak = consecutive completed days ending on today (or yesterday if
 * today isn't done yet — so the streak doesn't reset mid-day).
 */
export function calcStreaks(progress, track = 'interview') {
  const todayDay = dateToDayNumber(new Date(), track);

  // Current streak: walk backwards from today
  let current = 0;
  for (let d = todayDay; d >= 1; d--) {
    if (isDayComplete(d, progress, track)) {
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
    if (isDayComplete(d, progress, track)) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  return { current, longest };
}