import { totalPossiblePoints } from '../utils/helpers';

// ── Leaderboard ───────────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ users, currentUserId }) {
  const sorted = [...users].sort((a, b) => b.points - a.points);
  const total = totalPossiblePoints();

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>🏆 Leaderboard</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((u, i) => {
          const isMe = u.id === currentUserId;
          const pct = Math.round((u.points / total) * 100);
          return (
            <div
              key={u.id}
              style={{ background: isMe ? 'rgba(110,231,183,0.06)' : '#111118', border: `1px solid ${isMe ? '#6ee7b7' : '#1e1e2e'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <span style={{ fontSize: 22, minWidth: 30, textAlign: 'center' }}>
                {MEDALS[i] || `#${i + 1}`}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: isMe ? '#6ee7b7' : '#e2e8f0', fontWeight: 600, fontSize: 14 }}>
                    {u.name} {isMe && <span style={{ fontSize: 11 }}>(you)</span>}
                  </span>
                  <span style={{ color: '#fcd34d', fontWeight: 700, fontSize: 14 }}>{u.points} pts</span>
                </div>
                <div style={{ background: '#0a0a0f', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: 'linear-gradient(90deg,#6ee7b7,#34d399)', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: '#4b5563', fontSize: 11 }}>{u.daysCompleted} days fully done</span>
                  <span style={{ color: '#4b5563', fontSize: 11 }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p style={{ color: '#4b5563', fontSize: 13, textAlign: 'center' }}>No users yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
