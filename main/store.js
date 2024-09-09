const log = require("electron-log");
const loadConf = async () => {
  const Conf = (await import("conf")).default;
  return new Conf({
    projectName: "screenshot",
    defaults: {
      shortcut: [
        { key: "ctrl+t", value: "crop" },
        { key: "escape", value: "exitCropWindow" },
      ],
    },
  });
};

// 同时使用 module.exports 导出功能
module.exports = {
  getConfig: async (key) => {
    try {
      const config = await loadConf();
      log.info(`读取用户配置：${config.get(key)}`);
      return config.get(key);
    } catch (error) {
      log.error(error);
    }
  },

  setConfig: async (key, value) => {
    const config = await loadConf();
    config.set(key, value);
  },
};
