'use client';

import { motion } from 'framer-motion';

interface PresenceIndicatorProps {
  isOnline: boolean;
  label: string;
}

export default function PresenceIndicator({ isOnline, label }: PresenceIndicatorProps) {
  return (
    <div className="presence-indicator" role="status" aria-live="polite">
      <div className="presence-dot-wrap" aria-hidden="true">
        <span
          className={`presence-dot ${isOnline ? 'presence-dot--online' : 'presence-dot--offline'}`}
        />
        {isOnline && (
          <motion.span
            className="presence-dot-pulse"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}
      </div>
      <span className="presence-label">{label}</span>
    </div>
  );
}
