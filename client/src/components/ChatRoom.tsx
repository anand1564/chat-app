import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type User = {
  id: string;
  name: string;
};

type Message = {
  id: string;
  content: string;
  userId: string;
  chatRoomId: string;
  createdAt: string;
};

const ChatRoom = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const roomId = '3c4f9946-b156-404a-be8f-039c955e4d30';  // Replace this with your actual room ID
  const userId = 'ce06b02b-5146-46a6-a892-106582cec208';  // Replace this with the actual user ID

  // Fetch chat room details and user list when the component mounts
  useEffect(() => {
    const fetchChatRoomData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/chatRoom/${roomId}`);
        const data = await response.json();
        
        setUsers(data.users);         // Set the user list from API response
        setMessages(data.messages);   // Set the messages from API response
      } catch (error) {
        console.error('Error fetching chat room data:', error);
      }
    };
    
    fetchChatRoomData();
  }, [roomId]);

  // Create socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
  
    newSocket.emit('join', roomId);
  
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });
  
    newSocket.on('message', (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);
  
  const handleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const newMessage = {
        roomId,
        sender: userId,
        content: message,
      };
  
      // Emit the message to the socket
      socket.emit('message', newMessage);
  
      // Send the message to the backend to store in the database
      try {
        const response = await fetch(`http://localhost:3000/messages/create/${roomId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sender: userId, content: message }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log('Message stored in DB:', data);
        } else {
          console.error('Error storing message:', data.error);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
  
      setMessage(''); // Clear input field
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - 1/3rd of the screen */}
      <div className="w-1/3 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold">User list</h2>
        <div>
          {users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user.id} className="p-2 bg-gray-700 rounded-md my-2">
                  {user.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No users in the room</p>
          )}
        </div>
      </div>

      {/* Chat Room - 2/3rd of the screen */}
      <div className="w-2/3 bg-gray-900 flex flex-col">
        <h2 className="text-2xl font-bold text-white p-4">Chat Room</h2>

        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto text-white space-y-2">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="bg-gray-700 p-2 rounded-md">
                {msg.content}
              </div>
            ))
          ) : (
            <p>No messages yet</p>
          )}
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
