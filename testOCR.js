const fs = require("fs");
const { extractTextFromImage } = require("./public/utils/ocr");

async function testOCR() {
  try {
    const imageData = fs.readFileSync("icon.png", { encoding: "base64" }); // Substitua pelo caminho de uma imagem de teste
    const imageBase64 = `data:image/png;base64,${imageData}`;

    console.log("Iniciando OCR...");
    const text = await extractTextFromImage(imageBase64);

    if (text) {
      console.log("Texto extraído:", text);
    } else {
      console.error("OCR não conseguiu extrair texto.");
    }
  } catch (err) {
    console.error("Erro ao testar OCR:", err);
  }
}

testOCR();
