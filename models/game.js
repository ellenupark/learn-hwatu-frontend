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

    static play() {

    }
}