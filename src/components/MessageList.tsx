'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import type { Message, UserId } from '@/types/message';
import { formatDateSeparator, isSameDay } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Image from 'next/image';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUser: UserId;
  partnerTyping: boolean;
  onEdit: (id: string, newText: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="date-sep" role="separator" aria-label={label}>
      <span className="date-sep-label">{label}</span>
    </div>
  );
}

function EmptyState({ currentUser }: { currentUser: UserId }) {
  const name = currentUser === 'user1' ? 'User 1' : 'User 2';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="gemini-empty"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="gemini-empty-star"
      >
        <Image src="/gemini.png" alt="Gemini" width={56} height={56} style={{ objectFit: 'contain' }} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="gemini-empty-title"
      >
        Hi, {name}. Let&apos;s Start the Chat
      </motion.h2>
    </motion.div>
  );
}

export default function MessageList({
  messages,
  loading,
  currentUser,
  partnerTyping,
  onEdit,
  onDelete,
}: MessageListProps) {
  const listEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';
  const partnerLabel = partner === 'user1' ? 'User 1' : 'User 2';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 200) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, partnerTyping]);

  if (loading) {
    return (
      <div className="msg-list msg-list--loading" aria-busy="true">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`skel-row ${i % 2 === 0 ? 'skel-row--right' : ''}`}>
            <div className="skel-bubble" style={{ width: `${40 + i * 12}%` }} />
          </div>
        ))}
      </div>
    );
  }

  // Build flat list with date separators
  const items: Array<
    | { type: 'separator'; label: string }
    | { type: 'message'; message: Message; isConsecutive: boolean }
  > = [];

  messages.forEach((msg, idx) => {
    const msgDate = msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : new Date();
    if (idx === 0) {
      items.push({ type: 'separator', label: formatDateSeparator(msgDate) });
    } else {
      const prev = messages[idx - 1];
      const prevDate = prev.timestamp instanceof Timestamp ? prev.timestamp.toDate() : new Date();
      if (!isSameDay(prevDate, msgDate)) {
        items.push({ type: 'separator', label: formatDateSeparator(msgDate) });
      }
    }
    const prev = messages[idx - 1];
    const isConsecutive =
      !!prev &&
      prev.sender === msg.sender &&
      (() => {
        const pd = prev.timestamp instanceof Timestamp ? prev.timestamp.toDate() : new Date();
        const cd = msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : new Date();
        return isSameDay(pd, cd);
      })();

    items.push({ type: 'message', message: msg, isConsecutive });
  });

  return (
    <div
      ref={containerRef}
      className="msg-list"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <EmptyState currentUser={currentUser} />
      ) : (
        <AnimatePresence initial={false}>
          {items.map((item, idx) =>
            item.type === 'separator' ? (
              <DateSeparator key={`sep-${idx}`} label={item.label} />
            ) : (
              <MessageBubble
                key={item.message.id}
                message={item.message}
                currentUser={currentUser}
                onEdit={onEdit}
                onDelete={onDelete}
                isConsecutive={item.isConsecutive}
              />
            )
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {partnerTyping && <TypingIndicator key="typing" partnerName={partnerLabel} />}
      </AnimatePresence>

      <div ref={listEndRef} aria-hidden="true" />
    </div>
  );
}
