import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatRoom = () => {
  const socket = io('http://localhost:3000');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]); // Array to store messages

  useEffect(() => {
    socket.on('connect', () => {
      console.log('A user connected');
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    // Listen for incoming messages
    socket.on('message', (newMessage: string) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', message); // Send message to server
      setMessages((prevMessages) => [...prevMessages, message]); // Add the message locally
      setMessage(''); // Clear input field
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - 1/3rd of the screen */}
      <div className="w-1/3 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold">User list</h2>
      </div>

      {/* Chat Room - 2/3rd of the screen */}
      <div className="w-2/3 bg-gray-900 flex flex-col">
        <h2 className="text-2xl font-bold text-white p-4">Chat Room</h2>

        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto text-white space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className="bg-gray-700 p-2 rounded-md">
              {msg}
            </div>
          ))}
        </div>

        {/* Input Field and Send Button at the bottom */}
        <form onSubmit={handleMessage} className="p-4 bg-gray-800 flex">
          <input
            type="text"
            className="flex-1 p-2 bg-gray-700 text-white rounded-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-blue-500 rounded-md text-white hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
