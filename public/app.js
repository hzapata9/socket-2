const socket = io("/chat");
socket.on("connect", () => {
  console.log("Connected to server");
});
