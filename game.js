var colors = {
    0: [240, 30, 60],
    1: [30, 70, 240], 
    2: [30, 240, 65]
}
var playerNames = {
    0: "Red",
    1: "Blue",
    2: "Green"
}
class Game{
    constructor(){
        this.tileSize = 100;//100
        this.placeRange = 6;
        this.maxEnemyInArea = 8;
        this.x = 0;
        this.y = 0;
        this.homeY = 0;
        this.homeX = 0;
        this.tiles = [];
        this.activePlayers = {};
        this.playerNum = -1;
        this.tilesAvailable = 10;
        this.playing = true;
        this.ready = false
        this.invasionSpeed = 1.7;//how easily you can place tiles near enemies
        this.maxTileStrength = 20;
    }
}

function setup(){
    createCanvas(windowWidth / 1.05, windowHeight / 1.05);
}

var game = new Game();
var frameCount = 0;

window.onload = function(){
    //if(true){
    if(!( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )){
        //show mobile buttons
        var elementsToHide = document.getElementsByClassName("mobile-hide");
        console.log("hide")
        for(var element in elementsToHide){
            elementsToHide[element].style.display = "none";
            elementsToHide[element].style.pointerEvents = "none";
        }
    } else{
        strokeWeight(3);
    }
}

function draw(){
    clear();
    background(0, 0, 0,0);
    drawTiles();   
    drawUI();
    checkLose();
    frameCount++;
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

function place(){
    var placingPossible = false;
    var enemyInArea = 0;
    for(var y = game.y - game.placeRange; y < game.y + game.placeRange; y++){
        for(var x = game.x - game.placeRange; x < game.x + game.placeRange; x++){
            if(x >= 0 && y >= 0 && x < game.tiles[0].length && y < game.tiles.length){
                var tile = game.tiles[y][x];
                if(tile["owner"] == game.playerNum){
                    placingPossible = true;
                    enemyInArea -= tile["strength"] * game.invasionSpeed;
                } else{
                    if(tile["owner"] != -1 && tile["owner"] != -3){
                        enemyInArea += tile["strength"];
                    }
                }
            }
        }   
    }
    if(placingPossible){
        if(game.tilesAvailable > 0){
            var tile = game.tiles[game.y][game.x];
            if(enemyInArea < game.maxEnemyInArea && (game.tilesAvailable >= tile["strength"] || tile["owner"] == -3)){
                if(tile["strength"] < game.maxTileStrength || tile["owner"] == -3 || tile["owner"] !== game.playerNum){//spagettie code
                    socket.emit("placeTile", game.x, game.y, game.playerNum);
                    if(game.playerNum !== tile["owner"] && tile["owner"] != -1){
                        if(tile["owner"] == -3){
                            game.tilesAvailable += tile["strength"] + 1;
                        } else{
                            game.tilesAvailable -= tile["strength"];
                            if(game.tilesAvailable < 1){
                                game.tilesAvailable = 1;
                            }
                        }
                    }
                    game.tilesAvailable -= 1;
                }
            }
        }
    }
}

function keyPressed(){
    if ((keyCode == RIGHT_ARROW || keyCode == 68) && game.x < game.tiles[0].length - 1 && game.ready){
        //game.x += 1;
        //socket.emit("move", game.x, game.y);
        move(1, 0);
    }
    if ((keyCode == LEFT_ARROW || keyCode == 65) && game.x > 0 && game.ready){
        //game.x -= 1;
        //socket.emit("move", game.x, game.y);
        move(-1,0)
    }    
    if ((keyCode == UP_ARROW || keyCode == 87) && game.y > 0 && game.ready){
        //game.y -= 1;
        //socket.emit("move", game.x, game.y);
        move(0, -1);
    }
    if ((keyCode == DOWN_ARROW || keyCode == 83) && game.y < game.tiles.length - 1 && game.ready){
        //game.y += 1;
        //socket.emit("move", game.x, game.y);
        move(0, 1);
    }
    if(keyCode == 32 && game.playing && game.ready){
        place();
    }
}

function drawTiles(){
    var tiles = game.tiles;
    var xTileMax = windowWidth / game.tileSize;
    var yTileMax = windowHeight / game.tileSize;
    var xMin = game.x - xTileMax;
    var xMax = game.x + xTileMax;
    var yMin = game.y - yTileMax;
    var yMax = game.y + yTileMax;
    for(var y in tiles){
        for(var x in tiles[y]){
            if(x > xMin && x < xMax && y > yMin && y < yMax){
                //might be on screen;
                var relativeX = x - game.x; // x pos of tile compared to player
                var relativeY = y - game.y; // y pos of tile compared to player
                var middleX = windowWidth / 2 - game.tileSize; // middle of screen
                var middleY = windowHeight / 2 - game.tileSize; // middle of screen
                var xAdj = middleX + (relativeX * game.tileSize); // finds adjusted position of tile for drawing
                var yAdj = middleY + (relativeY * game.tileSize);

                var tile = game.tiles[y][x];
                var owner = tile["owner"];
                var strength = tile["strength"];
                
                if(owner == -1){
                    fill(235);
                } else if(owner == -3){
                    var powerupColor = [235, 210, 52];
                    var powerupR = powerupColor[0] / 50 * strength + 50;
                    var powerupG = powerupColor[1] / 50 * strength + 50;
                    var powerupB = powerupColor[2] / 50 * strength + 20;
                    fill(powerupR, powerupG, powerupB);
                } else{
                    var color = [colors[owner][0], colors[owner][1], colors[owner][2]];
                    color = color == undefined ? [255, 255, 255] : color;
                    var brightnesMultiplier = (strength + 3) / 13;
                    color[0] *= brightnesMultiplier;
                    color[1] *= brightnesMultiplier;
                    color[2] *= brightnesMultiplier;
                    fill(color[0], color[1], color[2]);
                }

                rect(xAdj, yAdj, game.tileSize, game.tileSize);

                //draw players
                for(var key of Object.keys(game.activePlayers)){
                    var player = game.activePlayers[key];
                    var px = player["x"];
                    var py = player["y"];
                    var playerNum = player["playerNum"];

                    if(px == x && py == y){
                        var pXAdj = xAdj + game.tileSize / 2; // player adjusted x
                        var pYAdj = yAdj + game.tileSize / 2;
                        var color = colors[playerNum];
                        fill(color[0], color[1], color[2]);
                        ellipse(pXAdj, pYAdj, 10, 10)
                    }
                }
            }
        }
    }
}
