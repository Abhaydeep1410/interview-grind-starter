import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ── useNotes ──────────────────────────────────────────────────────────────
// Notes are stored under users/{id}.notes as a flat map:
//   { "12_3": "Two-pointer, O(n) time..." }  ← key = `${day}_${taskIdx}`

export function useNotes(user) {
  const [notes, setNotes] = useState({});

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.id), (snap) => {
      if (snap.exists()) setNotes(snap.data().notes || {});
    });
    return unsub;
  }, [user]);

  const saveNote = useCallback(
    async (day, taskIdx, text) => {
      if (!user) return;
      const key = `${day}_${taskIdx}`;
      const updated = { ...notes, [key]: text };
      setNotes(updated);
      await setDoc(doc(db, 'users', user.id), { notes: updated }, { merge: true });
    },
    [user, notes]
  );

  const getNote = useCallback(
    (day, taskIdx) => notes[`${day}_${taskIdx}`] || '',
    [notes]
  );

  return { notes, saveNote, getNote };
}
