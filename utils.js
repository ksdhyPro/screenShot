const sharp = require("sharp");
const screenshot = require("screenshot-desktop");

/**
 * 屏幕截图
 * @returns {Promise<Buffer>}
 */
function screenShot() {
  return new Promise((resolve, reject) => {
    screenshot({ format: "png" })
      .then((img) => {
        resolve(img);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * 裁剪图片
 * @param {*} source string | Buffer | Stream | File | Array<File> | Array<Buffer> | Array<Stream>
 * @param {*} x number
 * @param {*} y number
 * @param {*} width number
 * @param {*} height number
 * @returns {Promise<Buffer>}
 */
function crop(source, x, y, width, height) {
  return new Promise((resolve, reject) => {
    sharp(source)
      .extract({
        left: parseInt(x),
        top: parseInt(y),
        width: parseInt(width),
        height: parseInt(height),
      })
      .toBuffer()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * 获取项目根目录
 * @returns {string}
 */
function getProjectRoot() {
  return process.cwd();
}

module.exports = {
  screenShot,
  crop,
  getProjectRoot,
};
