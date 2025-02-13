import express from "express";
import http from "node:http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const chat = io.of("/chat");

chat.on("connection", (socket) => {
  console.log("User connected: ", socket.id);
});

// static files
app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
