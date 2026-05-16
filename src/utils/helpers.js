import { DAYS_MAP, CATEGORY_POINTS, getDayPoints } from '../data';

// ── Points & progress calculations ────────────────────────────────────────

export function totalPossiblePoints() {
  return Object.values(DAYS_MAP).reduce((s, tasks) => s + getDayPoints(tasks), 0);
}

export function calcUserPoints(progress) {
  let pts = 0;
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
    tasks.forEach((done, i) => {
      if (done && dayTasks[i]) pts += CATEGORY_POINTS[dayTasks[i].category] || 1;
    });
  }
  return pts;
}

export function calcUserDaysCompleted(progress) {
  let days = 0;
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
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
