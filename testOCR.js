const fs = require("fs");
const { extractTextFromImage } = require("./utils/ocr");


const imagePath = "./public/IMG/t2 hd.png"; // Coloque uma imagem de teste nesse caminho
const imageBuffer = fs.readFileSync(imagePath);

extractTextFromImage(imageBuffer).then((text) => {
  console.log("Texto extraído:", text);
}).catch((err) => {
  console.error("Erro no OCR:", err);
});
