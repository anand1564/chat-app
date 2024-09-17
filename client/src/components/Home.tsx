import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { BackgroundLines } from './ui/background-lines';
import Signup from './Signup';
import { button } from 'framer-motion/client';

const Home = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [createData, setCreateData] = useState({
    roomName: '',
    password: ''
  });
  const [joinData,setJoinData] = useState({
    roomId:'',
    password: ''
  });

  const createRoom = async (e:React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/chatRooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });
      if (response.ok) {
        console.log('Room created');
        navigate('/chatRoom/:id');
      } else {
        console.log('Error creating room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };
  const handleJoin = async(e:React.FormEvent)=>{
    e.preventDefault();
    const response = await fetch('http://localhost:3000/chatRooms/join',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(joinData)
    });
    if(response.ok){
      console.log('Room joined');
      navigate('/chatRoom/:id');
     }else{
      window.alert('Error Joining Room');
     }
}

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      
      <div className="relative z-10 container mx-auto p-6">
        {isLoggedIn ? (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center text-white">Welcome to Chat Rooms</h1>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Create a Chat Room</h2>
              <form onSubmit={createRoom} className="space-y-4">
                <input
                  type="text"
                  placeholder="Room Name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  onChange={(e) => setCreateData({...createData, roomName: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Enter the password"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  onChange={(e) => setCreateData({...createData, password: e.target.value})}
                />
                <button type="submit" className="w-full">
                  Create Room
                </button>
              </form>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Join a Chat Room</h2>
              <form className='space-y-4' onSubmit={handleJoin}>
                <input type='text' placeholder='Room ID' className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white' onChange={(e)=>setJoinData({...joinData,roomId: e.target.value})}/>
                <input type='password' placeholder='Enter the password' className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white' onChange={(e)=>setJoinData({...joinData,password: e.target.value})}/>
                <button className='w-full'>Join Room</button>
              </form>
              <p className="text-gray-400">Room joining functionality coming soon...</p>
            </div>
          </div>
        ) : (
          <Signup />
        )}
      </div>
    </div>
  );
};

export default Home;