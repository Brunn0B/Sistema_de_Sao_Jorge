const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");
const { extractTextFromImage } = require("./utils/ocr"); // Função de OCR
const axios = require("axios");
const ExcelJS = require("exceljs");

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

// Função para extrair dados específicos do texto
const extractSpecificData = (text) => {
  const result = {
    nome: null,
    cep: null,
    endereco: null,
    rg: null,
    cpf: null,
  };

  // Extração de Nome
  const nomeRegex = /(?<=Nome[:\s])([A-Za-zÀ-ÿ\s]+)/i;
  const nomeMatch = text.match(nomeRegex);
  result.nome = nomeMatch ? nomeMatch[0].trim() : "Não encontrado";

  // Extração de CEP
  const cepRegex = /\b\d{5}-\d{3}\b/;
  const cepMatch = text.match(cepRegex);
  result.cep = cepMatch ? cepMatch[0] : "Não encontrado";

  // Extração de Endereço
  const enderecoRegex = /Rua\s.+/i;
  const enderecoMatch = text.match(enderecoRegex);
  result.endereco = enderecoMatch ? enderecoMatch[0] : "Não encontrado";

  // Extração de RG
  const rgRegex = /\d{2}\.\d{3}\.\d{3}-\d{1}/;
  const rgMatch = text.match(rgRegex);
  result.rg = rgMatch ? rgMatch[0] : "Não encontrado";

  // Extração de CPF
  const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
  const cpfMatch = text.match(cpfRegex);
  result.cpf = cpfMatch ? cpfMatch[0] : "Não encontrado";

  return result;
};

// Endpoint para upload de imagem e processamento OCR
app.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "Imagem não fornecida" });
    }

    const text = await extractTextFromImage(image);

    if (text) {
      const extractedData = extractSpecificData(text);

      // Validação de CEP
      if (extractedData.cep && extractedData.cep !== "Não encontrado") {
        const cepValidacao = await validarCep(extractedData.cep);
        extractedData.cepValido = cepValidacao.valido;
        extractedData.enderecoCorrigido = cepValidacao.valido ? cepValidacao.endereco : null;
      }

      console.log("Dados extraídos:", extractedData);
      res.json({ success: true, data: extractedData });
    } else {
      res.status(500).json({ success: false, message: "Falha no OCR" });
    }
  } catch (err) {
    console.error("Erro no OCR:", err);
    res.status(500).json({ success: false, message: "Erro no processamento" });
  }
});

// Função para validar CEP via API
const validarCep = async (cep) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`);
    if (response.data.erro) {
      return { valido: false, mensagem: "CEP não encontrado" };
    }
    return { valido: true, endereco: response.data };
  } catch (err) {
    console.error("Erro ao validar CEP:", err);
    return { valido: false, mensagem: "Erro ao consultar o CEP" };
  }
};

// Endpoint para exportar dados para planilha
app.post("/export", async (req, res) => {
  const { data } = req.body;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Dados Digitalizados");

  // Cabeçalhos da planilha
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Nome", key: "nome", width: 30 },
    { header: "CEP", key: "cep", width: 15 },
    { header: "Endereço", key: "endereco", width: 50 },
    { header: "RG", key: "rg", width: 20 },
    { header: "CPF", key: "cpf", width: 20 },
  ];

  // Adicione os dados na planilha
  data.forEach((item, index) => {
    worksheet.addRow({
      id: index + 1,
      nome: item.nome,
      cep: item.cep,
      endereco: item.endereco,
      rg: item.rg,
      cpf: item.cpf,
    });
  });

  // Envie a planilha para o cliente
  res.setHeader("Content-Disposition", "attachment; filename=dados.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  await workbook.xlsx.write(res);

  res.end();
});

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor funcionando em: http://localhost:${port}`);
});
