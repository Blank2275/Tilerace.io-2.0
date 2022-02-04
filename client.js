var socket = io();

socket.emit("startSync");

socket.on("startSync", (x, y, tiles, players, tilesAvailable, numberOfActivePlayers) => {
    game.x = x; game.y = y;
    game.tiles = tiles;
    game.activePlayers = players;
    game.playerNum = Object.keys(players).length - 1;
    game.tilesAvailable = tilesAvailable;
    game.playerNum = numberOfActivePlayers - 1;
    game.homeX = x;
    game.homeY = y;
    game.playing = true;
    game.ready = false;
    game.generateTileAvailabilities();
});

socket.on("updatePlayers", (players) => {
    game.activePlayers = players;
});

socket.on("placeTile", (x, y, id, num) => {
    game.tiles[y][x]["owner"] = num;
    if(game.tiles[y][x]["owner"] != num){
        for(var y1 = y - game.placeRange; y1 < y + game.placeRange; y1++){
            for(var x1 = x - game.placeRange; x1 < x + game.placeRange; x1++){
                if(x1 >= 0 && y1 >= 0 && x1 < game.tiles[0].length && y1 < game.tiles.length){
                    game.tileAvailabilities[y1][x1] += game.tiles[y][x]["strength"];
                    console.log(game.tileAvailabilities[y1][x1])
                }
            }       
        }
        game.tiles[y][x]["strength"] = 0;
    } else{
    
        for(var y1 = y - game.placeRange; y1 < y + game.placeRange; y1++){
            for(var x1 = x - game.placeRange; x1 < x + game.placeRange; x1++){
                if(x1 >= 0 && y1 >= 0 && x1 < game.tiles[0].length && y1 < game.tiles.length){
                    game.tileAvailabilities[y1][x1] -= game.invasionSpeed;
                }
            }       
        }
    }
    game.tiles[y][x]["strength"] += 1;
});

socket.on("addTile", () => {
    game.tilesAvailable += 1;
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

socket.on("start", () => {
    game.ready = true;
});

socket.on("powerup", (x, y, strength) => {
    game.tiles[y][x]["owner"] = -3;
    game.tiles[y][x]["strength"] = strength;
})