import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import path from "path";
import url from "url";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
import fs from "fs";

// ES 모듈 환경에서 __dirname을 정확하게 구하는 방법
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 데이터 디렉토리 설정 (dist 폴더 밖으로 나가서 찾음)
const DATA_DIR = path.join(app.getPath("userData"), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let pendingSaves = 0;

ipcMain.handle("reminder:save", async (event, { key, data }) => {
  pendingSaves++;
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error("Save failed:", err);
    throw err;
  } finally {
    pendingSaves--;
  }
});

ipcMain.handle("reminder:get-all", async (event, key) => {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(content);
    }
    return null;
  } catch (err) {
    console.error("Read failed:", err);
    return null;
  }
});

function createWindow() {
  const isMac = process.platform === "darwin";
  
  // 빌드 후 main.js는 dist 폴더 안에 위치하므로, 
  // 상위 폴더나 에셋 경로를 유연하게 잡아야 합니다.
  const assetsPath = app.isPackaged 
    ? path.join(__dirname, "..", "src", "assets") // 패키징 시
    : path.join(__dirname, "..", "src", "assets"); // 개발 시 (tsc 결과가 dist에 있으므로)

  const iconFileName = isMac ? "logo.icns" : "logo.ico";
  const iconPath = path.join(assetsPath, iconFileName);

  const image = nativeImage.createFromPath(iconPath);

  if (isMac && app.dock) {
    app.dock.setIcon(image);
  }

  const mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minWidth: 400,
    maxWidth: 600,
    minHeight: 650,
    useContentSize: true,
    icon: image,
    webPreferences: {
      // main.js(dist 안) 기준으로 preload.cjs(루트) 위치 지정
      preload: path.join(__dirname, "..", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // index.html 위치 (main.js가 dist 안에 있으므로 같은 폴더)
  const indexPath = path.join(__dirname, "index.html");

  if (isDev && !process.env.ELECTRON_RUN_AS_NODE) {
    const devUrl = "http://localhost:9000";
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow.loadFile(indexPath);
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("close", (e) => {
    if (pendingSaves > 0) {
      e.preventDefault();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (pendingSaves === 0 || attempts > 20) {
          clearInterval(interval);
          mainWindow.destroy();
        }
      }, 100);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
