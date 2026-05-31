import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { hashPassword, nameToId } from '../utils/helpers';

// ── useAuth ───────────────────────────────────────────────────────────────
// user       — persisted in localStorage (id + name only, no password)
// rawPassword — kept in memory only, set on every login/re-auth
//
// On page refresh: user is restored from localStorage, but rawPassword is
// empty. The JoinModal detects this via `needsReauth` and shows a compact
// "Welcome back, enter password" prompt instead of the full join form.
// Once they enter the password, rawPassword is set and useGitHub can decrypt.

export function useAuth() {
  const [user, setUser]               = useState(null);
  const [rawPassword, setRawPassword] = useState('');
  const [needsReauth, setNeedsReauth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tracker_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setNeedsReauth(true); // page refreshed — password not in memory
    }
  }, []);

  async function join(name, password) {
    const id = nameToId(name);
    if (!id) throw new Error('Use letters and numbers only');

    const hashedPw = await hashPassword(password);
    const ref      = doc(db, 'users', id);
    const snap     = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, { name, joinedAt: Date.now(), progress: {}, password: hashedPw });
      const userData = { id, name };
      localStorage.setItem('tracker_user', JSON.stringify(userData));
      setUser(userData);
      setRawPassword(password);
      setNeedsReauth(false);
      return userData;
    }

    const stored = snap.data();

    if (!stored.password) {
      await setDoc(ref, { password: hashedPw }, { merge: true });
      const userData = { id, name: stored.name };
      localStorage.setItem('tracker_user', JSON.stringify(userData));
      setUser(userData);
      setRawPassword(password);
      setNeedsReauth(false);
      return userData;
    }

    if (stored.password !== hashedPw) throw new Error('Wrong password');

    const userData = { id, name: stored.name };
    localStorage.setItem('tracker_user', JSON.stringify(userData));
    setUser(userData);
    setRawPassword(password);
    setNeedsReauth(false);
    return userData;
  }

  // Called by the re-auth prompt — just validates + restores rawPassword,
  // no Firestore write needed since the account already exists
  async function reauth(password) {
    if (!user) throw new Error('No user session found');
    const hashedPw = await hashPassword(password);
    const snap     = await getDoc(doc(db, 'users', user.id));
    if (!snap.exists()) throw new Error('User not found');
    if (snap.data().password !== hashedPw) throw new Error('Wrong password');
    setRawPassword(password);
    setNeedsReauth(false);
  }

  function logout() {
    localStorage.removeItem('tracker_user');
    setUser(null);
    setRawPassword('');
    setNeedsReauth(false);
  }

  return { user, rawPassword, needsReauth, join, reauth, logout };
}