
import { Router } from 'express';
import {PrismaClient} from '@prisma/client';
const userRouter = Router();
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');
userRouter.post('/signup', async(req,res)=>{
    const {username,password,email} = req.body;
    const passwordHash = await bcrypt.hash(password,10);
    try {
        const user = await prisma.user.create({
            data:{
                username: username,
                hashedPassword: passwordHash,
                email: email
            }
        })
        res.json({
            "message": "User created successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "Error": "Failed to create user",
        })
    }
})
export default userRouter;