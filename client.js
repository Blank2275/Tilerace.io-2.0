var socket = io();

socket.on("startSync", (x, y, tiles, players) => {
    game.x = x; game.y = y;
    game.tiles = tiles;
    game.activePlayers = players;
});

socket.on("updatePlayers", (players) => {
    game.activePlayers = players;
});