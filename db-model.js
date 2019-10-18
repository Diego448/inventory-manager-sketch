class Item {
    constructor(title, description, quantity, existence, imageFile) {
        this.title = title;
        this.description = description;
        this.quantity = quantity;
        this.existence = existence;
        this.imageFile = imageFile;
    }
}

module.exports = Item;