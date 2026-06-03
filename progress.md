# 84-Day Interview Grind — Project Reference

## Overview
A competitive interview prep tracker for a friend group.
- 84 days (May–Jul 2026), 7 tasks/day, 5 categories
- Real-time progress sync via Firebase Firestore
- Compete globally and in private groups
- Notes auto-committed to GitHub as markdown

---

## Tech Stack
- **Frontend:** React (Vite), inline styles, Space Mono font
- **Backend:** Firebase Firestore (real-time)
- **AI Validation:** Gemini API (removed by user — direct task completion now)
- **GitHub Integration:** GitHub Contents API via Personal Access Token
- **Crypto:** Web Crypto API (AES-GCM, PBKDF2) — no libraries

---

## Current File Structure

```
src/
├── App.jsx                        ← root orchestrator (no business logic)
├── constants.js                   ← MAINTENANCE_MODE, CAT_ICONS, MONTH_NAMES, CAT_PLACEHOLDERS
├── data.js                        ← DAYS_MAP, CATEGORY_POINTS, CATEGORY_COLORS, getDayPoints, getMonth
├── firebase.js                    ← Firebase app + db export
│
├── utils/
│   ├── helpers.js                 ← calcUserPoints, calcUserDaysCompleted, totalPossiblePoints, getTodayDay, hashPassword, nameToId
│   ├── streakUtils.js             ← calcStreaks, isDayComplete, dateToDayNumber
│   ├── xpUtils.js                 ← LEVELS (10), BADGES (11), getLevelInfo, getEarnedBadges
│   ├── geminiService.js           ← validateWithGemini (NOT used — kept for reference)
│   ├── githubService.js           ← testConnection, buildNoteMarkdown, commitNoteToGitHub
│   ├── groupService.js            ← createGroup, joinGroup, leaveGroup, fetchGroup, fetchGroupMembers
│   └── cryptoUtils.js             ← encrypt(plaintext, password), decrypt(base64, password) — AES-GCM
│
├── hooks/
│   ├── useAuth.js                 ← user, rawPassword, needsReauth, join(), reauth(), logout()
│   ├── useProgress.js             ← useProgress (markDone/markUndone, saving), useLeaderboard (allUsers w/ streak)
│   ├── useNotes.js                ← notes, saveNote(day,taskIdx,text), getNote(day,taskIdx)
│   ├── useConfetti.js             ← fires canvas-confetti when a day goes fully complete
│   ├── useGitHub.js               ← config, isConnected, loading, save(), disconnect(), commitNote()
│   └── useGroups.js               ← groups, groupIds, groupMembers, loadingGroups, create(), join(), leave()
│
└── components/
    ├── MaintenancePage.jsx        ← shown when MAINTENANCE_MODE = true
    ├── JoinModal.jsx              ← full join/login form + reauth mode (compact password prompt on refresh)
    ├── DayView.jsx                ← renders one day's tasks; note button on completed tasks
    ├── StatsBar.jsx               ← points, days done, progress bar, per-category chip counts
    ├── XPBar.jsx                  ← level badge + title + XP progress bar to next level
    ├── BadgeShelf.jsx             ← 11 badges, locked ones greyed out
    ├── StreakBadge.jsx            ← 🔥 streak counter in nav bar
    ├── HeatmapCalendar.jsx        ← 12×7 GitHub-style activity grid, click → jumps to Browse tab
    ├── NoteModal.jsx              ← note editor; saves to Firestore + optionally commits to GitHub
    ├── ValidationModal.jsx        ← Gemini validation UI (NOT used — kept for reference)
    ├── GitHubConnect.jsx          ← PAT setup card with Classic/Fine-grained toggle + direct GitHub links
    ├── Leaderboard.jsx            ← old flat leaderboard (superseded by RankingsTab, kept for reference)
    └── RankingsTab.jsx            ← global + per-group leaderboard tabs, create/join/leave group UI
```

---

## Firestore Data Model

```
users/{userId}
  name:        string
  joinedAt:    timestamp
  password:    string          ← SHA-256 hashed
  progress:    {               ← { [dayNumber]: [bool, bool, ...] }
    "1": [true, false, true, ...],
    "12": [true, true, true, ...]
  }
  notes:       {               ← { "day_taskIdx": "note text" }
    "12_3": "Two pointer, O(n)..."
  }
  groupIds:    string[]        ← array of group codes user belongs to
  githubPat:   string          ← AES-GCM encrypted PAT (base64: salt+iv+cipher)
  githubRepo:  string          ← e.g. "arjun/interview-notes"

groups/{groupCode}             ← groupCode is the 5-char code e.g. "XK92A"
  name:        string
  code:        string
  createdBy:   userId
  createdAt:   timestamp
  members:     string[]        ← array of userIds
```

---

## Key Design Decisions

### Auth
- Password hashed with SHA-256 before storing in Firestore
- `rawPassword` held in React state (memory only, never persisted)
- On page refresh: `needsReauth = true` → compact password prompt shown
- After reauth: rawPassword available → useGitHub decrypts PAT from Firestore

### GitHub PAT Storage (3-tier)
1. **Memory** (React state) — fastest, cleared on refresh
2. **localStorage** — survives refresh, same browser only
3. **Firestore** (AES-GCM encrypted with user's password) — cross-device
- On new device: reauth prompt → password entered → Firestore decrypted → localStorage warmed up
- Token never stored in plaintext in Firestore

### Groups
- Group ID = 5-char code (no 0/O/1/I), e.g. "XK92A"
- User can be in multiple groups simultaneously
- `groups/{code}.members[]` and `users/{id}.groupIds[]` kept in sync
- Member stats (points/days/streak) computed client-side from raw progress

### Task Completion Flow (current — no AI validation)
1. User clicks task checkbox
2. `markDone()` called immediately → Firestore updated
3. `NoteModal` opens automatically (post-completion prompt)
4. User types note → saved to Firestore + optionally committed to GitHub
5. Confetti fires if that was the last task in the day

### Points & XP
- Category points: LC=3, Pattern=2, Spring=2, System=3, Behavioral=1 (defined in data.js)
- 10 XP levels: Recruit → Legendary (0 to 2000+ pts)
- 11 badges: First Blood, Day One, Week Warrior, On Fire (3d streak), Unstoppable (7d),
  Diamond Hands (14d), LeetCode Grinder (10 LC), Architect (5 System),
  Storyteller (5 Behavioral), Halfway There (42 days), The Finisher (84 days)

### Streak Logic
- Streak = consecutive completed days ending today
- Today being incomplete does NOT break the streak (checked at end of day)
- Longest streak tracked separately

---

## App.jsx Tab Structure
- 📅 Today  → XPBar + StatsBar + HeatmapCalendar + today's DayView + yesterday's DayView
- 📚 Browse → month selector (M1/M2/M3) + all days for that month
- 🏆 Rankings → RankingsTab (global leaderboard + group tabs)
- 🏅 Profile → XPBar + GitHubConnect + BadgeShelf + HeatmapCalendar

---

## Known Issues / Future Work
- [ ] Gemini 429 rate limit — shared API key hits quota fast; per-user key or backend proxy needed
- [ ] Group member stats are fetched on-demand (not real-time); refresh needed to see others' updates
- [ ] No admin/creator controls for groups (can't kick members, no group deletion)
- [ ] Firestore security rules not yet tightened (users can write to each other's docs)
- [ ] ValidationModal + geminiService kept but unused — can be removed if permanently dropped
- [ ] No push notifications / daily reminders yet

---

## Features Added (chronological)
1. Split monolithic App.jsx into 11 files (components/hooks/utils)
2. 🔥 Streak counter (StreakBadge in nav)
3. 🎉 Confetti on full day completion
4. 📝 Notes per task (Firestore + NoteModal)
5. 🗺️ Heatmap calendar (GitHub-style 84-day grid)
6. 🏅 XP levels + badges (10 levels, 11 badges)
7. 🐙 GitHub PAT integration (auto-commit notes as markdown)
8. 🔐 Encrypted PAT storage (AES-GCM, cross-device via Firestore)
9. 🔑 Reauth flow on page refresh (compact password prompt)
10. 🏆 Groups system (create/join/leave, per-group leaderboard, global rankings)