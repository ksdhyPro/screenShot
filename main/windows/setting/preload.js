const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveShortcuts: (callback) => ipcRenderer.send("set-shortcut", callback),
  getShortcuts: (callback) => ipcRenderer.invoke("get-shortcuts", callback),
});
