import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000');

const ChatRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});

  const myVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ [key: string]: Peer.Instance }>({});

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);
      if (myVideo.current) myVideo.current.srcObject = stream;
    });

    socket.on('user-connected', (userId) => {
      const peer = new Peer({ initiator: true, stream: localStream! });
      peer.on('signal', (signal) => {
        socket.emit('signal', userId, signal);
      });
      peersRef.current[userId] = peer;
      setPeers({ ...peersRef.current });
    });

    socket.on('receive-signal', (signal) => {
      const peer = new Peer({ initiator: false, stream: localStream! });
      peer.on('signal', (signal) => {
        socket.emit('return-signal', signal);
      });
      peer.signal(signal);
      peersRef.current[signal.id] = peer;
      setPeers({ ...peersRef.current });
    });

    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = async () => {
    const response = await fetch('http://localhost:5000/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, password }),
    });
    const data = await response.json();
    setRoomId(data.id);
    socket.emit('join-room', data.id);
  };

  const joinRoom = async () => {
    const response = await fetch('http://localhost:5000/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, password }),
    });
    const data = await response.json();
    setRoomId(data.id);
    socket.emit('join-room', data.id);
  };

  const sendMessage = () => {
    socket.emit('send-message', roomId, message);
    setMessages((prev) => [...prev, message]);
    setMessage('');
  };

  return (
    <div>
      <h1>Video Chat App</h1>
      <div>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={createRoom}>Create Room</button>
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <video ref={myVideo} autoPlay muted />
        {Object.keys(peers).map((peerId) => (
          <video key={peerId} autoPlay ref={(ref) => ref && (ref.srcObject = peers[peerId].stream)} />
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default ChatRoom;