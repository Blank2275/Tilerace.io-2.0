var socket = io();

socket.on("startSync", (x, y, tiles) => {
    game.x = x; game.y = y;
    game.tiles = tiles;
    console.log(x);
})