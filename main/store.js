const log = require("electron-log");
let userConfig;
let conf;
const loadConf = async () => {
  const Conf = (await import("conf")).default;
  if (conf) return conf;
  conf = new Conf({
    projectName: "screenshot",
    defaults: {
      shortcut: [
        { key: "ctrl+t", value: "crop" },
        { key: "escape", value: "exitCropWindow" },
      ],
    },
  });
  return conf;
};

// 同时使用 module.exports 导出功能
module.exports = {
  getConfig: async (key) => {
    if (userConfig) {
      return userConfig;
    }
    try {
      const config = await loadConf();
      log.info(`reading user setting:${JSON.stringify(config.get(key))}`);
      userConfig = config.get(key);
      return userConfig;
    } catch (error) {
      log.error(error);
    }
  },

  setConfig: async (key, value) => {
    const config = await loadConf();
    userConfig = value;
    config.set(key, value);
  },
};
