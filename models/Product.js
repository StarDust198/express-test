const fs = require('fs');
const path = require('path');

const rootPath = require('../helpers/path');

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    const p = path.join(rootPath, 'data', 'products.json');

    fs.readFile(p, (err, fileContent) => {
      let products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), console.error);
    });
  }

  static async fetchAll(cb) {
    const p = path.join(rootPath, 'data', 'products.json');
    fs.readFile(p, (err, fileContent) => {
      cb(err ? [] : JSON.parse(fileContent));
    });
  }
};
