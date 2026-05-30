import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { UserId } from '@/types/message';

const PRESENCE_DOC = 'presence/status';

/**
 * Set a user's online status to true.
 */
export async function setOnline(userId: UserId): Promise<void> {
  const ref = doc(db, PRESENCE_DOC);
  await setDoc(
    ref,
    {
      [userId]: true,
    },
    { merge: true }
  );
}

/**
 * Set a user's online status to false and update lastSeen.
 */
export async function setOffline(userId: UserId): Promise<void> {
  const ref = doc(db, PRESENCE_DOC);
  await setDoc(
    ref,
    {
      [userId]: false,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to presence changes.
 */
export function subscribeToPresence(
  callback: (data: { user1: boolean; user2: boolean; lastSeen: unknown }) => void
): () => void {
  const ref = doc(db, PRESENCE_DOC);
  const unsubscribe = onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as { user1: boolean; user2: boolean; lastSeen: unknown };
      callback(data);
    } else {
      callback({ user1: false, user2: false, lastSeen: null });
    }
  });
  return unsubscribe;
}
