const Product = require('../models/Product');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      console.log('FETCHED PRODUCTS: ', products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch((err) => {
      console.log('ERROR FETCHING PRODUCTS: ', err);
    });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  console.log('productId: ', productId);
  Product.findById(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        product,
        pageTitle: `${product.title} details`,
        path: `/products/${product._id}`,
      });
    })
    .catch((err) => {
      console.log('ERROR GETTING PRODUCT: ', err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(console.log);
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items,
      });
    })
    .catch(console.log);
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => req.user.addToCart(product))
    .then((result) => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDelete = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      console.log('DELETED FROM CART');
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log('ERROR DELETING PRODUCT FROM CART: ', err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => {
      res.redirect('/orders');
    })
    .catch(console.log);
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch(console.log);
};

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout',
//   });
// };
