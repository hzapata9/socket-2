import express from "express";
import http from "node:http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// namespaces
const chat = io.of("/chat");

chat.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  // rooms
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log("User joined room: ", room);

    // enviar mensaje a todos los usuarios de la sala
    chat.to(room).emit("message", `${socket.id} joined room: ${room}`);
  });

  // enviar mensaje a todos los usuarios de la sala
  socket.on("message", ({ room, message }) => {
    chat.to(room).emit("message", message);
  });

  // salir de la sala
  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log("User left room: ", room);

    // enviar mensaje a todos los usuarios de la sala
    chat.to(room).emit("message", "User left room: " + room);
  });
});

// static files
app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
