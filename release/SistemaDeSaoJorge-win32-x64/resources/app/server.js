const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000; // Porta que será usada
const bodyParser = require("body-parser");
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurar o body-parser para aceitar JSON
app.use(bodyParser.json({ limit: "10mb" }));

// Rota para receber imagens
app.post("/upload", (req, res) => {
  const imageData = req.body.image;

  // Converter base64 para buffer
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // Salvar a imagem em um arquivo local
  const filePath = path.join(__dirname, "uploads", `imagem_${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  console.log(`Imagem salva em: ${filePath}`);
  res.json({ success: true, filePath });
});

// Servir os arquivos HTML e JS do frontend
app.use(express.static(path.join(__dirname, "public")));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
