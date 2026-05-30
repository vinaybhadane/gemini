'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { setTypingStatus, subscribeToTyping } from '@/firebase/typing';
import type { UserId } from '@/types/message';

const TYPING_DEBOUNCE_MS = 1500;

export function useTyping(currentUser: UserId) {
  const [partnerTyping, setPartnerTyping] = useState(false);
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToTyping((data) => {
      setPartnerTyping(!!data[partner]);
    });

    return () => {
      unsubscribe();
      // Ensure we clear typing status on unmount
      if (isTypingRef.current) {
        setTypingStatus(currentUser, false).catch(console.error);
      }
      if (stopTypingTimerRef.current) {
        clearTimeout(stopTypingTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Call this on every keystroke. Debounces the stop-typing signal.
   */
  const onTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTypingStatus(currentUser, true).catch(console.error);
    }

    // Reset the debounce timer
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }
    stopTypingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      setTypingStatus(currentUser, false).catch(console.error);
    }, TYPING_DEBOUNCE_MS);
  }, [currentUser]);

  /**
   * Call this when the user sends a message (clear typing immediately).
   */
  const stopTyping = useCallback(() => {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setTypingStatus(currentUser, false).catch(console.error);
    }
  }, [currentUser]);

  return { partnerTyping, onTyping, stopTyping };
}
