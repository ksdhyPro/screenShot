const loadConf = async () => {
  const Conf = (await import("conf")).default;
  return new Conf({
    defaults: {
      shortcut: [
        { key: "ctrl+t", value: "crop" },
        { key: "esc", value: "exitCropWindow" },
      ],
    },
  });
};

// 同时使用 module.exports 导出功能
module.exports = {
  getConfig: async (key) => {
    const config = await loadConf();
    return config.get(key);
  },

  setConfig: async (key, value) => {
    const config = await loadConf();
    config.set(key, value);
  },
};
