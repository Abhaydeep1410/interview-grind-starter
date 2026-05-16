import { DAYS_MAP, CATEGORY_COLORS } from '../data';
import { CAT_ICONS } from '../constants';
import { calcUserPoints, calcUserDaysCompleted, totalPossiblePoints } from '../utils/helpers';

// ── StatsBar ──────────────────────────────────────────────────────────────

export default function StatsBar({ progress }) {
  const pts = calcUserPoints(progress);
  const days = calcUserDaysCompleted(progress);
  const total = totalPossiblePoints();
  const pct = Math.round((pts / total) * 100);

  // Count completed tasks per category
  const catEarned = { LC: 0, Pattern: 0, Spring: 0, System: 0, Behavioral: 0 };
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
    tasks.forEach((done, i) => {
      if (done && dayTasks[i]) {
        const cat = dayTasks[i].category;
        catEarned[cat] = (catEarned[cat] || 0) + 1;
      }
    });
  }

  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 4px' }}>Your Progress</p>
          <h3 style={{ color: '#e2e8f0', fontSize: 24, margin: 0, fontWeight: 700 }}>
            {pts} <span style={{ color: '#4b5563', fontSize: 14, fontWeight: 400 }}>/ {total} pts</span>
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 4px' }}>Days Done</p>
          <h3 style={{ color: '#fcd34d', fontSize: 24, margin: 0, fontWeight: 700 }}>
            {days} <span style={{ color: '#4b5563', fontSize: 14, fontWeight: 400 }}>/ 84</span>
          </h3>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#0a0a0f', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6ee7b7,#34d399)', borderRadius: 6, transition: 'width 0.6s ease' }} />
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(catEarned).map(([cat, cnt]) => (
          <span key={cat} style={{ background: CATEGORY_COLORS[cat] + '18', color: CATEGORY_COLORS[cat], fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>
            {CAT_ICONS[cat]} {cat}: {cnt}
          </span>
        ))}
      </div>
    </div>
  );
}
