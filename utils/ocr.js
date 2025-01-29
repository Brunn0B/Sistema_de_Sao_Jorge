const Tesseract = require("tesseract.js");
const fs = require("fs");

async function extractTextFromImage(imageBuffer) {
  try {
    // Salva a imagem temporariamente (caso necessário)
    const tempPath = "./temp_image.png";
    fs.writeFileSync(tempPath, imageBuffer);

    // Executa o OCR com idioma português
    const { data } = await Tesseract.recognize(tempPath, "por", {
      logger: (m) => console.log(m), // Para depuração
    });

    // Remove o arquivo temporário
    fs.unlinkSync(tempPath);

    // Processa o texto extraído para encontrar os campos desejados
    return processExtractedText(data.text);
  } catch (err) {
    console.error("Erro ao processar OCR:", err);
    return null;
  }
}

// Função para processar o texto e encontrar campos importantes
function processExtractedText(text) {
  const extractedData = {};

  // Expressões regulares para identificar os campos
  extractedData.nome = text.match(/REQUERENTE\s*(.*)/i)?.[1]?.trim() || "Não encontrado";
  extractedData.dataNascimento = text.match(/NASCIMENTO\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] || "Não encontrado";
  extractedData.endereco = text.match(/ENDEREÇO\s*(.*)/i)?.[1]?.trim() || "Não encontrado";
  extractedData.cep = text.match(/CEP:\s*(\d{5}-\d{3})/i)?.[1] || "Não encontrado";
  extractedData.rg = text.match(/R\.G\.\s*(\S+)/i)?.[1] || "Não encontrado";
  extractedData.cpf = text.match(/CPF\s*(\S+)/i)?.[1] || "Não encontrado";
  extractedData.telefone = text.match(/TELEFONE\(S\)\s*(\S+)/i)?.[1] || "Não encontrado";

  // Identifica se é Pessoa Idosa ou Pessoa com Deficiência
  extractedData.tipo = text.includes("☒ PESSOA COM DEFICIÊNCIA") ? "Deficiência" :
                      text.includes("☒ PESSOA IDOSA") ? "Idoso" : "Não identificado";

  return extractedData;
}

module.exports = { extractTextFromImage };
