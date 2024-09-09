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
 * @param {*} devicePixelRatio number
 * @returns {Promise<Buffer>}
 */
function crop(source, x, y, width, height, devicePixelRatio = 1) {
  return new Promise((resolve, reject) => {
    // 裁剪前先将坐标和尺寸乘以设备像素比，计算出实际图像的坐标和尺寸
    x *= devicePixelRatio;
    y *= devicePixelRatio;
    width *= devicePixelRatio;
    height *= devicePixelRatio;
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
  return __dirname;
}

module.exports = {
  screenShot,
  crop,
  getProjectRoot,
};
