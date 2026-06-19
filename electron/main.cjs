const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, Menu, net, protocol } = require('electron');

// 禁用 Chromium 后台定时器节流，确保挂机游戏在最小化/窗口遮挡时持续运行
app.commandLine.appendSwitch('disable-background-timer-throttling');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const DIST_DIR = path.join(app.getAppPath(), 'dist');

function resolveDistPath(requestUrl) {
  const url = new URL(requestUrl);
  let pathname = decodeURIComponent(url.pathname);

  if (!pathname || pathname === '/') {
    pathname = '/index.html';
  }

  const targetPath = path.normalize(path.join(DIST_DIR, pathname));
  const relativePath = path.relative(DIST_DIR, targetPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(targetPath)) {
    return path.join(DIST_DIR, 'index.html');
  }

  return targetPath;
}

function registerAppProtocol() {
  protocol.handle('app', (request) => {
    const filePath = resolveDistPath(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#101010',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL('app://bwe/index.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerAppProtocol();
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
