
document.addEventListener("DOMContentLoaded", function () {
    console.log("hey");
    var tilt = require("vanilla-tilt");

    tilt.init(document.querySelectorAll(".tilt"), {
        max: 25, // tilt angle
        speed: 60, // reaction speed
        scale: 1.15
    })
});