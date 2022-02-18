var colors = {
    0: [240, 30, 60],
    1: [30, 70, 240], 
    2: [30, 240, 65], 
    3: [162, 0, 255]
}
var playerNames = {
    0: "Red",
    1: "Blue",
    2: "Green",
    3: "Purple"
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
    game.x += x;
    game.y += y;
    socket.emit("move", game.x, game.y);
}