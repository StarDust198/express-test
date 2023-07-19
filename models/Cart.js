const fs = require('fs');
const path = require('path');

const { rootPath } = require('../helpers/path');

const cartFile = path.join(rootPath, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(cartFile, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) cart = JSON.parse(fileContent);

      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty += 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += +productPrice;

      fs.writeFile(cartFile, JSON.stringify(cart), console.error);
    });
  }

  static deleteProduct(productId, productPrice) {
    fs.readFile(cartFile, (err, fileContent) => {
      if (err) return;
      let cart = JSON.parse(fileContent);

      let productQty = 0;
      const updatedCart = {
        products: cart.products.filter((prod) => {
          if (prod.id === productId) productQty = prod.qty;
          return prod.id !== productId;
        }),
        totalPrice: cart.totalPrice - productPrice * productQty,
      };

      fs.writeFile(cartFile, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(cartFile, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      cb(cart);
    });
  }
};
