import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, CATEGORY_POINTS } from '../data';
import { CAT_ICONS } from '../constants';

// ── NoteModal ─────────────────────────────────────────────────────────────
// Opens after validation or from the ✎ button on a completed task.
// If githubCommit is provided, also pushes note to GitHub on save.

export default function NoteModal({
  task, category, day, taskIdx,
  initialNote, onSave, onClose,
  githubCommit,   // optional: async fn({ day, taskIdx, task, category, note }) → { url }
  isGitHubConnected = false,
}) {
  const [text, setText]         = useState(initialNote || '');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [ghState, setGhState]   = useState('idle');   // idle | pushing | pushed | error
  const [ghUrl, setGhUrl]       = useState(null);
  const [ghError, setGhError]   = useState('');

  useEffect(() => { setText(initialNote || ''); setSaveState('idle'); setGhState('idle'); setGhUrl(null); }, [day, taskIdx, initialNote]);

  async function handleSave() {
    setSaveState('saving');
    setGhState('idle');
    setGhUrl(null);

    // 1. Save locally (Firestore via onSave)
    try {
      await onSave(day, taskIdx, text);
      setSaveState('saved');
    } catch {
      setSaveState('error');
      return;
    }

    // 2. Push to GitHub if connected
    if (isGitHubConnected && githubCommit && text.trim()) {
      setGhState('pushing');
      try {
        const result = await githubCommit({ day, taskIdx, task, category, note: text });
        setGhUrl(result?.url || null);
        setGhState('pushed');
      } catch (e) {
        setGhError(e.message || 'GitHub commit failed.');
        setGhState('error');
      }
    }

    // Auto-close after a beat if no GitHub or GitHub succeeded
    setTimeout(() => {
      if (ghState !== 'error') onClose();
    }, 1600);
  }

  const isBusy = saveState === 'saving' || ghState === 'pushing';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <span style={{ background: CATEGORY_COLORS[category] + '22', color: CATEGORY_COLORS[category], fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              {CAT_ICONS[category]} {category}
            </span>
            <p style={{ color: '#6b7280', fontSize: 11, margin: '6px 0 0' }}>📝 Notes · Day {day} · Task {taskIdx + 1}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>{task}</p>

        {/* Textarea */}
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Key insight, gotcha, complexity, or anything worth remembering..."
          rows={6}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#e2e8f0', fontSize: 13, fontFamily: "'Space Mono', monospace", outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
        />

        {/* GitHub status row */}
        {isGitHubConnected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px' }}>
            <span style={{ fontSize: 13 }}>🐙</span>
            {ghState === 'idle'    && <span style={{ color: '#374151', fontSize: 11 }}>Will also commit to GitHub</span>}
            {ghState === 'pushing' && <span style={{ color: '#fcd34d', fontSize: 11 }}>Committing to GitHub…</span>}
            {ghState === 'pushed'  && (
              <span style={{ color: '#6ee7b7', fontSize: 11 }}>
                Committed! {ghUrl && <a href={ghUrl} target="_blank" rel="noreferrer" style={{ color: '#6ee7b7', marginLeft: 4 }}>View file ↗</a>}
              </span>
            )}
            {ghState === 'error'   && <span style={{ color: '#f87171', fontSize: 11 }}>⚠ {ghError}</span>}
          </div>
        )}

        {/* Save status */}
        {saveState === 'error' && (
          <p style={{ color: '#f87171', fontSize: 11, margin: '4px 0' }}>❌ Failed to save locally. Try again.</p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #2a2a3a', background: 'transparent', color: '#6b7280', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={isBusy}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: saveState === 'saved' ? 'rgba(110,231,183,0.15)' : isBusy ? '#1a1a2e' : 'linear-gradient(135deg,#6ee7b7,#34d399)', color: saveState === 'saved' ? '#6ee7b7' : isBusy ? '#4b5563' : '#0a1a10', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, cursor: isBusy ? 'wait' : 'pointer', transition: 'all 0.2s' }}
          >
            {saveState === 'saving'  ? 'Saving…'
           : ghState  === 'pushing' ? '🐙 Pushing to GitHub…'
           : saveState === 'saved'   ? '✓ Saved!'
           : 'Save Note →'}
          </button>
        </div>
      </div>
    </div>
  );
}
