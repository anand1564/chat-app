
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
        console.log("Successful");
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
userRouter.get('/',async(req,res)=>{
    const users = await prisma.user.findMany();
    res.json(users);
})
userRouter.get('/login',async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await prisma.user.findUnique({
            //@ts-ignore
            where: {
                email: email,
            }
        });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
            if (isPasswordValid) {
                res.json({
                    message: "Login successful",
                });
            } else {
                res.status(401).json({
                    message: "Invalid credentials",
                });
            }
        } else {
            res.status(404).json({
                message: "User not found",
            });
        }
    } catch (error) {
        console.error("Login error", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
})
export default userRouter;