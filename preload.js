const { contextBridge, ipcRenderer } = require("electron");

// Ponte segura: a página não tem acesso ao Node, só a estas funções.
contextBridge.exposeInMainWorld("zeplin", {
  // Salva os bytes na pasta Downloads e abre o Explorer destacando o arquivo.
  // Recebe Uint8Array para preservar a codificação exata (Latin-1 do DXF).
  salvarArquivo: function(nomeSugerido, bytes){
    return ipcRenderer.invoke("salvar-arquivo", {
      nomeSugerido: nomeSugerido,
      bytes: bytes
    });
  }
});
