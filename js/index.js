
document.addEventListener("DOMContentLoaded", function () {
    console.log("hey");
    const tilt = require("vanilla-tilt"); // importing tiltJS

    tilt.init(document.querySelectorAll(".tilt"), { // create tilt elements
        max: 25, // tilt angle
        speed: 60, // reaction speed
        scale: 1.15
    });

    let playerIsX = true;
    let playerTurn = true;

    let boxes = document.querySelectorAll(".row-box");
    Array.prototype.forEach.call(boxes, function(el, i) {
        el.addEventListener("click", function () {
            if (el.children.length === 0) {
                let symbol = document.createElement("div");
                if (playerIsX) {
                    symbol.setAttribute("class", "x-icon");
                    el.appendChild(symbol);
                    playerIsX = false;
                } else {
                    symbol.setAttribute("class", "o-icon");
                    el.appendChild(symbol);
                    playerIsX = true;
                }
            }
        });
    });

    // landing page screen

});