// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});


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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("server running on", PORT));
