'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserId } from '@/types/message';
import {
  createCall,
  answerCall,
  endCall,
  listenToCall,
  listenForIncomingCalls,
  addIceCandidate,
  listenToIceCandidates,
  getCallRoomId,
  CallData,
} from '@/firebase/webrtc';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export type CallState = 'idle' | 'ringing' | 'connected' | 'ended';

export function useWebRTC(currentUser: UserId) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [incomingCallData, setIncomingCallData] = useState<{ roomId: string; caller: UserId } | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const partner: UserId = currentUser === 'user1' ? 'user2' : 'user1';

  // Listen for incoming calls
  useEffect(() => {
    const unsubscribe = listenForIncomingCalls(currentUser, (id, data) => {
      // Only set if we are not already in a call
      if (callState === 'idle') {
        setIncomingCallData({ roomId: id, caller: data.caller });
        setCallState('ringing');
      }
    });
    return () => unsubscribe();
  }, [currentUser, callState]);

  // Setup PeerConnection
  const setupPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(servers);
    
    // Register local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (localStreamRef.current) {
          peerConnection.addTrack(track, localStreamRef.current);
        }
      });
    }

    // Register remote stream
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        // Create a new MediaStream to ensure React detects the state change
        setRemoteStream(new MediaStream(event.streams[0].getTracks()));
      }
    };

    pc.current = peerConnection;
    return peerConnection;
  }, []);

  // Request media permissions
  const getLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      alert('Microphone and Camera permissions are required for video calls.');
      return null;
    }
  };

  // 1. Start a call
  const startCall = async () => {
    const stream = await getLocalMedia();
    if (!stream) return;

    const peerConnection = setupPeerConnection();
    const id = getCallRoomId(currentUser, partner);
    setRoomId(id);
    setCallState('ringing');

    // Collect ICE Candidates for caller
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addIceCandidate(id, event.candidate, 'caller');
      }
    };

    // Create Offer
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);
    
    const offer = {
      type: offerDescription.type,
      sdp: offerDescription.sdp,
    };

    await createCall(currentUser, partner, offer);

    // Listen to answer and remote ICE candidates
    const unsubCall = listenToCall(id, (data) => {
      if (data && data.answer && !peerConnection.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDescription);
      }
      if (data?.status === 'ended') {
        handleHangup();
      } else if (data?.status === 'connected') {
        setCallState('connected');
      }
    });

    const unsubCandidates = listenToIceCandidates(id, 'callee', (candidate) => {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // We store unsubscribe functions on the window object or refs if we want to clean them up properly, 
    // but ending the call and resetting RTCPeerConnection usually suffices for MVP.
  };

  // 2. Answer a call
  const acceptCall = async () => {
    if (!incomingCallData) return;
    const { roomId: id } = incomingCallData;
    
    const stream = await getLocalMedia();
    if (!stream) return;

    const peerConnection = setupPeerConnection();
    setRoomId(id);
    setCallState('connected');
    setIncomingCallData(null);

    // Collect ICE Candidates for callee
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addIceCandidate(id, event.candidate, 'callee');
      }
    };

    // Listen to call doc
    let offerFound = false;
    listenToCall(id, async (data) => {
      if (data?.status === 'ended') {
        handleHangup();
        return;
      }
      if (data?.offer && !offerFound) {
        offerFound = true;
        const offerDescription = new RTCSessionDescription(data.offer);
        await peerConnection.setRemoteDescription(offerDescription);

        const answerDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };
        await answerCall(id, answer);
      }
    });

    // Listen to remote ICE candidates
    listenToIceCandidates(id, 'caller', (candidate) => {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };

  // 3. Decline call
  const declineCall = async () => {
    if (incomingCallData) {
      await endCall(incomingCallData.roomId);
      setIncomingCallData(null);
      setCallState('idle');
    }
  };

  // 4. Hang up
  const handleHangup = useCallback(async () => {
    if (roomId) {
      await endCall(roomId);
    }
    
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    // Close peer connection
    if (pc.current) {
      pc.current.close();
    }
    
    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    localStreamRef.current = null;
    pc.current = null;
    setCallState('idle');
    setRoomId(null);
    setIncomingCallData(null);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [roomId]);

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return {
    localStream,
    remoteStream,
    callState,
    incomingCallData,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    declineCall,
    handleHangup,
    toggleMute,
    toggleVideo,
  };
}
