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
    userId: req.user, // Mongoose will pick the id in user
  });
  product
    .save() // Default Mongoose method!
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
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then((result) => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log('ERROR UPDATING PRODUCT: ', err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByIdAndRemove(productId)
    // Mongoose method
    .then(() => {
      console.log('DELETED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log('ERROR DELETING PRODUCT: ', err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    //  only gets selected fields from found documents, "-" sign gets thing excluded,
    //  _id is always selected by default
    // .populate('userId', 'name')
    //  populates field with relation with the related object instead of just an id,
    //  second argument works like the previous "select"
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthentificated: false,
      });
    })
    .catch(console.log);
};
