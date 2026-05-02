'use strict';
// Electron main-process entry for Stellar Reach.
// Uses CommonJS (.cjs) so it works even though the project root sets
// "type": "module". The web app is loaded from the pre-built dist/ folder.

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Stellar Reach',
    autoHideMenuBar: true,
    backgroundColor: '#05070d',
  });

  // In the packaged app, __dirname is <resources>/app/electron/.
  // In development (npx electron .), it is the project root/electron/.
  // Either way, ../dist/index.html is the Vite build output.
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
