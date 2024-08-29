"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chatRoom_1 = require("./api/routes/chatRoom");
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var Server = require('socket.io').Server;
var cors = require('cors');
var io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use("/chatRooms", chatRoom_1.default);
app.get('/', function (req, res) {
    res.send('Server is running');
});
io.on('connection', function () {
    console.log('a user connected');
});
server.listen(3000, function () {
    console.log('Server started on port 3000');
});
