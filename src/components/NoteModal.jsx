import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, CATEGORY_POINTS } from '../data';
import { CAT_ICONS } from '../constants';

// ── NoteModal ─────────────────────────────────────────────────────────────
// Opens after a task is validated+approved, lets user jot a quick note.
// Also accessible by clicking the note icon on any completed task.

export default function NoteModal({ task, category, day, taskIdx, initialNote, onSave, onClose }) {
  const [text, setText] = useState(initialNote || '');
  const [saved, setSaved] = useState(false);

  // Reset when different task is opened
  useEffect(() => { setText(initialNote || ''); setSaved(false); }, [day, taskIdx, initialNote]);

  async function handleSave() {
    await onSave(day, taskIdx, text);
    setSaved(true);
    setTimeout(onClose, 800);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <span style={{ background: CATEGORY_COLORS[category] + '22', color: CATEGORY_COLORS[category], fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              {CAT_ICONS[category]} {category}
            </span>
            <p style={{ color: '#6b7280', fontSize: 11, margin: '6px 0 0' }}>📝 Your notes · Day {day} · Task {taskIdx + 1}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>{task}</p>

        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Key insight, gotcha, complexity, or anything worth remembering..."
          rows={6}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#e2e8f0', fontSize: 13, fontFamily: "'Space Mono', monospace", outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #2a2a3a', background: 'transparent', color: '#6b7280', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
            Skip
          </button>
          <button onClick={handleSave} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: saved ? 'rgba(110,231,183,0.15)' : 'linear-gradient(135deg,#6ee7b7,#34d399)', color: saved ? '#6ee7b7' : '#0a1a10', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
            {saved ? '✓ Saved!' : 'Save Note →'}
          </button>
        </div>
      </div>
    </div>
  );
}
