'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CallState } from '@/hooks/useWebRTC';

interface VideoCallOverlayProps {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onHangup: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export default function VideoCallOverlay({
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  onAccept,
  onDecline,
  onHangup,
  onToggleMute,
  onToggleVideo,
}: VideoCallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="video-call-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="video-overlay"
      >
        {callState === 'ringing' && (
          <div className="ringing-container">
            <div className="pulse-ring">
              <div className="avatar-placeholder">📞</div>
            </div>
            <h2 className="ringing-text">Incoming Video Call...</h2>
            <div className="ringing-actions">
              <button className="btn-decline" onClick={onDecline}>
                Decline
              </button>
              <button className="btn-accept" onClick={onAccept}>
                Accept
              </button>
            </div>
          </div>
        )}

        {callState === 'connected' && (
          <div className="active-call-container">
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />

            {/* Local Video (PiP) */}
            <motion.div
              drag
              dragConstraints={{ top: -400, left: -800, right: 0, bottom: 0 }}
              className="local-video-container"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`local-video ${isVideoOff ? 'hidden' : ''}`}
              />
              {isVideoOff && (
                <div className="local-video-off">
                  <span>Camera Off</span>
                </div>
              )}
            </motion.div>

            {/* Controls */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="call-controls"
            >
              <button
                className={`control-btn ${isMuted ? 'muted' : ''}`}
                onClick={onToggleMute}
                title="Toggle Mute"
              >
                {isMuted ? '🔇' : '🎙️'}
              </button>
              <button
                className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
                onClick={onToggleVideo}
                title="Toggle Video"
              >
                {isVideoOff ? '🚫📷' : '📷'}
              </button>
              <button
                className="control-btn hangup-btn"
                onClick={onHangup}
                title="Hang Up"
              >
                📞❌
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
