const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendImage: (callback) => ipcRenderer.on("send-image", callback),
});
