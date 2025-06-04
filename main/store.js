const log = require("electron-log");
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
    try {
      const config = await loadConf();
      const value = config.get(key);
      log.info(`reading user setting:${JSON.stringify(value)}`);
      return value;
    } catch (error) {
      log.error(error);
    }
  },

  setConfig: async (key, value) => {
    const config = await loadConf();
    config.set(key, value);
  },
};
