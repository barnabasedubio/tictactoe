
document.addEventListener("DOMContentLoaded", function () {

    let tiltElements = document.querySelectorAll(".tilt");

    const tilt = require("vanilla-tilt");
    // initializing vanillaTilt
    tilt.init(tiltElements, {
        max: 25, // tilt angle
        speed: 60, // zoom-out speed
        scale: 1.15
    });

    /*
    function toggleTilt(flag) {
        let tiltElements = document.querySelectorAll(".tilt");
        if (flag) {
            tilt.init(tiltElements, { // create tilt elements
                max: 25, // tilt angle
                speed: 60, // zoom-out speed
                scale: 1.15
            });
        } else {
            Array.prototype.forEach.call(tiltElements, function(tiltElement) {
                tiltElement.vanillaTilt.destroy(); // lock game board until bot finished move
            });
        }
    } */

    let playerBegins = false;
    let playerTurn = false;

    let moveRound = 0; // represents round one is in (or round a move was made)

    // create a 1x9 array representing  current game state
    let gameStateArray = [];
    gameStateArray.length = 9;
    gameStateArray.fill(" ");

    let playerMoveArray = [];
    let botMoveArray = [];

    let boxes = document.querySelectorAll(".row-box");

    if (playerBegins) {
        playerTurn = true;
    } else {
        botTurn();
    }

    // for the player
    Array.prototype.forEach.call(boxes, function(box, i) {
        box.addEventListener("click", function () {
            if (!box.children.length && playerTurn) { // no symbols in the box
                let symbol = document.createElement("div");
                if (playerBegins) {
                    symbol.setAttribute("class", "x-icon");
                } else {
                    symbol.setAttribute("class", "o-icon");
                }
                box.appendChild(symbol);
                updateGameState(symbol.getAttribute("class"), i);
                // toggleTilt(false);
                moveRound++;
                playerTurn = false;
                playerMoveArray.push(i);
                botTurn()
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
                    botMoveArray.push(4);
                    break;
                case 2:
                    let indexOfPlayer = parseInt(getIndex());
                    if (indexOfPlayer % 2 === 1) {
                        // player placed o in a side field -> will lose match
                        placeSymbolAtIndex(icon, (indexOfPlayer + 5) % 10);
                        botMoveArray.push((indexOfPlayer + 5) % 10);
                    } else {
                        // player placed o in diagonal field -> can still tie match
                        placeSymbolAtIndex(icon, 16 - (indexOfPlayer + 8)); // diagonally away from player
                        botMoveArray.push(16 - (indexOfPlayer + 8));
                    }
                    break;
                case 4:
                    // check if in a match point position
                    if (checkIfEmpty(12 - (botMoveArray[0] + botMoveArray[1]))) {
                        placeSymbolAtIndex(icon, 12 - (botMoveArray[0] + botMoveArray[1]));
                        gameOver();
                    }

                    else if (playerMoveArray[1] % 2 === 1) {
                        // all cases where players first move was to a corner and the second move was to a side
                        if ((playerMoveArray[0] === 6 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 2 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 0);
                        }
                        if ((playerMoveArray[0] === 8 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 0 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 2);
                        }
                        if ((playerMoveArray[0] === 0 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 8 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 6);
                        }
                        if ((playerMoveArray[0] === 2 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 6 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 8);
                        }

                    }
                    else  { // player placed symbol in corner field
                        if (playerMoveArray[0] % 2 === 1) {
                            /* if the players firs move was a side move, the only way to reach this code is if
                             * the player is countering the bot's attempt to win. That will in turn put the player
                             * in a position to win, and if the bot counters that position, the game is pretty much over. */
                            if (botMoveArray[1] === 0) placeSymbolAtIndex(icon, 2);
                            if (botMoveArray[1] === 2) placeSymbolAtIndex(icon, 8);
                            if (botMoveArray[1] === 6) placeSymbolAtIndex(icon, 0);
                            if (botMoveArray[1] === 8) placeSymbolAtIndex(icon, 6);
                        } else {
                            // player played both moves in corners, is now in match position -> counter
                        }
                    }


            }
        } else {
            let icon = "o-icon";
        }
        // toggleTilt(true);
        playerTurn = true;
        moveRound++;
    }

    function checkIfEmpty(index) {
        console.log("in checkifempty... index: " + index);
        // check if box element corresponding to index has a symbol in it
        if (boxes[index].children.length === 0) {
            console.log("we win!");
            return true;
        }
        console.log("already occupied");
        return false;
    }

    function placeSymbolAtIndex(iconType, index) {
        let targetBox = boxes[index];
        console.log("index: " + index);
        if (!targetBox.children.length) {
            let symbol = document.createElement("div");
            symbol.setAttribute("class", iconType);
            targetBox.appendChild(symbol);
            updateGameState(iconType, index)
        } else {
            alert("attempt to place symbol at " + index + " failed");
        }
    }

    function getIndex() {
        for (let i in gameStateArray) {
            if (gameStateArray[i] === "o") {
                return i;
            }
        }
    }

    function gameOver() {}

    // TODO: landing page screen
});