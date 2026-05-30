'use client';

import { useState, useEffect, useRef } from 'react';
import { setOnline, setOffline, subscribeToPresence } from '@/firebase/presence';
import type { UserId } from '@/types/message';

export function usePresence(currentUser: UserId) {
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<unknown>(null);
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Go online immediately
    setOnline(currentUser).catch(console.error);

    // Subscribe to partner's presence
    const unsubscribe = subscribeToPresence((data) => {
      setPartnerOnline(!!data[partner]);
      setLastSeen(data.lastSeen);
    });

    // --- Offline detection strategies ---

    // 1. Component unmounts (tab navigation in same session)
    const goOffline = () => {
      setOffline(currentUser).catch(console.error);
    };

    // 2. Page hidden (tab switch, minimize, browser close)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        goOffline();
      } else if (document.visibilityState === 'visible') {
        setOnline(currentUser).catch(console.error);
      }
    };

    // 3. beforeunload fires before tab/window close
    const handleBeforeUnload = () => {
      // Use sendBeacon-style fire-and-forget if possible
      goOffline();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      goOffline();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { partnerOnline, lastSeen };
}
