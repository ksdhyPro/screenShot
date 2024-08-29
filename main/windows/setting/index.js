const { BrowserWindow } = require("electron");
const { getProjectRoot } = require("../../../utils");
const path = require("path");
/**
 * 创建全屏窗口
 * @returns {Promise<BrowserWindow>}
 */
async function createSettingWindow() {
  return new Promise(async (resolve, reject) => {
    let win = new BrowserWindow({
      width: 800,
      height: 600,
      title: "灵动截图",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    await win.loadFile(getProjectRoot() + "/views/setting.html");
    // await win.loadURL("http://localhost:8888");
    // win.webContents.openDevTools();
    resolve(win);
  });
}
module.exports = createSettingWindow;
