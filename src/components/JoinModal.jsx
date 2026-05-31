import { useState } from 'react';

// ── JoinModal ─────────────────────────────────────────────────────────────
// Two modes:
//   reauth=false  →  full join/login form (new user or switching user)
//   reauth=true   →  compact "Welcome back, enter password" prompt
//                    shown on page refresh when user is in localStorage
//                    but rawPassword is not in memory

export default function JoinModal({ onJoin, onReauth, reauth = false, userName = '' }) {
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  async function handleSubmit() {
    setErr('');
    if (reauth) {
      if (!password.trim()) return setErr('Enter your password');
      setLoading(true);
      try { await onReauth(password.trim()); }
      catch (e) { setErr(e.message || 'Wrong password'); }
      setLoading(false);
      return;
    }

    const n = name.trim(), p = password.trim();
    if (!n) return setErr('Enter your name');
    if (n.length < 2) return setErr('Name too short');
    if (!p) return setErr('Enter a password');
    if (p.length < 4) return setErr('Password must be at least 4 characters');
    setLoading(true);
    try { await onJoin(n, p); }
    catch (e) { setErr(e.message || 'Could not connect. Check your Firebase config.'); }
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: `1px solid ${err ? '#ef4444' : '#2a2a3a'}`,
    background: '#0a0a0f', color: '#e2e8f0', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    marginBottom: 10,
  };

  // ── Re-auth prompt ────────────────────────────────────────────────────
  if (reauth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace" }}>
        <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: '40px 48px', maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 0 80px rgba(110,231,183,0.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>👋</div>
          <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Welcome back, {userName}</h2>
          <p style={{ color: '#4b5563', fontSize: 12, margin: '0 0 24px', lineHeight: 1.6 }}>
            Enter your password to continue.<br />
            <span style={{ color: '#374151', fontSize: 11 }}>This keeps your GitHub token secure.</span>
          </p>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Your password…"
            autoFocus
            style={inputStyle}
          />
          {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{err}</p>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)', border: 'none', color: '#0a1a10', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Verifying…' : 'Continue →'}
          </button>
          <button
            onClick={() => { localStorage.removeItem('tracker_user'); window.location.reload(); }}
            style={{ background: 'transparent', border: 'none', color: '#374151', fontSize: 11, marginTop: 16, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Not you? Switch user
          </button>
        </div>
      </div>
    );
  }

  // ── Full join/login form ──────────────────────────────────────────────
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
          onChange={e => { setName(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Your name…"
          autoFocus
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Password…"
          style={inputStyle}
        />
        {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{err}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)', border: 'none', color: '#0a1a10', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Connecting…' : "Let's Go →"}
        </button>
        <p style={{ color: '#374151', fontSize: 11, marginTop: 20 }}>New? Pick a password — it'll be saved. Returning? Same name + password.</p>
      </div>
    </div>
  );
}