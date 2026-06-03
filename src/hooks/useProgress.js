import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { DAYS_MAP } from '../data';
import { calcUserPoints, calcUserDaysCompleted } from '../utils/helpers';
import { calcStreaks } from '../utils/streakUtils';

// ── useProgress: real-time progress sync for current user ─────────────────

export function useProgress(user) {
  const [progress, setProgress] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.id), (snap) => {
      if (snap.exists()) setProgress(snap.data().progress || {});
    });
    return unsub;
  }, [user]);

  const markDone = useCallback(
    async (day, taskIdx) => {
      if (!user) return;
      const dayTasks = DAYS_MAP[day] || [];
      const dayProg = [...(progress[day] || Array(dayTasks.length).fill(false))];
      while (dayProg.length < dayTasks.length) dayProg.push(false);
      dayProg[taskIdx] = true;
      const newProg = { ...progress, [day]: dayProg };
      setProgress(newProg);
      setSaving(true);
      try {
        await setDoc(doc(db, 'users', user.id), { progress: newProg }, { merge: true });
      } catch (e) {
        console.error(e);
      }
      setSaving(false);
    },
    [user, progress]
  );

  const markUndone = useCallback(
    (day, taskIdx) => {
      if (!user) return;
      const dayTasks = DAYS_MAP[day] || [];
      const dayProg = [
        ...(progress[day]?.length >= dayTasks.length
          ? progress[day]
          : Array(dayTasks.length).fill(false)),
      ];
      dayProg[taskIdx] = false;
      const newProg = { ...progress, [day]: dayProg };
      setProgress(newProg);
      setDoc(doc(db, 'users', user.id), { progress: newProg }, { merge: true });
    },
    [user, progress]
  );

  return { progress, saving, markDone, markUndone };
}

// ── useLeaderboard: real-time all-users snapshot ──────────────────────────

export function useLeaderboard(user) {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name,
            points: calcUserPoints(data.progress),
            daysCompleted: calcUserDaysCompleted(data.progress),
            streak: calcStreaks(data.progress).current,
          };
        })
      );
    });
    return unsub;
  }, [user]);

  return allUsers;
}
