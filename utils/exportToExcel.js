const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Caminhos
const templatePath = path.join(__dirname, "template.xlsx");
const desktopPath = path.join(os.homedir(), "OneDrive", "Área de Trabalho", "dados_ocr.xlsx");

function saveDataToExcel(data) {
  try {
    if (!data) throw new Error("Nenhum dado fornecido para exportação.");

    // Verifica se o template existe
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Arquivo template não encontrado em: ${templatePath}`);
    }

    // Carrega o template
    const workbook = XLSX.readFile(templatePath);

    // Verifica se a aba "Dados" existe
    if (!workbook.SheetNames.includes("Dados")) {
      throw new Error(
        `A aba "Dados" não existe no template. Abas disponíveis: ${workbook.SheetNames.join(", ")}`
      );
    }

    // Campos obrigatórios
    const campos = ["nome", "cpf", "rg", "telefone", "cep", "endereco", "dataNascimento"];

    // Sanitiza os dados
    const dadosSanitizados = [data].map((item) => {
      const novoItem = {};
      campos.forEach((campo) => {
        novoItem[campo] = item[campo] || "-";
      });
      return novoItem;
    });

    const worksheet = workbook.Sheets["Dados"];

    // Encontra a próxima linha vazia
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:Z1");
    const nextRow = range.e.r + 1;

    // Adiciona os dados
    XLSX.utils.sheet_add_json(worksheet, dadosSanitizados, {
      skipHeader: true,
      origin: XLSX.utils.encode_cell({ r: nextRow, c: 0 }),
    });

    // Atualiza o intervalo da planilha
    worksheet["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: nextRow, c: campos.length - 1 },
    });

    // Salva o arquivo
    XLSX.writeFile(workbook, desktopPath);
    console.log(`✅ Planilha salva em: ${desktopPath}`);
  } catch (error) {
    console.error("❌ Erro crítico:", error.message);
    throw error;
  }
}

module.exports = { saveDataToExcel };