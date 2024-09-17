import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Create a chat room
router.post('/create', async (req, res) => {
  const { roomName,password } = req.body; 
  const passwordHash = await bcrypt.hash(password,10); // Correct destructuring

  try {
    const room = await prisma.chatRoom.create({
      data: { name: roomName, hashedPassword: passwordHash },
    });
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});
router.post('/join', async(req,res)=>{
  const {roomId,password} = req.body;
  const room = await prisma.chatRoom.findUnique({
    where:{id:roomId}
  });
  if(!room){
    return res.status(404).json({error:'Room not found'});
  }
  const passwordMatch = await bcrypt.compare(password,room.hashedPassword);
  if(!passwordMatch){
    return res.status(401).json({error:'Incorrect password'});
  }
  res.json({message:'Welcome to the room'});
})
export default router;
