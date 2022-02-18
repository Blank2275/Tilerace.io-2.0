function setup(){
    createCanvas(windowWidth / 1.05, windowHeight / 1.05);
}

var game = new Game();
var frameCount = 0;

window.onload = function(){
    //if(true){
    if(!( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )){
        //show mobile buttons
        var elementsToHide = document.getElementsByClassName("mobile-hide");
        for(var element of elementsToHide){
            element.style.display = "none";
            element.style.pointerEvents = "none";
        }
    } else{
        strokeWeight(3);
    }
}

function draw(){
    clear();
    background(0, 0, 0,0);
    drawTiles();   
    drawUI();
    checkLose();
    frameCount++;
}