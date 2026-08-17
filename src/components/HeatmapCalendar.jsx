import { DAYS_MAP, CATEGORY_POINTS } from '../data';
import { isDayComplete, dateToDayNumber } from '../utils/streakUtils';

// ── HeatmapCalendar ───────────────────────────────────────────────────────
// Cells arranged in columns × 7 rows (week-major layout).
// Cell color intensity = fraction of points earned that day.

const CAMPAIGN_START = new Date('2026-05-10T00:00:00+05:30');

function dayNumberToDate(dayNum) {
  const d = new Date(CAMPAIGN_START);
  d.setDate(d.getDate() + dayNum - 1);
  return d;
}

function getIntensity(day, progress, daysMap, categoryPoints) {
  const tasks = daysMap[day] || [];
  if (tasks.length === 0) return 0;
  const dayProg = progress[day] || [];
  const earned = tasks.reduce((s, t, i) => s + (dayProg[i] ? (categoryPoints[t.category] || 1) : 0), 0);
  const total  = tasks.reduce((s, t) => s + (categoryPoints[t.category] || 1), 0);
  return total > 0 ? earned / total : 0;
}

function intensityToColor(intensity, isFuture) {
  if (isFuture) return 'rgba(255,255,255,0.03)';
  if (intensity === 0) return '#1a1a2e';
  if (intensity < 0.4) return '#134e35';
  if (intensity < 0.7) return '#16a34a';
  if (intensity < 1)   return '#22c55e';
  return '#6ee7b7';          // full day = brightest
}

const MONTH_LABELS = ['May', 'Jun', 'Jul'];

export default function HeatmapCalendar({
  progress,
  onDayClick,
  daysMap = DAYS_MAP,
  categoryPoints = CATEGORY_POINTS,
  totalDays = 84,
  track = 'interview',
}) {
  const todayDay = dateToDayNumber(new Date(), track);

  // weeks × 7 days, sized to the active track's length
  const numWeeks = Math.ceil(totalDays / 7);
  const weeks = Array.from({ length: numWeeks }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) => wi * 7 + di + 1)
  );

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
      <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>📅 Activity Heatmap</h3>

      {/* Month labels — roughly over weeks 1-4, 5-8, 9-12 (interview track only) */}
      {track === 'interview' && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 28 }}>
          {MONTH_LABELS.map((m, i) => (
            <div key={m} style={{ flex: 4, color: '#4b5563', fontSize: 10 }}>{m}</div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {/* Day-of-week labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 0 }}>
          {DAY_LABELS.map((l, i) => (
            <div key={i} style={{ height: 14, color: '#374151', fontSize: 9, display: 'flex', alignItems: 'center' }}>{l}</div>
          ))}
        </div>

        {/* Grid: columns = weeks, rows = days */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              {week.map((day) => {
                if (day > totalDays) return <div key={day} style={{ height: 14 }} />;
                const isFuture   = day > todayDay;
                const isToday    = day === todayDay;
                const intensity  = getIntensity(day, progress, daysMap, categoryPoints);
                const complete   = isDayComplete(day, progress, track);
                const date       = dayNumberToDate(day);
                const label      = `Day ${day} · ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · ${Math.round(intensity * 100)}% done`;

                return (
                  <div
                    key={day}
                    title={label}
                    onClick={() => !isFuture && onDayClick?.(day)}
                    style={{
                      height: 14, borderRadius: 3, cursor: isFuture ? 'default' : 'pointer',
                      background: intensityToColor(intensity, isFuture),
                      border: isToday ? '1px solid #6ee7b7' : '1px solid transparent',
                      transition: 'transform 0.1s',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => { if (!isFuture) e.currentTarget.style.transform = 'scale(1.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ color: '#374151', fontSize: 10 }}>Less</span>
        {['#1a1a2e', '#134e35', '#16a34a', '#22c55e', '#6ee7b7'].map(c => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
        ))}
        <span style={{ color: '#374151', fontSize: 10 }}>More</span>
      </div>
    </div>
  );
}