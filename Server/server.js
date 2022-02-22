var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var {Game, gameTick} = require('./game.js');

var debugMode  = false;

app.get("/", function (req, res){
    res.sendFile(path.resolve("./Web/HTML/index.html"));
});

app.get("/client.js", function (req, res){
    res.sendFile(path.resolve("./Web/JS/client.js"));
});

app.get("/game.js", function (req, res){
    res.sendFile(path.resolve("./Web/JS/game.js"));
});

app.get("/gameFuncs.js", function (req, res){
    res.sendFile(path.resolve("./Web/JS/gameFuncs.js"));
});

app.get("/main.js", function (req, res){
    res.sendFile(path.resolve("./Web/JS/main.js"));
});

app.get("/utilities.js", function (req, res){
    res.sendFile(path.resolve("./Web/JS/utilities.js"));
});

app.get("/manage", function(req, res){
    res.sendFile(__dirname + "/manage.html");
});



//var players = 3;
var game = new Game("Classic", false, 30, 20, 10);
var first = true;

setInterval(() => first = gameTick(game, io, first), game.addTileFrequency);

function setupPlayer(id){
    game.addPlayer(id);
    var player = game.activePlayers[id];
    var x = 0;
    var y = 0;
    var tiles = game.tiles;
    var tilesAvailable = 0;
    if(player){
        x = player["x"];
        y = player["y"];
        tilesAvailable = player["tiles"];
        io.emit("newPlayer", x, y, player["playerNum"]);
    }
    io.to(id).emit("startSync", x, y, tiles, game.activePlayers, tilesAvailable, game.numberOfActivePlayers, game.shadowMode);
}

io.on("connection", function (socket){
    socket.on("startSync", () => {
        game.playersLoggedIn.push(socket.id);
        setupPlayer(socket.id);
    });
    if(game.numberOfActivePlayers > 1 && debugMode == true){
        game.numberOfActivePlayers = 0;
    }
    socket.on("move", (x, y) =>{
        if(game.activePlayers[socket.id]){
            game.activePlayers[socket.id]["x"] = x;
            game.activePlayers[socket.id]["y"] = y;
            io.emit("updatePlayers", game.activePlayers);
        }
    });
    socket.on("placeTile", (x, y, num) =>{
        game.tiles[y][x]
        if(game.tiles[y][x]["owner"] != num){
            game.tiles[y][x]["owner"] = num;
            game.tiles[y][x]["strength"] = 0;
        }
        game.tiles[y][x]["strength"] += 1;
        io.emit("placeTile", x, y, socket.id, num);
    });
    socket.on("lose", () => {
        if(game.activePlayers[socket.id]){
            var num = game.activePlayers[socket.id]["playerNum"];
            io.emit("lose", socket.id, num);
        }
    });
    socket.on("restart", (playerIndex) => {
        //change settings
        game.players = playerIndex + 2; // if the index of input is 0, the players is two
        
        var ids = game.playersLoggedIn;
        game = new Game("Classic", false, 30, 20, 10);
        for(var id of ids){
            socket.emit("restartWindow");
        }
        game.playersLoggedIn = ids;
        first = true;
        if(Object.keys(game.activePlayers).length == game.players){
            game.playing = true;
        }
    });
    socket.on("disconnect", () => {
        var index = game.playersLoggedIn.indexOf(socket.id);
        if(index !== -1){
            game.playersLoggedIn.splice(index, 1);
        }
    })
});

exports.restart = (playerIndex, gamemode, shadows, mapSizeIndex, wallPercentageIndex, chunkSizeIndex) => {
    //change settings
    var ids = game.playersLoggedIn;
    var modes = ["Classic", "Random", "Chunks"]
    var wallPercentages = [20, 30, 40, 50, 60, 70];
    var generationMode = modes[gamemode];
    var sizes = [15, 30, 45, 60];
    var size = sizes[mapSizeIndex];
    var wallPercent = wallPercentages[wallPercentageIndex]
    var chunkSizes = [5, 10, 15];
    var chunkSize = chunkSizes[chunkSizeIndex];
    game = new Game(generationMode, shadows, size, wallPercent, chunkSize);
    game.players = playerIndex + 2;// if the index of input is 0, the players is two
    for(var id of ids){
        setupPlayer(id);
    }
    game.playersLoggedIn = ids;
    first = true;
    if(Object.keys(game.activePlayers).length == game.players){
        game.playing = true;
    }
}

exports.startServer = () => {
    http.listen(8080, function(){
        console.log("port:8080");
    });
}