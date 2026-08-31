import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';
import userRouter from './api/routes/user';

const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const roomSelect = { id: true, name: true, inviteCode: true, createdAt: true } as const;

app.use(cors());
app.use(express.json());
app.use('/auth', userRouter);

app.post('/rooms', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name) return res.status(400).json({ error: 'A room name is required.' });

  try {
    const room = await prisma.room.create({
      data: {
        name,
        password: password ? await bcrypt.hash(password, 10) : '',
        inviteCode: randomUUID(),
      },
      select: roomSelect,
    });
    return res.status(201).json(room);
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'That room name is already in use.' });
    }
    console.error('Could not create room:', error);
    return res.status(500).json({ error: 'Could not create the room.' });
  }
});

app.get('/rooms/invite/:inviteCode', async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { inviteCode: req.params.inviteCode },
    select: roomSelect,
  });
  if (!room) return res.status(404).json({ error: 'This invite link is invalid or has expired.' });
  return res.json(room);
});

async function passwordIsValid(room: { password: string }, password: string) {
  // Rooms created before password hashing are still joinable after this upgrade.
  return !room.password || (room.password.startsWith('$2')
    ? await bcrypt.compare(password, room.password)
    : password === room.password);
}

function publicRoom(room: { id: number; name: string; inviteCode: string; createdAt: Date }) {
  return { id: room.id, name: room.name, inviteCode: room.inviteCode, createdAt: room.createdAt };
}

app.post('/rooms/:roomId/join', async (req, res) => {
  const roomId = Number(req.params.roomId);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!Number.isInteger(roomId)) return res.status(400).json({ error: 'Invalid room.' });
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return res.status(404).json({ error: 'Room not found.' });
  if (!await passwordIsValid(room, password)) return res.status(401).json({ error: 'Incorrect room password.' });

  return res.json(publicRoom(room));
});

app.post('/rooms/join', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!name) return res.status(400).json({ error: 'A room name is required.' });
  const room = await prisma.room.findUnique({ where: { name } });
  if (!room) return res.status(404).json({ error: 'Room not found.' });
  if (!await passwordIsValid(room, password)) return res.status(401).json({ error: 'Incorrect room password.' });
  return res.json(publicRoom(room));
});

const waiting = new Set<string>();
const matches = new Map<string, string>();

function removeFromQueue(socketId: string) {
  waiting.delete(socketId);
}

function endMatch(socketId: string, event = 'random:peer-left') {
  const peerId = matches.get(socketId);
  if (!peerId) return;
  matches.delete(socketId);
  matches.delete(peerId);
  io.to(peerId).emit(event);
}

function queueForMatch(socketId: string) {
  if (matches.has(socketId)) return;
  removeFromQueue(socketId);
  const peerId = [...waiting].find((id) => id !== socketId && io.sockets.sockets.has(id));
  if (!peerId) {
    waiting.add(socketId);
    io.to(socketId).emit('random:waiting');
    return;
  }
  waiting.delete(peerId);
  matches.set(socketId, peerId);
  matches.set(peerId, socketId);
  io.to(socketId).emit('random:matched', { peerId, initiator: true });
  io.to(peerId).emit('random:matched', { peerId: socketId, initiator: false });
}

io.on('connection', (socket) => {
  const authorizedRooms = new Set<number>();

  socket.on('room:join', async ({ roomId, inviteCode }: { roomId: number; inviteCode: string }) => {
    if (!Number.isInteger(roomId) || typeof inviteCode !== 'string') return;
    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { inviteCode: true } });
    if (!room || room.inviteCode !== inviteCode) {
      socket.emit('room:error', 'You are not allowed to join this room.');
      return;
    }
    authorizedRooms.add(roomId);
    socket.join(`room:${roomId}`);
    io.to(`room:${roomId}`).emit('room:presence', io.sockets.adapter.rooms.get(`room:${roomId}`)?.size ?? 0);
  });

  socket.on('room:leave', (roomId: number) => {
    authorizedRooms.delete(roomId);
    socket.leave(`room:${roomId}`);
    io.to(`room:${roomId}`).emit('room:presence', io.sockets.adapter.rooms.get(`room:${roomId}`)?.size ?? 0);
  });

  socket.on('room:message', (roomId: number, payload: { text: string; sender: string; sentAt: string }) => {
    if (!Number.isInteger(roomId) || !authorizedRooms.has(roomId) || !payload || typeof payload.text !== 'string') return;
    const text = payload.text.trim().slice(0, 2000);
    if (!text) return;
    io.to(`room:${roomId}`).emit('room:message', {
      text,
      sender: typeof payload.sender === 'string' ? payload.sender.slice(0, 40) : 'Guest',
      sentAt: payload.sentAt || new Date().toISOString(),
      socketId: socket.id,
    });
  });

  socket.on('random:find', () => queueForMatch(socket.id));
  socket.on('random:skip', () => {
    endMatch(socket.id);
    queueForMatch(socket.id);
  });
  socket.on('random:signal', ({ targetId, signal }: { targetId: string; signal: unknown }) => {
    if (matches.get(socket.id) === targetId) io.to(targetId).emit('random:signal', { signal });
  });
  socket.on('disconnect', () => {
    removeFromQueue(socket.id);
    endMatch(socket.id);
  });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
