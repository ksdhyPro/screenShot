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
      title: "设置",
      icon: path.join(getProjectRoot() + "/assets/favicon.ico"),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    win.setMenu(null);
    // win.webContents.openDevTools();
    await win.loadFile(getProjectRoot() + "/views/setting.html");
    resolve(win);
  });
}
module.exports = createSettingWindow;
