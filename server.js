// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // public 폴더를 정적 파일로 제공

io.on("connection", (socket) => {
  let currentRoom = null;
  let nickname = "익명";

  socket.on("join", ({ roomId, name }) => {
    currentRoom = roomId;
    nickname = name || "익명";

    socket.join(currentRoom);
    io.to(currentRoom).emit("system", `📥 ${nickname} 님이 들어왔습니다.`);
  });

  socket.on("msg", (text) => {
    if (!currentRoom) return;
    const payload = {
      name: nickname,
      text,
      time: new Date().toLocaleTimeString(),
    };
    io.to(currentRoom).emit("msg", payload);
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    io.to(currentRoom).emit("system", `📤 ${nickname} 님이 나갔습니다.`);
  });
});

server.listen(3000, () => {
  console.log("http://localhost:3000 에서 대기 중");
});
