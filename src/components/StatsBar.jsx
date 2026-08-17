import { DAYS_MAP, CATEGORY_COLORS, CATEGORY_POINTS } from '../data';
import { CAT_ICONS } from '../constants';

// ── StatsBar ──────────────────────────────────────────────────────────────

export default function StatsBar({ progress, daysMap = DAYS_MAP, categoryPoints = CATEGORY_POINTS }) {
  // Compute points using the active track's daysMap + category weights
  function calcPoints(prog) {
    let pts = 0;
    for (const [dayStr, tasks] of Object.entries(prog || {})) {
      const dayTasks = daysMap[parseInt(dayStr)] || [];
      tasks.forEach((done, i) => {
        if (done && dayTasks[i]) pts += categoryPoints[dayTasks[i].category] || 1;
      });
    }
    return pts;
  }

  function calcDaysCompleted(prog) {
    let days = 0;
    for (const [dayStr, tasks] of Object.entries(prog || {})) {
      const dayTasks = daysMap[parseInt(dayStr)] || [];
      const allDone = dayTasks.length > 0 && tasks.every((d, i) => (i < dayTasks.length ? d : true));
      if (allDone) days++;
    }
    return days;
  }

  function calcTotal() {
    return Object.values(daysMap).reduce(
      (s, tasks) => s + tasks.reduce((sum, t) => sum + (categoryPoints[t.category] || 1), 0),
      0
    );
  }

  const pts = calcPoints(progress);
  const days = calcDaysCompleted(progress);
  const total = calcTotal();
  const pct = Math.round((pts / total) * 100);

  // Count completed tasks per category
  const catEarned = {};
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = daysMap[parseInt(dayStr)] || [];
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
            {days} <span style={{ color: '#4b5563', fontSize: 14, fontWeight: 400 }}>/ {Object.keys(daysMap).length}</span>
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