var socket = io();

socket.emit("startSync");

socket.on("startSync", (x, y, tiles, players, tilesAvailable, numberOfActivePlayers, shadowMode) => {
    game.x = x; game.y = y;
    game.realX = x; game.realY = y;
    game.tiles = tiles;
    game.activePlayers = players;
    game.playerNum = Object.keys(players).length - 1;
    game.tilesAvailable = tilesAvailable;
    game.playerNum = numberOfActivePlayers - 1;
    game.homeX = x;
    game.homeY = y;
    game.playing = true;
    game.ready = false;
    game.shadowMode = shadowMode;
    game.generateTileAvailabilities();
});

socket.on("restartWindow", () => {
    window.reload();
})

socket.on("updatePlayers", (players) => {
    game.activePlayers = players;
});

socket.on("placeTile", (x, y, id, num) => {
    if(game.tiles[y][x]["owner"] != num){
    game.tiles[y][x]["strength"] = 0;
        // for(var y1 = y - game.placeRange; y1 < y + game.placeRange; y1++){
        //     for(var x1 = x - game.placeRange; x1 < x + game.placeRange; x1++){
        //         if(x1 >= 0 && y1 >= 0 && x1 < game.tiles[0].length && y1 < game.tiles.length){
        //             game.tileAvailabilities[y1][x1] += game.tiles[y][x]["strength"];
        //             console.log(game.tileAvailabilities[y1][x1])
        //         }
        //     }       
        // }
    } else{
    }
    if(num == game.playerNum){
        for(var y1 = y - game.placeRange; y1 < y + game.placeRange; y1++){
            for(var x1 = x - game.placeRange; x1 < x + game.placeRange; x1++){
                if(x1 >= 0 && y1 >= 0 && x1 < game.tiles[0].length && y1 < game.tiles.length){
                    game.tileAvailabilities[y1][x1] -= game.invasionSpeed;
                }
            }       
        }    
    } else {
        for(var y1 = y - game.placeRange; y1 < y + game.placeRange; y1++){
            for(var x1 = x - game.placeRange; x1 < x + game.placeRange; x1++){
                if(x1 >= 0 && y1 >= 0 && x1 < game.tiles[0].length && y1 < game.tiles.length){
                    game.tileAvailabilities[y1][x1] += game.tiles[y][x]["strength"];
                }
            }       
        }
    }
    if(game.playerNum !== num){//only update tile here if is not self performing action
        game.tiles[y][x]["strength"] += 1;//otherwise do it instantly in place function
        game.tiles[y][x]["owner"] = num;
    }
});

socket.on("addTile", () => {
    game.tilesAvailable += 1;
    game.invasionSpeed += 1 / (60 * 3); //increase invasion speed, + 1.2 every 4 minutes
});

socket.on("lose", (id, num) => {
    var playerName = playerNames[num];
    alert(`${playerName} is out`);
});

socket.on("newPlayer", (x, y, num) => {
    if(game.playerNum != -1){
        game.tiles[y][x]["owner"] = num;
        game.tiles[y][x]["strength"] = 10;
        game.generateTileAvailabilities();
    }
});

socket.on("5secs", () => {
    game.secsToStart = 5;
    if(game.secInterval){
        clearInterval(game.secInterval);
    }
    game.secInterval = setInterval(() => {
        game.secsToStart -= 1;
        if(game.secsToStart === -1){
            clearInterval(game.secInterval);
            game.secsToStart = -1;
        }
    }, 1000);
});

socket.on("start", () => {
    game.ready = true;
});

socket.on("powerup", (x, y, strength) => {
    game.tiles[y][x]["owner"] = -3;
    game.tiles[y][x]["strength"] = strength;
})