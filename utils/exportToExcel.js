const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Caminho CORRETO para a área de trabalho (OneDrive + Área de Trabalho)
const desktopPath = path.join(
  os.homedir(),
  "OneDrive",
  "Área de Trabalho",
  "dados_ocr.xlsx"
);

function saveDataToExcel(data) {
  try {
    if (!data) throw new Error("Nenhum dado fornecido para exportação.");

    // Campos esperados
    const camposEsperados = [
      "nome", "cpf", "rg", "telefone", "cep", "endereco", "dataNascimento"
    ];

    // Sanitiza os dados
    const dadosSanitizados = (Array.isArray(data) ? data : [data]).map(item => {
      const novoItem = {};
      camposEsperados.forEach(campo => {
        novoItem[campo] = item[campo] || "-"; // Substitui undefined/null por "-"
      });
      return novoItem;
    });

    // Cria/Atualiza a planilha
    let workbook;
    if (fs.existsSync(desktopPath)) {
      workbook = XLSX.readFile(desktopPath);
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Cria a worksheet
    const worksheet = XLSX.utils.json_to_sheet(dadosSanitizados, {
      header: camposEsperados
    });

    // Ajusta largura das colunas
    const colWidths = camposEsperados.map(campo => ({
      wch: Math.max(...dadosSanitizados.map(item => String(item[campo]).length), campo.length) + 3
    }));
    worksheet["!cols"] = colWidths;

    // Atualiza a planilha
    if (workbook.SheetNames.includes("Dados")) {
      workbook.Sheets["Dados"] = worksheet;
    } else {
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    }

    // Salva o arquivo
    XLSX.writeFile(workbook, desktopPath);
    console.log(`✅ Planilha salva em: ${desktopPath}`);

  } catch (error) {
    console.error("❌ Erro crítico na exportação:", error);
    throw error; // Propaga o erro para ser capturado no endpoint
  }
}

module.exports = { saveDataToExcel };