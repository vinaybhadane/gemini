'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export interface MessageInputRef {
  focus: () => void;
  insertText: (text: string) => void;
}

const MAX_CHARS = 2000;

const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
}, ref) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    insertText: (newText: string) => {
      setText(prev => {
        const updated = prev ? `${prev}\n${newText}` : newText;
        return updated.length > MAX_CHARS ? updated.slice(0, MAX_CHARS) : updated;
      });
      setTimeout(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }));

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length > MAX_CHARS) return;
      setText(val);
      autoResize();
      val.trim() ? onTyping() : onStopTyping();
    },
    [onTyping, onStopTyping, autoResize]
  );

  const saveCursor = useCallback(() => {
    const el = textareaRef.current;
    if (el) cursorPosRef.current = el.selectionStart ?? text.length;
  }, [text.length]);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const pos = cursorPosRef.current;
      const newText = text.slice(0, pos) + emoji + text.slice(pos);
      if (newText.length > MAX_CHARS) return;
      setText(newText);
      onTyping();
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          const newPos = pos + emoji.length;
          el.focus();
          el.setSelectionRange(newPos, newPos);
          cursorPosRef.current = newPos;
          autoResize();
        }
      });
    },
    [text, onTyping, autoResize]
  );

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;
    setIsSending(true);
    setShowEmoji(false);
    onStopTyping();
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await onSend(trimmed);
    } catch {
      setText(trimmed);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [text, isSending, disabled, onSend, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend]
  );

  const charCount = text.length;
  const nearLimit = charCount >= MAX_CHARS * 0.85;
  const canSend = text.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="gemini-input-area">
      {/* Emoji picker floats above */}
      <AnimatePresence>
        {showEmoji && (
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
        )}
      </AnimatePresence>

      {/* Gemini pill input */}
      <div className="gemini-input-pill">
        {/* + / Add button (left side) */}
        <motion.button
          type="button"
          onClick={() => { saveCursor(); setShowEmoji(v => !v); }}
          whileTap={{ scale: 0.88 }}
          className={`gemini-plus-btn ${showEmoji ? 'gemini-plus-btn--active' : ''}`}
          aria-label={showEmoji ? 'Close emoji picker' : 'Add emoji'}
          aria-expanded={showEmoji}
        >
          {showEmoji ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          )}
        </motion.button>

        {/* Textarea */}
        <div className="gemini-textarea-wrap">
          <textarea
            ref={textareaRef}
            id="message-input"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={saveCursor}
            onClick={saveCursor}
            onKeyUp={saveCursor}
            placeholder="Type a message..."
            rows={1}
            maxLength={MAX_CHARS}
            disabled={disabled || isSending}
            className="gemini-textarea"
            aria-label="Type a message"
            aria-multiline="true"
          />
          {nearLimit && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`gemini-char-count ${charCount >= MAX_CHARS ? 'gemini-char-count--limit' : ''}`}
              aria-live="polite"
            >
              {charCount}/{MAX_CHARS}
            </motion.span>
          )}
        </div>

        {/* Right side: mic icon (decorative) + send */}
        <div className="gemini-input-right">
          {!canSend && (
            <button
              type="button"
              className="gemini-mic-btn"
              aria-label="Voice input"
              title="Voice input"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
          {canSend && (
            <motion.button
              id="send-message-btn"
              type="button"
              onClick={handleSend}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
              className="gemini-send-btn"
              aria-label="Send message"
            >
              {isSending ? (
                <span className="gemini-send-spinner" aria-hidden="true" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <p className="gemini-input-hint" aria-hidden="true">
        Private &amp; encrypted · <kbd>Enter</kbd> send · <kbd>Shift+Enter</kbd> new line
      </p>
    </div>
  );
});

export default MessageInput;
