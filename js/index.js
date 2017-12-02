
document.addEventListener("DOMContentLoaded", function () {

    let tiltElements = document.querySelectorAll(".tilt");

    const tilt = require("vanilla-tilt"); // importing tiltJS
    tilt.init(tiltElements, { // create tilt elements
        max: 25, // tilt angle
        speed: 60, // zoom-out speed
        scale: 1.15
    });

    let playerBegins = true;
    let playerIsX = true;
    let playerTurn = true;

    let moveRound = 0; // represents round one is in (or round a move was made)

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
                moveRound++;
                botTurn();
                playerTurn = false;
            }
        });
    });

    function updateGameState(iconType, index) {
        gameStateArray[index] = (iconType === "x-icon") ? "x" : "o";
        console.log(gameStateArray)
    }
    // based on the game state, perform best possible move
    function botTurn() {
        // if beginning of the match, place x in the center
        if (!playerBegins) {
            let icon = "x-icon";
            switch (moveRound) {
                case 0:
                    placeSymbolAtIndex(icon, 4);
                    break;
                case 2:
                    if (gameStateArray[1] === "o" || gameStateArray[3] === "o" ||
                        gameStateArray[5] === "o" || gameStateArray[7] === "o") {
                        // player placed o in a side field -> will lose match

                    } else {
                        // player placed o in diagonal field -> can still tie match

                    }

            }
        } else {
            let icon = "o-icon";
        }

        playerTurn = true;
        moveRound++;
    }

    function placeSymbolAtIndex(iconType, index) {
        let targetBox = boxes[index];
        if (!targetBox.children.length) {
            let symbol = document.createElement("div");
            symbol.setAttribute("class", iconType);
            targetBox.appendChild(symbol);
            updateGameState(iconType, index)
        } else {
            alert("attempt to place symbol at " + index + " failed");
        }
    }

    // TODO: landing page screen
});