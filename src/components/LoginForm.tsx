'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    await new Promise((r) => setTimeout(r, 280));
    const success = login(password);
    if (!success) {
      setError('Incorrect password. Try again.');
      setShaking(true);
      setPassword('');
      setTimeout(() => { setShaking(false); inputRef.current?.focus(); }, 600);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-root">
      {/* Gemini blue center glow */}
      <div className="login-glow" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="login-content"
      >
        {/* Gemini star */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.5 }}
          className="login-star"
        >
          <Image src="/gemini.png" alt="Gemini" width={64} height={64} style={{ objectFit: 'contain' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="login-title"
        >
          Hi there. Let&apos;s Start the Chat
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="login-subtitle"
        >
          Enter your password to continue
        </motion.p>

        {/* Gemini pill input form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
          className="login-form-wrap"
        >
          <motion.form
            onSubmit={handleSubmit}
            animate={shaking ? { x: [0, -10, 10, -7, 7, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            className="login-pill-form"
          >
            <div className="login-pill">
              <span className="login-pill-lock" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                ref={inputRef}
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                placeholder="Enter password"
                autoComplete="current-password"
                autoFocus
                className="login-pill-input"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="login-pill-eye"
                aria-label={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <motion.button
                type="submit"
                id="enter-chat-btn"
                disabled={!password || isSubmitting}
                whileHover={password && !isSubmitting ? { scale: 1.05 } : {}}
                whileTap={password && !isSubmitting ? { scale: 0.95 } : {}}
                className="login-pill-send"
                aria-label="Enter Chat"
              >
                {isSubmitting ? (
                  <span className="login-spinner" aria-hidden="true" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="err"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="login-error"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="login-footer"
        >
          Gemini Flash is for personal use only
        </motion.p>
      </motion.div>
    </div>
  );
}
