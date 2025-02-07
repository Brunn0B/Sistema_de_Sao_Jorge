const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const { extractTextFromImage } = require("./utils/ocr");
const { saveDataToExcel } = require("./utils/exportToExcel");
const { getAddressFromCEP } = require("./utils/viacep");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "camera.html"));
});

// Rota para upload de imagem e OCR
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Imagem não fornecida" });
  }

  console.log("📸 Imagem recebida para OCR");

  try {
    // Processamento da imagem com Sharp
    const processedImage = await sharp(req.file.buffer)
    .resize({ width: 1500 }) // Mantém resolução alta para melhor leitura
    .grayscale() // Remove cores para destacar o texto
    .modulate({ brightness: 1.2, contrast: 1.5 }) // Aumenta brilho e contraste
    .median(5) // Reduz ruído mantendo detalhes
    .sharpen({ sigma: 1 }) // Aumenta nitidez sutilmente
    .threshold(180) // Binariza a imagem para destacar texto
    .toBuffer();
  

    // Extrai o texto da imagem processada
    const text = await extractTextFromImage(processedImage);
    console.log("📜 Texto extraído:", text);

    if (!text) {
      return res.status(500).json({ success: false, message: "Erro ao extrair texto da imagem" });
    }

    // Extrai os dados específicos do texto
    const extractedData = extractDataFromText(text);
    console.log("📋 Dados extraídos:", extractedData);

    // Envia os dados extraídos para o endpoint /export
    const exportResponse = await fetch("http://localhost:3000/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extractedData),
    });

    if (!exportResponse.ok) {
      throw new Error("Erro ao exportar dados para Excel");
    }

    const exportResult = await exportResponse.json();
    console.log("📂 Resultado da exportação:", exportResult);

    res.json({ success: true, data: extractedData });
  } catch (err) {
    console.error("❌ Erro no processamento:", err);
    res.status(500).json({ success: false, message: "Erro no processamento da imagem" });
  }
});


// Rota para exportar dados para Excel
app.post("/export", (req, res) => {
  const data = req.body;
  console.log("📂 Dados recebidos para exportação:", data);

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: "Nenhum dado para exportar" });
  }

  try {
    saveDataToExcel(data);
    res.json({ success: true, message: "Dados exportados com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao exportar:", error);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// Rota para buscar endereço por CEP
app.get("/cep/:cep", async (req, res) => {
  const cep = req.params.cep;
  const address = await getAddressFromCEP(cep);
  if (address) {
    res.json({ success: true, data: address });
  } else {
    res.status(404).json({ success: false, message: "CEP não encontrado" });
  }
});

// Configuração do Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`📲 Cliente ${socket.id} entrou na sala ${room}`);
  });

  socket.on("image", (data, room) => {
    console.log("🖼️ Imagem recebida do celular na sala:", room);
    io.to(room).emit("image", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// Função para extrair dados do texto OCR
function extractDataFromText(text) {
  return {
    nome: text.match(/(Nome|Nome Completo):?\s*([A-ZÀ-Ú][^\n]+)/i)?.[2]?.trim(),
    cpf: text.match(/(CPF|C\s*P\s*F|C\.P\.F\.)\D*(\d{3}\D?\d{3}\D?\d{3}\D?\d{2})/i)?.[2]?.replace(/\D/g, ""),
    rg: text.match(/(RG|R\s*G|R\.G\.)\D*(\d{1,2}\D?\d{3}\D?\d{3})/i)?.[2]?.replace(/\D/g, ""),
    telefone: text.match(/(Telefone|Tel|Celular):\s*([\d()-]+)/i)?.[2]?.trim() || text.match(/(\(\d{2}\)\s?\d{4,5}-\d{4})/)?.[0]?.trim(),
    cep: text.match(/(CEP|C\.E\.P\.):\s*([\d-]+)/i)?.[2]?.trim() || text.match(/(\d{5}-\d{3})/)?.[0]?.trim(),
    endereco: text.match(/(Endereço|Endereco|Rua|Av\.):\s*([^\n]+)/i)?.[2]?.trim(),
    dataNascimento: text.match(/(Data de Nascimento|Nascimento):\s*([\d/]+)/i)?.[2]?.trim() || text.match(/(\d{2}\/\d{2}\/\d{4})/)?.[0]?.trim(),
  };
}

// Inicia o servidor
server.listen(3000, () => {
  console.log("✅ Servidor rodando em: http://localhost:3000");
});