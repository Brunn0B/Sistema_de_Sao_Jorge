const { extractTextFromImage } = require("./utils/ocr");
const { getAddressFromCEP } = require("./utils/viacep");
const { saveDataToExcel } = require("./utils/exportToExcel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
require("dotenv").config(); // Para carregar variáveis de ambiente
require("./server.js"); // Inicia o servidor Express

ipcMain.handle("process-image", async (event, imagePath) => {
  try {
    const text = await extractTextFromImage(imagePath);
    if (!text) return { success: false, message: "Falha no OCR" };

    const cepMatch = text.match(/\b\d{5}-\d{3}\b/);
    if (!cepMatch) return { success: false, message: "CEP não encontrado" };

    const cep = cepMatch[0];
    const addressData = await getAddressFromCEP(cep);

    if (!addressData) return { success: false, message: "Erro ao buscar endereço" };

    const formattedData = [
      {
        Nome: "Exemplo",
        Endereço: addressData.logradouro,
        Bairro: addressData.bairro,
        Cidade: addressData.localidade,
        Estado: addressData.uf,
        CEP: cep,
      },
    ];

    const savePath = dialog.showSaveDialogSync({
      title: "Salvar Planilha",
      defaultPath: "dados.xlsx",
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
    });

    if (savePath) {
      saveDataToExcel(formattedData, savePath);
      return { success: true, message: "Planilha gerada com sucesso!" };
    } else {
      return { success: false, message: "Exportação cancelada." };
    }
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    return { success: false, message: "Erro no processamento" };
  }
});

let mainWindow;

app.whenReady().then(() => {
  const ngrokUrl = process.env.NGROK_URL || "http://localhost:3000"; // URL do servidor
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: __dirname + "/icon.ico", // Caminho para o ícone
  });

  // Carregar a página principal do sistema
  mainWindow.loadURL(`${ngrokUrl}/`); // Define a rota correta para carregar o sistema
  mainWindow.webContents.openDevTools(); // Opcional, para depuração
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

