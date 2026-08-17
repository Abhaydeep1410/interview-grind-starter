import { DAYS_MAP, CATEGORY_POINTS } from '../data';
import { DEVOPS_DAYS_MAP, DEVOPS_CATEGORY_POINTS } from '../devopsData';

// ── Track-aware lookups ──────────────────────────────────────────────────
// Every points/days calculation needs to know which track's map + category
// weights to use. Default is 'interview' so existing call sites that don't
// pass a track keep working exactly as before.

export function getDaysMapForTrack(track) {
  return track === 'devops' ? DEVOPS_DAYS_MAP : DAYS_MAP;
}

export function getCategoryPointsForTrack(track) {
  return track === 'devops' ? DEVOPS_CATEGORY_POINTS : CATEGORY_POINTS;
}

// ── Points & progress calculations ────────────────────────────────────────

export function totalPossiblePoints(track = 'interview') {
  const daysMap = getDaysMapForTrack(track);
  const catPoints = getCategoryPointsForTrack(track);
  return Object.values(daysMap).reduce(
    (s, tasks) => s + tasks.reduce((sum, t) => sum + (catPoints[t.category] || 1), 0),
    0
  );
}

export function calcUserPoints(progress, track = 'interview') {
  const daysMap = getDaysMapForTrack(track);
  const catPoints = getCategoryPointsForTrack(track);
  let pts = 0;
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = daysMap[parseInt(dayStr)] || [];
    tasks.forEach((done, i) => {
      if (done && dayTasks[i]) pts += catPoints[dayTasks[i].category] || 1;
    });
  }
  return pts;
}

export function calcUserDaysCompleted(progress, track = 'interview') {
  const daysMap = getDaysMapForTrack(track);
  let days = 0;
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = daysMap[parseInt(dayStr)] || [];
    const allDone =
      dayTasks.length > 0 && tasks.every((d, i) => (i < dayTasks.length ? d : true));
    if (allDone) days++;
  }
  return days;
}

export function getTodayDay() {
  const start = new Date('2026-05-10T00:00:00+05:30');
  const diff = Math.floor((new Date() - start) / 86400000) + 1;
  return Math.max(1, Math.min(84, diff));
}

// ── Auth helpers ──────────────────────────────────────────────────────────

export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function nameToId(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}