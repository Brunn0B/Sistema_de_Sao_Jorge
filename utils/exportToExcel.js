const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "dados.xlsx");

function saveDataToExcel(data) {
  try {
    if (!data) {
      throw new Error("Os dados fornecidos são inválidos ou indefinidos.");
    }

    // Se for um único objeto, transforma em array
    const dataArray = Array.isArray(data) ? data : [data];

    let workbook;
    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Garante que todas as propriedades estejam preenchidas
    const sanitizedData = dataArray.map(item => ({
      nome: item.nome || "",
      cpf: item.cpf || "",
      rg: item.rg || "",
      telefone: item.telefone || "",
      cep: item.cep || "",
      endereco: item.endereco || "",
      dataNascimento: item.dataNascimento || ""
    }));

    // Criar nova aba ou substituir a existente
    const worksheet = XLSX.utils.json_to_sheet(sanitizedData);

    // Remove a aba antiga se já existir
    const sheetIndex = workbook.SheetNames.indexOf("Dados");
    if (sheetIndex !== -1) {
      workbook.SheetNames.splice(sheetIndex, 1);
      delete workbook.Sheets["Dados"];
    }

    // Adiciona a nova aba com os dados atualizados
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

    // Salva a planilha
    XLSX.writeFile(workbook, filePath);
    console.log(`✅ Planilha salva em: ${filePath}`);
  } catch (error) {
    console.error("❌ Erro ao salvar a planilha:", error);
  }
}

module.exports = { saveDataToExcel };
