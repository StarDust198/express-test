const { validationResult } = require('express-validator');

const Product = require('../models/Product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    editing: false,
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    errorMessage: '',
    oldInput: { title: '', imageUrl: '', price: '', description: '' },
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      editing: false,
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      errorMessage: errors.array()[0].msg,
      oldInput: { title, imageUrl, price, description },
    });
  }

  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId: req.user,
  });

  product
    .save()
    .then((result) => {
      console.log('ADDED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      // console.log('ERROR ADDING PRODUCT: ', err);
      // res.redirect('/500');

      // Alternative to reach special Express middleware:
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect('/');
  const productId = req.params.productId;
  Product.findById(productId) // Given by Mongoose
    .then((product) => {
      if (!product) return res.redirect('/404');
      res.render('admin/edit-product', {
        productId,
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        errorMessage: '',
        editing: editMode,
        oldInput: {
          title: product.title,
          imageUrl: product.imageUrl,
          price: product.price,
          description: product.description,
        },
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;
  const editMode = req.query.edit;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      productId,
      editing: editMode,
      path: '/admin/edit-product',
      pageTitle: 'Edit Product',
      errorMessage: errors.array()[0].msg,
      oldInput: { title, imageUrl, price, description },
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString())
        return res.redirect('/');

      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;

      return product.save().then((result) => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      console.log('ERROR UPDATING PRODUCT: ', err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => {
      console.log('DELETED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
