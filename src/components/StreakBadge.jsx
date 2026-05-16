import { calcStreaks } from '../utils/streakUtils';

// ── StreakBadge ───────────────────────────────────────────────────────────
// Compact badge for the top nav. Shows current streak with a flame,
// and a tooltip with longest streak on hover.

export default function StreakBadge({ progress }) {
  const { current, longest } = calcStreaks(progress);
  if (current === 0 && longest === 0) return null;

  const hot = current >= 3;

  return (
    <div title={`Longest streak: ${longest} days`} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: hot ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${hot ? 'rgba(251,146,60,0.35)' : '#2a2a3a'}`,
      borderRadius: 20, padding: '4px 10px', cursor: 'default',
      transition: 'all 0.3s',
    }}>
      <span style={{ fontSize: 14, filter: current === 0 ? 'grayscale(1)' : 'none' }}>
        {hot ? '🔥' : '✦'}
      </span>
      <span style={{
        color: hot ? '#fb923c' : '#6b7280',
        fontSize: 12, fontWeight: 700,
      }}>
        {current}d
      </span>
    </div>
  );
}
