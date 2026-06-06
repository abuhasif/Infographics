// electron-main.js
// CommonJS main process for Electron + Vite (React/TS)

const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

// ---------------------------
// Optional: stability flags (keep if your env needs them)
// ---------------------------
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// ---------------------------
// Helper: choose dev vs prod URL
// ---------------------------
function resolveStartTarget() {
  const builtIndex = path.join(__dirname, 'build-output', 'index.html');
  const forceFile = process.env.ELECTRON_START_URL === 'file';
  const hasBuiltOutput = fs.existsSync(builtIndex);
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (forceFile || hasBuiltOutput) {
    return { type: 'file', file: builtIndex };
  }
  return { type: 'url', url: devUrl };
}

// ---------------------------
// Optional: set CSP via headers instead of <meta>
// - Dev policy allows websocket + eval for Vite HMR.
// - Prod policy is strict (no eval, no ws).
// Remove this whole function if you prefer a <meta> tag in index.html.
// ---------------------------
function installCSPHeaders() {
  const dev = !app.isPackaged && process.env.ELECTRON_START_URL !== 'file';

  const devCSP = [
    "default-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' ws: http://localhost:5173",
    "media-src 'self' blob:"
  ].join('; ');

  const prodCSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:"
  ].join('; ');

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const policy = dev ? devCSP : prodCSP;
    const headers = { ...details.responseHeaders };
    headers['Content-Security-Policy'] = [policy];
    callback({ responseHeaders: headers });
  });
}

// ---------------------------
// Create the BrowserWindow
// ---------------------------
let mainWindow;

function createWindow() {
  const startTarget = resolveStartTarget();

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    useContentSize: true,
    show: false, // show after ready-to-show for nicer UX
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // If you use a preload, uncomment and ensure the path is correct:
      preload: path.join(__dirname, 'preload.js'),

      // Extra hardening (optional):
      webgl: false,
      enableWebSQL: false,
      experimentalFeatures: false,
      devTools: true,
    },
  });

  // Show window when it's ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open DevTools only in dev
    if (startTarget.type === 'url') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Load the right entry (dev server or built file)
  if (startTarget.type === 'file') {
    mainWindow.loadFile(startTarget.file);
  } else {
    mainWindow.loadURL(startTarget.url);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------------------------
// App lifecycle
// ---------------------------
app.whenReady().then(() => {
  installCSPHeaders(); // remove if using <meta> CSP
  createWindow();

  app.on('activate', () => {
    // macOS: recreate a window when dock icon is clicked and none are open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Quit on all platforms except macOS
  if (process.platform !== 'darwin') app.quit();
});
