class Card {
    constructor(id, category, image, month, player) {
        this.id = id;
        this.category = category;
        this.image = image;
        this.month = month;
        this.matched = false; 
        player.cards.push(this);
        // this.matched === true ? this.renderCardMatchedSets() : this.renderCard();
    };

    static displayAllCards() {
        game.players.forEach(player => {
            player.cards.forEach(card => {
                card.renderCardBelongingTo(player);
            })
        });
    }

    renderCardBelongingTo(player) {
        const cardContainer = document.getElementById(`${player.role}-container`);
        const cardImg = document.createElement('img')

        switch (player.role) {
            case 'deck':
                if (cardContainer.childElementCount === 0) {
                    cardImg.id = `card-deck`;
                    cardImg.setAttribute('src', "https://i.ibb.co/QJ2J9d2/cardback.png");
                } else {
                    return;
                }
                break; 
            case 'computer':
                cardImg.dataset.month = this.month;
                cardImg.dataset.category = this.category;
                cardImg.dataset.url = this.image;
                cardImg.id = `card-${this.id}`
                cardImg.setAttribute('src', 'https://i.ibb.co/QJ2J9d2/cardback.png')
                break;
            default:
                cardImg.dataset.month = this.month;
                cardImg.dataset.category = this.category;
                cardImg.id = `card-${this.id}`
                cardImg.setAttribute('src', this.image);
                break;
        }
        cardContainer.appendChild(cardImg);
    }

    renderCardToCollectedSets(player) {
        const cardContainer = document.getElementById(`${player.role}-pairs`);

        if (cardContainer.getElementsByClassName(`${this.month}-matched`).length > 0) {
            let newCard = document.createElement('img')
            newCard.dataset.month = this.month;
            newCard.dataset.category = this.category;
            newCard.id = `card-${this.id}`
            newCard.setAttribute('src', this.image);
            
            cardContainer.getElementsByClassName(`${this.month}-matched`)[0].appendChild(newCard);
        } else {
            let newSet = document.createElement('div')
            newSet.classList.add(`${this.month}-matched`)
            newSet.classList.add('matched');

            let monthTitle = document.createElement('p');
            monthTitle.innerText = `${this.month}`;
            monthTitle.classList.add('month-title');
            newSet.prepend(monthTitle);

            cardContainer.appendChild(newSet);

            let newCard = document.createElement('img')
            newCard.dataset.month = this.month;
            newCard.dataset.category = this.category;
            newCard.id = `card-${this.id}`
            newCard.setAttribute('src', this.image);

            newSet.appendChild(newCard);
        }
    }

    static renderCardHtml(card) {
        let newCard = document.createElement('img');
        newCard.dataset.month = card.dataset.month;
        newCard.dataset.category = card.dataset.category;
        newCard.id = card.id;
        newCard.classList.add('played-card')
        newCard.setAttribute('src', card.src);
        return newCard;
    }

    static retrieveCardDataFrom(cardHtml) {
        let data;
        let cardId = cardHtml.id.split('-')[1];
        game.players.forEach(function(player) {
            if (player.cards.find(card => card.id == cardId)) {
                data = player.cards.find(card => card.id == cardId);
            }
        })
        return data;
    }

    static async fetchRandomCardFromDeck() {
        return sample(game.deck.cards);
    }

    static async loadCardsToSummary() {
        let cards = await API.retrieveAllCards();

        asyncForEach(cards.data, async function(card) {
            const cardMonth = downcaseFirstLetter(card.attributes.month);
            const parentMonthDiv = document.getElementById(cardMonth);
            const cardMonthImg = Card.createCardSummaryHtml(card)
            parentMonthDiv.appendChild(cardMonthImg)
    
            const cardCategory = card.attributes.category;
            const parentCategoryDiv =  document.getElementsByClassName(cardCategory)[0];
            const cardCategoryImg = Card.createCardSummaryHtml(card)
            parentCategoryDiv.appendChild(cardCategoryImg)
            return card;
        });
        return cards;
    }

    static createCardSummaryHtml(card) {
        let cardHtml = document.createElement('img');
        cardHtml.setAttribute('src', card.attributes.image);
        cardHtml.style.maxWidth = "45px";
        return cardHtml;
    }
}