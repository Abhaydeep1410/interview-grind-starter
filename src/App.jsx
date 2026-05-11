import { useState, useEffect, useCallback } from "react";
import {
  collection, doc, getDoc, setDoc, onSnapshot, getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import { DAYS_MAP, CATEGORY_POINTS, CATEGORY_COLORS, TOTAL_DAYS, getDayPoints, getMonth } from "./data";

// ── helpers ──────────────────────────────────────────────────────────────
function totalPossiblePoints() {
  return Object.values(DAYS_MAP).reduce((s, tasks) => s + getDayPoints(tasks), 0);
}

function calcUserPoints(progress) {
  let pts = 0;
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
    tasks.forEach((done, i) => {
      if (done && dayTasks[i]) pts += CATEGORY_POINTS[dayTasks[i].category] || 1;
    });
  }
  return pts;
}

function calcUserDaysCompleted(progress) {
  let days = 0;
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
    const allDone = dayTasks.length > 0 && tasks.every((d, i) => i < dayTasks.length ? d : true);
    if (allDone) days++;
  }
  return days;
}

const CAT_ICONS = { LC:'⚡', Pattern:'🎨', Spring:'🌱', System:'🏗️', Behavioral:'🎭' };
const MONTH_NAMES = { 1:'Month 1 · Foundations', 2:'Month 2 · Intermediate', 3:'Month 3 · Advanced' };

// ── components ────────────────────────────────────────────────────────────

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function JoinModal({ onJoin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleJoin() {
    const n = name.trim();
    const p = password.trim();
    if (!n) return setErr('Enter your name');
    if (n.length < 2) return setErr('Name too short');
    if (!p) return setErr('Enter a password');
    if (p.length < 4) return setErr('Password must be at least 4 characters');

    setLoading(true);
    try {
      const id = n.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      if (!id) { setErr('Use letters and numbers only'); setLoading(false); return; }

      const hashedPw = await hashPassword(p);
      const ref = doc(db, 'users', id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, { name: n, joinedAt: Date.now(), progress: {}, password: hashedPw });
        localStorage.setItem('tracker_user', JSON.stringify({ id, name: n }));
        onJoin({ id, name: n });
      } else {
        const stored = snap.data();
        if (!stored.password) {
          await setDoc(ref, { password: hashedPw }, { merge: true });
          localStorage.setItem('tracker_user', JSON.stringify({ id, name: stored.name }));
          onJoin({ id, name: stored.name });
          return;
        }
        if (stored.password !== hashedPw) {
          setErr('Wrong password');
          setLoading(false);
          return;
        }
        localStorage.setItem('tracker_user', JSON.stringify({ id, name: stored.name }));
        onJoin({ id, name: stored.name });
      }
    } catch (e) {
      setErr('Could not connect. Check your Firebase config.');
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{
        background: '#111118', border: '1px solid #2a2a3a',
        borderRadius: 16, padding: '48px 56px', maxWidth: 420, width: '90%',
        textAlign: 'center', boxShadow: '0 0 80px rgba(110,231,183,0.06)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
        <h1 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
          84-Day Interview Grind
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 32px', lineHeight: 1.6 }}>
          May – Jul · Product Company Edition<br/>
          7 tasks/day · 84 days · compete with your crew
        </p>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="Your name…"
          autoFocus
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${err ? '#ef4444' : '#2a2a3a'}`,
            background: '#0a0a0f', color: '#e2e8f0',
            fontSize: 14, fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box', marginBottom: 10,
          }}
        />
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="Password…"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${err ? '#ef4444' : '#2a2a3a'}`,
            background: '#0a0a0f', color: '#e2e8f0',
            fontSize: 14, fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        {err && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{err}</p>}
        <button
          onClick={handleJoin}
          disabled={loading}
          style={{
            width: '100%', padding: '13px', borderRadius: 10,
            background: loading ? '#1a2a20' : 'linear-gradient(135deg,#6ee7b7,#34d399)',
            border: 'none', color: '#0a1a10', fontWeight: 700,
            fontSize: 14, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer',
          }}
        >{loading ? 'Connecting…' : "Let's Go →"}</button>
        <p style={{ color: '#374151', fontSize: 11, marginTop: 20 }}>
          New? Pick a password — it'll be saved. Returning? Same name + password.
        </p>
      </div>
    </div>
  );
}

function Leaderboard({ users, currentUserId }) {
  const sorted = [...users].sort((a,b) => b.points - a.points);
  const medals = ['🥇','🥈','🥉'];

  return (
    <div>
      <h2 style={{ color:'#e2e8f0', fontSize:18, fontWeight:700, margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
        🏆 Leaderboard
      </h2>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {sorted.map((u, i) => {
          const isMe = u.id === currentUserId;
          const pct = Math.round((u.points / totalPossiblePoints()) * 100);
          return (
            <div key={u.id} style={{
              background: isMe ? 'rgba(110,231,183,0.06)' : '#111118',
              border: `1px solid ${isMe ? '#6ee7b7' : '#1e1e2e'}`,
              borderRadius:12, padding:'14px 18px',
              display:'flex', alignItems:'center', gap:14,
            }}>
              <span style={{ fontSize:22, minWidth:30, textAlign:'center' }}>
                {medals[i] || `#${i+1}`}
              </span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ color: isMe ? '#6ee7b7' : '#e2e8f0', fontWeight:600, fontSize:14 }}>
                    {u.name} {isMe && <span style={{ fontSize:11, color:'#6ee7b7' }}>(you)</span>}
                  </span>
                  <span style={{ color:'#fcd34d', fontWeight:700, fontSize:14 }}>
                    {u.points} pts
                  </span>
                </div>
                <div style={{ background:'#0a0a0f', borderRadius:4, height:4, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', width:`${pct}%`, borderRadius:4,
                    background:'linear-gradient(90deg,#6ee7b7,#34d399)',
                    transition:'width 0.6s ease',
                  }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ color:'#4b5563', fontSize:11 }}>{u.daysCompleted} days fully done</span>
                  <span style={{ color:'#4b5563', fontSize:11 }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p style={{ color:'#4b5563', fontSize:13, textAlign:'center' }}>No users yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}

function DayView({ day, progress, onToggle }) {
  const tasks = DAYS_MAP[day] || [];
  const dayProgress = progress[day] || [];
  const completed = dayProgress.filter(Boolean).length;
  const total = tasks.length;
  const dayPts = getDayPoints(tasks);
  const earnedPts = tasks.reduce((s, t, i) => s + (dayProgress[i] ? CATEGORY_POINTS[t.category] : 0), 0);

  return (
    <div style={{
      background:'#111118', border:'1px solid #1e1e2e',
      borderRadius:14, overflow:'hidden',
      marginBottom:12,
    }}>
      <div style={{
        padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom: completed === total && total > 0 ? '1px solid rgba(110,231,183,0.2)' : '1px solid #1e1e2e',
        background: completed === total && total > 0 ? 'rgba(110,231,183,0.04)' : 'transparent',
      }}>
        <div>
          <span style={{ color:'#6b7280', fontSize:12 }}>Day {day}</span>
          <span style={{ color:'#374151', fontSize:12, margin:'0 8px' }}>·</span>
          <span style={{ color:'#9ca3af', fontSize:12 }}>{tasks[0]?.date}</span>
          {tasks[0]?.week && (
            <span style={{ color:'#374151', fontSize:11, marginLeft:8 }}>· {tasks[0].week}</span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ color:'#fcd34d', fontSize:12, fontWeight:600 }}>
            {earnedPts}/{dayPts} pts
          </span>
          <span style={{
            background: completed === total && total > 0 ? 'rgba(110,231,183,0.15)' : '#1a1a2e',
            color: completed === total && total > 0 ? '#6ee7b7' : '#4b5563',
            fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600,
          }}>
            {completed}/{total}
          </span>
        </div>
      </div>
      <div style={{ padding:'8px 10px' }}>
        {tasks.map((task, i) => {
          const done = !!dayProgress[i];
          return (
            <div
              key={i}
              onClick={() => onToggle(day, i)}
              style={{
                display:'flex', alignItems:'flex-start', gap:12,
                padding:'9px 8px', borderRadius:8, cursor:'pointer',
                background: done ? 'rgba(110,231,183,0.04)' : 'transparent',
                transition:'background 0.15s',
              }}
            >
              <div style={{
                width:18, height:18, borderRadius:5, flexShrink:0, marginTop:1,
                border: `2px solid ${done ? '#6ee7b7' : '#2a2a3a'}`,
                background: done ? '#6ee7b7' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.15s',
              }}>
                {done && <span style={{ color:'#0a1a10', fontSize:11, fontWeight:900 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{
                    background: CATEGORY_COLORS[task.category] + '22',
                    color: CATEGORY_COLORS[task.category],
                    fontSize:10, padding:'1px 7px', borderRadius:10, fontWeight:700,
                  }}>
                    {CAT_ICONS[task.category]} {task.category}
                  </span>
                  <span style={{ color:'#374151', fontSize:10 }}>
                    +{CATEGORY_POINTS[task.category]}pt
                  </span>
                </div>
                <p style={{
                  color: done ? '#6b7280' : '#d1d5db',
                  fontSize:13, margin:0, lineHeight:1.5,
                  textDecoration: done ? 'line-through' : 'none',
                }}>
                  {task.task}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsBar({ user, progress }) {
  const pts = calcUserPoints(progress);
  const days = calcUserDaysCompleted(progress);
  const total = totalPossiblePoints();
  const pct = Math.round((pts / total) * 100);

  // Category breakdown
  const catEarned = { LC:0, Pattern:0, Spring:0, System:0, Behavioral:0 };
  for (const [dayStr, tasks] of Object.entries(progress || {})) {
    const dayTasks = DAYS_MAP[parseInt(dayStr)] || [];
    tasks.forEach((done, i) => {
      if (done && dayTasks[i]) catEarned[dayTasks[i].category] = (catEarned[dayTasks[i].category]||0) + 1;
    });
  }

  return (
    <div style={{
      background:'#111118', border:'1px solid #1e1e2e',
      borderRadius:14, padding:'20px 24px', marginBottom:20,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <p style={{ color:'#6b7280', fontSize:12, margin:'0 0 4px' }}>Your Progress</p>
          <h3 style={{ color:'#e2e8f0', fontSize:24, margin:0, fontWeight:700 }}>
            {pts} <span style={{ color:'#4b5563', fontSize:14, fontWeight:400 }}>/ {total} pts</span>
          </h3>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'#6b7280', fontSize:12, margin:'0 0 4px' }}>Days Done</p>
          <h3 style={{ color:'#fcd34d', fontSize:24, margin:0, fontWeight:700 }}>
            {days} <span style={{ color:'#4b5563', fontSize:14, fontWeight:400 }}>/ 84</span>
          </h3>
        </div>
      </div>
      <div style={{ background:'#0a0a0f', borderRadius:6, height:8, overflow:'hidden', marginBottom:12 }}>
        <div style={{
          height:'100%', width:`${pct}%`,
          background:'linear-gradient(90deg,#6ee7b7,#34d399)',
          borderRadius:6, transition:'width 0.6s ease',
        }}/>
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {Object.entries(catEarned).map(([cat, cnt]) => (
          <span key={cat} style={{
            background: CATEGORY_COLORS[cat] + '18',
            color: CATEGORY_COLORS[cat],
            fontSize:11, padding:'3px 10px', borderRadius:20,
          }}>
            {CAT_ICONS[cat]} {cat}: {cnt}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [tab, setTab] = useState('today');
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [saving, setSaving] = useState(false);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem('tracker_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    }
  }, []);

  // Load user progress from Firestore
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.id);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setProgress(snap.data().progress || {});
    });
    return unsub;
  }, [user]);

  // Load all users for leaderboard (real-time)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const u = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          points: calcUserPoints(data.progress),
          daysCompleted: calcUserDaysCompleted(data.progress),
        };
      });
      setAllUsers(u);
    });
    return unsub;
  }, [user]);

  const handleToggle = useCallback(async (day, taskIdx) => {
    if (!user) return;
    const dayTasks = DAYS_MAP[day] || [];
    const dayProg = [...(progress[day] || Array(dayTasks.length).fill(false))];
    // ensure array is long enough
    while (dayProg.length < dayTasks.length) dayProg.push(false);
    dayProg[taskIdx] = !dayProg[taskIdx];

    const newProg = { ...progress, [day]: dayProg };
    setProgress(newProg);

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.id), { progress: newProg }, { merge: true });
    } catch (e) { console.error(e); }
    setSaving(false);
  }, [user, progress]);

  function handleLogout() {
    localStorage.removeItem('tracker_user');
    setUser(null);
    setProgress({});
  }

  // compute "today's day" based on Apr 19 start
  function getTodayDay() {
  const start = new Date('2026-05-10T00:00:00+05:30'); // IST
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000) + 1;
  return Math.max(1, Math.min(84, diff));
}

  if (!user) return <JoinModal onJoin={setUser} />;

  const todayDay = getTodayDay();
  const monthDays = Array.from({length:84}, (_,i)=>i+1).filter(d => getMonth(d) === selectedMonth);

  const tabStyle = (t) => ({
    padding:'8px 18px', borderRadius:8, border:'none', cursor:'pointer',
    fontFamily:"'Space Mono', monospace", fontSize:12, fontWeight:600,
    background: tab === t ? 'rgba(110,231,183,0.12)' : 'transparent',
    color: tab === t ? '#6ee7b7' : '#4b5563',
    transition:'all 0.15s',
  });

  return (
    <div style={{
      minHeight:'100vh', background:'#0a0a0f',
      fontFamily:"'Space Mono', monospace", color:'#e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        borderBottom:'1px solid #1e1e2e', padding:'14px 24px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        position:'sticky', top:0, background:'rgba(10,10,15,0.95)',
        backdropFilter:'blur(10px)', zIndex:100,
      }}>
        <div>
          <span style={{ color:'#6ee7b7', fontWeight:700, fontSize:14 }}>⚔️ 84-Day Grind</span>
          <span style={{ color:'#1e1e2e', margin:'0 10px' }}>|</span>
          <span style={{ color:'#4b5563', fontSize:11 }}>Day {todayDay}/84</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {saving && <span style={{ color:'#34d399', fontSize:11 }}>saving…</span>}
          <span style={{ color:'#9ca3af', fontSize:12 }}>{user.name}</span>
          <button onClick={handleLogout} style={{
            background:'transparent', border:'1px solid #1e1e2e',
            color:'#4b5563', padding:'5px 12px', borderRadius:8,
            cursor:'pointer', fontSize:11, fontFamily:'inherit',
          }}>Switch User</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:'16px 24px 0', display:'flex', gap:4, borderBottom:'1px solid #111118' }}>
        {[['today','📅 Today'],['month','📚 Browse'],['board','🏆 Rankings']].map(([k,l]) => (
          <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'24px 20px' }}>

        {/* TODAY tab */}
        {tab === 'today' && (
          <div>
            <StatsBar user={user} progress={progress} />
            <div style={{ marginBottom:16 }}>
              <h3 style={{ color:'#e2e8f0', fontSize:15, margin:'0 0 4px' }}>
                Day {todayDay} — {DAYS_MAP[todayDay]?.[0]?.date}
              </h3>
              <p style={{ color:'#4b5563', fontSize:12, margin:0 }}>
                {DAYS_MAP[todayDay]?.[0]?.week}
              </p>
            </div>
            <DayView day={todayDay} progress={progress} onToggle={handleToggle} />
            {todayDay > 1 && (
              <div style={{ marginTop:20 }}>
                <p style={{ color:'#374151', fontSize:12, marginBottom:12 }}>Yesterday</p>
                <DayView day={todayDay - 1} progress={progress} onToggle={handleToggle} />
              </div>
            )}
          </div>
        )}

        {/* MONTH BROWSE tab */}
        {tab === 'month' && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {[1,2,3].map(m => (
                <button key={m} onClick={() => setSelectedMonth(m)} style={{
                  padding:'8px 16px', borderRadius:10,
                  background: selectedMonth === m ? 'rgba(110,231,183,0.12)' : '#111118',
                  color: selectedMonth === m ? '#6ee7b7' : '#4b5563',
                  cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600,
                  border: selectedMonth === m ? '1px solid rgba(110,231,183,0.3)' : '1px solid #1e1e2e',
                }}>
                  M{m}
                </button>
              ))}
            </div>
            <p style={{ color:'#374151', fontSize:12, marginBottom:16 }}>
              {MONTH_NAMES[selectedMonth]} · {monthDays.length} days
            </p>
            {monthDays.map(d => (
              <DayView key={d} day={d} progress={progress} onToggle={handleToggle} />
            ))}
          </div>
        )}

        {/* LEADERBOARD tab */}
        {tab === 'board' && (
          <div>
            <StatsBar user={user} progress={progress} />
            <Leaderboard users={allUsers} currentUserId={user.id} />
          </div>
        )}

      </div>
    </div>
  );
}