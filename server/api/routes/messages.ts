import { Router, Request, Response } from "express";
import { PrismaClient, Message, Prisma } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

interface CreateMessageRequest extends Request {
    body: {
        chatRoom: string;
        sender: string;
        content: string;
    };
}

// GET route to fetch messages by chatRoom
router.get('/:chatRoomId', async (req: Request, res: Response) => {
    const { chatRoomId } = req.params;

    if (!chatRoomId) {
        return res.status(400).json({ error: "chatRoom is required" });
    }

    try {
        const messages: Message[] = await prisma.message.findMany({
            where: {
                chatRoomId: chatRoomId as string,  
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "An error occurred while fetching messages" });
    }
});

router.post('/create/:roomId', async (req: CreateMessageRequest, res: Response) => {
    const {roomId} = req.params;
    const { sender, content } = req.body;

    if ( !sender || !content) {
        return res.status(400).json({ error: "chatRoom, sender, and content are required" });
    }

    try {
        const message = await prisma.message.create({
            data: {
                chatRoomId: roomId, 
                userId: sender,       
                content: content,
            },
        });

        res.status(201).json({
            message: "Message sent successfully",
            data: message,
        });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ error: "An error occurred while creating the message" });
    }
});


export default router;
