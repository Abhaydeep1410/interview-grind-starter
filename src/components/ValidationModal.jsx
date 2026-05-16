import { useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_POINTS } from '../data';
import { CAT_ICONS, CAT_PLACEHOLDERS } from '../constants';
import { validateWithGemini } from '../utils/geminiService';

// ── ValidationModal ───────────────────────────────────────────────────────

export default function ValidationModal({ task, category, apiKey, onClose, onApproved }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    if (answer.trim().length < 30) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await validateWithGemini(task, category, answer, apiKey);
      setResult(res);
      if (res.approved) setTimeout(() => { onApproved(); onClose(); }, 1500);
    } catch {
      setResult({ approved: false, feedback: 'API error. Check your Gemini API key.', score: 0 });
    }
    setLoading(false);
  }

  const isReady = !loading && answer.trim().length >= 30 && !result?.approved;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <span style={{ background: CATEGORY_COLORS[category] + '22', color: CATEGORY_COLORS[category], fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
            {CAT_ICONS[category]} {category} · +{CATEGORY_POINTS[category]}pt
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <p style={{ color: '#e2e8f0', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>{task}</p>
        <p style={{ color: '#6b7280', fontSize: 11, margin: '0 0 8px' }}>🤖 Will verify your answer before marking this done</p>

        {/* Textarea */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={CAT_PLACEHOLDERS[category] || 'Explain your understanding...'}
          rows={7}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #2a2a3a', background: '#0a0a0f', color: '#e2e8f0', fontSize: 13, fontFamily: "'Space Mono', monospace", outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
        />
        <p style={{ color: '#374151', fontSize: 11, margin: '4px 0 16px' }}>
          {answer.trim().length}/30 min chars {answer.trim().length >= 30 ? '✓' : ''}
        </p>

        {/* Result banner */}
        {result && (
          <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: result.approved ? 'rgba(110,231,183,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${result.approved ? 'rgba(110,231,183,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: result.approved ? '#6ee7b7' : '#f87171', fontWeight: 700, fontSize: 13 }}>
                {result.approved ? '✅ Approved!' : '❌ Not quite'}
              </span>
              <span style={{ color: '#fcd34d', fontSize: 12 }}>Score: {result.score}/10</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{result.feedback}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: isReady ? 'linear-gradient(135deg,#6ee7b7,#34d399)' : '#1a1a2e', color: isReady ? '#0a1a10' : '#4b5563', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', cursor: isReady ? 'pointer' : 'not-allowed' }}
        >
          {loading ? '🤖 Validating…' : result && !result.approved ? 'Try Again →' : 'Submit for Validation →'}
        </button>
      </div>
    </div>
  );
}
