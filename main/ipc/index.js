const { ipcMain } = require("electron");
const { getConfig, setConfig } = require("../store.js");
// 监听鼠标事件转发
// ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
//   const win = BrowserWindow.fromWebContents(event.sender);
//   win.setIgnoreMouseEvents(ignore, options);
// });

// 设置用户快捷键
ipcMain.on("set-shortcut", async (event, key, type) => {
  const userPreferences = getConfig("shortcut");
  const index = userPreferences.findIndex((item) => item.value === type);
  userPreferences[index].key = key;
  store.set("userPreferences", userPreferences);
});

// 获取快捷键信息传递给渲染进程
ipcMain.handleOnce("get-shortcut", (event, type) => {
  const userPreferences = getConfig("shortcut");
  const key = userPreferences.find((item) => item.value === type).key;
  return key;
});
