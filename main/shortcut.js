const store = require("./store.js");
const { globalShortcut } = require("electron");

const shortcutDict = Object.freeze({
  crop: "crop",
  exitCropWindow: "exitCropWindow",
});

// TODO: 本地存储快捷键->key ，运行时动态挂载快捷键功能
// 定义快捷键相关
const shortcutHandlers = {
  exitCropWindow: null,
  crop: null,
};

/**
 * 查找快捷键键位
 * @param {*} key 快捷键对应的key
 */
const findShortcut = async (key) => {
  let shortcuts = await store.getConfig("shortcut");
  return shortcuts.find((item) => item.value === key).key;
};

/**
 * 挂载快捷键相关的操作
 * @param {string} shortcutKey 快捷键对应关键字
 * @param {string} shortcut 快捷键键位
 * @param {Function?} handler 处理函数,如果不传，则使用原有的处理函数
 */
const setShortcutHandler = async (shortcutKey, shortcut, handler) => {
  if (Object.keys(shortcutDict).includes(shortcutKey)) {
    // 如果指定了新的处理函数，则替换，不指定则用原来的
    shortcutHandlers[shortcutKey] = handler =
      handler || shortcutHandlers[shortcutKey];

    if (handler) {
      // 查找key对应的快捷键键位
      let oldShortcut = await findShortcut(shortcutKey);
      // 注销原有快捷键
      globalShortcut.unregister(oldShortcut);
      // 注册新的快捷键
      globalShortcut.register(shortcut, handler);
      // 存储快捷键
      let shortcutList = await store.getConfig("shortcut");
      let index = shortcutList.findIndex((item) => item.value === shortcutKey);
      shortcutList[index].key = shortcut;
      store.setConfig("shortcut", shortcutList);
    } else {
      console.log(`${shortcutKey} handler not found!`);
    }
  } else {
    console.warn("shortcutKey not found!");
  }
};
module.exports = {
  setShortcutHandler,
  shortcutDict,
  findShortcut,
};
