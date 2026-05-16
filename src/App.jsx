import { useState, useCallback } from 'react';
import { DAYS_MAP, getMonth } from './data';
import { MAINTENANCE_MODE, GEMINI_API_KEY, MONTH_NAMES } from './constants';
import { getTodayDay, calcUserPoints } from './utils/helpers';
import { useAuth }                from './hooks/useAuth';
import { useProgress, useLeaderboard } from './hooks/useProgress';
import { useNotes }               from './hooks/useNotes';
import { useConfetti }            from './hooks/useConfetti';

import MaintenancePage  from './components/MaintenancePage';
import JoinModal        from './components/JoinModal';
import ValidationModal  from './components/ValidationModal';
import NoteModal        from './components/NoteModal';
import DayView          from './components/DayView';
import StatsBar         from './components/StatsBar';
import Leaderboard      from './components/Leaderboard';
import StreakBadge      from './components/StreakBadge';
import HeatmapCalendar  from './components/HeatmapCalendar';
import XPBar            from './components/XPBar';
import BadgeShelf       from './components/BadgeShelf';

export default function App() {
  if (MAINTENANCE_MODE) return <MaintenancePage />;

  const { user, join, logout }                       = useAuth();
  const { progress, saving, markDone, markUndone }   = useProgress(user);
  const { notes, saveNote, getNote }                 = useNotes(user);
  const allUsers                                     = useLeaderboard(user);

  useConfetti(progress);

  const [tab, setTab]                     = useState('today');
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [validating, setValidating]       = useState(null);
  const [notingTask, setNotingTask]       = useState(null);
  const [pendingNote, setPendingNote]     = useState(null);

  const todayDay  = getTodayDay();
  const monthDays = Array.from({ length: 84 }, (_, i) => i + 1).filter(
    (d) => getMonth(d) === selectedMonth
  );

  // const handleToggle = useCallback(
  //   (day, taskIdx) => {
  //     if (!user) return;
  //     const dayProg = progress[day] || [];
  //     if (dayProg[taskIdx]) markUndone(day, taskIdx);
  //     else setValidating({ day, taskIdx });
  //   },
  //   [user, progress, markUndone]
  // );

  const handleToggle = useCallback(
  (day, taskIdx) => {
    if (!user) return;

    const dayProg = progress[day] || [];

    if (dayProg[taskIdx]) {
      markUndone(day, taskIdx);
    } else {
      markDone(day, taskIdx);

      // optional: open notes after completion
      setPendingNote({ day, taskIdx });
    }
  },
  [user, progress, markDone, markUndone]
);
  const handleValidationApproved = useCallback(() => {
    if (!validating) return;
    markDone(validating.day, validating.taskIdx);
    setPendingNote({ day: validating.day, taskIdx: validating.taskIdx });
  }, [validating, markDone]);

  const handleHeatmapClick = useCallback((day) => {
    const month = getMonth(day);
    setSelectedMonth(month);
    setTab('month');
  }, []);

  if (!user) return <JoinModal onJoin={join} />;

  const points = calcUserPoints(progress);

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 600,
    background: tab === t ? 'rgba(110,231,183,0.12)' : 'transparent',
    color:      tab === t ? '#6ee7b7' : '#4b5563',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Space Mono', monospace", color: '#e2e8f0' }}>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid #1e1e2e', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 14 }}>⚔️ 84-Day Grind</span>
          <span style={{ color: '#1e1e2e' }}>|</span>
          <span style={{ color: '#4b5563', fontSize: 11 }}>Day {todayDay}/84</span>
          <StreakBadge progress={progress} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saving && <span style={{ color: '#34d399', fontSize: 11 }}>saving…</span>}
          <span style={{ color: '#9ca3af', fontSize: 12 }}>{user.name}</span>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #1e1e2e', color: '#4b5563', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Switch User</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 4, borderBottom: '1px solid #111118' }}>
        {[['today','📅 Today'],['month','📚 Browse'],['board','🏆 Rankings'],['profile','🏅 Profile']].map(([k,l]) => (
          <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px' }}>

        {tab === 'today' && (
          <div>
            <XPBar points={points} />
            <StatsBar progress={progress} />
            <HeatmapCalendar progress={progress} onDayClick={handleHeatmapClick} />
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#e2e8f0', fontSize: 15, margin: '0 0 4px' }}>Day {todayDay} — {DAYS_MAP[todayDay]?.[0]?.date}</h3>
              <p style={{ color: '#4b5563', fontSize: 12, margin: 0 }}>{DAYS_MAP[todayDay]?.[0]?.week}</p>
            </div>
            <DayView day={todayDay} progress={progress} notes={notes} onToggle={handleToggle} onNoteClick={(d,i) => setNotingTask({ day:d, taskIdx:i })} />
            {todayDay > 1 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: '#374151', fontSize: 12, marginBottom: 12 }}>Yesterday</p>
                <DayView day={todayDay-1} progress={progress} notes={notes} onToggle={handleToggle} onNoteClick={(d,i) => setNotingTask({ day:d, taskIdx:i })} />
              </div>
            )}
          </div>
        )}

        {tab === 'month' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[1,2,3].map(m => (
                <button key={m} onClick={() => setSelectedMonth(m)} style={{ padding: '8px 16px', borderRadius: 10, background: selectedMonth===m ? 'rgba(110,231,183,0.12)' : '#111118', color: selectedMonth===m ? '#6ee7b7' : '#4b5563', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, border: selectedMonth===m ? '1px solid rgba(110,231,183,0.3)' : '1px solid #1e1e2e' }}>M{m}</button>
              ))}
            </div>
            <p style={{ color: '#374151', fontSize: 12, marginBottom: 16 }}>{MONTH_NAMES[selectedMonth]} · {monthDays.length} days</p>
            {monthDays.map(d => (
              <DayView key={d} day={d} progress={progress} notes={notes} onToggle={handleToggle} onNoteClick={(day,i) => setNotingTask({ day, taskIdx:i })} />
            ))}
          </div>
        )}

        {tab === 'board' && (
          <div>
            <StatsBar progress={progress} />
            <Leaderboard users={allUsers} currentUserId={user.id} />
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <XPBar points={points} />
            <BadgeShelf progress={progress} />
            <HeatmapCalendar progress={progress} onDayClick={handleHeatmapClick} />
          </div>
        )}
      </div>

      {validating && (
        <ValidationModal
          task={DAYS_MAP[validating.day]?.[validating.taskIdx]?.task}
          category={DAYS_MAP[validating.day]?.[validating.taskIdx]?.category}
          apiKey={GEMINI_API_KEY}
          onClose={() => setValidating(null)}
          onApproved={() => { handleValidationApproved(); setValidating(null); }}
        />
      )}

      {pendingNote && (
        <NoteModal
          task={DAYS_MAP[pendingNote.day]?.[pendingNote.taskIdx]?.task}
          category={DAYS_MAP[pendingNote.day]?.[pendingNote.taskIdx]?.category}
          day={pendingNote.day} taskIdx={pendingNote.taskIdx}
          initialNote={getNote(pendingNote.day, pendingNote.taskIdx)}
          onSave={saveNote} onClose={() => setPendingNote(null)}
        />
      )}

      {notingTask && (
        <NoteModal
          task={DAYS_MAP[notingTask.day]?.[notingTask.taskIdx]?.task}
          category={DAYS_MAP[notingTask.day]?.[notingTask.taskIdx]?.category}
          day={notingTask.day} taskIdx={notingTask.taskIdx}
          initialNote={getNote(notingTask.day, notingTask.taskIdx)}
          onSave={saveNote} onClose={() => setNotingTask(null)}
        />
      )}
    </div>
  );
}
