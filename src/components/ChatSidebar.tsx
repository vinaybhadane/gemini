'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserId } from '@/types/message';
import Image from 'next/image';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useAuth } from '@/context/AuthContext';

interface ChatSidebarProps {
  currentUser: UserId;
  partnerOnline: boolean;
  onClearAll: () => Promise<void>;
  onStartVideoCall?: () => void;
}

export default function ChatSidebar({ currentUser, partnerOnline, onClearAll, onStartVideoCall }: ChatSidebarProps) {
  const { logout } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const userLabel = currentUser === 'user1' ? 'U1' : 'U2';
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';
  const partnerLabel = partner === 'user1' ? 'U1' : 'U2';

  return (
    <aside className="chat-sidebar" aria-label="Navigation sidebar">
      {/* Top: Logo */}
      <div className="sidebar-top">
        <div className="sidebar-logo" title="Gemini Flash" aria-label="Gemini Flash logo">
          <Image src="/gemini.png" alt="Gemini" width={26} height={26} style={{ objectFit: 'contain' }} />
        </div>

        {/* Edit / New conversation icon */}
        <button
          className="sidebar-icon-btn"
          title="New Chat"
          aria-label="New Chat"
          onClick={logout}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Search */}
        <button className="sidebar-icon-btn" title="Search" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Apps / Extensions */}
        <button className="sidebar-icon-btn" title="Extensions" aria-label="Extensions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      </div>

      {/* Bottom: Settings + User Avatar */}
      <div className="sidebar-bottom">
        {/* Partner status dot */}
        <div className="sidebar-partner-dot" title={`Partner ${partnerOnline ? 'Online' : 'Offline'}`}>
          <div className={`partner-status-dot ${partnerOnline ? 'partner-status-dot--online' : ''}`} />
        </div>

        {/* Red Delete All button */}
        <motion.button
          id="sidebar-delete-all-btn"
          onClick={() => setShowDeleteDialog(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="sidebar-delete-btn"
          aria-label="Delete all messages"
          title="Delete all messages"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </motion.button>

        {/* Video Call */}
        <button className="sidebar-icon-btn" title="Video Call" aria-label="Video Call" onClick={onStartVideoCall}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>

        {/* Settings */}
        <button className="sidebar-icon-btn" title="Settings" aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* User Avatar */}
        <button
          onClick={logout}
          className="sidebar-avatar"
          title={`Signed in as ${currentUser === 'user1' ? 'User 1' : 'User 2'} · Click to sign out`}
          aria-label={`User ${userLabel} · Sign out`}
        >
          {userLabel}
        </button>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <ConfirmDeleteDialog
            onConfirm={async () => { await onClearAll(); setShowDeleteDialog(false); }}
            onCancel={() => setShowDeleteDialog(false)}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}
