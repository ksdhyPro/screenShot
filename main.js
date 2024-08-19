const {
	app,
	BrowserWindow,
	globalShortcut,
	protocol,
	ipcMain,
} = require("electron");
const path = require("path");
const fs = require("fs");
// require("./ipc");
const screenshot = require("screenshot-desktop");
function createWindow() {
	// 创建浏览器窗口
	const win = new BrowserWindow({
		paintWhenInitiallyHidden: false,
		title: "截图",
		icon: path.join(__dirname + "favicon.png"),
		webPreferences: {
			nodeIntegration: true,
			preload: __dirname + "/preload.js",
		},
	});

	// 加载index.html文件
	win.loadFile("index.html");

	// win.setAlwaysOnTop(true);
	win.setMenu(null);
}
let win;
// 用于全屏显示截图的窗口
function createImageWindow(img) {
	win = new BrowserWindow({
		// 全屏显示
		fullscreen: true,
		// 无边框
		frame: false,
		alwaysOnTop: true,
		webPreferences: {
			preload: __dirname + "/preload.js",
		},
	});
	win.loadFile("image.html");
	win.webContents.on("did-finish-load", () => {
		win.webContents.send("image", img);
	});
}

// 当Electron初始化完成并准备创建浏览器窗口时调用
app.whenReady().then(() => {
	ipcMain.handle("take-screenshot", () => {
		return new Promise((resolve, reject) => {
			screenshot({ format: "png" })
				.then((img) => {
					createImageWindow(img);
				})
				.catch((err) => {
					console.log(err);
				});
		});
	});
	globalShortcut.register("ctrl+t", () => {
		screenshot({ format: "png" })
			.then((img) => {
				createImageWindow(img);
			})
			.catch((err) => {
				console.log(err);
			});
	});
	// 设置开机自启
	// app.setLoginItemSettings({
	// 	openAtLogin: true,
	// });
});

// 消息通信

// 当所有窗口关闭时退出应用
// app.on("window-all-closed", () => {
// 	if (process.platform !== "darwin") {
// 		app.quit();
// 	}
// });
