import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';
type CallState = 'requesting-camera' | 'waiting' | 'connecting' | 'connected' | 'error';

const VideoChat = () => {
  const [callState, setCallState] = useState<CallState>('requesting-camera');
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  const destroyPeer = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const findStranger = useCallback(() => {
    destroyPeer();
    if (!streamRef.current || !socketRef.current?.connected) return;
    setCallState('waiting');
    setError('');
    socketRef.current.emit('random:find');
  }, [destroyPeer]);

  useEffect(() => {
    let active = true;
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    const start = async () => {
      if (streamRef.current) {
        findStranger();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        if (socket.connected) findStranger();
      } catch {
        setCallState('error');
        setError('Camera and microphone access are required to start a video chat.');
      }
    };

    socket.on('connect', start);
    socket.on('random:waiting', () => setCallState('waiting'));
    socket.on('random:matched', ({ peerId, initiator }: { peerId: string; initiator: boolean }) => {
      if (!streamRef.current) return;
      destroyPeer();
      setCallState('connecting');
      const peer = new SimplePeer({ initiator, trickle: false, stream: streamRef.current });
      peer.on('signal', (signal) => socket.emit('random:signal', { targetId: peerId, signal }));
      peer.on('stream', (stream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
        setCallState('connected');
      });
      peer.on('error', () => {
        destroyPeer();
        setCallState('waiting');
      });
      peerRef.current = peer;
    });
    socket.on('random:signal', ({ signal }: { signal: SimplePeer.SignalData }) => peerRef.current?.signal(signal));
    socket.on('random:peer-left', findStranger);
    if (socket.connected) start();

    return () => {
      active = false;
      destroyPeer();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      socket.disconnect();
    };
  }, [destroyPeer, findStranger]);

  const skip = () => {
    destroyPeer();
    setCallState('waiting');
    socketRef.current?.emit('random:skip');
  };

  const toggleAudio = () => {
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !track.enabled; });
    setMuted((value) => !value);
  };
  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = !track.enabled; });
    setVideoOff((value) => !value);
  };

  const status = callState === 'connected' ? 'You are connected' : callState === 'connecting' ? 'Connecting securely…' : callState === 'waiting' ? 'Looking for someone online…' : callState === 'error' ? 'Unable to start' : 'Preparing your camera…';

  return <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <div><p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">One-on-one video</p><h1 className="text-3xl font-bold">Meet someone new</h1></div>
        <Link to="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Back home</Link>
      </header>
      <p className="mb-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-300" role="status">{status}</p>
      {error && <p className="mb-4 rounded-xl bg-red-950 px-4 py-3 text-red-200">{error}</p>}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"><video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-3 py-1 text-sm">You</span></div>
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"><video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />{callState !== 'connected' && <div className="absolute inset-0 grid place-items-center text-center text-slate-400"><span>{callState === 'error' ? 'Check your permissions and try again.' : 'Waiting for a stranger…'}</span></div>}<span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-3 py-1 text-sm">Stranger</span></div>
      </section>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={toggleAudio} className="rounded-xl bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700">{muted ? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleVideo} className="rounded-xl bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700">{videoOff ? 'Turn camera on' : 'Turn camera off'}</button>
        <button onClick={skip} disabled={callState === 'error'} className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">Skip to next</button>
      </div>
    </div>
  </main>;
};

export default VideoChat;
