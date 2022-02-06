const {dialog, ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit').addEventListener('click', (e) => restart(e))
});

function restart(e){
    e.preventDefault()
    var playersIndex = document.getElementById("num-players").selectedIndex;
    ipcRenderer.sendSync('restart', playersIndex);
    //sockelert(playersIndex);t.emit("restart", playersIndex);
}