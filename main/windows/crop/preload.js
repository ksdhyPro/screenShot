const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendImage: (callback) => ipcRenderer.on("send-image", callback),
  setIgnoreMouseEvents: (ignore, options) =>
    ipcRenderer.send("set-ignore-mouse-events", ignore, options),
  windowMove: (canMoving) => ipcRenderer.send("window-move", canMoving),
});
