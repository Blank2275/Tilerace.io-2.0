var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

class Game{
    constructor(){
        this.numberOfActivePlayers = 0;
        this.activePlayers = {};
        this.width = 100;
        this.height = 100;
        this.tiles = [];
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
        }
    }
}

class Player{
    
}

var players = 2;
var game = new Game();

app.get("/", function (req, res){
    res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", function (req, res){
    res.sendFile(__dirname + "/client.js");
});

app.get("/game.js", function (req, res){
    res.sendFile(__dirname + "/game.js");
});

io.on("connection", function (socket){
    game.addPlayer(socket.id);
    
    var player = game.activePlayers[socket.id];
    var x = 0;
    var y = 0;
    var tiles = game.tiles;
    console.log(player);
    if(player){
        x = player["x"];
        y = player["y"];
    }
    socket.emit("startSync", x, y, tiles)
});

http.listen(8080, function(){
    console.log("port:8080");
})