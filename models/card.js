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
}