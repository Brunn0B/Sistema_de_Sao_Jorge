const Tesseract = require("tesseract.js");

async function extractTextFromImage(imageData) {
  try {
    const { data } = await Tesseract.recognize(imageData, "por"); // "por" para português
    return data.text;
  } catch (err) {
    console.error("Erro ao processar OCR:", err);
    return null;
  }
}

module.exports = { extractTextFromImage };
