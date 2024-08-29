import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create a chat room
router.post('/create', async (req, res) => {
  const { roomName } = req.body;  // Correct destructuring

  try {
    const room = await prisma.chatroom.create({
      data: { name: roomName },
    });
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

export default router;
