import { getLevelInfo } from '../utils/xpUtils';

// ── XPBar ─────────────────────────────────────────────────────────────────
// Shows current level title, XP bar to next level, and level number badge.

export default function XPBar({ points }) {
  const { current, nextLevel, progress } = getLevelInfo(points);

  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 14, padding: '16px 24px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Level badge */}
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6ee7b7,#34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a1a10', fontWeight: 900, fontSize: 14, flexShrink: 0,
          }}>
            {current.level}
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: 10, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 1 }}>Level {current.level}</p>
            <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0, fontWeight: 700 }}>{current.title}</p>
          </div>
        </div>
        {nextLevel ? (
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#4b5563', fontSize: 10, margin: '0 0 2px' }}>Next: {nextLevel.title}</p>
            <p style={{ color: '#fcd34d', fontSize: 12, margin: 0, fontWeight: 600 }}>
              {nextLevel.minPts - points} pts to go
            </p>
          </div>
        ) : (
          <span style={{ color: '#6ee7b7', fontSize: 12, fontWeight: 700 }}>✦ MAX LEVEL</span>
        )}
      </div>

      {/* XP bar */}
      <div style={{ background: '#0a0a0f', borderRadius: 6, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg,#a78bfa,#6ee7b7)',
          borderRadius: 6, transition: 'width 0.8s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ color: '#374151', fontSize: 10 }}>{points} pts</span>
        <span style={{ color: '#374151', fontSize: 10 }}>{nextLevel ? nextLevel.minPts : '∞'}</span>
      </div>
    </div>
  );
}
