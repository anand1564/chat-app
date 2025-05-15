import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './api/routes/user';

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/auth',userRouter);

// Create a room
app.post('/rooms', async (req, res) => {
  const { name, password } = req.body;
  const room = await prisma.room.create({ data: { name, password } });
  res.json(room);
});

// Join a room
app.post('/room/join', async (req, res) => {
  const { name, password } = req.body;
  const room = await prisma.room.findUnique({ where: { name } });
  if (!room || room.password !== password) {
    return res.status(400).json({ error: 'Invalid room name or password' });
  }
  res.json(room);
});

// Socket.io for chat
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('send-message', (roomId, message) => {
    socket.to(roomId).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});