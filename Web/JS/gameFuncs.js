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
                console.log(enemyInArea)
            }
        }   
    }
    if(placingPossible){
        if(game.tilesAvailable > 0){
            var tile = game.tiles[game.y][game.x];
            if(enemyInArea < game.maxEnemyInArea && (game.tilesAvailable >= tile["strength"] || tile["owner"] == -3)){
                if(tile["strength"] < game.maxTileStrength || tile["owner"] == -3 || tile["owner"] !== game.playerNum){//spaghetti code
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
                
                if(game.tileAvailabilities.length > 0){
                    var enemyInArea = game.tileAvailabilities[y][x];
                    var scaledEnemyInArea = 0 + ((enemyInArea + 60) * (255 / 10));
                    if(scaledEnemyInArea < 0){scaledEnemyInArea = 0}
                    if(scaledEnemyInArea > 255){scaledEnemyInArea = 255}
                    scaledEnemyInArea /= 255
                    
                    const red = [230, 39, 39];
                    const green = [58, 222, 55];
                    
                    const rr = red[0];
                    const rg = red[1];
                    const rb = red[2];
                    
                    const gr = green[0];
                    const gg = green[1];
                    const gb = green[2];
                    
                    //const ar = gr + (rr - gr) * scaledEnemyInArea;
                    //const ag = gg + (rg - gg) * scaledEnemyInArea;
                    //const ab = gb + (rb - gb) * scaledEnemyInArea;
                    var tileCloseEnough = false;
                    if(enemyInArea < game.maxEnemyInArea){
                        stroke(gr, gb, gg);
                    } else {
                        stroke(rr, rg, rb);
                    }
                }
                
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
                strokeWeight(3)
                rect(xAdj, yAdj, game.tileSize, game.tileSize);
                strokeWeight(1)
                //fill(0)
                //text((Math.floor(enemyInArea * 10) / 10).toString(), xAdj, yAdj);
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
