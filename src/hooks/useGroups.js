import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { createGroup, joinGroup, leaveGroup, fetchGroup, fetchGroupMembers } from '../utils/groupService';
import { calcUserPoints, calcUserDaysCompleted } from '../utils/helpers';
import { calcStreaks } from '../utils/streakUtils';

// ── useGroups ─────────────────────────────────────────────────────────────
// Tracks:
//   groups       — metadata for each group the user is in
//   groupMembers — { [code]: [ {id, name, points, daysCompleted, streak} ] }

export function useGroups(user, track = 'interview') {
  const [groupIds, setGroupIds]       = useState([]);
  const [groups, setGroups]           = useState([]); // [{code, name, createdBy, members}]
  const [groupMembers, setGroupMembers] = useState({}); // { code: [...users] }
  const [loadingGroups, setLoadingGroups] = useState(false);

  // ── Listen to user's groupIds array in Firestore ──────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.id), snap => {
      const ids = snap.data()?.groupIds || [];
      setGroupIds(ids);
    });
    return unsub;
  }, [user?.id]);

  // ── Fetch group metadata + members whenever groupIds changes ──────────
  useEffect(() => {
    if (!groupIds.length) { setGroups([]); setGroupMembers({}); return; }

    async function load() {
      setLoadingGroups(true);
      try {
        // Fetch group docs
        const fetched = await Promise.all(groupIds.map(fetchGroup));
        const valid   = fetched.filter(Boolean);
        setGroups(valid);

        // Fetch member user docs for each group
        const membersMap = {};
        await Promise.all(valid.map(async group => {
          const rawUsers = await fetchGroupMembers(group.members || []);
          membersMap[group.code] = rawUsers.map(u => {
            // u.progress can be the old flat format ({1: [...], 2: [...]})
            // or the new {interview: {...}, devops: {...}} format — normalize
            // before pulling out the currently selected track.
            const rawProgress = u.progress || {};
            const normalized = (!rawProgress.interview && !rawProgress.devops)
              ? { interview: rawProgress, devops: {} }
              : rawProgress;
            const trackProgress = normalized[track] || {};

            return {
              id:            u.id,
              name:          u.name,
              points:        calcUserPoints(trackProgress, track),
              daysCompleted: calcUserDaysCompleted(trackProgress, track),
              streak:        calcStreaks(trackProgress, track).current,
            };
          });
        }));
        setGroupMembers(membersMap);
      } catch (e) {
        console.error('useGroups load error:', e);
      }
      setLoadingGroups(false);
    }

    load();
  }, [JSON.stringify(groupIds), track]);

  // ── Actions ───────────────────────────────────────────────────────────

  const create = useCallback(async (name) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    return createGroup(name, user.id);
  }, [user]);

  const join = useCallback(async (code) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    return joinGroup(code, user.id);
  }, [user]);

  const leave = useCallback(async (code) => {
    if (!user) return { ok: false, error: 'Not logged in' };
    return leaveGroup(code, user.id);
  }, [user]);

  return { groups, groupIds, groupMembers, loadingGroups, create, join, leave };
}