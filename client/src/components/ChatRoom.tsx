import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';
type Room = { id: number; name: string; inviteCode: string; createdAt: string };
type ChatMessage = { text: string; sender: string; sentAt: string; socketId: string };

const ChatRoom = () => {
  const { inviteCode } = useParams();
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem('chat-display-name') ?? 'Guest');
  const [room, setRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [people, setPeople] = useState(0);
  const [error, setError] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(Boolean(inviteCode));
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;
    socket.on('room:message', (incoming: ChatMessage) => setMessages((previous) => [...previous, incoming]));
    socket.on('room:presence', setPeople);
    socket.on('room:error', setError);
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => { messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!room || !socketRef.current) return;
    const join = () => socketRef.current?.emit('room:join', { roomId: room.id, inviteCode: room.inviteCode });
    if (socketRef.current.connected) join();
    socketRef.current.on('connect', join);
    return () => {
      socketRef.current?.emit('room:leave', room.id);
      socketRef.current?.off('connect', join);
    };
  }, [room]);

  useEffect(() => {
    if (!inviteCode) return;
    let active = true;
    fetch(`${SERVER_URL}/rooms/invite/${encodeURIComponent(inviteCode)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Unable to open this room.');
        return data as Room;
      })
      .then((data) => { if (active) { setRoom(data); setRoomName(data.name); } })
      .catch((reason: Error) => active && setError(reason.message))
      .finally(() => active && setLoadingInvite(false));
    return () => { active = false; };
  }, [inviteCode]);

  const saveName = () => {
    const name = displayName.trim().slice(0, 40) || 'Guest';
    setDisplayName(name);
    sessionStorage.setItem('chat-display-name', name);
    return name;
  };

  const requestRoom = async (path: string, payload: object) => {
    setError('');
    const response = await fetch(`${SERVER_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Unable to enter the room.');
    return data as Room;
  };

  const createRoom = async (event: FormEvent) => {
    event.preventDefault();
    try { setRoom(await requestRoom('/rooms', { name: roomName, password })); saveName(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create the room.'); }
  };

  const joinWithPassword = async () => {
    try { setRoom(await requestRoom('/rooms/join', { name: roomName, password })); saveName(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to join the room.'); }
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !room) return;
    socketRef.current?.emit('room:message', room.id, { text, sender: saveName(), sentAt: new Date().toISOString() });
    setMessage('');
  };

  const copyInvite = async () => {
    if (!room) return;
    await navigator.clipboard.writeText(`${window.location.origin}/chatRoom/${room.inviteCode}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (loadingInvite) return <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">Opening your room…</div>;

  if (!room) return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-3xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-900 p-8 ring-1 ring-cyan-400/20"><p className="mb-3 text-sm font-semibold uppercase tracking-[.2em] text-cyan-300">Private group chat</p><h1 className="text-4xl font-bold">Make a room. Share one link. Talk live.</h1><p className="mt-5 max-w-lg text-slate-300">Create a password-protected room for your group, or invite people with a unique link. Messages appear instantly for everyone in the room.</p><Link to="/video-chat" className="mt-8 inline-block rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-100 hover:bg-slate-800">Try random video chat →</Link></section>
      <section className="rounded-3xl bg-white p-7 text-slate-900 shadow-2xl"><h2 className="text-2xl font-bold">Enter a chat room</h2><p className="mt-1 text-sm text-slate-500">Use a room name and password, or open an invite link.</p>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<form onSubmit={createRoom} className="mt-6 space-y-4"><label className="block text-sm font-medium">Your display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} className="mt-1 w-full rounded-lg border p-3" required /></label><label className="block text-sm font-medium">Room name<input value={roomName} onChange={(e) => setRoomName(e.target.value)} maxLength={80} className="mt-1 w-full rounded-lg border p-3" placeholder="Friday movie night" required /></label><label className="block text-sm font-medium">Room password <span className="font-normal text-slate-400">(optional when using the link)</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg border p-3" placeholder="Set a password" /></label><div className="grid grid-cols-2 gap-3"><button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700">Create room</button><button type="button" onClick={joinWithPassword} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-100">Join room</button></div></form></section>
    </div>
  </main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-6 text-white"><div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-4"><div><p className="text-sm text-cyan-300">Live room · {people} {people === 1 ? 'person' : 'people'} here</p><h1 className="text-2xl font-bold">{room.name}</h1></div><div className="flex gap-2"><button onClick={copyInvite} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300">{copied ? 'Invite copied!' : 'Copy invite link'}</button><Link to="/chatRoom" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Leave</Link></div></header><section className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.length === 0 && <div className="grid h-full place-items-center text-center text-slate-500"><p>Share the invite link to start chatting.</p></div>}{messages.map((item, index) => <article key={`${item.socketId}-${item.sentAt}-${index}`} className="max-w-xl rounded-2xl bg-slate-800 px-4 py-3"><div className="mb-1 flex gap-2 text-sm"><strong className="text-cyan-300">{item.sender}</strong><time className="text-slate-500">{new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div><p className="break-words text-slate-100">{item.text}</p></article>)}<div ref={messageEndRef} /></div><form onSubmit={sendMessage} className="flex gap-3 border-t border-slate-800 p-4"><input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-cyan-400 focus:ring-2" placeholder="Write a message…" /><button className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300">Send</button></form></section></div></main>;
};

export default ChatRoom;
