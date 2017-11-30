
document.addEventListener("DOMContentLoaded", function () {

    let tiltElements = document.querySelectorAll(".tilt");

    const tilt = require("vanilla-tilt"); // importing tiltJS
    tilt.init(tiltElements, { // create tilt elements
        max: 25, // tilt angle
        speed: 60, // zoom-out speed
        scale: 1.15
    });

    let playerIsX = true;
    let playerTurn = true;

    // create a 1x9 array representing  current game state
    let gameStateArray = [];
    gameStateArray.length = 9;
    gameStateArray.fill(" ");

    let boxes = document.querySelectorAll(".row-box");
    Array.prototype.forEach.call(boxes, function(box, i) {
        box.addEventListener("click", function () {
            if (!box.children.length && playerTurn) { // no symbols in the box
                let symbol = document.createElement("div");
                if (playerIsX) {
                    symbol.setAttribute("class", "x-icon");
                    playerIsX = false;
                } else {
                    symbol.setAttribute("class", "o-icon");
                    playerIsX = true;
                }
                box.appendChild(symbol);
                updateGameState(i, symbol.getAttribute("class"));
                Array.prototype.forEach.call(tiltElements, function(tiltElement) {
                    tiltElement.vanillaTilt.destroy(); // lock game board until CPU finished move
                });
                botTurn();
                playerTurn = false;
            }
        });
    });

    function updateGameState(val, iconType) {
        gameStateArray[val] = (iconType === "x-icon") ? "x" : "o";
        console.log(gameStateArray)
    }
    // based on the game state, perform best possible move
    function botTurn() {

    }

    // TODO: landing page screen
});