import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import path from "path";
import url from "url";
import isDev from "electron-is-dev";
import fs from "fs";

const __dirname = path.resolve();
const DATA_DIR = path.join(app.getPath("userData"), "data");

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 진행 중인 저장 작업 수 (안전 종료용)
let pendingSaves = 0;

// IPC 핸들러 등록
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
  const iconFileName = isMac ? "logo.icns" : "logo.ico";
  const iconPath = path.join(__dirname, "src/assets", iconFileName);

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
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // 로컬 인덱스 파일 경로 (빌드 결과물 위치)
  const indexPath = path.join(__dirname, "dist", "index.html");

  if (isDev && !process.env.ELECTRON_RUN_AS_NODE) {
    // 개발 모드이고 서버가 켜져 있을 것으로 예상될 때
    const devUrl = "http://localhost:9000";
    
    mainWindow.loadURL(devUrl).catch(() => {
      console.log("개발 서버를 찾을 수 없어 로컬 파일을 로드합니다.");
      mainWindow.loadFile(indexPath);
    });
    
    mainWindow.webContents.openDevTools();
  } else {
    // 배포 모드이거나 서버가 없을 때
    mainWindow.loadFile(indexPath);
  }

  // [안전 종료 로직]
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
