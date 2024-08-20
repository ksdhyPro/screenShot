const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const { screenShot, crop } = require("./utils");
const createFullScreenWindow = require("./main/windows/fullScreen");
const createCropWindow = require("./main/windows/crop");

app.whenReady().then(async () => {
  // 初始化创建隐藏的全屏窗口，避免截屏时用户等待
  let fullScreenWindow = await createFullScreenWindow();

  // 注册快捷键进行截屏
  globalShortcut.register("ctrl+t", async () => {
    fullScreenWindow.webContents.send("send-image", await screenShot());
    fullScreenWindow.show();
  });

  /**
   * 裁剪后的窗口
   * @type {BrowserWindow | null}
   */
  let cropWindow = null;

  /**
   * @typedef {Object} CropData
   * @property {Buffer} imageBuffer - 图像的数据
   * @property {number} x - 裁剪区域的起始X坐标
   * @property {number} y - 裁剪区域的起始Y坐标
   * @property {number} width - 裁剪区域的宽度
   * @property {number} height - 裁剪区域的高度
   */

  // 监听裁剪事件
  ipcMain.on("crop", async (event, /**  @type {CropData} */ data) => {
    if (fullScreenWindow) {
      // 清空全屏窗口的内容
      fullScreenWindow.webContents.send("clear-canvas");
      // 隐藏全屏窗口
      fullScreenWindow.hide();
    }

    // 创建裁剪窗口
    cropWindow = await createCropWindow(
      data.width,
      data.height,
      data.x,
      data.y
    );
    // 获取裁剪区域的图像数据
    const buffer = await crop(
      data.imageBuffer,
      data.x,
      data.y,
      data.width,
      data.height
    );
    // 发送图像数据到裁剪窗口
    cropWindow.webContents.send("send-image", {
      imageData: buffer,
      width: data.width,
      height: data.height,
    });
  });

  // 快捷键退出
  globalShortcut.register("esc", () => {
    if (cropWindow) {
      cropWindow.close();
      cropWindow = null;
    }
  });
});
