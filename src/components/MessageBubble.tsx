'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, UserId } from '@/types/message';
import { formatTime, isEditable } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  currentUser: UserId;
  onEdit: (id: string, newText: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply?: (message: Message) => void;
  isConsecutive?: boolean;
}

export default function MessageBubble({
  message,
  currentUser,
  onEdit,
  onDelete,
  onReply,
  isConsecutive = false,
}: MessageBubbleProps) {
  const isOwn = message.sender === currentUser;
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const canBeEdited = isOwn && !message.deleted && isEditable(message.timestamp);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    setEditText(message.text);
    setIsEditing(true);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, [message.text]);

  const handleEditSubmit = useCallback(async () => {
    if (!editText.trim() || editText.trim() === message.text || isSubmitting) return;
    setIsSubmitting(true);
    await onEdit(message.id, editText);
    setIsSubmitting(false);
    setIsEditing(false);
  }, [editText, message.text, message.id, onEdit, isSubmitting]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
      if (e.key === 'Escape') { setIsEditing(false); setEditText(message.text); }
    },
    [handleEditSubmit, message.text]
  );

  const handleDelete = useCallback(async () => {
    setShowMenu(false);
    await onDelete(message.id);
  }, [message.id, onDelete]);

  // ── OWN messages — dark pill bubble (right-aligned) ──────────────────────
  if (isOwn) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`msg-row msg-row--own ${isConsecutive ? 'msg-row--consecutive' : ''}`}
      >
        <div className="msg-own-wrap">
          {message.deleted ? (
            <div className="msg-bubble msg-bubble--own msg-bubble--deleted">
              <span className="msg-deleted-text">You deleted this message</span>
            </div>
          ) : isEditing ? (
            <div className="msg-edit-wrap">
              <textarea
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                maxLength={2000}
                rows={1}
                className="msg-edit-textarea"
                aria-label="Edit message"
              />
              <div className="msg-edit-actions">
                <button onClick={() => { setIsEditing(false); setEditText(message.text); }} className="msg-edit-cancel">Cancel</button>
                <button onClick={handleEditSubmit} disabled={isSubmitting || !editText.trim() || editText.trim() === message.text} className="msg-edit-save">
                  {isSubmitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="msg-bubble msg-bubble--own"
              onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
            >
              {message.replyTo && (
                <div className="msg-reply-preview msg-reply-preview--own">
                  <span className="msg-reply-preview-sender">
                    {message.replyTo.sender === 'user1' ? 'User 1' : 'User 2'}: 
                  </span>
                  <span className="msg-reply-preview-text">{message.replyTo.text}</span>
                </div>
              )}
              <p className="msg-text">{message.text}</p>
            </div>
          )}

          {/* Meta row */}
          {!isEditing && (
            <div className="msg-meta msg-meta--own">
              {message.edited && !message.deleted && <span className="msg-edited">Edited</span>}
              <span className="msg-time">{formatTime(message.timestamp)}</span>
              {!message.deleted && (
                <span className={`msg-tick ${message.seen ? 'msg-tick--seen' : ''}`} aria-label={message.seen ? 'Seen' : 'Sent'}>
                  {message.seen ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          )}

          {/* Context menu */}
          {!message.deleted && (
            <div className="msg-menu-wrap">
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="menu-backdrop" onClick={() => setShowMenu(false)} aria-hidden="true" />
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="msg-context-menu"
                    >
                      {canBeEdited && (
                        <button role="menuitem" onClick={handleEdit} className="ctx-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      <button role="menuitem" onClick={handleDelete} className="ctx-item ctx-item--danger">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete for everyone
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ── PARTNER messages — plain text, no bubble (left-aligned) ──────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`msg-row msg-row--other ${isConsecutive ? 'msg-row--consecutive' : ''}`}
    >
      {message.deleted ? (
        <p className="msg-deleted-text msg-deleted-text--other">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          This message was deleted
        </p>
      ) : (
        <>
          {message.replyTo && (
            <div className="msg-reply-preview msg-reply-preview--other">
              <span className="msg-reply-preview-sender">
                {message.replyTo.sender === 'user1' ? 'User 1' : 'User 2'}: 
              </span>
              <span className="msg-reply-preview-text">{message.replyTo.text}</span>
            </div>
          )}
          <p className="msg-text msg-text--other">{message.text}</p>
          {/* Gemini-style action bar below partner messages */}
          <div className="msg-actions-bar">
            <button className="msg-action-btn" title="Copy" aria-label="Copy message" onClick={() => navigator.clipboard.writeText(message.text)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="msg-action-btn" title="Reply" aria-label="Reply to message" onClick={() => onReply?.(message)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </svg>
            </button>
            {message.edited && <span className="msg-edited msg-edited--other">Edited</span>}
            <span className="msg-time msg-time--other">{formatTime(message.timestamp)}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
