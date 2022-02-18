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
        this.generationMode = "Chunks";
        this.wallPercentage = 20;
        this.offsetResetSpeed = 0.05;
        this.shadowMode = true;
        this.shadowMode = true;
        for(var y = 0; y < this.height; y++){
            this.tiles.push([]);
            for(var x = 0; x < this.width; x++){
                this.tiles[y].push({
                    "owner": -1,
                    "strength": 1,
                    "type":"normal"
                });
            }
        }
        //generate walls
        this.generateWalls();
    }
    generateWalls() {
        if(this.generationMode == "Classic"){
        } else if(this.generationMode == "Chunks"){
            var amountToPlace = (this.width * this.height) * (this.wallPercentage / 100); //total amount of tiles times percent of tiles
            //that should be wall
            var placed = 0;
            while(placed < amountToPlace){
                var x = Math.floor(Math.random() * this.width);
                var y = Math.floor(Math.random() * this.height);
                if(this.minDistToEdge(x, y) > 2){
                    this.tiles[y][x]["type"] = "wall";
                    placed += 1;
                }
            }
        }
    }
    minDistToEdge(x, y){
        var topDist = y;
        var bottomDist = this.height - y;
        var leftDist = x;
        var rightDist = this.width - x;
        return Math.min(topDist, bottomDist, leftDist, rightDist);
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
        while(game.tiles[y][x]["owner"] != -1 || game.tiles[y][x]["type"] != "normal"){
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