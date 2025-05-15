import  { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:3000');

const ChatRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, sender: 'me' | 'other', timestamp: Date}>>([]); 
  const [roomId, setRoomId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ [key: string]: Peer.Instance }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);
      if (myVideo.current) myVideo.current.srcObject = stream;
    }).catch(err => {
      console.error("Error accessing media devices:", err);
      alert("Please allow camera and microphone access to use the video chat feature");
    });

    socket.on('user-connected', (userId) => {
      if (!localStream) return;
      const peer = new Peer({ initiator: true, stream: localStream });
      peer.on('signal', (signal) => {
        socket.emit('signal', userId, signal);
      });
      peersRef.current[userId] = peer;
      setPeers({ ...peersRef.current });
    });

    socket.on('receive-signal', (signal) => {
      if (!localStream) return;
      const peer = new Peer({ initiator: false, stream: localStream });
      peer.on('signal', (signal) => {
        socket.emit('return-signal', signal);
      });
      peer.signal(signal);
      peersRef.current[signal.id] = peer;
      setPeers({ ...peersRef.current });
    });

    socket.on('receive-message', (text) => {
      setMessages((prev) => [...prev, {text, sender: 'other', timestamp: new Date()}]);
    });

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      socket.disconnect();
    };
  }, [localStream]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, password }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      
      const data = await response.json();
      setRoomId(data.id);
      socket.emit('join-room', data.id);
      setIsJoined(true);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  const joinRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, password }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to join room');
      }
      
      const data = await response.json();
      setRoomId(data.id);
      socket.emit('join-room', data.id);
      setIsJoined(true);
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room. Please check room name and password.");
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !roomId) return;
    
    socket.emit('send-message', roomId, message);
    setMessages((prev) => [...prev, {text: message, sender: 'me', timestamp: new Date()}]);
    setMessage('');
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveRoom = () => {
    socket.emit('leave-room', roomId);
    setRoomId(null);
    setIsJoined(false);
    setMessages([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Video Chat Room</h1>
        {roomId && <p className="text-sm opacity-75">Room: {roomName}</p>}
      </header>

      <main className="flex flex-col md:flex-row flex-grow overflow-hidden">
        {!isJoined ? (
          // Join/Create Room Form
          <div className="flex items-center justify-center w-full p-8">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-center">Join or Create a Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    placeholder="Enter room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={createRoom}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Create Room
                  </button>
                  <button 
                    onClick={joinRoom}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Chat Room UI
          <>
            {/* Video Area */}
            <div className="md:w-3/5 p-4 flex flex-col">
              <div className="bg-black rounded-lg overflow-hidden flex-grow relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
                  <div className="relative">
                    <video 
                      ref={myVideo} 
                      autoPlay 
                      muted 
                      className="w-full h-full object-cover rounded" 
                    />
                    <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 text-xs rounded">
                      You
                    </div>
                  </div>
                  
                  {Object.keys(peers).map((peerId) => (
                    <div key={peerId} className="relative">
                      <video 
                        autoPlay 
                        ref={(ref) => ref && (ref.srcObject = peers[peerId].streams[0])} 
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 text-xs rounded">
                        Participant
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button 
                    onClick={toggleAudio} 
                    className={`p-3 rounded-full ${isAudioMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
                  >
                    {isAudioMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button 
                    onClick={toggleVideo} 
                    className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
                  >
                    {isVideoOff ? 'Show Video' : 'Hide Video'}
                  </button>
                  <button 
                    onClick={leaveRoom} 
                    className="p-3 rounded-full bg-red-600 text-white"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="md:w-2/5 border-t md:border-t-0 md:border-l border-gray-300 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-300">
                <h2 className="font-semibold text-lg">Chat</h2>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center italic">No messages yet</p>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'me' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs ${msg.sender === 'me' ? 'text-indigo-200' : 'text-gray-500'} text-right mt-1`}>
                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-300 flex">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatRoom;