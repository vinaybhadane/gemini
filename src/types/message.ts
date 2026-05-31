import { Timestamp } from 'firebase/firestore';

export type UserId = 'user1' | 'user2';

export interface Message {
  id: string;
  sender: UserId;
  receiver: UserId;
  text: string;
  timestamp: Timestamp | null;
  seen: boolean;
  edited: boolean;
  deleted: boolean;
  replyTo?: {
    id: string;
    text: string;
    sender: UserId;
  };
}

export interface PresenceData {
  user1: boolean;
  user2: boolean;
  lastSeen: Timestamp | null;
}

export interface TypingData {
  user1: boolean;
  user2: boolean;
}
