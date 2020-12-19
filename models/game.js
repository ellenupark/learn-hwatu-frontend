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

    static async play() {
        game.turnCount += 1;
        Game.displayCurrentPlayer();

        let userCards = userContainer.children;
        
        for (let i = 0; i < userCards.length; i++) {
            userCards[i].addEventListener('click', Game.playTurn)
        }
        return this.turnCount;
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
}