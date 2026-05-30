import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import type { UserId } from '@/types/message';

const TYPING_DOC = 'typing/status';

/**
 * Set typing status for a user.
 */
export async function setTypingStatus(
  userId: UserId,
  isTyping: boolean
): Promise<void> {
  const ref = doc(db, TYPING_DOC);
  await setDoc(
    ref,
    { [userId]: isTyping },
    { merge: true }
  );
}

/**
 * Subscribe to typing status changes.
 */
export function subscribeToTyping(
  callback: (data: { user1: boolean; user2: boolean }) => void
): () => void {
  const ref = doc(db, TYPING_DOC);
  const unsubscribe = onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as { user1: boolean; user2: boolean };
      callback(data);
    } else {
      callback({ user1: false, user2: false });
    }
  });
  return unsubscribe;
}
