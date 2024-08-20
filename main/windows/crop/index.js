const { BrowserWindow } = require("electron");
const { getProjectRoot } = require("../../../utils");
const path = require("path");
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
      width,
      height,
      x,
      y,
      frame: false, // 无边框
      alwaysOnTop: true, // 置顶
      resizable: false, // 禁止调整大小
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    await win.loadFile(getProjectRoot() + "/views/crop.html");
    resolve(win);
  });
}

module.exports = createCropWindow;
