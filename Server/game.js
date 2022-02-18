class Game{
    constructor(){
        this.addTileFrequency = 1000;
        this.numberOfActivePlayers = 0;
        this.activePlayers = {};
        this.playersLoggedIn = [];
        this.width = 30;
        this.height = 30;
        this.tiles = [];
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

exports.gameTick = function gameTick(game, io, first){
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

exports.Game = Game;