// 注册快捷键相关

const { globalShortcut } = require("electron");

// ESC
function registerESC(cb) {
  globalShortcut.register("ESC", cb);
}
