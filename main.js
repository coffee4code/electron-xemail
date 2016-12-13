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
    mainWin = new BrowserWindow({width: 800, height: 600});

    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, 'app','index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWin.webContents.openDevTools();

    mainWin.on('closed', function () {
        mainWin = null
    });
}