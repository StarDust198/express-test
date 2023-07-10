const path = require('path');

const express = require('express');

const rootDir = require('../helpers/path');
const { products } = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('shop', {
    products,
    docTitle: 'Shop',
    path: '/',
    hasProducts: products.length > 0,
    productCSS: true,
    activeShop: true,
  });
});

module.exports = router;
