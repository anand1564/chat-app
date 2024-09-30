import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, ArrowRight } from 'lucide-react';
import Footer from './ui/footer';
import Navbar from './ui/Navbar';
const Home = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [createData, setCreateData] = useState({
    roomName: '',
    password: ''
  });
  const [joinData, setJoinData] = useState({
    roomId: '',
    password: ''
  });

  const createRoom = async (e: React.FormEvent) => {
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

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/chatRooms/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(joinData)
    });
    if (response.ok) {
      console.log('Room joined');
      navigate('/chatRoom/:id');
    } else {
      window.alert('Error Joining Room');
    }
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Navbar />
      <div className="flex-grow flex flex-col justify-center items-center p-6 text-center">
        <h2 className="text-5xl font-bold text-white mb-4 mt-5">Real-time Conversations, Simplified</h2>
        <p className="text-xl text-white mb-8">Connect with friends, colleagues, and communities instantly.</p>
        
        {!isLoggedIn ? (
          <Button 
            size="lg" 
            className=" text-white px-8 py-4 rounded-lg font-semibold text-lg" 
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        ) : (
          <div className="flex justify-center space-x-4">
            <Card className="max-w-xl w-full shadow-lg">
  <CardHeader className=" text-white text-center py-4">
    <CardTitle className="text-2xl font-bold text-black">Welcome to ChatApp</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="create" className=" p-2 rounded-lg">
          <MessageCircle className="mr-2 h-4 w-4" /> Create Room
        </TabsTrigger>
        <TabsTrigger value="join" className=" p-2 rounded-lg">
          <Users className="mr-2 h-4 w-4 " /> Join Room
        </TabsTrigger>
      </TabsList>

      {/* Create Room Tab */}
      <TabsContent value="create" className="space-y-4">
        <Input
          type="text"
          placeholder="Enter room name"
          onChange={(e) => setCreateData({ ...createData, roomName: e.target.value })}
          className="p-4 rounded-lg "
        />
        <Input 
          type="password" 
          placeholder="Create a password" 
          onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
          className="p-4 rounded-lg "
        />
        <Button onClick={createRoom} className="w-full  text-white p-3 rounded-lg">
          Create Room <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </TabsContent>

      {/* Join Room Tab */}
      <TabsContent value="join" className="space-y-4">
        <Input
          type="text"
          placeholder="Enter Room ID"
          onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
          className="p-4 rounded-lg"
        />
        <Input 
          type="password" 
          placeholder="Enter password" 
          onChange={(e) => setJoinData({ ...joinData, password: e.target.value })}
          className="p-4 rounded-lg "
        />
        <Button onClick={handleJoin} className="w-full text-white p-3 rounded-lg">
          Join Room <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>

          </div>
        )}
      </div>
      <div className='w-full'><Footer /></div>
    </main>
  );
};

export default Home;
