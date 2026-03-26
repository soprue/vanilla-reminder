import { app, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import isDev from 'electron-is-dev';

const __dirname = path.resolve();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  if (isDev) {
    const devUrl = 'http://localhost:9000';

    // 로드 실패 시 1초 뒤 재시도
    mainWindow.webContents.on('did-fail-load', () => {
      console.log('Webpack server not ready yet, retrying in 1s...');
      setTimeout(() => mainWindow.loadURL(devUrl), 1000);
    });

    mainWindow.loadURL(devUrl);
    // 개발 모드에서 개발자 도구 자동 열기
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
