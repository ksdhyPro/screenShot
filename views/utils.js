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
