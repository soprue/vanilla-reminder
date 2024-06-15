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
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
      spellcheck: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:9000');
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      }),
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
