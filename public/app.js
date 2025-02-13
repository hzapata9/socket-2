const username = prompt("Enter your username:");

const socket = io("/chat");

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("join", username);
});

socket.on("users", (users) => {
  const userList = document.getElementById("users");
  userList.innerHTML = "";

  users.forEach(({ username }) => {
    const item = document.createElement("li");
    item.textContent = username;
    userList.appendChild(item);
  });

  console.log("Users", users);
});

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const users = document.getElementById("users");

let roomName = "";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!roomName) {
    alert("You must join a room first!");
    return;
  }

  if (input.value) {
    socket.emit("sendMessage", { room: roomName, message: input.value });
  }
  form.reset();
});

const joinRoom = (room) => {
  roomName = room;
  // Unirse a una sala
  socket.emit("joinRoom", roomName);
};

// Escuchar mensajes de la sala
socket.on("message", (messageData) => {
  const { username, content, room } = messageData;

  const item = document.createElement("li");
  item.textContent = `${room} - ${username}: ${content}`;
  messages.appendChild(item);
});

// Salir de la sala
const leaveRoom = () => {
  socket.emit("leaveRoom", roomName);
  roomName = "";
  console.log("Sala abandonada");

  // Limpiar mensajes
  messages.innerHTML = "";
};
