class API {

    static async createNewGame(oldName) {
        let gameName = oldName ||= ""
        let url = gameURL;

        let data = {
            points: 0,
            name: gameName
        }

        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        };

        return fetch(url, options)
        .then(resp => resp.json())
        .then((resp) => {
            new Game("", resp.data.id)
        })
    }

    static async createPlayers() {
        let url = playerURL;

        const roles = ['user', 'computer', 'deck', 'board']
        await asyncForEach(roles, async (player) => {
            let data = {
                role: player,
                game_id: game.id
            }

            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            };

            return fetch(url, options)
            .then(resp => resp.json())
            .then((resp) => {
                return new Player(resp.data.id, resp.data.attributes.role)
            })
        })  
    }

    static async assignCards() {
        let cards = await this.retrieveAllCards();
        let playerPool = [game.user, game.board, game.computer, game.deck];

        await asyncForEach(cards.data, async (card) => {
            let assignedPlayer = sample(playerPool);

            // Prevents 4 of same card month from being dealt to user/board/computer
            if (assignedPlayer.cards.filter(c => c.month === card.attributes.month).length === 3 && assignedPlayer !== game.deck) {
                assignedPlayer = sample(playerPool.filter(p => p !== assignedPlayer));
            };
            
            // Check if assigned player hand is full
            if (Player.checkPlayerForFullHand(assignedPlayer)) {
                playerPool.splice(playerPool.indexOf(assignedPlayer), 1);
            };
            return new Card(card.id, card.attributes.category, card.attributes.image, card.attributes.month, assignedPlayer);
        })
        return cards;
    }

    static async retrieveAllCards() {
        const resp = await fetch("http://localhost:3000/cards");
        return await resp.json();
    }

    static async updateGamePointTotal() {
        return fetch(`http://localhost:3000/games/${game.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                points: game.points,
            })
        })
        .then(resp => resp.json())
    }

    // return fetch(`http://localhost:3000/games/${game.id}`, {
    //             method: "PATCH",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Accept": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 points: game.points,
    //             })
    //         })
    //         .then(resp => resp.json())

    // static async loadPlayers() {
    //     let playersData = await fetch("http://localhost:3000/players").then(resp => resp.json());
    //     return Player.createPlayers(playersData);
    // };

    // static async retrieveAllCards() {
    //     const resp = await fetch("http://localhost:3000/cards");
    //     return await resp.json();
    // }

    // // Not using?
    // static async retrieveCardsByPlayer(id) {
    //     const player = await fetch(`http://localhost:3000/players/${id}`).then(resp => resp.json());
    //     return player.data.attributes.cards;
    // }

    // static async createCardSummary() {
    //     return fetch("http://localhost:3000/cards")
    //         .then(resp => resp.json())
    //         .then(cards => cards.data.forEach(card => API.loadCardsToSummary(card)))
    // };

    // static async loadUserName() {
    //     return fetch("http://localhost:3000/games")
    //         .then(resp => resp.json())
    //         .then(cards => {
    //            cards.data.forEach(card => {
    //             API.loadCardsToSummary(card);
    //            })
    //         }) 
    // }

    // static async updateCardPlayerToBoard(cardId) {
    //     return fetch(`http://localhost:3000/cards/${cardId}`, {
    //         method: "PATCH",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Accept": "application/json"
    //         },
    //         body: JSON.stringify({
    //             player_id: game.board.id
    //         })
    //     })
    //     .then(resp => resp.json())
    // }

    // // Move to backend
    // static async updateCardPlayer(card, player) {
    //     return fetch(`http://localhost:3000/cards/${card.id}`, {
    //             method: "PATCH",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Accept": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 player_id: player.id,
    //                 matched: false
    //             })
    //         })
    //         .then(resp => resp.json())
    // };

    // static async fetchRandomCardFromDeck() {
    //     return fetch(`http://localhost:3000/players/${game.deck.id}/cards`)
    //     .then(resp => resp.json())
    // }

    // static async fetchTopTenGames() {
    //     return fetch("http://localhost:3000/games/history")
    //     .then(resp => resp.json())
    //     .then(cards => cards.data.forEach(card => API.loadCardsToSummary(card)))
    // }

    // static async createNewGame() {
    //     let url = gameURL;

    //     let name = {
    //         name: `${game.name}`
    //     }

    //     let options = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             "Accept": "application/json"
    //         },
    //         body: JSON.stringify(name)
    //     };

    //     return fetch(url, options)
    //     .then(resp => resp.json())
    // }

    // static async updateGamePointTotal() {
    //     return fetch(`http://localhost:3000/games/${game.id}`, {
    //             method: "PATCH",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Accept": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 points: game.points,
    //             })
    //         })
    //         .then(resp => resp.json())
    // }

    // static async loadTopTenGames() {
    //     return fetch("http://localhost:3000/games/history")
    //     .then(resp => resp.json())
    // }
}