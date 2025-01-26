const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Redirecionar "/" para "camera.html"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "camera.html"));
});

// Receber o feed de vídeo do celular e transmitir para todos os clientes conectados
io.on("connection", (socket) => {
  console.log("Novo cliente conectado!");

  socket.on("stream", (data) => {
    socket.broadcast.emit("stream", data); // Transmite o feed recebido para outros clientes
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado!");
  });
});

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor funcionando em: http://localhost:${port}`);
});
