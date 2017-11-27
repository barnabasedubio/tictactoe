
document.addEventListener("DOMContentLoaded", function () {
    console.log("hey");
    $(".tilt").tilt({
        speed: 60,
        scale: 1.15,
        perspective: 500,
        glare: false,
    });
});