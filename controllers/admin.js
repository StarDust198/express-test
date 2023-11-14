const fileHelper = require('../helpers/file');

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
  const { title, price, description } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      editing: false,
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      errorMessage: 'Attached file is not an image',
      oldInput: { title, price, description },
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      editing: false,
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      errorMessage: errors.array()[0].msg,
      oldInput: { title, price, description },
    });
  }

  const imageUrl = image.path;

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
  const { productId, title, price, description } = req.body;
  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      productId,
      editing: true,
      path: '/admin/edit-product',
      pageTitle: 'Edit Product',
      errorMessage: errors.array()[0].msg,
      oldInput: { title, price, description },
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString())
        return res.redirect('/');

      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      return product.save().then((result) => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  // const productId = req.body.productId;
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) return next(new Error('Product not found'));
      fileHelper.deleteFile(product.imageUrl);

      return Product.deleteOne({ _id: productId, userId: req.user._id });
    })
    .then(() => {
      console.log('DELETED PRODUCT!');

      // No redirection anymore!
      // res.redirect('/admin/products');
      res.status(200).json({ message: 'Success!' });
    })
    .catch((err) => {
      // Error handling changes too!
      res.status(500).json({ message: 'Deleting product failed!' });
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
