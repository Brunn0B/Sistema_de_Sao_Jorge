const Tesseract = require("tesseract.js");

async function extractTextFromImage(imageBuffer) {
  try {
    const { data } = await Tesseract.recognize(imageBuffer, "por", {
      logger: (m) => console.log(m), // Log do progresso
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-/, ", // Restringe caracteres
      preserve_interword_spaces: 1, // Mantém espaçamentos
      tessedit_pageseg_mode: 6, // Modo de segmentação para blocos de texto
      tessedit_ocr_engine_mode: 3, // Usa o modo LSTM (melhor para manuscritos)
    });

    const extractedText = data.text.trim();

    if (!extractedText) {
      throw new Error("Nenhum texto identificado.");
    }

    return extractedText;
  } catch (err) {
    console.error("❌ Erro no OCR:", err);
    return null;
  }
}

const extractDataFromText = (text) => {
  if (!text) return {}; // Se não houver texto, retorna objeto vazio

  return {
    nome: text.match(/REQUERENTE:\s*([A-ZÀ-Ú][^\n]+)/i)?.[1]?.trim() ?? "",
    cpf: text.match(/CPF:\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i)?.[1]?.trim() ?? "",
    rg: text.match(/RG:\s*(\d{1,2}\.\d{3}\.\d{3})/i)?.[1]?.trim() ?? "",
    telefone: text.match(/TELEFONE:\s*(\(\d{2}\)\s?\d{4,5}-\d{4})/i)?.[1]?.trim() ?? "",
    cep: text.match(/CEP:\s*(\d{5}-\d{3})/i)?.[1]?.trim() ?? "",
    endereco: text.match(/ENDEREÇO:\s*([^\n]+)/i)?.[1]?.trim() ?? "",
    dataNascimento: text.match(/NASCIMENTO:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]?.trim() ?? "",
  };
};

module.exports = { extractTextFromImage, extractDataFromText };