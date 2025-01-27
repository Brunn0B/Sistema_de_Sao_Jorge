const Tesseract = require("tesseract.js");

async function extractTextFromImage(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, "por", {
      logger: (info) => console.log(info),
    });
    return result.data.text;
  } catch (error) {
    console.error("Erro no OCR:", error);
    return null;
  }
}

module.exports = { extractTextFromImage };
