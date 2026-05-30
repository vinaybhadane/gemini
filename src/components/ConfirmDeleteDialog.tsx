'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface ConfirmDeleteDialogProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({ onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => { if (mounted) cancelRef.current?.focus(); }, [mounted]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onCancel]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try { await onConfirm(); } finally { setIsDeleting(false); }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ── Dark blurred backdrop ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 9998,
        }}
      />

      {/* ── Flex centering wrapper (avoids transform conflicts) ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          pointerEvents: 'none',
        }}
      >
        {/* ── Dialog card ──────────────────────────────────── */}
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 24 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents: 'all',
            width: '100%',
            maxWidth: '400px',
            background: '#1e1f20',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '32px 28px 26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.8)',
            gap: '0',
          }}
        >
          {/* Warning icon */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            marginBottom: '20px',
            flexShrink: 0,
          }} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>

          <h2 id="dialog-title" style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#e3e3e3',
            letterSpacing: '-0.02em',
            marginBottom: '10px',
          }}>
            Delete all messages?
          </h2>

          <p id="dialog-desc" style={{
            fontSize: '0.875rem',
            color: '#8e918f',
            lineHeight: '1.65',
            marginBottom: '28px',
          }}>
            This will permanently delete the entire chat history for both users.{' '}
            <span style={{ color: '#f87171', fontWeight: 600 }}>This action cannot be undone.</span>
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
            <button
              ref={cancelRef}
              onClick={onCancel}
              disabled={isDeleting}
              style={{
                flex: 1,
                maxWidth: '160px',
                padding: '11px 20px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.07)',
                color: '#c4c7c5',
                opacity: isDeleting ? 0.45 : 1,
                transition: 'background 150ms',
              }}
              onMouseOver={e => !isDeleting && ((e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)')}
              onMouseOut={e => ((e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)')}
            >
              Cancel
            </button>

            <motion.button
              id="confirm-delete-all-btn"
              onClick={handleConfirm}
              disabled={isDeleting}
              whileHover={!isDeleting ? { scale: 1.03 } : {}}
              whileTap={!isDeleting ? { scale: 0.97 } : {}}
              style={{
                flex: 1,
                maxWidth: '160px',
                padding: '11px 20px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                border: 'none',
                background: '#dc2626',
                color: 'white',
                opacity: isDeleting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                boxShadow: '0 0 24px rgba(220,38,38,0.35)',
                transition: 'background 150ms, box-shadow 150ms',
              }}
            >
              {isDeleting ? (
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'block',
                  animation: 'spin 0.65s linear infinite',
                }} aria-hidden="true" />
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Delete All
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}
