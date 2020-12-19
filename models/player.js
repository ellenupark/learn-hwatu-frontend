class Player {
    constructor(id, role) {
        this.id = id;
        this.role = role;
        this.cards = [];
        game.players.push(this);
        // this.renderPlayer();
    };

    add(card) {
        this.cards.push(card);
        return card;
    }

    remove(card) {
        this.cards = this.cards.filter(c => c !== card);
        return this.cards;
    }

    static moveCardToNewPlayer(card, oldPlayer, newPlayer) {
        oldPlayer.remove(card);
        newPlayer.add(card);
    }

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

    static retrievePlayerData(cardHtml) {
        let cardOwner;
        let cardId = cardHtml.id.split('-')[1];
        game.players.forEach(function(player) {
            if (player.cards.find(card => card.id == cardId)) {
                cardOwner = player;
            }
        })
        return cardOwner;
    }

    static retrieveAllMatchedCardsFor(player) {
        return player.cards.filter(card => card.matched === true);
    }

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
