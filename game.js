var colors = {
    0: [240, 30, 60],
    1: [30, 70, 240]
}
class Game{
    constructor(){
        this.tileSize = 50;
        this.x = 0;
        this.y = 0;
        this.tiles = [];
        this.activePlayers = {};
    }
}

function setup(){
    createCanvas(windowWidth / 1.05, windowHeight / 1.05);
}

var game = new Game();
var frameCount = 0;

function draw(){
    background(0);
    drawTiles();   
    frameCount++;
}

function keyPressed(){
    if (keyCode == RIGHT_ARROW && game.x < game.tiles[0].length){
        game.x += 1;
    }
    if (keyCode == LEFT_ARROW && game.x > 0){
        game.x -= 1;
    }    
    if (keyCode == UP_ARROW && game.y > 0){
        game.y -= 1;
    }
    if (keyCode == DOWN_ARROW && game.y < game.tiles.length){
        game.y += 1;
    }
    socket.emit("move", game.x, game.y);
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
