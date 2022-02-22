const { app, BrowserWindow, ipcMain } = require('electron')
var path = require('path');

var webServer = require('../Server/server.js');
webServer.startServer();

function createWindow(){
    const window = new BrowserWindow({
        width:800,
        height:600,
        frame:true,
        webPreferences:{
            preload: path.join(__dirname, 'src', 'preload.js')
        }
    });
    window.setMenu(null);
    window.loadFile("./HTML/manage.html");
}
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('restart', (event, players, gamemode, shadows, mapSizeIndex, wallPercentageIndex) => {
    webServer.restart(players, gamemode, shadows, mapSizeIndex, wallPercentageIndex);
    event.returnValue = 'success';
});