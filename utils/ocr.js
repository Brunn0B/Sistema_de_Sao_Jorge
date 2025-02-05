const Tesseract = require("tesseract.js");
const Jimp = require("jimp");


async function extractTextFromImage(imageBuffer) {
  try {
    const { data } = await Tesseract.recognize(imageBuffer, "por", {
      logger: (m) => console.log(m),
      tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚÂÊÎÔÛÃÕÇáéíóúâêîôûãõç.,-()/", // Whitelist de caracteres
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
// Função para melhorar a imagem antes do OCR
async function preprocessImage(imageBuffer) {
  try {
    const image = await Jimp.read(imageBuffer);
    image
      .resize(1500, Jimp.AUTO)
      .greyscale()
      .contrast(0.5)
      .normalize()
      .brightness(0.1); // Ajuste de brilho

    const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return processedBuffer;
  } catch (err) {
    console.error("Erro ao processar imagem:", err);
    return null;
  }
}

// Função para extrair texto com OCR
async function extractTextFromImage(imageBuffer) {
  try {
    const { data } = await Tesseract.recognize(imageBuffer, "por", {
      logger: (m) => console.log(m), // Ativa logs para ver desempenho
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

// Exportar ambas as funções corretamente
module.exports = { preprocessImage, extractTextFromImage };
