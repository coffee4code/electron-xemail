var electron = require('electron'),
    path = require('path'),
    url = require('url'),
    app = electron.app,
    BrowserWindow = electron.BrowserWindow;

let mainWin;

app.on('ready', createWindow);
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


function createWindow () {
    mainWin = new BrowserWindow({
        width: 1366,
        height: 730,
        minWidth: 1366,
        minHeight: 768,
        frame: false
    });
    mainWin.setMenu(null);
    mainWin.loadURL(url.format({
        pathname: path.join(__dirname,'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //https://github.com/kevinsawicki/tray-example
    mainWin.webContents.openDevTools();

    mainWin.on('closed', function () {
        mainWin = null
    });
}