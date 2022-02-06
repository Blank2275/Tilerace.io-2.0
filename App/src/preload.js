const {dialog, ipcRenderer} = require('electron');
const QRCode = require('qrcode');
const ip = require('ip')

window.addEventListener('DOMContentLoaded', () => {
    var qrcanvas = document.getElementById('qrcode');
    //var ip = os.networkInterfaces()['venet0:0'][0].address;
    var address = ip.address();
    QRCode.toCanvas(qrcanvas, `http://${address}:8080`, (err) => {
        if(err) console.error(err);
        console.log('succesfully made qr code')
    })
})

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit').addEventListener('click', (e) => restart(e))
});

function restart(e){
    e.preventDefault()
    var playersIndex = document.getElementById("num-players").selectedIndex;
    ipcRenderer.sendSync('restart', playersIndex);
    //sockelert(playersIndex);t.emit("restart", playersIndex);
}