// ── githubService.js ──────────────────────────────────────────────────────
// All GitHub API calls. Uses the Contents API to create/update files.

const BASE = 'https://api.github.com';

/** Test if a PAT + repo are valid. Returns { ok, error? } */
export async function testConnection(pat, repo) {
  try {
    const res = await fetch(`${BASE}/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (res.status === 401) return { ok: false, error: 'Invalid token — check your PAT.' };
    if (res.status === 404) return { ok: false, error: 'Repo not found — check owner/repo format.' };
    if (!res.ok) return { ok: false, error: `GitHub error: ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error — could not reach GitHub.' };
  }
}

/**
 * Build the markdown content for a note file.
 */
export function buildNoteMarkdown({ day, taskIdx, task, category, note, completedAt }) {
  const date = completedAt
    ? new Date(completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const catEmoji = { LC: '⚡', Pattern: '🎨', Spring: '🌱', System: '🏗️', Behavioral: '🎭' };

  return `# ${catEmoji[category] || '📝'} ${task}

| Field | Value |
|-------|-------|
| **Day** | ${day} |
| **Task** | ${taskIdx + 1} |
| **Category** | ${category} |
| **Completed** | ${date} |

## 📝 My Notes

${note || '_No notes added._'}

---
*Auto-committed by [84-Day Interview Grind](https://github.com)*
`;
}

/**
 * Commit a note file to GitHub.
 * Path: interview-notes/day-{day}/task-{taskIdx+1}-{slug}.md
 *
 * If the file already exists, fetches its SHA first (required for updates).
 */
export async function commitNoteToGitHub({ pat, repo, day, taskIdx, task, category, note, completedAt }) {
  const slug = task
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50);

  const path = `interview-notes/day-${String(day).padStart(2, '0')}/task-${taskIdx + 1}-${slug}.md`;
  const content = buildNoteMarkdown({ day, taskIdx, task, category, note, completedAt });
  const contentBase64 = btoa(unescape(encodeURIComponent(content)));

  const fileUrl = `${BASE}/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  // Check if file exists (need its SHA to update)
  let sha;
  const existing = await fetch(fileUrl, { headers });
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const body = {
    message: `📝 Day ${day} · Task ${taskIdx + 1} · ${category}: ${task.slice(0, 60)}`,
    content: contentBase64,
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(fileUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub commit failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    url: data.content?.html_url,
    commitUrl: data.commit?.html_url,
  };
}
