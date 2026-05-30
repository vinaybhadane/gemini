'use client';

import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  partnerName: string;
}

const DOT_VARIANTS = {
  initial: { y: 0 },
  animate: { y: -6 },
};

export default function TypingIndicator({ partnerName }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="typing-indicator"
      role="status"
      aria-live="polite"
      aria-label={`${partnerName} is typing`}
    >
      <span className="typing-name">{partnerName}</span>
      <span className="typing-text">is typing</span>
      <div className="typing-dots" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="typing-dot"
            variants={DOT_VARIANTS}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
