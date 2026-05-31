'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  sendMessage as fbSendMessage,
  editMessage as fbEditMessage,
  deleteMessage as fbDeleteMessage,
  deleteAllMessages as fbDeleteAllMessages,
  markMessagesAsSeen,
  subscribeToMessages,
} from '@/firebase/messages';
import type { Message, UserId } from '@/types/message';

export function useMessages(currentUser: UserId) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';
  const seenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((rawMessages) => {
      const typed = rawMessages as Message[];
      setMessages(typed);
      setLoading(false);

      // Debounce seen marking so it fires after messages settle
      if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
      seenTimeoutRef.current = setTimeout(() => {
        markMessagesAsSeen(currentUser, partner).catch(console.error);
      }, 500);
    });

    return () => {
      unsubscribe();
      if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
    };
  }, [currentUser, partner]);

  const sendMessage = useCallback(
    async (text: string, replyTo?: { id: string; text: string; sender: UserId }) => {
      if (!text.trim()) return;
      await fbSendMessage(currentUser, partner, text, replyTo);
    },
    [currentUser, partner]
  );

  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!newText.trim()) return;
      await fbEditMessage(messageId, newText);
    },
    []
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    await fbDeleteMessage(messageId);
  }, []);

  const clearAllMessages = useCallback(async () => {
    await fbDeleteAllMessages();
  }, []);

  // Check if a message timestamp is within the 15-min edit window
  const canEdit = useCallback((timestamp: Timestamp | null): boolean => {
    if (!timestamp) return false;
    const msgDate = timestamp.toDate();
    const now = new Date();
    return now.getTime() - msgDate.getTime() <= 15 * 60 * 1000;
  }, []);

  return { messages, loading, sendMessage, editMessage, deleteMessage, clearAllMessages, canEdit };
}
