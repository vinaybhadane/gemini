import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from './config';
import type { UserId } from '@/types/message';

const MESSAGES_COLLECTION = 'messages';

/**
 * Send a new message to Firestore.
 */
export async function sendMessage(
  sender: UserId,
  receiver: UserId,
  text: string,
  replyTo?: { id: string; text: string; sender: UserId }
): Promise<void> {
  await addDoc(collection(db, MESSAGES_COLLECTION), {
    sender,
    receiver,
    text: text.trim(),
    timestamp: serverTimestamp(),
    seen: false,
    edited: false,
    deleted: false,
    ...(replyTo && { replyTo }),
  });
}

/**
 * Edit an existing message (only within 15-minute window).
 */
export async function editMessage(
  messageId: string,
  newText: string
): Promise<void> {
  const msgRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(msgRef, {
    text: newText.trim(),
    edited: true,
  });
}

/**
 * Hard-delete every message in the collection (used by "Delete All" button).
 */
export async function deleteAllMessages(): Promise<void> {
  const snapshot = await getDocs(collection(db, MESSAGES_COLLECTION));
  if (snapshot.empty) return;

  // Firestore batch allows up to 500 ops — split if needed
  const chunks: typeof snapshot.docs[] = [];
  for (let i = 0; i < snapshot.docs.length; i += 490) {
    chunks.push(snapshot.docs.slice(i, i + 490));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

/**
 * Soft-delete a message (mark deleted, keep document for UI).
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const msgRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(msgRef, {
    deleted: true,
    text: '',
  });
}

/**
 * Mark all messages from the partner as seen.
 */
export async function markMessagesAsSeen(
  currentUser: UserId,
  partner: UserId
): Promise<void> {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('sender', '==', partner),
    where('receiver', '==', currentUser),
    where('seen', '==', false)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { seen: true });
  });
  await batch.commit();
}

/**
 * Subscribe to realtime messages stream.
 */
export function subscribeToMessages(
  callback: (messages: Array<{
    id: string;
    sender: UserId;
    receiver: UserId;
    text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: any;
    seen: boolean;
    edited: boolean;
    deleted: boolean;
  }>) => void
): () => void {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Parameters<typeof callback>[0][number], 'id'>),
    }));
    callback(msgs);
  });

  return unsubscribe;
}
