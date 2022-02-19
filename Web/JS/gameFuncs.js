function place(){
    var placingPossible = false;
    var enemyInArea = 0;
    for(var y = game.realY - game.placeRange; y < game.realY + game.placeRange; y++){
        for(var x = game.realX - game.placeRange; x < game.realX + game.placeRange; x++){
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
            var tile = game.tiles[game.realY][game.realX];
            if(enemyInArea < game.maxEnemyInArea && (game.tilesAvailable >= tile["strength"] || tile["owner"] == -3)){
                if(tile["strength"] < game.maxTileStrength || tile["owner"] == -3 || tile["owner"] !== game.playerNum){//spaghetti code
                    socket.emit("placeTile", game.realX, game.realY, game.playerNum);
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
    if ((keyCode == RIGHT_ARROW || keyCode == 68) && game.realX < game.tiles[0].length - 1 && game.ready){
        //game.x += 1;
        //socket.emit("move", game.x, game.y);
        move(1, 0);
    }
    if ((keyCode == LEFT_ARROW || keyCode == 65) && game.realX > 0 && game.ready){
        //game.x -= 1;
        //socket.emit("move", game.x, game.y);
        move(-1,0)
    }    
    if ((keyCode == UP_ARROW || keyCode == 87) && game.realY > 0 && game.ready){
        //game.y -= 1;
        //socket.emit("move", game.x, game.y);
        move(0, -1);
    }
    if ((keyCode == DOWN_ARROW || keyCode == 83) && game.realY < game.tiles.length - 1 && game.ready){
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
    var xMin = game.realX - xTileMax;
    var xMax = game.realX + xTileMax;
    var yMin = game.realY - yTileMax;
    var yMax = game.realY + yTileMax;
    console.log((game.realX + (game.x / game.tileSize)));
    for(var y in tiles){
        for(var x in tiles[y]){
            if(x > xMin && x < xMax && y > yMin && y < yMax){
                //might be on screen;
                var relativeX = x - game.x // x pos of tile compared to player
                var relativeY = y - game.y;// y pos of tile compared to player
                var middleX = windowWidth / 2 - game.tileSize; // middle of screen
                var middleY = windowHeight / 2 - game.tileSize; // middle of screen
                var xAdj = middleX + (relativeX * game.tileSize); // finds adjusted position of tile for drawing
                var yAdj = middleY + (relativeY * game.tileSize);

                var tile = game.tiles[y][x];
                var owner = tile["owner"];
                var strength = tile["strength"];
                var type = tile["type"];
                
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
                
                //if is wall color dark gray
                if(type == 'wall'){
                    fill(100);
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
                    var offsetX = 0;
                    var offsetY = 0;
                    if(playerNum == game.playerNum){
                        px = game.realX;
                        py = game.realY;
                        offsetX = game.offset[0];
                        offsetY = game.offset[1];
                    }

                    if(px == x && py == y){
                        var pXAdj = xAdj + game.tileSize / 2 + offsetX; // player adjusted x
                        var pYAdj = yAdj + game.tileSize / 2 + offsetY; // player adjusted y
                        var color = colors[playerNum];
                        fill(color[0], color[1], color[2]);
                        ellipse(pXAdj, pYAdj, 10, 10)
                    }
                }
            }
        }
    }
    //draw shadows if in shadow mode
    if(game.shadowMode){
        var distances = generateShadowDistances();
        var angleStep = (Math.PI * 2) / distances.length;
        for(var i in distances){
            var shadowDistance = 10000;
            var a1 = angleStep * i;
            var dist1 = distances[i];
            var adj1 = getAdjFromAngleDist(a1, dist1);
            var adj1X = adj1[0]
            var adj1Y = adj1[1]
            var adj1ExtendedX = adj1X + Math.cos(a1) * shadowDistance;
            var adj1ExtendedY = adj1Y + Math.sin(a1) * shadowDistance;
            var a2 = a1 + angleStep * 2;
            var dist2 = dist1;
            var adj2 = getAdjFromAngleDist(a2, dist2);
            var adj2X = adj2[0]
            var adj2Y = adj2[1]
            var adj2ExtendedX =  adj2X + Math.cos(a2) * shadowDistance;
            var adj2ExtendedY = adj2Y + Math.sin(a2) * shadowDistance;
            fill(40);
            noStroke();
            beginShape();
            vertex(adj1[0], adj1[1]);
            vertex(adj1ExtendedX, adj1ExtendedY);
            vertex(adj2ExtendedX, adj2ExtendedY);
            vertex(adj2[0], adj2[1]);
            endShape(CLOSE);
        }
    }
}

function getAdjFromAngleDist(a, dist){
    var x = Math.cos(a) * dist;
    var y = Math.sin(a) * dist;
    var relativeX = x; // x pos of tile compared to player
    var relativeY = y; // y pos of tile compared to player
    relativeX *= game.tileSize;
    relativeY *= game.tileSize;
    //console.log(relativeX)
    var middleX = windowWidth / 2; // middle of screen
    var middleY = windowHeight / 2; // middle of screen
    var xAdj = middleX + relativeX; // finds adjusted position of tile for drawing
    var yAdj = middleY + relativeY;
    return [xAdj, yAdj];
}

function generateShadowDistances(){
    var precision = 1;
    var px = game.x;
    var py = game.y;
    var step = 0.01;
    var distances = [];
    for(var angle = 0; angle < 360; angle += precision){
        a = angle * Math.PI / 180;
        var dist = 0;
        var x = px;
        var y = py;
        while(!colliding(x, y) && dist < 8){
            x += Math.cos(a) * step;
            y += Math.sin(a) * step;
            dist += step;
        }
        distances.push(dist);
    }
    function colliding(x, y){
        if(y > 0 && x > 0 && y < (game.tiles.length - 1) && x < (game.tiles[0].length - 1)){
            var tile = game.tiles[Math.ceil(y)][Math.ceil(x)];
            if(tile["type"] == "wall"){
                return true
            }
            return false;
        } else {
            return false;
        }
    }
    return distances;
}

function updateOffset(){
    var offset = game.offset;
    if(offset[0] > 0){
        if(offset[0] < game.offsetResetSpeed){
            offset[0] = 0;
            game.defaultResetSpeed = 2;
        } else {
            offset[0] -= game.offsetResetSpeed;
        }
    }
    if(offset[0] < 0){
        if(offset[0] > -game.offsetResetSpeed){
            offset[0] = 0;
            game.defaultResetSpeed = 2;
        } else {
            offset[0] += game.offsetResetSpeed;
        }
    }
    if(offset[1] > 0){
        if(offset[1] < game.offsetResetSpeed){
            offset[1] = 0;
            game.defaultResetSpeed = 2;
        } else {
            offset[1] -= game.offsetResetSpeed;
        }
    }
    if(offset[1] < 0){
        if(offset[1] > -game.offsetResetSpeed){
            offset[1] = 0;
            game.defaultResetSpeed = 2;
        } else {
            offset[1] += game.offsetResetSpeed;
        }
    }
    game.x = game.realX + offset[0] / game.tileSize;
    game.y = game.realY + offset[1] / game.tileSize;
    game.offset = offset;
}