import { useState, useEffect, useCallback } from 'react';
import { commitNoteToGitHub, testConnection } from '../utils/githubService';

const STORAGE_KEY = 'gh_config';

// ── useGitHub ─────────────────────────────────────────────────────────────
// Persists { pat, repo } in localStorage (never sent to Firestore).
// Exposes: config, isConnected, save(), disconnect(), commitNote()

export function useGitHub() {
  const [config, setConfig] = useState(null); // { pat, repo } | null

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig(JSON.parse(raw));
    } catch {}
  }, []);

  /** Validate and persist a new config. Returns { ok, error? } */
  const save = useCallback(async (pat, repo) => {
    const result = await testConnection(pat, repo);
    if (!result.ok) return result;
    const cfg = { pat: pat.trim(), repo: repo.trim() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setConfig(cfg);
    return { ok: true };
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(null);
  }, []);

  /**
   * Commit a note to GitHub.
   * Returns { url, commitUrl } on success, throws on failure.
   */
  const commitNote = useCallback(
    async ({ day, taskIdx, task, category, note, completedAt }) => {
      if (!config) throw new Error('GitHub not connected.');
      return commitNoteToGitHub({ ...config, day, taskIdx, task, category, note, completedAt });
    },
    [config]
  );

  return {
    config,
    isConnected: !!config,
    save,
    disconnect,
    commitNote,
  };
}
