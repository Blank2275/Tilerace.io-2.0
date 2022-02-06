const {dialog, ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit').addEventListener('click', () => restart())
});

function restart(){
    var playersIndex = document.getElementById("num-players").selectedIndex;
    ipcRenderer.sendSync('restart', playersIndex);
    //sockelert(playersIndex);t.emit("restart", playersIndex);
}