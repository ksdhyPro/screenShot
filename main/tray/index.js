const { Tray, Menu, app } = require("electron");
const { getProjectRoot } = require("../../utils");
const path = require("path");
/**
 *
 * @param {*} handler 处理函数
 * @returns
 */
let createTray = (handler) => {
  // 创建托盘
  const tray = new Tray(path.join(getProjectRoot() + "/assets/favicon.ico"));

  // 菜单项
  const contextMenu = [
    {
      label: "设置",
      click: handler.setting,
    },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ];
  tray.setToolTip("灵动截图");
  tray.setContextMenu(Menu.buildFromTemplate(contextMenu));
  return tray;
};

module.exports = createTray;
