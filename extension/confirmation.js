var confettiElement = document.getElementById('confetti-holder');
var confettiSettings = { 
    target: confettiElement,
    max: 80,
    animate: true,
    props: [
        'circle', 
        'square', 
        'triangle',
        'line', 
        { "type": "svg", "size": 25, "weight": 0.4, "src": "./images/anteater-svgrepo-com_1.svg" },
        { "type": "svg", "size": 35, "weight": 0.4, "src": "./images/anteater-svgrepo-com.svg" },
        { "type": "svg", "size": 25, "weight": 0.4, "src": "./images/boba.svg" },
        { "type": "svg", "size": 25, "weight": 0.3, "src": "./images/boba_outline.svg" }

    ],
    colors: [[165,104,246],[230,61,135],[0,199,228],[253,214,126]],
    clock: 20,
    rotate: true
};
var confetti = new ConfettiGenerator(confettiSettings);
confetti.render();

const logOut = document.getElementById("logout-btn")
const myStorage = window.localStorage

logOut.addEventListener('click', (e) => {
    console.log("hello")
    e.preventDefault()
    myStorage.clear()
    window.location.href = "./options.html"
})