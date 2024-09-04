const { ipcMain, globalShortcut } = require("electron");
const { getConfig, setConfig } = require("../store.js");
const { shortcutDict, setShortcutHandler } = require("../shortcut.js");
// 监听鼠标事件转发
// ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
//   const win = BrowserWindow.fromWebContents(event.sender);
//   win.setIgnoreMouseEvents(ignore, options);
// });

// 设置用户快捷键
ipcMain.on("set-shortcut", async (event, shortcuts) => {
  shortcuts.forEach((item) => {
    setShortcutHandler(item.value, item.key);
  });
  // 存储
});

// 获取快捷键信息传递给渲染进程
ipcMain.handle("get-shortcuts", async (event) => {
  const shortcut = await getConfig("shortcut");
  return shortcut;
});
