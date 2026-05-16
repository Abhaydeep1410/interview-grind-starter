// ── XP Levels ─────────────────────────────────────────────────────────────
// Points come directly from calcUserPoints(); we map them to levels here.

export const LEVELS = [
  { level: 1, title: 'Recruit',        minPts: 0   },
  { level: 2, title: 'Apprentice',     minPts: 50  },
  { level: 3, title: 'Grinder',        minPts: 150 },
  { level: 4, title: 'Consistent',     minPts: 300 },
  { level: 5, title: 'Problem Solver', minPts: 500 },
  { level: 6, title: 'DSA Wizard',     minPts: 750 },
  { level: 7, title: 'System Thinker', minPts: 1000 },
  { level: 8, title: 'Interview Ready',minPts: 1300 },
  { level: 9, title: 'Elite',          minPts: 1600 },
  { level: 10,title: 'Legendary',      minPts: 2000 },
];

export function getLevelInfo(points) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.minPts) current = l;
    else break;
  }
  const nextLevel = LEVELS[current.level] || null; // LEVELS is 0-indexed, level is 1-indexed → neat
  const progress = nextLevel
    ? Math.round(((points - current.minPts) / (nextLevel.minPts - current.minPts)) * 100)
    : 100;
  return { current, nextLevel, progress };
}

// ── Badges ────────────────────────────────────────────────────────────────

export const BADGES = [
  {
    id: 'first_blood',
    icon: '🩸',
    title: 'First Blood',
    desc: 'Complete your very first task',
    check: ({ points }) => points >= 1,
  },
  {
    id: 'day_one',
    icon: '🌅',
    title: 'Day One',
    desc: 'Complete a full day',
    check: ({ daysCompleted }) => daysCompleted >= 1,
  },
  {
    id: 'week_warrior',
    icon: '⚔️',
    title: 'Week Warrior',
    desc: 'Complete 7 full days',
    check: ({ daysCompleted }) => daysCompleted >= 7,
  },
  {
    id: 'streak_3',
    icon: '🔥',
    title: 'On Fire',
    desc: '3-day streak',
    check: ({ streak }) => streak >= 3,
  },
  {
    id: 'streak_7',
    icon: '🌋',
    title: 'Unstoppable',
    desc: '7-day streak',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'streak_14',
    icon: '💎',
    title: 'Diamond Hands',
    desc: '14-day streak',
    check: ({ streak }) => streak >= 14,
  },
  {
    id: 'lc_10',
    icon: '⚡',
    title: 'LeetCode Grinder',
    desc: 'Complete 10 LC tasks',
    check: ({ catCounts }) => (catCounts.LC || 0) >= 10,
  },
  {
    id: 'system_5',
    icon: '🏗️',
    title: 'Architect',
    desc: 'Complete 5 System Design tasks',
    check: ({ catCounts }) => (catCounts.System || 0) >= 5,
  },
  {
    id: 'behavioral_5',
    icon: '🎭',
    title: 'Storyteller',
    desc: 'Complete 5 Behavioral tasks',
    check: ({ catCounts }) => (catCounts.Behavioral || 0) >= 5,
  },
  {
    id: 'halfway',
    icon: '🏁',
    title: 'Halfway There',
    desc: 'Complete 42 days',
    check: ({ daysCompleted }) => daysCompleted >= 42,
  },
  {
    id: 'finisher',
    icon: '🏆',
    title: 'The Finisher',
    desc: 'Complete all 84 days',
    check: ({ daysCompleted }) => daysCompleted >= 84,
  },
];

/** Returns array of earned badge ids */
export function getEarnedBadges({ points, daysCompleted, streak, catCounts }) {
  return BADGES.filter(b => b.check({ points, daysCompleted, streak, catCounts })).map(b => b.id);
}
