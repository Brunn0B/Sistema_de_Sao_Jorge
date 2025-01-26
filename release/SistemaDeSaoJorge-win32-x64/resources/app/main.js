const { extractTextFromImage } = require("./utils/ocr");
const { getAddressFromCEP } = require("./utils/viacep");
const { saveDataToExcel } = require("./utils/exportToExcel");
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

require("./server.js");

ipcMain.handle("process-image", async (event, imagePath) => {
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
});

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: __dirname + '/icon.ico', // Caminho para o ícone
  });

  // Carregue a página principal do sistema, onde a câmera é um módulo
  mainWindow.loadURL(`http://localhost/Sistema_de_Sao_Jorge/`); // Aqui carrega o seu sistema
  mainWindow.webContents.openDevTools(); // Opcional, para depuração
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
