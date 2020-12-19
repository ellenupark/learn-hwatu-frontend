const gameForm = document.getElementById("form")
const formName = document.getElementById("username")
const playerURL = "http://localhost:3000/players"
const welcomeDiv = document.getElementById("welcome")
const mainGameDiv = document.getElementById('main-game')
const navBar = document.getElementById('nav-bar')
const gameURL = "http://localhost:3000/games"
let game;

document.addEventListener("DOMContentLoaded", function() {
    prepareGame();
});

async function prepareGame() {

    await API.createNewGame();
    await API.createPlayers();
    await API.assignCards();
    Card.displayAllCards();
    addEventListenerToNameSubmit();


//   await API.loadPlayers();
//   await Card.dealCards();
//   Card.loadCardsToSummary();
//   document.getElementById('welcome-div').classList.remove('hidden');
//   loadGame();
};

function addEventListenerToNameSubmit() {
    gameForm.addEventListener("submit", function(event) {
        event.preventDefault();
    
        const formResults = getInfo();
        let url = `http://localhost:3000/games/${game.id}` ;
    
        let options = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
          },
          body: JSON.stringify(formResults)
        };
    
        fetch(url, options)
          .then(resp => resp.json())
          .then(newGame => {
            if (!newGame.errors) {
              game.name = newGame.data.attributes.name;
              Game.prepareUserTurn();
              gameForm.reset();
            } else {
              throw new Error( `${newGame.errors}`)
            }
          })
          .then(data => revealBoard())
          .catch(alert);
    });
};

function getInfo() {
    return {
      name: formName.value,
    };
};

function revealBoard() {
    const welcomeDiv = document.getElementById("welcome");
    const mainGameDiv = document.getElementById('main-game');
    const navBar = document.getElementById('nav-bar');

    document.getElementById('player-pairs').innerText = `${game.name}'s Sets`;
    welcomeDiv.classList.add("hidden")
    mainGameDiv.classList.remove('hidden')
    navBar.classList.remove('hidden')
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