const Tesseract = require("tesseract.js");

async function extractTextFromImage(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, "por"); // 'por' para português
    return result.data.text;
  } catch (error) {
    console.error("Erro ao processar OCR:", error);
    return null;
  }
  
}
module.exports = { extractTextFromImage };
