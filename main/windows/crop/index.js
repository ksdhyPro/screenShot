const { BrowserWindow, ipcMain, screen, globalShortcut } = require("electron");
const { getProjectRoot } = require("../../../utils");
const path = require("path");
const {
  shortcutDict,
  setShortcutHandler,
  findShortcut,
} = require("../../shortcut.js");
const registerShortcut = async () => {
  let shortcut = await findShortcut(shortcutDict.exitCropWindow);
  setShortcutHandler(shortcutDict.exitCropWindow, shortcut, () => {
    let focusWin = BrowserWindow.getFocusedWindow();
    if (focusWin && !focusWin.isDestroyed()) {
      focusWin.close();
    }
  });
};

const unregisterShortcut = async () => {
  let shortcut = await findShortcut(shortcutDict.exitCropWindow);
  globalShortcut.unregister(shortcut);
};

/**
 * 创建裁剪后的显示窗口
 * @param {*} width 宽
 * @param {*} height 高
 * @param {*} x 顶点X坐标
 * @param {*} y 顶点Y坐标
 * @returns {Promise<BrowserWindow>}
 */
async function createCropWindow(width, height, x, y) {
  return new Promise(async (resolve, reject) => {
    let win = new BrowserWindow({
      width: Math.ceil(width),
      height: Math.ceil(height),
      x: Math.ceil(x),
      y: Math.ceil(y),
      minHeight: 1,
      frame: false, // 无边框
      alwaysOnTop: true, // 置顶
      resizable: false, // 禁止调整大小
      transparent: true, // 透明窗，加工具栏
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    // 事件必须加到loadFile之前，不然可能会丢失！！！
    win.on("focus", registerShortcut);
    win.on("blur", unregisterShortcut);
    win.on("close", () => {
      unregisterShortcut();
    });
    await win.loadFile(getProjectRoot() + "/views/crop.html");
    resolve(win);
  });
}

module.exports = createCropWindow;
