const {dialog, ipcRenderer} = require('electron');
const QRCode = require('qrcode');
const ip = require('ip')

window.addEventListener('DOMContentLoaded', () => {
    var qrcanvas = document.getElementById('qrcode');
    //var ip = os.networkInterfaces()['venet0:0'][0].address;
    var address = ip.address();
    var url = `http://${address}:8080`;
    document.getElementById('urlDisplay').innerHTML = `go to: ${url}`;
    QRCode.toCanvas(qrcanvas, url, (err) => {
        if(err) console.error(err);
        console.log('succesfully made qr code')
    })
})

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit').addEventListener('click', (e) => restart(e))
});

function restart(e){
    e.preventDefault()
    var playersIndex = document.getElementById("num-players-input").selectedIndex;
    var gamemodeIndex = document.getElementById("gamemode-input").selectedIndex;
    var mapSizeIndex = document.getElementById("mapsize-input").selectedIndex;
    var wallPercentageIndex = document.getElementById("wall-percentage-input").selectedIndex;
    var chunkSizeIndex = document.getElementById("chunk-size-input").selectedIndex;
    var shadows = document.getElementById("shadows").checked;
    ipcRenderer.sendSync('restart', playersIndex, gamemodeIndex, shadows, mapSizeIndex, wallPercentageIndex, chunkSizeIndex);
    //sockelert(playersIndex);t.emit("restart", playersIndex);
}