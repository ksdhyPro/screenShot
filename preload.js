const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	takeScreenshot: () => ipcRenderer.invoke("take-screenshot"),
	sendImage: (img) => ipcRenderer.once("image", img),
});
