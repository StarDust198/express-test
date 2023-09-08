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
  const product = new Product(title, price, description, imageUrl);
  product
    .save()
    .then((result) => {
      console.log('ADDED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(console.log);
};

// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;
//   if (!editMode) return res.redirect('/');
//   const productId = req.params.productId;
//   req.user
//     .getProducts({ where: { id: productId } })
//     .then((products) => {
//       const product = products[0];
//       if (!product) return res.redirect('/404');
//       res.render('admin/edit-product', {
//         product,
//         pageTitle: 'Edit Product',
//         path: '/admin/edit-product',
//         editing: editMode,
//       });
//     })
//     .catch(console.log);
// };

// exports.postEditProduct = (req, res, next) => {
//   const {
//     productId,
//     title: updatedTitle,
//     imageUrl: updatedImageUrl,
//     price: updatedPrice,
//     description: updatedDescr,
//   } = req.body;
//   Product.findByPk(productId)
//     .then((product) => {
//       product.title = updatedTitle;
//       product.imageUrl = updatedImageUrl;
//       product.price = updatedPrice;
//       product.description = updatedDescr;
//       return product.save();
//     })
//     .then((result) => {
//       console.log('UPDATED PRODUCT!');
//       res.redirect('/admin/products');
//     })
//     .catch(console.log);
// };

// exports.postDeleteProduct = (req, res, next) => {
//   const productId = req.body.productId;
//   2;
//   Product.findByPk(productId)
//     .then((product) => {
//       return product.destroy();
//     })
//     .then((result) => {
//       console.log('DELETED PRODUCT!');
//       res.redirect('/admin/products');
//     })
//     .catch(console.log);
// };

// exports.getProducts = (req, res, next) => {
//   req.user
//     .getProducts()
//     .then((products) => {
//       res.render('admin/products', {
//         prods: products,
//         pageTitle: 'Admin Products',
//         path: '/admin/products',
//       });
//     })
//     .catch(console.log);
// };
