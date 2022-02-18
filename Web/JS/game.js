
class Game{
    constructor(){
        this.tileSize = 100;//100
        this.placeRange = 6;
        this.maxEnemyInArea = 8;
        this.x = 0;
        this.y = 0;
        this.realX = 0;
        this.realY = 0;
        this.homeY = 0;
        this.homeX = 0;
        this.tiles = [];
        this.tileAvailabilities = [];
        this.activePlayers = {};
        this.playerNum = -1;
        this.tilesAvailable = 10;
        this.playing = true;
        this.ready = false
        this.invasionSpeed = 1.2;//how easily you can place tiles near enemies
        this.maxTileStrength = 20;
        this.offset = [0, 0];
        this.offsetResetSpeed = 2;
        this.defaultResetSpeed = 2;
        this.shadowMode = false;
    }
    generateTileAvailabilities(){
        this.tileAvailabilities = [];
        for(var y in this.tiles){
            this.tileAvailabilities.push([]);
            for(var x in this.tiles[y]){
                this.tileAvailabilities[y].push(0);
            }
        }
        for(var y in this.tiles){
            for(var x in this.tiles[y]){
                if(this.tiles[y][x]["strength"] !== 1){
                //
                    for(var y1 = y - this.placeRange; y1 < y + this.placeRange; y1++){
                        for(var x1 = x - this.placeRange; x1 < x + this.placeRange; x1++){
                            if(x1 >= 0 && y1 >= 0 && x1 < this.tiles[0].length && y1 < game.tiles.length){
                                var tile = this.tiles[y][x];
                                var enemyInArea = 0;
                                if(tile["owner"] == this.playerNum){
                                    enemyInArea -= tile["strength"] * this.invasionSpeed;
                                } else{
                                    if(tile["owner"] != -1 && tile["owner"] != -3){
                                        enemyInArea += tile["strength"];
                                    }
                                }
                                this.tileAvailabilities[y1][x1] += enemyInArea;
                            }
                        }   
                    }
                //
                }
            }
        }
    }
}


