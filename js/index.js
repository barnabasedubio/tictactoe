
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

    let playerBegins = true;
    let playerTurn;

    let corners = [0, 2, 6, 8];

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

    let restart = document.getElementsByClassName("restart")[0];
    let i = 0;
    restart.addEventListener("click", function() {
        console.log(++i);
    });

    function updateGameState(iconType, index) {
        gameStateArray[index] = (iconType === "x-icon") ? "x" : "o";
        // console.log(gameStateArray)
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
                    console.log(botMoveArray);
                    break;

                case 2:
                    let indexOfPlayer = parseInt(getIndex());
                    if (indexOfPlayer % 2 === 1) {
                        // player placed o in a side field -> will lose match
                        placeSymbolAtIndex(icon, (indexOfPlayer + 5) % 10);
                        botMoveArray.push((indexOfPlayer + 5) % 10);
                        console.log(botMoveArray);
                    } else {
                        // player placed o in diagonal field -> can still tie match
                        placeSymbolAtIndex(icon, 16 - (indexOfPlayer + 8)); // diagonally away from player
                        botMoveArray.push(16 - (indexOfPlayer + 8));
                        console.log(botMoveArray);
                    }
                    break;

                case 4:
                    // check if in a match point position
                    if (checkIfEmpty(12 - (botMoveArray[0] + botMoveArray[1]))) {
                        placeSymbolAtIndex(icon, 12 - (botMoveArray[0] + botMoveArray[1]));
                        gameOver("win");
                    }

                    else if (playerMoveArray[1] % 2 === 1) {
                        // all cases where players first move was to a corner and the second move was to a side
                        if ((playerMoveArray[0] === 6 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 2 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 0);
                            botMoveArray.push(0);
                        }
                        if ((playerMoveArray[0] === 8 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 0 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 2);
                            botMoveArray.push(2);
                        }
                        if ((playerMoveArray[0] === 0 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 8 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 6);
                            botMoveArray.push(6);
                        }
                        if ((playerMoveArray[0] === 2 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 5)) ||
                            (playerMoveArray[0] === 6 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 7))) {
                            placeSymbolAtIndex(icon, 8);
                            botMoveArray.push(8);
                        }

                    }
                    else  { // player placed symbol in corner field
                        if (playerMoveArray[0] % 2 === 1) {
                            /* if the players firs move was a side move, the only way to reach this code is if
                             * the player is countering the bot's attempt to win. That will in turn put the player
                             * in a position to win, and if the bot counters that position, the game is pretty much over. */
                            let position = (botMoveArray[1] === 0 || botMoveArray[1] === 8) ?
                                botMoveArray[1] - botMoveArray[0] : botMoveArray[1] + botMoveArray[0];
                            placeSymbolAtIndex(icon, (Math.abs(position)+2) % 12);
                            botMoveArray.push((Math.abs(position)+2) % 12);
                            console.log(botMoveArray);
                        } else {
                            // player played both moves in corners, is now in match position -> counter
                            placeSymbolAtIndex(icon, Math.floor((playerMoveArray[0] + playerMoveArray[1]) / 2));
                            botMoveArray.push(Math.floor((playerMoveArray[0] + playerMoveArray[1]) / 2));
                            console.log(botMoveArray);
                        }
                    }
                    break;

                case 6:
                    /* finish off all cases where the first move of the player was to the side or first was to the corner and second was to the side */
                    if (isInt((botMoveArray[1] + botMoveArray[2]) / 2) && checkIfEmpty((botMoveArray[1] + botMoveArray[2]) / 2)) { // check if field between second and third move is free -> game over
                        placeSymbolAtIndex(icon, (botMoveArray[1] + botMoveArray[2]) / 2);
                        console.log("placed finishing move on " + (botMoveArray[1] + botMoveArray[2]) / 2);
                        gameOver("win");

                    } else if (checkIfEmpty(12 - (botMoveArray[2] + botMoveArray[0]))) { // check if field following first and third move is free -> game over
                        console.log("about to win.. targeting index " + (12 - (botMoveArray[2] + botMoveArray[0])));
                        placeSymbolAtIndex(icon, 12 - (botMoveArray[2] + botMoveArray[0]));
                        gameOver("win");
                    }

                    else {
                        /* at this point, only two sides and a corner are still available. Play to one of the sides to still have a chance to win*/
                        for (let i = 1; i < 9; i+= 2) {
                            if (checkIfEmpty(i)) {
                                placeSymbolAtIndex(icon, i);
                                botMoveArray.push(i);
                                break;
                            }
                        }
                    }
                    break;

                case 8:
                    // check if in match point position
                    if (checkIfEmpty(12 - (botMoveArray[0] + botMoveArray[3]))) {
                        placeSymbolAtIndex(icon, 12 - (botMoveArray[0] + botMoveArray[3]));
                        gameOver("win");
                    }
                    else {
                        // it's going to be a tie.
                        for (let i = 0; i < 9; i += 2) {
                            if (checkIfEmpty(i)) {
                                placeSymbolAtIndex(icon, i);
                                botMoveArray.push(i);
                                gameOver("tie");
                                break;
                            }
                        }
                    }
            }
        } else {
            let icon = "o-icon";
            switch (moveRound) {
                case 1:
                    if (playerMoveArray[0] === 4) {
                        // chose a random corner to play in
                        let cornerPosition = corners[Math.floor(Math.random() * corners.length)];
                        placeSymbolAtIndex(icon, cornerPosition);
                        botMoveArray.push(cornerPosition);
                    }
                    else {
                        placeSymbolAtIndex(icon, 4);
                        botMoveArray.push(4);
                    }
            }
        }
        // toggleTilt(true);
        playerTurn = true;
        moveRound++;
    }

    function isInt(num) {
        return num % 1 === 0;
    }

    function checkIfEmpty(index) {
        // check if box element corresponding to index has a symbol in it
        if (boxes[index].children.length === 0) {
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

    function gameOver(type) {
        if (type === "win") console.log("bot wins");
        else console.log("it's a tie");
    }

    // TODO: landing page screen
});