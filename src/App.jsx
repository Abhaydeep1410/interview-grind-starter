import { useState, useCallback } from 'react';

import { DAYS_MAP, getMonth, CATEGORY_POINTS } from './data';
import { DEVOPS_DAYS_MAP, DEVOPS_CATEGORY_POINTS } from './devopsData';
import { MAINTENANCE_MODE, MONTH_NAMES, TRACKS } from './constants';

import { getTodayDay, getSelfPacedTodayDay, calcUserPoints } from './utils/helpers';

import { useAuth } from './hooks/useAuth';
import { useProgress, useLeaderboard } from './hooks/useProgress';
import { useGroups } from './hooks/useGroups';
import { useNotes } from './hooks/useNotes';
import { useConfetti } from './hooks/useConfetti';
import { useGitHub } from './hooks/useGitHub';

import MaintenancePage from './components/MaintenancePage';
import JoinModal from './components/JoinModal';
import NoteModal from './components/NoteModal';
import DayView from './components/DayView';
import StatsBar from './components/StatsBar';
import RankingsTab from './components/RankingsTab';
import StreakBadge from './components/StreakBadge';
import HeatmapCalendar from './components/HeatmapCalendar';
import XPBar from './components/XPBar';
import BadgeShelf from './components/BadgeShelf';
import GitHubConnect from './components/GitHubConnect';

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // ───────────────────────────────────────────────────────────────────────────
  // Hooks  (MUST all run before any early return — Rules of Hooks)
  // ───────────────────────────────────────────────────────────────────────────

  const {
    user,
    rawPassword,
    needsReauth,
    join,
    reauth,
    logout,
  } = useAuth();

  const [selectedTrack, setSelectedTrack] = useState('interview');
  const {
  progress,
  saving,
  markDone,
  markUndone,
} = useProgress(user, selectedTrack);

  const {
    notes,
    saveNote,
    getNote,
  } = useNotes(user);

  const allUsers = useLeaderboard(user, selectedTrack);

  const {
    groups,
    groupMembers,
    loadingGroups,
    create: createGroup,
    join: joinGroup,
    leave: leaveGroup,
  } = useGroups(user, selectedTrack);

  const {
    config,
    isConnected,
    save: ghSave,
    disconnect: ghDisconnect,
    commitNote,
  } = useGitHub(user, rawPassword);


  // ───────────────────────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────────────────────

  const [tab, setTab] = useState('today');

  const [selectedMonth, setSelectedMonth] = useState(1);

  const [notingTask, setNotingTask] = useState(null);

  const [pendingNote, setPendingNote] = useState(null);

  
  // ───────────────────────────────────────────────────────────────────────────
  // Active track configuration
  // ───────────────────────────────────────────────────────────────────────────

  const isDevOps = selectedTrack === 'devops';

  const activeDaysMap = isDevOps
    ? DEVOPS_DAYS_MAP
    : DAYS_MAP;

  const activeCategoryPoints = isDevOps
    ? DEVOPS_CATEGORY_POINTS
    : CATEGORY_POINTS;

  const totalDays = isDevOps ? 50 : 84;
useConfetti(progress, totalDays);
  // ───────────────────────────────────────────────────────────────────────────
  // Current day
  // ───────────────────────────────────────────────────────────────────────────

  /*
   * Interview Prep runs on a shared calendar (fixed campaign start
   * date), so getTodayDay() is calendar-anchored.
   *
   * DevOps has no shared calendar start — it's self-paced, so "today"
   * is the first day the user hasn't fully completed yet.
   */
  const todayDay = isDevOps
    ? getSelfPacedTodayDay(progress, 'devops', totalDays)
    : getTodayDay();

  // ───────────────────────────────────────────────────────────────────────────
  // Month / browse days
  // ───────────────────────────────────────────────────────────────────────────

  /*
   * Interview Prep already has its existing month structure.
   *
   * DevOps currently has 50 days, so for now we divide them
   * into 3 browse sections.
   */
const monthDays = Array.from(
  { length: totalDays },
  (_, i) => i + 1
).filter((day) => {
  if (isDevOps) {
    if (selectedMonth === 1) {
      return day >= 1 && day <= 17;
    }

    if (selectedMonth === 2) {
      return day >= 18 && day <= 34;
    }

    if (selectedMonth === 3) {
      return day >= 35 && day <= 50;
    }

    return false;
  }

  return getMonth(day) === selectedMonth;
});
  // ───────────────────────────────────────────────────────────────────────────
  // Task click
  // ───────────────────────────────────────────────────────────────────────────

  const handleToggle = useCallback(
    (day, taskIdx) => {
      if (!user) return;

      const dayProg = progress[day] || [];

      if (dayProg[taskIdx]) {
        markUndone(day, taskIdx);
      } else {
        markDone(day, taskIdx);

        setPendingNote({
          day,
          taskIdx,
        });
      }
    },
    [
      user,
      progress,
      markDone,
      markUndone,
    ]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Heatmap
  // ───────────────────────────────────────────────────────────────────────────

  const handleHeatmapClick = useCallback(
    (day) => {
      if (isDevOps) {
        // DevOps: D1=days 1-17, D2=18-34, D3=35-50
        const m = day <= 17 ? 1 : day <= 34 ? 2 : 3;
        setSelectedMonth(m);
      } else {
        setSelectedMonth(getMonth(day));
      }
      setTab('month');
    },
    [isDevOps]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Authentication
  // ───────────────────────────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────────────────────────
  // Maintenance mode (checked here so hooks have already run above)
  // ───────────────────────────────────────────────────────────────────────────

  if (MAINTENANCE_MODE) return <MaintenancePage />;

  if (needsReauth && user) {
    return (
      <JoinModal
        reauth
        userName={user.name}
        onReauth={reauth}
        onJoin={join}
      />
    );
  }

  if (!user) {
    return <JoinModal onJoin={join} />;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Points
  // ───────────────────────────────────────────────────────────────────────────

  const points = calcUserPoints(progress, selectedTrack);

  // ───────────────────────────────────────────────────────────────────────────
  // Note modal props
  // ───────────────────────────────────────────────────────────────────────────

  function noteModalProps(target) {
    return {
      task: activeDaysMap[target.day]?.[target.taskIdx]?.task,

      category:
        activeDaysMap[target.day]?.[target.taskIdx]?.category,

      day: target.day,

      taskIdx: target.taskIdx,

      initialNote: getNote(
        target.day,
        target.taskIdx
      ),

      onSave: saveNote,

      isGitHubConnected: isConnected,

      githubCommit: isConnected
        ? commitNote
        : undefined,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Tab styling
  // ───────────────────────────────────────────────────────────────────────────

  const tabStyle = (t) => ({
    padding: '8px 18px',

    borderRadius: 8,

    border: 'none',

    cursor: 'pointer',

    fontFamily: "'Space Mono', monospace",

    fontSize: 12,

    fontWeight: 600,

    background:
      tab === t
        ? 'rgba(110,231,183,0.12)'
        : 'transparent',

    color:
      tab === t
        ? '#6ee7b7'
        : '#4b5563',

    transition: 'all 0.15s',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',

        background: '#0a0a0f',

        fontFamily: "'Space Mono', monospace",

        color: '#e2e8f0',
      }}
    >

      {/* ─────────────────────────────────────────────────────────────────────
          Navbar
      ───────────────────────────────────────────────────────────────────── */}

      <div
        style={{
          borderBottom: '1px solid #1e1e2e',

          padding: '14px 24px',

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          position: 'sticky',

          top: 0,

          background: 'rgba(10,10,15,0.95)',

          backdropFilter: 'blur(10px)',

          zIndex: 100,
        }}
      >

        {/* Left side */}

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 12,
          }}
        >

          <span
            style={{
              color: '#6ee7b7',

              fontWeight: 700,

              fontSize: 14,
            }}
          >
            {isDevOps
              ? '☁️ DevOps & Cloud'
              : '⚔️ 84-Day Grind'}
          </span>

          <span
            style={{
              color: '#1e1e2e',
            }}
          >
            |
          </span>

          <span
            style={{
              color: '#4b5563',

              fontSize: 11,
            }}
          >
            Day {todayDay}/{totalDays}
          </span>

          <StreakBadge progress={progress} />

          {isConnected && (
            <span
              title={`GitHub: ${config.repo}`}
              style={{
                fontSize: 14,

                cursor: 'default',

                opacity: 0.7,
              }}
            >
              🐙
            </span>
          )}

        </div>

        {/* Right side */}

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 12,
          }}
        >

          {saving && (
            <span
              style={{
                color: '#34d399',

                fontSize: 11,
              }}
            >
              saving…
            </span>
          )}

          <span
            style={{
              color: '#9ca3af',

              fontSize: 12,
            }}
          >
            {user.name}
          </span>

          <button
            onClick={logout}
            style={{
              background: 'transparent',

              border: '1px solid #1e1e2e',

              color: '#4b5563',

              padding: '5px 12px',

              borderRadius: 8,

              cursor: 'pointer',

              fontSize: 11,

              fontFamily: 'inherit',
            }}
          >
            Switch User
          </button>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Study Track Selector
      ───────────────────────────────────────────────────────────────────── */}

      <div
        style={{
          padding: '16px 24px',

          borderBottom: '1px solid #111118',

          display: 'flex',

          alignItems: 'center',

          gap: 12,
        }}
      >

        <span
          style={{
            color: '#4b5563',

            fontSize: 11,

            fontWeight: 600,
          }}
        >
          STUDY TRACK
        </span>

        <select
          value={selectedTrack}
          onChange={(e) => {
            setSelectedTrack(e.target.value);

            // Always return to Today when switching tracks
            setTab('today');

            // Reset browse section
            setSelectedMonth(1);

            // Close any open note modal
            setNotingTask(null);

            setPendingNote(null);
          }}
          style={{
            background: '#111118',

            color: '#e2e8f0',

            border: '1px solid #1e1e2e',

            borderRadius: 8,

            padding: '8px 12px',

            fontFamily: 'inherit',

            fontSize: 12,

            cursor: 'pointer',

            outline: 'none',
          }}
        >
          {TRACKS.map((track) => (
            <option
              key={track.id}
              value={track.id}
            >
              {track.icon} {track.title}
            </option>
          ))}
        </select>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Tabs
      ───────────────────────────────────────────────────────────────────── */}

      <div
        style={{
          padding: '16px 24px 0',

          display: 'flex',

          gap: 4,

          borderBottom: '1px solid #111118',
        }}
      >

        {[
          ['today', '📅 Today'],
          ['month', '📚 Browse'],
          ['board', '🏆 Rankings'],
          ['profile', '🏅 Profile'],
        ].map(([key, label]) => (
          <button
            key={key}
            style={tabStyle(key)}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}

      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Main Content
      ───────────────────────────────────────────────────────────────────── */}

      <div
        style={{
          maxWidth: 780,

          margin: '0 auto',

          padding: '24px 20px',
        }}
      >

        {/* ───────────────────────────────────────────────────────────────────
            TODAY
        ─────────────────────────────────────────────────────────────────── */}

        {tab === 'today' && (
          <div>

            <XPBar points={points} />

            <StatsBar progress={progress} daysMap={activeDaysMap} categoryPoints={activeCategoryPoints} />

            <HeatmapCalendar
              progress={progress}
              onDayClick={handleHeatmapClick}
              daysMap={activeDaysMap}
              categoryPoints={activeCategoryPoints}
              totalDays={totalDays}
              track={selectedTrack}
            />

            <div
              style={{
                marginBottom: 16,
              }}
            >

              <h3
                style={{
                  color: '#e2e8f0',

                  fontSize: 15,

                  margin: '0 0 4px',
                }}
              >
                Day {todayDay} —{' '}
                {activeDaysMap[todayDay]?.[0]?.date}
              </h3>

              <p
                style={{
                  color: '#4b5563',

                  fontSize: 12,

                  margin: 0,
                }}
              >
                {activeDaysMap[todayDay]?.[0]?.week}
              </p>

            </div>

            <DayView
  day={todayDay}
  tasks={activeDaysMap[todayDay] || []}
  progress={progress}
  notes={notes}
  onToggle={handleToggle}
  categoryPoints={activeCategoryPoints}
  onNoteClick={(d, i) => {
    setPendingNote(null);
    setNotingTask({ day: d, taskIdx: i });
  }}
/>

            {/* Yesterday only makes sense for the existing
                Interview Prep track for now. */}

            {!isDevOps && todayDay > 1 && (
              <div
                style={{
                  marginTop: 20,
                }}
              >

                <p
                  style={{
                    color: '#374151',

                    fontSize: 12,

                    marginBottom: 12,
                  }}
                >
                  Yesterday
                </p>
<DayView
  day={todayDay - 1}
  tasks={activeDaysMap[todayDay - 1] || []}
  progress={progress}
  notes={notes}
  onToggle={handleToggle}
  categoryPoints={activeCategoryPoints}
  onNoteClick={(d, i) => {
    setPendingNote(null);
    setNotingTask({ day: d, taskIdx: i });
  }}
/>

              </div>
            )}

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            BROWSE
        ─────────────────────────────────────────────────────────────────── */}

        {tab === 'month' && (
          <div>

            <div
              style={{
                display: 'flex',

                gap: 8,

                marginBottom: 20,
              }}
            >

              {[1, 2, 3].map((month) => (
                <button
                  key={month}

                  onClick={() =>
                    setSelectedMonth(month)
                  }

                  style={{
                    padding: '8px 16px',

                    borderRadius: 10,

                    background:
                      selectedMonth === month
                        ? 'rgba(110,231,183,0.12)'
                        : '#111118',

                    color:
                      selectedMonth === month
                        ? '#6ee7b7'
                        : '#4b5563',

                    cursor: 'pointer',

                    fontFamily: 'inherit',

                    fontSize: 12,

                    fontWeight: 600,

                    border:
                      selectedMonth === month
                        ? '1px solid rgba(110,231,183,0.3)'
                        : '1px solid #1e1e2e',
                  }}
                >
                  {isDevOps
                    ? `D${month}`
                    : `M${month}`}
                </button>
              ))}

            </div>

            <p
              style={{
                color: '#374151',

                fontSize: 12,

                marginBottom: 16,
              }}
            >
              {isDevOps
                ? `DevOps & Cloud · ${monthDays.length} days`
                : `${MONTH_NAMES[selectedMonth]} · ${monthDays.length} days`}
            </p>

            {monthDays
  .filter((day) => activeDaysMap[day])
  .map((day) => (
    <DayView
      key={day}
      day={day}
      tasks={activeDaysMap[day]}
      progress={progress}
      notes={notes}
      onToggle={handleToggle}
      categoryPoints={activeCategoryPoints}
      onNoteClick={(day, taskIdx) =>
        setNotingTask({
          day,
          taskIdx,
        })
      }
    />
  ))}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            RANKINGS
        ─────────────────────────────────────────────────────────────────── */}

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

            track={selectedTrack}
          />
        )}

        {/* ───────────────────────────────────────────────────────────────────
            PROFILE
        ─────────────────────────────────────────────────────────────────── */}

        {tab === 'profile' && (
          <div>

            <XPBar points={points} />

            <GitHubConnect
              config={config}

              isConnected={isConnected}

              onSave={ghSave}

              onDisconnect={ghDisconnect}
            />

            <BadgeShelf
              progress={progress}

              track={selectedTrack}
            />

            <HeatmapCalendar
              progress={progress}

              onDayClick={handleHeatmapClick}

              daysMap={activeDaysMap}

              categoryPoints={activeCategoryPoints}

              totalDays={totalDays}

              track={selectedTrack}
            />

          </div>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Automatic Note Modal
      ───────────────────────────────────────────────────────────────────── */}

      {pendingNote && (
        <NoteModal
          {...noteModalProps(pendingNote)}

          onClose={() =>
            setPendingNote(null)
          }
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Manual Note Modal
      ───────────────────────────────────────────────────────────────────── */}

      {notingTask && (
        <NoteModal
          {...noteModalProps(notingTask)}

          onClose={() =>
            setNotingTask(null)
          }
        />
      )}

    </div>
  );
}