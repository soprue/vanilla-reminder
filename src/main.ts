import { app, BrowserWindow, ipcMain } from "electron";
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
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minWidth: 400,
    maxWidth: 600,
    minHeight: 650,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // [안전 종료 로직] 창을 닫으려고 할 때 저장 중이면 잠시 대기
  mainWindow.on("close", (e) => {
    if (pendingSaves > 0) {
      e.preventDefault(); // 일단 종료 취소
      console.log("Waiting for pending saves...");
      
      // 저장 완료될 때까지 체크 (최대 2초)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (pendingSaves === 0 || attempts > 20) {
          clearInterval(interval);
          mainWindow.destroy(); // 강제 종료
        }
      }, 100);
    }
  });

  if (isDev) {
    const devUrl = "http://localhost:9000";
    mainWindow.webContents.on("did-fail-load", () => {
      setTimeout(() => mainWindow.loadURL(devUrl), 1000);
    });
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      }),
    );
  }
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
