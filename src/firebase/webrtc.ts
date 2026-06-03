import { db } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import type { UserId } from '@/types/message';

// Generate a deterministic room ID for the two users
export const getCallRoomId = (userA: string, userB: string) => {
  return [userA, userB].sort().join('_');
};

export interface CallData {
  caller: UserId;
  callee: UserId;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  status: 'ringing' | 'connected' | 'ended';
  updatedAt: number;
}

export const createCall = async (caller: UserId, callee: UserId, offer: RTCSessionDescriptionInit) => {
  const roomId = getCallRoomId(caller, callee);
  const callDocRef = doc(db, 'calls', roomId);

  // Clean up any existing candidates first
  await cleanupCandidates(roomId);

  const callData: CallData = {
    caller,
    callee,
    offer,
    status: 'ringing',
    updatedAt: Date.now(),
  };

  await setDoc(callDocRef, callData);
  return roomId;
};

export const answerCall = async (roomId: string, answer: RTCSessionDescriptionInit) => {
  const callDocRef = doc(db, 'calls', roomId);
  await updateDoc(callDocRef, {
    answer,
    status: 'connected',
    updatedAt: Date.now(),
  });
};

export const endCall = async (roomId: string) => {
  const callDocRef = doc(db, 'calls', roomId);
  await updateDoc(callDocRef, {
    status: 'ended',
    updatedAt: Date.now(),
  });
  // Optional: delete doc completely after some time, or let it just be 'ended'
};

export const listenToCall = (roomId: string, callback: (data: CallData | null) => void) => {
  const callDocRef = doc(db, 'calls', roomId);
  return onSnapshot(callDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as CallData);
    } else {
      callback(null);
    }
  });
};

export const listenForIncomingCalls = (callee: UserId, callback: (roomId: string, data: CallData) => void) => {
  const callsRef = collection(db, 'calls');
  const q = query(callsRef, where('callee', '==', callee), where('status', '==', 'ringing'));

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        callback(change.doc.id, change.doc.data() as CallData);
      }
    });
  });
};

// ICE Candidates
export const addIceCandidate = async (roomId: string, candidate: RTCIceCandidate, type: 'caller' | 'callee') => {
  const candidatesRef = collection(db, 'calls', roomId, `${type}Candidates`);
  await addDoc(candidatesRef, candidate.toJSON());
};

export const listenToIceCandidates = (
  roomId: string,
  type: 'caller' | 'callee',
  callback: (candidate: RTCIceCandidateInit) => void
) => {
  const candidatesRef = collection(db, 'calls', roomId, `${type}Candidates`);
  return onSnapshot(candidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        callback(change.doc.data() as RTCIceCandidateInit);
      }
    });
  });
};

export const cleanupCandidates = async (roomId: string) => {
  // Try to delete caller and callee candidates
  const types = ['callerCandidates', 'calleeCandidates'];
  for (const type of types) {
    const candidatesRef = collection(db, 'calls', roomId, type);
    const snap = await getDocs(candidatesRef);
    snap.docs.forEach((d) => deleteDoc(d.ref));
  }
};
