const Product = require('../models/Product');

exports.getAddProduct = (req, res, next) => {
  res.render('add-product', {
    docTitle: 'Add product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
  });
};

exports.postAddProduct = (req, res, next) => {
  const newProduct = new Product(req.body.title);
  newProduct.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  const products = Product.fetchAll();

  res.render('shop', {
    products,
    docTitle: 'Shop',
    path: '/',
    hasProducts: products.length > 0,
    productCSS: true,
    activeShop: true,
  });
};
