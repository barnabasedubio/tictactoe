
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

    let heading = document.getElementById("heading_text");

    let playerBegins = false;
    let gameIsOver = false;
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
        // console.log(++i);
        clearBoard();
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
                        let counterPosition;
                        let move1 = playerMoveArray[0];
                        let move2 = playerMoveArray[1];

                        // all cases where players first move was to a corner and the second move was to a side
                        if ((move1 === 6 && (move2 === 3 || move2 === 5)) ||
                            (move1 === 2 && (move2 === 1 || move2 === 7))) counterPosition = 0;

                        if ((move1 === 8 && (move2 === 3 || move2 === 5)) ||
                            (move1 === 0 && (move2 === 1 || move2 === 7))) counterPosition = 2;

                        if ((move1 === 0 && (move2 === 3 || move2 === 5)) ||
                            (move1 === 8 && (move2 === 1 || move2 === 7))) counterPosition = 6;

                        if ((move1 === 2 && (move2 === 3 || move2 === 5)) ||
                            (move1 === 6 && (move2 === 1 || move2 === 7))) counterPosition = 8;

                        placeSymbolAtIndex(icon, counterPosition);
                        botMoveArray.push(counterPosition);

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
        } else { // player begins match

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
                    break;

                case 3:
                    if (playerMoveArray[0] === 4) { // player's first move was to the center
                        if (playerMoveArray[1] % 2 === 1) {
                            // player plays to an edge. Every position is a match point for the player -> countering might put you in a match point
                            let position = 3*playerMoveArray[0] - (playerMoveArray[0] + playerMoveArray[1]);
                            placeSymbolAtIndex(icon, position);
                            botMoveArray.push(position);

                        } else {
                            // player plays to a corner.
                            if (playerMoveArray[1] === 12 - (botMoveArray[0] + playerMoveArray[0])) {
                                // player plays to the least harmful corner. You can be aggressive and enter a match point.
                                let targetPosition;
                                if (botMoveArray[0] === 2) targetPosition = 0;
                                if (botMoveArray[0] === 8) targetPosition = 2;
                                if (botMoveArray[0] === 0) targetPosition = 6;
                                if (botMoveArray[0] === 6) targetPosition = 8;

                                placeSymbolAtIndex(icon, targetPosition);
                                botMoveArray.push(targetPosition)

                            } else {
                                // diagonal match point for the player. countering it will put you in a match point.
                                placeSymbolAtIndex(icon, 12 - (playerMoveArray[0] + playerMoveArray[1]));
                                botMoveArray.push(12 - (playerMoveArray[0] + playerMoveArray[1]));
                            }
                        }

                    } else if (playerMoveArray[0] % 2 === 0) { // player's first move was diagonal
                        if (playerMoveArray[1] === 12 - (playerMoveArray[0] + botMoveArray[0])) {

                            for (let i = 1; i < 9; i += 2) {
                                if (checkIfEmpty(i)) {
                                    placeSymbolAtIndex(icon, i);
                                    botMoveArray.push(i);
                                    break;
                                }
                            }
                        }
                        else if (playerMoveArray[1] % 2 === 0) {
                            // player on two adjacent diagonals, in match point position -> counter
                            let counterPosition = (playerMoveArray[0] + playerMoveArray[1]) / 2;
                            placeSymbolAtIndex(icon, counterPosition);
                            botMoveArray.push(counterPosition);
                        }
                        else {
                            // player plays to an edge
                            let counterPosition;
                            let move1 = playerMoveArray[0];
                            let move2 = playerMoveArray[1];

                            // all cases where players first move was to a corner and the second move was to a side
                            if ((move1 === 6 || move1 === 2) && (move2 === 1 || move2 === 3)) counterPosition = 0;
                            if ((move1 === 8 || move1 === 0) && (move2 === 1 || move2 === 5)) counterPosition = 2;
                            if ((move1 === 8 || move1 === 0) && (move2 === 3 || move2 === 7)) counterPosition = 6;
                            if ((move1 === 2 || move1 === 6) && (move2 === 5 || move2 === 7)) counterPosition = 8;
                            placeSymbolAtIndex(icon, counterPosition);
                            botMoveArray.push(counterPosition);
                        }

                    } else { // player's first move was an edge
                        if (playerMoveArray[1] === 12 - (playerMoveArray[0] + botMoveArray[0])) {
                            // X--O--X straight position -> bot wins by playing any one of the remaining sides
                            for (let i = 1; i < 9; i += 2) {
                                if (checkIfEmpty(i)) {
                                    placeSymbolAtIndex(icon, i);
                                    botMoveArray.push(i);
                                    break;
                                }
                            }
                        } else if (playerMoveArray[1] % 2 === 0) {  // all counters to player playing it in a diagonal field

                            let counterPosition;
                            let move1 = playerMoveArray[0];
                            let move2 = playerMoveArray[1];

                            // all cases where players first move was to a side and the second move was to a corner
                            if ((move1 === 1 || move1 === 3) && (move2 === 6 || move2 === 2)) counterPosition = 0;
                            if ((move1 === 1 || move1 === 5) && (move2 === 0 || move2 === 8)) counterPosition = 2;
                            if ((move1 === 7 || move1 === 3) && (move2 === 0 || move2 === 8)) counterPosition = 6;
                            if ((move1 === 7 || move1 === 5) && (move2 === 6 || move2 === 2)) counterPosition = 8;
                            placeSymbolAtIndex(icon, counterPosition);
                            botMoveArray.push(counterPosition);

                        } else {
                            // player plays to one of the other sides -> place O in diagonal between the two Xs
                            let cornerCounterPosition = (playerMoveArray[0] + playerMoveArray[1]) - 4;
                            placeSymbolAtIndex(icon, cornerCounterPosition);
                            botMoveArray.push(cornerCounterPosition);
                        }
                    }
                    break;

                case 5:

                    // check if I can win the game
                    // can only win diagonally if you placed icon in the middle field
                    if (botMoveArray[0] === 4) {
                        if (checkIfEmpty(12 - (botMoveArray[0] + botMoveArray[1]))) {
                            placeSymbolAtIndex(icon, 12 - (botMoveArray[0] + botMoveArray[1]));
                            gameOver("win");
                            break;
                        }
                    // check if i can win by filling field between my other symbols
                    } else if (isInt((botMoveArray[0] + botMoveArray[1]) / 2)) {
                        if (checkIfEmpty((botMoveArray[0] + botMoveArray[1]) / 2)) {
                            placeSymbolAtIndex(icon, (botMoveArray[0] + botMoveArray[1]) / 2);
                            gameOver("win");
                            break;
                        }

                    } else {
                        // check if i can win by straight line in the field
                        let targetPosition = (botMoveArray[1] * 3 - (botMoveArray[0] + botMoveArray[1])) % 10;
                        console.log("potential winning index: " + targetPosition);
                        if (targetPosition >= 0 && checkIfEmpty(targetPosition)) {
                            placeSymbolAtIndex(icon, targetPosition);
                            gameOver("win");
                            break;
                        }
                    }

                    console.log("test");

                    // if player started in the middle
                    if (playerMoveArray[0] === 4) {
                        console.log("first move: center");
                        if (playerMoveArray[1] % 2 === 1) {  // 1. case: player went to the side afterwards, which means i countered it
                            if (playerMoveArray[2] === 12 - (playerMoveArray[0] + botMoveArray[0])) {
                                // 1.1: player played to far diagonal -> play to the corner where there is nothing in between my other corner symbol
                                let move1 = botMoveArray[0];
                                let move2 = botMoveArray[1];
                                let position;
                                if ((move1 === 6 && move2 === 5) || (move1 === 2 && move2 === 7)) position = 8;
                                if ((move1 === 0 && move2 === 7) || (move1 === 8 && move2 === 3)) position = 6;
                                if ((move1 === 8 && move2 === 1) || (move1 === 0 && move2 === 5)) position = 2;
                                if ((move1 === 6 && move2 === 1) || (move1 === 2 && move2 === 3)) position = 0;

                                placeSymbolAtIndex(icon, position);
                                botMoveArray.push(position);
                            }
                            else if (playerMoveArray[2] % 2 === 0) {
                                // 1.2: player played to close diagonal -> in a match point now -> counter
                                placeSymbolAtIndex(icon, 12 - (playerMoveArray[0] + playerMoveArray[2]));
                                botMoveArray.push(12 - (playerMoveArray[0] + playerMoveArray[2]));
                            }
                            else {
                                // 1.3: player played to the side again, now in match point -> counter
                                let position = 12 - (playerMoveArray[0] + playerMoveArray[2]);
                                placeSymbolAtIndex(icon, position);
                                botMoveArray.push(position);
                            }
                        } else if (playerMoveArray[1] === 12 - (playerMoveArray[0] + botMoveArray[0])) {
                            // 2. case: player went to "harmless" diagonal afterwards, which means i made aggressive move
                            // reaching this code means the player countered, which means player is in match position
                            placeSymbolAtIndex(icon, 12 - (playerMoveArray[0] + playerMoveArray[2]));
                            botMoveArray.push(12 - (playerMoveArray[0] + playerMoveArray[2]));
                        } else {
                            // 3. case: player went to a match point diagonal afterwards, which means i countered it (and thus put myself in a match point position)
                            // player countering my match point means he is in a match point with the recently placed symbol and his first one
                            placeSymbolAtIndex(icon, 12 - (playerMoveArray[0] + playerMoveArray[2]));
                            botMoveArray.push(12 - (playerMoveArray[0] + playerMoveArray[2]));
                        }

                    } else if (playerMoveArray[0] % 2 === 0) { // if player started diagonally
                        console.log("first move: diagonal");
                        if (playerMoveArray[1] % 2 === 0) {
                            console.log("second move: diagonal");
                            // every following diagonal move by the player resulted in a match point for me.
                            // reaching this code means the player countered it. However, player is only in a match point
                            // if they played their second symbol on the far diagonal.
                            if (playerMoveArray[1] === 12 - (playerMoveArray[0] + botMoveArray[0])) {
                                // match point for the player -> counter

                                // depending on where the bot plays the circle (since it's semi random) and the player counters,
                                // bot either re-counters with players 2 and 3rd move or first and third move

                                if (playerMoveArray[0] === 6 || playerMoveArray[0] === 8) {
                                    placeSymbolAtIndex(icon, 3 * playerMoveArray[2] - (playerMoveArray[0] + playerMoveArray[2]));
                                    botMoveArray.push(3 * playerMoveArray[2] - (playerMoveArray[0] + playerMoveArray[2]));

                                } else {
                                    placeSymbolAtIndex(icon, 3 * playerMoveArray[2] - (playerMoveArray[1] + playerMoveArray[2]));
                                    botMoveArray.push(3 * playerMoveArray[2] - (playerMoveArray[1] + playerMoveArray[2]));
                                }
                            } else {
                                // choose the nearest edge
                                for (let i = 1; i < 9; i += 2) {
                                    if (checkIfEmpty(i)) {
                                        placeSymbolAtIndex(icon, i);
                                        botMoveArray.push(i);
                                        break;
                                    }
                                }
                            }
                        }
                        else if (playerMoveArray[1] % 2 === 1) { // the next move was on an edge
                            console.log("second move: edge");
                            // no matter to what field the player played, I am in a match point position. Reaching this code
                            // means the player countered it. putting themselves in a match point between the first and the third
                            let position = (playerMoveArray[0] + playerMoveArray[2]) / 2;
                            placeSymbolAtIndex(icon, position);
                            botMoveArray.push(position);
                        }

                    } else { // player started from the side
                        console.log("first move: edge");
                        if (playerMoveArray[1] % 2 === 0) {  // case 1: second move is to diagonal field
                            // I would always be in match position if this happened. reaching this code means
                            // the player countered, putting themselves in a match point between the second and third move
                            let position = (playerMoveArray[1] + playerMoveArray[2]) / 2;
                            placeSymbolAtIndex(icon, position);
                            botMoveArray.push(position);
                        }
                        // case 2: second move is to opposite edge field (player lost when doing this). Reaching this code
                        // means they countered, trying (and failing) to prevent the inevitable...
                        else if (playerMoveArray[1] === 12 - (playerMoveArray[0] + botMoveArray[0])) {
                            if (playerMoveArray[2] === 5) {
                                placeSymbolAtIndex(icon, 6);
                                botMoveArray.push(6);
                            }
                            if (playerMoveArray[2] === 7) {
                                placeSymbolAtIndex(icon, 0);
                                botMoveArray.push(0);
                            }
                        } else {
                            // case 3: second move is to adjacent edge field. choose any of the remaining diagonals
                            for (let i = 0; i < 9; i += 2) {
                                if (checkIfEmpty(i)) {
                                    placeSymbolAtIndex(icon, i);
                                    botMoveArray.push(i);
                                    break;
                                }
                            }
                        }
                    }

                    break;

                case 7: // last move the bot is going to make (phew)

                    // 1. check for all possible options if players first move was to the side
                    if (playerMoveArray[0] % 2 === 1) {
                        let position = 12 - (botMoveArray[0] + botMoveArray[2]);
                        console.log("position: " + position);
                        if ( position >= 0 && position < 9 && checkIfEmpty(position)) {
                            placeSymbolAtIndex(icon, position);
                            gameOver("win");
                            break;
                        }
                        position = 3 * botMoveArray[1] - (botMoveArray[1] + botMoveArray[2]);
                        console.log("position: " + position);
                        if (position !== 1 && position >= 0 && position < 9 && checkIfEmpty(position)) {
                            // position !== 1 because of some fucking edge case >.<
                            placeSymbolAtIndex(icon, position);
                            gameOver("win");
                            break;
                        }
                        if (playerMoveArray[1] % 2 === 0 && playerMoveArray[2] % 2 === 0) {
                            if (playerMoveArray[3] % 2 === 1) {
                                // place in last remaining corner
                                for (let i = 0; i < 9; i += 2) {
                                    if (checkIfEmpty(i)) {
                                        placeSymbolAtIndex(icon, i);
                                        botMoveArray.push(i);
                                        break;
                                    }
                                }
                            } else {
                                // last match point for the placer -> counter
                                let position = (playerMoveArray[2] + playerMoveArray[3]) / 2;
                                placeSymbolAtIndex(icon, position);
                                botMoveArray.push(position);
                            }
                        }
                        else if (playerMoveArray[1] % 2 === 1 && playerMoveArray[2] % 2 === 0) { // side -> side -> corner
                            // reaching this code means player countered my match point, puting themselves in a match point
                            // between 3 and 4th move
                            let position = (playerMoveArray[2] + playerMoveArray[3]) / 2;
                            placeSymbolAtIndex(icon, position);
                            botMoveArray.push(position);
                        }

                    } else if (playerMoveArray[0] % 2 === 0 && playerMoveArray[0] !== 4) { // all possible situations where players first move was diagonal

                        if (playerMoveArray[1] % 2 === 0 && playerMoveArray[1] !== 12 - (playerMoveArray[0] + botMoveArray[0])) {
                            // if player does not play second diagonal to the far corner, reaching this code means that bot is in
                            // match position between first and third move. If player countered, they are in a match position

                            let position = 12 - (botMoveArray[0] + botMoveArray[2]);
                            if (checkIfEmpty(position)) {
                                placeSymbolAtIndex(icon, position);
                                gameOver("win");
                            } else {
                                // bottom right player match point: 1st -> 4th ->
                                // bottom left, bottom right player match point: 2nd -> 4th ->
                                // bottom left, top left player match point: 1st -> 4th
                                // top left: 2nd -> 4th
                                // top right, top-left: 1st -> 4th
                                // top right, bottom right: 2nd -> 4th

                                let position1, position2;
                                position2 = playerMoveArray[3];
                                if (playerMoveArray[0] === 8 || (playerMoveArray[0] === 6 && playerMoveArray[1] === 0) ||
                                    (playerMoveArray[0] === 2 && playerMoveArray[1] === 0)) position1 = playerMoveArray[0];

                                if (playerMoveArray[0] === 0 || (playerMoveArray[0] === 2 && playerMoveArray[1] === 8) ||
                                    (playerMoveArray[0] === 6 && playerMoveArray[1] === 8)) position1 = playerMoveArray[1];

                                let counterPosition = 3 * position2 - (position1 + position2);
                                placeSymbolAtIndex(icon, counterPosition);
                                botMoveArray.push(counterPosition);

                            }

                        } else if (playerMoveArray[1] % 2 === 0) {
                            // player played to opposite diagonal. I am currently in a match position
                            let position = 12 - (botMoveArray[0] + botMoveArray[2]);
                            if (checkIfEmpty(position)) {
                                placeSymbolAtIndex(icon, position);
                                gameOver("win");
                            } else {
                                // player currently is in match position now after they countered my match position

                                // player started bottom left -> place counter in between first and fourth
                                // player started bottom right -> place counter in between first and fourth
                                // player started top left -> place counter in between second and fourth
                                // player started top right -> place counter in between second and forth

                                let position1, position2;
                                position2 = playerMoveArray[3];
                                if (playerMoveArray[0] === 6 || playerMoveArray[0] === 8) position1 = playerMoveArray[0];
                                if (playerMoveArray[0] === 0 || playerMoveArray[0] === 2) position1 = playerMoveArray[1];

                                let counterPosition = (position1 + position2) / 2;
                                placeSymbolAtIndex(icon, counterPosition);
                                botMoveArray.push(counterPosition);
                            }
                        } else if (playerMoveArray[1] % 2 === 1) {
                            // player played to an edge.
                            // if player played to an adjacent edge, reaching this code means bot is in match position
                            // (3rd -> 1st -> _) countering this won't put the player in match position, so just choose the nearest corner.
                            if ((playerMoveArray[0] === 0 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 3)) ||
                                (playerMoveArray[0] === 2 && (playerMoveArray[1] === 1 || playerMoveArray[1] === 5)) ||
                                (playerMoveArray[0] === 6 && (playerMoveArray[1] === 3 || playerMoveArray[1] === 7)) ||
                                (playerMoveArray[0] === 8 && (playerMoveArray[1] === 7 || playerMoveArray[1] === 5))) {

                                let targetPosition = 12 - (botMoveArray[0] + botMoveArray[2]);
                                if (checkIfEmpty(targetPosition)) {
                                    placeSymbolAtIndex(icon, targetPosition);
                                    gameOver("win");
                                } else {
                                    // choose nearest corner
                                    for (let i = 0; i < 9; i += 2) {
                                        if (checkIfEmpty(i)) {
                                            placeSymbolAtIndex(icon, i);
                                            botMoveArray.push(i);
                                            break;
                                        }
                                    }
                                }

                            } else {
                                // player played to far edge. Dangerous! bot can't win the game anymore
                                // if player plays edge, play corner. If player plays corner, they are in match position.
                                if (playerMoveArray[3] % 2 === 1) {
                                    // choose nearest corner
                                    for (let i = 0; i < 9; i += 2) {
                                        if (checkIfEmpty(i)) {
                                            placeSymbolAtIndex(icon, i);
                                            botMoveArray.push(i);
                                            break;
                                        }
                                    }
                                } else {
                                    // block the match position of the player (between third and fourth symbol)
                                    let counterPosition = (playerMoveArray[2] + playerMoveArray[3]) / 2;
                                    placeSymbolAtIndex(icon, counterPosition);
                                    botMoveArray.push(counterPosition);
                                }
                            }
                        }
                    }

                    else if (playerMoveArray[0] === 4) {
                        // the final stretch. The only way the player can win is through the middle
                        if (playerMoveArray[1] % 2 === 0) {
                            // player plays to a diagonal, really easy case, just choose any edge.
                            for (let i = 1; i < 9; i += 2) {
                                if (checkIfEmpty(i)) {
                                    placeSymbolAtIndex(icon, i);
                                    botMoveArray.push(i);
                                    break;
                                }
                            }
                        } else {
                            // check if you can win
                            let position = (botMoveArray[0] + botMoveArray[2]) / 2;
                            if (isInt(position) && checkIfEmpty(position)) {
                                placeSymbolAtIndex(icon, position);
                                gameOver("win");
                                break;
                            }

                            let position2 = 3 * botMoveArray[1] - (botMoveArray[1] + botMoveArray[2]);
                            if (position2 >= 0 && position2 < 9 && checkIfEmpty(position2)) {
                                placeSymbolAtIndex(icon, position2);
                                gameOver("win");
                                break;
                            }

                            let position3 = 3 * botMoveArray[2] - (botMoveArray[2] + botMoveArray[0]);
                            if (position3 >= 0 && position3 < 9 && checkIfEmpty(position3)) {
                                placeSymbolAtIndex(icon, position3);
                                gameOver("win");
                                break;
                            }

                            // just check if at this point there is any potential match point, and counter.
                            for (let i = 0; i < 9; i++) {
                                if (i === 4) continue;
                                if (gameStateArray[i] === "x") {
                                    console.log("Looking at index: " + i);
                                    if (checkIfEmpty(12 - (4 + i))) {
                                        placeSymbolAtIndex(icon, 12 - (4 + i));
                                        botMoveArray.push(12 - (4 + i));
                                    }
                                }
                            }
                        }
                    }
                    break;
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
        if (type === "win") {
            console.log("bot wins BOOYAH");
            heading.textContent = "Bot wins";
        }
        else {
            console.log("it's a tie");
            heading.textContent = "It's a tie";
        }
        gameIsOver = true;
    }

    // reset the game
    function clearBoard() {
        let xIcons = document.getElementsByClassName("x-icon");
        let oIcons = document.getElementsByClassName("o-icon");

        while (xIcons[0]) {
            xIcons[0].parentNode.removeChild(xIcons[0]);
        }
        while (oIcons[0]) {
            oIcons[0].parentNode.removeChild(oIcons[0]);
        }

        gameStateArray.fill(" ");
        playerMoveArray = [];
        botMoveArray = [];
        moveRound = 0;
        gameIsOver = false;

        if (!playerBegins) botTurn();

        heading.textContent = "TICTACTOE";
    }

    // TODO: landing page screen
});