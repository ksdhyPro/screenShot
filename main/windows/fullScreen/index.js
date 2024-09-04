const { BrowserWindow } = require("electron");
const { getProjectRoot } = require("../../../utils");
const path = require("path");
/**
 * 创建全屏窗口
 * @returns {Promise<BrowserWindow>}
 */
async function createFullScreenWindow() {
  return new Promise(async (resolve, reject) => {
    let win = new BrowserWindow({
      fullscreen: true, // 全屏显示
      frame: false, // 无边框
      show: false, // 打开隐藏
      // alwaysOnTop: true, // 置顶
      resizable: false, // 禁止调整大小
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    await win.loadURL("http://localhost:8888");
    // win.webContents.openDevTools();
    resolve(win);
  });
}
module.exports = createFullScreenWindow;
