import { useState } from 'react';
import { totalPossiblePoints } from '../utils/helpers';
import { calcStreaks } from '../utils/streakUtils';

// ── Shared leaderboard row ────────────────────────────────────────────────

function LeaderboardRow({ user, rank, isMe, showStreak = true, track = 'interview' }) {
  const medals  = ['🥇', '🥈', '🥉'];
  const total   = totalPossiblePoints(track);
  const pct     = Math.round((user.points / total) * 100);
  const hot     = user.streak >= 3;

  return (
    <div style={{ background: isMe ? 'rgba(110,231,183,0.06)' : '#111118', border: `1px solid ${isMe ? '#6ee7b7' : '#1e1e2e'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontSize: 20, minWidth: 32, textAlign: 'center' }}>
        {medals[rank] || <span style={{ color: '#4b5563', fontSize: 13 }}>#{rank + 1}</span>}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ color: isMe ? '#6ee7b7' : '#e2e8f0', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name} {isMe && <span style={{ fontSize: 10, color: '#4b5563' }}>(you)</span>}
            </span>
            {showStreak && user.streak > 0 && (
              <span style={{ fontSize: 11, color: hot ? '#fb923c' : '#4b5563', flexShrink: 0 }}>
                {hot ? '🔥' : '✦'} {user.streak}d
              </span>
            )}
          </div>
          <span style={{ color: '#fcd34d', fontWeight: 700, fontSize: 13, flexShrink: 0, marginLeft: 8 }}>
            {user.points} pts
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ background: '#0a0a0f', borderRadius: 4, height: 4, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6ee7b7,#34d399)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#374151', fontSize: 10 }}>{user.daysCompleted} days done</span>
          <span style={{ color: '#374151', fontSize: 10 }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ── CreateGroupModal ──────────────────────────────────────────────────────

function CreateGroupModal({ onCreate, onClose }) {
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr]       = useState('');

  async function handle() {
    if (!name.trim()) return setErr('Enter a group name');
    setLoading(true);
    const res = await onCreate(name.trim());
    if (res.ok) setResult(res);
    else setErr(res.error);
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, margin: 0 }}>🏠 Create a Group</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {result ? (
          // Success state
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>{result.name || name} created!</p>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 20px' }}>Share this code with your crew:</p>
            <div style={{ background: '#0a0a0f', border: '1px solid rgba(110,231,183,0.3)', borderRadius: 12, padding: '16px 24px', marginBottom: 20 }}>
              <span style={{ color: '#6ee7b7', fontSize: 32, fontWeight: 900, letterSpacing: 8 }}>{result.code}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(result.code); }}
              style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid rgba(110,231,183,0.3)', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', marginBottom: 10 }}
            >
              Copy Code
            </button>
            <button onClick={onClose} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
              Done →
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 16px', lineHeight: 1.6 }}>
              A 5-character code will be generated. Share it with friends so they can join.
            </p>
            <input
              autoFocus
              value={name}
              onChange={e => { setName(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder="Group name, e.g. FAANG Batch 2026"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
            />
            {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>{err}</p>}
            <button onClick={handle} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: loading ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, cursor: loading ? 'wait' : 'pointer', marginTop: 4 }}>
              {loading ? 'Creating…' : 'Create Group →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── JoinGroupModal ────────────────────────────────────────────────────────

function JoinGroupModal({ onJoin, onClose }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [err, setErr]         = useState('');

  async function handle() {
    const c = code.trim().toUpperCase();
    if (c.length !== 5) return setErr('Code must be 5 characters');
    setLoading(true);
    const res = await onJoin(c);
    if (res.ok) { setSuccess(res.group?.name || c); }
    else setErr(res.error);
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, margin: 0 }}>🔑 Join a Group</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: '#6ee7b7', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>Joined!</p>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 20px' }}>You're now in <b style={{ color: '#9ca3af' }}>{success}</b></p>
            <button onClick={onClose} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
              See Rankings →
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 16px' }}>Enter the 5-character code from your group creator.</p>
            <input
              autoFocus
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 5)); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder="X K 9 2 A"
              style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#6ee7b7', fontSize: 22, fontWeight: 900, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: 8, marginBottom: 8 }}
            />
            {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 10px' }}>{err}</p>}
            <button onClick={handle} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: loading ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, cursor: loading ? 'wait' : 'pointer', marginTop: 4 }}>
              {loading ? 'Joining…' : 'Join Group →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── RankingsTab ───────────────────────────────────────────────────────────

export default function RankingsTab({
  currentUserId,
  allUsers,         // global leaderboard data
  groups,           // [{code, name, members}]
  groupMembers,     // { code: [...userStats] }
  loadingGroups,
  onCreate,
  onJoin,
  onLeave,
  userProgress,     // current user's progress (for streak)
  track = 'interview',
}) {
  const [activeTab, setActiveTab]       = useState('global');
  const [showCreate, setShowCreate]     = useState(false);
  const [showJoin, setShowJoin]         = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(null); // group code

  const tabStyle = active => ({
    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
    fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 600,
    background: active ? 'rgba(110,231,183,0.12)' : 'transparent',
    color:      active ? '#6ee7b7' : '#4b5563',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  });

  const sortedGlobal = [...allUsers].sort((a, b) => b.points - a.points);

  return (
    <div>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: 0 }}>🏆 Rankings</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowJoin(true)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #2a2a3a', background: 'transparent', color: '#9ca3af', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer' }}>
            🔑 Join Group
          </button>
          <button onClick={() => setShowCreate(true)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            + Create Group
          </button>
        </div>
      </div>

      {/* ── Tab strip: Global + one per group ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        <button style={tabStyle(activeTab === 'global')} onClick={() => setActiveTab('global')}>
          🌍 Global
        </button>
        {groups.map(g => (
          <button key={g.code} style={tabStyle(activeTab === g.code)} onClick={() => setActiveTab(g.code)}>
            {g.name}
          </button>
        ))}
      </div>

      {/* ── Global leaderboard ── */}
      {activeTab === 'global' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedGlobal.length === 0 && (
            <p style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No users yet.</p>
          )}
          {sortedGlobal.map((u, i) => (
            <LeaderboardRow key={u.id} user={u} rank={i} isMe={u.id === currentUserId} track={track} />
          ))}
        </div>
      )}

      {/* ── Group leaderboard ── */}
      {activeTab !== 'global' && (() => {
        const group   = groups.find(g => g.code === activeTab);
        const members = groupMembers[activeTab] || [];
        const sorted  = [...members].sort((a, b) => b.points - a.points);

        return (
          <div>
            {/* Group header */}
            <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, margin: '0 0 3px' }}>{group?.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#4b5563', fontSize: 11 }}>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                  <span style={{ color: '#1e1e2e' }}>·</span>
                  {/* Code chip + copy */}
                  <button
                    onClick={() => navigator.clipboard.writeText(activeTab)}
                    title="Copy group code"
                    style={{ background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#6ee7b7', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}
                  >
                    {activeTab} 📋
                  </button>
                </div>
              </div>
              <button
                onClick={() => setConfirmLeave(activeTab)}
                style={{ background: 'transparent', border: '1px solid #2a2a3a', color: '#4b5563', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}
              >
                Leave
              </button>
            </div>

            {loadingGroups ? (
              <p style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>Loading members…</p>
            ) : sorted.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No members yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sorted.map((u, i) => (
                  <LeaderboardRow key={u.id} user={u} rank={i} isMe={u.id === currentUserId} showStreak track={track} />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Your groups summary (shown on global tab if user has groups) ── */}
      {activeTab === 'global' && groups.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ color: '#374151', fontSize: 11, marginBottom: 10, letterSpacing: 1 }}>YOUR GROUPS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {groups.map(g => {
              const members = groupMembers[g.code] || [];
              const myRank  = [...members].sort((a,b) => b.points - a.points).findIndex(u => u.id === currentUserId);
              return (
                <div key={g.code} onClick={() => setActiveTab(g.code)} style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{g.name}</p>
                    <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>{members.length} members · code: <span style={{ color: '#6ee7b7' }}>{g.code}</span></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {myRank >= 0 && <p style={{ color: '#fcd34d', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>#{myRank + 1}</p>}
                    <p style={{ color: '#374151', fontSize: 10, margin: 0 }}>your rank</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── No groups empty state ── */}
      {activeTab === 'global' && groups.length === 0 && (
        <div style={{ marginTop: 24, background: '#111118', border: '1px dashed #2a2a3a', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#374151', fontSize: 13, margin: '0 0 12px' }}>You're not in any groups yet.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setShowJoin(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #2a2a3a', background: 'transparent', color: '#6b7280', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>Join with code</button>
            <button onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Create one</button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <CreateGroupModal
          onCreate={async name => { const r = await onCreate(name); return r; }}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showJoin && (
        <JoinGroupModal
          onJoin={onJoin}
          onClose={() => setShowJoin(false)}
        />
      )}

      {/* ── Leave confirmation ── */}
      {confirmLeave && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20 }}>
          <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 14, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Leave group?</p>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 20px' }}>
              You'll be removed from <b style={{ color: '#9ca3af' }}>{groups.find(g => g.code === confirmLeave)?.name}</b>. You can rejoin with the code.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmLeave(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #2a2a3a', background: 'transparent', color: '#6b7280', fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  await onLeave(confirmLeave);
                  setConfirmLeave(null);
                  setActiveTab('global');
                }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}