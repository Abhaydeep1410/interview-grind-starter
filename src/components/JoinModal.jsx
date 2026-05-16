import { useState } from 'react';

// ── JoinModal ─────────────────────────────────────────────────────────────

export default function JoinModal({ onJoin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleJoin() {
    const n = name.trim(), p = password.trim();
    if (!n) return setErr('Enter your name');
    if (n.length < 2) return setErr('Name too short');
    if (!p) return setErr('Enter a password');
    if (p.length < 4) return setErr('Password must be at least 4 characters');
    setLoading(true);
    try {
      await onJoin(n, p);
    } catch (e) {
      setErr(e.message || 'Could not connect. Check your Firebase config.');
    }
    setLoading(false);
  }

  const inputStyle = (hasErr) => ({
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: `1px solid ${hasErr ? '#ef4444' : '#2a2a3a'}`,
    background: '#0a0a0f', color: '#e2e8f0', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace" }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: '48px 56px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 0 80px rgba(110,231,183,0.06)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
        <h1 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>84-Day Interview Grind</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 32px', lineHeight: 1.6 }}>
          May – Jul · Product Company Edition<br />7 tasks/day · 84 days · compete with your crew
        </p>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setErr(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="Your name…"
          autoFocus
          style={{ ...inputStyle(!!err), marginBottom: 10 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErr(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="Password…"
          style={{ ...inputStyle(!!err), marginBottom: 8 }}
        />
        {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{err}</p>}
        <button
          onClick={handleJoin}
          disabled={loading}
          style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)', border: 'none', color: '#0a1a10', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Connecting…' : "Let's Go →"}
        </button>
        <p style={{ color: '#374151', fontSize: 11, marginTop: 20 }}>
          New? Pick a password — it'll be saved. Returning? Same name + password.
        </p>
      </div>
    </div>
  );
}
