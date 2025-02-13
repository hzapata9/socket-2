import express from "express";
import http from "node:http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// static files
app.use(express.static("public"));

interface Message {
  id: number;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  room: string;
}

const messages: Message[] = [];

interface User {
  id: string;
  username: string;
  joinedAt: Date;
}

const connectedUsers: { [key: string]: User } = {};

// chat with namespace
const chat = io.of("/chat");
chat.on("connection", (socket) => {
  // Conectar usuario
  socket.on("join", (username: string) => {
    connectedUsers[socket.id] = {
      id: socket.id,
      username: username,
      joinedAt: new Date(),
    };
    console.log(`User ${connectedUsers[socket.id].username} connected`);

    // Broadcast a todos los usuarios conectados
    chat.emit("users", Object.values(connectedUsers));
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);

    const user = connectedUsers[socket.id];

    const messageData = {
      id: Date.now(),
      userId: user.id,
      username: user.username,
      content: `User ${user.username} joined the chat`,
      timestamp: new Date(),
      room: room,
    };

    chat.to(room).emit("message", messageData);
  });

  // Enviar mensaje solo a la sala
  socket.on("sendMessage", ({ room, message }) => {
    const user = connectedUsers[socket.id];
    const messageData = {
      id: Date.now(),
      userId: user.id,
      username: user.username,
      content: message,
      timestamp: new Date(),
      room: room,
    };

    messages.push(messageData);

    chat.to(room).emit("message", messageData);
  });

  // Dejar la sala
  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  // Desconectar usuario
  socket.on("disconnect", () => {
    delete connectedUsers[socket.id];
    console.log(`User ${socket.id} disconnected`);

    // Broadcast a todos los usuarios conectados
    chat.emit("users", Object.values(connectedUsers));
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
