class API {

    static async createNewGame(oldName) {
        let gameName;
        game ? gameName = game.name : gameName = "anonymous";

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
            game = new Game(resp.data.attributes.name, resp.data.id)
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
        const resp = await fetch("https://learn-hwatu-backend.herokuapp.com/cards");
        return await resp.json();
    }

    static async updateGamePointTotal() {
        return fetch(`https://learn-hwatu-backend.herokuapp.com/games/${game.id}`, {
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

    static async retrieveTopTenGames() {
        return fetch("https://learn-hwatu-backend.herokuapp.com/games/history")
        .then(resp => resp.json())
    }
}