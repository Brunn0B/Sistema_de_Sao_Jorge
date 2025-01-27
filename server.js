const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");
const { extractTextFromImage } = require("./utils/ocr"); // Função de OCR

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Middleware para parsing de JSON
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Redirecionar "/" para "camera.html"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "camera.html"));
});

// Endpoint para receber a imagem e realizar OCR
app.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      console.error("Nenhuma imagem recebida.");
      return res.status(400).json({ success: false, message: "Imagem não fornecida" });
    }

    console.log("Imagem recebida. Iniciando OCR...");

    const text = await extractTextFromImage(image);

    if (text) {
      console.log("Texto extraído com sucesso:", text);
      res.json({ success: true, text });
    } else {
      console.error("OCR não conseguiu extrair texto.");
      res.status(500).json({ success: false, message: "Falha no OCR" });
    }
  } catch (err) {
    console.error("Erro no endpoint /upload:", err);
    res.status(500).json({ success: false, message: "Erro no processamento da imagem" });
  }
});


// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor funcionando em: http://localhost:${port}`);
});
