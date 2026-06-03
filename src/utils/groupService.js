import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
  arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── groupService.js ───────────────────────────────────────────────────────

/** Generate a 5-char alphanumeric code, e.g. "XK92A" */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Create a new group.
 * Returns { ok, groupId, code } or { ok: false, error }
 */
export async function createGroup(name, userId) {
  try {
    // Retry up to 5 times in case of code collision (extremely unlikely)
    let code, ref, snap;
    for (let i = 0; i < 5; i++) {
      code = generateCode();
      ref  = doc(db, 'groups', code);
      snap = await getDoc(ref);
      if (!snap.exists()) break;
    }
    if (snap.exists()) return { ok: false, error: 'Could not generate unique code. Try again.' };

    await setDoc(ref, {
      name:      name.trim(),
      code,
      createdBy: userId,
      createdAt: serverTimestamp(),
      members:   [userId],
    });

    // Add groupId to user's groupIds array
    await updateDoc(doc(db, 'users', userId), { groupIds: arrayUnion(code) });

    return { ok: true, code };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e.message || 'Failed to create group.' };
  }
}

/**
 * Join an existing group by code.
 * Returns { ok, group } or { ok: false, error }
 */
export async function joinGroup(code, userId) {
  try {
    const ref  = doc(db, 'groups', code.trim().toUpperCase());
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: false, error: 'Group not found. Check the code.' };

    const group = snap.data();
    if (group.members.includes(userId)) return { ok: false, error: 'You are already in this group.' };

    await updateDoc(ref, { members: arrayUnion(userId) });
    await updateDoc(doc(db, 'users', userId), { groupIds: arrayUnion(code.trim().toUpperCase()) });

    return { ok: true, group: { ...group, code } };
  } catch (e) {
    return { ok: false, error: e.message || 'Failed to join group.' };
  }
}

/**
 * Leave a group.
 */
export async function leaveGroup(code, userId) {
  try {
    await updateDoc(doc(db, 'groups', code), { members: arrayRemove(userId) });
    await updateDoc(doc(db, 'users', userId), { groupIds: arrayRemove(code) });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'Failed to leave group.' };
  }
}

/**
 * Fetch group metadata (name, members list) by code.
 */
export async function fetchGroup(code) {
  const snap = await getDoc(doc(db, 'groups', code));
  if (!snap.exists()) return null;
  return { code, ...snap.data() };
}

/**
 * Fetch all user documents for a list of userIds.
 * Returns array of { id, name, points, daysCompleted, streak }
 * (caller computes points/streak from progress)
 */
export async function fetchGroupMembers(memberIds) {
  if (!memberIds?.length) return [];
  // Firestore 'in' supports up to 30 items; chunk if needed
  const chunks = [];
  for (let i = 0; i < memberIds.length; i += 30) chunks.push(memberIds.slice(i, i + 30));
  const results = [];
  for (const chunk of chunks) {
    const q    = query(collection(db, 'users'), where('__name__', 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach(d => results.push({ id: d.id, ...d.data() }));
  }
  return results;
}
