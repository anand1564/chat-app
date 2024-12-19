import { METHODS } from "http";
import router from "./api/routes/chatRoom";
import userRouter from "./api/routes/user";
import msgRouter from "./api/routes/messages";
import { Request,Response } from "express";
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const {Server}= require('socket.io');
const cors = require('cors');

const io = new Server(server,{
    cors:{
        origin: 'http://localhost:5173',
        methods: ['GET','POST']
    }
})
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use("/chatRoom",router);
app.use("/users",userRouter);
app.use("/messages",msgRouter);
app.get('/',(req: Request,res: Response)=>{
    res.send('Server is running');
});
//@ts-ignore
io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('join', (roomId:any) => {
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });
  
    socket.on('message', (message:any) => {
      console.log('message received:', message);
      io.to(message.roomId).emit('message', message);
    });
    socket.on("signal", (data:any) => {
      io.to(data.target).emit("signal", { signal: data.signal, from: socket.id });
    });
  
    // Notify other users
    socket.on("join-room", (roomId:string) => {
      socket.join(roomId);
      io.to(roomId).emit("user-joined", socket.id);
    });
  
    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });
  });

server.listen(3000,()=>{
    console.log('Server started on port 3000');
    console.log(process.env.DATABASE_URL);
})