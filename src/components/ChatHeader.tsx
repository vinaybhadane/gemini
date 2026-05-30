'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserId } from '@/types/message';
import Image from 'next/image';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useAuth } from '@/context/AuthContext';

interface ChatHeaderProps {
  partnerOnline: boolean;
  currentUser: UserId;
  onClearAll: () => Promise<void>;
}

export default function ChatHeader({ partnerOnline, currentUser, onClearAll }: ChatHeaderProps) {
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';
  const partnerLabel = partner === 'user1' ? 'User 1' : 'User 2';

  const handleDeleteConfirm = async () => {
    await onClearAll();
    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Mobile-only top bar (hidden on desktop via CSS) */}
      <header className="mobile-header">
        {/* Left: Hamburger / sign out */}
        <button className="mobile-header-btn" aria-label="Menu" onClick={logout} title="Sign out">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Center: Logo + Title + Status dropdown */}
        <div className="mobile-header-center">
        <Image src="/gemini.png" alt="Gemini" width={22} height={22} style={{ objectFit: 'contain' }} />
          <span className="mobile-header-title">Gemini Flash</span>
          <div className={`mobile-online-dot ${partnerOnline ? 'mobile-online-dot--on' : ''}`} />
          <button
            className="mobile-header-dropdown"
            onClick={() => setShowMenu(v => !v)}
            aria-haspopup="true"
            aria-expanded={showMenu}
            aria-label="Status"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Status dropdown */}
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setShowMenu(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="mobile-header-menu"
                >
                  <div className="mobile-header-menu-item">
                    <div className={`presence-dot ${partnerOnline ? 'presence-dot--online' : 'presence-dot--offline'}`} />
                    <span>{partnerLabel}: {partnerOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <div className="mobile-header-menu-divider" />
                  <button className="mobile-header-menu-item mobile-header-menu-item--btn" onClick={logout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Red Delete button */}
        <motion.button
          id="delete-all-chat-btn"
          onClick={() => setShowDeleteDialog(true)}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          className="delete-all-btn"
          aria-label="Delete all messages"
          title="Delete all messages"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          <span className="delete-btn-label">Delete</span>
        </motion.button>
      </header>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <ConfirmDeleteDialog
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteDialog(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
