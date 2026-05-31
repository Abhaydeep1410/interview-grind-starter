import { useState } from 'react';

// ── GitHubConnect ─────────────────────────────────────────────────────────

export default function GitHubConnect({ config, isConnected, onSave, onDisconnect }) {
  const [tokenType, setTokenType] = useState('classic'); // 'classic' | 'fine'
  const [pat, setPat]             = useState('');
  const [repo, setRepo]           = useState('');
  const [showPat, setShowPat]     = useState(false);
  const [status, setStatus]       = useState(null); // null | 'testing' | 'ok' | { error }

  async function handleSave() {
    const p = pat.trim(), r = repo.trim();
    if (!p) return setStatus({ error: 'Enter your Personal Access Token.' });
    if (!r || !r.includes('/')) return setStatus({ error: "Use owner/repo format — e.g. arjun/interview-notes" });
    setStatus('testing');
    const result = await onSave(p, r);
    if (result.ok) { setStatus('ok'); setPat(''); }
    else setStatus({ error: result.error });
  }

  // ── Connected ─────────────────────────────────────────────────────────
  if (isConnected) {
    return (
      <div style={{ background: 'rgba(110,231,183,0.05)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(110,231,183,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐙</div>
            <div>
              <p style={{ color: '#6ee7b7', fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>GitHub Connected</p>
              <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>Notes commit to <span style={{ color: '#9ca3af' }}>{config.repo}</span></p>
            </div>
          </div>
          <button onClick={onDisconnect} style={{ background: 'transparent', border: '1px solid #2a2a3a', color: '#6b7280', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>
            Disconnect
          </button>
        </div>
        {/* Commit path preview */}
        <div style={{ background: '#0a0a0f', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#374151', fontSize: 10, margin: '0 0 4px', letterSpacing: 1 }}>COMMIT PATH PATTERN</p>
          <code style={{ color: '#6b7280', fontSize: 11 }}>{config.repo}/interview-notes/day-XX/task-N-slug.md</code>
        </div>
      </div>
    );
  }

  // ── Setup form ────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>🐙</span>
        <div>
          <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, margin: 0 }}>Connect GitHub</p>
          <p style={{ color: '#4b5563', fontSize: 11, margin: '2px 0 0' }}>Auto-commit notes as markdown files to your repo</p>
        </div>
      </div>

      {/* Token type toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['classic', 'Classic Token'], ['fine', 'Fine-grained Token']].map(([k, l]) => (
          <button key={k} onClick={() => setTokenType(k)} style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${tokenType===k ? 'rgba(110,231,183,0.3)' : '#2a2a3a'}`, background: tokenType===k ? 'rgba(110,231,183,0.08)' : 'transparent', color: tokenType===k ? '#6ee7b7' : '#4b5563', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ background: '#0a0a0f', borderRadius: 8, padding: '12px 14px', marginBottom: 14, lineHeight: 1.8 }}>
        {tokenType === 'classic' ? (
          <>
            <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, margin: '0 0 6px' }}>How to create a Classic PAT:</p>
            <ol style={{ color: '#4b5563', fontSize: 11, margin: 0, paddingLeft: 16 }}>
              <li>GitHub → <b style={{ color: '#6b7280' }}>Settings</b></li>
              <li>Left sidebar → <b style={{ color: '#6b7280' }}>Developer settings</b></li>
              <li>Personal access tokens → <b style={{ color: '#6b7280' }}>Tokens (classic)</b></li>
              <li>Click <b style={{ color: '#6b7280' }}>Generate new token (classic)</b></li>
              <li>Check scope: <code style={{ color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', padding: '1px 5px', borderRadius: 4 }}>repo</code> (or just <code style={{ color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', padding: '1px 5px', borderRadius: 4 }}>public_repo</code> if your repo is public)</li>
              <li>Generate & copy the token</li>
            </ol>
            <a href="https://github.com/settings/tokens/new?scopes=repo&description=84-day-grind-notes" target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', marginTop: 10, color: '#6ee7b7', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(110,231,183,0.2)', borderRadius: 6, padding: '4px 10px' }}>
              Open GitHub token page ↗
            </a>
          </>
        ) : (
          <>
            <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, margin: '0 0 6px' }}>How to create a Fine-grained PAT:</p>
            <ol style={{ color: '#4b5563', fontSize: 11, margin: 0, paddingLeft: 16 }}>
              <li>GitHub → <b style={{ color: '#6b7280' }}>Settings</b></li>
              <li>Left sidebar → <b style={{ color: '#6b7280' }}>Developer settings</b></li>
              <li>Personal access tokens → <b style={{ color: '#6b7280' }}>Fine-grained tokens</b></li>
              <li>Click <b style={{ color: '#6b7280' }}>Generate new token</b></li>
              <li>Under <b style={{ color: '#6b7280' }}>Repository access</b> → select your repo</li>
              <li>Under <b style={{ color: '#6b7280' }}>Permissions → Contents</b> → set to <code style={{ color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', padding: '1px 5px', borderRadius: 4 }}>Read and Write</code></li>
              <li>No other permissions needed</li>
            </ol>
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', marginTop: 10, color: '#6ee7b7', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(110,231,183,0.2)', borderRadius: 6, padding: '4px 10px' }}>
              Open GitHub token page ↗
            </a>
          </>
        )}
      </div>

      {/* PAT input */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <input
          type={showPat ? 'text' : 'password'}
          value={pat}
          onChange={e => { setPat(e.target.value); setStatus(null); }}
          placeholder={tokenType === 'classic' ? 'ghp_xxxxxxxxxxxxxxxxxxxx' : 'github_pat_xxxxxxxxxxxx'}
          style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
        <button onClick={() => setShowPat(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: 13 }}>
          {showPat ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Repo input */}
      <input
        value={repo}
        onChange={e => { setRepo(e.target.value); setStatus(null); }}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        placeholder="owner/repo-name  (e.g. arjun/interview-notes)"
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
      />

      {/* Status */}
      {status === 'testing' && <p style={{ color: '#fcd34d', fontSize: 12, margin: '0 0 10px' }}>🔄 Testing connection…</p>}
      {status === 'ok'      && <p style={{ color: '#6ee7b7', fontSize: 12, margin: '0 0 10px' }}>✅ Connected successfully!</p>}
      {status?.error        && <p style={{ color: '#f87171', fontSize: 12, margin: '0 0 10px' }}>❌ {status.error}</p>}

      <button onClick={handleSave} disabled={status === 'testing'} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: status === 'testing' ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)', color: '#0a1a10', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: status === 'testing' ? 'wait' : 'pointer' }}>
        {status === 'testing' ? 'Connecting…' : 'Test & Save →'}
      </button>

      <p style={{ color: '#1e1e2e', fontSize: 10, margin: '10px 0 0', lineHeight: 1.6 }}>
        Token stored in your browser only. Never sent to our servers or Firestore.
      </p>
    </div>
  );
}