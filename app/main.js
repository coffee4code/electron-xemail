var electron = require('electron'),
    path = require('path'),
    url = require('url'),
    app = electron.app,
    BrowserWindow = electron.BrowserWindow;

let loadingScreen,
    mainWin,
    windowParams = {
        width: 1200,
        height: 700,
        minWidth: 1200,
        minHeight: 700,
        frame: false,
        show: false
    };

app.on('ready', function () {
    createLoadingScreen();
    createWindow();
});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  if (mainWin === null) {
    createWindow();
  }
});


function createLoadingScreen() {
    loadingScreen = new BrowserWindow(Object.assign(windowParams, {parent: mainWin}));
    loadingScreen.loadURL(url.format({
        pathname: path.join(__dirname,'loading.html'),
        protocol: 'file:',
        slashes: true
    }));
    loadingScreen.on('closed', () => loadingScreen = null);
    loadingScreen.webContents.on('did-finish-load', () => {
        loadingScreen.show();
    });
}
function createWindow () {
    mainWin = new BrowserWindow();
    mainWin.setMenu(null);
    mainWin.loadURL(url.format({
        pathname: path.join(__dirname,'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //https://github.com/kevinsawicki/tray-example
    // mainWin.webContents.openDevTools();

    mainWin.webContents.on('did-finish-load', () => {
        mainWin.show();

        if (loadingScreen) {
            let loadingScreenBounds = loadingScreen.getBounds();
            mainWin.setBounds(loadingScreenBounds);
            loadingScreen.close();
        }
    });

    mainWin.on('closed', function () {
        mainWin = null
    });
}