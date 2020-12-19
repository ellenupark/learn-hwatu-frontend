class Player {
    constructor(id, role) {
        this.id = id;
        this.role = role;
        this.cards = [];
        game.players.push(this);
        // this.renderPlayer();
    };

    static checkPlayerForFullHand(player) {
        let full = false;

        switch (player.role) {
            case 'user':
                player.cards.length === 7 ? full = true : full = false;
                break;
            case 'computer':
                player.cards.length === 7 ? full = true : full = false;
                break;
            case 'deck':
                player.cards.length === 21 ? full = true : full = false;
                break;
            case 'board':
                player.cards.length === 9 ? full = true : full = false;
                break;
        };
        return full;
    };

    // add(card) {
    //     this.cards.push(card);
    //     return card;
    // }

    // renderPlayer(){
    //     let playerDiv = document.getElementById(`${this.role}-container`)
    //     playerDiv.classList.add(`player-${this.id}`);
    // };

    // static createPlayers(players) {
    //     return players.data.map(player => new Player(player.id, player.attributes.role));
    // };
};
