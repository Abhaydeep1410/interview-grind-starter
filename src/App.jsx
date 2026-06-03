import { useState, useCallback } from 'react';
import { DAYS_MAP, getMonth } from './data';
import { MAINTENANCE_MODE, MONTH_NAMES } from './constants';
import { getTodayDay, calcUserPoints } from './utils/helpers';
import { useAuth }                     from './hooks/useAuth';
import { useProgress, useLeaderboard } from './hooks/useProgress';
import { useGroups }                   from './hooks/useGroups';
import { useNotes }                    from './hooks/useNotes';
import { useConfetti }                 from './hooks/useConfetti';
import { useGitHub }                   from './hooks/useGitHub';

import MaintenancePage from './components/MaintenancePage';
import JoinModal       from './components/JoinModal';
import NoteModal       from './components/NoteModal';
import DayView         from './components/DayView';
import StatsBar        from './components/StatsBar';
import RankingsTab    from './components/RankingsTab';
import StreakBadge     from './components/StreakBadge';
import HeatmapCalendar from './components/HeatmapCalendar';
import XPBar           from './components/XPBar';
import BadgeShelf      from './components/BadgeShelf';
import GitHubConnect   from './components/GitHubConnect';

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  if (MAINTENANCE_MODE) return <MaintenancePage />;

  const { user, rawPassword, needsReauth, join, reauth, logout } = useAuth();
  const { progress, saving, markDone, markUndone } = useProgress(user);
  const { notes, saveNote, getNote }               = useNotes(user);
  const allUsers                                   = useLeaderboard(user);
  const { groups, groupMembers, loadingGroups, create: createGroup, join: joinGroup, leave: leaveGroup } = useGroups(user);
  const {
    config, isConnected,
    save: ghSave, disconnect: ghDisconnect,
    commitNote,
  } = useGitHub(user, rawPassword);

  useConfetti(progress);

  const [tab, setTab]                     = useState('today');
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [notingTask, setNotingTask]       = useState(null); // manual ✎ click
  const [pendingNote, setPendingNote]     = useState(null); // auto-open after task done

  const todayDay  = getTodayDay();
  const monthDays = Array.from({ length: 84 }, (_, i) => i + 1).filter(
    d => getMonth(d) === selectedMonth
  );

  // Task click: toggle done/undone, open note prompt on completion
  const handleToggle = useCallback((day, taskIdx) => {
    if (!user) return;
    const dayProg = progress[day] || [];
    if (dayProg[taskIdx]) {
      markUndone(day, taskIdx);
    } else {
      markDone(day, taskIdx);
      setPendingNote({ day, taskIdx });
    }
  }, [user, progress, markDone, markUndone]);

  const handleHeatmapClick = useCallback((day) => {
    setSelectedMonth(getMonth(day));
    setTab('month');
  }, []);

  if (needsReauth && user) return <JoinModal reauth userName={user.name} onReauth={reauth} onJoin={join} />;
  if (!user) return <JoinModal onJoin={join} />;

  const points = calcUserPoints(progress);

  /** Shared props for both NoteModal instances */
  function noteModalProps(target) {
    return {
      task:              DAYS_MAP[target.day]?.[target.taskIdx]?.task,
      category:          DAYS_MAP[target.day]?.[target.taskIdx]?.category,
      day:               target.day,
      taskIdx:           target.taskIdx,
      initialNote:       getNote(target.day, target.taskIdx),
      onSave:            saveNote,
      isGitHubConnected: isConnected,
      githubCommit:      isConnected ? commitNote : undefined,
    };
  }

  const tabStyle = t => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 600,
    background: tab === t ? 'rgba(110,231,183,0.12)' : 'transparent',
    color:      tab === t ? '#6ee7b7' : '#4b5563',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Space Mono', monospace", color: '#e2e8f0' }}>

      {/* ── Nav ── */}
      <div style={{ borderBottom: '1px solid #1e1e2e', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 14 }}>⚔️ 84-Day Grind</span>
          <span style={{ color: '#1e1e2e' }}>|</span>
          <span style={{ color: '#4b5563', fontSize: 11 }}>Day {todayDay}/84</span>
          <StreakBadge progress={progress} />
          {isConnected && (
            <span title={`GitHub: ${config.repo}`} style={{ fontSize: 14, cursor: 'default', opacity: 0.7 }}>🐙</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saving && <span style={{ color: '#34d399', fontSize: 11 }}>saving…</span>}
          <span style={{ color: '#9ca3af', fontSize: 12 }}>{user.name}</span>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #1e1e2e', color: '#4b5563', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Switch User</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 4, borderBottom: '1px solid #111118' }}>
        {[['today','📅 Today'],['month','📚 Browse'],['board','🏆 Rankings'],['profile','🏅 Profile']].map(([k,l]) => (
          <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── Content ── */}
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
          <RankingsTab
            currentUserId={user.id}
            allUsers={allUsers}
            groups={groups}
            groupMembers={groupMembers}
            loadingGroups={loadingGroups}
            onCreate={createGroup}
            onJoin={joinGroup}
            onLeave={leaveGroup}
            userProgress={progress}
          />
        )}

        {tab === 'profile' && (
          <div>
            <XPBar points={points} />
            <GitHubConnect
              config={config}
              isConnected={isConnected}
              onSave={ghSave}
              onDisconnect={ghDisconnect}
            />
            <BadgeShelf progress={progress} />
            <HeatmapCalendar progress={progress} onDayClick={handleHeatmapClick} />
          </div>
        )}
      </div>

      {/* Note modal — auto-opens after task completion */}
      {pendingNote && (
        <NoteModal
          {...noteModalProps(pendingNote)}
          onClose={() => setPendingNote(null)}
        />
      )}

      {/* Note modal — manual edit via ✎ button */}
      {notingTask && (
        <NoteModal
          {...noteModalProps(notingTask)}
          onClose={() => setNotingTask(null)}
        />
      )}
    </div>
  );
}