const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const { extractTextFromImage, extractDataFromText } = require("./utils/ocr");
const { saveDataToExcel } = require("./utils/exportToExcel");
const { getAddressFromCEP } = require("./utils/viacep");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "camera.html"));
});

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Imagem não fornecida" });
  }

  console.log("📸 Imagem recebida para OCR");

  try {
    const processedImage = await sharp(req.file.buffer)
      .resize(1500)
      .grayscale()
      .median(3)
      .sharpen()
      .normalize()
      .toBuffer();

    const text = await extractTextFromImage(processedImage);
    console.log("Texto extraído pelo OCR:", text);

    if (!text) {
      throw new Error("Falha no OCR");
    }

    const extractedData = extractDataFromText(text);
    console.log("📋 Dados extraídos:", extractedData);

    res.json({ success: true, data: extractedData });
  } catch (err) {
    console.error("❌ Erro no processamento:", err);
    res.status(500).json({ success: false, message: "Erro no processamento" });
  }
});

app.post("/export", (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: "Nenhum dado válido para exportar" });
  }

  console.log("📂 Dados recebidos para exportação:", data);

  try {
    saveDataToExcel([data]);
    res.json({ success: true, message: "Dados exportados com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao exportar dados:", error);
    res.status(500).json({ success: false, message: "Erro ao exportar dados." });
  }
});

app.get("/cep/:cep", async (req, res) => {
  const cep = req.params.cep;
  const address = await getAddressFromCEP(cep);
  if (address) {
    res.json({ success: true, data: address });
  } else {
    res.status(404).json({ success: false, message: "CEP não encontrado" });
  }
});

io.on("connection", (socket) => {
  console.log("Um cliente se conectou:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`Cliente ${socket.id} entrou na sala ${room}`);
  });

  socket.on("image", (data, room) => {
    console.log("Imagem recebida do celular na sala:", room);
    io.to(room).emit("image", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("✅ Servidor rodando em: http://localhost:3000");
});