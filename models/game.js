const boardContainer = document.getElementById('board-container');
const deckContainer = document.getElementById('deck-container');
const userContainer = document.getElementById('user-container');
const computerContainer = document.getElementById('computer-container');
const userPairs = document.getElementById('user-pairs');
const computerPairs = document.getElementById('computer-pairs');
const playedCardDiv = document.getElementById('played-container');
const notice = document.getElementById('instruction-display');
let next = false;

class Game {
    constructor(name, id) {
        this.players = [];
        this.turnCount = 0;
        this.name = name;
        this.points = 0;
        this.id = id;
        game = this;
    };

    get computer() {
        return this.players.find(player => player.role === "computer")
    };

    get user() {
        return this.players.find(player => player.role === "user")
    };

    get board() {
        return this.players.find(player => player.role === "board")
    };

    get deck() {
        return this.players.find(player => player.role === "deck")
    };

    get currentPlayer() {
        if (this.turnCount % 2 === 0) {
            return this.computer;
        } else {
            return this.user;
        }
    };

    static prepareUserTurn() {
        game.turnCount += 1;
        Game.displayCurrentPlayer();
        let userCards = userContainer.children;
        
        for (let i = 0; i < userCards.length; i++) {
            userCards[i].addEventListener('click', Game.playTurn)
        }
    }

    static async playTurn() {
        if (game.currentPlayer.role === 'user') {
            const playedCard = await Game.moveCardToBoard();
        }
        const boardPairs = await Game.findBoardPairs();

        let flippedCard;
        switch (boardPairs.length) {
            case 0:
                flippedCard = await Game.flipCardFromDeck();
                break;
            case 1:
                boardPairs[0].classList.add('highlight', 'set');
                flippedCard = await Game.flipCardFromDeck();
                break;
            case 2:
                if (game.currentPlayer.role === 'user') {
                    boardPairs.forEach(card => card.classList.add('highlight'));
                    Game.displayPickCardInstructions();
                    let finalPickedCard = await Game.pickCardToPair();
                    let canContinue = await Game.awaitUserInput()
                    flippedCard = await Game.flipCardFromDeck();
                    break;
                } else {
                    let matchingCardMonth = sample(boardPairs);
                    matchingCardMonth.classList.add('highlight', 'set');
                    flippedCard = await Game.flipCardFromDeck();
                    break;
                }
            case 3:
                boardPairs.forEach(card => card.classList.add('highlight', 'set'));
                flippedCard = await Game.flipCardFromDeck();
                break;
        };

        const finalPairsOnBoard = await Game.checkBoardForPairedSets()
        await timeout(1000);
        const finalSets = await Game.findSets(finalPairsOnBoard)
        
        Game.playNextTurn();
    };

    static playNextTurn() {
        if (game.currentPlayer.role === 'user' && computerContainer.childElementCount !== 0) {
            Game.playComputerTurn();
        } else if (game.currentPlayer.role === 'user' && computerContainer.childElementCount === 0) {
            Game.playTurnWithoutCards();
        } else if (game.currentPlayer.role === 'computer' && userContainer.childElementCount !== 0) {
            Game.prepareUserTurn();
        } else {
            Game.playTurnWithoutCards();
        }
    };

    static async playTurnWithoutCards() {
        game.turnCount += 1;
        
        if (game.turnCount === 23) {
            Game.displayWinner();
        } else {
            Game.displayCurrentPlayer();
            const flippedCard = await Game.flipCardFromDeck(); 
            const finalPairsOnBoard = await Game.checkBoardForPairedSets()

            await timeout(1000);
            
            const finalSets = await Game.findSets(finalPairsOnBoard)
            Game.playNextTurn();
        }
    };

    // End Game
    static async displayWinner() {
        const winner = await Game.calculateWinner();
        game.points = winner.total;
        await API.updateGamePointTotal();

        const parentDiv = document.getElementById('winner');
        const displayName = document.getElementById('game-winner');

        // Render who won
        winner.player === game.user ? displayName.innerText = `You Won!` : displayName.innerText = 'You Lost! Better Luck Next Time!';
        
        // Render users points
        parentDiv.innerHTML += Game.renderUserPointTotal(winner);
        winner.player === game.user ? parentDiv.classList.add('winner-user') : parentDiv.classList.add('winner-computer');

        // Render game history
        await Game.renderGameHistory();

        // Add event listeners to buttons
        const playAgainButton = document.getElementById('play-again')
        const exitButton = document.getElementById('exit')

        // Hide game board and reveal winner display
        document.getElementById('main-game').classList.add('hidden')
        parentDiv.classList.remove('hidden')

        playAgainButton.addEventListener('click', Game.resetGame)
        exitButton.addEventListener('click', Game.exitGame)

        document.getElementById('welcome-div').classList.remove('hidden');
    };

    static async calculateWinner() {
        let winner;
        let userCards =  Player.retrieveAllMatchedCardsFor(game.user)
        let computerCards = Player.retrieveAllMatchedCardsFor(game.computer)

        let userPoints = {
            player: game.user,
            bright: 0,
            animal: 0,
            ribbon: 0,
            junk: 0,
            total: 0
        };

        let computerPoints = {
            player: game.computer,
            bright: 0,
            animal: 0,
            ribbon: 0,
            junk: 0,
            total: 0
        };

        userPoints.bright += Game.calculateBrightCardPoints(userCards);
        userPoints.animal += Game.calculateAnimalCardPoints(userCards);
        userPoints.ribbon += Game.calculateRibbonCardPoints(userCards);
        userPoints.junk += Game.calculateJunkCardPoints(userCards);
        userPoints.total += userPoints.bright + userPoints.animal + userPoints.ribbon + userPoints.junk;

        computerPoints.bright += Game.calculateBrightCardPoints(computerCards);
        computerPoints.animal += Game.calculateAnimalCardPoints(computerCards);
        computerPoints.ribbon += Game.calculateRibbonCardPoints(computerCards);
        computerPoints.junk += Game.calculateJunkCardPoints(computerCards);
        computerPoints.total += computerPoints.bright + computerPoints.animal + computerPoints.ribbon + computerPoints.junk;
        
        userPoints.total > computerPoints.total ? winner = userPoints : winner = computerPoints;
        return winner;
    }

    // Begin Computer Turn
    static async playComputerTurn() {
        game.turnCount += 1;
        Game.displayCurrentPlayer(); 

        await timeout(1000);

        const possibleBoardPairs = await Game.findPossibleComputerPairs();
        const playedCard = await Game.pickComputerCardToPlay(possibleBoardPairs);
        Game.playTurn();
    }

    // Collect all cards that form pairs with computers hand
    static async findPossibleComputerPairs() {
        const allCards = [...Array.from(computerContainer.children), ...Array.from(boardContainer.children)];

        let pairs = {}

        for (let i = 0; i < allCards.length; i++) {
            pairs[allCards[i].dataset.month] ||= [];
            pairs[allCards[i].dataset.month].push(allCards[i])
        }
        return pairs;
    }

    static async pickComputerCardToPlay(pairs) {
        const computerCards = Array.from(computerContainer.children);
        const months = Object.keys(pairs);

        let cardToPlay = await Game.findCardToPlay(computerCards, months, pairs);
        let playedCard = await Game.playComputerCard(cardToPlay);

        return playedCard;
    }

    static async findCardToPlay (cards, months, pairs) {
        let cardToPlay;

        await asyncForEach(cards, async (card) => {
            if (months.includes(card.dataset.month) && pairs[card.dataset.month].length === 3) {
                cardToPlay = cardToPlay || card;
            } else if (months.includes(card.dataset.month) && pairs[card.dataset.month].length === 2) {
                
                cardToPlay = cardToPlay || card;
            } else if (card == cards[cards.length - 1] && playedCardDiv.childElementCount === 0) {
                
                cardToPlay = cardToPlay || card;
            }
        });
        return cardToPlay;
    }

    static async playComputerCard(card) {
        let playedCard = document.createElement('img');

        playedCard.setAttribute('src', `${card.dataset.url}`)
        playedCard.dataset.month = card.dataset.month;
        playedCard.dataset.category = card.dataset.category;
        playedCard.classList.add('played-card');
        playedCard.id = card.id;

        await timeout(1000);
        card.remove();
        playedCardDiv.appendChild(playedCard)
        
        return playedCard;
    };

    // Allow User to Select Card and Move Card to Board
    static async moveCardToBoard() {
        let playedCard = event.target;
        Player.moveCardToNewPlayer(playedCard, game.currentPlayer, game.board)
        let playedCardHtml = Card.renderCardHtml(playedCard);
        
        playedCard.remove();
        playedCardDiv.appendChild(playedCardHtml);

        let userCards = document.getElementById('user-container').children;
        for (let i = 0; i < userCards.length; i++) {
            userCards[i].removeEventListener('click', Game.playTurn)
        }
        return playedCardHtml;
    }

    // Find and Highlight any Pairs on the Board (Before Card Flip)
    static async findBoardPairs() {
        const playedCard = document.getElementsByClassName('played-card')[0];
        const playedCardMonth = playedCard.dataset.month;

        let cardsOnBoard = Array.from(boardContainer.children);
        let matchedCards = cardsOnBoard.filter(card => card.dataset.month === playedCardMonth);
        
        return matchedCards;
    };

        // Assigns "Select Card on Board to Pair With" event to all highlighted cards
        static async pickCardToPair() {
            let cardsOnBoard = Array.from(boardContainer.children);
            let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));
            
            pairs.forEach(function(card) {
                card.addEventListener('click', () => {
                    Game.selectCardToPairWith()
                    .then(resp => next = true)
                });
            });
            return pairs;
        };
    
        // Removes all highlights from cards and returns user selected card
        static async selectCardToPairWith() {
            const selectedCard = event.target
            const instructionNotice = document.getElementById('instruction-display');
            instructionNotice.innerHTML = "";
    
            let cardsOnBoard = Array.from(document.getElementById('board-container').children);
            let pairs = cardsOnBoard.filter(c => c.classList.contains('highlight'));
    
            pairs.forEach(function(card) {
                if (card !== selectedCard) {
                    card.classList.remove('highlight');
                }
            })
    
            selectedCard.classList.add('set')
            selectedCard.removeEventListener('click', Game.selectCardToPairWith)
            return selectedCard;
        };    

    // Flip Card From Deck
    static async flipCardFromDeck() {
        const topCardOfDeck = await Card.fetchRandomCardFromDeck();
        Player.moveCardToNewPlayer(topCardOfDeck, game.deck, game.board);

        if (game.currentPlayer === game.user) {
            Game.displayFlipCardFromDeckInstructions();
            document.getElementById('card-deck').classList.add('highlight-deck');
            document.getElementById('card-deck').addEventListener('click', Game.userFlipCardFromDeck);
            document.getElementsByClassName('flip-notice')[0].addEventListener('click', Game.userFlipCardFromDeck);
            await Game.awaitUserInput();
        } else {
            await timeout(1000);
        }

        const renderFlippedCard =  topCardOfDeck.renderCardBelongingTo(game.board)
        
        if (game.turnCount === 22) {
            deckContainer.firstElementChild.remove();
        };
        return renderFlippedCard;
    };

    // Handles User Flip Card Event 
    static userFlipCardFromDeck() {
        document.getElementsByClassName('flip-notice')[0].removeEventListener('click', Game.userFlipCardFromDeck); // Remove event listener from display
        document.getElementById('card-deck').removeEventListener('click', Game.userFlipCardFromDeck); // Remove event listener from deck img
        document.getElementById('card-deck').classList.remove('highlight-deck');
        const notice = document.getElementById('instruction-display');
        notice.innerHTML = "";
        next = true;
    };

    // Checks board for any paired sets after card flip and returns list of pairs
    static async checkBoardForPairedSets() {
        let cards = Game.retrieveAllCardsInPlay();
        let pairs = {};

        for (let i = 0; i < cards.length; i++) {
            pairs[cards[i].dataset.month] ||= [];
            pairs[cards[i].dataset.month].push(cards[i])
        }
       return pairs;
    };

    // Processes paired sets based on returned value from checkBoardForPairedSets()
    static async findSets(pairs) {
        let playedCard = playedCardDiv.firstElementChild
        let flippedCard = boardContainer.lastElementChild;
        const months = Object.keys(pairs);

        await asyncForEach(months, async (month) => {
            // If played card does not match any other cards on board
            if (pairs[month].length === 1 && pairs[month].includes(playedCard)) {
            
                let playedCardMovedToBoard = await Game.movePlayedCardToBoard();
            } else if (pairs[month].length === 2) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(flippedCard)) {   
                    pairs[month].forEach(c => c.classList.remove('highlight'));
                    let collectedCards = await Game.collectPairsFromBoard(pairs[month]);
                }
            } else if (pairs[month].length === 3 && pairs[month].includes(playedCard)) {
                if (flippedCard.dataset.month == playedCard.dataset.month) {
                    pairs[month].forEach(c => c.classList.remove('highlight', 'set'));
                    let playedCardMovedToBoard = await Game.movePlayedCardToBoard();
                } else {
                    let chosenPair = pairs[month].filter(c => c.classList.contains('set') || c == playedCard);
                    chosenPair.forEach(c => c.classList.remove('highlight', 'set'));
                    
                    let collectedCards = await Game.collectPairsFromBoard(chosenPair);
                }
            } else if (pairs[month].length === 4) {
                if (pairs[month].includes(playedCard) || pairs[month].includes(flippedCard)) {
                    pairs[month].forEach(c => c.classList.remove('highlight'));
                    let collectedCards = await Game.collectPairsFromBoard(pairs[month]);
                }
            };

        });
        return pairs;
    };

    // When played card does not make any pairs on board, move played card to board div
    static async movePlayedCardToBoard() {
        let playedCard = playedCardDiv.firstElementChild
        let playedCardData = Card.retrieveCardDataFrom(playedCard)
        Player.moveCardToNewPlayer(playedCardData, game.currentPlayer, game.board)
        playedCard.remove();
        playedCardData.renderCardBelongingTo(game.board);
        return playedCard;
    };

    // Collect any pairs made on board (end of turn)
    static async collectPairsFromBoard(cards) {
        let updatedCards = [];

        await asyncForEach(cards, async (card) => {
            let updatedCard = await Game.addToCollectedSets(card);
            updatedCards.push(updatedCard);
        })
        
        return updatedCards;
    }

    // Move paired cards to current player sets div, update player detail to current player
    static async addToCollectedSets(cardHtml) {
        let previousCardOwner = Player.retrievePlayerData(cardHtml);
        let cardData = Card.retrieveCardDataFrom(cardHtml);

        Player.moveCardToNewPlayer(cardData, previousCardOwner, game.currentPlayer)
        cardData.matched === true;

        await Game.displayCardInPairsDiv(cardHtml, cardData);
        return cardData;
    };

    // Render collected card to sets div
    static async displayCardInPairsDiv(oldCard, card) {
        oldCard.remove()
        card.renderCardToCollectedSets(game.currentPlayer)
        return card;
    }

    // Current Player Display Window
    static displayCurrentPlayer() {
        const notice = document.getElementById('current-player-display');
        if (game.currentPlayer === game.user) {
            notice.innerHTML = `
                <div class="current-player-notice" id="current-user">
                    <h5>Your Turn</h5>
                </div>
            `
        } else {
            notice.innerHTML = `
                <div class="current-player-notice" id="current-computer">
                    <h5>Opponent's Turn</h5>
                </div>
            `
        };
    };

    // Display Flip Card Instructions
    static displayFlipCardFromDeckInstructions() {
        notice.innerHTML += `
        <div class="flip-notice">
            <h5>Flip Card</h5>
        </div>
        `
    };

    // Display Pick Card Instructions
    static async displayPickCardInstructions() {
        const instructionNotice = document.getElementById('instruction-display');
        instructionNotice.innerHTML += `
        <div class="rule-notice">
            <h5>Select Card to Pair With</h5>
        </div>
        `
        return notice;
    };

    // Retrieve all cards in play (board and played card div)
    static retrieveAllCardsInPlay() {
        let cards = [];
        let playedCard = document.getElementsByClassName('played-card')[0];
        let boardCards = boardContainer.children;

        if (playedCard) {
            cards.push(playedCard);
            for (let i = 0; i < boardCards.length; i++) {
                cards.push(boardCards[i])
            };
            return cards;
        } else {
            return boardCards;
        };
    };

    // Wait for user input
    static async awaitUserInput() {
        const timeout = async ms => new Promise(res => setTimeout(res, ms));

        while (next === false) await timeout(50); // pauses script
        next = false; // reset var
    };

    // End Game Scoring
    static calculateBrightCardPoints(cards) {
        let points = 0;
        let brightCards = cards.filter(card => card.category === "bright")

        switch (brightCards.length) {
            case 5:
                points += 15;
                break;
            case 4:
                points += 4;
                break;
            case 3:
                brightCards.some(card => card.month === 'December') ? points += 2 : points += 3;
                break;
        }
        return points;
    }

    static calculateAnimalCardPoints(cards) {
        let points = 0;
        let animalCards = cards.filter(card => card.category === "animal")

        if (animalCards.length > 5) {
            points += 5;
            let additionalPoints = animalCards.length - 5;
            points += additionalPoints;
        } else if (animalCards.length === 5) {
            points += 1;
        }

        if (animalCards.some(card => card.month === "February") && animalCards.some(card => card.month === "April") && animalCards.some(card => card.month === "August")) {
            points += 5;
        }

        return points;
    }

    static calculateRibbonCardPoints(cards) {
        let points = 0;
        let ribbonCards = cards.filter(card => card.category === "ribbon")

        if (ribbonCards.length > 5) {
            points += 1;
            let additionalPoints = ribbonCards.length - 5;
            points += additionalPoints;
        } else if (ribbonCards.length === 5) {
            points += 1;
        }

        if (ribbonCards.some(card => card.month === "January") && ribbonCards.some(card => card.month === "February") && ribbonCards.some(card => card.month === "March")) {
            points += 3;
        }

        if (ribbonCards.some(card => card.month === "June") && ribbonCards.some(card => card.month === "September") && ribbonCards.some(card => card.month === "October")) {
            points += 3;
        }

        if (ribbonCards.some(card => card.month === "April") && ribbonCards.some(card => card.month === "May") && ribbonCards.some(card => card.month === "June")) {
            points += 3;
        }
        return points;
    }

    static calculateJunkCardPoints(cards) {
        let points = 0;
        let junkCards = cards.filter(card => card.category === "junk")

        if (junkCards.length > 10) {
            points += 1;
            let additionalPoints = junkCards.length - 10;
            points += additionalPoints;
        } else if (junkCards.length === 10) {
            points += 1;
        }
        return points;
    }
}