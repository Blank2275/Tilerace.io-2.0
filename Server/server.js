var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

var debugMode  = false;

app.get("/", function (req, res){
    res.sendFile(path.resolve("../Web/index.html"));
});

app.get("/client.js", function (req, res){
    res.sendFile(path.resolve("../Web/client.js"));
});

app.get("/game.js", function (req, res){
    res.sendFile(path.resolve("../Web/game.js"));
});

app.get("/manage", function(req, res){
    res.sendFile(__dirname + "/manage.html");
});

class Game{
    constructor(){
        this.numberOfActivePlayers = 0;
        this.activePlayers = {};
        this.playersLoggedIn = [];
        this.width = 30;
        this.height = 30;
        this.tiles = [];
        this.addTileFrequency = 1000;
        this.playing = false;
        this.powerupProbability = 0.025;
        this.maxPowerupPower = 40;
        this.players = 2;
        for(var y = 0; y < this.height; y++){
            this.tiles.push([]);
            for(var x = 0; x < this.width; x++){
                this.tiles[y].push({
                    "owner": -1,
                    "strength": 1
                });
            }
        }
    }
    addPlayer(id){
        if(this.numberOfActivePlayers < this.players){
            var x = 0;
            var y = 0;
            if(this.numberOfActivePlayers == 0){
                x = 0;
                y = Math.floor(this.height / 2);
            }
            if(this.numberOfActivePlayers == 1){
                x = this.width - 1;
                y = Math.floor(this.height / 2);
            }
            if(this.numberOfActivePlayers == 2){
                x = Math.floor(this.width / 2);
                y = 0;
            }
            if(this.numberOfActivePlayers == 3){
                x = Math.floor(this.width / 2);
                y = this.height - 1;           
            }
            this.tiles[y][x] = {
                "owner": this.numberOfActivePlayers,
                "strength": 10
            }
            this.activePlayers[id] = {
                "x": x,
                "y": y,
                "tiles": 30,
                "playerNum": this.numberOfActivePlayers
            }
            this.numberOfActivePlayers += 1;
            if(this.numberOfActivePlayers == this.players){
                this.playing = true;
            }
        }
    }
}

//var players = 3;
var game = new Game();
var first = true;

function gameTick(){
    if(Math.random() < game.powerupProbability){
        var x = Math.floor(Math.random() * game.width);
        var y = Math.floor(Math.random() * game.height);
        while(game.tiles[y][x]["owner"] != -1){
            x = Math.floor(Math.random() * game.width);
            y = Math.floor(Math.random() * game.height);          
        }
        var strength = Math.floor(Math.random() * (game.maxPowerupPower - 1) + 1);
        game.tiles[y][x]["owner"] = -3;
        game.tiles[y][x]["strength"] = strength;
        io.emit("powerup", x, y, strength);
    }
    if(game.playing){
        io.emit("addTile");
        if(first){
            io.emit("start");
            first = false;
        }
    }
}
setInterval(gameTick, game.addTileFrequency);

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
    io.to(id).emit("startSync", x, y, tiles, game.activePlayers, tilesAvailable, game.numberOfActivePlayers);
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
        game = new Game();
        for(var id of ids){
            setupPlayer(id);
        }
        game.playersLoggedIn = ids;
        first = true;
        console.log(Object.keys(game.activePlayers).length);
        console.log(game.players)
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

exports.restart = (playerIndex) => {
    //change settings
    var ids = game.playersLoggedIn;
    game = new Game();
    game.players = playerIndex + 2; // if the index of input is 0, the players is two
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