var socket = io();

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
});

socket.on("updatePlayers", (players) => {
    game.activePlayers = players;
});

socket.on("placeTile", (x, y, id, num) => {
    if(game.tiles[y][x]["owner"] != num){
        game.tiles[y][x]["owner"] = num;
        game.tiles[y][x]["strength"] = 0;
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
    game.tiles[y][x]["owner"] = num;
    game.tiles[y][x]["strength"] = 10;
})