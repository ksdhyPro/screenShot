# 基于 NodeJs Electron 的桌面截屏软件

### 项目说明

> 调用 nodejs 获取当前桌面截图
> 传输给渲染进程，绘制到 canvas，捕捉用户框选操作
> 获取用户框选坐标、框选大小（注意结合 window.devicePixelRatio 以获取到真实屏幕像素位置）
> 把框选位置传输到主进程，处理图像裁剪，把裁剪后的图像发送到另一个渲染进程，显示裁剪后的部分

### 优化项：

- 问题复现：
  > 截屏后出现短暂白屏
- 问题原因：
  > 每次动态注册快捷键时都读取了本地存储，由于是同步读取，会阻塞主进程
- 优化方案：
  > 变更为添加一层内存缓存，应用初始化读取一次，以后每次在内存中找，再通过设置页面设置时，同步更新缓存和本地存储

配置

```js
 webPreferences: {
  backgroundThrottling: false, // 浏览器不可见时，仍然执行定时任务等
}
```
