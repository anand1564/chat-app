import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Signup from './Signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, ArrowRight } from 'lucide-react';

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
    <div className="relative min-h-screen bg-gray-900 text-white">

      <div className="flex items-center justify-center min-h-screen">
        {isLoggedIn ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome to ChatApp</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">
                    <MessageCircle className="mr-2 h-4 w-4" /> Create Room
                  </TabsTrigger>
                  <TabsTrigger value="join">
                    <Users className="mr-2 h-4 w-4" /> Join Room
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter room name"
                    onChange={(e) => setCreateData({ ...createData, roomName: e.target.value })}
                  />
                  <Input type="text" placeholder='Create a password' onChange={(e) => setCreateData({ ...createData, password: e.target.value })} />
                  <Button onClick={createRoom} className="w-full">
                    Create Room <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </TabsContent>
                <TabsContent value="join" className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter Room Id"
                    onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
                  />
                  <Input type="text" placeholder="Enter password" onChange={(e) => setJoinData({ ...joinData, password: e.target.value })} />
                  <Button onClick={handleJoin} className="w-full">
                    Join Room <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Signup />
        )}
      </div>
    </div>
  );
};

export default Home;