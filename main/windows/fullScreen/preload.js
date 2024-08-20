const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendImage: (callback) => ipcRenderer.on("send-image", callback),
  clearCanvas: (callback) => ipcRenderer.on("clear-canvas", callback),
  crop: (callback) => ipcRenderer.send("crop", callback),
});
