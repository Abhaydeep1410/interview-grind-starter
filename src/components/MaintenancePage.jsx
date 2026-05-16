// ── MaintenancePage ───────────────────────────────────────────────────────

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Mono', monospace", overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        animation: 'gridPulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 70%)',
        borderRadius: '50%', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'breathe 3s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes gridPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes breathe  { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.6} 50%{transform:translate(-50%,-50%) scale(1.2);opacity:1} }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 24px', animation: 'slideUp 0.6s ease both' }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>⚙️</div>
        <div style={{
          display: 'inline-block', background: 'rgba(110,231,183,0.08)',
          border: '1px solid rgba(110,231,183,0.2)', borderRadius: 8,
          padding: '4px 14px', marginBottom: 20,
        }}>
          <span style={{ color: '#6ee7b7', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>MAINTENANCE MODE</span>
        </div>
        <h1 style={{ color: '#e2e8f0', fontSize: 28, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.3 }}>
          We'll be right back
        </h1>
        <p style={{ color: '#4b5563', fontSize: 13, maxWidth: 340, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Sharpening the blades — back shortly.<br />Your progress is safe.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#374151', fontSize: 12 }}>
          <span>fixing things</span>
          <span style={{ animation: 'blink 1s step-end infinite', color: '#6ee7b7' }}>▊</span>
        </div>
      </div>
    </div>
  );
}
