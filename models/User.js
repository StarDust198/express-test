const mongodb = require('mongodb');
const { getDb } = require('../helpers/database');

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();

    return db
      .collection('users')
      .insertOne(this)
      .then(console.log)
      .catch(console.log);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      updatedCartItems[cartProductIndex].quantity =
        this.cart.items[cartProductIndex].quantity + 1;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1,
      });
    }

    const updatedCart = { items: updatedCartItems };
    const db = getDb();

    return db.collection('users').updateOne(
      { _id: new mongodb.ObjectId(this._id) },
      {
        $set: {
          cart: updatedCart,
        },
      }
    );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => i.productId);

    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) =>
        products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find(
              (item) => item.productId.toString() === p._id.toString()
            ).quantity,
          };
        })
      );
  }

  static findById(userId) {
    const db = getDb();

    return db
      .collection('users')
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch(console.log);
  }
}

module.exports = User;
