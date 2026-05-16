import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { hashPassword, nameToId } from '../utils/helpers';

// ── useAuth: handles join / login / logout + localStorage persistence ─────

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('tracker_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function join(name, password) {
    const id = nameToId(name);
    if (!id) throw new Error('Use letters and numbers only');

    const hashedPw = await hashPassword(password);
    const ref = doc(db, 'users', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, { name, joinedAt: Date.now(), progress: {}, password: hashedPw });
      const userData = { id, name };
      localStorage.setItem('tracker_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    const stored = snap.data();

    // Legacy user with no password — set one now
    if (!stored.password) {
      await setDoc(ref, { password: hashedPw }, { merge: true });
      const userData = { id, name: stored.name };
      localStorage.setItem('tracker_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    if (stored.password !== hashedPw) throw new Error('Wrong password');

    const userData = { id, name: stored.name };
    localStorage.setItem('tracker_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }

  function logout() {
    localStorage.removeItem('tracker_user');
    setUser(null);
  }

  return { user, join, logout };
}
