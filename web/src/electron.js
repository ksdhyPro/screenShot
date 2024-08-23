// electron交互

/**
 * 将主进程处理后的Buffer数据转换为前端可以展示的base64字符串
 * @param {*} buffer - 图像数据
 * @returns
 */
function bufferToBase64(buffer) {
  const uint8Array = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64String = window.btoa(binary);
  return `data:image/png;base64,${base64String}`;
}

const electronAPI = window.electronAPI;

/**
 * 获取图像数据
 */
export const getImage = () => {
  return new Promise((resolve, reject) => {
    electronAPI.sendImage((event, imageData) => {
      resolve({
        base64: bufferToBase64(imageData),
        imageData,
      });
    });
  });
};

/**
 * 发送图像裁剪数据到渲染进程
 * @param info
 * @param imageData
 * @param isTop
 */
export const exportImageInfo = (info, imageData, isTop = false) => {
  electronAPI.crop({
    imageBuffer: imageData,
    isTop,
    x: info.x * window.devicePixelRatio,
    y: info.y * window.devicePixelRatio,
    width: info.width * window.devicePixelRatio,
    height: info.height * window.devicePixelRatio,
  });
};
