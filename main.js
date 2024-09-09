const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  clipboard,
  nativeImage,
  dialog,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const { screenShot, crop } = require("./utils");
const createFullScreenWindow = require("./main/windows/fullScreen");
const createCropWindow = require("./main/windows/crop");
const fs = require("fs");
const createTray = require("./main/tray");
const createSettingWindow = require("./main/windows/setting");
const {
  shortcutDict,
  setShortcutHandler,
  findShortcut,
} = require("./main/shortcut.js");
const path = require("path");
require("./main/ipc");

app.setName("灵动截图");
log.transports.file.level = "info";
log.transports.file.resolvePathFn = () =>
  __dirname + "/logs/" + app.getName() + ".log";
// 设置日志输出
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// 设置 autoUpdater 的更新 URL
autoUpdater.setFeedURL({
  provider: "generic",
  url: "http://1ms.ink:8001/update/",
});
log.info("App starting...");

// 检测更新函数
function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

/**
 * 裁剪后的窗口
 * @type {BrowserWindow[]}
 */
let cropWindows = [];
let tray = null;
app.whenReady().then(async () => {
  try {
    checkForUpdates();
  } catch (error) {
    console.log("development mode");
  }
  tray = createTray({
    setting: async () => {
      // 创建设置窗口
      await createSettingWindow();
    },
  });

  // 初始化创建隐藏的全屏窗口，避免截屏时用户等待
  let fullScreenWindow = await createFullScreenWindow();

  /**
   * @typedef {Object} CropData
   * @property {Buffer} imageBuffer - 图像的数据
   * @property {number} x - 裁剪区域的起始X坐标
   * @property {number} y - 裁剪区域的起始Y坐标
   * @property {number} width - 裁剪区域的宽度
   * @property {number} height - 裁剪区域的高度
   * @property {boolean} isTop - 是否置顶
   * @property {number} devicePixelRatio - 设备像素比
   */

  // 监听裁剪事件
  ipcMain.on("crop", async (event, /**  @type {CropData} */ data) => {
    if (fullScreenWindow) {
      // 清空全屏窗口的内容
      fullScreenWindow.webContents.send("clear-canvas");
      // 隐藏全屏窗口
      fullScreenWindow.hide();
    }

    // 获取裁剪区域的图像数据
    const buffer = await crop(
      data.imageBuffer,
      data.x,
      data.y,
      data.width,
      data.height,
      data.devicePixelRatio
    );

    if (data.isTop) {
      // 创建裁剪窗口(这里创建的窗口就是指css像素，所以和devicePixelRatio有关，这边直接按照图像大小进行创建即可)
      // 由于Windows环境下窗口最小为40*40，所以这里创建透明窗口，多余部分准备为工具栏，窗口大小为图像大小加工具栏宽高
      // 此处默认工具栏高度为40，宽度为工具个数*40
      // const toolNumbers = 1;
      // const length = 40;
      // cropWindow = await createCropWindow(
      //   data.width + length * toolNumbers,
      //   data.height + length,
      //   data.x,
      //   data.y
      // );
      // 由于windows窗口有最小宽高限制，所以这里加上40*40的限制（临时）
      const temp = 40;
      let cropWindow = await createCropWindow(
        data.width < temp ? data.width + (temp - data.width) : data.width,
        data.height < temp ? data.height + (temp - data.height) : data.height,
        data.x,
        data.y
      );

      // 发送图像数据到裁剪窗口
      cropWindow.webContents.send("send-image", {
        imageData: buffer,
        width: parseInt(data.width),
        height: parseInt(data.height),
      });
      cropWindows.push(cropWindow.id);
      cropWindow.focus();
    } else {
      // fs.writeFileSync("test.png", buffer);
      // 复制到剪贴板
      clipboard.writeImage(nativeImage.createFromBuffer(buffer));
    }
  });

  // 全局注册截图快捷键
  findShortcut(shortcutDict.crop).then(async (cropKey) => {
    setShortcutHandler(shortcutDict.crop, cropKey, async () => {
      fullScreenWindow.webContents.send("send-image", await screenShot());
      fullScreenWindow.show();
    });
  });

  console.log("application is ready");
});

// 监听更新事件
autoUpdater.on("update-available", () => {
  log.info("Update available.");
  dialog
    .showMessageBox({
      type: "info",
      title: "检测到新版本",
      message: "检测到新版本，是否下载?",
      buttons: ["下载", "取消"],
    })
    .then((result) => {
      if (result.response === 0) {
        // 选择了 'Download'
        autoUpdater.downloadUpdate();
      }
    });
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded");
  dialog
    .showMessageBox({
      type: "info",
      title: "更新完成",
      message: "新版本已经下载完成，是否重启应用？",
      buttons: ["立即重启", "稍后重启"],
    })
    .then((result) => {
      if (result.response === 0) {
        // 选择了 'Restart'
        autoUpdater.quitAndInstall();
      }
    });
});

app.on("quit", () => {
  tray.destroy();
  globalShortcut.unregisterAll();
});
