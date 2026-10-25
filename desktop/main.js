// Castle WARS – aplikace pro Windows, macOS a Linux (Electron).
// Načítá vždy nejnovější verzi hry z webu; bez internetu spustí verzi přibalenou v aplikaci.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const WEB = 'https://pracovnitipy.github.io/hrad-proti-hradu/index.html';
const LOCAL = path.join(__dirname, 'hra', 'index.html');

function create() {
  const w = new BrowserWindow({
    width: 1280, height: 720, minWidth: 900, minHeight: 500, show: false,
    backgroundColor: '#0d121c', title: 'Castle WARS', autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, autoplayPolicy: 'no-user-gesture-required' }
  });
  w.setMenuBarVisibility(false);
  w.once('ready-to-show', () => { w.maximize(); w.show(); });
  let local = false;
  w.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (isMain && !local) { local = true; w.loadFile(LOCAL); }
  });
  // F11 = celá obrazovka
  w.webContents.on('before-input-event', (e, i) => {
    if (i.type === 'keyDown' && i.key === 'F11') { w.setFullScreen(!w.isFullScreen()); e.preventDefault(); }
  });
  // odkazy (zásady ochrany soukromí apod.) otevřít v prohlížeči
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  w.loadURL(WEB);
}
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
