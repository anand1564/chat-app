import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

import { Buffer } from 'buffer';
import process from 'process';
window.Buffer = Buffer;
window.process = process;


const socket = io('http://localhost:5000'); // Connect to signaling server

const VideoChat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  useEffect(() => {
    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error('Error accessing media devices:', err));

    // Join the room
    socket.emit('join-room', roomId);

    // Handle incoming signals
    socket.on('signal', (data: { signal: any, senderId: string }) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    // Handle new user connection
    socket.on('user-connected', (userId: string) => {
      console.log(userId);
      const peer = new SimplePeer({
        initiator: true,
        stream: localStream!,
        trickle: false,
      });

      peer.on('signal', (signal) => {
        socket.emit('signal', { roomId, signal, senderId: socket.id });
      });

      peer.on('stream', (stream) => {
        setRemoteStream(stream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      peerRef.current = peer;
    });

    // Handle user disconnect
    socket.on('user-disconnected', (userId: string) => {
      console.log(userId);
      if (peerRef.current) {
        console.log(remoteStream);
        peerRef.current.destroy();
        peerRef.current = null;
        setRemoteStream(null);
      }
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted />
      <video ref={remoteVideoRef} autoPlay />
    </div>
  );
};

export default VideoChat;