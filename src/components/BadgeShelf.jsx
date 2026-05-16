import { BADGES, getEarnedBadges } from '../utils/xpUtils';
import { calcUserPoints, calcUserDaysCompleted } from '../utils/helpers';
import { calcStreaks } from '../utils/streakUtils';
import { DAYS_MAP, CATEGORY_POINTS } from '../data';

// ── BadgeShelf ────────────────────────────────────────────────────────────

function buildCatCounts(progress) {
  const counts = {};
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
    tasks.forEach((done, i) => {
      if (done && dayTasks[i]) {
        const cat = dayTasks[i].category;
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
  }
  return counts;
}

export default function BadgeShelf({ progress }) {
  const points        = calcUserPoints(progress);
  const daysCompleted = calcUserDaysCompleted(progress);
  const { current: streak } = calcStreaks(progress);
  const catCounts     = buildCatCounts(progress);
  const earned        = new Set(getEarnedBadges({ points, daysCompleted, streak, catCounts }));

  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
      <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>
        🏅 Badges <span style={{ color: '#4b5563', fontWeight: 400, fontSize: 12 }}>({earned.size}/{BADGES.length})</span>
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
        {BADGES.map(badge => {
          const unlocked = earned.has(badge.id);
          return (
            <div
              key={badge.id}
              title={badge.desc}
              style={{
                background: unlocked ? 'rgba(110,231,183,0.06)' : '#0d0d18',
                border: `1px solid ${unlocked ? 'rgba(110,231,183,0.25)' : '#1a1a2e'}`,
                borderRadius: 10, padding: '12px 10px', textAlign: 'center',
                transition: 'all 0.2s', cursor: 'default',
                opacity: unlocked ? 1 : 0.45,
                filter: unlocked ? 'none' : 'grayscale(1)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{badge.icon}</div>
              <p style={{ color: unlocked ? '#e2e8f0' : '#4b5563', fontSize: 11, fontWeight: 700, margin: '0 0 3px', lineHeight: 1.3 }}>{badge.title}</p>
              <p style={{ color: '#374151', fontSize: 9, margin: 0, lineHeight: 1.4 }}>{badge.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
