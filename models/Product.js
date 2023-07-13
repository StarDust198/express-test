const fs = require('fs');
const path = require('path');

const rootPath = require('../helpers/path');

const file = path.join(rootPath, 'data', 'products.json');

const readFromFile = (cb) =>
  fs.readFile(file, (err, fileContent) => {
    cb(err ? [] : JSON.parse(fileContent));
  });

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    readFromFile((products) => {
      products.push(this);
      fs.writeFile(file, JSON.stringify(products), console.error);
    });
  }

  static async fetchAll(cb) {
    readFromFile(cb);
  }
};
