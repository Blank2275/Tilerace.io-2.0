var colors = {
    0: [240, 10, 20],//red
    1: [30, 70, 240], //blue
    2: [30, 240, 65], //green
    3: [162, 0, 255], //Purple
    4: [255, 0, 76], //magenta
    5: [20, 255, 220], //cyan
    6: [102, 0, 255], //violet
    7: [200, 255, 20] //lime
}
var playerNames = {
    0: "Red",
    1: "Blue",
    2: "Green",
    3: "Purple",
    4: "Magenta",
    5: "Cyan",
    6: "Violet",
    7: "Lime"
}

function checkLose(){
    if(game.tiles.length > 0){
        var tile = game.tiles[game.homeY][game.homeX];
        if(tile["owner"] != game.playerNum && game.playing){
            lose();
            socket.emit("lose");
        }
    }
}

function lose(){
    game.playing = false;
}

function drawUI(){
    fill(220, 40, 70);
    textSize(30);
    text(`Tiles: ${game.tilesAvailable}`, 10, 35)
}

function mobileAction(action){
    switch(action){
        case "up":
            move(0, -1);
            break;
        case "down":
            move(0, 1);
            break;
        case "left":
            move(-1, 0);
            break;
        case "right":
            move(1, 0);
            break;
        case "place":
            place();
            break;
    }
}

function move(x, y){
    var newTile = game.tiles[game.realY + y][game.realX + x];
    if(newTile["type"] == "wall") {
        game.offset = [x * 10, y * 10];
        return;
    } else{
        //smooth out transition between tilesAvailable
        //game.offset = [-x * game.tileSize, -y * game.tileSize]
        game.offset[0] += -x * game.tileSize;
        game.offset[1] += -y * game.tileSize;
        game.offsetResetSpeed = 12;
    }
    game.realX += x;
    game.realY += y;
    socket.emit("move", game.x, game.y);
}

function displaySecsToStart(){
    if(game.secsToStart != -1){
        var textToDisplay = "";
        console.log(game.secsToStart)
        if(game.secsToStart > 0){
            fill(250, 20, 65)
            textToDisplay = `${game.secsToStart}`;
        } else{
            fill(25, 255, 70);
            textToDisplay = `Go!`
        }
        textSize(32);
        var sizeOfText = textWidth(textToDisplay);
        var x = windowWidth / 2 - sizeOfText / 2;
        var y = windowHeight / 2;
        text(textToDisplay, x, y);
    }
}