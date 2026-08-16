import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';

import { db } from '../firebase';

import { DAYS_MAP } from '../data';

import { DEVOPS_DAYS_MAP } from '../devopsData';

import {
  calcUserPoints,
  calcUserDaysCompleted,
} from '../utils/helpers';

import { calcStreaks } from '../utils/streakUtils';


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getTrackDaysMap(track) {
  return track === 'devops'
    ? DEVOPS_DAYS_MAP
    : DAYS_MAP;
}


// ─────────────────────────────────────────────────────────────────────────────
// useProgress
// ─────────────────────────────────────────────────────────────────────────────

export function useProgress(user, selectedTrack = 'interview') {
  const [progress, setProgress] = useState({});

  const [saving, setSaving] = useState(false);


  // ───────────────────────────────────────────────────────────────────────────
  // Load progress from Firebase
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      doc(db, 'users', user.id),
      (snap) => {
        if (!snap.exists()) {
          setProgress({});
          return;
        }

        const data = snap.data();

        const firebaseProgress = data.progress || {};

        /*
         * Backward compatibility
         *
         * Old Interview Grind users have:
         *
         * progress: {
         *   1: [...],
         *   2: [...]
         * }
         *
         * Convert that in memory to:
         *
         * progress: {
         *   interview: {
         *     1: [...],
         *     2: [...]
         *   }
         * }
         */

        if (
          !firebaseProgress.interview &&
          !firebaseProgress.devops
        ) {
          setProgress({
            interview: firebaseProgress,
            devops: {},
          });

          return;
        }

        /*
         * Already using the new format.
         */

        setProgress({
          interview: firebaseProgress.interview || {},
          devops: firebaseProgress.devops || {},
        });
      }
    );

    return unsub;
  }, [user]);


  // ───────────────────────────────────────────────────────────────────────────
  // Current track progress
  // ───────────────────────────────────────────────────────────────────────────

  const trackProgress =
    progress[selectedTrack] || {};


  // ───────────────────────────────────────────────────────────────────────────
  // Mark task complete
  // ───────────────────────────────────────────────────────────────────────────

  const markDone = useCallback(
    async (day, taskIdx) => {
      if (!user) return;

      const daysMap = getTrackDaysMap(selectedTrack);

      const dayTasks = daysMap[day] || [];

      const existingDayProgress =
        trackProgress[day] || [];

      const dayProg = [
        ...existingDayProgress,
      ];

      while (
        dayProg.length < dayTasks.length
      ) {
        dayProg.push(false);
      }

      dayProg[taskIdx] = true;


      const newTrackProgress = {
        ...trackProgress,
        [day]: dayProg,
      };


      const newProgress = {
        ...progress,

        [selectedTrack]: newTrackProgress,
      };


      // Optimistic UI update
      setProgress(newProgress);

      setSaving(true);

      try {
        await setDoc(
          doc(db, 'users', user.id),

          {
            progress: newProgress,
          },

          {
            merge: true,
          }
        );
      } catch (e) {
        console.error(
          'Failed to save progress:',
          e
        );
      }

      setSaving(false);
    },

    [
      user,
      selectedTrack,
      progress,
      trackProgress,
    ]
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Mark task incomplete
  // ───────────────────────────────────────────────────────────────────────────

  const markUndone = useCallback(
    async (day, taskIdx) => {
      if (!user) return;

      const daysMap =
        getTrackDaysMap(selectedTrack);

      const dayTasks =
        daysMap[day] || [];

      const existingDayProgress =
        trackProgress[day] || [];

      const dayProg = [
        ...existingDayProgress,
      ];

      while (
        dayProg.length < dayTasks.length
      ) {
        dayProg.push(false);
      }

      dayProg[taskIdx] = false;


      const newTrackProgress = {
        ...trackProgress,

        [day]: dayProg,
      };


      const newProgress = {
        ...progress,

        [selectedTrack]:
          newTrackProgress,
      };


      setProgress(newProgress);

      setSaving(true);

      try {
        await setDoc(
          doc(db, 'users', user.id),

          {
            progress: newProgress,
          },

          {
            merge: true,
          }
        );
      } catch (e) {
        console.error(
          'Failed to save progress:',
          e
        );
      }

      setSaving(false);
    },

    [
      user,
      selectedTrack,
      progress,
      trackProgress,
    ]
  );


  return {
    progress: trackProgress,

    // Complete progress for all tracks.
    allProgress: progress,

    saving,

    markDone,

    markUndone,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// useLeaderboard
// ─────────────────────────────────────────────────────────────────────────────

export function useLeaderboard(user) {
  const [allUsers, setAllUsers] =
    useState([]);


  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, 'users'),

      (snap) => {
        setAllUsers(
          snap.docs.map((d) => {
            const data = d.data();

            let userProgress =
              data.progress || {};


            /*
             * Backward compatibility for old users.
             *
             * Old format:
             *
             * progress: {
             *   1: [...],
             *   2: [...]
             * }
             */

            if (
              !userProgress.interview &&
              !userProgress.devops
            ) {
              userProgress = {
                interview: userProgress,
                devops: {},
              };
            }


            /*
             * For now leaderboard uses Interview Prep
             * progress, preserving the existing behaviour.
             *
             * Later we can add:
             *
             * Interview
             * DevOps
             * Overall
             */

            const interviewProgress =
              userProgress.interview || {};


            return {
              id: d.id,

              name: data.name,

              points:
                calcUserPoints(
                  interviewProgress
                ),

              daysCompleted:
                calcUserDaysCompleted(
                  interviewProgress
                ),

              streak:
                calcStreaks(
                  interviewProgress
                ).current,
            };
          })
        );
      }
    );

    return unsub;
  }, [user]);


  return allUsers;
}