const Product = require('../models/Product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
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
    .catch(console.log);
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect('/');
  const productId = req.params.productId;
  Product.findById(productId) // Given by Mongoose
    .then((product) => {
      if (!product) return res.redirect('/404');
      res.render('admin/edit-product', {
        product,
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
      });
    })
    .catch(console.log);
};

exports.postEditProduct = (req, res, next) => {
  const {
    productId,
    title: updatedTitle,
    imageUrl: updatedImageUrl,
    price: updatedPrice,
    description: updatedDesc,
  } = req.body;

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString())
        return res.redirect('/');

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;

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
      console.log('ERROR DELETING PRODUCT: ', err);
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
    .catch(console.log);
};
