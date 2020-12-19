const gameForm = document.getElementById("form")
const formName = document.getElementById("username")
const playerURL = "http://localhost:3000/players"
const welcomeDiv = document.getElementById("welcome")
const mainGameDiv = document.getElementById('main-game')
const navBar = document.getElementById('nav-bar')
const gameURL = "http://localhost:3000/games";
let game;

document.addEventListener("DOMContentLoaded", function() {
  prepareGame();
});

const prepareGame = async () => {

    await API.createNewGame();
    await API.createPlayers();
    await API.assignCards();

    
//   await API.loadPlayers();
//   await Card.dealCards();
//   Card.loadCardsToSummary();
//   document.getElementById('welcome-div').classList.remove('hidden');
//   loadGame();
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

function sample(array) {
    return array[Math.floor ( Math.random() * array.length )]
  }
  
  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }