var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var debugMode  = false;

class Game{
    constructor(){
        this.numberOfActivePlayers = 0;
        this.activePlayers = {};
        this.width = 30;
        this.height = 30;
        this.tiles = [];
        this.addTileFrequency = 2000;
        this.playing = false;
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
        if(this.numberOfActivePlayers < players){
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
            this.tiles[y][x] = {
                "owner": this.numberOfActivePlayers,
                "strength": 10
            }
            this.activePlayers[id] = {
                "x": x,
                "y": y,
                "tiles": 10,
                "playerNum": this.numberOfActivePlayers
            }
            this.numberOfActivePlayers += 1;
            if(this.numberOfActivePlayers == players){
                this.playing = true;
            }
        }
    }
}

class Player{
    
}

var players = 3;
var game = new Game();
var first = true;

function addTile(){
    if(game.playing){
        io.emit("addTile");
        if(first){
            io.emit("start");
            first = false;
            console.log("start");
        }
    }
}
setInterval(addTile, game.addTileFrequency);

app.get("/", function (req, res){
    res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", function (req, res){
    res.sendFile(__dirname + "/client.js");
});

app.get("/game.js", function (req, res){
    res.sendFile(__dirname + "/game.js");
});

app.get("/manage", function(req, res){
    res.sendFile(__dirname + "/manage.html");
});

io.on("connection", function (socket){
    socket.on("startSync", () => {
        setupPlayer(socket.id);
    })
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
        var ids = Object.keys(game.activePlayers);
        game = new Game();
        for(var id of ids){
            console.log(id);
            setupPlayer(id);
        }
        first = true;
        game.playing = true;
    });
});

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

http.listen(8080, function(){
    console.log("port:8080");
})