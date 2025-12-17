const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Render/브라우저 접속 문제 방지(CORS)
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  let currentRoom = null;
  let nickname = "익명";

  socket.on("join", ({ roomId, name }) => {
    currentRoom = roomId;
    nickname = (name || "익명").trim() || "익명";

    socket.join(currentRoom);
    io.to(currentRoom).emit("system", `📥 ${nickname} 님이 들어왔습니다.`);
  });

  socket.on("nick", (newName) => {
    if (!currentRoom) return;

    const cleaned = String(newName || "").trim();
    if (!cleaned) return;

    const old = nickname;
    nickname = cleaned;

    io.to(currentRoom).emit("system", `✏️ ${old} → ${nickname} (닉네임 변경)`);
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
