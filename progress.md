# ⚔️ 84-Day Interview Grind Tracker

A collaborative, gamified interview prep tracker built with **React + Firebase**.  
Designed for a group of friends prepping for product company interviews (Flipkart, Razorpay, Swiggy, CRED, PhonePe, etc.) together.

**Timeline:** Apr 19 – Jul 11, 2026 · 84 days · 7 tasks/day  
**Stack:** React (Vite), Firebase Firestore, deployed on Firebase Hosting

---

## What It Does

Every day has **7 tasks** across 5 categories:

| Category   | Icon | Points | Description |
|------------|------|--------|-------------|
| LC         | ⚡   | 3 pts  | LeetCode problems (3/day) |
| Pattern    | 🎨   | 2 pts  | Design patterns (GOF, Kafka, etc.) |
| Spring     | 🌱   | 2 pts  | Spring/Java concepts |
| System     | 🏗️   | 3 pts  | System design (HLD/LLD) |
| Behavioral | 🎭   | 1 pt   | STAR stories and mock interviews |

Users check off tasks, earn points, write notes, compete on a leaderboard, and form groups with friends.

---

## Project Structure

```
src/
├── App.jsx                  # Root component, tab routing, modal orchestration
├── main.jsx                 # Vite entry point
├── index.css                # Google Fonts import (Space Mono)
├── firebase.js              # Firebase init — user fills in their config here
├── constants.js             # MAINTENANCE_MODE, GEMINI_API_KEY, CAT_ICONS, etc.
├── data.js                  # All 84 days of task data + scoring helpers
│
├── components/
│   ├── JoinModal.jsx        # Login/signup — name + password
│   ├── DayView.jsx          # Renders one day's 7 tasks with checkboxes + note buttons
│   ├── StatsBar.jsx         # Per-user stats: points, days done, category breakdown
│   ├── XPBar.jsx            # XP level bar (gamified points display)
│   ├── StreakBadge.jsx      # 🔥 Current streak badge in nav
│   ├── HeatmapCalendar.jsx  # GitHub-style heatmap of all 84 days
│   ├── BadgeShelf.jsx       # Achievement badges based on milestones
│   ├── NoteModal.jsx        # Note editor (opens after task completion or via ✎)
│   ├── RankingsTab.jsx      # Global leaderboard + group leaderboards
│   ├── GitHubConnect.jsx    # Connect GitHub PAT to auto-commit notes
│   ├── ValidationModal.jsx  # (Reserved for future use)
│   └── MaintenancePage.jsx  # Shown when MAINTENANCE_MODE = true in constants.js
│
├── hooks/
│   ├── useAuth.js           # Login, signup, re-auth, logout — password-based
│   ├── useProgress.js       # Real-time task progress sync + global leaderboard
│   ├── useNotes.js          # Per-task notes stored in Firestore
│   ├── useGroups.js         # Create/join/leave groups, fetch group leaderboards
│   ├── useGitHub.js         # GitHub PAT management, note commits
│   └── useConfetti.js       # Triggers confetti on day completion
│
└── utils/
    ├── helpers.js           # calcUserPoints, calcUserDaysCompleted, getTodayDay, etc.
    ├── streakUtils.js       # calcStreaks({ progress }) → { current, longest }
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
  joinedAt:   1713484800000,     // epoch ms
  password:   "sha256hash",      // hashed with SHA-256 (no salt — simple, not banking)
  progress: {
    "1": [true, true, false, true, false, true, true],  // array of booleans per day
    "2": [true, false, ...]
    // key = day number (1–84), value = boolean array matching DAYS_MAP[day]
  },
  notes: {
    "1_0": "Two pointer insight: ...",   // key = `${day}_${taskIdx}`
    "1_2": "URL Shortener: base62..."
  },
  groupIds: ["XK92A", "BT3ZQ"],         // codes of groups user is in
  githubPat:  "encrypted_string",       // AES-encrypted with user's password
  githubRepo: "username/repo-name"
}
```

### `groups/{groupCode}`
```js
{
  code:      "XK92A",              // 5-char random uppercase code
  name:      "FAANG Batch 2026",
  createdBy: "user_id",
  createdAt: 1713484800000,
  members:   ["user_id_1", "user_id_2"]
}
```

---

## Auth System

- **No Firebase Auth** — custom password system using Firestore
- Password is SHA-256 hashed before storage (no salt — intentional simplicity)
- `localStorage` stores `{ id, name }` (no password)
- On page refresh: user restored from localStorage, `needsReauth = true`
- Re-auth prompt asks for password again → unlocks GitHub PAT decryption
- `rawPassword` lives **in memory only**, never persisted

---

## Points & Scoring

```js
// src/data.js
export const CATEGORY_POINTS = {
  LC: 3, Pattern: 2, Spring: 2, System: 3, Behavioral: 1
};
```

Total possible points across all 84 days is computed by `totalPossiblePoints()` in `utils/helpers.js`.

User points = sum of `CATEGORY_POINTS[category]` for every checked task.

---

## Task Data

All 84 days of tasks live in `src/data.js` as `DAYS` — a flat array of task objects:

```js
{
  day: 1,
  date: "Sun 19 Apr",
  week: "W1: Arrays & Two Pointers",
  category: "LC",          // LC | Pattern | Spring | System | Behavioral
  task: "LC 26: Remove Duplicates from Sorted Array — two pointer in-place"
}
```

`DAYS_MAP` groups them by `day` number:
```js
DAYS_MAP[1] // → array of 7 task objects for day 1
```

The 84 days cover 12 weeks across 3 months:
- **Month 1 (Days 1–28):** Arrays, Sliding Window, Linked Lists, Binary Search
- **Month 2 (Days 29–56):** Trees, Heaps, Graphs, DP Foundations
- **Month 3 (Days 57–84):** DP Advanced, Hard Problems, Full Mocks, Final Prep

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

## Gamification Features

| Feature | Where |
|---------|-------|
| XP Bar | `XPBar.jsx` — shows level based on total points |
| Streaks | `StreakBadge.jsx` + `streakUtils.js` — current/longest streak in nav |
| Badges | `BadgeShelf.jsx` — earned by milestones (days completed, categories, etc.) |
| Heatmap | `HeatmapCalendar.jsx` — GitHub-style 84-day completion grid |
| Confetti | `useConfetti.js` — triggers on day fully completed |
| 🔥 Hot badge | Shown next to users with streak ≥ 3 days in leaderboard |

---

## App Tabs

1. **📅 Today** — Today's 7 tasks + yesterday's. XP bar, stats, heatmap at top.
2. **📚 Browse** — All 84 days organized by month (M1/M2/M3). Scrollable.
3. **🏆 Rankings** — Global leaderboard + group leaderboards. Create/join groups.
4. **🏅 Profile** — XP bar, GitHub connect, badges, heatmap.

---

## Key Constants (`src/constants.js`)

```js
MAINTENANCE_MODE  // boolean — set true to show maintenance page to all users
GEMINI_API_KEY    // Gemini API key (feature not yet fully wired up — future AI notes feature)
CAT_ICONS         // { LC:'⚡', Pattern:'🎨', Spring:'🌱', System:'🏗️', Behavioral:'🎭' }
MONTH_NAMES       // { 1: 'Month 1 · Foundations', ... }
CAT_PLACEHOLDERS  // Textarea placeholder text per category in NoteModal
```

---

## Visual Design

- **Theme:** Dark (bg `#0a0a0f`), monospace font (`Space Mono`)
- **Accent:** Emerald green (`#6ee7b7`, `#34d399`)
- **Category colors:** Each category has a distinct color used for badges/tags
- **No CSS framework** — all inline styles
- **No component library** — pure React

---

## Firebase Setup (for new developers)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** (Native mode)
3. Add a **Web App** and copy the config into `src/firebase.js`
4. Set Firestore rules (dev: allow all; prod: lock down per user)
5. Install Firebase CLI: `npm install -g firebase-tools`
6. `firebase login && firebase init hosting`
7. `npm run build && firebase deploy`

Firestore rules (recommended for prod):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;               // leaderboard needs cross-user reads
      allow write: if true;              // auth is app-level, not Firebase Auth
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
npm run dev       # starts Vite dev server
npm run build     # production build → dist/
firebase deploy   # deploy to Firebase Hosting
```

---

## Known Decisions & Gotchas

- **No Firebase Auth** by design — simpler UX for a friend group. Trade-off: anyone who knows your name can try to guess your password.
- **SHA-256 without salt** — acceptable for this use case (not a financial/medical app).
- **`rawPassword` in memory** — cleared on page refresh, which triggers `needsReauth`. This is intentional; it keeps the PAT decryption key out of storage.
- **Progress stored as boolean arrays** — `progress["3"] = [true, false, true, ...]`. Index maps directly to `DAYS_MAP[3][i]`. If tasks are ever reordered in `data.js`, existing progress will be misaligned.
- **Gemini API key in constants.js** — currently unused in the codebase; planned for an AI-powered note suggestion feature.
- **`MAINTENANCE_MODE`** — flip to `true` in `constants.js` and redeploy to show a maintenance page to all users without changing auth/data logic.
- **Groups are fetched eagerly** when `groupIds` changes — no pagination. Fine for small friend groups (< 50 members).
- **`getTodayDay()`** is hardcoded to start from Apr 19 2026. After Day 84 (Jul 11), it clamps to 84.