const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const path = require("path");

const SOBRE =
  "Verificação de ocupação de eletrodutos, eletrocalhas e perfilados.\n\n" +
  "Critérios:\n" +
  "• ABNT NBR 5410:2004, 6.2.11.1.6 a) — 53 % (um condutor), 31 % (dois), 40 % (três ou mais)\n" +
  "• ABNT NBR 16415:2015, Anexo B — 40 % de projeto, 60 % considerado cheio\n\n" +
  "Diâmetros de cabos de energia: catálogo Prysmian de Baixa e Média Tensão.\n" +
  "Diâmetros de cabeamento estruturado: ABNT NBR 16415, Tabelas B.1 e B.2.\n\n" +
  "O resultado é uma verificação de ocupação. A responsabilidade técnica pelo\n" +
  "projeto permanece do profissional habilitado.\n\n" +
  "© 2026 Marco Deouro Deritti — todos os direitos reservados.";

function criarJanela() {
  const win = new BrowserWindow({
    width: 1280,
    height: 880,
    minWidth: 900,
    minHeight: 640,
    title: "Zeplin · Ocupação de Cabos",
    backgroundColor: "#F4F6FA",
    icon: path.join(__dirname, "build", "icon.png"),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => win.show());

  // Links externos abrem no navegador, nunca dentro da janela do app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

function montarMenu(win) {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Imprimir resultado…",
          accelerator: "CmdOrCtrl+P",
          click: () => win.webContents.print({ printBackground: true })
        },
        { type: "separator" },
        { role: "quit", label: "Sair" }
      ]
    },
    {
      label: "Exibir",
      submenu: [
        { role: "reload", label: "Recarregar" },
        { type: "separator" },
        { role: "resetZoom", label: "Tamanho normal" },
        { role: "zoomIn", label: "Aumentar" },
        { role: "zoomOut", label: "Diminuir" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tela cheia" }
      ]
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Sobre",
          click: () => dialog.showMessageBox(win, {
            type: "info",
            title: "Sobre",
            message: "Zeplin — Ocupação de Cabos  v" + app.getVersion(),
            detail: SOBRE,
            buttons: ["Fechar"]
          })
        }
      ]
    }
  ]));
}

// Uma instância só: abrir de novo traz a janela existente para frente.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let janela = null;

  app.on("second-instance", () => {
    if (janela) {
      if (janela.isMinimized()) janela.restore();
      janela.focus();
    }
  });

  app.whenReady().then(() => {
    janela = criarJanela();
    montarMenu(janela);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        janela = criarJanela();
        montarMenu(janela);
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
