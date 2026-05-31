import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { commitNoteToGitHub, testConnection } from '../utils/githubService';
import { encrypt, decrypt } from '../utils/cryptoUtils';

const LS_KEY = 'gh_config';

// ── useGitHub ─────────────────────────────────────────────────────────────
// Load priority:
//   1. localStorage  — same browser, survives refresh, no password needed
//   2. Firestore     — cross-device, decrypted with rawPassword
//
// The key insight: we re-attempt Firestore load whenever rawPassword changes
// (i.e. right after login). So even on a fresh browser:
//   mount → no localStorage, no rawPassword → config = null (shows connect UI)
//   user logs in → rawPassword set → effect re-fires → decrypts from Firestore → ✓

export function useGitHub(user, rawPassword) {
  const [config, setConfig]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always try localStorage first — no async, no password needed
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        setConfig(JSON.parse(raw));
        setLoading(false);
        return;
      }
    } catch {}

    // No localStorage entry — need Firestore + password
    if (!user || !rawPassword) {
      // rawPassword not available yet (page just loaded, user not logged in yet)
      // Effect will re-run once rawPassword is set after login
      setLoading(false);
      return;
    }

    // Have both user and password — decrypt from Firestore
    setLoading(true);
    getDoc(doc(db, 'users', user.id))
      .then(async snap => {
        const encPat = snap.data()?.githubPat;
        const repo   = snap.data()?.githubRepo;
        if (encPat && repo) {
          try {
            const pat = await decrypt(encPat, rawPassword);
            const cfg = { pat, repo };
            localStorage.setItem(LS_KEY, JSON.stringify(cfg)); // warm up for next time
            setConfig(cfg);
          } catch {
            // Decryption failed (shouldn't happen with correct password)
            console.warn('useGitHub: could not decrypt PAT from Firestore');
          }
        }
      })
      .catch(e => console.warn('useGitHub: Firestore fetch failed', e))
      .finally(() => setLoading(false));

  }, [user?.id, rawPassword]); // ← re-runs when rawPassword becomes available after login

  // ── Save ─────────────────────────────────────────────────────────────
  const save = useCallback(async (pat, repo) => {
    const result = await testConnection(pat, repo);
    if (!result.ok) return result;

    const cfg = { pat: pat.trim(), repo: repo.trim() };
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    setConfig(cfg);

    if (user && rawPassword) {
      try {
        const encPat = await encrypt(cfg.pat, rawPassword);
        await setDoc(
          doc(db, 'users', user.id),
          { githubPat: encPat, githubRepo: cfg.repo },
          { merge: true }
        );
      } catch (e) {
        console.warn('useGitHub: could not sync to Firestore:', e);
      }
    }

    return { ok: true };
  }, [user, rawPassword]);

  // ── Disconnect ────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    localStorage.removeItem(LS_KEY);
    setConfig(null);
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.id),
          { githubPat: null, githubRepo: null },
          { merge: true }
        );
      } catch {}
    }
  }, [user]);

  // ── Commit ────────────────────────────────────────────────────────────
  const commitNote = useCallback(
    async ({ day, taskIdx, task, category, note, completedAt }) => {
      if (!config) throw new Error('GitHub not connected.');
      return commitNoteToGitHub({ ...config, day, taskIdx, task, category, note, completedAt });
    },
    [config]
  );

  return { config, isConnected: !!config, loading, save, disconnect, commitNote };
}