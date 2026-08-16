# ⚔️ Interview Grind Tracker

A collaborative, gamified interview prep tracker built with **React + Firebase**.  
Designed for a group of friends prepping for product company interviews (Flipkart, Razorpay, Swiggy, CRED, PhonePe, etc.) together.

**Stack:** React (Vite), Firebase Firestore, deployed on Firebase Hosting

---

## Tracks

The app supports multiple learning tracks. Users select a track and progress is tracked independently per track.

| Track | Icon | Days | Description |
|-------|------|------|-------------|
| Interview Prep | 🎯 | 84 days | DSA + System Design + Spring + Behavioral |
| DevOps & Cloud | ☁️ | 50 days | Linux, Bash, Docker, Kubernetes, CI/CD |

Tracks are defined in `src/constants.js` as `TRACKS`. `selectedTrack` state lives in `App.jsx` and is passed down to `useProgress(user, selectedTrack)`.

---

## Interview Prep Track — Task Categories

| Category   | Icon | Points | Description |
|------------|------|--------|-------------|
| LC         | ⚡   | 3 pts  | LeetCode problems (3/day) |
| Pattern    | 🎨   | 2 pts  | Design patterns (GOF, Kafka, etc.) |
| Spring     | 🌱   | 2 pts  | Spring/Java concepts |
| System     | 🏗️   | 3 pts  | System design (HLD/LLD) |
| Behavioral | 🎭   | 1 pt   | STAR stories and mock interviews |

**Timeline:** Apr 19 – Jul 11, 2026 · 84 days · 7 tasks/day  
**Month 1 (Days 1–28):** Arrays, Sliding Window, Linked Lists, Binary Search  
**Month 2 (Days 29–56):** Trees, Heaps, Graphs, DP Foundations  
**Month 3 (Days 57–84):** DP Advanced, Hard Problems, Full Mocks, Final Prep

## DevOps Track — Task Categories

| Category  | Description |
|-----------|-------------|
| Linux     | Filesystem, processes, bash scripting, SSH |
| Interview | Conceptual questions asked in DevOps interviews |
| Lab       | Hands-on practice tasks (WSL, Spring Boot, Docker, etc.) |

DevOps data lives in `src/devopsData.js` as `DEVOPS_DAYS` and `DEVOPS_DAYS_MAP`.  
Currently 3 days of data (days 1–3); planned to grow to 50 days.

---

## AI Validation (Gemini)

**This is the biggest new feature.** Before a task is marked done, the user must explain their understanding in a textarea. Gemini 2.0 Flash evaluates the answer and either approves or rejects it.

**Flow:**
1. User clicks a task checkbox
2. `ValidationModal` opens (instead of immediately marking done)
3. User types their explanation (minimum 30 chars)
4. "Submit for Validation →" calls Gemini API
5. Gemini returns `{ approved: boolean, feedback: string, score: 1-10 }`
6. Score ≥ 6 → approved → task is marked done, confetti fires
7. Score < 6 → feedback shown → user can try again

**Validation criteria by category:**
- **LC:** Approach + time/space complexity + key insight
- **System:** Key components + trade-offs + design decisions
- **Spring/Pattern:** Clear concept explanation + real example
- **Behavioral:** Full STAR story with specific details

**Files:**
- `src/utils/geminiService.js` — `validateWithGemini(task, category, userAnswer, apiKey)` → calls `gemini-2.0-flash`
- `src/components/ValidationModal.jsx` — the modal UI with textarea, submit, result banner
- `src/constants.js` — `GEMINI_API_KEY` — paste your key here

**Gemini API endpoint:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=API_KEY
```

---

## Project Structure

```
src/
├── App.jsx                  # Root — track selector, tab routing, modal orchestration
├── main.jsx                 # Vite entry point
├── index.css                # Google Fonts import (Space Mono)
├── firebase.js              # Firebase init — user fills in their config here
├── constants.js             # MAINTENANCE_MODE, GEMINI_API_KEY, CAT_ICONS, TRACKS, etc.
├── data.js                  # All 84 days of interview prep tasks + scoring helpers
├── devopsData.js            # DevOps track task data (DEVOPS_DAYS, DEVOPS_DAYS_MAP)
│
├── components/
│   ├── JoinModal.jsx        # Login/signup — name + password
│   ├── DayView.jsx          # Renders one day's tasks with checkboxes + note buttons
│   ├── StatsBar.jsx         # Per-user stats: points, days done, category breakdown
│   ├── Leaderboard.jsx      # Extracted leaderboard row component
│   ├── XPBar.jsx            # XP level bar (gamified points display)
│   ├── StreakBadge.jsx      # 🔥 Current streak badge in nav
│   ├── HeatmapCalendar.jsx  # GitHub-style heatmap of all days in the track
│   ├── BadgeShelf.jsx       # Achievement badges based on milestones
│   ├── NoteModal.jsx        # Note editor (opens after task completion or via ✎)
│   ├── ValidationModal.jsx  # 🆕 AI validation via Gemini before marking task done
│   ├── RankingsTab.jsx      # Global leaderboard + group leaderboards
│   ├── GitHubConnect.jsx    # Connect GitHub PAT to auto-commit notes
│   └── MaintenancePage.jsx  # Shown when MAINTENANCE_MODE = true in constants.js
│
├── hooks/
│   ├── useAuth.js           # Login, signup, re-auth, logout — password-based
│   ├── useProgress.js       # Real-time progress sync — now track-aware
│   ├── useNotes.js          # Per-task notes stored in Firestore
│   ├── useGroups.js         # Create/join/leave groups, fetch group leaderboards
│   ├── useGitHub.js         # GitHub PAT management, note commits
│   └── useConfetti.js       # Triggers confetti on day completion
│
└── utils/
    ├── helpers.js           # calcUserPoints, calcUserDaysCompleted, getTodayDay, etc.
    ├── streakUtils.js       # calcStreaks({ progress }) → { current, longest }
    ├── xpUtils.js           # 🆕 getLevelInfo(points) → level/title/progress, BADGES, getEarnedBadges()
    ├── geminiService.js     # 🆕 validateWithGemini() — calls Gemini 2.0 Flash API
    ├── groupService.js      # Firestore ops: createGroup, joinGroup, leaveGroup, fetchGroup
    ├── githubService.js     # commitNoteToGitHub, testConnection
    └── cryptoUtils.js       # encrypt/decrypt (AES via Web Crypto) for GitHub PAT
```

---

## Firestore Data Model

### `users/{userId}`
```js
{
  name:       "D",
  joinedAt:   1713484800000,
  password:   "sha256hash",         // SHA-256, no salt
  progress: {
    // Interview track — keyed as day numbers
    "1": [true, true, false, true, false, true, true],
    "2": [true, false, ...],
    // DevOps track — keyed with "devops_" prefix (track-aware in useProgress)
    "devops_1": [true, false, true, true],
  },
  notes: {
    "1_0":        "Two pointer insight...",    // key = `${day}_${taskIdx}`
    "devops_1_2": "Installed WSL, ran bash..."
  },
  groupIds:   ["XK92A", "BT3ZQ"],
  githubPat:  "encrypted_string",             // AES-encrypted with user's password
  githubRepo: "username/repo-name"
}
```

### `groups/{groupCode}`
```js
{
  code:      "XK92A",
  name:      "FAANG Batch 2026",
  createdBy: "user_id",
  createdAt: 1713484800000,
  members:   ["user_id_1", "user_id_2"]
}
```

---

## XP & Levels (`src/utils/xpUtils.js`)

10 levels based on total points earned:

| Level | Title | Min Points |
|-------|-------|-----------|
| 1 | Recruit | 0 |
| 2 | Apprentice | 50 |
| 3 | Grinder | 150 |
| 4 | Consistent | 300 |
| 5 | Problem Solver | 500 |
| 6 | DSA Wizard | 750 |
| 7 | System Thinker | 1000 |
| 8 | Interview Ready | 1300 |
| 9 | Elite | 1600 |
| 10 | Legendary | 2000 |

`getLevelInfo(points)` returns `{ current, nextLevel, progress }` used by `XPBar.jsx`.

## Badges (`src/utils/xpUtils.js`)

| Badge | Condition |
|-------|-----------|
| 🩸 First Blood | Any points earned |
| 🌅 Day One | 1 full day completed |
| ⚔️ Week Warrior | 7 full days completed |
| 🔥 On Fire | 3-day streak |
| 🌋 Unstoppable | 7-day streak |
| 💎 Diamond Hands | 14-day streak |
| ⚡ LeetCode Grinder | 10 LC tasks done |
| 🏗️ Architect | 5 System Design tasks done |
| 🎭 Storyteller | 5 Behavioral tasks done |
| 🏁 Halfway There | 42 days completed |
| 🏆 The Finisher | All 84 days completed |

---

## Auth System

- **No Firebase Auth** — custom password system using Firestore
- Password is SHA-256 hashed before storage (no salt — intentional simplicity)
- `localStorage` stores `{ id, name }` (no password)
- On page refresh: user restored from localStorage, `needsReauth = true`
- Re-auth prompt asks for password again → unlocks GitHub PAT decryption
- `rawPassword` lives **in memory only**, never persisted

---

## Groups Feature

- Any user can create a group → gets a random **5-char code** (e.g. `XK92A`)
- Share the code → friends join with it
- Each group has its own leaderboard tab in Rankings
- Groups tab shows: members, their points, streaks, rank
- Users can be in multiple groups simultaneously
- Group code is copyable from the leaderboard UI

---

## GitHub Integration

Users can connect a GitHub PAT to auto-commit their task notes as markdown files.

- PAT is **AES-encrypted** with the user's raw password before storing in Firestore
- Also cached in `localStorage` as plaintext for same-browser sessions
- On new device: re-auth → rawPassword available → decrypt from Firestore
- Commit flow: save note to Firestore → push markdown file to GitHub repo
- Commit result shows a "View file ↗" link

---

## Key Constants (`src/constants.js`)

```js
MAINTENANCE_MODE   // boolean — set true to show maintenance page to all users
GEMINI_API_KEY     // Gemini API key — used by ValidationModal for AI task validation
CAT_ICONS          // { LC:'⚡', Pattern:'🎨', Spring:'🌱', System:'🏗️', Behavioral:'🎭' }
CAT_PLACEHOLDERS   // Textarea placeholder per category in NoteModal + ValidationModal
MONTH_NAMES        // { 1: 'Month 1 · Foundations', 2: ..., 3: ... }
TRACKS             // [{ id, title, totalDays, icon }] — Interview Prep + DevOps & Cloud
```

---

## Visual Design

- **Theme:** Dark (bg `#0a0a0f`), monospace font (`Space Mono`)
- **Accent:** Emerald green (`#6ee7b7`, `#34d399`)
- **No CSS framework** — all inline styles
- **No component library** — pure React

---

## App Tabs

1. **📅 Today** — Today's tasks for the active track + yesterday's. XP bar + stats at top.
2. **📚 Browse** — All days organized by month (Interview) or week (DevOps). Scrollable.
3. **🏆 Rankings** — Global leaderboard + group leaderboards. Create/join groups.
4. **🏅 Profile** — XP bar, GitHub connect, badges, heatmap.

---

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** (Native mode)
3. Add a **Web App** and copy the config into `src/firebase.js`
4. Install Firebase CLI: `npm install -g firebase-tools`
5. `firebase login && firebase init hosting`
6. `npm run build && firebase deploy`

**Firestore rules (recommended for prod):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if true;
    }
    match /groups/{groupId} {
      allow read, write: if true;
    }
  }
}
```

---

## Local Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build → dist/
firebase deploy   # deploy to Firebase Hosting
```

---

## Known Decisions & Gotchas

- **No Firebase Auth** by design — simpler UX for a friend group. Trade-off: anyone who knows your name can try to guess your password.
- **SHA-256 without salt** — acceptable for this use case.
- **`rawPassword` in memory** — cleared on page refresh, triggers `needsReauth`. Intentional — keeps PAT decryption key out of storage.
- **Progress stored as boolean arrays** — index maps directly to `DAYS_MAP[day][i]`. If tasks are ever reordered in `data.js`, existing progress will be misaligned.
- **Track-aware progress keys** — DevOps progress is stored with a `devops_` prefix in the same `progress` map to avoid collision with interview track day numbers.
- **`MAINTENANCE_MODE`** — flip to `true` in `constants.js` and redeploy to show a maintenance page without touching auth/data.
- **Groups are fetched eagerly** when `groupIds` changes — fine for small friend groups (< 50 members).
- **`getTodayDay()`** is hardcoded to start from Apr 19 2026. After Day 84 (Jul 11), it clamps to 84.
- **DevOps track is incomplete** — currently only 3 days of task data. Needs to grow to 50 days before the track is usable end-to-end.
- **Gemini validation is strict by design** — minimum score 6/10. Temperature set to 0.3 for consistent scoring. Users can retry unlimited times.