const XLSX = require("xlsx");
const fs = require("fs");

function saveDataToExcel(data, filePath) {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    XLSX.writeFile(workbook, filePath);
    console.log(`Planilha salva em: ${filePath}`);
  } catch (error) {
    console.error("Erro ao salvar a planilha:", error);
  }
}

module.exports = { saveDataToExcel };