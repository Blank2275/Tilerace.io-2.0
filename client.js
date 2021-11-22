var socket = io();

socket.on("startSync", (x, y, tiles, players, tilesAvailable, numberOfActivePlayers) => {
    game.x = x; game.y = y;
    game.tiles = tiles;
    game.activePlayers = players;
    game.playerNum = Object.keys(players).length - 1;
    game.tilesAvailable = tilesAvailable;
    game.playerNum = numberOfActivePlayers - 1;
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
})